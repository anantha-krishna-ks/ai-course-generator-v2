import { useEffect, useState } from "react";
import { Loader2, BookOpen, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreationLoaderProps {
  courseTitle: string;
  onComplete: () => void;
}

export function CreationLoader({ courseTitle, onComplete }: CreationLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Setting up your workspace...",
    "Preparing course structure...",
    "Almost ready...",
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 600);

    const completeTimeout = setTimeout(() => {
      onComplete();
    }, 1800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-8 px-4">
        {/* Animated Icon */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
          <div className="absolute -top-1 -right-1">
            <Sparkles className="w-6 h-6 text-primary animate-bounce" />
          </div>
        </div>

        {/* Course Title */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            Creating your course
          </h2>
          <p className="text-lg text-primary font-medium">"{courseTitle}"</p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 sm:w-80">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className={cn(
            "text-sm transition-opacity duration-300",
            "animate-fade-in"
          )}>
            {steps[currentStep]}
          </span>
        </div>
      </div>
    </div>
  );
}
