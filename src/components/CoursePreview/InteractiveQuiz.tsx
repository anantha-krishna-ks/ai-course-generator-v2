import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, RotateCcw, Lock, Info, ChevronLeft, ChevronRight, Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

type FeedbackMode = "any" | "correct_incorrect" | "by_choice";
type RevealMode = "reveal_all" | "incorrect_with_feedback" | "hide_all";

interface QuizQuestion {
  question?: string;
  text?: string;
  type?: string; // "SCQ" | "MCQ" | "TrueFalse" | "FIB"
  options?: string[];
  answers?: any[];
  answer?: string;
  explanation?: string;
  optionExplanations?: string[];
  feedbackMode?: FeedbackMode;
  correctFeedback?: string;
  incorrectFeedback?: string;
}

interface QuizSettings {
  passCriteria?: number;
  failNavigationPage?: string;
  requireCorrect?: boolean;
  retries?: string | number; // "unlimited" | "none" | "0".."5"
  revealAnswers?: RevealMode;
  quizType?: string; // "formative" | "summative"
}

interface InteractiveQuizProps {
  questions: QuizQuestion[];
  settings?: QuizSettings;
  isCompactView?: boolean;
}

const getOptions = (q: QuizQuestion): string[] =>
  q.options || (q.answers?.map((a: any) => (typeof a === "string" ? a : a.text)) ?? []);

const getAnswers = (q: QuizQuestion): string[] =>
  (q.answer || "").split(",").map((s) => s.trim()).filter(Boolean);

const isQuestionCorrect = (q: QuizQuestion, selected: string[]): boolean => {
  const correct = getAnswers(q).map((a) => a.toLowerCase());
  if ((q.type || "").toUpperCase() === "FIB") {
    return selected.length > 0 && correct.includes((selected[0] || "").trim().toLowerCase());
  }
  const sel = selected.map((s) => s.toLowerCase()).sort();
  const cor = [...correct].sort();
  return sel.length === cor.length && sel.every((v, i) => v === cor[i]);
};

export const InteractiveQuiz = ({ questions, settings, isCompactView }: InteractiveQuizProps) => {
  if ((settings?.quizType || "").toLowerCase() === "formative") {
    return <FormativeCardQuiz questions={questions} settings={settings} />;
  }
  return <ClassicQuiz questions={questions} settings={settings} isCompactView={isCompactView} />;
};

/* ---------------------------------------------------------------------- */
/* Formative card-based quiz — one question at a time, modern progress    */
/* ---------------------------------------------------------------------- */

