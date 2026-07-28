import { useEffect, useState } from "react";
import { ThumbsUp, ThumbsDown, Check, X, Send, Sparkles, Star, Heart } from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type AIFeedbackBlockType = "text" | "image";

interface AIFeedbackBarProps {
  blockType: AIFeedbackBlockType;
  onSubmit?: (payload: {
    rating: "positive" | "negative";
    reasons?: string[];
    message?: string;
  }) => void;
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

interface SparkleBurstProps {
  color: "emerald" | "rose";
  trigger: number;
}

function SparkleBurst({ color, trigger }: SparkleBurstProps) {
  const particles = [
    { deg: 0, dist: 18, size: 10, delay: 0, rotate: 0 },
    { deg: 45, dist: 14, size: 7, delay: 0.03, rotate: 45 },
    { deg: 90, dist: 20, size: 9, delay: 0.06, rotate: 90 },
    { deg: 135, dist: 15, size: 7, delay: 0.04, rotate: 135 },
    { deg: 180, dist: 18, size: 10, delay: 0.02, rotate: 180 },
    { deg: 225, dist: 14, size: 7, delay: 0.05, rotate: 225 },
    { deg: 270, dist: 20, size: 9, delay: 0.07, rotate: 270 },
    { deg: 315, dist: 15, size: 7, delay: 0.03, rotate: 315 },
    { deg: 22, dist: 10, size: 5, delay: 0.08, rotate: 22 },
    { deg: 202, dist: 10, size: 5, delay: 0.09, rotate: 202 },
  ];

  const colorClass = color === "emerald" ? "text-emerald-500" : "text-rose-500";

  return (
    <AnimatePresence>
      {trigger > 0 && (
        <span className="pointer-events-none absolute inset-0" aria-hidden="true">
          {particles.map((p, i) => {
            const rad = (p.deg * Math.PI) / 180;
            const dx = Math.cos(rad) * p.dist;
            const dy = Math.sin(rad) * p.dist;
            return (
              <motion.span
                key={`spark-${trigger}-${i}`}
                className={cn("absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2", colorClass)}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.3, rotate: 0 }}
                animate={{ x: dx, y: dy, opacity: 0, scale: 1, rotate: p.rotate + 90 }}
                transition={{ duration: 0.7, delay: p.delay, ease: "easeOut" }}
              >
                <Star className="w-2.5 h-2.5" style={{ width: p.size, height: p.size }} fill="currentColor" />
              </motion.span>
            );
          })}
        </span>
      )}
    </AnimatePresence>
  );
}

type State = "idle" | "positive" | "negative-form" | "submitted" | "dismissed";

