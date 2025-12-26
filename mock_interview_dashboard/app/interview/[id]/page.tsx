'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMediaStream } from '@/lib/hooks/use-media-stream';
import { useSpeechRecognition } from '@/lib/hooks/use-speech-recognition';
import { GeminiLiveClient } from '@/lib/gemini/live-client';
import { AudioVisualizer } from '@/components/interview/AudioVisualizer';
import { TimerOverlay } from '@/components/interview/TimerOverlay';
import { InterviewPhase } from '@/types';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type TranscriptItem = { speaker: 'user' | 'ai', text: string, timestamp: number };

export default function InterviewPage() {
    const { id } = useParams();
    const router = useRouter();
    const { stream, error } = useMediaStream();
    const { start: startSpeech, stop: stopSpeech, text: userSpeechText, isListening } = useSpeechRecognition();

    // Timer State (Lifted Up)
    const DURATION = 420; // 7 mins
    const [timeLeft, setTimeLeft] = useState(DURATION);
    const [phase, setPhase] = useState<InterviewPhase>('warmup');

    const [isConnected, setIsConnected] = useState(false);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    const clientRef = useRef<GeminiLiveClient | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioQueue = useRef<string[]>([]);
    const isPlayingRef = useRef(false);

    const transcriptRef = useRef<TranscriptItem[]>([]);

    // Initialize Audio Context once
    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        return () => {
            audioContextRef.current?.close();
        };
    }, []);

    // Speech Recognition Sync
    useEffect(() => {
        if (userSpeechText) {
            const lastItem = transcriptRef.current[transcriptRef.current.length - 1];
            // Simple debouncing/grouping: if speaker is user and time diff < 2s, append
            const now = DURATION - timeLeft;
            if (lastItem && lastItem.speaker === 'user' && (now - lastItem.timestamp) < 5) {
                lastItem.text = userSpeechText; // Update dynamic
            } else {
                transcriptRef.current.push({ speaker: 'user', text: userSpeechText, timestamp: now });
            }
        }
    }, [userSpeechText, timeLeft]);

    const playNextChunk = async () => {
        if (isPlayingRef.current || audioQueue.current.length === 0 || !audioContextRef.current) return;

        isPlayingRef.current = true;
        const base64Audio = audioQueue.current.shift()!;

        try {
            const binaryString = window.atob(base64Audio);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const float32Data = new Float32Array(len / 2);
            const dataView = new DataView(bytes.buffer);

            for (let i = 0; i < len / 2; i++) {
                const int16 = dataView.getInt16(i * 2, true);
                float32Data[i] = int16 / 32768.0;
            }

            const buffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000);
            buffer.getChannelData(0).set(float32Data);

            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContextRef.current.destination);

            source.onended = () => {
                isPlayingRef.current = false;
                playNextChunk();
            };

            source.start();

        } catch (e) {
            console.error("Audio Playback Error", e);
            isPlayingRef.current = false;
            playNextChunk();
        }
    };

    // Initialize Client & Speech
    useEffect(() => {
        const initClient = async () => {
            try {
                const wsUrl = 'ws://localhost:8080';
                const client = new GeminiLiveClient(wsUrl);

                client.on('connected', () => {
                    setIsConnected(true);
                    console.log("Connected to Gemini Proxy");
                    startSpeech(); // Start listening to user

                    // Trigger AI
                    setTimeout(() => {
                        console.log("Triggering AI Intro...");
                        client.sendText("Hello. I am ready for the interview. Please introduce yourself and start.");
                    }, 1500);
                });

                client.on('audio', (base64Audio: string) => {
                    audioQueue.current.push(base64Audio);
                    playNextChunk();
                });

                client.on('content', (text: string) => {
                    // Capture AI Text
                    const now = DURATION - timeLeft;
                    transcriptRef.current.push({ speaker: 'ai', text, timestamp: now });
                    console.log("AI:", text);
                });

                client.on('disconnected', () => {
                    setIsConnected(false);
                    stopSpeech();
                });

                client.on('error', (err: any) => {
                    console.error("Gemini Error:", err);
                    setIsConnected(false);
                });

                client.connect(); // Connects to proxy
                clientRef.current = client;

            } catch (e) {
                console.error("Failed to init API", e);
            }
        };
        initClient();

        return () => {
            clientRef.current?.disconnect();
            stopSpeech();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Audio Pipeline
    useEffect(() => {
        if (!stream || !clientRef.current || !isConnected || !isMicOn) return;

        let audioContext: AudioContext;
        let source: MediaStreamAudioSourceNode;
        let workletNode: AudioWorkletNode;

        const startAudioPipeline = async () => {
            try {
                audioContext = new AudioContext({ sampleRate: 16000 }); // Try to force 16k
                await audioContext.audioWorklet.addModule('/pcm-processor.js');

                source = audioContext.createMediaStreamSource(stream);
                workletNode = new AudioWorkletNode(audioContext, 'pcm-processor');

                workletNode.port.onmessage = (event) => {
                    const float32Data = event.data;
                    // Convert Float32 to Int16
                    const int16Data = new Int16Array(float32Data.length);
                    for (let i = 0; i < float32Data.length; i++) {
                        int16Data[i] = Math.max(-1, Math.min(1, float32Data[i])) * 0x7FFF;
                    }

                    // Convert to base64
                    const buffer = int16Data.buffer;
                    let binary = '';
                    const bytes = new Uint8Array(buffer);
                    for (let i = 0; i < bytes.byteLength; i++) {
                        binary += String.fromCharCode(bytes[i]);
                    }
                    const base64 = typeof window !== 'undefined' ? window.btoa(binary) : '';

                    clientRef.current?.sendAudio(base64);
                };

                source.connect(workletNode);
                workletNode.connect(audioContext.destination); // Keep alive
            } catch (e) {
                console.error("Audio Pipeline Error", e);
            }
        };

        startAudioPipeline();

        return () => {
            source?.disconnect();
            workletNode?.disconnect();
            audioContext?.close();
        };
    }, [stream, isConnected, isMicOn]);

    // Bind Stream to Video
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    // Timer Logic & System Injections
    useEffect(() => {
        if (timeLeft <= 0) {
            handleTimeEnd();
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                const newValue = prev - 1;

                // Phase Logic
                const elapsed = DURATION - newValue;
                if (elapsed < 60) setPhase('warmup');
                else if (elapsed < 180) setPhase('frontend');
                else if (elapsed < 300) setPhase('backend');
                else if (elapsed < 360) setPhase('behavioral');
                else setPhase('rapid_fire');

                // System Injections
                if (newValue === 300) clientRef.current?.sendText("[SYSTEM: 5 minutes remaining. Move to Frontend Technical questions.]");
                if (newValue === 180) clientRef.current?.sendText("[SYSTEM: 3 minutes remaining. Move to Backend System Design.]");
                if (newValue === 60) clientRef.current?.sendText("[SYSTEM: 1 minute remaining. Start Behavioral checks.]");
                if (newValue === 10) clientRef.current?.sendText("[SYSTEM: 10 seconds remaining. Wrap up quickly.]");

                return newValue;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft]);

    // Handle Mic Toggle
    useEffect(() => {
        if (isMicOn) startSpeech();
        else stopSpeech();
        // Media stream track toggle logic existing...
        if (stream) {
            stream.getAudioTracks().forEach(t => t.enabled = isMicOn);
            stream.getVideoTracks().forEach(t => t.enabled = isCamOn);
        }
    }, [isMicOn, isCamOn, stream]);

    const handleTimeEnd = async () => {
        if (isGeneratingReport) return;
        setIsGeneratingReport(true);
        clientRef.current?.disconnect(); // Stop interview
        stopSpeech();

        console.log("Generating Report for Transcript:", transcriptRef.current);

        try {
            // Call API to generate report
            const res = await fetch('/api/report/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transcript: transcriptRef.current,
                    interviewId: id
                })
            });

            if (res.ok) {
                router.push(`/report/${id}`);
            } else {
                console.error("Report Generation Failed");
                // Navigate anyway to show partial/mock or error
                router.push(`/report/${id}`);
            }
        } catch (e) {
            console.error("Report Gen Error", e);
            router.push(`/report/${id}`);
        }
    };

    if (isGeneratingReport) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                <h2 className="text-xl font-light">Generating Intelligence Report...</h2>
                <p className="text-gray-500">Analyzing {transcriptRef.current.length} interactions</p>
            </div>
        )
    }

    return (
        <div className="relative min-h-screen bg-black text-white overflow-hidden flex flex-col items-center justify-center">
            {/* Timer & Overlay - Controlled Component Now */}
            <div className="fixed top-0 left-0 w-full z-50 pointer-events-none">
                <div className="h-1 bg-gray-800 w-full">
                    <div
                        className={`h-full transition-all duration-1000 ease-linear ${timeLeft < 60 ? "bg-red-600" : "bg-blue-600"}`}
                        style={{ width: `${(timeLeft / DURATION) * 100}%` }}
                    />
                </div>
                <div className="absolute top-4 right-8 bg-black/80 text-white px-4 py-2 rounded-full font-mono text-xl border border-white/10 backdrop-blur-md">
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                    <span className="ml-2 text-xs text-gray-400 uppercase tracking-widest border-l border-gray-600 pl-2">
                        {phase}
                    </span>
                </div>
            </div>

            <div className="flex-1 w-full max-w-6xl p-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">

                {/* AI Representation */}
                <div className="flex flex-col items-center justify-center space-y-8 animate-pulse">
                    <div className="w-64 h-64 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 shadow-[0_0_100px_rgba(59,130,246,0.3)]">
                        <div className="w-32 h-32 rounded-full bg-blue-500/10 blur-xl animate-bounce" />
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-light tracking-wider font-mono">GEMINI LIVE</h2>
                        <p className="text-sm text-gray-500 uppercase tracking-widest">{isConnected ? "Listening..." : "Connecting..."}</p>
                        {isListening && <p className="text-xs text-green-500">Mic Active</p>}
                    </div>

                    <AudioVisualizer stream={stream} />
                </div>

                {/* User View */}
                <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    {error ? (
                        <div className="flex items-center justify-center h-full text-red-500">Camera Error</div>
                    ) : (
                        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                    )}

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-4 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMicOn(!isMicOn)}
                            className="rounded-full hover:bg-white/10 text-white"
                        >
                            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 text-red-500" />}
                        </Button>
                        <Button
                            variant="destructive"
                            size="lg"
                            onClick={() => handleTimeEnd()}
                            className="rounded-full shadow-lg shadow-red-900/20 mx-2"
                        >
                            <PhoneOff className="w-6 h-6 fill-current" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsCamOn(!isCamOn)}
                            className="rounded-full hover:bg-white/10 text-white"
                        >
                            {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5 text-red-500" />}
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}
