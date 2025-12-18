import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Apple, Star, Square, Circle, Hexagon } from 'lucide-react';

const icons = {
  apples: Apple,
  stars: Star,
  blocks: Square,
  numbers: Circle, // Fallback
  default: Circle
};

const colors = {
  apples: "text-red-500 fill-red-200",
  stars: "text-amber-400 fill-amber-200",
  blocks: "text-blue-500 fill-blue-200",
  numbers: "text-slate-500 fill-slate-200",
  default: "text-slate-500 fill-slate-200"
};

export default function VisualCounter({ 
  count, 
  type = 'default', 
  highlightIndices = [], // Array of indices to highlight
  onItemClick,
  size = "md" 
}) {
  const Icon = icons[type] || icons.default;
  const colorClass = colors[type] || colors.default;
  
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  return (
    <div className="flex flex-wrap justify-center gap-4 p-4 min-h-[100px] items-center">
      <AnimatePresence>
        {[...Array(count)].map((_, i) => {
          const isHighlighted = highlightIndices.includes(i);
          
          return (
            <motion.button
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                y: isHighlighted ? -10 : 0
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: i * 0.1, type: "spring" }}
              whileTap={{ scale: 0.8 }}
              onClick={() => onItemClick && onItemClick(i)}
              className={`
                relative rounded-xl flex items-center justify-center transition-all
                ${sizeClasses[size]}
                ${onItemClick ? "cursor-pointer" : "cursor-default"}
              `}
            >
              <Icon 
                className={`
                  w-full h-full transition-all duration-300
                  ${colorClass}
                  ${isHighlighted ? "drop-shadow-xl scale-110 stroke-[3px]" : "stroke-[2px]"}
                `} 
              />
              {/* Number overlay for accessibility/learning */}
              <span className="absolute -bottom-6 text-sm font-bold text-slate-300">
                {i + 1}
              </span>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}