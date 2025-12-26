'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { InterviewPhase } from '@/types';

interface TimerOverlayProps {
    durationSeconds: number; // 420 for 7 mins
    onTimeEnd: () => void;
    currentPhase: InterviewPhase;
}

export function TimerOverlay({ durationSeconds, onTimeEnd, currentPhase }: TimerOverlayProps) {
    const [timeLeft, setTimeLeft] = useState(durationSeconds);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeEnd();
            return;
        }
        const interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLeft, onTimeEnd]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const progress = ((durationSeconds - timeLeft) / durationSeconds) * 100;

    return (
        <div className="fixed top-0 left-0 w-full z-50 pointer-events-none">
            <div className="h-1 bg-gray-800 w-full">
                <div
                    className={cn("h-full transition-all duration-1000 ease-linear",
                        progress > 90 ? "bg-red-600" : "bg-blue-600"
                    )}
                    style={{ width: `${progress}%` }}
                />
            </div>
            <div className="absolute top-4 right-8 bg-black/80 text-white px-4 py-2 rounded-full font-mono text-xl border border-white/10 backdrop-blur-md">
                {minutes}:{seconds.toString().padStart(2, '0')}
                <span className="ml-2 text-xs text-gray-400 uppercase tracking-widest border-l border-gray-600 pl-2">
                    {currentPhase}
                </span>
            </div>
        </div>
    );
}
