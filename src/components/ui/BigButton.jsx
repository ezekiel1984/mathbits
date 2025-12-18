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
  const baseStyles = "relative overflow-hidden rounded-3xl p-6 flex items-center justify-center gap-4 transition-all duration-200 shadow-md active:scale-95 disabled:opacity-50 disabled:active:scale-100 touch-manipulation tap-target select-none";
  
  const variants = {
    primary: "bg-sky-400 text-white hover:bg-sky-500 shadow-sky-200",
    secondary: "bg-white text-slate-700 border-2 border-slate-200 hover:border-sky-200 hover:bg-sky-50",
    success: "bg-emerald-400 text-white hover:bg-emerald-500 shadow-emerald-200",
    danger: "bg-rose-400 text-white hover:bg-rose-500 shadow-rose-200",
    outline: "bg-transparent border-2 border-current hover:bg-black/5"
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