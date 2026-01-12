import React, { useState, useEffect } from "react";
import api from "../api";
import { 
  FaHandHoldingUsd, FaPiggyBank, FaClock, 
  FaChevronRight, FaWallet, FaTrashAlt, FaHistory, FaCheckCircle 
} from "react-icons/fa";

// 1. Marketplace Component (No changes here)
const PendingLoanRequests = ({ onActionSuccess }) => {
  const [requests, setRequests] = useState([]);
  const fetchRequests = async () => {
    try {
      const res = await api.get("/loan-mgmt/requests");
      setRequests(res.data?.loans || []);
    } catch (err) {
      console.error("Marketplace fetch error:", err);
    }
  };
  useEffect(() => { fetchRequests(); }, []);

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-200">
        <p className="text-slate-400 font-bold">No marketplace requests found at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {requests.map((loan) => (
        <div key={loan._id} className="bg-white border border-slate-100 shadow-lg rounded-[2.5rem] p-8 hover:scale-[1.02] transition-all">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl">
              {loan.borrower?.username?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase">Borrower</p>
              <h4 className="font-bold text-slate-800">{loan.borrower?.username}</h4>
            </div>
          </div>
          <div className="mb-6">
            <p className="text-3xl font-black text-slate-900">₹{loan.amount?.toLocaleString()}</p>
            <div className="flex gap-4 mt-2">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <FaClock /> {loan.tenure} Mo.
              </span>
              <span className="text-xs font-bold text-emerald-600 uppercase">{loan.interestRate}% Int.</span>
            </div>
          </div>
          <button
            className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
            onClick={async () => {
              try {
                await api.post("/loan-mgmt/offer", { loanId: loan._id });
                alert("✅ Offer sent successfully!");
                onActionSuccess?.();
              } catch (err) {
                alert(err.response?.data?.message || "Error investing");
              }
            }}
          >
            Invest Now <FaChevronRight className="text-xs" />
          </button>
        </div>
      ))}
    </div>
  );
};

