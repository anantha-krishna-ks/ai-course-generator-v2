import { AIGenerateState } from "@/pages/AIGenerateCourse";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Lightbulb } from "lucide-react";
import { useState } from "react";

interface StepCourseIntentProps {
  state: AIGenerateState;
  onChange: (partial: Partial<AIGenerateState>) => void;
}

export function StepCourseIntent({ state, onChange }: StepCourseIntentProps) {
  const [showExample, setShowExample] = useState(false);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-foreground">Let's build your course</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Start building your course by uploading any relevant documents, then answer a few quick questions to help us generate the content.
        </p>
      </div>

      {/* Course Title */}
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
          className="w-full text-base sm:text-lg font-semibold bg-transparent border-0 border-b-2 border-border focus:border-primary outline-none pb-2 transition-colors placeholder:text-muted-foreground placeholder:font-normal text-foreground"
          autoComplete="off"
        />
      </div>

      {/* Learning Outcome */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="learning-outcome" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            What should learners gain from this course? <span className="text-destructive" aria-hidden="true">*</span>
          </label>
          <button
            type="button"
            onClick={() => setShowExample((v) => !v)}
            className="flex items-center gap-1 text-[11px] text-primary font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            aria-expanded={showExample}
            aria-controls="example-hint"
          >
            <Lightbulb className="w-3 h-3" aria-hidden="true" focusable="false" />
            {showExample ? "Hide example" : "See example"}
          </button>
        </div>

        {showExample && (
          <div
            id="example-hint"
            className="text-xs text-muted-foreground bg-muted/50 border border-border rounded-lg px-3 py-2.5 italic"
          >
            Help new managers build strong teams by improving communication, feedback, and performance coaching skills.
          </div>
        )}

        <Textarea
          id="learning-outcome"
          value={state.intendedLearners}
          onChange={(e) => onChange({ intendedLearners: e.target.value })}
          placeholder="Describe the key skills or knowledge learners will walk away with…"
          className="min-h-[80px] resize-none rounded-xl text-sm"
        />
      </div>

      {/* Reference Documents */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Reference Documents <span className="text-muted-foreground font-normal normal-case tracking-normal">(optional)</span>
        </label>
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed border-border hover:border-primary/40 bg-background transition-colors text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Upload reference documents"
        >
          <Upload className="w-4 h-4" aria-hidden="true" focusable="false" />
          <span>Upload files</span>
        </button>
        {state.supportingDocuments.length > 0 && (
          <p className="text-xs text-muted-foreground">{state.supportingDocuments.length} file(s) attached</p>
        )}
      </div>
    </div>
  );
}
