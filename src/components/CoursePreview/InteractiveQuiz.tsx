import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, RotateCcw, Lock, Info, ChevronLeft, ChevronRight, ChevronDown, Sparkles, ListChecks, CircleCheck, Circle, PencilLine, ToggleLeft, Flag, ShieldCheck, FileCheck2, AlertTriangle, LayoutGrid, Award, Target, Percent, Timer, User } from "lucide-react";
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
  passMessage?: string;
  failMessage?: string;
}

export const DEFAULT_PASS_MESSAGE =
  "Congratulations! You have successfully completed this course.";
export const DEFAULT_FAIL_MESSAGE =
  "You did not meet the passing criteria. Please review the content and try again.";


interface InteractiveQuizProps {
  questions: QuizQuestion[];
  settings?: QuizSettings;
  isCompactView?: boolean;
  isMobilePreview?: boolean;
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

export const InteractiveQuiz = ({ questions, settings, isCompactView, isMobilePreview }: InteractiveQuizProps) => {
  const qt = (settings?.quizType || "").toLowerCase();
  if (qt === "formative") {
    return <FormativeCardQuiz questions={questions} settings={settings} />;
  }
  if (qt === "summative") {
    return <SummativeExamQuiz questions={questions} settings={settings} isCompactView={isCompactView} isMobilePreview={isMobilePreview} />;
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

const SummativeExamQuiz = ({ questions, settings, isCompactView, isMobilePreview }: { questions: QuizQuestion[]; settings?: QuizSettings; isCompactView?: boolean; isMobilePreview?: boolean }) => {
  const total = questions.length;
  const passCriteria = Math.max(1, Math.min(settings?.passCriteria ?? total, total));
  const revealMode: RevealMode = (settings?.revealAnswers as RevealMode) || "reveal_all";

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string[]>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [current, setCurrent] = useState(0);
  const [validated, setValidated] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
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
    const scoreRingSize = isMobilePreview ? 76 : 112;
    const scoreRingRadius = isMobilePreview ? 32 : 48;
    const stroke = isMobilePreview ? 6 : 7;
    const circumference = 2 * Math.PI * scoreRingRadius;
    const scoreOffset = circumference - (accuracyPct / 100) * circumference;
    const passPct = Math.round((passCriteria / total) * 100);

    const stats = [
      { label: "Correct", value: `${correctCount}`, icon: CheckCircle2, tone: "text-success", bg: "bg-success/10" },
      { label: "Incorrect", value: `${total - correctCount}`, icon: XCircle, tone: "text-destructive", bg: "bg-destructive/10" },
      { label: "Accuracy", value: `${accuracyPct}%`, icon: Percent, tone: "text-primary", bg: "bg-primary/10" },
    ];

    return (
      <div className={cn("space-y-5", isMobilePreview && "space-y-3")}>
        {/* Verdict card */}
        <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
          <div className={cn("p-5 sm:p-6", isMobilePreview && "p-3")}>
            <div
              className={cn(
                isMobilePreview
                  ? "flex flex-col items-stretch gap-4 w-full"
                  : "flex flex-col sm:flex-row items-stretch gap-5 sm:gap-6"
              )}
            >
              {/* Header row (mobile): status pill + label, right-aligned ring */}
              {isMobilePreview && (
                <div className="flex items-center justify-between gap-3 w-full">
                  <div className="min-w-0 flex flex-col gap-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Summative Exam · Result
                    </span>
                    <span
                      className={cn(
                        "self-start px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        passed
                          ? "bg-success text-success-foreground"
                          : "bg-destructive text-destructive-foreground"
                      )}
                    >
                      {passed ? "Passed" : "Not passed"}
                    </span>
                  </div>
                  <div className="relative flex-shrink-0 w-[76px] h-[76px]">
                    <svg
                      width={scoreRingSize}
                      height={scoreRingSize}
                      viewBox={`0 0 ${scoreRingSize} ${scoreRingSize}`}
                      className="rotate-[-90deg]"
                      aria-hidden="true"
                    >
                      <circle
                        cx={scoreRingSize / 2}
                        cy={scoreRingSize / 2}
                        r={scoreRingRadius}
                        stroke="currentColor"
                        strokeWidth={stroke}
                        fill="transparent"
                        className="text-muted/40"
                      />
                      <circle
                        cx={scoreRingSize / 2}
                        cy={scoreRingSize / 2}
                        r={scoreRingRadius}
                        stroke="currentColor"
                        strokeWidth={stroke}
                        fill="transparent"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={scoreOffset}
                        className={cn("transition-all duration-700", passed ? "text-success" : "text-destructive")}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-base font-semibold text-foreground tabular-nums leading-none">{accuracyPct}%</span>
                      <span className="text-[8px] font-medium uppercase tracking-wide text-muted-foreground mt-0.5">Accuracy</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Score ring (desktop/tablet) */}
              {!isMobilePreview && (
                <div className="relative flex-shrink-0 w-28 h-28 self-center sm:self-auto">
                  <svg
                    width={scoreRingSize}
                    height={scoreRingSize}
                    viewBox={`0 0 ${scoreRingSize} ${scoreRingSize}`}
                    className="rotate-[-90deg]"
                    aria-hidden="true"
                  >
                    <circle
                      cx={scoreRingSize / 2}
                      cy={scoreRingSize / 2}
                      r={scoreRingRadius}
                      stroke="currentColor"
                      strokeWidth={stroke}
                      fill="transparent"
                      className="text-muted/40"
                    />
                    <circle
                      cx={scoreRingSize / 2}
                      cy={scoreRingSize / 2}
                      r={scoreRingRadius}
                      stroke="currentColor"
                      strokeWidth={stroke}
                      fill="transparent"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={scoreOffset}
                      className={cn("transition-all duration-700", passed ? "text-success" : "text-destructive")}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-semibold text-foreground tabular-nums leading-none">{accuracyPct}%</span>
                    <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground mt-0.5">Accuracy</span>
                  </div>
                </div>
              )}

              {/* Verdict + mini score */}
              <div className={cn("flex-1 min-w-0 flex flex-col justify-between gap-4", isMobilePreview && "gap-3 w-full")}>
                {!isMobilePreview && (
                  <div className="text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Summative Exam · Result
                      </span>
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          passed
                            ? "bg-success text-success-foreground"
                            : "bg-destructive text-destructive-foreground"
                        )}
                      >
                        {passed ? "Passed" : "Not passed"}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-foreground">
                      {passed ? "You've cleared the exam." : "You didn't clear the exam."}
                    </h3>
                    <p className={cn("text-sm text-foreground mt-2 leading-relaxed [overflow-wrap:anywhere]", passed ? "text-success/90" : "text-destructive/90")}>
                      {passed
                        ? (settings?.passMessage || DEFAULT_PASS_MESSAGE)
                        : (settings?.failMessage || DEFAULT_FAIL_MESSAGE)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Score <span className="font-semibold text-foreground">{correctCount}/{total}</span>
                      <span aria-hidden="true"> · </span>
                      <span className="whitespace-nowrap">Pass mark <span className="font-semibold text-foreground">{passCriteria}</span></span>
                    </p>
                  </div>
                )}

                {isMobilePreview && (
                  <div className="w-full">
                    <h3 className="text-base font-semibold text-foreground leading-snug">
                      {passed ? "You've cleared the exam." : "You didn't clear the exam."}
                    </h3>
                    <p className={cn("text-xs text-foreground mt-1.5 leading-relaxed [overflow-wrap:anywhere]", passed ? "text-success/90" : "text-destructive/90")}>
                      {passed
                        ? (settings?.passMessage || DEFAULT_PASS_MESSAGE)
                        : (settings?.failMessage || DEFAULT_FAIL_MESSAGE)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Score <span className="font-semibold text-foreground">{correctCount}/{total}</span>
                      <span aria-hidden="true"> · </span>
                      Pass mark <span className="font-semibold text-foreground">{passCriteria}</span>
                    </p>
                  </div>
                )}

                {/* Score progress bar */}
                <div className="w-full">
                  <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-full transition-all duration-700",
                        passed ? "bg-success" : "bg-destructive"
                      )}
                      style={{ width: `${accuracyPct}%` }}
                    />
                    <div
                      className="absolute inset-y-[-3px] w-px bg-foreground/40"
                      style={{ left: `${passPct}%` }}
                      aria-hidden="true"
                    />
                  </div>
                  <div className={cn("flex justify-between text-[10px] font-medium text-muted-foreground mt-1.5", isMobilePreview && "text-[9px]")}>
                    <span>0</span>
                    <span>Pass mark {passPct}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Mini score tiles */}
              <div
                className={cn(
                  isMobilePreview
                    ? "w-full grid grid-cols-2 gap-2 border-t border-border/60 pt-3"
                    : "flex sm:flex-col items-stretch justify-center gap-3 sm:w-36 border-t sm:border-t-0 sm:border-l border-border/60 pt-4 sm:pt-0 sm:pl-6"
                )}
              >
                <div className={cn("flex-1 rounded-2xl bg-success/10 border border-success/20 p-3.5 text-center shadow-subtle", isMobilePreview && "p-2.5 rounded-lg")}>
                  <div className={cn("text-[10px] font-semibold uppercase tracking-wider text-success", isMobilePreview && "text-[9px] tracking-wide")}>Score</div>
                  <div className={cn("text-xl font-bold text-foreground tabular-nums mt-0.5", isMobilePreview && "text-sm")}>{correctCount}/{total}</div>
                </div>
                <div className={cn("flex-1 rounded-2xl bg-muted border border-border/60 p-3.5 text-center", isMobilePreview && "p-2.5 rounded-lg")}>
                  <div className={cn("text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", isMobilePreview && "text-[9px] tracking-wide")}>Pass mark</div>
                  <div className={cn("text-xl font-bold text-foreground tabular-nums mt-0.5", isMobilePreview && "text-sm")}>{passCriteria}</div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Stats grid */}
        <div className={cn("grid grid-cols-3 gap-3", isMobilePreview && "gap-2")}>
          {stats.map((s) => (
            <div
              key={s.label}
              className={cn(
                "rounded-2xl border border-border/60 bg-card p-3.5 flex items-center gap-3 shadow-subtle",
                isMobilePreview && "rounded-xl p-2 flex-col items-center justify-center gap-1 text-center min-w-0",
                s.bg
              )}
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-background border border-border/60", isMobilePreview && "w-7 h-7 rounded-md", s.tone)}>
                <s.icon className={cn("w-4 h-4", isMobilePreview && "w-3.5 h-3.5")} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className={cn("text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", isMobilePreview && "text-[9px] tracking-wide leading-tight")}>{s.label}</div>
                <div className={cn("text-lg font-bold text-foreground tabular-nums leading-tight", isMobilePreview && "text-sm")}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Per-question review */}
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border/60 bg-muted/40 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-primary" aria-hidden="true" />
            <span className="text-sm font-semibold text-foreground">Answer sheet</span>
            <span className="ml-auto text-xs text-muted-foreground">{total} questions</span>
          </div>
          <ul className="divide-y divide-border/60" aria-label="Per-question answer review">
            {questions.map((qq, qi) => {
              const sel = selectedAnswers[qi] || [];
              const correct = isQuestionCorrect(qq, sel);
              const correctAnswers = getAnswers(qq);
              const wasFlagged = !!flagged[qi];
              const skipped = sel.length === 0;
              const statusLabel = correct ? "Correct" : skipped ? "Skipped" : "Incorrect";
              return (
                <li key={qi} className="px-3 sm:px-4 py-2.5">
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <span
                      className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold bg-muted border border-border text-foreground shadow-sm"
                      aria-label={`Question ${qi + 1}`}
                    >
                      {qi + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-foreground leading-snug">
                          <span className="sr-only">Question {qi + 1}, {statusLabel}. </span>
                          {qq.question || qq.text}
                        </p>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {wasFlagged && (
                            <span
                              className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-warning/10 border border-warning/30 text-warning"
                              aria-label="Flagged for review"
                              title="Flagged for review"
                            >
                              <Flag className="w-3.5 h-3.5" aria-hidden="true" />
                            </span>
                          )}
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-1.5 h-6 rounded-md text-[11px] font-semibold border",
                              correct
                                ? "bg-success/10 border-success/30 text-success"
                                : "bg-destructive/10 border-destructive/30 text-destructive"
                            )}
                            aria-label={statusLabel}
                          >
                            {correct ? (
                              <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                            ) : (
                              <XCircle className="w-3 h-3" aria-hidden="true" />
                            )}
                            <span>{statusLabel}</span>
                          </span>
                        </div>
                      </div>
                      {revealMode !== "hide_all" && (
                        <div className="mt-2.5 space-y-1.5">
                          {/* Your answer — primary, always shown */}
                          <div
                            className={cn(
                              "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs",
                              correct
                                ? "border-success/30 bg-success/5"
                                : skipped
                                ? "border-border bg-muted/30"
                                : "border-destructive/30 bg-destructive/5"
                            )}
                          >
                            <span
                              className={cn(
                                "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center",
                                correct
                                  ? "bg-success text-success-foreground"
                                  : skipped
                                  ? "bg-muted-foreground/20 text-muted-foreground"
                                  : "bg-destructive text-destructive-foreground"
                              )}
                            >
                              {correct ? (
                                <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                              ) : skipped ? (
                                <User className="w-3 h-3" aria-hidden="true" />
                              ) : (
                                <XCircle className="w-3 h-3" aria-hidden="true" />
                              )}
                            </span>
                            <span className="font-medium text-foreground flex-shrink-0">
                              Your answer:
                            </span>
                            <span
                              className={cn(
                                "font-medium break-words",
                                skipped ? "text-muted-foreground italic" : "text-foreground"
                              )}
                            >
                              {skipped ? "Not answered" : sel.join(", ")}
                            </span>
                          </div>

                          {/* Correct answer — only when wrong or skipped, styled as secondary */}
                          {revealMode === "reveal_all" && correctAnswers.length > 0 && !correct && (
                            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-2.5 py-1.5 text-xs">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground">
                                <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                              </span>
                              <span className="font-medium text-muted-foreground flex-shrink-0">
                                Correct answer:
                              </span>
                              <span className="font-medium text-foreground break-words">
                                {correctAnswers.join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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
    <div className={cn("space-y-4", isCompactView && "relative")}>
      {/* Exam header */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-border/70 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-white shadow-lg">
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_20%_20%,#fff_1px,transparent_1px)] [background-size:14px_14px]" aria-hidden="true" />
        {!isCompactView ? (
          <div className="relative px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">Summative Exam</div>
                <div className="text-sm font-semibold text-white truncate">Final assessment · {total} questions</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ExamStat icon={Target} label="Pass mark" value={`${passCriteria}/${total}`} />
              <ExamStat icon={ListChecks} label="Answered" value={`${answeredCount}/${total}`} />
              <ExamStat icon={Flag} label="Flagged" value={`${flaggedCount}`} accent />
            </div>
          </div>
        ) : (
          <div className="relative px-3 py-2.5 space-y-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-white" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/60 leading-tight">Summative Exam</div>
                <div className="text-[11px] font-semibold text-white truncate leading-tight">Final assessment · {total} Qs</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <div className="flex flex-col items-center justify-center px-1 py-1.5 rounded-md bg-white/10 backdrop-blur border border-white/15">
                <div className="flex items-center gap-1 text-white/60">
                  <Target className="w-2.5 h-2.5" aria-hidden="true" />
                  <span className="text-[8px] font-semibold uppercase tracking-wider">Pass</span>
                </div>
                <span className="text-[11px] font-semibold tabular-nums text-white leading-tight">{passCriteria}/{total}</span>
              </div>
              <div className="flex flex-col items-center justify-center px-1 py-1.5 rounded-md bg-white/10 backdrop-blur border border-white/15">
                <div className="flex items-center gap-1 text-white/60">
                  <ListChecks className="w-2.5 h-2.5" aria-hidden="true" />
                  <span className="text-[8px] font-semibold uppercase tracking-wider">Done</span>
                </div>
                <span className="text-[11px] font-semibold tabular-nums text-white leading-tight">{answeredCount}/{total}</span>
              </div>
              <div className="flex flex-col items-center justify-center px-1 py-1.5 rounded-md bg-white/10 backdrop-blur border border-white/15">
                <div className="flex items-center gap-1 text-amber-300">
                  <Flag className="w-2.5 h-2.5" aria-hidden="true" />
                  <span className="text-[8px] font-semibold uppercase tracking-wider">Flags</span>
                </div>
                <span className="text-[11px] font-semibold tabular-nums text-white leading-tight">{flaggedCount}</span>
              </div>
            </div>
          </div>
        )}


        {/* Slim answered progress */}
        <div className="relative h-1 bg-white/10">
          <div
            className="absolute inset-y-0 left-0 bg-emerald-400/80 transition-all duration-500"
            style={{ width: `${answeredPct}%` }}
          />
        </div>
      </div>

      {/* Body: question + navigator */}
      <div className={cn("grid grid-cols-1 gap-3 sm:gap-4", !isCompactView && "lg:grid-cols-[minmax(0,1fr)_260px]")}>
        {/* Question panel */}
        <div className="rounded-xl sm:rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden flex flex-col">
          {/* Header ribbon */}
          <div className="flex items-stretch border-b border-border/60">
            {/* Left number block */}
            <div className={cn("flex items-center bg-primary/[0.06] border-r border-border/60", isCompactView ? "gap-1.5 px-2.5 py-2" : "gap-3 px-6 py-4")}>
              <span className={cn("font-semibold text-primary tabular-nums leading-none", isCompactView ? "text-lg" : "text-[2rem]")}>
                {String(current + 1).padStart(2, "0")}
              </span>
              {!isCompactView && (
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Question</span>
                  <span className="text-[11px] text-muted-foreground/80 tabular-nums">of {String(total).padStart(2, "0")}</span>
                </div>
              )}
            </div>

            {/* Right meta */}
            <div className={cn("flex-1 min-w-0 flex items-center justify-between gap-2", isCompactView ? "px-2.5 py-2" : "px-6 py-4 gap-3")}>
              {q?.type && (
                <span className={cn("inline-flex items-center rounded-md bg-muted font-bold text-foreground/75 tracking-wider min-w-0", isCompactView ? "gap-1 px-1.5 py-0.5 text-[9px] max-w-[40%]" : "gap-1.5 px-2.5 py-1 text-[10px]")}>
                  <span className={cn("rounded-full bg-primary flex-shrink-0", isCompactView ? "w-1 h-1" : "w-1.5 h-1.5")} aria-hidden="true" />
                  <span className="truncate">{q.type}</span>
                </span>
              )}
              <button
                type="button"
                onClick={toggleFlag}
                aria-label={flagged[current] ? "Unflag question" : "Flag question for review"}
                aria-pressed={!!flagged[current]}
                className={cn(
                  "inline-flex items-center rounded-full font-medium border transition-all flex-shrink-0",
                  isCompactView ? "gap-1 px-2 py-1 text-[10px]" : "gap-1.5 px-3 py-1.5 text-xs",
                  flagged[current]
                    ? "bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/40 dark:border-amber-700 dark:text-amber-300"
                    : "bg-background border-border/70 text-muted-foreground hover:text-foreground hover:border-amber-300"
                )}
              >
                <Flag className={cn(isCompactView ? "w-3 h-3" : "w-3.5 h-3.5", flagged[current] && "fill-amber-400 text-amber-500")} aria-hidden="true" />
                <span>{flagged[current] ? "Flagged" : isCompactView ? "Flag" : "Flag for review"}</span>
              </button>
            </div>

          </div>


          {/* Body */}
          <div className="flex-1 px-2.5 sm:px-7 py-3 sm:py-6">
            <p className="text-base sm:text-xl font-semibold text-foreground leading-relaxed mb-4 sm:mb-7 break-words border-l-2 border-primary pl-3 sm:pl-4 py-1">
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
                  className="h-10 sm:h-12 rounded-xl bg-background border border-border pl-10 text-sm sm:text-base"
                />
              </div>
            ) : (
              <div className="space-y-1.5 sm:space-y-2">
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
                        "group relative w-full flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 pr-3 sm:pr-4 py-2 sm:py-3 rounded-lg text-left text-xs sm:text-sm border transition-all",
                        isSelected
                          ? "border-primary/60 bg-primary/[0.05]"
                          : "border-border/70 bg-background hover:border-primary/40 hover:bg-muted/30"
                      )}
                    >
                      <span
                        className={cn(
                          "flex items-center justify-center w-5 h-5 sm:w-7 sm:h-7 rounded-md text-[9px] sm:text-[11px] font-semibold flex-shrink-0 transition-all",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
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
                            "w-4 h-4 sm:w-5 sm:h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0",
                            isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
                          )}
                          aria-hidden="true"
                        >
                          {isSelected && (
                            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
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

          </div>

          {/* Nav footer */}
          <div className="px-2.5 sm:px-7 py-2 sm:py-3.5 border-t border-border/60 bg-muted/25 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goTo(current - 1)}
              disabled={current === 0}
              className="gap-1 rounded-full h-8 sm:h-9 text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
              Previous
            </Button>

            {current < total - 1 ? (
              <Button
                size="sm"
                onClick={() => goTo(current + 1)}
                className="gap-1 rounded-full h-8 sm:h-9 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setConfirmOpen(true)}
                className="gap-1 rounded-full h-8 sm:h-9 text-xs bg-emerald-600 hover:bg-emerald-600/90 text-white"
              >
                <FileCheck2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                Submit exam
              </Button>
            )}
          </div>
        </div>

        {/* Question navigator palette */}
        <aside className={cn("rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-lg p-4 sm:p-5 h-fit flex flex-col gap-3 sm:gap-5", !isCompactView && "lg:sticky lg:top-4")}>
          {/* Header (also toggles body on mobile) */}
          <button
            type="button"
            onClick={() => setNavOpen((v) => !v)}
            aria-expanded={navOpen}
            aria-controls="summative-nav-body"
            className={cn("flex items-center justify-between gap-2 text-left", !isCompactView && "lg:cursor-default lg:pointer-events-none")}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center">
                <LayoutGrid className="w-4 h-4 text-primary" aria-hidden="true" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-foreground leading-tight truncate">Question map</span>
                <span className="text-[11px] text-muted-foreground leading-tight truncate">
                  {answeredCount} / {total} answered
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border tabular-nums">
                {total}
              </span>
              <ChevronDown
                className={cn("w-4 h-4 text-muted-foreground transition-transform", !isCompactView && "lg:hidden", navOpen && "rotate-180")}
                aria-hidden="true"
              />
            </div>
          </button>

          <div
            id="summative-nav-body"
            className={cn("flex-col gap-4 sm:gap-5", navOpen ? "flex" : "hidden", !isCompactView && "lg:flex")}
          >


          {/* Status summary — compact inline rows */}
          <div className="rounded-xl border border-border bg-card/50 p-3 shadow-sm space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
              <span className="text-[10px] font-medium text-muted-foreground tabular-nums">{answeredCount} / {total} answered</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2 rounded-lg bg-emerald-50 px-2 py-1.5 dark:bg-emerald-950/30">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  <CircleCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  Answered
                </span>
                <span className="text-xs font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">{answeredCount}</span>
              </div>

              <div className="flex items-center justify-between gap-2 rounded-lg bg-muted px-2 py-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Circle className="w-3.5 h-3.5" aria-hidden="true" />
                  Pending
                </span>
                <span className="text-xs font-semibold tabular-nums text-foreground">{unansweredCount}</span>
              </div>

              <div className="flex items-center justify-between gap-2 rounded-lg bg-amber-50 px-2 py-1.5 dark:bg-amber-950/30">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                  <Flag className="w-3.5 h-3.5" aria-hidden="true" />
                  Flagged
                </span>
                <span className="text-xs font-semibold tabular-nums text-amber-700 dark:text-amber-300">{flaggedCount}</span>
              </div>
            </div>
          </div>

          {/* Question grid */}
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
                    "relative h-9 w-full rounded-lg text-sm font-semibold transition-all duration-200 tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                    isCurrent
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 ring-1 ring-primary/30"
                      : done
                      ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm"
                      : isFlagged
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60"
                      : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/50"
                  )}
                >
                  {i + 1}
                  {isFlagged && !isCurrent && (
                    <span
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-card"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend — icon chips, full labels always visible */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CircleCheck className="w-3.5 h-3.5" aria-hidden="true" />
              Answered
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <Circle className="w-3.5 h-3.5" aria-hidden="true" />
              Unanswered
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              <Flag className="w-3.5 h-3.5" aria-hidden="true" />
              Flagged
            </span>
          </div>

          </div>
        </aside>
      </div>

      {/* Submit confirmation */}
      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            className={cn(
              "z-50 flex bg-foreground/40 backdrop-blur-sm",
              isCompactView
                ? "absolute inset-0 items-end justify-stretch"
                : "fixed inset-0 items-center justify-center p-4"
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Submit exam confirmation"
          >
            <motion.div
              className={cn(
                "bg-card border border-border shadow-2xl overflow-hidden",
                isCompactView
                  ? "w-full rounded-t-2xl border-b-0"
                  : "w-full max-w-xl rounded-2xl"
              )}
              initial={isCompactView ? { y: "100%", opacity: 1 } : { y: 12, opacity: 0, scale: 0.98 }}
              animate={isCompactView ? { y: 0, opacity: 1 } : { y: 0, opacity: 1, scale: 1 }}
              exit={isCompactView ? { y: "100%", opacity: 1 } : { y: 8, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              {isCompactView && (
                <div className="flex justify-center pt-2 pb-1" aria-hidden="true">
                  <div className="h-1 w-10 rounded-full bg-border" />
                </div>
              )}
              <div className={cn(isCompactView ? "p-4" : "p-6")}>
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                    unansweredCount > 0 ? "bg-amber-100 text-amber-600 dark:bg-amber-950/40" : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40"
                  )}>
                    {unansweredCount > 0 ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-base font-semibold text-foreground">Submit your exam?</h4>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {unansweredCount > 0
                        ? `You have ${unansweredCount} unanswered ${unansweredCount === 1 ? "question" : "questions"}${flaggedCount > 0 ? ` and ${flaggedCount} flagged for review` : ""}. Once submitted you can't change your answers.`
                        : `All ${total} questions are answered${flaggedCount > 0 ? `, with ${flaggedCount} flagged for review` : ""}. Once submitted you can't change your answers.`}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50 px-2 py-3 dark:bg-emerald-950/30 dark:border-emerald-900/40">
                    <CircleCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{answeredCount}</span>
                    <span className="text-[10px] font-medium text-emerald-700/80 dark:text-emerald-300/80">Answered</span>
                  </div>

                  <div className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3",
                    unansweredCount > 0
                      ? "border-amber-100 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/40"
                      : "border-border bg-muted"
                  )}>
                    <Circle className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    <span className={cn("text-sm font-semibold", unansweredCount > 0 ? "text-amber-700 dark:text-amber-300" : "text-foreground")}>{unansweredCount}</span>
                    <span className={cn("text-[10px] font-medium", unansweredCount > 0 ? "text-amber-700/80 dark:text-amber-300/80" : "text-muted-foreground")}>Unanswered</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 rounded-xl border border-amber-100 bg-amber-50 px-2 py-3 dark:bg-amber-950/30 dark:border-amber-900/40">
                    <Flag className="w-4 h-4 text-amber-600" aria-hidden="true" />
                    <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">{flaggedCount}</span>
                    <span className="text-[10px] font-medium text-amber-700/80 dark:text-amber-300/80">Flagged</span>
                  </div>
                </div>
              </div>
              <div className={cn(
                "bg-muted/40 border-t border-border/60 flex flex-col gap-2",
                isCompactView ? "px-4 py-3" : "px-6 py-3 sm:flex-row sm:items-center sm:justify-end"
              )}>
                {unansweredCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={jumpToFirstUnanswered} className="rounded-full w-full sm:w-auto">
                    Review unanswered
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setConfirmOpen(false)} className="rounded-full w-full sm:w-auto">
                  Keep editing
                </Button>
                <Button size="sm" onClick={handleSubmit} className="rounded-full bg-emerald-600 hover:bg-emerald-600/90 text-white gap-1.5 w-full sm:w-auto">
                  <FileCheck2 className="w-4 h-4" aria-hidden="true" />
                  Submit exam
                </Button>
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
  <div className="flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/15">
    <Icon className={cn("w-2.5 h-2.5 sm:w-3.5 sm:h-3.5", accent ? "text-amber-300" : "text-white/80")} aria-hidden="true" />
    <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-wider text-white/60">{label}</span>
    <span className="text-[10px] sm:text-xs font-semibold tabular-nums text-white">{value}</span>
  </div>
);

const LegendDot = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-2 text-muted-foreground">
    <span className={cn("w-3 h-3 rounded", color)} aria-hidden="true" />
    <span>{label}</span>
  </div>
);

const MiniStat = ({ label, value, tone, icon: Icon }: { label: string; value: string; tone: "emerald" | "amber" | "primary" | "muted"; icon?: React.ElementType }) => {
  const tones: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/40",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-100 dark:border-amber-900/40",
    primary: "bg-primary/10 text-primary border-primary/20",
    muted: "bg-muted text-muted-foreground border-border",
  };
  return (
    <div className={cn("rounded-xl border px-2 py-2 flex items-center gap-1.5 min-w-0", tones[tone])}>
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0 opacity-70" aria-hidden="true" />}
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-semibold tabular-nums leading-none">{value}</span>
        <span className="text-[10px] font-medium leading-tight mt-0.5 opacity-75 truncate">{label}</span>
      </div>
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
          message={passed
            ? (settings?.passMessage || DEFAULT_PASS_MESSAGE)
            : (settings?.failMessage || DEFAULT_FAIL_MESSAGE)}
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
  message,
}: {
  correct: number;
  total: number;
  passed: boolean;
  passCriteria: number;
  message?: string;
}) => {
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card text-center p-6 sm:p-8",
        passed
          ? "border-success/30"
          : "border-destructive/30"
      )}
    >
      {/* Top accent strip */}
      <div
        className={cn("absolute inset-x-0 top-0 h-1", passed ? "bg-success" : "bg-destructive")}
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center gap-4">
        {/* Large status icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center shadow-lg",
            passed ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"
          )}
        >
          {passed ? (
            <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
          ) : (
            <XCircle className="w-8 h-8" aria-hidden="true" />
          )}
        </motion.div>

        {/* Verdict + message */}
        <div className="max-w-xl space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Quiz complete
          </p>
          <h3 className="text-2xl font-semibold text-foreground">
            {passed ? "You passed!" : "Keep going"}
          </h3>
          {message && (
            <p className={cn(
              "text-base leading-relaxed [overflow-wrap:anywhere]",
              passed ? "text-foreground" : "text-foreground/90"
            )}>
              {message}
            </p>
          )}
        </div>

        {/* Compact score pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground tabular-nums">{correct}/{total}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{pct}%</span>
          <span aria-hidden="true">·</span>
          <span>Pass mark {passCriteria}</span>
        </div>
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
