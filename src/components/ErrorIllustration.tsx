/**
 * Professional unDraw illustrations (MIT licensed) via react-undraw-illustrations.
 * https://undraw.co
 *
 * Object/abstract-only selection — no people, no characters.
 */

import {
  UndrawEmpty,
  UndrawServerStatus,
  UndrawSafe,
  UndrawVault,
  UndrawSetup,
  UndrawNoData,
} from "react-undraw-illustrations";

type ErrorTypeKey = "404" | "500" | "403" | "401" | "maintenance" | "network";

const ILLUSTRATIONS: Record<
  ErrorTypeKey,
  React.ComponentType<{ height?: string; primaryColor?: string; class?: string }>
> = {
  "404": UndrawEmpty,         // empty plate / nothing here → page not found
  "500": UndrawServerStatus,  // server stack with status indicator
  "403": UndrawSafe,          // closed safe → access protected
  "401": UndrawVault,         // bank vault → authentication required
  maintenance: UndrawSetup,   // tools & gears → maintenance
  network: UndrawNoData,      // abstract empty chart → no connection / data
};

interface Props {
  type: ErrorTypeKey;
  className?: string;
  height?: string;
  primaryColor?: string;
}

/** Brand primary in hex, mirrors hsl(211 100% 44%). */
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
