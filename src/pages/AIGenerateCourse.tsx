import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Info, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { AISparkles } from "@/components/ui/ai-sparkles";
import { SideRibbon } from "@/components/AIGenerate/SideRibbon";
import { StepCourseIntent } from "@/components/AIGenerate/StepCourseIntent";
import { StepCourseDetails } from "@/components/AIGenerate/StepCourseDetails";
import { StepBlueprintGenerate } from "@/components/AIGenerate/StepBlueprintGenerate";
import { StepEditRefine } from "@/components/AIGenerate/StepEditRefine";
import { AIGenerationLoadingDialog } from "@/components/AIGenerate/AIGenerationLoadingDialog";

const STEPS = [
  { id: 1, label: "Course Intent" },
  { id: 2, label: "Course Details" },
  { id: 3, label: "Blueprint & Generate" },
  { id: 4, label: "Edit & Refine" },
] as const;

export interface AIGenerateState {
  title: string;
  intendedLearners: string;
  learningOutcome: string;
  bloomsTaxonomy: string[];
  supportingDocuments: string[];
  guidelines: string;
  guidelinesDocuments: string[];
  exclusions: string;
  exclusionsDocuments: string[];
  pageSpanTime: number;
  courseSpanTime: number;
  layoutType: "multi-page" | "single-page";
  duration: "brief" | "standard" | "extended";
  tone: "professional" | "conversational" | "coaching" | "ai-determined";
  contentPreferences: {
    includeQuestions: boolean;
    interactiveBlocks: boolean;
    addImages: boolean;
  };
}

const initialState: AIGenerateState = {
  title: "",
  intendedLearners: "",
  learningOutcome: "",
  bloomsTaxonomy: [],
  supportingDocuments: [],
  guidelines: "",
  guidelinesDocuments: [],
  exclusions: "",
  exclusionsDocuments: [],
  pageSpanTime: 5,
  courseSpanTime: 60,
  layoutType: "multi-page",
  duration: "standard",
  tone: "ai-determined",
  contentPreferences: {
    includeQuestions: true,
    interactiveBlocks: true,
    addImages: true,
  },
};

const STEP_COMPONENTS = [StepCourseIntent, StepCourseDetails, StepBlueprintGenerate, StepEditRefine];

