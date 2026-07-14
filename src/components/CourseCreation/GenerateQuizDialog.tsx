import { useState } from "react";
import {
  Sparkles,
  CircleDot,
  ListChecks,
  ToggleRight,
  PenLine,
  Minus,
  Plus,
  GraduationCap,
  ClipboardCheck,
  Layers,
  FileText,
  BookOpen,
  Check,
  Sprout,
  Gauge,
  Award,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface GenerateQuizDialogProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (config: GenerateQuizConfig) => void;
  isGenerating?: boolean;
}

export interface GenerateQuizConfig {
  quizType: string;
  scope: string[];
  scqCount: number;
  mcqCount: number;
  trueFalseCount: number;
  fibCount: number;
  difficultyLevel: string;
  inclusions: string;
  exclusions: string;
}

type QTypeKey = "scq" | "mcq" | "tf" | "fib";

const QUESTION_TYPES: {
  key: QTypeKey;
  label: string;
  icon: LucideIcon;
  hue: string;
  barHue: string;
}[] = [
  { key: "scq", label: "Single Choice", icon: CircleDot, hue: "212 90% 40%", barHue: "211 100% 50%" },
  { key: "mcq", label: "Multiple Choice", icon: ListChecks, hue: "262 60% 45%", barHue: "262 83% 58%" },
  { key: "tf", label: "True / False", icon: ToggleRight, hue: "160 84% 28%", barHue: "160 84% 39%" },
  { key: "fib", label: "Fill in Blank", icon: PenLine, hue: "25 90% 38%", barHue: "32 95% 53%" },
];

const QUIZ_VARIANTS = {
  formative: {
    title: "Formative",
    subtitle: "Low-stakes check-ins during learning",
    description:
      "Low-stakes check-ins woven into the learning flow to reinforce concepts as learners progress.",
    icon: GraduationCap,
    badge: "In-flow",
    perTypeMax: 8,
  },
  summative: {
    title: "Summative",
    subtitle: "Graded end-of-course assessment",
    description:
      "Single graded assessment that evaluates overall mastery of the material.",
    icon: ClipboardCheck,
    badge: "Graded",
    perTypeMax: 15,
  },
} as const;
type QuizVariantKey = keyof typeof QUIZ_VARIANTS;

const scopeOptions = [
  { key: "section", label: "This Section", description: "Quiz for the current section only", icon: Layers },
  { key: "page", label: "This Page", description: "Quiz for the current page only", icon: FileText },
  { key: "course", label: "Entire Course", description: "Quiz covering the full course", icon: BookOpen },
] as const;

