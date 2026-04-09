import { useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowStep {
  id: number;
  label: string;
  summary?: string;
}

interface VerticalWorkflowProps {
  steps: WorkflowStep[];
  currentStep: number;
  children: React.ReactNode;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2" aria-label="AI is preparing the next step">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-primary"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export function VerticalWorkflow({ steps, currentStep, children }: VerticalWorkflowProps) {
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentStep]);

  return (
    <div className="relative">
      {/* Vertical timeline */}
      <div className="absolute left-5 top-0 bottom-0 w-px" aria-hidden="true">
        {/* Background line */}
        <div className="absolute inset-0 bg-border" />
        {/* Progress line */}
        <motion.div
          className="absolute top-0 left-0 w-full origin-top"
          style={{
            background: "linear-gradient(180deg, hsl(211 100% 50%), hsl(270 80% 55%))",
          }}
          initial={false}
          animate={{
            height: `${((currentStep - 0.5) / steps.length) * 100}%`,
          }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>

      <div className="space-y-0">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isFuture = step.id > currentStep;

          return (
            <div key={step.id} className="relative" ref={isActive ? activeRef : undefined}>
              {/* Node */}
              <div className="flex items-start gap-4 relative">
                {/* Timeline node */}
                <div className="relative z-10 shrink-0">
                  <AnimatePresence mode="wait">
                    {isCompleted ? (
                      <motion.div
                        key="done"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-md"
                      >
                        <Check className="w-4 h-4 text-primary-foreground" aria-hidden="true" focusable="false" />
                      </motion.div>
                    ) : isActive ? (
                      <motion.div
                        key="active"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative w-10 h-10"
                      >
                        {/* Pulse ring */}
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: "linear-gradient(135deg, hsl(211 100% 50% / 0.2), hsl(270 80% 55% / 0.2))",
                          }}
                          animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                          aria-hidden="true"
                        />
                        <div
                          className="relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground shadow-lg"
                          style={{
                            background: "linear-gradient(135deg, hsl(211 100% 50%), hsl(270 80% 55%))",
                          }}
                        >
                          <Sparkles className="w-4 h-4" aria-hidden="true" focusable="false" />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="future"
                        className="w-10 h-10 rounded-full border-2 border-border bg-card flex items-center justify-center text-sm font-semibold text-muted-foreground"
                      >
                        {step.id}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Content area */}
                <div className="flex-1 min-w-0 pb-8">
                  {/* Completed: collapsed summary */}
                  {isCompleted && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="pt-2"
                    >
                      <p className="text-xs font-semibold text-primary uppercase tracking-wider">{step.label}</p>
                      {step.summary && (
                        <p className="text-sm text-muted-foreground mt-0.5 truncate">{step.summary}</p>
                      )}
                    </motion.div>
                  )}

                  {/* Active: expanded content */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
                    >
                      {/* AI message bubble header */}
                      <div className="flex items-center gap-2 mb-3 pt-1.5">
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          className="text-sm font-bold text-foreground"
                        >
                          {step.label}
                        </motion.span>
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full"
                        >
                          Step {step.id} of {steps.length}
                        </motion.span>
                      </div>

                      {/* Card with content */}
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.15 }}
                        className="relative rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
                      >
                        {/* Top shimmer */}
                        <div className="h-[2px] w-full overflow-hidden" aria-hidden="true">
                          <motion.div
                            className="h-full w-1/3"
                            style={{
                              background: "linear-gradient(90deg, transparent, hsl(211 100% 50% / 0.4), hsl(270 80% 55% / 0.3), transparent)",
                            }}
                            animate={{ x: ["-100%", "400%"] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
                          />
                        </div>

                        <div className="p-5 sm:p-6">
                          {children}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Future: teased label */}
                  {isFuture && (
                    <div className="pt-2.5">
                      <p className="text-xs font-medium text-muted-foreground">{step.label}</p>
                      {index === currentStep && (
                        <TypingDots />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}