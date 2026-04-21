/**
 * Realistic, brand-style format icons for the export dialog.
 * Each icon is a self-contained SVG mimicking the look of the
 * official document/format icons (folded-corner page + colored ribbon).
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

/** Shared "document with folded corner + colored ribbon on the left" frame. */
function DocumentFrame({
  ribbon,
  ribbonDark,
  letter,
  glyph,
  className,
}: {
  ribbon: string;
  ribbonDark: string;
  letter?: string;
  glyph?: React.ReactNode;
  className?: string;
}) {
  return (
    <svg {...baseProps} className={className}>
      {/* Page body */}
      <path
        d="M14 4 H34 L42 12 V42 a2 2 0 0 1 -2 2 H14 a2 2 0 0 1 -2 -2 V6 a2 2 0 0 1 2 -2 z"
        fill="#FFFFFF"
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
      {/* Letter / glyph on ribbon */}
      {letter && (
        <text
          x="15"
          y="29"
          textAnchor="middle"
          fontFamily="'Segoe UI', Arial, sans-serif"
          fontWeight="700"
          fontSize="14"
          fill="#FFFFFF"
        >
          {letter}
        </text>
      )}
      {glyph}
    </svg>
  );
}

export function PowerPointIcon({ className }: IconProps) {
  return <DocumentFrame ribbon="#D04423" ribbonDark="#A8351A" letter="P" className={className} />;
}

export function WordIcon({ className }: IconProps) {
  return <DocumentFrame ribbon="#185ABD" ribbonDark="#0F3F87" letter="W" className={className} />;
}

export function PdfIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path
        d="M14 4 H34 L42 12 V42 a2 2 0 0 1 -2 2 H14 a2 2 0 0 1 -2 -2 V6 a2 2 0 0 1 2 -2 z"
        fill="#FFFFFF"
        stroke="#D8DEE6"
        strokeWidth="0.75"
      />
      <path d="M34 4 V12 H42 Z" fill="#E6EAF0" />
      <rect x="8" y="22" width="28" height="14" rx="2" fill="#E11D2E" />
      <text
        x="22"
        y="33"
        textAnchor="middle"
        fontFamily="'Segoe UI', Arial, sans-serif"
        fontWeight="800"
        fontSize="9.5"
        fill="#FFFFFF"
        letterSpacing="0.5"
      >
        PDF
      </text>
    </svg>
  );
}

export function HtmlIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      {/* Shield-like HTML5 badge */}
      <path
        d="M9 5 L39 5 L36.4 41 L24 44 L11.6 41 Z"
        fill="#E34F26"
      />
      <path
        d="M24 7.5 V41.6 L33.9 39 L36.1 8.5 Z"
        fill="#EF652A"
      />
      <path
        d="M16 14 H32 L31.6 18 H19.6 L19.9 22 H31.2 L30.2 32.5 L24 34.4 L17.8 32.5 L17.4 27.5 H20.5 L20.7 30 L24 30.9 L27.3 30 L27.7 25.5 H17.2 L16.3 14 Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function ScormIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      {/* Package box */}
      <path d="M24 4 L42 12 V34 L24 42 L6 34 V12 Z" fill="#0F9D58" />
      <path d="M24 4 L42 12 L24 20 L6 12 Z" fill="#1FB573" />
      <path d="M24 20 L42 12 V34 L24 42 Z" fill="#0B7A45" />
      {/* Tape line */}
      <path d="M14 8 L32 16 V20 L14 12 Z" fill="#FFFFFF" opacity="0.85" />
      {/* Graduation cap glyph */}
      <path
        d="M24 23 L33 27 L24 31 L15 27 Z"
        fill="#FFFFFF"
      />
      <path d="M28 28.2 V31.5 a4 1.4 0 0 1 -8 0 V28.2" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />
    </svg>
  );
}
