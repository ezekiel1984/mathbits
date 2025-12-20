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
        {/* Dotted Path Line */}
        <div className="absolute left-8 top-12 bottom-0 w-0 border-l-4 border-dotted border-slate-200 -z-0" />

        {skills?.map((skill, index) => {
          const unlocked = isSkillUnlocked(index);
          const skillMastery = mastery?.find(m => m.skillId === skill.id);
          const score = skillMastery?.masteryScore || 0;
          const isCompleted = score >= 80;
          
          // Determine "Frontier" = First unlocked but not completed
          const isFrontier = unlocked && !isCompleted && (!skills[index-1] || isSkillUnlocked(index-1) || (mastery?.find(m => m.skillId === skills[index-1].id)?.masteryScore >= 80)); 
          // Simplified: The active skill the user should work on.
          
          return (
            <motion.div 
              key={skill.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative z-10 pl-2" // shift slightly to align with center of new dotted line
            >
               {isFrontier && (
                   <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[hsl(191,75%,29%)] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md z-20">
                       Start Here
                   </div>
               )}

              <Link 
                to={unlocked ? createPageUrl('Lesson') + `?skillId=${skill.id}` : '#'}
                className={`
                  flex items-center gap-4 p-5 rounded-[2rem] transition-all relative
                  ${isFrontier
                    ? "bg-white ring-4 ring-sky-100 shadow-xl shadow-sky-100/50 scale-105 z-10"
                    : unlocked 
                        ? "bg-white shadow-sm hover:shadow-md hover:scale-[1.02] cursor-pointer border border-slate-100" 
                        : "bg-transparent border border-slate-200 opacity-60 cursor-not-allowed scale-95"}
                `}
              >
                <div className={`
                  w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-colors
                  ${isCompleted ? "bg-emerald-100 text-emerald-500" : (isFrontier ? "bg-[hsl(191,75%,29%)] text-white" : "bg-sky-50 text-sky-400")}
                  ${!unlocked && "bg-slate-100 text-slate-300"}
                `}>
                  {isCompleted ? <CheckCircle className="w-6 h-6 stroke-[3]" /> : unlocked ? <MapPin className="w-6 h-6 stroke-[3]" /> : <Lock className="w-5 h-5" />}
                </div>
                
                <div className="flex-1">
                  <h3 className={`font-black text-lg leading-tight ${unlocked ? "text-slate-800" : "text-slate-400"}`}>{skill.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{skill.domain}</span>
                      {!unlocked && <span className="text-[10px] font-bold text-slate-400">Coming soon</span>}
                  </div>
                </div>

                {isCompleted && (
                  <div className="flex flex-col items-center text-amber-400">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                )}
              </Link>
            </motion.div>
          );
        })}

        {(!skills || skills.length === 0) && (
            <div className="text-center p-8 text-slate-400">
                No skills found.
            </div>
        )}
      </div>
    </div>
  );
}