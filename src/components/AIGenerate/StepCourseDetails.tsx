import { AIGenerateState } from "@/pages/AIGenerateCourse";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { FileText, ShieldX, BookOpen, Clock, Timer, Layers, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepCourseDetailsProps {
  state: AIGenerateState;
  onChange: (partial: Partial<AIGenerateState>) => void;
}

export function StepCourseDetails({ state, onChange }: StepCourseDetailsProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" aria-hidden="true" focusable="false" />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Course Details</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Provide additional context to guide AI content generation.
        </p>
      </div>

      {/* Layout type */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Layout Type
        </label>
        <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Course layout type">
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
                  "p-4 rounded-xl border-2 transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  selected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/50 bg-background"
                )}
              >
                <Layers className="w-5 h-5 mx-auto mb-2 text-primary" aria-hidden="true" focusable="false" />
                <p className="text-sm font-semibold text-foreground">
                  {layout === "multi-page" ? "Multi-page" : "Single-page"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {layout === "multi-page" ? "Full-length, multiple topics" : "Short, focused learning"}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Duration */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
          Content Duration
        </label>
        <div className="grid grid-cols-2 gap-4">
          {/* Page span */}
          <div className="rounded-xl border border-border p-4 bg-card space-y-2">
            <div className="flex items-center gap-2">
              <Timer className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" focusable="false" />
              <span className="text-xs font-medium text-foreground">Per Page</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full shrink-0"
                onClick={() => onChange({ pageSpanTime: Math.max(1, state.pageSpanTime - 1) })}
                aria-label="Decrease page duration"
              >
                <Minus className="w-3 h-3" aria-hidden="true" focusable="false" />
              </Button>
              <span className="text-lg font-bold text-foreground tabular-nums min-w-[3ch] text-center" aria-live="polite">
                {state.pageSpanTime}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full shrink-0"
                onClick={() => onChange({ pageSpanTime: Math.min(30, state.pageSpanTime + 1) })}
                aria-label="Increase page duration"
              >
                <Plus className="w-3 h-3" aria-hidden="true" focusable="false" />
              </Button>
              <span className="text-xs text-muted-foreground">min</span>
            </div>
          </div>

          {/* Course span */}
          <div className="rounded-xl border border-border p-4 bg-card space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" focusable="false" />
              <span className="text-xs font-medium text-foreground">Total Course</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full shrink-0"
                onClick={() => onChange({ courseSpanTime: Math.max(5, state.courseSpanTime - 5) })}
                aria-label="Decrease course duration"
              >
                <Minus className="w-3 h-3" aria-hidden="true" focusable="false" />
              </Button>
              <span className="text-lg font-bold text-foreground tabular-nums min-w-[3ch] text-center" aria-live="polite">
                {state.courseSpanTime}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full shrink-0"
                onClick={() => onChange({ courseSpanTime: Math.min(480, state.courseSpanTime + 5) })}
                aria-label="Increase course duration"
              >
                <Plus className="w-3 h-3" aria-hidden="true" focusable="false" />
              </Button>
              <span className="text-xs text-muted-foreground">min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Guidelines */}
      <div className="space-y-2">
        <label htmlFor="guidelines" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
          Guidelines
        </label>
        <Textarea
          id="guidelines"
          value={state.guidelines}
          onChange={(e) => onChange({ guidelines: e.target.value })}
          placeholder="Any specific guidelines the AI should follow when generating content..."
          className="min-h-[80px] resize-none rounded-xl"
        />
      </div>

      {/* Exclusions */}
      <div className="space-y-2">
        <label htmlFor="exclusions" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <ShieldX className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
          Exclusions
        </label>
        <Textarea
          id="exclusions"
          value={state.exclusions}
          onChange={(e) => onChange({ exclusions: e.target.value })}
          placeholder="Topics or content to exclude from the course..."
          className="min-h-[80px] resize-none rounded-xl"
        />
      </div>
    </div>
  );
}
