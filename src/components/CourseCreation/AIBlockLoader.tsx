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
 * Premium AI block loader.
 *
 * Pairs a content-shaped skeleton with a tasteful "AI orb" visual:
 * a focal Sparkles core, soft pulsing halo, orbiting micro-particles,
 * and rotating tick marks on a quiet ring. Fully tonal — no gradients.
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

  const lineWidths = [96, 88, 92, 74, 84, 60];
  const activeLine = tick % lineWidths.length;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={stages[stageIndex]}
      className={cn("relative w-full animate-fade-in", className)}
    >
      {/* Header: AI orb + status */}
      <div className="flex items-center gap-3 mb-5">
        {/* Premium AI orb */}
        <div className="relative w-11 h-11 shrink-0" aria-hidden="true">
          {/* Outer quiet ring with rotating tick marks */}
          <svg
            viewBox="0 0 44 44"
            className="absolute inset-0 w-full h-full"
            style={{ animation: "spin 6s linear infinite" }}
          >
            <circle cx="22" cy="22" r="20" fill="none" stroke="hsl(var(--primary) / 0.15)" strokeWidth="1" />
            <circle
              cx="22"
              cy="22"
              r="20"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="3 9"
            />
          </svg>

          {/* Soft pulsing halo */}
          <span className="absolute inset-1.5 rounded-full bg-primary/15 animate-ping" />
          <span
            className="absolute inset-2.5 rounded-full bg-primary/20 animate-ping"
            style={{ animationDelay: "0.6s" }}
          />

          {/* Orbiting particle */}
          <div
            className="absolute inset-0"
            style={{ animation: "spin 2.4s linear infinite" }}
          >
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary))]" />
          </div>
          <div
            className="absolute inset-0"
            style={{ animation: "spin 3.6s linear infinite reverse" }}
          >
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full bg-primary/70" />
          </div>

          {/* Focal core */}
          <div className="absolute inset-[10px] rounded-full bg-primary flex items-center justify-center shadow-[0_0_12px_hsl(var(--primary)/0.45)]">
            <Sparkles className="w-3 h-3 text-primary-foreground" aria-hidden="true" focusable="false" />
          </div>
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-primary">
            AI · Generating
          </span>
          <div
            key={stageIndex}
            className="flex items-baseline gap-1 text-sm font-medium text-foreground animate-fade-in"
          >
            <span className="truncate">{stages[stageIndex]}</span>
            <span className="inline-flex gap-0.5" aria-hidden="true">
              <span className="w-[3px] h-[3px] rounded-full bg-foreground/70 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-[3px] h-[3px] rounded-full bg-foreground/70 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-[3px] h-[3px] rounded-full bg-foreground/70 animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
          </div>
        </div>

        {isLongWait && (
          <span className="ml-auto text-[10.5px] font-medium text-muted-foreground tabular-nums px-2 py-0.5 rounded-full bg-muted border border-border/60 animate-fade-in">
            {elapsedSeconds}s
          </span>
        )}
      </div>

      {/* Content-shaped skeleton */}
      <div className="space-y-3">
        <div className="h-5 w-1/3 rounded-md bg-foreground/[0.10] relative overflow-hidden">
          <span
            aria-hidden="true"
            className="absolute inset-0 -translate-x-full bg-foreground/[0.05]"
            style={{ animation: "shimmer 2s ease-in-out infinite" }}
          />
        </div>

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
                  <span
                    aria-hidden="true"
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-[2px] h-3 bg-primary animate-pulse"
                  />
                )}
              </div>
            );
          })}
        </div>

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
