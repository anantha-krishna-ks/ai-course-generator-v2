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
 * Modern AI generation loader for content blocks.
 *
 * - Animated gradient orb with orbiting sparkle
 * - Cycling short stage labels with smooth crossfade
 * - Typewriter-style shimmer lines that "build" progressively
 * - Soft conic gradient border that rotates (premium feel)
 * - After ~8s, surfaces a calm elapsed-time hint for longer waits
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
        "group/ailoader relative w-full overflow-hidden rounded-2xl animate-fade-in",
        className,
      )}
    >
      {/* Rotating conic gradient border */}
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-2xl opacity-70"
        style={{
          background:
            "conic-gradient(from 0deg, hsl(var(--primary) / 0.6), transparent 25%, hsl(270 80% 60% / 0.5) 50%, transparent 75%, hsl(var(--primary) / 0.6))",
          animation: "spin 6s linear infinite",
        }}
      />
      {/* Inner card masks the border to a thin ring */}
      <div className="absolute inset-[1.5px] rounded-[14px] bg-background" />
      <div
        aria-hidden="true"
        className="absolute inset-[1.5px] rounded-[14px] bg-gradient-to-br from-primary/[0.05] via-transparent to-purple-500/[0.04]"
      />

      {/* Sweeping shimmer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[1.5px] rounded-[14px] overflow-hidden"
      >
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.4s_infinite] bg-gradient-to-r from-transparent via-primary/[0.10] to-transparent" />
      </div>

      {/* Floating glow blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 -left-6 h-24 w-24 rounded-full bg-primary/30 blur-3xl opacity-60 animate-pulse"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 -right-6 h-24 w-24 rounded-full bg-purple-500/25 blur-3xl opacity-50 animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <div className="relative flex flex-col gap-3.5 p-4">
        {/* Header: orb + stage label */}
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {/* Pulsing halo */}
            <div className="absolute inset-0 rounded-full bg-primary/30 blur-md animate-pulse" />
            {/* Gradient orb */}
            <div className="relative w-7 h-7 rounded-full bg-gradient-to-br from-primary via-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/30">
              <Sparkles
                className="w-3.5 h-3.5 text-white animate-pulse"
                aria-hidden="true"
                focusable="false"
              />
            </div>
          </div>

          <div className="flex-1 min-w-0 overflow-hidden">
            <div
              key={stageIndex}
              className="text-[13px] font-medium text-foreground truncate animate-fade-in"
            >
              {stages[stageIndex]}
              <span className="inline-flex ml-0.5 gap-0.5 align-baseline">
                <span className="w-1 h-1 rounded-full bg-foreground/70 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1 h-1 rounded-full bg-foreground/70 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1 h-1 rounded-full bg-foreground/70 animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </div>
            {/* Tiny indeterminate progress rail */}
            <div className="mt-1.5 h-[2px] w-full rounded-full bg-foreground/[0.06] overflow-hidden">
              <div
                className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent"
                style={{ animation: "shimmer 1.6s ease-in-out infinite" }}
              />
            </div>
          </div>

          {isLongWait && (
            <span className="text-[10.5px] font-medium text-muted-foreground tabular-nums shrink-0 px-2 py-0.5 rounded-full bg-muted/60 border border-border/60 animate-fade-in">
              {elapsedSeconds}s
            </span>
          )}
        </div>

        {/* Progressive shimmer lines */}
        {withHeading && (
          <div
            className={cn(
              "h-3.5 w-2/5 rounded-full bg-gradient-to-r from-primary/25 via-foreground/10 to-transparent transition-opacity duration-500",
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
