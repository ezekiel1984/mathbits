import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowDown, HelpCircle, Flag, Target } from 'lucide-react';
import BigButton from "@/components/ui/BigButton";

export default function StepChain({ goal, steps, answer, expandedDefault = true }) {
  const [isExpanded, setIsExpanded] = useState(expandedDefault);

  useEffect(() => {
    setIsExpanded(expandedDefault);
  }, [expandedDefault]);

  if (!steps || steps.length === 0) return null;

  if (!isExpanded) {
    return (
      <button 
        onClick={() => setIsExpanded(true)}
        className="mx-auto flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-600 rounded-full font-bold hover:bg-sky-100 transition-colors my-4 text-sm"
      >
        <HelpCircle className="w-4 h-4" />
        Need steps?
      </button>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto bg-white/60 backdrop-blur-sm rounded-3xl p-6 border-2 border-slate-100 my-4 relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Solution Path</span>
        <button 
          onClick={() => setIsExpanded(false)}
          className="text-xs font-bold text-sky-500 hover:text-sky-600"
        >
          Hide
        </button>
      </div>

      <div className="relative">
        {/* Connecting Line */}
        <div className="absolute left-[19px] top-4 bottom-4 w-1 bg-slate-200 -z-10" />

        <div className="space-y-6">
          {/* Goal */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-lg shadow-slate-200 z-10">
              <Flag className="w-5 h-5" />
            </div>
            <div className="pt-2">
              <p className="font-bold text-slate-800 text-sm leading-tight">{goal}</p>
            </div>
          </motion.div>

          {/* Steps */}
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-white border-4 border-sky-200 text-sky-600 flex items-center justify-center font-black text-sm shrink-0 z-10">
                {index + 1}
              </div>
              <div className="pt-2 bg-white/80 rounded-xl p-3 border border-slate-100 shadow-sm w-full">
                <p className="font-medium text-slate-700 text-sm leading-snug">{step}</p>
              </div>
            </motion.div>
          ))}

          {/* Answer (Hidden/Target) */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: steps.length * 0.1 }}
            className="flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center shrink-0 border-4 border-white shadow-sm z-10">
              <Target className="w-5 h-5" />
            </div>
            <div className="pt-2">
              <p className="font-bold text-emerald-600 text-sm">Final Answer</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}