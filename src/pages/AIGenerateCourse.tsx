import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { AISparkles } from "@/components/ui/ai-sparkles";
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

const STEP_COMPONENTS = [StepCourseIntent, StepCourseDetails, StepBlueprintGenerate, StepEditRefine];

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

      <main id="main-content" className="flex-1 flex items-start sm:items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-2xl">

          {/* Accessible step status */}
          <div className="sr-only" aria-live="polite">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].label}
          </div>

          {/* Elegant step indicators */}
          <div className="flex items-center gap-2 sm:gap-3 mb-4 px-1">
            {STEPS.map((step, i) => {
              const isActive = step.id === currentStep;
              const isDone = step.id < currentStep;
              return (
                <div key={step.id} className="flex items-center gap-2 sm:gap-3 flex-1">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <motion.span
                      animate={{ 
                        color: isActive ? "hsl(var(--foreground))" : isDone ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                      }}
                      className="text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase hidden sm:block"
                    >
                      {step.label}
                    </motion.span>
                    <div className="relative h-1 rounded-full bg-border overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-full bg-primary"
                        initial={false}
                        animate={{
                          width: isDone ? "100%" : isActive ? "50%" : "0%",
                        }}
                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

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
              className="relative rounded-2xl bg-card shadow-lg overflow-hidden"
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
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Card body */}
            <div className="px-5 sm:px-8 md:px-10 pt-3 sm:pt-4 pb-4 sm:pb-5 min-h-[300px] sm:min-h-[360px] max-h-[calc(100vh-280px)] overflow-y-auto thin-scrollbar">
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
                <motion.div whileTap={{ scale: 0.95 }}>
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
      </main>
    </div>
  );
}
