import React from 'react';
import { motion } from 'framer-motion';
import him from '../../assets/him.png';

const Founder = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24 flex flex-col md:flex-row items-center gap-16">
      {/* Animated Image Wrapper */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative group"
      >
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-green-600 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        <motion.div 
          animate={{ borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "30% 60% 70% 40% / 50% 60% 30% 60%", "40% 60% 70% 30% / 40% 50% 60% 50%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-72 h-72 md:w-96 md:h-96 overflow-hidden border-4 border-white/10 shadow-2xl"
        >
          <img 
            src={him} 
            alt="Founder" 
            className="w-full h-full object-cover scale-110"
          />
        </motion.div>
      </motion.div>

      {/* Content Side */}
      <div className="flex-1 space-y-6 text-center md:text-left">
        <motion.span 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-blue-400 font-bold tracking-widest uppercase text-sm"
        >
          The Visionary behind Nexa Pay
        </motion.span>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black"
        >
          Hi, I’m <span className="text-white underline decoration-green-500/50">Himanshu</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-gray-400 text-lg leading-relaxed"
        >
          "I started Nexa Pay with a simple goal: to make digital finance as aesthetic as it is functional. No more cluttered dashboards—just pure, seamless money management."
        </motion.p>
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <h4 className="font-bold text-green-400">My Inspiration</h4>
            <p className="text-xs text-gray-500">To bridge the gap between complex banking and modern UX.</p>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <h4 className="font-bold text-blue-400">Our Future</h4>
            <p className="text-xs text-gray-500">Building a world where payments are instant and invisible.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Founder;