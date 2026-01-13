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

/* ---------------- RESPONSIVE NEEDLE COMPONENT ---------------- */
const Needle = ({ value, cx, cy, iR, oR }) => {
  // Score range 300 to 900 (Total 600 points) mapped to 180 to 0 degrees
  const angle = 180 - (180 * (value - 300)) / 600;
  const RADIAN = Math.PI / 180;
  const radius = iR + (oR - iR) * 0.5;
  
  // Calculate tip of the needle
  const x = cx + radius * Math.cos(-angle * RADIAN);
  const y = cy + radius * Math.sin(-angle * RADIAN);

  return (
    <g>
      <line
        x1={cx}
        y1={cy}
        x2={x}
        y2={y}
        stroke="#111827"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={8} fill="#111827" />
    </g>
  );
};

const CreditScoreDetail = () => {
  const [score, setScore] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <p className="text-gray-500 animate-pulse">Loading credit details...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* -------- SPEEDOMETER CARD -------- */}
        <div className="bg-white rounded-3xl shadow-lg p-6 flex flex-col items-center">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2 w-full text-center">
            Your Credit Score
          </h1>

          <div className="w-full h-[200px] sm:h-[280px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SPEEDOMETER_DATA}
                  cx="50%"
                  cy="100%"
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
                {/* Needle automatically adapts to the container center */}
                <Needle 
                    value={score} 
                    cx={window.innerWidth < 640 ? window.innerWidth / 2 - 16 : 512 / 2} // Adaptive CX calculation
                    cy={window.innerWidth < 640 ? 180 : 250} // Adaptive CY
                    iR={80} 
                    oR={160} 
                />
                {/* Note: For perfect needle positioning in Recharts responsive, 
                   it's better to pass dynamic CX/CY. Below we use the pie's own logic.
                */}
              </PieChart>
              {/* Better Approach for Responsive Needle: CSS Positioning */}
            </ResponsiveContainer>
            
            {/* Absolute Score Display overlaying the Gauge center */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
              <span className="text-3xl sm:text-5xl font-extrabold text-gray-800">{score}</span>
              <span className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
                {getScoreLabel(score)}
              </span>
            </div>
          </div>
          
          <p className="mt-4 text-xs sm:text-sm text-gray-400">Score Range: 300 – 900</p>
        </div>

        {/* -------- HISTORY CHART CARD -------- */}
        <div className="bg-white p-6 rounded-3xl shadow-lg">
          <h2 className="text-lg font-semibold text-gray-700 mb-6">Credit Score History</h2>
          <div className="w-full h-[250px] sm:h-[300px]">
            {history.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ left: -20, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }} 
                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  />
                  <YAxis domain={[300, 900]} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#4F46E5" 
                    strokeWidth={4} 
                    dot={{ r: 4, fill: '#4F46E5' }} 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 italic">No history available</div>
            )}
          </div>
        </div>

        {/* -------- HISTORY TABLE CARD -------- */}
        <div className="bg-white p-6 rounded-3xl shadow-lg overflow-hidden">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Credit Events</h2>
          {history.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Score</th>
                    <th className="px-4 py-3 font-medium">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[...history].reverse().map((h, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">{new Date(h.date).toLocaleDateString()}</td>
                      <td className="px-4 py-4">
                        <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md">{h.score}</span>
                      </td>
                      <td className="px-4 py-4 text-gray-600">{h.reason || "Monthly Update"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">No events recorded yet</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default CreditScoreDetail;