export default function AIGenerateCourse() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formState, setFormState] = useState<AIGenerateState>(initialState);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [showGenerating, setShowGenerating] = useState(false);
  const [showBackWarning, setShowBackWarning] = useState(false);
  const [highestVisitedStep, setHighestVisitedStep] = useState(1);

  const updateState = useCallback((partial: Partial<AIGenerateState>) => {
    setFormState((prev) => ({ ...prev, ...partial }));
  }, []);

  const canAdvance = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!formState.title.trim() && !!formState.intendedLearners.trim();
      case 2:
      case 3:
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setDirection(1);
      setCurrentStep((s) => {
        const next = s + 1;
        setHighestVisitedStep((h) => Math.max(h, next));
        return next;
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      // Only warn if user has visited steps beyond the one they're going back to
      if (highestVisitedStep > currentStep - 1) {
        setShowBackWarning(true);
      } else {
        confirmBack();
      }
    } else {
      navigate("/dashboard");
    }
  };

  const confirmBack = () => {
    setShowBackWarning(false);
    setDirection(-1);
    setCurrentStep((s) => s - 1);
  };

  const handleFinish = () => {
    setShowGenerating(true);
  };

  const handleGenerationComplete = useCallback(() => {
    navigate("/ai-generated-course", { state: { title: formState.title || "AI Generated Course" } });
  }, [navigate, formState.title]);

  const remainingCards = STEPS.length - currentStep;
  const StepComponent = STEP_COMPONENTS[currentStep - 1];
  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  // Content slide variants
  const contentVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 40 : -40,
    }),
    center: {
      opacity: 1,
      x: 0,
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -40 : 40,
    }),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground">
        Skip to main content
      </a>
      <Header />

      <SideRibbon side="left" />
      <SideRibbon side="right" />

      {/* Back to Dashboard - fixed left side (desktop), inline top (mobile) */}
      <Button
        variant="ghost"
        onClick={() => navigate("/dashboard")}
        className="fixed left-4 top-20 z-30 gap-2 px-3 h-9 text-muted-foreground hover:text-foreground rounded-full hidden lg:inline-flex"
        aria-label="Back to Dashboard"
      >
        <span className="w-8 h-8 rounded-full border border-border flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" focusable="false" />
        </span>
        <span className="text-sm font-medium">Back to Dashboard</span>
      </Button>

      <main id="main-content" className="flex-1 flex items-start sm:items-center justify-center px-3 sm:px-4 py-4 sm:py-6 md:py-10">
        <div className="w-full max-w-3xl">

          {/* Mobile/tablet back button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-3 gap-2 px-2 h-8 text-muted-foreground hover:text-foreground rounded-full lg:hidden"
            aria-label="Back to Dashboard"
          >
            <span className="w-7 h-7 rounded-full border border-border flex items-center justify-center">
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
            </span>
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Button>

          {/* Accessible step status */}
          <div className="sr-only" aria-live="polite">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].label}
          </div>

          {/* Elegant step indicators */}
          <nav aria-label="Course generation steps" className="mb-6">
            <div className="flex items-center justify-between rounded-xl bg-muted/40 border border-border/60 px-2 py-2 sm:px-3 sm:py-2.5 backdrop-blur-sm">
              {STEPS.map((step, i) => {
                const isActive = step.id === currentStep;
                const isDone = step.id < currentStep;
                const isUpcoming = step.id > currentStep;
                return (
                  <div key={step.id} className="flex items-center flex-1 last:flex-initial">
                    {/* Step pill */}
                    <div
                      className={cn(
                        "flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg transition-all duration-300",
                        isActive && "bg-card shadow-sm border border-border/80",
                        isDone && "opacity-80",
                        isUpcoming && "opacity-50"
                      )}
                    >
                      <motion.div
                        className={cn(
                          "w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-bold shrink-0 transition-colors duration-300",
                          isDone && "bg-primary text-primary-foreground shadow-sm",
                          isActive && "bg-primary text-primary-foreground shadow-md",
                          isUpcoming && "bg-border/80 text-muted-foreground"
                        )}
                        initial={false}
                        animate={{ scale: isActive ? 1.1 : 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        {isDone ? (
                          <Check className="w-3 h-3" aria-hidden="true" focusable="false" />
                        ) : (
                          step.id
                        )}
                      </motion.div>

                      <span
                        className={cn(
                          "text-[11px] sm:text-xs font-medium hidden sm:block whitespace-nowrap",
                          isDone && "text-foreground",
                          isActive && "text-foreground font-semibold",
                          isUpcoming && "text-muted-foreground"
                        )}
                      >
                        {step.label}
                      </span>
                    </div>

                    {/* Connector */}
                    {i < STEPS.length - 1 && (
                      <div className="flex-1 hidden sm:flex items-center justify-center px-1 min-w-[16px]">
                        <div className="w-full h-[1.5px] rounded-full overflow-hidden bg-border/60">
                          <motion.div
                            className="h-full rounded-full bg-primary/60"
                            initial={false}
                            animate={{ width: isDone ? "100%" : "0%" }}
                            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>

          {/* Card with AI shimmer border */}
          <div className="relative rounded-2xl p-[1px] overflow-hidden">
            {/* Animated gradient border */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, hsl(211 100% 50% / 0.3), hsl(270 80% 55% / 0.2), hsl(211 100% 50% / 0.1), hsl(270 80% 55% / 0.3))",
                backgroundSize: "300% 300%",
              }}
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden="true"
            />

            <motion.div
              layout
              className="relative rounded-2xl bg-card shadow-[0_8px_30px_-12px_hsl(var(--foreground)/0.12)] overflow-hidden"
              transition={{ layout: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
            >
              {/* Traveling shimmer line at top */}
              <div className="h-[2px] w-full overflow-hidden" aria-hidden="true">
                <motion.div
                  className="h-full w-1/3"
                  style={{
                    background: "linear-gradient(90deg, transparent, hsl(211 100% 50% / 0.5), hsl(270 80% 55% / 0.4), transparent)",
                  }}
                  animate={{ x: ["-100%", "400%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                />
              </div>

              {/* Card header with AI badge */}
              <div className="flex items-center gap-3 px-5 sm:px-8 md:px-10 pt-4 sm:pt-5 pb-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`badge-${currentStep}`}
                    initial={{ rotateY: -90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: 90, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                    className="relative w-7 h-7 rounded-full bg-gradient-to-br from-[hsl(211,100%,50%)] to-[hsl(270,80%,55%)] text-white flex items-center justify-center text-xs font-bold shadow-sm shrink-0"
                    style={{ perspective: "600px" }}
                  >
                    {currentStep}
                  </motion.div>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  <motion.span
                    key={`label-${currentStep}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    className="text-xs sm:text-sm font-semibold text-foreground"
                  >
                    {STEPS[currentStep - 1].label}
                  </motion.span>
                </AnimatePresence>

                <div className="ml-auto">
                  <AISparkles className="w-4 h-4 opacity-60" />
                </div>
              </div>

              {/* Card body */}
              <div className="px-5 sm:px-8 md:px-10 pt-3 sm:pt-4 pb-4 sm:pb-5">
                <AnimatePresence mode="wait" custom={direction} initial={false}>
                  <motion.div
                    key={currentStep}
                    custom={direction}
                    variants={contentVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <StepComponent state={formState} onChange={updateState} />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="border-t border-border px-5 sm:px-8 md:px-10 py-3 sm:py-3.5 flex items-center justify-between bg-card">
                {currentStep > 1 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBack}
                    className="gap-1.5 rounded-full px-4 h-9"
                    aria-label={`Back to ${STEPS[currentStep - 2].label}`}
                  >
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" focusable="false" />
                    <span className="hidden sm:inline">Back</span>
                  </Button>
                ) : (
                  <div />
                )}

                <span className="text-[11px] text-muted-foreground font-medium hidden sm:block" aria-hidden="true">
                  {remainingCards === 0 ? "Final step" : `${remainingCards} step${remainingCards > 1 ? "s" : ""} remaining`}
                </span>

                {currentStep < 4 ? (
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      onClick={handleNext}
                      disabled={!canAdvance()}
                      className="gap-1.5 rounded-full px-5 h-9"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4" aria-hidden="true" focusable="false" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      onClick={handleFinish}
                      className="gap-1.5 rounded-full px-5 h-9"
                    >
                      <Check className="w-4 h-4" aria-hidden="true" focusable="false" />
                      Finish
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Disclaimer */}
          <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-primary/15 bg-primary/[0.08] px-4 py-3">
            <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" aria-hidden="true" focusable="false" />
            <p className="text-sm text-foreground leading-relaxed">
              Edits here will reset the next steps. Review carefully before proceeding.
            </p>
          </div>
        </div>
      </main>

      <AIGenerationLoadingDialog
        open={showGenerating}
        courseTitle={formState.title || "AI Generated Course"}
        onComplete={handleGenerationComplete}
      />

      <AlertDialog open={showBackWarning} onOpenChange={setShowBackWarning}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6 text-destructive" aria-hidden="true" focusable="false" />
            </div>
            <AlertDialogTitle className="text-center">Go back and edit?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Edits here will reset the next steps. Any progress on later steps may be lost. Review carefully before proceeding.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 sm:justify-center">
            <AlertDialogCancel className="mt-0">Stay here</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBack} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Go back
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