export function GenerateQuizDialog({
  open,
  onClose,
  onGenerate,
  isGenerating = false,
}: GenerateQuizDialogProps) {
  const [quizType, setQuizType] = useState<QuizVariantKey>("formative");
  const [scope, setScope] = useState<string[]>(["section"]);
  const [counts, setCounts] = useState<Record<QTypeKey, number>>({
    scq: 3,
    mcq: 2,
    tf: 2,
    fib: 1,
  });
  const [difficultyLevel, setDifficultyLevel] = useState("medium");
  const [specificInstructions, setSpecificInstructions] = useState(false);
  const [inclusions, setInclusions] = useState("");
  const [exclusions, setExclusions] = useState("");

  const variant = QUIZ_VARIANTS[quizType];
  const perTypeMax = variant.perTypeMax;
  const total = QUESTION_TYPES.reduce((s, q) => s + (counts[q.key] || 0), 0);

  const setType = (k: QTypeKey, n: number) => {
    setCounts((prev) => ({
      ...prev,
      [k]: Math.max(0, Math.min(perTypeMax, n)),
    }));
  };

  const toggleScope = (key: string) => {
    setScope((prev) => (prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]));
  };

  const handleGenerate = () => {
    onGenerate({
      quizType,
      scope,
      scqCount: counts.scq,
      mcqCount: counts.mcq,
      trueFalseCount: counts.tf,
      fibCount: counts.fib,
      difficultyLevel,
      inclusions,
      exclusions,
    });
  };

  const ActiveIcon = variant.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="w-[95vw] max-w-[820px] max-h-[90vh] p-0 overflow-hidden grid grid-rows-[auto_minmax(0,1fr)_auto] rounded-2xl border shadow-2xl"
        style={{ backgroundColor: "#F9FAFB" }}
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-4 pb-3 border-b border-border bg-white">
          <div className="flex items-center justify-between pr-8">
            <div>
              <DialogTitle className="text-base font-semibold tracking-tight">
                Generate Quiz
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Configure question types and quantity to auto-generate a quiz.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/[0.06] px-2.5 py-1.5 rounded-lg border border-primary/15">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
              AI Quiz
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="min-h-0 row-start-2">
          <ScrollArea className="h-full">
            <div className="px-6 pt-5 pb-6 space-y-4">
              {/* Quiz Configuration Card (matches StepDocumentAssessment PrefCard) */}
              <div className="rounded-xl border border-border bg-card p-5">
                {/* Master header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-primary/15 text-primary transition-colors"
                      aria-hidden="true"
                    >
                      <ActiveIcon className="w-4 h-4" aria-hidden="true" focusable="false" />
                    </span>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[16px] font-semibold text-foreground leading-tight">
                          Quiz configuration
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary ring-1 ring-inset ring-primary/25">
                          {variant.badge}
                        </span>
                      </div>
                      <p className="text-[13px] text-muted-foreground mt-1 leading-snug">
                        {variant.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quiz type selector — card-style radio */}
                <div className="mt-5">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Quiz type
                    </span>
                  </div>
                  <div
                    role="radiogroup"
                    aria-label="Quiz type"
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    {(Object.keys(QUIZ_VARIANTS) as QuizVariantKey[]).map((k) => {
                      const v = QUIZ_VARIANTS[k];
                      const Icon = v.icon;
                      const selected = quizType === k;
                      return (
                        <button
                          key={k}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => setQuizType(k)}
                          className={cn(
                            "group relative flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            selected
                              ? "border-primary bg-primary/[0.04] ring-1 ring-primary/40 shadow-[0_2px_10px_-4px_hsl(var(--primary)/0.25)]"
                              : "border-border bg-background hover:border-primary/30 hover:bg-muted/30"
                          )}
                        >
                          <span
                            className={cn(
                              "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                              selected
                                ? "bg-gradient-to-br from-primary to-[hsl(var(--primary)/0.85)] text-primary-foreground shadow-[0_4px_12px_-3px_hsl(var(--primary)/0.5),inset_0_1px_0_hsl(0_0%_100%/0.25)]"
                                : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                            )}
                            aria-hidden="true"
                          >
                            <Icon className="w-[18px] h-[18px]" aria-hidden="true" focusable="false" />
                          </span>
                          <span className="flex flex-col min-w-0 flex-1">
                            <span className="text-[14px] font-semibold leading-tight text-foreground">
                              {v.title}
                            </span>
                            <span className="text-[12px] text-muted-foreground leading-snug mt-0.5 truncate">
                              {v.subtitle}
                            </span>
                          </span>
                          <span
                            aria-hidden="true"
                            className={cn(
                              "relative w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300",
                              selected
                                ? "border-primary bg-primary"
                                : "border-muted-foreground/35 bg-background group-hover:border-muted-foreground/60"
                            )}
                          >
                            <span
                              className={cn(
                                "w-2 h-2 rounded-full bg-primary-foreground transition-all duration-300",
                                selected ? "scale-100 opacity-100" : "scale-0 opacity-0"
                              )}
                            />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quiz Scope */}
                <div className="mt-5 pt-5 border-t border-border">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Quiz scope
                      </div>
                      <p className="text-[12px] text-muted-foreground mt-0.5">
                        Choose where the quiz should apply.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {scopeOptions.map(({ key, label, description, icon: Icon }) => {
                      const isActive = scope.includes(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => toggleScope(key)}
                          className={cn(
                            "text-left rounded-2xl border p-3 transition-all duration-200 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            isActive
                              ? "border-primary bg-primary/[0.04] ring-1 ring-primary/40 shadow-[0_2px_10px_-4px_hsl(var(--primary)/0.25)]"
                              : "border-border bg-background hover:border-primary/30 hover:bg-muted/30"
                          )}
                          aria-pressed={isActive}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={cn(
                                "w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all border",
                                isActive
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "bg-background border-border"
                              )}
                              aria-hidden="true"
                            >
                              <Check
                                className={cn(
                                  "w-3.5 h-3.5 transition-all",
                                  isActive ? "opacity-100 scale-100" : "opacity-0 scale-75"
                                )}
                                aria-hidden="true"
                                focusable="false"
                              />
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all",
                                    isActive
                                      ? "bg-primary/15 text-primary ring-1 ring-inset ring-primary/25"
                                      : "bg-muted text-muted-foreground"
                                  )}
                                  aria-hidden="true"
                                >
                                  <Icon className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                                </span>
                                <span className="text-[13px] font-semibold text-foreground">
                                  {label}
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                                {description}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Question mix */}
                <div className="mt-5 pt-5 border-t border-border">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Question mix
                      </div>
                      <p className="text-[12px] text-muted-foreground mt-0.5">
                        Tune how many of each type. Total updates live.
                      </p>
                    </div>
                    <div
                      className="flex items-baseline gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 ring-1 ring-primary/20"
                      aria-live="polite"
                    >
                      <span className="text-lg font-bold text-primary tabular-nums leading-none">
                        {total}
                      </span>
                      <span className="text-[11px] font-medium text-primary/80 uppercase tracking-wide">
                        {total === 1 ? "question" : "questions"}
                      </span>
                    </div>
                  </div>

                  {total > 0 && (
                    <div className="mb-4">
                      <TooltipProvider delayDuration={100}>
                        <div className="relative flex h-3 w-full overflow-hidden rounded-full bg-muted/40 ring-1 ring-border/60 shadow-[inset_0_1px_2px_hsl(var(--foreground)/0.06)]">
                          {QUESTION_TYPES.map((q, i) => {
                            const n = counts[q.key] || 0;
                            if (n === 0) return null;
                            const pct = (n / total) * 100;
                            return (
                              <Tooltip key={q.key}>
                                <TooltipTrigger asChild>
                                  <div
                                    className="relative h-full transition-[width,transform] duration-500 ease-out cursor-pointer hover:brightness-110 hover:scale-y-[1.35] origin-center"
                                    style={{
                                      width: `${pct}%`,
                                      background: `linear-gradient(180deg, hsl(${q.barHue} / 0.95) 0%, hsl(${q.barHue}) 55%, hsl(${q.barHue} / 0.88) 100%)`,
                                      boxShadow: `inset 0 1px 0 hsl(0 0% 100% / 0.35), inset 0 -1px 0 hsl(${q.barHue} / 0.4), 0 1px 4px -1px hsl(${q.barHue} / 0.45)`,
                                      marginLeft: i === 0 ? 0 : 1,
                                    }}
                                    aria-label={`${q.label}: ${n} ${
                                      n === 1 ? "question" : "questions"
                                    } (${Math.round(pct)}%)`}
                                  >
                                    <span
                                      className="absolute inset-x-0 top-0 h-1/2 rounded-t-full opacity-70"
                                      aria-hidden="true"
                                      style={{
                                        background:
                                          "linear-gradient(180deg, hsl(0 0% 100% / 0.35), hsl(0 0% 100% / 0))",
                                      }}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  sideOffset={10}
                                  className="px-3 py-2 rounded-xl border border-border/70 bg-popover shadow-lg"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <span
                                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                      style={{
                                        backgroundColor: `hsl(${q.hue} / 0.15)`,
                                        color: `hsl(${q.hue})`,
                                        boxShadow: `inset 0 0 0 1px hsl(${q.hue} / 0.35)`,
                                      }}
                                      aria-hidden="true"
                                    >
                                      <q.icon className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                                    </span>
                                    <div className="flex flex-col leading-tight">
                                      <span className="text-[12px] font-semibold text-foreground">
                                        {q.label}
                                      </span>
                                      <span className="text-[11px] text-muted-foreground tabular-nums">
                                        {n} {n === 1 ? "question" : "questions"} · {Math.round(pct)}% of mix
                                      </span>
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </div>
                      </TooltipProvider>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {QUESTION_TYPES.map((q) => {
                      const n = counts[q.key] || 0;
                      const Icon = q.icon;
                      const active = n > 0;
                      return (
                        <div
                          key={q.key}
                          className="group relative flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5 transition-all"
                          style={
                            active
                              ? { backgroundColor: `hsl(${q.hue} / 0.10)` }
                              : { backgroundColor: "hsl(var(--muted) / 0.5)" }
                          }
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all"
                              style={
                                active
                                  ? {
                                      backgroundColor: `hsl(${q.hue} / 0.15)`,
                                      color: `hsl(${q.hue})`,
                                      boxShadow: `inset 0 0 0 1px hsl(${q.hue} / 0.3)`,
                                    }
                                  : {
                                      backgroundColor: "hsl(var(--muted))",
                                      color: "hsl(var(--muted-foreground))",
                                    }
                              }
                              aria-hidden="true"
                            >
                              <Icon className="w-4 h-4" aria-hidden="true" focusable="false" />
                            </span>
                            <span className="text-sm font-medium text-foreground truncate">
                              {q.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setType(q.key, n - 1)}
                              disabled={n <= 0}
                              aria-label={`Decrease ${q.label}`}
                              className="w-7 h-7 rounded-full border border-border bg-background flex items-center justify-center hover:border-primary/50 hover:bg-primary/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Minus
                                className="w-3.5 h-3.5 text-foreground"
                                aria-hidden="true"
                                focusable="false"
                              />
                            </button>
                            <span
                              className="text-base font-bold tabular-nums w-6 text-center transition-colors"
                              style={{
                                color: active ? `hsl(${q.hue})` : "hsl(var(--muted-foreground))",
                              }}
                              aria-live="polite"
                              aria-label={`${n} ${q.label} questions`}
                            >
                              {n}
                            </span>
                            <button
                              type="button"
                              onClick={() => setType(q.key, n + 1)}
                              disabled={n >= perTypeMax}
                              aria-label={`Increase ${q.label}`}
                              className="w-7 h-7 rounded-full flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              style={{
                                border: `1px solid hsl(${q.hue} / 0.45)`,
                                backgroundColor: `hsl(${q.hue} / 0.1)`,
                                color: `hsl(${q.hue})`,
                              }}
                            >
                              <Plus className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {total === 0 && (
                    <p className="text-[12px] text-muted-foreground mt-3 text-center">
                      Add at least one question type to include in this quiz.
                    </p>
                  )}
                </div>

                {/* Difficulty Level */}
                <div className="mt-5 pt-5 border-t border-border">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Difficulty level
                      </div>
                      <p className="text-[12px] text-muted-foreground mt-0.5">
                        Set the challenge level for generated questions.
                      </p>
                    </div>
                  </div>
                  <div
                    role="radiogroup"
                    aria-label="Difficulty level"
                    className="grid grid-cols-3 gap-2.5"
                  >
                    {(
                      [
                        { key: "easy", label: "Easy", hue: "160 84% 28%", icon: Sprout },
                        { key: "medium", label: "Medium", hue: "32 95% 44%", icon: Gauge },
                        { key: "hard", label: "Hard", hue: "0 72% 45%", icon: Award },
                      ] as const
                    ).map((d) => {
                      const selected = difficultyLevel === d.key;
                      return (
                        <button
                          key={d.key}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => setDifficultyLevel(d.key)}
                          className={cn(
                            "relative rounded-2xl border p-3 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            selected
                              ? "border-transparent shadow-[0_2px_10px_-4px_hsl(var(--primary)/0.25)]"
                              : "border-border bg-background hover:border-primary/30 hover:bg-muted/30"
                          )}
                          style={
                            selected
                              ? {
                                  backgroundColor: `hsl(${d.hue} / 0.10)`,
                                  boxShadow: `inset 0 0 0 1px hsl(${d.hue} / 0.45)`,
                                }
                              : undefined
                          }
                        >
                          <d.icon
                            size={20}
                            className="mx-auto mb-1"
                            style={{
                              color: selected ? `hsl(${d.hue})` : "hsl(var(--muted-foreground))",
                            }}
                            aria-hidden="true"
                            focusable="false"
                          />
                          <span
                            className="text-[13px] font-semibold"
                            style={{
                              color: selected ? `hsl(${d.hue})` : "hsl(var(--foreground))",
                            }}
                          >
                            {d.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Instructions */}
                <div className="mt-5 pt-5 border-t border-border">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Custom instructions
                      </div>
                      <p className="text-[12px] text-muted-foreground mt-0.5">
                        Steer the AI with topics to include or avoid.
                      </p>
                    </div>
                    <Switch
                      checked={specificInstructions}
                      onCheckedChange={setSpecificInstructions}
                      aria-label="Toggle custom instructions"
                    />
                  </div>

                  <div
                    className={cn(
                      "grid transition-[grid-template-rows,opacity,margin] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                      specificInstructions
                        ? "grid-rows-[1fr] opacity-100 mt-3"
                        : "grid-rows-[0fr] opacity-0 mt-0"
                    )}
                    aria-hidden={!specificInstructions}
                  >
                    <div className="overflow-hidden">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium flex items-center gap-2 text-foreground">
                            <span
                              className="w-2 h-2 rounded-full bg-primary"
                              aria-hidden="true"
                            />
                            Inclusions
                          </Label>
                          <Textarea
                            placeholder="Topics to include..."
                            value={inclusions}
                            onChange={(e) => setInclusions(e.target.value)}
                            className="min-h-[80px] resize-none rounded-xl bg-background border border-border focus:border-primary text-sm transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium flex items-center gap-2 text-foreground">
                            <span
                              className="w-2 h-2 rounded-full bg-destructive"
                              aria-hidden="true"
                            />
                            Exclusions
                          </Label>
                          <Textarea
                            placeholder="Topics to exclude..."
                            value={exclusions}
                            onChange={(e) => setExclusions(e.target.value)}
                            className="min-h-[80px] resize-none rounded-xl bg-background border border-border focus:border-primary text-sm transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-3.5 border-t border-border bg-white">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || total === 0}
            className="rounded-xl gap-1.5"
          >
            {isGenerating ? (
              <>
                <div
                  className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"
                  aria-hidden="true"
                />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                Generate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
