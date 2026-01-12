import mongoose from "mongoose";

const creditScoreSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
  reason: { type: String, default: "Score Updated" },
  score: { type: Number, default: 750 },
  totalLoans: { type: Number, default: 0 },
  successfulLoans: { type: Number, default: 0 },
  defaults: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("CreditScore", creditScoreSchema);
