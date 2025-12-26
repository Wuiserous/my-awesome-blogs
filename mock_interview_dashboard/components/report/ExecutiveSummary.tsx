import { InterviewReport } from "@/types";
import { CheckCircle2, AlertTriangle, Briefcase } from "lucide-react";

export function ExecutiveSummary({ summary }: { summary: InterviewReport['executiveSummary'] }) {

    const inclinationColor =
        summary.hiringInclination.includes('No') ? 'text-red-400' : 'text-green-400';

    return (
        <section className="bg-zinc-900/50 rounded-2xl border border-white/5 p-8 backdrop-blur-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Recruiter Executive Summary
            </h3>

            <div className="prose prose-invert max-w-none mb-8">
                <p className="text-lg leading-relaxed text-gray-200">
                    &ldquo;{summary.narrative}&rdquo;
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h4 className="text-sm font-semibold text-green-400 mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> KEY SIGNALS
                    </h4>
                    <ul className="space-y-3">
                        {summary.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                                {s}
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-red-400 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> RISK FACTORS
                    </h4>
                    <ul className="space-y-3">
                        {summary.risks.map((r, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                                {r}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-center">
                <div className="text-sm text-gray-500 font-mono">AI RECRUITER DECISION</div>
                <div className={`text-xl font-bold tracking-tight ${inclinationColor}`}>
                    {summary.hiringInclination.toUpperCase()}
                </div>
            </div>
        </section>
    );
}
