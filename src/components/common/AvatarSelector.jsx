import React from 'react';
import MathBitsCompanion, { COMPANIONS } from "@/components/common/MathBitsCompanion";
import { Check } from 'lucide-react';

export default function AvatarSelector({ selectedCompanionId, onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {COMPANIONS.map((companion) => {
        const isSelected = selectedCompanionId === companion.id;
        
        return (
          <button
            key={companion.id}
            onClick={() => onSelect(companion.id)}
            className={`
              relative flex items-center gap-4 p-4 rounded-3xl border-2 text-left transition-all duration-300 outline-none
              ${isSelected 
                ? "border-[hsl(191,75%,29%)] bg-sky-50 shadow-md scale-[1.02]" 
                : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"}
            `}
          >
            {/* Visual */}
            <div className="shrink-0">
               <MathBitsCompanion 
                  id={companion.id} 
                  size="sm" 
                  state={isSelected ? 'happy' : 'idle'} 
                  stimulusLevel={2} // Always animate a little bit in selector
               />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
               <h3 className={`font-bold text-lg ${isSelected ? 'text-[hsl(191,75%,29%)]' : 'text-slate-700'}`}>
                 {companion.name}
               </h3>
               <p className="text-xs text-slate-500 font-medium leading-snug">
                 {companion.description}
               </p>
            </div>

            {/* Checkmark */}
            {isSelected && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-[hsl(191,75%,29%)] text-white rounded-full flex items-center justify-center shadow-sm">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}