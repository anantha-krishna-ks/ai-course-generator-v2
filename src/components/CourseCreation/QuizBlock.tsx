import { useState } from "react";
import { MessageCircleQuestion, Plus, Sparkles, Edit2, Trash2, ChevronDown, AlertTriangle, RefreshCcw, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { EditQuestionDialog } from "@/components/EditCourse/EditQuestionDialog";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Question {
  id: number;
  type: "SCQ" | "MCQ" | "TrueFalse" | "FIB";
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface QuizBlockProps {
  aiEnabled?: boolean;
  content: string; // JSON stringified questions array
  onChange: (content: string) => void;
}

const TYPE_LABELS: Record<Question["type"], string> = {
  SCQ: "Single Choice",
  MCQ: "Multiple Choice",
  TrueFalse: "True/False",
  FIB: "Fill in Blank",
};

export function QuizBlock({ aiEnabled = false, content, onChange }: QuizBlockProps) {
  // Parse questions from content
  const [questions, setQuestionsState] = useState<Question[]>(() => {
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const setQuestions = (updater: Question[] | ((prev: Question[]) => Question[])) => {
    setQuestionsState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      onChange(JSON.stringify(next));
      return next;
    });
  };

  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState<number | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  // Generate quiz dialog state
  const [scqCount, setScqCount] = useState("1");
  const [mcqCount, setMcqCount] = useState("1");
  const [trueFalseCount, setTrueFalseCount] = useState("1");
  const [fibCount, setFibCount] = useState("1");
  const [difficultyLevel, setDifficultyLevel] = useState("medium");
  const [specificInstructions, setSpecificInstructions] = useState(false);
  const [inclusions, setInclusions] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddQuestion = () => {
    const newId = Math.max(...questions.map((q) => q.id), 0) + 1;
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
    const question = questions.find((q) => q.id === id);
    if (question) setEditingQuestion(question);
  };

  const handleSaveEditedQuestion = (updatedQuestion: Question) => {
    if (isAddingQuestion) {
      setQuestions((prev) => [...prev, updatedQuestion]);
      setIsAddingQuestion(false);
    } else {
      setQuestions((prev) => prev.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q)));
    }
  };

  const handleCloseEditDialog = () => {
    setEditingQuestion(null);
    setIsAddingQuestion(false);
  };

  const confirmDeleteQuestion = () => {
    if (deletingQuestionId !== null) {
      setQuestions((prev) => prev.filter((q) => q.id !== deletingQuestionId));
      setDeletingQuestionId(null);
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    // Mock generation - replace with actual AI call
    setTimeout(() => {
      const generated: Question[] = [];
      let idCounter = Math.max(...questions.map((q) => q.id), 0) + 1;

      for (let i = 0; i < parseInt(scqCount); i++) {
        generated.push({
          id: idCounter++,
          type: "SCQ",
          question: `Sample single choice question ${i + 1}?`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          answer: "Option A",
          explanation: "This is the explanation for the correct answer.",
        });
      }
      for (let i = 0; i < parseInt(mcqCount); i++) {
        generated.push({
          id: idCounter++,
          type: "MCQ",
          question: `Sample multiple choice question ${i + 1}?`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          answer: "Option A, Option B",
          explanation: "These are the correct answers.",
        });
      }
      for (let i = 0; i < parseInt(trueFalseCount); i++) {
        generated.push({
          id: idCounter++,
          type: "TrueFalse",
          question: `Sample true/false statement ${i + 1}.`,
          options: ["True", "False"],
          answer: "True",
          explanation: "This statement is true because...",
        });
      }
      for (let i = 0; i < parseInt(fibCount); i++) {
        generated.push({
          id: idCounter++,
          type: "FIB",
          question: `The _____ is a sample fill-in-the-blank question ${i + 1}.`,
          options: [],
          answer: "answer",
          explanation: "The correct word to fill in is 'answer'.",
        });
      }

      setQuestions((prev) => [...prev, ...generated]);
      setIsGenerating(false);
      setShowGenerateDialog(false);
    }, 1500);
  };

  return (
    <>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <MessageCircleQuestion className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">Questions & Quiz</span>
            {questions.length > 0 && (
              <Badge variant="secondary" className="text-[11px] h-5 px-2 font-medium">
                {questions.length} question{questions.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>

        {/* Questions list or empty state */}
        {questions.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <MessageCircleQuestion className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">No questions yet</p>
            <p className="text-xs text-muted-foreground/60 mb-5">
              {aiEnabled
                ? "Generate a quiz with AI or add questions manually."
                : "Add questions manually to build your quiz."}
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {questions.map((question, index) => (
              <div key={question.id} className="group/q rounded-xl border border-border/60 bg-background hover:border-border hover:shadow-sm transition-all overflow-hidden">
                {/* Question row */}
                <div className="flex items-center gap-3 px-4 py-3.5">
                  {/* Number */}
                  <span className="flex-shrink-0 w-6 h-6 rounded-md bg-muted flex items-center justify-center text-[11px] font-semibold text-muted-foreground">
                    {index + 1}
                  </span>

                  {/* Question text + meta */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-snug line-clamp-1">
                      {question.question || <span className="italic text-muted-foreground">Empty question</span>}
                    </p>
                  </div>

                  {/* Type badge */}
                  <Badge variant="outline" className="text-[10px] h-5 px-2 font-medium text-muted-foreground shrink-0 hidden sm:flex">
                    {TYPE_LABELS[question.type]}
                  </Badge>

                  {/* Options count */}
                  {question.options.length > 0 && (
                    <span className="text-[11px] text-muted-foreground/50 shrink-0 hidden sm:block">
                      {question.options.length} opts
                    </span>
                  )}

                  {/* Actions — always visible, muted until hover */}
                  <div className="flex items-center border border-border/50 rounded-lg overflow-hidden shrink-0">
                    <button
                      onClick={() => handleEditQuestion(question.id)}
                      className="p-1.5 text-muted-foreground/50 hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-px h-4 bg-border/50" />
                    <button
                      onClick={() => {/* TODO: regenerate handler */}}
                      className="p-1.5 text-muted-foreground/50 hover:text-amber-600 hover:bg-amber-500/10 transition-colors"
                      title="Regenerate"
                    >
                      <RefreshCcw className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-px h-4 bg-border/50" />
                    <button
                      onClick={() => setDeletingQuestionId(question.id)}
                      className="p-1.5 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Expand toggle */}
                  <button
                    onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
                    className="shrink-0 p-1 rounded-md hover:bg-muted transition-colors"
                  >
                    <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", expandedQuestion === question.id && "rotate-180")} />
                  </button>
                </div>

                {/* Expandable answer/explanation */}
                <Collapsible
                  open={expandedQuestion === question.id}
                  onOpenChange={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
                >
                  <CollapsibleContent>
                    <div className="px-4 pb-4 pt-0 space-y-2 border-t border-border/40 mt-0 pt-3">
                      <div className="text-xs bg-primary/5 border border-primary/10 rounded-lg p-3">
                        <span className="font-semibold text-foreground">Answer:</span>{" "}
                        <span className="text-muted-foreground">{question.answer}</span>
                      </div>
                      {question.explanation && (
                        <div className="text-xs bg-muted/30 border border-border/60 rounded-lg p-3">
                          <span className="font-semibold text-foreground">Explanation:</span>{" "}
                          <span className="text-muted-foreground">{question.explanation}</span>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="px-5 py-3.5 border-t border-border/60 bg-muted/10 flex items-center gap-2">
          {aiEnabled && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGenerateDialog(true)}
              className="gap-1.5 text-xs rounded-full border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate Quiz
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddQuestion}
            className="gap-1.5 text-xs rounded-full"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Generate Quiz Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] p-0 overflow-hidden grid grid-rows-[auto_minmax(0,1fr)]">
          <DialogHeader className="px-6 pt-5 pb-4 bg-gradient-to-br from-primary/5 to-primary/10 border-b">
            <DialogTitle className="text-lg flex items-center gap-2.5 font-semibold">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Sparkles className="w-4.5 h-4.5 text-primary" />
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
                  <Button variant="outline" onClick={() => setShowGenerateDialog(false)} className="rounded-full px-5">
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

      {/* Edit/Add Question Dialog */}
      <EditQuestionDialog
        open={editingQuestion !== null}
        onClose={handleCloseEditDialog}
        question={editingQuestion}
        onSave={handleSaveEditedQuestion}
        isAddMode={isAddingQuestion}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deletingQuestionId !== null} onOpenChange={(open) => !open && setDeletingQuestionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <AlertDialogTitle className="text-lg">Delete Question</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2">
              Are you sure you want to delete this question? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteQuestion} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
