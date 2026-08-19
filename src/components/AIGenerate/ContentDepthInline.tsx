import { motion } from "framer-motion";
import { Check, AlertCircle, Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CONTENT_DEPTH_TIERS, type ContentDepth } from "@/components/Dashboard/AIOptionsPanel";
import { cn } from "@/lib/utils";

interface Props {
  value?: ContentDepth;
  onChange: (v: ContentDepth) => void;
  error?: string;
  className?: string;
}

/**
 * Compact, single-row depth chooser. Three pill options sit side-by-side with a
 * subtle sliding indicator. Hovering the info dot reveals full descriptions.
 */
export function ContentDepthInline({ value, onChange, error, className }: Props) {
  const unset = !value;

  return (
    <div className={cn("space-y-2", className)} data-field="contentDepth">
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-foreground">
          Content Depth <span className="text-destructive ml-0.5" aria-hidden="true">*</span>
        </label>

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="What is content depth?"
            >
              <Info className="h-3.5 w-3.5" aria-hidden="true" focusable="false" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="w-72 p-3 text-xs space-y-2">
            <p className="font-medium text-foreground">How deeply should AI develop each page?</p>
            <ul className="space-y-1.5 text-muted-foreground">
              {CONTENT_DEPTH_TIERS.map((tier) => (
                <li key={tier.id} className="flex gap-2">
                  <span className="font-semibold text-foreground shrink-0">{tier.label}</span>
                  <span>{tier.description}</span>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>

        {unset && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
            <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Choose one
          </span>
        )}
      </div>

      <div
        role="radiogroup"
        aria-label="Content depth"
        className={cn(
          "relative flex items-center rounded-full border p-1 transition-colors",
          error ? "border-destructive/60 bg-destructive/5" : "border-border bg-muted/40"
        )}
      >
        {value && (
          <motion.div
            layoutId="content-depth-pill"
            className="absolute inset-y-1 rounded-full bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-[0_0_16px_-4px_hsl(var(--primary)/0.5)]"
            initial={false}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{
              width: `${100 / CONTENT_DEPTH_TIERS.length}%`,
              left: `${(CONTENT_DEPTH_TIERS.findIndex((t) => t.id === value) * 100) / CONTENT_DEPTH_TIERS.length}%`,
            }}
          />
        )}

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
                "relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 px-2 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                selected ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3 w-3" aria-hidden="true" focusable="false" />
              <span className="truncate">{tier.label}</span>
              {selected && (
                <Check className="h-3 w-3 shrink-0" aria-hidden="true" focusable="false" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between px-0.5">
        <p className="text-[10px] text-muted-foreground">
          {value
            ? CONTENT_DEPTH_TIERS.find((t) => t.id === value)?.speed +
              " · " +
              CONTENT_DEPTH_TIERS.find((t) => t.id === value)?.credits
            : "Select a depth to control page richness"}
        </p>
        {error && (
          <p role="alert" className="flex items-center gap-1 text-[10px] font-medium text-destructive">
            <AlertCircle className="h-3 w-3" aria-hidden="true" focusable="false" />
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
