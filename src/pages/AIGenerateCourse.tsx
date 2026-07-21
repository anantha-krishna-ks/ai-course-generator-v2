import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Info, AlertTriangle, Sparkles } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { addLoadingCourse } from "@/lib/loadingCourses";

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
  { id: 3, label: "Preferences" },
  { id: 4, label: "Blueprint" },
] as const;

export interface AIGenerateState {
  title: string;
  intendedLearners: string;
  learningOutcome: string;
  learningObjectives: string[];
  bloomsTaxonomy: string[];
  supportingDocuments: string[];
  guidelines: string;
  guidelinesDocuments: string[];
  exclusions: string;
  exclusionsDocuments: string[];
  pageSpanTime: number;
  courseSpanTime: number;
  blueprintSource: "import" | "ai";
  blueprintSections: number;
  blueprintPages: number;
  layoutType: "multi-page" | "single-page";
  duration: "brief" | "standard" | "extended";
  tone: "professional" | "conversational" | "coaching" | "ai-determined";
  font: string;
  contentPreferences: {
    includeQuestions: boolean;
    interactiveBlocks: boolean;
    addImages: boolean;
  };
  questionsPerPage: number;
  questionTypes: {
    singleChoice: number;
    multipleChoice: number;
    trueFalse: number;
    fillInBlank: number;
  };
  courseQuizType: "formative" | "summative";
  courseQuizConfig: QuizScopeConfig;
  sectionQuizType: "formative" | "summative";
  sectionQuizConfig: QuizScopeConfig;
  pageQuizType: "formative" | "summative";
  pageQuizConfig: QuizScopeConfig;
  sectionImages: boolean;
  pageImages: boolean;
  scormPageDurationSec: number;
  scormBgImage: { name: string; url: string } | null;
  scormBgOpacity: number;
  scormPassMessage: string;
  scormFailMessage: string;
}

export interface QuizVariantConfig {
  enabled: boolean;
  questionsPerQuiz: number;
  questionTypes: {
    singleChoice: number;
    multipleChoice: number;
    trueFalse: number;
    fillInBlank: number;
  };
}

export interface QuizScopeConfig {
  formative: QuizVariantConfig;
  summative: QuizVariantConfig;
}

const defaultQuizScope: QuizScopeConfig = {
  formative: { enabled: false, questionsPerQuiz: 5, questionTypes: { singleChoice: 2, multipleChoice: 1, trueFalse: 1, fillInBlank: 1 } },
  summative: { enabled: false, questionsPerQuiz: 10, questionTypes: { singleChoice: 4, multipleChoice: 3, trueFalse: 2, fillInBlank: 1 } },
};

const initialState: AIGenerateState = {
  title: "",
  intendedLearners: "",
  learningOutcome: "",
  learningObjectives: [""],
  bloomsTaxonomy: [],
  supportingDocuments: [],
  guidelines: "",
  guidelinesDocuments: [],
  exclusions: "",
  exclusionsDocuments: [],
  pageSpanTime: 5,
  courseSpanTime: 60,
  blueprintSource: "ai",
  blueprintSections: 5,
  blueprintPages: 4,
  layoutType: "multi-page",
  duration: "standard",
  tone: "ai-determined",
  font: "default",
  contentPreferences: {
    includeQuestions: true,
    interactiveBlocks: true,
    addImages: true,
  },
  questionsPerPage: 3,
  questionTypes: {
    singleChoice: 1,
    multipleChoice: 1,
    trueFalse: 1,
    fillInBlank: 0,
  },
  courseQuizType: "formative",
  courseQuizConfig: JSON.parse(JSON.stringify(defaultQuizScope)),
  sectionQuizType: "formative",
  sectionQuizConfig: JSON.parse(JSON.stringify(defaultQuizScope)),
  pageQuizType: "formative",
  pageQuizConfig: JSON.parse(JSON.stringify(defaultQuizScope)),
  scormPageDurationSec: 30,
  scormBgImage: null,
  scormBgOpacity: 40,
  scormPassMessage: "Congratulations! You have successfully completed the course.",
  scormFailMessage: "You did not meet the passing criteria. Please review the material and try again.",
};

const STEP_COMPONENTS: React.ComponentType<any>[] = [StepCourseIntent, StepCourseDetails, StepBlueprintGenerate, StepEditRefine];

