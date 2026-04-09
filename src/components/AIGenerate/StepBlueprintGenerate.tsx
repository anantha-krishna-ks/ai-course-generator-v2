import { AIGenerateState } from "@/pages/AIGenerateCourse";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AISparkles } from "@/components/ui/ai-sparkles";
import { useState } from "react";
import { Loader2, CheckCircle2, Target, Users, Clock, Layers, Brain } from "lucide-react";

interface StepBlueprintGenerateProps {
  state: AIGenerateState;
  onChange: (partial: Partial<AIGenerateState>) => void;
}

export function StepBlueprintGenerate({ state }: StepBlueprintGenerateProps) {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 3000);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-foreground">Ready to generate?</h1>
        <p className="text-sm text-muted-foreground mt-1">Review your settings and create the blueprint.</p>
      </div>

      {/* Compact summary */}
      <div className="rounded-xl border border-border bg-background p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <SummaryRow icon={<Target className="w-3.5 h-3.5" />} label="Title" value={state.title || "—"} />
          <SummaryRow icon={<Users className="w-3.5 h-3.5" />} label="Learners" value={state.intendedLearners || "—"} />
          <SummaryRow icon={<Layers className="w-3.5 h-3.5" />} label="Layout" value={state.layoutType === "multi-page" ? "Multi-page" : "Single-page"} />
          <SummaryRow icon={<Clock className="w-3.5 h-3.5" />} label="Duration" value={`${state.courseSpanTime} min`} />
        </div>
        {state.bloomsTaxonomy.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Brain className="w-3 h-3 text-muted-foreground shrink-0" aria-hidden="true" focusable="false" />
            {state.bloomsTaxonomy.map((l) => (
              <Badge key={l} variant="secondary" className="text-[10px] rounded-full px-2 py-0">{l}</Badge>
            ))}
          </div>
        )}
      </div>

      {/* Generate */}
      <div className="flex flex-col items-center gap-3 py-2">
        {generated ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <CheckCircle2 className="w-10 h-10 text-primary" aria-hidden="true" focusable="false" />
            <p className="text-sm font-semibold text-foreground">Blueprint generated!</p>
            <p className="text-xs text-muted-foreground">Proceed to review and refine.</p>
          </div>
        ) : (
          <Button onClick={handleGenerate} disabled={generating} className="rounded-full gap-2 h-10 px-6 text-sm">
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" focusable="false" />
                Generating...
              </>
            ) : (
              <>
                <AISparkles className="w-4 h-4" />
                Generate Blueprint
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="text-primary mt-0.5 shrink-0" aria-hidden="true">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="text-xs font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}
