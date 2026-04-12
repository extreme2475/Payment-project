import User from "../models/user.js";
import DemoTransaction from "../models/transaction.js";
import Ledger from "../models/ledger.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer"; // Added

// In-memory OTP storage
export const otpStore = new Map();
export const verifiedPhones = new Set();

// Generate 6-digit OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// --- Nodemailer Setup ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587, // Changed from 465 to 587
  secure: false, // Must be false for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // This prevents the timeout on cloud servers
  }
});

// ------------------- REGISTER USER -------------------
export const registerUser = async (req, res) => {
  try {
    let { username, email, phone, password, walletPin } = req.body;

    if (!username || !email || !phone || !password || !walletPin) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedPhone = phone.replace(/\D/g, "");

    if (!verifiedPhones.has(normalizedPhone)) {
      return res.status(400).json({ message: "Phone number not verified" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { phone: normalizedPhone }, { username }],
    });

    if (existingUser) {
      const field =
        existingUser.email === email
          ? "Email"
          : existingUser.phone === normalizedPhone
          ? "Phone"
          : "Username";
      return res.status(400).json({ message: `${field} already in use` });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const hashedPin = await bcrypt.hash(walletPin, salt);

    const demoInitialAmount = 30000;

    const newUser = new User({
      username,
      email,
      phone: normalizedPhone,
      password: hashedPassword,
      walletPin: hashedPin,
      walletBalance: demoInitialAmount,
      demoWalletBalance: demoInitialAmount,
      isPhoneVerified: true,
    });

    await newUser.save();

    await DemoTransaction.create({
      sender: null,
      userId: newUser._id,
      amount: demoInitialAmount,
      type: "CREDIT",
      source: "DEMO_INITIAL",
      balanceBeforeReceiver: 0,
      balanceAfterReceiver: demoInitialAmount,
      receiver: newUser._id,
      receiverPhone: normalizedPhone,
      status: "Success",
      method: "Wallet",
    });

    await Ledger.create({
      txId: `DEMO_INIT_${newUser._id}`,
      type: "MINT",
      from: "SYSTEM",
      to: normalizedPhone,
      amount: demoInitialAmount,
      note: "Initial demo wallet credit",
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    verifiedPhones.delete(normalizedPhone);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        demoWalletBalance: newUser.demoWalletBalance,
        walletBalance: newUser.walletBalance,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }
    res.status(500).json({ message: "Server error during registration" });
  }
};

// ------------------- LOGIN USER -------------------
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(200).json({
      message: "Login successful",
      token,
      user: { _id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------- SEND OTP -------------------
export const sendOtp = async (req, res) => {
  try {
    const { phone, email } = req.body; // Now expecting email too
    if (!phone || !email) return res.status(400).json({ message: "Phone and Email are required" });

    const normalizedPhone = phone.replace(/\D/g, "");
    const otp = generateOTP();
    const expiresAt = Date.now() + 3 * 60 * 1000;

    otpStore.set(normalizedPhone, { otp, expiresAt });

    // Send OTP via Email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Verification Code",
      text: `Your OTP for phone verification is: ${otp}. It will expire in 3 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    console.log(`✅ OTP for ${normalizedPhone} sent to ${email}: ${otp}`);

    res.status(200).json({ message: "OTP sent to your email successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// ------------------- VERIFY OTP -------------------
export const verifyOtp = async (req, res) => {
  try {
    let { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ message: "Phone & OTP required" });

    const normalizedPhone = phone.replace(/\D/g, "");
    const record = otpStore.get(normalizedPhone);

    if (!record) return res.status(400).json({ message: "OTP not found or expired" });
    if (Date.now() > record.expiresAt) {
      otpStore.delete(normalizedPhone);
      return res.status(400).json({ message: "OTP expired" });
    }
    if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    otpStore.delete(normalizedPhone);
    verifiedPhones.add(normalizedPhone);

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Server error during OTP verification" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;
    const users = await User.find({ _id: { $ne: loggedInUserId } }).select("username phone email");
    res.status(200).json({ success: true, users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

// ------------------- LOGOUT USER -------------------
export const logoutUser = async (req, res) => {
  try {
    res.status(200).json({ 
      success: true, 
      message: "Logged out successfully. Please delete the token from client storage." 
    });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Server error during logout" });
  }
};