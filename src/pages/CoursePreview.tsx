import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, BookOpen, Eye, Download, ChevronRight, ChevronDown, Image, FileText, Smartphone, Tablet, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import { ExportCourseDialog } from "@/components/EditCourse/ExportCourseDialog";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";

interface Answer {
  Id?: string;
  Text?: string;
  IsCorrect?: boolean;
  Explanation?: string;
}

interface Question {
  Id?: string;
  Text?: string;
  Type?: string;
  Answers?: Answer[];
}

interface Chapter {
  Id?: string;
  Title?: string;
  Description?: string;
  ImagePath?: string;
  Level?: number;
  TimeSpan?: number;
  Questions?: Question[];
  CourseChapters?: Chapter[];
}

interface CourseData {
  title: string;
  courseIntroduction: string;
  courseImage: string;
  selectedLayout?: string;
  chapters: Chapter[];
}

const CoursePreview = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const location = useLocation();
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [expandedQuiz, setExpandedQuiz] = useState(false);
  const [deviceView, setDeviceView] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [currentLayout, setCurrentLayout] = useState('layout1');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Demo questions showcasing all question types
  const demoQuestions: Question[] = [
    {
      Id: 'demo-scq-1',
      Text: 'What is the capital of France?',
      Type: 'SingleChoice',
      Answers: [
        { Id: 'scq-1-a', Text: 'London', IsCorrect: false },
        { Id: 'scq-1-b', Text: 'Paris', IsCorrect: true, Explanation: 'Paris has been the capital of France since the 12th century.' },
        { Id: 'scq-1-c', Text: 'Berlin', IsCorrect: false },
        { Id: 'scq-1-d', Text: 'Madrid', IsCorrect: false },
      ]
    },
    {
      Id: 'demo-mcq-1',
      Text: 'Which of the following are programming languages? (Select all that apply)',
      Type: 'MultipleChoice',
      Answers: [
        { Id: 'mcq-1-a', Text: 'Python', IsCorrect: true, Explanation: 'Python is a high-level programming language.' },
        { Id: 'mcq-1-b', Text: 'HTML', IsCorrect: false, Explanation: 'HTML is a markup language, not a programming language.' },
        { Id: 'mcq-1-c', Text: 'JavaScript', IsCorrect: true, Explanation: 'JavaScript is a widely-used programming language.' },
        { Id: 'mcq-1-d', Text: 'CSS', IsCorrect: false, Explanation: 'CSS is a styling language, not a programming language.' },
      ]
    },
    {
      Id: 'demo-tf-1',
      Text: 'The Earth revolves around the Sun.',
      Type: 'TrueFalse',
      Answers: [
        { Id: 'tf-1-a', Text: 'True', IsCorrect: true, Explanation: 'The Earth orbits the Sun in approximately 365.25 days.' },
        { Id: 'tf-1-b', Text: 'False', IsCorrect: false },
      ]
    },
    {
      Id: 'demo-fib-1',
      Text: 'The process by which plants make their own food using sunlight is called _______.',
      Type: 'FillInBlank',
      Answers: [
        { Id: 'fib-1-a', Text: 'Photosynthesis', IsCorrect: true, Explanation: 'Photosynthesis is the process where plants convert light energy into chemical energy.' },
      ]
    },
  ];

  useEffect(() => {
    const data = location.state as CourseData;
    if (data) {
      setCourseData(data);
      setCurrentLayout(data.selectedLayout || 'layout1');
      setIsLoading(false);
      // Set first chapter as selected by default and expand first level nodes
      if (data.chapters && data.chapters.length > 0) {
        setSelectedChapter(data.chapters[0]);
        // Auto-expand first level chapters
        const initialExpanded = new Set<string>();
        data.chapters.forEach(ch => {
          if (ch.Id) initialExpanded.add(ch.Id);
        });
        setExpandedNodes(initialExpanded);
      }
    } else {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }, [courseId, location.state]);

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  // Tree Node Component for Preview (View-only)
  interface TreeNodeProps {
    chapter: Chapter;
    level: number;
    selectedId: string | undefined;
    onSelect: (chapter: Chapter) => void;
    expandedNodes: Set<string>;
    onToggle: (id: string) => void;
  }

  const TreeNode = ({ chapter, level, selectedId, onSelect, expandedNodes, onToggle }: TreeNodeProps) => {
    const hasChildren = chapter.CourseChapters && chapter.CourseChapters.length > 0;
    const isExpanded = expandedNodes.has(chapter.Id || "");
    const isSelected = selectedId === chapter.Id;
    const indentPx = level * 12;

    return (
      <div>
        <div 
          className={cn(
            "flex items-start gap-1.5 py-1.5 px-2 pr-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors group",
            isSelected && "bg-primary/10 text-primary font-medium hover:bg-primary/15"
          )}
          style={{ paddingLeft: `${indentPx + 8}px` }}
          onClick={() => onSelect(chapter)}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle(chapter.Id || "");
              }}
              className="p-0.5 hover:bg-muted rounded transition-colors mt-0.5 flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
          ) : (
            <div className="w-4 flex-shrink-0" />
          )}
          <span className={cn(
            "text-sm flex-1 leading-relaxed",
            level === 0 && "font-semibold text-xs uppercase tracking-wide text-foreground/70",
            level === 1 && "font-medium text-foreground/90",
            level === 2 && "text-foreground/85",
            level === 3 && "text-foreground/80 text-xs",
            level === 4 && "text-foreground/75 text-xs",
            level >= 5 && "text-foreground/70 text-[11px]"
          )}>
            {chapter.Title}
          </span>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {(chapter.CourseChapters as Chapter[]).map((child) => (
              <TreeNode
                key={child.Id}
                chapter={child}
                level={level + 1}
                selectedId={selectedId}
                onSelect={onSelect}
                expandedNodes={expandedNodes}
                onToggle={onToggle}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header showTokens tokenCount="932,679" />

      {/* Header Actions */}
      <div className="border-b bg-muted/30 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/edit-course/${courseId}`)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Edit
              </Button>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <span>Home</span>
                <ChevronRight className="w-4 h-4" />
                <span>Edit Course</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-primary font-medium">Preview</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 border rounded-lg p-1 bg-background mr-2">
                <Label className="text-xs font-medium px-2">Layout:</Label>
                <Select value={currentLayout} onValueChange={setCurrentLayout}>
                  <SelectTrigger className="h-8 w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="layout1">Layout 1</SelectItem>
                    <SelectItem value="layout2">Layout 2</SelectItem>
                    <SelectItem value="layout3">Layout 3</SelectItem>
                    <SelectItem value="layout4">Layout 4</SelectItem>
                    <SelectItem value="layout5">Layout 5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-1 border rounded-lg p-1 bg-background">
                <Button
                  variant={deviceView === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDeviceView('mobile')}
                  className="h-8 px-2"
                  title="Mobile View"
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
                <Button
                  variant={deviceView === 'tablet' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDeviceView('tablet')}
                  className="h-8 px-2"
                  title="Tablet View"
                >
                  <Tablet className="w-4 h-4" />
                </Button>
                <Button
                  variant={deviceView === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDeviceView('desktop')}
                  className="h-8 px-2"
                  title="Desktop View"
                >
                  <Monitor className="w-4 h-4" />
                </Button>
              </div>
              <ExportCourseDialog>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export Course
                </Button>
              </ExportCourseDialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden bg-muted/20">
        {/* Layout 1: Classic Sidebar (Current) */}
        {currentLayout === 'layout1' && (
          <div className={cn(
            "w-full flex transition-all duration-300",
            deviceView === 'mobile' && "flex-col overflow-auto",
            deviceView === 'tablet' && "flex-col overflow-auto",
            deviceView === 'desktop' && "flex-row"
          )}>
            {/* Left Sidebar - Course Content Navigation */}
            {courseData?.chapters && courseData.chapters.length > 0 ? (
              <div className={cn(
                "border-r bg-background flex-shrink-0 overflow-hidden",
                deviceView === 'mobile' && "w-full h-[200px]",
                deviceView === 'tablet' && "w-full h-[250px]",
                deviceView === 'desktop' && "w-80 h-[calc(100vh-8rem)] fixed left-0 top-[8rem] z-20"
              )}>
                <div className="h-full flex flex-col">
                  <div className="px-4 py-4 border-b bg-muted/30 flex-shrink-0">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Course Content
                    </h2>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-3 space-y-0.5">
                      {courseData.chapters.map((chapter) => (
                        <TreeNode
                          key={chapter.Id}
                          chapter={chapter}
                          level={0}
                          selectedId={selectedChapter?.Id}
                          onSelect={setSelectedChapter}
                          expandedNodes={expandedNodes}
                          onToggle={toggleNode}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            ) : null}

          {/* Right Side - Course Info and Chapter Details */}
          <div className={cn(
            "flex-1 overflow-auto",
            deviceView === 'desktop' && "ml-80"
          )}>
            <div className={cn(
              "p-4 sm:p-6 lg:p-8 space-y-6",
              deviceView === 'mobile' && "max-w-[375px] mx-auto",
              deviceView === 'tablet' && "max-w-[768px] mx-auto"
            )}>
              {/* Course Header with Introduction */}
              <Card className="p-4 sm:p-6 lg:p-8">
                <div className="space-y-6">
                  {/* Course Title and Image */}
                  <div className={cn(
                    "flex gap-4 sm:gap-6 items-stretch",
                    deviceView === 'mobile' ? "flex-col" : "flex-row"
                  )}>
                    <div className="flex-1 space-y-3 flex flex-col">
                      <h1 className={cn(
                        "font-bold text-foreground leading-tight",
                        deviceView === 'mobile' ? "text-2xl" : deviceView === 'tablet' ? "text-3xl" : "text-3xl lg:text-4xl xl:text-5xl"
                      )}>
                        {courseData?.title || "Course Title"}
                      </h1>
                      
                      {/* Course Overview Card */}
                      <div className="flex-1 bg-gradient-to-br from-muted/50 to-muted/20 rounded-lg p-4 border-2 border-border/50">
                        <div className="flex flex-col gap-3 h-full justify-center">
                          <div className="flex flex-wrap items-center gap-2">
                            {courseData?.chapters && courseData.chapters.length > 0 && (
                              <Badge variant="secondary" className="gap-1.5">
                                <BookOpen className="w-3.5 h-3.5" />
                                {courseData.chapters.length} {courseData.chapters.length === 1 ? 'Chapter' : 'Chapters'}
                              </Badge>
                            )}
                            <Badge variant="outline" className="gap-1.5">
                              <Eye className="w-3.5 h-3.5" />
                              Preview Mode
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {courseData?.courseIntroduction 
                              ? courseData.courseIntroduction.replace(/<[^>]*>/g, '').substring(0, 150) + (courseData.courseIntroduction.length > 150 ? '...' : '')
                              : 'Explore the complete course content, chapters, and interactive quizzes in this preview mode.'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Course Image */}
                    <div className={cn(
                      "flex-shrink-0 self-start",
                      deviceView === 'mobile' ? "w-full max-w-[240px] mx-auto" : "w-[220px]"
                    )}>
                      {courseData?.courseImage ? (
                        <img
                          src={courseData.courseImage}
                          alt={courseData.title}
                          className="w-full aspect-[4/3] object-cover rounded-lg border-2 border-border shadow-lg"
                        />
                      ) : (
                        <div className="w-full aspect-[4/3] rounded-lg border-2 border-dashed border-border bg-muted/30 flex items-center justify-center">
                          <div className="text-center space-y-2">
                            <Image className="w-12 h-12 mx-auto text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground">Course Image</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Course Introduction - Full Width */}
                  {courseData?.courseIntroduction ? (
                    <div
                      className="prose prose-sm sm:prose dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-sm sm:text-base"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(courseData.courseIntroduction) }}
                    />
                  ) : (
                    <div className="prose prose-sm sm:prose dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-sm sm:text-base">
                        <h2>Rational Numbers and Decimal Systems - Foundation Course</h2>
                        <p>
                          Welcome to the exciting world of rational numbers and decimal systems! This foundation course is designed to help you understand the basics of these important mathematical concepts. Whether you are a secondary adult learner or just brushing up on your math skills, this course will guide you through the essential knowledge and comprehension needed to master rational numbers and decimals.
                        </p>
                        
                        <h3>What are Rational Numbers?</h3>
                        <p>
                          Rational numbers are numbers that can be written as a fraction, where both the numerator (top number) and the denominator (bottom number) are integers, and the denominator is not zero. For example, 1/2, -3/4, and 5 (which can be written as 5/1) are all rational numbers. Rational numbers can be positive, negative, or zero.
                        </p>
                        <ul>
                          <li><strong>Knowledge:</strong> Recognize that rational numbers include fractions, whole numbers, and negative numbers.</li>
                          <li><strong>Comprehension:</strong> Understand that any number that can be written as a fraction is a rational number.</li>
                        </ul>
                        
                        <h3>Understanding the Decimal System</h3>
                        <p>
                          The decimal system is a way of writing numbers using place value and the digits 0 to 9. It is based on powers of ten. Decimals are used to represent parts of a whole, just like fractions. For example, the fraction 1/2 can be written as the decimal 0.5.
                        </p>
                        <ul>
                          <li><strong>Knowledge:</strong> Identify the place values in a decimal number, such as tenths, hundredths, and thousandths.</li>
                          <li><strong>Comprehension:</strong> Explain how decimals are another way to show fractions and parts of a whole.</li>
                        </ul>
                        
                        <h3>Connecting Rational Numbers and Decimals</h3>
                        <p>
                          Rational numbers and decimals are closely related. Every rational number can be written as a decimal, and many decimals can be written as fractions. Some decimals end after a few digits (these are called terminating decimals), while others go on forever but repeat a pattern (these are called repeating decimals). For example, 1/4 is 0.25 (terminating), and 1/3 is 0.333... (repeating).
                        </p>
                        <ul>
                          <li><strong>Knowledge:</strong> Know how to convert fractions to decimals and vice versa.</li>
                          <li><strong>Comprehension:</strong> Understand why some decimals terminate and others repeat when converting from fractions.</li>
                        </ul>
                        
                        <h3>Why Are Rational Numbers and Decimals Important?</h3>
                        <p>
                          Rational numbers and decimals are used every day in real life. When you measure ingredients for a recipe, calculate money, or read a thermometer, you are using rational numbers and decimals. Understanding these concepts helps you solve problems, make decisions, and understand the world around you.
                        </p>
                        <ul>
                          <li><strong>Knowledge:</strong> Recognize real-life situations where rational numbers and decimals are used.</li>
                          <li><strong>Comprehension:</strong> Describe how understanding these concepts can help in daily life.</li>
                        </ul>
                        
                        <p>
                          By the end of this foundation course, you will have a strong understanding of rational numbers and the decimal system. You will be able to identify, compare, and convert between fractions and decimals, and apply your knowledge to solve everyday problems. Get ready to explore, learn, and build your confidence in mathematics!
                        </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Selected Chapter Display */}
              {courseData?.chapters && courseData.chapters.length > 0 ? (
                selectedChapter ? (
                  <Card className="p-3 sm:p-4 lg:p-6 xl:p-8">
                    {/* Chapter Header */}
                    <div className="flex items-start justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                          <h2 className={cn(
                            "font-bold leading-tight",
                            deviceView === 'mobile' ? "text-xl" : deviceView === 'tablet' ? "text-2xl" : "text-2xl lg:text-3xl"
                          )}>
                            {selectedChapter.Title}
                          </h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {selectedChapter.Level && (
                            <Badge variant="outline">Level {selectedChapter.Level}</Badge>
                          )}
                          {selectedChapter.TimeSpan && (
                            <span className="text-sm text-muted-foreground">
                              ⏱️ {selectedChapter.TimeSpan} min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Chapter Content */}
                    <div className={cn("grid gap-4 sm:gap-6 mb-6 sm:mb-8", deviceView === 'desktop' ? "lg:grid-cols-3" : deviceView === 'tablet' ? "grid-cols-2" : "grid-cols-1")}>
                      <div className="lg:col-span-2">
                        {selectedChapter.Description ? (
                          <div
                            className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-sm sm:text-base"
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedChapter.Description) }}
                          />
                        ) : (
                          <p className="text-xs sm:text-sm text-muted-foreground italic">
                            Chapter content will be generated here...
                          </p>
                        )}
                      </div>
                      
                      {/* Chapter Image */}
                      {selectedChapter.ImagePath && (
                        <div className="flex justify-center lg:justify-end">
                          <img 
                            src={selectedChapter.ImagePath} 
                            alt={selectedChapter.Title}
                            className="w-full max-w-[180px] sm:max-w-[240px] rounded-lg shadow-lg border-2 border-border object-cover aspect-square"
                          />
                        </div>
                      )}
                    </div>

                    {/* Quiz Section */}
                    {((selectedChapter.Questions && selectedChapter.Questions.length > 0) || demoQuestions.length > 0) && (
                      <Collapsible 
                        open={expandedQuiz} 
                        onOpenChange={setExpandedQuiz}
                      >
                        <div className="pt-6 border-t border-border">
                          <CollapsibleTrigger asChild>
                            <Button variant="outline" className="w-full justify-between mb-6 h-auto py-4">
                              <span className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5" />
                                <span className="font-semibold">Chapter Quiz</span>
                                <Badge variant="secondary" className="ml-2">
                                  {(selectedChapter.Questions && selectedChapter.Questions.length > 0 
                                    ? selectedChapter.Questions.length 
                                    : demoQuestions.length)} {((selectedChapter.Questions?.length || demoQuestions.length) === 1) ? 'Question' : 'Questions'}
                                </Badge>
                              </span>
                              <ChevronRight className={cn(
                                "w-5 h-5 transition-transform",
                                expandedQuiz && "rotate-90"
                              )} />
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-6">
                            {(selectedChapter.Questions && selectedChapter.Questions.length > 0 
                              ? selectedChapter.Questions 
                              : demoQuestions
                            ).map((question, qIndex) => {
                              const questionType = question.Type || 'SingleChoice';
                              const isTrueFalse = questionType === 'TrueFalse' || questionType === 'True/False';
                              const isMultipleChoice = questionType === 'MultipleChoice' || questionType === 'MCQ';
                              const isSingleChoice = questionType === 'SingleChoice' || questionType === 'SCQ';
                              const isFillInBlank = questionType === 'FillInBlank' || questionType === 'FIB';
                              
                              return (
                                <Card key={question.Id || qIndex} className="p-4 bg-gradient-to-br from-background to-muted/20 border-2">
                                  <div className="space-y-4">
                                    {/* Question Header */}
                                    <div className="flex items-start gap-3">
                                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm shrink-0">
                                        {qIndex + 1}
                                      </div>
                                      <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <Badge variant="outline" className="font-medium">
                                            {isTrueFalse && '✓/✗ True/False'}
                                            {isMultipleChoice && '☑ Multiple Choice'}
                                            {isSingleChoice && '◉ Single Choice'}
                                            {isFillInBlank && '__ Fill in the Blank'}
                                          </Badge>
                                        </div>
                                        <p className="text-base font-medium text-foreground leading-relaxed">
                                          {question.Text}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Answer Options based on Question Type */}
                                    {question.Answers && question.Answers.length > 0 && (
                                      <div className="space-y-3 ml-11">
                                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                          {isFillInBlank ? 'Answer:' : 'Options:'}
                                        </p>
                                        <div className="space-y-2">
                                          {isFillInBlank ? (
                                            // Fill in the Blank - Show answer directly
                                            <div className="p-3 rounded-lg border-2 border-primary bg-primary/5">
                                              <p className="text-sm font-medium text-foreground">
                                                {question.Answers.find(a => a.IsCorrect)?.Text || question.Answers[0]?.Text}
                                              </p>
                                            </div>
                                          ) : (
                                            // Multiple Choice, Single Choice, True/False
                                            question.Answers.map((answer, aIndex) => (
                                              <div
                                                key={answer.Id || aIndex}
                                                className={cn(
                                                  "flex items-start space-x-3 p-3 rounded-lg border-2 transition-all",
                                                  answer.IsCorrect
                                                    ? "border-primary bg-primary/5 shadow-sm"
                                                    : "border-border bg-background hover:border-muted-foreground/20"
                                                )}
                                              >
                                                <div className={cn(
                                                  "flex items-center justify-center shrink-0 mt-0.5",
                                                  isMultipleChoice ? "w-6 h-6 rounded border-2" : "w-6 h-6 rounded-full border-2",
                                                  answer.IsCorrect 
                                                    ? "border-primary bg-primary text-primary-foreground"
                                                    : "border-muted-foreground/30 text-muted-foreground",
                                                  isMultipleChoice && "text-xs font-bold",
                                                  !isMultipleChoice && "text-xs font-bold"
                                                )}>
                                                  {isTrueFalse ? (
                                                    answer.Text?.toLowerCase().includes('true') ? 'T' : 'F'
                                                  ) : (
                                                    String.fromCharCode(65 + aIndex)
                                                  )}
                                                </div>
                                                <div className="flex-1">
                                                  <p className={cn(
                                                    "text-sm leading-relaxed",
                                                    answer.IsCorrect ? "font-medium text-foreground" : "text-foreground/80"
                                                  )}>
                                                    {answer.Text}
                                                  </p>
                                                  {answer.IsCorrect && (
                                                    <Badge variant="default" className="mt-2 text-xs">
                                                      ✓ Correct Answer
                                                    </Badge>
                                                  )}
                                                  {answer.Explanation && (
                                                    <p className="text-xs text-muted-foreground mt-2 italic">
                                                      {answer.Explanation}
                                                    </p>
                                                  )}
                                                </div>
                                              </div>
                                            ))
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </Card>
                              );
                            })}
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    )}
                  </Card>
                ) : (
                  <Card className="p-12 text-center border-2 border-dashed">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground italic">
                      Select a chapter to view its content
                    </p>
                  </Card>
                )
              ) : (
                <Card className="p-12 text-center border-2 border-dashed">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground italic">
                    No chapters available yet
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Layout 2: Top Tabs */}
        {currentLayout === 'layout2' && (
          <div className={cn(
            "w-full flex transition-all duration-300",
            deviceView === 'mobile' && "flex-col overflow-auto",
            deviceView === 'tablet' && "flex-col overflow-auto",
            deviceView === 'desktop' && "flex-row"
          )}>
            {/* Left Sidebar - Course Content Navigation */}
            {courseData?.chapters && courseData.chapters.length > 0 ? (
              <div className={cn(
                "border-r bg-background flex-shrink-0 overflow-hidden",
                deviceView === 'mobile' && "w-full h-[200px]",
                deviceView === 'tablet' && "w-full h-[250px]",
                deviceView === 'desktop' && "w-80 h-[calc(100vh-8rem)] fixed left-0 top-[8rem] z-20"
              )}>
                <div className="h-full flex flex-col">
                  <div className="px-4 py-4 border-b bg-muted/30 flex-shrink-0">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Course Content
                    </h2>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-3 space-y-0.5">
                      {courseData.chapters.map((chapter) => (
                        <TreeNode
                          key={chapter.Id}
                          chapter={chapter}
                          level={0}
                          selectedId={selectedChapter?.Id}
                          onSelect={setSelectedChapter}
                          expandedNodes={expandedNodes}
                          onToggle={toggleNode}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            ) : null}

            {/* Main Content - Layout 2 */}
            <div className={cn(
              "flex-1 overflow-auto",
              deviceView === 'desktop' && "ml-80"
            )}>
              <div className={cn(
                "p-4 sm:p-6 lg:p-8 space-y-6",
                deviceView === 'mobile' && "max-w-[375px] mx-auto",
                deviceView === 'tablet' && "max-w-[768px] mx-auto"
              )}>
                {/* Course Header with Introduction */}
                <Card className="p-4 sm:p-6 lg:p-8">
                  <div className="space-y-6">
                    {/* Course Title */}
                    <div className="space-y-3">
                      <h1 className={cn(
                        "font-bold text-foreground leading-tight",
                        deviceView === 'mobile' ? "text-2xl" : deviceView === 'tablet' ? "text-3xl" : "text-3xl lg:text-4xl xl:text-5xl"
                      )}>
                        {courseData?.title || "Course Title"}
                      </h1>
                      
                      {/* Course Overview Card */}
                      <div className="bg-gradient-to-br from-muted/50 to-muted/20 rounded-lg p-4 border-2 border-border/50">
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {courseData?.chapters && courseData.chapters.length > 0 && (
                              <Badge variant="secondary" className="gap-1.5">
                                <BookOpen className="w-3.5 h-3.5" />
                                {courseData.chapters.length} {courseData.chapters.length === 1 ? 'Chapter' : 'Chapters'}
                              </Badge>
                            )}
                            <Badge variant="outline" className="gap-1.5">
                              <Eye className="w-3.5 h-3.5" />
                              Preview Mode
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {courseData?.courseIntroduction 
                              ? courseData.courseIntroduction.replace(/<[^>]*>/g, '').substring(0, 150) + (courseData.courseIntroduction.length > 150 ? '...' : '')
                              : 'Explore the complete course content, chapters, and interactive quizzes in this preview mode.'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Course Introduction - Full Width */}
                    {courseData?.courseIntroduction ? (
                      <div
                        className="prose prose-sm sm:prose dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-sm sm:text-base"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(courseData.courseIntroduction) }}
                      />
                    ) : (
                      <div className="prose prose-sm sm:prose dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-sm sm:text-base">
                        <h2>Rational Numbers and Decimal Systems - Foundation Course</h2>
                        <p>Welcome to the exciting world of rational numbers and decimal systems! This foundation course is designed to help you understand the basics of these important mathematical concepts.</p>
                      </div>
                    )}
                    
                    <Separator />
                    
                    {/* Course Image at Bottom */}
                    <div className="flex justify-center">
                      <div className={cn(
                        deviceView === 'mobile' ? "w-full max-w-[280px]" : "w-[400px]"
                      )}>
                        {courseData?.courseImage ? (
                          <img
                            src={courseData.courseImage}
                            alt={courseData.title}
                            className="w-full aspect-[4/3] object-cover rounded-lg border-2 border-border shadow-lg"
                          />
                        ) : (
                          <div className="w-full aspect-[4/3] rounded-lg border-2 border-dashed border-border bg-muted/30 flex items-center justify-center">
                            <div className="text-center space-y-2">
                              <Image className="w-12 h-12 mx-auto text-muted-foreground/50" />
                              <p className="text-sm text-muted-foreground">Course Image</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Selected Chapter Display */}
                {courseData?.chapters && courseData.chapters.length > 0 ? (
                  selectedChapter ? (
                    <Card className="p-3 sm:p-4 lg:p-6 xl:p-8">
                      {/* Chapter Header */}
                      <div className="flex items-start justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            <h2 className={cn(
                              "font-bold leading-tight",
                              deviceView === 'mobile' ? "text-xl" : deviceView === 'tablet' ? "text-2xl" : "text-2xl lg:text-3xl"
                            )}>
                              {selectedChapter.Title}
                            </h2>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {selectedChapter.Level && (
                              <Badge variant="outline">Level {selectedChapter.Level}</Badge>
                            )}
                            {selectedChapter.TimeSpan && (
                              <span className="text-sm text-muted-foreground">
                                ⏱️ {selectedChapter.TimeSpan} min
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Chapter Content */}
                      <div className={cn("grid gap-4 sm:gap-6 mb-6 sm:mb-8", deviceView === 'desktop' ? "lg:grid-cols-3" : deviceView === 'tablet' ? "grid-cols-2" : "grid-cols-1")}>
                        <div className="lg:col-span-2">
                          {selectedChapter.Description ? (
                            <div
                              className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-sm sm:text-base"
                              dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedChapter.Description) }}
                            />
                          ) : (
                            <p className="text-xs sm:text-sm text-muted-foreground italic">
                              Chapter content will be generated here...
                            </p>
                          )}
                        </div>
                        
                        {/* Chapter Image */}
                        {selectedChapter.ImagePath && (
                          <div className="flex justify-center lg:justify-end">
                            <img 
                              src={selectedChapter.ImagePath} 
                              alt={selectedChapter.Title}
                              className="w-full max-w-[180px] sm:max-w-[240px] rounded-lg shadow-lg border-2 border-border object-cover aspect-square"
                            />
                          </div>
                        )}
                      </div>

                      {/* Quiz Section */}
                      {((selectedChapter.Questions && selectedChapter.Questions.length > 0) || demoQuestions.length > 0) && (
                        <Collapsible 
                          open={expandedQuiz} 
                          onOpenChange={setExpandedQuiz}
                        >
                          <div className="pt-6 border-t border-border">
                            <CollapsibleTrigger asChild>
                              <Button variant="outline" className="w-full justify-between mb-6 h-auto py-4">
                                <span className="flex items-center gap-2">
                                  <BookOpen className="w-5 h-5" />
                                  <span className="font-semibold">Chapter Quiz</span>
                                  <Badge variant="secondary" className="ml-2">
                                    {(selectedChapter.Questions && selectedChapter.Questions.length > 0 
                                      ? selectedChapter.Questions.length 
                                      : demoQuestions.length)} {((selectedChapter.Questions?.length || demoQuestions.length) === 1) ? 'Question' : 'Questions'}
                                  </Badge>
                                </span>
                                <ChevronRight className={cn(
                                  "w-5 h-5 transition-transform",
                                  expandedQuiz && "rotate-90"
                                )} />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-6">
                              {(selectedChapter.Questions && selectedChapter.Questions.length > 0 
                                ? selectedChapter.Questions 
                                : demoQuestions
                              ).map((question, qIndex) => {
                                const questionType = question.Type || 'SingleChoice';
                                const isTrueFalse = questionType === 'TrueFalse' || questionType === 'True/False';
                                const isMultipleChoice = questionType === 'MultipleChoice' || questionType === 'MCQ';
                                const isSingleChoice = questionType === 'SingleChoice' || questionType === 'SCQ';
                                const isFillInBlank = questionType === 'FillInBlank' || questionType === 'FIB';
                                
                                return (
                                  <Card key={question.Id || qIndex} className="p-4 bg-gradient-to-br from-background to-muted/20 border-2">
                                    <div className="space-y-4">
                                      {/* Question Header */}
                                      <div className="flex items-start gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm shrink-0">
                                          {qIndex + 1}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="outline" className="font-medium">
                                              {isTrueFalse && '✓/✗ True/False'}
                                              {isMultipleChoice && '☑ Multiple Choice'}
                                              {isSingleChoice && '◉ Single Choice'}
                                              {isFillInBlank && '__ Fill in the Blank'}
                                            </Badge>
                                          </div>
                                          <p className="text-base font-medium text-foreground leading-relaxed">
                                            {question.Text}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Answer Options */}
                                      {question.Answers && question.Answers.length > 0 && (
                                        <div className="space-y-3 ml-11">
                                          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                            {isFillInBlank ? 'Answer:' : 'Options:'}
                                          </p>
                                          <div className="space-y-2">
                                            {isFillInBlank ? (
                                              <div className="p-3 rounded-lg border-2 border-primary bg-primary/5">
                                                <p className="text-sm font-medium text-foreground">
                                                  {question.Answers.find(a => a.IsCorrect)?.Text || question.Answers[0]?.Text}
                                                </p>
                                              </div>
                                            ) : (
                                              question.Answers.map((answer, aIndex) => (
                                                <div
                                                  key={answer.Id || aIndex}
                                                  className={cn(
                                                    "flex items-start space-x-3 p-3 rounded-lg border-2 transition-all",
                                                    answer.IsCorrect
                                                      ? "border-primary bg-primary/5 shadow-sm"
                                                      : "border-border bg-background hover:border-muted-foreground/20"
                                                  )}
                                                >
                                                  <div className={cn(
                                                    "flex items-center justify-center shrink-0 mt-0.5",
                                                    isMultipleChoice ? "w-6 h-6 rounded border-2" : "w-6 h-6 rounded-full border-2",
                                                    answer.IsCorrect 
                                                      ? "border-primary bg-primary text-primary-foreground"
                                                      : "border-muted-foreground/30 text-muted-foreground",
                                                    "text-xs font-bold"
                                                  )}>
                                                    {isTrueFalse ? (
                                                      answer.Text?.toLowerCase().includes('true') ? 'T' : 'F'
                                                    ) : (
                                                      String.fromCharCode(65 + aIndex)
                                                    )}
                                                  </div>
                                                  <div className="flex-1">
                                                    <p className={cn(
                                                      "text-sm leading-relaxed",
                                                      answer.IsCorrect ? "font-medium text-foreground" : "text-foreground/80"
                                                    )}>
                                                      {answer.Text}
                                                    </p>
                                                    {answer.IsCorrect && (
                                                      <Badge variant="default" className="mt-2 text-xs">
                                                        ✓ Correct Answer
                                                      </Badge>
                                                    )}
                                                    {answer.Explanation && (
                                                      <p className="text-xs text-muted-foreground mt-2 italic">
                                                        {answer.Explanation}
                                                      </p>
                                                    )}
                                                  </div>
                                                </div>
                                              ))
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </Card>
                                );
                              })}
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      )}
                    </Card>
                  ) : (
                    <Card className="p-12 text-center border-2 border-dashed">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground italic">
                        Select a chapter to view its content
                      </p>
                    </Card>
                  )
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Layout 3: Centered Accordion */}
        {currentLayout === 'layout3' && (
          <div className={cn(
            "w-full flex transition-all duration-300",
            deviceView === 'mobile' && "flex-col overflow-auto",
            deviceView === 'tablet' && "flex-col overflow-auto",
            deviceView === 'desktop' && "flex-row"
          )}>
            {/* Left Sidebar - Course Content Navigation */}
            {courseData?.chapters && courseData.chapters.length > 0 ? (
              <div className={cn(
                "border-r bg-background flex-shrink-0 overflow-hidden",
                deviceView === 'mobile' && "w-full h-[200px]",
                deviceView === 'tablet' && "w-full h-[250px]",
                deviceView === 'desktop' && "w-80 h-[calc(100vh-8rem)] fixed left-0 top-[8rem] z-20"
              )}>
                <div className="h-full flex flex-col">
                  <div className="px-4 py-4 border-b bg-muted/30 flex-shrink-0">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Course Content
                    </h2>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-3 space-y-0.5">
                      {courseData.chapters.map((chapter) => (
                        <TreeNode
                          key={chapter.Id}
                          chapter={chapter}
                          level={0}
                          selectedId={selectedChapter?.Id}
                          onSelect={setSelectedChapter}
                          expandedNodes={expandedNodes}
                          onToggle={toggleNode}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            ) : null}

            {/* Main Content - Layout 3 */}
            <div className={cn(
              "flex-1 overflow-auto",
              deviceView === 'desktop' && "ml-80"
            )}>
              <div className={cn(
                "p-4 sm:p-6 lg:p-8 space-y-6",
                deviceView === 'mobile' && "max-w-[375px] mx-auto",
                deviceView === 'tablet' && "max-w-[768px] mx-auto"
              )}>
                {/* Course Header with Introduction - Image at Top */}
                <Card className="p-4 sm:p-6 lg:p-8">
                  <div className="space-y-6">
                    {/* Course Image - Top Center */}
                    {courseData?.courseImage ? (
                      <div className="flex justify-center">
                        <img
                          src={courseData.courseImage}
                          alt={courseData.title}
                          className="w-full max-w-[400px] aspect-[4/3] object-cover rounded-lg border-2 border-border shadow-lg"
                        />
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <div className="w-full max-w-[400px] aspect-[4/3] rounded-lg border-2 border-dashed border-border bg-muted/30 flex items-center justify-center">
                          <div className="text-center space-y-2">
                            <Image className="w-12 h-12 mx-auto text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground">Course Image</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Course Title and Badges */}
                    <div className="space-y-3">
                      <h1 className={cn(
                        "font-bold text-foreground leading-tight text-center",
                        deviceView === 'mobile' ? "text-2xl" : deviceView === 'tablet' ? "text-3xl" : "text-3xl lg:text-4xl xl:text-5xl"
                      )}>
                        {courseData?.title || "Course Title"}
                      </h1>
                      
                      <div className="flex justify-center flex-wrap items-center gap-2">
                        {courseData?.chapters && courseData.chapters.length > 0 && (
                          <Badge variant="secondary" className="gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            {courseData.chapters.length} {courseData.chapters.length === 1 ? 'Chapter' : 'Chapters'}
                          </Badge>
                        )}
                        <Badge variant="outline" className="gap-1.5">
                          <Eye className="w-3.5 h-3.5" />
                          Preview Mode
                        </Badge>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Course Introduction - Full Width */}
                    {courseData?.courseIntroduction ? (
                      <div
                        className="prose prose-sm sm:prose dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-sm sm:text-base"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(courseData.courseIntroduction) }}
                      />
                    ) : (
                      <div className="prose prose-sm sm:prose dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-sm sm:text-base">
                        <h2>Rational Numbers and Decimal Systems - Foundation Course</h2>
                        <p>Welcome to the exciting world of rational numbers and decimal systems!</p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Selected Chapter Display */}
                {courseData?.chapters && courseData.chapters.length > 0 ? (
                  selectedChapter ? (
                    <Card className="p-3 sm:p-4 lg:p-6 xl:p-8">
                      <div className="flex items-start justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            <h2 className={cn(
                              "font-bold leading-tight",
                              deviceView === 'mobile' ? "text-xl" : deviceView === 'tablet' ? "text-2xl" : "text-2xl lg:text-3xl"
                            )}>
                              {selectedChapter.Title}
                            </h2>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {selectedChapter.Level && (
                              <Badge variant="outline">Level {selectedChapter.Level}</Badge>
                            )}
                            {selectedChapter.TimeSpan && (
                              <span className="text-sm text-muted-foreground">
                                ⏱️ {selectedChapter.TimeSpan} min
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className={cn("grid gap-4 sm:gap-6 mb-6 sm:mb-8", deviceView === 'desktop' ? "lg:grid-cols-3" : deviceView === 'tablet' ? "grid-cols-2" : "grid-cols-1")}>
                        <div className="lg:col-span-2">
                          {selectedChapter.Description ? (
                            <div
                              className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-sm sm:text-base"
                              dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedChapter.Description) }}
                            />
                          ) : (
                            <p className="text-xs sm:text-sm text-muted-foreground italic">
                              Chapter content will be generated here...
                            </p>
                          )}
                        </div>
                        
                        {selectedChapter.ImagePath && (
                          <div className="flex justify-center lg:justify-end">
                            <img 
                              src={selectedChapter.ImagePath} 
                              alt={selectedChapter.Title}
                              className="w-full max-w-[180px] sm:max-w-[240px] rounded-lg shadow-lg border-2 border-border object-cover aspect-square"
                            />
                          </div>
                        )}
                      </div>

                      {((selectedChapter.Questions && selectedChapter.Questions.length > 0) || demoQuestions.length > 0) && (
                        <Collapsible 
                          open={expandedQuiz} 
                          onOpenChange={setExpandedQuiz}
                        >
                          <div className="pt-6 border-t border-border">
                            <CollapsibleTrigger asChild>
                              <Button variant="outline" className="w-full justify-between mb-6 h-auto py-4">
                                <span className="flex items-center gap-2">
                                  <BookOpen className="w-5 h-5" />
                                  <span className="font-semibold">Chapter Quiz</span>
                                  <Badge variant="secondary" className="ml-2">
                                    {(selectedChapter.Questions && selectedChapter.Questions.length > 0 
                                      ? selectedChapter.Questions.length 
                                      : demoQuestions.length)} {((selectedChapter.Questions?.length || demoQuestions.length) === 1) ? 'Question' : 'Questions'}
                                  </Badge>
                                </span>
                                <ChevronRight className={cn(
                                  "w-5 h-5 transition-transform",
                                  expandedQuiz && "rotate-90"
                                )} />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-6">
                              {(selectedChapter.Questions && selectedChapter.Questions.length > 0 
                                ? selectedChapter.Questions 
                                : demoQuestions
                              ).map((question, qIndex) => {
                                const questionType = question.Type || 'SingleChoice';
                                const isTrueFalse = questionType === 'TrueFalse' || questionType === 'True/False';
                                const isMultipleChoice = questionType === 'MultipleChoice' || questionType === 'MCQ';
                                const isSingleChoice = questionType === 'SingleChoice' || questionType === 'SCQ';
                                const isFillInBlank = questionType === 'FillInBlank' || questionType === 'FIB';
                                
                                return (
                                  <Card key={question.Id || qIndex} className="p-4 bg-gradient-to-br from-background to-muted/20 border-2">
                                    <div className="space-y-4">
                                      <div className="flex items-start gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm shrink-0">
                                          {qIndex + 1}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="outline" className="font-medium">
                                              {isTrueFalse && '✓/✗ True/False'}
                                              {isMultipleChoice && '☑ Multiple Choice'}
                                              {isSingleChoice && '◉ Single Choice'}
                                              {isFillInBlank && '__ Fill in the Blank'}
                                            </Badge>
                                          </div>
                                          <p className="text-base font-medium text-foreground leading-relaxed">
                                            {question.Text}
                                          </p>
                                        </div>
                                      </div>

                                      {question.Answers && question.Answers.length > 0 && (
                                        <div className="space-y-3 ml-11">
                                          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                            {isFillInBlank ? 'Answer:' : 'Options:'}
                                          </p>
                                          <div className="space-y-2">
                                            {isFillInBlank ? (
                                              <div className="p-3 rounded-lg border-2 border-primary bg-primary/5">
                                                <p className="text-sm font-medium text-foreground">
                                                  {question.Answers.find(a => a.IsCorrect)?.Text || question.Answers[0]?.Text}
                                                </p>
                                              </div>
                                            ) : (
                                              question.Answers.map((answer, aIndex) => (
                                                <div
                                                  key={answer.Id || aIndex}
                                                  className={cn(
                                                    "flex items-start space-x-3 p-3 rounded-lg border-2 transition-all",
                                                    answer.IsCorrect
                                                      ? "border-primary bg-primary/5 shadow-sm"
                                                      : "border-border bg-background hover:border-muted-foreground/20"
                                                  )}
                                                >
                                                  <div className={cn(
                                                    "flex items-center justify-center shrink-0 mt-0.5",
                                                    isMultipleChoice ? "w-6 h-6 rounded border-2" : "w-6 h-6 rounded-full border-2",
                                                    answer.IsCorrect 
                                                      ? "border-primary bg-primary text-primary-foreground"
                                                      : "border-muted-foreground/30 text-muted-foreground",
                                                    "text-xs font-bold"
                                                  )}>
                                                    {isTrueFalse ? (
                                                      answer.Text?.toLowerCase().includes('true') ? 'T' : 'F'
                                                    ) : (
                                                      String.fromCharCode(65 + aIndex)
                                                    )}
                                                  </div>
                                                  <div className="flex-1">
                                                    <p className={cn(
                                                      "text-sm leading-relaxed",
                                                      answer.IsCorrect ? "font-medium text-foreground" : "text-foreground/80"
                                                    )}>
                                                      {answer.Text}
                                                    </p>
                                                    {answer.IsCorrect && (
                                                      <Badge variant="default" className="mt-2 text-xs">
                                                        ✓ Correct Answer
                                                      </Badge>
                                                    )}
                                                    {answer.Explanation && (
                                                      <p className="text-xs text-muted-foreground mt-2 italic">
                                                        {answer.Explanation}
                                                      </p>
                                                    )}
                                                  </div>
                                                </div>
                                              ))
                                            )}
                                          </div>
                        </div>
                                      )}
                                    </div>
                                  </Card>
                                );
                              })}
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      )}
                    </Card>
                  ) : (
                    <Card className="p-12 text-center border-2 border-dashed">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground italic">
                        Select a chapter to view its content
                      </p>
                    </Card>
                  )
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Layout 4: Card Grid */}
        {currentLayout === 'layout4' && (
          <div className={cn(
            "w-full flex transition-all duration-300",
            deviceView === 'mobile' && "flex-col overflow-auto",
            deviceView === 'tablet' && "flex-col overflow-auto",
            deviceView === 'desktop' && "flex-row"
          )}>
            {/* Left Sidebar - Course Content Navigation */}
            {courseData?.chapters && courseData.chapters.length > 0 ? (
              <div className={cn(
                "border-r bg-background flex-shrink-0 overflow-hidden",
                deviceView === 'mobile' && "w-full h-[200px]",
                deviceView === 'tablet' && "w-full h-[250px]",
                deviceView === 'desktop' && "w-80 h-[calc(100vh-8rem)] fixed left-0 top-[8rem] z-20"
              )}>
                <div className="h-full flex flex-col">
                  <div className="px-4 py-4 border-b bg-muted/30 flex-shrink-0">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Course Content
                    </h2>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-3 space-y-0.5">
                      {courseData.chapters.map((chapter) => (
                        <TreeNode
                          key={chapter.Id}
                          chapter={chapter}
                          level={0}
                          selectedId={selectedChapter?.Id}
                          onSelect={setSelectedChapter}
                          expandedNodes={expandedNodes}
                          onToggle={toggleNode}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            ) : null}

            {/* Main Content - Layout 4 */}
            <div className={cn(
              "flex-1 overflow-auto",
              deviceView === 'desktop' && "ml-80"
            )}>
              <div className={cn(
                "p-4 sm:p-6 lg:p-8 space-y-6",
                deviceView === 'mobile' && "max-w-[375px] mx-auto",
                deviceView === 'tablet' && "max-w-[768px] mx-auto"
              )}>
                {/* Course Title Section - Top */}
                <div className="space-y-3 mb-6">
                  <h1 className={cn(
                    "font-bold text-foreground leading-tight",
                    deviceView === 'mobile' ? "text-2xl" : deviceView === 'tablet' ? "text-3xl" : "text-3xl lg:text-4xl xl:text-5xl"
                  )}>
                    {courseData?.title || "Course Title"}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    {courseData?.chapters && courseData.chapters.length > 0 && (
                      <Badge variant="secondary" className="gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        {courseData.chapters.length} {courseData.chapters.length === 1 ? 'Chapter' : 'Chapters'}
                      </Badge>
                    )}
                    <Badge variant="outline" className="gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      Preview Mode
                    </Badge>
                  </div>
                </div>
                
                <Separator className="mb-6" />
                
                {/* Content Section */}
                <div className="space-y-6">
                  
                  {/* Two Cards Side by Side */}
                  <div className={cn(
                    "grid gap-6",
                    deviceView === 'desktop' && "grid-cols-2",
                    deviceView !== 'desktop' && "grid-cols-1"
                  )}>
                    {/* Left Card */}
                    <Card className="p-6">
                      {courseData?.courseIntroduction ? (
                        <div
                          className="prose prose-sm sm:prose dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-sm sm:text-base"
                          dangerouslySetInnerHTML={{ 
                            __html: sanitizeHtml((() => {
                              const tempDiv = document.createElement('div');
                              tempDiv.innerHTML = courseData.courseIntroduction;
                              const paragraphs = Array.from(tempDiv.querySelectorAll('p, h1, h2, h3, h4, h5, h6, ul, ol'));
                              const halfPoint = Math.ceil(paragraphs.length / 2);
                              const firstHalf = paragraphs.slice(0, halfPoint);
                              return firstHalf.map(el => el.outerHTML).join('');
                            })())
                          }}
                        />
                      ) : (
                        <div className="prose prose-sm sm:prose dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-sm sm:text-base">
                          <p>Welcome to the exciting world of rational numbers and decimal systems!</p>
                        </div>
                      )}
                    </Card>

                    {/* Right Card */}
                    <Card className="p-6">
                      {courseData?.courseIntroduction ? (
                        <div
                          className="prose prose-sm sm:prose dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-sm sm:text-base"
                          dangerouslySetInnerHTML={{ 
                            __html: sanitizeHtml((() => {
                              const tempDiv = document.createElement('div');
                              tempDiv.innerHTML = courseData.courseIntroduction;
                              const paragraphs = Array.from(tempDiv.querySelectorAll('p, h1, h2, h3, h4, h5, h6, ul, ol'));
                              const halfPoint = Math.ceil(paragraphs.length / 2);
                              const secondHalf = paragraphs.slice(halfPoint);
                              return secondHalf.map(el => el.outerHTML).join('');
                            })())
                          }}
                        />
                      ) : (
                        <div className="prose prose-sm sm:prose dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-sm sm:text-base">
                          <p>This is an introductory course that will teach you the fundamentals.</p>
                        </div>
                      )}
                    </Card>
                  </div>

                  {/* Course Image - Centered at Bottom */}
                  {courseData?.courseImage ? (
                    <div className="flex justify-center">
                      <img
                        src={courseData.courseImage}
                        alt={courseData.title}
                        className="w-full max-w-[600px] aspect-[4/3] object-cover rounded-lg border-2 border-border shadow-lg"
                      />
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <div className="w-full max-w-[600px] aspect-[4/3] rounded-lg border-2 border-dashed border-border bg-muted/30 flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <Image className="w-12 h-12 mx-auto text-muted-foreground/50" />
                          <p className="text-sm text-muted-foreground">Course Image</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected Chapter Display */}
                {courseData?.chapters && courseData.chapters.length > 0 ? (
                  selectedChapter ? (
                    <Card className="p-3 sm:p-4 lg:p-6 xl:p-8 animate-fade-in">
                      <div className="flex items-start justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            <h2 className={cn(
                              "font-bold leading-tight",
                              deviceView === 'mobile' ? "text-xl" : deviceView === 'tablet' ? "text-2xl" : "text-2xl lg:text-3xl"
                            )}>
                              {selectedChapter.Title}
                            </h2>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {selectedChapter.Level && (
                              <Badge variant="outline">Level {selectedChapter.Level}</Badge>
                            )}
                            {selectedChapter.TimeSpan && (
                              <span className="text-sm text-muted-foreground">
                                ⏱️ {selectedChapter.TimeSpan} min
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className={cn("grid gap-4 sm:gap-6 mb-6 sm:mb-8", deviceView === 'desktop' ? "lg:grid-cols-3" : deviceView === 'tablet' ? "grid-cols-2" : "grid-cols-1")}>
                        <div className="lg:col-span-2">
                          {selectedChapter.Description ? (
                            <div
                              className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-sm sm:text-base"
                              dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedChapter.Description) }}
                            />
                          ) : (
                            <p className="text-xs sm:text-sm text-muted-foreground italic">
                              Chapter content will be generated here...
                            </p>
                          )}
                        </div>
                        
                        {selectedChapter.ImagePath && (
                          <div className="flex justify-center lg:justify-end">
                            <img 
                              src={selectedChapter.ImagePath} 
                              alt={selectedChapter.Title}
                              className="w-full max-w-[180px] sm:max-w-[240px] rounded-lg shadow-lg border-2 border-border object-cover aspect-square"
                            />
                          </div>
                        )}
                      </div>

                      {((selectedChapter.Questions && selectedChapter.Questions.length > 0) || demoQuestions.length > 0) && (
                        <Collapsible 
                          open={expandedQuiz} 
                          onOpenChange={setExpandedQuiz}
                        >
                          <div className="pt-6 border-t border-border">
                            <CollapsibleTrigger asChild>
                              <Button variant="outline" className="w-full justify-between mb-6 h-auto py-4">
                                <span className="flex items-center gap-2">
                                  <BookOpen className="w-5 h-5" />
                                  <span className="font-semibold">Chapter Quiz</span>
                                  <Badge variant="secondary" className="ml-2">
                                    {(selectedChapter.Questions && selectedChapter.Questions.length > 0 
                                      ? selectedChapter.Questions.length 
                                      : demoQuestions.length)} {((selectedChapter.Questions?.length || demoQuestions.length) === 1) ? 'Question' : 'Questions'}
                                  </Badge>
                                </span>
                                <ChevronRight className={cn(
                                  "w-5 h-5 transition-transform",
                                  expandedQuiz && "rotate-90"
                                )} />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-6">
                              {(selectedChapter.Questions && selectedChapter.Questions.length > 0 
                                ? selectedChapter.Questions 
                                : demoQuestions
                              ).map((question, qIndex) => {
                                const questionType = question.Type || 'SingleChoice';
                                const isTrueFalse = questionType === 'TrueFalse' || questionType === 'True/False';
                                const isMultipleChoice = questionType === 'MultipleChoice' || questionType === 'MCQ';
                                const isSingleChoice = questionType === 'SingleChoice' || questionType === 'SCQ';
                                const isFillInBlank = questionType === 'FillInBlank' || questionType === 'FIB';
                                
                                return (
                                  <Card key={question.Id || qIndex} className="p-4 bg-gradient-to-br from-background to-muted/20 border-2">
                                    <div className="space-y-4">
                                      <div className="flex items-start gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm shrink-0">
                                          {qIndex + 1}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="outline" className="font-medium">
                                              {isTrueFalse && '✓/✗ True/False'}
                                              {isMultipleChoice && '☑ Multiple Choice'}
                                              {isSingleChoice && '◉ Single Choice'}
                                              {isFillInBlank && '__ Fill in the Blank'}
                                            </Badge>
                                          </div>
                                          <p className="text-base font-medium text-foreground leading-relaxed">
                                            {question.Text}
                                          </p>
                                        </div>
                                      </div>

                                      {question.Answers && question.Answers.length > 0 && (
                                        <div className="space-y-3 ml-11">
                                          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                            {isFillInBlank ? 'Answer:' : 'Options:'}
                                          </p>
                                          <div className="space-y-2">
                                            {isFillInBlank ? (
                                              <div className="p-3 rounded-lg border-2 border-primary bg-primary/5">
                                                <p className="text-sm font-medium text-foreground">
                                                  {question.Answers.find(a => a.IsCorrect)?.Text || question.Answers[0]?.Text}
                                                </p>
                                              </div>
                                            ) : (
                                              question.Answers.map((answer, aIndex) => (
                                                <div
                                                  key={answer.Id || aIndex}
                                                  className={cn(
                                                    "flex items-start space-x-3 p-3 rounded-lg border-2 transition-all",
                                                    answer.IsCorrect
                                                      ? "border-primary bg-primary/5 shadow-sm"
                                                      : "border-border bg-background hover:border-muted-foreground/20"
                                                  )}
                                                >
                                                  <div className={cn(
                                                    "flex items-center justify-center shrink-0 mt-0.5",
                                                    isMultipleChoice ? "w-6 h-6 rounded border-2" : "w-6 h-6 rounded-full border-2",
                                                    answer.IsCorrect 
                                                      ? "border-primary bg-primary text-primary-foreground"
                                                      : "border-muted-foreground/30 text-muted-foreground",
                                                    "text-xs font-bold"
                                                  )}>
                                                    {isTrueFalse ? (
                                                      answer.Text?.toLowerCase().includes('true') ? 'T' : 'F'
                                                    ) : (
                                                      String.fromCharCode(65 + aIndex)
                                                    )}
                                                  </div>
                                                  <div className="flex-1">
                                                    <p className={cn(
                                                      "text-sm leading-relaxed",
                                                      answer.IsCorrect ? "font-medium text-foreground" : "text-foreground/80"
                                                    )}>
                                                      {answer.Text}
                                                    </p>
                                                    {answer.IsCorrect && (
                                                      <Badge variant="default" className="mt-2 text-xs">
                                                        ✓ Correct Answer
                                                      </Badge>
                                                    )}
                                                    {answer.Explanation && (
                                                      <p className="text-xs text-muted-foreground mt-2 italic">
                                                        {answer.Explanation}
                                                      </p>
                                                    )}
                                                  </div>
                                                </div>
                                              ))
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </Card>
                                );
                              })}
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      )}
                    </Card>
                  ) : (
                    <Card className="p-12 text-center border-2 border-dashed">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground italic">
                        Select a chapter to view its content
                      </p>
                    </Card>
                  )
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Layout 5: Magazine Style */}
        {currentLayout === 'layout5' && (
          <div className={cn(
            "w-full flex transition-all duration-300",
            deviceView === 'mobile' && "flex-col overflow-auto",
            deviceView === 'tablet' && "flex-col overflow-auto",
            deviceView === 'desktop' && "flex-row"
          )}>
            {/* Left Sidebar - Course Content Navigation */}
            {courseData?.chapters && courseData.chapters.length > 0 ? (
              <div className={cn(
                "border-r bg-background flex-shrink-0 overflow-hidden",
                deviceView === 'mobile' && "w-full h-[200px]",
                deviceView === 'tablet' && "w-full h-[250px]",
                deviceView === 'desktop' && "w-80 h-[calc(100vh-8rem)] fixed left-0 top-[8rem] z-20"
              )}>
                <div className="h-full flex flex-col">
                  <div className="px-4 py-4 border-b bg-muted/30 flex-shrink-0">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Course Content
                    </h2>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-3 space-y-0.5">
                      {courseData.chapters.map((chapter) => (
                        <TreeNode
                          key={chapter.Id}
                          chapter={chapter}
                          level={0}
                          selectedId={selectedChapter?.Id}
                          onSelect={setSelectedChapter}
                          expandedNodes={expandedNodes}
                          onToggle={toggleNode}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            ) : null}

            {/* Main Content - Layout 5 */}
            <div className={cn(
              "flex-1 overflow-auto",
              deviceView === 'desktop' && "ml-80"
            )}>
              <div className={cn(
                "p-4 sm:p-6 lg:p-8 space-y-6",
                deviceView === 'mobile' && "max-w-[375px] mx-auto",
                deviceView === 'tablet' && "max-w-[768px] mx-auto"
              )}>
                {/* Course Header - Title at Top, Image Below, Two Column Text */}
                <Card className="p-4 sm:p-6 lg:p-8">
                  <div className="space-y-6">
                    {/* Course Title and Badges - Top */}
                    <div className="space-y-3">
                      <h1 className={cn(
                        "font-bold text-foreground leading-tight",
                        deviceView === 'mobile' ? "text-2xl" : deviceView === 'tablet' ? "text-3xl" : "text-3xl lg:text-4xl xl:text-5xl"
                      )}>
                        {courseData?.title || "Course Title"}
                      </h1>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        {courseData?.chapters && courseData.chapters.length > 0 && (
                          <Badge variant="secondary" className="gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            {courseData.chapters.length} {courseData.chapters.length === 1 ? 'Chapter' : 'Chapters'}
                          </Badge>
                        )}
                        <Badge variant="outline" className="gap-1.5">
                          <Eye className="w-3.5 h-3.5" />
                          Preview Mode
                        </Badge>
                      </div>
                    </div>
                    
                    <Separator />

                    {/* Course Image - Center */}
                    {courseData?.courseImage ? (
                      <div className="flex justify-center">
                        <img
                          src={courseData.courseImage}
                          alt={courseData.title}
                          className="w-full max-w-[400px] aspect-[4/3] object-cover rounded-lg border-2 border-border shadow-lg"
                        />
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <div className="w-full max-w-[400px] aspect-[4/3] rounded-lg border-2 border-dashed border-border bg-muted/30 flex items-center justify-center">
                          <div className="text-center space-y-2">
                            <Image className="w-12 h-12 mx-auto text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground">Course Image</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <Separator />
                    
                    {/* Course Introduction - Two Column on Desktop */}
                    {courseData?.courseIntroduction ? (
                      <div className={cn(
                        "prose prose-sm sm:prose dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-sm sm:text-base",
                        deviceView === 'desktop' && "columns-2 gap-8"
                      )}>
                        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(courseData.courseIntroduction) }} />
                      </div>
                    ) : (
                      <div className={cn(
                        "prose prose-sm sm:prose dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-sm sm:text-base",
                        deviceView === 'desktop' && "columns-2 gap-8"
                      )}>
                        <h2>Rational Numbers and Decimal Systems - Foundation Course</h2>
                        <p>Welcome to the exciting world of rational numbers and decimal systems!</p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Selected Chapter Display */}
                {courseData?.chapters && courseData.chapters.length > 0 ? (
                  selectedChapter ? (
                    <Card className="p-3 sm:p-4 lg:p-6 xl:p-8 animate-fade-in">
                      <div className="flex items-start justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            <h2 className={cn(
                              "font-bold leading-tight",
                              deviceView === 'mobile' ? "text-xl" : deviceView === 'tablet' ? "text-2xl" : "text-2xl lg:text-3xl"
                            )}>
                              {selectedChapter.Title}
                            </h2>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {selectedChapter.Level && (
                              <Badge variant="outline">Level {selectedChapter.Level}</Badge>
                            )}
                            {selectedChapter.TimeSpan && (
                              <span className="text-sm text-muted-foreground">
                                ⏱️ {selectedChapter.TimeSpan} min
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className={cn("grid gap-4 sm:gap-6 mb-6 sm:mb-8", deviceView === 'desktop' ? "lg:grid-cols-3" : deviceView === 'tablet' ? "grid-cols-2" : "grid-cols-1")}>
                        <div className="lg:col-span-2">
                          {selectedChapter.Description ? (
                            <div
                              className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-sm sm:text-base"
                              dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedChapter.Description) }}
                            />
                          ) : (
                            <p className="text-xs sm:text-sm text-muted-foreground italic">
                              Chapter content will be generated here...
                            </p>
                          )}
                        </div>
                        
                        {selectedChapter.ImagePath && (
                          <div className="flex justify-center lg:justify-end">
                            <img 
                              src={selectedChapter.ImagePath} 
                              alt={selectedChapter.Title}
                              className="w-full max-w-[180px] sm:max-w-[240px] rounded-lg shadow-lg border-2 border-border object-cover aspect-square"
                            />
                          </div>
                        )}
                      </div>

                      {((selectedChapter.Questions && selectedChapter.Questions.length > 0) || demoQuestions.length > 0) && (
                        <Collapsible 
                          open={expandedQuiz} 
                          onOpenChange={setExpandedQuiz}
                        >
                          <div className="pt-6 border-t border-border">
                            <CollapsibleTrigger asChild>
                              <Button variant="outline" className="w-full justify-between mb-6 h-auto py-4">
                                <span className="flex items-center gap-2">
                                  <BookOpen className="w-5 h-5" />
                                  <span className="font-semibold">Chapter Quiz</span>
                                  <Badge variant="secondary" className="ml-2">
                                    {(selectedChapter.Questions && selectedChapter.Questions.length > 0 
                                      ? selectedChapter.Questions.length 
                                      : demoQuestions.length)} {((selectedChapter.Questions?.length || demoQuestions.length) === 1) ? 'Question' : 'Questions'}
                                  </Badge>
                                </span>
                                <ChevronRight className={cn(
                                  "w-5 h-5 transition-transform",
                                  expandedQuiz && "rotate-90"
                                )} />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-6">
                              {(selectedChapter.Questions && selectedChapter.Questions.length > 0 
                                ? selectedChapter.Questions 
                                : demoQuestions
                              ).map((question, qIndex) => {
                                const questionType = question.Type || 'SingleChoice';
                                const isTrueFalse = questionType === 'TrueFalse' || questionType === 'True/False';
                                const isMultipleChoice = questionType === 'MultipleChoice' || questionType === 'MCQ';
                                const isSingleChoice = questionType === 'SingleChoice' || questionType === 'SCQ';
                                const isFillInBlank = questionType === 'FillInBlank' || questionType === 'FIB';
                                
                                return (
                                  <Card key={question.Id || qIndex} className="p-4 bg-gradient-to-br from-background to-muted/20 border-2">
                                    <div className="space-y-4">
                                      <div className="flex items-start gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm shrink-0">
                                          {qIndex + 1}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="outline" className="font-medium">
                                              {isTrueFalse && '✓/✗ True/False'}
                                              {isMultipleChoice && '☑ Multiple Choice'}
                                              {isSingleChoice && '◉ Single Choice'}
                                              {isFillInBlank && '__ Fill in the Blank'}
                                            </Badge>
                                          </div>
                                          <p className="text-base font-medium text-foreground leading-relaxed">
                                            {question.Text}
                                          </p>
                                        </div>
                                      </div>

                                      {question.Answers && question.Answers.length > 0 && (
                                        <div className="space-y-3 ml-11">
                                          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                            {isFillInBlank ? 'Answer:' : 'Options:'}
                                          </p>
                                          <div className="space-y-2">
                                            {isFillInBlank ? (
                                              <div className="p-3 rounded-lg border-2 border-primary bg-primary/5">
                                                <p className="text-sm font-medium text-foreground">
                                                  {question.Answers.find(a => a.IsCorrect)?.Text || question.Answers[0]?.Text}
                                                </p>
                                              </div>
                                            ) : (
                                              question.Answers.map((answer, aIndex) => (
                                                <div
                                                  key={answer.Id || aIndex}
                                                  className={cn(
                                                    "flex items-start space-x-3 p-3 rounded-lg border-2 transition-all",
                                                    answer.IsCorrect
                                                      ? "border-primary bg-primary/5 shadow-sm"
                                                      : "border-border bg-background hover:border-muted-foreground/20"
                                                  )}
                                                >
                                                  <div className={cn(
                                                    "flex items-center justify-center shrink-0 mt-0.5",
                                                    isMultipleChoice ? "w-6 h-6 rounded border-2" : "w-6 h-6 rounded-full border-2",
                                                    answer.IsCorrect 
                                                      ? "border-primary bg-primary text-primary-foreground"
                                                      : "border-muted-foreground/30 text-muted-foreground",
                                                    "text-xs font-bold"
                                                  )}>
                                                    {isTrueFalse ? (
                                                      answer.Text?.toLowerCase().includes('true') ? 'T' : 'F'
                                                    ) : (
                                                      String.fromCharCode(65 + aIndex)
                                                    )}
                                                  </div>
                                                  <div className="flex-1">
                                                    <p className={cn(
                                                      "text-sm leading-relaxed",
                                                      answer.IsCorrect ? "font-medium text-foreground" : "text-foreground/80"
                                                    )}>
                                                      {answer.Text}
                                                    </p>
                                                    {answer.IsCorrect && (
                                                      <Badge variant="default" className="mt-2 text-xs">
                                                        ✓ Correct Answer
                                                      </Badge>
                                                    )}
                                                    {answer.Explanation && (
                                                      <p className="text-xs text-muted-foreground mt-2 italic">
                                                        {answer.Explanation}
                                                      </p>
                                                    )}
                                                  </div>
                                                </div>
                                              ))
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </Card>
                                );
                              })}
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      )}
                    </Card>
                  ) : (
                    <Card className="p-12 text-center border-2 border-dashed">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground italic">
                        Select a chapter to view its content
                      </p>
                    </Card>
                  )
                ) : null}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CoursePreview;
