import { useState } from "react";
import { Sparkles, Plus, RefreshCcw, Edit2, Trash2, ChevronDown, AlertTriangle } from "lucide-react";
import { AISparkles } from "@/components/ui/ai-sparkles";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { EditQuestionDialog } from "./EditQuestionDialog";

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
  const [scqCount, setScqCount] = useState("1");
  const [mcqCount, setMcqCount] = useState("1");
  const [trueFalseCount, setTrueFalseCount] = useState("2");
  const [fibCount, setFibCount] = useState("1");
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
                  <AISparkles className="w-5 h-5" />
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
              {/* Question Configuration */}
              <div className="space-y-4 bg-card border rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-primary rounded-full" />
                  <h3 className="text-sm font-semibold text-foreground">Question Configuration</h3>
                </div>
                <p className="text-sm text-muted-foreground">Select the number of questions for each type</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  {/* S.C.Q */}
                  <div className="space-y-2">
                    <Label htmlFor="scq" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                      Single Choice
                    </Label>
                    <Select value={scqCount} onValueChange={setScqCount}>
                      <SelectTrigger id="scq" className="w-full bg-background">
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

                  {/* M.C.Q */}
                  <div className="space-y-2">
                    <Label htmlFor="mcq" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                      Multiple Choice
                    </Label>
                    <Select value={mcqCount} onValueChange={setMcqCount}>
                      <SelectTrigger id="mcq" className="w-full bg-background">
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

                  {/* True/False */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="trueFalse"
                      className="text-xs font-semibold text-foreground uppercase tracking-wide"
                    >
                      True/False
                    </Label>
                    <Select value={trueFalseCount} onValueChange={setTrueFalseCount}>
                      <SelectTrigger id="trueFalse" className="w-full bg-background">
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

                  {/* FIB */}
                  <div className="space-y-2">
                    <Label htmlFor="fib" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                      Fill in Blank
                    </Label>
                    <Select value={fibCount} onValueChange={setFibCount}>
                      <SelectTrigger id="fib" className="w-full bg-background">
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
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3 bg-muted/30 rounded-xl p-4 border">
                  <Button onClick={handleRegenerate} disabled={isGenerating} size="lg" className="bg-primary hover:bg-primary/90 shadow-sm">
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Regenerate Quiz
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="lg" onClick={handleAddQuestion} className="shadow-sm text-primary border-primary hover:bg-primary hover:text-primary-foreground">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>

                  <div className="flex items-center gap-3 ml-auto bg-card px-4 py-2 rounded-lg border shadow-sm">
                    <Switch id="specific-instructions" checked={specificInstructions} onCheckedChange={setSpecificInstructions} />
                    <Label htmlFor="specific-instructions" className="text-sm font-medium cursor-pointer">
                      Custom Instructions
                    </Label>
                  </div>
                </div>

                {/* Inclusions and Exclusions */}
                {specificInstructions && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-card border rounded-xl p-4 shadow-sm animate-in fade-in-50 slide-in-from-top-2 duration-200">
                    <div className="space-y-2">
                      <Label htmlFor="inclusions" className="text-sm font-semibold flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        Inclusions
                      </Label>
                      <Textarea
                        id="inclusions"
                        placeholder="Specify topics or concepts to include in questions..."
                        value={inclusions}
                        onChange={(e) => setInclusions(e.target.value)}
                        className="min-h-[100px] resize-none"
                      />
                      <p className="text-xs text-muted-foreground">Topics or concepts that must be covered</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exclusions" className="text-sm font-semibold flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-destructive" />
                        Exclusions
                      </Label>
                      <Textarea
                        id="exclusions"
                        placeholder="Specify topics or concepts to exclude from questions..."
                        value={exclusions}
                        onChange={(e) => setExclusions(e.target.value)}
                        className="min-h-[100px] resize-none"
                      />
                      <p className="text-xs text-muted-foreground">Topics or concepts to avoid</p>
                    </div>
                  </div>
                )}
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
