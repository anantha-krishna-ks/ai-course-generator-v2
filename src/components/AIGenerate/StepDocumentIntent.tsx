import { AIGenerateState } from "@/pages/AIGenerateCourse";
import { Upload, X, FileText, AlertCircle, Info, Check } from "lucide-react";
import { useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { TitleAutocomplete } from "./TitleAutocomplete";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FONT_OPTIONS, getFontStack } from "@/components/CourseCreation/FontSelectorDropdown";

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

function GuidelinesUpload({
  documents,
  onDocumentsChange,
  guidelines,
  onGuidelinesChange,
}: {
  documents: string[];
  onDocumentsChange: (docs: string[]) => void;
  guidelines: string;
  onGuidelinesChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFiles = (files: FileList | File[]) => {
    const names = Array.from(files).map((f) => f.name);
    onDocumentsChange([...documents, ...names]);
  };
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-[16px] font-semibold text-foreground leading-tight mb-2.5">Guidelines</div>
      <div className="space-y-3">
        <Textarea
          value={guidelines}
          onChange={(e) => onGuidelinesChange(e.target.value)}
          placeholder="e.g., Use plain language, include real-world examples…"
          className="min-h-[80px] resize-none rounded-xl text-sm"
          aria-label="Guidelines"
        />
        <div className="space-y-2">
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload guidelines documents"
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
            aria-label="Upload guidelines documents file input"
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
