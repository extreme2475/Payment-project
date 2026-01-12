import EMI from "../models/emi.js";
import Loan from "../models/loan.js";
import User from "../models/user.js";
import Transaction from "../models/transaction.js";
import Ledger from "../models/ledger.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { updateScore } from "./creditScoreController.js";
import crypto from "crypto";

// ---------------- Pay EMI manually ----------------
export const payEMI = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { emiId, installmentIndex, walletPin } = req.body;

    // 1. Fetch EMI and lock it in this session
    const emi = await EMI.findById(emiId).session(session);
    if (!emi) throw new Error("EMI record not found");
    if (emi.status === "Completed") throw new Error("Loan already fully settled");

    // 2. STRICT ORDER CHECK: Kya user pichli EMI bhul toh nahi raha?
    const firstUnpaidIndex = emi.emiSchedule.findIndex(inst => !inst.paid);
    if (installmentIndex !== firstUnpaidIndex) {
      throw new Error(`Invalid payment order. Please pay EMI #${firstUnpaidIndex + 1} first.`);
    }

    const installment = emi.emiSchedule[installmentIndex];
    if (installment.paid) throw new Error("This EMI is already paid");

    // 3. ATOMIC BALANCE CHECK & UPDATE (Race condition fix)
    const borrower = await User.findOneAndUpdate(
      { _id: req.user.id, walletBalance: { $gte: installment.amount } },
      { $inc: { walletBalance: -installment.amount } },
      { session, new: true }
    );

    if (!borrower) throw new Error("Insufficient balance or payment failed");

    // PIN check
    const isPinValid = await bcrypt.compare(walletPin, borrower.walletPin);
    if (!isPinValid) throw new Error("Invalid wallet PIN");

    const lender = await User.findByIdAndUpdate(
      emi.lender,
      { $inc: { walletBalance: installment.amount } },
      { session, new: true }
    );
    if (!lender) throw new Error("Lender account not found");

    // 4. Update EMI Object
    installment.paid = true;
    installment.paidAt = new Date();
    emi.paidEMIs += 1;

    const isLoanFullyPaid = emi.paidEMIs === emi.totalEMIs;
    emi.status = isLoanFullyPaid ? "Completed" : "Ongoing";
    const nextUnpaid = emi.emiSchedule.find(inst => !inst.paid);

    // --- CREDIT SCORE INTEGRATION START ---
    // 1. Update score for On-Time payment (+10)
    await updateScore(req.user.id, 10, session);

    // 2. Bonus impact if the loan is fully settled (+50)
    if (isLoanFullyPaid) {
      await updateScore(req.user.id, 50, session);
    }
    // --- CREDIT SCORE INTEGRATION END ---

    // 5. Secure Ledger & Transaction Records
    const txUuid = crypto.randomUUID();

    await Transaction.create([{
      sender: borrower._id,
      senderType: "USER",
      receiver: lender._id,
      receiverPhone: lender.phone,
      amount: installment.amount,
      balanceBeforeSender: borrower.walletBalance + installment.amount,
      balanceAfterSender: borrower.walletBalance,
      balanceBeforeReceiver: lender.walletBalance - installment.amount,
      balanceAfterReceiver: lender.walletBalance,
      status: "Success",
      method: "Wallet",
      note: `EMI Payment #${installmentIndex + 1}`,
      loanId: emi.loan,
    }], { session });

    await Ledger.create([{
      txId: `EMI-${txUuid}`,
      type: "TRANSFER",
      from: borrower.phone,
      to: lender.phone,
      amount: installment.amount,
      note: `Manual EMI payment #${installmentIndex + 1}`,
    }], { session });

    // 6. Update Loan status
    await Loan.findByIdAndUpdate(
      emi.loan,
      {
        $set: {
          emiPaid: emi.paidEMIs,
          status: isLoanFullyPaid ? "Completed" : "Active",
          nextEmiDate: isLoanFullyPaid ? null : (nextUnpaid ? nextUnpaid.dueDate : null)
        }
      },
      { session }
    );

    await emi.save({ session });

    await session.commitTransaction();
    res.status(200).json({
      success: true,
      message: isLoanFullyPaid ? "Loan fully settled! ✅" : "EMI paid successfully 💸",
      nextDueDate: isLoanFullyPaid ? null : (nextUnpaid ? nextUnpaid.dueDate : null)
    });
  } catch (err) {
    await session.abortTransaction();
    console.error("EMI Payment Error:", err.message);
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};

// ---------------- EMI History ----------------
export const getEMIHistory = async (req, res) => {
  try {
    const userId = req.params.userId;
    const emis = await EMI.find({ $or: [{ borrower: userId }, { lender: userId }] })
      .populate("borrower", "username phone")
      .populate("lender", "username phone")
      .sort({ createdAt: -1 });

    res.status(200).json({ emis });
  } catch (err) {
    console.error("EMI history error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
