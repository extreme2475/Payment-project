// register.js
import User from "../models/user.js";
import DemoTransaction from "../models/transaction.js";
import  Ledger  from "../models/ledger.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// In-memory OTP storage
export const otpStore = new Map();
export const verifiedPhones = new Set();

// Generate 6-digit OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ------------------- REGISTER USER -------------------
export const registerUser = async (req, res) => {
  try {
    let { username, email, phone, password, walletPin } = req.body;

    // ----------------- Basic validation -----------------
    if (!username || !email || !phone || !password || !walletPin) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ----------------- Normalize phone -----------------
    const normalizedPhone = phone.replace(/\D/g, "");

    // ----------------- Phone verification -----------------
    if (!verifiedPhones.has(normalizedPhone)) {
      return res.status(400).json({ message: "Phone number not verified" });
    }

    // ----------------- Check duplicates -----------------
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

    // ----------------- Hash password + PIN -----------------
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const hashedPin = await bcrypt.hash(walletPin, salt);

    // ----------------- Initial credit -----------------
    const demoInitialAmount = 30000;

    // ----------------- Create user -----------------
    const newUser = new User({
      username,
      email,
      phone: normalizedPhone,
      password: hashedPassword,
      walletPin: hashedPin,
      walletBalance: demoInitialAmount,        // wallet
      demoWalletBalance: demoInitialAmount,    // demo wallet
      isPhoneVerified: true,
    });

    await newUser.save();

    // ----------------- Demo Transaction -----------------
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

    // ----------------- Ledger entry -----------------
    await Ledger.create({
      txId: `DEMO_INIT_${newUser._id}`,
      type: "MINT",
      from: "SYSTEM",
      to: normalizedPhone,
      amount: demoInitialAmount,
      note: "Initial demo wallet credit",
    });

    // ----------------- JWT -----------------
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Cleanup
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
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone number required" });

    const normalizedPhone = phone.replace(/\D/g, "");
    const otp = generateOTP();
    const expiresAt = Date.now() + 3 * 60 * 1000;

    otpStore.set(normalizedPhone, { otp, expiresAt });

    console.log(`✅ OTP for ${normalizedPhone}: ${otp}`); // for testing

    res.status(200).json({ message: "OTP sent successfully" });
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
// Ensure 'User' is imported at the top of enter.js
// import User from "../models/user.js"; 

export const getAllUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user.id; // Taken from the verifyToken middleware
    
    // Find all users EXCEPT the current one
    const users = await User.find({ _id: { $ne: loggedInUserId } })
      .select("username phone email"); // Only send necessary info
    
    res.status(200).json({ 
      success: true, 
      users 
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};
// ------------------- LOGOUT USER -------------------
export const logoutUser = async (req, res) => {
  try {
    // JWT stateless hota hai, isliye server-side par session delete nahi hota.
    // Sabse behtar tarika hai client ko bolna ki wo token delete kar de.
    
    res.status(200).json({ 
      success: true, 
      message: "Logged out successfully. Please delete the token from client storage." 
    });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Server error during logout" });
  }
};
