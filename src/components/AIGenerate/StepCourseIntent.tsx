import { AIGenerateState } from "@/pages/AIGenerateCourse";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Sparkles, Info, Loader2, X, FileText, Plus, Minus, Layers, File, Download, AlertCircle, Check, Timer, Coins } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TitleAutocomplete } from "./TitleAutocomplete";
import { CONTENT_DEPTH_TIERS, type ContentDepth } from "@/components/Dashboard/AIOptionsPanel";
import blueprintImportIllustration from "@/assets/blueprint-import.png";
import blueprintAiIllustration from "@/assets/blueprint-ai.png";

interface StepCourseIntentProps {
  state: AIGenerateState;
  onChange: (partial: Partial<AIGenerateState>) => void;
  errors?: Record<string, string>;
}

const DUMMY_SUGGESTIONS: Record<string, string> = {
  default:
    "Equip learners with practical skills and foundational knowledge they can immediately apply in real-world scenarios.",
  machine:
    "Enable learners to understand core ML algorithms, evaluate model performance, and deploy simple predictive models.",
  leadership:
    "Help new managers build strong teams by improving communication, feedback, and performance coaching skills.",
  design:
    "Empower learners to apply design thinking principles and create user-centered solutions through iterative prototyping.",
  safety:
    "Ensure employees can identify workplace hazards, follow safety protocols, and respond effectively to emergencies.",
  data:
    "Give learners the ability to collect, clean, analyze, and visualize data to support evidence-based decision making.",
};

function pickSuggestion(title: string): string {
  const lower = title.toLowerCase();
  for (const [key, value] of Object.entries(DUMMY_SUGGESTIONS)) {
    if (key !== "default" && lower.includes(key)) return value;
  }
  return DUMMY_SUGGESTIONS.default;
}

