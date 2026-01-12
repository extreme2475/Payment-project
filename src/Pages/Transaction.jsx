import React, { useEffect, useState } from "react";
import api from "../api";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get("/transactions");
        setTransactions(res.data.transactions);
      } catch (err) {
        console.error("Failed to load transactions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header Section */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">History</h1>
            <p className="text-sm text-gray-500 font-medium">Last 90 days of activity</p>
          </div>
          <button className="bg-white border border-gray-200 p-2 rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 bg-gray-200 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : transactions.length ? (
          <div className="space-y-6">
            {/* Note: In a real app, you would .reduce() to group by date */}
            <div className="space-y-3">
              {transactions.map((tx) => {
                const isSent = tx.amount < 0;
                const person = isSent ? tx.receiver : tx.sender;

                return (
                  <div
                    key={tx._id}
                    className="group bg-white rounded-[1.5rem] p-4 flex items-center justify-between border border-transparent hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar with Directional Indicator */}
                      <div className="relative">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                          isSent ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                        }`}>
                          {person.username.charAt(0).toUpperCase()}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] ${
                          isSent ? "bg-rose-500" : "bg-emerald-500"
                        } text-white`}>
                          {isSent ? "↑" : "↓"}
                        </div>
                      </div>

                      <div>
                        <p className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                          {isSent ? person.username : person.username}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                           <span>{new Date(tx.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                           <span>•</span>
                           <span>{person.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-lg font-black ${
                        isSent ? "text-gray-900" : "text-emerald-600"
                      }`}>
                        {isSent ? "-" : "+"} ₹{Math.abs(tx.amount).toLocaleString()}
                      </p>
                      <p className="text-[10px] font-bold text-gray-300 uppercase">Successful</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100">
            <div className="text-4xl mb-4">💳</div>
            <p className="text-gray-500 font-medium">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;