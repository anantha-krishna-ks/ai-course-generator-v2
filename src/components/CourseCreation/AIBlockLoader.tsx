import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface AIBlockLoaderProps {
  stages?: string[];
  className?: string;
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
 * Content-shaped skeleton loader for AI block generation.
 *
 * Mirrors the structure of the text that will appear: a heading bar
 * followed by paragraph lines that "type" in progressively. Combined
 * with a compact AI status chip that announces the current stage and
 * elapsed time for long waits.
 *
 * No gradients — purely tonal, accessible, and on-brand.
 */
export function AIBlockLoader({ stages = DEFAULT_STAGES, className }: AIBlockLoaderProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const stageTimer = window.setInterval(() => setStageIndex((i) => (i + 1) % stages.length), 1800);
    const elapsedTimer = window.setInterval(() => setElapsedMs(Date.now() - start), 500);
    const typeTimer = window.setInterval(() => setTick((t) => t + 1), 450);
    return () => {
      window.clearInterval(stageTimer);
      window.clearInterval(elapsedTimer);
      window.clearInterval(typeTimer);
    };
  }, [stages.length]);

  const isLongWait = elapsedMs >= LONG_WAIT_THRESHOLD_MS;
  const elapsedSeconds = Math.floor(elapsedMs / 1000);

  // Skeleton paragraph plan: width % per line. Cycles via `tick` so the
  // "active" (typing) line moves down and wraps, giving a calm sense of progress.
  const lineWidths = [96, 88, 92, 74, 84, 60];
  const activeLine = tick % lineWidths.length;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={stages[stageIndex]}
      className={cn("relative w-full animate-fade-in", className)}
    >
      {/* AI status chip */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex items-center justify-center">
          <span aria-hidden="true" className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
          <span className="relative flex items-center justify-center w-5 h-5 rounded-full bg-primary">
            <Sparkles className="w-3 h-3 text-primary-foreground" aria-hidden="true" focusable="false" />
          </span>
        </div>
        <div
          key={stageIndex}
          className="flex items-baseline gap-1 text-xs font-medium text-foreground animate-fade-in"
        >
          <span>{stages[stageIndex]}</span>
          <span className="inline-flex gap-0.5" aria-hidden="true">
            <span className="w-[3px] h-[3px] rounded-full bg-foreground/70 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-[3px] h-[3px] rounded-full bg-foreground/70 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-[3px] h-[3px] rounded-full bg-foreground/70 animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
        </div>
        {isLongWait && (
          <span className="ml-auto text-[10.5px] font-medium text-muted-foreground tabular-nums px-2 py-0.5 rounded-full bg-muted border border-border/60 animate-fade-in">
            {elapsedSeconds}s
          </span>
        )}
      </div>

      {/* Content-shaped skeleton */}
      <div className="space-y-3">
        {/* Heading */}
        <div className="h-5 w-1/3 rounded-md bg-foreground/[0.10] relative overflow-hidden">
          <span
            aria-hidden="true"
            className="absolute inset-0 -translate-x-full bg-foreground/[0.05]"
            style={{ animation: "shimmer 2s ease-in-out infinite" }}
          />
        </div>

        {/* Paragraph lines */}
        <div className="space-y-2.5 pt-1">
          {lineWidths.map((w, i) => {
            const isActive = i === activeLine;
            return (
              <div
                key={i}
                className={cn(
                  "h-2.5 rounded-full transition-all duration-500 relative overflow-hidden",
                  isActive ? "bg-foreground/[0.13]" : "bg-foreground/[0.07]",
                )}
                style={{ width: `${w}%` }}
              >
                {isActive && (
                  <>
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 -translate-x-full"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, hsl(var(--foreground) / 0.08), transparent)",
                        animation: "shimmer 1.4s ease-in-out infinite",
                      }}
                    />
                    {/* Typing caret at end of active line */}
                    <span
                      aria-hidden="true"
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-[2px] h-3 bg-primary animate-pulse"
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Second short paragraph block, dimmer (upcoming) */}
        <div className="space-y-2.5 pt-3 opacity-60">
          <div className="h-2.5 w-[70%] rounded-full bg-foreground/[0.05]" />
          <div className="h-2.5 w-[55%] rounded-full bg-foreground/[0.05]" />
        </div>
      </div>

      {isLongWait && (
        <p className="mt-4 text-[11px] text-muted-foreground animate-fade-in">
          Hang tight — complex prompts may take a moment.
        </p>
      )}
    </div>
  );
}
