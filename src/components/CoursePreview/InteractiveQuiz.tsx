import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, RotateCcw, Lock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

export const InteractiveQuiz = ({ questions, settings }: InteractiveQuizProps) => {
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

        // Reveal styling rules
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

                      {/* Per-choice rationale (by_choice mode) — visible after submit for the selected option */}
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

            {/* Feedback / Explanation block after validation */}
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
                // Per-option rationales render inline above; nothing extra here
                return null;
              }

              // Default "any" mode → single Explanation
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

      {/* Score, gating & actions */}
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
