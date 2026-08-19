import { motion } from "framer-motion";
import { Check, AlertCircle } from "lucide-react";
import { CONTENT_DEPTH_TIERS, type ContentDepth } from "@/components/Dashboard/AIOptionsPanel";
import { cn } from "@/lib/utils";

interface Props {
  value?: ContentDepth;
  onChange: (v: ContentDepth) => void;
  error?: string;
  className?: string;
}

/**
 * Slim, always-visible depth chooser presented as its own required field row so
 * it reads with the same weight as the other mandatory decisions in Step 1.
 */
export function ContentDepthInline({ value, onChange, error, className }: Props) {
  const unset = !value;

  return (
    <div className={cn("space-y-2", className)} data-field="contentDepth">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-base font-semibold text-foreground">
          Content Depth <span className="text-destructive ml-0.5" aria-hidden="true">*</span>
        </label>
        {unset && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
            <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Choose one
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground -mt-1">
        How deeply should AI develop each page of this course?
      </p>

      <div
        role="radiogroup"
        aria-label="Content depth"
        className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-0.5"
      >
        {CONTENT_DEPTH_TIERS.map((tier) => {
          const selected = value === tier.id;
          const Icon = tier.icon;
          return (
            <button
              key={tier.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(tier.id)}
              className={cn(
                "group relative flex items-start gap-2.5 rounded-xl border-2 px-3 py-2.5 text-left transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                selected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : error
                    ? "border-destructive/60 border-dashed hover:border-destructive"
                    : "border-dashed border-border hover:border-primary/60 hover:bg-muted/40 hover:-translate-y-0.5"
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                  selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold text-foreground">{tier.label}</span>
                  {tier.recommended && !selected && (
                    <span className="rounded-full bg-primary/10 px-1.5 py-px text-[9px] font-semibold text-primary">
                      Recommended
                    </span>
                  )}
                </span>
                <span className="block text-[11px] leading-snug text-muted-foreground">
                  {tier.description}
                </span>
                <span className="mt-1 block text-[10.5px] font-medium text-muted-foreground">
                  {tier.speed} · {tier.credits}
                </span>
              </span>

              {selected && (
                <motion.span
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute right-2 top-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground"
                  aria-hidden="true"
                >
                  <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                </motion.span>
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-1 text-[11px] font-medium text-destructive">
          <AlertCircle className="h-3 w-3" aria-hidden="true" focusable="false" />
          {error}
        </p>
      )}
    </div>
  );
}
