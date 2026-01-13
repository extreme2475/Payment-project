import mongoose from "mongoose";
import Transaction from "../models/transaction.js";
import User from "../models/user.js";

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ---------------- SENT PAYMENTS ----------------
    const sentTx = await Transaction.find({
      sender: userId,
      status: "Success",
    }).sort({ createdAt: -1 });

    const totalPayments = sentTx.length;

    // ---------------- RECENT (SENT + RECEIVED) ----------------
    const recentTxRaw = await Transaction.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: "Success",
    })
      .sort({ createdAt: -1 })
      .limit(2);

    const recentTransactions = recentTxRaw.map((tx) => {
      const isSent = tx.sender && tx.sender .toString() === userId.toString();

      return {
        _id: tx._id,
        amount: isSent ? -tx.amount : tx.amount,
        note: tx.note || (isSent ? "Money Sent" : "Money Received"),
        createdAt: tx.createdAt,
      };
    });

    const recentPayment = recentTransactions[0] || null;

    // ---------------- SUCCESS RATE ----------------
    const successRate = totalPayments === 0 ? 0 : 100;

    res.json({
      walletBalance: user.walletBalance,
      totalPayments,
      successRate,
      recentPayment,
      recentTransactions,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
