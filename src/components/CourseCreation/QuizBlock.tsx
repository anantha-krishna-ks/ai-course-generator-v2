import { useState, useCallback } from "react";
import { MessageCircleQuestion, Plus, Sparkles, Edit2, Trash2, ChevronDown, AlertTriangle, RefreshCcw, Copy, GripVertical, MoreHorizontal } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { EditQuestionDialog } from "@/components/EditCourse/EditQuestionDialog";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { GenerateQuizDialog, type GenerateQuizConfig } from "./GenerateQuizDialog";

interface Question {
  id: number;
  type: "SCQ" | "MCQ" | "TrueFalse" | "FIB";
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  optionExplanations?: string[];
}

interface QuizBlockProps {
  aiEnabled?: boolean;
  content: string; // JSON stringified questions array
  onChange: (content: string) => void;
  variant?: string; // "question-block" or "quiz-block"
}

const TYPE_LABELS: Record<Question["type"], string> = {
  SCQ: "Single Choice",
  MCQ: "Multiple Choice",
  TrueFalse: "True/False",
  FIB: "Fill in Blank",
};

function SortableQuestionCard({ question, children }: { question: Question; children: (dragHandleProps: Record<string, unknown>) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question.id });
  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: transition ?? 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1)',
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
    position: 'relative' as const,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children(listeners ?? {})}
    </div>
  );
}

