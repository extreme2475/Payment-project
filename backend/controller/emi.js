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
  const { emiId, installmentIndex, walletPin } = req.body;

  try {
    // 1. SECURITY: Validate PIN before starting a database session
    // This prevents "Locking" the database if the user just typed the wrong PIN.
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isPinValid = await bcrypt.compare(walletPin, user.walletPin);
    if (!isPinValid) {
      return res.status(401).json({ success: false, message: "Invalid wallet PIN" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 2. Fetch EMI and lock it in this session
      const emi = await EMI.findById(emiId).session(session);
      if (!emi) throw new Error("EMI record not found");
      if (emi.status === "Completed") throw new Error("Loan already fully settled");

      // 3. STRICT ORDER CHECK: Ensure user isn't skipping a previous month
      const firstUnpaidIndex = emi.emiSchedule.findIndex(inst => !inst.paid);
      if (installmentIndex !== firstUnpaidIndex) {
        throw new Error(`Invalid payment order. Please pay EMI #${firstUnpaidIndex + 1} first.`);
      }

      const installment = emi.emiSchedule[installmentIndex];
      if (installment.paid) throw new Error("This EMI is already paid");

      // 4. FINANCIAL CALCULATION: Include Penalties (if any exist from Cron Job)
      const totalToPay = installment.amount + (installment.penalty || 0);

      // 5. ATOMIC BALANCE CHECK & UPDATE (The "Shield" against double-spending)
      const borrower = await User.findOneAndUpdate(
        { _id: req.user.id, walletBalance: { $gte: totalToPay } },
        { $inc: { walletBalance: -totalToPay } },
        { session, new: true }
      );

      if (!borrower) throw new Error("Insufficient balance to cover EMI and Penalties");

      const lender = await User.findByIdAndUpdate(
        emi.lender,
        { $inc: { walletBalance: totalToPay } },
        { session, new: true }
      );
      if (!lender) throw new Error("Lender account not found");

      // 6. Update EMI Schedule Data
      installment.paid = true;
      installment.paidAt = new Date();
      emi.paidEMIs += 1;

      const isLoanFullyPaid = emi.paidEMIs === emi.totalEMIs;
      emi.status = isLoanFullyPaid ? "Completed" : "Ongoing";
      const nextUnpaid = emi.emiSchedule.find(inst => !inst.paid);

      // 7. CREDIT SCORE INTEGRATION
      // On-time/Manual payment reward
      await updateScore(req.user.id, 10, session);

      // Final settlement bonus
      if (isLoanFullyPaid) {
        await updateScore(req.user.id, 50, session);
      }

      // 8. Secure Ledger & Transaction Records
      const txUuid = crypto.randomUUID();

      await Transaction.create([{
        sender: borrower._id,
        senderType: "USER",
        receiver: lender._id,
        receiverPhone: lender.phone,
        amount: totalToPay, 
        balanceBeforeSender: borrower.walletBalance + totalToPay,
        balanceAfterSender: borrower.walletBalance,
        balanceBeforeReceiver: lender.walletBalance - totalToPay,
        balanceAfterReceiver: lender.walletBalance,
        status: "Success",
        method: "Wallet",
        note: `EMI Payment #${installmentIndex + 1}${installment.penalty > 0 ? ' (incl. Penalty)' : ''}`,
        loanId: emi.loan,
      }], { session });

      await Ledger.create([{
        txId: `EMI-${txUuid}`,
        type: "TRANSFER",
        from: borrower.phone,
        to: lender.phone,
        amount: totalToPay,
        note: `Manual EMI payment #${installmentIndex + 1}`,
      }], { session });

      // 9. Update Loan Master Record
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

      // Save the EMI document changes
      await emi.save({ session });

      // Commit all changes at once
      await session.commitTransaction();

      res.status(200).json({
        success: true,
        message: isLoanFullyPaid ? "Loan fully settled! ✅" : "EMI paid successfully 💸",
        nextDueDate: isLoanFullyPaid ? null : (nextUnpaid ? nextUnpaid.dueDate : null)
      });
    } catch (err) {
      // If anything fails inside the session, roll back all money/status changes
      await session.abortTransaction();
      throw err; 
    } finally {
      session.endSession();
    }
  } catch (err) {
    console.error("EMI Payment Error:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

// ---------------- Get EMI History ----------------
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