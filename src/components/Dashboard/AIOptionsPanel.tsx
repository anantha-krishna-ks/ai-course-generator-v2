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
} from "lucide-react";

export interface AIOptions {
  enabled: boolean;
  supportingDocuments: string[];
  bloomsTaxonomy: string[];
  intendedLearners: string;
  guidelines: string;
  exclusions: string;
}

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
}: {
  options: AIOptions;
  onChange: (options: AIOptions) => void;
  onBack: () => void;
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

      {/* All sections in a single flow */}
      <div className="space-y-7">
        {/* ── Bloom's Taxonomy ── */}
        <div>
          <SectionLabel icon={Brain} label="Bloom's Taxonomy" />
          <div className="flex flex-wrap gap-2 mt-3">
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

        <div className="border-t border-border/40" />

        {/* ── Intended Learners ── */}
        <div>
          <SectionLabel icon={Users} label="Intended Learners" />
          <div className="flex gap-2 mt-3">
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

        <div className="border-t border-border/40" />

        {/* ── Supporting Documents ── */}
        <div>
          <SectionLabel icon={Upload} label="Supporting Documents" />
          <div className="mt-2.5 space-y-2.5">
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

        <div className="border-t border-border/40" />

        {/* ── Guidelines & Exclusions side by side ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <SectionLabel icon={BookOpen} label="Guidelines" />
            <Textarea
              value={options.guidelines}
              onChange={(e) => {
                update({ guidelines: e.target.value });
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              placeholder="Instructions for AI content generation..."
              className="mt-3 min-h-[90px] text-sm resize-none bg-background border border-border/80 focus:border-primary focus:border-[1.5px] focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg overflow-hidden"
              rows={3}
            />
          </div>
          <div>
            <SectionLabel icon={ShieldX} label="Exclusions" />
            <Textarea
              value={options.exclusions}
              onChange={(e) => {
                update({ exclusions: e.target.value });
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              placeholder="Topics AI should avoid..."
              className="mt-3 min-h-[90px] text-sm resize-none bg-background border border-border/80 focus:border-primary focus:border-[1.5px] focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg overflow-hidden"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Done */}
      <div className="flex justify-end pt-6">
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
