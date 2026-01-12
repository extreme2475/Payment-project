// payment.js - Controller (Updated for real wallet)
import mongoose from "mongoose";
import User from "../models/user.js";
import  Ledger  from "../models/ledger.js";
import Transaction from "../models/transaction.js";
import bcrypt from "bcryptjs";

// Configurable constants
const MIN_TRANSFER = 10;
const MAX_TRANSFER = 5000; // max per transaction
const DAILY_LIMIT = 20000; // max cumulative per day
const MAX_PIN_ATTEMPTS = 3;

// ----------------- Send money from one user to another (real wallet) -----------------
export const sendMoney = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { senderId, receiverPhone, amount, walletPin, note } = req.body;
    const transferAmount = Number(amount);

    // ----------------- Validate input -----------------
    if (!senderId || !receiverPhone || !transferAmount || !walletPin) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    if (transferAmount < MIN_TRANSFER || transferAmount > MAX_TRANSFER) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Transfer amount must be between ${MIN_TRANSFER} and ${MAX_TRANSFER} units`,
      });
    }

    // ----------------- Find users -----------------
    const sender = await User.findById(senderId).session(session);
    if (!sender) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Sender not found" });
    }

    const receiver = await User.findOne({ phone: receiverPhone }).session(session);
    if (!receiver) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Receiver not found" });
    }

    // ----------------- FIXED: check self transfer -----------------
    if (String(sender._id) === String(receiver._id)) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Cannot transfer to self" });
    }

    // ----------------- PIN validation -----------------
    const pinValid = await bcrypt.compare(walletPin, sender.walletPin);
    if (!pinValid) {
      sender.pinAttempts = (sender.pinAttempts || 0) + 1;
      if (sender.pinAttempts >= MAX_PIN_ATTEMPTS) {
        sender.pinBlocked = true;
      }
      await sender.save({ session });
      await session.abortTransaction();
      return res.status(401).json({ success: false, message: "Invalid wallet PIN" });
    }
    // Reset attempts on success
    sender.pinAttempts = 0;
    sender.pinBlocked = false;

    // ----------------- Daily limit check -----------------
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailySent = await Transaction.aggregate([
      { $match: { sender: sender._id, createdAt: { $gte: today }, status: "Success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalSentToday = dailySent[0]?.total || 0;
    if (totalSentToday + transferAmount > DAILY_LIMIT) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Daily transfer limit exceeded" });
    }

    // ----------------- Deduct & Credit -----------------
    const senderBefore = sender.walletBalance;
    const receiverBefore = receiver.walletBalance || 0;

    if (senderBefore < transferAmount) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    sender.walletBalance -= transferAmount;
    receiver.walletBalance = receiverBefore + transferAmount;

    await sender.save({ session });
    await receiver.save({ session });

    // ----------------- Log transaction -----------------
    const tx = await Transaction.create([{
      sender: sender._id,
      receiver: receiver._id,
      receiverPhone,
      amount: transferAmount,
      balanceBeforeSender: senderBefore,
      balanceAfterSender: sender.walletBalance,
      balanceBeforeReceiver: receiverBefore,
      balanceAfterReceiver: receiver.walletBalance,
      note: note || "",
      status: "Success",
      method: "Wallet",
    }], { session });

    // ----------------- Ledger entry -----------------
    await Ledger.create([{
      txId: `TX-${Date.now()}`,
      type: "TRANSFER",
      from: sender.phone,
      to: receiverPhone,
      amount: transferAmount,
      note: note || "Wallet transfer",
    }], { session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: `Sent ${transferAmount} units to ${receiverPhone}`,
      senderBalance: sender.walletBalance,
      receiverBalance: receiver.walletBalance,
    });

  } catch (err) {
    console.error("Error in sendMoney:", err);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------- Get user ledger -----------------
export const getLedger = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, fromDate, toDate } = req.query;

    const query = { $or: [{ from: userId }, { to: userId }] };

    if (type) query.type = type;
    if (fromDate || toDate) query.createdAt = {};
    if (fromDate) query.createdAt.$gte = new Date(fromDate);
    if (toDate) query.createdAt.$lte = new Date(toDate);

    const data = await Ledger.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      ledger: data,
    });

  } catch (err) {
    console.error("Error in getLedger:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
