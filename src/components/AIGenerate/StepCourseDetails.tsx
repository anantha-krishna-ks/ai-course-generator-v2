import { AIGenerateState } from "@/pages/AIGenerateCourse";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

interface StepCourseDetailsProps {
  state: AIGenerateState;
  onChange: (partial: Partial<AIGenerateState>) => void;
}

const DURATION_OPTIONS = [
  { value: "brief" as const, label: "Brief", desc: "< 5 min" },
  { value: "standard" as const, label: "Standard", desc: "5–10 min" },
  { value: "extended" as const, label: "Extended", desc: "10+ min" },
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
  { value: "mixed" as const, label: "Mixed" },
];

function ChipGroup({
  options,
  value,
  onChange,
  ariaLabel,
  showDesc,
}: {
  options: { value: string; label: string; desc?: string }[];
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
  showDesc?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={ariaLabel}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              selected
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {opt.label}
            {showDesc && opt.desc && (
              <span className={cn("ml-1.5 text-xs", selected ? "text-primary-foreground/70" : "text-muted-foreground")}>
                {opt.desc}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function StepCourseDetails({ state, onChange }: StepCourseDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="flex items-center gap-2.5 rounded-xl bg-primary/8 border border-primary/15 px-4 py-3">
        <Info className="w-4 h-4 text-primary shrink-0" aria-hidden="true" focusable="false" />
        <p className="text-[13px] text-foreground leading-snug">
          Help us understand your audience and preferences so AI can generate the best course for you.
        </p>
      </div>

      {/* Learning Outcome */}
      <div>
        <label htmlFor="learning-outcome" className="text-sm font-semibold text-field-label mb-2 block uppercase tracking-wider">
          What do you want learners to be able to do after this course?
          <span className="text-destructive ml-0.5" aria-hidden="true">*</span>
        </label>
        <Textarea
          id="learning-outcome"
          value={state.learningOutcome}
          onChange={(e) => onChange({ learningOutcome: e.target.value })}
          placeholder="e.g., Apply conflict resolution techniques in team settings…"
          className="min-h-[72px] resize-none rounded-xl text-sm"
        />
      </div>

      {/* Intended Learners */}
      <div>
        <label htmlFor="intended-learners-detail" className="text-sm font-semibold text-field-label mb-2 block uppercase tracking-wider">
          Intended Learners
        </label>
        <Textarea
          id="intended-learners-detail"
          value={state.intendedLearners}
          onChange={(e) => onChange({ intendedLearners: e.target.value })}
          placeholder="e.g., New managers, sales teams, onboarding hires…"
          className="min-h-[60px] resize-none rounded-xl text-sm"
        />
      </div>

      {/* Duration */}
      <div>
        <div className="text-sm font-semibold text-field-label mb-2.5 uppercase tracking-wider">
          Duration
        </div>
        <ChipGroup
          options={DURATION_OPTIONS}
          value={state.duration}
          onChange={(v) => onChange({ duration: v as AIGenerateState["duration"] })}
          ariaLabel="Course duration"
          showDesc
        />
      </div>

      {/* Tone */}
      <div>
        <div className="text-sm font-semibold text-field-label mb-2.5 uppercase tracking-wider">
          Tone
        </div>
        <ChipGroup
          options={TONE_OPTIONS}
          value={state.tone}
          onChange={(v) => onChange({ tone: v as AIGenerateState["tone"] })}
          ariaLabel="Course tone"
        />
      </div>

      {/* Proficiency */}
      <div>
        <div className="text-sm font-semibold text-field-label mb-2.5 uppercase tracking-wider">
          Proficiency Level
        </div>
        <ChipGroup
          options={PROFICIENCY_OPTIONS}
          value={state.proficiencyLevel}
          onChange={(v) => onChange({ proficiencyLevel: v as AIGenerateState["proficiencyLevel"] })}
          ariaLabel="Proficiency level"
        />
      </div>
    </div>
  );
}
