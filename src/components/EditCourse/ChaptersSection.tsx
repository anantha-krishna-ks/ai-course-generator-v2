import { useState } from "react";
import { 
  Edit2, 
  RefreshCw, 
  HelpCircle, 
  Sparkles,
  FileText,
  BookOpen,
  History,
  ChevronRight,
  ChevronDown,
  Home,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CourseChapter } from "@/types/course";
import { ChapterImageDialog } from "./ChapterImageDialog";
import { EditChapterDialog } from "./EditChapterDialog";
import { EditOverviewDialog } from "./EditOverviewDialog";
import { GenerateQuizDialog } from "./GenerateQuizDialog";
import { GenerateChapterDialog } from "./GenerateChapterDialog";
import { ModifyStructureDialog } from "./ModifyStructureDialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Mock version history for chapter images
const mockChapterImageVersions = [
  {
    id: 1,
    imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400",
    prompt: "A modern illustration showing programming concepts with colorful diagrams",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    operation: "Initial image generation for Chapter 1",
    inputTokens: 1250,
    outputTokens: 0
  },
  {
    id: 2,
    imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400",
    prompt: "Programming statements and code blocks with syntax highlighting",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    operation: "Regenerated with more technical focus",
    inputTokens: 1180,
    outputTokens: 0
  },
  {
    id: 3,
    imageUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400",
    prompt: "Abstract coding concept with laptop and code editor",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    operation: "Updated image style to abstract theme",
    inputTokens: 1320,
    outputTokens: 0
  }
];

// Mock overview version history
const mockOverviewVersions = [
  {
    id: 1,
    content: "<p>This chapter covers fundamental programming statements including variables, input/output operations, and basic syntax.</p>",
    inclusions: "Variables, I/O operations, basic syntax",
    exclusions: "Advanced topics, OOP concepts",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    operation: "Current version"
  },
  {
    id: 2,
    content: "<p>Learn about programming statements, variables, and basic input/output in this introductory chapter.</p>",
    inclusions: "Programming statements, variables",
    exclusions: "Complex examples",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    operation: "Updated with more detail"
  },
  {
    id: 3,
    content: "<p>Introduction to programming statements and fundamental concepts.</p>",
    inclusions: "Basic statements",
    exclusions: "",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    operation: "Initial overview generation"
  }
];

