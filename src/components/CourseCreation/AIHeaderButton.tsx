import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
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
  const [savedOnce, setSavedOnce] = useState(false);

  if (!aiOptions || !aiOptions.enabled) return null;

  const isConfigured = !!(
    aiOptions.bloomsTaxonomy.length > 0 ||
    aiOptions.intendedLearners ||
    aiOptions.guidelines ||
    aiOptions.exclusions ||
    aiOptions.supportingDocuments.length > 0
  );

  const isLocked = savedOnce && isConfigured;

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setOpen(true)}
            className="relative group"
          >
            {/* Outer glow ring */}
            <div className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300",
              "bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5",
              "ring-2 ring-primary/30 group-hover:ring-primary/50",
              "group-hover:shadow-[0_0_12px_hsl(var(--primary)/0.25)]",
              open && "ring-primary/60 shadow-[0_0_16px_hsl(var(--primary)/0.3)]"
            )}>
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            {/* Status dot */}
            <span className={cn(
              "absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-background",
              isLocked ? "bg-primary" : "bg-destructive/70 animate-pulse"
            )} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          AI Support {isLocked ? "(Locked)" : "(Setup required)"}
        </TooltipContent>
      </Tooltip>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-[420px] p-0 flex flex-col gap-0">
          {/* Header */}
          <SheetHeader className="px-5 pt-5 pb-4 border-b border-border/60 space-y-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-1 ring-primary/20">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <SheetTitle className="text-base font-bold">AI Support</SheetTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isLocked ? "Your configuration is active" : "Set up your AI preferences"}
                </p>
              </div>
              {isLocked && (
                <div className="flex items-center gap-1 text-[11px] text-primary bg-primary/10 px-2.5 py-1 rounded-full font-medium">
                  <Lock className="w-3 h-3" />
                  Active
                </div>
              )}
            </div>
          </SheetHeader>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">
            {/* Notice */}
            {!isLocked && (
              <div className="flex gap-3 items-start p-3.5 rounded-xl bg-primary/5 border border-primary/15">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">One-time setup</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Configure your AI preferences below. Once saved, these settings will guide all AI-generated content for this course.
                  </p>
                </div>
              </div>
            )}

            {/* Supporting Documents */}
            <ConfigSection
              icon={Upload}
              label="Supporting Documents"
              description="Reference materials for AI context"
            >
              {aiOptions.supportingDocuments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {aiOptions.supportingDocuments.map((doc, i) => (
                    <Badge key={i} variant="secondary" className="gap-1.5 text-xs font-normal h-7 pr-1.5">
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
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              )}
              {!isLocked && onOptionsChange ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary', 'bg-primary/5', 'text-primary'); }}
                  onDragLeave={(e) => { e.currentTarget.classList.remove('border-primary', 'bg-primary/5', 'text-primary'); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-primary', 'bg-primary/5', 'text-primary');
                    const files = Array.from(e.dataTransfer.files);
                    if (files.length > 0) {
                      const newDocs = files.map(f => f.name);
                      onOptionsChange({
                        ...aiOptions,
                        supportingDocuments: [...aiOptions.supportingDocuments, ...newDocs],
                      });
                    }
                  }}
                  onClick={() =>
                    onOptionsChange({
                      ...aiOptions,
                      supportingDocuments: [
                        ...aiOptions.supportingDocuments,
                        `Document_${Date.now().toString(36)}.pdf`,
                      ],
                    })
                  }
                  className="w-full border-2 border-dashed border-border/80 rounded-xl py-8 text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Drop files here or click to upload</span>
                  <span className="text-xs text-muted-foreground/70">PDF, DOCX, TXT — up to 20MB each</span>
                </div>
              ) : aiOptions.supportingDocuments.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No documents uploaded</p>
              ) : null}
            </ConfigSection>

            <div className="border-t border-border/40" />

            {/* Bloom's Taxonomy */}
            <ConfigSection
              icon={Brain}
              label="Bloom's Taxonomy"
              description="Cognitive levels for content generation"
            >
              <div className="flex flex-wrap gap-2">
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
                        "px-5 py-2.5 rounded-full text-[0.938rem] font-medium border-2 transition-all flex items-center gap-1.5",
                        selected
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-background text-muted-foreground border-border",
                        !isLocked && !selected && "hover:border-primary/40 hover:text-foreground",
                        isLocked && "cursor-default"
                      )}
                    >
                      {selected && <Check className="w-3.5 h-3.5" />}
                      {level}
                    </button>
                  );
                })}
              </div>
            </ConfigSection>

            <div className="border-t border-border/40" />

            {/* Intended Learners */}
            <ConfigSection
              icon={Users}
              label="Intended Learners"
              description="Target audience experience level"
            >
              <div className="grid grid-cols-3 gap-2">
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
                        "py-3 rounded-lg text-[0.938rem] font-medium border-2 transition-all",
                        selected
                          ? "bg-primary/10 text-primary border-primary shadow-sm"
                          : "bg-background text-muted-foreground border-border",
                        !isLocked && !selected && "hover:border-primary/40",
                        isLocked && "cursor-default"
                      )}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </ConfigSection>

            <div className="border-t border-border/40" />

            {/* Guidelines */}
            <ConfigSection
              icon={BookOpen}
              label="Course Guidelines"
              description="Instructions for AI content generation"
            >
              {isLocked ? (
                <p className="text-sm text-foreground/80 leading-relaxed bg-muted/50 rounded-lg px-3 py-2.5">
                  {aiOptions.guidelines || <span className="italic text-muted-foreground">Not specified</span>}
                </p>
              ) : (
                <Textarea
                  value={aiOptions.guidelines}
                  onChange={(e) => {
                    onOptionsChange?.({ ...aiOptions, guidelines: e.target.value });
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                  placeholder="Describe specific guidelines for AI generation..."
                  className="min-h-[90px] text-sm resize-none bg-background border border-border/80 focus:border-primary focus:border-[1.5px] focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg overflow-hidden"
                  rows={3}
                />
              )}
            </ConfigSection>

            <div className="border-t border-border/40" />

            {/* Exclusions */}
            <ConfigSection
              icon={ShieldX}
              label="Exclusions"
              description="Topics the AI should avoid"
            >
              {isLocked ? (
                <p className="text-sm text-foreground/80 leading-relaxed bg-muted/50 rounded-lg px-3 py-2.5">
                  {aiOptions.exclusions || <span className="italic text-muted-foreground">Not specified</span>}
                </p>
              ) : (
                <Textarea
                  value={aiOptions.exclusions}
                  onChange={(e) => {
                    onOptionsChange?.({ ...aiOptions, exclusions: e.target.value });
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                  placeholder="Topics or content to exclude..."
                  className="min-h-[90px] text-sm resize-none bg-background border border-border/80 focus:border-primary focus:border-[1.5px] focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg overflow-hidden"
                  rows={3}
                />
              )}
            </ConfigSection>
          </div>

          {/* Footer */}
          {!isLocked && onOptionsChange && (
            <div className="px-5 py-4 border-t border-border/60 bg-background">
              <Button
                className="w-full rounded-full gap-2 h-11 text-sm font-semibold"
                onClick={() => { setSavedOnce(true); setOpen(false); }}
              >
                <Check className="w-4 h-4" />
                Save & Apply Configuration
              </Button>
              <p className="text-[11px] text-muted-foreground text-center mt-2">
                Configuration will be locked after saving
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function ConfigSection({
  icon: Icon,
  label,
  description,
  children,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