// 2. Main Dashboard Component
const LoanDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payingIndex, setPayingIndex] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get("/loan-dash/loan");
      
      // Separating Active and History based on Status
      const borrowerAll = res.data?.borrower?.loans || [];
      const lenderAll = res.data?.lender?.loans || [];

      setDashboard({
        // Active: Anything not Completed
        borrowerActive: borrowerAll.filter(l => l.status !== "Completed"),
        borrowerHistory: borrowerAll.filter(l => l.status === "Completed"),
        // Lender: Anything not Completed
        lenderActive: lenderAll.filter(l => l.status !== "Completed"),
        lenderHistory: lenderAll.filter(l => l.status === "Completed"),
        stats: {
          walletBalance: res.data?.walletBalance || 0,
          totalInterestEarned: res.data?.lender?.interestEarned || 0
        }
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const handleSelectLender = async (loanId, lenderId) => {
    const pin = prompt("Enter Wallet PIN to confirm and receive funds:");
    if (!pin) return;
    try {
      const res = await api.post("/loan-mgmt/select", { loanId, lenderId, walletPin: pin });
      alert("✅ Success: " + res.data.message);
      await fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || "Funding failed");
    }
  };

  const handlePayEMI = async (emiId, index) => {
    const pin = prompt("Enter Wallet PIN to confirm payment:");
    if (!pin) return;
    try {
      setPayingIndex(emiId);
      await api.post("/emi/pay", { emiId, installmentIndex: index, walletPin: pin });
      alert("✅ EMI Paid Successfully!");
      await fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || "Error paying EMI");
    } finally {
      setPayingIndex(null);
    }
  };

  const handleCancelRequest = async (loanId) => {
    if (!window.confirm("Do you want to withdraw this loan request?")) return;
    try {
      await api.post("/loan-mgmt/cancel", { loanId });
      alert("✅ Request withdrawn.");
      await fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || "Cannot cancel active loan");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* HEADER (Same UI) */}
      <div className="bg-white border-b border-slate-100 pt-28 pb-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Financial Hub</h2>
            <p className="text-slate-500 font-medium mt-1">Manage your debts and investments</p>
          </div>
          <div className="flex flex-wrap gap-4">
            
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] flex items-center gap-4 min-w-[220px]">
              <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 text-xl shadow-sm"><FaPiggyBank /></div>
              <div>
                <p className="text-[10px] font-black text-emerald-700/50 uppercase">Profit Earned</p>
                <p className="font-black text-2xl text-emerald-700">₹{dashboard?.stats?.totalInterestEarned?.toFixed(2) || "0.00"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 space-y-16">
        
        {/* --- ACTIVE BORROWINGS --- */}
        <section>
          <h3 className="text-2xl font-black text-slate-800 mb-8">Active Borrowings</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {dashboard?.borrowerActive?.map((loan) => {
              const isPending = loan.status === "Pending";
              const emiDoc = loan.emi || {};
              const schedule = emiDoc.emiSchedule || [];
              const nextIdx = schedule.findIndex(i => !i.paid);
              return (
                <div key={loan._id} className="bg-white shadow-xl rounded-[2.5rem] p-8 border border-slate-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Loan Amount</p>
                      <h4 className="text-3xl font-black text-slate-900">₹{loan.amount}</h4>
                    </div>
                    {isPending && (
                      <button onClick={() => handleCancelRequest(loan._id)} className="text-slate-400 hover:text-red-500 transition-colors"><FaTrashAlt /></button>
                    )}
                  </div>
                  {isPending && loan.offers?.length > 0 && (
                    <div className="mt-6 p-5 bg-indigo-50/50 rounded-3xl border-2 border-dashed border-indigo-100">
                      <p className="text-xs font-black text-indigo-600 uppercase mb-4 tracking-wider">Offers Received ({loan.offers.length})</p>
                      <div className="space-y-3">
                        {loan.offers.map((offer) => (
                          <div key={offer._id} className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                            <div><p className="font-bold text-slate-800">{offer.lender?.username || "Lender"}</p></div>
                            <button onClick={() => handleSelectLender(loan._id, offer.lender._id)} className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black">Accept</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {!isPending && (
                    <div className="mt-6 border-t border-slate-50 pt-6">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-4 text-center">Upcoming Installments</p>
                      <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                        {schedule.map((item, idx) => (
                          <div key={idx} className={`flex justify-between items-center p-3 rounded-2xl border ${item.paid ? 'bg-slate-50 opacity-60' : 'bg-white'}`}>
                            <div className="flex items-center gap-3">
                              <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black ${item.paid ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>{idx + 1}</span>
                              <p className="text-xs font-bold text-slate-900">{new Date(item.dueDate).toLocaleDateString()}</p>
                            </div>
                            <p className="text-sm font-black text-slate-900">₹{item.amount}</p>
                          </div>
                        ))}
                      </div>
                      <button
                        disabled={payingIndex === emiDoc._id || nextIdx === -1}
                        onClick={() => handlePayEMI(emiDoc._id, nextIdx)}
                        className="mt-6 w-full py-4 bg-emerald-600 text-white rounded-2xl font-black disabled:opacity-50"
                      >
                        {nextIdx !== -1 ? `Pay Installment #${nextIdx + 1} (₹${schedule[nextIdx]?.amount})` : "Processing Closure..."}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* --- ACTIVE INVESTMENTS --- */}
        <section>
          <h3 className="text-2xl font-black text-slate-800 mb-8">Active Investments</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {dashboard?.lenderActive?.map((loan) => (
              <div key={loan._id} className="bg-white shadow-xl rounded-[2.5rem] p-8 border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Borrower</p>
                    <h4 className="font-black text-xl text-slate-900">{loan.borrower?.username}</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-emerald-600 uppercase">Progress</p>
                    <p className="font-black text-slate-900">{loan.emiPaid}/{loan.tenure} Paid</p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex justify-between">
                  <span className="text-xs font-bold text-slate-500">Monthly Return</span>
                  <span className="text-xs font-black text-emerald-600">₹{loan.emiAmount}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- HISTORY SECTION (NEW) --- */}
        <section className="pt-16 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white text-sm">
              <FaHistory />
            </div>
            <h3 className="text-2xl font-black text-slate-800">Closed Records</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Borrowed History */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Borrowed (Settled)</p>
              <div className="space-y-4">
                {dashboard?.borrowerHistory?.length > 0 ? dashboard.borrowerHistory.map((loan) => (
                  <div key={loan._id} className="bg-white p-6 rounded-3xl border border-slate-100 flex justify-between items-center opacity-70 grayscale-[0.5]">
                    <div>
                      <p className="text-[10px] font-black text-emerald-600 uppercase">Fully Paid</p>
                      <h4 className="font-black text-lg text-slate-800">₹{loan.amount}</h4>
                      <p className="text-[10px] text-slate-400">Lender: {loan.lender?.username || 'Unknown'}</p>
                    </div>
                    <div className="text-emerald-500 text-2xl"><FaCheckCircle /></div>
                  </div>
                )) : (
                  <div className="p-8 border-2 border-dashed border-slate-100 rounded-3xl text-center text-slate-300 font-bold text-sm">No settled loans</div>
                )}
              </div>
            </div>

            {/* Lended History */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Investments (Recovered)</p>
              <div className="space-y-4">
                {dashboard?.lenderHistory?.length > 0 ? dashboard.lenderHistory.map((loan) => (
                  <div key={loan._id} className="bg-white p-6 rounded-3xl border border-slate-100 flex justify-between items-center opacity-70 grayscale-[0.5]">
                    <div>
                      <p className="text-[10px] font-black text-indigo-600 uppercase">Recovered</p>
                      <h4 className="font-black text-lg text-slate-800">₹{loan.amount}</h4>
                      <p className="text-[10px] text-slate-400">Borrower: {loan.borrower?.username || 'Unknown'}</p>
                    </div>
                    <div className="text-indigo-500 text-2xl"><FaCheckCircle /></div>
                  </div>
                )) : (
                  <div className="p-8 border-2 border-dashed border-slate-100 rounded-3xl text-center text-slate-300 font-bold text-sm">No recovered investments</div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* MARKETPLACE */}
        <section className="pt-16 border-t">
          <h3 className="text-2xl font-black text-slate-800 mb-8">Investment Marketplace</h3>
          <PendingLoanRequests onActionSuccess={fetchDashboard} />
        </section>
      </div>
    </div>
  );
};

export default LoanDashboard;