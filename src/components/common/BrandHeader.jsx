import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";

export default function BrandHeader({ isHighContrast }) {
  const textColor = isHighContrast ? "text-yellow-400" : "text-slate-800";
  
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`sticky top-0 z-40 w-full backdrop-blur-md border-b ${
        isHighContrast 
          ? "bg-slate-900/90 border-yellow-400/20" 
          : "bg-white/80 border-slate-100"
      }`}
    >
      <div className="max-w-md md:max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to={createPageUrl('Home')} className="flex items-center gap-3 group">
          <div className="relative w-10 h-10">
             <img 
               src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6943cd50422bb5e9998a81f4/158ba1973_20251219_1510_MinimalisticMathIcon_remix_01kctctz0gfw2r93yvjvc3j675.png" 
               alt="MathBits"
               className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
             />
          </div>
          <span className={`text-xl font-black tracking-tight ${textColor}`}>
            Math<span className={isHighContrast ? "text-white" : "text-[hsl(191,75%,29%)]"}>Bits</span>
          </span>
        </Link>
      </div>
    </motion.header>
  );
}