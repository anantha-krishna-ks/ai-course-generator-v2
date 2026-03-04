import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Upload,
  Brain,
  Users,
  BookOpen,
  ShieldX,
  FileText,
  X,
  Check,
  ArrowLeft,
  Settings2,
  Clock,
  Timer,
  Minus,
  Plus,
} from "lucide-react";

export interface AIOptions {
  enabled: boolean;
  supportingDocuments: string[];
  bloomsTaxonomy: string[];
  intendedLearners: string;
  guidelines: string;
  guidelinesDocuments: string[];
  exclusions: string;
  exclusionsDocuments: string[];
  pageSpanTime: number;
  courseSpanTime: number;
}

export type AIMode = "manual-with-ai" | "ai";

const BLOOMS_LEVELS = [
  "Remember",
  "Understand",
  "Apply",
  "Analyze",
  "Evaluate",
  "Create",
];

const LEARNER_LEVELS = ["Beginners", "Intermediate", "Expert"] as const;

/** The toggle + "Configure" button shown in the main dialog view */
export function AIToggleRow({
  options,
  onChange,
  onConfigure,
}: {
  options: AIOptions;
  onChange: (options: AIOptions) => void;
  onConfigure: () => void;
}) {
  const configuredCount = [
    options.supportingDocuments.length > 0,
    options.bloomsTaxonomy.length > 0,
    !!options.intendedLearners,
    !!options.guidelines,
    !!options.exclusions,
  ].filter(Boolean).length;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-3 rounded-lg border-2 transition-all",
        options.enabled
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-background"
      )}
    >
      <div
        className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-300 shrink-0",
          options.enabled ? "bg-primary/15" : "bg-muted"
        )}
      >
        <Sparkles
          className={cn(
            "w-4 h-4 transition-colors duration-300",
            options.enabled ? "text-primary" : "text-muted-foreground"
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-semibold text-foreground block">
          Enable AI Support
        </span>
        <span className="text-xs text-muted-foreground">
          {options.enabled
            ? configuredCount > 0
              ? `${configuredCount} option${configuredCount > 1 ? "s" : ""} configured`
              : "Click configure to set up AI options"
            : "AI-powered content & image generation"}
        </span>
      </div>
      {options.enabled && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onConfigure}
          className="shrink-0 gap-1.5 text-xs h-8 rounded-full"
        >
          <Settings2 className="w-3.5 h-3.5" />
          Configure
        </Button>
      )}
      <Switch
        checked={options.enabled}
        onCheckedChange={(checked) =>
          onChange({ ...options, enabled: checked })
        }
      />
    </div>
  );
}