export function AIFeedbackBar({ blockType, onSubmit, dense = false }: AIFeedbackBarProps) {
  const [state, setState] = useState<State>("idle");
  const [reasons, setReasons] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [burstKey, setBurstKey] = useState(0);
  const [downBurstKey, setDownBurstKey] = useState(0);

  if (state === "dismissed") return null;

  const chips = blockType === "image" ? IMAGE_REASONS : TEXT_REASONS;

  const toggleReason = (r: string) =>
    setReasons((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));

  const handleThumbsUp = () => {
    setBurstKey((k) => k + 1);
    setState("positive");
    onSubmit?.({ rating: "positive" });
    window.setTimeout(() => setState("dismissed"), 2400);
  };

  const handleThumbsDown = () => {
    setDownBurstKey((k) => k + 1);
    setState("negative-form");
  };

  const handleSend = () => {
    onSubmit?.({ rating: "negative", reasons, message: message.trim() || undefined });
    setState("submitted");
    window.setTimeout(() => setState("dismissed"), 2400);
  };

  const containerBase = cn(
    "mt-2 rounded-xl border border-border/60 bg-card overflow-hidden",
    dense ? "text-[11px]" : "text-[12px]"
  );

  // Success / submitted
  if (state === "positive" || state === "submitted") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className={containerBase}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-2 px-3 py-2 text-emerald-600 dark:text-emerald-400">
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/15"
          >
            <Check className="w-3 h-3" aria-hidden="true" focusable="false" />
          </motion.div>
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 }}
            className="font-medium"
          >
            {state === "positive"
              ? "Thanks — glad this was helpful."
              : "Thanks — we'll use this to improve future generations."}
          </motion.span>
        </div>
      </motion.div>
    );
  }

  // Negative form — refined, no cheap gradients
  if (state === "negative-form") {
    const count = reasons.length;
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className={cn(containerBase, "shadow-sm")}
      >
        {/* Header — solid, editorial */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/60">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted">
              <Sparkles className="w-3.5 h-3.5 text-foreground/70" aria-hidden="true" focusable="false" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-foreground leading-tight">Help us improve this</div>
              <div className="text-[11px] text-muted-foreground leading-tight">Pick what didn't land — all fields optional.</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setState("dismissed")}
            aria-label="Close feedback"
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
          </button>
        </div>

        {/* Body */}
        <div className="px-3 py-2.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Reasons</span>
            <motion.span
              key={count}
              initial={{ scale: 0.85, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              className={cn(
                "text-[10px] tabular-nums px-1.5 py-0.5 rounded-full",
                count > 0 ? "bg-primary/10 text-primary" : "text-muted-foreground bg-muted"
              )}
            >
              {count} selected
            </motion.span>
          </div>
          <LayoutGroup>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Feedback reasons">
              {chips.map((r) => {
                const active = reasons.includes(r);
                return (
                  <motion.button
                    key={r}
                    layout
                    type="button"
                    onClick={() => toggleReason(r)}
                    aria-pressed={active}
                    whileTap={{ scale: 0.94 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 transition-colors",
                      active
                        ? "border-primary/60 bg-primary/10 text-primary"
                        : "border-border/60 bg-background hover:border-foreground/40 text-foreground"
                    )}
                  >
                    <AnimatePresence initial={false}>
                      {active && (
                        <motion.span
                          key="check"
                          initial={{ width: 0, opacity: 0, marginRight: 0 }}
                          animate={{ width: 12, opacity: 1, marginRight: 2 }}
                          exit={{ width: 0, opacity: 0, marginRight: 0 }}
                          transition={{ duration: 0.15 }}
                          className="inline-flex items-center overflow-hidden"
                        >
                          <Check className="w-3 h-3" aria-hidden="true" focusable="false" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <span>{r}</span>
                  </motion.button>
                );
              })}
            </div>
          </LayoutGroup>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us more (optional)…"
            aria-label="Additional feedback"
            rows={2}
            className="w-full resize-none rounded-lg border border-border/60 bg-background px-2.5 py-2 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10 transition-all"
          />
          <div className="flex items-center justify-end">
            <Button
              size="sm"
              onClick={handleSend}
              disabled={reasons.length === 0 && !message.trim()}
              className="h-7 rounded-full px-3.5 text-[11px] font-medium gap-1"
            >
              <Send className="w-3 h-3" aria-hidden="true" focusable="false" />
              Send feedback
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Idle prompt
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={containerBase}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-1.5">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Sparkles className="w-3.5 h-3.5 text-foreground/60" aria-hidden="true" focusable="false" />
          <span className="font-medium text-foreground">Was this generation helpful?</span>
        </div>
        <div className="flex items-center gap-0.5">
          {/* Thumbs up with Lottie-like sparkle burst */}
          <motion.button
            type="button"
            onClick={handleThumbsUp}
            aria-label="Yes, this generation was helpful"
            whileHover={{ y: -2, scale: 1.08 }}
            whileTap={{ scale: 0.88, rotate: -10 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="relative p-1.5 rounded-md text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors"
          >
            <AnimatePresence>
              {burstKey > 0 && (
                <motion.span
                  key={`bg-${burstKey}`}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 rounded-md bg-emerald-500/10"
                />
              )}
            </AnimatePresence>
            <ThumbsUp
              className={cn(
                "w-3.5 h-3.5 relative z-10 transition-colors",
                burstKey > 0 && "text-emerald-600"
              )}
              fill={burstKey > 0 ? "currentColor" : "none"}
              aria-hidden="true"
              focusable="false"
            />
            {/* Ring pulse */}
            <AnimatePresence>
              {burstKey > 0 && (
                <motion.span
                  key={`ring-${burstKey}`}
                  className="absolute inset-0 rounded-md border border-emerald-500/50"
                  initial={{ opacity: 0.8, scale: 0.8 }}
                  animate={{ opacity: 0, scale: 1.8 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              )}
            </AnimatePresence>
            <SparkleBurst color="emerald" trigger={burstKey} />
          </motion.button>

          {/* Thumbs down with Lottie-like sparkle burst */}
          <motion.button
            type="button"
            onClick={handleThumbsDown}
            aria-label="No, this generation was not helpful"
            whileHover={{ y: 2, scale: 1.08 }}
            whileTap={{ scale: 0.88, rotate: 10 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="relative p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <AnimatePresence>
              {downBurstKey > 0 && (
                <motion.span
                  key={`bg-down-${downBurstKey}`}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 rounded-md bg-destructive/10"
                />
              )}
            </AnimatePresence>
            <ThumbsDown
              className={cn(
                "w-3.5 h-3.5 relative z-10 transition-colors",
                downBurstKey > 0 && "text-destructive"
              )}
              fill={downBurstKey > 0 ? "currentColor" : "none"}
              aria-hidden="true"
              focusable="false"
            />
            <AnimatePresence>
              {downBurstKey > 0 && (
                <motion.span
                  key={`ring-down-${downBurstKey}`}
                  className="absolute inset-0 rounded-md border border-destructive/50"
                  initial={{ opacity: 0.8, scale: 0.8 }}
                  animate={{ opacity: 0, scale: 1.8 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              )}
            </AnimatePresence>
            <SparkleBurst color="rose" trigger={downBurstKey} />
          </motion.button>

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
    </motion.div>
  );
}
