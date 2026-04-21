import { AIGenerateState } from "@/pages/AIGenerateCourse";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { RefreshCw, Sparkles, Check, ChevronDown, Timer, Clock, Hourglass, type LucideIcon } from "lucide-react";
import { BeginnerIcon, IntermediateIcon, ExpertIcon } from "./learnerLevelIcons";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StepCourseDetailsProps {
  state: AIGenerateState;
  onChange: (partial: Partial<AIGenerateState>) => void;
}

const DURATION_OPTIONS = [
  { value: "brief" as const, label: "Brief", desc: "< 5 min", icon: Timer },
  { value: "standard" as const, label: "Standard", desc: "5–10 min", icon: Clock },
  { value: "extended" as const, label: "Extended", desc: "10+ min", icon: Hourglass },
];

const PAGE_DURATION_OPTIONS = [
  { value: "brief", label: "Brief", desc: "< 5 min", minutes: 4, icon: Timer },
  { value: "standard", label: "Standard", desc: "5–10 min", minutes: 8, icon: Clock },
  { value: "extended", label: "Extended", desc: "10+ min", minutes: 12, icon: Hourglass },
];

const BLOOMS_OPTIONS = [
  { value: "knowledge", label: "Knowledge" },
  { value: "comprehension", label: "Comprehension" },
  { value: "application", label: "Application" },
  { value: "analysis", label: "Analysis" },
  { value: "synthesis", label: "Synthesis" },
  { value: "evaluation", label: "Evaluation" },
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

// Learner level options with document icons
const LEARNER_LEVEL_OPTIONS = [
  { value: "beginners" as const, label: "Beginners", Icon: BeginnerIcon },
  { value: "intermediate" as const, label: "Intermediate", Icon: IntermediateIcon },
  { value: "expert" as const, label: "Expert", Icon: ExpertIcon },
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
  options: { value: string; label: string; desc?: string; icon?: LucideIcon }[];
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
  showDesc?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={ariaLabel}>
      {options.map((opt) => {
        const selected = value === opt.value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(selected ? "" : opt.value)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              selected
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {selected ? (
              <Check className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
            ) : Icon ? (
              <Icon className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
            ) : null}
            {opt.label}
            {showDesc && opt.desc && (
              <span className={cn("ml-1 text-xs", selected ? "text-primary-foreground/70" : "text-muted-foreground")}>
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
  const [suggestions, setSuggestions] = useState<string[]>(() => {
    if (title.trim().length >= 3) return generateSuggestions(title);
    return [];
  });
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(() => title.trim().length >= 3);
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
    <div className="border-t border-border/60 bg-muted/20">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-expanded={expanded}
        aria-label={expanded ? "Hide AI suggestions" : "Show AI suggestions"}
      >
        <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
        <span className="text-xs font-semibold text-muted-foreground flex-1">Suggested course goals</span>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" focusable="false" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-2.5">
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function StepCourseDetails({ state, onChange }: StepCourseDetailsProps) {
  return (
    <div className="space-y-6">

      {/* Learning Outcome with AI suggestions */}
      <div>
        <label htmlFor="learning-outcome" className="text-base font-semibold text-foreground mb-2 block">
          What do you want learners to be able to do after this course?
          <span className="text-destructive ml-0.5" aria-hidden="true">*</span>
        </label>
        <div className="rounded-xl border border-border overflow-hidden bg-white">
          <Textarea
            id="learning-outcome"
            value={state.learningOutcome}
            onChange={(e) => {
              onChange({ learningOutcome: e.target.value });
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
            }}
            ref={(el) => {
              if (el) {
                el.style.height = "auto";
                el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
              }
            }}
            placeholder="e.g., Apply conflict resolution techniques in team settings…"
            className="min-h-[72px] max-h-[200px] resize-none text-sm border-0 rounded-none bg-white focus-visible:ring-0 focus-visible:ring-offset-0 overflow-y-auto"
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
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-2.5">
          <div className="text-[16px] font-semibold text-foreground leading-tight">
            Intended Learners
            <span className="text-destructive ml-0.5" aria-hidden="true">*</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Intended learners">
          {LEARNER_LEVEL_OPTIONS.map((opt) => {
            const selected = state.intendedLearners === opt.value;
            const Icon = opt.Icon;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange({ intendedLearners: selected ? "" : opt.value })}
                className={cn(
                  "flex flex-col items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-w-[100px]",
                  selected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-background hover:border-primary/40 hover:bg-muted/30"
                )}
              >
                <Icon className="w-10 h-10 drop-shadow-sm" />
                <span className={cn(selected ? "text-foreground" : "text-muted-foreground")}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Page Duration */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-2.5">
          <div className="text-[16px] font-semibold text-foreground leading-tight">
            Page Duration
            <span className="text-destructive ml-0.5" aria-hidden="true">*</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Page duration">
          {PAGE_DURATION_OPTIONS.map((opt) => {
            const selected = state.pageSpanTime === opt.minutes;
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange({ pageSpanTime: opt.minutes })}
                aria-label={`${opt.label} ${opt.desc}`}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  selected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {selected ? (
                  <Check className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                ) : (
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                )}
                {opt.label}
                <span className={cn("ml-1 text-xs", selected ? "text-primary-foreground/70" : "text-muted-foreground")}>
                  {opt.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bloom's Taxonomy */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-2.5">
          <div className="text-[16px] font-semibold text-foreground leading-tight">
            Bloom's Taxonomy
            <span className="text-destructive ml-0.5" aria-hidden="true">*</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Bloom's taxonomy levels">
          {BLOOMS_OPTIONS.map((b) => {
            const selected = state.bloomsTaxonomy.includes(b.value);
            return (
              <button
                key={b.value}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  const set = new Set(state.bloomsTaxonomy);
                  if (set.has(b.value)) set.delete(b.value);
                  else set.add(b.value);
                  onChange({ bloomsTaxonomy: Array.from(set) });
                }}
                aria-label={b.label}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  selected
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-muted text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                )}
              >
                {selected && <Check className="w-3.5 h-3.5 inline-block mr-1.5" aria-hidden="true" focusable="false" />}
                {b.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tone */}
      <div>
        <label className="text-base font-semibold text-foreground mb-2 block">
          Tone
        </label>
        <ChipGroup
          options={TONE_OPTIONS}
          value={state.tone}
          onChange={(v) => onChange({ tone: v as any })}
          ariaLabel="Course tone"
        />
      </div>

      {/* Key Topics */}
      <div>
        <label htmlFor="topics" className="text-base font-semibold text-foreground mb-2 block">
          Key Topics
        </label>
        <Textarea
          id="topics"
          value={state.topics}
          onChange={(e) => {
            onChange({ topics: e.target.value });
            e.target.style.height = "auto";
            e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
          }}
          ref={(el) => {
            if (el) {
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
            }
          }}
          placeholder="e.g., Active listening, giving feedback, conflict resolution"
          className="min-h-[72px] max-h-[200px] resize-none text-sm rounded-xl border-border/80 bg-background"
        />
      </div>

      {/* Supporting Docs */}
      <div>
        <label className="text-base font-semibold text-foreground mb-2 block">
          Supporting Documents
        </label>
        <div className="relative">
          <input
            type="file"
            multiple
            className="hidden"
            id="courseDocs"
            onChange={(e) => {
              const files = e.target.files;
              if (!files) return;
              // Placeholder until file upload is wired
              onChange({ uploadedDocs: Array.from(files).map((f) => f.name) });
            }}
          />
          <label
            htmlFor="courseDocs"
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-border/80 bg-muted/30 hover:bg-muted/50 hover:border-primary/30 transition-colors cursor-pointer focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">Click to upload files</div>
              <div className="text-xs text-muted-foreground">PDF, DOC, TXT up to 20MB each</div>
            </div>
          </label>
        </div>
        {state.uploadedDocs && state.uploadedDocs.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {state.uploadedDocs.map((name, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-primary/10 text-primary">
                {name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