/** Full-page AI configuration view — single scroll, everything visible */
export function AIConfigView({
  options,
  onChange,
  onBack,
  mode = "ai",
}: {
  options: AIOptions;
  onChange: (options: AIOptions) => void;
  onBack: () => void;
  mode?: AIMode;
}) {
  const update = (patch: Partial<AIOptions>) =>
    onChange({ ...options, ...patch });

  const toggleBloom = (level: string) => {
    const current = options.bloomsTaxonomy;
    update({
      bloomsTaxonomy: current.includes(level)
        ? current.filter((l) => l !== level)
        : [...current, level],
    });
  };

  const handleFileSelect = () => {
    const mockFile = `Document_${Date.now().toString(36)}.pdf`;
    update({
      supportingDocuments: [...options.supportingDocuments, mockFile],
    });
  };

  const removeDocument = (index: number) => {
    update({
      supportingDocuments: options.supportingDocuments.filter(
        (_, i) => i !== index
      ),
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 pb-6">
        <button
          type="button"
          onClick={onBack}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-bold text-foreground">
            AI Configuration
          </h3>
          <p className="text-xs text-muted-foreground">
            Fine-tune how AI generates your course content
          </p>
        </div>
      </div>

      {/* All sections in cards */}
      <div className="space-y-4">
        {/* ── Span Time Settings ── */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <SectionLabel icon={Timer} label="Span Time Settings" />
          <p className="text-xs text-muted-foreground mt-1 mb-4">Set how long each section of content should take to complete</p>
          <div className={cn("grid gap-4", mode === "ai" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}>
            {/* Page Level Span Time */}
            <SpanTimeCard
              icon={FileText}
              title="Per Page"
              subtitle="Duration per page"
              value={options.pageSpanTime}
              onChange={(v) => update({ pageSpanTime: v })}
              min={1}
              max={15}
              step={1}
              presets={[3, 5, 10, 15]}
              unit="min"
            />

            {/* Course Level Span Time - only in AI mode */}
            {mode === "ai" && (
              <SpanTimeCard
                icon={BookOpen}
                title="Full Course"
                subtitle="Total course duration"
                value={options.courseSpanTime}
                onChange={(v) => update({ courseSpanTime: v })}
                min={5}
                max={120}
                step={5}
                presets={[30, 60, 90, 120]}
                unit="min"
              />
            )}
          </div>
        </div>

        {/* ── Bloom's Taxonomy ── */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <SectionLabel icon={Brain} label="Bloom's Taxonomy" />
          <p className="text-xs text-muted-foreground mt-1 mb-3">Select cognitive levels for generated content</p>
          <div className="flex flex-wrap gap-2">
            {BLOOMS_LEVELS.map((level) => {
              const selected = options.bloomsTaxonomy.includes(level);
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => toggleBloom(level)}
                  className={cn(
                    "px-5 py-2.5 rounded-full text-[0.938rem] font-medium border transition-all duration-200 flex items-center gap-1.5",
                    selected
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  {selected && <Check className="w-3.5 h-3.5" />}
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Intended Learners ── */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <SectionLabel icon={Users} label="Intended Learners" />
          <p className="text-xs text-muted-foreground mt-1 mb-3">Choose the target audience skill level</p>
          <div className="flex gap-2">
            {LEARNER_LEVELS.map((level) => {
              const selected = options.intendedLearners === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => update({ intendedLearners: level })}
                  className={cn(
                    "flex-1 py-3 rounded-lg text-[0.938rem] font-medium border transition-all duration-200 text-center",
                    selected
                      ? "bg-primary/10 text-primary border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/40"
                  )}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Supporting Documents ── */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <SectionLabel icon={Upload} label="Supporting Documents" />
          <p className="text-xs text-muted-foreground mt-1 mb-3">Upload reference materials to guide AI generation</p>
          <div className="space-y-2.5">
            {options.supportingDocuments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {options.supportingDocuments.map((doc, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="gap-1.5 pr-1.5 text-xs font-normal h-7"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {doc}
                    <button
                      type="button"
                      onClick={() => removeDocument(i)}
                      className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary', 'bg-primary/5', 'text-primary'); }}
              onDragLeave={(e) => { e.currentTarget.classList.remove('border-primary', 'bg-primary/5', 'text-primary'); }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-primary', 'bg-primary/5', 'text-primary');
                const files = Array.from(e.dataTransfer.files);
                if (files.length > 0) {
                  const newDocs = files.map(f => f.name);
                  update({ supportingDocuments: [...options.supportingDocuments, ...newDocs] });
                }
              }}
              onClick={handleFileSelect}
              className="w-full border-2 border-dashed border-border/80 rounded-xl py-8 text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium">Drop files here or click to upload</span>
              <span className="text-xs text-muted-foreground/70">PDF, DOCX, TXT — up to 20MB each</span>
            </div>
          </div>
        </div>

        {/* ── Guidelines ── */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <SectionLabel icon={BookOpen} label="Guidelines" />
          <p className="text-xs text-muted-foreground mt-1 mb-3">Instructions for AI content generation</p>
          <div className="space-y-3">
            <Textarea
              value={options.guidelines}
              onChange={(e) => {
                update({ guidelines: e.target.value });
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              placeholder="e.g. Use formal tone, include real-world examples..."
              className="min-h-[90px] text-sm resize-none bg-background border border-border/80 focus:border-primary focus:border-[1.5px] focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg overflow-hidden"
              rows={3}
            />
            <div
              onClick={() => {
                const mockFile = `Guidelines_${Date.now().toString(36)}.pdf`;
                update({ guidelines: options.guidelines ? `${options.guidelines}\n[Uploaded: ${mockFile}]` : `[Uploaded: ${mockFile}]` });
              }}
              className="w-full border-2 border-dashed border-border/80 rounded-lg py-4 text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span className="text-sm font-medium">Upload Guidelines Document</span>
            </div>
          </div>
        </div>

        {/* ── Exclusions ── */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <SectionLabel icon={ShieldX} label="Exclusions" />
          <p className="text-xs text-muted-foreground mt-1 mb-3">Topics AI should avoid generating</p>
          <div className="space-y-3">
            <Textarea
              value={options.exclusions}
              onChange={(e) => {
                update({ exclusions: e.target.value });
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              placeholder="e.g. No political content, avoid competitor mentions..."
              className="min-h-[90px] text-sm resize-none bg-background border border-border/80 focus:border-primary focus:border-[1.5px] focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg overflow-hidden"
              rows={3}
            />
            <div
              onClick={() => {
                const mockFile = `Exclusions_${Date.now().toString(36)}.pdf`;
                update({ exclusions: options.exclusions ? `${options.exclusions}\n[Uploaded: ${mockFile}]` : `[Uploaded: ${mockFile}]` });
              }}
              className="w-full border-2 border-dashed border-border/80 rounded-lg py-4 text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span className="text-sm font-medium">Upload Exclusions Document</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="rounded-full px-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </Button>
        <Button
          type="button"
          onClick={onBack}
          className="rounded-full px-6 gap-2"
        >
          <Check className="w-4 h-4" />
          Done
        </Button>
      </div>
    </div>
  );
}

function SectionLabel({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="w-4 h-4 text-primary" />
      <span className="text-base font-semibold text-foreground">{label}</span>
    </div>
  );
}

function SpanTimeCard({
  icon: Icon,
  title,
  subtitle,
  value,
  onChange,
  min,
  max,
  step,
  presets,
  unit,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  presets: number[];
  unit: string;
}) {
  const decrement = () => onChange(Math.max(min, value - step));
  const increment = () => onChange(Math.min(max, value + step));

  return (
    <div className="rounded-lg border border-border/80 bg-background p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-primary" />
        </div>
        <div>
          <span className="text-sm font-medium text-foreground block leading-tight">{title}</span>
          <span className="text-[11px] text-muted-foreground">{subtitle}</span>
        </div>
      </div>

      {/* Stepper control */}
      <div className="flex items-center justify-center gap-3 py-2">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          className="w-9 h-9 rounded-full border border-border bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Minus className="w-4 h-4 text-foreground" />
        </button>
        <div className="flex items-baseline gap-1 min-w-[72px] justify-center">
          <span className="text-3xl font-bold text-foreground tabular-nums leading-none">{value}</span>
          <span className="text-sm text-muted-foreground font-medium">{unit}</span>
        </div>
        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          className="w-9 h-9 rounded-full border border-border bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {/* Preset chips */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150",
              value === preset
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-muted/50 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
            )}
          >
            {preset} {unit}
          </button>
        ))}
      </div>
    </div>
  );
}
