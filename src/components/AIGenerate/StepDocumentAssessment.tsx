import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import {
  Minus,
  Plus,
  HelpCircle,
  GraduationCap,
  ClipboardCheck,
} from "lucide-react";
import type { DocumentPreferencesValue } from "./StepDocumentPreferences";

interface Props {
  state: Partial<DocumentPreferencesValue>;
  onChange: (partial: Partial<DocumentPreferencesValue>) => void;
}

const QUESTION_TYPES = [
  { key: "singleChoice" as const, label: "Single Choice" },
  { key: "multipleChoice" as const, label: "Multiple Choice" },
  { key: "trueFalse" as const, label: "True / False" },
  { key: "fillInBlank" as const, label: "Fill in Blank" },
];

function PrefCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5", className)}>{children}</div>
  );
}

function SectionHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-4">
      <div className="text-[16px] font-semibold text-foreground leading-tight">{title}</div>
      {desc && <p className="text-[13px] text-muted-foreground mt-1">{desc}</p>}
    </div>
  );
}

export function StepDocumentAssessment({ state, onChange }: Props) {
  const value = {
    questionsPerPage: state.questionsPerPage ?? 3,
    questionTypes: state.questionTypes ?? {
      singleChoice: 1,
      multipleChoice: 1,
      trueFalse: 1,
      fillInBlank: 0,
    },
    contentPreferences: state.contentPreferences ?? {
      includeQuestions: true,
      interactiveBlocks: true,
      addImages: true,
    },
    quizConfig: state.quizConfig ?? {
      formative: { enabled: true, questionsPerQuiz: 5 },
      summative: { enabled: false, questionsPerQuiz: 10 },
    },
  };

  const toggleQuestions = () =>
    onChange({
      contentPreferences: {
        ...value.contentPreferences,
        includeQuestions: !value.contentPreferences.includeQuestions,
      },
    });
  const decQpp = () => onChange({ questionsPerPage: Math.max(1, value.questionsPerPage - 1) });
  const incQpp = () => onChange({ questionsPerPage: Math.min(10, value.questionsPerPage + 1) });

  return (
    <div className="space-y-4">
      {/* Assessment preferences */}
      <PrefCard>
        <SectionHeader
          title="Assessment preferences"
          desc="Control whether each page includes questions and how many."
        />
        <div
          className={cn(
            "rounded-2xl border transition-all duration-200 p-3.5",
            value.contentPreferences.includeQuestions
              ? "border-primary/50 bg-gradient-to-br from-primary/[0.06] to-primary/[0.02]"
              : "border-border bg-background hover:border-primary/30 hover:bg-muted/30"
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={toggleQuestions}
              role="switch"
              aria-checked={value.contentPreferences.includeQuestions}
              aria-label="Include questions in pages"
              className="flex items-center gap-3 text-left flex-1 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
            >
              <span
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                  value.contentPreferences.includeQuestions
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
                aria-hidden="true"
              >
                <HelpCircle className="w-4 h-4" aria-hidden="true" focusable="false" />
              </span>
              <span className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-foreground leading-tight">Questions</span>
                <span className="text-[12px] text-muted-foreground leading-snug mt-0.5">
                  Include questions in pages
                </span>
              </span>
            </button>
            <div className="flex items-center gap-3">
              {value.contentPreferences.includeQuestions && (
                <div className="hidden sm:flex items-center gap-2 pr-2 border-r border-border/60">
                  <span className="text-xs font-medium text-muted-foreground">Per page</span>
                  <button
                    type="button"
                    onClick={decQpp}
                    disabled={value.questionsPerPage <= 1}
                    aria-label="Decrease questions per page"
                    className="w-7 h-7 rounded-full border border-primary/30 bg-primary/5 flex items-center justify-center hover:bg-primary/10 transition-colors disabled:opacity-30"
                  >
                    <Minus className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
                  </button>
                  <span className="text-sm font-semibold text-foreground tabular-nums w-5 text-center">
                    {value.questionsPerPage}
                  </span>
                  <button
                    type="button"
                    onClick={incQpp}
                    disabled={value.questionsPerPage >= 10}
                    aria-label="Increase questions per page"
                    className="w-7 h-7 rounded-full border border-primary/30 bg-primary/5 flex items-center justify-center hover:bg-primary/10 transition-colors disabled:opacity-30"
                  >
                    <Plus className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={toggleQuestions}
                role="switch"
                aria-checked={value.contentPreferences.includeQuestions}
                aria-label="Toggle include questions in pages"
                className={cn(
                  "w-10 h-6 rounded-full relative transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  value.contentPreferences.includeQuestions ? "bg-primary" : "bg-muted-foreground/25"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-background shadow-sm transition-transform",
                    value.contentPreferences.includeQuestions && "translate-x-4"
                  )}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          {value.contentPreferences.includeQuestions && (
            <div className="mt-4 pt-4 border-t border-primary/15">
              <div className="mb-3">
                <div className="text-[14px] font-semibold text-foreground leading-tight">
                  Number of questions
                </div>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  Set how many of each question type to include per page.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {QUESTION_TYPES.map((q) => {
                  const id = `doc-qtype-${q.key}`;
                  return (
                    <div key={q.key} className="space-y-1.5">
                      <label
                        htmlFor={id}
                        className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide block"
                      >
                        {q.label}
                      </label>
                      <select
                        id={id}
                        value={value.questionTypes[q.key]}
                        onChange={(e) =>
                          onChange({
                            questionTypes: {
                              ...value.questionTypes,
                              [q.key]: Number(e.target.value),
                            },
                          })
                        }
                        aria-label={`${q.label} count`}
                        className="w-full h-9 rounded-lg border border-border bg-white text-sm font-medium text-foreground px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors hover:border-primary/50"
                      >
                        {[0, 1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </PrefCard>

      {/* Quiz Configuration */}
      <PrefCard>
        <SectionHeader
          title="Quiz configuration"
          desc="Enable formative and summative quizzes, and set how many questions each should include."
        />
        <div className="space-y-3">
          {([
            {
              key: "formative" as const,
              title: "Formative quiz",
              description: "Low-stakes check-ins woven into the learning flow.",
              icon: GraduationCap,
              min: 1,
              max: 20,
            },
            {
              key: "summative" as const,
              title: "Summative quiz",
              description: "End-of-course assessment to evaluate mastery.",
              icon: ClipboardCheck,
              min: 1,
              max: 50,
            },
          ]).map(({ key, title, description, icon: Icon, min, max }) => {
            const cfg = value.quizConfig[key];
            const update = (partial: Partial<typeof cfg>) =>
              onChange({
                quizConfig: {
                  ...value.quizConfig,
                  [key]: { ...cfg, ...partial },
                },
              });
            const toggle = () => update({ enabled: !cfg.enabled });
            const setCount = (n: number) =>
              update({ questionsPerQuiz: Math.max(min, Math.min(max, n)) });
            const inputId = `quiz-${key}-count`;
            return (
              <div
                key={key}
                className={cn(
                  "rounded-2xl border transition-all duration-200 p-4",
                  cfg.enabled
                    ? "border-primary/50 bg-gradient-to-br from-primary/[0.06] to-primary/[0.02]"
                    : "border-border bg-background hover:border-primary/30 hover:bg-muted/30"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={toggle}
                    role="switch"
                    aria-checked={cfg.enabled}
                    aria-label={`Toggle ${title}`}
                    className="flex items-center gap-3 text-left flex-1 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
                  >
                    <span
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                        cfg.enabled
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                      aria-hidden="true"
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" focusable="false" />
                    </span>
                    <span className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-foreground leading-tight">
                        {title}
                      </span>
                      <span className="text-[12px] text-muted-foreground leading-snug mt-0.5">
                        {description}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={toggle}
                    role="switch"
                    aria-checked={cfg.enabled}
                    aria-label={`Switch ${title}`}
                    className={cn(
                      "w-10 h-6 rounded-full relative transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      cfg.enabled ? "bg-primary" : "bg-muted-foreground/25"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-background shadow-sm transition-transform",
                        cfg.enabled && "translate-x-4"
                      )}
                      aria-hidden="true"
                    />
                  </button>
                </div>

                {cfg.enabled && (
                  <div className="mt-4 pt-4 border-t border-primary/15">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <label
                        htmlFor={inputId}
                        className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide"
                      >
                        Questions per quiz
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCount(cfg.questionsPerQuiz - 1)}
                          disabled={cfg.questionsPerQuiz <= min}
                          aria-label={`Decrease questions for ${title}`}
                          className="w-7 h-7 rounded-full border border-primary/30 bg-primary/5 flex items-center justify-center hover:bg-primary/10 transition-colors disabled:opacity-30"
                        >
                          <Minus className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
                        </button>
                        <input
                          id={inputId}
                          type="number"
                          min={min}
                          max={max}
                          value={cfg.questionsPerQuiz}
                          onChange={(e) => setCount(Number(e.target.value) || min)}
                          aria-label={`${title} questions per quiz`}
                          className="w-14 h-8 rounded-lg border border-border bg-white text-center text-sm font-semibold text-foreground tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:border-primary/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => setCount(cfg.questionsPerQuiz + 1)}
                          disabled={cfg.questionsPerQuiz >= max}
                          aria-label={`Increase questions for ${title}`}
                          className="w-7 h-7 rounded-full border border-primary/30 bg-primary/5 flex items-center justify-center hover:bg-primary/10 transition-colors disabled:opacity-30"
                        >
                          <Plus className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
                        </button>
                      </div>
                    </div>
                    <Slider
                      value={[cfg.questionsPerQuiz]}
                      min={min}
                      max={max}
                      step={1}
                      onValueChange={(v) => setCount(v[0])}
                      aria-label={`${title} questions per quiz slider`}
                      className="py-1"
                    />
                    <div className="flex justify-between mt-1.5">
                      <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
                        {min}
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
                        {max}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </PrefCard>
    </div>
  );
}
