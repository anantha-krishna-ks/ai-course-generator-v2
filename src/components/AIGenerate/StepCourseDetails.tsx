import { AIGenerateState } from "@/pages/AIGenerateCourse";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { RefreshCw, Sparkles, Check, ChevronDown, Sprout, Rocket, Crown, Timer, Clock, Hourglass, Minus, Plus, FileText, Plus as PlusIcon, X, Target, Rabbit, Scale, Gem, Layers, Coins, GripVertical, type LucideIcon } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageDurationDefaultCard } from "@/components/AIGenerate/PageDurationDefaultCard";
import { CONTENT_DEPTH_TIERS, type ContentDepth } from "@/components/Dashboard/AIOptionsPanel";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";


interface StepCourseDetailsProps {
  state: AIGenerateState;
  onChange: (partial: Partial<AIGenerateState>) => void;
  errors?: Record<string, string>;
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
  { value: "remember", label: "Remember" },
  { value: "understand", label: "Understand" },
  { value: "apply", label: "Apply" },
  { value: "analyze", label: "Analyze" },
  { value: "evaluate", label: "Evaluate" },
  { value: "create", label: "Create" },
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

// Mock AI suggestions for Learning Objectives (measurable, action-verb based)
function generateObjectiveSuggestions(title: string): string[] {
  const t = title.toLowerCase();
  if (t.includes("machine learning") || t.includes("ml") || t.includes("ai")) {
    return [
      `Identify and describe the core components of ${title} workflows, including data preparation, model training, and evaluation.`,
      `Apply appropriate ${title} techniques to solve a defined problem and interpret the resulting model performance metrics.`,
      `Evaluate model results against business criteria and recommend improvements to data, features, or algorithms.`,
    ];
  }
  if (t.includes("leadership") || t.includes("management") || t.includes("manager")) {
    return [
      `Describe key ${title} frameworks and explain how they influence team dynamics and decision-making.`,
      `Apply ${title} principles in role-play scenarios to deliver constructive feedback and resolve workplace conflicts.`,
      `Evaluate team performance signals and recommend coaching actions that improve engagement and delivery.`,
    ];
  }
  if (t.includes("design") || t.includes("ux") || t.includes("ui")) {
    return [
      `Explain core ${title} principles and identify how they shape user experience across digital products.`,
      `Apply ${title} methodologies to produce wireframes that address a specified user need.`,
      `Evaluate interface designs against usability and accessibility heuristics and justify design revisions.`,
    ];
  }
  // Generic fallback — 3 suggestions
  return [
    `Identify and explain the foundational concepts of ${title || "the subject"} and describe their relevance in real-world contexts.`,
    `Apply ${title || "subject"} techniques to complete a guided task and assess the outcome against defined criteria.`,
    `Evaluate common approaches in ${title || "this domain"} and recommend the most effective option for a given scenario.`,
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
    <div className="flex gap-2 w-full" role="radiogroup" aria-label={ariaLabel}>
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
              "flex-1 px-5 py-2.5 rounded-full text-[0.938rem] font-medium border transition-all duration-200 flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              selected
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
            )}
          >
            {Icon && <Icon className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function PageDurationStepper({
  value,
  onChange,
  min = 1,
  max = 15,
  step = 1,
  presets = [3, 5, 10, 15],
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  presets?: number[];
}) {
  const decrement = () => onChange(Math.max(min, value - step));
  const increment = () => onChange(Math.min(max, value + step));

  return (
    <div className="rounded-lg border border-border/80 bg-background px-4 py-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
          </div>
          <div>
            <span className="text-sm font-medium text-foreground block leading-tight">Page Duration Settings</span>
            <span className="text-[11px] text-muted-foreground">Page level Span Time (In Minutes)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={decrement}
            disabled={value <= min}
            aria-label="Decrease page duration"
            className="w-9 h-9 rounded-full border border-primary/30 bg-primary/5 flex items-center justify-center hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Minus className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
          </button>
          <div className="flex items-baseline gap-1 min-w-[72px] justify-center">
            <span className="text-3xl font-bold text-foreground tabular-nums leading-none">{value}</span>
            <span className="text-sm text-muted-foreground font-medium">min</span>
          </div>
          <button
            type="button"
            onClick={increment}
            disabled={value >= max}
            aria-label="Increase page duration"
            className="w-9 h-9 rounded-full border border-primary/30 bg-primary/5 flex items-center justify-center hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-4">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150",
              value === preset
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-muted/50 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
            )}
          >
            {preset} min
          </button>
        ))}
      </div>
    </div>
  );
}

