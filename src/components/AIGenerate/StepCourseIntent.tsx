import { AIGenerateState } from "@/pages/AIGenerateCourse";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Info, Sparkles } from "lucide-react";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TitleAutocomplete } from "./TitleAutocomplete";
import { AISparkles } from "@/components/ui/ai-sparkles";

interface StepCourseIntentProps {
  state: AIGenerateState;
  onChange: (partial: Partial<AIGenerateState>) => void;
}

function generateLearningOutcome(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("machine learning") || t.includes("ml") || t.includes("ai")) {
    return "Equip learners with a solid understanding of core machine learning concepts, enabling them to prepare datasets, select appropriate algorithms, and evaluate model performance for real-world applications.";
  }
  if (t.includes("leadership") || t.includes("management") || t.includes("manager")) {
    return "Help new managers build strong teams by improving communication, feedback, and performance coaching skills.";
  }
  if (t.includes("sales") || t.includes("marketing") || t.includes("email")) {
    return "Enable marketing professionals to craft data-driven campaigns that increase engagement, optimize conversion rates, and deliver measurable ROI.";
  }
  if (t.includes("design") || t.includes("ux") || t.includes("ui")) {
    return "Empower designers to create intuitive, accessible user experiences by applying research-backed design principles and modern prototyping techniques.";
  }
  if (t.includes("python") || t.includes("programming") || t.includes("coding")) {
    return "Build a strong programming foundation so learners can write clean, efficient code and confidently tackle real-world software challenges.";
  }
  return `Provide learners with practical knowledge and skills in ${title || "the subject"}, enabling them to apply key concepts confidently in real-world scenarios.`;
}

export function StepCourseIntent({ state, onChange }: StepCourseIntentProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAskAI = useCallback(() => {
    if (!state.title.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      const suggestion = generateLearningOutcome(state.title);
      onChange({ intendedLearners: suggestion });
      setIsGenerating(false);
    }, 800);
  }, [state.title, onChange]);

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
          {state.title.trim().length >= 2 && (
            <button
              type="button"
              onClick={handleAskAI}
              disabled={isGenerating}
              className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-primary/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
              aria-label="Ask AI to suggest a learning outcome"
            >
              {isGenerating ? (
                <Sparkles className="w-3 h-3 text-primary animate-pulse" aria-hidden="true" focusable="false" />
              ) : (
                <AISparkles className="w-3 h-3" />
              )}
              <span className="text-[10px] font-medium bg-gradient-to-r from-[hsl(211,100%,50%)] to-[hsl(270,80%,55%)] bg-clip-text text-transparent">
                {isGenerating ? "Generating…" : "Ask AI"}
              </span>
            </button>
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
