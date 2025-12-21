import React from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from '@tanstack/react-query';
import DashboardComponent from "@/components/home/Dashboard";
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      if (!user) return null;
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      return profiles[0] || null;
    },
    enabled: !!user
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full"
        />
      </div>
    );
  }

  if (!profile) return <div>Profile not found. Please complete onboarding.</div>;

  return <DashboardComponent profile={profile} />;
}