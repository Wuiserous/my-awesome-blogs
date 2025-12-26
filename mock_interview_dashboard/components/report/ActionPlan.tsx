import { InterviewReport } from "@/types";
import { cn } from "@/lib/utils";
import { ArrowRight, Target, TrendingUp } from "lucide-react";

export function ActionPlan({ plan }: { plan: InterviewReport['actionPlan'] }) {
    return (
        <section className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-2xl p-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <Target className="w-64 h-64 text-blue-500" />
            </div>

            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3 relative z-10">
                <TrendingUp className="w-6 h-6 text-blue-400" />
                Strategic Action Plan (Next 14 Days)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                {/* Weakness Targeting */}
                <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Priority Weaknesses</h4>
                    <ul className="space-y-6">
                        {plan.topWeaknesses.map((w, i) => (
                            <li key={i} className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
                                    {i + 1}
                                </div>
                                <div>
                                    <div className="font-bold text-white text-lg">{w.weakpoint}</div>
                                    <div className="text-sm text-red-300 mt-1">Impact: {w.impact}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Specific Drills */}
                <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Recommended Drills</h4>
                    <ul className="space-y-4">
                        {plan.drills.map((d, i) => (
                            <li key={i} className="bg-black/40 border border-white/10 p-4 rounded-xl flex items-center justify-between group cursor-pointer hover:border-blue-500/50 transition-colors">
                                <span className="text-gray-200 text-sm font-medium">{d}</span>
                                <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition-colors" />
                            </li>
                        ))}
                    </ul>

                    <div className="mt-8 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-center">
                        <div className="text-blue-200 text-sm font-medium">
                            {plan.improvementForecast}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
