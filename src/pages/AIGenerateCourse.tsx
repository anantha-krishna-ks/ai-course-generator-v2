import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";
import { AISparkles } from "@/components/ui/ai-sparkles";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { StepCourseIntent } from "@/components/AIGenerate/StepCourseIntent";
import { StepCourseDetails } from "@/components/AIGenerate/StepCourseDetails";
import { StepBlueprintGenerate } from "@/components/AIGenerate/StepBlueprintGenerate";
import { StepEditRefine } from "@/components/AIGenerate/StepEditRefine";

const STEPS = [
  { id: 1, label: "Course Intent", shortLabel: "Intent" },
  { id: 2, label: "Course Details", shortLabel: "Details" },
  { id: 3, label: "Blueprint & Generate", shortLabel: "Blueprint" },
  { id: 4, label: "Edit & Refine", shortLabel: "Refine" },
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
        return true;
      case 3:
        return true;
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
  };

  const handleFinish = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground">
        Skip to main content
      </a>
      <Header />

      <main id="main-content" className="flex-1 flex flex-col">
        {/* Top bar with back + stepper */}
        <div className="border-b border-border bg-card">
          <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-4 flex flex-col gap-4">
            {/* Back button row */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => currentStep > 1 ? handleBack() : navigate("/dashboard")}
                className="gap-2 text-muted-foreground hover:text-foreground rounded-full"
                aria-label={currentStep > 1 ? `Go back to ${STEPS[currentStep - 2].label}` : "Go back to dashboard"}
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" focusable="false" />
                <span className="hidden sm:inline">{currentStep > 1 ? "Back" : "Dashboard"}</span>
              </Button>

              <div className="flex items-center gap-2">
                <AISparkles className="w-5 h-5" />
                <span className="text-sm font-semibold text-foreground">AI Course Generator</span>
              </div>
            </div>

            {/* Stepper */}
            <nav aria-label="Course generation steps" className="w-full">
              <ol className="flex items-center w-full" role="list">
                {STEPS.map((step, index) => {
                  const isActive = step.id === currentStep;
                  const isCompleted = step.id < currentStep;
                  const isLast = index === STEPS.length - 1;

                  return (
                    <li
                      key={step.id}
                      className={cn("flex items-center", !isLast && "flex-1")}
                    >
                      {/* Step indicator */}
                      <button
                        type="button"
                        onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                        disabled={step.id > currentStep}
                        className={cn(
                          "flex items-center gap-2.5 group transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full px-1 py-1",
                          step.id < currentStep && "cursor-pointer",
                          step.id > currentStep && "cursor-default opacity-50"
                        )}
                        aria-current={isActive ? "step" : undefined}
                        aria-label={`Step ${step.id}: ${step.label}${isCompleted ? " (completed)" : isActive ? " (current)" : ""}`}
                      >
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shrink-0",
                            isCompleted && "bg-primary text-primary-foreground shadow-sm",
                            isActive && "bg-primary text-primary-foreground shadow-md ring-4 ring-primary/20",
                            !isCompleted && !isActive && "bg-muted text-muted-foreground border border-border"
                          )}
                        >
                          {isCompleted ? (
                            <Check className="w-4 h-4" aria-hidden="true" focusable="false" />
                          ) : (
                            step.id
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-xs font-medium transition-colors hidden md:inline",
                            isActive && "text-foreground font-semibold",
                            isCompleted && "text-primary group-hover:text-primary/80",
                            !isCompleted && !isActive && "text-muted-foreground"
                          )}
                        >
                          {step.label}
                        </span>
                      </button>

                      {/* Connector line */}
                      {!isLast && (
                        <div className="flex-1 mx-2 sm:mx-3" aria-hidden="true">
                          <div
                            className={cn(
                              "h-0.5 rounded-full transition-all duration-500",
                              isCompleted ? "bg-primary" : "bg-border"
                            )}
                          />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {currentStep === 1 && (
                <StepCourseIntent state={formState} onChange={updateState} />
              )}
              {currentStep === 2 && (
                <StepCourseDetails state={formState} onChange={updateState} />
              )}
              {currentStep === 3 && (
                <StepBlueprintGenerate state={formState} onChange={updateState} />
              )}
              {currentStep === 4 && (
                <StepEditRefine state={formState} onChange={updateState} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom action bar */}
        <div className="border-t border-border bg-card">
          <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-4 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="rounded-full gap-2"
              aria-label={currentStep > 1 ? `Go back to ${STEPS[currentStep - 2].label}` : "Back"}
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" focusable="false" />
              Back
            </Button>

            <div className="flex items-center gap-2 text-xs text-muted-foreground" aria-hidden="true">
              Step {currentStep} of {STEPS.length}
            </div>

            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                disabled={!canAdvance()}
                className="rounded-full gap-2"
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                className="rounded-full gap-2"
              >
                <Check className="w-4 h-4" aria-hidden="true" focusable="false" />
                Finish
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
