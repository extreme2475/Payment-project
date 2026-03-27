import cron from "node-cron";
import Transaction from "../models/transaction.js";
import User from "../models/user.js";

/**
 * Initializes the scheduled payment worker.
 * @param {Server} io - The Socket.io server instance from app.js
 * @param {Map} onlineUsers - The Map tracking userId -> socketId
 */
export const initScheduledWorker = (io, onlineUsers) => {
  // 🕒 1. Payment Execution: Runs every minute
  cron.schedule("* * * * *", async () => {
    const now = new Date();

    try {
      const pendingTxs = await Transaction.find({
        status: "Pending",
        scheduledAt: { $lte: now }
      });

      if (pendingTxs.length === 0) return;

      for (const tx of pendingTxs) {
        try {
          const sender = await User.findById(tx.sender);
          const receiver = await User.findById(tx.receiver);

          if (!sender || !receiver) {
            tx.status = "Failed";
            await tx.save();
            continue;
          }

          // Check if sender has enough money at the time of execution
          if (sender.walletBalance < tx.amount) {
            tx.status = "Failed";
            await tx.save();
            continue;
          }

          // --- EXECUTE MONEY TRANSFER ---
          tx.balanceBeforeSender = sender.walletBalance;
          tx.balanceBeforeReceiver = receiver.walletBalance;

          sender.walletBalance -= tx.amount;
          receiver.walletBalance += tx.amount;

          await sender.save();
          await receiver.save();

          tx.balanceAfterSender = sender.walletBalance;
          tx.balanceAfterReceiver = receiver.walletBalance;
          tx.status = "Success";

          await tx.save();

          // ⚡ REAL-TIME NOTIFICATION: Tell the sender to refresh their UI
          const senderSocketId = onlineUsers.get(tx.sender.toString());
          if (senderSocketId) {
            io.to(senderSocketId).emit("payment_processed", {
              success: true,
              message: `Scheduled payment of ₹${tx.amount} to ${tx.receiverPhone} was successful!`,
              txId: tx._id
            });
          }

        } catch (err) {
          console.error("Error executing individual scheduled payment:", err);
          tx.status = "Failed";
          await tx.save();
        }
      }
    } catch (err) {
      console.error("Global Cron Error:", err);
    }
  });

  // 🧹 2. Cleanup: Runs every day at midnight
  cron.schedule("0 0 * * *", async () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    try {
      const result = await Transaction.deleteMany({
        note: "Scheduled Payment",
        createdAt: { $lt: oneWeekAgo }
      });
      console.log(`🧹 Cleanup: Deleted ${result.deletedCount} old scheduled records.`);
    } catch (err) {
      console.error("Cleanup Error:", err);
    }
  });

  console.log("✅ Scheduled Worker Initialized with Socket.io support.");
};