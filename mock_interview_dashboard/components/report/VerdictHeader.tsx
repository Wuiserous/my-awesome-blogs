import { InterviewReport } from "@/types";
import { cn } from "@/lib/utils";
import { ShieldCheck, ShieldAlert, ShieldX, Clock, Trophy, Activity } from "lucide-react";

export function VerdictHeader({ metadata }: { metadata: InterviewReport['metadata'] }) {
    const verdictColor =
        metadata.verdict === 'Pass' ? 'text-green-400 border-green-500/20 bg-green-500/10' :
            metadata.verdict === 'Borderline' ? 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10' :
                'text-red-400 border-red-500/20 bg-red-500/10';

    const Icon =
        metadata.verdict === 'Pass' ? ShieldCheck :
            metadata.verdict === 'Borderline' ? ShieldAlert :
                ShieldX;

    return (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Verdict Card */}
            <div className={cn("col-span-1 md:col-span-2 rounded-2xl border p-8 flex flex-col justify-between relative overflow-hidden", verdictColor)}>
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Icon className="w-48 h-48" />
                </div>

                <div>
                    <h2 className="text-sm uppercase tracking-[0.2em] font-semibold opacity-80 mb-2">Interview Outcome</h2>
                    <h1 className="text-6xl font-bold tracking-tight mb-4">{metadata.verdict.toUpperCase()}</h1>
                    <p className="text-xl opacity-90 font-medium">
                        {metadata.companyContext} Standard • {metadata.experienceLevel} Level
                    </p>
                </div>

                <div className="mt-8 flex items-center space-x-8">
                    <div>
                        <div className="text-sm opacity-60 uppercase tracking-wider">Score</div>
                        <div className="text-4xl font-mono font-bold">{metadata.overallScore}/100</div>
                    </div>
                    <div className="h-12 w-[1px] bg-current opacity-20" />
                    <div>
                        <div className="text-sm opacity-60 uppercase tracking-wider">Confidence</div>
                        <div className="text-4xl font-mono font-bold">{metadata.confidenceIndex}%</div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="col-span-1 flex flex-col gap-4">
                <div className="flex-1 rounded-2xl bg-zinc-900 border border-white/5 p-6 flex flex-col justify-center items-center text-center">
                    <Clock className="w-8 h-8 text-blue-400 mb-2" />
                    <div className="text-2xl font-bold text-white">{Math.floor(metadata.durationSeconds / 60)}m {metadata.durationSeconds % 60}s</div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest">Duration</div>
                </div>
                <div className="flex-1 rounded-2xl bg-zinc-900 border border-white/5 p-6 flex flex-col justify-center items-center text-center">
                    <Activity className="w-8 h-8 text-purple-400 mb-2" />
                    <div className="text-2xl font-bold text-white">Senior</div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest">Level Assessed</div>
                </div>
            </div>
        </section>
    );
}
