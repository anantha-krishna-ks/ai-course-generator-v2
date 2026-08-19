import { useState } from "react";
import { ChevronDown, Check, Timer, Coins, Gauge } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CONTENT_DEPTH_TIERS, type ContentDepth } from "@/components/Dashboard/AIOptionsPanel";

interface ContentDepthAffixProps {
  value?: ContentDepth;
  onChange: (v: ContentDepth) => void;
  invalid?: boolean;
  className?: string;
}

/**
 * Content depth control that lives *inside* the course-title field, mirroring the
 * language affix: one quiet pill, one popover, one decision.
 */
export function ContentDepthAffix({ value, onChange, invalid, className }: ContentDepthAffixProps) {
  const [open, setOpen] = useState(false);
  const tier = CONTENT_DEPTH_TIERS.find((t) => t.id === value);
  const Icon = tier?.icon ?? Gauge;

  return (
    <TooltipProvider delayDuration={180}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                data-field="contentDepth"
                aria-label={
                  tier
                    ? `Content depth: ${tier.label}. Click to change.`
                    : "Content depth not set. Click to choose."
                }
                className={cn(
                  "inline-flex items-center gap-1.5 h-8 ps-1 pe-2.5 rounded-full shrink-0 transition-all duration-200",
                  "border bg-gradient-to-b from-background to-muted/60 shadow-[0_1px_2px_hsl(var(--foreground)/0.06)] backdrop-blur-sm",
                  "hover:border-primary/50 hover:shadow-[0_2px_8px_hsl(var(--primary)/0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  invalid && !tier ? "border-destructive" : tier ? "border-border/70" : "border-primary/50",
                  open && "border-primary/60 ring-2 ring-primary/20",
                  className
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "inline-flex items-center justify-center w-5 h-5 rounded-full shadow-sm",
                    tier
                      ? "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="w-3 h-3" />
                </span>
                <span className="text-[11px] font-semibold text-foreground">
                  {tier ? tier.label : "Set depth"}
                </span>
                {tier && (
                  <>
                    <span aria-hidden="true" className="h-3 w-px bg-border hidden sm:block" />
                    <span className="text-[11px] font-medium text-muted-foreground hidden sm:inline">
                      {tier.speed}
                    </span>
                  </>
                )}
                <ChevronDown
                  className={cn(
                    "w-3 h-3 text-muted-foreground transition-transform duration-200",
                    open && "rotate-180 text-primary"
                  )}
                  aria-hidden="true"
                  focusable="false"
                />
              </button>
            </PopoverTrigger>

            <PopoverContent align="end" className="w-[320px] p-2 rounded-2xl shadow-xl">
              <div className="px-2 pt-1 pb-2">
                <p className="text-[12px] font-semibold text-foreground">Content depth</p>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  How deeply should AI develop each page?
                </p>
              </div>
              <div role="radiogroup" aria-label="Content depth">
                {CONTENT_DEPTH_TIERS.map((t) => {
                  const TierIcon = t.icon;
                  const selected = t.id === value;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => {
                        onChange(t.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-start gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        selected ? "bg-primary/[0.07]" : "hover:bg-muted/70"
                      )}
                    >
                      <TierIcon
                        className={cn("w-4 h-4 mt-0.5 shrink-0", selected ? "text-primary" : "text-muted-foreground")}
                        strokeWidth={1.75}
                        aria-hidden="true"
                        focusable="false"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="text-[12.5px] font-semibold text-foreground">{t.label}</span>
                          {t.recommended && (
                            <span className="text-[9.5px] font-medium text-primary bg-primary/10 rounded-full px-1.5 py-px">
                              Recommended
                            </span>
                          )}
                        </span>
                        <span className="block text-[11px] text-muted-foreground leading-snug">
                          {t.description}
                        </span>
                        <span className="flex items-center gap-2 mt-1 text-[10.5px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Timer className="w-2.5 h-2.5" aria-hidden="true" focusable="false" />
                            {t.speed}
                          </span>
                          <span className="w-px h-2.5 bg-border" aria-hidden="true" />
                          <span className="inline-flex items-center gap-1">
                            <Coins className="w-2.5 h-2.5" aria-hidden="true" focusable="false" />
                            {t.credits}
                          </span>
                        </span>
                      </span>
                      {selected && (
                        <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" strokeWidth={3} aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8} className="rounded-lg px-2.5 py-1.5 text-xs font-medium">
          {tier ? (
            <span>
              Content depth: <span className="font-semibold">{tier.label}</span>
              <span className="text-muted-foreground"> · {tier.speed} · {tier.credits}</span>
            </span>
          ) : (
            <span>Choose how deeply AI develops each page</span>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
