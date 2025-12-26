import Link from "next/link";
import { ArrowRight, Clock, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-32 pb-20 flex flex-col items-center text-center space-y-8">
        <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-sm font-medium text-blue-400">Gemini Live Powered</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
          7 Minutes.<br />No Mercy.
        </h1>

        <p className="max-w-xl text-lg text-gray-400 leading-relaxed">
          The rigorous, AI-driven mock interview platform for Senior Full-Stack Engineers.
          Real-time pressure. Recruiter-grade analysis. Zero humans involved.
        </p>

        <div className="pt-8">
          <Link
            href={`/interview/${Date.now()}`}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-blue-600 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 hover:bg-blue-700 hover:scale-105"
          >
            Start Interview
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: <Clock className="w-8 h-8 text-blue-500" />,
            title: "Strict Timeboxing",
            desc: "7 minutes hard stop. Learn to communicate with executive brevity."
          },
          {
            icon: <Zap className="w-8 h-8 text-purple-500" />,
            title: "Adaptive AI",
            desc: "Powered by Gemini Live. It interrupts rambling and drills down on weakness."
          },
          {
            icon: <ShieldCheck className="w-8 h-8 text-green-500" />,
            title: "Defensible Scoring",
            desc: "Get a breakdown of your Technical Depth, Communication, and Behavioral signals."
          }
        ].map((feature, i) => (
          <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
            <div className="mb-4">{feature.icon}</div>
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-gray-400">{feature.desc}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
