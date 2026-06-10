import { cn } from "@/lib/utils";

import {
  Minus,
  Plus,
  
  GraduationCap,
  ClipboardCheck,
  Sliders,
  ChevronDown,
  CircleDot,
  ListChecks,
  ToggleRight,
  PenLine,
  type LucideIcon,
} from "lucide-react";
import type { DocumentPreferencesValue } from "./StepDocumentPreferences";
import { ScormPreferencesContent } from "@/components/EditCourse/ScormPreferencesDialog";

interface Props {
  state: Partial<DocumentPreferencesValue>;
  onChange: (partial: Partial<DocumentPreferencesValue>) => void;
}

type QTypeKey = "singleChoice" | "multipleChoice" | "trueFalse" | "fillInBlank";

const QUESTION_TYPES: { key: QTypeKey; label: string; icon: LucideIcon; hue: string; barHue: string }[] = [
  { key: "singleChoice", label: "Single Choice", icon: CircleDot, hue: "212 90% 40%", barHue: "211 100% 50%" },
  { key: "multipleChoice", label: "Multiple Choice", icon: ListChecks, hue: "262 60% 45%", barHue: "262 83% 58%" },
  { key: "trueFalse", label: "True / False", icon: ToggleRight, hue: "160 84% 28%", barHue: "160 84% 39%" },
  { key: "fillInBlank", label: "Fill in Blank", icon: PenLine, hue: "25 90% 38%", barHue: "32 95% 53%" },
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
  const defaultMix = { singleChoice: 2, multipleChoice: 1, trueFalse: 1, fillInBlank: 1 };
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
      formative: { enabled: true, questionsPerQuiz: 5, questionTypes: { ...defaultMix } },
      summative: { enabled: false, questionsPerQuiz: 10, questionTypes: { ...defaultMix, singleChoice: 4, multipleChoice: 3, trueFalse: 2, fillInBlank: 1 } },
    },
  };




  return (
    <div className="space-y-4">

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
          ]).map(({ key, title, description, icon: Icon }) => {
            const cfg = value.quizConfig[key];
            const update = (partial: Partial<typeof cfg>) =>
              onChange({
                quizConfig: {
                  ...value.quizConfig,
                  [key]: { ...cfg, ...partial },
                },
              });
            const toggle = () => update({ enabled: !cfg.enabled });
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

                {cfg.enabled && (() => {
                  const perTypeMax = key === "formative" ? 8 : 15;
                  const types = cfg.questionTypes ?? { singleChoice: 0, multipleChoice: 0, trueFalse: 0, fillInBlank: 0 };
                  const total = QUESTION_TYPES.reduce((s, q) => s + (types[q.key] || 0), 0);
                  const setType = (k: typeof QUESTION_TYPES[number]["key"], n: number) =>
                    update({
                      questionTypes: { ...types, [k]: Math.max(0, Math.min(perTypeMax, n)) },
                      questionsPerQuiz: Math.max(
                        1,
                        QUESTION_TYPES.reduce(
                          (s, q) => s + (q.key === k ? Math.max(0, Math.min(perTypeMax, n)) : types[q.key] || 0),
                          0
                        )
                      ),
                    } as any);
                  // Per-type color lookup
                  const hueOf = (k: QTypeKey) =>
                    QUESTION_TYPES.find((q) => q.key === k)?.hue ?? "211 100% 50%";
                  return (
                    <div className="mt-4 pt-4 border-t border-primary/15">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div>
                          <div className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">
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

                      {/* Premium proportional mix bar */}
                      {total > 0 && (
                        <div className="mb-4">
                          <TooltipProvider delayDuration={100}>
                            <div
                              className="relative flex h-3 w-full overflow-hidden rounded-full bg-muted/40 ring-1 ring-border/60 shadow-[inset_0_1px_2px_hsl(var(--foreground)/0.06)]"
                            >
                              {QUESTION_TYPES.map((q, i) => {
                                const n = types[q.key] || 0;
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
                                        aria-label={`${q.label}: ${n} ${n === 1 ? "question" : "questions"} (${Math.round(pct)}%)`}
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

                      <div className="grid grid-cols-2 gap-2.5">
                        {QUESTION_TYPES.map((q) => {
                          const n = types[q.key] || 0;
                          const decId = `${key}-${q.key}-dec`;
                          const incId = `${key}-${q.key}-inc`;
                          const Icon = q.icon;
                          const active = n > 0;
                          return (
                            <div
                              key={q.key}
                              className={cn(
                                "group relative flex items-center justify-between gap-3 rounded-2xl border bg-background px-4 py-3.5 transition-all",
                                active
                                  ? ""
                                  : "border-border hover:border-primary/30"
                              )}
                              style={
                                active
                                  ? {
                                      backgroundImage: `linear-gradient(135deg, hsl(${q.hue} / 0.06), hsl(${q.hue} / 0.02))`,
                                      borderColor: `hsl(${q.hue} / 0.5)`,
                                    }
                                  : undefined
                              }
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span
                                  className={cn(
                                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all",
                                  )}
                                  style={
                                    active
                                      ? {
                                          backgroundColor: `hsl(${q.hue} / 0.15)`,
                                          color: `hsl(${q.hue})`,
                                          boxShadow: `inset 0 0 0 1px hsl(${q.hue} / 0.3)`,
                                        }
                                      : { backgroundColor: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }
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
                                  id={decId}
                                  type="button"
                                  onClick={() => setType(q.key, n - 1)}
                                  disabled={n <= 0}
                                  aria-label={`Decrease ${q.label} for ${title}`}
                                  className="w-7 h-7 rounded-full border border-border bg-background flex items-center justify-center hover:border-primary/50 hover:bg-primary/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <Minus className="w-3.5 h-3.5 text-foreground" aria-hidden="true" focusable="false" />
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
                                  id={incId}
                                  type="button"
                                  onClick={() => setType(q.key, n + 1)}
                                  disabled={n >= perTypeMax}
                                  aria-label={`Increase ${q.label} for ${title}`}
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
                  );
                })()}
              </div>
            );
          })}
        </div>
      </PrefCard>

      {/* SCORM Preferences (optional) */}
      <PrefCard className="p-0 overflow-hidden">
        <button
          type="button"
          onClick={() =>
            onChange({
              scormPreferencesEnabled: !((state as any).scormPreferencesEnabled ?? false),
            } as Partial<DocumentPreferencesValue>)
          }
          aria-expanded={(state as any).scormPreferencesEnabled ?? false}
          aria-controls="scorm-prefs-panel"
          className="w-full flex items-center gap-3 p-5 text-left hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/20 shrink-0">
            <Sliders className="h-4 w-4 text-primary" aria-hidden="true" focusable="false" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-[16px] font-semibold text-foreground leading-tight">
                SCORM preferences
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                Optional
              </span>
            </div>
            <p className="text-[13px] text-muted-foreground mt-1">
              Configure how the generated package behaves inside an LMS.
            </p>
          </div>
          <ChevronDown
            className={cn(
              "w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200",
              ((state as any).scormPreferencesEnabled ?? false) && "rotate-180"
            )}
            aria-hidden="true"
            focusable="false"
          />
        </button>
        {((state as any).scormPreferencesEnabled ?? false) && (
          <div id="scorm-prefs-panel" className="px-5 pb-5 border-t border-border">
            <div className="pt-5">
              <ScormPreferencesContent showHeader={false} />
            </div>
          </div>
        )}
      </PrefCard>
    </div>
  );
}
