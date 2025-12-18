import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BigButton from "@/components/ui/BigButton";
import { Play, User as UserIcon, Settings as SettingsIcon, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from "@/utils";
import { Link, useNavigate } from 'react-router-dom';
import ParentGate from "@/components/common/ParentGate";

export default function Home() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [nameInput, setNameInput] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("🦊");

  const avatars = ["🦊", "🐼", "🦁", "🐸", "🐙", "🦄"];

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      if (!user) return null;
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      return profiles[0] || null;
    },
    enabled: !!user
  });

  const createProfileMutation = useMutation({
    mutationFn: (data) => base44.entities.UserProfile.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });

  const handleCreateProfile = () => {
    if (!nameInput.trim()) return;
    createProfileMutation.mutate({
      display_name: nameInput,
      avatar_url: selectedAvatar,
      stimulus_level: 3,
      current_grade: "K"
    });
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-8 border-sky-200 border-t-sky-500 rounded-full"
        />
      </div>
    );
  }

  // View 1: No Profile (Onboarding)
  if (user && !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-block bg-sky-100 text-sky-700 px-4 py-1 rounded-full text-sm font-bold mb-4">
            Parent Setup
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-2">Create Kid Profile</h1>
          <p className="text-lg text-slate-500">Let's set up the app for your child.</p>
        </motion.div>

        <div className="w-full space-y-6">
          <div className="space-y-2">
            <label className="text-lg font-bold text-slate-600 ml-1">Child's Name</label>
            <input 
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full text-2xl font-bold p-5 rounded-3xl border-2 border-slate-200 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none transition-all placeholder:text-slate-300"
              placeholder="e.g. Alex"
            />
          </div>

          <div className="space-y-2">
            <label className="text-lg font-bold text-slate-600 ml-1">Choose an Avatar</label>
            <div className="flex justify-between gap-2 overflow-x-auto pb-2 no-scrollbar">
              {avatars.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setSelectedAvatar(emoji)}
                  className={`text-4xl p-4 rounded-2xl transition-all ${selectedAvatar === emoji ? "bg-sky-100 scale-110 ring-4 ring-sky-200" : "bg-white hover:bg-slate-50"}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <BigButton 
            onClick={handleCreateProfile}
            variant="primary"
            disabled={!nameInput.trim() || createProfileMutation.isPending}
            fullWidth
          >
            {createProfileMutation.isPending ? "Setting up..." : "Finish Setup"}
          </BigButton>
        </div>
      </div>
    );
  }

  // View 2: Not Logged In
  if (!user) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 text-center px-4">
            <div className="w-32 h-32 bg-sky-200 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-sky-100 animate-bounce-slow">
                <span className="text-6xl">🧮</span>
            </div>
            <div>
                <h1 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">MathBits</h1>
                <p className="text-xl text-slate-500 font-medium">Adaptive visual math<br/>for neurodiverse learners.</p>
            </div>
            
            <div className="w-full max-w-sm space-y-4">
              <BigButton 
                  onClick={() => base44.auth.redirectToLogin()} 
                  variant="primary" 
                  fullWidth
                  className="text-lg"
              >
                  Parents: Sign In / Sign Up
              </BigButton>
              <p className="text-xs text-slate-400">Create an account to track progress and customize settings.</p>
            </div>
            
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

  // View 3: Dashboard (Has Profile)
  return (
    <div className="flex flex-col h-full gap-8 pt-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-4xl border-2 border-slate-100">
            {profile.avatar_url || "🦊"}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Hi, {profile.display_name}!</h1>
            <div className="flex items-center gap-2 text-amber-500 font-bold bg-amber-50 px-3 py-1 rounded-full w-fit">
              <Star className="w-4 h-4 fill-current" />
              <span>{profile.points || 0} stars</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Actions */}
      <div className="grid gap-4 mt-4">
        <Link to={createPageUrl('Game')}>
            <div className="relative group">
                <div className="absolute inset-0 bg-sky-400 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity" />
                <BigButton 
                variant="primary" 
                icon={Play} 
                fullWidth 
                className="h-32 text-3xl shadow-xl shadow-sky-200"
                >
                PLAY NOW
                </BigButton>
            </div>
        </Link>

        <div className="grid grid-cols-2 gap-4">
          <ParentGate onUnlock={() => navigate(createPageUrl('ParentDashboard'))}>
            <BigButton variant="secondary" icon={UserIcon} className="h-full flex-col gap-2 w-full">
                Stats
            </BigButton>
          </ParentGate>
          <ParentGate onUnlock={() => navigate(createPageUrl('Settings'))}>
            <BigButton variant="secondary" icon={SettingsIcon} className="h-full flex-col gap-2 w-full">
                Settings
            </BigButton>
          </ParentGate>
        </div>
      </div>

      {/* Today's Streak */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-400 mb-4 uppercase tracking-wider">Your Streak</h3>
        <div className="flex justify-between items-center gap-2">
           {[...Array(5)].map((_, i) => (
             <div key={i} className={`h-3 flex-1 rounded-full ${i < (profile.streak % 5) ? "bg-amber-400" : "bg-slate-100"}`} />
           ))}
        </div>
        <p className="text-center mt-4 text-slate-500 font-medium">
            {profile.streak > 0 ? `${profile.streak} days in a row!` : "Start your streak today!"}
        </p>
      </div>
    </div>
  );
}