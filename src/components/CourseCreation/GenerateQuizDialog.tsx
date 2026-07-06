import { useState } from "react";
import { Sparkles, CircleDot, CheckSquare, ToggleLeft, Type, GraduationCap, Dumbbell, ClipboardCheck, Layers, FileText, BookOpen, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  { key: "knowledge", label: "Knowledge Check", description: "Quick recall questions", icon: GraduationCap },
  { key: "practice", label: "Practice", description: "Skill-building drills", icon: Dumbbell },
  { key: "assessment", label: "Assessment", description: "Formal graded evaluation", icon: ClipboardCheck },
] as const;

const scopeOptions = [
  { key: "section", label: "Per Section", description: "One quiz for each section", icon: Layers },
  { key: "page", label: "Per Page", description: "One quiz for each page", icon: FileText },
  { key: "course", label: "Whole Course", description: "A single course-wide quiz", icon: BookOpen },
] as const;

const questionTypes = [
  { key: "scq", label: "Single Choice", icon: CircleDot },
  { key: "mcq", label: "Multiple Choice", icon: CheckSquare },
  { key: "tf", label: "True / False", icon: ToggleLeft },
  { key: "fib", label: "Fill in Blank", icon: Type },
] as const;

export function GenerateQuizDialog({ open, onClose, onGenerate, isGenerating = false }: GenerateQuizDialogProps) {
  const [quizType, setQuizType] = useState<string>("knowledge");
  const [scope, setScope] = useState<string[]>(["page"]);
  const [scqCount, setScqCount] = useState("1");
  const [mcqCount, setMcqCount] = useState("1");
  const [trueFalseCount, setTrueFalseCount] = useState("1");
  const [fibCount, setFibCount] = useState("1");
  const [difficultyLevel, setDifficultyLevel] = useState("medium");
  const [specificInstructions, setSpecificInstructions] = useState(false);
  const [inclusions, setInclusions] = useState("");
  const [exclusions, setExclusions] = useState("");

  const toggleScope = (key: string) => {
    setScope((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const valueByKey: Record<string, string> = {
    scq: scqCount,
    mcq: mcqCount,
    tf: trueFalseCount,
    fib: fibCount,
  };
  const setterByKey: Record<string, (v: string) => void> = {
    scq: setScqCount,
    mcq: setMcqCount,
    tf: setTrueFalseCount,
    fib: setFibCount,
  };

  const handleGenerate = () => {
    onGenerate({
      quizType,
      scope,
      scqCount: parseInt(scqCount),
      mcqCount: parseInt(mcqCount),
      trueFalseCount: parseInt(trueFalseCount),
      fibCount: parseInt(fibCount),
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
              <DialogTitle className="text-base font-semibold tracking-tight">
                Generate Quiz
              </DialogTitle>
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

        {/* Scrollable body */}
        <div className="min-h-0 row-start-2">
          <ScrollArea className="h-full">
            <div className="px-6 pt-4 pb-6 space-y-5">
              {/* Quiz Type */}
              <div className="space-y-2.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Quiz Type
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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
                <div className="flex items-baseline justify-between">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Where should the quiz appear?
                  </Label>
                  <span className="text-[11px] text-muted-foreground">Select one or more</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {scopeOptions.map(({ key, label, description, icon: Icon }) => {
                    const isActive = scope.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleScope(key)}
                        aria-pressed={isActive}
                        className={cn(
                          "relative text-left rounded-xl border-2 p-3 transition-all duration-150",
                          isActive
                            ? "border-primary bg-primary/[0.04] shadow-[0_0_0_1px_hsl(var(--primary)/0.1)]"
                            : "border-border/60 bg-white hover:bg-gray-50"
                        )}
                      >
                        {isActive && (
                          <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <Check className="w-3 h-3" aria-hidden="true" focusable="false" />
                          </span>
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

              {/* Question Type Counts */}
              <div className="space-y-2.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Number of Questions
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {questionTypes.map(({ key, label, icon: Icon }) => (
                    <div
                      key={key}
                      className="rounded-xl border-2 border-border/60 bg-white p-3 space-y-2 transition-all duration-150 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-muted text-muted-foreground/70">
                          <Icon className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                        </div>
                        <span className="text-xs font-semibold text-foreground leading-tight">{label}</span>
                      </div>
                      <Select value={valueByKey[key]} onValueChange={setterByKey[key]}>
                        <SelectTrigger className="w-full h-9 bg-white border-gray-300 rounded-lg text-sm" aria-label={`${label} count`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 1, 2, 3, 4, 5].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
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
          <Button onClick={handleGenerate} disabled={isGenerating} className="rounded-xl gap-1.5">
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
