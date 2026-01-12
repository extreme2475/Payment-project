import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import logo from "../assets/yo.webp";
// Added icons for a more professional feel
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const Login = ({ setIsAuthenticated, setUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Added for UX
  const [loading, setLoading] = useState(false); // Added for UX

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    try {
      const res = await api.post("/users/login", {
        email: formData.email,
        password: formData.password,
      });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        setIsAuthenticated(true);
        if (setUser) setUser(res.data.user);

        setMessage("✅ Login successful!");
        navigate("/dashboard");
      } else {
        setMessage("❌ No token received. Check backend response.");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Login failed!");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {/* Background decoration for a "Fintech" vibe */}
      <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600" />
      
      <div className="max-w-md w-full bg-white shadow-2xl rounded-[2rem] p-10 border border-gray-100">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="NEXA PAY Logo" className="h-16 w-auto mb-4 drop-shadow-sm" />
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-gray-400 text-sm mt-2 text-center">
            Access your NEXA PAY dashboard safely
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Email Address</label>
            <div className="relative group">
              <FaEnvelope className="absolute left-4 top-4 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@company.com"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium text-gray-700"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <div className="flex justify-between items-center px-1">
               <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
               <Link to="/help" className="text-[11px] text-indigo-600 hover:underline font-bold">Forgot?</Link>
            </div>
            <div className="relative group">
              <FaLock className="absolute left-4 top-4 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium text-gray-700"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-gray-400 hover:text-indigo-600 transition-colors"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 mt-2 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
              loading 
                ? "bg-indigo-400 cursor-wait" 
                : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200"
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : "Secure Login"}
          </button>
        </form>

        {/* Message */}
        {message && (
          <div className={`mt-6 p-3 rounded-xl text-center text-xs font-bold animate-pulse ${
            message.includes("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}>
            {message}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-50 text-center">
          <p className="text-gray-500 text-sm">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors"
            >
              Get Started
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;