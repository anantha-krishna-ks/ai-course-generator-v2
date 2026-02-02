import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { AlertCircle } from "lucide-react";

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

  // Initialize form when question changes
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
      // Clear answer if it was the removed option
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
      // Multiple choice: toggle in comma-separated list
      const currentAnswers = answer.split(",").map(a => a.trim()).filter(Boolean);
      if (currentAnswers.includes(optionValue)) {
        setAnswer(currentAnswers.filter(a => a !== optionValue).join(", "));
      } else {
        setAnswer([...currentAnswers, optionValue].join(", "));
      }
    } else {
      // Single choice or True/False: set as the answer
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

    // Validation with toast notifications
    if (!questionText.trim()) {
      toast({
        variant: "destructive",
        title: "Question Required",
        description: "Please enter a question before saving.",
      });
      return;
    }

    if (type !== "FIB" && options.every(opt => !opt.trim())) {
      toast({
        variant: "destructive",
        title: "Options Required",
        description: "Please add at least one option for this question.",
      });
      return;
    }

    if (!answer.trim()) {
      toast({
        variant: "destructive",
        title: "Answer Required",
        description: "Please select or enter the correct answer.",
      });
      return;
    }

    if (!explanation.trim()) {
      toast({
        variant: "destructive",
        title: "Explanation Required",
        description: "Please provide an explanation for this question.",
      });
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] p-0 overflow-hidden grid grid-rows-[auto_minmax(0,1fr)]">
        <DialogHeader className="px-6 pt-4 pb-3 border-b bg-muted/30">
          <DialogTitle className="text-xl font-semibold">
            {isAddMode ? "Add New Question" : "Edit Question"}
          </DialogTitle>
          <DialogDescription>
            {isAddMode ? "Create a new question with options and answer" : "Modify question details and options"}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 row-start-2">
          <ScrollArea className="h-full">
            <div className="space-y-5 p-6 pr-2">
              {/* Question Type Selector - Only show in Add mode */}
              {isAddMode && (
                <div className="space-y-2">
                  <Label htmlFor="questionType" className="text-sm font-semibold">
                    Question Type
                  </Label>
                  <Select value={type} onValueChange={(value: Question["type"]) => {
                    setType(value);
                    // Reset options based on type
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
                      <SelectItem value="TrueFalse">True/False</SelectItem>
                      <SelectItem value="FIB">Fill in the Blank (FIB)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Question Text */}
              <div className="space-y-2">
                <Label htmlFor="question" className="text-sm font-semibold">
                  Question
                </Label>
                <Textarea
                  id="question"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter your question here..."
                  className="min-h-[100px] resize-none"
                />
              </div>

              {/* Options with correct answer selection */}
              {type === "TrueFalse" ? (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Select Correct Answer</Label>
                  <p className="text-xs text-muted-foreground">Note: Choose the correct option if you need to change the answer.</p>
                  <RadioGroup value={answer} onValueChange={setAnswer}>
                    <div className={cn(
                      "flex items-center space-x-3 rounded-lg border p-4 transition-colors hover:bg-accent/20",
                      answer === "True" && "bg-primary/10 border-primary"
                    )}>
                      <RadioGroupItem value="True" id="true" />
                      <Label htmlFor="true" className="flex-1 cursor-pointer font-normal">
                        True
                      </Label>
                    </div>
                    <div className={cn(
                      "flex items-center space-x-3 rounded-lg border p-4 transition-colors hover:bg-accent/20",
                      answer === "False" && "bg-primary/10 border-primary"
                    )}>
                      <RadioGroupItem value="False" id="false" />
                      <Label htmlFor="false" className="flex-1 cursor-pointer font-normal">
                        False
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              ) : type !== "FIB" && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">
                    Options {type === "MCQ" && <span className="text-muted-foreground font-normal">(check all correct answers)</span>}
                  </Label>
                  <p className="text-xs text-muted-foreground">Note: Choose the correct option if you need to change the answer.</p>
                  <div className="space-y-2">
                    {type === "SCQ" ? (
                      <RadioGroup value={answer} onValueChange={setAnswer}>
                        {options.map((option, index) => (
                          <div 
                            key={index} 
                            className={cn(
                              "flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/20",
                              answer === option && option.trim() && "bg-primary/10 border-primary"
                            )}
                          >
                            <RadioGroupItem value={option} id={`option-${index}`} disabled={!option.trim()} className="mt-1" />
                            <Textarea
                              value={option}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                              className="flex-1 min-h-[60px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          </div>
                        ))}
                      </RadioGroup>
                    ) : (
                      // MCQ with checkboxes
                      options.map((option, index) => (
                        <div 
                          key={index} 
                          className={cn(
                            "flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/20",
                            isOptionCorrect(option) && option.trim() && "bg-primary/10 border-primary"
                          )}
                        >
                          <Checkbox
                            id={`option-${index}`}
                            checked={isOptionCorrect(option)}
                            onCheckedChange={() => option.trim() && handleCorrectAnswerToggle(option)}
                            disabled={!option.trim()}
                            className="mt-1"
                          />
                          <Textarea
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            className="flex-1 min-h-[60px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Answer - Only for FIB */}
              {type === "FIB" && (
                <div className="space-y-2">
                  <Label htmlFor="answer" className="text-sm font-semibold">
                    Correct Answer
                  </Label>
                  <Input
                    id="answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Enter the correct answer..."
                  />
                </div>
              )}

              {/* Explanation */}
              <div className="space-y-2">
                <Label htmlFor="explanation" className="text-sm font-semibold">
                  Explanation
                </Label>
                <Textarea
                  id="explanation"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Provide an explanation for the answer..."
                  className="min-h-[80px] resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={handleClose} size="lg">
                  Cancel
                </Button>
                <Button onClick={handleSave} size="lg" className="bg-primary hover:bg-primary/90">
                  {isAddMode ? "Add Question" : "Save Changes"}
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
