import { AIGenerateState } from "@/pages/AIGenerateCourse";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Sparkles, Info, Loader2 } from "lucide-react";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { TitleAutocomplete } from "./TitleAutocomplete";

interface StepCourseIntentProps {
  state: AIGenerateState;
  onChange: (partial: Partial<AIGenerateState>) => void;
}

const DUMMY_SUGGESTIONS: Record<string, string> = {
  default:
    "Equip learners with practical skills and foundational knowledge they can immediately apply in real-world scenarios.",
  machine:
    "Enable learners to understand core ML algorithms, evaluate model performance, and deploy simple predictive models.",
  leadership:
    "Help new managers build strong teams by improving communication, feedback, and performance coaching skills.",
  design:
    "Empower learners to apply design thinking principles and create user-centered solutions through iterative prototyping.",
  safety:
    "Ensure employees can identify workplace hazards, follow safety protocols, and respond effectively to emergencies.",
  data:
    "Give learners the ability to collect, clean, analyze, and visualize data to support evidence-based decision making.",
};

function pickSuggestion(title: string): string {
  const lower = title.toLowerCase();
  for (const [key, value] of Object.entries(DUMMY_SUGGESTIONS)) {
    if (key !== "default" && lower.includes(key)) return value;
  }
  return DUMMY_SUGGESTIONS.default;
}

export function StepCourseIntent({ state, onChange }: StepCourseIntentProps) {
  const [aiLoading, setAiLoading] = useState(false);
  const showAskAI = state.title.trim().length >= 2;

  const handleAskAI = useCallback(() => {
    if (aiLoading) return;
    setAiLoading(true);
    setTimeout(() => {
      onChange({ intendedLearners: pickSuggestion(state.title) });
      setAiLoading(false);
    }, 900);
  }, [state.title, aiLoading, onChange]);

  return (
    <div className="space-y-5">
      {/* Hero banner */}
      <div className="flex items-center gap-2.5 rounded-xl bg-primary/8 border border-primary/15 px-4 py-3">
        <Info className="w-4 h-4 text-primary shrink-0" aria-hidden="true" focusable="false" />
        <p className="text-[13px] text-foreground leading-snug">
          Upload relevant documents and answer a few questions to generate your course content.
        </p>
      </div>

      {/* Course Title */}
      <div className="space-y-1.5">
        <label htmlFor="course-title" className="text-sm font-semibold text-field-label uppercase tracking-wider">
          Course Title <span className="text-destructive ml-0.5" aria-hidden="true">*</span>
        </label>
        <TitleAutocomplete
          id="course-title"
          value={state.title}
          onChange={(v) => onChange({ title: v })}
          placeholder="e.g., Introduction to Machine Learning"
        />
      </div>

      {/* Learning Outcome */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="learning-outcome" className="text-sm font-semibold text-field-label uppercase tracking-wider">
            What should learners gain? <span className="text-destructive ml-0.5" aria-hidden="true">*</span>
          </label>

          {showAskAI && (
            <motion.button
              type="button"
              onClick={handleAskAI}
              disabled={aiLoading}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-primary/10 transition-colors disabled:opacity-60"
              aria-label="Ask AI to suggest a learning outcome"
            >
              {aiLoading ? (
                <Loader2 className="w-3 h-3 animate-spin text-primary" aria-hidden="true" focusable="false" />
              ) : (
                <>
                  <Sparkles className="w-3 h-3" style={{ stroke: 'url(#ai-gradient-learning)' }} aria-hidden="true" focusable="false" />
                  <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
                    <defs>
                      <linearGradient id="ai-gradient-learning" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(211, 100%, 50%)" />
                        <stop offset="100%" stopColor="hsl(270, 80%, 55%)" />
                      </linearGradient>
                    </defs>
                  </svg>
                </>
              )}
              <span className="text-[10px] font-medium bg-gradient-to-r from-[hsl(211,100%,50%)] to-[hsl(270,80%,55%)] bg-clip-text text-transparent">
                {aiLoading ? "Generating…" : "Ask AI"}
              </span>
            </motion.button>
          )}
        </div>

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
        <label className="text-sm font-semibold text-field-label uppercase tracking-wider">
          Reference Documents <span className="text-muted-foreground font-normal text-xs">(optional)</span>
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
