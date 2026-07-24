const WORDMARK = "Finance AI";

export function Preloader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] gap-6">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80" fill="none">
          <defs>
            <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="100%" stopColor="var(--color-accent)" />
            </linearGradient>
          </defs>
          <circle
            cx="40"
            cy="40"
            r="35"
            stroke="var(--color-border)"
            strokeWidth="2.5"
            fill="none"
          />
          <circle
            cx="40"
            cy="40"
            r="35"
            stroke="url(#ring-gradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            pathLength={100}
            strokeDasharray={100}
            className="animate-ring-draw"
          />
        </svg>
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/20">
          <span className="text-white font-bold text-lg">F</span>
        </div>
      </div>

      <div className="flex text-lg font-semibold text-[var(--foreground)] tracking-wide">
        {WORDMARK.split("").map((char, i) => (
          <span
            key={i}
            className="inline-block animate-letter-in"
            style={{
              animationDelay: `${i * 45}ms`,
              width: char === " " ? "0.35em" : undefined,
            }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}