import mongoose from "mongoose";

const emiSchema = new mongoose.Schema(
  {
    loan: { type: mongoose.Schema.Types.ObjectId, ref: "Loan", required: true },
    borrower: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    principalAmount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    totalEMIs: { type: Number, required: true },
    emiAmount: { type: Number, required: true },
    paidEMIs: { type: Number, default: 0 },
    autoEMI: { type: Boolean, default: false },
    status: { type: String, enum: ["Ongoing", "Completed"], default: "Ongoing" },
    emiSchedule: [
      {
        dueDate: { type: Date, required: true },
        amount: { type: Number, required: true },
        paid: { type: Boolean, default: false },
        paidAt: { type: Date },
        penalty: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

const EMI = mongoose.model("EMI", emiSchema);
export default EMI;
