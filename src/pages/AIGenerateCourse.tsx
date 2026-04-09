import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
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

// Each step rendered as its own card in the stack
const STEP_COMPONENTS = [StepCourseIntent, StepCourseDetails, StepBlueprintGenerate, StepEditRefine];

export default function AIGenerateCourse() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formState, setFormState] = useState<AIGenerateState>(initialState);

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
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    } else {
      navigate("/dashboard");
    }
  };

  const handleFinish = () => {
    navigate("/dashboard");
  };

  const remainingCards = STEPS.length - currentStep;

  // Stack offsets for cards behind the current one
  const getStackStyle = (stackIndex: number) => ({
    y: -(stackIndex * 8),
    scale: 1 - stackIndex * 0.03,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground">
        Skip to main content
      </a>
      <Header />

      <main id="main-content" className="flex-1 flex items-start sm:items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-2xl relative" style={{ perspective: "1200px" }}>

          {/* Accessible step status for screen readers */}
          <div className="sr-only" aria-live="polite">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].label}
          </div>

          {/* Card stack — renders cards from bottom to top */}
          <div className="relative">
            <AnimatePresence>
              {STEPS.map((step) => {
                // Only render current step and future steps (past cards are swiped away)
                if (step.id < currentStep) return null;

                const stackIndex = step.id - currentStep; // 0 = front, 1 = first behind, etc.
                const isFront = stackIndex === 0;
                const StepComponent = STEP_COMPONENTS[step.id - 1];

                return (
                  <motion.div
                    key={step.id}
                    layout={!isFront}
                    initial={false}
                    animate={{
                      ...getStackStyle(stackIndex),
                      opacity: stackIndex > 2 ? 0 : 1,
                      rotateZ: 0,
                      x: 0,
                    }}
                    exit={{
                      x: -300,
                      rotateZ: -8,
                      opacity: 0,
                      scale: 0.95,
                      transition: {
                        duration: 0.4,
                        ease: [0.32, 0.72, 0, 1],
                      },
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 28,
                    }}
                    style={{
                      zIndex: STEPS.length - stackIndex,
                      position: isFront ? "relative" : "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      transformOrigin: "center top",
                    }}
                    className="w-full"
                    aria-hidden={!isFront}
                  >
                    <div
                      className={cn(
                        "rounded-2xl bg-card border border-border shadow-lg overflow-hidden",
                        !isFront && "pointer-events-none"
                      )}
                    >
                      {/* Step badge + dots header */}
                      <div className="flex items-center justify-between px-5 sm:px-8 md:px-10 pt-5 sm:pt-6 pb-2">
                        <div className="flex items-center gap-2.5">
                          {isFront ? (
                            <motion.div
                              key={`badge-${step.id}`}
                              initial={{ scale: 0.6, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.15 }}
                              className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-sm"
                            >
                              {step.id}
                            </motion.div>
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                              {step.id}
                            </div>
                          )}
                          <span className="text-xs sm:text-sm font-semibold text-foreground">
                            {step.label}
                          </span>
                        </div>

                        {/* Step progress dots */}
                        <div className="flex items-center gap-1.5" aria-hidden="true">
                          {STEPS.map((s) => (
                            <div
                              key={s.id}
                              className={cn(
                                "h-1.5 rounded-full transition-all duration-300",
                                s.id === step.id
                                  ? "bg-primary w-5"
                                  : s.id < step.id
                                    ? "bg-primary/30 w-1.5"
                                    : "bg-border w-1.5"
                              )}
                            />
                          ))}
                          <span className="text-[10px] text-muted-foreground ml-1.5 tabular-nums font-medium">
                            {step.id}/{STEPS.length}
                          </span>
                        </div>
                      </div>

                      {/* Card body — only render content for front card */}
                      <div className="px-5 sm:px-8 md:px-10 pt-3 sm:pt-4 pb-4 sm:pb-5 min-h-[300px] sm:min-h-[360px] max-h-[calc(100vh-240px)] overflow-y-auto thin-scrollbar">
                        {isFront ? (
                          <motion.div
                            key={`content-${step.id}`}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
                          >
                            <StepComponent state={formState} onChange={updateState} />
                          </motion.div>
                        ) : (
                          <div className="opacity-0">
                            {/* Placeholder to maintain card height */}
                            <div className="h-[300px] sm:h-[360px]" />
                          </div>
                        )}
                      </div>

                      {/* Footer navigation — only on front card */}
                      {isFront && (
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
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
