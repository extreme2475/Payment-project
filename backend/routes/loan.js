import express from "express";
import {
  createLoanRequest,
  cancelLoan,
  getLoanRequests,
  sendOffer,
  selectLender
} from "../controller/loan.js";
import { verifyToken } from "../Middleware/authMiddleware.js";

const router = express.Router();

// Borrower creates loan request
router.post("/request", verifyToken, createLoanRequest);

// Borrower cancels pending loan
router.post("/cancel", verifyToken, cancelLoan);

// Lender views available loan requests
router.get("/requests", verifyToken, getLoanRequests);

// Lender sends funding offer
router.post("/offer", verifyToken, sendOffer);

// Borrower selects lender & funds loan
router.post("/select", verifyToken, selectLender);

export default router;
