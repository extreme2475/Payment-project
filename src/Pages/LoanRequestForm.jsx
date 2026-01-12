import React, { useState } from "react";
import api from "../api";
import { 
  FaHandHoldingUsd, 
  FaPercent, 
  FaCalendarAlt, 
  FaStickyNote, 
  FaCalculator,
  FaRobot
} from "react-icons/fa";

const LoanRequestForm = ({ onRequestSuccess }) => {
  const [amount, setAmount] = useState("");
  const [tenure, setTenure] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [isAutoPay, setIsAutoPay] = useState(false); // Key synced with backend
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend Validations
    if (!amount || !tenure || !interestRate) {
      setMessage("❌ Please fill all required fields");
      return;
    }
    if (amount < 100 || amount > 5000) {
      setMessage("❌ Amount must be between ₹100 – ₹5000");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // POST Call to /loan/request
      const res = await api.post("/loan-mgmt/request", {
        amount: Number(amount),
        interestRate: Number(interestRate),
        tenure: Number(tenure),
        isAutoPay, // Standard backend key
        note: note.trim()
      });

      setMessage("✅ Success! Your request is live in the marketplace.");
      
      // Reset Form
      setAmount("");
      setTenure("");
      setInterestRate("");
      setIsAutoPay(false);
      setNote("");

      // Trigger dashboard refresh if callback provided
      if (onRequestSuccess) {
        setTimeout(() => onRequestSuccess(res.data.loan), 1500);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Submission failed. Check your wallet balance.");
    } finally {
      setLoading(false);
    }
  };

  // Improved EMI Preview (Mathematical Rounding)
  const calculatePreview = () => {
    if (amount && interestRate && tenure) {
      const p = Number(amount);
      const r = Number(interestRate) / 100 / 12;
      const n = Number(tenure);
      if (r === 0) return (p / n).toFixed(2);
      const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      return emi.toFixed(2);
    }
    return "0.00";
  };

  return (
    <div className="bg-white shadow-2xl rounded-[2.5rem] overflow-hidden max-w-md mx-auto border border-slate-100">
      {/* Header: Blue Theme as per your design */}
      <div className="bg-indigo-600 p-8 text-white text-center">
        <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
          <FaHandHoldingUsd className="text-3xl" />
        </div>
        <h2 className="text-2xl font-black tracking-tight">Request Funds</h2>
        <p className="text-indigo-100 text-sm font-medium opacity-80">Instant listing in the peer marketplace</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        
        {/* Principal Input */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Principal Amount</label>
          <div className="relative mt-2">
            <span className="absolute left-4 top-3.5 text-slate-400 font-bold">₹</span>
            <input
              type="number"
              placeholder="100 – 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Interest Input */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rate % (Yearly)</label>
            <div className="relative mt-2">
              <FaPercent className="absolute left-4 top-5 text-slate-400 text-[10px]" />
              <input
                type="number"
                placeholder="2 – 20"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full pl-9 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700"
                required
              />
            </div>
          </div>

          {/* Tenure Input */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Months</label>
            <div className="relative mt-2">
              <FaCalendarAlt className="absolute left-4 top-5 text-slate-400 text-[10px]" />
              <input
                type="number"
                placeholder="1 – 12"
                value={tenure}
                onChange={(e) => setTenure(e.target.value)}
                className="w-full pl-9 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700"
                required
              />
            </div>
          </div>
        </div>

        {/* Dynamic EMI Card */}
        {amount && interestRate && tenure && (
          <div className="bg-indigo-50 p-5 rounded-[2rem] border border-indigo-100 flex items-center justify-between transform transition-all scale-100 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                <FaCalculator />
              </div>
              <div>
                <p className="text-[10px] font-black text-indigo-400 uppercase">Estimated EMI</p>
                <p className="text-xl font-black text-indigo-900">₹{calculatePreview()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Auto-Debit Feature (The "Robot" Logic) */}
        <label className="flex items-center gap-4 p-4 bg-slate-50 rounded-[1.5rem] cursor-pointer hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
          <div className="relative">
            <input
              type="checkbox"
              checked={isAutoPay}
              onChange={(e) => setIsAutoPay(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-emerald-500 transition-colors after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
              Enable Auto-EMI <FaRobot className="text-indigo-400" />
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Auto-deduct from wallet on due date</span>
          </div>
        </label>

        {/* Reason for Loan */}
        <div className="relative">
          <FaStickyNote className="absolute left-4 top-5 text-slate-300 text-xs" />
          <textarea
            placeholder="What is this loan for? (e.g. Education, Emergency)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-28 resize-none font-medium text-slate-600"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-5 rounded-2xl font-black text-white shadow-xl transition-all active:scale-[0.98] ${
            loading ? "bg-slate-300 cursor-not-allowed" : "bg-slate-900 hover:bg-indigo-600 shadow-indigo-100"
          }`}
        >
          {loading ? "Verifying Request..." : "Broadcast Loan Request"}
        </button>

        {/* Feedback Message */}
        {message && (
          <div className={`p-4 rounded-2xl text-center text-xs font-black uppercase tracking-wider animate-bounce-short ${
            message.includes("✅") ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default LoanRequestForm;