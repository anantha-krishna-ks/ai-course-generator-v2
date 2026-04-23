import type { SVGProps } from "react";

const baseProps = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 240 200",
  fill: "none",
  "aria-hidden": true,
  focusable: false,
} as const;

/** Soft ground shadow shared across illustrations */
const Shadow = ({ cx = 120, cy = 178, rx = 70, ry = 8 }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} className="fill-primary/10" />
);

/** Subtle blush cheeks shared by character faces */
const Cheeks = ({ left, right, y }: { left: number; right: number; y: number }) => (
  <>
    <circle cx={left} cy={y} r="2.4" className="fill-primary/25" />
    <circle cx={right} cy={y} r="2.4" className="fill-primary/25" />
  </>
);

/* ---------------- 500 — Sad open box with bug escaping ---------------- */
export const ServerErrorIllustration = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <Shadow />
    {/* dashed bug trail */}
    <path
      d="M165 28 C 150 40, 175 60, 152 78"
      className="stroke-primary/70"
      strokeWidth="1.6"
      strokeDasharray="3 4"
      strokeLinecap="round"
      fill="none"
    />
    {/* tiny bug */}
    <ellipse cx="168" cy="24" rx="5.5" ry="4.5" className="stroke-primary fill-background" strokeWidth="1.6" />
    <line x1="164" y1="20" x2="160" y2="16" className="stroke-primary" strokeWidth="1.3" strokeLinecap="round" />
    <line x1="172" y1="20" x2="176" y2="16" className="stroke-primary" strokeWidth="1.3" strokeLinecap="round" />
    {/* Isometric open box */}
    <g className="stroke-primary fill-background" strokeWidth="2.2" strokeLinejoin="round">
      {/* back-top edge */}
      <path d="M70 92 L120 78 L170 92 L120 106 Z" />
      {/* front face */}
      <path d="M70 92 L70 158 L120 172 L120 106 Z" />
      {/* right face */}
      <path d="M170 92 L170 158 L120 172 L120 106 Z" />
      {/* inner rim shadow line */}
      <path d="M82 96 L120 107 L158 96" className="stroke-primary/40" strokeWidth="1.4" fill="none" />
    </g>
    {/* Sad face on front */}
    <g>
      <path d="M84 122 q3 -3 6 0" className="stroke-primary" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M104 122 q3 -3 6 0" className="stroke-primary" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M92 142 Q100 134 110 142" className="stroke-primary" strokeWidth="2" strokeLinecap="round" fill="none" />
      <Cheeks left={84} right={114} y={134} />
      {/* tear */}
      <path d="M88 128 q-1 4 1 5 q2 -1 1 -5 z" className="fill-primary/50" />
    </g>
  </svg>
);

/* ---------------- 404 — Lost map / signpost character ---------------- */
export const NotFoundIllustration = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <Shadow />
    {/* dashed search swirl above */}
    <path
      d="M150 30 q14 6 8 22 q-6 16 -22 8"
      className="stroke-primary/60"
      strokeWidth="1.6"
      strokeDasharray="3 4"
      strokeLinecap="round"
      fill="none"
    />
    <text x="155" y="34" className="fill-primary" fontSize="14" fontFamily="serif" fontWeight="700">?</text>
    {/* Isometric folded map */}
    <g className="stroke-primary fill-background" strokeWidth="2.2" strokeLinejoin="round">
      <path d="M60 90 L120 74 L180 90 L180 156 L120 172 L60 156 Z" />
      {/* fold creases */}
      <path d="M100 80 L100 166" />
      <path d="M140 80 L140 166" />
      {/* roads */}
      <path d="M70 110 Q120 128 170 100" className="stroke-primary/45" strokeWidth="1.4" strokeDasharray="3 3" fill="none" />
      <path d="M70 140 Q120 124 170 148" className="stroke-primary/45" strokeWidth="1.4" strokeDasharray="3 3" fill="none" />
      {/* pin */}
      <path d="M120 116 q-7 0 -7 8 q0 8 7 14 q7 -6 7 -14 q0 -8 -7 -8 z" className="fill-primary/15 stroke-primary" />
      <circle cx="120" cy="124" r="2.4" className="fill-primary stroke-primary" />
    </g>
    {/* Sad face bottom-left of map */}
    <g>
      <path d="M76 132 q3 -3 6 0" className="stroke-primary" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M88 132 q3 -3 6 0" className="stroke-primary" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M80 148 Q86 142 92 148" className="stroke-primary" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </g>
  </svg>
);

/* ---------------- 403 — Cute padlock character ---------------- */
export const ForbiddenIllustration = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <Shadow />
    {/* No-entry mark above */}
    <g>
      <circle cx="170" cy="40" r="10" className="stroke-warning fill-background" strokeWidth="2" />
      <line x1="163" y1="40" x2="177" y2="40" className="stroke-warning" strokeWidth="2.2" strokeLinecap="round" />
    </g>
    {/* Padlock character (isometric body) */}
    <g className="stroke-warning fill-background" strokeWidth="2.2" strokeLinejoin="round">
      {/* shackle */}
      <path d="M92 96 L92 78 Q92 50 120 50 Q148 50 148 78 L148 96" fill="none" />
      {/* body top face */}
      <path d="M70 100 L120 86 L170 100 L120 114 Z" />
      {/* body front */}
      <path d="M70 100 L70 158 L120 172 L120 114 Z" />
      {/* body side */}
      <path d="M170 100 L170 158 L120 172 L120 114 Z" />
      {/* keyhole */}
      <circle cx="93" cy="135" r="4.5" className="fill-warning/20 stroke-warning" />
      <path d="M93 139 L91 150 L95 150 Z" className="fill-warning stroke-warning" strokeWidth="1.4" />
    </g>
    {/* Stern face */}
    <g>
      <path d="M82 122 l5 3 M92 125 l-5 -3" className="stroke-warning" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M104 122 l5 3 M114 125 l-5 -3" className="stroke-warning" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M88 148 q8 -3 16 0" className="stroke-warning" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <Cheeks left={84} right={114} y={138} />
    </g>
  </svg>
);

