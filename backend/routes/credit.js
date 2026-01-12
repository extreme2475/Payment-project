import express from "express";
import { verifyToken } from "../Middleware/authMiddleware.js";
import { getMyScore, getCreditDetails } from "../controller/creditScoreController.js";

const router = express.Router();

// 🔹 Get current score
router.get("/me", verifyToken, getMyScore);

// 🔹 Get full credit score details
router.get("/details", verifyToken, getCreditDetails);

export default router;
