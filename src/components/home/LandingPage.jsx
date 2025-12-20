import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import BigButton from "@/components/ui/BigButton";
import { base44 } from "@/api/base44Client";

export default function LandingPage() {
  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[70vh] gap-8 text-center px-4 relative">
          <motion.img 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6943cd50422bb5e9998a81f4/ce9dde6dd_20251219_1508_MathBitsLogoDesign_remix_01kctcnhfwejjby1n7jg5yv01v.png"
              alt="MathBits Logo"
              className="w-64 max-w-full h-auto drop-shadow-xl animate-bounce-slow"
          />

          <div className="w-full max-w-sm space-y-6 mt-4">
            <h1 className="text-3xl md:text-5xl font-black text-slate-800 leading-tight">
              Math made <span className="text-[hsl(191,75%,29%)]">calm</span> and <span className="text-[hsl(35,95%,55%)]">fun</span>.
            </h1>
            <p className="text-lg text-slate-600 font-medium leading-relaxed">
              The neurodivergent-friendly math app for kids K-6. 
              Visual learning, no ticking clocks, just confidence.
            </p>
            
            <div className="pt-4">
              <BigButton 
                  onClick={() => base44.auth.redirectToLogin()} 
                  variant="primary" 
                  fullWidth
                  className="text-xl h-20 shadow-xl shadow-cyan-200/50"
              >
                  Get Started for Free
              </BigButton>
              <p className="text-xs text-slate-400 mt-4">Parents: Sign In / Sign Up to track progress.</p>
            </div>
          </div>
      </section>

      {/* Value Props */}
      <section className="space-y-12 px-4">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-black text-slate-800 mb-6 text-center">Why MathBits?</h2>
              <div className="grid gap-8 md:grid-cols-3">
                  <div className="text-center space-y-2">
                      <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🧩</div>
                      <h3 className="font-bold text-slate-700 text-lg">Visual First</h3>
                      <p className="text-slate-500">Concrete visuals for every problem. No abstract confusion.</p>
                  </div>
                  <div className="text-center space-y-2">
                      <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">😌</div>
                      <h3 className="font-bold text-slate-700 text-lg">Sensory Safe</h3>
                      <p className="text-slate-500">Adjustable stimulus levels. No flashing lights or sudden sounds.</p>
                  </div>
                  <div className="text-center space-y-2">
                      <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🐢</div>
                      <h3 className="font-bold text-slate-700 text-lg">Self-Paced</h3>
                      <p className="text-slate-500">No timers. No pressure. Step-by-step help when needed.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="text-center space-y-8 pt-8 border-t border-slate-200">
          <div className="flex flex-wrap justify-center gap-6 text-sm font-bold text-slate-500">
              <Link to={createPageUrl('Privacy')} className="hover:text-sky-600 transition-colors">Privacy Policy</Link>
              <Link to={createPageUrl('Support')} className="hover:text-sky-600 transition-colors">Support</Link>
              <a href="mailto:support@mathbits.app" className="hover:text-sky-600 transition-colors">Contact</a>
          </div>
          <p className="text-xs text-slate-400">© 2025 MathBits. All rights reserved.</p>
      </footer>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(5%); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}