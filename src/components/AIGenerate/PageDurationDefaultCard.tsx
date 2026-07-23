import { Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Props {
  valueSec: number;
  onChange: (sec: number) => void;
  description?: string;
  className?: string;
}

/**
 * Shared "Page duration" default card used across AI-generate, Step-by-step,
 * and Document-to-course flows. Bound to `scormPageDurationSec` (in seconds).
 */
export function PageDurationDefaultCard({ valueSec, onChange, description, className }: Props) {
  const mins = Math.floor((valueSec || 0) / 60);
  const secs = (valueSec || 0) % 60;
  const total = mins * 60 + secs;
  const belowMin = total < 60;

  return (
    <div className={cn("rounded-xl border border-border bg-card p-5", className)}>
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
          <Clock className="h-4 w-4 text-primary" aria-hidden="true" focusable="false" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[16px] font-semibold text-foreground leading-tight">Page duration</div>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {description ??
              "Default time budget AI uses to size each page's content. You can override any individual page later."}
          </p>
          <div className="mt-3 flex items-end gap-3">
            <div className="flex flex-col">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                Minutes
              </span>
              <Input
                type="number"
                min={0}
                max={60}
                value={mins}
                onChange={(e) => {
                  const m = Math.max(0, Math.min(60, Number(e.target.value) || 0));
                  onChange(m * 60 + secs);
                }}
                aria-label="Default page duration minutes"
                className="h-11 w-20 text-center text-[16px] font-semibold tabular-nums rounded-lg"
              />
            </div>
            <span aria-hidden="true" className="text-[20px] font-light text-muted-foreground pb-1.5 select-none">:</span>
            <div className="flex flex-col">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                Seconds
              </span>
              <Input
                type="number"
                min={0}
                max={59}
                value={secs}
                onChange={(e) => {
                  const s = Math.max(0, Math.min(59, Number(e.target.value) || 0));
                  onChange(mins * 60 + s);
                }}
                aria-label="Default page duration seconds"
                className="h-11 w-20 text-center text-[16px] font-semibold tabular-nums rounded-lg"
              />
            </div>
          </div>
          {belowMin && (
            <p className="text-[11px] text-destructive mt-2" role="alert">
              Duration must be at least 1 minute.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
