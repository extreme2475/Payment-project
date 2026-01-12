import express from "express";
import { unifiedLoanDashboard } from "../controller/loanDashboardController.js";
import { verifyToken } from "../Middleware/authMiddleware.js";

const router = express.Router();

// Unified dashboard for borrower and lender
router.get("/loan", verifyToken, unifiedLoanDashboard);

export default router;
