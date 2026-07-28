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
  intensity?: "normal" | "high";
}

function SparkleBurst({ color, trigger, intensity = "normal" }: SparkleBurstProps) {
  const base = [
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

  const extra = intensity === "high"
    ? [
        { deg: 60, dist: 34, size: 6, delay: 0.05, rotate: 60 },
        { deg: 120, dist: 32, size: 5, delay: 0.07, rotate: 120 },
        { deg: 200, dist: 36, size: 6, delay: 0.06, rotate: 200 },
        { deg: 300, dist: 34, size: 5, delay: 0.08, rotate: 300 },
        { deg: 10, dist: 30, size: 4, delay: 0.1, rotate: 10 },
        { deg: 170, dist: 30, size: 4, delay: 0.11, rotate: 170 },
      ]
    : [];

  const particles = [...base, ...extra];
  const duration = intensity === "high" ? 0.95 : 0.7;

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
                transition={{ duration, delay: p.delay, ease: "easeOut" }}
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

// Floating hearts that drift up on thumbs-up success — pure dopamine.
function FloatingHearts({ trigger }: { trigger: number }) {
  const hearts = [
    { x: -22, delay: 0.0, size: 12, rot: -14 },
    { x: -8, delay: 0.08, size: 14, rot: 6 },
    { x: 8, delay: 0.04, size: 11, rot: -8 },
    { x: 22, delay: 0.12, size: 13, rot: 14 },
    { x: 0, delay: 0.16, size: 10, rot: 0 },
  ];
  return (
    <AnimatePresence>
      {trigger > 0 && (
        <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
          {hearts.map((h, i) => (
            <motion.span
              key={`heart-${trigger}-${i}`}
              className="absolute left-0 top-0 text-emerald-500"
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.4, rotate: 0 }}
              animate={{ x: h.x, y: -46, opacity: [0, 1, 1, 0], scale: [0.4, 1, 1, 0.9], rotate: h.rot }}
              transition={{ duration: 1.1, delay: h.delay, ease: "easeOut", times: [0, 0.2, 0.75, 1] }}
            >
              <Heart className="fill-current" style={{ width: h.size, height: h.size }} />
            </motion.span>
          ))}
        </span>
      )}
    </AnimatePresence>
  );
}

