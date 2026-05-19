import { useState, useRef, useEffect } from "react";
import { getHotspotIcon } from "@/components/CourseCreation/HotspotBlock";
import { sanitizeHtml } from "@/lib/sanitize";

interface HotspotImageProps {
  content: string;
}

export function HotspotImage({ content }: HotspotImageProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
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
    const list: any[] = Array.isArray(parsed.hotspots) ? parsed.hotspots : [];
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
          const iconColor: string = hs.iconColor ?? "#ffffff";
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
                className="w-full h-full flex items-center justify-center transition-all cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, hsla(211, 100%, 75%, 0.28) 0%, hsla(211, 100%, 80%, 0.16) 50%, hsla(211, 100%, 90%, 0.08) 100%)`,
                  border: `1.5px solid ${color}`,
                  borderRadius: isCircle ? "9999px" : 8,
                  boxShadow: `0 1px 3px -1px ${color}, inset 0 1px 0 0 hsla(0,0%,100%,0.14)`,
                }}
                aria-label={hs.title || `Hotspot ${idx + 1}`}
                aria-expanded={isOpen}
              >
                <span
                  className="relative flex items-center justify-center rounded-full bg-white"
                  style={{
                    width: iconSize + 14,
                    height: iconSize + 14,
                    border: `2px solid ${iconColor}`,
                  }}
                >
                  <HsIcon
                    size={iconSize}
                    color={iconColor}
                    strokeWidth={2.5}
                    aria-hidden="true"
                    focusable="false"
                  />
                </span>
              </button>
              {isOpen && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg p-3"
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
