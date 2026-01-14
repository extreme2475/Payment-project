import express from "express";
import { 
  getChatHistory, 
  markAsRead, 
  deleteMessage, // Naya function import kiya
  clearChat,
  getUnreadCounts     // Naya function import kiya
} from "../controller/chatController.js";
import { verifyToken } from "../Middleware/authMiddleware.js";

const router = express.Router();

// 1. History fetch karne ke liye
router.get("/history/:otherUserId", verifyToken, getChatHistory);

// 2. Blue Tick (Seen status) update karne ke liye
router.put("/read/:otherUserId", verifyToken, markAsRead);

// 3. Single message delete karne ke liye (Delete for Everyone)
router.delete("/delete/:messageId", verifyToken, deleteMessage);

// 4. Poori chat clear karne ke liye
router.delete("/clear/:otherUserId", verifyToken, clearChat);

// Inside routes/chatRoutes.js
router.get("/unread-counts", verifyToken, getUnreadCounts);

export default router;