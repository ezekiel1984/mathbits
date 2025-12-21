import React, { useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import LandingPage from "@/components/home/LandingPage";
import { motion } from 'framer-motion';

export default function Home() {
  const navigate = useNavigate();

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

  // Routing Logic
  useEffect(() => {
    if (!isUserLoading && !isProfileLoading && user) {
        if (profile) {
            navigate(createPageUrl('Dashboard'), { replace: true });
        } else {
            navigate(createPageUrl('Onboarding'), { replace: true });
        }
    }
  }, [user, profile, isUserLoading, isProfileLoading, navigate]);

  // Loading State
  if (isUserLoading || (user && isProfileLoading)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-8 border-sky-200 border-t-sky-500 rounded-full"
        />
      </div>
    );
  }

  // If not logged in, show Landing Page
  if (!user) {
    return <LandingPage />;
  }

  // Fallback while redirecting
  return null; 
}