import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Upload,
  Brain,
  Users,
  BookOpen,
  ShieldX,
  ChevronRight,
  FileText,
  X,
  Check,
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

interface AIOptionsPanelProps {
  options: AIOptions;
  onChange: (options: AIOptions) => void;
}

type ActiveSection = "documents" | "blooms" | "learners" | "guidelines" | "exclusions" | null;

export function AIOptionsPanel({ options, onChange }: AIOptionsPanelProps) {
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);

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

  const toggle = (section: ActiveSection) =>
    setActiveSection((prev) => (prev === section ? null : section));

  const sections = [
    {
      key: "documents" as const,
      icon: Upload,
      label: "Supporting Documents",
      hint: options.supportingDocuments.length
        ? `${options.supportingDocuments.length} file(s)`
        : undefined,
    },
    {
      key: "blooms" as const,
      icon: Brain,
      label: "Bloom's Taxonomy",
      hint: options.bloomsTaxonomy.length
        ? options.bloomsTaxonomy.join(", ")
        : undefined,
    },
    {
      key: "learners" as const,
      icon: Users,
      label: "Intended Learners",
      hint: options.intendedLearners || undefined,
    },
    {
      key: "guidelines" as const,
      icon: BookOpen,
      label: "Course Guidelines",
      hint: options.guidelines ? "Configured" : undefined,
    },
    {
      key: "exclusions" as const,
      icon: ShieldX,
      label: "Exclusions",
      hint: options.exclusions ? "Configured" : undefined,
    },
  ];

  return (
    <div className="space-y-3">
      {/* Toggle row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-7 h-7 rounded-md flex items-center justify-center transition-colors duration-300",
              options.enabled ? "bg-primary/15" : "bg-muted"
            )}
          >
            <Sparkles
              className={cn(
                "w-3.5 h-3.5 transition-colors duration-300",
                options.enabled ? "text-primary" : "text-muted-foreground"
              )}
            />
          </div>
          <span className="text-sm font-semibold text-foreground">
            Enable AI Support
          </span>
        </div>
        <Switch
          checked={options.enabled}
          onCheckedChange={(checked) => {
            update({ enabled: checked });
            if (!checked) setActiveSection(null);
          }}
        />
      </div>

      {/* Compact section list — only visible when enabled */}
      <div
        className={cn(
          "grid transition-all duration-400 ease-in-out",
          options.enabled
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-1 pt-2 border-t border-border/50">
            {sections.map(({ key, icon: Icon, label, hint }) => {
              const isOpen = activeSection === key;
              return (
                <div key={key}>
                  {/* Row trigger */}
                  <button
                    type="button"
                    onClick={() => toggle(key)}
                    className={cn(
                      "flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md text-left transition-colors",
                      isOpen
                        ? "bg-primary/5"
                        : "hover:bg-muted/60"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs font-medium text-foreground flex-1">
                      {label}
                    </span>
                    {hint && !isOpen && (
                      <span className="text-[10px] text-primary font-medium truncate max-w-[120px]">
                        {hint}
                      </span>
                    )}
                    <ChevronRight
                      className={cn(
                        "w-3 h-3 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-90"
                      )}
                    />
                  </button>

                  {/* Inline content */}
                  <div
                    className={cn(
                      "grid transition-all duration-300 ease-in-out",
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="pl-8 pr-2 py-2">
                        {key === "documents" && (
                          <div className="space-y-2">
                            {options.supportingDocuments.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {options.supportingDocuments.map((doc, i) => (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className="gap-1 pr-1 text-[10px] font-normal h-6"
                                  >
                                    <FileText className="w-3 h-3" />
                                    {doc}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeDocument(i);
                                      }}
                                      className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                                    >
                                      <X className="w-2.5 h-2.5" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={handleFileSelect}
                              className="w-full border border-dashed border-border rounded-md py-2 text-[11px] text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Upload className="w-3 h-3" />
                              Upload documents
                            </button>
                          </div>
                        )}

                        {key === "blooms" && (
                          <div className="flex flex-wrap gap-1.5">
                            {BLOOMS_LEVELS.map((level) => {
                              const selected =
                                options.bloomsTaxonomy.includes(level);
                              return (
                                <button
                                  key={level}
                                  type="button"
                                  onClick={() => toggleBloom(level)}
                                  className={cn(
                                    "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all duration-200 flex items-center gap-1",
                                    selected
                                      ? "bg-primary text-primary-foreground border-primary"
                                      : "bg-background text-muted-foreground border-border hover:border-primary/40"
                                  )}
                                >
                                  {selected && <Check className="w-3 h-3" />}
                                  {level}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {key === "learners" && (
                          <div className="flex gap-1.5">
                            {LEARNER_LEVELS.map((level) => {
                              const selected =
                                options.intendedLearners === level;
                              return (
                                <button
                                  key={level}
                                  type="button"
                                  onClick={() =>
                                    update({ intendedLearners: level })
                                  }
                                  className={cn(
                                    "flex-1 py-1.5 rounded-md text-[11px] font-medium border transition-all duration-200",
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
                        )}

                        {key === "guidelines" && (
                          <Textarea
                            value={options.guidelines}
                            onChange={(e) =>
                              update({ guidelines: e.target.value })
                            }
                            placeholder="Specific guidelines for AI generation..."
                            className="min-h-[52px] text-xs resize-none border-border focus:border-primary focus:border-[1.5px] focus-visible:ring-0 focus-visible:ring-offset-0"
                            rows={2}
                          />
                        )}

                        {key === "exclusions" && (
                          <Textarea
                            value={options.exclusions}
                            onChange={(e) =>
                              update({ exclusions: e.target.value })
                            }
                            placeholder="Topics or content to exclude..."
                            className="min-h-[52px] text-xs resize-none border-border focus:border-primary focus:border-[1.5px] focus-visible:ring-0 focus-visible:ring-offset-0"
                            rows={2}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
