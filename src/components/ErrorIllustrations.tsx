import type { SVGProps } from "react";

/**
 * Premium error illustrations.
 *
 * Style notes:
 * - Isometric line-art with subtle multi-tone fills for depth
 * - Soft radial ground shadow via gradient
 * - Refined facial expressions (rounded eyes, blush, highlights)
 * - Graceful dashed motion lines and decorative accents
 * - Uses semantic tokens (primary/warning/info/destructive/muted-foreground)
 *   so illustrations adapt to theme.
 */

const baseProps = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 260 220",
  fill: "none",
  "aria-hidden": true,
  focusable: false,
} as const;

/** Shared defs: soft radial shadow + subtle face highlight */
const Defs = ({ id, tone = "primary" }: { id: string; tone?: "primary" | "warning" | "info" | "muted" | "destructive" }) => (
  <defs>
    <radialGradient id={`${id}-shadow`} cx="50%" cy="50%" r="50%">
      <stop offset="0%" className={`[stop-color:hsl(var(--${tone === "muted" ? "muted-foreground" : tone}))]`} stopOpacity="0.22" />
      <stop offset="70%" className={`[stop-color:hsl(var(--${tone === "muted" ? "muted-foreground" : tone}))]`} stopOpacity="0.05" />
      <stop offset="100%" className={`[stop-color:hsl(var(--${tone === "muted" ? "muted-foreground" : tone}))]`} stopOpacity="0" />
    </radialGradient>
  </defs>
);

