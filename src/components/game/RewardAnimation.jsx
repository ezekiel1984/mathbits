import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RewardAnimation({ show, intensity = 3, onComplete }) {
  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  // Intensity map for particle count
  const particleCount = {
    1: 0,
    2: 20,
    3: 50,
    4: 100,
    5: 200
  }[intensity] || 50;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
      {intensity > 1 && (
        <div className="absolute inset-0">
          {[...Array(particleCount)].map((_, i) => (
            <Particle key={i} />
          ))}
        </div>
      )}
      
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, rotate: [0, -10, 10, 0] }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.6 }}
          className="bg-white p-8 rounded-full shadow-2xl border-4 border-sky-100 flex flex-col items-center relative z-10"
        >
          <span className="text-6xl mb-2">🎉</span>
          <span className="text-2xl font-black text-sky-500 uppercase tracking-widest">Great!</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Particle() {
  // Random start position
  const xStart = Math.random() * 100; // vw
  // Random colors
  const colors = ['#FFC700', '#FF0000', '#2E3192', '#41BBC7', '#34D399', '#F472B6'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  return (
    <motion.div
      initial={{ 
        y: -20, 
        x: `${xStart}vw`,
        rotate: 0,
        opacity: 1 
      }}
      animate={{ 
        y: "110vh", 
        x: `${xStart + (Math.random() * 20 - 10)}vw`, // Slight drift
        rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
        opacity: 0
      }}
      transition={{ 
        duration: 2 + Math.random() * 2, 
        ease: "linear",
        repeat: 0 
      }}
      className="absolute top-0 w-3 h-3 rounded-sm"
      style={{ backgroundColor: color }}
    />
  );
}