import { CONTENT_DEPTH_TIERS, type ContentDepth } from "@/components/Dashboard/AIOptionsPanel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Props {
  value?: ContentDepth;
  onChange: (v: ContentDepth) => void;
  error?: string;
  className?: string;
}

/**
 * Ultra-compact, inline depth chooser meant to sit directly under a field's
 * helper text — one line, no card, no popover.
 */
export function ContentDepthInline({ value, onChange, error, className }: Props) {
  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn("flex flex-wrap items-center gap-x-2 gap-y-1.5", className)}
        data-field="contentDepth"
      >
        <span className="text-[11px] font-medium text-muted-foreground">
          Content depth
          <span className="text-destructive ml-0.5" aria-hidden="true">*</span>
        </span>

        <div
          role="radiogroup"
          aria-label="Content depth"
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full border bg-muted/40 p-0.5",
            error ? "border-destructive" : "border-border"
          )}
        >
          {CONTENT_DEPTH_TIERS.map((tier) => {
            const selected = value === tier.id;
            return (
              <Tooltip key={tier.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => onChange(tier.id)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      selected
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tier.label}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[220px]">
                  <p className="text-xs">{tier.description}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {error && (
          <span role="alert" className="text-[11px] text-destructive font-medium">
            {error}
          </span>
        )}
      </div>
    </TooltipProvider>
  );
}
