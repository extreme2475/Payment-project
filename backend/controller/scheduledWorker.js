import cron from "node-cron";
import Transaction from "../models/transaction.js";
import User from "../models/user.js";

// Runs every minute
cron.schedule("* * * * *", async () => {
  const now = new Date();

  const pendingTxs = await Transaction.find({
    status: "Pending",
    scheduledAt: { $lte: now }
  });

  for (const tx of pendingTxs) {
    try {
      const sender = await User.findById(tx.sender);
      const receiver = await User.findById(tx.receiver);

      if (!sender || !receiver) {
        tx.status = "Failed";
        await tx.save();
        continue;
      }

      if (sender.walletBalance < tx.amount) {
        tx.status = "Failed";
        await tx.save();
        continue;
      }

      // Execute payment
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
    } catch (err) {
      console.error("Error executing scheduled payment:", err);
      tx.status = "Failed";
      await tx.save();
    }
  }
});
// Auto-delete records older than 1 week (Runs every day at midnight)
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
