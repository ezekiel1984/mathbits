import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X } from 'lucide-react';
import BigButton from "@/components/ui/BigButton";

import { createPortal } from 'react-dom';

export default function ParentGate({ children, onUnlock, className }) {
  const [isOpen, setIsOpen] = useState(false);
  const [answer, setAnswer] = useState("");
  const [challenge, setChallenge] = useState({ q: "3 x 5 = ?", a: "15" });

  const handleOpen = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent bubbling
    // Generate simple math challenge
    const n1 = Math.floor(Math.random() * 5) + 2;
    const n2 = Math.floor(Math.random() * 5) + 2;
    setChallenge({ q: `${n1} x ${n2} = ?`, a: (n1 * n2).toString() });
    setAnswer("");
    setIsOpen(true);
  };

  const handleCheck = () => {
    if (answer === challenge.a) {
      setIsOpen(false);
      onUnlock();
    } else {
      setAnswer(""); // simple reset on wrong answer
    }
  };

  return (
    <>
      <div onClick={handleOpen} className={className}>
        {children}
      </div>

      {isOpen && createPortal(
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col items-center gap-4 pt-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                  <Lock className="w-8 h-8" />
                </div>
                
                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-800">Parents Only</h3>
                  <p className="text-slate-500 text-sm">Solve this to continue</p>
                </div>

                <div className="text-3xl font-black text-sky-500 my-2">
                  {challenge.q}
                </div>

                <input
                  type="number"
                  autoFocus
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full text-center text-2xl font-bold p-3 rounded-xl border-2 border-slate-200 focus:border-sky-400 outline-none"
                  placeholder="?"
                />

                <BigButton onClick={handleCheck} fullWidth variant="primary">
                  Unlock
                </BigButton>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}