import cron from "node-cron";
import EMI from "../models/emi.js";
import User from "../models/user.js";
import Transaction from "../models/transaction.js";
import Ledger from "../models/ledger.js";
import Loan from "../models/loan.js";
import mongoose from "mongoose";

// Cron: runs daily at 1AM
cron.schedule("0 1 * * *", async () => {
  const today = new Date();
  // Normalize today to start of day for accurate comparison
  const todayStart = new Date(today).setHours(0,0,0,0);

  try {
    const emis = await EMI.find({ status: "Ongoing" });
    for (const emi of emis) {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const emiDoc = await EMI.findById(emi._id).session(session);
        const borrower = await User.findById(emiDoc.borrower).session(session);
        const lender = await User.findById(emiDoc.lender).session(session);
        const loan = await Loan.findById(emiDoc.loan).session(session);

        if (!emiDoc || !borrower || !lender || !loan) {
          await session.abortTransaction();
          session.endSession();
          continue;
        }

        // FIX 1: Normalize installment dueDate for comparison
        const nextIndex = emiDoc.emiSchedule.findIndex(i => {
          const dDate = new Date(i.dueDate).setHours(0,0,0,0);
          return !i.paid && dDate <= todayStart;
        });

        if (nextIndex === -1) { 
          await session.abortTransaction(); 
          session.endSession(); 
          continue; 
        }

        const installment = emiDoc.emiSchedule[nextIndex];

        // AutoEMI deduction logic
        if (emiDoc.autoEMI && borrower.walletBalance >= installment.amount) {
          borrower.walletBalance -= installment.amount;
          lender.walletBalance += installment.amount;

          installment.paid = true;
          installment.paidAt = new Date();
          emiDoc.paidEMIs += 1;

          await Transaction.create([{
            sender: borrower._id,
            senderType: "SYSTEM",
            receiver: lender._id,
            receiverPhone: lender.phone,
            amount: installment.amount,
            balanceBeforeSender: borrower.walletBalance + installment.amount,
            balanceAfterSender: borrower.walletBalance,
            balanceBeforeReceiver: lender.walletBalance - installment.amount,
            balanceAfterReceiver: lender.walletBalance,
            status: "Success",
            note: "Auto EMI deduction",
            loanId: emiDoc.loan,
          }], { session });

          await Ledger.create([{
            txId: `EMI-${Date.now()}`,
            type: "TRANSFER",
            from: borrower.phone,
            to: lender.phone,
            amount: installment.amount,
            note: "Auto EMI deduction",
          }], { session });
        }

        // Penalty if unpaid
        if (!installment.paid) {
          // FIX 2: Accurate days late calculation using normalized dates
          const dueDateNormalized = new Date(installment.dueDate).setHours(0,0,0,0);
          const daysLate = Math.floor((todayStart - dueDateNormalized) / (1000*60*60*24));
          
          if (daysLate > 0) {
            installment.penalty = parseFloat((installment.amount * 0.01 * daysLate).toFixed(2));
            // FIX 3: Tell Mongoose that the emiSchedule array has changed so it saves the penalty
            emiDoc.markModified('emiSchedule'); 
          }
        }

        const nextUnpaid = emiDoc.emiSchedule.find(i => !i.paid);
        const isLoanFullyPaid = emiDoc.paidEMIs >= emiDoc.totalEMIs;

        emiDoc.status = isLoanFullyPaid ? "Completed" : "Ongoing";

        await emiDoc.save({ session });
        await borrower.save({ session });
        await lender.save({ session });

        await Loan.findByIdAndUpdate(emiDoc.loan, {
          $set: {
            emiPaid: emiDoc.paidEMIs,
            status: isLoanFullyPaid ? "Completed" : "Active",
            nextEmiDate: isLoanFullyPaid ? null : (nextUnpaid ? nextUnpaid.dueDate : null)
          }
        }, { session });

        await session.commitTransaction();
        session.endSession();
      } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error("Auto EMI processing error:", err.message);
      }
    }
  } catch (err) {
    console.error("Auto EMI cron error:", err.message);
  }
});