// Mock chapter data with modules and topics
export const mockChapters: CourseChapter[] = [
  {
    Id: "preface",
    Title: "Preface",
    Description: "An introductory section that provides context and background for the course material.",
    Level: 0,
    CourseChapters: []
  },
  {
    Id: "ch1",
    Title: "Chapter 1: Statements",
    Description: "This chapter covers fundamental programming statements including variables, input/output operations, and basic syntax.",
    Level: 1,
    ImagePath: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400",
    Questions: [{ Id: "q1", Text: "What is a variable?" }],
    CourseChapters: [
      {
        Id: "ch1-m1",
        Title: "Module 1.1: Introduction to Programming",
        Description: "Basic concepts of programming and computational thinking.",
        Level: 2,
        ImagePath: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400",
        Questions: [{ Id: "q2", Text: "What is programming?" }],
        CourseChapters: [
          {
            Id: "ch1-m1-t1",
            Title: "Topic 1.1.1: What is Programming",
            Description: "Understanding the fundamentals of programming and how computers execute instructions.",
            Level: 3,
            Questions: [{ Id: "q3", Text: "Define programming" }],
            CourseChapters: [
              {
                Id: "ch1-m1-t1-st1",
                Title: "Sub-Topic 1.1.1.1: Programming Fundamentals",
                Description: "Core concepts of programming logic and structure.",
                Level: 4,
                CourseChapters: [
                  {
                    Id: "ch1-m1-t1-st1-lo1",
                    Title: "Learning Outcome 1.1.1.1.1: Understanding Algorithms",
                    Description: "Students will be able to explain what an algorithm is and provide examples.",
                    Level: 5,
                    Questions: [{ Id: "q3a", Text: "What is an algorithm?" }],
                    CourseChapters: []
                  },
                  {
                    Id: "ch1-m1-t1-st1-lo2",
                    Title: "Learning Outcome 1.1.1.1.2: Computational Thinking",
                    Description: "Apply computational thinking to break down problems into smaller steps.",
                    Level: 5,
                    CourseChapters: []
                  }
                ]
              },
              {
                Id: "ch1-m1-t1-st2",
                Title: "Sub-Topic 1.1.1.2: Programming Paradigms",
                Description: "Overview of different programming paradigms and approaches.",
                Level: 4,
                CourseChapters: [
                  {
                    Id: "ch1-m1-t1-st2-lo1",
                    Title: "Learning Outcome 1.1.1.2.1: Procedural vs Object-Oriented",
                    Description: "Compare and contrast procedural and object-oriented programming.",
                    Level: 5,
                    CourseChapters: []
                  }
                ]
              }
            ]
          },
          {
            Id: "ch1-m1-t2",
            Title: "Topic 1.1.2: Programming Languages",
            Description: "Overview of different programming languages and their use cases.",
            Level: 3,
            ImagePath: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400",
            CourseChapters: []
          }
        ]
      },
      {
        Id: "ch1-m2",
        Title: "Module 1.2: Variables and Data Types",
        Description: "Learn about variables, data types, and how to store information.",
        Level: 2,
        Questions: [{ Id: "q4", Text: "What are data types?" }],
        CourseChapters: [
          {
            Id: "ch1-m2-t1",
            Title: "Topic 1.2.1: Variable Declaration",
            Description: "How to declare and initialize variables in programming.",
            Level: 3,
            ImagePath: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400",
            Questions: [{ Id: "q5", Text: "How do you declare a variable?" }],
            CourseChapters: []
          },
          {
            Id: "ch1-m2-t2",
            Title: "Topic 1.2.2: Primitive Data Types",
            Description: "Understanding integers, floats, strings, and booleans.",
            Level: 3,
            Questions: [{ Id: "q6", Text: "List primitive data types" }],
            CourseChapters: []
          },
          {
            Id: "ch1-m2-t3",
            Title: "Topic 1.2.3: Type Conversion",
            Description: "Converting between different data types.",
            Level: 3,
            ImagePath: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
            CourseChapters: []
          }
        ]
      },
      {
        Id: "ch1-m3",
        Title: "Module 1.3: Input and Output",
        Description: "Working with user input and displaying output.",
        Level: 2,
        ImagePath: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=400",
        CourseChapters: [
          {
            Id: "ch1-m3-t1",
            Title: "Topic 1.3.1: Console Output",
            Description: "Printing information to the console.",
            Level: 3,
            Questions: [{ Id: "q7", Text: "How to print output?" }],
            CourseChapters: []
          },
          {
            Id: "ch1-m3-t2",
            Title: "Topic 1.3.2: User Input",
            Description: "Reading input from users.",
            Level: 3,
            ImagePath: "https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=400",
            Questions: [{ Id: "q8", Text: "How to get user input?" }],
            CourseChapters: []
          }
        ]
      }
    ] as any
  },
  {
    Id: "ch2",
    Title: "Chapter 2: Expressions",
    Description: "Learn about mathematical and logical expressions, operators, and how to build complex expressions.",
    Level: 1,
    ImagePath: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400",
    CourseChapters: [
      {
        Id: "ch2-m1",
        Title: "Module 2.1: Arithmetic Operators",
        Description: "Basic mathematical operations in programming.",
        Level: 2,
        Questions: [{ Id: "q9", Text: "What are operators?" }],
        CourseChapters: []
      },
      {
        Id: "ch2-m2",
        Title: "Module 2.2: Logical Operators",
        Description: "Boolean logic and comparison operators.",
        Level: 2,
        ImagePath: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400",
        CourseChapters: []
      }
    ] as any
  },
  {
    Id: "ch3",
    Title: "Chapter 3: Objects",
    Description: "Introduction to object-oriented programming concepts, classes, and objects.",
    Level: 1,
    CourseChapters: []
  },
  {
    Id: "ch4",
    Title: "Chapter 4: Decisions",
    Description: "Control flow and decision-making structures including if-else statements and switch cases.",
    Level: 1,
    CourseChapters: []
  },
  {
    Id: "ch5",
    Title: "Chapter 5: Loops",
    Description: "Iteration and looping constructs for repetitive tasks and data processing.",
    Level: 1,
    CourseChapters: []
  },
  {
    Id: "ch6",
    Title: "Chapter 6: Functions",
    Description: "Creating reusable code blocks, function parameters, return values, and best practices.",
    Level: 1,
    CourseChapters: []
  },
  {
    Id: "ch7",
    Title: "Chapter 7: Modules",
    Description: "Organizing code into modules, importing and exporting functionality.",
    Level: 1,
    CourseChapters: []
  }
];

