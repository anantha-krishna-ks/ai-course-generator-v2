import Lottie from "lottie-react";
import { cn } from "@/lib/utils";
import animationData from "@/assets/lottie/girl-with-books.json";

/**
 * Girl with books — Lottie loading animation.
 * Free animation from LottieFiles, bundled locally.
 */
export function CourseGenerationAnimation({ className }: { className?: string }) {
  return (
    <div
      className={cn("relative w-full h-full", className)}
      role="img"
      aria-label="Generating course content"
    >
      <Lottie
        animationData={animationData}
        loop
        autoplay
        aria-hidden="true"
        className="w-full h-full"
      />
    </div>
  );
}
