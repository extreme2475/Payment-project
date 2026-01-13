import React from 'react';
import { motion } from 'framer-motion';
import { Link } from "react-router-dom"; 

const Navbar = () => {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 w-full z-50 backdrop-blur-md bg-black/30 border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-black tracking-tighter bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
          NEXA PAY
        </div>

        {/* Links - Desktop Only */}
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
          <a href="#features" className="hover:text-blue-400 transition">Features</a>
          <a href="#founder" className="hover:text-blue-400 transition">Founder</a>
          <a href="#trust" className="hover:text-blue-400 transition">Security</a>
        </div>

        {/* Buttons - Right Corner */}
     <div className="flex items-center gap-4">
  {/* Login Link */}
  <Link to="/login">
    <button className="text-sm font-semibold hover:text-blue-400 transition hidden sm:block">
      Login
    </button>
  </Link>

  {/* Register Link */}
  <Link to="/register">
    <motion.button 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="bg-gradient-to-r from-blue-600 to-green-600 px-6 py-2.5 rounded-full text-sm font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)]"
    >
      Register Now
    </motion.button>
  </Link>
</div>
      </div>
    </motion.nav>
  );
};

export default Navbar;