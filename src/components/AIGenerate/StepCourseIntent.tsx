import { AIGenerateState } from "@/pages/AIGenerateCourse";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Sparkles, Info, Loader2, X, FileText, Plus, Minus, Layers, File } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { TitleAutocomplete } from "./TitleAutocomplete";
import blueprintImportIllustration from "@/assets/blueprint-import.png";
import blueprintAiIllustration from "@/assets/blueprint-ai.png";

interface StepCourseIntentProps {
  state: AIGenerateState;
  onChange: (partial: Partial<AIGenerateState>) => void;
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

export function StepCourseIntent({ state, onChange }: StepCourseIntentProps) {
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
      <div className="flex items-center gap-2.5 rounded-xl border border-primary/15 px-4 py-3 bg-secondary">
        <Info className="w-4 h-4 text-primary shrink-0" aria-hidden="true" focusable="false" />
        <p className="text-[13px] text-foreground leading-snug">
          Upload relevant documents and answer a few questions to generate your course content.
        </p>
      </div>

      {/* Course Title */}
      <div>
        <label htmlFor="course-title" className="text-base font-semibold text-foreground mb-2 block">
          Course Title <span className="text-destructive ml-0.5" aria-hidden="true">*</span>
        </label>
        <TitleAutocomplete
          id="course-title"
          value={state.title}
          onChange={(v) => onChange({ title: v })}
          placeholder="What will you teach?"
        />
        <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1.5 sm:mt-2">
          💡 Used as the primary prompt for AI content generation
        </p>
      </div>

      {/* Learning Outcome */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="learning-outcome" className="text-base font-semibold text-foreground">
            What should learners gain? <span className="text-destructive ml-0.5" aria-hidden="true">*</span>
          </label>

          {showAskAI && (
            <motion.button
              type="button"
              onClick={handleAskAI}
              disabled={aiLoading}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-primary/10 transition-colors disabled:opacity-60"
              aria-label="Ask AI to suggest a learning outcome"
            >
              {aiLoading ? (
                <Loader2 className="w-3 h-3 animate-spin text-primary" aria-hidden="true" focusable="false" />
              ) : (
                <>
                  <Sparkles className="w-3 h-3" style={{ stroke: 'url(#ai-gradient-learning)' }} aria-hidden="true" focusable="false" />
                  <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
                    <defs>
                      <linearGradient id="ai-gradient-learning" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(211, 100%, 50%)" />
                        <stop offset="100%" stopColor="hsl(270, 80%, 55%)" />
                      </linearGradient>
                    </defs>
                  </svg>
                </>
              )}
              <span className="text-[10px] font-medium bg-gradient-to-r from-[hsl(211,100%,50%)] to-[hsl(270,80%,55%)] bg-clip-text text-transparent">
                {aiLoading ? "Generating…" : "Ask AI"}
              </span>
            </motion.button>
          )}
        </div>

        <Textarea
          id="learning-outcome"
          value={state.intendedLearners}
          onChange={(e) => onChange({ intendedLearners: e.target.value })}
          placeholder="Describe the key skills or knowledge learners will walk away with…"
          className="min-h-[80px] resize-none rounded-xl text-sm"
        />
      </div>

      {/* Blueprint source selector */}
      <div className="space-y-2">
        <label className="text-base font-semibold text-foreground">
          Course Blueprint <span className="text-destructive ml-0.5" aria-hidden="true">*</span>
        </label>
        <p className="text-xs text-muted-foreground -mt-0.5">
          Choose how you'd like to create the course structure.
        </p>

        <div role="radiogroup" aria-label="Blueprint source" className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
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
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-1.5 py-5 rounded-xl border-2 border-dashed border-border hover:border-primary/40 bg-background transition-colors text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Upload course outline documents"
            >
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Upload className="w-4 h-4" aria-hidden="true" focusable="false" />
              </div>
              <span className="text-sm font-medium">Upload files</span>
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
                        className="flex-1 text-center text-2xl font-bold text-foreground bg-transparent border-0 outline-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
          </motion.div>
        )}
      </div>
    </div>
  );
}
