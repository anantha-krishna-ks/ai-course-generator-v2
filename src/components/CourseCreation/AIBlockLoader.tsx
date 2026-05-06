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

// Visible buffer size; older lines fade out via mask.
const MAX_VISIBLE_LINES = 10;
// How long each line takes to "type" out.
const LINE_GROW_MS = 700;
// Tiny pause between finishing one line and starting the next.
const LINE_SETTLE_MS = 90;

type CommittedLine = {
  id: number;
  width: number;
  paragraphBreak: boolean;
};

function rollLine(lastWasShort: boolean): { width: number; paragraphBreak: boolean; isShort: boolean } {
  const paragraphBreak = lastWasShort && Math.random() < 0.6;
  const isShort = !lastWasShort && Math.random() < 0.22;
  const width = isShort ? 35 + Math.random() * 25 : 82 + Math.random() * 16;
  return { width, paragraphBreak, isShort };
}

/**
 * Streaming AI block loader.
 *
 * Mimics live text generation: a single "active" line grows from 0% to its
 * target width left-to-right (the typing motion), then commits into a calm
 * muted line, and a new active line begins below. Once the buffer fills, the
 * top fades out via a soft mask so the loader scales for any duration.
 */
export function AIBlockLoader({ stages: _stages = DEFAULT_STAGES, className }: AIBlockLoaderProps) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [committed, setCommitted] = useState<CommittedLine[]>([]);
  const [active, setActive] = useState<{ id: number; targetWidth: number; paragraphBreak: boolean; growing: boolean }>(() => {
    const seed = rollLine(false);
    return { id: 0, targetWidth: seed.width, paragraphBreak: false, growing: false };
  });

  const idRef = useRef(1);
  const lastShortRef = useRef(false);

  // Elapsed timer (used only for the long-wait hint).
  useEffect(() => {
    const start = Date.now();
    const elapsedTimer = window.setInterval(() => setElapsedMs(Date.now() - start), 500);
    return () => window.clearInterval(elapsedTimer);
  }, []);

  // Trigger growth on next frame after each new active line.
  useEffect(() => {
    if (active.growing) return;
    const raf = requestAnimationFrame(() => {
      setActive((a) => ({ ...a, growing: true }));
    });
    return () => cancelAnimationFrame(raf);
  }, [active.id, active.growing]);

  // Commit the current active line once it finishes growing, then start a new one.
  useEffect(() => {
    if (!active.growing) return;
    const commitTimer = window.setTimeout(() => {
      setCommitted((prev) => {
        const next: CommittedLine[] = [
          ...prev,
          { id: active.id, width: active.targetWidth, paragraphBreak: active.paragraphBreak },
        ];
        return next.length > MAX_VISIBLE_LINES ? next.slice(next.length - MAX_VISIBLE_LINES) : next;
      });
      lastShortRef.current = active.targetWidth < 65;
      const seed = rollLine(lastShortRef.current);
      setActive({
        id: idRef.current++,
        targetWidth: seed.width,
        paragraphBreak: seed.paragraphBreak,
        growing: false,
      });
    }, LINE_GROW_MS + LINE_SETTLE_MS);
    return () => window.clearTimeout(commitTimer);
  }, [active.id, active.growing, active.targetWidth, active.paragraphBreak]);

  const isLongWait = elapsedMs >= LONG_WAIT_THRESHOLD_MS;
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  const totalLines = committed.length + 1;
  const useMask = totalLines >= MAX_VISIBLE_LINES;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Generating content"
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

        <div className="flex items-baseline gap-1 text-sm font-medium text-foreground min-w-0">
          <span className="truncate">Generating</span>
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

      {/* Streaming skeleton */}
      <div
        className="relative space-y-2.5"
        style={{
          maskImage: useMask
            ? "linear-gradient(to bottom, transparent 0%, black 14%, black 100%)"
            : undefined,
          WebkitMaskImage: useMask
            ? "linear-gradient(to bottom, transparent 0%, black 14%, black 100%)"
            : undefined,
        }}
      >
        {/* Committed (already "written") lines */}
        {committed.map((line) => (
          <div
            key={line.id}
            className={cn(
              "h-2.5 rounded-full bg-foreground/[0.10]",
              line.paragraphBreak && "mt-4",
            )}
            style={{ width: `${line.width}%` }}
          />
        ))}

        {/* Active line: grows left-to-right. Inner sheen amplifies the typing feel. */}
        <div
          key={active.id}
          className={cn(
            "h-2.5 rounded-full bg-foreground/[0.16] relative overflow-hidden",
            active.paragraphBreak && committed.length > 0 && "mt-4",
          )}
          style={{
            width: active.growing ? `${active.targetWidth}%` : "0%",
            transition: `width ${LINE_GROW_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1)`,
          }}
        >
          <span
            aria-hidden="true"
            className="absolute inset-y-0 right-0 w-12"
            style={{
              background:
                "linear-gradient(90deg, transparent, hsl(var(--foreground) / 0.18))",
            }}
          />
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
