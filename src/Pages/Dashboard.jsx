import React, { useState, useEffect } from "react";
import Navbar from "../components/Navabar/Navbar.jsx";
import api from "../api";
import { Link, useNavigate } from "react-router-dom"; 
import {
  PaymentMadeCard,
  WalletValueCard,
  SuccessRateCard,
  RecentPaymentCard,
  RecentTransactionCard,
  SchedulePaymentCard,
  LoanRequestCard,
  UpcomingOptionsCard,
} from "../components/Cards/DashboardCard.jsx";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { FaArrowRight, FaChartLine } from "react-icons/fa";

const Dashboard = () => {
  const [username, setUsername] = useState("");
  const [summary, setSummary] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [activeScheduledCount, setActiveScheduledCount] = useState(0);
  const [activeLoanCount, setActiveLoanCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [userRes, summaryRes, analyticsRes, loanRes, scheduleRes] = await Promise.all([
          api.get("/users/me"),
          api.get("/dashboard/summary"),
          api.get("/analytics/money"),
          api.get("/loan-dash/loan"),
          api.get("/schedule/active")
        ]);

        setUsername(userRes.data.user.username);
        setSummary(summaryRes.data);
        setAnalyticsData(analyticsRes.data);
        
        const activeBorrowing = loanRes.data.borrower?.loans?.filter(l => l.status === "Active" || l.status === "Ongoing").length || 0;
        const activeLending = loanRes.data.lender?.loans?.filter(l => l.status === "Active" || l.status === "Ongoing").length || 0;
        setActiveLoanCount(activeBorrowing + activeLending);
        setActiveScheduledCount(scheduleRes.data.count);

      } catch (err) {
        console.error("Dashboard Load Error:", err);
        if (err.response?.status === 401) navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white fixed inset-0 z-[1000]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-indigo-600 font-black tracking-widest uppercase text-xs animate-pulse">Synchronizing Nexa Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-[#F8FAFC]">
      {/* Navbar links set to empty array to clean up the header */}
      <Navbar links={[]} />

      <main className="pt-32 pb-12 px-6 lg:px-10 max-w-[1600px] mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              Hello, <span className="text-indigo-600 uppercase">{username || "User"}</span> 👋
            </h1>
            <p className="mt-2 text-gray-500 font-medium text-lg">Here is what's happening with your account today.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/payments"><PaymentMadeCard count={summary?.totalPayments || 0} /></Link>
          <Link to="/wallet"><WalletValueCard amount={summary?.walletBalance || 0} /></Link>
          <Link to="/analytics"><SuccessRateCard rate={summary?.successRate || 0} /></Link>
          <Link to="/payments"><RecentPaymentCard payment={summary?.recentPayment} /></Link>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
               <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FaChartLine /></div>
               <h2 className="text-xl font-black text-gray-800 tracking-tight">Spending Trend</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData?.spending || []}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 'bold'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 'bold'}} />
                <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="amount" stroke="#4F46E5" fill="url(#areaGradient)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-800 tracking-tight">Activity</h2>
              <Link to="/payments" className="text-indigo-600 text-xs font-black uppercase tracking-widest flex items-center gap-1">History <FaArrowRight /></Link>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
               <RecentTransactionCard transactions={summary?.recentTransactions || []} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
          <Link to="/time"><SchedulePaymentCard count={activeScheduledCount} /></Link>
          <Link to="/loansdash"><LoanRequestCard activeCount={activeLoanCount} /></Link>
          <UpcomingOptionsCard />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;