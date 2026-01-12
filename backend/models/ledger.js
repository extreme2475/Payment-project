import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema(
  {
    txId: { type: String, required: true },
    type: { type: String, enum: ["MINT", "TRANSFER", "REVERSE"], required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    amount: { type: Number, required: true },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

const Ledger = mongoose.models.Ledger || mongoose.model("Ledger", ledgerSchema);
export default Ledger;
