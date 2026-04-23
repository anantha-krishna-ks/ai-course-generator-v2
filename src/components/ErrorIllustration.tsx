/**
 * Error illustrations sourced from unDraw (https://undraw.co)
 * License: MIT-style open license (free for commercial & personal use).
 *
 * We fetch SVG markup at runtime and tint the artwork to the app's
 * primary color via a CSS color-replace strategy applied on the fetched
 * SVG. Each illustration is cached after first load.
 */

import { useEffect, useState } from "react";

// Curated unDraw illustrations per error type
const ILLUSTRATION_URLS: Record<string, string> = {
  "404": "https://illustrations.popsy.co/violet/falling.svg",
  "500": "https://illustrations.popsy.co/violet/crashed-error.svg",
  "403": "https://illustrations.popsy.co/violet/shield.svg",
  "401": "https://illustrations.popsy.co/violet/login.svg",
  maintenance: "https://illustrations.popsy.co/violet/work-from-home.svg",
  network: "https://illustrations.popsy.co/violet/taking-notes.svg",
};

const cache = new Map<string, string>();

interface Props {
  type: keyof typeof ILLUSTRATION_URLS;
  className?: string;
  alt?: string;
}

const ErrorIllustration = ({ type, className, alt }: Props) => {
  const url = ILLUSTRATION_URLS[type] ?? ILLUSTRATION_URLS["404"];
  const [svg, setSvg] = useState<string | null>(cache.get(url) ?? null);

  useEffect(() => {
    if (cache.has(url)) {
      setSvg(cache.get(url)!);
      return;
    }
    let cancelled = false;
    fetch(url)
      .then((r) => r.text())
      .then((text) => {
        if (cancelled) return;
        cache.set(url, text);
        setSvg(text);
      })
      .catch(() => {
        if (!cancelled) setSvg(null);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!svg) {
    // graceful skeleton while loading
    return (
      <div
        role="presentation"
        className={`animate-pulse rounded-2xl bg-muted ${className ?? ""}`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt ?? "Illustration"}
      className={className}
      // SVGs from popsy are self-contained and safe (static asset CDN).
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default ErrorIllustration;
