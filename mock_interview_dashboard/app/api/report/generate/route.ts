
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SCORING_RUBRIC } from '@/lib/gemini/prompts';
import { REPORT_STORE } from '@/lib/store';
import { MOCK_REPORT } from '@/lib/mock-data';

// Initialize Gemini Pro (not Live) for analysis
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
    try {
        const { transcript, interviewId } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            // Fallback for demo if key missing
            REPORT_STORE[interviewId] = MOCK_REPORT;
            return NextResponse.json({ success: true, id: interviewId });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });

        const transcriptText = transcript.map((t: any) => `${t.speaker.toUpperCase()} (${t.timestamp}s): ${t.text}`).join('\n');

        const prompt = `
        You are the "Bar Raiser" recruiter at a top tech company.
        Analyze this interview transcript and generate a structured JSON report.
        
        TRANSCRIPT:
        ${transcriptText}

        SCORING RUBRIC:
        ${SCORING_RUBRIC}

        OUTPUT JSON SCHEMA:
        {
          "metadata": {
            "verdict": "Pass" | "Borderline" | "Fail",
            "overallScore": number (0-100),
            "companyContext": "FAANG",
            "experienceLevel": "Senior",
            "durationSeconds": number,
            "confidenceIndex": number (0-100)
          },
          "executiveSummary": {
            "narrative": string (3-4 sentences, recruiter tone),
            "strengths": string[],
            "risks": string[],
            "hiringInclination": "Strong Hire" | "Hire" | "No Hire" | "Strong No Hire"
          },
          "scores": {
            "overall": number,
            "technical": number,
            "communication": number,
            "behavioral": number,
            "efficiency": number
          },
          "skills": [
            {
              "name": string,
              "category": "frontend" | "backend" | "system" | "communication",
              "score": number,
              "verdict": "Strong" | "Good" | "Weak" | "Critical Fail",
              "positivePoints": string[],
              "negativePoints": string[],
              "recruiterNote": string
            }
          ],
          "behavioralAnalysis": {
            "hesitationCount": number,
            "fillerWordDensity": number (0-1 float),
            "confidenceTrend": [ {"timestamp": number, "value": number} ],
            "narrative": string
          },
          "timeline": [
            {
              "id": string (unique),
              "timestamp": number,
              "speaker": "ai" | "user",
              "text": string (snippet),
              "isCritical": boolean,
              "sentiment": "positive" | "negative",
              "tags": string[],
              "aiFeedback": string
            }
          ],
          "actionPlan": {
            "topWeaknesses": [{"weakpoint": string, "impact": string}],
            "drills": string[],
            "improvementForecast": string
          }
        }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const reportData = JSON.parse(responseText);

        // Augment with IDs
        reportData.id = `rep_${Date.now()}`;
        reportData.interviewId = interviewId;
        reportData.generatedAt = new Date().toISOString();

        // Save to store
        REPORT_STORE[interviewId] = reportData;

        return NextResponse.json({ success: true, id: interviewId });

    } catch (e) {
        console.error("Gen AI Error", e);
        // Fallback
        REPORT_STORE["fallback"] = MOCK_REPORT;
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
