import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Settings2, Delete, Check } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from "@/utils";

import BigButton from "@/components/ui/BigButton";
import VisualCounter from "@/components/game/VisualCounter";
import RewardAnimation from "@/components/game/RewardAnimation";
import StepChain from "@/components/game/StepChain";
import StimulusDial from "@/components/game/StimulusDial";

export default function Game() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // -- State --
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState(null); // 'correct', 'incorrect', null
  const [showSettings, setShowSettings] = useState(false);
  
  // Step Chain State
  const [currentStep, setCurrentStep] = useState(0);
  
  // -- Data Fetching --
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
      if (!user) return null;
      const res = await base44.entities.Settings.filter({ userId: user.id });
      return res[0] || { stimulusLevel: 1, stepChainMode: true }; // Fallback defaults
    },
    enabled: !!user
  });

  // -- Query Params --
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'practice';
  const skillId = searchParams.get('skillId');

  const { data: problems, isLoading: isProblemsLoading } = useQuery({
    queryKey: ['mathProblems', mode, skillId],
    queryFn: async () => {
      // Logic: If skillId, fetch questions. If not, fetch MathProblems (legacy) or random.
      // For now, to keep it working with existing seeded data, we pull MathProblem.
      // In a real full implementation, we'd fetch from Questions entity if mode==quest.
      let all = await base44.entities.MathProblem.list();
      
      if (mode === 'practice') {
        // Shuffle and take 5 for quick practice
        return all.sort(() => 0.5 - Math.random()).slice(0, 5);
      }
      return all;
    },
    initialData: []
  });

  // Game Over State
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);

  // -- Mutations --
  const updateProgressMutation = useMutation({
    mutationFn: async ({ isCorrect, problem }) => {
      // 1. Log progress
      await base44.entities.Progress.create({
        user_email: user?.email,
        problem_id: problem.id,
        type: problem.type,
        is_correct: isCorrect,
        difficulty: problem.difficulty,
        time_taken_seconds: 0 // TODO: track time
      });

      // 2. Update stats if correct
      if (isCorrect && profile?.id) {
        await base44.entities.UserProfile.update(profile.id, {
          points: (profile.points || 0) + 10,
          streak: (profile.streak || 0) // Logic to update streak daily would go here
        });
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }
    }
  });

  // -- Logic --
  const currentProblem = problems[currentProblemIndex];
  // Apply Step-Chain toggle from settings
  const isStepMode = (userSettings?.stepChainMode ?? true) && currentProblem?.steps && currentProblem.steps.length > 0;
  
  // Determine visuals
  const visualCount = currentProblem ? 
    (currentProblem.type === 'subtraction' ? currentProblem.number_1 : 
     currentProblem.type === 'multiplication' ? currentProblem.number_1 * currentProblem.number_2 :
     currentProblem.number_1 + (currentProblem.number_2 || 0)) : 0;
     
  // Determine highlighting based on step
  const getHighlights = () => {
    if (!isStepMode) return [];
    if (currentStep === 0) return [...Array(currentProblem.number_1).keys()];
    if (currentStep === 1) return [...Array(currentProblem.number_2).keys()].map(i => i + currentProblem.number_1);
    return [...Array(visualCount).keys()]; // Final step
  };

  const handleInput = (num) => {
    if (feedback === 'correct') return;
    if (input.length < 3) setInput(prev => prev + num);
  };

  const handleDelete = () => setInput(prev => prev.slice(0, -1));

  const checkAnswer = () => {
    if (!input) return;
    const val = parseInt(input);
    const isCorrect = val === currentProblem.answer;

    if (isCorrect) {
      setFeedback('correct');
      updateProgressMutation.mutate({ isCorrect: true, problem: currentProblem });
    } else {
      setFeedback('incorrect');
      // Shake animation trigger logic could go here
      setTimeout(() => setInput(""), 500);
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  const handleNextProblem = () => {
    setFeedback(null);
    setInput("");
    setCurrentStep(0);
    
    if (currentProblemIndex + 1 >= problems.length) {
      setIsGameOver(true);
    } else {
      setCurrentProblemIndex(prev => prev + 1);
    }
  };

  // -- Render --
  if (isProblemsLoading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin text-4xl">⏳</div></div>;
  }

  if (isGameOver) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6 p-4 text-center">
        <h1 className="text-5xl font-black text-slate-800">Great Job!</h1>
        <div className="text-8xl">🎉</div>
        <p className="text-2xl text-slate-500 font-bold">You finished the set!</p>
        <Link to={createPageUrl('Home')}>
          <BigButton variant="primary" icon={ArrowLeft} fullWidth>Back Home</BigButton>
        </Link>
      </div>
    );
  }

  if (!currentProblem) {
    return <div className="p-8 text-center">No problems found.</div>;
  }

  return (
    <div className="h-[90vh] flex flex-col relative overflow-hidden">
      <RewardAnimation 
        show={feedback === 'correct'} 
        intensity={userSettings?.stimulusLevel ?? 1} 
        onComplete={handleNextProblem} 
      />

      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <Link to={createPageUrl('Home')}>
          <button className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-8 h-8 text-slate-500" />
          </button>
        </Link>
        <div className="h-4 flex-1 mx-4 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-sky-400"
            initial={{ width: 0 }}
            animate={{ width: `${((currentProblemIndex) / problems.length) * 100}%` }}
          />
        </div>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-xl transition-colors ${showSettings ? "bg-sky-100 text-sky-500" : "hover:bg-slate-100 text-slate-400"}`}
        >
          <Settings2 className="w-8 h-8" />
        </button>
        </div>

        {/* Settings Overlay */}
        <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-lg border border-sky-100">
              <p className="text-center font-bold text-slate-400 mb-2 uppercase text-xs">Stimulus Level</p>
              <StimulusDial 
                value={userSettings?.stimulusLevel ?? 1} 
                onChange={(val) => {
                  // Update Settings
                  if (userSettings) {
                      base44.entities.Settings.update(userSettings.id, { stimulusLevel: val });
                      queryClient.setQueryData(['settings'], old => ({ ...old, stimulusLevel: val }));
                  } else if (user) {
                      base44.entities.Settings.create({ userId: user.id, stimulusLevel: val });
                      queryClient.invalidateQueries({ queryKey: ['settings'] });
                  }
                }} 
              />
            </div>
          </motion.div>
        )}
        </AnimatePresence>

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-start overflow-y-auto pb-4 no-scrollbar">
        {/* Question Text */}
        <motion.h2 
          key={currentProblem.id + "text"}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl md:text-6xl font-black text-slate-800 mb-6 text-center"
        >
          {currentProblem.question_text}
        </motion.h2>

        {/* Visuals */}
        <VisualCounter 
          count={visualCount} 
          type={currentProblem.visual_type} 
          highlightIndices={getHighlights()}
          size="md"
        />

        {/* Step Chain UI */}
        {isStepMode && feedback !== 'correct' && (
          <StepChain 
            goal={currentProblem.question_text}
            steps={currentProblem.steps} 
            expandedDefault={userSettings?.stepChainMode ?? true}
          />
        )}
      </div>

      {/* Input Area */}
      <div className="mt-auto pt-4 bg-white/80 backdrop-blur-md border-t border-slate-100 -mx-4 px-4 pb-4">
        {/* Answer Display */}
        <div className="flex justify-center mb-4">
          <div className={`
            h-20 min-w-[120px] px-8 rounded-3xl flex items-center justify-center text-5xl font-black border-4
            ${feedback === 'incorrect' ? "border-rose-300 bg-rose-50 text-rose-500 animate-shake" : 
              feedback === 'correct' ? "border-emerald-300 bg-emerald-50 text-emerald-500" :
              "border-sky-100 bg-white text-slate-700"}
          `}>
            {input || "?"}
          </div>
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleInput(num)}
              className="h-16 rounded-2xl bg-slate-50 text-2xl font-bold text-slate-600 shadow-sm active:bg-sky-100 active:scale-95 transition-all"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleDelete}
            className="h-16 rounded-2xl bg-rose-50 text-rose-400 flex items-center justify-center active:scale-95 transition-all"
          >
            <Delete className="w-6 h-6" />
          </button>
          <button
            onClick={() => handleInput(0)}
            className="h-16 rounded-2xl bg-slate-50 text-2xl font-bold text-slate-600 shadow-sm active:bg-sky-100 active:scale-95 transition-all"
          >
            0
          </button>
          <button
            onClick={checkAnswer}
            disabled={!input}
            className="h-16 rounded-2xl bg-emerald-400 text-white flex items-center justify-center shadow-emerald-200 shadow-md active:scale-95 transition-all disabled:opacity-50"
          >
            <Check className="w-8 h-8 stroke-[3]" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
}