export function QuizBlock({ aiEnabled = false, content, onChange, variant }: QuizBlockProps) {
  const isQuizVariant = variant === "quiz-block";
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
  const [regeneratingQuestionId, setRegeneratingQuestionId] = useState<number | null>(null);
  const [regeneratePrompt, setRegeneratePrompt] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  const toggleExpanded = useCallback((id: number) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allExpanded = questions.length > 0 && expandedQuestions.size === questions.length;

  const toggleExpandAll = useCallback(() => {
    if (allExpanded) {
      setExpandedQuestions(new Set());
    } else {
      setExpandedQuestions(new Set(questions.map(q => q.id)));
    }
  }, [allExpanded, questions]);

  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleQuestionDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setQuestions((prev) => {
        const oldIndex = prev.findIndex((q) => q.id === active.id);
        const newIndex = prev.findIndex((q) => q.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);

  // Generate quiz dialog state
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

  const handleGenerate = (config: GenerateQuizConfig) => {
    setIsGenerating(true);
    setTimeout(() => {
      const generated: Question[] = [];
      let idCounter = Math.max(...questions.map((q) => q.id), 0) + 1;

      for (let i = 0; i < config.scqCount; i++) {
        generated.push({
          id: idCounter++, type: "SCQ",
          question: `Sample single choice question ${i + 1}?`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          answer: "Option A", explanation: "This is the explanation for the correct answer.",
        });
      }
      for (let i = 0; i < config.mcqCount; i++) {
        generated.push({
          id: idCounter++, type: "MCQ",
          question: `Sample multiple choice question ${i + 1}?`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          answer: "Option A, Option B", explanation: "These are the correct answers.",
        });
      }
      for (let i = 0; i < config.trueFalseCount; i++) {
        generated.push({
          id: idCounter++, type: "TrueFalse",
          question: `Sample true/false statement ${i + 1}.`,
          options: ["True", "False"],
          answer: "True", explanation: "This statement is true because...",
        });
      }
      for (let i = 0; i < config.fibCount; i++) {
        generated.push({
          id: idCounter++, type: "FIB",
          question: `The _____ is a sample fill-in-the-blank question ${i + 1}.`,
          options: [],
          answer: "answer", explanation: "The correct word to fill in is 'answer'.",
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
            <div className="w-1 h-5 bg-primary rounded-full" />
            <span className="text-sm font-semibold text-foreground">
              {questions.length > 0
                ? `Generated Questions (${questions.length})`
                : (isQuizVariant ? "Quiz" : "Question")}
            </span>
          </div>
          {questions.length > 0 && (
            <button
              onClick={toggleExpandAll}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              {allExpanded ? "Collapse all" : "Expand all"}
            </button>
          )}
        </div>

        {/* Questions list or empty state */}
        {questions.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <MessageCircleQuestion className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">No questions yet</p>
            <p className="text-xs text-muted-foreground/60 mb-5">
              {isQuizVariant && aiEnabled
                ? "Generate a quiz with AI or add questions manually."
                : "Add questions manually to build your quiz."}
            </p>
          </div>
        ) : (
          <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleQuestionDragEnd}>
            <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
              <div className="p-4 space-y-4" style={{ backgroundColor: '#F8FAFC' }}>
                {questions.map((question, index) => (
                  <SortableQuestionCard key={question.id} question={question}>
                    {(dragHandleProps) => (
                      <div className="rounded-xl border border-border shadow-sm hover:shadow-md transition-all overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
                        {/* Question header */}
                        <div className="flex items-start gap-3 px-5 pt-5 pb-4">
                          <span
                            className="shrink-0 cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-muted transition-colors mt-1"
                            {...dragHandleProps}
                          >
                            <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40" />
                          </span>

                          {/* Number circle */}
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                            {index + 1}
                          </span>

                          {/* Question text */}
                          <div className="flex-1 min-w-0 pt-1">
                            <p className="text-sm font-medium text-foreground leading-relaxed">
                              {question.question || <span className="italic text-muted-foreground">Empty question</span>}
                            </p>
                          </div>

                          {/* Edit & Delete buttons */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleEditQuestion(question.id)}
                              className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingQuestionId(question.id)}
                              className="p-2 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Options */}
                        {question.options.length > 0 && (
                          <div className="px-5 pb-3 space-y-2">
                            {question.options.map((option, optIndex) => {
                              const isCorrect = option === question.answer;
                              return (
                                <div
                                  key={optIndex}
                                  className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all",
                                    isCorrect
                                      ? "bg-primary/15 border-2 border-primary/40 shadow-sm"
                                      : "bg-muted/40 border border-transparent"
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
                                      isCorrect
                                        ? "border-primary bg-primary"
                                        : "border-muted-foreground/30"
                                    )}
                                  >
                                    {isCorrect && (
                                      <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                                    )}
                                  </div>
                                  <span className={cn(
                                    "leading-relaxed",
                                    isCorrect ? "font-medium text-foreground" : "text-muted-foreground"
                                  )}>
                                    {option}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Answer bar */}
                        <div className="mx-5 mb-3 flex items-center gap-3 px-4 py-2.5 bg-muted/30 border border-border/60 rounded-lg">
                          <Badge variant="outline" className="text-[11px] h-5 px-2.5 font-semibold text-primary border-primary/30 bg-primary/5">
                            {question.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">Answer:</span>
                          <span className="text-sm font-semibold text-foreground">{question.answer}</span>
                        </div>

                        {/* Explanation collapsible */}
                        {question.explanation && (
                          <Collapsible
                            open={expandedQuestions.has(question.id)}
                            onOpenChange={() => toggleExpanded(question.id)}
                          >
                            <CollapsibleTrigger asChild>
                              <button className="flex items-center gap-2 px-5 pb-4 pt-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                                <ChevronDown className={cn(
                                  "w-4 h-4 transition-transform",
                                  expandedQuestions.has(question.id) && "rotate-180"
                                )} />
                                {expandedQuestions.has(question.id) ? "Hide" : "Show"} Explanation
                              </button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="mx-5 mb-4 bg-primary/5 border border-primary/15 rounded-lg p-4">
                                <p className="text-xs font-semibold text-foreground mb-1.5">Explanation:</p>
                                <p className="text-sm text-muted-foreground leading-relaxed">{question.explanation}</p>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                      </div>
                    )}
                  </SortableQuestionCard>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Action buttons */}
        <div className="px-5 py-3.5 border-t border-border/60 bg-muted/10 flex items-center gap-2">
          {isQuizVariant && aiEnabled && (
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
      <GenerateQuizDialog
        open={showGenerateDialog}
        onClose={() => setShowGenerateDialog(false)}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
      />

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

      {/* Regenerate Question Dialog */}
      <Dialog open={!!regeneratingQuestionId} onOpenChange={(open) => { if (!open) { setRegeneratingQuestionId(null); setRegeneratePrompt(""); setIsRegenerating(false); } }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCcw className="w-4 h-4 text-muted-foreground" />
              Regenerate Question
            </DialogTitle>
            <DialogDescription>
              Provide additional context for a more accurate regeneration.
            </DialogDescription>
          </DialogHeader>
          <div className="py-3 space-y-3">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              Refinement context
              <span className="text-xs text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              value={regeneratePrompt}
              onChange={(e) => setRegeneratePrompt(e.target.value)}
              placeholder="e.g. Focus on practical applications, make it more challenging, include specific terminology…"
              className="min-h-[100px] resize-none"
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 shrink-0" />
              For more accurate results, describe what you'd like the new question to focus on.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRegeneratingQuestionId(null); setRegeneratePrompt(""); }}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setIsRegenerating(true);
                // Mock regeneration
                setTimeout(() => {
                  if (regeneratingQuestionId !== null) {
                    setQuestions((prev) => prev.map((q) => {
                      if (q.id === regeneratingQuestionId) {
                        return {
                          ...q,
                          question: `Regenerated: ${regeneratePrompt || q.question}`,
                          explanation: "This question was regenerated with AI.",
                        };
                      }
                      return q;
                    }));
                  }
                  setIsRegenerating(false);
                  setRegeneratingQuestionId(null);
                  setRegeneratePrompt("");
                }, 1500);
              }}
              disabled={isRegenerating}
              className="gap-1.5"
            >
              {isRegenerating ? (
                <>
                  <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                  Regenerating…
                </>
              ) : (
                <>
                  <RefreshCcw className="w-3.5 h-3.5" />
                  Regenerate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
