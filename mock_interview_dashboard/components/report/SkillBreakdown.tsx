import { InterviewReport } from "@/types";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

export function SkillBreakdown({ skills }: { skills: InterviewReport['skills'] }) {
    // Group by category if needed, for now flat list
    return (
        <section>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="bg-blue-500 w-2 h-8 rounded-full" />
                Deep Skill Breakdown
            </h3>

            <div className="space-y-6">
                {skills.map((skill, idx) => (
                    <div key={idx} className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 hover:bg-zinc-900/50 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h4 className="text-lg font-semibold text-white">{skill.name}</h4>
                                <div className="text-sm text-gray-500 capitalize">{skill.category}</div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "px-4 py-1.5 rounded-full text-sm font-bold border",
                                    skill.verdict === 'Strong' ? "bg-green-500/10 border-green-500/20 text-green-400" :
                                        skill.verdict === 'Good' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                                            skill.verdict === 'Weak' ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" :
                                                "bg-red-500/10 border-red-500/20 text-red-400"
                                )}>
                                    {skill.verdict}
                                </div>
                                <div className="w-16 text-right font-mono font-bold text-2xl text-white/50">{skill.score}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h5 className="text-xs font-bold text-green-500/70 uppercase mb-3">Positive Signals</h5>
                                <ul className="space-y-2">
                                    {skill.positivePoints.length > 0 ? skill.positivePoints.map((p, i) => (
                                        <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                                            <span className="text-green-500 mt-1">+</span> {p}
                                        </li>
                                    )) : <li className="text-sm text-gray-600 italic">No strong signals observed.</li>}
                                </ul>
                            </div>
                            <div>
                                <h5 className="text-xs font-bold text-red-500/70 uppercase mb-3">Negative Signals</h5>
                                <ul className="space-y-2">
                                    {skill.negativePoints.length > 0 ? skill.negativePoints.map((p, i) => (
                                        <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                                            <span className="text-red-500 mt-1">-</span> {p}
                                        </li>
                                    )) : <li className="text-sm text-gray-600 italic">No major red flags.</li>}
                                </ul>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/5">
                            <div className="flex items-start gap-3 bg-blue-500/5 p-4 rounded-lg">
                                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-xs font-bold text-blue-400 uppercase mb-1">Recruiter Note</div>
                                    <p className="text-sm text-blue-100/80 leading-relaxed">&ldquo;{skill.recruiterNote}&rdquo;</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