function AISuggestions({
  title,
  onSelect,
  generator = generateSuggestions,
  heading = "Suggested course goals",
  regenerateLabel = "Regenerate goals",
  showBloom = false,
}: {
  title: string;
  onSelect: (text: string) => void;
  generator?: (title: string) => string[];
  heading?: string;
  regenerateLabel?: string;
  showBloom?: boolean;
}) {
  const [suggestions, setSuggestions] = useState<string[]>(() => {
    if (title.trim().length >= 3) return generator(title);
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
      setSuggestions(generator(title));
      setVisible(true);
      setLoading(false);
    }, 800);
  }, [title, generator]);

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
        <span className="text-xs font-semibold text-muted-foreground flex-1">{heading}</span>
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
                            <span className="flex-1">{text}</span>
                            {showBloom && (() => {
                              const lvl = detectBloom(text);
                              const label = BLOOMS_OPTIONS.find((b) => b.value === lvl)?.label;
                              if (!label) return null;
                              return (
                                <span className="shrink-0 mt-0.5 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                                  {label}
                                </span>
                              );
                            })()}
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
                  aria-label={regenerateLabel}
                >
                  <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                  {regenerateLabel}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const AUDIENCE_LEVELS = [
  { value: "beginners", label: "Beginner", icon: Sprout, hint: "New to the topic — start from fundamentals." },
  { value: "intermediate", label: "Intermediate", icon: Rocket, hint: "Knows the basics — build practical depth." },
  { value: "expert", label: "Expert", icon: Crown, hint: "Highly experienced — focus on nuance and mastery." },
] as const;


const AUDIENCE_EXAMPLE =
  "Learners have foundational sales knowledge and are actively engaging with customers. They want to improve prospecting, communication, negotiation, objection handling, and closing skills to achieve higher sales performance and career growth.";

function draftAudience(title: string, level: string) {
  const topic = title.trim() || "this subject";
  const levelLabel = AUDIENCE_LEVELS.find((l) => l.value === level)?.label.toLowerCase() ?? "mixed-level";
  const familiarity =
    level === "expert"
      ? "deep, hands-on experience"
      : level === "intermediate"
      ? "working knowledge and practical exposure"
      : "little to no prior exposure";
  return `Learners are ${levelLabel} practitioners with ${familiarity} in ${topic}. They want to strengthen the core skills covered in this course and apply them confidently in day-to-day work to improve performance and career growth.`;
}

