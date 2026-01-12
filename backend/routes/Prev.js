import express from "express";
import { getTransactions } from "../controller/Prevdata.js";
import { verifyToken } from "../Middleware/authMiddleware.js";

const router = express.Router();

// GET /transactions
router.get("/", verifyToken, getTransactions);

export default router;
