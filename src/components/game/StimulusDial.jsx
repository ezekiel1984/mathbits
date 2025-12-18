import React from 'react';
import { Volume2, Volume1, VolumeX, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StimulusDial({ value, onChange, isHighContrast }) {
  // value is 1-5
  
  const levels = [
    { level: 1, label: "Calm", icon: VolumeX, color: "bg-slate-200 text-slate-500" },
    { level: 2, label: "Low", icon: Volume1, color: "bg-emerald-200 text-emerald-700" },
    { level: 3, label: "Medium", icon: Volume2, color: "bg-sky-200 text-sky-700" },
    { level: 4, label: "High", icon: Volume2, color: "bg-indigo-200 text-indigo-700" },
    { level: 5, label: "Party", icon: Sparkles, color: "bg-pink-200 text-pink-700" }
  ];

  return (
    <div className="w-full bg-white/50 rounded-2xl p-4 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Stimulus Level</span>
        <span className="text-sm font-bold text-slate-600">{levels[value-1]?.label}</span>
      </div>
      
      <div className="flex justify-between gap-2">
        {levels.map((lvl) => {
          const Icon = lvl.icon;
          const isActive = value >= lvl.level;
          const isSelected = value === lvl.level;
          
          return (
            <motion.button
              key={lvl.level}
              whileTap={{ scale: 0.9 }}
              onClick={() => onChange(lvl.level)}
              className={`
                relative flex-1 aspect-square rounded-xl flex items-center justify-center transition-all duration-300
                ${isActive ? lvl.color : "bg-slate-100 text-slate-300"}
                ${isSelected ? "ring-4 ring-offset-2 ring-sky-200 shadow-lg scale-105 z-10" : "scale-100"}
              `}
            >
              <Icon className={`w-6 h-6 ${isSelected ? "animate-pulse" : ""}`} />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}