function AudienceSection({ state, onChange, errors }: StepCourseDetailsProps & { errors: Record<string, string> }) {
  const [regenerating, setRegenerating] = useState(false);
  const levelIndex = Math.max(0, AUDIENCE_LEVELS.findIndex((l) => l.value === state.intendedLearners));
  const hasLevel = AUDIENCE_LEVELS.some((l) => l.value === state.intendedLearners);

  const regenerate = () => {
    setRegenerating(true);
    window.setTimeout(() => {
      onChange({ audienceDescription: draftAudience(state.title, state.intendedLearners) });
      setRegenerating(false);
    }, 700);
  };

  const selectLevel = (value: string) => {
    const current = (state.audienceDescription ?? "").trim();
    const wasAutoDraft =
      current === "" || AUDIENCE_LEVELS.some((l) => draftAudience(state.title, l.value) === current);
    onChange({
      intendedLearners: value,
      ...(wasAutoDraft ? { audienceDescription: draftAudience(state.title, value) } : {}),
    });
  };


  return (
    <div
      data-field="intendedLearners"
      className={cn(
        "relative rounded-xl border bg-card overflow-hidden",
        errors.intendedLearners ? "border-destructive" : "border-border"
      )}
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60 bg-[radial-gradient(120%_60%_at_50%_-10%,hsl(var(--primary)/0.07),transparent_70%)]"
      />

      {/* Header */}
      <div className="relative flex items-center justify-between gap-3 px-4 pt-4 pb-3">
        <div className="text-[16px] font-semibold text-foreground leading-tight">
          Intended Learners
          <span className="text-destructive ml-0.5" aria-hidden="true">*</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {hasLevel ? "Level set" : "Pick an experience level"}
        </span>
      </div>

      {/* Level chips + description — one connected surface */}
      <div className="relative px-4 pb-4">
        <div
          className={cn(
            "rounded-xl border bg-white overflow-hidden transition-colors",
            errors.intendedLearners ? "border-destructive/60" : "border-border"
          )}
        >
          {/* Chip tab bar on the top edge */}
          <div className="px-3 pt-3 pb-3 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span id="audience-level-label" className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Experience level
              </span>
              {!hasLevel && (
                <span className="text-[11px] font-medium text-primary">Select one to continue</span>
              )}
            </div>
            <div
              role="radiogroup"
              aria-labelledby="audience-level-label"
              className="grid grid-cols-3 gap-2"
            >
              {AUDIENCE_LEVELS.map((lvl) => {
                const active = state.intendedLearners === lvl.value;
                const Icon = lvl.icon;
                return (
                  <button
                    key={lvl.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => selectLevel(lvl.value)}
                    className={cn(
                      "group relative cursor-pointer overflow-hidden rounded-xl border px-3 py-2.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
                      active
                        ? "border-primary bg-primary text-primary-foreground shadow-md"
                        : cn(
                            "border-border bg-background text-foreground hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/5 hover:shadow-sm",
                            !hasLevel && "border-dashed border-primary/40"
                          )
                    )}
                  >
                    <span className="relative flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors",
                          active ? "bg-white/20" : "bg-primary/10 text-primary group-hover:bg-primary/15"
                        )}
                      >
                        {active ? (
                          <Check className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                        ) : (
                          <Icon className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                        )}
                      </span>
                      <span className="text-[13px] font-semibold leading-tight">{lvl.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>


          <Textarea
            id="audience-description"
            aria-label="Describe your intended learners"
            value={state.audienceDescription ?? ""}
            onChange={(e) => onChange({ audienceDescription: e.target.value })}
            placeholder={`e.g., ${AUDIENCE_EXAMPLE}`}
            className="min-h-[96px] max-h-[220px] resize-none text-sm border-0 rounded-none bg-white focus-visible:ring-0 focus-visible:ring-offset-0 overflow-y-auto"
          />

          <div className="flex items-center justify-between gap-3 px-3 py-2 border-t border-border bg-muted/30">
            <span className="text-xs text-muted-foreground">
              {hasLevel
                ? AUDIENCE_LEVELS[levelIndex].hint
                : state.title.trim()
                ? "Drafted from your course title."
                : "Add a course title for a sharper draft."}
            </span>
            <button
              type="button"
              onClick={regenerate}
              disabled={regenerating}
              className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-1.5 py-1"
              aria-label="Regenerate learner description from course title"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", regenerating && "animate-spin")} aria-hidden="true" focusable="false" />
              {regenerating ? "Regenerating…" : "Regenerate"}
            </button>
          </div>
        </div>

        {errors.intendedLearners && (
          <p role="alert" className="text-xs text-destructive mt-3 font-medium">{errors.intendedLearners}</p>
        )}
      </div>
    </div>

  );
}


const BLOOM_VERBS: Record<string, string[]> = {
  remember: ["define", "list", "recall", "identify", "name", "state", "recognize", "label"],
  understand: ["explain", "summarize", "interpret", "describe", "classify", "discuss", "illustrate"],
  apply: ["apply", "use", "implement", "demonstrate", "perform", "conduct", "execute", "solve", "practice"],
  analyze: ["analyze", "analyse", "compare", "differentiate", "examine", "diagnose", "investigate", "distinguish"],
  evaluate: ["evaluate", "assess", "justify", "critique", "recommend", "prioritize", "validate", "judge"],
  create: ["create", "design", "develop", "build", "compose", "plan", "produce", "formulate", "generate"],
};

function detectBloom(text: string): string | null {
  const first = text.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
  if (!first) return null;
  for (const [level, verbs] of Object.entries(BLOOM_VERBS)) {
    if (verbs.includes(first)) return level;
  }
  return null;
}

const BLOOM_TEMPLATES: Record<string, string[]> = {
  remember: ["Recall the key terms and core concepts of {topic}.", "Identify the essential components involved in {topic}.", "List the standards and best practices that govern {topic}."],
  understand: ["Explain how the core principles of {topic} work in practice.", "Summarise the main ideas behind {topic} in your own words.", "Describe the relationship between the key elements of {topic}."],
  apply: ["Apply {topic} techniques to solve a realistic workplace scenario.", "Use the frameworks of {topic} to complete a hands-on task.", "Demonstrate {topic} skills in a guided practice activity."],
  analyze: ["Analyse a real-world {topic} case to identify what drives the outcome.", "Compare different approaches to {topic} and explain the trade-offs.", "Diagnose common failure points in a {topic} workflow."],
  evaluate: ["Evaluate the effectiveness of a {topic} solution against defined criteria.", "Critique an existing {topic} implementation and justify improvements.", "Recommend the most suitable {topic} approach for a given context."],
  create: ["Design an original {topic} plan tailored to a specific audience.", "Develop a complete {topic} deliverable from scratch.", "Create a measurable {topic} strategy and outline its rollout."],
};

function buildObjective(bloom: string, title: string, n: number): string {
  const topic = title.trim() || "the subject";
  const list = BLOOM_TEMPLATES[bloom] || BLOOM_TEMPLATES.understand;
  return list[n % list.length].replace("{topic}", topic);
}

function AddObjectiveMenu({
  title,
  onAddManual,
  onAddGenerated,
}: {
  title: string;
  onAddManual: () => void;
  onAddGenerated: (items: { text: string; bloom: string }[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"menu" | "auto">("menu");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [generating, setGenerating] = useState(false);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const reset = () => {
    setView("menu");
    setCounts({});
    setGenerating(false);
  };

  const setCount = (level: string, n: number) =>
    setCounts((c) => ({ ...c, [level]: Math.max(0, Math.min(5, n)) }));

  const handleGenerate = () => {
    if (total === 0 || generating) return;
    setGenerating(true);
    setTimeout(() => {
      const items: { text: string; bloom: string }[] = [];
      BLOOMS_OPTIONS.forEach((b) => {
        const n = counts[b.value] || 0;
        for (let i = 0; i < n; i++) items.push({ text: buildObjective(b.value, title, i), bloom: b.value });
      });
      onAddGenerated(items);
      setOpen(false);
      reset();
    }, 700);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-1 py-1.5"
          aria-label="Add another learning objective"
        >
          <PlusIcon className="w-4 h-4" aria-hidden="true" focusable="false" />
          Add objective
          <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className={cn("p-0 bg-background overflow-hidden", view === "menu" ? "w-72" : "w-[22rem]")}>
        <AnimatePresence mode="wait" initial={false}>
          {view === "menu" ? (
            <motion.div
              key="menu"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="p-1.5"
            >
              <p className="px-2 pt-1.5 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                How do you want to add it?
              </p>
              <button
                type="button"
                onClick={() => {
                  onAddManual();
                  setOpen(false);
                }}
                className="w-full flex items-start gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="mt-0.5 w-7 h-7 rounded-lg bg-secondary text-foreground flex items-center justify-center shrink-0">
                  <PenLine className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                </span>
                <span>
                  <span className="block text-sm font-medium text-foreground">Write it myself</span>
                  <span className="block text-xs text-muted-foreground leading-snug">Add a blank objective and tag its level.</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setView("auto")}
                className="w-full flex items-start gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="mt-0.5 w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                </span>
                <span className="flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">Draft with AI</span>
                    <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-muted-foreground" aria-hidden="true" focusable="false" />
                  </span>
                  <span className="block text-xs text-muted-foreground leading-snug">Choose Bloom's levels and how many of each.</span>
                </span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="auto"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex items-center gap-2 border-b border-border px-2.5 py-2">
                <button
                  type="button"
                  onClick={() => setView("menu")}
                  aria-label="Back to add options"
                  className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ChevronDown className="w-4 h-4 rotate-90" aria-hidden="true" focusable="false" />
                </button>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground leading-tight">Draft with AI</p>
                  <p className="text-[11px] text-muted-foreground leading-tight">Set how many objectives per Bloom's level.</p>
                </div>
              </div>

              <div className="p-1.5 max-h-72 overflow-y-auto">
                {BLOOMS_OPTIONS.map((b) => {
                  const n = counts[b.value] || 0;
                  return (
                    <div
                      key={b.value}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors",
                        n > 0 ? "bg-primary/5" : "hover:bg-muted/60"
                      )}
                    >
                      <span className={cn("flex-1 text-sm", n > 0 ? "font-medium text-primary" : "text-foreground")}>{b.label}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setCount(b.value, n - 1)}
                          disabled={n === 0}
                          aria-label={`Decrease ${b.label} objectives`}
                          className="w-6 h-6 rounded-full border border-border bg-background flex items-center justify-center text-foreground hover:bg-muted disabled:opacity-40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <Minus className="w-3 h-3" aria-hidden="true" focusable="false" />
                        </button>
                        <span className={cn("w-6 text-center text-sm tabular-nums", n > 0 ? "font-semibold text-primary" : "text-muted-foreground")}>
                          {n}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCount(b.value, n + 1)}
                          disabled={n >= 5}
                          aria-label={`Increase ${b.label} objectives`}
                          className="w-6 h-6 rounded-full border border-border bg-background flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary disabled:opacity-40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <Plus className="w-3 h-3" aria-hidden="true" focusable="false" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-border px-2.5 py-2 bg-muted/30">
                <span className="text-xs text-muted-foreground">
                  {total === 0 ? "Nothing selected yet" : `${total} objective${total !== 1 ? "s" : ""} to generate`}
                </span>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={total === 0 || generating}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {generating ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" focusable="false" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                  )}
                  {generating ? "Generating…" : "Generate"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
}

function OutcomesSection({ state, onChange, errors }: StepCourseDetailsProps & { errors: Record<string, string> }) {

  
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const objectives = state.learningObjectives;
  const tags = objectives.map((o, i) => state.objectiveBlooms?.[i] || detectBloom(o) || "");
  const detected = tags.filter(Boolean);
  const detectedKey = Array.from(new Set(detected)).sort().join(",");

  // Roll the per-objective tags up into the course-level Bloom levels.
  useEffect(() => {
    if (!detectedKey) return;
    const levels = detectedKey.split(",");
    const merged = Array.from(new Set([...state.bloomsTaxonomy, ...levels]));
    if (merged.length !== state.bloomsTaxonomy.length) {
      onChange({ bloomsTaxonomy: merged });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detectedKey]);

  const setTag = (idx: number, level: string) => {
    const next = objectives.map((_, i) => (i === idx ? level : tags[i]));
    onChange({ objectiveBlooms: next });
  };

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const next = [...objectives];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    const nextTags = [...tags];
    const [movedTag] = nextTags.splice(from, 1);
    nextTags.splice(to, 0, movedTag);
    onChange({ learningObjectives: next, objectiveBlooms: nextTags });
  };

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= objectives.length) return;
    reorder(idx, target);
  };


  return (
    <>
      {/* Learning Objectives */}
      <div data-field="learningObjectives">
        <label className="text-base font-semibold text-foreground mb-2 block">
          Learning Objectives
          <span className="text-destructive ml-0.5" aria-hidden="true">*</span>
        </label>
        <div className={cn("rounded-xl border overflow-hidden bg-white", errors.learningObjectives ? "border-destructive" : "border-border")}>
          <div className="p-3 space-y-2">
            {objectives.length === 0 && (
              <p className="text-xs text-muted-foreground px-1 py-2">
                Add one or more measurable objectives, or pick from AI suggestions below.
              </p>
            )}
            {objectives.map((obj, idx) => {
              const bloom = tags[idx];
              const bloomLabel = BLOOMS_OPTIONS.find((b) => b.value === bloom)?.label;
              const isAuto = !state.objectiveBlooms?.[idx] && !!bloom;
              return (
                <div
                  key={idx}
                  draggable
                  onDragStart={() => setDragIndex(idx)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setOverIndex(idx);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragIndex !== null) reorder(dragIndex, idx);
                    setDragIndex(null);
                    setOverIndex(null);
                  }}
                  onDragEnd={() => {
                    setDragIndex(null);
                    setOverIndex(null);
                  }}
                  className={cn(
                    "flex items-start gap-2 rounded-lg border bg-background px-3 py-2 transition-colors focus-within:border-primary/50",
                    overIndex === idx && dragIndex !== null && dragIndex !== idx
                      ? "border-primary/60 bg-primary/5"
                      : "border-border",
                    dragIndex === idx && "opacity-60"
                  )}
                >
                  <button
                    type="button"
                    role="button"
                    tabIndex={0}
                    aria-label={`Reorder objective ${idx + 1}. Use arrow up or arrow down keys to move.`}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp") {
                        e.preventDefault();
                        move(idx, -1);
                      } else if (e.key === "ArrowDown") {
                        e.preventDefault();
                        move(idx, 1);
                      }
                    }}
                    className="mt-2 w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <GripVertical className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                  </button>
                  <Textarea
                    value={obj}
                    onChange={(e) => {
                      const next = [...objectives];
                      next[idx] = e.target.value;
                      onChange({ learningObjectives: next });
                      e.target.style.height = "auto";
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 220)}px`;
                    }}
                    ref={(el) => {
                      if (el) {
                        el.style.height = "auto";
                        el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
                      }
                    }}
                    placeholder={`Objective ${idx + 1}`}
                    rows={1}
                    className="flex-1 min-h-[36px] max-h-[220px] resize-none text-sm border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-1 py-1.5"

                    aria-label={`Learning objective ${idx + 1}`}
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label={`Bloom's taxonomy level for objective ${idx + 1}${bloomLabel ? `: ${bloomLabel}` : ": not tagged"}`}
                        className={cn(
                          "mt-1.5 shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                          bloomLabel
                            ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15"
                            : "bg-background text-muted-foreground border-dashed border-border hover:text-foreground hover:border-primary/40"
                        )}
                      >
                        {bloomLabel ? (
                          <>
                            {bloomLabel}
                            {isAuto && <span className="text-[10px] opacity-80">auto</span>}
                          </>
                        ) : (
                          <>
                            <PlusIcon className="w-3 h-3" aria-hidden="true" focusable="false" />
                            Tag level
                          </>
                        )}
                        <ChevronDown className="w-3 h-3" aria-hidden="true" focusable="false" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-52 p-1.5 bg-background">
                      <p className="px-2 py-1.5 text-xs font-semibold text-foreground">Bloom's level</p>
                      <div className="space-y-0.5">
                        {BLOOMS_OPTIONS.map((b) => (
                          <button
                            key={b.value}
                            type="button"
                            onClick={() => setTag(idx, b.value)}
                            aria-pressed={bloom === b.value}
                            className={cn(
                              "w-full flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              bloom === b.value ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"
                            )}
                          >
                            {b.label}
                            {bloom === b.value && <Check className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setTag(idx, "")}
                          className="w-full text-left rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Clear tag
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <button
                    type="button"
                    onClick={() => onChange({ learningObjectives: objectives.filter((_, i) => i !== idx), objectiveBlooms: tags.filter((_, i) => i !== idx) })}
                    aria-label={`Remove objective ${idx + 1}`}
                    className="mt-1 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                  </button>
                </div>
              );
            })}

            <div className="flex flex-wrap items-center gap-4 pt-0.5">
              <AddObjectiveMenu
                title={state.title}
                onAddManual={() => onChange({ learningObjectives: [...objectives, ""], objectiveBlooms: [...tags, ""] })}
                onAddGenerated={(items) =>
                  onChange({
                    learningObjectives: [...objectives, ...items.map((i) => i.text)],
                    objectiveBlooms: [...tags, ...items.map((i) => i.bloom)],
                  })
                }
              />
            </div>

          </div>

          <AISuggestions
            title={state.title}
            generator={generateObjectiveSuggestions}
            heading="Suggested learning objectives"
            regenerateLabel="Regenerate objectives"
            showBloom
            onSelect={(text) => {
              const current = state.learningObjectives;
              const existingIdx = current.indexOf(text);
              if (existingIdx !== -1) {
                onChange({ learningObjectives: current.filter((_, i) => i !== existingIdx) });
              } else {
                const emptyIdx = current.findIndex((o) => !o.trim());
                if (emptyIdx !== -1) {
                  const next = [...current];
                  next[emptyIdx] = text;
                  onChange({ learningObjectives: next });
                } else {
                  onChange({ learningObjectives: [...current, text] });
                }
              }
            }}
          />

        </div>
        {errors.learningObjectives && (
          <p role="alert" className="text-xs text-destructive mt-2 font-medium">{errors.learningObjectives}</p>
        )}
      </div>

    </>
  );
}

export function StepCourseDetails({ state, onChange, errors = {} }: StepCourseDetailsProps) {


  return (
    <div className="space-y-8">

      {/* ── Audience ───────────────────────────────── */}
      <section aria-labelledby="group-audience" className="space-y-4">
        <h3 id="group-audience" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Audience
        </h3>
        <AudienceSection state={state} onChange={onChange} errors={errors} />
      </section>

      {/* ── Outcomes ───────────────────────────────── */}
      <section aria-labelledby="group-outcomes" className="space-y-4">
        <h3 id="group-outcomes" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Outcomes
        </h3>

      {/* Learning Outcome with AI suggestions */}
      <div data-field="learningOutcome">

        <label htmlFor="learning-outcome" className="text-base font-semibold text-foreground mb-2 block">
          What do you want learners to be able to do after this course?
          <span className="text-destructive ml-0.5" aria-hidden="true">*</span>
        </label>
        <div className={cn("rounded-xl border overflow-hidden bg-white", errors.learningOutcome ? "border-destructive" : "border-border")}>
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
        {errors.learningOutcome && (
          <p role="alert" className="text-xs text-destructive mt-2 font-medium">{errors.learningOutcome}</p>
        )}
      </div>

      {/* Learning Objectives + Bloom's Taxonomy */}
      <OutcomesSection state={state} onChange={onChange} errors={errors} />
      </section>

      {/* ── Generation settings ────────────────────── */}
      <section aria-labelledby="group-generation" className="space-y-4">
        <h3 id="group-generation" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Generation settings
        </h3>

      <div data-field="pageSpanTime">

        <PageDurationDefaultCard
          valueSec={(state.pageSpanTime || 5) * 60}
          onChange={(sec) => onChange({ pageSpanTime: Math.max(1, Math.round(sec / 60)), scormPageDurationSec: sec } as Partial<AIGenerateState>)}
          description="Default time budget per page. You can override individual pages in the next step."
          className={cn(errors.pageSpanTime ? "border-destructive" : undefined)}
        />
        {errors.pageSpanTime && (
          <p role="alert" className="text-xs text-destructive mt-2 font-medium">{errors.pageSpanTime}</p>
        )}
      </div>

      </section>

    </div>

  );
}
