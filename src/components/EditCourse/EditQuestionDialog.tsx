import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Check, Plus, Trash2, MessageSquareText, Lightbulb, ChevronDown, Type, ToggleLeft, ListChecks, CircleDot, CheckSquare, GripVertical } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Question {
  id: number;
  type: "SCQ" | "MCQ" | "TrueFalse" | "FIB";
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  optionExplanations?: string[];
}

interface EditQuestionDialogProps {
  open: boolean;
  onClose: () => void;
  question: Question | null;
  onSave: (question: Question) => void;
  isAddMode?: boolean;
}

const typeConfig: Record<Question["type"], { label: string; icon: React.ReactNode; description: string }> = {
  SCQ: { label: "Single Choice", icon: <CircleDot className="w-4 h-4" />, description: "One correct answer" },
  MCQ: { label: "Multiple Choice", icon: <CheckSquare className="w-4 h-4" />, description: "Multiple correct answers" },
  TrueFalse: { label: "True / False", icon: <ToggleLeft className="w-4 h-4" />, description: "Binary choice" },
  FIB: { label: "Fill in the Blank", icon: <Type className="w-4 h-4" />, description: "Text answer" },
};

export const EditQuestionDialog = ({ open, onClose, question, onSave, isAddMode = false }: EditQuestionDialogProps) => {
  const { toast } = useToast();
  const [type, setType] = useState<Question["type"]>("SCQ");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [answer, setAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const [optionExplanations, setOptionExplanations] = useState<string[]>([]);
  const [expandedExplanations, setExpandedExplanations] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (question) {
      setType(question.type);
      setQuestionText(question.question);
      const opts = question.options.length > 0 ? question.options : ["", "", "", ""];
      setOptions(opts);
      setAnswer(question.answer);
      setExplanation(question.explanation || "");
      setOptionExplanations(question.optionExplanations || new Array(opts.length).fill(""));
      setExpandedExplanations(new Set());
    }
  }, [question]);

  const toggleExplanation = (index: number) => {
    setExpandedExplanations(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleAddOption = () => {
    setOptions([...options, ""]);
    setOptionExplanations([...optionExplanations, ""]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      setOptionExplanations(optionExplanations.filter((_, i) => i !== index));
      // Remap correctIndices
      setCorrectIndices(prev => {
        const next = new Set<number>();
        prev.forEach(i => {
          if (i < index) next.add(i);
          else if (i > index) next.add(i - 1);
        });
        syncAnswerFromIndices(next, newOptions);
        return next;
      });
      setExpandedExplanations(prev => {
        const next = new Set<number>();
        prev.forEach(i => {
          if (i < index) next.add(i);
          else if (i > index) next.add(i - 1);
        });
        return next;
      });
    }
  };

  // Track selected correct answer(s) by index for stable selection
  const [correctIndices, setCorrectIndices] = useState<Set<number>>(new Set());

  // Sync correctIndices when question loads
  useEffect(() => {
    if (question && question.type !== "FIB" && question.type !== "TrueFalse") {
      const answerParts = question.answer.split(",").map(a => a.trim()).filter(Boolean);
      const indices = new Set<number>();
      const opts = question.options.length > 0 ? question.options : ["", "", "", ""];
      answerParts.forEach(ans => {
        const idx = opts.findIndex(o => o.trim() === ans);
        if (idx !== -1) indices.add(idx);
      });
      setCorrectIndices(indices);
    }
  }, [question]);

  const syncAnswerFromIndices = (indices: Set<number>, opts: string[]) => {
    const selected = Array.from(indices)
      .map(i => opts[i]?.trim())
      .filter(Boolean);
    setAnswer(selected.join(", "));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    // Keep answer text in sync with option text changes
    syncAnswerFromIndices(correctIndices, newOptions);
  };

  const handleOptionExplanationChange = (index: number, value: string) => {
    const newExplanations = [...optionExplanations];
    newExplanations[index] = value;
    setOptionExplanations(newExplanations);
  };

  const handleCorrectIndexToggle = (index: number) => {
    if (type === "MCQ") {
      setCorrectIndices(prev => {
        const next = new Set(prev);
        if (next.has(index)) next.delete(index);
        else next.add(index);
        syncAnswerFromIndices(next, options);
        return next;
      });
    } else {
      const next = new Set([index]);
      setCorrectIndices(next);
      syncAnswerFromIndices(next, options);
    }
  };

  const isOptionCorrect = (index: number) => {
    return correctIndices.has(index);
  };

  const handleSave = () => {
    if (!question) return;

    if (!questionText.trim()) {
      toast({ variant: "destructive", title: "Question Required", description: "Please enter a question before saving." });
      return;
    }

    if (type !== "FIB" && options.every(opt => !opt.trim())) {
      toast({ variant: "destructive", title: "Options Required", description: "Please add at least one option for this question." });
      return;
    }

    if (!answer.trim()) {
      toast({ variant: "destructive", title: "Answer Required", description: "Please select or enter the correct answer." });
      return;
    }

    if (!explanation.trim()) {
      toast({ variant: "destructive", title: "Explanation Required", description: "Please provide an explanation for this question." });
      return;
    }

    const updatedQuestion: Question = {
      ...question,
      type,
      question: questionText.trim(),
      options: options.filter(opt => opt.trim()),
      answer: answer.trim(),
      explanation: explanation.trim(),
      optionExplanations: optionExplanations.filter((_, i) => options[i]?.trim()),
    };

    onSave(updatedQuestion);
    toast({
      title: isAddMode ? "Question Added" : "Question Updated",
      description: isAddMode ? "New question has been added successfully." : "Question has been updated successfully.",
    });
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  if (!question) return null;

  const handleTypeChange = (value: Question["type"]) => {
    setType(value);
    if (value === "TrueFalse") {
      setOptions(["True", "False"]);
      setOptionExplanations(["", ""]);
      setAnswer("");
    } else if (value === "FIB") {
      setOptions([]);
      setOptionExplanations([]);
      setAnswer("");
    } else {
      setOptions(["", "", "", ""]);
      setOptionExplanations(["", "", "", ""]);
      setAnswer("");
    }
    setExpandedExplanations(new Set());
    setCorrectIndices(new Set());
  };

  /** Render a single option card */
  const renderOptionRow = (index: number, option: string, selector: React.ReactNode) => {
    const isCorrect = isOptionCorrect(index) && option.trim();
    const isExpanded = expandedExplanations.has(index);
    const hasExplanation = (optionExplanations[index] || "").trim().length > 0;

    return (
      <div key={index} className="group relative">
        <div
          className={cn(
            "rounded-xl border-2 transition-all duration-150",
            isCorrect
              ? "border-primary/50 bg-primary/[0.04] shadow-[0_0_0_1px_hsl(var(--primary)/0.1)]"
               : "border-border/60 bg-white hover:bg-white"
          )}
        >
          {/* Correct badge */}
          {isCorrect && (
            <div className="absolute -top-2 right-3 flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
              <Check className="w-2.5 h-2.5" />
              Correct
            </div>
          )}

          {/* Option input row */}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="text-xs font-bold text-muted-foreground/50 w-5 text-center select-none shrink-0">
              {String.fromCharCode(65 + index)}
            </span>
            {selector}
            <Input
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${String.fromCharCode(65 + index)}`}
              className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0 text-sm placeholder:text-muted-foreground/30 font-medium"
            />
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                onClick={() => toggleExplanation(index)}
                className={cn(
                  "p-1.5 rounded-lg transition-all duration-150 flex items-center gap-0.5",
                  isExpanded
                    ? "bg-primary/10 text-primary"
                    : hasExplanation
                      ? "text-primary/50 hover:bg-primary/10 hover:text-primary"
                      : "text-muted-foreground/50 hover:text-muted-foreground/80 hover:bg-muted"
                )}
                title="Add rationale for this option"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <ChevronDown className={cn("w-2.5 h-2.5 transition-transform duration-200", isExpanded && "rotate-180")} />
              </button>
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="p-1.5 rounded-lg text-muted-foreground/20 hover:text-destructive hover:bg-destructive/10 transition-all duration-150 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Expandable rationale */}
          {isExpanded && (
            <div className="px-4 pb-3.5 pt-0">
              <div className="pl-8">
                <Textarea
                  value={optionExplanations[index] || ""}
                  onChange={(e) => handleOptionExplanationChange(index, e.target.value)}
                  placeholder="Why is this option correct or incorrect…"
                  className="min-h-[52px] max-h-[90px] resize-none text-xs bg-white border-border/50 rounded-lg"
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-[820px] max-h-[90vh] p-0 overflow-hidden grid grid-rows-[auto_minmax(0,1fr)_auto] rounded-2xl border shadow-2xl" style={{ backgroundColor: '#F9FAFB' }}>
        {/* Header */}
        <DialogHeader className="px-6 pt-4 pb-3 border-b border-border bg-white">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-base font-semibold tracking-tight">
                {isAddMode ? "New Question" : "Edit Question"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isAddMode ? "Set up your question, options, and the correct answer." : "Update the question content and settings."}
              </DialogDescription>
            </div>
            {!isAddMode && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/[0.06] px-2.5 py-1.5 rounded-lg border border-primary/15">
                {typeConfig[type].icon}
                {typeConfig[type].label}
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="min-h-0 row-start-2">
          <ScrollArea className="h-full">
            <div className="px-6 pt-4 pb-6 space-y-5">

              {/* Question Type — Add mode only */}
              {isAddMode && (
                <div className="space-y-2.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Question Type
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(typeConfig) as Question["type"][]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleTypeChange(t)}
                        className={cn(
                          "flex items-center gap-2.5 px-3.5 py-3 rounded-xl border-2 text-left transition-all duration-150",
                          type === t
                            ? "border-primary bg-primary/[0.04] shadow-[0_0_0_1px_hsl(var(--primary)/0.1)]"
                            : "border-border/60 bg-white hover:bg-gray-50"
                        )}
                      >
                        <div className={cn(
                          "p-1.5 rounded-lg transition-colors",
                          type === t ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/50"
                        )}>
                          {typeConfig[t].icon}
                        </div>
                        <div>
                          <p className={cn("text-sm font-medium", type === t ? "text-foreground" : "text-muted-foreground")}>
                            {typeConfig[t].label}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60">{typeConfig[t].description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Question Text */}
              <div className="space-y-2">
                <Label htmlFor="question" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Question
                </Label>
                <Textarea
                  id="question"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Type your question here…"
                  className="min-h-[80px] resize-none rounded-xl bg-white border border-gray-300 focus:border-primary text-sm transition-colors"
                />
              </div>

              {/* Options / Answer Section */}
              {type === "TrueFalse" ? (
                <div className="space-y-2.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Correct Answer
                  </Label>
                  <RadioGroup value={answer} onValueChange={setAnswer} className="grid grid-cols-2 gap-2">
                    {["True", "False"].map((val) => (
                      <label
                        key={val}
                        className={cn(
                          "flex items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 cursor-pointer transition-all duration-150 text-sm font-medium",
                          answer === val
                            ? "border-primary bg-primary/[0.04] text-foreground shadow-[0_0_0_1px_hsl(var(--primary)/0.1)]"
                            : "border-border/60 bg-white text-muted-foreground hover:bg-gray-50"
                        )}
                      >
                        <RadioGroupItem value={val} id={`tf-${val}`} className="sr-only" />
                        {answer === val && <Check className="w-4 h-4 text-primary" />}
                        {val}
                      </label>
                    ))}
                  </RadioGroup>
                  {/* Per-option explanations for True/False */}
                  {["True", "False"].map((val, index) => {
                    const isExpanded = expandedExplanations.has(index);
                    const hasExplanation = (optionExplanations[index] || "").trim().length > 0;
                    return (
                      <div key={val}>
                        <button
                          type="button"
                          onClick={() => toggleExplanation(index)}
                          className={cn(
                            "text-xs flex items-center gap-1 transition-colors px-1 py-0.5 rounded",
                            isExpanded || hasExplanation ? "text-primary/60" : "text-muted-foreground/30 hover:text-muted-foreground/50"
                          )}
                        >
                          <Lightbulb className="w-3 h-3" />
                          Why "{val}" is {answer === val ? "correct" : "incorrect"}
                          <ChevronDown className={cn("w-2.5 h-2.5 transition-transform", isExpanded && "rotate-180")} />
                        </button>
                        {isExpanded && (
                          <Textarea
                            value={optionExplanations[index] || ""}
                            onChange={(e) => handleOptionExplanationChange(index, e.target.value)}
                            placeholder={`Why "${val}" is the ${answer === val ? "correct" : "incorrect"} answer…`}
                            className="mt-1.5 min-h-[48px] max-h-[80px] resize-none text-xs bg-white border-border/50 rounded-lg"
                            rows={2}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : type === "FIB" ? (
                <div className="space-y-2">
                  <Label htmlFor="answer" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Correct Answer
                  </Label>
                  <Input
                    id="answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Enter the correct answer…"
                    className="rounded-xl bg-white border border-gray-300 focus:border-primary transition-colors"
                  />
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Answer Choices
                      {type === "MCQ" && (
                        <span className="font-normal normal-case tracking-normal ml-1.5 text-muted-foreground/50">— select all correct</span>
                      )}
                    </Label>
                    <button
                      type="button"
                      onClick={() => {
                        if (expandedExplanations.size > 0) {
                          setExpandedExplanations(new Set());
                        } else {
                          setExpandedExplanations(new Set(options.map((_, i) => i)));
                        }
                      }}
                      className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-muted/60"
                    >
                      <Lightbulb className="w-3 h-3" />
                      {expandedExplanations.size > 0 ? "Collapse all" : "Expand all"}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {type === "SCQ" ? (
                      <RadioGroup value={String(Array.from(correctIndices)[0] ?? -1)} onValueChange={(val) => handleCorrectIndexToggle(Number(val))} className="space-y-2">
                        {options.map((option, index) =>
                          renderOptionRow(index, option, <RadioGroupItem value={String(index)} id={`option-${index}`} disabled={!option.trim()} className="shrink-0" />)
                        )}
                      </RadioGroup>
                    ) : (
                      <div className="space-y-2">
                        {options.map((option, index) =>
                          renderOptionRow(index, option,
                            <Checkbox
                              id={`option-${index}`}
                              checked={isOptionCorrect(index)}
                              onCheckedChange={() => option.trim() && handleCorrectIndexToggle(index)}
                              disabled={!option.trim()}
                              className="shrink-0"
                            />
                          )
                        )}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="flex items-center gap-2.5 w-full rounded-xl border-2 border-dashed border-border/50 px-4 py-3 text-sm text-muted-foreground/50 hover:text-muted-foreground hover:border-primary/30 hover:bg-primary/[0.02] transition-all duration-150"
                    >
                      <Plus className="w-4 h-4" />
                      Add option
                    </button>
                  </div>
                </div>
              )}

              {/* General Explanation */}
              <div className="space-y-2">
                <Label htmlFor="explanation" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Explanation
                </Label>
                <Textarea
                  id="explanation"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explain why this is the correct answer. Shown to learners after they respond."
                  className="min-h-[72px] resize-none rounded-xl bg-white border border-gray-300 focus:border-primary text-sm transition-colors"
                />
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-3.5 border-t border-border bg-white">
          <Button variant="outline" onClick={handleClose} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleSave} className="rounded-xl">
            {isAddMode ? "Add Question" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
