'use client';

import { MOCK_REPORT } from '@/lib/mock-data';
import { VerdictHeader } from '@/components/report/VerdictHeader';
import { ExecutiveSummary } from '@/components/report/ExecutiveSummary';
import { PerformanceAnalytics } from '@/components/report/PerformanceAnalytics';
import { SkillBreakdown } from '@/components/report/SkillBreakdown';
import { TimelineReplay } from '@/components/report/TimelineReplay';
import { ActionPlan } from '@/components/report/ActionPlan';

export default function ReportPage({ params }: { params: { id: string } }) {
    // In real app, fetch data using params.id
    const report = MOCK_REPORT;

    return (
        <div className="min-h-screen bg-black text-gray-100 p-8 font-sans selection:bg-blue-500/30">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* 1. Verdict Header */}
                <VerdictHeader metadata={report.metadata} />

                {/* 2. Executive Summary */}
                <ExecutiveSummary summary={report.executiveSummary} />

                {/* 3. Performance Analytics */}
                <PerformanceAnalytics scores={report.scores} behavioral={report.behavioralAnalysis} skills={report.skills} />

                {/* 4. Skill Breakdown */}
                <SkillBreakdown skills={report.skills} />

                {/* 5. Timeline Replay */}
                <TimelineReplay timeline={report.timeline} />

                {/* 6. Action Plan */}
                <ActionPlan plan={report.actionPlan} />

            </div>
        </div>
    );
}
