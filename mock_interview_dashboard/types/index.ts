export type InterviewPhase = 
  | 'warmup' 
  | 'frontend' 
  | 'backend' 
  | 'behavioral' 
  | 'rapid_fire';

export interface InterviewSession {
  id: string;
  userId: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  currentPhase: InterviewPhase;
  startTime: Date;
  endTime?: Date;
  score?: number;
  report?: InterviewReport;
}

// Comprehensive Dashboard Types

export type Verdict = 'Pass' | 'Borderline' | 'Fail';
export type CompanyContext = 'Default' | 'FAANG' | 'Startup';
export type ExperienceLevel = 'Junior' | 'Mid' | 'Senior' | 'Staff';
export type HiringInclination = 'Strong Hire' | 'Hire' | 'No Hire' | 'Strong No Hire';

export interface InterviewReport {
  id: string;
  interviewId: string;
  generatedAt: string;
  
  metadata: {
    verdict: Verdict;
    overallScore: number;
    companyContext: CompanyContext;
    experienceLevel: ExperienceLevel;
    durationSeconds: number;
    confidenceIndex: number; // 0-100
  };

  executiveSummary: {
    narrative: string;
    strengths: string[];
    risks: string[];
    hiringInclination: HiringInclination;
  };

  scores: {
    overall: number;
    technical: number;
    communication: number;
    behavioral: number;
    efficiency: number;
  };

  skills: SkillBreakdown[];
  timeline: TimelineEvent[];
  
  behavioralAnalysis: {
    hesitationCount: number;
    fillerWordDensity: number; // Low, Medium, High
    confidenceTrend: { timestamp: number; value: number }[];
    narrative: string;
  };

  actionPlan: {
    topWeaknesses: { weakpoint: string; impact: string }[];
    drills: string[];
    improvementForecast: string;
  };
}

export interface SkillBreakdown {
  name: string;
  category: 'frontend' | 'backend' | 'system' | 'communication' | 'general';
  score: number;
  verdict: 'Strong' | 'Good' | 'Weak' | 'Critical Fail';
  positivePoints: string[];
  negativePoints: string[];
  recruiterNote: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: number; // seconds
  speaker: 'user' | 'ai';
  text: string;
  isCritical: boolean;
  sentiment?: 'positive' | 'negative' | 'neutral';
  aiFeedback?: string;
  tags?: ('Rambling' | 'Strong Answer' | 'Hesitation' | 'Inaccurate' | 'Missed Opportunity')[];
}
