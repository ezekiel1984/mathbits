import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import BigButton from "@/components/ui/BigButton";
import ParentGate from "@/components/common/ParentGate";
import AdaptivePath from "@/components/home/AdaptivePath";
import { Play, Star, Settings as SettingsIcon, User as UserIcon } from 'lucide-react';

export default function Dashboard({ profile }) {
  const navigate = useNavigate();

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

        {/* AI Recommendations */}
        <AdaptivePath />

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