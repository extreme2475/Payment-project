// backend/routes/dashboard.js
import express from "express";
import { getDashboardSummary } from "../controller/dashboard.js";
import { verifyToken } from "../Middleware/authMiddleware.js";

const router = express.Router();

// GET /dashboard/summary
router.get("/summary", verifyToken, getDashboardSummary);

export default router;