export default function AIGenerateCourse() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formState, setFormState] = useState<AIGenerateState>(initialState);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [showGenerating, setShowGenerating] = useState(false);
  const [showBackWarning, setShowBackWarning] = useState(false);
  const [highestVisitedStep, setHighestVisitedStep] = useState(1);
  const [suppressBackWarning, setSuppressBackWarning] = useState(false);
  const [dontShowAgainChecked, setDontShowAgainChecked] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [makeAsLoading, setMakeAsLoading] = useState(false);

  const updateState = useCallback((partial: Partial<AIGenerateState>) => {
    setFormState((prev) => {
      const next = { ...prev, ...partial };
      // Clear errors for fields being edited
      setErrors((prevErrors) => {
        if (Object.keys(prevErrors).length === 0) return prevErrors;
        const cleared = { ...prevErrors };
        if ("title" in partial && next.title.trim()) delete cleared.title;
        if ("intendedLearners" in partial && next.intendedLearners.trim()) delete cleared.intendedLearners;
        if ("pageSpanTime" in partial && next.pageSpanTime) delete cleared.pageSpanTime;
        if ("bloomsTaxonomy" in partial && next.bloomsTaxonomy.length > 0) delete cleared.bloomsTaxonomy;
        if ("learningOutcome" in partial && next.learningOutcome.trim()) delete cleared.learningOutcome;
        if ("learningObjectives" in partial && next.learningObjectives.some((o) => o.trim())) delete cleared.learningObjectives;
        return cleared;
      });
      return next;
    });
  }, []);

  const validateCurrentStep = (): { ok: boolean; errors: Record<string, string>; firstField?: string } => {
    const e: Record<string, string> = {};
    let firstField: string | undefined;
    const fail = (key: string, msg: string) => {
      e[key] = msg;
      if (!firstField) firstField = key;
    };
    switch (currentStep) {
      case 1:
        if (!formState.title.trim()) fail("title", "Course title is required");
        break;
      case 2:
        if (!formState.learningOutcome.trim()) fail("learningOutcome", "Please describe what learners should be able to do");
        if (!formState.intendedLearners.trim()) fail("intendedLearners", "Please select intended learners");
        if (!formState.pageSpanTime) fail("pageSpanTime", "Please set a page duration");
        if (formState.bloomsTaxonomy.length === 0) fail("bloomsTaxonomy", "Select at least one Bloom's Taxonomy level");
        if (!formState.learningObjectives.some((o) => o.trim())) fail("learningObjectives", "Add at least one learning objective");
        break;
    }
    return { ok: Object.keys(e).length === 0, errors: e, firstField };
  };

  const scrollToField = (field: string) => {
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(`[data-field="${field}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const focusable = el.querySelector<HTMLElement>("input, textarea, button, [tabindex]");
        setTimeout(() => focusable?.focus({ preventScroll: true }), 350);
      }
    });
  };

  const handleNext = () => {
    const { ok, errors: e, firstField } = validateCurrentStep();
    if (!ok) {
      setErrors(e);
      if (firstField) scrollToField(firstField);
      return;
    }
    setErrors({});
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
      if (highestVisitedStep > currentStep - 1 && !suppressBackWarning) {
        setDontShowAgainChecked(false);
        setShowBackWarning(true);
      } else {
        confirmBack();
      }
    } else {
      navigate("/dashboard");
    }
  };

  const confirmBack = () => {
    if (dontShowAgainChecked) {
      setSuppressBackWarning(true);
    }
    setShowBackWarning(false);
    setDirection(-1);
    setCurrentStep((s) => s - 1);
  };

  const handleFinish = () => {
    setMakeAsLoading(false);
    setShowFinishConfirm(true);
  };

  const confirmFinish = () => {
    setShowFinishConfirm(false);
    if (makeAsLoading) {
      addLoadingCourse({
        title: formState.title || "AI Generated Course",
        durationMs: 5 * 60 * 1000,
      });
      navigate("/dashboard");
      return;
    }
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
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="aurora-bg" aria-hidden="true" />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground">
        Skip to main content
      </a>
      <div className="relative z-10 flex flex-col flex-1">
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
        <div className="w-full max-w-4xl">

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

          {/* Workflow heading — compact, centered */}
          <div className="-mt-2 sm:-mt-4 mb-5 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              className="group relative inline-flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-full bg-gradient-to-r from-primary/10 via-primary/[0.06] to-transparent ring-1 ring-inset ring-primary/20 backdrop-blur-sm"
            >
              <span
                className="relative w-7 h-7 rounded-full bg-gradient-to-br from-primary to-[hsl(var(--primary)/0.78)] text-primary-foreground flex items-center justify-center shadow-[0_4px_12px_-3px_hsl(var(--primary)/0.5),inset_0_1px_0_hsl(0_0%_100%/0.25)] shrink-0"
                aria-hidden="true"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary-foreground" aria-hidden="true" focusable="false" />
                <ArrowRight className="absolute -right-0.5 -bottom-0.5 w-3 h-3 p-[2px] rounded-full bg-background text-primary ring-1 ring-primary/30" aria-hidden="true" focusable="false" />
              </span>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary/80">
                  Workflow
                </span>
                <span aria-hidden="true" className="w-px h-3 bg-primary/25" />
                <span className="text-[13px] font-semibold text-foreground leading-none whitespace-nowrap">
                  AI Generate Course
                </span>
              </div>
            </motion.div>
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
          <div className="relative rounded-2xl p-[1px] overflow-hidden shadow-[0_1px_1px_hsl(var(--foreground)/0.04),0_4px_10px_-4px_hsl(var(--foreground)/0.07),0_10px_24px_-12px_hsl(var(--foreground)/0.09)]">
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

              {/* Card header with ribbon-style step badge */}
              <div className="flex items-center gap-3 pr-5 sm:pr-8 md:pr-10 pt-5 sm:pt-6 pb-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`ribbon-${currentStep}`}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                    className="relative shrink-0"
                  >
                    {/* Folded tail behind ribbon */}
                    <div
                      className="absolute -left-0 -bottom-1.5 w-3 h-3 z-0"
                      style={{
                        background: "linear-gradient(135deg, hsl(211, 100%, 30%), hsl(270, 80%, 35%))",
                        clipPath: "polygon(0 0, 100% 0, 100% 100%)",
                      }}
                      aria-hidden="true"
                    />
                    {/* Main ribbon */}
                    <div
                      className="relative z-10 flex items-center gap-2.5 pl-4 pr-6 py-2 text-white shadow-[0_4px_12px_-4px_hsl(211,100%,50%,0.4)]"
                      style={{
                        background: "linear-gradient(90deg, hsl(232, 90%, 50%) 0%, hsl(211, 100%, 52%) 50%, hsl(195, 95%, 55%) 100%)",
                        clipPath: "polygon(0 0, 100% 0, calc(100% - 14px) 50%, 100% 100%, 0 100%)",
                        borderTopRightRadius: "9999px",
                        borderBottomRightRadius: "9999px",
                        borderTopLeftRadius: "6px",
                        borderBottomLeftRadius: "6px",
                      }}
                    >
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/25 text-[11px] font-bold backdrop-blur-sm">
                        {currentStep}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold tracking-wide pr-2">
                        {STEPS[currentStep - 1].label}
                      </span>
                    </div>
                  </motion.div>
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
                    <StepComponent state={formState} onChange={updateState} errors={errors} />
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

          {/* Disclaimer – hidden on first step and on final step */}
          {currentStep > 1 && currentStep < STEPS.length && (
            <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-primary/15 bg-primary/[0.08] px-4 py-3">
              <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" aria-hidden="true" focusable="false" />
              <p className="text-sm text-foreground leading-relaxed">
                If you go back and make changes, those updates will be reflected in the next steps.
              </p>
            </div>
          )}
        </div>
      </main>

      <AIGenerationLoadingDialog
        open={showGenerating}
        courseTitle={formState.title || "AI Generated Course"}
        onComplete={handleGenerationComplete}
      />

      <AlertDialog open={showFinishConfirm} onOpenChange={setShowFinishConfirm}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <AISparkles className="w-6 h-6" />
            </div>
            <AlertDialogTitle className="text-center">Generate this course?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Confirm to start generating "{formState.title || "your course"}". You can let it run in the background and keep working from the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-start gap-2.5 mx-auto max-w-sm rounded-xl border border-border/70 bg-muted/30 px-3.5 py-3">
            <Checkbox
              id="make-as-loading"
              checked={makeAsLoading}
              onCheckedChange={(checked) => setMakeAsLoading(checked === true)}
              aria-label="Make this as a course loading"
              className="mt-0.5"
            />
            <label htmlFor="make-as-loading" className="text-sm text-foreground cursor-pointer select-none leading-snug">
              <span className="font-medium">Make this as a course loading</span>
              <span className="block text-xs text-muted-foreground mt-0.5">
                Continue in the background. We'll show progress on the dashboard while the course is being generated.
              </span>
            </label>
          </div>
          <AlertDialogFooter className="flex-row gap-2 sm:justify-center">
            <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmFinish} className="gap-1.5">
              <Check className="w-4 h-4" aria-hidden="true" focusable="false" />
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
          <div className="flex items-center gap-2 justify-center pt-1 pb-2">
            <Checkbox
              id="dont-show-again"
              checked={dontShowAgainChecked}
              onCheckedChange={(checked) => setDontShowAgainChecked(checked === true)}
              aria-label="Don't show this warning again"
            />
            <label htmlFor="dont-show-again" className="text-xs text-muted-foreground cursor-pointer select-none">
              Don't show this again
            </label>
          </div>
          <AlertDialogFooter className="flex-row gap-2 sm:justify-center">
            <AlertDialogAction onClick={confirmBack} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1.5">
              <ArrowLeft className="w-4 h-4" aria-hidden="true" focusable="false" />
              Go back
            </AlertDialogAction>
            <AlertDialogCancel className="mt-0 gap-1.5">
              <Check className="w-4 h-4" aria-hidden="true" focusable="false" />
              Stay here
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  );
}
