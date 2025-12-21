import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import MathBitsCompanion, { COMPANIONS } from './MathBitsCompanion';

export default function AvatarSelector({ selectedCompanionId, onSelect }) {
  // Fallback to first if invalid ID
  const activeId = COMPANIONS.find(c => c.id === selectedCompanionId) ? selectedCompanionId : 'blocky';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
         <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Choose Companion</label>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {COMPANIONS.map((companion) => {
          const isSelected = activeId === companion.id;
          
          return (
            <motion.button
              key={companion.id}
              onClick={() => onSelect(companion.id)}
              whileTap={{ scale: 0.98 }}
              className={`
                relative p-4 rounded-3xl border-2 text-left transition-all duration-300 flex items-center gap-4
                ${isSelected 
                  ? "bg-white border-sky-400 shadow-md ring-4 ring-sky-50" 
                  : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"}
              `}
            >
              <div className="shrink-0">
                 <MathBitsCompanion id={companion.id} size="md" />
              </div>

              <div className="flex-1">
                  <div className="flex items-center gap-2">
                      <h3 className={`font-bold text-lg ${companion.color}`}>{companion.name}</h3>
                      {isSelected && <Check className="w-5 h-5 text-sky-500" />}
                  </div>
                  <p className="text-slate-500 text-sm leading-tight mt-1">{companion.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}