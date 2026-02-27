import { useState } from "react";
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
  ChevronRight,
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

// ── Accordion section config ────────────────────────────────────────

interface SectionDef {
  id: string;
  icon: React.ElementType;
  label: string;
  getSummary: (o: AIOptions) => string;
}

const SECTIONS: SectionDef[] = [
  {
    id: "documents",
    icon: Upload,
    label: "Supporting Documents",
    getSummary: (o) =>
      o.supportingDocuments.length > 0
        ? `${o.supportingDocuments.length} file${o.supportingDocuments.length > 1 ? "s" : ""}`
        : "",
  },
  {
    id: "blooms",
    icon: Brain,
    label: "Bloom's Taxonomy",
    getSummary: (o) =>
      o.bloomsTaxonomy.length > 0
        ? o.bloomsTaxonomy.join(", ")
        : "",
  },
  {
    id: "learners",
    icon: Users,
    label: "Intended Learners",
    getSummary: (o) => o.intendedLearners || "",
  },
  {
    id: "guidelines",
    icon: BookOpen,
    label: "Course Guidelines",
    getSummary: (o) =>
      o.guidelines
        ? o.guidelines.length > 40
          ? o.guidelines.slice(0, 40) + "…"
          : o.guidelines
        : "",
  },
  {
    id: "exclusions",
    icon: ShieldX,
    label: "Exclusions",
    getSummary: (o) =>
      o.exclusions
        ? o.exclusions.length > 40
          ? o.exclusions.slice(0, 40) + "…"
          : o.exclusions
        : "",
  },
];

/** Full-page AI configuration view shown inside the dialog */
export function AIConfigView({
  options,
  onChange,
  onBack,
}: {
  options: AIOptions;
  onChange: (options: AIOptions) => void;
  onBack: () => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const toggle = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const configuredCount = SECTIONS.filter((s) => s.getSummary(options)).length;

  // Render expanded content per section
  const renderContent = (id: string) => {
    switch (id) {
      case "documents":
        return (
          <div className="space-y-3">
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
            <button
              type="button"
              onClick={handleFileSelect}
              className="w-full border-2 border-dashed border-border/80 rounded-lg py-3 text-sm text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload documents
            </button>
          </div>
        );

      case "blooms":
        return (
          <div className="flex flex-wrap gap-1.5">
            {BLOOMS_LEVELS.map((level) => {
              const selected = options.bloomsTaxonomy.includes(level);
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => toggleBloom(level)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 flex items-center gap-1.5",
                    selected
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  {selected && <Check className="w-3 h-3" />}
                  {level}
                </button>
              );
            })}
          </div>
        );

      case "learners":
        return (
          <div className="grid grid-cols-3 gap-2">
            {LEARNER_LEVELS.map((level) => {
              const selected = options.intendedLearners === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => update({ intendedLearners: level })}
                  className={cn(
                    "py-2 rounded-lg text-sm font-medium border transition-all duration-200 text-center",
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
        );

      case "guidelines":
        return (
          <Textarea
            value={options.guidelines}
            onChange={(e) => update({ guidelines: e.target.value })}
            placeholder="Specific guidelines for AI content generation..."
            className="min-h-[80px] text-sm resize-none bg-background border border-border/80 focus:border-primary focus:border-[1.5px] focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg"
            rows={3}
          />
        );

      case "exclusions":
        return (
          <Textarea
            value={options.exclusions}
            onChange={(e) => update({ exclusions: e.target.value })}
            placeholder="Topics to exclude from AI generation..."
            className="min-h-[80px] text-sm resize-none bg-background border border-border/80 focus:border-primary focus:border-[1.5px] focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg"
            rows={3}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center gap-3 pb-5">
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
            {configuredCount > 0
              ? `${configuredCount} of ${SECTIONS.length} configured`
              : "Set up how AI generates your course content"}
          </p>
        </div>
        {/* Progress dots */}
        <div className="flex items-center gap-1">
          {SECTIONS.map((s) => (
            <div
              key={s.id}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                s.getSummary(options) ? "bg-primary" : "bg-border"
              )}
            />
          ))}
        </div>
      </div>

      {/* Accordion sections */}
      <div className="rounded-xl border border-border/70 overflow-hidden divide-y divide-border/50">
        {SECTIONS.map((section) => {
          const isExpanded = expandedId === section.id;
          const summary = section.getSummary(options);
          const Icon = section.icon;

          return (
            <div key={section.id}>
              {/* Row header */}
              <button
                type="button"
                onClick={() => toggle(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors",
                  isExpanded ? "bg-muted/40" : "hover:bg-muted/25"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                    summary ? "bg-primary/10" : "bg-muted"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      summary ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {section.label}
                  </p>
                  {summary && !isExpanded && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {summary}
                    </p>
                  )}
                </div>
                {summary && !isExpanded && (
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                )}
                <ChevronRight
                  className={cn(
                    "w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200",
                    isExpanded && "rotate-90"
                  )}
                />
              </button>

              {/* Expanded content */}
              <div
                className={cn(
                  "grid transition-all duration-200 ease-in-out",
                  isExpanded
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <div className="px-4 pb-4 pt-1">
                    {renderContent(section.id)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Done */}
      <div className="flex justify-end pt-5">
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