const FormativeCardQuiz = ({ questions, settings }: { questions: QuizQuestion[]; settings?: QuizSettings }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string[]>>({});
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [validated, setValidated] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const total = questions.length;
  const passCriteria = Math.max(1, Math.min(settings?.passCriteria ?? total, total));
  const revealMode: RevealMode = (settings?.revealAnswers as RevealMode) || "reveal_all";
  const retriesSetting = settings?.retries ?? "unlimited";
  const maxRetries: number | "unlimited" = useMemo(() => {
    if (retriesSetting === "unlimited") return "unlimited";
    if (retriesSetting === "none") return 0;
    const n = Number(retriesSetting);
    return Number.isFinite(n) ? n : "unlimited";
  }, [retriesSetting]);

  const answeredCount = questions.reduce((acc, q, i) => {
    const sel = selectedAnswers[i] || [];
    const done = (q.type || "").toUpperCase() === "FIB" ? (sel[0] || "").trim().length > 0 : sel.length > 0;
    return acc + (done ? 1 : 0);
  }, 0);
  const progressPct = total === 0 ? 0 : Math.round(((validated ? total : answeredCount) / total) * 100);
  const allAnswered = answeredCount === total;

  const correctCount = questions.filter((q, i) => isQuestionCorrect(q, selectedAnswers[i] || [])).length;
  const passed = correctCount >= passCriteria;
  const canRetry = maxRetries === "unlimited" || attempts < (maxRetries as number);

  const handleSelect = (option: string, isMCQ: boolean) => {
    if (validated) return;
    setSelectedAnswers((prev) => {
      const cur = prev[current] || [];
      if (isMCQ) {
        return {
          ...prev,
          [current]: cur.includes(option) ? cur.filter((o) => o !== option) : [...cur, option],
        };
      }
      return { ...prev, [current]: [option] };
    });
  };

  const handleFib = (value: string) => {
    if (validated) return;
    setSelectedAnswers((prev) => ({ ...prev, [current]: [value] }));
  };

  const goTo = (i: number) => {
    if (i < 0 || i >= total || i === current) return;
    setDirection(i > current ? 1 : -1);
    setCurrent(i);
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setValidated(false);
    setCurrent(0);
    setDirection(1);
    setAttempts((a) => a + 1);
  };

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
        No questions have been added yet.
      </div>
    );
  }

  // Results screen
  if (validated) {
    return (
      <div className="space-y-5">
        <ResultsHeader
          correct={correctCount}
          total={total}
          passed={passed}
          passCriteria={passCriteria}
        />

        {/* Review list */}
        <div className="space-y-3">
          {questions.map((q, qi) => {
            const sel = selectedAnswers[qi] || [];
            const correct = isQuestionCorrect(q, sel);
            const options = getOptions(q);
            const correctAnswers = getAnswers(q);
            return (
              <div
                key={qi}
                className={cn(
                  "rounded-xl border p-4",
                  correct
                    ? "border-green-500/30 bg-green-50/60 dark:bg-green-950/20"
                    : "border-red-400/30 bg-red-50/60 dark:bg-red-950/20"
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold",
                      correct ? "bg-green-600 text-white" : "bg-red-500 text-white"
                    )}
                  >
                    {qi + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-relaxed">
                      {q.question || q.text}
                    </p>
                    {revealMode !== "hide_all" && (
                      <div className="mt-2 text-xs">
                        <span className="text-muted-foreground">Your answer: </span>
                        <span className={cn("font-medium", correct ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400")}>
                          {(sel.length ? sel.join(", ") : "—")}
                        </span>
                        {!correct && revealMode === "reveal_all" && (
                          <>
                            <span className="text-muted-foreground"> · Correct: </span>
                            <span className="font-medium text-green-700 dark:text-green-400">{correctAnswers.join(", ")}</span>
                          </>
                        )}
                      </div>
                    )}
                    {q.explanation && revealMode !== "hide_all" && (
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{q.explanation}</p>
                    )}
                  </div>
                  {correct ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" aria-hidden="true" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" aria-hidden="true" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {canRetry ? (
            <Button onClick={handleRetry} className="gap-1.5 rounded-full">
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              Retake quiz
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
              No retries left
            </span>
          )}
          {maxRetries !== "unlimited" && (
            <span className="text-xs text-muted-foreground">
              {Math.max(0, (maxRetries as number) - attempts)} retries left
            </span>
          )}
        </div>
      </div>
    );
  }

  const q = questions[current];
  const qType = (q.type || "SCQ").toUpperCase();
  const isFIB = qType === "FIB";
  const isMCQ = qType === "MCQ";
  const options = getOptions(q);
  const selected = selectedAnswers[current] || [];
  const currentAnswered = isFIB ? (selected[0] || "").trim().length > 0 : selected.length > 0;

  const difficulty = (q as any).difficulty || (q as any).level || "";
  const category = (q as any).category || (q as any).topic || "Knowledge";
  const typeLabel =
    qType === "MCQ" ? "Multiple choice"
    : qType === "SCQ" ? "Single choice"
    : qType === "FIB" ? "Fill in the blank"
    : qType === "TF" ? "True / False"
    : qType;

  return (
    <div className="relative space-y-5">
      {/* Top progress row */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground tracking-wide">Progress</span>
          <span className="font-semibold text-foreground tabular-nums">{progressPct}%</span>
        </div>
        <div className="relative h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ type: "spring", stiffness: 160, damping: 24 }}
            className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-fuchsia-500"
          />
        </div>
      </div>

      {/* Main card */}
      <div className="relative rounded-2xl border border-border/70 bg-card shadow-[0_1px_0_hsl(var(--border)),0_10px_40px_-24px_hsl(var(--foreground)/0.18)] overflow-hidden">
        {/* Thin accent bar */}
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-primary via-primary to-fuchsia-500" />

        <div className="p-6 sm:p-8">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              initial={{ opacity: 0, x: direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 24 }}
              transition={{ type: "spring", stiffness: 220, damping: 28 }}
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-1">
                    Question {current + 1} <span className="text-muted-foreground/60">/ {total}</span>
                  </p>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground leading-snug tracking-tight">
                    {q.question || q.text}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {difficulty && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-background border border-border/70 text-foreground/80">
                      {difficulty}
                    </span>
                  )}
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-muted/60 border border-border/70 text-foreground/80">
                    {typeLabel}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/10 border border-primary/25 text-primary">
                    {category}
                  </span>
                </div>
              </div>

              {isMCQ && (
                <p className="mt-2 text-xs text-muted-foreground">Select all that apply</p>
              )}

              {/* Options */}
              <div className="mt-6">
                {isFIB ? (
                  <Input
                    value={selected[0] || ""}
                    onChange={(e) => handleFib(e.target.value)}
                    placeholder="Type your answer..."
                    aria-label={`Answer for question ${current + 1}`}
                    className="h-12 rounded-xl bg-background border-border/70 text-base focus-visible:ring-2 focus-visible:ring-primary/30"
                  />
                ) : (
                  <div className="space-y-2.5">
                    {options.map((opt, ai) => {
                      const isSelected = selected.includes(opt);
                      return (
                        <motion.button
                          key={ai}
                          type="button"
                          onClick={() => handleSelect(opt, isMCQ)}
                          whileTap={{ scale: 0.995 }}
                          className={cn(
                            "group/opt relative w-full flex items-center gap-4 px-4 sm:px-5 py-4 rounded-xl text-left text-sm transition-all border",
                            isSelected
                              ? "border-primary bg-primary/[0.06] shadow-[0_4px_18px_-10px_hsl(var(--primary)/0.55)]"
                              : "border-border/70 bg-background hover:border-primary/40 hover:bg-muted/40"
                          )}
                        >
                          {/* Radio / checkbox indicator */}
                          <span
                            className={cn(
                              "relative flex-shrink-0 flex items-center justify-center transition-all",
                              isMCQ ? "w-5 h-5 rounded-md border-2" : "w-5 h-5 rounded-full border-2",
                              isSelected
                                ? "border-primary bg-primary"
                                : "border-muted-foreground/35 group-hover/opt:border-primary/60"
                            )}
                            aria-hidden="true"
                          >
                            {isSelected && (
                              isMCQ ? (
                                <svg className="w-3 h-3 text-primary-foreground" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path d="M2.5 6l2.5 2.5 4.5-5" />
                                </svg>
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-primary-foreground" />
                              )
                            )}
                          </span>

                          <span className={cn(
                            "flex-1 leading-relaxed",
                            isSelected ? "font-medium text-foreground" : "text-foreground/85"
                          )}>
                            {opt}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Divider + Question pills + Footer */}
        <div className="border-t border-border/70 bg-muted/25 px-5 sm:px-6 py-4 space-y-4">
          {/* Question number pills — centered, scalable row */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {questions.map((qq, i) => {
              const sel = selectedAnswers[i] || [];
              const done = (qq.type || "").toUpperCase() === "FIB" ? (sel[0] || "").trim().length > 0 : sel.length > 0;
              const isCurrent = i === current;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to question ${i + 1}`}
                  aria-current={isCurrent ? "step" : undefined}
                  className={cn(
                    "relative h-7 min-w-[28px] px-2 rounded-full text-[11px] font-semibold border transition-all",
                    isCurrent
                      ? "bg-primary text-primary-foreground border-transparent shadow-sm"
                      : done
                      ? "bg-primary/10 text-primary border-primary/25 hover:bg-primary/15"
                      : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goTo(current - 1)}
              disabled={current === 0}
              className="gap-1.5 rounded-full border-border/80 bg-card/40 hover:bg-card hover:text-foreground disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              Previous
            </Button>

            {current < total - 1 ? (
              <Button
                size="sm"
                onClick={() => goTo(current + 1)}
                disabled={!currentAnswered}
                className="gap-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20"
              >
                Next
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setValidated(true)}
                disabled={!allAnswered}
                className="gap-1.5 rounded-full bg-gradient-to-r from-primary to-fuchsia-500 text-primary-foreground hover:opacity-95 shadow-md shadow-primary/25"
              >
                Submit
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {settings?.requireCorrect && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>You must answer correctly to continue.</span>
        </div>
      )}
    </div>
  );
};

const currentAnsweredForIndex = (q: QuizQuestion | undefined, sel: string[] | undefined) => {
  if (!q) return false;
  const s = sel || [];
  if ((q.type || "").toUpperCase() === "FIB") return (s[0] || "").trim().length > 0;
  return s.length > 0;
};

const ProgressRing = ({ pct }: { pct: number }) => {
  const size = 52;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id="progress-ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progress-ring-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: "spring", stiffness: 140, damping: 22 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-bold text-foreground tabular-nums" aria-label={`${pct}% complete`}>
          {pct}%
        </span>
      </div>
    </div>
  );
};

const ResultsHeader = ({
  correct,
  total,
  passed,
  passCriteria,
}: {
  correct: number;
  total: number;
  passed: boolean;
  passCriteria: number;
}) => {
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-6 flex items-center gap-5",
        passed
          ? "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/40 dark:via-emerald-950/30 dark:to-teal-950/30 border-green-500/30"
          : "bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-red-950/30 border-amber-500/30"
      )}
    >
      <div
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg",
          passed ? "bg-green-600 text-white" : "bg-amber-500 text-white"
        )}
      >
        <Trophy className="w-8 h-8" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quiz complete</p>
        <h3 className="text-2xl font-semibold text-foreground mt-0.5">
          {passed ? "Great work!" : "Keep going"}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          You scored <span className="font-semibold text-foreground">{correct} / {total}</span> ({pct}%) · Pass mark {passCriteria}
        </p>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------------- */
/* Classic list-style quiz (existing behaviour, unchanged)                */
/* ---------------------------------------------------------------------- */

const ClassicQuiz = ({ questions, settings }: InteractiveQuizProps) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string[]>>({});
  const [validated, setValidated] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const requireCorrect = !!settings?.requireCorrect;
  const revealMode: RevealMode = (settings?.revealAnswers as RevealMode) || "reveal_all";
  const retriesSetting = settings?.retries ?? "unlimited";
  const maxRetries: number | "unlimited" = useMemo(() => {
    if (retriesSetting === "unlimited") return "unlimited";
    if (retriesSetting === "none") return 0;
    const n = Number(retriesSetting);
    return Number.isFinite(n) ? n : "unlimited";
  }, [retriesSetting]);
  const passCriteria = Math.max(1, Math.min(settings?.passCriteria ?? questions.length, questions.length));

  const handleSelect = (qIndex: number, option: string, isMCQ: boolean) => {
    if (validated) return;
    setSelectedAnswers((prev) => {
      const current = prev[qIndex] || [];
      if (isMCQ) {
        return {
          ...prev,
          [qIndex]: current.includes(option)
            ? current.filter((o) => o !== option)
            : [...current, option],
        };
      }
      return { ...prev, [qIndex]: [option] };
    });
  };

  const handleFibChange = (qIndex: number, value: string) => {
    if (validated) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: [value] }));
  };

  const handleValidate = () => setValidated(true);

  const handleRetry = () => {
    setSelectedAnswers({});
    setValidated(false);
    setAttempts((a) => a + 1);
  };

  const totalQuestions = questions.length;
  const correctCount = validated
    ? questions.filter((q, i) => isQuestionCorrect(q, selectedAnswers[i] || [])).length
    : 0;

  const passed = correctCount >= passCriteria;
  const allAnswered = questions.every((q, i) => {
    const sel = selectedAnswers[i] || [];
    if ((q.type || "").toUpperCase() === "FIB") return (sel[0] || "").trim().length > 0;
    return sel.length > 0;
  });

  const retriesUsed = attempts;
  const canRetry = maxRetries === "unlimited" || retriesUsed < maxRetries;
  const retriesLeftLabel =
    maxRetries === "unlimited" ? "Unlimited retries" : `${Math.max(0, (maxRetries as number) - retriesUsed)} retries left`;

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => {
        const questionText = q.question || q.text || "";
        const qType = (q.type || "SCQ").toUpperCase();
        const isFIB = qType === "FIB";
        const isMCQ = qType === "MCQ";
        const options = getOptions(q);
        const correctAnswers = getAnswers(q);
        const selected = selectedAnswers[qi] || [];
        const isCorrect = validated && isQuestionCorrect(q, selected);
        const feedbackMode: FeedbackMode = q.feedbackMode || "any";

        const showCorrectHighlights =
          validated && (revealMode === "reveal_all" || (revealMode === "incorrect_with_feedback" && !isCorrect));
        const showIncorrectHighlights = validated && revealMode !== "hide_all";

        return (
          <div key={qi} className="bg-muted/40 rounded-xl p-4 sm:p-5 border border-border/60">
            <div className="flex items-start gap-3 mb-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                {qi + 1}
              </span>
              <p className="font-medium text-foreground text-sm sm:text-base leading-relaxed">
                {questionText}
              </p>
            </div>
            {q.type && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-xs font-semibold text-primary mb-3">
                {q.type}
              </span>
            )}

            {isFIB ? (
              <div className="space-y-2">
                <Input
                  value={selected[0] || ""}
                  onChange={(e) => handleFibChange(qi, e.target.value)}
                  disabled={validated}
                  placeholder="Type your answer..."
                  aria-label={`Answer for question ${qi + 1}`}
                  className={cn(
                    validated && isCorrect && showCorrectHighlights && "border-green-500/60",
                    validated && !isCorrect && showIncorrectHighlights && "border-red-400/60"
                  )}
                />
                {validated && !isCorrect && revealMode === "reveal_all" && correctAnswers[0] && (
                  <p className="text-xs text-green-700 dark:text-green-400">
                    Correct answer: <span className="font-semibold">{correctAnswers[0]}</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {options.map((opt, ai) => {
                  const isSelected = selected.includes(opt);
                  const isAnswer = correctAnswers.includes(opt);

                  let optionStyle =
                    "bg-background border border-border/40 cursor-pointer hover:border-primary/40 hover:bg-primary/5";
                  if (isSelected && !validated) {
                    optionStyle = "bg-primary/10 border-2 border-primary/40 cursor-pointer";
                  }
                  if (validated) {
                    if (isAnswer && showCorrectHighlights) {
                      optionStyle = "bg-green-50 dark:bg-green-950/30 border-2 border-green-500/50";
                    } else if (isSelected && !isAnswer && showIncorrectHighlights) {
                      optionStyle = "bg-red-50 dark:bg-red-950/30 border-2 border-red-400/50";
                    } else {
                      optionStyle = "bg-background border border-border/40 opacity-70";
                    }
                  }

                  const perOptionRationale =
                    feedbackMode === "by_choice" && q.optionExplanations?.[ai]?.trim()
                      ? q.optionExplanations[ai]
                      : "";

                  return (
                    <div key={ai}>
                      <div
                        onClick={() => handleSelect(qi, opt, isMCQ)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                          optionStyle
                        )}
                      >
                        {isMCQ ? (
                          <div
                            className={cn(
                              "w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center",
                              isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
                            )}
                          >
                            {isSelected && (
                              <svg
                                className="w-3.5 h-3.5 text-primary-foreground"
                                viewBox="0 0 12 12"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <path d="M2.5 6l2.5 2.5 4.5-5" />
                              </svg>
                            )}
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
                              isSelected ? "border-primary bg-primary" : "border-border"
                            )}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                          </div>
                        )}
                        <span
                          className={cn(
                            "text-[0.9rem] leading-relaxed",
                            isSelected ? "font-semibold text-foreground" : "text-foreground/80"
                          )}
                        >
                          {opt}
                        </span>
                        {validated && isAnswer && showCorrectHighlights && (
                          <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto flex-shrink-0" />
                        )}
                        {validated && isSelected && !isAnswer && showIncorrectHighlights && (
                          <XCircle className="w-4 h-4 text-red-500 ml-auto flex-shrink-0" />
                        )}
                      </div>

                      {validated && perOptionRationale && isSelected && (
                        <div className="mt-1.5 ml-2 pl-3 border-l-2 border-primary/30 text-xs text-muted-foreground">
                          {perOptionRationale}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {validated && (() => {
              if (revealMode === "hide_all") return null;
              if (revealMode === "incorrect_with_feedback" && isCorrect) return null;

              if (feedbackMode === "correct_incorrect") {
                const text = isCorrect ? q.correctFeedback : q.incorrectFeedback;
                if (!text?.trim()) return null;
                return (
                  <div
                    className={cn(
                      "mt-3 rounded-lg p-3 border animate-in fade-in-50 duration-200",
                      isCorrect
                        ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
                    )}
                  >
                    <p
                      className={cn(
                        "text-xs font-semibold mb-1",
                        isCorrect ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                      )}
                    >
                      {isCorrect ? "Correct" : "Incorrect"}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
                  </div>
                );
              }

              if (feedbackMode === "by_choice") {
                return null;
              }

              if (q.explanation?.trim()) {
                return (
                  <div className="mt-3 bg-primary/5 border border-primary/20 rounded-lg p-3 animate-in fade-in-50 duration-200">
                    <p className="text-xs font-semibold text-primary mb-1">Explanation:</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{q.explanation}</p>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        );
      })}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        {!validated ? (
          <Button onClick={handleValidate} disabled={!allAnswered} className="bg-primary hover:bg-primary/90">
            Submit Quiz
          </Button>
        ) : (
          <>
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm border",
                passed
                  ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                  : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
              )}
            >
              {passed && <CheckCircle2 className="w-4 h-4" aria-hidden="true" focusable="false" />}
              Score: {correctCount}/{totalQuestions}
              {requireCorrect && <span className="ml-1 font-normal opacity-80">· Pass: {passCriteria}</span>}
            </div>

            {canRetry ? (
              <Button variant="outline" size="sm" onClick={handleRetry} className="gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                Retry
              </Button>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                <Lock className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                No retries left
              </span>
            )}

            {maxRetries !== "unlimited" && (
              <span className="text-xs text-muted-foreground">{retriesLeftLabel}</span>
            )}

            {requireCorrect && !passed && (
              <div className="w-full flex items-start gap-2 mt-1 px-3 py-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
                <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" aria-hidden="true" focusable="false" />
                <span>
                  You must answer correctly to continue
                  {settings?.failNavigationPage ? " (you'll be redirected on final fail)" : ""}.
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
