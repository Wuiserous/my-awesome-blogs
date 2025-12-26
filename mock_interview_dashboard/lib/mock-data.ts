import { InterviewReport } from "@/types";

export const MOCK_REPORT: InterviewReport = {
  id: "rep_12345",
  interviewId: "sess_67890",
  generatedAt: new Date().toISOString(),
  
  metadata: {
    verdict: 'Borderline',
    overallScore: 68,
    companyContext: 'FAANG',
    experienceLevel: 'Senior',
    durationSeconds: 420, // 7 min
    confidenceIndex: 72,
  },

  executiveSummary: {
    narrative: "The candidate demonstrates strong frontend product sense and familiarity with React performance optimization. However, their specific knowledge of complex backend trade-offs (sharding vs partitioning) was shallow, and they struggled to justify system design decisions under pressure. Communication was clear but sometimes verbose.",
    strengths: [
      "Excellent grasp of React rendering lifecycles",
      "Proactive regarding accessibility considerations",
      "Calm demeanor during basic technical questions"
    ],
    risks: [
      "Failed to calculate Big O for the graph traversal problem",
      "Vague responses regarding database consistency models",
      "Tendency to guess rather than admitting knowledge gaps"
    ],
    hiringInclination: 'No Hire'
  },

  scores: {
    overall: 68,
    technical: 65,
    communication: 80,
    behavioral: 70,
    efficiency: 60
  },

  skills: [
    {
      name: "React & Frontend",
      category: "frontend",
      score: 85,
      verdict: "Strong",
      positivePoints: ["Correctly identified useMemo use case", "Explained hydration errors well"],
      negativePoints: [],
      recruiterNote: "Solid expert level here."
    },
    {
      name: "System Design",
      category: "system",
      score: 45,
      verdict: "Weak",
      positivePoints: [],
      negativePoints: ["Conflated load balancing with auto-scaling", "Couldn't explain CAP theorem trade-off"],
      recruiterNote: "Not ready for L5/Senior role."
    },
    {
      name: "Communication",
      category: "communication",
      score: 75,
      verdict: "Good",
      positivePoints: ["Articulate", "Friendly"],
      negativePoints: ["Did not ask clarifying questions before jumping in"],
      recruiterNote: "Good enough, but needs to drive the conversation more."
    }
  ],

  behavioralAnalysis: {
    hesitationCount: 12,
    fillerWordDensity: 0.15, // High
    confidenceTrend: [
      { timestamp: 0, value: 90 },
      { timestamp: 60, value: 85 },
      { timestamp: 120, value: 88 },
      { timestamp: 180, value: 60 }, // System design starts
      { timestamp: 240, value: 55 },
      { timestamp: 300, value: 65 },
      { timestamp: 360, value: 70 },
      { timestamp: 420, value: 75 },
    ],
    narrative: "Confidence dropped significantly during the backend section (Minute 3), indicated by increased pauses and 'um' frequency. Recovered slightly during the behavioral closing."
  },

  timeline: [
    {
      id: "t1",
      timestamp: 15,
      speaker: "ai",
      text: "Tell me about a time you optimized a slow React application.",
      isCritical: false
    },
    {
      id: "t2",
      timestamp: 22,
      speaker: "user",
      text: "Well, we had this dashboard that was lagging...",
      isCritical: true,
      sentiment: "positive",
      tags: ["Strong Answer"],
      aiFeedback: "Good structure: Situation -> Task."
    },
    {
      id: "t3",
      timestamp: 185,
      speaker: "ai",
      text: "How would you handle eventual consistency in this distributed counter?",
      isCritical: true
    },
    {
      id: "t4",
      timestamp: 192,
      speaker: "user",
      text: "Uhh, I think... maybe we just use a lock? Or like, Redis?",
      isCritical: true,
      sentiment: "negative",
      tags: ["Hesitation", "Inaccurate"],
      aiFeedback: "Major red flag. Redis locks don't solve AP consistency natively in the way asked. Showed guessing behavior."
    }
  ],

  actionPlan: {
    topWeaknesses: [
      { weakpoint: "Distributed System Consistency", impact: "Crucial for Senior Backend roles" },
      { weakpoint: "Algorithm Complexity Analysis", impact: "Failed to estimate performance impact" }
    ],
    drills: [
      "Study CAP Theorem and PACELC limits",
      "Practice calculating Time Complexity for nested loops vs hashmaps"
    ],
    improvementForecast: "Mastering System Design trade-offs could boost your score by ~15 points."
  }
};
