/**
 * Realistic, brand-style document icons for learner proficiency levels.
 * Each icon represents a skill level with distinctive visual identity
 * using the folded-corner document style with colored ribbons.
 */

type IconProps = {
  className?: string;
};

const baseProps = {
  viewBox: "0 0 48 48",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": "true" as const,
  focusable: "false" as const,
};

/** Shared document frame with folded corner and colored ribbon */
function DocumentFrame({
  ribbon,
  ribbonDark,
  glyph,
  accentColor,
  className,
}: {
  ribbon: string;
  ribbonDark: string;
  glyph?: React.ReactNode;
  accentColor?: string;
  className?: string;
}) {
  return (
    <svg {...baseProps} className={className}>
      {/* Page body with subtle gradient */}
      <defs>
        <linearGradient id={`pageGrad-${ribbon.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>
      </defs>
      <path
        d="M14 4 H34 L42 12 V42 a2 2 0 0 1 -2 2 H14 a2 2 0 0 1 -2 -2 V6 a2 2 0 0 1 2 -2 z"
        fill={`url(#pageGrad-${ribbon.replace('#', '')})`}
        stroke="#D8DEE6"
        strokeWidth="0.75"
      />
      {/* Folded corner */}
      <path d="M34 4 V12 H42 Z" fill="#E6EAF0" />
      {/* Left ribbon */}
      <path
        d="M6 14 a2 2 0 0 1 2 -2 H22 a2 2 0 0 1 2 2 V34 a2 2 0 0 1 -2 2 H8 a2 2 0 0 1 -2 -2 z"
        fill={ribbon}
      />
      {/* Ribbon shadow tab */}
      <path d="M22 36 L26 32 V36 z" fill={ribbonDark} />
      {/* Glyph content */}
      {glyph}
    </svg>
  );
}

/** Beginners level - Sprout/Seedling icon */
export function BeginnerIcon({ className }: IconProps) {
  return (
    <DocumentFrame
      ribbon="#22C55E"
      ribbonDark="#16A34A"
      className={className}
      glyph={
        <>
          {/* Seed/soil base */}
          <ellipse cx="24" cy="36" rx="6" ry="3" fill="#8B5E3C" />
          {/* Sprout stem */}
          <path
            d="M24 36 Q24 28 24 24"
            stroke="#22C55E"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Left leaf */}
          <ellipse
            cx="20"
            cy="22"
            rx="5"
            ry="3"
            fill="#4ADE80"
            transform="rotate(-30 20 22)"
          />
          {/* Right leaf */}
          <ellipse
            cx="28"
            cy="22"
            rx="5"
            ry="3"
            fill="#4ADE80"
            transform="rotate(30 28 22)"
          />
        </>
      }
    />
  );
}

/** Intermediate level - Growing rocket/chart icon */
export function IntermediateIcon({ className }: IconProps) {
  return (
    <DocumentFrame
      ribbon="#3B82F6"
      ribbonDark="#2563EB"
      className={className}
      glyph={
        <>
          {/* Bar chart / growing bars */}
          <rect x="16" y="32" width="4" height="4" rx="0.5" fill="#3B82F6" />
          <rect x="22" y="26" width="4" height="10" rx="0.5" fill="#60A5FA" />
          <rect x="28" y="20" width="4" height="16" rx="0.5" fill="#93C5FD" />
          {/* Upward arrow */}
          <path
            d="M14 22 L20 16 L26 22"
            stroke="#2563EB"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M20 16 V12"
            stroke="#2563EB"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <polygon points="17.5,13 20,9 22.5,13" fill="#2563EB" />
        </>
      }
    />
  );
}

/** Expert level - Crown/achievement icon */
export function ExpertIcon({ className }: IconProps) {
  return (
    <DocumentFrame
      ribbon="#A855F7"
      ribbonDark="#9333EA"
      className={className}
      glyph={
        <>
          {/* Crown base */}
          <path
            d="M14 32 L16 22 L20 26 L24 18 L28 26 L32 22 L34 32 Q34 34 32 34 H16 Q14 34 14 32 Z"
            fill="#F59E0B"
            stroke="#D97706"
            strokeWidth="0.5"
          />
          {/* Crown jewels */}
          <circle cx="16" cy="22" r="2" fill="#EF4444" />
          <circle cx="24" cy="18" r="2.5" fill="#3B82F6" />
          <circle cx="32" cy="22" r="2" fill="#22C55E" />
          {/* Star sparkles */}
          <path
            d="M36 14 L37 17 L40 17 L37.5 19 L38.5 22 L36 20 L33.5 22 L34.5 19 L32 17 L35 17 Z"
            fill="#FBBF24"
          />
        </>
      }
    />
  );
}
