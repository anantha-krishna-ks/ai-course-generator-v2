import { AIGenerateState } from "@/pages/AIGenerateCourse";
import { Upload, X, FileText, AlertCircle, Info, Check, Layers, Timer, Coins } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { TitleAutocomplete } from "./TitleAutocomplete";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FONT_OPTIONS, getFontStack } from "@/components/CourseCreation/FontSelectorDropdown";
import { CONTENT_DEPTH_TIERS, type ContentDepth } from "@/components/Dashboard/AIOptionsPanel";

interface StepDocumentIntentProps {
  state: AIGenerateState;
  onChange: (partial: Partial<AIGenerateState>) => void;
  errors?: Record<string, string>;
}

export function StepDocumentIntent({ state, onChange, errors = {} }: StepDocumentIntentProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const accepted = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/plain",
      ];
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
    },
    [state.supportingDocuments, onChange]
  );

  const removeFile = useCallback(
    (index: number) => {
      onChange({ supportingDocuments: state.supportingDocuments.filter((_, i) => i !== index) });
    },
    [state.supportingDocuments, onChange]
  );

  return (
    <div className="space-y-5">
      {/* Hero banner */}
      <div className="flex items-center gap-2.5 rounded-xl border border-primary/15 px-3 py-2 bg-secondary">
        <Info className="w-4 h-4 text-primary shrink-0" aria-hidden="true" focusable="false" />
        <p className="text-[13px] text-foreground leading-snug">
          Upload your document to convert it as-is into a structured course.
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
          language={state.language}
          onLanguageChange={(code) => onChange({ language: code })}
          placeholder="What will you teach?"
        />

        {errors.title ? (
          <p role="alert" className="text-[11px] sm:text-xs text-destructive mt-1.5 sm:mt-2 font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3" aria-hidden="true" focusable="false" />
            {errors.title}
          </p>
        ) : (
          <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1.5 sm:mt-2">
            💡 Used as the primary prompt for course generation
          </p>
        )}
      </div>

      {/* Upload Documents */}
      <div data-field="supportingDocuments" className="space-y-2">
        <label className="text-base font-semibold text-foreground">
          Upload Documents <span className="text-destructive ml-0.5" aria-hidden="true">*</span>
        </label>
        <p className="text-xs text-muted-foreground -mt-1.5">
          Your course will be created directly from the content of these documents.
        </p>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center gap-1.5 py-5 rounded-xl border-2 border-dashed border-primary/40 bg-primary/[0.04] hover:border-primary hover:bg-primary/10 transition-all text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Upload course documents"
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
          aria-label="Select course documents"
        />

        {errors.supportingDocuments && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/30 px-3 py-2"
          >
            <AlertCircle className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" aria-hidden="true" focusable="false" />
            <p className="text-[12px] text-destructive leading-snug font-medium">
              {errors.supportingDocuments}
            </p>
          </motion.div>
        )}

        {/* Relevance note */}
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" aria-hidden="true" focusable="false" />
          <p className="text-[11px] text-amber-900 leading-snug italic">
            Please make sure the uploaded document matches the course title, as the course will be created exactly based on what's in the document.
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
      </div>

      {/* Course Font */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="text-[16px] font-semibold text-foreground leading-tight">Course Font</div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-muted-foreground" role="note">
            <Info className="w-3 h-3" aria-hidden="true" focusable="false" />
            Text block–level fonts can be customized independently
          </span>
        </div>
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5"
          role="radiogroup"
          aria-label="Course font"
        >
          {FONT_OPTIONS.map((opt) => {
            const selected = (state.font ?? "default") === opt.id;
            const stack = getFontStack(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={`${opt.label} font`}
                onClick={() => onChange({ font: opt.id })}
                className={cn(
                  "relative flex items-center gap-2 h-10 pl-2.5 pr-3 rounded-lg border bg-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  selected
                    ? "border-primary bg-primary/[0.06] shadow-[0_0_0_1px_hsl(var(--primary))]"
                    : "border-border hover:border-primary/40 hover:bg-accent/40"
                )}
              >
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-7 h-7 rounded-md text-[14px] font-semibold leading-none shrink-0 transition-colors",
                    selected ? "bg-primary/10 text-primary" : "bg-muted text-foreground"
                  )}
                  style={stack ? { fontFamily: stack } : undefined}
                  aria-hidden="true"
                >
                  Aa
                </span>
                <span
                  className={cn(
                    "text-[12.5px] font-medium leading-none truncate text-left flex-1",
                    selected ? "text-foreground" : "text-muted-foreground"
                  )}
                  style={stack ? { fontFamily: stack } : undefined}
                >
                  {opt.label}
                </span>
                {selected && (
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" strokeWidth={3} aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Depth */}
      <div
        data-field="contentDepth"
        className={cn(
          "rounded-xl border bg-card p-4",
          errors.contentDepth ? "border-destructive" : "border-border"
        )}
      >
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
            const isActive = (state.contentDepth ?? "balanced") === tier.id;
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
        {errors.contentDepth && (
          <p role="alert" className="text-xs text-destructive mt-2 font-medium">
            {errors.contentDepth}
          </p>
        )}
      </div>




      {/* Content Rules Upload Helper */}
      <ContentRulesUpload
        documents={state.contentRulesDocuments ?? []}
        onDocumentsChange={(docs) => onChange({ contentRulesDocuments: docs })}
        contentRules={state.contentRules}
        onContentRulesChange={(v) => onChange({ contentRules: v })}
      />
    </div>
  );
}

function ContentRulesUpload({
  documents,
  onDocumentsChange,
  contentRules,
  onContentRulesChange,
}: {
  documents: string[];
  onDocumentsChange: (docs: string[]) => void;
  contentRules: string;
  onContentRulesChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFiles = (files: FileList | File[]) => {
    const names = Array.from(files).map((f) => f.name);
    onDocumentsChange([...documents, ...names]);
  };
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-[16px] font-semibold text-foreground leading-tight mb-2.5">Content rules</div>
      <div className="space-y-3">
        <Textarea
          value={contentRules}
          onChange={(e) => onContentRulesChange(e.target.value)}
          placeholder="e.g., Use plain language, include real-world examples, avoid jargon…"
          className="min-h-[80px] resize-none rounded-xl text-sm"
          aria-label="Content rules"
        />
        <div className="space-y-2">
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload content rules documents"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border-2 border-dashed border-primary/40 bg-primary/[0.04] hover:border-primary hover:bg-primary/10 hover:text-primary text-foreground text-xs font-medium cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Upload className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
            <span>
              Drop files or <span className="text-primary font-semibold underline-offset-2">click to upload</span>
            </span>
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.md"
            aria-label="Upload content rules documents file input"
            onChange={(e) => {
              if (e.target.files?.length) {
                handleFiles(e.target.files);
                e.target.value = "";
              }
            }}
          />
          {documents.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {documents.map((doc, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="gap-1.5 pl-2 pr-1 py-1 rounded-full text-[11px] font-normal bg-muted text-foreground hover:bg-muted"
                >
                  <FileText className="w-3 h-3 text-muted-foreground" aria-hidden="true" focusable="false" />
                  <span className="max-w-[180px] truncate">{doc}</span>
                  <button
                    type="button"
                    onClick={() => onDocumentsChange(documents.filter((_, idx) => idx !== i))}
                    className="rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                    aria-label={`Remove ${doc}`}
                  >
                    <X className="w-3 h-3" aria-hidden="true" focusable="false" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
