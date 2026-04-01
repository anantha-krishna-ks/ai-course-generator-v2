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
import { Wand2, Layers, FileText, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { AIToggleRow, AIConfigView, type AIOptions } from "./AIOptionsPanel";

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

/** Live preview panel — shows a dynamic "course card" as user configures */
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
    <div className="hidden md:flex flex-col w-[280px] shrink-0 rounded-l-lg bg-gradient-to-br from-primary via-primary to-[hsl(var(--primary-glow))] p-6 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary-foreground/5" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-primary-foreground/5" />
      <div className="absolute top-1/2 right-0 w-20 h-20 rounded-full bg-primary-foreground/[0.03]" />

      {/* Top icon */}
      <div className="relative z-10 mb-6">
        <div className="w-11 h-11 rounded-xl bg-primary-foreground/15 backdrop-blur-sm flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      {/* Live title preview */}
      <div className="relative z-10 flex-1 flex flex-col">
        <p className="text-primary-foreground/60 text-xs font-medium uppercase tracking-widest mb-2">
          Course Preview
        </p>
        <h2 className="text-primary-foreground text-xl font-bold leading-snug min-h-[3.5rem] break-words">
          {courseTitle || (
            <span className="text-primary-foreground/30 italic font-normal text-lg">
              Your title appears here...
            </span>
          )}
        </h2>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Layout & AI status chips */}
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-full bg-primary-foreground/15 backdrop-blur-sm text-primary-foreground text-[11px] font-semibold flex items-center gap-1.5">
              {selectedLayout === "multi-page" ? (
                <Layers className="w-3 h-3" />
              ) : (
                <FileText className="w-3 h-3" />
              )}
              {selectedLayout === "multi-page" ? "Multi-page" : "Single-page"}
            </div>
            {aiEnabled && (
              <div className="px-2.5 py-1 rounded-full bg-primary-foreground/15 backdrop-blur-sm text-primary-foreground text-[11px] font-semibold flex items-center gap-1.5">
                <Wand2 className="w-3 h-3" />
                AI
              </div>
            )}
          </div>

          {/* Mini skeleton preview of the layout */}
          <div className="rounded-lg bg-primary-foreground/10 backdrop-blur-sm p-3 space-y-2">
            {selectedLayout === "multi-page" ? (
              <>
                <div className="h-1.5 rounded-full bg-primary-foreground/20 w-3/4" />
                <div className="h-1.5 rounded-full bg-primary-foreground/15 w-full" />
                <div className="h-1.5 rounded-full bg-primary-foreground/15 w-5/6" />
                <div className="h-px bg-primary-foreground/10 my-1" />
                <div className="h-1.5 rounded-full bg-primary-foreground/20 w-2/3" />
                <div className="h-1.5 rounded-full bg-primary-foreground/15 w-full" />
              </>
            ) : (
              <>
                <div className="h-1.5 rounded-full bg-primary-foreground/20 w-1/2" />
                <div className="h-1.5 rounded-full bg-primary-foreground/15 w-full" />
                <div className="h-1.5 rounded-full bg-primary-foreground/15 w-4/5" />
                <div className="h-1.5 rounded-full bg-primary-foreground/15 w-full" />
                <div className="h-1.5 rounded-full bg-primary-foreground/15 w-3/4" />
              </>
            )}
          </div>
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
        className="w-[95vw] max-w-[900px] max-h-[90vh] overflow-hidden p-0"
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
          <div className="flex min-h-[480px] max-h-[85vh]">
            {/* Left: Live preview panel */}
            <LivePreviewPanel
              courseTitle={courseTitle}
              selectedLayout={selectedLayout}
              aiEnabled={aiOptions.enabled}
            />

            {/* Right: Form area */}
            <div className="flex-1 overflow-y-auto thin-scrollbar p-5 sm:p-6 md:p-8 flex flex-col">
              {/* Hero title input */}
              <div className="mb-6">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Course Title
                </label>
                <input
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="What will you teach?"
                  className="w-full text-xl sm:text-2xl font-bold bg-transparent border-0 border-b-2 border-border focus:border-primary outline-none pb-2.5 transition-colors placeholder:text-muted-foreground/40 placeholder:font-normal text-foreground"
                  autoFocus
                />
                <p className="text-[11px] text-muted-foreground/60 mt-2">
                  💡 Used as the primary prompt for AI content generation
                </p>
              </div>

              {/* Layout Options — kept as-is */}
              <div className="mb-5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
                  Layout
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Multi-page */}
                  <button
                    type="button"
                    onClick={() => setSelectedLayout("multi-page")}
                    className={cn(
                      "relative p-3 sm:p-4 rounded-lg border-2 transition-all text-left",
                      selectedLayout === "multi-page"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                      <div className={cn(
                        "w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                        selectedLayout === "multi-page"
                          ? "border-primary bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]"
                          : "border-muted-foreground/30 bg-background hover:border-muted-foreground/50"
                      )}>
                        <div className={cn(
                          "rounded-full bg-primary-foreground transition-all duration-300",
                          selectedLayout === "multi-page"
                            ? "w-2 h-2 sm:w-2.5 sm:h-2.5 opacity-100 scale-100"
                            : "w-0 h-0 opacity-0 scale-0"
                        )} />
                      </div>
                    </div>
                    <div className="mt-5 sm:mt-6 mb-3 sm:mb-4 flex justify-center">
                      <div className="w-[140px] sm:w-[160px] h-[85px] sm:h-[100px] rounded-lg border border-border/80 shadow-md overflow-hidden">
                        <img src={previewMultipage} alt="Multi-page layout preview" className="w-full h-full object-cover object-top" />
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-sm sm:text-base text-foreground mb-0.5">Multi-page layout</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">A full-length course, covering multiple topics</p>
                    </div>
                  </button>

                  {/* Single-page */}
                  <button
                    type="button"
                    onClick={() => setSelectedLayout("single-page")}
                    className={cn(
                      "relative p-3 sm:p-4 rounded-lg border-2 transition-all text-left",
                      selectedLayout === "single-page"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                      <div className={cn(
                        "w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                        selectedLayout === "single-page"
                          ? "border-primary bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]"
                          : "border-muted-foreground/30 bg-background hover:border-muted-foreground/50"
                      )}>
                        <div className={cn(
                          "rounded-full bg-primary-foreground transition-all duration-300",
                          selectedLayout === "single-page"
                            ? "w-2 h-2 sm:w-2.5 sm:h-2.5 opacity-100 scale-100"
                            : "w-0 h-0 opacity-0 scale-0"
                        )} />
                      </div>
                    </div>
                    <div className="mt-5 sm:mt-6 mb-3 sm:mb-4 flex justify-center">
                      <div className="w-[140px] sm:w-[160px] h-[85px] sm:h-[100px] rounded-lg border border-border/80 shadow-md overflow-hidden">
                        <img src={previewSinglepage} alt="Single-page layout preview" className="w-full h-full object-cover object-top" />
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-sm sm:text-base text-foreground mb-0.5">Single-page layout</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">A short, focused course designed for quick learning</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* AI Support Toggle — kept as-is */}
              <div className="mb-5">
                <AIToggleRow
                  options={aiOptions}
                  onChange={setAIOptions}
                  onConfigure={() => setShowAIConfig(true)}
                />
              </div>

              {/* Spacer pushes button to bottom */}
              <div className="flex-1" />

              {/* Create button */}
              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleStartCreating}
                  disabled={!courseTitle.trim()}
                  className="h-11 sm:h-12 px-7 sm:px-9 text-sm sm:text-base font-semibold rounded-full gap-2.5 shadow-sm"
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
