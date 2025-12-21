import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

const AVATAR_URLS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1ODc1Mjl8MHwxfHNlYXJjaHwxfHxkZWxwaGluJTIwY2FydG9vbnxlbnwwfHx8fDE3MDI2NjU4MjN8MA&ixlib=rb-4.0.3&q=80&w=1080", // Dolphin
  "https://images.unsplash.com/photo-1620857366304-45e0544f3780?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1ODc1Mjl8MHwxfHNlYXJjaHwxfHxhbmltYWwlMjBjaGFyYWN0ZXJ8ZW58MHx8fHwxNzA2OTc4MjAxfDA&ixlib=rb-4.0.3&q=80&w=1080", // Fox
  "https://images.unsplash.com/photo-1582298717013-17b5f543666d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1ODc1Mjl8MHwxfHNlYXJjaHwxfHxjYXQlMjBjYXJ0b29ufGVufDB8fHx8fDE3MDI2NjU4NTN8MA&ixlib=rb-4.0.3&q=80&w=1080", // Cat
  "https://images.unsplash.com/photo-1634591456170-c4e9f50e7a2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1ODc1Mjl8MHwxfHNlYXJjaHwxfHxiaXJkJTIwY2FydG9vbnxlbnwwfHx8fDE3MDI2NjU4ODd8MA&ixlib=rb-4.0.3&q=80&w=1080", // Bird
  "https://images.unsplash.com/photo-1616790938507-6b60098f98c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1ODc1Mjl8MHwxfHxtb25rZXklMjBjYXJ0b29ufGVufDB8fHx8fDE3MDY5Nzg1OTd8MA&ixlib=rb-4.0.3&q=80&w=1080", // Monkey
  "https://images.unsplash.com/photo-1587786196229-231a41a4a5b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1ODc1Mjl8MHwxfHNlYXJjaHwxfHxwYW5kYSUyMGNhcnRvb258ZW58MHx8fHwxNzA2OTc4NjQ5fDA&ixlib=rb-4.0.3&q=80&w=1080", // Panda
  "https://images.unsplash.com/photo-1579737153920-d326c278a9c0?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Frog
  "https://images.unsplash.com/photo-1610419262923-883907c11f7c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Owl
  "https://images.unsplash.com/photo-1580211110034-78cc12d09794?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"  // Hedgehog
];

// Export URLs so they can be used for defaults in other components
export { AVATAR_URLS };

export default function AvatarSelector({ selectedAvatar, onSelect }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Choose Your Avatar</label>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
        {AVATAR_URLS.map((avatarUrl, index) => (
          <motion.button
            key={index}
            onClick={() => onSelect(avatarUrl)}
            whileTap={{ scale: 0.9 }}
            className={cn(
              "relative w-full aspect-square rounded-full overflow-hidden border-4 transition-all bg-white",
              selectedAvatar === avatarUrl
                ? "border-sky-500 shadow-lg ring-2 ring-sky-300 scale-105" // Selected style
                : "border-slate-100 hover:border-sky-300"
            )}
          >
            <img 
              src={avatarUrl} 
              alt={`Avatar ${index + 1}`} 
              className="w-full h-full object-cover" 
              loading="lazy"
            />
            {selectedAvatar === avatarUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-sky-500/30 text-white"
              >
                <div className="bg-sky-500 rounded-full p-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}