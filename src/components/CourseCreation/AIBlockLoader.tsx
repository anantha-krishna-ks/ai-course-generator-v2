import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface AIBlockLoaderProps {
  stages?: string[];
  className?: string;
  minHeight?: number | string;
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
 * Calm, centered AI generation loader for content blocks.
 *
 * - Pulsing primary orb with concentric rings (focal point)
 * - Cycling short stage label with crossfade
 * - Three bouncing dots show liveness without visual noise
 * - Elapsed pill appears only after a long wait, with reassuring copy
 * - No shimmer lines, no gradients — purely tonal
 */
export function AIBlockLoader({
  stages = DEFAULT_STAGES,
  className,
  minHeight = "12rem",
}: AIBlockLoaderProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const stageTimer = window.setInterval(() => {
      setStageIndex((i) => (i + 1) % stages.length);
    }, 1800);
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
        "relative w-full overflow-hidden rounded-2xl border border-primary/25 bg-card animate-fade-in",
        className,
      )}
    >
      <div className="relative flex flex-col items-center justify-center gap-4 px-6 py-8 text-center">
        {/* Focal orb with concentric rings */}
        <div className="relative flex items-center justify-center w-16 h-16">
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border border-primary/20"
            style={{ animation: "ping 2.4s cubic-bezier(0,0,0.2,1) infinite" }}
          />
          <span
            aria-hidden="true"
            className="absolute inset-2 rounded-full border border-primary/30"
            style={{ animation: "ping 2.4s cubic-bezier(0,0,0.2,1) infinite", animationDelay: "0.6s" }}
          />
          <div className="relative w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-md shadow-primary/20">
            <Sparkles
              className="w-5 h-5 text-primary-foreground"
              aria-hidden="true"
              focusable="false"
              style={{ animation: "pulse 1.6s ease-in-out infinite" }}
            />
          </div>
        </div>

        {/* Stage label with bouncing dots */}
        <div className="flex flex-col items-center gap-1.5 max-w-full">
          <div
            key={stageIndex}
            className="flex items-baseline justify-center gap-1.5 text-sm font-medium text-foreground animate-fade-in max-w-full"
          >
            <span className="truncate">{stages[stageIndex]}</span>
            <span className="inline-flex gap-0.5 shrink-0" aria-hidden="true">
              <span className="w-1 h-1 rounded-full bg-foreground/70 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1 h-1 rounded-full bg-foreground/70 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1 h-1 rounded-full bg-foreground/70 animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
          </div>
          <p className="text-[11.5px] text-muted-foreground">
            AI is crafting your content
          </p>
        </div>

        {/* Long-wait reassurance pill */}
        {isLongWait && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted border border-border/60 text-[11px] font-medium text-muted-foreground tabular-nums animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
            Hang tight · {elapsedSeconds}s
          </div>
        )}
      </div>
    </div>
  );
}
