import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function StepChain({ goal, steps, expandedDefault = true }) {
  const [isExpanded, setIsExpanded] = useState(expandedDefault);

  useEffect(() => {
    setIsExpanded(expandedDefault);
  }, [expandedDefault]);

  if (!steps || steps.length === 0) return null;

  return (
    <div className="w-full max-w-lg mx-auto my-6">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="mx-auto flex items-center justify-center gap-2 mb-4 text-slate-400 hover:text-sky-500 transition-colors text-sm font-bold uppercase tracking-wider"
      >
        <span>{isExpanded ? "Hide Solution Path" : "Show Solution Path"}</span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
             <div className="space-y-4 px-2 pb-2">
                {/* Steps as Cards */}
                {steps.map((step, index) => (
                    <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-4 items-center bg-white p-5 rounded-3xl shadow-sm border-2 border-slate-100"
                    >
                        <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-black text-lg shrink-0">
                            {index + 1}
                        </div>
                        <p className="text-slate-700 font-bold text-lg leading-snug">{step}</p>
                    </motion.div>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}