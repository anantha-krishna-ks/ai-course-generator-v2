import { useState, useEffect } from "react";
import Lottie from "lottie-react";
import courseCreationAnimation from "@/assets/course-creation-lottie.json";
import previewMultipage from "@/assets/preview-multipage.jpg";
import previewSinglepage from "@/assets/preview-singlepage.jpg";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MousePointerClick, Check, ArrowLeft, Wand2, FileText, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { AIToggleRow, AIConfigView, type AIOptions } from "./AIOptionsPanel";
import { Badge } from "@/components/ui/badge";

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

function ProgressRail({ step }: { step: number }) {
  return (
    <div className="hidden sm:flex flex-col items-center w-12 border-r border-border bg-muted/30 py-8 shrink-0">
      {/* Step 1 indicator */}
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
          step >= 2
            ? "bg-primary text-primary-foreground"
            : step === 1
            ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
            : "bg-muted text-muted-foreground border border-border"
        )}
      >
        {step >= 2 ? <Check className="w-3.5 h-3.5" /> : "1"}
      </div>

      {/* Connector line */}
      <div className="w-0.5 flex-1 my-2 bg-border relative overflow-hidden">
        <div
          className={cn(
            "absolute inset-x-0 top-0 bg-primary transition-all duration-500",
            step >= 2 ? "h-full" : "h-0"
          )}
        />
      </div>

      {/* Step 2 indicator */}
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
          step === 2
            ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
            : "bg-muted text-muted-foreground border border-border"
        )}
      >
        2
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
  const [step, setStep] = useState(1);

  const isAIConfigValid = !aiOptions.enabled || (
    aiOptions.bloomsTaxonomy.length > 0 && !!aiOptions.intendedLearners
  );

  const handleContinue = () => {
    if (!courseTitle.trim()) return;
    if (!isAIConfigValid) {
      setShowAIConfig(true);
      return;
    }
    setStep(2);
  };

  const handleStartCreating = () => {
    if (!courseTitle.trim()) return;
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
    setStep(1);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen && !isLoading) {
      setCourseTitle("");
      setSelectedLayout("multi-page");
      setShowAIConfig(false);
      setStep(1);
    }
    if (!isLoading) {
      onOpenChange(isOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="w-[95vw] max-w-[800px] max-h-[90vh] overflow-hidden p-0"
        hideCloseButton={isLoading}
      >
        {isLoading ? (
          <InlineLoader courseTitle={courseTitle} onComplete={handleLoaderComplete} />
        ) : showAIConfig ? (
          <div className="p-4 sm:p-5 md:p-8">
            <AIConfigView
              options={aiOptions}
              onChange={setAIOptions}
              onBack={() => setShowAIConfig(false)}
            />
          </div>
        ) : (
          <div className="flex min-h-[420px]">
            <ProgressRail step={step} />

            <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
              {/* Step 1 */}
              <div
                className={cn(
                  "transition-all duration-300 ease-in-out p-4 sm:p-5 md:p-8 pt-4 sm:pt-4 md:pt-6 pb-4 sm:pb-4 md:pb-6",
                  step === 1
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-8 absolute inset-0 pointer-events-none"
                )}
              >
                <DialogHeader className="space-y-1 pb-4">
                  <DialogTitle className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground text-left">
                    What will you teach?
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-5">
                  {/* Hero title input */}
                  <div>
                    <input
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      placeholder="Enter your course title..."
                      className="w-full text-xl sm:text-2xl font-semibold bg-transparent border-0 border-b-2 border-border focus:border-primary outline-none pb-2 transition-colors placeholder:text-muted-foreground/50 placeholder:font-normal text-foreground"
                    />
                    <p className="text-[11px] sm:text-xs text-muted-foreground/70 mt-2 leading-relaxed">
                      💡 This title will be used as the primary prompt for AI content generation
                    </p>
                  </div>

                  {/* Layout Options — kept as-is */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                        <div className="w-[160px] sm:w-[190px] h-[100px] sm:h-[120px] rounded-lg border border-border/80 shadow-md overflow-hidden">
                          <img src={previewMultipage} alt="Multi-page layout preview" className="w-full h-full object-cover object-top" />
                        </div>
                      </div>
                      <div className="text-center">
                        <h3 className="font-semibold text-sm sm:text-base text-foreground mb-0.5 sm:mb-1">Multi-page layout</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">A full-length course, covering multiple topics</p>
                      </div>
                    </button>

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
                        <div className="w-[160px] sm:w-[190px] h-[100px] sm:h-[120px] rounded-lg border border-border/80 shadow-md overflow-hidden">
                          <img src={previewSinglepage} alt="Single-page layout preview" className="w-full h-full object-cover object-top" />
                        </div>
                      </div>
                      <div className="text-center">
                        <h3 className="font-semibold text-sm sm:text-base text-foreground mb-0.5 sm:mb-1">Single-page layout</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">A short, focused course designed for quick learning</p>
                      </div>
                    </button>
                  </div>

                  {/* AI Support Toggle — kept as-is */}
                  <AIToggleRow
                    options={aiOptions}
                    onChange={setAIOptions}
                    onConfigure={() => setShowAIConfig(true)}
                  />

                  {/* Continue button */}
                  <div className="pt-1 flex justify-end">
                    <Button
                      onClick={handleContinue}
                      disabled={!courseTitle.trim()}
                      className="h-10 sm:h-11 px-6 sm:px-8 text-sm font-semibold rounded-full gap-2"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div
                className={cn(
                  "transition-all duration-300 ease-in-out p-4 sm:p-5 md:p-8 pt-4 sm:pt-4 md:pt-6 pb-4 sm:pb-4 md:pb-6",
                  step === 2
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-8 absolute inset-0 pointer-events-none"
                )}
              >
                <DialogHeader className="space-y-1 pb-6">
                  <DialogTitle className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground text-left">
                    Review & Create
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground text-left">
                    Everything look good? Let's build your course.
                  </p>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Summary card */}
                  <div className="rounded-xl border border-border bg-muted/20 p-5 sm:p-6 space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Course Title</p>
                      <p className="text-xl sm:text-2xl font-bold text-foreground leading-tight">{courseTitle}</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Layout:</span>
                        <Badge variant="secondary" className="gap-1.5 text-xs">
                          {selectedLayout === "multi-page" ? (
                            <Layers className="w-3 h-3" />
                          ) : (
                            <FileText className="w-3 h-3" />
                          )}
                          {selectedLayout === "multi-page" ? "Multi-page" : "Single-page"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">AI Support:</span>
                        <Badge
                          variant={aiOptions.enabled ? "default" : "outline"}
                          className="text-xs"
                        >
                          {aiOptions.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="ghost"
                      onClick={() => setStep(1)}
                      className="gap-1.5 text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </Button>

                    <Button
                      onClick={handleStartCreating}
                      className="h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-semibold rounded-full gap-2"
                    >
                      <Wand2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      Create Course
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
