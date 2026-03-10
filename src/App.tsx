import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { Assessment } from './components/Assessment';
import { LeadForm } from './components/LeadForm';
import { ResultsDashboard } from './components/ResultsDashboard';
import { UserInfo, AssessmentResult, PillarScores } from './types';
import { QUESTIONS, READINESS_LEVELS } from './constants';

type AppState = 'landing' | 'assessment' | 'lead-form' | 'results';

export default function App() {
  const [state, setState] = useState<AppState>('landing');
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [user, setUser] = useState<UserInfo | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const calculateResults = (finalResponses: Record<number, number>): AssessmentResult => {
    const pillarTotals: Record<string, number> = { Strategy: 0, Skills: 0, Workflows: 0, Systems: 0 };
    const pillarCounts: Record<string, number> = { Strategy: 0, Skills: 0, Workflows: 0, Systems: 0 };

    QUESTIONS.forEach(q => {
      const score = finalResponses[q.id] || 0;
      pillarTotals[q.pillar] += score;
      pillarCounts[q.pillar] += 1;
    });

    const pillarScores: PillarScores = {
      Strategy: Math.round((pillarTotals.Strategy / (pillarCounts.Strategy * 5)) * 100),
      Skills: Math.round((pillarTotals.Skills / (pillarCounts.Skills * 5)) * 100),
      Workflows: Math.round((pillarTotals.Workflows / (pillarCounts.Workflows * 5)) * 100),
      Systems: Math.round((pillarTotals.Systems / (pillarCounts.Systems * 5)) * 100),
    };

    const totalScore = Math.round(
      (Object.values(pillarTotals).reduce((a, b) => a + b, 0) / (QUESTIONS.length * 5)) * 100
    );

    const calculatePercentile = (score: number): number => {
      if (score >= 90) return 95 + Math.floor((score - 90) / 2);
      if (score >= 80) return 85 + Math.floor((score - 80));
      if (score >= 70) return 75 + Math.floor((score - 70));
      if (score >= 60) return 60 + Math.floor((score - 60) * 1.5);
      if (score >= 50) return 40 + Math.floor((score - 50) * 2);
      return Math.max(5, Math.floor(score * 0.8));
    };

    const readinessLevel = READINESS_LEVELS.find(
      level => totalScore >= level.min && totalScore <= level.max
    )?.label || 'Explorer';

    return { totalScore, readinessLevel, pillarScores, percentile: calculatePercentile(totalScore) };
  };

  const handleStart = () => setState('assessment');

  const handleAssessmentComplete = (finalResponses: Record<number, number>) => {
    setResponses(finalResponses);
    setState('lead-form');
  };

  const handleLeadSubmit = async (info: UserInfo) => {
    setUser(info);
    const calculatedResult = calculateResults(responses);
    setResult(calculatedResult);

    // Save lead to Alamia CRM / Backend
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...info, scores: calculatedResult })
      });
    } catch (error) {
      console.error('Failed to save lead:', error);
    }

    setState('results');
  };

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-emerald-500/30">
      {state === 'landing' && <LandingPage onStart={handleStart} />}
      {state === 'assessment' && <Assessment onComplete={handleAssessmentComplete} />}
      {state === 'lead-form' && <LeadForm onSubmit={handleLeadSubmit} />}
      {state === 'results' && result && user && (
        <ResultsDashboard result={result} user={user} />
      )}
    </div>
  );
}
