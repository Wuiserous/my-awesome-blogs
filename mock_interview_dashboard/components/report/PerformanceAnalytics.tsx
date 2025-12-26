'use client';

import { InterviewReport } from "@/types";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

export function PerformanceAnalytics({ scores, behavioral, skills }: {
    scores: InterviewReport['scores'],
    behavioral: InterviewReport['behavioralAnalysis'],
    skills: InterviewReport['skills']
}) {

    // Transform skills for Radar Chart
    const radarData = skills.map(skill => ({
        subject: skill.name,
        A: skill.score,
        fullMark: 100,
    }));

    // Add general pillars if not covered
    if (!radarData.find(d => d.subject === 'Behavioral')) {
        radarData.push({ subject: 'Behavioral', A: scores.behavioral, fullMark: 100 });
    }
    if (!radarData.find(d => d.subject === 'Efficiency')) {
        radarData.push({ subject: 'Efficiency', A: scores.efficiency, fullMark: 100 });
    }

    return (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Radar Chart */}
            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Skill Fingerprint</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid stroke="#333" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="Candidate"
                                dataKey="A"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fill="#3b82f6"
                                fillOpacity={0.3}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Right: Confidence Trend */}
            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Psychological Confidence Replay</h3>
                <p className="text-sm text-gray-500 mb-6">{behavioral.narrative}</p>

                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={behavioral.confidenceTrend}>
                            <defs>
                                <linearGradient id="colorConf" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="timestamp"
                                stroke="#555"
                                tickFormatter={(val) => `${Math.floor(val / 60)}m`}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis domain={[0, 100]} hide />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                                labelFormatter={(val) => `Time: ${Math.floor(val / 60)}m ${val % 60}s`}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-black/40 rounded-lg p-3">
                        <div className="text-2xl font-bold text-white">{behavioral.hesitationCount}</div>
                        <div className="text-xs text-gray-500">Hesitation Spikes</div>
                    </div>
                    <div className="bg-black/40 rounded-lg p-3">
                        <div className="text-2xl font-bold text-white">{(behavioral.fillerWordDensity * 100).toFixed(0)}%</div>
                        <div className="text-xs text-gray-500">Filler Word Density</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
