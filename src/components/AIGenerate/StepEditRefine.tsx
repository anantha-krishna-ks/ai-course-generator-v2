import { AIGenerateState } from "@/pages/AIGenerateCourse";
import { Pencil, FileText, Sparkles } from "lucide-react";
import { AISparkles } from "@/components/ui/ai-sparkles";

interface StepEditRefineProps {
  state: AIGenerateState;
  onChange: (partial: Partial<AIGenerateState>) => void;
}

export function StepEditRefine({ state }: StepEditRefineProps) {
  // Placeholder sections for the generated blueprint
  const sections = [
    { title: "Introduction", pages: 2, description: "Course overview and learning objectives" },
    { title: "Core Concepts", pages: 4, description: "Fundamental principles and key theories" },
    { title: "Practical Application", pages: 3, description: "Hands-on exercises and real-world scenarios" },
    { title: "Assessment & Review", pages: 2, description: "Knowledge checks and course summary" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Pencil className="w-5 h-5 text-primary" aria-hidden="true" focusable="false" />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Edit & Refine</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Review the generated blueprint and make adjustments before finalizing.
        </p>
      </div>

      {/* Course title display */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-1">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Course Title</p>
        <h2 className="text-lg font-bold text-foreground">{state.title || "Untitled Course"}</h2>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[11px] text-muted-foreground bg-muted px-2.5 py-1 rounded-full font-medium">
            {state.layoutType === "multi-page" ? "Multi-page" : "Single-page"}
          </span>
          <span className="text-[11px] text-muted-foreground bg-muted px-2.5 py-1 rounded-full font-medium">
            {state.intendedLearners || "All levels"}
          </span>
        </div>
      </div>

      {/* Blueprint sections */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Course Structure
        </h2>
        <div className="space-y-2">
          {sections.map((section, index) => (
            <div
              key={index}
              className="rounded-xl border border-border bg-card p-4 flex items-start gap-4 hover:border-primary/30 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {section.pages} pages
                </span>
                <button
                  type="button"
                  className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label={`Edit section ${section.title}`}
                >
                  <Pencil className="w-3 h-3 text-muted-foreground" aria-hidden="true" focusable="false" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI refinement hint */}
      <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-4 flex items-start gap-3">
        <AISparkles className="w-4 h-4 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">AI Refinement Available</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click "Finish" to save your course, or go back to adjust your settings and regenerate.
          </p>
        </div>
      </div>
    </div>
  );
}
