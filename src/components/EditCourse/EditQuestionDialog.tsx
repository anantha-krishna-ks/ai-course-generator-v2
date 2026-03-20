import { useState, useEffect } from "react";
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
import { CircleCheck, Plus, Trash2, HelpCircle, ListChecks, MessageSquareText, Lightbulb, ChevronDown } from "lucide-react";

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
      setOptions(options.filter((_, i) => i !== index));
      setOptionExplanations(optionExplanations.filter((_, i) => i !== index));
      if (answer === options[index]) {
        setAnswer("");
      }
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

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleOptionExplanationChange = (index: number, value: string) => {
    const newExplanations = [...optionExplanations];
    newExplanations[index] = value;
    setOptionExplanations(newExplanations);
  };

  const handleCorrectAnswerToggle = (optionValue: string) => {
    if (type === "MCQ") {
      const currentAnswers = answer.split(",").map(a => a.trim()).filter(Boolean);
      if (currentAnswers.includes(optionValue)) {
        setAnswer(currentAnswers.filter(a => a !== optionValue).join(", "));
      } else {
        setAnswer([...currentAnswers, optionValue].join(", "));
      }
    } else {
      setAnswer(optionValue);
    }
  };

  const isOptionCorrect = (optionValue: string) => {
    if (type === "MCQ") {
      return answer.split(",").map(a => a.trim()).includes(optionValue);
    }
    return answer === optionValue;
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

  const typeLabel: Record<Question["type"], string> = {
    SCQ: "Single Choice",
    MCQ: "Multiple Choice",
    TrueFalse: "True / False",
    FIB: "Fill in the Blank",
  };

  /** Renders a single option row with inline expandable explanation */
  const OptionRow = ({
    index,
    option,
    selector,
  }: {
    index: number;
    option: string;
    selector: React.ReactNode;
  }) => {
    const isCorrect = isOptionCorrect(option) && option.trim();
    const isExpanded = expandedExplanations.has(index);
    const hasExplanation = (optionExplanations[index] || "").trim().length > 0;

    return (
      <div
        className={cn(
          "group rounded-lg border transition-colors",
          isCorrect ? "bg-primary/8 border-primary shadow-sm" : "hover:bg-accent/20"
        )}
      >
        {/* Main option row */}
        <div className="flex items-center gap-3 p-3.5">
          {selector}
          <Input
            value={option}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            placeholder={`Option ${index + 1}`}
            className="flex-1 border-0 border-b border-transparent bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0 pb-1 text-sm hover:border-border focus:border-primary rounded-none placeholder:text-muted-foreground/50 transition-colors"
          />
          <button
            onClick={() => toggleExplanation(index)}
            className={cn(
              "p-1 rounded-md transition-all shrink-0",
              isExpanded || hasExplanation
                ? "text-primary/70 hover:text-primary hover:bg-primary/10"
                : "opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted"
            )}
            title="Option explanation"
          >
            <Lightbulb className="w-3.5 h-3.5" />
          </button>
          {options.length > 2 && (
            <button
              onClick={() => handleRemoveOption(index)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-destructive/10 transition-all shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </button>
          )}
        </div>

        {/* Expandable explanation */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-200",
            isExpanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="px-3.5 pb-3 pt-0">
            <div className="relative">
              <Textarea
                value={optionExplanations[index] || ""}
                onChange={(e) => handleOptionExplanationChange(index, e.target.value)}
                placeholder="Why is this option correct/incorrect…"
                className="min-h-[48px] max-h-[80px] resize-none text-xs bg-muted/30 border-border/60 focus:border-primary/40 rounded-lg pl-3 pr-3 py-2"
                rows={2}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] p-0 overflow-hidden grid grid-rows-[auto_minmax(0,1fr)_auto] rounded-xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border">
          <DialogTitle className="text-lg font-semibold">
            {isAddMode ? "Add New Question" : "Edit Question"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {isAddMode ? "Create a new question with options and the correct answer." : "Modify the question details, options, and answer."}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="min-h-0 row-start-2">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">

              {/* Question Type */}
              {isAddMode && (
                <div className="space-y-2">
                  <Label htmlFor="questionType" className="text-sm font-medium flex items-center gap-1.5">
                    <ListChecks className="w-4 h-4 text-muted-foreground" />
                    Question Type
                  </Label>
                  <Select value={type} onValueChange={(value: Question["type"]) => {
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
                  }}>
                    <SelectTrigger id="questionType" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SCQ">Single Choice Question (SCQ)</SelectItem>
                      <SelectItem value="MCQ">Multiple Choice Question (MCQ)</SelectItem>
                      <SelectItem value="TrueFalse">True / False</SelectItem>
                      <SelectItem value="FIB">Fill in the Blank (FIB)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Non-add mode: show type badge */}
              {!isAddMode && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                    {typeLabel[type]}
                  </span>
                </div>
              )}

              {/* Question Text */}
              <div className="space-y-2">
                <Label htmlFor="question" className="text-sm font-medium flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  Question
                </Label>
                <Textarea
                  id="question"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter your question here…"
                  className="min-h-[90px] resize-none"
                />
              </div>

              {/* Options / Answer Section */}
              {type === "TrueFalse" ? (
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <CircleCheck className="w-4 h-4 text-muted-foreground" />
                    Select Correct Answer
                  </Label>
                  <RadioGroup value={answer} onValueChange={setAnswer} className="space-y-2">
                    {["True", "False"].map((val, index) => (
                      <OptionRow
                        key={val}
                        index={index}
                        option={val}
                        selector={<RadioGroupItem value={val} id={`tf-${val}`} className="shrink-0" />}
                      />
                    ))}
                  </RadioGroup>
                </div>
              ) : type === "FIB" ? (
                <div className="space-y-2">
                  <Label htmlFor="answer" className="text-sm font-medium flex items-center gap-1.5">
                    <MessageSquareText className="w-4 h-4 text-muted-foreground" />
                    Correct Answer
                  </Label>
                  <Input
                    id="answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Enter the correct answer…"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      <CircleCheck className="w-4 h-4 text-muted-foreground" />
                      Options
                      {type === "MCQ" && (
                        <span className="text-xs text-muted-foreground font-normal ml-1">(select all correct)</span>
                      )}
                    </Label>
                    <button
                      onClick={() => {
                        if (expandedExplanations.size > 0) {
                          setExpandedExplanations(new Set());
                        } else {
                          setExpandedExplanations(new Set(options.map((_, i) => i)));
                        }
                      }}
                      className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors flex items-center gap-1"
                    >
                      <Lightbulb className="w-3 h-3" />
                      {expandedExplanations.size > 0 ? "Hide explanations" : "Show explanations"}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground -mt-1">
                    Click the radio/checkbox to mark correct. Use <Lightbulb className="w-3 h-3 inline -mt-0.5" /> to add per-option explanations.
                  </p>
                  <div className="space-y-2">
                    {type === "SCQ" ? (
                      <RadioGroup value={answer} onValueChange={setAnswer} className="space-y-2">
                        {options.map((option, index) => (
                          <OptionRow
                            key={index}
                            index={index}
                            option={option}
                            selector={<RadioGroupItem value={option} id={`option-${index}`} disabled={!option.trim()} className="shrink-0" />}
                          />
                        ))}
                      </RadioGroup>
                    ) : (
                      <div className="space-y-2">
                        {options.map((option, index) => (
                          <OptionRow
                            key={index}
                            index={index}
                            option={option}
                            selector={
                              <Checkbox
                                id={`option-${index}`}
                                checked={isOptionCorrect(option)}
                                onCheckedChange={() => option.trim() && handleCorrectAnswerToggle(option)}
                                disabled={!option.trim()}
                                className="shrink-0"
                              />
                            }
                          />
                        ))}
                      </div>
                    )}
                    <div
                      onClick={handleAddOption}
                      className="flex items-center gap-3 rounded-lg border border-dashed border-border p-3.5 cursor-pointer transition-colors hover:bg-accent/20 hover:border-foreground/20"
                    >
                      <Plus className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Add option</span>
                    </div>
                  </div>
                </div>
              )}

              {/* General Explanation */}
              <div className="space-y-2">
                <Label htmlFor="explanation" className="text-sm font-medium flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-muted-foreground" />
                  General Explanation
                </Label>
                <p className="text-xs text-muted-foreground -mt-0.5">
                  Overall explanation shown after answering the question.
                </p>
                <Textarea
                  id="explanation"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Why is this the correct answer…"
                  className="min-h-[80px] resize-none"
                />
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/20">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {isAddMode ? "Add Question" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
