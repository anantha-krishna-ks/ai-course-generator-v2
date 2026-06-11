import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

      {/* Quiz Configuration — Section & Course scopes */}
      {(["course", "section"] as const).map((scope) => {
        const isSection = scope === "section";
        const typeKey = isSection ? "sectionQuizType" : "courseQuizType";
        const configKey = isSection ? "quizConfig" : "courseQuizConfig";
        const defaultScopeConfig = isSection
          ? {
              formative: { ...value.quizConfig.formative, enabled: false },
              summative: { ...value.quizConfig.summative, enabled: false },
            }
          : value.quizConfig;
        const scopeConfig = ((state as any)[configKey] as typeof value.quizConfig) ?? defaultScopeConfig;
        const cardTitle = isSection ? "Section quiz" : "Course quiz";
        const scopeBadge = isSection ? "Applies to every section" : "One per course";
        const offHelp = isSection
          ? "Turn on to add an assessment to every section. Pick a quiz type and tune the question mix."
          : "Turn on to add a single assessment for the whole course. Pick a quiz type and tune the question mix.";
        const mixScopeLabel = isSection ? "· per section" : "· whole course";
        const toggleAria = isSection ? "Toggle section quiz" : "Toggle course quiz";

        const QUIZ_VARIANTS = {
          formative: {
            title: "Formative quiz",
            subtitle: "Low-stakes check-ins during learning",
            description: isSection
              ? "Low-stakes check-ins woven into the learning flow to reinforce concepts as learners progress."
              : "Low-stakes check-ins woven into the learning flow. Unscored or lightly scored, instant feedback.",
            icon: GraduationCap,
            badge: "In-flow",
            badgeHue: "212 90% 40%",
            perTypeMax: 8,
          },
          summative: {
            title: "Summative quiz",
            subtitle: isSection ? "Graded end-of-section assessment" : "Graded end-of-course assessment",
            description: isSection
              ? "End-of-section assessment that evaluates mastery of the material covered."
              : "Single end-of-course assessment that evaluates overall mastery.",
            icon: ClipboardCheck,
            badge: "Graded",
            badgeHue: "262 70% 45%",
            perTypeMax: 15,
          },
        } as const;
        type QuizVariantKey = keyof typeof QUIZ_VARIANTS;
        const activeType: QuizVariantKey = ((state as any)[typeKey] as QuizVariantKey) ?? "formative";
        const variant = QUIZ_VARIANTS[activeType];
        const cfg = scopeConfig[activeType];
        const ActiveIcon = variant.icon;


        const update = (partial: Partial<typeof cfg>) =>
          onChange({
            [configKey]: {
              ...scopeConfig,
              [activeType]: { ...cfg, ...partial },
            },
          } as Partial<DocumentPreferencesValue>);



        // Master quiz toggle drives both variants in sync
        const masterEnabled = scopeConfig.formative.enabled || scopeConfig.summative.enabled;
        const toggleMaster = () => {
          const next = !masterEnabled;
          onChange({
            [configKey]: {
              formative: { ...scopeConfig.formative, enabled: next && activeType === "formative" },
              summative: { ...scopeConfig.summative, enabled: next && activeType === "summative" },
            },
          } as Partial<DocumentPreferencesValue>);
        };
        const setActiveType = (t: QuizVariantKey) => {
          const wasOn = masterEnabled;
          onChange({
            [typeKey]: t,
            [configKey]: {
              formative: { ...scopeConfig.formative, enabled: wasOn && t === "formative" },
              summative: { ...scopeConfig.summative, enabled: wasOn && t === "summative" },
            },
          } as Partial<DocumentPreferencesValue>);
        };

        return (
          <PrefCard key={scope}>

            {/* Master header row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <span
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                    masterEnabled ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                  )}
                  aria-hidden="true"
                >
                  <ActiveIcon className="w-4 h-4" aria-hidden="true" focusable="false" />
                </span>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[16px] font-semibold text-foreground leading-tight">
                      {cardTitle}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary ring-1 ring-inset ring-primary/25">
                      {scopeBadge}
                    </span>
                  </div>
                  <p className="text-[13px] text-muted-foreground mt-1 leading-snug">
                    {masterEnabled ? variant.description : offHelp}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleMaster}
                role="switch"
                aria-checked={masterEnabled}
                aria-label={toggleAria}

                className={cn(
                  "w-11 h-6 rounded-full relative transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  masterEnabled ? "bg-primary" : "bg-muted-foreground/25"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-background shadow-sm transition-transform",
                    masterEnabled && "translate-x-5"
                  )}
                  aria-hidden="true"
                />
              </button>
            </div>

            <div
              className={cn(
                "grid transition-[grid-template-rows,opacity,margin] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                masterEnabled ? "grid-rows-[1fr] opacity-100 mt-0" : "grid-rows-[0fr] opacity-0 -mt-1"
              )}
              aria-hidden={!masterEnabled}
            >
              <div
                className={cn(
                  "overflow-hidden transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform",
                  masterEnabled ? "translate-y-0" : "-translate-y-1"
                )}
              >

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
                      const selected = activeType === k;
                      return (
                        <button
                          key={k}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => setActiveType(k)}
                          className={cn(
                            "group relative flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            selected
                              ? "border-primary bg-primary/[0.04] ring-1 ring-primary/40 shadow-[0_2px_10px_-4px_hsl(var(--primary)/0.25)]"
                              : "border-border bg-background hover:border-primary/30 hover:bg-muted/30"
                          )}
                        >
                          {/* Icon tile */}
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

                          {/* Text */}
                          <span className="flex flex-col min-w-0 flex-1">
                            <span
                              className={cn(
                                "text-[14px] font-semibold leading-tight transition-colors",
                                selected ? "text-foreground" : "text-foreground"
                              )}
                            >
                              {v.title.replace(" quiz", "")}
                            </span>
                            <span className="text-[12px] text-muted-foreground leading-snug mt-0.5 truncate">
                              {v.subtitle}
                            </span>
                          </span>

                          {/* Radio dot */}
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


                {/* Question mix */}
                {(() => {
                  const perTypeMax = variant.perTypeMax;
                  const types = cfg.questionTypes ?? { singleChoice: 0, multipleChoice: 0, trueFalse: 0, fillInBlank: 0 };
                  const total = QUESTION_TYPES.reduce((s, q) => s + (types[q.key] || 0), 0);
                  const setType = (k: QTypeKey, n: number) =>
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
                  return (
                    <div className="mt-5 pt-5 border-t border-border">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div>
                          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Question mix <span className="text-muted-foreground/70 normal-case font-medium tracking-normal">{mixScopeLabel}</span>
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
                          const Icon = q.icon;
                          const active = n > 0;
                          return (
                            <div
                              key={q.key}
                              className={cn(
                                "group relative flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5 transition-all"
                              )}
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
                                  type="button"
                                  onClick={() => setType(q.key, n - 1)}
                                  disabled={n <= 0}
                                  aria-label={`Decrease ${q.label} for ${variant.title}`}
                                  className="w-7 h-7 rounded-full border border-border bg-background flex items-center justify-center hover:border-primary/50 hover:bg-primary/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <Minus className="w-3.5 h-3.5 text-foreground" aria-hidden="true" focusable="false" />
                                </button>
                                <span
                                  className="text-base font-bold tabular-nums w-6 text-center transition-colors"
                                  style={{ color: active ? `hsl(${q.hue})` : "hsl(var(--muted-foreground))" }}
                                  aria-live="polite"
                                  aria-label={`${n} ${q.label} questions`}
                                >
                                  {n}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setType(q.key, n + 1)}
                                  disabled={n >= perTypeMax}
                                  aria-label={`Increase ${q.label} for ${variant.title}`}
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
            </div>

          </PrefCard>
        );
      })}


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
