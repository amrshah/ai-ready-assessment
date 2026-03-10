export interface Question {
  id: number;
  pillar: 'Strategy' | 'Skills' | 'Workflows' | 'Systems';
  text: string;
}

export interface PillarScores {
  Strategy: number;
  Skills: number;
  Workflows: number;
  Systems: number;
}

export interface AssessmentResult {
  totalScore: number;
  readinessLevel: string;
  pillarScores: PillarScores;
  percentile: number;
}

export interface UserInfo {
  name: string;
  email: string;
  industry?: string;
  role?: string;
  sendReport?: boolean;
}

export interface AIInsights {
  readiness_level: string;
  summary: string;
  strengths: string[];
  capability_gaps: string[];
  recommended_actions: string[];
  product_recommendation: {
    name: string;
    description: string;
    price: string;
    benefits: string[];
  };
}
