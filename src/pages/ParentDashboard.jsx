import React from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowLeft, Clock, Target, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import BigButton from "@/components/ui/BigButton";
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function ParentDashboard() {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      if (!user) return null;
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      return profiles[0] || null;
    },
    enabled: !!user
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.entities.UserProfile.update(profile.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] })
  });

  const { data: progressData, isLoading } = useQuery({
    queryKey: ['progress'],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Progress.filter({ user_email: user.email }, '-date', 100);
    },
    enabled: !!user
  });

  const stats = React.useMemo(() => {
    if (!progressData || progressData.length === 0) return null;
    
    const total = progressData.length;
    const correct = progressData.filter(p => p.is_correct).length;
    const accuracy = Math.round((correct / total) * 100);
    
    // Group by type
    const byType = progressData.reduce((acc, curr) => {
      if (!acc[curr.type]) acc[curr.type] = { name: curr.type, total: 0, correct: 0 };
      acc[curr.type].total++;
      if (curr.is_correct) acc[curr.type].correct++;
      return acc;
    }, {});
    
    const chartData = Object.values(byType).map(item => ({
      name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
      accuracy: Math.round((item.correct / item.total) * 100),
      count: item.total
    }));

    return { total, accuracy, chartData };
  }, [progressData]);

  if (isLoading) return <div className="p-8 text-center text-slate-400">Loading stats...</div>;

  return (
    <div className="space-y-8 pb-24">
      <div className="flex items-center gap-4">
        <Link to={createPageUrl('Home')}>
          <div className="p-2 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-400" />
          </div>
        </Link>
        <h1 className="text-3xl font-black text-slate-800">Parent Dashboard</h1>
      </div>

      {/* Kid Management Section */}
      {profile && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-700 mb-4">Kid Profile</h2>
            <div className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl border border-slate-100">
                    {profile.avatar_url}
                </div>
                <div className="flex-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Name</label>
                    <input 
                        className="w-full text-xl font-bold text-slate-800 border-b-2 border-slate-100 focus:border-sky-400 outline-none py-1"
                        value={profile.display_name}
                        onChange={(e) => updateProfileMutation.mutate({ display_name: e.target.value })}
                    />
                </div>
                <div className="flex-1">
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
      )}

      {!stats ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
            📊
          </div>
          <h2 className="text-xl font-bold text-slate-700 mb-2">No stats yet</h2>
          <p className="text-slate-500 mb-6">Play some games to see progress here!</p>
          <Link to={createPageUrl('Game')}>
            <BigButton>Start Playing</BigButton>
          </Link>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-2 text-slate-400 font-bold text-sm uppercase">
                <Target className="w-4 h-4" /> Accuracy
              </div>
              <div className="text-4xl font-black text-slate-800">{stats.accuracy}%</div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-2 text-slate-400 font-bold text-sm uppercase">
                <Award className="w-4 h-4" /> Solved
              </div>
              <div className="text-4xl font-black text-slate-800">{stats.total}</div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-700 mb-6">Accuracy by Topic</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9', radius: 8}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="accuracy" radius={[8, 8, 8, 8]}>
                    {stats.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.accuracy > 80 ? '#34d399' : entry.accuracy > 50 ? '#fbbf24' : '#f87171'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent History */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50">
              <h3 className="text-lg font-bold text-slate-700">Recent Activity</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {progressData.slice(0, 5).map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${item.is_correct ? "bg-emerald-400" : "bg-rose-400"}`} />
                    <div>
                      <p className="font-bold text-slate-700 capitalize">{item.type}</p>
                      <p className="text-xs text-slate-400">{new Date(item.created_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${item.is_correct ? "text-emerald-500" : "text-rose-500"}`}>
                    {item.is_correct ? "Correct" : "Try Again"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}