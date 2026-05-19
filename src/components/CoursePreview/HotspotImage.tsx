import { useState, useRef, useEffect } from "react";
import { getHotspotIcon } from "@/components/CourseCreation/HotspotBlock";
import { sanitizeHtml } from "@/lib/sanitize";

interface HotspotImageProps {
  content: string;
}

interface PreviewHotspot {
  id?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  title?: string;
  description?: string;
  icon?: string;
  iconSize?: number;
  iconColor?: string;
}

function isLightColor(value: string) {
  const color = value.trim().toLowerCase();
  if (color === "white" || color === "#fff" || color === "#ffffff") return true;

  const hex = color.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const r = parseInt(hex[1].slice(0, 2), 16);
    const g = parseInt(hex[1].slice(2, 4), 16);
    const b = parseInt(hex[1].slice(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 210;
  }

  const hsl = color.match(/hsla?\([^,]+,[^,]+,\s*([\d.]+)%/i);
  return hsl ? Number(hsl[1]) > 72 : false;
}

export function HotspotImage({ content }: HotspotImageProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openIdx === null) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpenIdx(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIdx(null);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onKey);
    };
  }, [openIdx]);

  try {
    const parsed = JSON.parse(content || "{}");
    const img: string = parsed.imageUrl || "";
    const list: PreviewHotspot[] = Array.isArray(parsed.hotspots) ? parsed.hotspots : [];
    const color: string = parsed.settings?.color || "hsl(211, 100%, 50%)";
    const shape: "rect" | "circle" = parsed.settings?.shape ?? "rect";
    const isCircle = shape === "circle";
    if (!img) return null;

    return (
      <div
        ref={wrapRef}
        className="relative rounded-xl border border-border/40 bg-muted/20"
        style={{ zIndex: 50 }}
      >
        <img src={img} alt="Interactive hotspot image" className="block w-full h-auto rounded-xl" />
        {list.map((hs, idx) => {
          const HsIcon = getHotspotIcon(hs.icon);
          const iconSize: number = hs.iconSize ?? 16;
          const iconColor: string = hs.iconColor ?? color;
          const needsContrastBacking = isLightColor(iconColor);
          const isOpen = openIdx === idx;
          return (
            <div
              key={hs.id || idx}
              className="absolute"
              style={{
                left: `${hs.x}%`,
                top: `${hs.y}%`,
                width: `${hs.width}%`,
                height: `${hs.height}%`,
              }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenIdx(isOpen ? null : idx);
                }}
                onMouseEnter={() => setHoverIdx(idx)}
                onMouseLeave={() => setHoverIdx((h) => (h === idx ? null : h))}
                onFocus={() => setHoverIdx(idx)}
                onBlur={() => setHoverIdx((h) => (h === idx ? null : h))}
                className="group w-full h-full flex items-center justify-center cursor-pointer bg-transparent border-0 p-0 focus:outline-none focus-visible:outline-none"
                aria-label={hs.title || `Hotspot ${idx + 1}`}
                aria-expanded={isOpen}
              >
                {(() => {
                  const isHover = hoverIdx === idx;
                  const isActive = isHover || isOpen;
                  const filled = isActive; // filled UI on hover/open
                  const bg = filled
                    ? iconColor
                    : needsContrastBacking
                    ? color
                    : "hsl(var(--background))";
                  const borderCol = filled
                    ? iconColor
                    : needsContrastBacking
                    ? "hsl(var(--background))"
                    : iconColor;
                  const iconRenderColor = filled
                    ? needsContrastBacking
                      ? iconColor === color
                        ? "hsl(var(--background))"
                        : "hsl(var(--background))"
                      : "hsl(var(--background))"
                    : iconColor;
                  return (
                    <span
                      className="relative flex items-center justify-center rounded-full transition-all duration-300 ease-out"
                      style={{
                        width: iconSize + 14,
                        height: iconSize + 14,
                        background: bg,
                        border: `2px solid ${borderCol}`,
                        boxShadow: isOpen
                          ? `0 0 0 4px ${color}33, 0 6px 18px hsl(var(--foreground) / 0.22)`
                          : isHover
                          ? `0 0 0 3px ${color}26, 0 4px 14px hsl(var(--foreground) / 0.22)`
                          : "0 2px 8px hsl(var(--foreground) / 0.22)",
                        transform: isActive ? "scale(1.12)" : undefined,
                      }}
                    >
                      {!isActive && (
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 rounded-full opacity-70 animate-ping"
                          style={{ background: `${color}55`, animationDuration: "2.4s" }}
                        />
                      )}
                      <HsIcon
                        size={iconSize}
                        color={iconRenderColor}
                        strokeWidth={2.5}
                        aria-hidden="true"
                        focusable="false"
                        style={{ position: "relative", zIndex: 1, transition: "color 200ms ease" }}
                      />
                    </span>
                  );
                })()}
              </button>
              {isOpen && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 rounded-xl border border-border bg-popover text-popover-foreground shadow-xl p-3 animate-fade-in"
                  style={{ zIndex: 100 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {hs.title && <p className="text-sm font-semibold mb-1">{hs.title}</p>}
                  <div
                    className="prose prose-sm max-w-none text-foreground"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(hs.description || "") }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  } catch {
    return null;
  }
}
