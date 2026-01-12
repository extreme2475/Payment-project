import React, { useEffect, useState } from "react";
import api from "../api";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
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

/* ---------------- NEEDLE COMPONENT ---------------- */
const Needle = ({ value, cx, cy, radius }) => {
  const angle = (180 * (value - 300)) / 600;
  const radian = (Math.PI * (180 - angle)) / 180;

  const x = cx + radius * Math.cos(radian);
  const y = cy - radius * Math.sin(radian);

  return (
    <g>
      <line
        x1={cx}
        y1={cy}
        x2={x}
        y2={y}
        stroke="#111827"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={6} fill="#111827" />
    </g>
  );
};

/* ---------------- MAIN COMPONENT ---------------- */
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
      <div className="max-w-5xl mx-auto p-4 py-8 space-y-8">

        {/* -------- SPEEDOMETER -------- */}
        <div className="bg-white rounded-3xl shadow-xl p-6 flex flex-col items-center">
          <h1 className="text-xl font-semibold text-gray-700 mb-4 w-full text-center">
            Your Credit Score
          </h1>

          {/* Container with a fixed Max Width to prevent the gauge from becoming gigantic on laptop */}
          <div className="w-full max-w-md aspect-[2/1] relative">
            <ResponsiveContainer width="100%" height="100%">
              {/* Added margin={{top:0, right:0, bottom:0, left:0}} to remove default padding */}
              <PieChart viewBox="0 0 500 250" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={SPEEDOMETER_DATA}
                  startAngle={180}
                  endAngle={0}
                  innerRadius={140}
                  outerRadius={200}
                  dataKey="value"
                  cx={250} // 250 is the center of 500
                  cy={240} // Centered at the bottom of the 250 height
                  paddingAngle={2}
                  stroke="none"
                >
                  {SPEEDOMETER_DATA.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>

                <Needle
                  value={score}
                  cx={250}   
                  cy={240}   
                  radius={160}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center mt-[-20px]"> {/* Pull text up slightly as the SVG has empty bottom space */}
            <p className="text-4xl font-bold text-gray-800">{score}</p>
            <p className="text-sm text-gray-500">
              {getScoreLabel(score)} • Range 300 – 900
            </p>
          </div>
        </div>

        {/* -------- HISTORY CHART -------- */}
        <div className="bg-white p-6 rounded-3xl shadow-xl">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Credit Score History</h2>
          {history.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[300, 900]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center">No history available</p>
          )}
        </div>

        {/* -------- HISTORY TABLE -------- */}
        <div className="bg-white p-6 rounded-3xl shadow-xl">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Credit Events</h2>
          {history.length ? (
            <table className="w-full text-sm text-gray-700">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">Date</th>
                  <th className="py-2 text-left">Score</th>
                  <th className="py-2 text-left">Reason</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, idx) => (
                  <tr key={idx} className="border-b last:border-none">
                    <td className="py-2">{new Date(h.date).toLocaleDateString()}</td>
                    <td className="py-2 font-bold">{h.score}</td>
                    <td className="py-2">{h.reason || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-400 text-center">No credit events recorded yet</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default CreditScoreDetail;