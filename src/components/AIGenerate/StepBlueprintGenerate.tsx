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
  type LucideIcon,
} from "lucide-react";

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

const TONE_OPTIONS = [
  { value: "ai-determined" as const, label: "AI Determined", icon: "🎯" },
  { value: "professional" as const, label: "Professional", icon: "💼" },
  { value: "conversational" as const, label: "Conversational", icon: "💬" },
  { value: "coaching" as const, label: "Coaching", icon: "🎓" },
];

function SectionHeader({ icon: Icon, title, desc }: { icon: LucideIcon; title: string; desc?: string }) {
  return (
    <div className="flex items-start gap-2.5 mb-2.5">
      <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
      </span>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-foreground leading-tight">{title}</div>
        {desc && <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">{desc}</div>}
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
      {/* Two-column responsive grid for compact prefs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Page Duration */}
        <PrefCard>
          <SectionHeader icon={Clock} title="Page Duration" desc="Approx. time per page" />
          <Stepper
            value={state.pageSpanTime}
            onChange={(v) => onChange({ pageSpanTime: v })}
            min={1}
            max={30}
            unit="min"
            ariaLabel="page duration"
          />
        </PrefCard>

        {/* Intended Learners */}
        <PrefCard>
          <SectionHeader icon={Users} title="Intended Learners" desc="Target proficiency level" />
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Intended learners">
            {LEARNER_OPTIONS.map((opt) => {
              const selected = state.intendedLearners === opt.value;
              const Icon = opt.icon;
              return (
                <Chip
                  key={opt.value}
                  selected={selected}
                  onClick={() => onChange({ intendedLearners: selected ? "" : opt.value })}
                  ariaLabel={opt.label}
                >
                  {selected ? (
                    <Check className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                  )}
                  {opt.label}
                </Chip>
              );
            })}
          </div>
        </PrefCard>
      </div>

      {/* Bloom's Taxonomy */}
      <PrefCard>
        <SectionHeader icon={Layers} title="Bloom's Taxonomy" desc="Cognitive levels to target" />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Bloom's taxonomy levels">
          {BLOOMS_OPTIONS.map((b) => {
            const selected = state.bloomsTaxonomy.includes(b.value);
            return (
              <Chip
                key={b.value}
                selected={selected}
                ariaPressed={selected}
                onClick={() => toggleBloom(b.value)}
                ariaLabel={b.label}
              >
                {selected && <Check className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />}
                {b.label}
              </Chip>
            );
          })}
        </div>
      </PrefCard>

      {/* Page-level Preferences */}
      <PrefCard>
        <SectionHeader icon={BookOpen} title="Page-level Preferences" desc="Control what each page contains" />
        <div className="space-y-2.5">
          {/* Questions toggle + count */}
          <div
            className={cn(
              "rounded-xl border transition-all p-3",
              state.contentPreferences.includeQuestions
                ? "border-primary/40 bg-primary/5"
                : "border-border bg-background"
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => togglePref("includeQuestions")}
                role="switch"
                aria-checked={state.contentPreferences.includeQuestions}
                className="flex items-center gap-2.5 text-left flex-1 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
                aria-label="Include questions in pages"
              >
                <span
                  className={cn(
                    "w-9 h-5 rounded-full relative transition-colors shrink-0",
                    state.contentPreferences.includeQuestions ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                  aria-hidden="true"
                >
                  <span
                    className={cn(
                      "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-background shadow transition-transform",
                      state.contentPreferences.includeQuestions && "translate-x-4"
                    )}
                  />
                </span>
                <span className="flex items-center gap-1.5 min-w-0">
                  <HelpCircle className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" focusable="false" />
                  <span className="text-sm font-medium text-foreground">Questions</span>
                  <span className="text-[11px] text-muted-foreground hidden sm:inline">— Include questions in pages</span>
                </span>
              </button>
              {state.contentPreferences.includeQuestions && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground hidden sm:inline">per page</span>
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
          </div>

          {/* Images toggle */}
          <div
            className={cn(
              "rounded-xl border transition-all p-3",
              state.contentPreferences.addImages
                ? "border-primary/40 bg-primary/5"
                : "border-border bg-background"
            )}
          >
            <button
              type="button"
              onClick={() => togglePref("addImages")}
              role="switch"
              aria-checked={state.contentPreferences.addImages}
              className="flex items-center gap-2.5 text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
              aria-label="Add images to pages"
            >
              <span
                className={cn(
                  "w-9 h-5 rounded-full relative transition-colors shrink-0",
                  state.contentPreferences.addImages ? "bg-primary" : "bg-muted-foreground/30"
                )}
                aria-hidden="true"
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-background shadow transition-transform",
                    state.contentPreferences.addImages && "translate-x-4"
                  )}
                />
              </span>
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
                <span className="text-sm font-medium text-foreground">Images</span>
                <span className="text-[11px] text-muted-foreground hidden sm:inline">— Add images to the pages</span>
              </span>
            </button>
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

      {/* Guidelines & Exclusions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PrefCard>
          <SectionHeader icon={BookOpen} title="Guidelines" desc="Style or content rules to follow" />
          <Textarea
            value={state.guidelines}
            onChange={(e) => onChange({ guidelines: e.target.value })}
            placeholder="e.g., Use plain language, include real-world examples…"
            className="min-h-[80px] resize-none rounded-xl text-sm"
            aria-label="Guidelines"
          />
        </PrefCard>
        <PrefCard>
          <SectionHeader icon={Ban} title="Exclusions" desc="Topics or terms to avoid" />
          <Textarea
            value={state.exclusions}
            onChange={(e) => onChange({ exclusions: e.target.value })}
            placeholder="e.g., Avoid jargon, do not include pricing…"
            className="min-h-[80px] resize-none rounded-xl text-sm"
            aria-label="Exclusions"
          />
        </PrefCard>
      </div>
    </div>
  );
}
