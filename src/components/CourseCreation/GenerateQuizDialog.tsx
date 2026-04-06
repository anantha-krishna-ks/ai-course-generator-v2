import { useState } from "react";
import { Sparkles } from "lucide-react";
import { AISparkles } from "@/components/ui/ai-sparkles";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  scqCount: number;
  mcqCount: number;
  trueFalseCount: number;
  fibCount: number;
  difficultyLevel: string;
  inclusions: string;
  exclusions: string;
}

export function GenerateQuizDialog({ open, onClose, onGenerate, isGenerating = false }: GenerateQuizDialogProps) {
  const [scqCount, setScqCount] = useState("1");
  const [mcqCount, setMcqCount] = useState("1");
  const [trueFalseCount, setTrueFalseCount] = useState("1");
  const [fibCount, setFibCount] = useState("1");
  const [difficultyLevel, setDifficultyLevel] = useState("medium");
  const [specificInstructions, setSpecificInstructions] = useState(false);
  const [inclusions, setInclusions] = useState("");
  const [exclusions, setExclusions] = useState("");

  const handleGenerate = () => {
    onGenerate({
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
      <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] p-0 overflow-hidden grid grid-rows-[auto_minmax(0,1fr)]">
        <DialogHeader className="px-6 pt-5 pb-4 bg-gradient-to-br from-primary/5 to-primary/10 border-b">
          <DialogTitle className="text-lg flex items-center gap-2.5 font-semibold">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <AISparkles className="w-4.5 h-4.5" />
            </div>
            Generate Quiz
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Configure question types and quantity to auto-generate a quiz.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 row-start-2">
          <ScrollArea className="h-full">
            <div className="space-y-5 p-6">
              {/* Question Type Counts */}
              <div className="space-y-4 bg-card border rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-primary rounded-full" />
                  <h3 className="text-sm font-semibold text-foreground">Number of Questions</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Single Choice", value: scqCount, setter: setScqCount },
                    { label: "Multiple Choice", value: mcqCount, setter: setMcqCount },
                    { label: "True/False", value: trueFalseCount, setter: setTrueFalseCount },
                    { label: "Fill in Blank", value: fibCount, setter: setFibCount },
                  ].map(({ label, value, setter }) => (
                    <div key={label} className="space-y-2">
                      <Label className="text-xs font-semibold text-foreground uppercase tracking-wide">{label}</Label>
                      <Select value={value} onValueChange={setter}>
                        <SelectTrigger className="w-full bg-background">
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
              <div className="bg-card border rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-primary rounded-full" />
                  <h3 className="text-sm font-semibold text-foreground">Difficulty Level</h3>
                </div>
                <div className="flex gap-2">
                  {["easy", "medium", "hard"].map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficultyLevel(level)}
                      className={cn(
                        "px-4 py-2 rounded-full text-xs font-medium capitalize transition-all border",
                        difficultyLevel === level
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-background text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Instructions */}
              <div className="bg-card border rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-primary rounded-full" />
                    <h3 className="text-sm font-semibold text-foreground">Custom Instructions</h3>
                  </div>
                  <Switch checked={specificInstructions} onCheckedChange={setSpecificInstructions} />
                </div>
                {specificInstructions && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in-50 slide-in-from-top-2 duration-200">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        Inclusions
                      </Label>
                      <Textarea
                        placeholder="Topics to include..."
                        value={inclusions}
                        onChange={(e) => setInclusions(e.target.value)}
                        className="min-h-[80px] resize-none text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-destructive" />
                        Exclusions
                      </Label>
                      <Textarea
                        placeholder="Topics to exclude..."
                        value={exclusions}
                        onChange={(e) => setExclusions(e.target.value)}
                        className="min-h-[80px] resize-none text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={onClose} className="rounded-full px-5">
                  Cancel
                </Button>
                <Button onClick={handleGenerate} disabled={isGenerating} className="rounded-full px-5 gap-1.5">
                  {isGenerating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
