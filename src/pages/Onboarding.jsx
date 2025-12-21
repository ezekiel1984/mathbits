import React, { useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import OnboardingComponent from "@/components/home/Onboarding.jsx";
import { motion } from 'framer-motion';

export default function Onboarding() {
  const navigate = useNavigate();
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

  const createProfileMutation = useMutation({
    mutationFn: (data) => base44.entities.UserProfile.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      navigate(createPageUrl('Dashboard'));
    }
  });

  // If already has profile, redirect to Dashboard
  useEffect(() => {
    if (profile) navigate(createPageUrl('Dashboard'));
  }, [profile, navigate]);

  if (!user) return null; // Should be handled by parent/redirect

  return (
    <OnboardingComponent 
      onSubmit={(data) => createProfileMutation.mutate(data)} 
      isPending={createProfileMutation.isPending} 
    />
  );
}