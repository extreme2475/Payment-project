import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    senderType: { type: String, enum: ["USER", "SYSTEM"], default: "USER" },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverPhone: { type: String, required: true },
    amount: { type: Number, required: true, min: 1 },
    balanceBeforeSender: { type: Number, required: true, default: 0 },
    balanceAfterSender: { type: Number, required: true, default: 0 },
    balanceBeforeReceiver: { type: Number, required: true },
    balanceAfterReceiver: { type: Number, required: true },
    pinHash: { type: String },
    status: { type: String, enum: ["Pending", "Success", "Failed", "Reversed"], default: "Pending" },
    method: { type: String, enum: ["Wallet"], default: "Wallet" },
    note: { type: String, default: "" },
    attempts: { type: Number, default: 0 },
    transactionBlocked: { type: Boolean, default: false },
    sessionId: { type: String },
    loanId: { type: mongoose.Schema.Types.ObjectId, ref: "Loan" },
    scheduledAt: { type: Date },
  },
  { timestamps: true }
);

const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);
export default Transaction;
