import React from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';

// Component Views
import LandingPage from "@/components/home/LandingPage";
import Dashboard from "@/components/home/Dashboard";
import Onboarding from "@/components/home/Onboarding";

export default function Home() {
  const queryClient = useQueryClient();

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

  // 0. Loading State
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

  // 1. Landing Page (Not Logged In)
  if (!user) {
    return <LandingPage />;
  }

  // 2. Onboarding (Logged In, No Profile)
  if (user && !profile) {
    return (
      <Onboarding 
        onSubmit={(data) => createProfileMutation.mutate(data)} 
        isPending={createProfileMutation.isPending} 
      />
    );
  }

  // 3. Dashboard (Logged In, Has Profile)
  return <Dashboard profile={profile} />;
}