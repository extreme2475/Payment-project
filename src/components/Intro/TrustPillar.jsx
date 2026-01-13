import React from 'react';
import { motion } from 'framer-motion';

const TrustPillar = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20 text-center border-y border-white/5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
        {[
          { label: "Active Users", value: "10K+" },
          { label: "Security Level", value: "BANK-L" },
          { label: "Transactions", value: "1M+" },
          { label: "Uptime", value: "99.9%" },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            key={i}
          >
            <h3 className="text-3xl md:text-5xl font-black text-white">{stat.value}</h3>
            <p className="text-gray-500 uppercase tracking-widest text-xs mt-2">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TrustPillar;