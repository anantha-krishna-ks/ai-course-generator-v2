import { AIGenerateState } from "@/pages/AIGenerateCourse";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AISparkles } from "@/components/ui/ai-sparkles";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Loader2, CheckCircle2, FileText, Target, Users, Clock, Layers, Brain } from "lucide-react";

interface StepBlueprintGenerateProps {
  state: AIGenerateState;
  onChange: (partial: Partial<AIGenerateState>) => void;
}

export function StepBlueprintGenerate({ state }: StepBlueprintGenerateProps) {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    // Simulate generation
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <AISparkles className="w-5 h-5" />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Blueprint & Generate</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Review your settings and generate the course blueprint.
        </p>
      </div>

      {/* Summary card */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Summary</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SummaryItem icon={<Target className="w-4 h-4" aria-hidden="true" focusable="false" />} label="Title" value={state.title || "—"} />
          <SummaryItem icon={<Users className="w-4 h-4" aria-hidden="true" focusable="false" />} label="Learners" value={state.intendedLearners || "—"} />
          <SummaryItem icon={<Layers className="w-4 h-4" aria-hidden="true" focusable="false" />} label="Layout" value={state.layoutType === "multi-page" ? "Multi-page" : "Single-page"} />
          <SummaryItem icon={<Clock className="w-4 h-4" aria-hidden="true" focusable="false" />} label="Duration" value={`${state.courseSpanTime} min`} />
        </div>

        {state.bloomsTaxonomy.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" focusable="false" />
              <span className="text-xs font-medium text-muted-foreground">Bloom's Taxonomy</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {state.bloomsTaxonomy.map((level) => (
                <Badge key={level} variant="secondary" className="text-xs rounded-full">
                  {level}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {state.guidelines && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" focusable="false" />
              <span className="text-xs font-medium text-muted-foreground">Guidelines</span>
            </div>
            <p className="text-xs text-foreground bg-muted rounded-lg px-3 py-2">{state.guidelines}</p>
          </div>
        )}
      </div>

      {/* Generate action */}
      <div className="flex flex-col items-center gap-4 py-4">
        {generated ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-primary" aria-hidden="true" focusable="false" />
            </div>
            <p className="text-base font-semibold text-foreground">Blueprint generated successfully!</p>
            <p className="text-sm text-muted-foreground">Proceed to Edit & Refine to review and customize your course.</p>
          </div>
        ) : (
          <>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="rounded-full gap-2.5 h-12 px-8 text-sm font-semibold"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" focusable="false" />
                  Generating Blueprint...
                </>
              ) : (
                <>
                  <AISparkles className="w-4 h-4" />
                  Generate Blueprint
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              AI will analyze your inputs and create a structured course blueprint.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg bg-muted/50 p-3">
      <div className="text-primary mt-0.5">{icon}</div>
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
