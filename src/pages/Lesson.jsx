import React from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { ArrowLeft, PlayCircle } from 'lucide-react';
import BigButton from "@/components/ui/BigButton";

export default function Lesson() {
  const [searchParams] = useSearchParams();
  const skillId = searchParams.get('skillId');

  const { data: skill, isLoading } = useQuery({
    queryKey: ['skill', skillId],
    queryFn: async () => {
      if (!skillId) return null;
      const skills = await base44.entities.Skills.filter({ id: skillId });
      return skills[0];
    },
    enabled: !!skillId
  });

  if (isLoading) return <div>Loading...</div>;
  if (!skill) return <div className="p-8">Skill not found</div>;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="p-4">
        <Link to={createPageUrl('QuestMap')}>
          <div className="p-2 bg-slate-50 rounded-xl w-fit">
            <ArrowLeft className="w-6 h-6 text-slate-400" />
          </div>
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center p-6 text-center max-w-lg mx-auto">
        <div className="inline-block bg-sky-100 text-sky-600 px-4 py-1 rounded-full text-sm font-bold mb-6 uppercase tracking-wider">
          Lesson
        </div>
        
        <h1 className="text-4xl font-black text-slate-800 mb-6">{skill.name}</h1>
        
        <div className="bg-slate-50 rounded-3xl p-8 w-full mb-8 border border-slate-100">
          <p className="text-xl text-slate-600 leading-relaxed font-medium">
            {skill.description || "Learn this new concept!"}
          </p>
          {/* Placeholder for visual example */}
          <div className="mt-8 h-40 bg-white rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
            Visual Example Here
          </div>
        </div>

        <div className="mt-auto w-full">
           <Link to={createPageUrl('Game') + `?skillId=${skill.id}&mode=quest`}>
            <BigButton variant="primary" icon={PlayCircle} fullWidth className="text-2xl py-8">
              Start Practice
            </BigButton>
          </Link>
        </div>
      </div>
    </div>
  );
}