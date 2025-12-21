import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

const AVATAR_URLS = [
  "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&h=400&fit=crop&q=80", // Rabbit (Cartoon/Toy)
  "https://images.unsplash.com/photo-1585110396000-c9a96db275c4?w=400&h=400&fit=crop&q=80", // Hedgehog (Cartoon/Toy)
  "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&h=400&fit=crop&q=80", // Bear (Cartoon/Toy)
  "https://images.unsplash.com/photo-1596464716486-14e9def6c997?w=400&h=400&fit=crop&q=80", // Fox (Cartoon/Toy)
  "https://images.unsplash.com/photo-1585110396150-327c53d0891d?w=400&h=400&fit=crop&q=80", // Lion (Cartoon/Toy)
  "https://images.unsplash.com/photo-1557002665-c54d241ea099?w=400&h=400&fit=crop&q=80", // Monster 1
  "https://images.unsplash.com/photo-1563204988-518296c0517f?w=400&h=400&fit=crop&q=80", // Monster 2
  "https://images.unsplash.com/photo-1559419610-189f37913504?w=400&h=400&fit=crop&q=80"  // Monster 3
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