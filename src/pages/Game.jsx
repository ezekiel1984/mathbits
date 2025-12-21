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
import MathBitsCompanion from "@/components/common/MathBitsCompanion";

export default function Game() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // -- State --
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState(null); // 'correct', 'incorrect', null
  const [showSettings, setShowSettings] = useState(false);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [isExplaining, setIsExplaining] = useState(false);
  
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
      return res[0] || { stimulusLevel: 1, stepChainMode: true }; 
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
      if (mode === 'practice') {
          const response = await base44.functions.invoke('getNextQuestion', { userId: user?.id, skillId: skillId });
          return response.data || [];
      }
      let all = await base44.entities.MathProblem.list();
      return all;
    },
    initialData: []
  });

  // Game State
  const [isGameOver, setIsGameOver] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, points: 0, streak: 0 });

  // -- Mutations --
  const submitAttemptMutation = useMutation({
    mutationFn: (data) => base44.functions.invoke('submitAttempt', data),
    onSuccess: (response) => {
        const { masteryScore, streak, points, pointsAdded } = response.data;
        // Update local session stats
        setSessionStats(prev => ({
            correct: prev.correct + (pointsAdded >= 10 ? 1 : 0),
            points: prev.points + (pointsAdded || 0),
            streak: streak
        }));
        queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });

  // -- Logic --
  const currentProblem = problems[currentProblemIndex];
  
  // Apply Step-Chain toggle from settings OR force it if adaptive logic requests it
  // Default to TRUE for neurodivergent support
  const isStepMode = ((userSettings?.stepChainMode ?? true) || currentProblem?.forceStepChain) 
                     && currentProblem?.steps 
                     && currentProblem.steps.length > 0;

  // Determine visuals
  const visualType = currentProblem?.derivedType || currentProblem?.type; // Support both new and legacy
  const visualCount = currentProblem ? 
    (visualType === 'subtraction' ? currentProblem.number_1 : 
     visualType === 'multiplication' ? currentProblem.number_1 * currentProblem.number_2 :
     currentProblem.number_1 + (currentProblem.number_2 || 0)) : 0;

  // Determine highlighting based on step
  const getHighlights = () => {
    if (!isStepMode) return [];
    if (currentStep === 0) return [...Array(currentProblem.number_1).keys()];
    if (currentStep === 1) return [...Array(currentProblem.number_2).keys()].map(i => i + currentProblem.number_1);
    return [...Array(visualCount).keys()]; 
  };

  const handleInput = (num) => {
    if (feedback === 'correct') return;
    if (input.length < 3) setInput(prev => prev + num);
  };

  const handleDelete = () => setInput(prev => prev.slice(0, -1));

  const checkAnswer = (val) => {
    // val can be passed directly (multiple choice) or parsed from input
    const answerVal = val !== undefined ? val : input;
    if (answerVal === undefined || answerVal === "") return;

    // Compare as strings to handle both numeric and potential string answers
    const isCorrect = String(answerVal).trim() === String(currentProblem.answer).trim();

    // Submit Attempt
    if (currentProblem.id) { // Only submit if we have a real ID
        submitAttemptMutation.mutate({
            userId: user?.id,
            skillId: currentProblem.skillId, // New field from getNextQuestion
            questionId: currentProblem.id,
            isCorrect: isCorrect,
            timeTakenSec: 10, // TODO: Implement timer
            hintsUsed: 0 // TODO: Implement hint tracking
        });
    }

    if (isCorrect) {
      setFeedback('correct');
      // If multiple choice, we might want to set input to show it was selected
      if (val !== undefined) setInput(String(val));
    } else {
      setFeedback('incorrect');
      setTimeout(() => {
          if (val === undefined) setInput(""); // Clear if text input
          setFeedback(null);
      }, 1500);
    }
  };

  const handleExplain = async () => {
      setIsExplaining(true);
      try {
          const res = await base44.functions.invoke('explainStep', { 
              questionText: currentProblem.question_text,
              steps: currentProblem.steps,
              gradeLevel: profile?.current_grade || 'K',
              userAnswer: input
          });
          setAiExplanation(res.data.explanation);
      } catch (e) {
          console.error(e);
      } finally {
          setIsExplaining(false);
      }
  };

  const handleNextProblem = () => {
    setFeedback(null);
    setAiExplanation(null);
    setInput("");
    setCurrentStep(0);

    // Check if session complete (10 questions or end of list)
    if (currentProblemIndex + 1 >= problems.length || currentProblemIndex + 1 >= 10) {
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
      <div className="flex flex-col items-center justify-center h-screen gap-6 p-4 text-center bg-sky-50">
        <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2rem] p-8 shadow-xl max-w-md w-full"
        >
            <h1 className="text-4xl font-black text-slate-800 mb-2">Session Complete!</h1>
            <div className="text-8xl mb-6">🎉</div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-emerald-50 rounded-2xl p-4">
                    <div className="text-emerald-500 font-bold uppercase text-xs tracking-wider">Correct</div>
                    <div className="text-3xl font-black text-emerald-600">{sessionStats.correct}</div>
                </div>
                <div className="bg-amber-50 rounded-2xl p-4">
                    <div className="text-amber-500 font-bold uppercase text-xs tracking-wider">Points</div>
                    <div className="text-3xl font-black text-amber-600">+{sessionStats.points}</div>
                </div>
                <div className="bg-sky-50 rounded-2xl p-4 col-span-2">
                    <div className="text-sky-500 font-bold uppercase text-xs tracking-wider">Streak</div>
                    <div className="text-3xl font-black text-sky-600">{sessionStats.streak} 🔥</div>
                </div>
            </div>

            <Link to={createPageUrl('Home')}>
            <BigButton variant="primary" icon={ArrowLeft} fullWidth>Back Home</BigButton>
            </Link>
        </motion.div>
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
        
        {/* Companion Feedback Center */}
        <div className="flex-1 flex justify-center">
            <MathBitsCompanion 
                id={profile?.companion_id} 
                size="sm"
                state={feedback === 'correct' ? 'happy' : feedback === 'incorrect' ? 'thinking' : 'idle'}
                stimulusLevel={userSettings?.stimulusLevel ?? 1}
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
          className="text-4xl md:text-6xl font-black text-slate-800 mb-6 text-center select-none"
        >
          {currentProblem.question_text}
        </motion.h2>

        {/* Visuals */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl px-4">
            <VisualCounter 
              count={visualCount} 
              type={currentProblem.visual_type || 'blocks'} 
              highlightIndices={getHighlights()}
              size="md"
            />
    
            {/* Step Chain UI */}
            {isStepMode && feedback !== 'correct' && !aiExplanation && (
              <div className="mt-8 w-full">
                <StepChain 
                    goal={currentProblem.question_text}
                    steps={currentProblem.steps} 
                    expandedDefault={userSettings?.stepChainMode ?? true}
                />
              </div>
            )}

            {/* AI Explanation Display */}
            <AnimatePresence>
                {aiExplanation && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 bg-amber-50 rounded-2xl p-6 w-full text-left space-y-3 border border-amber-100 shadow-sm"
                    >
                        <h3 className="text-amber-600 font-bold uppercase text-xs tracking-wider mb-2">Helpful Hints</h3>
                        {aiExplanation.map((step, i) => (
                            <div key={i} className="flex gap-3 items-start">
                                <div className="bg-amber-200 text-amber-800 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">{i+1}</div>
                                <p className="text-slate-700 font-medium">{step}</p>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>

      {/* Input Area */}
      <div className="mt-auto pt-4 bg-white/90 backdrop-blur-xl border-t border-slate-100 -mx-4 px-4 pb-8 z-20 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">

        {/* Feedback / AI Help Row */}
        <div className="flex justify-center mb-4 min-h-[24px]">
             {feedback === 'incorrect' ? (
                 <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-400 font-bold text-sm">
                     Let's try that again...
                 </motion.span>
             ) : (
                 !aiExplanation && (
                     <button 
                        onClick={handleExplain}
                        disabled={isExplaining}
                        className="text-sky-500 text-sm font-bold hover:text-sky-600 transition-colors flex items-center gap-1 disabled:opacity-50"
                     >
                        {isExplaining ? "Thinking..." : "Explain another way?"}
                     </button>
                 )
             )}
        </div>

        {currentProblem?.type === 'multipleChoice' && currentProblem.choices ? (
            // Multiple Choice UI
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-4">
                {currentProblem.choices.map((choice, idx) => (
                    <motion.button
                        key={idx}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => checkAnswer(choice)}
                        className={`
                            h-24 rounded-3xl text-2xl font-bold shadow-sm border-b-4 transition-all
                            ${feedback === 'correct' && String(choice) === String(currentProblem.answer)
                                ? "bg-emerald-400 text-white border-emerald-600"
                                : feedback === 'incorrect'
                                ? "bg-slate-50 text-slate-300 border-slate-200" 
                                : "bg-white text-slate-700 border-slate-200 hover:bg-sky-50 hover:border-sky-200"
                            }
                        `}
                    >
                        {choice}
                    </motion.button>
                ))}
            </div>
        ) : (
            // Numeric Input UI (Default)
            <>
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
                    onClick={() => checkAnswer()}
                    disabled={!input}
                    className="h-16 rounded-2xl bg-emerald-400 text-white flex items-center justify-center shadow-emerald-200 shadow-md active:scale-95 transition-all disabled:opacity-50"
                >
                    <Check className="w-8 h-8 stroke-[3]" />
                </button>
                </div>
            </>
        )}
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