// Confetti-style ribbons for the maximum dopamine payoff.
function ConfettiBurst({ trigger }: { trigger: number }) {
  const pieces = Array.from({ length: 14 }).map((_, i) => {
    const angle = (i / 14) * Math.PI * 2;
    const dist = 40 + (i % 3) * 8;
    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist - 10,
      rot: (i * 47) % 360,
      color: ["bg-emerald-400", "bg-amber-400", "bg-sky-400", "bg-primary", "bg-rose-400"][i % 5],
      delay: (i % 5) * 0.02,
    };
  });
  return (
    <AnimatePresence>
      {trigger > 0 && (
        <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
          {pieces.map((p, i) => (
            <motion.span
              key={`conf-${trigger}-${i}`}
              className={cn("absolute left-0 top-0 rounded-[1px]", p.color)}
              style={{ width: 6, height: 2 }}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
              animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rot, scale: 1 }}
              transition={{ duration: 0.9, delay: p.delay, ease: [0.16, 1, 0.3, 1] }}
            />
          ))}
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
    const isPositive = state === "positive";
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className={cn(containerBase, "relative")}
        role="status"
        aria-live="polite"
      >
        {/* Soft radial glow on positive */}
        {isPositive && (
          <motion.span
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(120px 60px at 24px 50%, hsl(152 76% 50% / 0.18), transparent 70%)",
            }}
          />
        )}
        <div className="relative flex items-center gap-2.5 px-3 py-2.5 text-emerald-600 dark:text-emerald-400">
          <div className="relative">
            <motion.div
              initial={{ scale: 0.2, opacity: 0, rotate: -20 }}
              animate={{ scale: [0.2, 1.25, 1], opacity: 1, rotate: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1.4, 0.36, 1], times: [0, 0.6, 1] }}
              className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/15 ring-2 ring-emerald-500/30"
            >
              <Check className="w-3.5 h-3.5" strokeWidth={3} aria-hidden="true" focusable="false" />
            </motion.div>
            {isPositive && (
              <>
                <FloatingHearts trigger={1} />
                <ConfettiBurst trigger={1} />
              </>
            )}
          </div>
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 }}
            className="font-semibold tracking-tight"
          >
            {isPositive ? "You made our day 🎉" : "Thanks — we'll tune future generations."}
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
              <div className="text-[11px] text-muted-foreground leading-tight">Select what could be improved — all fields are optional.</div>
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
            <span className="text-[11px] font-medium text-muted-foreground">Reasons</span>
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
      className={cn(containerBase, "relative")}
    >
      {/* Ambient hover glow — subtle premium touch */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(220px 80px at 85% 50%, hsl(var(--primary) / 0.06), transparent 70%)",
        }}
      />
      <div className="relative flex items-center justify-between gap-2 px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <motion.span
            aria-hidden="true"
            animate={{ rotate: [0, -8, 8, -4, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
            className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-primary/15 to-emerald-500/15"
          >
            <Sparkles className="w-3 h-3 text-primary" focusable="false" />
          </motion.span>
          <span className="font-semibold tracking-tight text-foreground truncate">
            Was this generation helpful?
          </span>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {/* Thumbs up — the dopamine hit */}
          <motion.button
            type="button"
            onClick={handleThumbsUp}
            aria-label="Yes, this generation was helpful"
            whileHover={{ y: -3, scale: 1.15, rotate: -6 }}
            whileTap={{ scale: 0.82, rotate: -18, y: 2 }}
            transition={{ type: "spring", stiffness: 600, damping: 14 }}
            className="relative p-1.5 rounded-lg text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors"
          >
            {/* Bloom background on click */}
            <AnimatePresence>
              {burstKey > 0 && (
                <motion.span
                  key={`bg-${burstKey}`}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: [0, 1, 0.9], scale: [0.4, 1.4, 1] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1.4, 0.36, 1] }}
                  className="absolute inset-0 rounded-lg bg-gradient-to-br from-emerald-400/25 via-emerald-500/20 to-teal-500/20"
                />
              )}
            </AnimatePresence>
            {/* Icon with pop + fill */}
            <motion.span
              animate={
                burstKey > 0
                  ? { scale: [1, 1.6, 1.1], rotate: [0, -14, 0], y: [0, -3, 0] }
                  : { scale: 1, rotate: 0, y: 0 }
              }
              transition={{ duration: 0.55, ease: [0.22, 1.4, 0.36, 1], times: [0, 0.5, 1] }}
              className="relative z-10 inline-flex"
            >
              <ThumbsUp
                className={cn(
                  "w-3.5 h-3.5 transition-colors",
                  burstKey > 0 && "text-emerald-600 drop-shadow-[0_0_6px_hsl(152_76%_50%/0.6)]"
                )}
                fill={burstKey > 0 ? "currentColor" : "none"}
                aria-hidden="true"
                focusable="false"
              />
            </motion.span>
            {/* Concentric ring pulses */}
            <AnimatePresence>
              {burstKey > 0 && (
                <>
                  <motion.span
                    key={`ring-a-${burstKey}`}
                    className="absolute inset-0 rounded-lg border-2 border-emerald-500/60"
                    initial={{ opacity: 0.9, scale: 0.7 }}
                    animate={{ opacity: 0, scale: 2.2 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.75, ease: "easeOut" }}
                  />
                  <motion.span
                    key={`ring-b-${burstKey}`}
                    className="absolute inset-0 rounded-lg border border-emerald-400/50"
                    initial={{ opacity: 0.7, scale: 0.9 }}
                    animate={{ opacity: 0, scale: 2.8 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.95, ease: "easeOut", delay: 0.08 }}
                  />
                </>
              )}
            </AnimatePresence>
            <SparkleBurst color="emerald" trigger={burstKey} intensity="high" />
            <FloatingHearts trigger={burstKey} />
            <ConfettiBurst trigger={burstKey} />
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
