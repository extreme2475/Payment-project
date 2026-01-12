import express from "express";
import { sendMoney, getLedger } from "../controller/payment.js";
import { verifyToken } from "../Middleware/authMiddleware.js";

const router = express.Router();

// ----------------- User Routes -----------------

// Send money to another user (requires wallet PIN)
router.post("/send", verifyToken, sendMoney);

// --- FIX: Express 5 does NOT support /:param? ----
// So we define two separate routes:

// 1) Ledger with userId
router.get("/ledger/:userId", verifyToken, getLedger);

// 2) Ledger without userId (for your frontend)
router.get("/ledger", verifyToken, getLedger);

export default router;
