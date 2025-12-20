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
          <div className="inline-block bg-cyan-100 text-[hsl(191,75%,29%)] px-4 py-1 rounded-full text-sm font-bold mb-4">
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
            <motion.img 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6943cd50422bb5e9998a81f4/ce9dde6dd_20251219_1508_MathBitsLogoDesign_remix_01kctcnhfwejjby1n7jg5yv01v.png"
                alt="MathBits Logo"
                className="w-64 max-w-full h-auto drop-shadow-xl animate-bounce-slow"
            />

            <div className="w-full max-w-sm space-y-4 mt-8">
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
            <div className="flex items-center gap-2 text-[hsl(25,91%,58%)] font-bold bg-orange-50 px-3 py-1 rounded-full w-fit">
              <Star className="w-4 h-4 fill-current" />
              <span>{profile.points || 0} stars</span>
            </div>
          </div>
        </div>
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6943cd50422bb5e9998a81f4/158ba1973_20251219_1510_MinimalisticMathIcon_remix_01kctctz0gfw2r93yvjvc3j675.png" 
          alt="MathBits" 
          className="w-12 h-12 object-contain opacity-20"
        />
      </header>

      {/* Main Actions */}
      <div className="space-y-8 mt-4">
        {/* Primary Action Group */}
        <div className="space-y-4">
            <Link to={createPageUrl('QuestMap')}>
                <div className="relative group">
                    <div className="absolute inset-0 bg-[hsl(191,75%,29%)] rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition-opacity" />
                    <BigButton 
                        variant="primary" 
                        icon={Play} 
                        fullWidth 
                        className="h-40 text-3xl shadow-2xl"
                    >
                        Play Quest
                    </BigButton>
                </div>
            </Link>

            <Link to={createPageUrl('Game') + "?mode=practice"}>
                <BigButton 
                    variant="secondary" 
                    icon={Star} 
                    fullWidth 
                    className="h-24 text-xl bg-sky-100 text-sky-700 hover:bg-sky-200"
                >
                    Practice
                </BigButton>
            </Link>
        </div>

        {/* Secondary Actions Row */}
        <div className="grid grid-cols-2 gap-4">
          <Link to={createPageUrl('Rewards')}>
            <BigButton variant="outline" icon={Star} className="h-24 flex-col gap-1 w-full text-amber-500 border-amber-200 bg-amber-50/50 hover:bg-amber-100">
                <span className="text-sm font-bold">Rewards</span>
            </BigButton>
          </Link>
          
          <ParentGate onUnlock={() => navigate(createPageUrl('Settings'))}>
            <BigButton variant="outline" icon={SettingsIcon} className="h-24 flex-col gap-1 w-full text-slate-400 border-slate-200 hover:bg-slate-50">
                <span className="text-sm font-bold">Settings</span>
            </BigButton>
          </ParentGate>
        </div>

        {/* Streak (Visual only, calm) */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-50 flex items-center justify-between">
           <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Weekly Streak</p>
               <p className="text-lg font-bold text-slate-600">Let's build it!</p>
           </div>
           <div className="flex gap-1">
               {[...Array(5)].map((_, i) => (
                 <div key={i} className={`w-3 h-8 rounded-full ${i < (profile.streak % 5) ? "bg-amber-400" : "bg-slate-100"}`} />
               ))}
           </div>
        </div>

        {/* Parent Dashboard Link (Discreet) */}
        <div className="flex justify-center pt-4 opacity-50 hover:opacity-100 transition-opacity">
            <ParentGate onUnlock={() => navigate(createPageUrl('ParentDashboard'))}>
                <button className="text-xs font-bold text-slate-400 flex items-center gap-2 px-4 py-2 rounded-full hover:bg-slate-50">
                    <UserIcon className="w-4 h-4" /> Parent Dashboard
                </button>
            </ParentGate>
        </div>
      </div>
    </div>
  );
}