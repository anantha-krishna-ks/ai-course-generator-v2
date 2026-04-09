import { AIGenerateState } from "@/pages/AIGenerateCourse";
import { Pencil } from "lucide-react";
import { AISparkles } from "@/components/ui/ai-sparkles";

interface StepEditRefineProps {
  state: AIGenerateState;
  onChange: (partial: Partial<AIGenerateState>) => void;
}

export function StepEditRefine({ state }: StepEditRefineProps) {
  const sections = [
    { title: "Introduction", pages: 2, description: "Course overview and learning objectives" },
    { title: "Core Concepts", pages: 4, description: "Fundamental principles and key theories" },
    { title: "Practical Application", pages: 3, description: "Hands-on exercises and scenarios" },
    { title: "Assessment & Review", pages: 2, description: "Knowledge checks and summary" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-foreground">Review your course</h1>
        <p className="text-sm text-muted-foreground mt-1">Adjust the generated structure before finalizing.</p>
      </div>

      {/* Title display */}
      <div className="rounded-xl border border-border bg-background p-3.5">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Title</p>
        <h2 className="text-base font-bold text-foreground mt-0.5">{state.title || "Untitled Course"}</h2>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
            {state.layoutType === "multi-page" ? "Multi-page" : "Single-page"}
          </span>
          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
            {state.intendedLearners || "All levels"}
          </span>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-1.5">
        {sections.map((section, index) => (
          <div
            key={index}
            className="rounded-xl border border-border bg-background p-3 flex items-center gap-3 hover:border-primary/30 transition-colors group"
          >
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-[11px] font-bold text-primary">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
              <p className="text-[11px] text-muted-foreground truncate">{section.description}</p>
            </div>
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full shrink-0">{section.pages}p</span>
            <button
              type="button"
              className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:opacity-100"
              aria-label={`Edit section ${section.title}`}
            >
              <Pencil className="w-2.5 h-2.5 text-muted-foreground" aria-hidden="true" focusable="false" />
            </button>
          </div>
        ))}
      </div>

      {/* AI hint */}
      <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-3 flex items-start gap-2.5">
        <AISparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Click <span className="font-medium text-foreground">Finish</span> to save, or go back to adjust and regenerate.
        </p>
      </div>
    </div>
  );
}
