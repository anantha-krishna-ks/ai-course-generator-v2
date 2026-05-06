import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface AIBlockLoaderProps {
  stages?: string[];
  lines?: number;
  className?: string;
  minHeight?: number | string;
  withHeading?: boolean;
}

const DEFAULT_STAGES = [
  "Understanding your prompt",
  "Drafting the structure",
  "Writing content",
  "Refining tone & clarity",
  "Polishing final touches",
];

const LONG_WAIT_THRESHOLD_MS = 8000;

/**
 * Modern AI generation loader for content blocks (no gradients).
 *
 * - Solid primary orb with pulsing halo
 * - Cycling short stage labels with bouncing dots
 * - Indeterminate progress rail
 * - Progressively revealed shimmer lines
 * - Calm elapsed pill that surfaces only for long waits
 */
export function AIBlockLoader({
  stages = DEFAULT_STAGES,
  lines = 4,
  className,
  minHeight = "10rem",
  withHeading = true,
}: AIBlockLoaderProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [revealedLines, setRevealedLines] = useState(1);

  useEffect(() => {
    const start = Date.now();
    const stageTimer = window.setInterval(() => {
      setStageIndex((i) => (i + 1) % stages.length);
    }, 1800);
    const elapsedTimer = window.setInterval(() => {
      setElapsedMs(Date.now() - start);
    }, 500);
    const lineTimer = window.setInterval(() => {
      setRevealedLines((n) => (n >= lines ? 1 : n + 1));
    }, 700);
    return () => {
      window.clearInterval(stageTimer);
      window.clearInterval(elapsedTimer);
      window.clearInterval(lineTimer);
    };
  }, [stages.length, lines]);

  const isLongWait = elapsedMs >= LONG_WAIT_THRESHOLD_MS;
  const elapsedSeconds = Math.floor(elapsedMs / 1000);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={stages[stageIndex]}
      style={{ minHeight }}
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-primary/30 bg-card animate-fade-in",
        className,
      )}
    >
      {/* Animated dashed progress border */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl border border-dashed border-primary/40"
        style={{ animation: "spin 12s linear infinite" }}
      />

      <div className="relative flex flex-col gap-3.5 p-4">
        {/* Header: orb + stage label */}
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-primary/30 animate-ping"
            />
            <div className="relative w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-sm">
              <Sparkles
                className="w-3.5 h-3.5 text-primary-foreground animate-pulse"
                aria-hidden="true"
                focusable="false"
              />
            </div>
          </div>

          <div className="flex-1 min-w-0 overflow-hidden">
            <div
              key={stageIndex}
              className="flex items-baseline gap-1 text-[13px] font-medium text-foreground animate-fade-in"
            >
              <span className="truncate">{stages[stageIndex]}</span>
              <span className="inline-flex gap-0.5 shrink-0">
                <span className="w-1 h-1 rounded-full bg-foreground/70 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1 h-1 rounded-full bg-foreground/70 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1 h-1 rounded-full bg-foreground/70 animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </div>
            {/* Indeterminate progress rail */}
            <div className="mt-1.5 h-[2px] w-full rounded-full bg-foreground/[0.06] overflow-hidden relative">
              <div
                className="absolute top-0 left-0 h-full w-1/3 rounded-full bg-primary"
                style={{ animation: "shimmer 1.6s ease-in-out infinite" }}
              />
            </div>
          </div>

          {isLongWait && (
            <span className="text-[10.5px] font-medium text-muted-foreground tabular-nums shrink-0 px-2 py-0.5 rounded-full bg-muted border border-border/60 animate-fade-in">
              {elapsedSeconds}s
            </span>
          )}
        </div>

        {/* Progressive shimmer lines */}
        {withHeading && (
          <div
            className={cn(
              "h-3.5 w-2/5 rounded-full bg-foreground/[0.12] transition-opacity duration-500",
              revealedLines >= 1 ? "opacity-100" : "opacity-0",
            )}
          />
        )}
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => {
            const widths = ["w-full", "w-[94%]", "w-[88%]", "w-[72%]", "w-[60%]"];
            const isRevealed = i < revealedLines;
            return (
              <div
                key={i}
                className={cn(
                  "h-2.5 rounded-full transition-all duration-500",
                  isRevealed
                    ? "bg-foreground/[0.09] opacity-100 translate-y-0"
                    : "bg-foreground/[0.04] opacity-40 translate-y-0.5",
                  widths[i % widths.length],
                )}
              />
            );
          })}
        </div>

        {isLongWait && (
          <p className="text-[11px] text-muted-foreground animate-fade-in">
            Hang tight — complex prompts may take a moment.
          </p>
        )}
      </div>
    </div>
  );
}
