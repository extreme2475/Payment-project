import express from "express";
import { verifyToken } from "../Middleware/authMiddleware.js";
import { schedulePayment , getActiveScheduledPayments,getScheduledHistory,cancelScheduledPayment} from "../controller/schedule.js"

const router = express.Router();

// POST schedule multiple payments
router.post("/schedule", verifyToken, schedulePayment);
router.get("/active", verifyToken, getActiveScheduledPayments);
router.get("/history", verifyToken, getScheduledHistory);
router.delete("/cancel/:id", verifyToken, cancelScheduledPayment);

export default router;
