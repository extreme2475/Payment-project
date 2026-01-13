import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="pt-20 pb-10 px-6 max-w-7xl mx-auto text-center">
      <div className="mb-12">
        <h2 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent inline-block">
          NEXA PAY
        </h2>
        <p className="text-gray-500 mt-4 max-w-xs mx-auto text-sm leading-relaxed">
          The future of digital finance is elegant. Experience it today.
        </p>
      </div>

      <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-gray-500 text-xs">© 2026 Nexa Pay. All rights reserved.</p>
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-gray-400 text-sm font-medium"
        >
          Made-<span className="text-red-500 mx-1"></span> by <span className="text-blue-400">Himanshu</span>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;