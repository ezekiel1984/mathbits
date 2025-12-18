import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';

export default function RewardAnimation({ show, intensity = 3, onComplete }) {
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  // Intensity map
  const config = {
    1: { numberOfPieces: 0, component: <MinimalReward /> }, // Calm
    2: { numberOfPieces: 20, gravity: 0.1 },
    3: { numberOfPieces: 100, gravity: 0.2 },
    4: { numberOfPieces: 300, gravity: 0.3 },
    5: { numberOfPieces: 500, gravity: 0.4, colors: ['#FFC700', '#FF0000', '#2E3192', '#41BBC7'] } // Party
  };

  const currentConfig = config[intensity] || config[3];

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {intensity > 1 && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          {...currentConfig}
        />
      )}
      
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, rotate: [0, -10, 10, 0] }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.6 }}
          className="bg-white p-8 rounded-full shadow-2xl border-4 border-sky-100 flex flex-col items-center"
        >
          <span className="text-6xl mb-2">🎉</span>
          <span className="text-2xl font-black text-sky-500 uppercase tracking-widest">Great!</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function MinimalReward() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-emerald-100 text-emerald-700 px-6 py-3 rounded-full font-bold text-xl"
    >
      Correct!
    </motion.div>
  );
}