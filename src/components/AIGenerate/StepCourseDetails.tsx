import { AIGenerateState } from "@/pages/AIGenerateCourse";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Info, Target, Users, Clock, MessageSquare, BarChart3 } from "lucide-react";

interface StepCourseDetailsProps {
  state: AIGenerateState;
  onChange: (partial: Partial<AIGenerateState>) => void;
}

const DURATION_OPTIONS = [
  { value: "brief" as const, label: "Brief", desc: "Less than 5 min" },
  { value: "standard" as const, label: "Standard", desc: "5–10 min" },
  { value: "extended" as const, label: "Extended", desc: "More than 10 min" },
];

const TONE_OPTIONS = [
  { value: "professional" as const, label: "Professional" },
  { value: "conversational" as const, label: "Conversational" },
  { value: "coaching" as const, label: "Coaching" },
];

const PROFICIENCY_OPTIONS = [
  { value: "beginner" as const, label: "Beginner" },
  { value: "intermediate" as const, label: "Intermediate" },
  { value: "advanced" as const, label: "Advanced" },
  { value: "expert" as const, label: "Expert" },
  { value: "mixed" as const, label: "Mixed proficiency" },
];

export function StepCourseDetails({ state, onChange }: StepCourseDetailsProps) {
  return (
    <div className="space-y-5">
      {/* Info banner */}
      <div className="flex items-center gap-2.5 rounded-xl bg-primary/8 border border-primary/15 px-4 py-3">
        <Info className="w-4 h-4 text-primary shrink-0" aria-hidden="true" focusable="false" />
        <p className="text-[13px] text-foreground leading-snug">
          Help us understand your audience and preferences so AI can generate the best course for you.
        </p>
      </div>

      {/* Learning Outcome */}
      <div className="space-y-1.5">
        <label htmlFor="learning-outcome" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
          What do you want learners to be able to do after this course? <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <Textarea
          id="learning-outcome"
          value={state.learningOutcome}
          onChange={(e) => onChange({ learningOutcome: e.target.value })}
          placeholder="e.g., Apply conflict resolution techniques in team settings…"
          className="min-h-[70px] resize-none rounded-xl text-sm"
        />
      </div>

      {/* Intended Learners */}
      <div className="space-y-1.5">
        <label htmlFor="intended-learners-detail" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
          Intended Learners
        </label>
        <Textarea
          id="intended-learners-detail"
          value={state.intendedLearners}
          onChange={(e) => onChange({ intendedLearners: e.target.value })}
          placeholder="Who is this course for? e.g., New managers, sales teams…"
          className="min-h-[60px] resize-none rounded-xl text-sm"
        />
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
          Duration
        </label>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Course duration">
          {DURATION_OPTIONS.map((opt) => {
            const selected = state.duration === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange({ duration: opt.value })}
                className={cn(
                  "p-2.5 rounded-xl border-2 transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40 bg-background"
                )}
              >
                <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tone */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
          Tone
        </label>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Course tone">
          {TONE_OPTIONS.map((opt) => {
            const selected = state.tone === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange({ tone: opt.value })}
                className={cn(
                  "p-2.5 rounded-xl border-2 transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40 bg-background"
                )}
              >
                <p className="text-sm font-semibold text-foreground">{opt.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Proficiency Level */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
          Proficiency Level
        </label>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Proficiency level">
          {PROFICIENCY_OPTIONS.map((opt) => {
            const selected = state.proficiencyLevel === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange({ proficiencyLevel: opt.value })}
                className={cn(
                  "px-3.5 py-2 rounded-full border-2 transition-all text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  selected
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border hover:border-primary/40 bg-background text-muted-foreground"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
