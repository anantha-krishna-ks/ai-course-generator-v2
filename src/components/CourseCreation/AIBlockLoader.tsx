import { useEffect, useRef, useState } from "react";
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

// Visual buffer: how many lines we keep on screen before old ones scroll off.
const MAX_VISIBLE_LINES = 12;
// Cadence of new line appearance.
const LINE_APPEAR_INTERVAL_MS = 320;

type StreamLine = {
  id: number;
  width: number; // % width
  paragraphBreak: boolean; // extra spacing before this line
};

// Realistic line-width distribution. Most lines are full-ish; occasionally
// a short "end of paragraph" line. This mimics natural prose rhythm.
function nextLine(id: number, lastWasShort: boolean): StreamLine {
  // ~18% chance to start a new paragraph (only after a short line, to feel right)
  const paragraphBreak = lastWasShort && Math.random() < 0.55;
  // ~22% chance the new line is a short paragraph-ender
  const isShort = !lastWasShort && Math.random() < 0.22;
  const width = isShort
    ? 35 + Math.random() * 25 // 35-60%
    : 82 + Math.random() * 16; // 82-98%
  return { id, width, paragraphBreak };
}

/**
 * Streaming AI block loader.
 *
 * Mimics live text generation: lines progressively appear at the bottom with
 * a shimmer on the newest ("being written") line, completed lines settle into
 * a solid tone, and once the buffer is full the oldest lines fade out from the
 * top so the loader scales gracefully for any generation duration.
 */
export function AIBlockLoader({ stages = DEFAULT_STAGES, className }: AIBlockLoaderProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [lines, setLines] = useState<StreamLine[]>([]);
  const idRef = useRef(0);
  const lastShortRef = useRef(false);

  useEffect(() => {
    const start = Date.now();
    const stageTimer = window.setInterval(() => setStageIndex((i) => (i + 1) % stages.length), 1800);
    const elapsedTimer = window.setInterval(() => setElapsedMs(Date.now() - start), 500);

    // Seed a couple of lines immediately so the loader doesn't start visually empty.
    const seed: StreamLine[] = [];
    for (let i = 0; i < 2; i++) {
      const line = nextLine(idRef.current++, lastShortRef.current);
      lastShortRef.current = line.width < 65;
      seed.push(line);
    }
    setLines(seed);

    const lineTimer = window.setInterval(() => {
      setLines((prev) => {
        const line = nextLine(idRef.current++, lastShortRef.current);
        lastShortRef.current = line.width < 65;
        const next = [...prev, line];
        // Keep buffer bounded; oldest will animate out via CSS.
        return next.length > MAX_VISIBLE_LINES ? next.slice(next.length - MAX_VISIBLE_LINES) : next;
      });
    }, LINE_APPEAR_INTERVAL_MS);

    return () => {
      window.clearInterval(stageTimer);
      window.clearInterval(elapsedTimer);
      window.clearInterval(lineTimer);
    };
  }, [stages.length]);

  const isLongWait = elapsedMs >= LONG_WAIT_THRESHOLD_MS;
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  const activeId = lines[lines.length - 1]?.id;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={stages[stageIndex]}
      className={cn("relative w-full animate-fade-in", className)}
    >
      {/* Header: minimal AI mark + status */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="relative flex items-center justify-center w-5 h-5 shrink-0" aria-hidden="true">
          <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <span className="relative flex items-center justify-center w-5 h-5 rounded-full bg-primary">
            <Sparkles className="w-3 h-3 text-primary-foreground" aria-hidden="true" focusable="false" />
          </span>
        </div>

        <div
          key={stageIndex}
          className="flex items-baseline gap-1 text-sm font-medium text-foreground animate-fade-in min-w-0"
        >
          <span className="truncate">{stages[stageIndex]}</span>
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

      {/* Streaming skeleton: lines accumulate downward, top fades out when buffer is full. */}
      <div
        className="relative space-y-2.5"
        style={{
          // Soft fade at the top so old lines disappear gracefully when the buffer overflows.
          maskImage:
            lines.length >= MAX_VISIBLE_LINES
              ? "linear-gradient(to bottom, transparent 0%, black 12%, black 100%)"
              : undefined,
          WebkitMaskImage:
            lines.length >= MAX_VISIBLE_LINES
              ? "linear-gradient(to bottom, transparent 0%, black 12%, black 100%)"
              : undefined,
        }}
      >
        {lines.map((line) => {
          const isActive = line.id === activeId;
          return (
            <div
              key={line.id}
              className={cn(
                "h-2.5 rounded-full relative overflow-hidden transition-all duration-300",
                isActive ? "bg-foreground/[0.16]" : "bg-foreground/[0.10]",
                line.paragraphBreak && "mt-4",
              )}
              style={{
                width: `${line.width}%`,
                animation: "fade-in 0.35s ease-out",
              }}
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -translate-x-full"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, hsl(var(--foreground) / 0.18), transparent)",
                    animation: "shimmer 1.4s ease-in-out infinite",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {isLongWait && (
        <p className="mt-4 text-[11px] text-muted-foreground animate-fade-in">
          Hang tight — complex prompts may take a moment.
        </p>
      )}
    </div>
  );
}
