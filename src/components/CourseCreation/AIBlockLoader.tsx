import { useEffect, useMemo, useState } from "react";
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

// Cadence
const LINE_INTERVAL_MS = 280;        // how fast lines "type"
const PARAGRAPH_GAP_MS = 600;        // pause between paragraphs
const MAX_VISIBLE_PARAGRAPHS = 8;    // cap before recycling

/**
 * AI block loader optimized for long-form generation.
 *
 * Progressive reveal: lines fill in sequentially within a paragraph
 * (past = solid, current = shimmering, future = faint). When a paragraph
 * finishes, a new one slides in below. This makes wait time feel like
 * real generation — content visibly grows the longer the user waits.
 */
export function AIBlockLoader({ stages = DEFAULT_STAGES, className }: AIBlockLoaderProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [filledLines, setFilledLines] = useState(0); // total lines "typed" so far

  // Pre-generated paragraph templates (varied line widths, short tail line)
  const paragraphTemplates = useMemo<number[][]>(
    () => [
      [96, 92, 88, 94, 86, 58],
      [95, 90, 93, 84, 72],
      [94, 88, 91, 82, 90, 86, 54],
      [92, 95, 86, 78, 68],
      [96, 89, 93, 87, 82, 60],
      [94, 91, 88, 95, 76],
      [93, 96, 85, 89, 82, 90, 64],
      [95, 88, 92, 86, 70],
    ],
    [],
  );

  useEffect(() => {
    const start = Date.now();
    const stageTimer = window.setInterval(
      () => setStageIndex((i) => (i + 1) % stages.length),
      1800,
    );
    const elapsedTimer = window.setInterval(() => setElapsedMs(Date.now() - start), 500);

    // Drive line-by-line reveal
    let cancelled = false;
    let pIdx = 0;
    let totalSoFar = 0;

    const runParagraph = () => {
      if (cancelled) return;
      const template = paragraphTemplates[pIdx % paragraphTemplates.length];
      let i = 0;

      const lineTimer = window.setInterval(() => {
        if (cancelled) {
          window.clearInterval(lineTimer);
          return;
        }
        i += 1;
        totalSoFar += 1;
        setFilledLines(totalSoFar);
        if (i >= template.length) {
          window.clearInterval(lineTimer);
          pIdx += 1;
          window.setTimeout(runParagraph, PARAGRAPH_GAP_MS);
        }
      }, LINE_INTERVAL_MS);
    };

    runParagraph();

    return () => {
      cancelled = true;
      window.clearInterval(stageTimer);
      window.clearInterval(elapsedTimer);
    };
  }, [stages.length, paragraphTemplates]);

  const isLongWait = elapsedMs >= LONG_WAIT_THRESHOLD_MS;
  const elapsedSeconds = Math.floor(elapsedMs / 1000);

  // Build the visible paragraph stack from filledLines.
  // Each paragraph is fully revealed before the next begins.
  const visibleParagraphs = useMemo(() => {
    const result: { template: number[]; revealed: number; pIndex: number }[] = [];
    let remaining = filledLines + 1; // +1 so we always render the current "in-progress" line
    let pIdx = 0;
    while (remaining > 0 && result.length < MAX_VISIBLE_PARAGRAPHS) {
      const template = paragraphTemplates[pIdx % paragraphTemplates.length];
      const revealed = Math.min(template.length, remaining);
      result.push({ template, revealed, pIndex: pIdx });
      remaining -= template.length;
      pIdx += 1;
      if (revealed < template.length) break;
    }
    if (result.length === 0) {
      result.push({ template: paragraphTemplates[0], revealed: 1, pIndex: 0 });
    }
    return result;
  }, [filledLines, paragraphTemplates]);

  const wordsApprox = filledLines * 12; // rough estimate for the badge

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={stages[stageIndex]}
      className={cn("relative w-full animate-fade-in", className)}
    >
      {/* Header */}
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
          <span className="ml-auto inline-flex items-center gap-1.5 text-[10.5px] font-medium text-muted-foreground tabular-nums px-2 py-0.5 rounded-full bg-muted border border-border/60 animate-fade-in">
            <span>~{wordsApprox} words</span>
            <span className="w-px h-2.5 bg-border" aria-hidden="true" />
            <span>{elapsedSeconds}s</span>
          </span>
        )}
      </div>

      {/* Title skeleton (always visible) */}
      <div className="h-5 w-1/3 rounded-md bg-foreground/[0.10] relative overflow-hidden mb-3">
        <span
          aria-hidden="true"
          className="absolute inset-0 -translate-x-full bg-foreground/[0.05]"
          style={{ animation: "shimmer 2s ease-in-out infinite" }}
        />
      </div>

      {/* Progressively revealed paragraphs */}
      <div className="space-y-4">
        {visibleParagraphs.map(({ template, revealed, pIndex }) => (
          <div
            key={pIndex}
            className="space-y-2.5 animate-fade-in"
          >
            {template.map((w, i) => {
              const isCurrent = i === revealed - 1 && revealed < template.length;
              const isFilled = i < revealed - (isCurrent ? 1 : 0);
              return (
                <div
                  key={i}
                  className={cn(
                    "h-2.5 rounded-full transition-all duration-500 relative overflow-hidden",
                    isCurrent
                      ? "bg-foreground/[0.16]"
                      : isFilled
                        ? "bg-foreground/[0.10]"
                        : "bg-foreground/[0.04]",
                  )}
                  style={{ width: `${w}%` }}
                >
                  {isCurrent && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 -translate-x-full"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, hsl(var(--foreground) / 0.12), transparent)",
                        animation: "shimmer 1.2s ease-in-out infinite",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {isLongWait && (
        <p className="mt-4 text-[11px] text-muted-foreground animate-fade-in">
          Hang tight — longer prompts produce richer content.
        </p>
      )}
    </div>
  );
}
