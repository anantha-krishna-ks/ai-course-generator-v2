import { useState } from "react";
import { Sparkles, Plus, RefreshCcw, Edit2, Trash2, ChevronDown, AlertTriangle, CircleDot, CheckSquare, ToggleLeft, Type, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { EditQuestionDialog } from "./EditQuestionDialog";

const questionTypes = [
  { key: "scq", label: "Single Choice", icon: CircleDot, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "mcq", label: "Multiple Choice", icon: CheckSquare, color: "text-purple-600", bg: "bg-purple-50" },
  { key: "tf", label: "True / False", icon: ToggleLeft, color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "fib", label: "Fill in Blank", icon: Type, color: "text-amber-600", bg: "bg-amber-50" },
] as const;

const MAX_TOTAL = 20;

interface Question {
  id: number;
  type: "SCQ" | "MCQ" | "TrueFalse" | "FIB";
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface GenerateQuizDialogProps {
  open: boolean;
  onClose: () => void;
  chapterTitle: string;
  chapterId?: string;
}

// Fresh, simplified dialog with guaranteed working scroll
export const GenerateQuizDialog = ({ open, onClose, chapterTitle }: GenerateQuizDialogProps) => {
  const [counts, setCounts] = useState<Record<string, number>>({ scq: 1, mcq: 1, tf: 2, fib: 1 });
  const [difficultyLevel, setDifficultyLevel] = useState("medium");
  const [specificInstructions, setSpecificInstructions] = useState(false);
  const [inclusions, setInclusions] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState<number | null>(null);

  // Mock questions - replace with actual data
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      type: "SCQ",
      question: "Which of the following is a primary objective of taxation?",
      options: [
        "To raise revenue for government spending",
        "To increase private profits",
        "To eliminate all forms of income inequality",
        "To discourage all forms of investment",
      ],
      answer: "To raise revenue for government spending",
      explanation:
        "The primary objective of taxation is to generate revenue that the government uses to fund public services, infrastructure, and other essential functions.",
    },
    {
      id: 2,
      type: "MCQ",
      question: "Which of the following are principles of taxation? Select all that apply.",
      options: ["Equity", "Certainty", "Convenience", "Economy", "All of the above"],
      answer: "All of the above",
      explanation:
        "Adam Smith's canons of taxation include equity (fairness), certainty (clarity), convenience (ease of payment), and economy (cost-effectiveness).",
    },
  ]);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const updateCount = (key: string, delta: number) => {
    setCounts((prev) => {
      const next = Math.max(0, (prev[key] ?? 0) + delta);
      const otherTotal = total - (prev[key] ?? 0);
      if (otherTotal + next > MAX_TOTAL) return prev;
      return { ...prev, [key]: next };
    });
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 1200);
  };

  const handleAddQuestion = () => {
    // Create a new blank question with the next available ID
    const newId = Math.max(...questions.map(q => q.id), 0) + 1;
    const newQuestion: Question = {
      id: newId,
      type: "SCQ",
      question: "",
      options: ["", "", "", ""],
      answer: "",
      explanation: "",
    };
    setEditingQuestion(newQuestion);
    setIsAddingQuestion(true);
  };

  const handleEditQuestion = (id: number) => {
    const question = questions.find(q => q.id === id);
    if (question) {
      setEditingQuestion(question);
    }
  };

  const handleSaveEditedQuestion = (updatedQuestion: Question) => {
    if (isAddingQuestion) {
      // Add new question to the list
      setQuestions(prev => [...prev, updatedQuestion]);
      setIsAddingQuestion(false);
    } else {
      // Update existing question
      setQuestions(prev => 
        prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
      );
    }
  };

  const handleCloseEditDialog = () => {
    setEditingQuestion(null);
    setIsAddingQuestion(false);
  };

  const handleDeleteQuestion = (id: number) => {
    setDeletingQuestionId(id);
  };

  const confirmDeleteQuestion = () => {
    if (deletingQuestionId !== null) {
      setQuestions(prev => prev.filter(q => q.id !== deletingQuestionId));
      setDeletingQuestionId(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent
          className="w-[95vw] max-w-6xl max-h-[90vh] p-0 overflow-hidden grid grid-rows-[auto_minmax(0,1fr)]"
        >
        {/* Header (non-scrollable) */}
        <DialogHeader className="px-6 pt-4 pb-3 bg-gradient-to-br from-primary/5 to-primary/10 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2 font-semibold">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Sparkles className="w-5 h-5 text-primary" aria-hidden="true" focusable="false" />
                </div>
                Generate Quiz Questions
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Chapter: <span className="font-semibold text-foreground">{chapterTitle}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable content area */}
        <div className="min-h-0 row-start-2">
          <ScrollArea className="h-full">
            <div className="space-y-4 p-4 pr-2">
              {/* Question Mix */}
              <div className="space-y-3 rounded-2xl border-2 border-border/60 bg-white p-4 shadow-sm">
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

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-border/60 bg-white p-3 shadow-sm">
                <Button onClick={handleRegenerate} disabled={isGenerating} className="bg-primary hover:bg-primary/90 shadow-sm rounded-xl">
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="w-4 h-4 mr-2" aria-hidden="true" focusable="false" />
                      Regenerate Quiz
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleAddQuestion} className="rounded-xl text-primary border-primary hover:bg-primary hover:text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" aria-hidden="true" focusable="false" />
                  Add Question
                </Button>
              </div>


              {/* Questions List */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-5 bg-primary rounded-full" />
                  <h3 className="text-sm font-semibold text-foreground">Generated Questions ({questions.length})</h3>
                </div>

                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="border rounded-xl p-5 bg-card hover:shadow-md hover:border-primary/30 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex gap-3 flex-1">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                          {index + 1}
                        </div>
                        <h4 className="text-base font-medium flex-1 leading-relaxed">{question.question}</h4>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditQuestion(question.id)}
                          className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-2.5 mb-4">
                      {question.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`flex items-start gap-3 p-3.5 rounded-lg text-sm transition-all duration-200 ${
                            option === question.answer
                              ? "bg-primary/10 border-2 border-primary/30 shadow-sm"
                              : "bg-muted/40 border border-border hover:bg-muted/60"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center transition-all ${
                              option === question.answer ? "border-primary bg-primary" : "border-muted-foreground/40"
                            }`}
                          >
                            {option === question.answer && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                          </div>
                          <span
                            className={`leading-relaxed ${
                              option === question.answer ? "font-semibold text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {option}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Answer Display */}
                    <div className="flex items-center gap-3 px-3 py-2.5 bg-success/[0.03] border border-success/10 rounded-lg">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary/10 text-xs font-semibold text-primary">
                        {question.type}
                      </span>
                      <span className="text-sm text-muted-foreground">Answer:</span>
                      <span className="text-sm font-semibold text-success/60">{question.answer}</span>
                    </div>

                    {/* Explanation Collapsible */}
                    {question.explanation && (
                      <Collapsible
                        open={expandedQuestion === question.id}
                        onOpenChange={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
                        className="mt-3"
                      >
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full justify-start p-0 h-auto text-primary font-medium">
                            <ChevronDown
                              className={`w-4 h-4 mr-2 transition-transform duration-200 ${
                                expandedQuestion === question.id ? "rotate-180" : ""
                              }`}
                            />
                            {expandedQuestion === question.id ? "Hide" : "Show"} Explanation
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-3">
                          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                            <p className="font-semibold text-foreground mb-2 text-sm">Explanation:</p>
                            <p className="text-muted-foreground text-sm leading-relaxed">{question.explanation}</p>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons at bottom */}
              <div className="flex justify-end gap-3 pt-4 pb-2">
                <Button variant="outline" onClick={onClose} size="lg" className="min-w-24">
                  Close
                </Button>
                <Button size="lg" className="bg-primary hover:bg-primary/90 min-w-32 shadow-sm">
                  Save Quiz
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>

    <EditQuestionDialog
      open={editingQuestion !== null}
      onClose={handleCloseEditDialog}
      question={editingQuestion}
      onSave={handleSaveEditedQuestion}
      isAddMode={isAddingQuestion}
    />

    <AlertDialog open={deletingQuestionId !== null} onOpenChange={(open) => !open && setDeletingQuestionId(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <AlertDialogTitle className="text-lg">Confirm Deletion</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            Are you sure you want to delete this question? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmDeleteQuestion} className="bg-destructive hover:bg-destructive/90">
            Delete Question
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};
