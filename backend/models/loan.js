import mongoose from "mongoose";

const loanSchema = new mongoose.Schema(
  {
    borrower: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lender: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // assigned after selection
    amount: { type: Number, required: true },
    interestRate: { type: Number, required: true }, // %
    tenure: { type: Number, required: true }, // number of EMIs
    emiAmount: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Funded", "Active", "Completed", "Defaulted"], default: "Pending" },
    emiPaid: { type: Number, default: 0 },
    nextEmiDate: { type: Date },
    autoEmi: { type: Boolean, default: false },
    offers: [
      {
        lender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: { type: String, enum: ["Waiting", "Accepted", "Rejected"], default: "Waiting" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Loan = mongoose.model("Loan", loanSchema);
export default Loan;