// Sub-sections for Chapter 1
const chapter1Subsections = [
  { id: "ch1-intro", title: "Introduction" },
  { id: "ch1-1", title: "1.1 Background" },
  { id: "ch1-2", title: "1.2 Input/output" },
  { id: "ch1-3", title: "1.3 Variables" },
  { id: "ch1-4", title: "1.4 String basics" },
  { id: "ch1-5", title: "1.5 Number basics" },
  { id: "ch1-6", title: "1.6 Error messages" },
  { id: "ch1-7", title: "1.7 Comments" },
  { id: "ch1-8", title: "1.8 Why Python?" },
  { id: "ch1-9", title: "1.9 Chapter summary" }
];

interface ChaptersSectionProps {
  onEditChapter?: (chapterId: string) => void;
  onRegenerateImage?: (chapterId: string) => void;
  onGenerateQuiz?: (chapterId: string) => void;
  onGenerateCompleteChapter?: (chapterId: string) => void;
}

// Tree Node Component
interface TreeNodeProps {
  chapter: CourseChapter;
  level: number;
  selectedId: string | undefined;
  onSelect: (chapter: CourseChapter) => void;
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
          {(chapter.CourseChapters as CourseChapter[]).map((child) => (
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

export const ChaptersSection = ({
  onEditChapter,
  onRegenerateImage,
  onGenerateQuiz,
  onGenerateCompleteChapter
}: ChaptersSectionProps) => {
  const [selectedChapter, setSelectedChapter] = useState<CourseChapter | null>(mockChapters[1]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["ch1", "ch1-m1", "ch1-m2"]));
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isEditChapterDialogOpen, setIsEditChapterDialogOpen] = useState(false);
  const [isEditOverviewDialogOpen, setIsEditOverviewDialogOpen] = useState(false);
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const [isGenerateChapterDialogOpen, setIsGenerateChapterDialogOpen] = useState(false);
  const [isGeneratingChapter, setIsGeneratingChapter] = useState(false);
  const [chapterImageVersions, setChapterImageVersions] = useState(mockChapterImageVersions);
  const [overviewVersions, setOverviewVersions] = useState(mockOverviewVersions);
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);
  const [isModifyStructureDialogOpen, setIsModifyStructureDialogOpen] = useState(false);
  const { toast } = useToast();

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  // Build breadcrumb path
  const buildBreadcrumb = (chapter: CourseChapter | null): CourseChapter[] => {
    if (!chapter) return [];
    
    const path: CourseChapter[] = [];
    const findPath = (chapters: CourseChapter[], targetId: string, currentPath: CourseChapter[]): boolean => {
      for (const ch of chapters) {
        const newPath = [...currentPath, ch];
        if (ch.Id === targetId) {
          path.push(...newPath);
          return true;
        }
        if (ch.CourseChapters && Array.isArray(ch.CourseChapters) && ch.CourseChapters.length > 0) {
          const childChapters = ch.CourseChapters as CourseChapter[];
          if (findPath(childChapters, targetId, newPath)) {
            return true;
          }
        }
      }
      return false;
    };
    
    findPath(mockChapters, chapter.Id || "", []);
    return path;
  };

  const breadcrumb = buildBreadcrumb(selectedChapter);

  const handleSaveChapterTitle = (newTitle: string) => {
    toast({
      title: "Chapter Updated",
      description: `Chapter title has been updated to "${newTitle}"`,
    });
    onEditChapter?.(selectedChapter?.Id || "");
  };

  const handleSaveOverview = (data: { content: string; inclusions: string; exclusions: string }) => {
    toast({
      title: "Overview Saved",
      description: "Chapter overview has been successfully updated.",
    });
    // Here you would typically save the data
    console.log("Saved overview data:", data);
  };

  const handleRegenerateContent = () => {
    setIsGeneratingChapter(true);
    toast({
      title: "Generating Chapter",
      description: "Chapter content is being generated...",
    });
    
    // Simulate chapter generation
    setTimeout(() => {
      setIsGeneratingChapter(false);
      setIsGenerateChapterDialogOpen(false);
      toast({
        title: "Chapter Generated",
        description: "Chapter content has been successfully generated.",
      });
      onGenerateCompleteChapter?.(selectedChapter?.Id || "");
    }, 5000);
  };

  const handleRestoreOverviewVersion = (versionId: number) => {
    toast({
      title: "Version Restored",
      description: "Overview has been restored to the selected version.",
    });
    console.log("Restored overview version:", versionId);
  };

  const handleViewImageVersion = (versionId: number) => {
    const version = chapterImageVersions.find(v => v.id === versionId);
    if (version) {
      toast({
        title: "Viewing Version",
        description: `Version from ${new Date(version.timestamp).toLocaleString()}`,
      });
    }
  };

  const handleRestoreImageVersion = (versionId: number) => {
    toast({
      title: "Version Restored",
      description: "Image version has been restored successfully.",
    });
  };

  const handleRegenerateImage = () => {
    setIsRegeneratingImage(true);
    toast({
      title: "Regenerating Image",
      description: "Creating a new image for this chapter...",
    });

    // Simulate image regeneration with AI
    setTimeout(() => {
      // Mock: Update with a new image from unsplash
      const newImageUrls = [
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400",
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400",
      ];
      const randomImage = newImageUrls[Math.floor(Math.random() * newImageUrls.length)];
      
      // Update the selected chapter's image
      if (selectedChapter) {
        setSelectedChapter({
          ...selectedChapter,
          ImagePath: randomImage
        });
        
        // Add to version history
        const newVersion = {
          id: chapterImageVersions.length + 1,
          imageUrl: randomImage,
          prompt: "Regenerated programming concepts illustration",
          timestamp: new Date().toISOString(),
          operation: "AI image regeneration",
          inputTokens: 1400,
          outputTokens: 0
        };
        setChapterImageVersions([newVersion, ...chapterImageVersions]);
      }
      
      setIsRegeneratingImage(false);
      toast({
        title: "Image Regenerated",
        description: "New chapter image has been created successfully.",
      });
      onRegenerateImage?.(selectedChapter?.Id || "");
    }, 3000);
  };


  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full">
      {/* Left Sidebar - Tree Navigation */}
      <div className="lg:w-[280px] flex-shrink-0">
        <div className="bg-background/90 backdrop-blur-sm rounded-xl border border-border overflow-hidden h-[500px] lg:h-[700px] flex flex-col">
          <div className="px-3 py-2.5 border-b bg-muted/30 flex-shrink-0 flex items-center justify-between">
            <h3 className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
              <BookOpen className="w-3.5 h-3.5" />
              Course Structure
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsModifyStructureDialogOpen(true)}
              className="h-7 px-2 text-xs gap-1.5 hover:bg-accent hover:text-accent-foreground"
            >
              <Settings className="w-3.5 h-3.5" />
              Modify
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-1.5">
              {mockChapters.map((chapter) => (
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

      {/* Right Content Display - Detail Panel */}
      <div className="flex-1 min-w-0">
        {selectedChapter ? (
          <div className="bg-background/90 backdrop-blur-sm rounded-xl border border-border overflow-hidden">
            {/* Breadcrumb Navigation */}
            <div className="px-4 sm:px-6 py-3 border-b bg-muted/30 flex items-center gap-2 overflow-x-auto">
              <Home className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              {breadcrumb.length > 0 ? (
                breadcrumb.map((crumb, index) => (
                  <div key={crumb.Id} className="flex items-center gap-2 flex-shrink-0">
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    <button
                      onClick={() => setSelectedChapter(crumb)}
                      className={cn(
                        "text-xs hover:underline transition-colors",
                        index === breadcrumb.length - 1 
                          ? "font-medium text-foreground" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {crumb.Title}
                    </button>
                  </div>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">No selection</span>
              )}
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              {/* Chapter Header */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-2xl sm:text-3xl font-bold">
                      {selectedChapter.Title}
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => setIsEditChapterDialogOpen(true)}
                    >
                      <Edit2 className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="px-2 py-1 rounded-md bg-muted">Level {selectedChapter.Level}</span>
                    {selectedChapter.CourseChapters && selectedChapter.CourseChapters.length > 0 && (
                      <span className="px-2 py-1 rounded-md bg-muted">
                        {selectedChapter.CourseChapters.length} sub-item{selectedChapter.CourseChapters.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Chapter Content */}
              {isGeneratingChapter ? (
              <div className="grid lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="flex justify-center lg:justify-end">
                  <div className="space-y-2">
                    <Skeleton className="w-full max-w-[240px] h-[240px] rounded-lg" />
                    <div className="flex gap-2">
                      <Skeleton className="h-9 flex-1" />
                      <Skeleton className="h-9 flex-1" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                      {selectedChapter.Description}
                    </p>
                  </div>
                </div>
                
                {/* Chapter Image */}
                {selectedChapter.ImagePath && (
                  <div className="flex justify-center lg:justify-end">
                    <div className="space-y-2">
                      {isRegeneratingImage ? (
                        <div className="w-full max-w-[240px] h-[240px] rounded-lg border-2 border-border overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                          <div className="relative w-full h-full flex items-center justify-center">
                            {/* Animated gradient background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 animate-pulse" />
                            
                            {/* Sparkles animation */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Sparkles className="w-16 h-16 text-blue-500 dark:text-blue-400 animate-pulse" />
                            </div>
                            
                            {/* Loading text */}
                            <div className="absolute bottom-4 left-0 right-0 text-center">
                              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 animate-pulse">
                                Generating with AI...
                              </p>
                            </div>
                            
                            {/* Rotating border effect */}
                            <div className="absolute inset-0 rounded-lg animate-spin" style={{ animationDuration: '3s' }}>
                              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-blue-500 rounded-tl-lg" />
                              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-purple-500 rounded-tr-lg" />
                              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-purple-500 rounded-bl-lg" />
                              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-blue-500 rounded-br-lg" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img 
                          src={selectedChapter.ImagePath} 
                          alt={selectedChapter.Title}
                          className="w-full max-w-[240px] rounded-lg shadow-lg border-2 border-border object-cover aspect-square animate-fade-in"
                        />
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 disabled:opacity-50"
                          onClick={handleRegenerateImage}
                          disabled={isRegeneratingImage}
                        >
                          <RefreshCw className={`w-4 h-4 ${isRegeneratingImage ? 'animate-spin' : ''}`} />
                          {isRegeneratingImage ? 'Generating...' : 'Regenerate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
                          onClick={() => setIsImageDialogOpen(true)}
                        >
                          <History className="w-4 h-4" />
                          Versions
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setIsEditOverviewDialogOpen(true)}
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Overview
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setIsQuizDialogOpen(true)}
                >
                  <HelpCircle className="w-4 h-4" />
                  Generate Quiz
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setIsGenerateChapterDialogOpen(true)}
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Complete Chapter
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-background/80 backdrop-blur-sm rounded-xl p-8 border border-border/30 text-center">
            <p className="text-muted-foreground">Select a chapter to view details</p>
          </div>
        )}
      </div>

      {/* Chapter Image Dialog with Versioning */}
      {selectedChapter && (
        <ChapterImageDialog
          open={isImageDialogOpen}
          onClose={() => setIsImageDialogOpen(false)}
          chapterTitle={selectedChapter.Title || ""}
          versionHistory={chapterImageVersions}
          onViewVersion={handleViewImageVersion}
          onRestoreVersion={handleRestoreImageVersion}
        />
      )}

      {/* Edit Chapter Dialog */}
      {selectedChapter && (
        <EditChapterDialog
          open={isEditChapterDialogOpen}
          onClose={() => setIsEditChapterDialogOpen(false)}
          chapterTitle={selectedChapter.Title || ""}
          onSave={handleSaveChapterTitle}
        />
      )}

      {/* Edit Overview Dialog */}
      {selectedChapter && (
        <EditOverviewDialog
          open={isEditOverviewDialogOpen}
          onClose={() => setIsEditOverviewDialogOpen(false)}
          chapterTitle={selectedChapter.Title || ""}
          overviewText={selectedChapter.Description || ""}
          versionHistory={overviewVersions}
          onSave={handleSaveOverview}
          onRegenerate={handleRegenerateContent}
          onRestoreVersion={handleRestoreOverviewVersion}
        />
      )}

      {/* Generate Quiz Dialog */}
      {selectedChapter && (
        <GenerateQuizDialog
          open={isQuizDialogOpen}
          onClose={() => setIsQuizDialogOpen(false)}
          chapterTitle={selectedChapter.Title || ""}
          chapterId={selectedChapter.Id}
        />
      )}

      {/* Generate Chapter Dialog */}
      <GenerateChapterDialog
        open={isGenerateChapterDialogOpen}
        onOpenChange={setIsGenerateChapterDialogOpen}
        onConfirm={handleRegenerateContent}
        isGenerating={isGeneratingChapter}
      />

      {/* Modify Structure Dialog */}
      <ModifyStructureDialog
        open={isModifyStructureDialogOpen}
        onOpenChange={setIsModifyStructureDialogOpen}
      />
    </div>
  );
};
