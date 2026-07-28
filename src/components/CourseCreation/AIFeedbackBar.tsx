import { useState } from "react";
import { ThumbsUp, ThumbsDown, Check, X, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type AIFeedbackBlockType = "text" | "image";

interface AIFeedbackBarProps {
  blockType: AIFeedbackBlockType;
  /** Optional callback fired when feedback is submitted (positive or negative). */
  onSubmit?: (payload: {
    rating: "positive" | "negative";
    reasons?: string[];
    message?: string;
  }) => void;
  /** Compact spacing for tight surfaces (e.g. inside image blocks). */
  dense?: boolean;
}

const TEXT_REASONS = [
  "Inaccurate",
  "Too generic",
  "Off-topic",
  "Wrong tone",
  "Too long / short",
  "Poorly structured",
];

const IMAGE_REASONS = [
  "Doesn't match topic",
  "Wrong style",
  "Low quality",
  "Off-brand",
  "Wrong text in image",
];

type State = "idle" | "positive" | "negative-form" | "submitted" | "dismissed";

export function AIFeedbackBar({ blockType, onSubmit, dense = false }: AIFeedbackBarProps) {
  const [state, setState] = useState<State>("idle");
  const [reasons, setReasons] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  if (state === "dismissed") return null;

  const chips = blockType === "image" ? IMAGE_REASONS : TEXT_REASONS;

  const toggleReason = (r: string) =>
    setReasons((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));

  const handleThumbsUp = () => {
    setState("positive");
    onSubmit?.({ rating: "positive" });
    window.setTimeout(() => setState("dismissed"), 2200);
  };

  const handleThumbsDown = () => {
    setState("negative-form");
  };

  const handleSend = () => {
    onSubmit?.({ rating: "negative", reasons, message: message.trim() || undefined });
    setState("submitted");
    window.setTimeout(() => setState("dismissed"), 2400);
  };

  const handleSkip = () => {
    onSubmit?.({ rating: "negative" });
    setState("submitted");
    window.setTimeout(() => setState("dismissed"), 1600);
  };

  const containerBase = cn(
    "mt-2 rounded-xl border border-primary/15 bg-gradient-to-br from-primary/[0.04] via-background to-background overflow-hidden",
    dense ? "text-[11px]" : "text-[12px]"
  );

  if (state === "positive" || state === "submitted") {
    return (
      <div className={containerBase} role="status" aria-live="polite">
        <div className="flex items-center gap-2 px-3 py-2 text-emerald-600 dark:text-emerald-400">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/15">
            <Check className="w-3 h-3" aria-hidden="true" focusable="false" />
          </div>
          <span className="font-medium">
            {state === "positive"
              ? "Thanks — glad this was helpful."
              : "Thanks — we'll use this to improve future generations."}
          </span>
        </div>
      </div>
    );
  }

  if (state === "negative-form") {
    return (
      <div className={containerBase}>
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-primary/10">
          <div className="flex items-center gap-1.5 text-foreground font-medium">
            <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
            <span>What went wrong?</span>
            <span className="text-muted-foreground font-normal">Optional — helps the next generation.</span>
          </div>
          <button
            type="button"
            onClick={() => setState("dismissed")}
            aria-label="Close feedback"
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
          </button>
        </div>
        <div className="px-3 py-2.5 space-y-2.5">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Feedback reasons">
            {chips.map((r) => {
              const active = reasons.includes(r);
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleReason(r)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 transition-all",
                    active
                      ? "border-primary/60 bg-primary/10 text-primary"
                      : "border-border/60 bg-background hover:border-foreground/25 text-foreground"
                  )}
                >
                  {active && <Check className="w-3 h-3" aria-hidden="true" focusable="false" />}
                  <span>{r}</span>
                </button>
              );
            })}
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add more detail (optional)…"
            aria-label="Additional feedback"
            rows={2}
            className="w-full resize-none rounded-lg border border-border/60 bg-background px-2.5 py-2 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/25 transition-colors"
          />
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="h-7 rounded-full px-3 text-[11px] font-medium text-muted-foreground hover:text-foreground"
            >
              Skip
            </Button>
            <Button
              size="sm"
              onClick={handleSend}
              disabled={reasons.length === 0 && !message.trim()}
              className="h-7 rounded-full px-3 text-[11px] font-medium gap-1"
            >
              <Send className="w-3 h-3" aria-hidden="true" focusable="false" />
              Send feedback
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerBase}>
      <div className="flex items-center justify-between gap-2 px-3 py-1.5">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
          <span className="font-medium text-foreground">Was this generation helpful?</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleThumbsUp}
            aria-label="Yes, this generation was helpful"
            className="p-1.5 rounded-md text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors"
          >
            <ThumbsUp className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
          </button>
          <button
            type="button"
            onClick={handleThumbsDown}
            aria-label="No, this generation was not helpful"
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <ThumbsDown className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
          </button>
          <div className="w-px h-4 bg-border/60 mx-0.5" aria-hidden="true" />
          <button
            type="button"
            onClick={() => setState("dismissed")}
            aria-label="Dismiss feedback prompt"
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
          </button>
        </div>
      </div>
    </div>
  );
}