export function StepCourseIntent({ state, onChange, errors = {} }: StepCourseIntentProps) {
  const [aiLoading, setAiLoading] = useState(false);
  const showAskAI = state.title.trim().length >= 2;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = useCallback((files: FileList | null) => {
    if (!files) return;
    const accepted = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "text/plain"];
    const newNames: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (accepted.includes(f.type) || f.name.match(/\.(pdf|docx?|pptx?|txt)$/i)) {
        newNames.push(f.name);
      }
    }
    if (newNames.length > 0) {
      onChange({ supportingDocuments: [...state.supportingDocuments, ...newNames] });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [state.supportingDocuments, onChange]);

  const removeFile = useCallback((index: number) => {
    onChange({ supportingDocuments: state.supportingDocuments.filter((_, i) => i !== index) });
  }, [state.supportingDocuments, onChange]);

  const handleAskAI = useCallback(() => {
    if (aiLoading) return;
    setAiLoading(true);
    setTimeout(() => {
      onChange({ intendedLearners: pickSuggestion(state.title) });
      setAiLoading(false);
    }, 900);
  }, [state.title, aiLoading, onChange]);

  return (
    <div className="space-y-5">
      {/* Hero banner */}
      <div className="flex items-center gap-2.5 rounded-xl border border-primary/15 px-3 py-2 bg-secondary">
        <Info className="w-4 h-4 text-primary shrink-0" aria-hidden="true" focusable="false" />
        <p className="text-[13px] text-foreground leading-snug">
          Upload relevant documents and answer a few questions to generate your course content.
        </p>
      </div>

      {/* Course Title */}
      <div data-field="title">
        <label htmlFor="course-title" className="text-base font-semibold text-foreground mb-2 block">
          Course Title <span className="text-destructive ml-0.5" aria-hidden="true">*</span>
        </label>
        <TitleAutocomplete
          id="course-title"
          value={state.title}
          onChange={(v) => onChange({ title: v })}
          placeholder="What will you teach?"
        />
        {errors.title ? (
          <p role="alert" className="text-[11px] sm:text-xs text-destructive mt-1.5 sm:mt-2 font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3" aria-hidden="true" focusable="false" />
            {errors.title}
          </p>
        ) : (
          <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1.5 sm:mt-2">
            💡 Used as the primary prompt for AI content generation
          </p>
        )}
      </div>

      {/* Content Depth */}
      <div data-field="contentDepth" className={cn("rounded-xl border bg-card p-4", errors?.contentDepth ? "border-destructive" : "border-border")}>
        <div className="mb-2.5">
          <div className="text-[16px] font-semibold text-foreground leading-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
            Content Depth
            <span className="text-destructive" aria-hidden="true">*</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Choose how thorough AI-generated content should be. Locked after creation.
          </p>
        </div>
        <div
          role="radiogroup"
          aria-label="Content depth"
          aria-required="true"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {CONTENT_DEPTH_TIERS.map((tier) => {
            const Icon = tier.icon;
            const isActive = state.contentDepth === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => onChange({ contentDepth: tier.id as ContentDepth })}
                className={cn(
                  "group relative flex flex-col text-left rounded-2xl border p-5 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isActive
                    ? "border-primary/40 bg-primary/[0.03] shadow-[0_10px_28px_-10px_hsl(var(--primary)/0.18),0_4px_10px_-4px_hsl(var(--primary)/0.08)]"
                    : "border-border bg-background shadow-[0_2px_8px_-4px_hsl(0_0%_0%/0.04)] hover:border-primary/30 hover:bg-muted/30 hover:shadow-[0_12px_32px_-10px_hsl(0_0%_0%/0.08),0_4px_12px_-4px_hsl(var(--primary)/0.06)] hover:-translate-y-0.5"
                )}
              >
                <span
                  className={cn(
                    "absolute top-4 right-4 inline-flex items-center justify-center w-5 h-5 rounded-full border transition-colors duration-200",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background group-hover:border-primary/40"
                  )}
                  aria-hidden="true"
                >
                  {isActive && <Check className="w-3 h-3" strokeWidth={3} />}
                </span>

                {tier.recommended && (
                  <span className="absolute -top-2 right-11 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background border border-border text-[10px] font-semibold text-foreground shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
                    Recommended
                  </span>
                )}

                <div className="flex items-center gap-3.5 mb-4">
                  <span
                    className={cn(
                      "inline-flex items-center justify-center w-11 h-11 rounded-full transition-colors duration-200",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground group-hover:bg-primary/[0.08] group-hover:text-primary"
                    )}
                    aria-hidden="true"
                  >
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                  </span>
                  <div className="min-w-0 pr-6">
                    <div
                      className={cn(
                        "leading-tight tracking-tight transition-colors duration-200",
                        isActive
                          ? "text-[15px] font-bold text-primary"
                          : "text-[13px] font-semibold text-foreground"
                      )}
                    >
                      {tier.label}
                    </div>
                    <div
                      className={cn(
                        "text-[11px] font-medium leading-tight mt-0.5",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {tier.tagline}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-grow">
                  {tier.description}
                </p>
                <div className="flex items-center gap-2.5 mt-auto">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                    <Timer className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                    {tier.speed}
                  </span>
                  <span className="w-px h-3 bg-border" aria-hidden="true" />
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                    <Coins className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                    {tier.credits}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        {errors?.contentDepth && (
          <p role="alert" className="text-xs text-destructive mt-2 font-medium">{errors.contentDepth}</p>
        )}
      </div>

      {/* Learning Outcome — hidden for now */}

      {/* Blueprint source selector */}
      <div className="space-y-2">
        <label className="text-base font-semibold text-foreground">
          Course Blueprint <span className="text-destructive ml-0.5" aria-hidden="true">*</span>
        </label>
        <p className="text-xs text-muted-foreground -mt-1.5">
          Choose how you'd like to create the course structure.
        </p>

        <div role="radiogroup" aria-label="Blueprint source" className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0">
          {/* Option A: Import outline */}
          <button
            type="button"
            role="radio"
            aria-checked={state.blueprintSource === "import"}
            onClick={() => onChange({ blueprintSource: "import" })}
            className={`group relative flex flex-col items-start gap-3 p-4 rounded-xl border-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              state.blueprintSource === "import"
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-background hover:border-primary/40 hover:bg-muted/30"
            }`}
          >
            <div className="w-full h-28 rounded-lg flex items-center justify-center bg-white border border-border/60 overflow-hidden">
              <img
                src={blueprintImportIllustration}
                alt=""
                role="presentation"
                loading="lazy"
                width={768}
                height={768}
                className="h-24 w-auto object-contain"
              />
            </div>
            <div className="space-y-0.5">
              <div className="text-sm font-semibold text-foreground">Import Course Outline</div>
              <div className="text-xs text-muted-foreground leading-snug">
                Upload an existing outline or reference docs (PDF, DOCX, PPTX, TXT).
              </div>
            </div>
            <span
              className={`absolute top-3 left-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                state.blueprintSource === "import"
                  ? "border-primary bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]"
                  : "border-muted-foreground/30 bg-background"
              }`}
              aria-hidden="true"
            >
              <span
                className={`rounded-full bg-primary-foreground transition-all duration-300 ${
                  state.blueprintSource === "import"
                    ? "w-2 h-2 opacity-100 scale-100"
                    : "w-0 h-0 opacity-0 scale-0"
                }`}
              />
            </span>
          </button>

          {/* Option B: Generate with AI */}
          <button
            type="button"
            role="radio"
            aria-checked={state.blueprintSource === "ai"}
            onClick={() => onChange({ blueprintSource: "ai" })}
            className={`group relative flex flex-col items-start gap-3 p-4 rounded-xl border-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              state.blueprintSource === "ai"
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-background hover:border-primary/40 hover:bg-muted/30"
            }`}
          >
            <div className="w-full h-28 rounded-lg flex items-center justify-center bg-white border border-border/60 overflow-hidden">
              <img
                src={blueprintAiIllustration}
                alt=""
                role="presentation"
                loading="lazy"
                width={768}
                height={768}
                className="h-24 w-auto object-contain"
              />
            </div>
            <div className="space-y-0.5">
              <div className="text-sm font-semibold text-foreground">Generate Blueprint with AI</div>
              <div className="text-xs text-muted-foreground leading-snug">
                Let AI craft the structure — define the number of sections and pages.
              </div>
            </div>
            <span
              className={`absolute top-3 left-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                state.blueprintSource === "ai"
                  ? "border-primary bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]"
                  : "border-muted-foreground/30 bg-background"
              }`}
              aria-hidden="true"
            >
              <span
                className={`rounded-full bg-primary-foreground transition-all duration-300 ${
                  state.blueprintSource === "ai"
                    ? "w-2 h-2 opacity-100 scale-100"
                    : "w-0 h-0 opacity-0 scale-0"
                }`}
              />
            </span>
          </button>
        </div>

        {/* Conditional content for selected option */}
        {state.blueprintSource === "import" && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="pt-2 space-y-2"
          >
            {/* Download template row */}
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/15 bg-secondary/60 px-3 py-2.5">
              <div className="flex items-center gap-1.5 mr-1">
                <Download className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
                <span className="text-xs font-semibold text-foreground">Download Template:</span>
              </div>
              {[
                { label: "PDF", ext: "pdf", color: "text-rose-600", bg: "bg-rose-50 hover:bg-rose-100 border-rose-200" },
                { label: "Word", ext: "docx", color: "text-blue-600", bg: "bg-blue-50 hover:bg-blue-100 border-blue-200" },
                { label: "PPT", ext: "pptx", color: "text-orange-600", bg: "bg-orange-50 hover:bg-orange-100 border-orange-200" },
                { label: "TXT", ext: "txt", color: "text-slate-600", bg: "bg-slate-50 hover:bg-slate-100 border-slate-200" },
              ].map((t) => (
                <button
                  key={t.ext}
                  type="button"
                  onClick={() => {
                    const blob = new Blob([`Course Outline Template (.${t.ext})\n\nSection 1: ...\n  Page 1.1: ...\n  Page 1.2: ...\n\nSection 2: ...\n  Page 2.1: ...\n`], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `course-outline-template.${t.ext}`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-colors ${t.bg} ${t.color} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
                  aria-label={`Download ${t.label} template`}
                >
                  <FileText className="w-3 h-3" aria-hidden="true" focusable="false" />
                  {t.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-1.5 py-5 rounded-xl border-2 border-dashed border-primary/40 bg-primary/[0.04] hover:border-primary hover:bg-primary/10 transition-all text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Upload course outline documents"
            >
              <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                <Upload className="w-4 h-4" aria-hidden="true" focusable="false" />
              </div>
              <span className="text-sm font-medium">
                Drop files or <span className="text-primary font-semibold">click to upload</span>
              </span>
              <span className="text-[11px] text-muted-foreground">PDF, DOCX, PPTX, or TXT</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
              multiple
              className="hidden"
              onChange={(e) => handleFilesSelected(e.target.files)}
              aria-label="Select course outline documents"
            />

            {/* Relevance note */}
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" aria-hidden="true" focusable="false" />
              <p className="text-[11px] text-amber-900 leading-snug italic">
                Please ensure that the uploaded documents are relevant to the course structure, as the content will be generated based on the uploaded materials.
              </p>
            </div>

            {state.supportingDocuments.length > 0 && (
              <div className="space-y-1.5 mt-2">
                {state.supportingDocuments.map((name, idx) => (
                  <div key={`${name}-${idx}`} className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" focusable="false" />
                    <span className="text-sm text-foreground truncate flex-1">{name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="p-0.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      aria-label={`Remove ${name}`}
                    >
                      <X className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {state.blueprintSource === "ai" && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="pt-2 space-y-3"
          >
            {/* Twin steppers */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  id: "bp-sections",
                  label: "Sections",
                  icon: Layers,
                  value: state.blueprintSections,
                  set: (n: number) => onChange({ blueprintSections: n }),
                },
                {
                  id: "bp-pages",
                  label: "Pages / Section",
                  icon: File,
                  value: state.blueprintPages,
                  set: (n: number) => onChange({ blueprintPages: n }),
                },
              ].map((f) => {
                const Icon = f.icon;
                const dec = () => f.set(Math.max(1, f.value - 1));
                const inc = () => f.set(Math.min(20, f.value + 1));
                return (
                  <div
                    key={f.id}
                    className="group relative rounded-xl border border-border bg-gradient-to-br from-background to-muted/30 p-3 transition-all hover:border-primary/30 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <Icon className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
                      <label htmlFor={f.id} className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {f.label}
                      </label>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={dec}
                        disabled={f.value <= 1}
                        className="w-8 h-8 rounded-full border border-border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary disabled:opacity-40 disabled:hover:bg-background disabled:hover:text-foreground disabled:hover:border-border flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
                        aria-label={`Decrease ${f.label}`}
                      >
                        <Minus className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                      </button>
                      <input
                        id={f.id}
                        type="number"
                        min={1}
                        max={20}
                        value={f.value}
                        onChange={(e) => f.set(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                        className="w-10 mx-auto text-center text-2xl font-bold text-foreground bg-transparent border-0 border-b border-border focus-visible:border-primary outline-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-colors pb-0.5"
                        aria-label={f.label}
                      />
                      <button
                        type="button"
                        onClick={inc}
                        disabled={f.value >= 20}
                        className="w-8 h-8 rounded-full border border-border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary disabled:opacity-40 disabled:hover:bg-background disabled:hover:text-foreground disabled:hover:border-border flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
                        aria-label={`Increase ${f.label}`}
                      >
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Summary */}
            <p className="text-sm text-muted-foreground leading-snug">
              AI will generate <span className="font-semibold text-foreground">{state.blueprintSections}</span> section{state.blueprintSections !== 1 ? "s" : ""}, each with <span className="font-semibold text-foreground">{state.blueprintPages}</span> page{state.blueprintPages !== 1 ? "s" : ""} — <span className="font-medium text-primary">{state.blueprintSections * state.blueprintPages} total page{state.blueprintSections * state.blueprintPages !== 1 ? "s" : ""}</span>.
            </p>

            {/* Supporting Documents */}
            <div className="pt-2 space-y-2">
              <div>
                <label className="text-base font-semibold text-foreground block">
                  Inclusion of Supporting Documents
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Optionally provide reference materials to inform AI generation.
                </p>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-1.5 py-5 rounded-xl border-2 border-dashed border-primary/40 bg-primary/[0.04] hover:border-primary hover:bg-primary/10 transition-all text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Upload supporting documents"
              >
                <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                  <Upload className="w-4 h-4" aria-hidden="true" focusable="false" />
                </div>
                <span className="text-sm font-medium">
                  Drop files or <span className="text-primary font-semibold">click to upload</span>
                </span>
                <span className="text-[11px] text-muted-foreground">PDF, DOC, DOCX, or TXT • Max 25MB per file</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                multiple
                className="hidden"
                onChange={(e) => handleFilesSelected(e.target.files)}
                aria-label="Select supporting documents"
              />

              {state.supportingDocuments.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  {state.supportingDocuments.map((name, idx) => (
                    <div key={`${name}-${idx}`} className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" focusable="false" />
                      <span className="text-sm text-foreground truncate flex-1">{name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="p-0.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label={`Remove ${name}`}
                      >
                        <X className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
