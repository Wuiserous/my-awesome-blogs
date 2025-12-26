import { InterviewReport } from "@/types";
import { cn } from "@/lib/utils";
import { PlayCircle, AlertOctagon, ThumbsUp, HelpCircle } from "lucide-react";

export function TimelineReplay({ timeline }: { timeline: InterviewReport['timeline'] }) {

    // Sort by timestamp
    const sorted = [...timeline].sort((a, b) => a.timestamp - b.timestamp);

    return (
        <section>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="bg-purple-500 w-2 h-8 rounded-full" />
                Timeline & Critical Moments
            </h3>

            <div className="relative border-l border-white/10 ml-4 space-y-8 pb-12">
                {sorted.map((event, idx) => (
                    <div key={event.id} className="relative pl-8 group">
                        {/* Timeline Dot */}
                        <div className={cn(
                            "absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full border-2 border-black transition-all",
                            event.isCritical ? "w-4 h-4 left-[-9px] bg-white" : "bg-gray-600"
                        )} />

                        {/* Timestamp */}
                        <div className="absolute left-[-60px] top-0 text-xs font-mono text-gray-500">
                            {Math.floor(event.timestamp / 60)}:{String(event.timestamp % 60).padStart(2, '0')}
                        </div>

                        {/* Content */}
                        <div className={cn(
                            "rounded-xl p-5 border transition-all",
                            event.speaker === 'ai' ? "bg-transparent border-transparent pl-0" :
                                event.isCritical ? "bg-zinc-900 border-white/20" : "bg-zinc-900/30 border-white/5"
                        )}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={cn(
                                    "text-xs font-bold uppercase tracking-widest",
                                    event.speaker === 'ai' ? "text-purple-400" : "text-blue-400"
                                )}>
                                    {event.speaker === 'ai' ? "Interviewer" : "Candidate"}
                                </span>

                                {event.tags?.map(tag => (
                                    <span key={tag} className={cn(
                                        "px-2 py-0.5 rounded text-[10px] uppercase font-bold border",
                                        tag === 'Strong Answer' ? "bg-green-500/20 border-green-500/30 text-green-400" :
                                            tag === 'Rambling' || tag === 'Inaccurate' ? "bg-red-500/20 border-red-500/30 text-red-400" :
                                                "bg-gray-700 text-gray-300"
                                    )}>
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <p className={cn(
                                "text-sm leading-relaxed",
                                event.speaker === 'ai' ? "text-gray-400 italic" : "text-gray-200"
                            )}>
                                &ldquo;{event.text}&rdquo;
                            </p>

                            {/* AI Feedback Annotation */}
                            {event.aiFeedback && (
                                <div className="mt-4 flex items-start gap-3 bg-black/40 p-3 rounded-lg border-l-2 border-purple-500">
                                    <div className="mt-0.5">
                                        {event.sentiment === 'positive' ? <ThumbsUp className="w-4 h-4 text-purple-400" /> :
                                            event.sentiment === 'negative' ? <AlertOctagon className="w-4 h-4 text-purple-400" /> :
                                                <HelpCircle className="w-4 h-4 text-purple-400" />}
                                    </div>
                                    <div className="text-sm text-purple-200/80">
                                        <span className="font-bold text-purple-400 mr-2">Analysis:</span>
                                        {event.aiFeedback}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
