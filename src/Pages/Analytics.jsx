import React, { useEffect, useState } from "react";
import api from "../api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
  CartesianGrid, Legend, AreaChart, Area
} from "recharts";
import { FaChartBar, FaChartLine, FaChartPie, FaExchangeAlt } from "react-icons/fa";

const COLORS = ["#4F46E5", "#22C55E", "#F97316", "#EF4444"];

const Analytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/analytics/money").then(res => setData(res.data));
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-8">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Money Analytics
          </h1>
          <p className="text-slate-500 font-medium mt-2">Visualizing your financial flow and transaction success.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 1️⃣ Daily Spending (Bar) */}
          <ChartBox title="Daily Spending" icon={<FaChartBar className="text-orange-500" />}>
            <BarChart data={data.spending}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#FDBA74" />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
              <Tooltip cursor={{fill: '#F1F5F9'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
              <Bar dataKey="amount" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartBox>

          {/* 2️⃣ Spending Trend (Area) */}
          <ChartBox title="Spending Trend" icon={<FaChartLine className="text-indigo-600" />}>
            <AreaChart data={data.spending}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
              <Tooltip contentStyle={{borderRadius: '16px', border: 'none'}} />
              <Area type="monotone" dataKey="amount" stroke="#4F46E5" fill="url(#areaGradient)" strokeWidth={3} />
            </AreaChart>
          </ChartBox>

          {/* 3️⃣ Cash Flow (Line) */}
          <ChartBox title="Sent vs Received" icon={<FaExchangeAlt className="text-slate-400" />}>
            <LineChart data={data.cashFlow}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
              <Tooltip contentStyle={{borderRadius: '16px', border: 'none'}} />
              <Legend verticalAlign="top" align="right" iconType="circle" />
              <Line type="monotone" dataKey="sent" stroke="#F97316" strokeWidth={3} dot={{ r: 4, fill: '#F97316' }} />
              <Line type="monotone" dataKey="received" stroke="#22C55E" strokeWidth={3} dot={{ r: 4, fill: '#22C55E' }} />
            </LineChart>
          </ChartBox>

          {/* 4️⃣ Success vs Failure (Pie) */}
          <ChartBox title="Transaction Health" icon={<FaChartPie className="text-indigo-500" />}>
            <PieChart>
              <Pie
                data={data.successFailure}
                dataKey="count"
                nameKey="status"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                stroke="none"
              >
                {data.successFailure.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} cornerRadius={8} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ChartBox>

        </div>
      </div>
    </div>
  );
};

// Reusable Chart Container to keep the UI consistent
const ChartBox = ({ title, icon, children }) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 transition-all hover:shadow-md">
    <div className="flex items-center gap-3 mb-8">
      <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
      <h2 className="text-xl font-black text-slate-800 tracking-tight">{title}</h2>
    </div>
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  </div>
);

export default Analytics;