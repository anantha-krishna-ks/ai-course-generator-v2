import { motion } from "framer-motion";
import { AISparkles } from "@/components/ui/ai-sparkles";

const RIBBON_ITEMS = [
  "AI POWERED",
  "COURSE BUILDER",
  "SMART CONTENT",
  "AUTO GENERATE",
  "AI POWERED",
  "COURSE BUILDER",
  "SMART CONTENT",
  "AUTO GENERATE",
];

interface SideRibbonProps {
  side: "left" | "right";
}

export function SideRibbon({ side }: SideRibbonProps) {
  const direction = side === "left" ? 1 : -1;

  return (
    <div
      className="hidden lg:flex fixed top-0 h-screen w-10 overflow-hidden z-0 pointer-events-none select-none"
      style={{ [side]: 0 }}
      aria-hidden="true"
    >
      <div className="relative w-full h-full bg-primary/[0.03]">
        {/* Gradient fade edges */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent z-10" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent z-10" />

        {/* Scrolling ribbon */}
        <motion.div
          className="flex flex-col items-center gap-6 absolute left-1/2 -translate-x-1/2"
          animate={{ y: direction > 0 ? [0, -400] : [-400, 0] }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {[...RIBBON_ITEMS, ...RIBBON_ITEMS].map((text, i) => (
            <div key={i} className="flex flex-col items-center gap-6">
              <span
                className="text-[11px] font-bold tracking-[0.25em] text-primary/15"
                style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
              >
                {text}
              </span>
              {i % 2 === 0 && (
                <AISparkles className="w-3.5 h-3.5 opacity-[0.12]" />
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
