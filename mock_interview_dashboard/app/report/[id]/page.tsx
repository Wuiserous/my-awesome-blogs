'use client'; // Still client for basic UI, but data fetching should be better. 
// Actually since we use in-memory store in a serverless env (Next.js dev server), 
// we likely need an API to *fetch* the report too, or pass it as props.
// Let's make an API route to GET report.

import { useEffect, useState } from 'react';
import { MOCK_REPORT } from '@/lib/mock-data';
import { VerdictHeader } from '@/components/report/VerdictHeader';
import { ExecutiveSummary } from '@/components/report/ExecutiveSummary';
import { PerformanceAnalytics } from '@/components/report/PerformanceAnalytics';
import { SkillBreakdown } from '@/components/report/SkillBreakdown';
import { TimelineReplay } from '@/components/report/TimelineReplay';
import { ActionPlan } from '@/components/report/ActionPlan';
import { InterviewReport } from '@/types';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ReportPage({ params }: { params: { id: string } }) {
    const { id } = useParams();
    const [report, setReport] = useState<InterviewReport | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Poll for report or just fetch once
        const fetchReport = async () => {
            try {
                const res = await fetch(`/api/report/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setReport(data);
                } else {
                    console.warn("Report not found, using Mock");
                    // For demo continuity if server restarts
                    setReport(MOCK_REPORT);
                }
            } catch (e) {
                setReport(MOCK_REPORT);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [id]);

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2" /> Loading Report...</div>;
    if (!report) return <div>Report Not Found</div>;

    return (
        <div className="min-h-screen bg-black text-gray-100 p-8 font-sans selection:bg-blue-500/30">
            <div className="max-w-6xl mx-auto space-y-12">
                <VerdictHeader metadata={report.metadata} />
                <ExecutiveSummary summary={report.executiveSummary} />
                <PerformanceAnalytics scores={report.scores} behavioral={report.behavioralAnalysis} skills={report.skills} />
                <SkillBreakdown skills={report.skills} />
                <TimelineReplay timeline={report.timeline} />
                <ActionPlan plan={report.actionPlan} />
            </div>
        </div>
    );
}
