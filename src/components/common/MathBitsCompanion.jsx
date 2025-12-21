import React from 'react';
import { motion } from 'framer-motion';

export const COMPANIONS = [
  {
    id: 'blocky',
    name: 'Blocky',
    description: 'Likes solving problems step by step.',
    color: 'text-sky-500',
    bg: 'bg-sky-100',
    shape: 'rounded-xl'
  },
  {
    id: 'dotty',
    name: 'Dotty',
    description: 'Likes finding patterns and connections.',
    color: 'text-amber-500',
    bg: 'bg-amber-100',
    shape: 'rounded-full'
  },
  {
    id: 'tri',
    name: 'Tri',
    description: 'Likes looking at things from new angles.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-100',
    shape: 'rounded-t-3xl rounded-b-lg' // Approximate soft triangle
  },
  {
    id: 'dash',
    name: 'Dash',
    description: 'Likes steady progress and rhythm.',
    color: 'text-indigo-500',
    bg: 'bg-indigo-100',
    shape: 'rounded-2xl'
  }
];

export default function MathBitsCompanion({ 
  id = 'blocky', 
  state = 'idle', // idle, happy, thinking
  stimulusLevel = 1,
  size = 'md', // sm, md, lg
  className 
}) {
  const companion = COMPANIONS.find(c => c.id === id) || COMPANIONS[0];
  const isAnimated = stimulusLevel > 1;

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48'
  };

  // Animation variants
  const variants = {
    idle: {
      y: [0, -2, 0],
      scale: [1, 1.02, 1],
      transition: { 
        duration: 4, 
        repeat: Infinity, 
        ease: "easeInOut",
        enabled: isAnimated 
      }
    },
    happy: {
      y: [0, -10, 0],
      scale: [1, 1.1, 1],
      rotate: [0, -5, 5, 0],
      transition: { duration: 0.5 }
    },
    thinking: {
      rotate: [0, 2, -2, 0],
      transition: { duration: 2, repeat: Infinity }
    }
  };

  // Eyes renderer
  const renderEyes = () => {
    const eyeClass = "bg-slate-800 rounded-full absolute";
    
    switch (id) {
        case 'blocky': // Square eyes
            return (
                <>
                    <div className="absolute left-[25%] top-[35%] w-[15%] h-[15%] bg-slate-800 rounded-sm" />
                    <div className="absolute right-[25%] top-[35%] w-[15%] h-[15%] bg-slate-800 rounded-sm" />
                </>
            );
        case 'dotty': // Round eyes
            return (
                <>
                    <div className={`${eyeClass} left-[25%] top-[40%] w-[15%] h-[15%]`} />
                    <div className={`${eyeClass} right-[25%] top-[40%] w-[15%] h-[15%]`} />
                </>
            );
        case 'tri': // Wide set eyes
             return (
                <>
                    <div className={`${eyeClass} left-[20%] top-[45%] w-[12%] h-[12%]`} />
                    <div className={`${eyeClass} right-[20%] top-[45%] w-[12%] h-[12%]`} />
                </>
            );
        case 'dash': // Pill eyes
             return (
                <>
                    <div className={`${eyeClass} left-[25%] top-[35%] w-[10%] h-[20%]`} />
                    <div className={`${eyeClass} right-[25%] top-[35%] w-[10%] h-[20%]`} />
                </>
            );
        default:
            return null;
    }
  };

  // Mouth renderer
  const renderMouth = () => {
      const mouthClass = "absolute left-1/2 -translate-x-1/2 bg-slate-800";
      
      if (state === 'happy') {
          return (
             <div className="absolute left-1/2 bottom-[25%] -translate-x-1/2 w-[30%] h-[15%] border-b-4 border-slate-800 rounded-full" />
          );
      }
      
      // Neutral mouths
       switch (id) {
        case 'blocky': 
             return <div className={`${mouthClass} bottom-[25%] w-[30%] h-[5%] rounded-full`} />;
        case 'dotty':
             return <div className={`${mouthClass} bottom-[25%] w-[10%] h-[10%] rounded-full`} />;
        case 'tri':
             return <div className={`${mouthClass} bottom-[20%] w-[20%] h-[5%] rounded-full`} />;
        case 'dash':
             return <div className={`${mouthClass} bottom-[25%] w-[40%] h-[5%] rounded-full`} />;
        default:
            return null;
       }
  };

  return (
    <motion.div
      className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}
      variants={variants}
      animate={isAnimated ? state : 'idle'}
    >
      {/* Base Shape */}
      <div className={`w-full h-full ${companion.bg} ${companion.shape} shadow-sm border-4 border-white ring-1 ring-slate-100/50`} />
      
      {/* Face Container */}
      <div className="absolute inset-0">
          {renderEyes()}
          {renderMouth()}
      </div>

      {/* Subtle Glow for Happy State */}
      {state === 'happy' && isAnimated && (
          <motion.div 
            className={`absolute inset-0 ${companion.shape} bg-yellow-400/20 blur-lg -z-10`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0 }}
          />
      )}
    </motion.div>
  );
}