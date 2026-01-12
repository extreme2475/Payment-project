import CreditScore from "../models/creditScore.js";
import CreditScoreHistory from "../models/creditScoreHistory.js";
import Loan from "../models/loan.js";
import EMI from "../models/emi.js";

// ---------------- Update score & history ----------------
// modified updateScore to handle dynamic events
export const updateScore = async (userId, delta, session = null) => {
  // 1. Pehle check karo kya record exist karta hai
  let record = await CreditScore.findOne({ user: userId }).session(session);

  if (!record) {
    // Agar naya user hai, toh 750 (Base) + delta se shuru karo
    record = new CreditScore({
      user: userId,
      score: 750 + delta 
    });
  } else {
    // Agar purana user hai, toh existing score mein delta jodo
    record.score += delta;
  }

  // 2. Clamp score between 300 and 900
  record.score = Math.max(300, Math.min(900, record.score));
  
  await record.save({ session });

  // 3. Save history
  await CreditScoreHistory.create([{ 
    user: userId, 
    score: record.score,
    date: new Date() 
  }], { session });

  return record;
};
// ---------------- Get logged-in user's score ----------------
export const getMyScore = async (req, res) => {
  const userId = req.user.id;
  const score = await CreditScore.findOne({ user: userId });
  res.json(score || { score: 750 });
};

// ---------------- Get credit score details ----------------
export const getCreditDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    const scoreRecord = await CreditScore.findOne({ user: userId }) || { score: 750 };

    // Fetch history
    const history = await CreditScoreHistory.find({ user: userId })
      .sort({ date: 1 })
      .lean();

    // Calculate factors affecting score
    const borrowedLoans = await Loan.find({ borrower: userId }).lean();
    const activeLoans = borrowedLoans.filter(l => l.status === "ACTIVE").length;

    const totalEMIs = await EMI.countDocuments({ borrower: userId });
    const lateEMIs = await EMI.countDocuments({ borrower: userId, status: "Late" });
    const paidEMIs = await EMI.countDocuments({ borrower: userId, status: "Paid" });

    const factors = {
      activeLoans,
      latePayments: lateEMIs,
      totalPayments: totalEMIs,
      paidEMIs,
    };

    res.json({
      score: scoreRecord.score,
      history: history.map(h => ({ date: h.date, score: h.score })),
      factors,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch credit score details" });
  }
};
