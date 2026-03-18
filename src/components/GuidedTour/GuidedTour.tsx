import { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronRight, ChevronLeft, Lightbulb, Rocket, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export interface TourStep {
  target: string; // data-tour attribute value
  icon?: React.ReactNode;
  title: string;
  description: string;
  tip?: string;
  placement?: "top" | "bottom" | "left" | "right";
}

interface GuidedTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  onStepChange?: (stepIndex: number) => void;
}

function WelcomeScreen({ onStart, onSkip, stepCount }: { onStart: () => void; onSkip: () => void; stepCount: number }) {
  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      {/* Dimmed background */}
      <div className="absolute inset-0 bg-black/50" onClick={onSkip} />

      {/* Centered welcome card */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-background border border-border rounded-xl shadow-[0_20px_60px_-12px_hsl(var(--foreground)/0.2)] overflow-hidden"
        >
          {/* Decorative top gradient */}
          <div className="h-1.5 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

          <div className="px-7 pt-7 pb-6">
            {/* Icon */}
            <div className="flex justify-center mb-5">
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center"
              >
                <Rocket className="w-7 h-7 text-primary" />
              </motion.div>
            </div>

            {/* Text */}
            <div className="text-center space-y-2.5">
              <h2 className="text-xl font-semibold text-foreground">Welcome to the Course Creator</h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                Let us show you around! A quick tour to help you build amazing courses in no time.
              </p>
            </div>

            {/* Meta badge */}
            <div className="flex justify-center mt-4">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-muted/60 border border-border">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  {stepCount} quick steps
                </span>
                <div className="w-px h-3.5 bg-border" />
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  Takes less than a minute
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-center gap-2.5 mt-7">
              <button
                onClick={onStart}
                className="w-full max-w-[260px] flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors shadow-sm"
              >
                Start Quick Tour
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={onSkip}
                className="px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full"
              >
                Skip for now
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>,
    document.body
  );
}

export function GuidedTour({ steps, isOpen, onClose, onComplete, onStepChange }: GuidedTourProps) {
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = steps[currentStep];

  const updatePosition = useCallback(() => {
    if (!step) return;
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    setSpotlightRect(rect);

    requestAnimationFrame(() => {
      const tooltip = tooltipRef.current;
      if (!tooltip) return;
      const tw = tooltip.offsetWidth;
      const th = tooltip.offsetHeight;
      const padding = 16;
      const placement = step.placement || "bottom";

      let top = 0;
      let left = 0;

      switch (placement) {
        case "bottom":
          top = rect.bottom + padding;
          left = rect.left + rect.width / 2 - tw / 2;
          break;
        case "top":
          top = rect.top - th - padding;
          left = rect.left + rect.width / 2 - tw / 2;
          break;
        case "left":
          top = rect.top + rect.height / 2 - th / 2;
          left = rect.left - tw - padding;
          break;
        case "right":
          top = rect.top + rect.height / 2 - th / 2;
          left = rect.right + padding;
          break;
      }

      left = Math.max(12, Math.min(left, window.innerWidth - tw - 12));
      top = Math.max(12, Math.min(top, window.innerHeight - th - 12));

      setTooltipPos({ top, left });
    });
  }, [step]);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentStep(0);
    setShowWelcome(true);
    onStepChange?.(0);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || showWelcome) return;
    updatePosition();

    const el = document.querySelector(`[data-tour="${step?.target}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      const timer = setTimeout(updatePosition, 400);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isOpen, showWelcome, updatePosition, step?.target]);

  useEffect(() => {
    if (!isOpen || showWelcome) return;
    const handler = () => updatePosition();
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
    };
  }, [isOpen, showWelcome, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (!showWelcome) {
        if (e.key === "ArrowRight") handleNext();
        if (e.key === "ArrowLeft") handlePrev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, currentStep, showWelcome]);

  if (!isOpen) return null;

  if (showWelcome) {
    return (
      <WelcomeScreen
        stepCount={steps.length}
        onStart={() => setShowWelcome(false)}
        onSkip={() => {
          onStepChange?.(-1);
          onClose();
        }}
      />
    );
  }

  if (!step) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      onStepChange?.(next);
    } else {
      onStepChange?.(-1);
      onComplete?.();
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      onStepChange?.(prev);
    }
  };

  const handleSkip = () => {
    onStepChange?.(-1);
    onClose();
  };

  const isLast = currentStep === steps.length - 1;

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay with spotlight cutout */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
        <defs>
          <mask id="tour-spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {spotlightRect && (
              <rect
                x={spotlightRect.left - 8}
                y={spotlightRect.top - 8}
                width={spotlightRect.width + 16}
                height={spotlightRect.height + 16}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0" y="0"
          width="100%" height="100%"
          fill="rgba(0,0,0,0.55)"
          mask="url(#tour-spotlight-mask)"
          style={{ pointerEvents: "auto" }}
          onClick={handleSkip}
        />
      </svg>

      {/* Spotlight border glow */}
      {spotlightRect && (
        <div
          className="absolute rounded-xl border-2 border-primary/60 shadow-[0_0_0_4px_hsl(var(--primary)/0.15)] transition-all duration-300 ease-out pointer-events-none"
          style={{
            top: spotlightRect.top - 8,
            left: spotlightRect.left - 8,
            width: spotlightRect.width + 16,
            height: spotlightRect.height + 16,
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        className="absolute w-[360px] max-w-[calc(100vw-24px)] bg-background border border-border rounded-md shadow-[0_8px_30px_-4px_hsl(var(--foreground)/0.15),0_2px_8px_-2px_hsl(var(--foreground)/0.08)] transition-all duration-300 ease-out animate-in fade-in-0 zoom-in-95"
        style={{ top: tooltipPos.top, left: tooltipPos.left, pointerEvents: "auto" }}
      >
        {/* Progress bar */}
        <div className="flex items-center gap-1.5 px-5 pt-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                i === currentStep
                  ? "bg-primary flex-[2]"
                  : i < currentStep
                  ? "bg-primary/40 flex-1"
                  : "bg-muted flex-1"
              )}
            />
          ))}
        </div>

        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-start gap-3">
            {step.icon && (
              <div className="w-10 h-10 rounded-xl border border-border bg-muted/50 flex items-center justify-center shrink-0">
                {step.icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-foreground leading-snug">{step.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{step.description}</p>
            </div>
          </div>

          {step.tip && (
            <div className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-primary/5 border border-primary/10">
              <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-foreground/80 leading-relaxed">{step.tip}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 pb-4 pt-2">
          <span className="text-xs text-muted-foreground">
            {currentStep + 1} of {steps.length}
          </span>
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back
              </button>
            )}
            <button
              onClick={handleSkip}
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors shadow-sm"
            >
              {isLast ? "Got it!" : "Next"}
              {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
