import { useState, useEffect, useRef } from "react";
import previewMultipage from "@/assets/preview-multipage.jpg";
import previewSinglepage from "@/assets/preview-singlepage.jpg";

// Preload preview images at module load so they're decoded & cached
// before the dialog ever opens — eliminates the first-open flash/delay.
if (typeof window !== "undefined") {
  [previewMultipage, previewSinglepage].forEach((src) => {
    const img = new Image();
    img.decoding = "async";
    img.src = src;
  });
}
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wand2, FileText, GraduationCap, BookOpen, Zap, BrainCircuit, Target, BarChart3, Package, Settings2, Check, ChevronDown, Upload, FileSpreadsheet, FileJson, X, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { AIToggleRow, AIConfigView, type AIOptions } from "./AIOptionsPanel";
import { ScormPreferencesContent } from "@/components/EditCourse/ScormPreferencesDialog";
import { FONT_OPTIONS, DEFAULT_FONT_ID, getFontStack } from "@/components/CourseCreation/FontSelectorDropdown";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CourseGenerationAnimation } from "./CourseGenerationAnimation";
import { CourseLanguagePicker } from "@/components/CourseCreation/CourseLanguagePicker";
import { DEFAULT_LANGUAGE_CODE, setCourseLanguage } from "@/services/courseLanguageStore";


interface CreateCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type LayoutType = "multi-page" | "single-page";

const defaultAIOptions: AIOptions = {
  enabled: true,
  supportingDocuments: [],
  bloomsTaxonomy: [],
  intendedLearners: "",
  guidelines: "",
  guidelinesDocuments: [],
  exclusions: "",
  exclusionsDocuments: [],
  pageSpanTime: 5,
  courseSpanTime: 60,
  contentDepth: "balanced",
};

