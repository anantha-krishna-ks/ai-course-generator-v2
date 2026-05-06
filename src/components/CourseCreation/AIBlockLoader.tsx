import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AISparkles } from "@/components/ui/ai-sparkles";

interface AIBlockLoaderProps {
  /** Stage messages cycle while generating. Keep each one short (<= 28 chars). */
  stages?: string[];
  /** Number of shimmer lines to render. */
  lines?: number;
  /** Optional className for the wrapper. */
  className?: string;
  /** Optional minimum height. */
  minHeight?: number | string;
  /** Show heading-style placeholder bar at top. */
  withHeading?: boolean;
}

const DEFAULT_STAGES = [
  "Thinking…",
  "Drafting outline…",
  "Writing content…",
  "Refining tone…",
  "Polishing…",
];

const LONG_WAIT_THRESHOLD_MS = 8000;

/**
 * Block-level AI generation loader.
 *
 * Designed to feel calm during short waits and informative during long ones:
 *  - Cycles through tiny stage labels every ~1.6s
 *  - Soft shimmer over skeleton lines while content is being produced
 *  - After ~8s, surfaces an elapsed-time hint ("Still working — 12s")
 *    so longer generations don't feel stuck
 *
 * Pure presentational; the parent controls when to mount/unmount.
 */
export function AIBlockLoader({
  stages = DEFAULT_STAGES,
  lines = 4,
  className,
  minHeight = "9rem",
  withHeading = true,
}: AIBlockLoaderProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const stageTimer = window.setInterval(() => {
      setStageIndex((i) => (i + 1) % stages.length);
    }, 1600);
    const elapsedTimer = window.setInterval(() => {
      setElapsedMs(Date.now() - start);
    }, 500);
    return () => {
      window.clearInterval(stageTimer);
      window.clearInterval(elapsedTimer);
    };
  }, [stages.length]);

  const isLongWait = elapsedMs >= LONG_WAIT_THRESHOLD_MS;
  const elapsedSeconds = Math.floor(elapsedMs / 1000);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={stages[stageIndex]}
      style={{ minHeight }}
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.04] via-background to-background",
        "animate-fade-in",
        className,
      )}
    >
      {/* Sweeping shimmer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_2.2s_infinite] bg-gradient-to-r from-transparent via-primary/[0.08] to-transparent"
      />

      {/* Soft top glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 left-1/3 h-24 w-1/2 rounded-full bg-primary/20 blur-3xl opacity-60"
      />

      <div className="relative flex flex-col gap-3.5 p-4">
        {/* Heading bar */}
        {withHeading && (
          <div className="h-3.5 w-2/5 rounded-full bg-foreground/10" />
        )}

        {/* Body shimmer lines, varying width */}
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => {
            const widths = ["w-full", "w-[94%]", "w-[88%]", "w-[72%]", "w-[60%]"];
            return (
              <div
                key={i}
                className={cn(
                  "h-2.5 rounded-full bg-foreground/[0.08]",
                  widths[i % widths.length],
                )}
              />
            );
          })}
        </div>

        {/* Stage + elapsed footer */}
        <div className="mt-1 flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 min-w-0">
            <AISparkles className="w-3.5 h-3.5 animate-pulse shrink-0" />
            <span
              key={stageIndex}
              className="text-[12px] font-medium text-foreground/80 truncate animate-fade-in"
            >
              {stages[stageIndex]}
            </span>
          </div>

          {isLongWait && (
            <span className="text-[11px] font-medium text-muted-foreground tabular-nums shrink-0 animate-fade-in">
              Still working · {elapsedSeconds}s
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
