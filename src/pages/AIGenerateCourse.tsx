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
    if (currentStep < 4) setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
    else navigate("/dashboard");
  };

  const handleFinish = () => {
    navigate("/dashboard");
  };

  // Number of "ghost" cards stacked behind the current one
  const stackedBehind = currentStep - 1;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground">
        Skip to main content
      </a>
      <Header />

      <main id="main-content" className="flex-1 flex items-start sm:items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-2xl relative">
          {/* Stacked card shadows behind */}
          {stackedBehind >= 2 && (
            <div
              className="absolute inset-x-3 sm:inset-x-4 top-0 h-full rounded-2xl bg-card border border-border shadow-sm -translate-y-3 sm:-translate-y-4 scale-[0.96]"
              aria-hidden="true"
            />
          )}
          {stackedBehind >= 1 && (
            <div
              className="absolute inset-x-1.5 sm:inset-x-2 top-0 h-full rounded-2xl bg-card border border-border shadow-sm -translate-y-1.5 sm:-translate-y-2 scale-[0.98]"
              aria-hidden="true"
            />
          )}

          {/* Main card */}
          <div className="relative rounded-2xl bg-card border border-border shadow-lg overflow-hidden">
            {/* Step indicator - minimal dots */}
            <div className="flex items-center justify-center gap-2 pt-5 sm:pt-6 pb-1" aria-hidden="true">
              {STEPS.map((step) => (
                <div
                  key={step.id}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    step.id === currentStep
                      ? "w-6 bg-primary"
                      : step.id < currentStep
                        ? "w-1.5 bg-primary/40"
                        : "w-1.5 bg-border"
                  )}
                />
              ))}
            </div>

            {/* Accessible step status for screen readers */}
            <div className="sr-only" aria-live="polite">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].label}
            </div>

            {/* Card body */}
            <div className="px-5 sm:px-8 md:px-10 pt-4 sm:pt-5 pb-4 sm:pb-5 min-h-[320px] sm:min-h-[380px] max-h-[calc(100vh-220px)] overflow-y-auto thin-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {currentStep === 1 && <StepCourseIntent state={formState} onChange={updateState} />}
                  {currentStep === 2 && <StepCourseDetails state={formState} onChange={updateState} />}
                  {currentStep === 3 && <StepBlueprintGenerate state={formState} onChange={updateState} />}
                  {currentStep === 4 && <StepEditRefine state={formState} onChange={updateState} />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer navigation */}
            <div className="border-t border-border px-5 sm:px-8 md:px-10 py-3.5 sm:py-4 flex items-center justify-between bg-card">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="gap-1.5 text-muted-foreground hover:text-foreground rounded-full px-3 h-9"
                aria-label={currentStep > 1 ? `Back to ${STEPS[currentStep - 2].label}` : "Back to dashboard"}
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" focusable="false" />
                Back
              </Button>

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
