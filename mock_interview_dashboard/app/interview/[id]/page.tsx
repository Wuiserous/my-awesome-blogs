'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMediaStream } from '@/lib/hooks/use-media-stream';
import { GeminiLiveClient } from '@/lib/gemini/live-client';
import { AudioVisualizer } from '@/components/interview/AudioVisualizer';
import { TimerOverlay } from '@/components/interview/TimerOverlay';
import { InterviewPhase } from '@/types';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InterviewPage() {
    const { id } = useParams();
    const router = useRouter();
    const { stream, error } = useMediaStream();
    const [phase, setPhase] = useState<InterviewPhase>('warmup');
    const [isConnected, setIsConnected] = useState(false);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);

    const clientRef = useRef<GeminiLiveClient | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioQueue = useRef<string[]>([]);
    const isPlayingRef = useRef(false);

    // Initialize Audio Context once
    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        return () => {
            audioContextRef.current?.close();
        };
    }, []);

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

            // For PCM 24kHz (Gemini default), we can't use decodeAudioData easily without a WAV header.
            // But we can create a buffer manually.
            // Gemini sends raw Int16 Little Endian PCM at 24kHz.

            const float32Data = new Float32Array(len / 2);
            const dataView = new DataView(bytes.buffer);

            for (let i = 0; i < len / 2; i++) {
                const int16 = dataView.getInt16(i * 2, true); // Little Endian
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

    // Initialize Client
    useEffect(() => {
        const initClient = async () => {
            try {
                // In production, fetch this from API. For now, we point to our local Proxy.
                // Note: The Proxy runs on 8080 by default in server-proxy.js
                // In a real deployed Next.js app, we'd use a different strategy.
                const wsUrl = 'ws://localhost:8080';

                const client = new GeminiLiveClient(wsUrl);

                client.on('connected', () => {
                    setIsConnected(true);
                    console.log("Connected to Gemini Proxy");

                    // Trigger AI
                    setTimeout(() => {
                        console.log("Triggering AI Intro...");
                        client.sendText("Hello. I am ready for the interview. Please introduce yourself and start.");
                    }, 1500); // 1.5s delay
                });

                client.on('audio', (base64Audio: string) => {
                    console.log("Received Audio Chunk:", base64Audio.substring(0, 20) + "...");
                    audioQueue.current.push(base64Audio);
                    playNextChunk();
                });

                client.on('disconnected', () => {
                    setIsConnected(false);
                    console.log("Disconnected from Gemini Proxy");
                });

                client.on('error', (err: any) => {
                    console.error("Gemini Client Error:", err);
                    setIsConnected(false);
                    // Optional: Show toast or UI error
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
        }
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

    // Toggle Tracks
    useEffect(() => {
        if (stream) {
            stream.getAudioTracks().forEach(t => t.enabled = isMicOn);
            stream.getVideoTracks().forEach(t => t.enabled = isCamOn);
        }
    }, [isMicOn, isCamOn, stream]);

    const handleTimeEnd = () => {
        // End interview
        router.push(`/report/${id}`);
    };

    // Phase Logic (Mocked time-based transitions for the UI demo)
    // In real implementation, the TimerOverlay driving this state is usually fine or the AI drives it.
    useEffect(() => {
        // Mock phase transitions for demonstration
        const timer = setTimeout(() => {
            setPhase('frontend');
        }, 60000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative min-h-screen bg-black text-white overflow-hidden flex flex-col items-center justify-center">
            {/* Timer & Overlay */}
            <TimerOverlay
                durationSeconds={420}
                onTimeEnd={handleTimeEnd}
                currentPhase={phase}
            />

            <div className="flex-1 w-full max-w-6xl p-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">

                {/* AI Representation */}
                <div className="flex flex-col items-center justify-center space-y-8 animate-pulse">
                    <div className="w-64 h-64 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 shadow-[0_0_100px_rgba(59,130,246,0.3)]">
                        <div className="w-32 h-32 rounded-full bg-blue-500/10 blur-xl animate-bounce" />
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-light tracking-wider font-mono">GEMINI LIVE</h2>
                        <p className="text-sm text-gray-500 uppercase tracking-widest">{isConnected ? "Listening..." : "Connecting..."}</p>
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
