import { AIGenerateState } from "@/pages/AIGenerateCourse";
import { cn } from "@/lib/utils";
import { Brain, Users } from "lucide-react";

const BLOOMS_LEVELS = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-foreground">What will your course teach?</h1>
        <p className="text-sm text-muted-foreground mt-1">Define the core purpose and learning goals.</p>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <label htmlFor="course-title" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Course Title <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <input
          id="course-title"
          type="text"
          value={state.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g., Introduction to Machine Learning"
          className="w-full text-base sm:text-lg font-semibold bg-transparent border-0 border-b-2 border-border focus:border-primary outline-none pb-2 transition-colors placeholder:text-muted-foreground/40 placeholder:font-normal text-foreground"
          autoComplete="off"
        />
      </div>

      {/* Bloom's Taxonomy */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Bloom's Taxonomy <span className="text-destructive" aria-hidden="true">*</span>
          </label>
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Bloom's taxonomy levels">
          {BLOOMS_LEVELS.map((level) => {
            const selected = state.bloomsTaxonomy.includes(level);
            return (
              <button
                key={level}
                type="button"
                onClick={() => toggleBloom(level)}
                aria-pressed={selected}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  selected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50"
                )}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>

      {/* Intended Learners */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Intended Learners <span className="text-destructive" aria-hidden="true">*</span>
          </label>
        </div>
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Intended learner level">
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
                  "px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  selected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50"
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
