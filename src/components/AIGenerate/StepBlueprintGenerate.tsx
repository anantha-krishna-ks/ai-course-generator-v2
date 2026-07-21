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
  type LucideIcon,
} from "lucide-react";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import scormPlaceholder from "@/assets/scorm-placeholder.jpg";
import { FONT_OPTIONS, getFontStack } from "@/components/CourseCreation/FontSelectorDropdown";

interface StepBlueprintGenerateProps {
  state: AIGenerateState;
  onChange: (partial: Partial<AIGenerateState>) => void;
}

const TONE_OPTIONS = [
  { value: "ai-determined" as const, label: "AI Determined", icon: "🎯" },
  { value: "professional" as const, label: "Professional", icon: "💼" },
  { value: "conversational" as const, label: "Conversational", icon: "💬" },
  { value: "coaching" as const, label: "Coaching", icon: "🎓" },
];

function SectionHeader({ title }: { icon?: LucideIcon; title: string; desc?: string }) {
  return (
    <div className="mb-2.5">
      <div className="text-[16px] font-semibold text-foreground leading-tight">{title}</div>
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

export function StepBlueprintGenerate({ state, onChange }: StepBlueprintGenerateProps) {
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
      {/* Page-level Preferences */}
      <PrefCard>
        <SectionHeader icon={BookOpen} title="Page-level Preferences" desc="Control what each page contains" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Questions tile */}
          <div
            className={cn(
              "group relative rounded-2xl border transition-all duration-200 p-3.5",
              state.contentPreferences.includeQuestions
                ? "border-primary/50 bg-gradient-to-br from-primary/[0.06] to-primary/[0.02] shadow-[0_1px_0_0_hsl(var(--primary)/0.08)]"
                : "border-border bg-background hover:border-primary/30 hover:bg-muted/30"
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => togglePref("includeQuestions")}
                role="switch"
                aria-checked={state.contentPreferences.includeQuestions}
                className="flex items-center gap-3 text-left flex-1 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
                aria-label="Include questions in pages"
              >
                <span
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                    state.contentPreferences.includeQuestions
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground group-hover:text-foreground"
                  )}
                  aria-hidden="true"
                >
                  <HelpCircle className="w-4 h-4" />
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-foreground leading-tight">Questions</span>
                  <span className="text-[11px] text-muted-foreground leading-snug mt-0.5">Include questions in pages</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => togglePref("includeQuestions")}
                role="switch"
                aria-checked={state.contentPreferences.includeQuestions}
                aria-label="Toggle include questions in pages"
                className={cn(
                  "w-9 h-5 rounded-full relative transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  state.contentPreferences.includeQuestions ? "bg-primary" : "bg-muted-foreground/25"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-background shadow-sm transition-transform",
                    state.contentPreferences.includeQuestions && "translate-x-4"
                  )}
                  aria-hidden="true"
                />
              </button>
            </div>
            {state.contentPreferences.includeQuestions && (
              <div className="mt-3 pt-3 border-t border-primary/15 flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-muted-foreground">Questions per page</span>
                <Stepper
                  value={state.questionsPerPage}
                  onChange={(v) => onChange({ questionsPerPage: v })}
                  min={1}
                  max={10}
                  ariaLabel="questions per page"
                />
              </div>
            )}
          </div>

          {/* Images tile */}
          <div
            className={cn(
              "group relative rounded-2xl border transition-all duration-200 p-3.5",
              state.contentPreferences.addImages
                ? "border-primary/50 bg-gradient-to-br from-primary/[0.06] to-primary/[0.02] shadow-[0_1px_0_0_hsl(var(--primary)/0.08)]"
                : "border-border bg-background hover:border-primary/30 hover:bg-muted/30"
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => togglePref("addImages")}
                role="switch"
                aria-checked={state.contentPreferences.addImages}
                className="flex items-center gap-3 text-left flex-1 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
                aria-label="Add images to pages"
              >
                <span
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                    state.contentPreferences.addImages
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground group-hover:text-foreground"
                  )}
                  aria-hidden="true"
                >
                  <ImageIcon className="w-4 h-4" />
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-foreground leading-tight">Images</span>
                  <span className="text-[11px] text-muted-foreground leading-snug mt-0.5">Add images to the pages</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => togglePref("addImages")}
                role="switch"
                aria-checked={state.contentPreferences.addImages}
                aria-label="Toggle add images to pages"
                className={cn(
                  "w-9 h-5 rounded-full relative transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  state.contentPreferences.addImages ? "bg-primary" : "bg-muted-foreground/25"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-background shadow-sm transition-transform",
                    state.contentPreferences.addImages && "translate-x-4"
                  )}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </div>
        {state.contentPreferences.includeQuestions && (
          <div className="mt-3 rounded-xl border border-border bg-background p-4">
            <div className="mb-3">
              <div className="text-[15px] font-semibold text-foreground leading-tight">Number of Questions</div>
              <p className="text-xs text-muted-foreground mt-0.5">Set how many of each question type to include per page.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { key: "singleChoice" as const, label: "Single Choice" },
                { key: "multipleChoice" as const, label: "Multiple Choice" },
                { key: "trueFalse" as const, label: "True / False" },
                { key: "fillInBlank" as const, label: "Fill in Blank" },
              ].map((q) => {
                const id = `qtype-${q.key}`;
                return (
                  <div key={q.key} className="space-y-1.5">
                    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide block">
                      {q.label}
                    </label>
                    <select
                      id={id}
                      value={state.questionTypes[q.key]}
                      onChange={(e) =>
                        onChange({
                          questionTypes: {
                            ...state.questionTypes,
                            [q.key]: Number(e.target.value),
                          },
                        })
                      }
                      aria-label={`${q.label} count`}
                      className="w-full h-9 rounded-lg border border-border bg-background text-sm font-medium text-foreground px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors hover:border-primary/50"
                    >
                      {[0, 1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </PrefCard>

      {/* Course Tone */}
      <PrefCard>
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
      <PrefCard>
        <SectionHeader title="Guidelines" />
        <div className="space-y-3">
          <Textarea
            value={state.guidelines}
            onChange={(e) => onChange({ guidelines: e.target.value })}
            placeholder="e.g., Use plain language, include real-world examples…"
            className="min-h-[80px] resize-none rounded-xl text-sm"
            aria-label="Guidelines"
          />
          <DocUploadZone
            documents={state.guidelinesDocuments ?? []}
            onDocumentsChange={(docs) => onChange({ guidelinesDocuments: docs })}
            ariaLabel="Upload guidelines documents"
          />
        </div>
      </PrefCard>

      {/* Exclusions */}
      <PrefCard>
        <SectionHeader title="Exclusions" />
        <div className="space-y-3">
          <Textarea
            value={state.exclusions}
            onChange={(e) => onChange({ exclusions: e.target.value })}
            placeholder="e.g., Avoid jargon, do not include pricing…"
            className="min-h-[80px] resize-none rounded-xl text-sm"
            aria-label="Exclusions"
          />
          <DocUploadZone
            documents={state.exclusionsDocuments ?? []}
            onDocumentsChange={(docs) => onChange({ exclusionsDocuments: docs })}
            ariaLabel="Upload exclusions documents"
          />
        </div>
      </PrefCard>

      {/* SCORM Preferences (collapsed accordion) */}
      <ScormPreferencesAccordion state={state} onChange={onChange} />
    </div>
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
  const mins = Math.floor(state.scormPageDurationSec / 60);
  const secs = state.scormPageDurationSec % 60;

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
            {/* Page Duration */}
            <div className="p-5">
              <Label className="text-[16px] font-semibold text-foreground">Page Duration</Label>
              <p className="text-[13.5px] text-muted-foreground mt-1">
                Minimum time learners must spend on each page before progressing.
              </p>
              <div className="mt-3 flex items-end gap-3">
                <div className="flex flex-col">
                  <span className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                    Minutes
                  </span>
                  <Input
                    type="number"
                    min={0}
                    max={60}
                    value={mins}
                    onChange={(e) => {
                      const m = Math.max(0, Math.min(60, Number(e.target.value) || 0));
                      onChange({ scormPageDurationSec: m * 60 + secs });
                    }}
                    aria-label="Minutes"
                    className="h-12 w-20 text-center text-[17px] font-semibold tabular-nums rounded-lg"
                  />
                </div>
                <span aria-hidden="true" className="text-[22px] font-light text-muted-foreground pb-2 select-none">:</span>
                <div className="flex flex-col">
                  <span className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                    Seconds
                  </span>
                  <Input
                    type="number"
                    min={0}
                    max={59}
                    value={secs}
                    onChange={(e) => {
                      const s = Math.max(0, Math.min(59, Number(e.target.value) || 0));
                      onChange({ scormPageDurationSec: mins * 60 + s });
                    }}
                    aria-label="Seconds"
                    className="h-12 w-20 text-center text-[17px] font-semibold tabular-nums rounded-lg"
                  />
                </div>
              </div>
            </div>

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
