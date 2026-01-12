import React, { useState, useEffect } from "react";
import api from "../api"; 
import { 
  FaWallet, 
  FaPaperPlane, 
  FaPhoneAlt, 
  FaRupeeSign, 
  FaPenNib,
  FaShieldAlt
} from "react-icons/fa";

const PaymentForm = () => {
  const [receiverPhone, setReceiverPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [userId, setUserId] = useState("");

  // --- Logic kept exactly as provided ---
  const fetchUserData = async () => {
    try {
      const res = await api.get("/users/me");
      setUserId(res.data.user._id);
      setUserBalance(res.data.user.walletBalance ?? 0);
    } catch (err) {
      console.error("Error fetching user:", err);
      alert("Could not load wallet data");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!receiverPhone || !amount) {
      alert("Please fill all required fields");
      return;
    }

    const cleanPhone = receiverPhone.replace(/\D/g, "");
    const walletPin = prompt("Enter your wallet PIN to confirm:");
    if (!walletPin) return;

    setLoading(true);

    try {
      const res = await api.post("/payment/send", {
        senderId: userId,
        receiverPhone: cleanPhone,
        amount,
        walletPin,
        note,
      });

      alert(`✅ ${res.data.message}`);
      setUserBalance(res.data.senderBalance);
      setReceiverPhone("");
      setAmount("");
      setNote("");
    } catch (err) {
      const msg = err.response?.data?.message || "Transaction failed";
      alert(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        
        {/* --- PREMIUM WALLET CARD --- */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-8 shadow-2xl text-white">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <FaWallet className="text-2xl" />
              </div>
              <FaShieldAlt className="text-white/40 text-xl" />
            </div>
            
            <div className="mt-8">
              <p className="text-indigo-100 text-sm font-medium tracking-wider">Available Balance</p>
              <h3 className="text-4xl font-black mt-1 flex items-center">
                <span className="text-2xl mr-1">₹</span>
                {userBalance.toLocaleString('en-IN')}
              </h3>
            </div>

            <div className="mt-6 flex justify-between items-end">
              <p className="text-xs text-indigo-200 font-mono tracking-widest uppercase">Nexa Pay Wallet</p>
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20" />
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/20" />
              </div>
            </div>
          </div>
          
          {/* Decorative background circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        {/* --- PAYMENT FORM --- */}
        <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-1 w-12 bg-indigo-600 rounded-full" />
            <h2 className="text-xl font-black text-gray-800 tracking-tight">Send Money</h2>
          </div>

          <form onSubmit={handlePayment} className="space-y-5">
            {/* Receiver Phone */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Receiver Details</label>
              <div className="relative group">
                <FaPhoneAlt className="absolute left-4 top-4 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  placeholder="Enter Phone Number"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium"
                  required
                />
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Amount to Send</label>
              <div className="relative group">
                <FaRupeeSign className="absolute left-4 top-4 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-xl"
                  required
                />
              </div>
            </div>

            {/* Note */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Personal Note (Optional)</label>
              <div className="relative group">
                <FaPenNib className="absolute left-4 top-4 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What's this for?"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all min-h-[100px] resize-none font-medium"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 mt-4 flex items-center justify-center gap-3 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 ${
                loading 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200"
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing
                </span>
              ) : (
                <>
                  <FaPaperPlane className="text-sm" />
                  Send Payment
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-400 text-xs">
          Payments are secured with end-to-end encryption.
        </p>
      </div>
    </div>
  );
};

export default PaymentForm;