import React, { useState, useEffect } from "react";
import api from "../api";
// Importing icons for a premium look
import { 
  FaCalendarAlt, 
  FaUser, 
  FaRupeeSign, 
  FaPlus, 
  FaTrashAlt, 
  FaLock, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle 
} from "react-icons/fa";

const SchedulePaymentForm = () => {
  const [payments, setPayments] = useState([{ receiverPhone: "", amount: "", scheduledAt: "" }]);
  const [walletPin, setWalletPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [history, setHistory] = useState([]);

  // Helper to prevent selecting past dates and times
  const getMinDateTime = () => {
    const now = new Date();
    // Adjust for local timezone offset to get YYYY-MM-DDTHH:mm format
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now - offset).toISOString().slice(0, 16);
  };

  // --- Logic kept exactly as provided ---
  const fetchUser = async () => {
    const res = await api.get("/users/me");
    setUserId(res.data.user._id);
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get("/schedule/history");
      if (res.data.success) setHistory(res.data.data);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this payment?")) return;
    try {
      await api.delete(`/schedule/cancel/${id}`);
      fetchHistory(); 
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel");
    }
  };

  useEffect(() => {
    fetchUser();
    fetchHistory();
  }, []);

  const handleChange = (index, field, value) => {
    const temp = [...payments];
    temp[index][field] = value;
    setPayments(temp);
  };

  const addRow = () => setPayments([...payments, { receiverPhone: "", amount: "", scheduledAt: "" }]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!walletPin) { alert("Enter wallet PIN"); return; }
    setLoading(true);
    try {
      // FIX: Ensure dates are sent as proper ISO strings to prevent timezone shifts
      const formattedPayments = payments.map(p => ({
        ...p,
        scheduledAt: new Date(p.scheduledAt).toISOString()
      }));

      const res = await api.post("/schedule", { 
        senderId: userId, 
        payments: formattedPayments, 
        walletPin 
      });
      
      alert(res.data.message);
      setPayments([{ receiverPhone: "", amount: "", scheduledAt: "" }]);
      setWalletPin("");
      fetchHistory(); 
    } catch (err) {
      alert(err.response?.data?.message || "Failed to schedule payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4 space-y-8 pb-10">
      
      {/* --- FORM SECTION --- */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-indigo-600 p-6">
          <h2 className="text-white text-xl font-bold flex items-center gap-2">
            <FaCalendarAlt /> Schedule Payments
          </h2>
          <p className="text-indigo-100 text-sm">Create future-dated transactions securely</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            {payments.map((p, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 items-end">
                <div className="flex-1 w-full">
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Receiver</label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-3 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Phone Number" 
                      value={p.receiverPhone} 
                      onChange={(e) => handleChange(i, "receiverPhone", e.target.value)} 
                      className="w-full pl-9 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white" 
                      required 
                    />
                  </div>
                </div>

                <div className="w-full md:w-32">
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Amount</label>
                  <div className="relative">
                    <FaRupeeSign className="absolute left-3 top-3 text-gray-400" />
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      value={p.amount} 
                      onChange={(e) => handleChange(i, "amount", e.target.value)} 
                      className="w-full pl-8 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white" 
                      required 
                    />
                  </div>
                </div>

                <div className="w-full md:w-60">
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Schedule Date & Time</label>
                  <input 
                    type="datetime-local" 
                    min={getMinDateTime()} // FIX: Prevents selecting past dates
                    value={p.scheduledAt} 
                    onChange={(e) => handleChange(i, "scheduledAt", e.target.value)} 
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white" 
                    required 
                  />
                </div>
              </div>
            ))}
          </div>

          <button 
            type="button" 
            onClick={addRow} 
            className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 transition-colors"
          >
            <FaPlus className="text-sm" /> Add Another Payment
          </button>

          <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-64">
              <FaLock className="absolute left-3 top-3 text-gray-400" />
              <input 
                type="password" 
                placeholder="Secure Wallet PIN" 
                value={walletPin} 
                onChange={(e) => setWalletPin(e.target.value)} 
                className="w-full pl-9 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" 
                required 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-1 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
            >
              {loading ? "Scheduling..." : "Confirm & Schedule"}
            </button>
          </div>
        </form>
      </div>

      {/* --- HISTORY SECTION --- */}
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
        <h3 className="text-lg font-bold mb-6 text-gray-800 flex items-center gap-2">
          <FaClock className="text-indigo-500" /> Transaction Records
        </h3>
        
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {history.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <FaClock className="mx-auto text-4xl mb-2 opacity-20" />
              <p>No payments scheduled yet.</p>
            </div>
          ) : (
            history.map((tx) => (
              <div key={tx._id} className="p-4 border rounded-xl bg-gray-50 flex justify-between items-center hover:shadow-md transition-shadow bg-white">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${
                    tx.status === 'Success' ? 'bg-green-100 text-green-600' : 
                    tx.status === 'Pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {tx.status === 'Success' ? <FaCheckCircle /> : tx.status === 'Pending' ? <FaClock /> : <FaTimesCircle />}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">To: {tx.receiver?.username || tx.receiverPhone}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <FaCalendarAlt className="text-[10px]" /> {new Date(tx.scheduledAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-indigo-600 text-lg">₹{tx.amount}</p>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                      tx.status === 'Success' ? 'bg-green-100 text-green-700' : 
                      tx.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                  
                  {tx.status === "Pending" && (
                    <button 
                      onClick={() => handleCancel(tx._id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                      title="Cancel Payment"
                    >
                      <FaTrashAlt className="text-lg" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SchedulePaymentForm;