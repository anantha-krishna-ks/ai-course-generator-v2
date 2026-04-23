/**
 * Professional unDraw illustrations (MIT licensed) via react-undraw-illustrations.
 * https://undraw.co — used by Stripe, GitHub docs, and many SaaS products.
 */

import {
  UndrawLost,
  UndrawServer,
  UndrawSecurityOn,
  UndrawLogin,
  UndrawMaintenance,
  UndrawConnected,
} from "react-undraw-illustrations";

type ErrorTypeKey = "404" | "500" | "403" | "401" | "maintenance" | "network";

const ILLUSTRATIONS: Record<
  ErrorTypeKey,
  React.ComponentType<{ height?: string; primaryColor?: string; class?: string }>
> = {
  "404": UndrawLost,
  "500": UndrawServer,
  "403": UndrawSecurityOn,
  "401": UndrawLogin,
  maintenance: UndrawMaintenance,
  network: UndrawConnected,
};

interface Props {
  type: ErrorTypeKey;
  className?: string;
  /** Pixel height passed to the unDraw component (string with units). */
  height?: string;
  /** Hex color used to tint the illustration. Should match the app primary. */
  primaryColor?: string;
}

/**
 * Brand primary in hex (mirrors hsl(211 100% 44%) ≈ #006FE0).
 * Kept as a constant because unDraw components require a hex string.
 */
const PRIMARY_HEX = "#006FE0";

const ErrorIllustration = ({
  type,
  className,
  height = "240px",
  primaryColor = PRIMARY_HEX,
}: Props) => {
  const Illustration = ILLUSTRATIONS[type] ?? ILLUSTRATIONS["404"];
  return (
    <div className={className}>
      <Illustration height={height} primaryColor={primaryColor} />
    </div>
  );
};

export default ErrorIllustration;
