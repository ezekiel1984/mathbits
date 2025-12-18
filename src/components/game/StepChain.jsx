import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import BigButton from "@/components/ui/BigButton";

export default function StepChain({ steps, currentStep, onNext }) {
  // steps is array of strings e.g. ["Count 2 apples", "Add 2 more"]
  
  if (!steps || steps.length === 0) return null;

  return (
    <div className="w-full bg-white/80 rounded-2xl p-4 backdrop-blur-sm border-2 border-dashed border-slate-200 my-4">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-bold text-slate-400 uppercase">Step-by-Step</span>
        <span className="text-xs font-bold text-sky-500">{currentStep + 1} / {steps.length}</span>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isFuture = index > currentStep;

          return (
            <motion.div
              key={index}
              initial={false}
              animate={{ 
                opacity: isFuture ? 0.3 : 1,
                scale: isCurrent ? 1.05 : 1
              }}
              className={`
                flex items-center gap-3 p-3 rounded-xl transition-all
                ${isCompleted ? "bg-emerald-50 text-emerald-700" : ""}
                ${isCurrent ? "bg-sky-100 text-sky-800 ring-2 ring-sky-200" : ""}
                ${isFuture ? "bg-slate-50 text-slate-400" : ""}
              `}
            >
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                ${isCompleted ? "bg-emerald-200" : isCurrent ? "bg-sky-200" : "bg-slate-200"}
              `}>
                {isCompleted ? <Check className="w-3 h-3" /> : index + 1}
              </div>
              <span className="font-medium text-lg leading-tight">{step}</span>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 flex justify-end">
        {currentStep < steps.length && (
          <BigButton 
            onClick={onNext} 
            variant="primary" 
            className="py-3 px-6 text-sm"
            icon={ArrowRight}
          >
            Next Step
          </BigButton>
        )}
      </div>
    </div>
  );
}