import { AIGenerateState } from "@/pages/AIGenerateCourse";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Check,
  Clock,
  Layers,
  Users,
  HelpCircle,
  Image as ImageIcon,
  MessageSquare,
  Ban,
  BookOpen,
  Minus,
  Plus,
  Sprout,
  Rocket,
  Crown,
  Timer,
  Hourglass,
  Upload,
  X,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";

interface StepBlueprintGenerateProps {
  state: AIGenerateState;
  onChange: (partial: Partial<AIGenerateState>) => void;
}

const BLOOMS_OPTIONS = [
  { value: "knowledge", label: "Knowledge" },
  { value: "comprehension", label: "Comprehension" },
  { value: "application", label: "Application" },
  { value: "analysis", label: "Analysis" },
  { value: "synthesis", label: "Synthesis" },
  { value: "evaluation", label: "Evaluation" },
];

const LEARNER_OPTIONS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "beginners", label: "Beginners", icon: Sprout },
  { value: "intermediate", label: "Intermediate", icon: Rocket },
  { value: "expert", label: "Expert", icon: Crown },
];

const DURATION_OPTIONS: { value: "brief" | "standard" | "extended"; label: string; desc: string; minutes: number; icon: LucideIcon }[] = [
  { value: "brief", label: "Brief", desc: "< 5 min", minutes: 4, icon: Timer },
  { value: "standard", label: "Standard", desc: "5–10 min", minutes: 8, icon: Clock },
  { value: "extended", label: "Extended", desc: "10+ min", minutes: 12, icon: Hourglass },
];

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
  const toggleBloom = (v: string) => {
    const set = new Set(state.bloomsTaxonomy);
    if (set.has(v)) set.delete(v);
    else set.add(v);
    onChange({ bloomsTaxonomy: Array.from(set) });
  };

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
              <span
                className={cn(
                  "w-9 h-5 rounded-full relative transition-colors shrink-0",
                  state.contentPreferences.includeQuestions ? "bg-primary" : "bg-muted-foreground/25"
                )}
                aria-hidden="true"
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-background shadow-sm transition-transform",
                    state.contentPreferences.includeQuestions && "translate-x-4"
                  )}
                />
              </span>
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
              <span
                className={cn(
                  "w-9 h-5 rounded-full relative transition-colors shrink-0",
                  state.contentPreferences.addImages ? "bg-primary" : "bg-muted-foreground/25"
                )}
                aria-hidden="true"
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-background shadow-sm transition-transform",
                    state.contentPreferences.addImages && "translate-x-4"
                  )}
                />
              </span>
            </div>
          </div>
        </div>
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

      {/* Guidelines */}
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
    </div>
  );
}
