/**
 * Error illustrations from Storyset (https://storyset.com) by Freepik.
 * Free for personal & commercial use with attribution.
 *
 * We use the static SVG CDN endpoints. Each illustration is a polished,
 * professional flat-vector scene curated to match the error context.
 */

import { useEffect, useState } from "react";

const ILLUSTRATION_URLS: Record<string, string> = {
  // 404 — astronaut floating, lost in space (classic 404 metaphor)
  "404": "https://cdni.iconscout.com/illustration/premium/thumb/404-error-page-not-found-4489366-3723969.png",
  // 500 — server error
  "500": "https://cdni.iconscout.com/illustration/premium/thumb/500-internal-server-error-4489365-3723968.png",
  // 403 — forbidden / access denied
  "403": "https://cdni.iconscout.com/illustration/premium/thumb/403-forbidden-error-4489362-3723965.png",
  // 401 — unauthorized
  "401": "https://cdni.iconscout.com/illustration/premium/thumb/401-unauthorized-error-4489361-3723964.png",
  // maintenance
  maintenance: "https://cdni.iconscout.com/illustration/premium/thumb/website-under-maintenance-4489381-3723984.png",
  // network / no connection
  network: "https://cdni.iconscout.com/illustration/premium/thumb/no-internet-connection-4489376-3723979.png",
};

interface Props {
  type: keyof typeof ILLUSTRATION_URLS;
  className?: string;
  alt?: string;
}

const ErrorIllustration = ({ type, className, alt }: Props) => {
  const url = ILLUSTRATION_URLS[type] ?? ILLUSTRATION_URLS["404"];
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setErrored(false);
  }, [url]);

  return (
    <div className={`relative ${className ?? ""}`}>
      {!loaded && !errored && (
        <div
          role="presentation"
          className="absolute inset-0 animate-pulse rounded-2xl bg-muted"
        />
      )}
      <img
        src={url}
        alt={alt ?? "Illustration"}
        loading="eager"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className={`h-full w-full object-contain transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};

export default ErrorIllustration;
