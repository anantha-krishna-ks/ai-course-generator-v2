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
import { CircleCheck, Plus, Trash2, HelpCircle, ListChecks, MessageSquareText, Lightbulb } from "lucide-react";

interface Question {
  id: number;
  type: "SCQ" | "MCQ" | "TrueFalse" | "FIB";
  question: string;
  options: string[];
  answer: string;
  explanation: string;
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

  useEffect(() => {
    if (question) {
      setType(question.type);
      setQuestionText(question.question);
      setOptions(question.options.length > 0 ? question.options : ["", "", "", ""]);
      setAnswer(question.answer);
      setExplanation(question.explanation || "");
    }
  }, [question]);

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
      if (answer === options[index]) {
        setAnswer("");
      }
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
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
                      setAnswer("");
                    } else if (value === "FIB") {
                      setOptions([]);
                      setAnswer("");
                    } else {
                      setOptions(["", "", "", ""]);
                      setAnswer("");
                    }
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
                  <RadioGroup value={answer} onValueChange={setAnswer} className="grid grid-cols-2 gap-3">
                    {["True", "False"].map((val) => (
                      <label
                        key={val}
                        htmlFor={`tf-${val}`}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors hover:bg-accent/30",
                          answer === val && "bg-primary/8 border-primary shadow-sm"
                        )}
                      >
                        <RadioGroupItem value={val} id={`tf-${val}`} />
                        <span className="text-sm font-medium">{val}</span>
                      </label>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleAddOption}
                      className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add option
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground -mt-1">
                    Click the radio/checkbox to mark the correct answer.
                  </p>
                  <div className="space-y-2">
                    {type === "SCQ" ? (
                      <RadioGroup value={answer} onValueChange={setAnswer}>
                        {options.map((option, index) => (
                          <div
                            key={index}
                            className={cn(
                              "group flex items-center gap-3 rounded-lg border p-3.5 transition-colors hover:bg-accent/20",
                              answer === option && option.trim() && "bg-primary/8 border-primary shadow-sm"
                            )}
                          >
                            <RadioGroupItem value={option} id={`option-${index}`} disabled={!option.trim()} className="shrink-0" />
                            <Input
                              value={option}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                              className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0 text-sm"
                            />
                            {options.length > 2 && (
                              <button
                                onClick={() => handleRemoveOption(index)}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-destructive/10 transition-all shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-destructive" />
                              </button>
                            )}
                          </div>
                        ))}
                      </RadioGroup>
                    ) : (
                      options.map((option, index) => (
                        <div
                          key={index}
                          className={cn(
                            "group flex items-center gap-3 rounded-lg border p-3.5 transition-colors hover:bg-accent/20",
                            isOptionCorrect(option) && option.trim() && "bg-primary/8 border-primary shadow-sm"
                          )}
                        >
                          <Checkbox
                            id={`option-${index}`}
                            checked={isOptionCorrect(option)}
                            onCheckedChange={() => option.trim() && handleCorrectAnswerToggle(option)}
                            disabled={!option.trim()}
                            className="shrink-0"
                          />
                          <Input
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0 text-sm"
                          />
                          {options.length > 2 && (
                            <button
                              onClick={() => handleRemoveOption(index)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-destructive/10 transition-all shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-destructive" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Explanation */}
              <div className="space-y-2">
                <Label htmlFor="explanation" className="text-sm font-medium flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-muted-foreground" />
                  Explanation
                </Label>
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
