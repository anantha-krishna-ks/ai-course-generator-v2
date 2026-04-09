import { AIGenerateState } from "@/pages/AIGenerateCourse";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Info, Users, Clock, MessageSquare, BarChart3 } from "lucide-react";

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

function SectionLabel({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <Icon className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
      <span className="text-[13px] font-semibold text-foreground">{children}</span>
    </div>
  );
}

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
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={ariaLabel}>
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
              "px-3 py-1.5 rounded-full text-[13px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              selected
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {opt.label}
            {showDesc && opt.desc && (
              <span className={cn("ml-1 text-[11px]", selected ? "text-primary-foreground/70" : "text-muted-foreground")}>
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
    <div className="space-y-5">
      {/* Info banner */}
      <div className="flex items-start gap-2.5 rounded-lg bg-muted/50 px-3.5 py-2.5">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" focusable="false" />
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          Help us understand your audience and preferences so AI can generate the best course for you.
        </p>
      </div>

      {/* Learning Outcome */}
      <div>
        <label htmlFor="learning-outcome" className="text-[13px] font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
          What do you want learners to be able to do after this course?
          <span className="text-destructive text-xs" aria-hidden="true">*</span>
        </label>
        <Textarea
          id="learning-outcome"
          value={state.learningOutcome}
          onChange={(e) => onChange({ learningOutcome: e.target.value })}
          placeholder="e.g., Apply conflict resolution techniques in team settings…"
          className="min-h-[64px] resize-none rounded-xl text-sm bg-background"
        />
      </div>

      {/* Intended Learners */}
      <div>
        <label htmlFor="intended-learners-detail" className="flex items-center gap-1.5 mb-1.5">
          <Users className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
          <span className="text-[13px] font-semibold text-foreground">Intended Learners</span>
        </label>
        <Textarea
          id="intended-learners-detail"
          value={state.intendedLearners}
          onChange={(e) => onChange({ intendedLearners: e.target.value })}
          placeholder="e.g., New managers, sales teams, onboarding hires…"
          className="min-h-[56px] resize-none rounded-xl text-sm bg-background"
        />
      </div>

      {/* Compact row: Duration + Tone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <SectionLabel icon={Clock}>Duration</SectionLabel>
          <ChipGroup
            options={DURATION_OPTIONS}
            value={state.duration}
            onChange={(v) => onChange({ duration: v as AIGenerateState["duration"] })}
            ariaLabel="Course duration"
            showDesc
          />
        </div>
        <div>
          <SectionLabel icon={MessageSquare}>Tone</SectionLabel>
          <ChipGroup
            options={TONE_OPTIONS}
            value={state.tone}
            onChange={(v) => onChange({ tone: v as AIGenerateState["tone"] })}
            ariaLabel="Course tone"
          />
        </div>
      </div>

      {/* Proficiency */}
      <div>
        <SectionLabel icon={BarChart3}>Proficiency Level</SectionLabel>
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
