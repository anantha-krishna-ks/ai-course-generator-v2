import { AIGenerateState } from "@/pages/AIGenerateCourse";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Target, Users, Brain } from "lucide-react";

const BLOOMS_LEVELS = [
  "Remember",
  "Understand",
  "Apply",
  "Analyze",
  "Evaluate",
  "Create",
];

const LEARNER_LEVELS = ["Beginners", "Intermediate", "Expert"] as const;

interface StepCourseIntentProps {
  state: AIGenerateState;
  onChange: (partial: Partial<AIGenerateState>) => void;
}

export function StepCourseIntent({ state, onChange }: StepCourseIntentProps) {
  const toggleBloom = (level: string) => {
    const next = state.bloomsTaxonomy.includes(level)
      ? state.bloomsTaxonomy.filter((l) => l !== level)
      : [...state.bloomsTaxonomy, level];
    onChange({ bloomsTaxonomy: next });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" aria-hidden="true" focusable="false" />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Course Intent</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Define the purpose and learning goals of your course.
        </p>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="course-title" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Course Title <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <input
          id="course-title"
          type="text"
          value={state.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g., Introduction to Machine Learning"
          className="w-full text-lg sm:text-xl font-semibold bg-transparent border-0 border-b-2 border-border focus:border-primary outline-none pb-2.5 transition-colors placeholder:text-muted-foreground/40 placeholder:font-normal text-foreground"
          autoComplete="off"
        />
        <p className="text-[11px] text-muted-foreground mt-1">
          This will be used as the primary prompt for AI content generation.
        </p>
      </div>

      {/* Bloom's Taxonomy */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Bloom's Taxonomy <span className="text-destructive" aria-hidden="true">*</span>
          </label>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Select the cognitive levels your course should target.
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Bloom's taxonomy levels">
          {BLOOMS_LEVELS.map((level) => {
            const selected = state.bloomsTaxonomy.includes(level);
            return (
              <button
                key={level}
                type="button"
                onClick={() => toggleBloom(level)}
                aria-pressed={selected}
                className={cn(
                  "px-3.5 py-2 rounded-full text-xs font-medium border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  selected
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                )}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>

      {/* Intended Learners */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Intended Learners <span className="text-destructive" aria-hidden="true">*</span>
          </label>
        </div>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Intended learner level">
          {LEARNER_LEVELS.map((level) => {
            const selected = state.intendedLearners === level;
            return (
              <button
                key={level}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange({ intendedLearners: level })}
                className={cn(
                  "px-4 py-2.5 rounded-full text-xs font-medium border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  selected
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                )}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
