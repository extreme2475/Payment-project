import mongoose from "mongoose";
import Transaction from "../models/transaction.js";

export const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id; // string is fine

    // last 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const txRaw = await Transaction.find({
      $or: [
        { sender: userId },   // sent by user
        { receiver: userId }  // received by user
      ],
      status: "Success",
      createdAt: { $gte: threeMonthsAgo },
    })
      .populate("sender", "username phone")
      .populate("receiver", "username phone")
      .sort({ createdAt: -1 });

    const transactions = txRaw.map((tx) => {
      const isSent =
        tx.sender && tx.sender._id.toString() === userId;

      return {
        _id: tx._id,
        createdAt: tx.createdAt,
        amount: isSent ? -tx.amount : tx.amount,

        sender: {
          username: tx.sender ? tx.sender.username : "System",
          phone: tx.sender ? tx.sender.phone : null,
        },

        receiver: {
          username: tx.receiver?.username || "Unknown",
          phone: tx.receiver?.phone || null,
        },

        note:
          tx.note ||
          (isSent
            ? `Sent to ${tx.receiver?.username}`
            : `Received from ${
                tx.sender ? tx.sender.username : "System"
              }`),
      };
    });

    res.json({ transactions });
  } catch (err) {
    console.error("Transactions error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
