import mongoose from "mongoose";
import Transaction from "../models/transaction.js";

export const getMoneyAnalytics = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // 1️⃣ Spending per day (BAR / WAVE)
    const spending = await Transaction.aggregate([
      { $match: { sender: userId, status: "Success" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", amount: 1 } },
    ]);

    // 2️⃣ Cash flow (SENT vs RECEIVED)
    const cashFlow = await Transaction.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
          status: "Success",
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            type: {
              $cond: [{ $eq: ["$sender", userId] }, "sent", "received"],
            },
          },
          amount: { $sum: "$amount" },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          sent: { $sum: { $cond: [{ $eq: ["$_id.type", "sent"] }, "$amount", 0] } },
          received: { $sum: { $cond: [{ $eq: ["$_id.type", "received"] }, "$amount", 0] } },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", sent: 1, received: 1 } },
    ]);

    // 3️⃣ Success vs Failed
    const successFailure = await Transaction.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      { $project: { _id: 0, status: "$_id", count: 1 } },
    ]);

    // 4️⃣ User interaction (pie)
    const userInteraction = await Transaction.aggregate([
      { $match: { sender: userId, status: "Success" } },
      {
        $group: {
          _id: "$receiver",
          total: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, userId: "$_id", total: 1 } },
    ]);

    res.json({
      spending,
      cashFlow,
      successFailure,
      userInteraction,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ message: "Analytics failed" });
  }
};
