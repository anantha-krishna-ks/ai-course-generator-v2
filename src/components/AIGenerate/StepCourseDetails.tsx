import { AIGenerateState } from "@/pages/AIGenerateCourse";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { RefreshCw, Sparkles, Check, ChevronDown } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

// Mock AI suggestions based on course title keywords
function generateSuggestions(title: string): string[] {
  const t = title.toLowerCase();
  if (t.includes("machine learning") || t.includes("ml") || t.includes("ai")) {
    return [
      "Understand core machine learning algorithms and apply them to real-world datasets with measurable accuracy improvements.",
      "Build and evaluate predictive models using supervised and unsupervised learning techniques.",
      "Implement data preprocessing pipelines and feature engineering strategies to improve model performance.",
    ];
  }
  if (t.includes("leadership") || t.includes("management") || t.includes("manager")) {
    return [
      "Apply situational leadership strategies to motivate diverse teams and drive measurable performance outcomes.",
      "Develop effective communication frameworks for giving feedback, resolving conflict, and coaching direct reports.",
      "Build high-performing teams by implementing structured goal-setting and accountability processes.",
    ];
  }
  if (t.includes("sales") || t.includes("marketing") || t.includes("email")) {
    return [
      "Implement effective email subject lines to increase open rates by 20% using A/B testing methods.",
      "Customize marketing strategies to target specific audience segments and enhance conversion rates through detailed analysis.",
      "Apply data-driven insights to optimize campaign performance, maximizing engagement and improving click-through rates.",
    ];
  }
  if (t.includes("design") || t.includes("ux") || t.includes("ui")) {
    return [
      "Apply user-centered design principles to create intuitive interfaces that reduce task completion time.",
      "Conduct usability testing and translate findings into actionable design improvements.",
      "Build accessible, responsive layouts that meet WCAG standards across devices and screen sizes.",
    ];
  }
  // Generic fallback
  return [
    `Demonstrate a solid understanding of key ${title || "course"} concepts and apply them in practical scenarios.`,
    `Analyze real-world case studies and develop evidence-based solutions related to ${title || "the subject"}.`,
    `Evaluate best practices and implement structured approaches to improve outcomes in ${title || "this domain"}.`,
  ];
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

function AISuggestions({
  title,
  onSelect,
}: {
  title: string;
  onSelect: (text: string) => void;
}) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const generate = useCallback(() => {
    if (!title.trim()) return;
    setLoading(true);
    setSelected(new Set());
    // Simulate AI delay
    setTimeout(() => {
      setSuggestions(generateSuggestions(title));
      setVisible(true);
      setLoading(false);
    }, 800);
  }, [title]);

  useEffect(() => {
    if (title.trim().length >= 3) {
      generate();
    } else {
      setVisible(false);
      setSuggestions([]);
    }
  // Only trigger on mount / title change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  const handleSelect = (idx: number) => {
    const next = new Set(selected);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      next.add(idx);
    }
    setSelected(next);
    onSelect(suggestions[idx]);
  };

  if (!visible && !loading) return null;

  return (
    <div className="border-t border-border/60 px-4 py-3 space-y-2.5 bg-muted/20">
      <div className="flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
        <span className="text-xs font-semibold text-muted-foreground">Suggested course goals:</span>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 py-4 justify-center"
          >
            <RefreshCw className="w-4 h-4 text-primary animate-spin" aria-hidden="true" focusable="false" />
            <span className="text-xs text-muted-foreground">Generating suggestions…</span>
          </motion.div>
        ) : (
          <motion.div
            key="suggestions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {suggestions.map((text, i) => {
              const isSelected = selected.has(i);
              return (
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(i)}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.25 }}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 text-sm leading-relaxed",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isSelected
                      ? "border-primary/50 bg-primary/5 text-foreground"
                      : "border-border bg-background hover:border-primary/30 hover:bg-muted/40 text-foreground"
                  )}
                  aria-pressed={isSelected}
                  aria-label={`Select suggestion: ${text}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                      isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                    )}>
                      {isSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" aria-hidden="true" focusable="false" />}
                    </div>
                    <span>{text}</span>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && suggestions.length > 0 && (
        <button
          type="button"
          onClick={generate}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-1 py-1"
          aria-label="Regenerate goal suggestions"
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
          Regenerate goals
        </button>
      )}
    </div>
  );
}

export function StepCourseDetails({ state, onChange }: StepCourseDetailsProps) {
  return (
    <div className="space-y-6">

      {/* Learning Outcome with AI suggestions */}
      <div>
        <label htmlFor="learning-outcome" className="text-sm font-semibold text-field-label mb-2 block uppercase tracking-wider">
          What do you want learners to be able to do after this course?
          <span className="text-destructive ml-0.5" aria-hidden="true">*</span>
        </label>
        <div className="rounded-xl border border-border overflow-hidden bg-background">
          <Textarea
            id="learning-outcome"
            value={state.learningOutcome}
            onChange={(e) => onChange({ learningOutcome: e.target.value })}
            placeholder="e.g., Apply conflict resolution techniques in team settings…"
            className="min-h-[72px] resize-none text-sm border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {/* AI Suggestions inline */}
          <AISuggestions
            title={state.title}
            onSelect={(text) => {
              const current = state.learningOutcome.trim();
              if (current.includes(text)) {
                onChange({ learningOutcome: current.replace(text, "").replace(/\n{2,}/g, "\n").trim() });
              } else {
                onChange({ learningOutcome: current ? `${current}\n${text}` : text });
              }
            }}
          />
        </div>
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
