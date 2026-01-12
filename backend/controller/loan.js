import Loan from "../models/loan.js";
import EMI from "../models/emi.js";
import User from "../models/user.js";
import Transaction from "../models/transaction.js";
import Ledger from "../models/ledger.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ---------------- Create Loan Request ----------------
export const createLoanRequest = async (req, res) => {
  try {
    const { amount, interestRate, tenure, autoEmi } = req.body;
    const borrowerId = req.user.id;

    if (!amount || !interestRate || !tenure) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const activeLoan = await Loan.findOne({
      borrower: borrowerId,
      status: { $in: ["Pending", "Funded", "Active"] },
    });

    if (activeLoan) {
      return res.status(400).json({ message: "You already have an active or pending loan" });
    }

    // Calculate EMI
    const emiAmount = parseFloat(((amount + (amount * interestRate) / 100) / tenure).toFixed(2));

    const loan = new Loan({
      borrower: borrowerId,
      amount,
      interestRate,
      tenure,
      emiAmount,
      autoEmi: !!autoEmi,
    });

    await loan.save();
    res.status(201).json({ message: "Loan request created", loan });
  } catch (err) {
    console.error("Loan creation error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- Cancel Loan ----------------
export const cancelLoan = async (req, res) => {
  try {
    const { loanId } = req.body;
    const borrowerId = req.user.id;

    if (!loanId) return res.status(400).json({ message: "Loan ID required" });

    const loan = await Loan.findById(loanId);
    if (!loan) return res.status(404).json({ message: "Loan not found" });

    if (loan.borrower.toString() !== borrowerId) return res.status(403).json({ message: "Not authorized" });
    if (loan.status !== "Pending") return res.status(400).json({ message: "Only pending loans can be cancelled" });

    await Loan.findByIdAndDelete(loanId);
    res.status(200).json({ message: "Loan cancelled successfully" });
  } catch (err) {
    console.error("Cancel loan error:", err);
    res.status(500).json({ message: "Server error cancelling loan" });
  }
};

// ---------------- Get Loan Requests (For Lender) ----------------
export const getLoanRequests = async (req, res) => {
  try {
    const lenderId = req.user.id;

    const loans = await Loan.find({
      status: "Pending",
      borrower: { $ne: lenderId },
      amount: { $lte: (await User.findById(lenderId)).walletBalance },
    }).populate("borrower", "username email phone");

    res.status(200).json({ loans });
  } catch (err) {
    console.error("Fetch loan requests error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- Send Offer (Lender) ----------------
export const sendOffer = async (req, res) => {
  try {
    const lenderId = req.user.id;
    const { loanId } = req.body;

    const loan = await Loan.findById(loanId);
    if (!loan) return res.status(404).json({ message: "Loan not found" });
    if (loan.borrower.toString() === lenderId)
      return res.status(400).json({ message: "You cannot fund your own loan" });
    if (loan.status !== "Pending") return res.status(400).json({ message: "Loan is not pending" });

    const existingOffer = loan.offers.find(o => o.lender.toString() === lenderId);
    if (existingOffer) return res.status(400).json({ message: "You already expressed interest" });

    loan.offers.push({ lender: lenderId });
    await loan.save();

    res.status(200).json({ message: "Offer sent successfully", loan });
  } catch (err) {
    console.error("Send offer error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- Borrower Selects Lender ----------------
export const selectLender = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { loanId, lenderId, walletPin } = req.body;
    const borrowerId = req.user.id;

    const loan = await Loan.findById(loanId).session(session);
    if (!loan || loan.status !== "Pending") throw new Error("Loan not available");

    const lender = await User.findById(lenderId).session(session);
    const borrower = await User.findById(borrowerId).session(session);

    const pinValid = await bcrypt.compare(walletPin, borrower.walletPin);
    if (!pinValid) throw new Error("Invalid PIN");
    if (lender.walletBalance < loan.amount) throw new Error("Insufficient balance");

    // Transfer Funds
    lender.walletBalance -= loan.amount;
    borrower.walletBalance += loan.amount;

    // Create EMI schedule
    const emiSchedule = [];
    const today = new Date();
    for (let i = 0; i < loan.tenure; i++) {
      const dueDate = new Date(today);
      dueDate.setMonth(today.getMonth() + i + 1);
      emiSchedule.push({ dueDate, amount: loan.emiAmount, paid: false });
    }

    const emi = new EMI({
      loan: loan._id,
      borrower: borrower._id,
      lender: lender._id,
      totalEMIs: loan.tenure,
      emiAmount: loan.emiAmount,
      principalAmount: loan.amount,
      interestRate: loan.interestRate,
      autoEMI: loan.autoEmi,
      emiSchedule,
      paidEMIs: 0,
      status: "Ongoing",
    });

    // AUTO-EMI: first installment if balance sufficient
    if (emi.autoEMI && borrower.walletBalance >= loan.emiAmount) {
      borrower.walletBalance -= loan.emiAmount;
      lender.walletBalance += loan.emiAmount;

      emi.emiSchedule[0].paid = true;
      emi.emiSchedule[0].paidAt = new Date();
      emi.paidEMIs = 1;

      loan.emiPaid = 1;
      loan.nextEmiDate = emi.emiSchedule[1] ? emi.emiSchedule[1].dueDate : null;
    } else {
      loan.emiPaid = 0;
      loan.nextEmiDate = emi.emiSchedule[0].dueDate;
    }

    // ✅ REQUIRED FIX: update offer statuses
    loan.offers.forEach(o => {
      if (o.lender.toString() === lenderId) {
        o.status = "Accepted";
      } else {
        o.status = "Rejected";
      }
    });

    loan.status = "Active";
    loan.lender = lender._id;

    await borrower.save({ session });
    await lender.save({ session });
    await emi.save({ session });
    await loan.save({ session });

    await session.commitTransaction();
    res.status(200).json({ message: "Loan funded successfully", loan });
  } catch (err) {
    await session.abortTransaction();
    console.error("Select lender error:", err.message);
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
};
