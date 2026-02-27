import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  BrainCircuit,
  Upload,
  Brain,
  Users,
  BookOpen,
  ShieldX,
  FileText,
  X,
  Check,
  Lock,
  Info,
  Sparkles,
  Settings2,
} from "lucide-react";
import type { AIOptions } from "@/components/Dashboard/AIOptionsPanel";

const BLOOMS_LEVELS = [
  "Remember",
  "Understand",
  "Apply",
  "Analyze",
  "Evaluate",
  "Create",
];
const LEARNER_LEVELS = ["Beginners", "Intermediate", "Expert"] as const;

interface AIHeaderButtonProps {
  aiOptions: AIOptions | null;
  onOptionsChange?: (options: AIOptions) => void;
}

export function AIHeaderButton({ aiOptions, onOptionsChange }: AIHeaderButtonProps) {
  const [open, setOpen] = useState(false);

  // Not enabled — don't render anything
  if (!aiOptions || !aiOptions.enabled) return null;

  const isConfigured = !!(
    aiOptions.bloomsTaxonomy.length > 0 ||
    aiOptions.intendedLearners ||
    aiOptions.guidelines ||
    aiOptions.exclusions ||
    aiOptions.supportingDocuments.length > 0
  );

  // After first configure, lock it
  const isLocked = isConfigured;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "relative p-2 rounded-full transition-colors",
                "hover:bg-primary/10",
                open ? "bg-primary/10" : "bg-transparent"
              )}
            >
              <BrainCircuit className="w-[18px] h-[18px] text-primary" />
              {/* Active dot */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-background" />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          AI Support
        </TooltipContent>
      </Tooltip>

      <PopoverContent
        align="end"
        className="w-[340px] sm:w-[400px] p-0 rounded-xl shadow-lg border-border"
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/60">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">AI Support</p>
            <p className="text-[11px] text-muted-foreground">
              {isLocked ? "Configuration locked" : "Configure your AI preferences"}
            </p>
          </div>
          {isLocked && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-full">
              <Lock className="w-3 h-3" />
              Locked
            </div>
          )}
        </div>

        {/* Notice banner — friendly, non-anxious */}
        {!isLocked && (
          <div className="mx-4 mt-3 flex gap-2.5 items-start p-2.5 rounded-lg bg-primary/5 border border-primary/15">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] text-foreground/80 leading-relaxed">
              <span className="font-medium">One-time setup</span> — Take your time to configure these settings. 
              Once saved, they'll be applied throughout your course generation and can't be changed for this course.
            </p>
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[50vh] overflow-y-auto">
          {/* Supporting Documents */}
          <ConfigSection icon={Upload} label="Supporting Documents" isLocked={isLocked}>
            {aiOptions.supportingDocuments.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {aiOptions.supportingDocuments.map((doc, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 text-[11px] font-normal h-6 pr-1.5">
                    <FileText className="w-3 h-3" />
                    {doc}
                    {!isLocked && onOptionsChange && (
                      <button
                        type="button"
                        onClick={() =>
                          onOptionsChange({
                            ...aiOptions,
                            supportingDocuments: aiOptions.supportingDocuments.filter((_, idx) => idx !== i),
                          })
                        }
                        className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            ) : (
              !isLocked && onOptionsChange ? (
                <button
                  type="button"
                  onClick={() =>
                    onOptionsChange({
                      ...aiOptions,
                      supportingDocuments: [
                        ...aiOptions.supportingDocuments,
                        `Document_${Date.now().toString(36)}.pdf`,
                      ],
                    })
                  }
                  className="w-full border border-dashed border-border rounded-lg py-3 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload documents
                </button>
              ) : (
                <p className="text-xs text-muted-foreground italic">No documents uploaded</p>
              )
            )}
          </ConfigSection>

          {/* Bloom's Taxonomy */}
          <ConfigSection icon={Brain} label="Bloom's Taxonomy" isLocked={isLocked}>
            <div className="flex flex-wrap gap-1.5">
              {BLOOMS_LEVELS.map((level) => {
                const selected = aiOptions.bloomsTaxonomy.includes(level);
                return (
                  <button
                    key={level}
                    type="button"
                    disabled={isLocked}
                    onClick={() => {
                      if (!onOptionsChange || isLocked) return;
                      const current = aiOptions.bloomsTaxonomy;
                      onOptionsChange({
                        ...aiOptions,
                        bloomsTaxonomy: current.includes(level)
                          ? current.filter((l) => l !== level)
                          : [...current, level],
                      });
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all flex items-center gap-1",
                      selected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border",
                      !isLocked && !selected && "hover:border-primary/40",
                      isLocked && "cursor-default opacity-80"
                    )}
                  >
                    {selected && <Check className="w-3 h-3" />}
                    {level}
                  </button>
                );
              })}
            </div>
          </ConfigSection>

          {/* Intended Learners */}
          <ConfigSection icon={Users} label="Intended Learners" isLocked={isLocked}>
            <div className="flex gap-1.5">
              {LEARNER_LEVELS.map((level) => {
                const selected = aiOptions.intendedLearners === level;
                return (
                  <button
                    key={level}
                    type="button"
                    disabled={isLocked}
                    onClick={() => {
                      if (!onOptionsChange || isLocked) return;
                      onOptionsChange({ ...aiOptions, intendedLearners: level });
                    }}
                    className={cn(
                      "flex-1 py-1.5 rounded-md text-[11px] font-medium border transition-all",
                      selected
                        ? "bg-primary/10 text-primary border-primary"
                        : "bg-background text-muted-foreground border-border",
                      !isLocked && !selected && "hover:border-primary/40",
                      isLocked && "cursor-default opacity-80"
                    )}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </ConfigSection>

          {/* Guidelines */}
          <ConfigSection icon={BookOpen} label="Course Guidelines" isLocked={isLocked}>
            {isLocked ? (
              <p className="text-xs text-foreground/70 leading-relaxed">
                {aiOptions.guidelines || <span className="italic text-muted-foreground">Not specified</span>}
              </p>
            ) : (
              <Textarea
                value={aiOptions.guidelines}
                onChange={(e) => onOptionsChange?.({ ...aiOptions, guidelines: e.target.value })}
                placeholder="Specific guidelines for AI generation..."
                className="min-h-[60px] text-xs resize-none border-border focus:border-primary focus:border-[1.5px] focus-visible:ring-0 focus-visible:ring-offset-0"
                rows={2}
              />
            )}
          </ConfigSection>

          {/* Exclusions */}
          <ConfigSection icon={ShieldX} label="Exclusions" isLocked={isLocked}>
            {isLocked ? (
              <p className="text-xs text-foreground/70 leading-relaxed">
                {aiOptions.exclusions || <span className="italic text-muted-foreground">Not specified</span>}
              </p>
            ) : (
              <Textarea
                value={aiOptions.exclusions}
                onChange={(e) => onOptionsChange?.({ ...aiOptions, exclusions: e.target.value })}
                placeholder="Topics or content to exclude..."
                className="min-h-[60px] text-xs resize-none border-border focus:border-primary focus:border-[1.5px] focus-visible:ring-0 focus-visible:ring-offset-0"
                rows={2}
              />
            )}
          </ConfigSection>
        </div>

        {/* Footer — only show save when not locked */}
        {!isLocked && onOptionsChange && (
          <div className="px-4 py-3 border-t border-border/60 flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">
              This configuration is final once saved
            </p>
            <Button
              size="sm"
              className="rounded-full gap-1.5 h-8 px-4 text-xs"
              onClick={() => setOpen(false)}
            >
              <Check className="w-3.5 h-3.5" />
              Save & Lock
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function ConfigSection({
  icon: Icon,
  label,
  isLocked,
  children,
}: {
  icon: React.ElementType;
  label: string;
  isLocked: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-primary/70" />
        <span className="text-xs font-semibold text-foreground">{label}</span>
      </div>
      {children}
    </div>
  );
}
