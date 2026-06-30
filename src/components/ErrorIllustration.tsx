/**
 * Lightweight inline SVG illustrations for error states.
 * Object/abstract-only — no people, no characters.
 */

type ErrorTypeKey = "404" | "500" | "403" | "401" | "maintenance" | "network";

interface Props {
  type: ErrorTypeKey;
  className?: string;
  height?: string;
  primaryColor?: string;
}

/** Brand primary in hex, mirrors hsl(211 100% 44%). */
const PRIMARY_HEX = "#006FE0";

const Svg = ({
  height,
  children,
}: {
  height: string;
  children: React.ReactNode;
}) => (
  <svg
    viewBox="0 0 240 200"
    style={{ height, width: "auto" }}
    role="presentation"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

const Empty = ({ height, c }: { height: string; c: string }) => (
  <Svg height={height}>
    <ellipse cx="120" cy="170" rx="80" ry="8" fill={c} opacity="0.15" />
    <rect x="60" y="60" width="120" height="90" rx="10" fill="none" stroke={c} strokeWidth="3" strokeDasharray="6 6" />
    <path d="M85 110 L155 110" stroke={c} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
  </Svg>
);

const Server = ({ height, c }: { height: string; c: string }) => (
  <Svg height={height}>
    <ellipse cx="120" cy="180" rx="80" ry="6" fill={c} opacity="0.15" />
    {[40, 80, 120].map((y) => (
      <g key={y}>
        <rect x="60" y={y} width="120" height="30" rx="4" fill="none" stroke={c} strokeWidth="2.5" />
        <circle cx="75" cy={y + 15} r="4" fill={c} />
        <rect x="90" y={y + 12} width="60" height="6" rx="2" fill={c} opacity="0.3" />
      </g>
    ))}
  </Svg>
);

const Safe = ({ height, c }: { height: string; c: string }) => (
  <Svg height={height}>
    <ellipse cx="120" cy="180" rx="80" ry="6" fill={c} opacity="0.15" />
    <rect x="60" y="40" width="120" height="130" rx="8" fill="none" stroke={c} strokeWidth="3" />
    <circle cx="120" cy="105" r="30" fill="none" stroke={c} strokeWidth="3" />
    <circle cx="120" cy="105" r="6" fill={c} />
    <line x1="120" y1="105" x2="140" y2="85" stroke={c} strokeWidth="3" strokeLinecap="round" />
  </Svg>
);

const Vault = ({ height, c }: { height: string; c: string }) => (
  <Svg height={height}>
    <ellipse cx="120" cy="180" rx="80" ry="6" fill={c} opacity="0.15" />
    <rect x="70" y="60" width="100" height="110" rx="50" fill="none" stroke={c} strokeWidth="3" />
    <circle cx="120" cy="110" r="14" fill={c} opacity="0.25" />
    <rect x="116" y="118" width="8" height="20" rx="2" fill={c} />
  </Svg>
);

const Setup = ({ height, c }: { height: string; c: string }) => (
  <Svg height={height}>
    <ellipse cx="120" cy="180" rx="80" ry="6" fill={c} opacity="0.15" />
    <circle cx="100" cy="100" r="30" fill="none" stroke={c} strokeWidth="3" />
    <circle cx="100" cy="100" r="8" fill={c} />
    <circle cx="160" cy="130" r="20" fill="none" stroke={c} strokeWidth="3" />
    <circle cx="160" cy="130" r="5" fill={c} />
  </Svg>
);

const NoData = ({ height, c }: { height: string; c: string }) => (
  <Svg height={height}>
    <ellipse cx="120" cy="180" rx="80" ry="6" fill={c} opacity="0.15" />
    <rect x="50" y="50" width="140" height="110" rx="6" fill="none" stroke={c} strokeWidth="3" />
    <line x1="70" y1="140" x2="170" y2="140" stroke={c} strokeWidth="2" opacity="0.4" />
    <path d="M70 120 L100 100 L130 115 L170 80" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeDasharray="5 5" />
  </Svg>
);

const ErrorIllustration = ({
  type,
  className,
  height = "240px",
  primaryColor = PRIMARY_HEX,
}: Props) => {
  const map: Record<ErrorTypeKey, React.FC<{ height: string; c: string }>> = {
    "404": Empty,
    "500": Server,
    "403": Safe,
    "401": Vault,
    maintenance: Setup,
    network: NoData,
  };
  const Ill = map[type] ?? Empty;
  return (
    <div className={className}>
      <Ill height={height} c={primaryColor} />
    </div>
  );
};

export default ErrorIllustration;
