import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { AISparkles } from "@/components/ui/ai-sparkles";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { StepCourseIntent } from "@/components/AIGenerate/StepCourseIntent";
import { StepCourseDetails } from "@/components/AIGenerate/StepCourseDetails";
import { StepBlueprintGenerate } from "@/components/AIGenerate/StepBlueprintGenerate";
import { StepEditRefine } from "@/components/AIGenerate/StepEditRefine";

const STEPS = [
  { id: 1, label: "Course Intent" },
  { id: 2, label: "Course Details" },
  { id: 3, label: "Blueprint & Generate" },
  { id: 4, label: "Edit & Refine" },
] as const;

export interface AIGenerateState {
  title: string;
  intendedLearners: string;
  bloomsTaxonomy: string[];
  supportingDocuments: string[];
  guidelines: string;
  guidelinesDocuments: string[];
  exclusions: string;
  exclusionsDocuments: string[];
  pageSpanTime: number;
  courseSpanTime: number;
  layoutType: "multi-page" | "single-page";
}

const initialState: AIGenerateState = {
  title: "",
  intendedLearners: "",
  bloomsTaxonomy: [],
  supportingDocuments: [],
  guidelines: "",
  guidelinesDocuments: [],
  exclusions: "",
  exclusionsDocuments: [],
  pageSpanTime: 5,
  courseSpanTime: 60,
  layoutType: "multi-page",
};

export default function AIGenerateCourse() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formState, setFormState] = useState<AIGenerateState>(initialState);
  const [direction, setDirection] = useState<1 | -1>(1);

  const updateState = useCallback((partial: Partial<AIGenerateState>) => {
    setFormState((prev) => ({ ...prev, ...partial }));
  }, []);

  const canAdvance = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!formState.title.trim() && formState.bloomsTaxonomy.length > 0 && !!formState.intendedLearners;
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
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    } else {
      navigate("/dashboard");
    }
  };

  const handleFinish = () => {
    navigate("/dashboard");
  };

  // Cards remaining (including current) = total - (currentStep - 1)
  const remainingCards = STEPS.length - currentStep;

  const cardVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      y: dir > 0 ? 24 : -24,
      scale: 0.98,
    }),
    center: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
    exit: (dir: number) => ({
      opacity: 0,
      y: dir > 0 ? -24 : 24,
      scale: 0.96,
    }),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground">
        Skip to main content
      </a>
      <Header />

      <main id="main-content" className="flex-1 flex items-start sm:items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-2xl relative">

          {/* Stacked ghost cards behind — animate count based on remaining */}
          <AnimatePresence>
            {remainingCards >= 3 && (
              <motion.div
                key="ghost-3"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6, transition: { duration: 0.25 } }}
                className="absolute inset-x-4 sm:inset-x-5 top-0 h-full rounded-2xl bg-card border border-border/60 -translate-y-4 sm:-translate-y-5 scale-[0.94]"
                aria-hidden="true"
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {remainingCards >= 2 && (
              <motion.div
                key="ghost-2"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4, transition: { duration: 0.3 } }}
                className="absolute inset-x-2.5 sm:inset-x-3 top-0 h-full rounded-2xl bg-card border border-border/70 -translate-y-2.5 sm:-translate-y-3 scale-[0.97]"
                aria-hidden="true"
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {remainingCards >= 1 && (
              <motion.div
                key="ghost-1"
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 2, transition: { duration: 0.35 } }}
                className="absolute inset-x-1 sm:inset-x-1.5 top-0 h-full rounded-2xl bg-card border border-border/80 -translate-y-1 sm:-translate-y-1.5 scale-[0.99]"
                aria-hidden="true"
              />
            )}
          </AnimatePresence>

          {/* Main card */}
          <div className="relative rounded-2xl bg-card border border-border shadow-lg overflow-hidden">
            {/* Step badge + dots header */}
            <div className="flex items-center justify-between px-5 sm:px-8 md:px-10 pt-5 sm:pt-6 pb-2">
              {/* Step number badge */}
              <div className="flex items-center gap-2.5">
                <motion.div
                  key={`badge-${currentStep}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-sm"
                >
                  {currentStep}
                </motion.div>
                <motion.span
                  key={`label-${currentStep}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05, duration: 0.2 }}
                  className="text-xs sm:text-sm font-semibold text-foreground"
                >
                  {STEPS[currentStep - 1].label}
                </motion.span>
              </div>

              {/* Step progress dots */}
              <div className="flex items-center gap-1.5" aria-hidden="true">
                {STEPS.map((step) => (
                  <motion.div
                    key={step.id}
                    layout
                    className={cn(
                      "h-1.5 rounded-full transition-colors duration-300",
                      step.id === currentStep
                        ? "bg-primary w-5"
                        : step.id < currentStep
                          ? "bg-primary/30 w-1.5"
                          : "bg-border w-1.5"
                    )}
                  />
                ))}
                <span className="text-[10px] text-muted-foreground ml-1.5 tabular-nums font-medium">
                  {currentStep}/{STEPS.length}
                </span>
              </div>
            </div>

            {/* Accessible step status for screen readers */}
            <div className="sr-only" aria-live="polite">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].label}
            </div>

            {/* Card body */}
            <div className="px-5 sm:px-8 md:px-10 pt-3 sm:pt-4 pb-4 sm:pb-5 min-h-[300px] sm:min-h-[360px] max-h-[calc(100vh-240px)] overflow-y-auto thin-scrollbar">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={cardVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {currentStep === 1 && <StepCourseIntent state={formState} onChange={updateState} />}
                  {currentStep === 2 && <StepCourseDetails state={formState} onChange={updateState} />}
                  {currentStep === 3 && <StepBlueprintGenerate state={formState} onChange={updateState} />}
                  {currentStep === 4 && <StepEditRefine state={formState} onChange={updateState} />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer navigation */}
            <div className="border-t border-border px-5 sm:px-8 md:px-10 py-3 sm:py-3.5 flex items-center justify-between bg-card">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="gap-1.5 text-muted-foreground hover:text-foreground rounded-full px-3 h-9"
                aria-label={currentStep > 1 ? `Back to ${STEPS[currentStep - 2].label}` : "Back to dashboard"}
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" focusable="false" />
                <span className="hidden sm:inline">Back</span>
              </Button>

              <span className="text-[11px] text-muted-foreground font-medium hidden sm:block" aria-hidden="true">
                {remainingCards === 0 ? "Final step" : `${remainingCards} step${remainingCards > 1 ? "s" : ""} remaining`}
              </span>

              {currentStep < 4 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNext}
                  disabled={!canAdvance()}
                  className="gap-1.5 text-foreground hover:text-foreground rounded-full px-3 h-9"
                >
                  Next
                  <ArrowRight className="w-4 h-4" aria-hidden="true" focusable="false" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleFinish}
                  className="gap-1.5 rounded-full px-5 h-9"
                >
                  <Check className="w-4 h-4" aria-hidden="true" focusable="false" />
                  Finish
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
