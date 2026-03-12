import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { Assessment } from './components/Assessment';
import { LeadForm } from './components/LeadForm';
import { ResultsDashboard } from './components/ResultsDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { UserInfo, AssessmentResult, PillarScores } from './types';
import { QUESTIONS, READINESS_LEVELS } from './constants';

// Assessment Container to manage internal state flow
const AssessmentFlow = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'quest' | 'lead' | 'result'>('quest');
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [user, setUser] = useState<UserInfo | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  // Persistence Hydration
  useEffect(() => {
    const savedResult = sessionStorage.getItem('last_assessment_result');
    const savedUser = sessionStorage.getItem('last_assessment_user');
    if (savedResult && savedUser) {
      setResult(JSON.parse(savedResult));
      setUser(JSON.parse(savedUser));
      setStep('result');
    }
  }, []);

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

  const handleAssessmentComplete = (finalResponses: Record<number, number>) => {
    setResponses(finalResponses);
    setStep('lead');
  };

  const handleLeadSubmit = async (info: UserInfo) => {
    setUser(info);
    const calculatedResult = calculateResults(responses);
    setResult(calculatedResult);

    // Persist for refresh
    sessionStorage.setItem('last_assessment_result', JSON.stringify(calculatedResult));
    sessionStorage.setItem('last_assessment_user', JSON.stringify(info));

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...info, scores: calculatedResult })
      });
      const apiResult = await response.json();
      if (!response.ok || !apiResult.success) {
        console.error('API Error:', apiResult.error?.message);
      }
    } catch (error) {
      console.error('Connection failed:', error);
    }

    setStep('result');
  };

  const handleRetake = () => {
    setStep('quest');
    setResponses({});
    setUser(null);
    setResult(null);
    sessionStorage.removeItem('last_assessment_result');
    sessionStorage.removeItem('last_assessment_user');
  };

  if (step === 'quest') return <Assessment onComplete={handleAssessmentComplete} />;
  if (step === 'lead') return <LeadForm onSubmit={handleLeadSubmit} />;
  if (step === 'result' && result && user) return <ResultsDashboard result={result} user={user} onRetake={handleRetake} />;
  
  return <Navigate to="/" />;
};

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#050505] selection:bg-emerald-500/30">
        <Header />
        <main className="pt-16 md:pt-20">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/assessment" element={<AssessmentFlow />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
