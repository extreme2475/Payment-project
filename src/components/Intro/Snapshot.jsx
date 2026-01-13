import React from 'react';
import { motion } from 'framer-motion';
import one from '../../assets/one.png';
import two from '../../assets/two.png';
import three from '../../assets/three.png';
import four from '../../assets/four.png';
import five from '../../assets/five.png';        
const projectImages = [
  one,
  two,
  three,
  four,
  five
];

const ProjectSnapshots = () => {
  const duplicatedImages = [...projectImages, ...projectImages];

  return (
    <div id="snapshots" className="py-20 bg-transparent overflow-hidden relative group">
      {/* Section Header */}
      <div className="text-center mb-12 px-6">
        <motion.h3 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-sm md:text-lg font-bold text-blue-400 uppercase tracking-[0.5em] mb-2"
        >
          Visual Experience
        </motion.h3>
        <h2 className="text-3xl md:text-5xl font-black text-white">Nexa Interface</h2>
      </div>

      {/* Main Slider Container */}
      <div className="flex relative items-center">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 35, // Thoda slow kiya taaki images clearly dikhein
            repeat: Infinity,
            ease: "linear",
          }}
          // Hover karne par slider slow ho jayega (Super smooth experience)
          className="flex gap-4 md:gap-10 px-4"
        >
          {duplicatedImages.map((img, index) => (
            <motion.div
              key={index}
              whileHover={{ 
                scale: 1.02, 
                rotateY: 5, // Subtle 3D tilt
                translateZ: 20 
              }}
              className="relative w-[280px] sm:w-[350px] md:w-[500px] aspect-video flex-shrink-0 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl transition-all duration-500 cursor-none"
              style={{ perspective: "1000px" }}
            >
              <img 
                src={img} 
                className="w-full h-full object-cover brightness-75 group-hover:brightness-100 transition-all duration-700" 
                alt={`Nexa Snapshot ${index}`} 
              />
              
              {/* Intelligent Overlay: Sirf Hover par text aur glow dikhega */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                <span className="text-xs md:text-sm font-mono text-blue-300 bg-blue-500/10 backdrop-blur-md px-3 py-1 rounded-full border border-blue-500/20">
                  Dashboard_v2
                </span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">Nexa Pay ©</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Cinematic Side Blurs (Important for Professionalism) */}
        <div className="absolute inset-y-0 left-0 w-[10%] md:w-[20%] bg-gradient-to-r from-[#050505] to-transparent z-20 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-[10%] md:w-[20%] bg-gradient-to-l from-[#050505] to-transparent z-20 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default ProjectSnapshots;