"use client";

import { BrainCircuit, Sparkles } from "lucide-react";

const WORDMARK = "Finance AI";

export function Preloader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] px-4 relative overflow-hidden select-none">
      
      {/* Background Ambient Glow */}
      <div className="absolute w-72 h-72 bg-[var(--color-primary)] opacity-15 blur-3xl rounded-full pointer-events-none animate-pulse" />
      <div className="absolute w-56 h-56 bg-[var(--color-accent)] opacity-15 blur-2xl rounded-full pointer-events-none animate-pulse delay-700" />

      {/* Main Spinner Container */}
      <div className="relative w-24 h-24 flex items-center justify-center mb-6">
        
        {/* SVG Gradient Definition & Rings */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 animate-[spin_6s_linear_infinite]"
          viewBox="0 0 100 100"
          fill="none"
        >
          <defs>
            <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="50%" stopColor="var(--color-accent)" />
              <stop offset="100%" stopColor="var(--color-primary)" />
            </linearGradient>
          </defs>

          {/* Outer Track Ring */}
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="var(--color-border)"
            strokeWidth="3"
            strokeDasharray="4 4"
            className="opacity-40"
          />

          {/* Animated Animated Loading Arc */}
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="url(#ring-gradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            pathLength={100}
            strokeDasharray={100}
            className="animate-ring-draw"
          />
        </svg>

        {/* Center Logo Icon Box */}
        <div className="relative z-10 w-12 h-12 rounded-2xl bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/30 ring-4 ring-[var(--background)]">
          <BrainCircuit className="w-6 h-6 text-white animate-pulse" />
          
          {/* Floating Sparkle Badge */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <Sparkles className="relative w-3 h-3 text-yellow-300" />
          </span>
        </div>
      </div>

      {/* Wordmark Typography */}
      <div className="flex text-2xl font-extrabold tracking-tight">
        {WORDMARK.split("").map((char, i) => {
          const isAI = i >= 8; // Menandai kata "AI"
          return (
            <span
              key={i}
              className={`inline-block animate-letter-in transition-all ${
                isAI
                  ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent font-black"
                  : "text-[var(--foreground)]"
              }`}
              style={{
                animationDelay: `${i * 50}ms`,
                width: char === " " ? "0.4em" : undefined,
              }}
            >
              {char}
            </span>
          );
        })}
      </div>

      {/* Subtext Status Loading Indicator */}
      <div className="mt-3 flex items-center gap-2 text-xs font-medium text-[var(--color-muted)]">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-ping" />
        <span>Menyiapkan ruang kerja finansial...</span>
      </div>

    </div>
  );
}