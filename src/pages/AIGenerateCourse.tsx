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

  const remainingCards = STEPS.length - currentStep;
  const StepComponent = STEP_COMPONENTS[currentStep - 1];

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

          {/* Mini step rail above the card */}
          <div className="flex items-center gap-1 mb-3 px-1">
            {STEPS.map((step) => {
              const isActive = step.id === currentStep;
              const isDone = step.id < currentStep;
              return (
                <div key={step.id} className="flex items-center gap-1 flex-1">
                  <motion.div
                    className="h-1 rounded-full flex-1"
                    animate={{
                      backgroundColor: isDone || isActive
                        ? "hsl(var(--primary))"
                        : "hsl(var(--border))",
                      opacity: isDone ? 0.35 : 1,
                    }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              );
            })}
            <span className="text-[10px] text-muted-foreground tabular-nums font-medium ml-1.5 shrink-0">
              {currentStep}/{STEPS.length}
            </span>
          </div>

          {/* Main card */}
          <div className="relative rounded-2xl bg-card border border-border shadow-lg overflow-hidden">
            {/* Card header */}
            <div className="flex items-center gap-2.5 px-5 sm:px-8 md:px-10 pt-5 sm:pt-6 pb-1">
              <motion.div
                key={`badge-${currentStep}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-sm shrink-0"
              >
                {currentStep}
              </motion.div>
              <motion.span
                key={`label-${currentStep}`}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08, duration: 0.25 }}
                className="text-xs sm:text-sm font-semibold text-foreground"
              >
                {STEPS[currentStep - 1].label}
              </motion.span>
            </div>

            {/* Card body with crossfade */}
            <div className="px-5 sm:px-8 md:px-10 pt-3 sm:pt-4 pb-4 sm:pb-5 min-h-[300px] sm:min-h-[360px] max-h-[calc(100vh-260px)] overflow-y-auto thin-scrollbar">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: direction > 0 ? 60 : -60, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: direction > 0 ? -60 : 60, filter: "blur(4px)" }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
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