/* ---------------- 401 — Door with peeking key ---------------- */
export const UnauthorizedIllustration = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <Shadow />
    {/* dashed key motion */}
    <path
      d="M192 60 q-18 4 -22 24"
      className="stroke-info/60"
      strokeWidth="1.6"
      strokeDasharray="3 4"
      strokeLinecap="round"
      fill="none"
    />
    {/* Door (isometric) */}
    <g className="stroke-info fill-background" strokeWidth="2.2" strokeLinejoin="round">
      <path d="M60 60 L130 50 L130 168 L60 178 Z" />
      <path d="M60 60 L60 178" />
      {/* panel */}
      <path d="M74 80 L120 73 L120 156 L74 164 Z" className="fill-info/5" />
      {/* handle */}
      <circle cx="112" cy="120" r="3.2" className="fill-info" />
    </g>
    {/* Door face */}
    <g>
      <circle cx="88" cy="106" r="2" className="fill-info" />
      <circle cx="104" cy="103" r="2" className="fill-info" />
      <path d="M88 124 Q96 118 104 122" className="stroke-info" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </g>
    {/* Key character */}
    <g className="stroke-info fill-background" strokeWidth="2.2" strokeLinejoin="round">
      <circle cx="170" cy="100" r="14" />
      <line x1="184" y1="100" x2="216" y2="100" strokeLinecap="round" />
      <line x1="206" y1="100" x2="206" y2="110" strokeLinecap="round" />
      <line x1="214" y1="100" x2="214" y2="108" strokeLinecap="round" />
      {/* key face */}
      <circle cx="166" cy="98" r="1.4" className="fill-info" />
      <circle cx="174" cy="98" r="1.4" className="fill-info" />
      <path d="M166 106 q4 3 8 0" className="stroke-info" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </g>
  </svg>
);

/* ---------------- 503 — Toolbox with wrench (maintenance) ---------------- */
export const MaintenanceIllustration = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <Shadow />
    {/* sparkles above */}
    <g className="stroke-warning" strokeWidth="1.6" strokeLinecap="round">
      <path d="M168 40 l0 8 M164 44 l8 0" />
      <path d="M188 60 l0 6 M185 63 l6 0" />
    </g>
    {/* Toolbox (isometric) */}
    <g className="stroke-warning fill-background" strokeWidth="2.2" strokeLinejoin="round">
      {/* handle */}
      <path d="M96 80 q24 -22 48 0" fill="none" />
      {/* lid */}
      <path d="M64 96 L120 82 L176 96 L120 110 Z" />
      {/* body front */}
      <path d="M64 96 L64 160 L120 174 L120 110 Z" />
      {/* body side */}
      <path d="M176 96 L176 160 L120 174 L120 110 Z" />
      {/* latch */}
      <rect x="114" y="100" width="12" height="8" rx="1.5" className="fill-warning/20 stroke-warning" />
    </g>
    {/* Toolbox face */}
    <g>
      <circle cx="86" cy="126" r="2" className="fill-warning" />
      <circle cx="100" cy="129" r="2" className="fill-warning" />
      <path d="M86 144 q7 4 14 2" className="stroke-warning" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <Cheeks left={80} right={106} y={138} />
    </g>
    {/* Wrench peeking out */}
    <g className="stroke-primary fill-background" strokeWidth="2" strokeLinejoin="round">
      <path d="M150 70 l18 18 a4 4 0 0 1 -6 6 l-18 -18 a8 8 0 1 1 6 -6 z" />
    </g>
  </svg>
);

/* ---------------- Network — Sad cloud with broken signal ---------------- */
export const NetworkIllustration = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <Shadow />
    {/* Cloud character */}
    <g className="stroke-muted-foreground fill-background" strokeWidth="2.2" strokeLinejoin="round">
      <path d="M70 140 a26 26 0 0 1 26 -26 a34 34 0 0 1 64 6 a22 22 0 0 1 -2 44 L82 164 a22 22 0 0 1 -12 -24 z" />
    </g>
    {/* face */}
    <g>
      <path d="M100 138 l5 4 M110 142 l-5 -4" className="stroke-muted-foreground" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M130 138 l5 4 M140 142 l-5 -4" className="stroke-muted-foreground" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M112 156 Q120 150 128 156" className="stroke-muted-foreground" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <Cheeks left={98} right={142} y={150} />
    </g>
    {/* broken signal arcs above */}
    <g className="stroke-destructive" strokeWidth="2" strokeLinecap="round" fill="none">
      <path d="M96 86 q24 -22 48 0" strokeDasharray="3 5" />
      <path d="M108 70 q12 -10 24 0" strokeDasharray="3 5" />
      {/* slash */}
      <line x1="86" y1="58" x2="154" y2="100" strokeWidth="2.6" />
    </g>
  </svg>
);
