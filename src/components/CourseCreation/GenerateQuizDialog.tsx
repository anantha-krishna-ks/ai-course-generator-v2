import { useState, useId } from "react";
import { Sparkles, CircleDot, CheckSquare, ToggleLeft, Type, Minus, Plus, Brain, Trophy, Layers, FileText, BookOpen, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface GenerateQuizDialogProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (config: GenerateQuizConfig) => void;
  isGenerating?: boolean;
}

export interface GenerateQuizConfig {
  quizType: string;
  scope: string[];
  scqCount: number;
  mcqCount: number;
  trueFalseCount: number;
  fibCount: number;
  difficultyLevel: string;
  inclusions: string;
  exclusions: string;
}

const quizTypes = [
  { key: "formative", label: "Formative", description: "Low-stakes check to reinforce learning", icon: Brain },
  { key: "summative", label: "Summative", description: "Graded evaluation of mastery", icon: Trophy },
] as const;

const scopeOptions = [
  { key: "section", label: "This Section", description: "Quiz for the current section only", icon: Layers },
  { key: "page", label: "This Page", description: "Quiz for the current page only", icon: FileText },
  { key: "course", label: "Entire Course", description: "Quiz covering the full course", icon: BookOpen },
] as const;

const questionTypes = [
  { key: "scq", label: "Single Choice", icon: CircleDot, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "mcq", label: "Multiple Choice", icon: CheckSquare, color: "text-purple-600", bg: "bg-purple-50" },
  { key: "tf", label: "True / False", icon: ToggleLeft, color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "fib", label: "Fill in Blank", icon: Type, color: "text-amber-600", bg: "bg-amber-50" },
] as const;

const MAX_TOTAL = 20;

