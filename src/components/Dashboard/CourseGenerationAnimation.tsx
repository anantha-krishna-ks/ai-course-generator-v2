import { cn } from "@/lib/utils";

/**
 * Custom on-brand SVG loader:
 *  - Floating page with lines being progressively "written"
 *  - Pulsing cursor at the active line
 *  - Orbiting sparkles around the page
 * Uses primary/border semantic tokens. Lightweight, infinite loop.
 */
export function CourseGenerationAnimation({ className }: { className?: string }) {
  return (
    <div
      className={cn("relative w-full h-full flex items-center justify-center", className)}
      role="img"
      aria-label="Generating course content"
    >
      <svg
        viewBox="0 0 240 240"
        className="w-full h-full max-w-[280px] max-h-[280px]"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="cga-page" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--background))" />
            <stop offset="100%" stopColor="hsl(var(--muted))" />
          </linearGradient>
          <filter id="cga-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="hsl(var(--primary))" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* Floating page group */}
        <g style={{ transformOrigin: "120px 120px", animation: "cga-float 3.6s ease-in-out infinite" }}>
          {/* Page */}
          <rect
            x="60"
            y="46"
            width="120"
            height="150"
            rx="10"
            fill="url(#cga-page)"
            stroke="hsl(var(--border))"
            strokeWidth="1.5"
            filter="url(#cga-shadow)"
          />

          {/* Header bar */}
          <rect x="74" y="62" width="56" height="8" rx="3" fill="hsl(var(--primary))" opacity="0.85" />
          <rect x="74" y="76" width="32" height="5" rx="2.5" fill="hsl(var(--border))" />

          {/* Writing lines — each clipped via animated width */}
          {[
            { y: 96, w: 92, delay: "0s" },
            { y: 110, w: 80, delay: "0.6s" },
            { y: 124, w: 96, delay: "1.2s" },
            { y: 138, w: 70, delay: "1.8s" },
            { y: 152, w: 88, delay: "2.4s" },
            { y: 166, w: 60, delay: "3.0s" },
          ].map((l, i) => (
            <g key={i}>
              {/* Faint placeholder line */}
              <rect x="74" y={l.y} width={l.w} height="4" rx="2" fill="hsl(var(--border))" opacity="0.5" />
              {/* Written-in line */}
              <rect
                x="74"
                y={l.y}
                width={l.w}
                height="4"
                rx="2"
                fill="hsl(var(--primary))"
                style={{
                  transformOrigin: `74px ${l.y}px`,
                  animation: `cga-write 3.6s ease-out ${l.delay} infinite`,
                }}
              />
              {/* Cursor at end of line, pulsing during its write window */}
              <rect
                x="74"
                y={l.y - 2}
                width="2"
                height="8"
                rx="1"
                fill="hsl(var(--primary))"
                style={{
                  animation: `cga-cursor 3.6s linear ${l.delay} infinite`,
                  transformOrigin: `74px ${l.y}px`,
                }}
              />
            </g>
          ))}
        </g>

        {/* Orbiting sparkles */}
        <g style={{ transformOrigin: "120px 120px", animation: "cga-orbit 7s linear infinite" }}>
          <g transform="translate(120 30)">
            <Sparkle />
          </g>
        </g>
        <g style={{ transformOrigin: "120px 120px", animation: "cga-orbit 9s linear infinite reverse" }}>
          <g transform="translate(210 120)">
            <Sparkle scale={0.75} />
          </g>
        </g>
        <g style={{ transformOrigin: "120px 120px", animation: "cga-orbit 11s linear infinite" }}>
          <g transform="translate(30 140)">
            <Sparkle scale={0.6} />
          </g>
        </g>
      </svg>

      <style>{`
        @keyframes cga-float {
          0%, 100% { transform: translateY(0) rotate(-0.5deg); }
          50%      { transform: translateY(-6px) rotate(0.5deg); }
        }
        @keyframes cga-write {
          0%      { transform: scaleX(0); }
          60%     { transform: scaleX(1); }
          90%     { transform: scaleX(1); opacity: 1; }
          100%    { transform: scaleX(1); opacity: 0; }
        }
        @keyframes cga-cursor {
          0%      { opacity: 0; transform: translateX(0); }
          5%      { opacity: 1; }
          60%     { opacity: 1; transform: translateX(var(--cga-end, 0px)); }
          70%     { opacity: 0; }
          100%    { opacity: 0; }
        }
        @keyframes cga-orbit {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes cga-sparkle-pulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50%      { transform: scale(1.25); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function Sparkle({ scale = 1 }: { scale?: number }) {
  return (
    <g
      style={{
        transformOrigin: "0px 0px",
        animation: "cga-sparkle-pulse 2.2s ease-in-out infinite",
      }}
      transform={`scale(${scale})`}
    >
      <path
        d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z"
        fill="hsl(var(--primary))"
      />
      <circle r="1.5" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="0.5" />
    </g>
  );
}
