import { useState, useCallback } from "react";
import { MessageCircleQuestion, Plus, Sparkles, Edit2, Trash2, ChevronDown, AlertTriangle, RefreshCcw, Copy, GripVertical, MoreHorizontal, Trophy, Settings, CheckCircle2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
import { Skeleton } from "@/components/ui/skeleton";
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
  const isLearningAssessment = variant?.startsWith("learning-assessment-") ?? false;
  const isKnowledgeCheck = variant?.startsWith("knowledge-check-") ?? false;
  const isQuizVariant = variant === "quiz-block" || isLearningAssessment || isKnowledgeCheck;
  const scopeLabel = variant?.endsWith("-page")
    ? "Page Level"
    : variant?.endsWith("-section")
    ? "Section Level"
    : variant?.endsWith("-course")
    ? "Course Level"
    : null;
  const headerTitle =
    variant === "learning-assessment-page" ? "Page Exam"
    : variant === "learning-assessment-section" ? "Section Exam"
    : variant === "learning-assessment-course" ? "Final Exam"
    : variant === "knowledge-check-page" ? "Page Check"
    : variant === "knowledge-check-section" ? "Section Check"
    : variant === "knowledge-check-course" ? "Final Check"
    : isQuizVariant
    ? "Quiz"
    : "Questions";
  // Parse questions + passCriteria + navPage from content (supports legacy array shape)
  const parseContent = (raw: string): { questions: Question[]; passCriteria: number; failNavigationPage: string; requireCorrect: boolean; retries: string; revealAnswers: string; quizType: string } => {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return { questions: parsed, passCriteria: 1, failNavigationPage: "", requireCorrect: false, retries: "unlimited", revealAnswers: "reveal_all", quizType: "formative" };
      if (parsed && typeof parsed === "object") {
        return {
          questions: Array.isArray(parsed.questions) ? parsed.questions : [],
          passCriteria: typeof parsed.passCriteria === "number" ? parsed.passCriteria : 1,
          failNavigationPage: typeof parsed.failNavigationPage === "string" ? parsed.failNavigationPage : "",
          requireCorrect: typeof parsed.requireCorrect === "boolean" ? parsed.requireCorrect : false,
          retries: typeof parsed.retries === "string" ? parsed.retries : "unlimited",
          revealAnswers: typeof parsed.revealAnswers === "string" ? parsed.revealAnswers : "reveal_all",
          quizType: typeof parsed.quizType === "string" ? parsed.quizType : "formative",
        };
      }
    } catch {
      /* fallthrough */
    }
    return { questions: [], passCriteria: 1, failNavigationPage: "", requireCorrect: false, retries: "unlimited", revealAnswers: "reveal_all", quizType: "formative" };
  };

  const initial = parseContent(content);
  const [questions, setQuestionsState] = useState<Question[]>(initial.questions);
  const [passCriteria, setPassCriteriaState] = useState<number>(initial.passCriteria);
  const [failNavigationPage, setFailNavigationPageState] = useState<string>(initial.failNavigationPage);
  const [requireCorrect, setRequireCorrectState] = useState<boolean>(initial.requireCorrect);
  const [retries, setRetriesState] = useState<string>(initial.retries);
  const [revealAnswers, setRevealAnswersState] = useState<string>(initial.revealAnswers);
  const [quizType, setQuizTypeState] = useState<string>(initial.quizType);
  const [showPassCriteriaDialog, setShowPassCriteriaDialog] = useState(false);

  const persist = (qs: Question[], pc: number, fnp: string, rc: boolean, rt: string, ra: string, qt: string = quizType) => {
    onChange(JSON.stringify({ questions: qs, passCriteria: pc, failNavigationPage: fnp, requireCorrect: rc, retries: rt, revealAnswers: ra, quizType: qt }));
  };

  const setQuestions = (updater: Question[] | ((prev: Question[]) => Question[])) => {
    setQuestionsState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      const clamped = next.length === 0 ? 1 : Math.min(Math.max(1, passCriteria), next.length);
      if (clamped !== passCriteria) setPassCriteriaState(clamped);
      persist(next, clamped, failNavigationPage, requireCorrect, retries, revealAnswers);
      return next;
    });
  };

  const setPassCriteria = (value: number) => {
    const clamped = questions.length === 0 ? 1 : Math.min(Math.max(1, value), questions.length);
    setPassCriteriaState(clamped);
    persist(questions, clamped, failNavigationPage, requireCorrect, retries, revealAnswers);
  };

  const setFailNavigationPage = (value: string) => {
    setFailNavigationPageState(value);
    persist(questions, passCriteria, value, requireCorrect, retries, revealAnswers);
  };

  const setRequireCorrect = (value: boolean) => {
    setRequireCorrectState(value);
    persist(questions, passCriteria, failNavigationPage, value, retries, revealAnswers);
  };

  const setRetries = (value: string) => {
    setRetriesState(value);
    persist(questions, passCriteria, failNavigationPage, requireCorrect, value, revealAnswers);
  };

  const setRevealAnswers = (value: string) => {
    setRevealAnswersState(value);
    persist(questions, passCriteria, failNavigationPage, requireCorrect, retries, value);
  };

  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState<number | null>(null);
  const [regeneratingQuestionId, setRegeneratingQuestionId] = useState<number | null>(null);
  const [regeneratePrompt, setRegeneratePrompt] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regeneratingIds, setRegeneratingIds] = useState<Set<number>>(new Set());
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

      const newQt = config.quizType || quizType;
      if (config.quizType) setQuizTypeState(config.quizType);
      const nextQs = [...questions, ...generated];
      setQuestionsState(nextQs);
      const clamped = nextQs.length === 0 ? 1 : Math.min(Math.max(1, passCriteria), nextQs.length);
      if (clamped !== passCriteria) setPassCriteriaState(clamped);
      // Persist with the freshly chosen quizType so preview reflects formative/summative immediately.
      onChange(JSON.stringify({ questions: nextQs, passCriteria: clamped, failNavigationPage, requireCorrect, retries, revealAnswers, quizType: newQt }));
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
            <MessageCircleQuestion className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
            <span className="text-sm font-semibold text-foreground">
              {headerTitle}
            </span>
            {questions.length > 0 && (
              <Badge variant="secondary" className="text-[11px] h-5 px-2 font-semibold">
                {questions.length}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isQuizVariant && questions.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowPassCriteriaDialog(true)}
                    aria-label="Quiz Settings"
                    className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <Settings className="w-4 h-4" aria-hidden="true" focusable="false" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Quiz Settings</TooltipContent>
              </Tooltip>
            )}
            {questions.length > 0 && (
              <>
                <span className="h-4 w-px bg-border" aria-hidden="true" />
                <button
                  onClick={toggleExpandAll}
                  className="h-7 inline-flex items-center px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full"
                >
                  {allExpanded ? "Collapse all" : "Expand all"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Questions list or empty state */}
        {questions.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <MessageCircleQuestion className="w-10 h-10 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
            <p className="text-sm font-medium text-muted-foreground mb-1">No questions yet</p>
            <p className="text-xs text-muted-foreground">
              {isQuizVariant && aiEnabled
                ? "Generate a quiz with AI or add questions manually."
                : "Add questions manually to build your assessment."}
            </p>
          </div>
        ) : (
          <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleQuestionDragEnd}>
            <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
              <div className="p-3 space-y-2.5 bg-muted/30">
                {questions.map((question, index) => {
                  const isExpanded = expandedQuestions.has(question.id);
                  const isQuestionRegenerating = regeneratingIds.has(question.id);
                  return (
                    <SortableQuestionCard key={question.id} question={question}>
                      {(dragHandleProps) => (
                        <div className={cn(
                          "rounded-xl border bg-card shadow-sm hover:shadow-md transition-all overflow-hidden relative",
                          isQuestionRegenerating
                            ? "border-primary/40 ring-1 ring-primary/20"
                            : "border-border"
                        )}>
                          {isQuestionRegenerating ? (
                            <div className="p-3.5 space-y-3" aria-busy="true" aria-live="polite">
                              <div className="flex items-center gap-2.5">
                                <Skeleton className="w-3.5 h-3.5 rounded" />
                                <Skeleton className="w-7 h-7 rounded-full" />
                                <Skeleton className="h-4 flex-1 max-w-[60%]" />
                                <Skeleton className="h-5 w-12 rounded-full" />
                                <div className="flex items-center gap-1.5 ml-1 text-[11px] font-medium text-primary">
                                  <RefreshCcw className="w-3 h-3 animate-spin" aria-hidden="true" focusable="false" />
                                  Regenerating…
                                </div>
                              </div>
                              <div className="space-y-2 pt-1">
                                <Skeleton className="h-9 w-full rounded-lg" />
                                <Skeleton className="h-9 w-full rounded-lg" />
                                <Skeleton className="h-9 w-[85%] rounded-lg" />
                              </div>
                              <Skeleton className="h-8 w-1/2 rounded-lg" />
                              <Skeleton className="h-14 w-full rounded-lg" />
                            </div>
                          ) : (
                          <>
                          {/* Collapsed header row */}
                          <div
                            className="flex items-center gap-2.5 px-3 py-3 cursor-pointer select-none"
                            onClick={() => toggleExpanded(question.id)}
                          >
                            {/* Drag handle */}
                            <span
                              role="button"
                              tabIndex={0}
                              aria-label="Drag to reorder question"
                              className="shrink-0 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted transition-colors"
                              onClick={(e) => e.stopPropagation()}
                              {...dragHandleProps}
                            >
                              <GripVertical className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                            </span>

                            {/* Number */}
                            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                              {index + 1}
                            </span>

                            {/* Question text truncated */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate leading-snug">
                                {question.question || <span className="italic text-muted-foreground">Empty question</span>}
                              </p>
                            </div>

                            {/* Type badge */}
                            <Badge variant="outline" className="text-[10px] h-5 px-2 font-semibold text-primary border-primary/30 bg-primary/5 shrink-0">
                              {question.type}
                            </Badge>

                            {/* Option count */}
                            {question.options.length > 0 && (
                              <span className="text-[10px] text-muted-foreground shrink-0">
                                {question.options.length} opts
                              </span>
                            )}

                            {/* 3-dot menu */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                 <button className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0" aria-label="Question options">
                                  <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => handleEditQuestion(question.id)}>
                                  <Edit2 className="w-3.5 h-3.5 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                {aiEnabled && (
                                  <DropdownMenuItem onClick={() => setRegeneratingQuestionId(question.id)}>
                                    <RefreshCcw className="w-3.5 h-3.5 mr-2" aria-hidden="true" focusable="false" />
                                    Regenerate
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setDeletingQuestionId(question.id)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Chevron */}
                            <ChevronDown className={cn(
                              "w-4 h-4 text-muted-foreground transition-transform shrink-0",
                              isExpanded && "rotate-180"
                            )} />
                          </div>

                          {/* Expanded content */}
                          {isExpanded && (
                            <div className="border-t border-border/60 animate-in fade-in-50 slide-in-from-top-1 duration-150">
                              {/* Options */}
                              {question.options.length > 0 && (
                                <div className="px-4 pt-3 pb-2 space-y-1.5">
                                  {question.options.map((option, optIndex) => {
                                    const isCorrect = question.type === "MCQ"
                                      ? question.answer.split(", ").includes(option)
                                      : option === question.answer;
                                    return (
                                      <div
                                        key={optIndex}
                                        className={cn(
                                          "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all",
                                          isCorrect
                                            ? "bg-primary/10 border border-primary/30"
                                            : "bg-muted/40 border border-transparent"
                                        )}
                                      >
                                        {question.type === "MCQ" ? (
                                          <div
                                            className={cn(
                                              "w-4 h-4 rounded-sm border-2 flex-shrink-0 flex items-center justify-center",
                                              isCorrect
                                                ? "border-primary bg-primary"
                                                : "border-muted-foreground/30"
                                            )}
                                          >
                                            {isCorrect && (
                                    <svg aria-hidden="true" className="w-3 h-3 text-primary-foreground" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M2.5 6l2.5 2.5 4.5-5" />
                                              </svg>
                                            )}
                                          </div>
                                        ) : (
                                          <div
                                            className={cn(
                                              "w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
                                              isCorrect
                                                ? "border-primary bg-primary"
                                                : "border-muted-foreground/30"
                                            )}
                                          >
                                            {isCorrect && (
                                              <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                                            )}
                                          </div>
                                        )}
                                        <span className={cn(
                                          "leading-relaxed text-sm",
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
                              <div className="mx-4 my-2.5 flex items-center gap-3 px-3.5 py-2.5 bg-primary/5 border border-primary/15 rounded-lg">
                                <span className="text-xs font-semibold text-primary">Answer:</span>
                                <span className="text-sm font-semibold text-foreground">{question.answer}</span>
                              </div>

                              {/* Explanation */}
                              {question.explanation && (
                                <div className="mx-4 mb-3 bg-muted/40 border border-border/60 rounded-lg p-3.5">
                                  <p className="text-xs font-semibold text-muted-foreground mb-1">Explanation</p>
                                  <p className="text-sm text-foreground leading-relaxed">{question.explanation}</p>
                                </div>
                              )}
                            </div>
                          )}
                          </>
                          )}
                        </div>
                      )}
                    </SortableQuestionCard>
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Footer actions */}
        <div className="px-4 py-3 border-t border-border/60 bg-muted/10 flex items-center gap-2">
          {isQuizVariant && aiEnabled && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGenerateDialog(true)}
              className="gap-1.5 text-xs rounded-full border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
              Generate Quiz
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddQuestion}
            className="gap-1.5 text-xs rounded-full"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
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
                <AlertTriangle className="w-5 h-5 text-destructive" aria-hidden="true" focusable="false" />
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
              <RefreshCcw className="w-4 h-4 text-muted-foreground" aria-hidden="true" focusable="false" />
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
              <Sparkles className="w-3 h-3 shrink-0" aria-hidden="true" focusable="false" />
              For more accurate results, describe what you'd like the new question to focus on.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRegeneratingQuestionId(null); setRegeneratePrompt(""); }}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const targetId = regeneratingQuestionId;
                if (targetId === null) return;
                const promptText = regeneratePrompt;
                // Close dialog immediately, show inline skeleton on the question card
                setRegeneratingQuestionId(null);
                setRegeneratePrompt("");
                setRegeneratingIds((prev) => {
                  const next = new Set(prev);
                  next.add(targetId);
                  return next;
                });
                // Auto-expand so the user sees the loader inline
                setExpandedQuestions((prev) => {
                  const next = new Set(prev);
                  next.add(targetId);
                  return next;
                });
                // Mock regeneration (replace with real API call)
                setTimeout(() => {
                  setQuestions((prev) => prev.map((q) => {
                    if (q.id === targetId) {
                      return {
                        ...q,
                        question: `Regenerated: ${promptText || q.question}`,
                        explanation: "This question was regenerated with AI.",
                      };
                    }
                    return q;
                  }));
                  setRegeneratingIds((prev) => {
                    const next = new Set(prev);
                    next.delete(targetId);
                    return next;
                  });
                }, 1500);
              }}
              className="gap-1.5"
            >
              <RefreshCcw className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
              Regenerate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quiz Settings Dialog */}
      <Dialog open={showPassCriteriaDialog} onOpenChange={setShowPassCriteriaDialog}>
        <DialogContent
          className="w-[95vw] max-w-[560px] p-0 overflow-hidden rounded-2xl border shadow-2xl gap-0"
          style={{ backgroundColor: "#F9FAFB" }}
        >
          {/* Header */}
          <DialogHeader className="px-6 pt-4 pb-3 border-b border-border bg-white space-y-0">
            <div className="pr-8">
              <DialogTitle className="text-base font-semibold tracking-tight flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
                Quiz Settings
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Configure passing rules, retries, and learner flow.
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Body */}
          <div className="px-6 pt-4 pb-6 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Answer Behavior — Require correct answer */}
            <div className="space-y-2.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Answer Behavior
              </Label>
              <div className="rounded-xl border-2 border-border/60 bg-white p-3 flex items-start justify-between gap-4">
                <div className="flex items-start gap-2.5 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" aria-hidden="true" focusable="false" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">Require correct answer to continue</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Learners must answer correctly before moving to the next question.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={requireCorrect}
                  onCheckedChange={setRequireCorrect}
                  aria-label="Require correct answer to continue"
                />
              </div>
            </div>

            {/* Pass Criteria — only when requireCorrect is ON */}
            {requireCorrect && (
              <div className="space-y-2.5">
                <Label
                  htmlFor="pc-no-of-questions"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Pass Criteria — No. of Questions
                </Label>
                <div className="rounded-xl border-2 border-border/60 bg-white p-3">
                  <Select
                    value={String(passCriteria)}
                    onValueChange={(v) => setPassCriteria(Number(v))}
                  >
                    <SelectTrigger
                      id="pc-no-of-questions"
                      aria-label="Minimum correct answers required"
                      className="w-full h-10 bg-white border-gray-300 rounded-lg text-sm"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: Math.max(questions.length, 1) }, (_, i) => i + 1).map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Minimum correct responses required to pass.
                  </p>
                </div>
              </div>
            )}

            {/* Page Navigation — only when requireCorrect is ON */}
            {requireCorrect && (
              <div className="space-y-2.5">
                <Label
                  htmlFor="pc-fail-nav"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Page Navigation
                </Label>
                <div className="rounded-xl border-2 border-border/60 bg-white p-3">
                  <Select
                    value={failNavigationPage || "__none__"}
                    onValueChange={(v) => setFailNavigationPage(v === "__none__" ? "" : v)}
                  >
                    <SelectTrigger
                      id="pc-fail-nav"
                      aria-label="Page to navigate to when learner fails"
                      className="w-full h-10 bg-white border-gray-300 rounded-lg text-sm"
                    >
                      <SelectValue placeholder="Select page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Select page</SelectItem>
                      <SelectItem value="chapter-1">Chapter 1</SelectItem>
                      <SelectItem value="chapter-2">Chapter 2</SelectItem>
                      <SelectItem value="chapter-3">Chapter 3</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Learner will be redirected here if they don't meet the pass criteria.
                  </p>
                </div>
              </div>
            )}

            {/* Retries */}
            <div className="space-y-2.5">
              <Label
                htmlFor="pc-retries"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Retries
              </Label>
              <div className="rounded-xl border-2 border-border/60 bg-white p-3">
                <Select value={retries} onValueChange={setRetries}>
                  <SelectTrigger
                    id="pc-retries"
                    aria-label="Number of quiz retries allowed"
                    className="w-full h-10 bg-white border-gray-300 rounded-lg text-sm"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground mt-2">
                  How many times learners can re-attempt the quiz.
                </p>
              </div>
            </div>

            {/* Reveal Answers */}
            <div className="space-y-2.5">
              <Label
                htmlFor="pc-reveal-answers"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Reveal Answers
              </Label>
              <div className="rounded-xl border-2 border-border/60 bg-white p-3">
                <Select value={revealAnswers} onValueChange={setRevealAnswers}>
                  <SelectTrigger
                    id="pc-reveal-answers"
                    aria-label="When to reveal correct answers to learners"
                    className="w-full h-10 bg-white border-gray-300 rounded-lg text-sm"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reveal_all">Reveal All Answers</SelectItem>
                    <SelectItem value="incorrect_with_feedback">Show Incorrect Answers with Feedback</SelectItem>
                    <SelectItem value="hide_all">Hide All Answers</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground mt-2">
                  Choose what learners see after submitting each question.
                </p>
              </div>
            </div>
          </div>


          {/* Footer */}
          <DialogFooter className="px-6 py-3.5 border-t border-border bg-white">
            <Button
              variant="outline"
              onClick={() => setShowPassCriteriaDialog(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setShowPassCriteriaDialog(false)}
              className="rounded-xl gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
