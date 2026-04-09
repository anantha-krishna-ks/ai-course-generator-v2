import { AIGenerateState } from "@/pages/AIGenerateCourse";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Lightbulb, Wand2 } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AISparkles } from "@/components/ui/ai-sparkles";

interface StepCourseIntentProps {
  state: AIGenerateState;
  onChange: (partial: Partial<AIGenerateState>) => void;
}

const EXAMPLE_TEXT =
  "Help new managers build strong teams by improving communication, feedback, and performance coaching skills.";

export function StepCourseIntent({ state, onChange }: StepCourseIntentProps) {
  const [dismissed, setDismissed] = useState(false);
  const showTip = !dismissed && !state.intendedLearners.trim();

  const useExample = () => {
    onChange({ intendedLearners: EXAMPLE_TEXT });
  };

  return (
    <div className="space-y-8">
      {/* Headline */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <AISparkles className="w-5 h-5" />
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Let's build your course
          </h1>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
          Upload any relevant documents, then answer a few quick questions to help us generate the content.
        </p>
      </div>

      {/* Course Title */}
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
          className="w-full text-lg sm:text-xl font-semibold bg-transparent border-0 border-b-2 border-border focus:border-primary outline-none pb-2.5 transition-colors placeholder:text-muted-foreground placeholder:font-normal text-foreground"
          autoComplete="off"
          autoFocus
        />
      </div>

      {/* Learning Outcome */}
      <div className="space-y-2">
        <label htmlFor="learning-outcome" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          What should learners gain? <span className="text-destructive" aria-hidden="true">*</span>
        </label>

        <Textarea
          id="learning-outcome"
          value={state.intendedLearners}
          onChange={(e) => onChange({ intendedLearners: e.target.value })}
          placeholder="Describe the key skills or knowledge learners will walk away with…"
          className="min-h-[90px] resize-none rounded-xl text-sm border-border focus:border-primary"
        />

        {/* Inspiration hint */}
        <AnimatePresence>
          {showTip && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="flex items-start gap-2.5 rounded-xl bg-muted/50 border border-border px-3.5 py-3 mt-1">
                <Lightbulb className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" aria-hidden="true" focusable="false" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-muted-foreground">Need inspiration?</p>
                  <p className="text-xs text-foreground italic leading-relaxed mt-0.5">{EXAMPLE_TEXT}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      type="button"
                      onClick={useExample}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                      aria-label="Use this example text"
                    >
                      <Wand2 className="w-3 h-3" aria-hidden="true" focusable="false" />
                      Use this
                    </button>
                    <button
                      type="button"
                      onClick={() => setDismissed(true)}
                      className="text-[11px] text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                      aria-label="Dismiss example"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reference Documents */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Reference Documents <span className="text-muted-foreground font-normal normal-case tracking-normal">(optional)</span>
        </label>
        <button
          type="button"
          className="w-full flex items-center gap-3 py-3.5 px-4 rounded-xl border border-dashed border-border hover:border-primary/40 bg-transparent transition-colors text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Upload reference documents"
        >
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Upload className="w-4 h-4" aria-hidden="true" focusable="false" />
          </div>
          <div className="text-left">
            <span className="text-sm font-medium block">Upload files</span>
            <span className="text-[11px] text-muted-foreground">PDF, DOCX, PPTX, or TXT</span>
          </div>
        </button>
        {state.supportingDocuments.length > 0 && (
          <p className="text-xs text-muted-foreground">{state.supportingDocuments.length} file(s) attached</p>
        )}
      </div>
    </div>
  );
}