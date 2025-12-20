import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

export default function BigButton({ 
  onClick, 
  children, 
  variant = 'primary', 
  icon: Icon, 
  fullWidth = false, 
  className,
  disabled = false
}) {
  const baseStyles = "relative overflow-hidden rounded-[2rem] p-6 flex items-center justify-center gap-4 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 hover:-translate-y-1 disabled:opacity-50 disabled:active:scale-100 disabled:hover:translate-y-0 touch-manipulation tap-target select-none";
  
  const variants = {
    primary: "bg-[hsl(191,75%,29%)] text-white shadow-[hsl(191,75%,20%)]/20",
    secondary: "bg-sky-50 text-sky-700 hover:bg-sky-100 shadow-sky-100",
    accent: "bg-[hsl(35,95%,55%)] text-white hover:bg-[hsl(35,95%,60%)] shadow-[hsl(35,95%,40%)]/20",
    success: "bg-emerald-400 text-white hover:bg-emerald-500 shadow-emerald-200",
    danger: "bg-rose-400 text-white hover:bg-rose-500 shadow-rose-200",
    outline: "bg-transparent border-2 border-current hover:bg-slate-50 shadow-none"
  };

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(baseStyles, variants[variant], fullWidth && "w-full", className)}
    >
      {Icon && <Icon className="w-8 h-8" strokeWidth={2.5} />}
      <span className="text-xl font-bold tracking-tight">{children}</span>
    </motion.button>
  );
}