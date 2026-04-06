import { useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuizQuestion {
  question?: string;
  text?: string;
  type?: string;
  options?: string[];
  answers?: any[];
  answer?: string;
  explanation?: string;
}

interface InteractiveQuizProps {
  questions: QuizQuestion[];
  isCompactView?: boolean;
}

export const InteractiveQuiz = ({ questions }: InteractiveQuizProps) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string[]>>({});
  const [validated, setValidated] = useState(false);

  const getOptions = (q: QuizQuestion): string[] =>
    q.options || (q.answers?.map((a: any) => (typeof a === "string" ? a : a.text)) ?? []);

  const getAnswer = (q: QuizQuestion): string => q.answer || "";

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

  const handleValidate = () => setValidated(true);

  const handleRetry = () => {
    setSelectedAnswers({});
    setValidated(false);
  };

  const totalQuestions = questions.length;
  const correctCount = validated
    ? questions.filter((q, i) => {
        const selected = selectedAnswers[i] || [];
        const answer = getAnswer(q);
        return selected.length === 1 && selected[0] === answer;
      }).length
    : 0;

  const allAnswered = questions.every((_, i) => (selectedAnswers[i]?.length ?? 0) > 0);

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => {
        const questionText = q.question || q.text || "";
        const options = getOptions(q);
        const answer = getAnswer(q);
        const isMCQ = q.type === "MCQ";
        const selected = selectedAnswers[qi] || [];
        const isCorrect = selected.length === 1 && selected[0] === answer;

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
            <div className="space-y-2">
              {options.map((opt, ai) => {
                const isSelected = selected.includes(opt);
                const isAnswer = opt === answer;

                let optionStyle = "bg-background border border-border/40 cursor-pointer hover:border-primary/40 hover:bg-primary/5";
                if (isSelected && !validated) {
                  optionStyle = "bg-primary/10 border-2 border-primary/40 cursor-pointer";
                }
                if (validated) {
                  if (isAnswer) {
                    optionStyle = "bg-green-50 dark:bg-green-950/30 border-2 border-green-500/50";
                  } else if (isSelected && !isAnswer) {
                    optionStyle = "bg-red-50 dark:bg-red-950/30 border-2 border-red-400/50";
                  } else {
                    optionStyle = "bg-background border border-border/40 opacity-60";
                  }
                }

                return (
                  <div
                    key={ai}
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
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/40"
                        )}
                      >
                        {isSelected && (
                          <svg className="w-3.5 h-3.5 text-primary-foreground" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M2.5 6l2.5 2.5 4.5-5" />
                          </svg>
                        )}
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-border"
                        )}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                      </div>
                    )}
                    <span className={cn("text-[0.9rem] leading-relaxed", isSelected ? "font-semibold text-foreground" : "text-foreground/80")}>
                      {opt}
                    </span>
                    {validated && isAnswer && (
                      <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto flex-shrink-0" />
                    )}
                    {validated && isSelected && !isAnswer && (
                      <XCircle className="w-4 h-4 text-red-500 ml-auto flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Show explanation only after validation */}
            {validated && q.explanation && (
              <div className="mt-3 bg-primary/5 border border-primary/20 rounded-lg p-3 animate-in fade-in-50 duration-200">
                <p className="text-xs font-semibold text-primary mb-1">Explanation:</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{q.explanation}</p>
              </div>
            )}
          </div>
        );
      })}

      {/* Score & Actions */}
      <div className="flex items-center gap-3 pt-2">
        {!validated ? (
          <Button
            onClick={handleValidate}
            disabled={!allAnswered}
            className="bg-primary hover:bg-primary/90"
          >
            Submit Quiz
          </Button>
        ) : (
          <>
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm",
              correctCount === totalQuestions
                ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
            )}>
              {correctCount === totalQuestions ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : null}
              Score: {correctCount}/{totalQuestions}
            </div>
            <Button variant="outline" size="sm" onClick={handleRetry} className="gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" />
              Retry
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
