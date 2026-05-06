import { useEffect, useMemo, useRef, useState } from "react";
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

// Reveal cadence
const LINE_INTERVAL_MS = 260;
const PARAGRAPH_GAP_MS = 550;
const MAX_VISIBLE_PARAGRAPHS = 6;

/**
 * Premium AI block loader for long-form generation.
 *
 * Layout:
 *  - Glassmorphic card with a soft primary glow
 *  - Header: animated AI orb + live stage label + elapsed/word badge
 *  - Stepper: visual stage progress
 *  - Body: progressively revealed paragraph skeleton (past = solid,
 *    current = shimmering with caret, future = faint)
 *  - Footer: thin progress bar driven by stage cycle
 */
export function AIBlockLoader({ stages = DEFAULT_STAGES, className }: AIBlockLoaderProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [filledLines, setFilledLines] = useState(0);
  const filledRef = useRef(0);

  const paragraphTemplates = useMemo<number[][]>(
    () => [
      [97, 92, 88, 94, 86, 58],
      [95, 90, 93, 84, 72],
      [94, 88, 91, 82, 90, 86, 54],
      [92, 95, 86, 78, 68],
      [96, 89, 93, 87, 82, 60],
      [94, 91, 88, 95, 76],
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

    let cancelled = false;
    let pIdx = 0;

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
        filledRef.current += 1;
        setFilledLines(filledRef.current);
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

  // Build visible paragraph stack from filledLines, recycling templates.
  const visibleParagraphs = useMemo(() => {
    const result: { template: number[]; revealed: number; pIndex: number }[] = [];
    let remaining = filledLines + 1;
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
    // Only show last MAX_VISIBLE_PARAGRAPHS for long sessions
    return result.slice(-MAX_VISIBLE_PARAGRAPHS);
  }, [filledLines, paragraphTemplates]);

  const wordsApprox = filledLines * 12;
  const progressPct = ((stageIndex + 1) / stages.length) * 100;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={stages[stageIndex]}
      className={cn(
        "relative w-full animate-fade-in rounded-2xl border border-border/60",
        "bg-gradient-to-br from-background via-background to-primary/[0.03]",
        "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_hsl(var(--primary)/0.18)]",
        "overflow-hidden",
        className,
      )}
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-60"
        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.18), transparent 70%)" }}
      />

      <div className="relative p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          {/* AI orb */}
          <div className="relative flex items-center justify-center w-9 h-9 shrink-0" aria-hidden="true">
            <span className="absolute inset-0 rounded-full bg-primary/15 animate-ping" />
            <span className="absolute inset-1 rounded-full bg-primary/25" />
            <span
              className="relative flex items-center justify-center w-7 h-7 rounded-full shadow-[0_4px_12px_-2px_hsl(var(--primary)/0.5)]"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-glow)))" }}
            >
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" aria-hidden="true" focusable="false" />
            </span>
          </div>

          {/* Stage label */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-muted-foreground mb-0.5">
              AI is generating
            </p>
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
          </div>

          {/* Live stats */}
          {isLongWait && (
            <div
              className="hidden sm:inline-flex items-center gap-1.5 text-[10.5px] font-medium text-muted-foreground tabular-nums px-2.5 py-1 rounded-full bg-muted/70 border border-border/60 animate-fade-in shrink-0"
              aria-hidden="true"
            >
              <span>~{wordsApprox} words</span>
              <span className="w-px h-2.5 bg-border" />
              <span>{elapsedSeconds}s</span>
            </div>
          )}
        </div>

        {/* Title skeleton */}
        <div className="h-5 w-1/3 rounded-md bg-foreground/[0.10] relative overflow-hidden mb-4">
          <span
            aria-hidden="true"
            className="absolute inset-0 -translate-x-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, hsl(var(--foreground) / 0.08), transparent)",
              animation: "shimmer 2s ease-in-out infinite",
            }}
          />
        </div>

        {/* Progressive paragraphs */}
        <div className="space-y-4">
          {visibleParagraphs.map(({ template, revealed, pIndex }) => (
            <div key={pIndex} className="space-y-2.5 animate-fade-in">
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
                      <>
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 -translate-x-full"
                          style={{
                            background:
                              "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.18), transparent)",
                            animation: "shimmer 1.1s ease-in-out infinite",
                          }}
                        />
                        {/* Caret */}
                        <span
                          aria-hidden="true"
                          className="absolute top-1/2 right-0 -translate-y-1/2 w-[2px] h-3 rounded-full bg-primary/70"
                          style={{ animation: "pulse 1s ease-in-out infinite" }}
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-border/50 flex items-center gap-3">
          <div className="flex-1 h-1 rounded-full bg-foreground/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
              style={{
                width: `${progressPct}%`,
                background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary-glow)))",
              }}
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 -translate-x-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, hsl(0 0% 100% / 0.4), transparent)",
                  animation: "shimmer 1.6s ease-in-out infinite",
                }}
              />
            </div>
          </div>
          <span className="text-[10.5px] font-medium text-muted-foreground tabular-nums shrink-0">
            {isLongWait ? `${elapsedSeconds}s elapsed` : "Just a moment…"}
          </span>
        </div>
      </div>
    </div>
  );
}
