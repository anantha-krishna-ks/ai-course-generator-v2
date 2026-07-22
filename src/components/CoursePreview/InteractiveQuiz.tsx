import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, RotateCcw, Lock, Info, ChevronLeft, ChevronRight, Trophy, Sparkles, ListChecks, CircleCheck, PencilLine, ToggleLeft, Flag, ShieldCheck, FileCheck2, AlertTriangle, LayoutGrid, Award, Target, Percent, Timer } from "lucide-react";
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
  const qt = (settings?.quizType || "").toLowerCase();
  if (qt === "formative") {
    return <FormativeCardQuiz questions={questions} settings={settings} />;
  }
  if (qt === "summative") {
    return <SummativeExamQuiz questions={questions} settings={settings} />;
  }
  return <ClassicQuiz questions={questions} settings={settings} isCompactView={isCompactView} />;
};

/* ---------------------------------------------------------------------- */
/* Summative exam-style quiz — proctored feel, navigator palette,          */
/* flag-for-review, locked feedback until submit, scorecard on completion. */
/* ---------------------------------------------------------------------- */

const formatClock = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const SummativeExamQuiz = ({ questions, settings }: { questions: QuizQuestion[]; settings?: QuizSettings }) => {
  const total = questions.length;
  const passCriteria = Math.max(1, Math.min(settings?.passCriteria ?? total, total));
  const revealMode: RevealMode = (settings?.revealAnswers as RevealMode) || "reveal_all";

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string[]>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [current, setCurrent] = useState(0);
  const [validated, setValidated] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [finalTime, setFinalTime] = useState<number | null>(null);

  // Elapsed timer (upward, exam feel). Stops on submit.
  useMemo(() => 0, []);
  // Use useEffect via a small inline hook alternative — but we already import useState/useMemo.
  // Add useEffect for timer:
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useTicker(!validated, () => setElapsed((e) => e + 1));

  const answeredCount = questions.reduce((acc, q, i) => {
    const sel = selectedAnswers[i] || [];
    const done = (q.type || "").toUpperCase() === "FIB" ? (sel[0] || "").trim().length > 0 : sel.length > 0;
    return acc + (done ? 1 : 0);
  }, 0);
  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  const unansweredCount = total - answeredCount;

  const correctCount = questions.filter((q, i) => isQuestionCorrect(q, selectedAnswers[i] || [])).length;
  const incorrectCount = total - correctCount - (validated ? 0 : 0);
  const accuracyPct = total === 0 ? 0 : Math.round((correctCount / total) * 100);
  const passed = correctCount >= passCriteria;

  const q = questions[current];
  const qType = (q?.type || "SCQ").toUpperCase();
  const isFIB = qType === "FIB";
  const isMCQ = qType === "MCQ";
  const options = q ? getOptions(q) : [];
  const selected = selectedAnswers[current] || [];

  const handleSelect = (option: string) => {
    if (validated) return;
    setSelectedAnswers((prev) => {
      const cur = prev[current] || [];
      if (isMCQ) {
        return { ...prev, [current]: cur.includes(option) ? cur.filter((o) => o !== option) : [...cur, option] };
      }
      return { ...prev, [current]: [option] };
    });
  };
  const handleFib = (value: string) => {
    if (validated) return;
    setSelectedAnswers((prev) => ({ ...prev, [current]: [value] }));
  };
  const toggleFlag = () => setFlagged((prev) => ({ ...prev, [current]: !prev[current] }));

  const goTo = (i: number) => {
    if (i < 0 || i >= total) return;
    setCurrent(i);
  };
  const jumpToFirstUnanswered = () => {
    const idx = questions.findIndex((qq, i) => {
      const sel = selectedAnswers[i] || [];
      return (qq.type || "").toUpperCase() === "FIB" ? (sel[0] || "").trim().length === 0 : sel.length === 0;
    });
    if (idx >= 0) {
      setCurrent(idx);
      setConfirmOpen(false);
    }
  };
  const handleSubmit = () => {
    setFinalTime(elapsed);
    setValidated(true);
    setConfirmOpen(false);
  };
  const handleRetry = () => {
    setSelectedAnswers({});
    setFlagged({});
    setCurrent(0);
    setValidated(false);
    setElapsed(0);
    setFinalTime(null);
  };

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
        No questions have been added yet.
      </div>
    );
  }

  // ------------------ Results scorecard ------------------
  if (validated) {
    const stats = [
      { label: "Correct", value: `${correctCount}`, icon: CheckCircle2, tone: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
      { label: "Incorrect", value: `${total - correctCount}`, icon: XCircle, tone: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950/30" },
      { label: "Accuracy", value: `${accuracyPct}%`, icon: Percent, tone: "text-primary", bg: "bg-primary/10" },
      { label: "Time", value: formatClock(finalTime ?? elapsed), icon: Timer, tone: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
    ];

    return (
      <div className="space-y-5">
        {/* Verdict banner */}
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border p-6",
            passed
              ? "border-emerald-500/30 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-cyan-950/30"
              : "border-rose-400/30 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 dark:from-rose-950/40 dark:via-orange-950/30 dark:to-amber-950/30"
          )}
        >
          <div className="flex items-center gap-5">
            <div
              className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg rotate-[-4deg]",
                passed ? "bg-emerald-600 text-white" : "bg-rose-500 text-white"
              )}
            >
              <Award className="w-10 h-10" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Summative Exam · Result
                </span>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    passed ? "bg-emerald-600 text-white" : "bg-rose-500 text-white"
                  )}
                >
                  {passed ? "Passed" : "Not passed"}
                </span>
              </div>
              <h3 className="text-2xl font-semibold text-foreground mt-1">
                {passed ? "You've cleared the exam." : "You didn't clear the exam."}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Score <span className="font-semibold text-foreground">{correctCount} / {total}</span> ·
                Pass mark <span className="font-semibold text-foreground">{passCriteria}</span> ·
                Time <span className="font-semibold text-foreground">{formatClock(finalTime ?? elapsed)}</span>
              </p>
            </div>
          </div>

          {/* Score progress bar */}
          <div className="mt-5">
            <div className="relative h-2.5 rounded-full bg-background/60 overflow-hidden">
              <div
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full transition-all duration-700",
                  passed ? "bg-emerald-500" : "bg-rose-500"
                )}
                style={{ width: `${accuracyPct}%` }}
              />
              {/* Pass mark tick */}
              <div
                className="absolute inset-y-[-4px] w-px bg-foreground/50"
                style={{ left: `${Math.round((passCriteria / total) * 100)}%` }}
                aria-hidden="true"
              />
            </div>
            <div className="flex justify-between text-[10px] font-medium text-muted-foreground mt-1.5">
              <span>0</span>
              <span>Pass mark {Math.round((passCriteria / total) * 100)}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div key={s.label} className={cn("rounded-xl border border-border/60 p-3.5 flex items-center gap-3", s.bg)}>
              <s.icon className={cn("w-5 h-5 flex-shrink-0", s.tone)} aria-hidden="true" />
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</div>
                <div className="text-lg font-semibold text-foreground tabular-nums leading-tight">{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Per-question review (compact) */}
        <div className="rounded-2xl border border-border/60 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/60 bg-muted/40 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-primary" aria-hidden="true" />
            <span className="text-sm font-semibold text-foreground">Answer sheet</span>
            <span className="ml-auto text-xs text-muted-foreground">{total} questions</span>
          </div>
          <ul className="divide-y divide-border/60">
            {questions.map((qq, qi) => {
              const sel = selectedAnswers[qi] || [];
              const correct = isQuestionCorrect(qq, sel);
              const correctAnswers = getAnswers(qq);
              const wasFlagged = !!flagged[qi];
              return (
                <li key={qi} className="px-4 py-3 flex items-start gap-3">
                  <span
                    className={cn(
                      "flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold",
                      correct ? "bg-emerald-600 text-white" : "bg-rose-500 text-white"
                    )}
                  >
                    {qi + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-relaxed">
                      {qq.question || qq.text}
                    </p>
                    {revealMode !== "hide_all" && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        <span>Your answer: </span>
                        <span className={cn("font-medium", correct ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400")}>
                          {sel.length ? sel.join(", ") : "— skipped —"}
                        </span>
                        {!correct && revealMode === "reveal_all" && correctAnswers.length > 0 && (
                          <>
                            <span> · Correct: </span>
                            <span className="font-medium text-emerald-700 dark:text-emerald-400">{correctAnswers.join(", ")}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {wasFlagged && <Flag className="w-3.5 h-3.5 text-amber-500" aria-label="Flagged" />}
                    {correct ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500" aria-hidden="true" />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleRetry} variant="outline" className="gap-2 rounded-full">
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Retake exam
          </Button>
        </div>
      </div>
    );
  }

  // ------------------ Active exam view ------------------
  const answeredPct = total === 0 ? 0 : Math.round((answeredCount / total) * 100);

  return (
    <div className="space-y-4">
      {/* Exam header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-white shadow-lg">
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_20%_20%,#fff_1px,transparent_1px)] [background-size:14px_14px]" aria-hidden="true" />
        <div className="relative px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">Summative Exam</div>
              <div className="text-sm font-semibold text-white">Final assessment · {total} questions</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <ExamStat icon={Target} label="Pass mark" value={`${passCriteria}/${total}`} />
            <ExamStat icon={ListChecks} label="Answered" value={`${answeredCount}/${total}`} />
            <ExamStat icon={Flag} label="Flagged" value={`${flaggedCount}`} accent />
          </div>
        </div>
        {/* Slim answered progress */}
        <div className="relative h-1 bg-white/10">
          <div
            className="absolute inset-y-0 left-0 bg-emerald-400/80 transition-all duration-500"
            style={{ width: `${answeredPct}%` }}
          />
        </div>
      </div>

      {/* Body: question + navigator */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-4">
        {/* Question panel */}
        <div className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 pt-5 pb-3 flex items-center gap-3 border-b border-border/60">
            <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold tabular-nums">
              {current + 1}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Question {current + 1} of {total}</span>
              {q?.type && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-[10px] font-bold text-foreground/80 tracking-wider">
                  {q.type}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={toggleFlag}
              aria-label={flagged[current] ? "Unflag question" : "Flag question for review"}
              aria-pressed={!!flagged[current]}
              className={cn(
                "ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                flagged[current]
                  ? "bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/40 dark:border-amber-700 dark:text-amber-300"
                  : "bg-background border-border/70 text-muted-foreground hover:text-foreground hover:border-amber-300"
              )}
            >
              <Flag className={cn("w-3.5 h-3.5", flagged[current] && "fill-amber-400 text-amber-500")} aria-hidden="true" />
              {flagged[current] ? "Flagged" : "Flag for review"}
            </button>
          </div>

          <div className="px-5 sm:px-6 py-5">
            <p className="text-base sm:text-lg font-medium text-foreground leading-relaxed mb-5">
              {q?.question || q?.text}
            </p>

            {isFIB ? (
              <div className="relative">
                <PencilLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" aria-hidden="true" />
                <Input
                  value={selected[0] || ""}
                  onChange={(e) => handleFib(e.target.value)}
                  placeholder="Type your answer..."
                  aria-label={`Answer for question ${current + 1}`}
                  className="h-12 rounded-xl bg-background border border-border pl-10 text-base"
                />
              </div>
            ) : (
              <div className="space-y-2.5">
                {options.map((opt, ai) => {
                  const isSelected = selected.includes(opt);
                  const letter = String.fromCharCode(65 + ai);
                  return (
                    <button
                      key={ai}
                      type="button"
                      onClick={() => handleSelect(opt)}
                      aria-pressed={isSelected}
                      className={cn(
                        "group w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left text-sm border transition-all",
                        isSelected
                          ? "border-primary bg-primary/[0.06] shadow-[0_4px_18px_-10px_hsl(var(--primary)/0.55)]"
                          : "border-border/70 bg-background hover:border-primary/40 hover:bg-muted/40"
                      )}
                    >
                      <span
                        className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold border-2 flex-shrink-0 transition-all",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-muted/40 text-muted-foreground group-hover:border-primary/40"
                        )}
                        aria-hidden="true"
                      >
                        {letter}
                      </span>
                      <span className={cn("flex-1 leading-relaxed", isSelected ? "font-medium text-foreground" : "text-foreground/85")}>
                        {opt}
                      </span>
                      {isMCQ && (
                        <span
                          className={cn(
                            "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0",
                            isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
                          )}
                          aria-hidden="true"
                        >
                          {isSelected && (
                            <svg className="w-3 h-3 text-primary-foreground" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M2.5 6l2.5 2.5 4.5-5" />
                            </svg>
                          )}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Locked feedback notice */}
            <div className="mt-5 flex items-start gap-2 text-[11px] text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 border border-border/60">
              <Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <span>Answers and feedback are hidden until you submit the exam.</span>
            </div>
          </div>

          {/* Nav footer */}
          <div className="px-5 sm:px-6 py-3.5 border-t border-border/60 bg-muted/25 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goTo(current - 1)}
              disabled={current === 0}
              className="gap-1.5 rounded-full"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              Previous
            </Button>

            {current < total - 1 ? (
              <Button
                size="sm"
                onClick={() => goTo(current + 1)}
                className="gap-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Next
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setConfirmOpen(true)}
                className="gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-600/90 text-white"
              >
                <FileCheck2 className="w-4 h-4" aria-hidden="true" />
                Submit exam
              </Button>
            )}
          </div>
        </div>

        {/* Question navigator palette */}
        <aside className="rounded-2xl border border-border/70 bg-card shadow-sm p-4 h-fit lg:sticky lg:top-4">
          <div className="flex items-center gap-2 mb-3">
            <LayoutGrid className="w-4 h-4 text-primary" aria-hidden="true" />
            <span className="text-xs font-semibold text-foreground">Question navigator</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {questions.map((qq, i) => {
              const sel = selectedAnswers[i] || [];
              const done = (qq.type || "").toUpperCase() === "FIB" ? (sel[0] || "").trim().length > 0 : sel.length > 0;
              const isCurrent = i === current;
              const isFlagged = !!flagged[i];
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to question ${i + 1}${done ? ", answered" : ", unanswered"}${isFlagged ? ", flagged" : ""}`}
                  aria-current={isCurrent ? "step" : undefined}
                  className={cn(
                    "relative h-9 rounded-lg text-xs font-semibold border transition-all tabular-nums",
                    isCurrent && "ring-2 ring-primary ring-offset-2 ring-offset-card",
                    done
                      ? "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600"
                      : "bg-background text-foreground border-border hover:border-primary/40"
                  )}
                >
                  {i + 1}
                  {isFlagged && (
                    <span
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-card"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 space-y-1.5 text-[11px]">
            <LegendDot color="bg-emerald-500" label={`Answered (${answeredCount})`} />
            <LegendDot color="bg-background border border-border" label={`Unanswered (${unansweredCount})`} />
            <LegendDot color="bg-amber-400" label={`Flagged (${flaggedCount})`} />
          </div>

          <div className="mt-4 pt-4 border-t border-border/60">
            <Button
              size="sm"
              onClick={() => setConfirmOpen(true)}
              className="w-full gap-2 rounded-full bg-emerald-600 hover:bg-emerald-600/90 text-white"
            >
              <FileCheck2 className="w-4 h-4" aria-hidden="true" />
              Submit exam
            </Button>
          </div>
        </aside>
      </div>

      {/* Submit confirmation */}
      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Submit exam confirmation"
          >
            <motion.div
              className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
              initial={{ y: 12, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 8, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                    unansweredCount > 0 ? "bg-amber-100 text-amber-600 dark:bg-amber-950/40" : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40"
                  )}>
                    {unansweredCount > 0 ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-foreground">Submit your exam?</h4>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {unansweredCount > 0
                        ? `You have ${unansweredCount} unanswered ${unansweredCount === 1 ? "question" : "questions"}${flaggedCount > 0 ? ` and ${flaggedCount} flagged for review` : ""}. Once submitted you can't change your answers.`
                        : `All ${total} questions are answered${flaggedCount > 0 ? `, with ${flaggedCount} flagged for review` : ""}. Once submitted you can't change your answers.`}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <MiniStat label="Answered" value={`${answeredCount}`} tone="emerald" />
                  <MiniStat label="Unanswered" value={`${unansweredCount}`} tone={unansweredCount > 0 ? "amber" : "muted"} />
                  <MiniStat label="Flagged" value={`${flaggedCount}`} tone={flaggedCount > 0 ? "primary" : "muted"} />
                </div>
              </div>
              <div className="px-6 py-3 bg-muted/40 border-t border-border/60 flex items-center justify-between gap-3">
                {unansweredCount > 0 ? (
                  <Button variant="ghost" size="sm" onClick={jumpToFirstUnanswered} className="rounded-full">
                    Review unanswered
                  </Button>
                ) : <span />}
                <div className="flex items-center gap-2 ml-auto">
                  <Button variant="outline" size="sm" onClick={() => setConfirmOpen(false)} className="rounded-full">
                    Keep editing
                  </Button>
                  <Button size="sm" onClick={handleSubmit} className="rounded-full bg-emerald-600 hover:bg-emerald-600/90 text-white gap-1.5">
                    <FileCheck2 className="w-4 h-4" aria-hidden="true" />
                    Submit exam
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Tiny hook for the exam clock without adding another top-level import block.
function useTicker(active: boolean, tick: () => void) {
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}

const ExamStat = ({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: boolean }) => (
  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/15">
    <Icon className={cn("w-3.5 h-3.5", accent ? "text-amber-300" : "text-white/80")} aria-hidden="true" />
    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60">{label}</span>
    <span className="text-xs font-semibold tabular-nums text-white">{value}</span>
  </div>
);

const LegendDot = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-2 text-muted-foreground">
    <span className={cn("w-3 h-3 rounded", color)} aria-hidden="true" />
    <span>{label}</span>
  </div>
);

const MiniStat = ({ label, value, tone }: { label: string; value: string; tone: "emerald" | "amber" | "primary" | "muted" }) => {
  const tones: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    primary: "bg-primary/10 text-primary",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <div className={cn("rounded-lg py-2", tones[tone])}>
      <div className="text-lg font-semibold tabular-nums leading-none">{value}</div>
      <div className="text-[10px] font-medium uppercase tracking-wider mt-1 opacity-80">{label}</div>
    </div>
  );
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
            className="h-full rounded-full bg-primary"
          />
        </div>
      </div>

      {/* Stacked card deck */}
      <div className="relative [perspective:1600px]">
        {/* Depth layers — cinematic live shuffle each step */}
        {total > 3 && (
          <motion.div
            key={`layer-3-${current}`}
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl bg-card border border-border/60"
            initial={{ x: 26, y: 26, rotate: 3, opacity: 0, scale: 0.9 }}
            animate={{ x: 20, y: 20, rotate: 2.4, opacity: 0.32, scale: 0.91 }}
            transition={{ type: "spring", stiffness: 160, damping: 28, delay: 0.08 }}
            style={{ zIndex: 0, transformOrigin: "50% 100%", filter: "blur(0.5px)" }}
          />
        )}
        {total > 2 && (
          <motion.div
            key={`layer-2-${current}`}
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl bg-card border border-border/70 shadow-[0_6px_20px_-12px_hsl(var(--foreground)/0.15)]"
            initial={{ x: 20, y: 20, rotate: 2.4, opacity: 0.32, scale: 0.91 }}
            animate={{ x: 13, y: 13, rotate: 1.6, opacity: 0.55, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 170, damping: 26, delay: 0.05 }}
            style={{ zIndex: 1, transformOrigin: "50% 100%" }}
          />
        )}
        {total > 1 && (
          <motion.div
            key={`layer-1-${current}`}
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl bg-card border border-border/80 shadow-[0_10px_30px_-18px_hsl(var(--foreground)/0.2)]"
            initial={{ x: 13, y: 13, rotate: 1.6, opacity: 0.55, scale: 0.94 }}
            animate={{ x: 6, y: 6, rotate: 0.75, opacity: 0.85, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 180, damping: 26, delay: 0.02 }}
            style={{ zIndex: 2, transformOrigin: "50% 100%" }}
          />
        )}

        {/* Main card */}
        <div className="relative z-10 rounded-2xl border border-border/70 bg-card shadow-[0_1px_0_hsl(var(--border)),0_20px_60px_-28px_hsl(var(--foreground)/0.28)] overflow-hidden">
          {/* Thin premium grey accent strip */}
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-accent z-20" />

          <div className="relative p-6 sm:p-8">
          <AnimatePresence mode="popLayout" custom={direction} initial={false}>
            <motion.div
              key={current}
              custom={direction}
              initial={{
                opacity: 0,
                x: 13,
                y: 13,
                scale: 0.94,
                rotate: 1.6,
                filter: "blur(6px)",
              }}
              animate={{
                opacity: 1,
                x: 0,
                y: 0,
                scale: 1,
                rotate: 0,
                filter: "blur(0px)",
                transition: {
                  type: "spring",
                  stiffness: 200,
                  damping: 26,
                  mass: 0.9,
                  delay: 0.18,
                  filter: { duration: 0.5, delay: 0.18, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              exit={{
                opacity: 0,
                x: direction * 640,
                y: -80,
                rotate: direction * 22,
                scale: 0.9,
                filter: "blur(3px)",
                transition: { duration: 0.65, ease: [0.32, 0.72, 0.25, 1] },
              }}
              style={{ transformOrigin: "50% 110%", willChange: "transform, opacity, filter" }}
            >
              {/* Header row */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    aria-hidden="true"
                    className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-semibold tabular-nums shadow-[0_2px_8px_-2px_hsl(var(--primary)/0.4)] ring-2 ring-primary/10"
                  >
                    {String(current + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground leading-tight">
                      Question {current + 1} <span className="text-muted-foreground font-medium">of {total}</span>
                    </p>
                  </div>
                </div>

                <span
                  className={cn(
                    "flex-shrink-0 inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold border shadow-sm",
                    qType === "MCQ" && "bg-blue-50/80 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800",
                    qType === "SCQ" && "bg-emerald-50/80 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800",
                    qType === "FIB" && "bg-amber-50/80 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800",
                    qType === "TF" && "bg-violet-50/80 border-violet-200 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300 dark:border-violet-800",
                    !["MCQ", "SCQ", "FIB", "TF"].includes(qType) && "bg-muted/60 border-border/70 text-foreground/80"
                  )}
                  aria-label={`Question type: ${typeLabel}`}
                >
                  {qType === "MCQ" && <ListChecks className="w-3 h-3" aria-hidden="true" />}
                  {qType === "SCQ" && <CircleCheck className="w-3 h-3" aria-hidden="true" />}
                  {qType === "FIB" && <PencilLine className="w-3 h-3" aria-hidden="true" />}
                  {qType === "TF" && <ToggleLeft className="w-3 h-3" aria-hidden="true" />}
                  {typeLabel}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-semibold text-foreground leading-snug tracking-tight">
                {q.question || q.text}
              </h3>

              {isMCQ && (
                <p className="mt-2 text-xs text-muted-foreground">Select all that apply</p>
              )}

              {/* Options */}
              <div className="mt-6">
                {isFIB ? (
                  <div className="rounded-xl border border-border/80 bg-muted/30 p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 text-primary">
                        <PencilLine className="w-3.5 h-3.5" aria-hidden="true" />
                      </span>
                      <label
                        htmlFor={`fib-${current}`}
                        className="text-xs font-semibold text-foreground"
                      >
                        Your answer
                      </label>
                    </div>
                    <div className="relative flex items-center">
                      <Input
                        id={`fib-${current}`}
                        value={selected[0] || ""}
                        onChange={(e) => handleFib(e.target.value)}
                        placeholder="Type your answer here..."
                        aria-label={`Answer for question ${current + 1}`}
                        className="h-12 rounded-xl bg-background border border-border pl-11 text-base shadow-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                      />
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70">
                        <PencilLine className="w-4 h-4" aria-hidden="true" />
                      </span>
                    </div>
                    
                  </div>
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
                className="gap-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20"
              >
                Submit
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              </Button>
            )}
          </div>
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
