import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QUESTIONS } from '../constants';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface AssessmentProps {
  onComplete: (responses: Record<number, number>) => void;
}

export const Assessment: React.FC<AssessmentProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, number>>({});

  const currentQuestion = QUESTIONS[currentIndex];

  if (!currentQuestion) return null;

  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;

  const handleSelect = (value: number) => {
    const newResponses = { ...responses, [currentQuestion.id]: value };
    setResponses(newResponses);
    
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete(newResponses);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress Header */}
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4">
            <div>
              <span className="text-emerald-500 font-mono text-sm mb-1 block uppercase tracking-widest">
                Pillar: {currentQuestion.pillar}
              </span>
              <h2 className="text-zinc-500 text-sm">Question {currentIndex + 1} of {QUESTIONS.length}</h2>
            </div>
            <span className="text-emerald-500 font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question Area */}
        <div className="min-h-[300px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              <h3 className="text-2xl md:text-3xl font-medium leading-tight">
                {currentQuestion.text}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleSelect(value)}
                    className={`
                      py-4 px-6 rounded-xl border-2 transition-all duration-200 font-bold text-lg
                      ${responses[currentQuestion.id] === value 
                        ? 'bg-emerald-500 border-emerald-500 text-black' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-emerald-500/50 hover:text-white'}
                    `}
                  >
                    {value}
                  </button>
                ))}
              </div>
              
              <div className="flex justify-between text-xs text-zinc-500 font-medium uppercase tracking-widest px-1">
                <span>Strongly Disagree</span>
                <span>Strongly Agree</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="mt-12 flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={currentIndex === 0}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              currentIndex === 0 ? 'text-zinc-800 cursor-not-allowed' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>
    </div>
  );
};