function InlineLoader({ courseTitle, onComplete }: { courseTitle: string; onComplete: () => void }) {
  useEffect(() => {
    const timeout = setTimeout(onComplete, 2400);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 space-y-4">
      <div className="w-56 h-56">
        <CourseGenerationAnimation />
      </div>
      <div className="text-center space-y-1.5">
        <p className="text-sm text-muted-foreground">Creating your course</p>
        <p className="text-lg font-semibold text-foreground">"{courseTitle}"</p>
      </div>
    </div>
  );
}


/**
 * Font picker — labeled pill trigger + popover with a 2-column grid of "Aa" swatches.
 * The trigger shows the current font's name rendered in that font (self-indicating).
 * The popover is visual-first: each swatch IS its own preview, side-by-side for comparison.
 * Pattern inspired by Notion's page-style picker and Linear's theme picker.
 */
function FontPopover({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const current = FONT_OPTIONS.find((f) => f.id === value) ?? FONT_OPTIONS[0];
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Course font: ${current.label}. Click to change.`}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background hover:bg-muted h-10 sm:h-11 md:h-12 pl-3 pr-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <span
            aria-hidden="true"
            className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-foreground text-sm font-bold leading-none"
            style={{ fontFamily: getFontStack(value) }}
          >
            Aa
          </span>
          <span className="flex flex-col items-start leading-tight">
            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
              Font
            </span>
            <span
              className="text-xs sm:text-sm font-semibold text-foreground max-w-[110px] truncate"
              style={{ fontFamily: getFontStack(value) }}
            >
              {current.label}
            </span>
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-0.5" aria-hidden="true" focusable="false" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" side="top" sideOffset={8} className="w-[280px] p-3">
        <div className="mb-2 px-1">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Course font
          </p>
          <p className="text-[11px] text-muted-foreground/80 mt-0.5">
            Applied across the entire course
          </p>
        </div>
        <div role="radiogroup" aria-label="Course font" className="grid grid-cols-2 gap-2">
          {FONT_OPTIONS.map((font) => {
            const isActive = font.id === value;
            const isDefault = font.id === DEFAULT_FONT_ID;
            return (
              <button
                key={font.id}
                type="button"
                role="radio"
                aria-checked={isActive}
                aria-label={`Use ${font.label}`}
                onClick={() => onChange(font.id)}
                className={cn(
                  "group relative flex flex-col items-center justify-center h-[64px] rounded-lg border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                {isActive && (
                  <Check
                    className="absolute top-1 right-1 w-3 h-3 text-primary"
                    aria-hidden="true"
                    focusable="false"
                  />
                )}
                <span
                  aria-hidden="true"
                  className={cn(
                    "text-xl font-semibold leading-none",
                    isActive ? "text-primary" : "text-foreground"
                  )}
                  style={{ fontFamily: font.stack || undefined }}
                >
                  Aa
                </span>
                <span
                  className={cn(
                    "mt-1.5 text-[10px] font-medium leading-none truncate max-w-full px-2",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {isDefault ? "Default" : font.label}
                </span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Live preview panel — rich branded panel with dynamic course card */
function LivePreviewPanel({
  courseTitle,
  selectedLayout,
  aiEnabled,
  fontId,
}: {
  courseTitle: string;
  selectedLayout: LayoutType;
  aiEnabled: boolean;
  fontId: string;
}) {
  const fontStack = getFontStack(fontId);
  return (
    <div className="hidden lg:flex flex-col w-[320px] shrink-0 rounded-l-lg bg-gradient-to-br from-primary via-primary to-[hsl(var(--primary-glow))] p-6 relative overflow-hidden select-none">
      {/* Decorative elements */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary-foreground/[0.06]" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-primary-foreground/[0.06]" />
      <div className="absolute top-1/3 -right-4 w-24 h-24 rounded-full bg-primary-foreground/[0.04]" />
      <div className="absolute bottom-1/3 left-1/2 w-16 h-16 rounded-full bg-primary-foreground/[0.03]" />


      {/* Top branding */}
      <div className="relative z-10 mb-5">
        <div className="w-11 h-11 rounded-xl bg-primary-foreground/15 backdrop-blur-sm flex items-center justify-center mb-3">
          <GraduationCap className="w-6 h-6 text-primary-foreground" />
        </div>
        <p className="text-primary-foreground/50 text-[10px] font-semibold uppercase tracking-[0.2em]">
          New Course
        </p>
      </div>

      {/* Live title */}
      <div className="relative z-10 mb-5">
        <h2 className="text-primary-foreground text-xl font-bold leading-snug break-words" style={{ overflowWrap: "anywhere", fontFamily: fontStack }}>
          {courseTitle || (
            <span className="text-primary-foreground/25 italic font-normal text-lg">
              Your title appears here...
            </span>
          )}
        </h2>
      </div>

      {/* Course specs grid */}
      <div className="relative z-10 flex-1 space-y-3">
        {/* Primary specs — single content card */}
        <div className="grid grid-cols-1 gap-2">
          <div className="rounded-xl bg-primary-foreground/[0.08] backdrop-blur-md border border-primary-foreground/[0.06] p-3 flex flex-col items-center text-center">
            <BrainCircuit className="w-4 h-4 text-primary-foreground/70 mb-1.5" />
            <p className="text-primary-foreground text-sm font-bold leading-tight">
              {aiEnabled ? "Auto" : "Manual"}
            </p>
            <p className="text-primary-foreground/40 text-[9px] mt-0.5">Content</p>
          </div>
        </div>

        {/* AI capability bar */}
        <div className="rounded-xl bg-primary-foreground/[0.06] backdrop-blur-md border border-primary-foreground/[0.05] px-3.5 py-2.5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-primary-foreground/60" />
              <span className="text-[10px] font-semibold text-primary-foreground/60 uppercase tracking-wider">AI Power</span>
            </div>
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-wider",
              aiEnabled ? "text-primary-foreground" : "text-primary-foreground/30"
            )}>
              {aiEnabled ? "Active" : "Off"}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-primary-foreground/10 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out",
                aiEnabled
                  ? "w-full bg-gradient-to-r from-primary-foreground/60 to-primary-foreground/90"
                  : "w-[15%] bg-primary-foreground/20"
              )}
            />
          </div>
        </div>
      </div>

      {/* Bottom layout preview thumbnail */}
      <div className="relative z-10 mt-4">
        <div className="rounded-xl overflow-hidden border border-primary-foreground/10 shadow-lg bg-muted">
          <img
            src={selectedLayout === "multi-page" ? previewMultipage : previewSinglepage}
            alt={`${selectedLayout} preview`}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="w-full h-[100px] object-cover object-top opacity-80"
          />
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-primary/80 to-transparent" />
        </div>
      </div>
    </div>
  );
}

export function CreateCourseDialog({ open, onOpenChange }: CreateCourseDialogProps) {
  const navigate = useNavigate();
  const [courseTitle, setCourseTitle] = useState("");
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>("multi-page");
  const [isLoading, setIsLoading] = useState(false);
  const [aiOptions, setAIOptions] = useState<AIOptions>(defaultAIOptions);
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [showScormConfig, setShowScormConfig] = useState(false);
  const [fontId, setFontId] = useState<string>(DEFAULT_FONT_ID);
  const [languageCode, setLanguageCode] = useState<string>(DEFAULT_LANGUAGE_CODE);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const aiSectionRef = useRef<HTMLDivElement>(null);
  const outlineInputRef = useRef<HTMLInputElement>(null);
  const [outlineFile, setOutlineFile] = useState<File | null>(null);

  const isAIConfigValid = !aiOptions.enabled || (
    aiOptions.bloomsTaxonomy.length > 0 && !!aiOptions.intendedLearners
  );

  useEffect(() => {
    if (courseTitle.trim()) setTitleError(null);
  }, [courseTitle]);

  useEffect(() => {
    if (isAIConfigValid) setAiError(null);
  }, [isAIConfigValid]);

  const handleStartCreating = () => {
    if (!courseTitle.trim()) {
      setTitleError("Course title is required");
      titleInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => titleInputRef.current?.focus({ preventScroll: true }), 300);
      return;
    }
    if (!isAIConfigValid) {
      setAiError("Complete AI configuration to continue");
      aiSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setShowAIConfig(true), 600);
      return;
    }
    setTitleError(null);
    setAiError(null);
    setIsLoading(true);
  };

  const handleLoaderComplete = () => {
    const route = selectedLayout === "multi-page" ? "/create-course-multipage" : "/create-course-singlepage";
    // Language is fixed at creation and locked for the lifetime of the course.
    setCourseLanguage("draft", languageCode, true);
    navigate(route, {
      state: {
        title: courseTitle.trim(),
        layout: selectedLayout,
        aiOptions: aiOptions.enabled ? aiOptions : null,
        contentDepth: aiOptions.contentDepth,
        fontId,
        languageCode,
      }
    });
    setIsLoading(false);
    onOpenChange(false);
    setCourseTitle("");
    setSelectedLayout("multi-page");
    setAIOptions(defaultAIOptions);
    setShowAIConfig(false);
    setFontId(DEFAULT_FONT_ID);
    setLanguageCode(DEFAULT_LANGUAGE_CODE);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen && !isLoading) {
      setCourseTitle("");
      setSelectedLayout("multi-page");
      setShowAIConfig(false);
      setTitleError(null);
      setAiError(null);
    }
    if (!isLoading) {
      onOpenChange(isOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          className={cn(
            "h-[92vh] max-h-[92vh] overflow-hidden p-0",
            isLoading ? "w-[90vw] max-w-[520px] h-auto" : "w-[95vw] max-w-[1100px]"
          )}
          hideCloseButton={isLoading}
        >
        {isLoading ? (
          <InlineLoader courseTitle={courseTitle} onComplete={handleLoaderComplete} />
        ) : showAIConfig ? (
          <div className="p-4 sm:p-5 md:p-8 overflow-y-auto h-full thin-scrollbar">
            <AIConfigView
              options={aiOptions}
              onChange={setAIOptions}
              onBack={() => setShowAIConfig(false)}
            />
          </div>
        ) : showScormConfig ? (
          <div className="p-4 sm:p-5 md:p-8 overflow-y-auto h-full thin-scrollbar">
            <ScormPreferencesContent
              onBack={() => setShowScormConfig(false)}
              onSave={() => setShowScormConfig(false)}
            />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row h-full min-h-[420px]">
            {/* Left: Live preview panel — hidden on mobile/tablet, shown lg+ */}
            <LivePreviewPanel
              courseTitle={courseTitle}
              selectedLayout={selectedLayout}
              aiEnabled={aiOptions.enabled}
              fontId={fontId}
            />

            {/* Right: Form area */}
            <div className="flex-1 overflow-y-auto thin-scrollbar p-4 sm:p-6 md:p-8 flex flex-col min-h-0">
              {/* Hero title input */}
              <div className="mb-5 sm:mb-6">
                <label htmlFor="cc-title-input" className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Course Title
                  <span aria-hidden="true" className="text-destructive ml-0.5">*</span>
                </label>
                <input
                  ref={titleInputRef}
                  id="cc-title-input"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="What will you teach?"
                  aria-required="true"
                  aria-invalid={!!titleError}
                  aria-describedby="cc-title-helper"
                  className={cn(
                    "w-full text-lg sm:text-xl md:text-2xl font-bold bg-transparent border-0 border-b-2 outline-none pb-2 sm:pb-2.5 transition-colors placeholder:text-muted-foreground/40 placeholder:font-normal text-foreground",
                    titleError ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
                  )}
                  autoFocus
                />
                {titleError ? (
                  <p id="cc-title-helper" role="alert" className="text-[11px] sm:text-xs text-destructive mt-1.5 sm:mt-2 font-medium">
                    {titleError}
                  </p>
                ) : (
                  <p id="cc-title-helper" className="text-[10px] sm:text-[11px] text-muted-foreground/60 mt-1.5 sm:mt-2">
                    💡 Used as the primary prompt for AI content generation
                  </p>
                )}
              </div>


              <div className="mb-3 sm:mb-4">
                <div
                  ref={aiSectionRef}
                  className={cn(
                    "rounded-lg transition-all",
                    aiError && "ring-1 ring-destructive ring-offset-2 ring-offset-background"
                  )}
                >
                  <AIToggleRow
                    options={aiOptions}
                    onChange={setAIOptions}
                    onConfigure={() => setShowAIConfig(true)}
                  />
                </div>
                {aiError && (
                  <p role="alert" aria-live="polite" className="text-[11px] sm:text-xs text-destructive mt-1.5 font-medium">
                    {aiError}
                  </p>
                )}
              </div>


              {/* SCORM Preferences */}
              <div className="mb-4 sm:mb-5">
                <div className="flex items-center gap-3 px-3 py-3 rounded-lg border border-border bg-background transition-all">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-muted shrink-0">
                    <Package className="w-4 h-4 text-muted-foreground" aria-hidden="true" focusable="false" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-foreground block">
                      SCORM Preferences
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Configure SCORM packaging & completion rules
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowScormConfig(true)}
                    className="shrink-0 gap-1.5 text-xs h-8 rounded-full"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    Configure
                  </Button>
                </div>
              </div>

              {/* Import Course Outline */}
              <div className="mb-4 sm:mb-5">
                <div className="rounded-lg border border-border bg-muted/20 p-3 sm:p-4">
                  <input
                    ref={outlineInputRef}
                    type="file"
                    accept=".docx,.pdf,.txt,.md,.json,.csv,.xlsx"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setOutlineFile(f);
                      if (outlineInputRef.current) outlineInputRef.current.value = "";
                    }}
                    aria-label="Import course outline file"
                  />
                  {outlineFile ? (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{outlineFile.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {(outlineFile.size / 1024).toFixed(1)} KB · Ready to import
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setOutlineFile(null)}
                        className="shrink-0 h-8 w-8 p-0 rounded-full"
                        aria-label="Remove imported outline"
                      >
                        <X className="w-4 h-4" aria-hidden="true" focusable="false" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Upload className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          Import an outline to jump-start your course
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Bring your existing structure — we'll turn it into editable sections and pages.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => outlineInputRef.current?.click()}
                        className="shrink-0 gap-1.5 text-xs h-8 rounded-full"
                      >
                        <Upload className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                        Import outline
                      </Button>
                    </div>
                  )}

                  {/* Templates + supported files */}
                  <div className="mt-3 pt-3 border-t border-border/60">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                      <div className="flex items-center gap-1.5 shrink-0 pt-1">
                        <Download className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
                        <span className="text-[11px] font-semibold text-foreground">Download template:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
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
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-semibold transition-colors ${t.bg} ${t.color} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
                            aria-label={`Download ${t.label} template`}
                          >
                            <FileText className="w-3 h-3" aria-hidden="true" focusable="false" />
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      Supported: DOCX, PDF, TXT, MD, JSON, CSV, XLSX · Max 20MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Spacer */}

              <div className="flex-1 min-h-0" />

              {/* Footer: secondary action (font) on the left, primary CTA on the right */}
              <div className="flex items-center justify-between gap-3 pt-2 sm:pt-3">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <FontPopover value={fontId} onChange={setFontId} />
                  <CourseLanguagePicker value={languageCode} onChange={setLanguageCode} />
                </div>

                <Button
                  onClick={handleStartCreating}
                  className="h-10 sm:h-11 md:h-12 px-5 sm:px-7 md:px-9 text-xs sm:text-sm md:text-base font-semibold rounded-full gap-2 shadow-sm"
                >
                  <Wand2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  Create Course
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
