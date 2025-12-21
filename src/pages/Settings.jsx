import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import BigButton from "@/components/ui/BigButton";
import StimulusDial from "@/components/game/StimulusDial";
import { Switch } from "@/components/ui/switch";
import AvatarSelector from "@/components/common/AvatarSelector";

      export default function Settings() {
        const queryClient = useQueryClient();
        const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

        const { data: profile } = useQuery({
          queryKey: ['profile'],
          queryFn: async () => {
            const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
            return profiles[0];
          },
          enabled: !!user
        });

        const { data: userSettings } = useQuery({
          queryKey: ['settings'],
          queryFn: async () => {
            const res = await base44.entities.Settings.filter({ userId: user.id });
            return res[0] || null;
          },
          enabled: !!user
        });

        const [formData, setFormData] = useState({
          display_name: "",
          stimulus_level: 1, 
          high_contrast: false,
          current_grade: "K",
          step_chain_mode: true,
          companion_id: "blocky"
        });

        useEffect(() => {
          if (profile) {
          setFormData(prev => ({
            ...prev,
            display_name: profile.display_name,
            high_contrast: profile.high_contrast,
            current_grade: profile.current_grade,
            companion_id: profile.companion_id || "blocky"
          }));
          }
        }, [profile]);

  useEffect(() => {
    if (userSettings) {
      setFormData(prev => ({
        ...prev,
        stimulus_level: userSettings.stimulusLevel ?? 1,
        step_chain_mode: userSettings.stepChainMode ?? true
      }));
    }
  }, [userSettings]);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.entities.UserProfile.update(profile.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] })
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data) => {
      if (userSettings) {
        return base44.entities.Settings.update(userSettings.id, data);
      } else {
        return base44.entities.Settings.create({ ...data, userId: user.id });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] })
  });

  const handleSave = async () => {
    // Save Profile Data
    if (profile) {
        await updateProfileMutation.mutateAsync({
            display_name: formData.display_name,
            high_contrast: formData.high_contrast,
            current_grade: formData.current_grade,
            companion_id: formData.companion_id
        });
    }

    // Save Settings Data
    await updateSettingsMutation.mutateAsync({
        stimulusLevel: formData.stimulus_level,
        stepChainMode: formData.step_chain_mode
    });

    if (profile?.high_contrast !== formData.high_contrast) {
         setTimeout(() => window.location.reload(), 500);
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="space-y-6 pb-20">
       <div className="flex items-center gap-4 mb-8">
        <Link to={createPageUrl('Home')}>
          <div className="p-2 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-400" />
          </div>
        </Link>
        <h1 className="text-3xl font-black text-slate-800">Settings</h1>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
        <AvatarSelector 
            selectedCompanionId={formData.companion_id}
            onSelect={(id) => setFormData(prev => ({ ...prev, companion_id: id }))}
        />

        {/* Child's Name */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Child's Name</label>
          <input 
            type="text"
            value={formData.display_name}
            onChange={(e) => setFormData({...formData, display_name: e.target.value})}
            className="w-full text-xl font-bold p-4 rounded-2xl border-2 border-slate-200 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none transition-all"
          />
        </div>

        {/* Grade Level */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Grade Level</label>
          <div className="grid grid-cols-4 gap-2">
            {["K", "1", "2", "3", "4", "5", "6"].map(grade => (
              <button
                key={grade}
                onClick={() => setFormData({...formData, current_grade: grade})}
                className={`
                  p-3 rounded-xl font-bold transition-all
                  ${formData.current_grade === grade 
                    ? "bg-sky-500 text-white shadow-lg shadow-sky-200 scale-105" 
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100"}
                `}
              >
                {grade}
              </button>
            ))}
          </div>
        </div>

        {/* Sensory Settings */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-lg font-bold text-slate-700">Sensory Preferences</h3>
          
          <StimulusDial 
            value={formData.stimulus_level} 
            onChange={(val) => setFormData({...formData, stimulus_level: val})} 
          />

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
            <div className="flex items-center gap-3">
              {formData.high_contrast ? <Sun className="w-6 h-6 text-yellow-500" /> : <Moon className="w-6 h-6 text-slate-400" />}
              <div>
                <p className="font-bold text-slate-700">High Contrast</p>
                <p className="text-xs text-slate-400">Black background, yellow text</p>
              </div>
            </div>
            <Switch 
              checked={formData.high_contrast}
              onCheckedChange={(checked) => setFormData({...formData, high_contrast: checked})}
            />
          </div>

          {/* Step Chain Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
             <div>
                <p className="font-bold text-slate-700">Step-Chain Mode</p>
                <p className="text-xs text-slate-400">Break problems into smaller steps</p>
             </div>
             <Switch 
               checked={formData.step_chain_mode ?? true} // Default true if undefined
               onCheckedChange={(checked) => setFormData({...formData, step_chain_mode: checked})}
             />
          </div>
        </div>

        <div className="pt-6">
          <BigButton 
            onClick={handleSave} 
            variant="success" 
            fullWidth 
            icon={Save}
            disabled={updateProfileMutation.isPending || updateSettingsMutation.isPending}
          >
            {(updateProfileMutation.isPending || updateSettingsMutation.isPending) ? "Saving..." : "Save Changes"}
          </BigButton>
        </div>
      </div>
    </div>
  );
}