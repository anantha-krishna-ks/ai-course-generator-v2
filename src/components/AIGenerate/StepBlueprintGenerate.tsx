import { AIGenerateState, QuizScopeConfig, QuizVariantConfig } from "@/pages/AIGenerateCourse";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import {
  Check,
  HelpCircle,
  Image as ImageIcon,
  MessageSquare,
  BookOpen,
  Minus,
  Plus,
  Upload,
  X,
  FileText,
  Sliders,
  CheckCircle2,
  XCircle,
  Info,
  GraduationCap,
  ClipboardCheck,
  CircleDot,
  ListChecks,
  ToggleRight,
  PenLine,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import scormPlaceholder from "@/assets/scorm-placeholder.jpg";
import imgStylePhoto from "@/assets/image-style-photorealistic.jpg";
import imgStyleIllustration from "@/assets/image-style-illustration.jpg";
import imgStyleFlat from "@/assets/image-style-flat.jpg";
import imgStyle3d from "@/assets/image-style-3d.jpg";
import imgStyleSketch from "@/assets/image-style-sketch.jpg";
import imgStyleWatercolor from "@/assets/image-style-watercolor.jpg";
import { FONT_OPTIONS, getFontStack } from "@/components/CourseCreation/FontSelectorDropdown";

interface StepBlueprintGenerateProps {
  state: AIGenerateState;
  onChange: (partial: Partial<AIGenerateState>) => void;
  errors?: Record<string, string>;
}

const TONE_OPTIONS = [
  { value: "ai-determined" as const, label: "AI Determined", icon: "🎯" },
  { value: "professional" as const, label: "Professional", icon: "💼" },
  { value: "conversational" as const, label: "Conversational", icon: "💬" },
  { value: "coaching" as const, label: "Coaching", icon: "🎓" },
];

const IMAGE_STYLE_OPTIONS = [
  { value: "photorealistic" as const, label: "Photorealistic", preview: imgStylePhoto },
  { value: "illustration" as const, label: "Illustration", preview: imgStyleIllustration },
  { value: "flat" as const, label: "Flat / Minimal", preview: imgStyleFlat },
  { value: "3d" as const, label: "3D Render", preview: imgStyle3d },
  { value: "sketch" as const, label: "Sketch", preview: imgStyleSketch },
  { value: "watercolor" as const, label: "Watercolor", preview: imgStyleWatercolor },
];

function SectionHeader({ title }: { icon?: LucideIcon; title: string; desc?: string }) {
  return (
    <div className="mb-2.5">
      <div className="text-[16px] font-semibold text-foreground leading-tight">{title}</div>
    </div>
  );
}

function ImageToggleTile({
  selected,
  onToggle,
  title,
  description,
  ariaLabel,
}: {
  selected: boolean;
  onToggle: () => void;
  title: string;
  description: string;
  ariaLabel: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-200 p-4",
        selected
          ? "border-primary/50 bg-gradient-to-br from-primary/[0.06] to-primary/[0.02]"
          : "border-border bg-background hover:border-primary/30 hover:bg-muted/30"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onToggle}
          role="switch"
          aria-checked={selected}
          aria-label={ariaLabel}
          className="flex items-center gap-3 text-left flex-1 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
        >
          <span
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
              selected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
            )}
            aria-hidden="true"
          >
            <ImageIcon className="w-4 h-4" aria-hidden="true" focusable="false" />
          </span>
          <span className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-foreground leading-tight">{title}</span>
            <span className="text-[12px] text-muted-foreground leading-snug mt-0.5">{description}</span>
          </span>
        </button>
        <button
          type="button"
          onClick={onToggle}
          role="switch"
          aria-checked={selected}
          aria-label={`Toggle ${ariaLabel}`}
          className={cn(
            "w-10 h-6 rounded-full relative transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            selected ? "bg-primary" : "bg-muted-foreground/25"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-background shadow-sm transition-transform",
              selected && "translate-x-4"
            )}
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}

function PrefCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      {children}
    </div>
  );
}

function Stepper({
  value,
  onChange,
  min = 1,
  max = 60,
  unit,
  ariaLabel,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  unit?: string;
  ariaLabel: string;
}) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background p-1">
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        className="w-7 h-7 rounded-full border border-border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary disabled:opacity-40 flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
        aria-label={`Decrease ${ariaLabel}`}
      >
        <Minus className="w-3 h-3" aria-hidden="true" focusable="false" />
      </button>
      <div className="px-2 min-w-[58px] text-center">
        <span className="text-sm font-bold text-foreground tabular-nums">{value}</span>
        {unit && <span className="text-[11px] text-muted-foreground ml-1">{unit}</span>}
      </div>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        className="w-7 h-7 rounded-full border border-border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary disabled:opacity-40 flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
        aria-label={`Increase ${ariaLabel}`}
      >
        <Plus className="w-3 h-3" aria-hidden="true" focusable="false" />
      </button>
    </div>
  );
}

function Chip({
  selected,
  onClick,
  ariaLabel,
  children,
  ariaPressed,
}: {
  selected: boolean;
  onClick: () => void;
  ariaLabel?: string;
  ariaPressed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ariaPressed}
      aria-label={ariaLabel}
      className={cn(
        "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function DocUploadZone({
  documents,
  onDocumentsChange,
  ariaLabel,
}: {
  documents: string[];
  onDocumentsChange: (docs: string[]) => void;
  ariaLabel: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | File[]) => {
    const names = Array.from(files).map((f) => f.name);
    onDocumentsChange([...documents, ...names]);
  };

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add("border-primary", "bg-primary/5");
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove("border-primary", "bg-primary/5");
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove("border-primary", "bg-primary/5");
          if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
        }}
        className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border-2 border-dashed border-primary/40 bg-primary/[0.04] hover:border-primary hover:bg-primary/10 hover:text-primary text-foreground text-xs font-medium cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Upload className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
        <span>Drop files or <span className="text-primary font-semibold underline-offset-2">click to upload</span></span>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.md"
        aria-label={`${ariaLabel} file input`}
        onChange={(e) => {
          if (e.target.files?.length) {
            handleFiles(e.target.files);
            e.target.value = "";
          }
        }}
      />
      {documents.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {documents.map((doc, i) => (
            <Badge
              key={i}
              variant="secondary"
              className="gap-1.5 pl-2 pr-1 py-1 rounded-full text-[11px] font-normal bg-muted text-foreground hover:bg-muted"
            >
              <FileText className="w-3 h-3 text-muted-foreground" aria-hidden="true" focusable="false" />
              <span className="max-w-[180px] truncate">{doc}</span>
              <button
                type="button"
                onClick={() => onDocumentsChange(documents.filter((_, idx) => idx !== i))}
                className="rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                aria-label={`Remove ${doc}`}
              >
                <X className="w-3 h-3" aria-hidden="true" focusable="false" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export function StepBlueprintGenerate({ state, onChange, errors }: StepBlueprintGenerateProps) {
  const togglePref = (key: keyof AIGenerateState["contentPreferences"]) => {
    onChange({
      contentPreferences: {
        ...state.contentPreferences,
        [key]: !state.contentPreferences[key],
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Assessment scopes — Course / Section / Page quizzes */}
      <QuizScopeCard
        scope="course"
        title="Course quiz"
        badge="One per course"
        offHelp="Turn on to add a course quiz and configure its question mix."
        activeType={state.courseQuizType}
        config={state.courseQuizConfig}
        onTypeChange={(t) => onChange({ courseQuizType: t })}
        onConfigChange={(c) => onChange({ courseQuizConfig: c })}
      />
      <QuizScopeCard
        scope="section"
        title="Section quiz"
        badge="Applies to every section"
        offHelp="Turn on to add a section quiz and configure its question mix."
        activeType={state.sectionQuizType}
        config={state.sectionQuizConfig}
        onTypeChange={(t) => onChange({ sectionQuizType: t })}
        onConfigChange={(c) => onChange({ sectionQuizConfig: c })}
      />
      <QuizScopeCard
        scope="page"
        title="Page quiz"
        badge="Applies to every page"
        offHelp="Turn on to add a page quiz and configure its question mix."
        activeType={state.pageQuizType}
        config={state.pageQuizConfig}
        onTypeChange={(t) => onChange({ pageQuizType: t })}
        onConfigChange={(c) => onChange({ pageQuizConfig: c })}
      />

      {/* Images */}
      <PrefCard>
        <SectionHeader icon={ImageIcon} title="Images" desc="Choose whether AI generates visuals for sections and pages." />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <ImageToggleTile
            selected={state.sectionImages}
            onToggle={() => onChange({ sectionImages: !state.sectionImages })}
            title="Section images"
            description="Generate a hero image for each section"
            ariaLabel="section images"
          />
          <ImageToggleTile
            selected={state.pageImages}
            onToggle={() => onChange({ pageImages: !state.pageImages })}
            title="Page images"
            description="Add supporting images inside pages"
            ariaLabel="page images"
          />
        </div>

        {(state.sectionImages || state.pageImages) && (
          <div className="mt-4 pt-4 border-t border-border/60">
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <div>
                <div className="text-[13px] font-semibold text-foreground leading-tight">Visual style</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Applied consistently across every AI-generated image in the course
                </div>
              </div>
            </div>
            <div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5"
              role="radiogroup"
              aria-label="Image visual style"
            >
              {IMAGE_STYLE_OPTIONS.map((opt) => {
                const selected = state.imageStyle === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={`${opt.label} image style`}
                    onClick={() => onChange({ imageStyle: opt.value })}
                    className={cn(
                      "group relative flex flex-col overflow-hidden rounded-xl border bg-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                      selected
                        ? "border-primary/60 ring-2 ring-primary/40 shadow-sm"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                      <img
                        src={opt.preview}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        width={512}
                        height={384}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {selected && (
                        <div className="absolute top-1.5 right-1.5 flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground shadow">
                          <Check className="w-3 h-3" aria-hidden="true" focusable="false" />
                        </div>
                      )}
                    </div>
                    <span className={cn(
                      "text-[11px] leading-tight font-medium py-1.5 px-1 text-center",
                      selected ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </PrefCard>
        <SectionHeader icon={MessageSquare} title="Course Tone" desc="Voice and style of the content" />
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Course tone">
          {TONE_OPTIONS.map((opt) => {
            const selected = state.tone === opt.value;
            return (
              <Chip
                key={opt.value}
                selected={selected}
                onClick={() => onChange({ tone: opt.value })}
                ariaLabel={opt.label}
              >
                <span className="text-base leading-none" aria-hidden="true">{opt.icon}</span>
                {opt.label}
              </Chip>
            );
          })}
        </div>
      </PrefCard>

      {/* Course Font */}
      <PrefCard>
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <SectionHeader title="Course Font" />
          <span
            className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"
            role="note"
          >
            <Info className="w-3 h-3" aria-hidden="true" focusable="false" />
            Text block–level fonts can be customized independently
          </span>
        </div>
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5"
          role="radiogroup"
          aria-label="Course font"
        >
          {FONT_OPTIONS.map((opt) => {
            const selected = (state.font ?? "default") === opt.id;
            const stack = getFontStack(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={`${opt.label} font`}
                onClick={() => onChange({ font: opt.id })}
                className={cn(
                  "relative flex items-center gap-2 h-10 pl-2.5 pr-3 rounded-lg border bg-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  selected
                    ? "border-primary bg-primary/[0.06] shadow-[0_0_0_1px_hsl(var(--primary))]"
                    : "border-border hover:border-primary/40 hover:bg-accent/40"
                )}
              >
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-7 h-7 rounded-md text-[14px] font-semibold leading-none shrink-0 transition-colors",
                    selected ? "bg-primary/10 text-primary" : "bg-muted text-foreground"
                  )}
                  style={stack ? { fontFamily: stack } : undefined}
                  aria-hidden="true"
                >
                  Aa
                </span>
                <span
                  className={cn(
                    "text-[12.5px] font-medium leading-none truncate text-left flex-1",
                    selected ? "text-foreground" : "text-muted-foreground"
                  )}
                  style={stack ? { fontFamily: stack } : undefined}
                >
                  {opt.label}
                </span>
                {selected && (
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" strokeWidth={3} aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      </PrefCard>
      {/* Guidelines & Exclusions (merged, tabbed) */}
      <ContentRulesCard state={state} onChange={onChange} />


      {/* SCORM Preferences (collapsed accordion) */}
      <ScormPreferencesAccordion state={state} onChange={onChange} />
    </div>
  );
}

type QuizVariantKey = "formative" | "summative";
type QTypeKey = "singleChoice" | "multipleChoice" | "trueFalse" | "fillInBlank";

const QUIZ_QTYPES: { key: QTypeKey; label: string; icon: LucideIcon; hue: string; barHue: string }[] = [
  { key: "singleChoice", label: "Single Choice", icon: CircleDot, hue: "212 90% 40%", barHue: "211 100% 50%" },
  { key: "multipleChoice", label: "Multiple Choice", icon: ListChecks, hue: "262 60% 45%", barHue: "262 83% 58%" },
  { key: "trueFalse", label: "True / False", icon: ToggleRight, hue: "160 84% 28%", barHue: "160 84% 39%" },
  { key: "fillInBlank", label: "Fill in Blank", icon: PenLine, hue: "25 90% 38%", barHue: "32 95% 53%" },
];

function QuizScopeCard({
  scope,
  title,
  badge,
  offHelp,
  activeType,
  config,
  onTypeChange,
  onConfigChange,
}: {
  scope: "course" | "section" | "page";
  title: string;
  badge: string;
  offHelp: string;
  activeType: QuizVariantKey;
  config: QuizScopeConfig;
  onTypeChange: (t: QuizVariantKey) => void;
  onConfigChange: (c: QuizScopeConfig) => void;
}) {
  const QUIZ_VARIANTS = {
    formative: {
      title: "Formative quiz",
      subtitle: "Low-stakes check-ins during learning",
      description: "Low-stakes check-ins woven into the learning flow. Instant feedback for learners.",
      icon: GraduationCap,
      perTypeMax: 8,
    },
    summative: {
      title: "Summative quiz",
      subtitle:
        scope === "course"
          ? "Graded end-of-course assessment"
          : scope === "section"
          ? "Graded end-of-section assessment"
          : "Graded end-of-page assessment",
      description:
        scope === "course"
          ? "Single end-of-course assessment that evaluates overall mastery."
          : scope === "section"
          ? "End-of-section assessment that evaluates mastery of the material covered."
          : "End-of-page assessment that checks understanding of that page.",
      icon: ClipboardCheck,
      perTypeMax: 15,
    },
  } as const;

  const variant = QUIZ_VARIANTS[activeType];
  const cfg = config[activeType];
  const ActiveIcon = variant.icon;
  const mixScopeLabel = scope === "course" ? "· whole course" : scope === "section" ? "· per section" : "· per page";
  const masterEnabled = config.formative.enabled || config.summative.enabled;

  const toggleMaster = () => {
    const next = !masterEnabled;
    onConfigChange({
      formative: { ...config.formative, enabled: next && activeType === "formative" },
      summative: { ...config.summative, enabled: next && activeType === "summative" },
    });
  };

  const setActiveType = (t: QuizVariantKey) => {
    const wasOn = masterEnabled;
    onTypeChange(t);
    onConfigChange({
      formative: { ...config.formative, enabled: wasOn && t === "formative" },
      summative: { ...config.summative, enabled: wasOn && t === "summative" },
    });
  };

  const updateActive = (partial: Partial<QuizVariantConfig>) => {
    onConfigChange({
      ...config,
      [activeType]: { ...cfg, ...partial },
    });
  };

  const perTypeMax = variant.perTypeMax;
  const types = cfg.questionTypes;
  const total = QUIZ_QTYPES.reduce((s, q) => s + (types[q.key] || 0), 0);

  const setType = (k: QTypeKey, n: number) => {
    const clamped = Math.max(0, Math.min(perTypeMax, n));
    const nextTypes = { ...types, [k]: clamped };
    updateActive({
      questionTypes: nextTypes,
      questionsPerQuiz: Math.max(1, QUIZ_QTYPES.reduce((s, q) => s + nextTypes[q.key], 0)),
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Master header */}
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
              <span className="text-[16px] font-semibold text-foreground leading-tight">{title}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary ring-1 ring-inset ring-primary/25">
                {badge}
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
          aria-label={`Toggle ${title}`}
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
        <div className="overflow-hidden">
          {/* Quiz type radio cards */}
          <div className="mt-5">
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Quiz type
              </span>
            </div>
            <div role="radiogroup" aria-label={`${title} type`} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        {v.title.replace(" quiz", "")}
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

          {/* Question mix */}
          <div className="mt-5 pt-5 border-t border-border">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Question mix{" "}
                  <span className="text-muted-foreground/70 normal-case font-medium tracking-normal">
                    {mixScopeLabel}
                  </span>
                </div>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  Tune how many of each type. Total updates live.
                </p>
              </div>
              <div
                className="flex items-baseline gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 ring-1 ring-primary/20"
                aria-live="polite"
              >
                <span className="text-lg font-bold text-primary tabular-nums leading-none">{total}</span>
                <span className="text-[11px] font-medium text-primary/80 uppercase tracking-wide">
                  {total === 1 ? "question" : "questions"}
                </span>
              </div>
            </div>

            {total > 0 && (
              <div className="mb-4">
                <TooltipProvider delayDuration={100}>
                  <div className="relative flex h-3 w-full overflow-hidden rounded-full bg-muted/40 ring-1 ring-border/60 shadow-[inset_0_1px_2px_hsl(var(--foreground)/0.06)]">
                    {QUIZ_QTYPES.map((q, i) => {
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
                            />
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
                                <span className="text-[12px] font-semibold text-foreground">{q.label}</span>
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
              {QUIZ_QTYPES.map((q) => {
                const n = types[q.key] || 0;
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
                            : { backgroundColor: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }
                        }
                        aria-hidden="true"
                      >
                        <Icon className="w-4 h-4" aria-hidden="true" focusable="false" />
                      </span>
                      <span className="text-sm font-medium text-foreground truncate">{q.label}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setType(q.key, n - 1)}
                        disabled={n <= 0}
                        aria-label={`Decrease ${q.label}`}
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
        </div>
      </div>
    </div>
  );
}

function PageDurationCard({
  state,
  onChange,
}: {
  state: AIGenerateState;
  onChange: (partial: Partial<AIGenerateState>) => void;
}) {
  return (
    <PageDurationDefaultCard
      valueSec={state.scormPageDurationSec}
      onChange={(sec) => onChange({ scormPageDurationSec: sec })}
      description="Default time budget AI uses to size each page's content. You can override any individual page in the next step."
    />
  );
}


function ScormPreferencesAccordion({
  state,
  onChange,
}: {
  state: AIGenerateState;
  onChange: (partial: Partial<AIGenerateState>) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    onChange({ scormBgImage: { name: file.name, url } });
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="scorm" className="rounded-xl border border-border bg-card overflow-hidden">
        <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]]:border-b [&[data-state=open]]:border-border">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/20 shrink-0">
              <Sliders className="h-4 w-4 text-primary" aria-hidden="true" focusable="false" />
            </div>
            <div className="min-w-0 text-left">
              <div className="text-[16px] font-semibold text-foreground leading-tight">
                SCORM Preferences
              </div>
              <div className="text-[13.5px] text-muted-foreground leading-snug mt-0.5">
                Configure how the package behaves inside an LMS
              </div>
            </div>
            <span className="ml-auto mr-2 hidden sm:inline-flex items-center text-[11px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              Optional
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="p-0">
          <div className="divide-y divide-border">

            {/* Background Image */}
            <div className="p-5">
              <Label className="text-[16px] font-semibold text-foreground">Background Image</Label>
              <p className="text-[13.5px] text-muted-foreground mt-1">
                Displayed behind every SCORM page. PNG or JPG, recommended 1920×1080.
              </p>
              {state.scormBgImage ? (
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-2.5">
                  <div
                    className="h-16 w-24 rounded-lg bg-center bg-cover shrink-0 border border-border"
                    style={{ backgroundImage: `url(${state.scormBgImage.url})` }}
                    role="img"
                    aria-label={state.scormBgImage.name}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-foreground truncate">{state.scormBgImage.name}</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[13px] font-medium text-primary hover:underline mt-1"
                    >
                      Replace image
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => onChange({ scormBgImage: null })}
                    aria-label="Remove background image"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-background"
                  >
                    <X className="w-4 h-4" aria-hidden="true" focusable="false" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 w-full flex items-center justify-center gap-2.5 py-5 rounded-xl border-2 border-dashed border-primary/40 bg-primary/[0.04] text-primary hover:bg-primary/[0.08] hover:border-primary/60 transition-colors"
                >
                  <Upload className="w-[18px] h-[18px]" aria-hidden="true" focusable="false" />
                  <span className="text-[15px] font-semibold">Upload background image</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                  e.target.value = "";
                }}
                aria-label="Background image file"
              />
            </div>

            {/* Background Opacity */}
            <div className="p-5">
              <Label className="text-[16px] font-semibold text-foreground">
                Background Opacity
              </Label>
              <p className="text-[13.5px] text-muted-foreground mt-1">
                Drag the slider to adjust how visible the background appears.
              </p>

              {/* Live preview */}
              <div
                className="relative mt-4 h-40 rounded-2xl overflow-hidden border border-border shadow-inner"
                style={{
                  backgroundImage: `url(${state.scormBgImage ? state.scormBgImage.url : scormPlaceholder})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                aria-hidden="true"
              >
                <div
                  className="absolute inset-0 bg-background transition-opacity"
                  style={{ opacity: 1 - state.scormBgOpacity / 100 }}
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/85 backdrop-blur-sm border border-border/60 pointer-events-none">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
                  <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">
                    {state.scormBgImage ? "Live preview" : "Sample preview"}
                  </span>
                </div>
                {!state.scormBgImage && (
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-background/80 backdrop-blur-sm border border-border/60 pointer-events-none">
                    <span className="text-[11.5px] font-medium text-muted-foreground">Upload an image to preview yours</span>
                  </div>
                )}
              </div>

              {/* Slider with value bubble + tick marks */}
              <div className="mt-6 px-1">
                <div className="relative">
                  <div
                    className="absolute -top-9 -translate-x-1/2 pointer-events-none transition-all"
                    style={{ left: `${state.scormBgOpacity}%` }}
                  >
                    <div className="relative flex items-center justify-center min-w-[44px] h-7 px-2 rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold tabular-nums shadow-md">
                      {state.scormBgOpacity}%
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-primary" />
                    </div>
                  </div>

                  <Slider
                    value={[state.scormBgOpacity]}
                    onValueChange={([v]) => onChange({ scormBgOpacity: v })}
                    min={0}
                    max={100}
                    step={1}
                    aria-label="Background opacity"
                    className="[&_[role=slider]]:h-6 [&_[role=slider]]:w-6 [&_[role=slider]]:shadow-lg [&_[role=slider]]:border-[3px] [&_[data-orientation=horizontal]]:h-2.5 [&>span:first-child]:bg-muted [&>span:first-child>span]:bg-gradient-to-r [&>span:first-child>span]:from-primary/70 [&>span:first-child>span]:to-primary"
                  />

                  <div className="relative mt-2 px-[2px]" aria-hidden="true">
                    <div className="flex justify-between">
                      {[0, 25, 50, 75, 100].map((t) => (
                        <div key={t} className="flex flex-col items-center gap-1">
                          <div className={cn(
                            "w-px h-1.5",
                            state.scormBgOpacity >= t ? "bg-primary/60" : "bg-border"
                          )} />
                          <span className="text-[12px] font-medium text-muted-foreground tabular-nums">
                            {t}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-3 text-[13.5px] font-medium text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-muted border border-border" />
                    Transparent
                  </span>
                  <span className="flex items-center gap-1.5">
                    Fully visible
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  </span>
                </div>
              </div>
            </div>

            {/* Completion Messages */}
            <div className="p-5">
              <div className="flex-1 min-w-0">
                <Label className="text-[16px] font-semibold text-foreground">
                  Completion Messages
                </Label>
                <p className="text-[13.5px] text-muted-foreground mt-1">
                  Shown to learners based on their final result.
                </p>

                <div className="mt-3 grid grid-cols-1 gap-3">
                  {/* Pass */}
                  <div className="rounded-xl border border-border bg-background overflow-hidden">
                    <div className="flex items-center gap-2 px-3.5 py-2.5 bg-primary/5 border-b border-border">
                      <CheckCircle2 className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
                      <Label htmlFor="scorm-pass-msg" className="text-[14.5px] font-semibold text-foreground">
                        Pass criteria message
                      </Label>
                    </div>
                    <Textarea
                      id="scorm-pass-msg"
                      value={state.scormPassMessage}
                      onChange={(e) => onChange({ scormPassMessage: e.target.value })}
                      rows={3}
                      className="text-[14.5px] min-h-[80px] resize-none border-0 bg-transparent rounded-none focus-visible:ring-0"
                    />
                  </div>

                  {/* Fail */}
                  <div className="rounded-xl border border-border bg-background overflow-hidden">
                    <div className="flex items-center gap-2 px-3.5 py-2.5 bg-destructive/5 border-b border-border">
                      <XCircle className="w-4 h-4 text-destructive" aria-hidden="true" focusable="false" />
                      <Label htmlFor="scorm-fail-msg" className="text-[14.5px] font-semibold text-foreground">
                        Fail criteria message
                      </Label>
                    </div>
                    <Textarea
                      id="scorm-fail-msg"
                      value={state.scormFailMessage}
                      onChange={(e) => onChange({ scormFailMessage: e.target.value })}
                      rows={3}
                      className="text-[14.5px] min-h-[80px] resize-none border-0 bg-transparent rounded-none focus-visible:ring-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function ContentRulesCard({
  state,
  onChange,
}: {
  state: AIGenerateState;
  onChange: (partial: Partial<AIGenerateState>) => void;
}) {
  return (
    <PrefCard>
      <div className="mb-3">
        <div className="text-[16px] font-semibold text-foreground leading-tight">
          Content rules
        </div>
        <div className="text-[12px] text-muted-foreground mt-0.5">
          Tell the AI what to include and what to leave out. Keep it simple.
        </div>
      </div>

      <Textarea
        id="content-rules"
        value={state.contentRules}
        onChange={(e) => onChange({ contentRules: e.target.value })}
        placeholder="Include real-world examples, use plain language, avoid competitor names, skip pricing details, etc."
        className="text-[13.5px] min-h-[110px] resize-none rounded-xl border-2 border-input bg-background focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Content rules"
      />

      {/* Reference files */}
      <div className="mt-3 pt-3 border-t border-border/60">
        <div className="text-[12.5px] font-medium text-foreground mb-1.5">
          Reference files{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </div>
        <DocUploadZone
          documents={state.contentRulesDocuments ?? []}
          onDocumentsChange={(docs) => onChange({ contentRulesDocuments: docs })}
          ariaLabel="Upload content rule reference documents"
        />
      </div>
    </PrefCard>
  );
}


