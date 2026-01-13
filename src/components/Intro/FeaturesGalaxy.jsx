import React from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  ShieldCheck, 
  PieChart, 
  Smartphone, 
  CalendarClock, 
  Banknote, 
  TrendingUp, 
  MessageSquareText 
} from 'lucide-react';

const features = [
  { title: "Smart Wallet", desc: "Instant transfers with zero latency.", icon: <CreditCard className="text-blue-400" size={32} /> },
  { title: "Fort-Knox Security", desc: "Military-grade 256-bit encryption.", icon: <ShieldCheck className="text-green-400" size={32} /> },
  { title: "Live Analytics", desc: "Track every penny in real-time.", icon: <PieChart className="text-purple-400" size={32} /> },
  { title: "Always Mobile", desc: "Access your money from anywhere.", icon: <Smartphone className="text-pink-400" size={32} /> },
  { title: "Scheduled Payments", desc: "Set your bills on autopilot mode.", icon: <CalendarClock className="text-orange-400" size={32} /> },
  { title: "Easy Loans", desc: "Get instant credit with minimal docs.", icon: <Banknote className="text-emerald-400" size={32} /> },
  { title: "Credit Score", desc: "Monitor and grow your financial health.", icon: <TrendingUp className="text-yellow-400" size={32} /> },
  { title: "Chat Service", desc: "24/7 priority support at your fingertips.", icon: <MessageSquareText className="text-cyan-400" size={32} /> },
];

const FeaturesGalaxy = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-black mb-4">Powerful Features</h2>
        <div className="h-1.5 w-24 bg-gradient-to-r from-blue-600 to-green-600 mx-auto rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -10 }}
            className="p-8 bg-white/5 border border-white/10 rounded-[2rem] relative group overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
            <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                {item.icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{item.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FeaturesGalaxy;