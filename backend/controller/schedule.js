import mongoose from "mongoose";
import User from "../models/user.js";
import Transaction from "../models/transaction.js";
import bcrypt from "bcryptjs";

export const schedulePayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { senderId, walletPin, payments } = req.body;

    // 🔐 Basic validation
    if (!senderId || !walletPin || !Array.isArray(payments) || payments.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Invalid request data" });
    }

    const sender = await User.findById(senderId).session(session);
    if (!sender) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Sender not found" });
    }

    // 🔐 Verify PIN ONCE
    const pinValid = await bcrypt.compare(walletPin, sender.walletPin);
    if (!pinValid) {
      await session.abortTransaction();
      return res.status(401).json({ success: false, message: "Invalid wallet PIN" });
    }

    // 🧠 Create scheduled transactions
    for (const pay of payments) {
      const { receiverPhone, amount, scheduledAt } = pay;

      if (!receiverPhone || !amount || !scheduledAt) {
        await session.abortTransaction();
        return res.status(400).json({ success: false, message: "Missing payment fields" });
      }

      const runAt = new Date(scheduledAt);
      if (isNaN(runAt.getTime())) {
        await session.abortTransaction();
        return res.status(400).json({ success: false, message: "Invalid schedule date" });
      }

      const receiver = await User.findOne({ phone: receiverPhone }).session(session);
      if (!receiver) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: `Receiver not found: ${receiverPhone}`,
        });
      }

      await Transaction.create(
        [
          {
            sender: sender._id,
            receiver: receiver._id,
            receiverPhone,
            amount: Number(amount),
            balanceBeforeSender: sender.walletBalance,
            balanceAfterSender: sender.walletBalance,
            balanceBeforeReceiver: receiver.walletBalance || 0,
            balanceAfterReceiver: receiver.walletBalance || 0,
            status: "Pending",
            method: "Wallet",
            note: "Scheduled Payment",
            scheduledAt: runAt, // 👈 important
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Payments scheduled successfully",
    });

  } catch (err) {
    console.error("🔥 Schedule payment error:", err);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ success: false, message: err.message });
  }
};
export const getActiveScheduledPayments = async (req, res) => {
  try {
    // req.user.id comes from verifyToken middleware
    const userId = req.user.id; 
    const now = new Date();

    // We use countDocuments for efficiency
    const activeCount = await Transaction.countDocuments({
      // We convert the string ID to a MongoDB ObjectId to ensure a match
      sender: new mongoose.Types.ObjectId(userId), 
      status: "Pending",
      scheduledAt: { $gt: now }
    });

    res.json({
      success: true,
      count: activeCount
    });
  } catch (err) {
    console.error("Schedule fetch error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getScheduledHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const history = await Transaction.find({
      sender: new mongoose.Types.ObjectId(userId),
      note: "Scheduled Payment" 
    })
    .populate("receiver", "username") // This looks into the User model for the name
    .sort({ createdAt: -1 }); // Show newest at the top

    res.status(200).json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Function to delete/cancel a pending payment
export const cancelScheduledPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Only allow canceling if it's still "Pending"
    const tx = await Transaction.findOneAndDelete({
      _id: id,
      sender: userId,
      status: "Pending"
    });

    if (!tx) {
      return res.status(404).json({ success: false, message: "Payment not found or already processed" });
    }

    res.json({ success: true, message: "Scheduled payment canceled successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};