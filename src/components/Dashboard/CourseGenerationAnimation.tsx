import { cn } from "@/lib/utils";

/**
 * Animated stack of books with a tea cup on top — inspired by the
 * reference illustration. Gentle bob + steam + tea-bag swing.
 * Pure SVG, no extra deps, fully themable via brand tokens.
 */
export function CourseGenerationAnimation({ className }: { className?: string }) {
  // Brand palette (kept literal to match the illustrated reference)
  const navy = "#1B2A6B";
  const navyDark = "#152155";
  const orange = "#F26B1F";
  const orangeDark = "#D95A12";
  const cream = "#F7F1E3";
  const creamEdge = "#E7DFC9";
  const ink = "#1B2A6B";
  const tea = "#C9651D";

  return (
    <div
      className={cn("relative w-full h-full", className)}
      role="img"
      aria-label="Generating course content"
    >
      <svg
        viewBox="0 0 240 220"
        className="w-full h-full overflow-visible"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="cga-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary) / 0.08)" />
            <stop offset="100%" stopColor="hsl(var(--primary) / 0)" />
          </linearGradient>
        </defs>

        {/* Soft ground shadow */}
        <ellipse cx="120" cy="198" rx="78" ry="6" fill="hsl(var(--foreground) / 0.08)">
          <animate attributeName="rx" values="78;72;78" dur="3.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.35;0.55;0.35" dur="3.6s" repeatCount="indefinite" />
        </ellipse>

        {/* Whole stack — gentle vertical bob */}
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; 0 -3; 0 0"
            dur="3.6s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
            keyTimes="0;0.5;1"
          />

          {/* Book 1 — bottom navy with orange band */}
          <g>
            <rect x="48" y="170" width="144" height="26" rx="3" fill={navy} stroke={navyDark} strokeWidth="2" />
            <rect x="48" y="178" width="144" height="10" fill={orange} />
            <rect x="48" y="178" width="144" height="2" fill={orangeDark} opacity="0.6" />
            <rect x="56" y="174" width="6" height="18" fill={navyDark} opacity="0.5" />
          </g>

          {/* Book 2 — orange, slight offset */}
          <g>
            <rect x="56" y="146" width="132" height="22" rx="3" fill={orange} stroke={orangeDark} strokeWidth="2" />
            <rect x="64" y="152" width="40" height="3" rx="1.5" fill={cream} opacity="0.85" />
            <rect x="64" y="158" width="28" height="2.5" rx="1.25" fill={cream} opacity="0.7" />
          </g>

          {/* Book 3 — cream/white with bookmark */}
          <g>
            <rect x="62" y="124" width="124" height="20" rx="3" fill={cream} stroke={creamEdge} strokeWidth="2" />
            <rect x="62" y="124" width="124" height="3" fill={creamEdge} />
            <rect x="148" y="120" width="6" height="14" fill={orange} />
            <polygon points="148,134 151,130 154,134" fill={orange} />
            <rect x="70" y="132" width="50" height="2" rx="1" fill={ink} opacity="0.35" />
            <rect x="70" y="137" width="36" height="2" rx="1" fill={ink} opacity="0.25" />
          </g>

          {/* Book 4 — navy thin */}
          <g>
            <rect x="70" y="106" width="108" height="16" rx="3" fill={navy} stroke={navyDark} strokeWidth="2" />
            <rect x="70" y="106" width="108" height="3" fill={navyDark} />
            <circle cx="124" cy="114" r="3" fill={orange} />
          </g>

          {/* Book 5 — orange small top */}
          <g>
            <rect x="80" y="90" width="88" height="14" rx="3" fill={orange} stroke={orangeDark} strokeWidth="2" />
            <rect x="86" y="95" width="30" height="2" rx="1" fill={cream} opacity="0.9" />
            <rect x="86" y="99" width="20" height="2" rx="1" fill={cream} opacity="0.7" />
          </g>

          {/* Tea cup on top */}
          <g style={{ transformOrigin: "120px 80px" }}>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0; 0 -1.5; 0 0"
              dur="3.6s"
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
              keyTimes="0;0.5;1"
            />

            {/* Cup body */}
            <path
              d="M 100 60 L 140 60 L 137 86 Q 137 90 132 90 L 108 90 Q 103 90 103 86 Z"
              fill={cream}
              stroke={ink}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Cup rim */}
            <ellipse cx="120" cy="60" rx="20" ry="3.2" fill={cream} stroke={ink} strokeWidth="2" />
            {/* Tea surface */}
            <ellipse cx="120" cy="60" rx="16" ry="2.2" fill={tea} opacity="0.85" />
            {/* Handle */}
            <path
              d="M 140 66 Q 152 66 152 75 Q 152 84 140 82"
              fill="none"
              stroke={ink}
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Tea bag string + tag */}
            <g style={{ transformOrigin: "125px 60px" }}>
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="-4 125 60; 4 125 60; -4 125 60"
                dur="2.8s"
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
                keyTimes="0;0.5;1"
              />
              <line x1="125" y1="60" x2="131" y2="78" stroke={ink} strokeWidth="1.2" />
              <rect x="128" y="78" width="8" height="6" rx="1" fill={orange} stroke={ink} strokeWidth="1" />
            </g>
          </g>

          {/* Steam — three wisps rising and fading */}
          {[
            { x: 112, delay: 0 },
            { x: 120, delay: 0.6 },
            { x: 128, delay: 1.2 },
          ].map((s, i) => (
            <g key={i}>
              <path
                d={`M ${s.x} 56 q -4 -6 0 -12 q 4 -6 0 -12`}
                fill="none"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0"
              >
                <animate
                  attributeName="opacity"
                  values="0; 0.55; 0"
                  keyTimes="0; 0.5; 1"
                  dur="2.4s"
                  begin={`${s.delay}s`}
                  repeatCount="indefinite"
                />
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0 0; 0 -10"
                  dur="2.4s"
                  begin={`${s.delay}s`}
                  repeatCount="indefinite"
                />
              </path>
            </g>
          ))}
        </g>

        {/* Floor wash */}
        <rect x="0" y="196" width="240" height="20" fill="url(#cga-floor)" />
      </svg>
    </div>
  );
}
