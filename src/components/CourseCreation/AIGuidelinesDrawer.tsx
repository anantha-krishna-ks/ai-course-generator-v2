import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

interface AIGuidelinesDrawerProps {
  open: boolean;
  onClose: () => void;
  aiOptions: AIOptions | null;
  onOptionsChange?: (options: AIOptions) => void;
  scrollToSection?: string | null;
}

export function AIGuidelinesDrawer({ open, onClose, aiOptions, onOptionsChange, scrollToSection }: AIGuidelinesDrawerProps) {
  const [savedOnce, setSavedOnce] = useState(false);
  const [highlightGuidelines, setHighlightGuidelines] = useState(false);
  const guidelinesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && scrollToSection === 'guidelines' && guidelinesRef.current) {
      setHighlightGuidelines(false);
      setTimeout(() => {
        guidelinesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightGuidelines(true);
        setTimeout(() => setHighlightGuidelines(false), 2000);
      }, 350);
    } else if (!open) {
      setHighlightGuidelines(false);
    }
  }, [open, scrollToSection]);

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
      {/* Backdrop overlay inside dialog */}
      <div
        className={cn(
          "absolute inset-0 bg-black/40 z-[10] transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sliding drawer panel */}
      <div
        className={cn(
          "absolute top-0 right-0 h-full w-full sm:max-w-[420px] z-[11] bg-background border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-1 ring-primary/20">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-foreground">AI Support</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isLocked ? "Your configuration is active" : "Set up your AI preferences"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isLocked && (
                <div className="flex items-center gap-1 text-[11px] text-primary bg-primary/10 px-2.5 py-1 rounded-full font-medium">
                  <Lock className="w-3 h-3" />
                  Active
                </div>
              )}
              <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
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
          <ConfigSection icon={Upload} label="Supporting Documents" description="Reference materials for AI context">
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
                    onOptionsChange({ ...aiOptions, supportingDocuments: [...aiOptions.supportingDocuments, ...newDocs] });
                  }
                }}
                onClick={() =>
                  onOptionsChange({
                    ...aiOptions,
                    supportingDocuments: [...aiOptions.supportingDocuments, `Document_${Date.now().toString(36)}.pdf`],
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

          {/* Bloom's Taxonomy */}
          <ConfigSection icon={Brain} label="Bloom's Taxonomy" description="Cognitive levels for content generation">
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
                        bloomsTaxonomy: current.includes(level) ? current.filter((l) => l !== level) : [...current, level],
                      });
                    }}
                    className={cn(
                      "px-5 py-2.5 rounded-full text-[0.938rem] font-medium border-2 transition-all flex items-center gap-1.5",
                      selected ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background text-muted-foreground border-border",
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

          {/* Intended Learners */}
          <ConfigSection icon={Users} label="Intended Learners" description="Target audience experience level">
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
                      selected ? "bg-primary/10 text-primary border-primary shadow-sm" : "bg-background text-muted-foreground border-border",
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

          {/* Guidelines */}
          <div ref={guidelinesRef} className={cn(
            "rounded-xl transition-all duration-700",
            highlightGuidelines && "ring-2 ring-primary/50 ring-offset-2 ring-offset-background shadow-[0_0_20px_hsl(var(--primary)/0.15)]"
          )}>
            <ConfigSection icon={BookOpen} label="Course Guidelines" description="Instructions for AI content generation">
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
          </div>

          {/* Exclusions */}
          <ConfigSection icon={ShieldX} label="Exclusions" description="Topics the AI should avoid">
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
          <div className="px-5 py-4 border-t border-border/60 bg-background shrink-0">
            <Button
              className="w-full rounded-full gap-2 h-11 text-sm font-semibold"
              onClick={() => { setSavedOnce(true); onClose(); }}
            >
              <Check className="w-4 h-4" />
              Save & Apply Configuration
            </Button>
            <p className="text-[11px] text-muted-foreground text-center mt-2">
              Configuration will be locked after saving
            </p>
          </div>
        )}
      </div>
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
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
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
