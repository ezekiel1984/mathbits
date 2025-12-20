import React, { useState } from 'react';
import { motion } from 'framer-motion';
import BigButton from "@/components/ui/BigButton";

export default function Onboarding({ onSubmit, isPending }) {
  const [nameInput, setNameInput] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("🦊");
  const avatars = ["🦊", "🐼", "🦁", "🐸", "🐙", "🦄"];

  const handleCreateProfile = () => {
    if (!nameInput.trim()) return;
    onSubmit({
      display_name: nameInput,
      avatar_url: selectedAvatar,
      stimulus_level: 3,
      current_grade: "K"
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-block bg-cyan-100 text-[hsl(191,75%,29%)] px-4 py-1 rounded-full text-sm font-bold mb-4">
              Parent Setup
            </div>
            <h1 className="text-3xl font-black text-slate-800 mb-2">Create Kid Profile</h1>
        <p className="text-lg text-slate-500">Let's set up the app for your child.</p>
      </motion.div>

      <div className="w-full space-y-6">
        <div className="space-y-2">
          <label className="text-lg font-bold text-slate-600 ml-1">Child's Name</label>
          <input 
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="w-full text-2xl font-bold p-5 rounded-3xl border-2 border-slate-200 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none transition-all placeholder:text-slate-300"
            placeholder="e.g. Alex"
          />
        </div>

        <div className="space-y-2">
          <label className="text-lg font-bold text-slate-600 ml-1">Choose an Avatar</label>
          <div className="flex justify-between gap-2 overflow-x-auto pb-2 no-scrollbar">
            {avatars.map(emoji => (
              <button
                key={emoji}
                onClick={() => setSelectedAvatar(emoji)}
                className={`text-4xl p-4 rounded-2xl transition-all ${selectedAvatar === emoji ? "bg-sky-100 scale-110 ring-4 ring-sky-200" : "bg-white hover:bg-slate-50"}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <BigButton 
          onClick={handleCreateProfile}
          variant="primary"
          disabled={!nameInput.trim() || isPending}
          fullWidth
        >
          {isPending ? "Setting up..." : "Finish Setup"}
        </BigButton>
      </div>
    </div>
  );
}