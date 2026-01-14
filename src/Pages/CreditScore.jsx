import React, { useEffect, useState } from "react";
import api from "../api";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

/* ---------------- SPEEDOMETER CONFIG ---------------- */
const SPEEDOMETER_DATA = [
  { name: "Poor", value: 280, color: "#ef4444" },
  { name: "Fair", value: 90, color: "#f97316" },
  { name: "Good", value: 70, color: "#eab308" },
  { name: "Excellent", value: 160, color: "#22c55e" }
];

const getScoreLabel = (score) => {
  if (score < 580) return "Poor";
  if (score < 670) return "Fair";
  if (score < 740) return "Good";
  return "Excellent";
};

const CreditScoreDetail = () => {
  const [score, setScore] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const calculateRotation = (val) => {
    const clampedVal = Math.min(Math.max(val, 300), 900);
    // 300 score = -90deg, 900 score = 90deg
    return ((clampedVal - 300) / 600) * 180 - 90;
  };

  const fetchScore = async () => {
    try {
      const res = await api.get("/credit/me");
      setScore(res.data.score ?? 750);
    } catch (err) {
      console.error(err);
      setScore(750);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get("/credit/details");
      setHistory(res.data.history || []);
    } catch (err) {
      console.error(err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScore();
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center h-screen">
        <p className="text-gray-500 animate-pulse font-medium">Loading credit details...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen pb-10">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* -------- SPEEDOMETER CARD -------- */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
          <h1 className="text-base sm:text-lg font-bold text-slate-700 mb-2 w-full text-center">
            Your Credit Score
          </h1>

          {/* Wrapper: Restricted height to avoid huge white space */}
          <div className="relative w-full max-w-[400px] h-[220px] sm:h-[280px] flex items-center justify-center overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, left: 0, bottom: -100 }}>
                <Pie
                  data={SPEEDOMETER_DATA}
                  cx="50%"
                  cy="80%" 
                  startAngle={180}
                  endAngle={0}
                  innerRadius="75%"
                  outerRadius="100%"
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {SPEEDOMETER_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* NEEDLE - Positioned relative to the Pie's center point */}
            <div 
              className="absolute bottom-[20%] left-1/2 w-[4px] h-[45%] bg-slate-900 origin-bottom transition-transform duration-1000 ease-in-out rounded-full shadow-sm"
              style={{ 
                transform: `translateX(-50%) rotate(${calculateRotation(score)}deg)`,
                zIndex: 20
              }}
            >
              {/* Needle Base Circle */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-slate-900 rounded-full border-4 border-white shadow-md"></div>
            </div>

            {/* SCORE OVERLAY */}
            <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 text-center z-10">
              <span className="text-5xl sm:text-6xl font-black text-slate-800 block leading-tight">
                {score}
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-[0.2em]">
                {getScoreLabel(score)}
              </span>
            </div>
          </div>
          
          <p className="mt-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
            Score Range: 300 – 900
          </p>
        </div>

        {/* -------- HISTORY CHART CARD -------- */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-base font-bold text-slate-700 mb-6">Credit Score History</h2>
          <div className="w-full h-[250px]">
            {history.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ left: -20, right: 10, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  />
                  <YAxis domain={[300, 900]} hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#4F46E5" 
                    strokeWidth={4} 
                    dot={{ r: 5, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 7 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 italic font-medium">No history available</div>
            )}
          </div>
        </div>

        {/* -------- HISTORY TABLE CARD -------- */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <h2 className="text-base font-bold text-slate-700 p-6 pb-2">Credit Events</h2>
          {history.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[...history].reverse().map((h, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-600 whitespace-nowrap">{new Date(h.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className="font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-xs">{h.score}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium min-w-[150px]">{h.reason || "Monthly Update"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8 font-medium">No events recorded yet</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default CreditScoreDetail;