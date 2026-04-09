import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import { AISparkles } from "@/components/ui/ai-sparkles";
import { StepCourseIntent } from "@/components/AIGenerate/StepCourseIntent";
import { StepCourseDetails } from "@/components/AIGenerate/StepCourseDetails";
import { StepBlueprintGenerate } from "@/components/AIGenerate/StepBlueprintGenerate";
import { StepEditRefine } from "@/components/AIGenerate/StepEditRefine";
import { VerticalWorkflow } from "@/components/AIGenerate/VerticalWorkflow";

const STEP_DEFINITIONS = [
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
    if (currentStep < 4) setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
    else navigate("/dashboard");
  };

  const handleFinish = () => navigate("/dashboard");

  // Build step data with summaries for completed steps
  const steps = useMemo(() => {
    return STEP_DEFINITIONS.map((def) => {
      let summary = "";
      if (def.id < currentStep) {
        switch (def.id) {
          case 1:
            summary = formState.title || "Untitled";
            break;
          case 2:
            summary = `${formState.layoutType === "multi-page" ? "Multi-page" : "Single-page"} · ${formState.courseSpanTime} min`;
            break;
          case 3:
            summary = "Blueprint generated";
            break;
        }
      }
      return { ...def, summary };
    });
  }, [currentStep, formState.title, formState.layoutType, formState.courseSpanTime]);

  const StepComponent = STEP_COMPONENTS[currentStep - 1];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground">
        Skip to main content
      </a>
      <Header />

      <main id="main-content" className="flex-1 px-4 py-6 sm:py-10">
        <div className="max-w-2xl mx-auto">
          {/* Accessible step status */}
          <div className="sr-only" aria-live="polite">
            Step {currentStep} of {STEP_DEFINITIONS.length}: {STEP_DEFINITIONS[currentStep - 1].label}
          </div>

          {/* Top branding */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2.5 mb-8"
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: "linear-gradient(135deg, hsl(211 100% 50%), hsl(270 80% 55%))" }}
            >
              <AISparkles className="w-4 h-4 !stroke-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground leading-tight">AI Course Generator</h1>
              <p className="text-[11px] text-muted-foreground">Guided step-by-step creation</p>
            </div>
          </motion.div>

          {/* Vertical workflow */}
          <VerticalWorkflow steps={steps} currentStep={currentStep}>
            <StepComponent state={formState} onChange={updateState} />
          </VerticalWorkflow>

          {/* Sticky footer actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="sticky bottom-4 mt-6 flex items-center justify-between rounded-2xl border border-border bg-card/95 backdrop-blur-sm shadow-lg px-5 py-3 z-10"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-1.5 text-muted-foreground hover:text-foreground rounded-full px-3 h-9"
              aria-label={currentStep > 1 ? `Back to ${STEP_DEFINITIONS[currentStep - 2].label}` : "Back to dashboard"}
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" focusable="false" />
              <span className="hidden sm:inline">Back</span>
            </Button>

            <div className="flex items-center gap-1.5" aria-hidden="true">
              {STEP_DEFINITIONS.map((s) => (
                <div
                  key={s.id}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s.id < currentStep
                      ? "w-6 bg-primary"
                      : s.id === currentStep
                      ? "w-8 bg-gradient-to-r from-[hsl(211,100%,50%)] to-[hsl(270,80%,55%)]"
                      : "w-4 bg-border"
                  }`}
                />
              ))}
            </div>

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
          </motion.div>
        </div>
      </main>
    </div>
  );
}