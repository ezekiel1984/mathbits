import React from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { ArrowLeft, Star, Lock, CheckCircle, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QuestMap() {
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  
  const { data: skills, isLoading: skillsLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
        // Fetch skills sorted by orderIndex
        // Since we can't sort in list() easily with current sdk mocking without seeing it, 
        // we'll filter active ones and sort manually
        const allSkills = await base44.entities.Skills.filter({ isActive: true });
        return allSkills.sort((a, b) => a.orderIndex - b.orderIndex);
    }
  });

  const { data: mastery } = useQuery({
    queryKey: ['skillMastery'],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.SkillMastery.filter({ userId: user.id });
    },
    enabled: !!user
  });

  if (skillsLoading) return <div className="p-8 text-center animate-pulse">Loading Map...</div>;

  const isSkillUnlocked = (index) => {
    if (index === 0) return true;
    const prevSkill = skills[index - 1];
    const prevMastery = mastery?.find(m => m.skillId === prevSkill.id);
    return prevMastery?.masteryScore >= 80;
  };

  return (
    <div className="min-h-screen bg-sky-50 pb-24">
      <div className="p-4 flex items-center gap-4 sticky top-0 bg-sky-50/90 backdrop-blur z-10">
        <Link to={createPageUrl('Home')}>
          <div className="p-2 bg-white rounded-xl shadow-sm hover:bg-slate-50">
            <ArrowLeft className="w-6 h-6 text-slate-400" />
          </div>
        </Link>
        <h1 className="text-2xl font-black text-slate-800">Quest Map</h1>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-8 relative">
        {/* Path Line */}
        <div className="absolute left-8 top-12 bottom-0 w-1 bg-slate-200 -z-0" />

        {skills?.map((skill, index) => {
          const unlocked = isSkillUnlocked(index);
          const skillMastery = mastery?.find(m => m.skillId === skill.id);
          const score = skillMastery?.masteryScore || 0;
          const isCompleted = score >= 80;
          
          // Determine if this is the recommended "next" skill (first unlocked but not completed)
          const isRecommended = unlocked && !isCompleted && (!skills[index-1] || isSkillUnlocked(index-1));
          // Simplified logic: The first one that is unlocked but not mastered is recommended.
          // Or actually, just the last unlocked one is usually the frontier.
          
          const isFrontier = unlocked && (!skills[index+1] || !isSkillUnlocked(index+1));

          return (
            <motion.div 
              key={skill.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative z-10"
            >
               {isFrontier && !isCompleted && (
                   <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm z-20 animate-bounce">
                       Start Here
                   </div>
               )}

              <Link 
                to={unlocked ? createPageUrl('Lesson') + `?skillId=${skill.id}` : '#'}
                className={`
                  flex items-center gap-4 p-5 rounded-3xl border-4 transition-all relative
                  ${isFrontier && !isCompleted
                    ? "bg-white border-amber-400 shadow-xl shadow-amber-100 scale-105 z-10"
                    : unlocked 
                        ? "bg-white border-white shadow-lg shadow-sky-100 hover:scale-105 active:scale-95 cursor-pointer" 
                        : "bg-slate-50 border-slate-50 opacity-40 grayscale cursor-not-allowed scale-95"}
                `}
              >
                <div className={`
                  w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 transition-colors
                  ${isCompleted ? "bg-emerald-100 text-emerald-500" : (isFrontier ? "bg-amber-100 text-amber-500" : "bg-sky-100 text-sky-500")}
                  ${!unlocked && "bg-slate-200 text-slate-400"}
                `}>
                  {isCompleted ? <CheckCircle className="w-8 h-8" /> : unlocked ? <MapPin className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
                </div>
                
                <div className="flex-1">
                  <h3 className={`font-black text-lg leading-tight ${unlocked ? "text-slate-800" : "text-slate-400"}`}>{skill.name}</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase mt-1">{skill.domain}</p>
                </div>

                {isCompleted && (
                  <div className="flex flex-col items-center text-amber-400">
                    <Star className="w-6 h-6 fill-current" />
                    <span className="text-xs font-black">Mastered</span>
                  </div>
                )}
              </Link>
            </motion.div>
          );
        })}

        {(!skills || skills.length === 0) && (
            <div className="text-center p-8 text-slate-400">
                No skills found. Ask a parent/admin to add some!
            </div>
        )}
      </div>
    </div>
  );
}