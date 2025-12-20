import React, { useMemo } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Target, Award, Flame, Star, TrendingUp, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import BigButton from "@/components/ui/BigButton";
import { motion } from 'framer-motion';

export default function ParentDashboard() {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  
  // 1. Fetch Profile
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      if (!user) return null;
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      return profiles[0] || null;
    },
    enabled: !!user
  });

  // 2. Fetch Skills (for names & domains)
  const { data: skills = [] } = useQuery({
    queryKey: ['skills'],
    queryFn: () => base44.entities.Skills.filter({ isActive: true })
  });

  // 3. Fetch Mastery (for scores)
  const { data: mastery = [] } = useQuery({
    queryKey: ['mastery', user?.id],
    queryFn: () => user ? base44.entities.SkillMastery.filter({ userId: user.id }) : [],
    enabled: !!user
  });

  // 4. Fetch Recent Attempts (for "Improving this week")
  const { data: recentAttempts = [] } = useQuery({
    queryKey: ['attempts', user?.id],
    queryFn: async () => {
        if (!user) return [];
        // Fetch last 50 attempts
        return await base44.entities.Attempts.filter({ userId: user.id }, '-created_date', 50);
    },
    enabled: !!user
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.entities.UserProfile.update(profile.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] })
  });

  // -- Process Data --
  const dashboardData = useMemo(() => {
    if (!skills.length || !mastery) return null;

    // A. Domain Mastery
    const domainStats = {};
    skills.forEach(skill => {
        if (!domainStats[skill.domain]) {
            domainStats[skill.domain] = { total: 0, count: 0, name: skill.domain };
        }
        const m = mastery.find(m => m.skillId === skill.id);
        if (m) {
            domainStats[skill.domain].total += m.masteryScore;
            domainStats[skill.domain].count += 1;
        }
    });

    const domainList = Object.values(domainStats).map(d => ({
        name: d.name,
        avg: d.count ? Math.round(d.total / d.count) : 0,
        hasData: d.count > 0
    })).filter(d => d.hasData).sort((a, b) => b.avg - a.avg);

    // B. Focus Next (Lowest mastery active skill)
    // Combine skill + mastery
    const skillMasteryPairs = skills.map(skill => {
        const m = mastery.find(m => m.skillId === skill.id);
        return {
            skill,
            score: m ? m.masteryScore : 0
        };
    });
    // Sort by score ASC
    skillMasteryPairs.sort((a, b) => a.score - b.score);
    const focusSkill = skillMasteryPairs[0]?.skill;

    // C. Improving This Week
    // Check attempts in last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentSkillIds = new Set(
        recentAttempts
            .filter(a => new Date(a.created_date) > oneWeekAgo)
            .map(a => a.skillId)
    );

    const improvingSkills = skills.filter(s => recentSkillIds.has(s.id)).slice(0, 3);

    return { domainList, focusSkill, improvingSkills };
  }, [skills, mastery, recentAttempts]);


  if (!profile) return <div className="p-8 text-center text-slate-400">Loading profile...</div>;

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to={createPageUrl('Home')}>
          <div className="p-2 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-400" />
          </div>
        </Link>
        <h1 className="text-3xl font-black text-slate-800">Parent Insights</h1>
      </div>

      {/* Profile Card (Editable) */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex gap-4 items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl border border-slate-100">
                  {profile.avatar_url}
              </div>
              <div className="flex-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Child Name</label>
                  <input 
                      className="w-full text-xl font-bold text-slate-800 border-b-2 border-slate-100 focus:border-sky-400 outline-none py-1"
                      value={profile.display_name}
                      onChange={(e) => updateProfileMutation.mutate({ display_name: e.target.value })}
                  />
              </div>
              <div className="w-24">
                  <label className="text-xs font-bold text-slate-400 uppercase">Grade</label>
                  <select 
                      className="w-full text-xl font-bold text-slate-800 border-b-2 border-slate-100 focus:border-sky-400 outline-none py-1 bg-transparent"
                      value={profile.current_grade}
                      onChange={(e) => updateProfileMutation.mutate({ current_grade: e.target.value })}
                  >
                      {["K", "1", "2", "3", "4", "5", "6"].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
              </div>
          </div>
      </div>

      {/* Weekly Summary Card */}
      <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100">
          <h2 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" /> Weekly Highlights
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
              <div>
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Building Confidence In</div>
                  <p className="text-indigo-900 font-medium">
                      {dashboardData?.improvingSkills.length > 0 
                          ? dashboardData.improvingSkills.map(s => s.name).join(", ") 
                          : "Just getting started!"}
                  </p>
              </div>
              <div>
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Currently Practicing</div>
                  <p className="text-indigo-900 font-medium">
                      {dashboardData?.focusSkill?.name || "Foundational Skills"}
                  </p>
              </div>
              <div>
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Helpful Supports</div>
                  <p className="text-indigo-900 font-medium">
                      Step-Chain Mode, No Timer
                  </p>
              </div>
          </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-amber-500 font-bold text-xs uppercase tracking-wider">
                <Flame className="w-4 h-4" /> Consistency
            </div>
            <div className="text-3xl font-black text-slate-700">{profile.streak || 0} <span className="text-sm font-bold text-slate-400">days</span></div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-sky-500 font-bold text-xs uppercase tracking-wider">
                <Star className="w-4 h-4" /> Total Stars
            </div>
            <div className="text-3xl font-black text-slate-700">{profile.points || 0}</div>
        </div>
      </div>

      {dashboardData?.focusSkill && (
        <div className="bg-sky-50 p-6 rounded-3xl border border-sky-100 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-sky-200/20 rounded-full blur-2xl -mr-10 -mt-10" />
            <h3 className="text-sm font-bold text-sky-600 uppercase mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" /> Recommended Focus
            </h3>
            <p className="text-lg text-sky-900 font-medium mb-4">
                Let's practice <span className="font-black text-sky-700">{dashboardData.focusSkill.name}</span> next!
            </p>
            <Link to={`${createPageUrl('Game')}?skillId=${dashboardData.focusSkill.id}&mode=practice`}>
                <button className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-6 rounded-xl transition-colors shadow-sm shadow-sky-200">
                    Start Practice
                </button>
            </Link>
        </div>
      )}

      {/* Mastery by Domain */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-700 px-2 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-slate-400" />
            Progress by Domain
        </h3>
        
        {!dashboardData?.domainList.length ? (
            <div className="text-center p-8 bg-slate-50 rounded-3xl text-slate-400">
                No progress data yet. Start playing!
            </div>
        ) : (
            <div className="grid gap-3">
                {dashboardData.domainList.map(domain => (
                    <div key={domain.name} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-slate-500 text-lg">
                            {domain.name[0]}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between mb-1">
                                <span className="font-bold text-slate-700">{domain.name}</span>
                                <span className="text-xs font-bold text-slate-400 uppercase">
                                    {domain.avg >= 80 ? "Confident" : domain.avg >= 40 ? "Building Skills" : "Exploring"}
                                </span>
                            </div>
                            {/* Simplified Progress Bar (no numbers) */}
                            <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.max(5, domain.avg)}%` }} // Always show at least a little bar for encouragement
                                    className="h-full rounded-full bg-sky-200"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>


      
      {/* Recent History List */}
       <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50">
            <h3 className="text-lg font-bold text-slate-700">Recent Activity</h3>
        </div>
        <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
            {recentAttempts.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No activity yet.</div>
            ) : (
                recentAttempts.slice(0, 10).map((attempt) => (
                <div key={attempt.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${attempt.isCorrect ? "bg-emerald-400" : "bg-amber-400"}`} />
                        <div>
                            {/* Attempting to find skill name might be hard without a map, showing generic "Practice" or date */}
                            <p className="font-bold text-slate-700">Practice Question</p>
                            <p className="text-xs text-slate-400">{new Date(attempt.created_date).toLocaleDateString()} • {new Date(attempt.created_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                    </div>
                    <span className={`text-sm font-bold ${attempt.isCorrect ? "text-emerald-500" : "text-amber-500"}`}>
                        {attempt.isCorrect ? "+ Stars" : "Learning"}
                    </span>
                </div>
                ))
            )}
        </div>
        </div>

    </div>
  );
}