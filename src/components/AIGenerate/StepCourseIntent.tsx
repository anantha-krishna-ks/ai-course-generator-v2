import { AIGenerateState } from "@/pages/AIGenerateCourse";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Lightbulb, FileText, Sparkles } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StepCourseIntentProps {
  state: AIGenerateState;
  onChange: (partial: Partial<AIGenerateState>) => void;
}

export function StepCourseIntent({ state, onChange }: StepCourseIntentProps) {
  const [exampleRevealed, setExampleRevealed] = useState(false);

  return (
    <div className="space-y-5">
      {/* Hero banner */}
      <div className="rounded-xl bg-gradient-to-br from-primary/8 via-primary/4 to-transparent border border-primary/10 px-4 py-4 flex gap-3 items-start">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-foreground leading-snug">Let's build your course</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5 leading-relaxed">
            Start building your course by uploading any relevant documents, then answer a few quick questions to help us generate the content.
          </p>
        </div>
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
        <label htmlFor="learning-outcome" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          What should learners gain? <span className="text-destructive" aria-hidden="true">*</span>
        </label>

        <Textarea
          id="learning-outcome"
          value={state.intendedLearners}
          onChange={(e) => onChange({ intendedLearners: e.target.value })}
          placeholder="Describe the key skills or knowledge learners will walk away with…"
          className="min-h-[80px] resize-none rounded-xl text-sm"
        />

        {/* Persistent example hint - click to reveal, stays visible forever */}
        <AnimatePresence>
          {!exampleRevealed ? (
            <motion.button
              type="button"
              onClick={() => setExampleRevealed(true)}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-primary font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-1 py-0.5 transition-colors"
              aria-label="Show an example of a learning outcome"
            >
              <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
              Need inspiration?
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="flex items-start gap-2.5 text-xs bg-muted/40 border border-border/60 rounded-xl px-3.5 py-3">
                <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary/70" aria-hidden="true" focusable="false" />
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Example</span>
                  <p className="text-muted-foreground italic leading-relaxed">
                    Help new managers build strong teams by improving communication, feedback, and performance coaching skills.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reference Documents */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Reference Documents <span className="text-muted-foreground font-normal normal-case tracking-normal">(optional)</span>
        </label>
        <button
          type="button"
          className="w-full flex flex-col items-center justify-center gap-1.5 py-5 rounded-xl border-2 border-dashed border-border hover:border-primary/40 bg-background transition-colors text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Upload reference documents"
        >
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <Upload className="w-4 h-4" aria-hidden="true" focusable="false" />
          </div>
          <span className="text-sm font-medium">Upload files</span>
          <span className="text-[11px] text-muted-foreground">PDF, DOCX, PPTX, or TXT</span>
        </button>
        {state.supportingDocuments.length > 0 && (
          <p className="text-xs text-muted-foreground">{state.supportingDocuments.length} file(s) attached</p>
        )}
      </div>
    </div>
  );
}
