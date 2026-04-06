import { useState, useEffect } from "react";
import Lottie from "lottie-react";
import courseCreationAnimation from "@/assets/course-creation-lottie.json";
import previewMultipage from "@/assets/preview-multipage.jpg";
import previewSinglepage from "@/assets/preview-singlepage.jpg";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wand2, Layers, FileText, GraduationCap, BookOpen, Clock, Sparkles, Zap, BrainCircuit, Target, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AIToggleRow, AIConfigView, type AIOptions } from "./AIOptionsPanel";

// Preload images immediately on module load so they're cached before dialog opens
const preloadLink1 = new Image(); preloadLink1.src = previewMultipage;
const preloadLink2 = new Image(); preloadLink2.src = previewSinglepage;

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
};

function InlineLoader({ courseTitle, onComplete }: { courseTitle: string; onComplete: () => void }) {
  useEffect(() => {
    const timeout = setTimeout(onComplete, 2400);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 space-y-4">
      <div className="w-40 h-40 sm:w-48 sm:h-48">
        <Lottie animationData={courseCreationAnimation} loop autoplay className="w-full h-full" />
      </div>
      <div className="text-center space-y-1.5">
        <p className="text-sm text-muted-foreground">Creating your course</p>
        <p className="text-lg font-semibold text-foreground">"{courseTitle}"</p>
      </div>
    </div>
  );
}

/** Live preview panel — rich branded panel with dynamic course card */
function LivePreviewPanel({
  courseTitle,
  selectedLayout,
  aiEnabled,
}: {
  courseTitle: string;
  selectedLayout: LayoutType;
  aiEnabled: boolean;
}) {
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
        <h2 className="text-primary-foreground text-xl font-bold leading-snug break-words" style={{ overflowWrap: "anywhere" }}>
          {courseTitle || (
            <span className="text-primary-foreground/25 italic font-normal text-lg">
              Your title appears here...
            </span>
          )}
        </h2>
      </div>

      {/* Course specs grid */}
      <div className="relative z-10 flex-1 space-y-3">
        {/* Primary specs — 2x2 grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-primary-foreground/[0.08] backdrop-blur-md border border-primary-foreground/[0.06] p-3 flex flex-col items-center text-center">
            {selectedLayout === "multi-page" ? (
              <Layers className="w-4 h-4 text-primary-foreground/70 mb-1.5" />
            ) : (
              <FileText className="w-4 h-4 text-primary-foreground/70 mb-1.5" />
            )}
            <p className="text-primary-foreground text-sm font-bold leading-tight">
              {selectedLayout === "multi-page" ? "Multi" : "Single"}
            </p>
            <p className="text-primary-foreground/40 text-[9px] mt-0.5">Layout</p>
          </div>
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
        <div className="rounded-xl overflow-hidden border border-primary-foreground/10 shadow-lg">
          <img
            src={selectedLayout === "multi-page" ? previewMultipage : previewSinglepage}
            alt={`${selectedLayout} preview`}
            className="w-full h-[100px] object-cover object-top opacity-80"
            loading="eager"
            decoding="sync"
            fetchPriority="high"
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

  const isAIConfigValid = !aiOptions.enabled || (
    aiOptions.bloomsTaxonomy.length > 0 && !!aiOptions.intendedLearners
  );

  const handleStartCreating = () => {
    if (!courseTitle.trim()) return;
    if (!isAIConfigValid) {
      setShowAIConfig(true);
      return;
    }
    setIsLoading(true);
  };

  const handleLoaderComplete = () => {
    const route = selectedLayout === "multi-page" ? "/create-course-multipage" : "/create-course-singlepage";
    navigate(route, {
      state: {
        title: courseTitle.trim(),
        layout: selectedLayout,
        aiOptions: aiOptions.enabled ? aiOptions : null,
      }
    });
    setIsLoading(false);
    onOpenChange(false);
    setCourseTitle("");
    setSelectedLayout("multi-page");
    setAIOptions(defaultAIOptions);
    setShowAIConfig(false);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen && !isLoading) {
      setCourseTitle("");
      setSelectedLayout("multi-page");
      setShowAIConfig(false);
    }
    if (!isLoading) {
      onOpenChange(isOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          className={cn(
            "max-h-[90vh] overflow-hidden p-0",
            isLoading ? "w-[90vw] max-w-[520px]" : "w-[95vw] max-w-[1100px]"
          )}
          hideCloseButton={isLoading}
        >
        {isLoading ? (
          <InlineLoader courseTitle={courseTitle} onComplete={handleLoaderComplete} />
        ) : showAIConfig ? (
          <div className="p-4 sm:p-5 md:p-8 overflow-y-auto max-h-[85vh] thin-scrollbar">
            <AIConfigView
              options={aiOptions}
              onChange={setAIOptions}
              onBack={() => setShowAIConfig(false)}
            />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row min-h-[420px] max-h-[85vh]">
            {/* Left: Live preview panel — hidden on mobile/tablet, shown lg+ */}
            <LivePreviewPanel
              courseTitle={courseTitle}
              selectedLayout={selectedLayout}
              aiEnabled={aiOptions.enabled}
            />

            {/* Right: Form area */}
            <div className="flex-1 overflow-y-auto thin-scrollbar p-4 sm:p-6 md:p-8 flex flex-col min-h-0">
              {/* Hero title input */}
              <div className="mb-5 sm:mb-6">
                <label className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Course Title
                </label>
                <input
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="What will you teach?"
                  className="w-full text-lg sm:text-xl md:text-2xl font-bold bg-transparent border-0 border-b-2 border-border focus:border-primary outline-none pb-2 sm:pb-2.5 transition-colors placeholder:text-muted-foreground/40 placeholder:font-normal text-foreground"
                  autoFocus
                />
                <p className="text-[10px] sm:text-[11px] text-muted-foreground/60 mt-1.5 sm:mt-2">
                  💡 Used as the primary prompt for AI content generation
                </p>
              </div>

              {/* Layout Options — kept as-is */}
              <div className="mb-4 sm:mb-5">
                <label className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 sm:mb-3 block">
                  Layout
                </label>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
                  {/* Multi-page */}
                  <button
                    type="button"
                    onClick={() => setSelectedLayout("multi-page")}
                    className={cn(
                      "relative p-2.5 sm:p-3 md:p-4 rounded-lg border-2 transition-all text-left",
                      selectedLayout === "multi-page"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="absolute top-2.5 sm:top-3 md:top-4 left-2.5 sm:left-3 md:left-4">
                      <div className={cn(
                        "w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                        selectedLayout === "multi-page"
                          ? "border-primary bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]"
                          : "border-muted-foreground/30 bg-background hover:border-muted-foreground/50"
                      )}>
                        <div className={cn(
                          "rounded-full bg-primary-foreground transition-all duration-300",
                          selectedLayout === "multi-page"
                            ? "w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 opacity-100 scale-100"
                            : "w-0 h-0 opacity-0 scale-0"
                        )} />
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-5 md:mt-6 mb-2 sm:mb-3 md:mb-4 flex justify-center">
                      <div className="w-[100px] sm:w-[140px] md:w-[160px] h-[60px] sm:h-[85px] md:h-[100px] rounded-lg border border-border/80 shadow-md overflow-hidden">
                        <img src={previewMultipage} alt="Multi-page layout preview" className="w-full h-full object-cover object-top" loading="eager" decoding="sync" fetchPriority="high" />
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-xs sm:text-sm md:text-base text-foreground mb-0.5">Multi-page layout</h3>
                      <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground hidden sm:block">A full-length course, covering multiple topics</p>
                    </div>
                  </button>

                  {/* Single-page */}
                  <button
                    type="button"
                    onClick={() => setSelectedLayout("single-page")}
                    className={cn(
                      "relative p-2.5 sm:p-3 md:p-4 rounded-lg border-2 transition-all text-left",
                      selectedLayout === "single-page"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="absolute top-2.5 sm:top-3 md:top-4 left-2.5 sm:left-3 md:left-4">
                      <div className={cn(
                        "w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                        selectedLayout === "single-page"
                          ? "border-primary bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]"
                          : "border-muted-foreground/30 bg-background hover:border-muted-foreground/50"
                      )}>
                        <div className={cn(
                          "rounded-full bg-primary-foreground transition-all duration-300",
                          selectedLayout === "single-page"
                            ? "w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 opacity-100 scale-100"
                            : "w-0 h-0 opacity-0 scale-0"
                        )} />
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-5 md:mt-6 mb-2 sm:mb-3 md:mb-4 flex justify-center">
                      <div className="w-[100px] sm:w-[140px] md:w-[160px] h-[60px] sm:h-[85px] md:h-[100px] rounded-lg border border-border/80 shadow-md overflow-hidden">
                        <img src={previewSinglepage} alt="Single-page layout preview" className="w-full h-full object-cover object-top" loading="eager" decoding="sync" fetchPriority="high" />
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-xs sm:text-sm md:text-base text-foreground mb-0.5">Single-page layout</h3>
                      <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground hidden sm:block">A short, focused course designed for quick learning</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* AI Support Toggle — kept as-is */}
              <div className="mb-4 sm:mb-5">
                <AIToggleRow
                  options={aiOptions}
                  onChange={setAIOptions}
                  onConfigure={() => setShowAIConfig(true)}
                />
              </div>

              {/* Spacer */}
              <div className="flex-1 min-h-0" />

              {/* Create button */}
              <div className="flex justify-end pt-2 sm:pt-3">
                <Button
                  onClick={handleStartCreating}
                  disabled={!courseTitle.trim()}
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
