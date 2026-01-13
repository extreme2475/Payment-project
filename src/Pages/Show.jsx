import React from 'react';
import { motion } from 'framer-motion';

// Saare components ab active hain
import Navbar from '../components/Intro/Nav.jsx';
import Hero from '../components/Intro/Hero.jsx';
import Founder from '../components/Intro/Founder.jsx';
import FeaturesGalaxy from '../components/Intro/FeaturesGalaxy.jsx';
import TrustPillar from '../components/Intro/TrustPillar.jsx';
import Footer from '../components/Intro/Footer.jsx';

const Show = () => {
  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-x-hidden">
      
      {/* 1. Navbar - Sticky Glassmorphism */}
      <Navbar />

      <main>
        {/* 2. Hero - Animated Image Loop & Intro */}
        <section id="hero" className="w-full">
          <Hero />
        </section>

        {/* 3. Founder - Himanshu's Personal Brand Section */}
        <section id="founder" className="py-20 px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <Founder />
          </motion.div>
        </section>

        {/* 4. Features - Interactive Galaxy Grid */}
        <section id="features" className="py-20 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent">
          <FeaturesGalaxy />
        </section>

        {/* 5. Trust - Stats & Security Pillars */}
        <section id="trust" className="py-20">
          <TrustPillar />
        </section>
      </main>

      {/* 6. Footer - Professional Finish */}
      <Footer />

      {/* BACKGROUND DECORATION - Isse Depth aayegi */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
        {/* Blue Glow */}
        <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
        {/* Green Glow */}
        <div className="absolute bottom-[20%] right-[-5%] w-[400px] h-[400px] bg-green-600/10 rounded-full blur-[100px]"></div>
        {/* Extra Center Glow for Smoothness */}
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-purple-600/5 rounded-full blur-[100px]"></div>
      </div>
      
    </div>
  );
};

export default Show;