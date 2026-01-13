import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import logo from "../assets/yo.webp";
import { 
  FaUser, 
  FaEnvelope, 
  FaPhoneAlt, 
  FaLock, 
  FaShieldAlt, 
  FaCheckCircle 
} from "react-icons/fa";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    walletPin: "",
    confirmWalletPin: "",
  });
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSendOTP = async () => {
    try {
      const normalizedPhone = formData.phone.replace(/\D/g, "");
      const res = await axios.post(
        "https://payment-project-p4z6.onrender.com/api/users/send-otp",
        { phone: normalizedPhone }
      );
      setOtpSent(true);
      setMessage("📩 OTP sent to your phone");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const normalizedPhone = formData.phone.replace(/\D/g, "");
      const res = await axios.post("https://payment-project-p4z6.onrender.com/api/users/verify-otp", {
        phone: normalizedPhone,
        otp,
      });
      if (res.data.message.includes("successfully")) {
        setOtpVerified(true);
        setMessage("✅ Phone verified!");
      } else setMessage("❌ Invalid OTP");
    } catch (err) {
      setMessage(err.response?.data?.message || "OTP verification failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpVerified) return setMessage("❌ Verify your phone first!");
    if (formData.password !== formData.confirmPassword)
      return setMessage("❌ Passwords do not match!");
    if (formData.walletPin !== formData.confirmWalletPin)
      return setMessage("❌ Wallet PINs do not match!");
    if (formData.walletPin.length < 4 || formData.walletPin.length > 6)
      return setMessage("❌ Wallet PIN must be 4-6 digits");

    setLoading(true);
    try {
      const res = await axios.post("https://payment-project-p4z6.onrender.com/api/users/register", {
        username: formData.fullName,
        email: formData.email,
        phone: formData.phone.replace(/\D/g, ""),
        password: formData.password,
        walletPin: formData.walletPin,
      });
      setMessage("✅ Registration Successful!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-lg w-full bg-white shadow-2xl rounded-[2.5rem] p-10 border border-gray-100">
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="NEXA PAY Logo" className="h-14 w-auto mb-4" />
          <h2 className="text-3xl font-black text-gray-900">Join Nexa Pay</h2>
          <p className="text-gray-400 text-sm mt-1">Experience the future of digital finance</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Info Group */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FaUser className="absolute left-4 top-4 text-gray-300" />
              <input
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                required
              />
            </div>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-4 text-gray-300" />
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Phone & OTP Group */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <FaPhoneAlt className="absolute left-4 top-4 text-gray-300" />
                <input
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${otpVerified ? 'border-green-500 ring-1 ring-green-100' : 'border-gray-200'}`}
                  required
                />
                {otpVerified && <FaCheckCircle className="absolute right-4 top-4 text-green-500" />}
              </div>
              {!otpSent && !otpVerified && (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  className="px-6 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  Send OTP
                </button>
              )}
            </div>

            {otpSent && !otpVerified && (
              <div className="flex gap-2 animate-in slide-in-from-top-2 duration-300">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="flex-1 px-4 py-3 bg-white border-2 border-indigo-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  className="px-6 bg-yellow-500 text-white rounded-2xl font-bold text-sm hover:bg-yellow-600 transition-all shadow-lg shadow-yellow-100"
                >
                  Verify
                </button>
              </div>
            )}
          </div>

          {/* Security Group Header */}
          <div className="flex items-center gap-2 py-2">
            <div className="h-[1px] flex-1 bg-gray-100"></div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Security Credentials</span>
            <div className="h-[1px] flex-1 bg-gray-100"></div>
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FaLock className="absolute left-4 top-4 text-gray-300" />
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Account Password"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                required
              />
            </div>
            <div className="relative">
              <FaLock className="absolute left-4 top-4 text-gray-300" />
              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Wallet PINs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FaShieldAlt className="absolute left-4 top-4 text-gray-300" />
              <input
                name="walletPin"
                type="password"
                value={formData.walletPin}
                onChange={handleChange}
                placeholder="Wallet PIN (4-6)"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                required
              />
            </div>
            <div className="relative">
              <FaShieldAlt className="absolute left-4 top-4 text-gray-300" />
              <input
                name="confirmWalletPin"
                type="password"
                value={formData.confirmWalletPin}
                onChange={handleChange}
                placeholder="Confirm PIN"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!otpVerified || loading}
            className={`w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 mt-4 ${
              otpVerified && !loading
                ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"
                : "bg-gray-300 cursor-not-allowed shadow-none"
            }`}
          >
            {loading ? "Creating Account..." : "Create Free Account"}
          </button>
        </form>

        {message && (
          <div className={`mt-6 p-4 rounded-2xl text-center text-xs font-bold ${
            message.includes("✅") ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
          }`}>
            {message}
          </div>
        )}

        <p className="text-gray-400 text-center mt-8 text-sm">
          Already a member?{" "}
          <Link to="/login" className="text-indigo-600 font-black hover:text-indigo-800 transition-colors">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;