import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Keyboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AISparkles } from "@/components/ui/ai-sparkles";
import { StepCourseIntent } from "@/components/AIGenerate/StepCourseIntent";
import { StepCourseDetails } from "@/components/AIGenerate/StepCourseDetails";
import { StepBlueprintGenerate } from "@/components/AIGenerate/StepBlueprintGenerate";
import { StepEditRefine } from "@/components/AIGenerate/StepEditRefine";
import { useEffect } from "react";

const STEPS = [
  { id: 1, label: "Course Intent" },
  { id: 2, label: "Course Details" },
  { id: 3, label: "Generate" },
  { id: 4, label: "Refine" },
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
      default:
        return true;
    }
  };

  const handleNext = useCallback(() => {
    if (currentStep < 4 && canAdvance()) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep, formState]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    } else {
      navigate("/dashboard");
    }
  }, [currentStep, navigate]);

  const handleFinish = () => navigate("/dashboard");

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight" || e.key === "Enter") handleNext();
      if (e.key === "ArrowLeft") handleBack();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleNext, handleBack]);

  const StepComponent = STEP_COMPONENTS[currentStep - 1];
  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground">
        Skip to main content
      </a>

      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full opacity-[0.03]"
          style={{
            background: "radial-gradient(circle, hsl(211 100% 50%), transparent 70%)",
            top: "-10%",
            right: "-10%",
          }}
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full opacity-[0.03]"
          style={{
            background: "radial-gradient(circle, hsl(270 80% 55%), transparent 70%)",
            bottom: "-10%",
            left: "-5%",
          }}
          animate={{ x: [0, -20, 0], y: [0, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-5 sm:px-8 py-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 px-2 py-1"
          aria-label={currentStep > 1 ? `Back to ${STEPS[currentStep - 2].label}` : "Back to dashboard"}
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" focusable="false" />
          <span className="hidden sm:inline">{currentStep > 1 ? "Back" : "Dashboard"}</span>
        </button>

        {/* Center: step dots + label */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-2">
            {STEPS.map((step) => {
              const isActive = step.id === currentStep;
              const isDone = step.id < currentStep;
              return (
                <motion.div
                  key={step.id}
                  layout
                  className="relative flex items-center justify-center"
                  style={{ width: isActive ? 32 : 8, height: 8 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                >
                  <motion.div
                    layout
                    className="rounded-full h-full w-full"
                    style={{
                      background: isDone
                        ? "hsl(var(--primary))"
                        : isActive
                        ? "linear-gradient(90deg, hsl(211 100% 50%), hsl(270 80% 55%))"
                        : "hsl(var(--border))",
                    }}
                    transition={{ duration: 0.4 }}
                  />
                </motion.div>
              );
            })}
          </div>
          <AnimatePresence mode="wait">
            <motion.span
              key={currentStep}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest"
            >
              {STEPS[currentStep - 1].label}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Right: AI badge */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <AISparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-medium">AI Powered</span>
        </div>
      </header>

      {/* Main content — full center */}
      <main id="main-content" className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-xl">
          {/* Accessible step status */}
          <div className="sr-only" aria-live="polite">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].label}
          </div>

          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={currentStep}
              custom={direction}
              initial={(dir: number) => ({ opacity: 0, y: dir > 0 ? 40 : -40 })}
              animate={{ opacity: 1, y: 0 }}
              exit={(dir: number) => ({ opacity: 0, y: dir > 0 ? -40 : 40 })}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <StepComponent state={formState} onChange={updateState} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom bar */}
      <footer className="relative z-10 px-5 sm:px-8 py-4 flex items-center justify-between">
        {/* Keyboard hint */}
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-muted-foreground" aria-hidden="true">
          <Keyboard className="w-3 h-3" />
          <span>Arrow keys to navigate</span>
        </div>
        <div className="sm:hidden" />

        {/* Progress text */}
        <span className="text-[11px] text-muted-foreground font-medium tabular-nums">
          {currentStep} / {STEPS.length}
        </span>

        {/* Next / Finish */}
        {currentStep < 4 ? (
          <motion.div whileTap={{ scale: 0.96 }}>
            <Button
              size="sm"
              onClick={handleNext}
              disabled={!canAdvance()}
              className="gap-1.5 rounded-full px-5 h-9 shadow-sm"
            >
              Continue
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
            </Button>
          </motion.div>
        ) : (
          <motion.div whileTap={{ scale: 0.96 }}>
            <Button
              size="sm"
              onClick={handleFinish}
              className="gap-1.5 rounded-full px-5 h-9 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
              Finish
            </Button>
          </motion.div>
        )}
      </footer>
    </div>
  );
}