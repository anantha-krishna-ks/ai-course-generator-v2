import { AIGenerateState } from "@/pages/AIGenerateCourse";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Clock, Timer, Layers, FileText, ShieldX, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepCourseDetailsProps {
  state: AIGenerateState;
  onChange: (partial: Partial<AIGenerateState>) => void;
}

export function StepCourseDetails({ state, onChange }: StepCourseDetailsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-foreground">How should the course be structured?</h1>
        <p className="text-sm text-muted-foreground mt-1">Additional context to guide AI generation.</p>
      </div>

      {/* Layout */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Layout</label>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Course layout type">
          {(["multi-page", "single-page"] as const).map((layout) => {
            const selected = state.layoutType === layout;
            return (
              <button
                key={layout}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange({ layoutType: layout })}
                className={cn(
                  "p-3 rounded-xl border-2 transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40 bg-background"
                )}
              >
                <Layers className="w-4 h-4 text-primary mb-1.5" aria-hidden="true" focusable="false" />
                <p className="text-sm font-semibold text-foreground">{layout === "multi-page" ? "Multi-page" : "Single-page"}</p>
                <p className="text-[11px] text-muted-foreground">{layout === "multi-page" ? "Multiple topics" : "Quick learning"}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
          Duration
        </label>
        <div className="grid grid-cols-2 gap-3">
          <DurationControl label="Per Page" value={state.pageSpanTime} min={1} max={30} step={1} unit="min" onChange={(v) => onChange({ pageSpanTime: v })} />
          <DurationControl label="Total Course" value={state.courseSpanTime} min={5} max={480} step={5} unit="min" onChange={(v) => onChange({ courseSpanTime: v })} />
        </div>
      </div>

      {/* Guidelines */}
      <div className="space-y-1.5">
        <label htmlFor="guidelines" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
          Guidelines
        </label>
        <Textarea
          id="guidelines"
          value={state.guidelines}
          onChange={(e) => onChange({ guidelines: e.target.value })}
          placeholder="Specific guidelines for the AI..."
          className="min-h-[60px] resize-none rounded-xl text-sm"
        />
      </div>

      {/* Exclusions */}
      <div className="space-y-1.5">
        <label htmlFor="exclusions" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <ShieldX className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
          Exclusions
        </label>
        <Textarea
          id="exclusions"
          value={state.exclusions}
          onChange={(e) => onChange({ exclusions: e.target.value })}
          placeholder="Topics to exclude..."
          className="min-h-[60px] resize-none rounded-xl text-sm"
        />
      </div>
    </div>
  );
}

function DurationControl({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-xl border border-border p-3 bg-background space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Timer className="w-3 h-3 text-muted-foreground" aria-hidden="true" focusable="false" />
        <span className="text-[11px] font-medium text-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="icon" className="h-7 w-7 rounded-full shrink-0" onClick={() => onChange(Math.max(min, value - step))} aria-label={`Decrease ${label.toLowerCase()}`}>
          <Minus className="w-3 h-3" aria-hidden="true" focusable="false" />
        </Button>
        <span className="text-base font-bold text-foreground tabular-nums min-w-[2.5ch] text-center" aria-live="polite">{value}</span>
        <Button type="button" variant="outline" size="icon" className="h-7 w-7 rounded-full shrink-0" onClick={() => onChange(Math.min(max, value + step))} aria-label={`Increase ${label.toLowerCase()}`}>
          <Plus className="w-3 h-3" aria-hidden="true" focusable="false" />
        </Button>
        <span className="text-[11px] text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}
