import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

let gradientIdCounter = 0;

interface AISparklesProps {
  className?: string;
}

/**
 * Sparkles icon with the brand blue-to-purple AI gradient stroke.
 * Drop-in replacement for <Sparkles /> wherever an AI action is indicated.
 */
const AISparkles = ({ className }: AISparklesProps) => {
  const id = `ai-grad-${++gradientIdCounter}`;
  return (
    <>
      <Sparkles className={cn("w-4 h-4", className)} style={{ stroke: `url(#${id})` }} />
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(211, 100%, 50%)" />
            <stop offset="100%" stopColor="hsl(270, 80%, 55%)" />
          </linearGradient>
        </defs>
      </svg>
    </>
  );
};

export { AISparkles };