const Shadow = ({ id, cx = 130, cy = 198, rx = 80, ry = 10 }: { id: string; cx?: number; cy?: number; rx?: number; ry?: number }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${id}-shadow)`} />
);

const Cheeks = ({ left, right, y, tone = "primary" }: { left: number; right: number; y: number; tone?: string }) => (
  <>
    <circle cx={left} cy={y} r="2.6" className={`fill-${tone}/30`} />
    <circle cx={right} cy={y} r="2.6" className={`fill-${tone}/30`} />
  </>
);

/* Eye with subtle highlight */
const Eye = ({ cx, cy, r = 2.4, tone = "primary" }: { cx: number; cy: number; r?: number; tone?: string }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} className={`fill-${tone}`} />
    <circle cx={cx - r * 0.35} cy={cy - r * 0.45} r={r * 0.32} className="fill-background" />
  </g>
);

/* ─────────── 500 — Sad open box, bug escapes ─────────── */
export const ServerErrorIllustration = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <Defs id="err500" tone="primary" />
    <Shadow id="err500" />

    {/* dashed bug trail */}
    <path
      d="M188 30 C 168 46, 198 70, 168 92"
      className="stroke-primary/70"
      strokeWidth="1.6"
      strokeDasharray="3 5"
      strokeLinecap="round"
      fill="none"
    />
    {/* bug */}
    <g>
      <ellipse cx="192" cy="26" rx="6" ry="5" className="fill-primary/15 stroke-primary" strokeWidth="1.8" />
      <line x1="192" y1="21" x2="192" y2="26" className="stroke-primary" strokeWidth="1.4" />
      <line x1="187" y1="22" x2="183" y2="18" className="stroke-primary" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="197" y1="22" x2="201" y2="18" className="stroke-primary" strokeWidth="1.4" strokeLinecap="round" />
    </g>

    {/* Box — isometric with depth */}
    <g strokeLinejoin="round" strokeLinecap="round">
      {/* bottom interior shadow */}
      <path d="M82 110 L130 122 L178 110 L130 124 Z" className="fill-primary/10" />
      {/* back inner wall */}
      <path d="M82 110 L130 96 L178 110 L130 124 Z" className="fill-primary/5 stroke-primary" strokeWidth="2" />
      {/* front face */}
      <path d="M82 110 L82 174 L130 188 L130 124 Z" className="fill-background stroke-primary" strokeWidth="2.2" />
      {/* right face — slightly darker */}
      <path d="M178 110 L178 174 L130 188 L130 124 Z" className="fill-primary/8 stroke-primary" strokeWidth="2.2" />
      {/* top rim accents */}
      <path d="M82 110 L130 96 L178 110" className="stroke-primary" strokeWidth="2.2" fill="none" />
      {/* fold lines for craft */}
      <path d="M88 116 L88 172" className="stroke-primary/30" strokeWidth="1" fill="none" />
      <path d="M172 116 L172 172" className="stroke-primary/30" strokeWidth="1" fill="none" />
    </g>

    {/* Sad face */}
    <g>
      <Eye cx={98} cy={140} r={2.6} tone="primary" />
      <Eye cx={118} cy={140} r={2.6} tone="primary" />
      {/* eyebrows */}
      <path d="M93 132 q5 -2 10 1" className="stroke-primary" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M113 133 q5 -3 10 -1" className="stroke-primary" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      {/* mouth */}
      <path d="M100 158 Q108 150 116 158" className="stroke-primary" strokeWidth="2" strokeLinecap="round" fill="none" />
      <Cheeks left={92} right={122} y={150} />
      {/* tear */}
      <path d="M96 146 q-1 5 1 6 q3 -1 1 -6 z" className="fill-primary/60" />
    </g>
  </svg>
);

/* ─────────── 404 — Folded map with pin ─────────── */
export const NotFoundIllustration = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <Defs id="err404" tone="primary" />
    <Shadow id="err404" />

    {/* search swirl with question */}
    <path d="M180 32 q16 8 9 26 q-7 18 -26 9" className="stroke-primary/55" strokeWidth="1.6" strokeDasharray="3 5" strokeLinecap="round" fill="none" />
    <circle cx="190" cy="38" r="9" className="fill-primary/10 stroke-primary" strokeWidth="1.8" />
    <text x="186.5" y="42" className="fill-primary" fontSize="11" fontFamily="ui-serif, Georgia, serif" fontWeight="700">?</text>

    {/* Map — folded isometric */}
    <g strokeLinejoin="round" strokeLinecap="round">
      {/* base */}
      <path d="M58 100 L130 84 L202 100 L202 174 L130 192 L58 174 Z" className="fill-background stroke-primary" strokeWidth="2.2" />
      {/* fold crease shading */}
      <path d="M106 90 L106 187" className="stroke-primary/30" strokeWidth="1.2" />
      <path d="M154 90 L154 187" className="stroke-primary/30" strokeWidth="1.2" />
      {/* fold gusset hints */}
      <path d="M106 90 L98 96 M106 187 L98 181" className="stroke-primary/40" strokeWidth="1" />
      <path d="M154 90 L162 96 M154 187 L162 181" className="stroke-primary/40" strokeWidth="1" />
      {/* roads */}
      <path d="M70 120 Q130 142 192 110" className="stroke-primary/45" strokeWidth="1.4" strokeDasharray="3 4" fill="none" />
      <path d="M70 154 Q130 138 192 162" className="stroke-primary/45" strokeWidth="1.4" strokeDasharray="3 4" fill="none" />
      {/* tiny landmarks */}
      <circle cx="80" cy="140" r="1.6" className="fill-primary/50" />
      <circle cx="180" cy="138" r="1.6" className="fill-primary/50" />
      {/* pin */}
      <path d="M130 122 q-9 0 -9 10 q0 10 9 18 q9 -8 9 -18 q0 -10 -9 -10 z" className="fill-primary/15 stroke-primary" strokeWidth="2" />
      <circle cx="130" cy="132" r="3" className="fill-primary" />
      <circle cx="129" cy="131" r="0.9" className="fill-background" />
    </g>
  </svg>
);

/* ─────────── 403 — Padlock character ─────────── */
export const ForbiddenIllustration = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <Defs id="err403" tone="warning" />
    <Shadow id="err403" />

    {/* No-entry mark */}
    <g>
      <circle cx="196" cy="44" r="11" className="fill-warning/10 stroke-warning" strokeWidth="2" />
      <line x1="188" y1="44" x2="204" y2="44" className="stroke-warning" strokeWidth="2.4" strokeLinecap="round" />
    </g>

    {/* Shackle (with thickness illusion) */}
    <g strokeLinejoin="round" strokeLinecap="round" fill="none">
      <path d="M100 110 L100 88 Q100 56 130 56 Q160 56 160 88 L160 110" className="stroke-warning" strokeWidth="3" />
      <path d="M105 110 L105 88 Q105 61 130 61 Q155 61 155 88 L155 110" className="stroke-warning/40" strokeWidth="1.2" />
    </g>

    {/* Body — isometric */}
    <g strokeLinejoin="round" strokeLinecap="round">
      {/* top */}
      <path d="M76 116 L130 102 L184 116 L130 130 Z" className="fill-warning/10 stroke-warning" strokeWidth="2.2" />
      {/* front */}
      <path d="M76 116 L76 178 L130 192 L130 130 Z" className="fill-background stroke-warning" strokeWidth="2.2" />
      {/* side */}
      <path d="M184 116 L184 178 L130 192 L130 130 Z" className="fill-warning/10 stroke-warning" strokeWidth="2.2" />
      {/* keyhole */}
      <circle cx="103" cy="153" r="5" className="fill-warning/15 stroke-warning" strokeWidth="1.6" />
      <path d="M103 157 L100 168 L106 168 Z" className="fill-warning" />
    </g>

    {/* Stern but cute face */}
    <g>
      <Eye cx={92} cy={140} r={2.4} tone="warning" />
      <Eye cx={114} cy={140} r={2.4} tone="warning" />
      {/* furrowed brows */}
      <path d="M86 132 l8 3" className="stroke-warning" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M120 132 l-8 3" className="stroke-warning" strokeWidth="1.8" strokeLinecap="round" />
      {/* flat mouth */}
      <path d="M97 168 q6 -2 12 0" className="stroke-warning" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <Cheeks left={88} right={118} y={156} tone="warning" />
    </g>
  </svg>
);

/* ─────────── 401 — Door with key ─────────── */
export const UnauthorizedIllustration = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <Defs id="err401" tone="info" />
    <Shadow id="err401" />

    {/* Key motion path */}
    <path d="M214 64 q-18 6 -22 28" className="stroke-info/55" strokeWidth="1.6" strokeDasharray="3 5" strokeLinecap="round" fill="none" />

    {/* Door frame */}
    <g strokeLinejoin="round" strokeLinecap="round">
      {/* outer */}
      <path d="M58 64 L138 52 L138 188 L58 200 Z" className="fill-info/10 stroke-info" strokeWidth="2.2" />
      {/* inner panel */}
      <path d="M72 84 L126 76 L126 174 L72 184 Z" className="fill-background stroke-info" strokeWidth="2" />
      {/* small panel divisions */}
      <path d="M72 130 L126 124" className="stroke-info/30" strokeWidth="1" />
      {/* handle */}
      <circle cx="116" cy="138" r="3.2" className="fill-info" />
      <circle cx="115" cy="137" r="1" className="fill-background" />
    </g>

    {/* Door face — peeking */}
    <g>
      <Eye cx={88} cy={118} r={2.2} tone="info" />
      <Eye cx={104} cy={115} r={2.2} tone="info" />
      <path d="M88 134 Q96 128 104 132" className="stroke-info" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <Cheeks left={84} right={108} y={126} tone="info" />
    </g>

    {/* Key character */}
    <g strokeLinejoin="round" strokeLinecap="round">
      <circle cx="184" cy="108" r="16" className="fill-background stroke-info" strokeWidth="2.2" />
      <line x1="200" y1="108" x2="236" y2="108" className="stroke-info" strokeWidth="2.4" />
      <line x1="224" y1="108" x2="224" y2="120" className="stroke-info" strokeWidth="2.4" />
      <line x1="232" y1="108" x2="232" y2="118" className="stroke-info" strokeWidth="2.4" />
      {/* face */}
      <Eye cx={179} cy={106} r={1.6} tone="info" />
      <Eye cx={189} cy={106} r={1.6} tone="info" />
      <path d="M179 114 q5 3 10 0" className="stroke-info" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </g>
  </svg>
);

/* ─────────── 503 — Toolbox & wrench ─────────── */
export const MaintenanceIllustration = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <Defs id="err503" tone="warning" />
    <Shadow id="err503" />

    {/* sparkle accents */}
    <g className="stroke-warning" strokeWidth="1.6" strokeLinecap="round">
      <path d="M188 38 v8 M184 42 h8" />
      <path d="M210 64 v6 M207 67 h6" />
      <circle cx="200" cy="50" r="1.4" className="fill-warning stroke-none" />
    </g>

    {/* Handle */}
    <path d="M104 88 q26 -26 52 0" className="stroke-warning fill-none" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M110 90 q22 -22 44 0" className="stroke-warning/40 fill-none" strokeWidth="1" />

    {/* Toolbox body */}
    <g strokeLinejoin="round" strokeLinecap="round">
      {/* top lid */}
      <path d="M68 108 L130 92 L192 108 L130 122 Z" className="fill-warning/10 stroke-warning" strokeWidth="2.2" />
      {/* front */}
      <path d="M68 108 L68 174 L130 190 L130 122 Z" className="fill-background stroke-warning" strokeWidth="2.2" />
      {/* side */}
      <path d="M192 108 L192 174 L130 190 L130 122 Z" className="fill-warning/10 stroke-warning" strokeWidth="2.2" />
      {/* latch */}
      <rect x="122" y="112" width="16" height="9" rx="2" className="fill-warning/25 stroke-warning" strokeWidth="1.6" />
      <circle cx="130" cy="116.5" r="1.2" className="fill-warning" />
    </g>

    {/* Face */}
    <g>
      <Eye cx={88} cy={140} r={2.4} tone="warning" />
      <Eye cx={104} cy={143} r={2.4} tone="warning" />
      <path d="M86 160 q9 5 18 2" className="stroke-warning" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <Cheeks left={82} right={110} y={152} tone="warning" />
    </g>

    {/* Wrench peeking */}
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M158 78 l24 24 a4.5 4.5 0 0 1 -6.5 6.5 l-24 -24 a9 9 0 1 1 6.5 -6.5 z"
        className="fill-background stroke-primary" strokeWidth="2.2" />
      <circle cx="148" cy="84" r="2.4" className="fill-primary/20 stroke-primary" strokeWidth="1.4" />
    </g>
  </svg>
);

/* ─────────── Network — Sad cloud, broken signal ─────────── */
export const NetworkIllustration = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <Defs id="errNet" tone="muted" />
    <Shadow id="errNet" />

    {/* Cloud body with subtle inner highlight */}
    <g strokeLinejoin="round" strokeLinecap="round">
      <path
        d="M70 154 a28 28 0 0 1 28 -28 a36 36 0 0 1 70 6 a24 24 0 0 1 -2 48 L84 180 a24 24 0 0 1 -14 -26 z"
        className="fill-background stroke-muted-foreground"
        strokeWidth="2.2"
      />
      {/* inner shading */}
      <path
        d="M82 158 a18 18 0 0 1 18 -18"
        className="stroke-muted-foreground/25"
        strokeWidth="1.4"
        fill="none"
      />
    </g>

    {/* Face */}
    <g>
      <Eye cx={106} cy={150} r={2.6} tone="muted-foreground" />
      <Eye cx={142} cy={150} r={2.6} tone="muted-foreground" />
      {/* sad brows */}
      <path d="M100 142 q6 -3 12 0" className="stroke-muted-foreground" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M136 142 q6 -3 12 0" className="stroke-muted-foreground" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      {/* frown */}
      <path d="M116 170 Q124 162 132 170" className="stroke-muted-foreground" strokeWidth="2" strokeLinecap="round" fill="none" />
      <Cheeks left={100} right={148} y={162} tone="muted-foreground" />
    </g>

    {/* Broken signal arcs */}
    <g strokeLinecap="round" fill="none">
      <path d="M96 92 q28 -26 56 0" className="stroke-destructive/80" strokeWidth="2" strokeDasharray="3 5" />
      <path d="M110 76 q14 -12 28 0" className="stroke-destructive/80" strokeWidth="2" strokeDasharray="3 5" />
      <path d="M88 60 L162 108" className="stroke-destructive" strokeWidth="2.6" />
    </g>
  </svg>
);
