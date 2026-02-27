import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Upload,
  Brain,
  Users,
  BookOpen,
  ShieldX,
  ChevronDown,
  FileText,
  X,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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

function OptionRow({
  icon: Icon,
  label,
  children,
  defaultOpen = false,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-muted/60 transition-colors group text-left">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <span className="flex-1 text-sm font-medium text-foreground">
          {label}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-2">
        <div className="pl-11 pt-1">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AIOptionsPanel({ options, onChange }: AIOptionsPanelProps) {
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
    // Simulate file names for now — in production, integrate with a file upload service
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
    <div className="space-y-3">
      {/* Toggle */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300",
              options.enabled
                ? "bg-primary/15"
                : "bg-muted"
            )}
          >
            <Sparkles
              className={cn(
                "w-4 h-4 transition-colors duration-300",
                options.enabled ? "text-primary" : "text-muted-foreground"
              )}
            />
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground">
              Enable AI Support
            </span>
            <p className="text-xs text-muted-foreground">
              AI-powered content & image generation
            </p>
          </div>
        </div>
        <Switch
          checked={options.enabled}
          onCheckedChange={(checked) => update({ enabled: checked })}
        />
      </div>

      {/* Expandable AI options */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-500 ease-in-out",
          options.enabled
            ? "max-h-[600px] opacity-100"
            : "max-h-0 opacity-0"
        )}
      >
        <div className="space-y-0.5 pt-2 border-t border-border/60">
          {/* Supporting Documents */}
          <OptionRow icon={Upload} label="Supporting Documents">
            <div className="space-y-2">
              {options.supportingDocuments.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {options.supportingDocuments.map((doc, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="gap-1 pr-1 text-xs font-normal"
                    >
                      <FileText className="w-3 h-3" />
                      {doc}
                      <button
                        type="button"
                        onClick={() => removeDocument(i)}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
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
                className="w-full border-2 border-dashed border-border rounded-lg py-3 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload documents
              </button>
            </div>
          </OptionRow>

          {/* Bloom's Taxonomy */}
          <OptionRow icon={Brain} label="Bloom's Taxonomy">
            <div className="flex flex-wrap gap-1.5">
              {BLOOMS_LEVELS.map((level) => {
                const selected = options.bloomsTaxonomy.includes(level);
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => toggleBloom(level)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200",
                      selected
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    )}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </OptionRow>

          {/* Intended Learners */}
          <OptionRow icon={Users} label="Intended Learners">
            <div className="flex gap-2">
              {LEARNER_LEVELS.map((level) => {
                const selected = options.intendedLearners === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => update({ intendedLearners: level })}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs font-medium border-2 transition-all duration-200",
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
          </OptionRow>

          {/* Course Guidelines */}
          <OptionRow icon={BookOpen} label="Course Guidelines">
            <Textarea
              value={options.guidelines}
              onChange={(e) => update({ guidelines: e.target.value })}
              placeholder="Describe any specific guidelines for AI content generation..."
              className="min-h-[60px] text-sm resize-none border-border focus:border-primary focus:border-[1.5px] focus-visible:ring-0 focus-visible:ring-offset-0"
              rows={2}
            />
          </OptionRow>

          {/* Exclusions */}
          <OptionRow icon={ShieldX} label="Exclusions">
            <Textarea
              value={options.exclusions}
              onChange={(e) => update({ exclusions: e.target.value })}
              placeholder="Topics or content to exclude from AI generation..."
              className="min-h-[60px] text-sm resize-none border-border focus:border-primary focus:border-[1.5px] focus-visible:ring-0 focus-visible:ring-offset-0"
              rows={2}
            />
          </OptionRow>
        </div>
      </div>
    </div>
  );
}
