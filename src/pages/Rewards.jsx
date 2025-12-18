import React from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { ArrowLeft, Star, Award, Zap, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Rewards() {
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      return profiles[0];
    },
    enabled: !!user
  });

  const { data: rewards } = useQuery({
    queryKey: ['rewards'],
    queryFn: async () => {
      if (!user) return null;
      const res = await base44.entities.Rewards.filter({ userId: user.id });
      return res[0];
    },
    enabled: !!user
  });

  // Mock themes/badges if not present
  const badges = rewards?.badges ? JSON.parse(rewards.badges) : [
    { id: 'first_win', name: 'First Win', icon: '🏆', unlocked: true },
    { id: 'math_whiz', name: 'Math Whiz', icon: '🧠', unlocked: false },
    { id: 'speed_demon', name: 'Speedster', icon: '⚡', unlocked: false },
    { id: 'streak_week', name: 'On Fire', icon: '🔥', unlocked: false },
  ];

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="p-4 flex items-center gap-4">
        <Link to={createPageUrl('Home')}>
          <div className="p-2 bg-white rounded-xl shadow-sm hover:bg-amber-100 transition-colors">
            <ArrowLeft className="w-6 h-6 text-amber-500" />
          </div>
        </Link>
        <h1 className="text-3xl font-black text-amber-800">Rewards</h1>
      </div>

      <div className="p-4 space-y-6 max-w-md mx-auto">
        {/* Points Card */}
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-amber-100 border-2 border-amber-100 flex items-center justify-between">
            <div>
                <p className="text-amber-400 font-bold uppercase tracking-wider text-sm">Total Stars</p>
                <h2 className="text-5xl font-black text-slate-800">{profile?.points || 0}</h2>
            </div>
            <Star className="w-20 h-20 text-amber-400 fill-current animate-pulse" />
        </div>

        {/* Streak */}
        <div className="bg-gradient-to-r from-orange-400 to-amber-500 rounded-3xl p-6 shadow-lg text-white">
            <div className="flex items-center gap-3 mb-2">
                <Zap className="w-6 h-6 fill-current" />
                <h3 className="font-bold text-lg">Current Streak</h3>
            </div>
            <p className="text-4xl font-black">{profile?.streak || 0} Days</p>
            <p className="opacity-80 text-sm mt-1">Keep it up to unlock more!</p>
        </div>

        {/* Badges Grid */}
        <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4 px-2">Your Badges</h3>
            <div className="grid grid-cols-2 gap-4">
                {badges.map(badge => (
                    <motion.div 
                        key={badge.id}
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 rounded-3xl border-2 flex flex-col items-center text-center gap-2
                            ${badge.unlocked ? "bg-white border-amber-200" : "bg-slate-50 border-slate-100 opacity-60"}
                        `}
                    >
                        <div className="text-5xl mb-2 grayscale-0">
                            {badge.unlocked ? badge.icon : "🔒"}
                        </div>
                        <p className={`font-bold ${badge.unlocked ? "text-slate-800" : "text-slate-400"}`}>
                            {badge.name}
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}