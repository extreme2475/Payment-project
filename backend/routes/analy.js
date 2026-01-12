import express from "express";
import { getMoneyAnalytics } from "../controller/analytics.js";
import { verifyToken } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.get("/money", verifyToken, getMoneyAnalytics);

export default router;
