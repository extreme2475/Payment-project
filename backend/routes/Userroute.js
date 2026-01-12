import express from "express";
import { registerUser, logoutUser,loginUser, sendOtp, verifyOtp,getAllUsers } from "../controller/enter.js";
import User from "../models/user.js";
import { verifyToken } from "../Middleware/authMiddleware.js";

const router = express.Router();

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyToken, logoutUser);

// OTP routes
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// ----------------- Get logged-in user info -----------------
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "username email phone walletBalance demoWalletBalance"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/all", verifyToken, getAllUsers);

export default router;
