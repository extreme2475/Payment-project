import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http"; 
import { Server } from "socket.io"; 
import { connectDB } from "./config.js";
import Message from "./models/Message.js"; 
import userRoutes from "./routes/Userroute.js";
import paymentRoutes from "./routes/payroute.js";
import dashboardRoutes from "./routes/dash.js";
import analyticsRoutes from "./routes/analy.js";
import loanRoutes from "./routes/loan.js";
import emiRoutes from "./routes/emi.js";   
import creditRoutes from "./routes/credit.js";
import "./controller/emiService.js";
import "./controller/scheduledWorker.js";
import chatRoutes from "./routes/chatRoutes.js";
import loanDashboardRoutes from "./routes/loanDashboard.js";
import schedulePaymentRoutes from "./routes/schedule.js";
import transactionRoutes from "./routes/Prev.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

const httpServer = createServer(app); 
const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

connectDB();

app.use(cors());
app.use(express.json());

let onlineUsers = new Map(); 

io.on("connection", (socket) => {
  console.log("⚡ New Connection:", socket.id);

  socket.on("register_user", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`👤 User ${userId} is now online.`);
  });

  // FIX: Key names ko model ke 'sender' aur 'receiver' se match kiya
  socket.on("send_message", async (data) => {
    const { sender, receiver, text } = data; // Match with Frontend keys
    
    try {
      const newMessage = new Message({
        sender: sender,
        receiver: receiver,
        text: text,
        status: "sent" 
      });
      const savedMsg = await newMessage.save();

      const receiverSocketId = onlineUsers.get(receiver);
      if (receiverSocketId) {
        // Real-time emission to receiver
        io.to(receiverSocketId).emit("receive_message", savedMsg);
      }
    } catch (err) {
      console.error("Chat Sync Error:", err);
    }
  });

  socket.on("mark_as_read", ({ senderId, receiverId }) => {
    const senderSocketId = onlineUsers.get(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("status_updated", { 
        status: "read",
        receiverId: receiverId 
      });
    }
  });

  socket.on("delete_message", ({ msgId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message_deleted", { msgId });
    }
  });

  socket.on("disconnect", () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});

app.use("/api/users", userRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/loan-mgmt", loanRoutes);
app.use("/api/emi", emiRoutes);
app.use("/api/credit", creditRoutes);
app.use("/api/loan-dash", loanDashboardRoutes);
app.use("/api/schedule", schedulePaymentRoutes);
app.use("/api/chat", chatRoutes); 
app.use("/api/transactions", transactionRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

httpServer.listen(port, () => console.log(`🚀 Server running on port ${port}`));