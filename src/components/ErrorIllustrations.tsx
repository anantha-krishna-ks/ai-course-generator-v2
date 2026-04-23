import type { SVGProps } from "react";

const baseProps = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 200 180",
  fill: "none",
  "aria-hidden": true,
  focusable: false,
} as const;

const Shadow = () => (
  <ellipse cx="100" cy="160" rx="55" ry="6" className="fill-muted" />
);

/** 500 — sad open box with bug flying away */
export const ServerErrorIllustration = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <Shadow />
    {/* dashed bug trail */}
    <path
      d="M132 22 C 120 30, 138 50, 122 60"
      className="stroke-primary/60"
      strokeWidth="1.5"
      strokeDasharray="3 3"
      strokeLinecap="round"
    />
    {/* bug */}
    <ellipse cx="135" cy="20" rx="5" ry="4" className="stroke-primary" strokeWidth="1.5" />
    <line x1="132" y1="17" x2="129" y2="14" className="stroke-primary" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="138" y1="17" x2="141" y2="14" className="stroke-primary" strokeWidth="1.2" strokeLinecap="round" />
    {/* box */}
    <path
      d="M55 80 L100 65 L145 80 L145 140 L100 155 L55 140 Z"
      className="stroke-primary fill-background"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M55 80 L100 95 L145 80" className="stroke-primary" strokeWidth="2" strokeLinejoin="round" />
    <path d="M100 95 L100 155" className="stroke-primary" strokeWidth="2" />
    {/* sad face */}
    <circle cx="88" cy="115" r="1.6" className="fill-primary" />
    <circle cx="112" cy="115" r="1.6" className="fill-primary" />
    <path d="M90 130 Q100 122 110 130" className="stroke-primary" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/** 404 — magnifying glass over a question mark page */
export const NotFoundIllustration = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <Shadow />
    {/* page */}
    <path
      d="M65 35 L120 35 L140 55 L140 145 L65 145 Z"
      className="stroke-primary fill-background"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M120 35 L120 55 L140 55" className="stroke-primary" strokeWidth="2" strokeLinejoin="round" />
    {/* question mark */}
    <path
      d="M92 80 Q92 70 102 70 Q112 70 112 80 Q112 88 102 92 L102 102"
      className="stroke-primary"
      strokeWidth="2.2"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="102" cy="112" r="1.8" className="fill-primary" />
    {/* magnifier */}
    <circle cx="135" cy="118" r="18" className="stroke-primary fill-background" strokeWidth="2" />
    <line
      x1="148"
      y1="131"
      x2="162"
      y2="145"
      className="stroke-primary"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path d="M127 115 a8 8 0 0 1 8 -8" className="stroke-primary/60" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/** 403 — shield with lock */
export const ForbiddenIllustration = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <Shadow />
    <path
      d="M100 30 L150 50 L150 95 Q150 130 100 150 Q50 130 50 95 L50 50 Z"
      className="stroke-warning fill-background"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* lock */}
    <rect x="85" y="92" width="30" height="26" rx="3" className="stroke-warning fill-background" strokeWidth="2" />
    <path d="M90 92 L90 82 Q90 72 100 72 Q110 72 110 82 L110 92" className="stroke-warning" strokeWidth="2" fill="none" />
    <circle cx="100" cy="103" r="2.2" className="fill-warning" />
    <line x1="100" y1="105" x2="100" y2="112" className="stroke-warning" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

/** 401 — key with circular keyhole */
export const UnauthorizedIllustration = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <Shadow />
    {/* door circle */}
    <circle cx="80" cy="90" r="42" className="stroke-info fill-background" strokeWidth="2" />
    <circle cx="80" cy="82" r="6" className="stroke-info fill-background" strokeWidth="2" />
    <path d="M77 88 L74 110 L86 110 L83 88" className="stroke-info" strokeWidth="2" strokeLinejoin="round" fill="none" />
    {/* key */}
    <circle cx="135" cy="65" r="10" className="stroke-info fill-background" strokeWidth="2" />
    <line x1="143" y1="72" x2="170" y2="100" className="stroke-info" strokeWidth="2.2" strokeLinecap="round" />
    <line x1="160" y1="92" x2="166" y2="98" className="stroke-info" strokeWidth="2.2" strokeLinecap="round" />
    <line x1="153" y1="85" x2="158" y2="90" className="stroke-info" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

/** 503 — wrench on a gear */
export const MaintenanceIllustration = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <Shadow />
    {/* gear */}
    <g className="stroke-warning fill-background" strokeWidth="2" strokeLinejoin="round">
      <path d="M100 35 L108 35 L110 48 Q116 50 121 53 L132 47 L138 53 L132 64 Q135 69 137 75 L150 77 L150 85 L137 87 Q135 93 132 98 L138 109 L132 115 L121 109 Q116 112 110 114 L108 127 L100 127 L92 127 L90 114 Q84 112 79 109 L68 115 L62 109 L68 98 Q65 93 63 87 L50 85 L50 77 L63 75 Q65 69 68 64 L62 53 L68 47 L79 53 Q84 50 90 48 L92 35 Z" />
      <circle cx="100" cy="81" r="14" />
    </g>
    {/* wrench */}
    <path
      d="M118 110 L150 142 a6 6 0 0 0 8 -8 L126 102 a12 12 0 1 0 -8 8 Z"
      className="stroke-primary fill-background"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

/** Network — cloud with disconnected slash */
export const NetworkIllustration = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <Shadow />
    <path
      d="M60 110 a22 22 0 0 1 22 -22 a28 28 0 0 1 54 6 a18 18 0 0 1 -2 36 L70 130 a20 20 0 0 1 -10 -20 Z"
      className="stroke-muted-foreground fill-background"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* signal arcs */}
    <path d="M88 75 Q100 65 112 75" className="stroke-muted-foreground/50" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    {/* slash */}
    <line x1="55" y1="55" x2="155" y2="155" className="stroke-destructive" strokeWidth="3" strokeLinecap="round" />
  </svg>
);
