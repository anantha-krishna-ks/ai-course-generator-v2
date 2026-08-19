import { motion } from "framer-motion";
import { Check, Timer, Coins } from "lucide-react";
import { CONTENT_DEPTH_TIERS, type ContentDepth } from "@/components/Dashboard/AIOptionsPanel";
import { cn } from "@/lib/utils";

interface Props {
  value?: ContentDepth;
  onChange: (v: ContentDepth) => void;
  error?: string;
  className?: string;
}

/** Skeleton of a generated page — shows what each depth actually produces. */
const SHAPES: Record<ContentDepth, Array<{ w: string; kind: "line" | "block" | "media" }>> = {
  quick: [
    { w: "70%", kind: "line" },
    { w: "100%", kind: "line" },
    { w: "88%", kind: "line" },
  ],
  balanced: [
    { w: "70%", kind: "line" },
    { w: "100%", kind: "line" },
    { w: "100%", kind: "media" },
    { w: "92%", kind: "line" },
    { w: "60%", kind: "block" },
  ],
  thorough: [
    { w: "70%", kind: "line" },
    { w: "100%", kind: "line" },
    { w: "100%", kind: "media" },
    { w: "96%", kind: "line" },
    { w: "88%", kind: "line" },
    { w: "100%", kind: "block" },
    { w: "74%", kind: "block" },
  ],
};

function PagePreview({ tier, selected }: { tier: ContentDepth; selected: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative h-[104px] w-full rounded-lg border overflow-hidden px-2.5 py-2 flex flex-col gap-[5px] transition-colors",
        selected ? "border-primary/40 bg-primary/[0.05]" : "border-border/70 bg-muted/30"
      )}
    >
      {SHAPES[tier].map((s, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scaleX: 0.6 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: i * 0.035, duration: 0.25 }}
          style={{ width: s.w, transformOrigin: "left" }}
          className={cn(
            "block rounded-[3px] shrink-0",
            s.kind === "line" && (selected ? "h-[5px] bg-primary/35" : "h-[5px] bg-foreground/12"),
            s.kind === "media" && (selected ? "h-[18px] bg-primary/25" : "h-[18px] bg-foreground/10"),
            s.kind === "block" && (selected ? "h-[10px] bg-primary/20" : "h-[10px] bg-foreground/8")
          )}
        />
      ))}
    </div>
  );
}

/**
 * Content depth — chosen by seeing what a generated page looks like at each level.
 * Show-don't-tell: three page skeletons, one line of cost/time each.
 */
export function ContentDepthPreviewPicker({ value, onChange, error, className }: Props) {
  return (
    <div data-field="contentDepth" className={cn("space-y-2", className)}>
      <div>
        <span className="text-base font-semibold text-foreground">
          Content depth <span className="text-destructive ml-0.5" aria-hidden="true">*</span>
        </span>
        <p className="text-xs text-muted-foreground mt-0.5">
          How much content AI writes on every page. This shapes the whole course.
        </p>
      </div>

      <div role="radiogroup" aria-label="Content depth" aria-required="true" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CONTENT_DEPTH_TIERS.map((tier) => {
          const selected = tier.id === value;
          const Icon = tier.icon;
          return (
            <button
              key={tier.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${tier.label} depth — ${tier.description} ${tier.speed}, ${tier.credits}`}
              onClick={() => onChange(tier.id)}
              className={cn(
                "group relative text-left rounded-xl border-2 p-2.5 transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                selected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : error
                    ? "border-destructive/50 bg-background hover:border-primary/40"
                    : "border-border bg-background hover:border-primary/40 hover:bg-muted/30"
              )}
            >
              <PagePreview tier={tier.id} selected={selected} />

              <div className="flex items-center gap-1.5 mt-2.5">
                <Icon
                  className={cn("w-4 h-4 shrink-0", selected ? "text-primary" : "text-muted-foreground")}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  focusable="false"
                />
                <span className="text-sm font-semibold text-foreground">{tier.label}</span>
                {tier.recommended && !selected && (
                  <span className="text-[9.5px] font-medium text-primary bg-primary/10 rounded-full px-1.5 py-px">
                    Recommended
                  </span>
                )}
                {selected && (
                  <span className="ms-auto inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground shrink-0">
                    <Check className="w-2.5 h-2.5" strokeWidth={3.5} aria-hidden="true" />
                  </span>
                )}
              </div>

              <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{tier.tagline}</p>

              <div className="flex items-center gap-2 mt-1.5 text-[10.5px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Timer className="w-3 h-3" aria-hidden="true" focusable="false" />
                  {tier.speed}
                </span>
                <span className="w-px h-3 bg-border" aria-hidden="true" />
                <span className="inline-flex items-center gap-1">
                  <Coins className="w-3 h-3" aria-hidden="true" focusable="false" />
                  {tier.credits}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="text-xs text-destructive font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
