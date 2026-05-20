import { cn } from "@/lib/utils";

/**
 * Modern, on-brand loading animation for AI course generation.
 * A floating document with lines being progressively "written in",
 * surrounded by orbiting sparkles. Uses semantic color tokens.
 */
export function CourseGenerationAnimation({ className }: { className?: string }) {
  return (
    <div
      className={cn("relative w-full h-full", className)}
      role="img"
      aria-label="Generating course content"
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full overflow-visible"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="cga-page" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--card))" />
            <stop offset="100%" stopColor="hsl(var(--muted))" />
          </linearGradient>
          <linearGradient id="cga-accent" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--primary) / 0.5)" />
          </linearGradient>
          <filter id="cga-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Soft halo */}
        <circle cx="100" cy="100" r="62" fill="hsl(var(--primary) / 0.10)" filter="url(#cga-soft)">
          <animate attributeName="r" values="58;66;58" dur="3.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;1;0.6" dur="3.6s" repeatCount="indefinite" />
        </circle>

        {/* Floating page */}
        <g style={{ transformOrigin: "100px 100px" }}>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 -2; 0 2; 0 -2"
            dur="4s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
            keyTimes="0;0.5;1"
          />

          {/* Page shadow */}
          <rect x="62" y="60" width="80" height="92" rx="8" fill="hsl(var(--foreground) / 0.06)" filter="url(#cga-soft)" />

          {/* Page body */}
          <rect
            x="60"
            y="56"
            width="80"
            height="92"
            rx="8"
            fill="url(#cga-page)"
            stroke="hsl(var(--border))"
            strokeWidth="1"
          />

          {/* Header bar */}
          <rect x="70" y="68" width="34" height="5" rx="2.5" fill="hsl(var(--primary))" />
          <rect x="70" y="78" width="20" height="3" rx="1.5" fill="hsl(var(--muted-foreground) / 0.5)" />

          {/* Animated text lines — each grows in then resets, staggered */}
          {[
            { y: 92, max: 60, delay: 0 },
            { y: 102, max: 52, delay: 0.45 },
            { y: 112, max: 58, delay: 0.9 },
            { y: 122, max: 44, delay: 1.35 },
            { y: 132, max: 50, delay: 1.8 },
          ].map((l, i) => (
            <g key={i}>
              <rect x="70" y={l.y} width={l.max} height="3" rx="1.5" fill="hsl(var(--muted) )" />
              <rect x="70" y={l.y} height="3" rx="1.5" fill="url(#cga-accent)">
                <animate
                  attributeName="width"
                  values={`0; ${l.max}; ${l.max}; 0`}
                  keyTimes="0; 0.35; 0.85; 1"
                  dur="3.6s"
                  begin={`${l.delay}s`}
                  repeatCount="indefinite"
                />
              </rect>
            </g>
          ))}

          {/* Writing cursor — tiny pulsing dot at end of growing line */}
          <circle r="2" fill="hsl(var(--primary))">
            <animate
              attributeName="cx"
              values="70; 130; 130; 70"
              keyTimes="0; 0.35; 0.85; 1"
              dur="3.6s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values="92; 92; 132; 132"
              keyTimes="0; 0.35; 0.85; 1"
              dur="3.6s"
              repeatCount="indefinite"
            />
            <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Orbiting sparkles */}
        <g style={{ transformOrigin: "100px 100px" }}>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 100 100"
            to="360 100 100"
            dur="14s"
            repeatCount="indefinite"
          />
          <Sparkle cx={100} cy={38} size={6} />
          <Sparkle cx={162} cy={100} size={4} />
          <Sparkle cx={100} cy={162} size={5} />
          <Sparkle cx={38} cy={100} size={4} />
        </g>

        {/* Counter-rotating small sparkles */}
        <g style={{ transformOrigin: "100px 100px" }}>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="360 100 100"
            to="0 100 100"
            dur="22s"
            repeatCount="indefinite"
          />
          <Sparkle cx={150} cy={50} size={3} />
          <Sparkle cx={50} cy={150} size={3} />
        </g>
      </svg>
    </div>
  );
}

function Sparkle({ cx, cy, size }: { cx: number; cy: number; size: number }) {
  const s = size;
  return (
    <g>
      <path
        d={`M ${cx} ${cy - s} L ${cx + s * 0.35} ${cy - s * 0.35} L ${cx + s} ${cy} L ${cx + s * 0.35} ${cy + s * 0.35} L ${cx} ${cy + s} L ${cx - s * 0.35} ${cy + s * 0.35} L ${cx - s} ${cy} L ${cx - s * 0.35} ${cy - s * 0.35} Z`}
        fill="hsl(var(--primary))"
      >
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" repeatCount="indefinite" />
      </path>
    </g>
  );
}
