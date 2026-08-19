import { Check, Coins, Timer } from "lucide-react";
import { motion } from "framer-motion";
import { CONTENT_DEPTH_TIERS, type ContentDepth } from "@/components/Dashboard/AIOptionsPanel";
import { cn } from "@/lib/utils";

interface Props {
  value?: ContentDepth;
  onChange: (v: ContentDepth) => void;
  error?: string;
  className?: string;
}

/**
 * Content Depth — always-visible segmented control.
 * All three tiers stay on screen (no hidden dropdown), so the decision can't be
 * skipped, while the whole control stays one row tall.
 */
export function ContentDepthSegmented({ value, onChange, error, className }: Props) {
  const active = CONTENT_DEPTH_TIERS.find((t) => t.id === value);

  return (
    <div
      data-field="contentDepth"
      className={cn(
        "rounded-xl border bg-card px-3.5 py-3",
        error ? "border-destructive" : !active ? "border-primary/40 bg-primary/[0.03]" : "border-border",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4">
        <div className="min-w-0 sm:w-[168px] shrink-0">
          <div className="text-[13px] font-semibold text-foreground leading-tight">
            Content depth
            <span className="text-destructive ml-0.5" aria-hidden="true">*</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
            {active ? active.description : "Pick one to continue — locked after creation."}
          </p>
        </div>

        <div
          role="radiogroup"
          aria-label="Content depth"
          aria-required="true"
          className="grid grid-cols-3 gap-1 p-1 rounded-full bg-muted/60 flex-1 min-w-0"
        >
          {CONTENT_DEPTH_TIERS.map((tier) => {
            const Icon = tier.icon;
            const selected = tier.id === value;
            return (
              <button
                key={tier.id}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={`${tier.label} — ${tier.tagline}, ${tier.speed}, ${tier.credits}`}
                onClick={() => onChange(tier.id)}
                className={cn(
                  "relative flex items-center justify-center gap-1.5 h-11 px-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  selected ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {selected && (
                  <motion.span
                    layoutId="content-depth-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-full bg-background border border-primary/40 shadow-[0_4px_12px_-6px_hsl(var(--primary)/0.35)] pointer-events-none"
                    aria-hidden="true"
                  />
                )}
                <span className="relative flex items-center gap-1.5 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                  <span className="min-w-0 text-left leading-tight">
                    <span className={cn("block text-[12.5px] truncate", selected ? "font-semibold" : "font-medium")}>
                      {tier.label}
                    </span>
                    <span className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Timer className="w-2.5 h-2.5" aria-hidden="true" focusable="false" />
                      {tier.speed}
                      <span className="w-px h-2 bg-border" aria-hidden="true" />
                      <Coins className="w-2.5 h-2.5" aria-hidden="true" focusable="false" />
                      {tier.credits}
                    </span>
                  </span>
                  {selected && <Check className="w-3 h-3 shrink-0" strokeWidth={3} aria-hidden="true" />}
                  {!selected && tier.recommended && (
                    <span className="hidden lg:inline w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <p role="alert" className="text-xs text-destructive font-medium mt-2">
          {error}
        </p>
      )}
    </div>
  );
}

/** Read-only one-line summary, used in the final confirm dialog. */
export function ContentDepthSummary({ value }: { value?: ContentDepth }) {
  const tier = CONTENT_DEPTH_TIERS.find((t) => t.id === value);
  if (!tier) return null;
  const Icon = tier.icon;
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-foreground">
      <Icon className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
      {tier.label} depth
      <span className="text-muted-foreground font-normal">
        · {tier.speed} · {tier.credits}
      </span>
    </span>
  );
}