export function GenerateQuizDialog({ open, onClose, onGenerate, isGenerating = false }: GenerateQuizDialogProps) {
  const [quizType, setQuizType] = useState<string>("formative");
  const [scope, setScope] = useState<string[]>(["section"]);
  const [counts, setCounts] = useState<Record<string, number>>({ scq: 3, mcq: 2, tf: 2, fib: 1 });
  const [difficultyLevel, setDifficultyLevel] = useState("medium");
  const [specificInstructions, setSpecificInstructions] = useState(false);
  const [inclusions, setInclusions] = useState("");
  const [exclusions, setExclusions] = useState("");

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const updateCount = (key: string, delta: number) => {
    setCounts((prev) => {
      const next = Math.max(0, (prev[key] ?? 0) + delta);
      const otherTotal = total - (prev[key] ?? 0);
      if (otherTotal + next > MAX_TOTAL) return prev;
      return { ...prev, [key]: next };
    });
  };

  const toggleScope = (key: string) => {
    setScope((prev) => (prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]));
  };

  const handleGenerate = () => {
    onGenerate({
      quizType,
      scope,
      scqCount: counts.scq,
      mcqCount: counts.mcq,
      trueFalseCount: counts.tf,
      fibCount: counts.fib,
      difficultyLevel,
      inclusions,
      exclusions,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="w-[95vw] max-w-[820px] max-h-[90vh] p-0 overflow-hidden grid grid-rows-[auto_minmax(0,1fr)_auto] rounded-2xl border shadow-2xl"
        style={{ backgroundColor: "#F9FAFB" }}
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-4 pb-3 border-b border-border bg-white">
          <div className="flex items-center justify-between pr-8">
            <div>
              <DialogTitle className="text-base font-semibold tracking-tight">Generate Quiz</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Configure question types and quantity to auto-generate a quiz.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/[0.06] px-2.5 py-1.5 rounded-lg border border-primary/15">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
              AI Quiz
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="min-h-0 row-start-2">
          <ScrollArea className="h-full">
            <div className="px-6 pt-4 pb-6 space-y-5">
              {/* Quiz Type */}
              <div className="space-y-2.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Quiz Type
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {quizTypes.map(({ key, label, description, icon: Icon }) => {
                    const isActive = quizType === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setQuizType(key)}
                        className={cn(
                          "text-left rounded-xl border-2 p-3 transition-all duration-150",
                          isActive
                            ? "border-primary bg-primary/[0.04] shadow-[0_0_0_1px_hsl(var(--primary)/0.1)]"
                            : "border-border/60 bg-white hover:bg-gray-50"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn("p-1.5 rounded-lg", isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/70")}>
                            <Icon className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                          </div>
                          <span className={cn("text-xs font-semibold", isActive ? "text-primary" : "text-foreground")}>{label}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">{description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quiz Scope */}
              <div className="space-y-2.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Quiz Scope
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {scopeOptions.map(({ key, label, description, icon: Icon }) => {
                    const isActive = scope.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleScope(key)}
                        className={cn(
                          "text-left rounded-xl border-2 p-3 transition-all duration-150 relative",
                          isActive
                            ? "border-primary bg-primary/[0.04] shadow-[0_0_0_1px_hsl(var(--primary)/0.1)]"
                            : "border-border/60 bg-white hover:bg-gray-50"
                        )}
                      >
                        {isActive && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-primary-foreground" aria-hidden="true" focusable="false" />
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <div className={cn("p-1.5 rounded-lg", isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/70")}>
                            <Icon className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                          </div>
                          <span className={cn("text-xs font-semibold", isActive ? "text-primary" : "text-foreground")}>{label}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">{description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Mix */}
              <div className="space-y-3 rounded-2xl border-2 border-border/60 bg-white p-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Question Mix
                  </Label>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-foreground tabular-nums leading-none">{total}</span>
                    <span className="text-[11px] text-muted-foreground">/ {MAX_TOTAL} questions</span>
                  </div>
                </div>

                {/* Segmented progress bar */}
                <div className="flex gap-0.5 h-2 rounded-full overflow-hidden bg-muted/60">
                  {questionTypes.map(({ key, color }) => {
                    const pct = total > 0 ? (counts[key] / MAX_TOTAL) * 100 : 0;
                    return (
                      <div
                        key={key}
                        className={cn("h-full transition-all duration-300", color.replace("text-", "bg-"))}
                        style={{ width: `${pct}%` }}
                        aria-hidden="true"
                      />
                    );
                  })}
                </div>

                {/* Question type cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {questionTypes.map(({ key, label, icon: Icon, color, bg }) => {
                    const value = counts[key] ?? 0;
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-gray-50/50 px-3 py-2.5"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={cn("p-1.5 rounded-lg shrink-0", bg, color)}>
                            <Icon className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                          </div>
                          <span className="text-xs font-semibold text-foreground truncate">{label}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateCount(key, -1)}
                            disabled={value <= 0}
                            aria-label={`Decrease ${label}`}
                            className="w-7 h-7 rounded-lg border border-border bg-white flex items-center justify-center text-foreground hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="w-3 h-3" aria-hidden="true" focusable="false" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold tabular-nums text-foreground">{value}</span>
                          <button
                            type="button"
                            onClick={() => updateCount(key, 1)}
                            disabled={total >= MAX_TOTAL}
                            aria-label={`Increase ${label}`}
                            className="w-7 h-7 rounded-lg border border-border bg-white flex items-center justify-center text-foreground hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="w-3 h-3" aria-hidden="true" focusable="false" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty Level */}
              <div className="space-y-2.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Difficulty Level
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {["easy", "medium", "hard"].map((level) => {
                    const isActive = difficultyLevel === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setDifficultyLevel(level)}
                        className={cn(
                          "px-3.5 py-3 rounded-xl border-2 text-sm font-medium capitalize transition-all duration-150",
                          isActive
                            ? "border-primary bg-primary/[0.04] text-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.1)]"
                            : "border-border/60 bg-white text-foreground hover:bg-gray-50"
                        )}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Instructions */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Custom Instructions
                  </Label>
                  <Switch
                    checked={specificInstructions}
                    onCheckedChange={setSpecificInstructions}
                    aria-label="Toggle custom instructions"
                  />
                </div>
                {specificInstructions && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in-50 slide-in-from-top-2 duration-200">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium flex items-center gap-2 text-foreground">
                        <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
                        Inclusions
                      </Label>
                      <Textarea
                        placeholder="Topics to include..."
                        value={inclusions}
                        onChange={(e) => setInclusions(e.target.value)}
                        className="min-h-[80px] resize-none rounded-xl bg-white border border-gray-300 focus:border-primary text-sm transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium flex items-center gap-2 text-foreground">
                        <span className="w-2 h-2 rounded-full bg-destructive" aria-hidden="true" />
                        Exclusions
                      </Label>
                      <Textarea
                        placeholder="Topics to exclude..."
                        value={exclusions}
                        onChange={(e) => setExclusions(e.target.value)}
                        className="min-h-[80px] resize-none rounded-xl bg-white border border-gray-300 focus:border-primary text-sm transition-colors"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-3.5 border-t border-border bg-white">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating || total === 0} className="rounded-xl gap-1.5">
            {isGenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                Generate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
