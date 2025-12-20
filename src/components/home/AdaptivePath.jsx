import React from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { Sparkles, ArrowRight, Zap, RefreshCw, Trophy } from 'lucide-react';

export default function AdaptivePath() {
  const { data, isLoading } = useQuery({
    queryKey: ['adaptivePath'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getAdaptivePath');
      return res.data;
    }
  });

  const icons = {
    reinforcement: RefreshCw,
    progression: ArrowRight,
    challenge: Trophy
  };

  const colors = {
    reinforcement: "bg-sky-50 text-sky-600 border-sky-100",
    progression: "bg-emerald-50 text-emerald-600 border-emerald-100",
    challenge: "bg-amber-50 text-amber-600 border-amber-100"
  };

  if (isLoading) {
    return (
        <div className="py-6 space-y-3 animate-pulse">
            <div className="h-4 bg-slate-100 rounded w-1/3 mb-4"></div>
            <div className="h-24 bg-slate-50 rounded-2xl"></div>
            <div className="h-24 bg-slate-50 rounded-2xl"></div>
        </div>
    );
  }

  if (!data?.recommendations?.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
         <Sparkles className="w-5 h-5 text-[hsl(35,95%,55%)]" />
         <h2 className="text-lg font-black text-slate-800">Your Recommended Path</h2>
      </div>

      <div className="space-y-3">
        {data.recommendations.map((rec, idx) => {
            const Icon = icons[rec.type] || Zap;
            const style = colors[rec.type] || colors.progression;
            
            return (
                <Link key={idx} to={`${createPageUrl('Game')}?skillId=${rec.skillId}&mode=practice`}>
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 rounded-2xl border shadow-sm flex items-center gap-4 transition-colors bg-white ${style.replace('bg-', 'hover:bg-')}`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${style}`}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                                <span className={`text-xs font-bold uppercase tracking-wider ${style.split(' ')[1]}`}>{rec.label}</span>
                            </div>
                            <h3 className="font-bold text-slate-700 truncate">{rec.skillName}</h3>
                            <p className="text-sm text-slate-500 line-clamp-1">{rec.reason}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </motion.div>
                </Link>
            );
        })}
      </div>
    </div>
  );
}