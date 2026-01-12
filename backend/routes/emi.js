import express from "express";
import { payEMI, getEMIHistory } from "../controller/emi.js";
import { verifyToken} from "../Middleware/authMiddleware.js";

const router = express.Router();

// Borrower pays an EMI manually
router.post("/pay", verifyToken, payEMI);

// Get EMI history for a user (borrower or lender)
router.get("/history/:userId", verifyToken, getEMIHistory);

export default router;
