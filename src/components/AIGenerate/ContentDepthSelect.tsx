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
 * Content depth — a quiet option list (Linear/Stripe style).
 * One bordered card, three slim rows: radio dot, label + one-line rationale,
 * time & cost aligned right. Always visible, scannable, never bulky.
 */
export function ContentDepthSegmented({ value, onChange, error, className }: Props) {
  return (
    <div
      data-field="contentDepth"
      className={cn(
        "rounded-xl border bg-card overflow-hidden",
        error ? "border-destructive" : "border-border",
        className
      )}
    >
      <div className="flex items-baseline justify-between gap-3 px-4 pt-3 pb-2">
        <h3 className="text-[13px] font-semibold text-foreground">
          Content depth
          <span className="text-destructive ml-0.5" aria-hidden="true">*</span>
        </h3>
        <span className="text-[11px] text-muted-foreground">Locked after generation</span>
      </div>

      <div role="radiogroup" aria-label="Content depth" aria-required="true" className="px-2 pb-2">
        {CONTENT_DEPTH_TIERS.map((tier) => {
          const Icon = tier.icon;
          const selected = tier.id === value;
          return (
            <button
              key={tier.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(tier.id)}
              className={cn(
                "relative w-full flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                selected ? "bg-primary/[0.06]" : "hover:bg-muted/60"
              )}
            >
              {selected && (
                <motion.span
                  layoutId="content-depth-marker"
                  transition={{ type: "spring", stiffness: 460, damping: 38 }}
                  className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-primary"
                  aria-hidden="true"
                />
              )}

              <span
                className={cn(
                  "shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                  selected ? "border-primary bg-primary" : "border-border"
                )}
                aria-hidden="true"
              >
                {selected && <Check className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={3.5} />}
              </span>

              <Icon
                className={cn("w-4 h-4 shrink-0", selected ? "text-primary" : "text-muted-foreground")}
                strokeWidth={1.75}
                aria-hidden="true"
                focusable="false"
              />

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className={cn("text-[13px] leading-tight", selected ? "font-semibold text-foreground" : "font-medium text-foreground")}>
                    {tier.label}
                  </span>
                  {tier.recommended && (
                    <span className="text-[10px] font-medium text-primary bg-primary/10 rounded-full px-1.5 py-px">
                      Recommended
                    </span>
                  )}
                </span>
                <span className="block text-[11.5px] text-muted-foreground leading-snug truncate">
                  {tier.description}
                </span>
              </span>

              <span className="hidden sm:flex shrink-0 items-center gap-2 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Timer className="w-3 h-3" aria-hidden="true" focusable="false" />
                  {tier.speed}
                </span>
                <span className="w-px h-3 bg-border" aria-hidden="true" />
                <span className="inline-flex items-center gap-1">
                  <Coins className="w-3 h-3" aria-hidden="true" focusable="false" />
                  {tier.credits}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="text-xs text-destructive font-medium px-4 pb-3">
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
