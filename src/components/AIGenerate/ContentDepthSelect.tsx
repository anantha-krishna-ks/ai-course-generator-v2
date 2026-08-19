import { useState } from "react";
import { Check, ChevronDown, Coins, Timer } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CONTENT_DEPTH_TIERS, type ContentDepth } from "@/components/Dashboard/AIOptionsPanel";
import { cn } from "@/lib/utils";

interface Props {
  value: ContentDepth;
  onChange: (v: ContentDepth) => void;
  error?: string;
  className?: string;
  /** Compact inline label shown before the trigger */
  label?: string;
}

/**
 * Model-picker style selector for Content Depth.
 * Compact trigger + rich dropdown list — replaces the bulky 3-card grid.
 */
export function ContentDepthSelect({ value, onChange, error, className, label = "Content depth" }: Props) {
  const [open, setOpen] = useState(false);
  const active = CONTENT_DEPTH_TIERS.find((t) => t.id === value) ?? CONTENT_DEPTH_TIERS[1];
  const ActiveIcon = active.icon;

  return (
    <div data-field="contentDepth" className={cn("flex flex-wrap items-center gap-x-3 gap-y-1.5", className)}>
      <span className="text-[13px] font-medium text-foreground">
        {label}
        <span className="text-destructive ml-0.5" aria-hidden="true">*</span>
      </span>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={`Content depth: ${active.label}`}
            aria-haspopup="listbox"
            aria-expanded={open}
            className={cn(
              "group inline-flex items-center gap-2 h-9 pl-2 pr-2.5 rounded-full border bg-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              error ? "border-destructive" : "border-border hover:border-primary/40 hover:bg-accent/40"
            )}
          >
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary" aria-hidden="true">
              <ActiveIcon className="w-3.5 h-3.5" strokeWidth={1.75} />
            </span>
            <span className="text-[13px] font-semibold text-foreground leading-none">{active.label}</span>
            <span className="hidden sm:inline text-[11px] text-muted-foreground leading-none">
              {active.speed} · {active.credits}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" focusable="false" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[320px] p-1.5 rounded-xl">
          <div role="listbox" aria-label="Content depth" className="space-y-1">
            {CONTENT_DEPTH_TIERS.map((tier) => {
              const Icon = tier.icon;
              const selected = tier.id === value;
              return (
                <button
                  key={tier.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(tier.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-start gap-2.5 text-left rounded-lg px-2.5 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selected ? "bg-primary/[0.06]" : "hover:bg-accent/60"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-full shrink-0",
                      selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}
                    aria-hidden="true"
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className={cn("text-[13px] font-semibold", selected ? "text-primary" : "text-foreground")}>
                        {tier.label}
                      </span>
                      {tier.recommended && (
                        <span className="text-[9.5px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full border border-border text-muted-foreground">
                          Recommended
                        </span>
                      )}
                      {selected && <Check className="w-3.5 h-3.5 text-primary ml-auto" strokeWidth={3} aria-hidden="true" />}
                    </span>
                    <span className="block text-[11.5px] text-muted-foreground leading-snug mt-0.5">
                      {tier.description}
                    </span>
                    <span className="flex items-center gap-2 mt-1 text-[10.5px] font-medium text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Timer className="w-3 h-3" aria-hidden="true" focusable="false" />
                        {tier.speed}
                      </span>
                      <span className="w-px h-2.5 bg-border" aria-hidden="true" />
                      <span className="inline-flex items-center gap-1">
                        <Coins className="w-3 h-3" aria-hidden="true" focusable="false" />
                        {tier.credits}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[10.5px] text-muted-foreground px-2.5 py-1.5">
            Locked after creation.
          </p>
        </PopoverContent>
      </Popover>

      {error && (
        <p role="alert" className="text-xs text-destructive font-medium w-full">
          {error}
        </p>
      )}
    </div>
  );
}
