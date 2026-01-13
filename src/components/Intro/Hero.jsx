import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Link import kiya hai agar aap React Router use kar rahe hain
import { Link } from 'react-router-dom'; 

import gggg from '../../assets/gggg.png';
import humm from '../../assets/humm.png';
import oooo from '../../assets/oooo.png';
import kkkk from '../../assets/ll.png';

const images = [gggg, humm, oooo, kkkk];

const Hero = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
      {/* Left: Content */}
      <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
        <motion.h1 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-5xl md:text-7xl font-black leading-tight"
        >
          Future of <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
            Digital Money
          </span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto lg:mx-0"
        >
          Experience the most aesthetic and secure way to manage your payments, analytics, and loans in one place.
        </motion.p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          {/* Linked to Register Page */}
          <Link to="/register" className="w-full sm:w-auto">
            <button className="w-full bg-white text-black px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-400 transition-all duration-300">
              Get Started Free
            </button>
          </Link>

          {/* Linked to Snapshot Section (id="snapshots") */}
          <a href="#snapshots" className="w-full sm:w-auto">
            <button className="w-full border border-gray-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/5 transition">
              Watch Demo
            </button>
          </a>
        </div>
      </div>

      {/* Right: Animated Image Box */}
      <div className="lg:w-1/2 w-full h-[400px] md:h-[500px] relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-[2.5rem] blur-3xl -z-10"></div>
        <div className="w-full h-full rounded-[2.5rem] border border-white/10 overflow-hidden relative shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.img
              key={current}
              src={images[current]}
              initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
          {/* Subtle Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;