import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Layout, Sparkles, Settings, Home, ChevronRight, Search, ChevronDown, KeyRound, Shield, LogOut, FileText, Image as ImageIcon, HelpCircle, FileCheck, Layers, Users, Info, Check, Upload, X, Plus, Minus, Trash2, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { courseApi } from "@/services/courseApi";
import type { CourseCreateRequest } from "@/types/course";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/Header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import logo from "@/assets/logo.png";
import { ModifyStructureDialog } from "@/components/EditCourse/ModifyStructureDialog";

const layoutTemplates = [
  { id: "layout1", preview: "Layout 1" },
  { id: "layout2", preview: "Layout 2" },
  { id: "layout3", preview: "Layout 3" },
  { id: "layout4", preview: "Layout 4" },
  { id: "layout5", preview: "Layout 5" },
];

const blueprints = [
  {
    id: "1",
    title: "Budgeting in Management",
    units: 5,
    generated: "Manual",
    date: "07-10-2025",
  },
  {
    id: "2",
    title: "Carbon Accounting",
    units: 5,
    generated: "Using AI",
    date: "06-10-2025",
  },
  {
    id: "3",
    title: "RAG Relevance in Corporate World",
    units: 6,
    generated: "Using AI",
    date: "29-09-2025",
  },
  {
    id: "4",
    title: "MGMT-0409",
    units: 22,
    generated: "From Documents",
    date: "04-09-2025",
  },
  {
    id: "5",
    title: "Reinforcement Learning",
    units: 5,
    generated: "From Structured File",
    date: "04-09-2025",
  },
];

const CreateCourse = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [selectedLayout, setSelectedLayout] = useState("layout1");
  const [generateOption, setGenerateOption] = useState("structure");
  const [structureOption, setStructureOption] = useState("blueprint");
  const [isBlueprintDialogOpen, setIsBlueprintDialogOpen] = useState(false);
  const [selectedBlueprint, setSelectedBlueprint] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showCourseUnitsDialog, setShowCourseUnitsDialog] = useState(false);
  
  // Course units state
  const [courseUnits, setCourseUnits] = useState({
    chapters: 0,
    modulesPerChapter: 0,
    topicsPerModule: 0,
    subtopicsPerTopic: 0,
    learningOutcomesPerSubtopic: 0,
  });

  // Track which hierarchy levels are active
  const [activeLevels, setActiveLevels] = useState({
    chapters: true,
    modulesPerChapter: false,
    topicsPerModule: false,
    subtopicsPerTopic: false,
    learningOutcomesPerSubtopic: false,
  });

  // Track if hierarchy has been saved
  const [hierarchySaved, setHierarchySaved] = useState(false);
  
  // Preferences state
  const [contentDuration, setContentDuration] = useState("complete");
  const [chapterSpanTime, setChapterSpanTime] = useState("60");
  const [imageGeneration, setImageGeneration] = useState("none");
  const [questionGeneration, setQuestionGeneration] = useState("none");
  const [scormHierarchy, setScormHierarchy] = useState("course");
  const [scqCount, setScqCount] = useState("20");
  const [mcqCount, setMcqCount] = useState("20");
  const [trueFalseCount, setTrueFalseCount] = useState("5");
  const [fibCount, setFibCount] = useState("5");
  
  // Question counts per level for specific unit
  const [levelQuestionCounts, setLevelQuestionCounts] = useState<{
    [key: string]: {
      scq: string;
      mcq: string;
      trueFalse: string;
      fib: string;
    }
  }>({
    chapter: { scq: "3", mcq: "3", trueFalse: "2", fib: "2" },
    module: { scq: "3", mcq: "3", trueFalse: "2", fib: "2" },
    topic: { scq: "3", mcq: "3", trueFalse: "2", fib: "2" },
    subtopic: { scq: "3", mcq: "3", trueFalse: "2", fib: "2" },
    learningOutcome: { scq: "3", mcq: "3", trueFalse: "2", fib: "2" }
  });
  const [applyBloomsTaxonomy, setApplyBloomsTaxonomy] = useState(true);
  const [generateCompleteCourse, setGenerateCompleteCourse] = useState(false);
  const [bloomsKnowledge, setBloomsKnowledge] = useState(true);
  const [bloomsComprehension, setBloomsComprehension] = useState(true);
  const [bloomsApplication, setBloomsApplication] = useState(false);
  const [bloomsAnalysis, setBloomsAnalysis] = useState(false);
  const [bloomsSynthesis, setBloomsSynthesis] = useState(false);
  const [bloomsEvaluation, setBloomsEvaluation] = useState(false);
  const [undergraduates, setUndergraduates] = useState(true);
  const [graduates, setGraduates] = useState(true);
  const [postgraduates, setPostgraduates] = useState(false);
  const [guidelines, setGuidelines] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [guidelinesFiles, setGuidelinesFiles] = useState<File[]>([]);
  const [exclusionsFiles, setExclusionsFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState("course-details");
  const [isGuidelinesHelpOpen, setIsGuidelinesHelpOpen] = useState(false);
  const [isExclusionsHelpOpen, setIsExclusionsHelpOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isGeneratingDialogOpen, setIsGeneratingDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModifyStructureDialogOpen, setIsModifyStructureDialogOpen] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadedFiles(prev => [...prev, ...Array.from(files)]);
      toast({
        title: "Documents Uploaded",
        description: `${files.length} document(s) uploaded successfully.`,
      });
    }
  };

  const removeFile = (indexToRemove: number) => {
    setUploadedFiles(uploadedFiles.filter((_, index) => index !== indexToRemove));
    toast({
      title: "File Removed",
      description: "The file has been removed successfully.",
    });
  };

  const handleGuidelinesFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setGuidelinesFiles(prev => [...prev, ...Array.from(files)]);
      toast({
        title: "Guidelines Documents Uploaded",
        description: `${files.length} document(s) uploaded successfully.`,
      });
    }
  };

  const removeGuidelinesFile = (indexToRemove: number) => {
    setGuidelinesFiles(guidelinesFiles.filter((_, index) => index !== indexToRemove));
    toast({
      title: "File Removed",
      description: "The file has been removed successfully.",
    });
  };

  const handleExclusionsFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setExclusionsFiles(prev => [...prev, ...Array.from(files)]);
      toast({
        title: "Exclusions Documents Uploaded",
        description: `${files.length} document(s) uploaded successfully.`,
      });
    }
  };

  const removeExclusionsFile = (indexToRemove: number) => {
    setExclusionsFiles(exclusionsFiles.filter((_, index) => index !== indexToRemove));
    toast({
      title: "File Removed",
      description: "The file has been removed successfully.",
    });
  };

  const updateCourseUnit = (field: keyof typeof courseUnits, increment: boolean) => {
    setCourseUnits(prev => ({
      ...prev,
      [field]: Math.max(0, prev[field] + (increment ? 1 : -1))
    }));
  };

  const deleteLevel = (level: keyof typeof activeLevels) => {
    if (level === 'chapters') return;
    
    setCourseUnits(prev => ({ ...prev, [level]: 0 }));
    
    setActiveLevels(prev => {
      const newLevels = { ...prev };
      const levelOrder: (keyof typeof activeLevels)[] = [
        'chapters',
        'modulesPerChapter',
        'topicsPerModule',
        'subtopicsPerTopic',
        'learningOutcomesPerSubtopic'
      ];
      
      const currentIndex = levelOrder.indexOf(level);
      for (let i = currentIndex; i < levelOrder.length; i++) {
        newLevels[levelOrder[i]] = false;
        if (i > currentIndex) {
          setCourseUnits(prev => ({ ...prev, [levelOrder[i]]: 0 }));
        }
      }
      
      return newLevels;
    });

    toast({
      title: "Level Removed",
      description: "Hierarchy level and dependent levels have been removed.",
    });
  };

  const addNextLevel = () => {
    const levelOrder: (keyof typeof activeLevels)[] = [
      'chapters',
      'modulesPerChapter',
      'topicsPerModule',
      'subtopicsPerTopic',
      'learningOutcomesPerSubtopic'
    ];
    
    for (const level of levelOrder) {
      if (!activeLevels[level]) {
        setActiveLevels(prev => ({ ...prev, [level]: true }));
        toast({
          title: "Level Added",
          description: "New hierarchy level has been added.",
        });
        return;
      }
    }
  };

  const canAddNextLevel = () => {
    return Object.values(activeLevels).some(v => !v);
  };

  const resetCourseUnits = () => {
    setCourseUnits({
      chapters: 0,
      modulesPerChapter: 0,
      topicsPerModule: 0,
      subtopicsPerTopic: 0,
      learningOutcomesPerSubtopic: 0,
    });
    setActiveLevels({
      chapters: true,
      modulesPerChapter: false,
      topicsPerModule: false,
      subtopicsPerTopic: false,
      learningOutcomesPerSubtopic: false,
    });
  };

  const saveCourseUnits = () => {
    if (courseUnits.chapters === 0) {
      toast({
        title: "Validation Error",
        description: "Please specify No. of Chapters.",
        variant: "destructive",
      });
      return;
    }
    
    setShowCourseUnitsDialog(false);
    setHierarchySaved(true);
    toast({
      title: "Course Units Set",
      description: "Your course structure has been configured successfully.",
    });
  };

  const downloadPdfTemplate = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("Course Structure Template", 20, 20);
    
    doc.setFontSize(12);
    let yPosition = 40;
    
    const structure = [
      "1. Chapter 1",
      "   1.1 Module 1",
      "      1.1.1 Topic 1",
      "         1.1.1.1 Subtopic 1",
      "            1.1.1.1.1 Learning Outcome 1",
      "            1.1.1.1.2 Learning Outcome 2",
      "         1.1.1.2 Subtopic 2",
      "      1.1.2 Topic 2",
      "         1.1.2.1 Subtopic 1",
      "            1.1.2.1.1 Learning Outcome 1",
      "",
      "2. Chapter 2",
      "   2.1 Module 1",
      "      2.1.1 Topic 1",
      "         2.1.1.1 Subtopic 1",
      "            2.1.1.1.1 Learning Outcome 1",
      "            2.1.1.1.2 Learning Outcome 2",
      "      2.1.2 Topic 2",
      "         2.1.2.1 Subtopic 1",
    ];
    
    structure.forEach((line) => {
      doc.text(line, 20, yPosition);
      yPosition += 7;
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
    });
    
    doc.save("course-template.pdf");
    
    toast({
      title: "PDF Downloaded",
      description: "Your PDF template has been downloaded successfully.",
    });
  };

  const downloadWordTemplate = async () => {
    const structure = [
      { text: "Course Structure Template", bold: true, size: 32, spacing: true },
      { text: "" },
      { text: "1. Chapter 1", bold: true },
      { text: "   1.1 Module 1" },
      { text: "      1.1.1 Topic 1" },
      { text: "         1.1.1.1 Subtopic 1" },
      { text: "            1.1.1.1.1 Learning Outcome 1" },
      { text: "            1.1.1.1.2 Learning Outcome 2" },
      { text: "         1.1.1.2 Subtopic 2" },
      { text: "      1.1.2 Topic 2" },
      { text: "         1.1.2.1 Subtopic 1" },
      { text: "            1.1.2.1.1 Learning Outcome 1" },
      { text: "" },
      { text: "2. Chapter 2", bold: true },
      { text: "   2.1 Module 1" },
      { text: "      2.1.1 Topic 1" },
      { text: "         2.1.1.1 Subtopic 1" },
      { text: "            2.1.1.1.1 Learning Outcome 1" },
      { text: "            2.1.1.1.2 Learning Outcome 2" },
      { text: "      2.1.2 Topic 2" },
      { text: "         2.1.2.1 Subtopic 1" },
    ];

    const doc = new Document({
      sections: [{
        properties: {},
        children: structure.map(item => 
          new Paragraph({
            children: [
              new TextRun({
                text: item.text,
                bold: item.bold || false,
                size: item.size || 24,
              }),
            ],
            spacing: item.spacing ? { after: 200 } : undefined,
          })
        ),
      }],
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "course-template.docx";
    link.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Word Document Downloaded",
      description: "Your Word template has been downloaded successfully.",
    });
  };
  
  // Level names state
  const [level1Name, setLevel1Name] = useState("chapter");
  const [level2Name, setLevel2Name] = useState("module");
  const [level3Name, setLevel3Name] = useState("topic");
  const [level4Name, setLevel4Name] = useState("subtopic");
  const [level5Name, setLevel5Name] = useState("learning outcome");
  
  // Selected levels for specific unit options
  const [selectedImageLevels, setSelectedImageLevels] = useState<string[]>([]);
  const [selectedQuestionLevels, setSelectedQuestionLevels] = useState<string[]>([]);
  const [selectedScormLevels, setSelectedScormLevels] = useState<string[]>([]);

  const validateCourseDetails = () => {
    if (!title.trim()) {
      toast({
        title: "Course Title Required",
        description: "Please enter a course title to continue.",
        variant: "destructive",
      });
      return false;
    }

    if (!generateOption) {
      toast({
        title: "Generation Method Required",
        description: "Please select a course generation method to continue.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleNextToPreferences = () => {
    if (validateCourseDetails()) {
      setActiveTab("preferences");
    }
  };

  const handleGenerateCourse = () => {
    // Validate course details first
    if (!validateCourseDetails()) {
      setActiveTab("course-details");
      return;
    }

    // Show confirmation dialog
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmGeneration = async () => {
    setIsConfirmDialogOpen(false);
    setIsGeneratingDialogOpen(true);
    setIsGenerating(true);

    try {
      // Map UI state to API payload
      const payload: CourseCreateRequest = {
        Title: title,
        BlueprintId: selectedBlueprint,
        Operation: generateOption === "structure" ? 1 : 2,
        LayoutType: parseInt(selectedLayout.replace("layout", "")),
        Preference: {
          DurationScope: contentDuration === "complete" ? 0 : contentDuration === "chapter" ? 1 : 2,
          ModuleSpanTime: parseInt(chapterSpanTime),
          ImageGenAt: imageGeneration === "none" ? 0 : imageGeneration === "each-unit" ? 1 : 2,
          QuestionGenAt: questionGeneration === "none" ? 0 : questionGeneration === "each-unit" ? 1 : 2,
          ScromGenAt: scormHierarchy === "course" ? 0 : scormHierarchy === "each-unit" ? 1 : 2,
          SingleQuestionCount: parseInt(scqCount),
          MultipleQuestionCount: parseInt(mcqCount),
          TrueFalseCount: parseInt(trueFalseCount),
          FIBCount: parseInt(fibCount),
          IsApplyTaxonmy: applyBloomsTaxonomy,
          Knowledge: bloomsKnowledge,
          Comprehension: bloomsComprehension,
          Application: bloomsApplication,
          Analysis: bloomsAnalysis,
          Synthesis: bloomsSynthesis,
          Evaluation: bloomsEvaluation,
          Graduation: undergraduates,
          PostGraduation: graduates || postgraduates,
          Guidelines: guidelines,
          Exclusions: exclusions,
        },
      };

      const response = await courseApi.generateCourse(payload);
      
      setIsGenerating(false);
      toast({
        title: "Course Generated Successfully",
        description: "Your course has been generated and is now available.",
      });
      
      // Navigate to dashboard after short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      setIsGenerating(false);
      setIsGeneratingDialogOpen(false);
      toast({
        title: "Failed to Generate Course",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showTokens tokenCount="932,679" />

      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <nav className="flex items-center gap-2 text-xs sm:text-sm">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="font-medium">Dashboard</span>
            </button>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-semibold">Create Course</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tabs Navigation */}
          <TabsList className="grid w-full grid-cols-2 h-12 sm:h-14 lg:h-16 mb-6 sm:mb-8 p-1 sm:p-1.5 bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm border border-border/50 shadow-sm">
            <TabsTrigger 
              value="course-details" 
              className="flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base font-semibold h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
            >
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Course Details</span>
              <span className="xs:hidden">Details</span>
            </TabsTrigger>
            <TabsTrigger 
              value="preferences" 
              className="flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base font-semibold h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* Course Details Tab */}
          <TabsContent value="course-details" className="space-y-6 animate-fade-in">
            {/* Title Section */}
            <div className="bg-gradient-to-br from-background via-primary/5 to-primary/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border-[1.5px] border-primary/30">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                  </div>
                </div>
                <div className="flex-1 space-y-4 sm:space-y-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-primary mb-1">
                      Course Title: <span className="text-destructive">*</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">Give your course a descriptive name</p>
                  </div>
                  <div className="space-y-2">
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter course title"
                      className="h-10 sm:h-12 text-sm sm:text-base bg-background/80 backdrop-blur-sm border-2 focus:border-primary/50 shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Define Course Structure Section */}
            <div className="bg-gradient-to-br from-background via-blue-500/5 to-blue-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border-[1.5px] border-blue-500/30">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-4 sm:space-y-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-blue-700 dark:text-blue-400 mb-1">
                      Define Course Structure: <span className="text-destructive">*</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">Choose how you want to define your course structure</p>
                  </div>
                  <RadioGroup value={structureOption} onValueChange={setStructureOption}>
                    <div className="space-y-3">
                      {/* Blueprint Option */}
                      <div className="relative">
                        <RadioGroupItem
                          value="blueprint"
                          id="blueprint"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="blueprint"
                          className="flex items-center gap-4 rounded-xl border-2 border-border/60 bg-background/80 backdrop-blur-sm hover:bg-background hover:border-blue-500/50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 dark:peer-data-[state=checked]:bg-blue-950/50 peer-data-[state=checked]:shadow-md transition-all cursor-pointer p-4 sm:p-5"
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            structureOption === "blueprint"
                              ? 'border-blue-600 bg-blue-600' 
                              : 'border-muted-foreground/30'
                          }`}>
                            {structureOption === "blueprint" && (
                              <div className="w-2.5 h-2.5 rounded-full bg-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">Blueprint</p>
                          </div>
                        </Label>
                        
                        {/* Blueprint Selection Content */}
                        {structureOption === "blueprint" && (
                          <div className="mt-3 p-4 sm:p-5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800">
                            <div className="space-y-3">
                              <Label className="text-sm font-medium text-foreground">Select Blueprint</Label>
                              <Button 
                                variant="outline" 
                                onClick={() => setIsBlueprintDialogOpen(true)}
                                className="w-full h-10 sm:h-12 justify-between border-2 bg-background hover:bg-blue-500/10 hover:border-blue-500 shadow-sm text-sm sm:text-base"
                              >
                                <span className="flex items-center truncate">
                                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                                  <span className="truncate">
                                    {selectedBlueprint 
                                      ? blueprints.find(bp => bp.id === selectedBlueprint)?.title || "Select Blueprint"
                                      : "Select Blueprint"
                                    }
                                  </span>
                                </span>
                                <ChevronDown className="w-4 h-4 opacity-50 flex-shrink-0" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Import from Template Option */}
                      <div className="relative">
                        <RadioGroupItem
                          value="template"
                          id="template"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="template"
                          className="flex items-center gap-4 rounded-xl border-2 border-border/60 bg-background/80 backdrop-blur-sm hover:bg-background hover:border-blue-500/50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 dark:peer-data-[state=checked]:bg-blue-950/50 peer-data-[state=checked]:shadow-md transition-all cursor-pointer p-4 sm:p-5"
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            structureOption === "template"
                              ? 'border-blue-600 bg-blue-600' 
                              : 'border-muted-foreground/30'
                          }`}>
                            {structureOption === "template" && (
                              <div className="w-2.5 h-2.5 rounded-full bg-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">Import from Template</p>
                          </div>
                        </Label>
                        
                        {/* Import from Template Content */}
                        {structureOption === "template" && (
                          <div className="mt-3 p-4 sm:p-5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800">
                            <div className="space-y-6">
                              {/* Combined Upload Section */}
                              <div className="space-y-4">
                                <div className="relative">
                                  <input
                                    type="file"
                                    id="template-upload"
                                    multiple
                                    onChange={handleFileUpload}
                                    className="sr-only"
                                  />
                                  <Label
                                    htmlFor="template-upload"
                                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full border-2 border-blue-500 text-blue-700 dark:text-blue-400 hover:bg-blue-500/10 transition-all cursor-pointer font-semibold text-sm sm:text-base"
                                  >
                                    <Upload className="w-4 h-4" />
                                    Upload Documents <span className="text-destructive">*</span>
                                  </Label>
                                </div>
                                
                                <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20">
                                  <ImageIcon className="w-5 h-5 text-primary" />
                                  <span className="text-sm font-semibold text-foreground">Download Template:</span>
                                  <div className="flex flex-wrap gap-2">
                                    <button 
                                      onClick={downloadPdfTemplate}
                                      className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-xs font-semibold shadow-sm hover:shadow-md"
                                    >
                                      PDF
                                    </button>
                                    <button 
                                      onClick={downloadWordTemplate}
                                      className="px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all text-xs font-semibold shadow-sm hover:shadow-md"
                                    >
                                      Word
                                    </button>
                                    <button 
                                      onClick={() => {
                                        toast({
                                          title: "JSON Template Downloaded",
                                          description: "Your JSON template has been downloaded.",
                                        });
                                      }}
                                      className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-xs font-semibold shadow-sm hover:shadow-md"
                                    >
                                      JSON
                                    </button>
                                    <button 
                                      onClick={() => {
                                        toast({
                                          title: "Excel Template Downloaded",
                                          description: "Your Excel template has been downloaded.",
                                        });
                                      }}
                                      className="px-4 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all text-xs font-semibold shadow-sm hover:shadow-md"
                                    >
                                      Excel
                                    </button>
                                    <button 
                                      onClick={() => {
                                        toast({
                                          title: "XML Template Downloaded",
                                          description: "Your XML template has been downloaded.",
                                        });
                                      }}
                                      className="px-4 py-1.5 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-all text-xs font-semibold shadow-sm hover:shadow-md"
                                    >
                                      XML
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Uploaded Files Display */}
                              {uploadedFiles.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-4 border-t border-blue-300 dark:border-blue-700">
                                  {uploadedFiles.map((file, index) => (
                                    <div key={index} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-medium border border-blue-500/20">
                                      <span>{file.name}</span>
                                      <button
                                        onClick={() => removeFile(index)}
                                        className="hover:bg-blue-500/20 rounded-full p-0.5 transition-colors"
                                        aria-label="Remove file"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              <p className="text-xs italic text-muted-foreground">
                                Note: Please ensure that the uploaded documents are relevant to the course structure, as the content will be generated based on the uploaded materials.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Generate using AI Option */}
                      <div className="relative">
                        <RadioGroupItem
                          value="ai"
                          id="ai"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="ai"
                          className="flex items-center gap-4 rounded-xl border-2 border-border/60 bg-background/80 backdrop-blur-sm hover:bg-background hover:border-blue-500/50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 dark:peer-data-[state=checked]:bg-blue-950/50 peer-data-[state=checked]:shadow-md transition-all cursor-pointer p-4 sm:p-5"
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            structureOption === "ai"
                              ? 'border-blue-600 bg-blue-600' 
                              : 'border-muted-foreground/30'
                          }`}>
                            {structureOption === "ai" && (
                              <div className="w-2.5 h-2.5 rounded-full bg-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">Generate using AI</p>
                          </div>
                        </Label>
                        
                        {/* Generate using AI Content */}
                        {structureOption === "ai" && (
                          <div className="mt-3 p-4 sm:p-5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-4 mb-4">
                              <span className="text-sm font-medium text-foreground">Specify Course Units</span>
                              <Button
                                variant="outline"
                                onClick={() => setShowCourseUnitsDialog(true)}
                                className="px-6 py-2 rounded-lg border-2 border-blue-500 text-blue-700 dark:text-blue-400 hover:bg-blue-500/10 hover:text-blue-800 dark:hover:text-blue-300 hover:border-blue-600 transition-all font-semibold text-sm"
                              >
                                Set Course Units
                              </Button>
                            </div>

                            {/* Display saved hierarchy */}
                            {hierarchySaved && (
                              <div className="mt-4 p-4 rounded-lg bg-white dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700">
                                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-blue-600" />
                                  Configured Hierarchy
                                </h4>
                                <div className="space-y-2 text-sm">
                                  {courseUnits.chapters > 0 && (
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                                      <span className="text-foreground">
                                        <span className="font-semibold">{courseUnits.chapters}</span> Chapters
                                      </span>
                                    </div>
                                  )}
                                  {activeLevels.modulesPerChapter && courseUnits.modulesPerChapter > 0 && (
                                    <div className="flex items-center gap-2 pl-4">
                                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                      <span className="text-foreground">
                                        <span className="font-semibold">{courseUnits.modulesPerChapter}</span> Modules per Chapter
                                      </span>
                                    </div>
                                  )}
                                  {activeLevels.topicsPerModule && courseUnits.topicsPerModule > 0 && (
                                    <div className="flex items-center gap-2 pl-8">
                                      <div className="w-2 h-2 rounded-full bg-teal-600"></div>
                                      <span className="text-foreground">
                                        <span className="font-semibold">{courseUnits.topicsPerModule}</span> Topics per Module
                                      </span>
                                    </div>
                                  )}
                                  {activeLevels.subtopicsPerTopic && courseUnits.subtopicsPerTopic > 0 && (
                                    <div className="flex items-center gap-2 pl-12">
                                      <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                                      <span className="text-foreground">
                                        <span className="font-semibold">{courseUnits.subtopicsPerTopic}</span> Subtopics per Topic
                                      </span>
                                    </div>
                                  )}
                                  {activeLevels.learningOutcomesPerSubtopic && courseUnits.learningOutcomesPerSubtopic > 0 && (
                                    <div className="flex items-center gap-2 pl-16">
                                      <div className="w-2 h-2 rounded-full bg-orange-600"></div>
                                      <span className="text-foreground">
                                        <span className="font-semibold">{courseUnits.learningOutcomesPerSubtopic}</span> Learning Outcomes per Subtopic
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Manual Generation Option */}
                      <div className="relative">
                        <RadioGroupItem
                          value="manual"
                          id="manual"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="manual"
                          className="flex items-center gap-4 rounded-xl border-2 border-border/60 bg-background/80 backdrop-blur-sm hover:bg-background hover:border-blue-500/50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 dark:peer-data-[state=checked]:bg-blue-950/50 peer-data-[state=checked]:shadow-md transition-all cursor-pointer p-4 sm:p-5"
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            structureOption === "manual"
                              ? 'border-blue-600 bg-blue-600' 
                              : 'border-muted-foreground/30'
                          }`}>
                            {structureOption === "manual" && (
                              <div className="w-2.5 h-2.5 rounded-full bg-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">Manual Generation</p>
                          </div>
                        </Label>

                        {/* Manual Generation Content */}
                        {structureOption === "manual" && (
                          <div className="mt-3 p-4 sm:p-5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-medium text-foreground">Specify Course Units</span>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsModifyStructureDialogOpen(true)}
                                className="px-6 py-2 rounded-lg border-2 border-blue-500 text-blue-700 dark:text-blue-400 hover:bg-blue-500/10 hover:text-blue-800 dark:hover:text-blue-300 hover:border-blue-600 transition-all font-semibold text-sm"
                              >
                                <FileEdit className="w-4 h-4 mr-2" />
                                Modify Structure
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            {/* Supporting Documents Section */}
            <div className="bg-gradient-to-br from-background via-pink-500/5 to-pink-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border-[1.5px] border-pink-500/30">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-pink-600 flex items-center justify-center shadow-lg">
                    <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-4 sm:space-y-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-pink-700 dark:text-pink-400 mb-1">Supporting Documents:</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">Upload any reference materials or documents</p>
                  </div>
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="file"
                        id="support-file-upload"
                        multiple
                        onChange={handleFileUpload}
                        className="sr-only"
                      />
                      <Label
                        htmlFor="support-file-upload"
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-full border-2 border-pink-500 text-pink-700 dark:text-pink-400 hover:bg-pink-500/10 transition-all cursor-pointer font-semibold text-sm sm:text-base"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Support Documents
                      </Label>
                    </div>
                    {uploadedFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-500/10 text-pink-700 dark:text-pink-400 text-xs font-medium border border-pink-500/20">
                            <span>{file.name}</span>
                            <button
                              onClick={() => removeFile(index)}
                              className="hover:bg-pink-500/20 rounded-full p-0.5 transition-colors"
                              aria-label="Remove file"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs italic text-muted-foreground">
                      Note: Please ensure that the uploaded documents are relevant to the course title, as the content will be generated based on the uploaded materials.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Layout Template Section */}
            <div className="bg-gradient-to-br from-background via-teal-500/5 to-teal-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border-[1.5px] border-teal-500/30">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-teal-600 flex items-center justify-center shadow-lg">
                    <Layout className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-4 sm:space-y-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-teal-700 dark:text-teal-400 mb-1">Step 2: Choose a Layout Template</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">Select how your content will be structured and displayed</p>
                  </div>
                  <RadioGroup value={selectedLayout} onValueChange={setSelectedLayout}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
                      {/* Layout 1: Image at top, two-column text below */}
                      <div className="relative group h-[240px]">
                        <RadioGroupItem value="layout1" id="layout1" className="peer sr-only" />
                        <Label
                          htmlFor="layout1"
                          className="flex flex-col h-full rounded-xl border-2 border-border hover:border-teal-500/50 peer-data-[state=checked]:border-teal-600 peer-data-[state=checked]:shadow-lg peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-teal-500/20 peer-data-[state=checked]:[&>div:last-child]:bg-teal-100 dark:peer-data-[state=checked]:[&>div:last-child]:bg-teal-900/40 peer-data-[state=checked]:[&>div:last-child>p]:text-teal-700 dark:peer-data-[state=checked]:[&>div:last-child>p]:text-teal-300 peer-data-[state=checked]:[&>div:last-child>svg]:opacity-100 transition-all cursor-pointer overflow-hidden bg-background"
                        >
                          <div className="p-4 space-y-4 flex-1">
                            <div className="w-20 h-20 mx-auto rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-2 border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center">
                              <div className="w-10 h-10 rounded-lg bg-teal-500/15 flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1.5">
                                <div className="h-2 bg-foreground/25 rounded w-3/4"></div>
                                <div className="h-1.5 bg-foreground/15 rounded w-full"></div>
                                <div className="h-1.5 bg-foreground/15 rounded w-5/6"></div>
                              </div>
                              <div className="space-y-1.5">
                                <div className="h-2 bg-foreground/25 rounded w-3/4"></div>
                                <div className="h-1.5 bg-foreground/15 rounded w-full"></div>
                                <div className="h-1.5 bg-foreground/15 rounded w-5/6"></div>
                              </div>
                            </div>
                          </div>
                          <div className="h-10 flex items-center justify-center gap-2 border-t border-border/50 bg-muted/30 transition-colors">
                            <p className="text-xs font-semibold text-foreground/70 transition-colors">Layout 1</p>
                            <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 opacity-0 transition-opacity" />
                          </div>
                        </Label>
                      </div>

                      {/* Layout 2: Two-column text at top, image at bottom */}
                      <div className="relative group h-[240px]">
                        <RadioGroupItem value="layout2" id="layout2" className="peer sr-only" />
                        <Label
                          htmlFor="layout2"
                          className="flex flex-col h-full rounded-xl border-2 border-border hover:border-teal-500/50 peer-data-[state=checked]:border-teal-600 peer-data-[state=checked]:shadow-lg peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-teal-500/20 peer-data-[state=checked]:[&>div:last-child]:bg-teal-100 dark:peer-data-[state=checked]:[&>div:last-child]:bg-teal-900/40 peer-data-[state=checked]:[&>div:last-child>p]:text-teal-700 dark:peer-data-[state=checked]:[&>div:last-child>p]:text-teal-300 peer-data-[state=checked]:[&>div:last-child>svg]:opacity-100 transition-all cursor-pointer overflow-hidden bg-background"
                        >
                          <div className="p-4 space-y-4 flex-1">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1.5">
                                <div className="h-2 bg-foreground/25 rounded w-3/4"></div>
                                <div className="h-1.5 bg-foreground/15 rounded w-full"></div>
                                <div className="h-1.5 bg-foreground/15 rounded w-5/6"></div>
                                <div className="h-1.5 bg-foreground/15 rounded w-4/5"></div>
                              </div>
                              <div className="space-y-1.5">
                                <div className="h-2 bg-foreground/25 rounded w-3/4"></div>
                                <div className="h-1.5 bg-foreground/15 rounded w-full"></div>
                                <div className="h-1.5 bg-foreground/15 rounded w-5/6"></div>
                                <div className="h-1.5 bg-foreground/15 rounded w-4/5"></div>
                              </div>
                            </div>
                            <div className="w-20 h-20 mx-auto rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-2 border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center">
                              <div className="w-10 h-10 rounded-lg bg-teal-500/15 flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                              </div>
                            </div>
                          </div>
                          <div className="h-10 flex items-center justify-center gap-2 border-t border-border/50 bg-muted/30 transition-colors">
                            <p className="text-xs font-semibold text-foreground/70 transition-colors">Layout 2</p>
                            <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 opacity-0 transition-opacity" />
                          </div>
                        </Label>
                      </div>

                      {/* Layout 3: Image at top center, single column text */}
                      <div className="relative group h-[240px]">
                        <RadioGroupItem value="layout3" id="layout3" className="peer sr-only" />
                        <Label
                          htmlFor="layout3"
                          className="flex flex-col h-full rounded-xl border-2 border-border hover:border-teal-500/50 peer-data-[state=checked]:border-teal-600 peer-data-[state=checked]:shadow-lg peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-teal-500/20 peer-data-[state=checked]:[&>div:last-child]:bg-teal-100 dark:peer-data-[state=checked]:[&>div:last-child]:bg-teal-900/40 peer-data-[state=checked]:[&>div:last-child>p]:text-teal-700 dark:peer-data-[state=checked]:[&>div:last-child>p]:text-teal-300 peer-data-[state=checked]:[&>div:last-child>svg]:opacity-100 transition-all cursor-pointer overflow-hidden bg-background"
                        >
                          <div className="p-4 space-y-4 flex-1">
                            <div className="w-20 h-20 mx-auto rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-2 border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center">
                              <div className="w-10 h-10 rounded-lg bg-teal-500/15 flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <div className="h-2 bg-foreground/25 rounded w-1/2"></div>
                              <div className="h-1.5 bg-foreground/15 rounded w-full"></div>
                              <div className="h-1.5 bg-foreground/15 rounded w-5/6"></div>
                              <div className="h-1.5 bg-foreground/15 rounded w-4/5"></div>
                              <div className="h-1.5 bg-foreground/15 rounded w-full"></div>
                            </div>
                          </div>
                          <div className="h-10 flex items-center justify-center gap-2 border-t border-border/50 bg-muted/30 transition-colors">
                            <p className="text-xs font-semibold text-foreground/70 transition-colors">Layout 3</p>
                            <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 opacity-0 transition-opacity" />
                          </div>
                        </Label>
                      </div>

                      {/* Layout 4: Single column text at top, image at bottom */}
                      <div className="relative group h-[240px]">
                        <RadioGroupItem value="layout4" id="layout4" className="peer sr-only" />
                        <Label
                          htmlFor="layout4"
                          className="flex flex-col h-full rounded-xl border-2 border-border hover:border-teal-500/50 peer-data-[state=checked]:border-teal-600 peer-data-[state=checked]:shadow-lg peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-teal-500/20 peer-data-[state=checked]:[&>div:last-child]:bg-teal-100 dark:peer-data-[state=checked]:[&>div:last-child]:bg-teal-900/40 peer-data-[state=checked]:[&>div:last-child>p]:text-teal-700 dark:peer-data-[state=checked]:[&>div:last-child>p]:text-teal-300 peer-data-[state=checked]:[&>div:last-child>svg]:opacity-100 transition-all cursor-pointer overflow-hidden bg-background"
                        >
                          <div className="p-4 space-y-4 flex-1">
                            <div className="space-y-1.5">
                              <div className="h-2 bg-foreground/25 rounded w-1/2"></div>
                              <div className="h-1.5 bg-foreground/15 rounded w-full"></div>
                              <div className="h-1.5 bg-foreground/15 rounded w-5/6"></div>
                              <div className="h-1.5 bg-foreground/15 rounded w-4/5"></div>
                              <div className="h-1.5 bg-foreground/15 rounded w-full"></div>
                            </div>
                            <div className="w-20 h-20 mx-auto rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-2 border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center">
                              <div className="w-10 h-10 rounded-lg bg-teal-500/15 flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                              </div>
                            </div>
                          </div>
                          <div className="h-10 flex items-center justify-center gap-2 border-t border-border/50 bg-muted/30 transition-colors">
                            <p className="text-xs font-semibold text-foreground/70 transition-colors">Layout 4</p>
                            <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 opacity-0 transition-opacity" />
                          </div>
                        </Label>
                      </div>

                      {/* Layout 5: Text on left, image on right */}
                      <div className="relative group h-[240px]">
                        <RadioGroupItem value="layout5" id="layout5" className="peer sr-only" />
                        <Label
                          htmlFor="layout5"
                          className="flex flex-col h-full rounded-xl border-2 border-border hover:border-teal-500/50 peer-data-[state=checked]:border-teal-600 peer-data-[state=checked]:shadow-lg peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-teal-500/20 peer-data-[state=checked]:[&>div:last-child]:bg-teal-100 dark:peer-data-[state=checked]:[&>div:last-child]:bg-teal-900/40 peer-data-[state=checked]:[&>div:last-child>p]:text-teal-700 dark:peer-data-[state=checked]:[&>div:last-child>p]:text-teal-300 peer-data-[state=checked]:[&>div:last-child>svg]:opacity-100 transition-all cursor-pointer overflow-hidden bg-background"
                        >
                          <div className="p-4 flex-1">
                            <div className="grid grid-cols-2 gap-3 items-center h-full">
                              <div className="space-y-1.5">
                                <div className="h-2 bg-foreground/25 rounded w-3/4"></div>
                                <div className="h-1.5 bg-foreground/15 rounded w-full"></div>
                                <div className="h-1.5 bg-foreground/15 rounded w-5/6"></div>
                                <div className="h-1.5 bg-foreground/15 rounded w-4/5"></div>
                                <div className="h-1.5 bg-foreground/15 rounded w-full"></div>
                                <div className="h-1.5 bg-foreground/15 rounded w-5/6"></div>
                              </div>
                              <div className="w-20 h-20 mx-auto rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-2 border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center">
                                <div className="w-10 h-10 rounded-lg bg-teal-500/15 flex items-center justify-center">
                                  <ImageIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="h-10 flex items-center justify-center gap-2 border-t border-border/50 bg-muted/30 transition-colors">
                            <p className="text-xs font-semibold text-foreground/70 transition-colors">Layout 5</p>
                            <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 opacity-0 transition-opacity" />
                          </div>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>


            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/dashboard")}
                className="border-2 h-10 sm:h-12 px-4 sm:px-6 hover:bg-primary/10 hover:border-primary text-sm sm:text-base w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                size="lg" 
                onClick={handleNextToPreferences}
                className="px-6 sm:px-8 h-10 sm:h-12 text-sm sm:text-base bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6 animate-fade-in">
            {/* Level Names Customization */}
            <div className="bg-gradient-to-br from-background via-indigo-500/5 to-indigo-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border-[1.5px] border-indigo-500/30">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg">
                    <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-4 sm:space-y-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-indigo-700 dark:text-indigo-400 mb-1">Level Names</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">Customize the names for each hierarchical level in your course structure</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="level1" className="text-sm font-semibold text-foreground">
                        Level 1
                      </Label>
                      <Input
                        id="level1"
                        value={level1Name}
                        onChange={(e) => setLevel1Name(e.target.value)}
                        placeholder="chapter"
                        className="h-10 text-sm bg-background/80 backdrop-blur-sm border-2 focus:border-indigo-500/50 shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="level2" className="text-sm font-semibold text-foreground">
                        Level 2
                      </Label>
                      <Input
                        id="level2"
                        value={level2Name}
                        onChange={(e) => setLevel2Name(e.target.value)}
                        placeholder="module"
                        className="h-10 text-sm bg-background/80 backdrop-blur-sm border-2 focus:border-indigo-500/50 shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="level3" className="text-sm font-semibold text-foreground">
                        Level 3
                      </Label>
                      <Input
                        id="level3"
                        value={level3Name}
                        onChange={(e) => setLevel3Name(e.target.value)}
                        placeholder="topic"
                        className="h-10 text-sm bg-background/80 backdrop-blur-sm border-2 focus:border-indigo-500/50 shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="level4" className="text-sm font-semibold text-foreground">
                        Level 4
                      </Label>
                      <Input
                        id="level4"
                        value={level4Name}
                        onChange={(e) => setLevel4Name(e.target.value)}
                        placeholder="subtopic"
                        className="h-10 text-sm bg-background/80 backdrop-blur-sm border-2 focus:border-indigo-500/50 shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="level5" className="text-sm font-semibold text-foreground">
                        Level 5
                      </Label>
                      <Input
                        id="level5"
                        value={level5Name}
                        onChange={(e) => setLevel5Name(e.target.value)}
                        placeholder="learning outcome"
                        className="h-10 text-sm bg-background/80 backdrop-blur-sm border-2 focus:border-indigo-500/50 shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Setup */}
            <div className="bg-gradient-to-br from-background via-purple-500/5 to-purple-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border-[1.5px] border-purple-500/30">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-4 sm:space-y-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-purple-700 dark:text-purple-400 mb-1">Content Setup</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">Configure content duration and {level1Name} settings</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="content-duration" className="text-sm sm:text-base font-semibold">
                        Content Duration Scope <span className="text-destructive">*</span>
                      </Label>
                      <Select value={contentDuration} onValueChange={setContentDuration}>
                        <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base bg-background/80 backdrop-blur-sm border-2">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="bg-card z-50">
                          <SelectItem value="complete">Complete Course</SelectItem>
                          <SelectItem value="chapter">Each {level1Name.charAt(0).toUpperCase() + level1Name.slice(1)}</SelectItem>
                          <SelectItem value="unit">Each Course Unit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chapter-span" className="text-sm sm:text-base font-semibold">
                        {level1Name.charAt(0).toUpperCase() + level1Name.slice(1)} Span Time (In Minutes) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="chapter-span"
                        type="number"
                        value={chapterSpanTime}
                        onChange={(e) => setChapterSpanTime(e.target.value)}
                        placeholder="60"
                        className="h-10 sm:h-12 text-sm sm:text-base bg-background/80 backdrop-blur-sm border-2 focus:border-purple-500/50 shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Generation */}
            <div className="bg-gradient-to-br from-background via-cyan-500/5 to-cyan-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border-[1.5px] border-cyan-500/30">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-cyan-600 flex items-center justify-center shadow-lg">
                    <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-4 sm:space-y-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-cyan-700 dark:text-cyan-400 mb-1">Image Generation</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">Choose where to generate images for your course</p>
                  </div>
                  <div className="bg-card/50 rounded-xl p-4 sm:p-6 border border-cyan-500/20 space-y-4">
                    <RadioGroup value={imageGeneration} onValueChange={setImageGeneration}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="relative">
                          <RadioGroupItem value="each-unit" id="img-each-unit" className="peer sr-only" />
                          <Label
                            htmlFor="img-each-unit"
                            className="flex items-center gap-3 rounded-lg border-2 border-border/60 bg-background/50 hover:bg-background hover:border-cyan-500/50 peer-data-[state=checked]:border-cyan-600 peer-data-[state=checked]:bg-cyan-50 dark:peer-data-[state=checked]:bg-cyan-950/50 peer-data-[state=checked]:shadow-sm transition-all cursor-pointer px-4 py-3"
                          >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                              imageGeneration === "each-unit" ? 'border-cyan-600 bg-cyan-600' : 'border-muted-foreground/30'
                            }`}>
                              {imageGeneration === "each-unit" && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                              )}
                            </div>
                            <span className="font-medium">Each Course Unit</span>
                          </Label>
                        </div>
                        <div className="relative">
                          <RadioGroupItem value="specific-unit" id="img-specific-unit" className="peer sr-only" />
                          <Label
                            htmlFor="img-specific-unit"
                            className="flex items-center gap-3 rounded-lg border-2 border-border/60 bg-background/50 hover:bg-background hover:border-cyan-500/50 peer-data-[state=checked]:border-cyan-600 peer-data-[state=checked]:bg-cyan-50 dark:peer-data-[state=checked]:bg-cyan-950/50 peer-data-[state=checked]:shadow-sm transition-all cursor-pointer px-4 py-3"
                          >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                              imageGeneration === "specific-unit" ? 'border-cyan-600 bg-cyan-600' : 'border-muted-foreground/30'
                            }`}>
                              {imageGeneration === "specific-unit" && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                              )}
                            </div>
                            <span className="font-medium">Specific Course Unit</span>
                          </Label>
                        </div>
                        <div className="relative">
                          <RadioGroupItem value="none" id="img-none" className="peer sr-only" />
                          <Label
                            htmlFor="img-none"
                            className="flex items-center gap-3 rounded-lg border-2 border-border/60 bg-background/50 hover:bg-background hover:border-cyan-500/50 peer-data-[state=checked]:border-cyan-600 peer-data-[state=checked]:bg-cyan-50 dark:peer-data-[state=checked]:bg-cyan-950/50 peer-data-[state=checked]:shadow-sm transition-all cursor-pointer px-4 py-3"
                          >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                              imageGeneration === "none" ? 'border-cyan-600 bg-cyan-600' : 'border-muted-foreground/30'
                            }`}>
                              {imageGeneration === "none" && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                              )}
                            </div>
                            <span className="font-medium">None</span>
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                    
                    {/* Level Selection for Specific Unit */}
                    {imageGeneration === "specific-unit" && (
                      <div className="space-y-1">
                        <Label className="text-sm font-semibold">Select Levels</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 w-full md:w-1/2 lg:w-1/4">
                          {[
                            { value: "level1", label: level1Name },
                            { value: "level2", label: level2Name },
                            { value: "level3", label: level3Name },
                          ].map((level) => (
                            <div key={level.value} className="flex items-center gap-1 w-fit">
                              <Checkbox
                                id={`img-${level.value}`}
                                checked={selectedImageLevels.includes(level.value)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedImageLevels([...selectedImageLevels, level.value]);
                                  } else {
                                    setSelectedImageLevels(selectedImageLevels.filter(l => l !== level.value));
                                  }
                                }}
                              />
                              <Label
                                htmlFor={`img-${level.value}`}
                                className="text-sm font-normal cursor-pointer capitalize"
                              >
                                {level.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Question Generation */}
            <div className="bg-gradient-to-br from-background via-orange-500/5 to-orange-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border-[1.5px] border-orange-500/30">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg">
                    <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-4 sm:space-y-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-orange-700 dark:text-orange-400 mb-1">Question Generation</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">Choose where to generate questions for your course</p>
                  </div>
                  <div className="bg-card/50 rounded-xl p-4 sm:p-6 border border-orange-500/20 space-y-4">
                    <RadioGroup value={questionGeneration} onValueChange={setQuestionGeneration}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="relative">
                          <RadioGroupItem value="each-unit" id="q-each-unit" className="peer sr-only" />
                          <Label
                            htmlFor="q-each-unit"
                            className="flex items-center gap-3 rounded-lg border-2 border-border/60 bg-background/50 hover:bg-background hover:border-orange-500/50 peer-data-[state=checked]:border-orange-600 peer-data-[state=checked]:bg-orange-50 dark:peer-data-[state=checked]:bg-orange-950/50 peer-data-[state=checked]:shadow-sm transition-all cursor-pointer px-4 py-3"
                          >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                              questionGeneration === "each-unit" ? 'border-orange-600 bg-orange-600' : 'border-muted-foreground/30'
                            }`}>
                              {questionGeneration === "each-unit" && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                              )}
                            </div>
                            <span className="font-medium">Each Course Unit</span>
                          </Label>
                        </div>
                        <div className="relative">
                          <RadioGroupItem value="specific-unit" id="q-specific-unit" className="peer sr-only" />
                          <Label
                            htmlFor="q-specific-unit"
                            className="flex items-center gap-3 rounded-lg border-2 border-border/60 bg-background/50 hover:bg-background hover:border-orange-500/50 peer-data-[state=checked]:border-orange-600 peer-data-[state=checked]:bg-orange-50 dark:peer-data-[state=checked]:bg-orange-950/50 peer-data-[state=checked]:shadow-sm transition-all cursor-pointer px-4 py-3"
                          >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                              questionGeneration === "specific-unit" ? 'border-orange-600 bg-orange-600' : 'border-muted-foreground/30'
                            }`}>
                              {questionGeneration === "specific-unit" && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                              )}
                            </div>
                            <span className="font-medium">Specific Course Unit</span>
                          </Label>
                        </div>
                        <div className="relative">
                          <RadioGroupItem value="none" id="q-none" className="peer sr-only" />
                          <Label
                            htmlFor="q-none"
                            className="flex items-center gap-3 rounded-lg border-2 border-border/60 bg-background/50 hover:bg-background hover:border-orange-500/50 peer-data-[state=checked]:border-orange-600 peer-data-[state=checked]:bg-orange-50 dark:peer-data-[state=checked]:bg-orange-950/50 peer-data-[state=checked]:shadow-sm transition-all cursor-pointer px-4 py-3"
                          >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                              questionGeneration === "none" ? 'border-orange-600 bg-orange-600' : 'border-muted-foreground/30'
                            }`}>
                              {questionGeneration === "none" && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                              )}
                            </div>
                            <span className="font-medium">None</span>
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                    
                    {/* Question Type Configuration for Each Course Unit */}
                    {questionGeneration === "each-unit" && (
                      <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* S.C.Q */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">S.C.Q</Label>
                            <Select value={scqCount} onValueChange={setScqCount}>
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[...Array(21)].map((_, i) => (
                                  <SelectItem key={i} value={i.toString()}>
                                    {i}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* M.C.Q */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">M.C.Q</Label>
                            <Select value={mcqCount} onValueChange={setMcqCount}>
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[...Array(21)].map((_, i) => (
                                  <SelectItem key={i} value={i.toString()}>
                                    {i}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* True/False */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">True/False</Label>
                            <Select value={trueFalseCount} onValueChange={setTrueFalseCount}>
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[...Array(21)].map((_, i) => (
                                  <SelectItem key={i} value={i.toString()}>
                                    {i}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* FIB */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">FIB</Label>
                            <Select value={fibCount} onValueChange={setFibCount}>
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[...Array(21)].map((_, i) => (
                                  <SelectItem key={i} value={i.toString()}>
                                    {i}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Level Selection for Specific Unit */}
                    {questionGeneration === "specific-unit" && (
                      <div className="space-y-4 pt-2">
                        {[
                          { id: "chapter", label: level1Name || "Chapter" },
                          { id: "module", label: level2Name || "Module" },
                          { id: "topic", label: level3Name || "Topic" },
                          { id: "subtopic", label: level4Name || "Sub Topic" },
                          { id: "learningOutcome", label: level5Name || "Learning Outcome" }
                        ].map((level) => (
                          <div key={level.id} className="border-2 border-orange-500/30 bg-card rounded-lg p-4 space-y-3 shadow-sm">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`q-level-${level.id}`}
                                checked={selectedQuestionLevels.includes(level.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedQuestionLevels([...selectedQuestionLevels, level.id]);
                                  } else {
                                    setSelectedQuestionLevels(selectedQuestionLevels.filter(l => l !== level.id));
                                  }
                                }}
                              />
                              <Label
                                htmlFor={`q-level-${level.id}`}
                                className="text-sm font-semibold cursor-pointer capitalize"
                              >
                                {level.label}
                              </Label>
                            </div>
                            
                            {selectedQuestionLevels.includes(level.id) && (
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 ml-6">
                                {/* S.C.Q */}
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">S.C.Q</Label>
                                  <Select 
                                    value={levelQuestionCounts[level.id]?.scq || "3"} 
                                    onValueChange={(value) => {
                                      setLevelQuestionCounts(prev => ({
                                        ...prev,
                                        [level.id]: { ...prev[level.id], scq: value }
                                      }));
                                    }}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[...Array(21)].map((_, i) => (
                                        <SelectItem key={i} value={i.toString()}>
                                          {i}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* M.C.Q */}
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">M.C.Q</Label>
                                  <Select 
                                    value={levelQuestionCounts[level.id]?.mcq || "3"} 
                                    onValueChange={(value) => {
                                      setLevelQuestionCounts(prev => ({
                                        ...prev,
                                        [level.id]: { ...prev[level.id], mcq: value }
                                      }));
                                    }}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[...Array(21)].map((_, i) => (
                                        <SelectItem key={i} value={i.toString()}>
                                          {i}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* True/False */}
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">True/False</Label>
                                  <Select 
                                    value={levelQuestionCounts[level.id]?.trueFalse || "2"} 
                                    onValueChange={(value) => {
                                      setLevelQuestionCounts(prev => ({
                                        ...prev,
                                        [level.id]: { ...prev[level.id], trueFalse: value }
                                      }));
                                    }}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[...Array(21)].map((_, i) => (
                                        <SelectItem key={i} value={i.toString()}>
                                          {i}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* FIB */}
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">FIB</Label>
                                  <Select 
                                    value={levelQuestionCounts[level.id]?.fib || "2"} 
                                    onValueChange={(value) => {
                                      setLevelQuestionCounts(prev => ({
                                        ...prev,
                                        [level.id]: { ...prev[level.id], fib: value }
                                      }));
                                    }}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[...Array(21)].map((_, i) => (
                                        <SelectItem key={i} value={i.toString()}>
                                          {i}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SCORM Export */}
            <div className="bg-gradient-to-br from-background via-purple-500/5 to-purple-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border-[1.5px] border-purple-500/30">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg">
                    <FileCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-4 sm:space-y-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-purple-700 dark:text-purple-400 mb-1">SCORM Export</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">Configure SCORM export settings and question hierarchy</p>
                  </div>
                  
                  <div className="space-y-4 sm:space-y-6">
                    {/* Question Display Hierarchy */}
                    <div className="bg-card/50 rounded-xl p-4 sm:p-6 border border-purple-500/20 space-y-4">
                      <Label className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 block flex items-center gap-2">
                        <FileCheck className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                        Question Display Hierarchy
                      </Label>
                      <RadioGroup value={scormHierarchy} onValueChange={setScormHierarchy}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div className="relative">
                            <RadioGroupItem value="course" id="scorm-course" className="peer sr-only" />
                            <Label
                              htmlFor="scorm-course"
                              className="flex items-center gap-3 rounded-lg border-2 border-border/60 bg-background/50 hover:bg-background hover:border-purple-500/50 peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-purple-50 dark:peer-data-[state=checked]:bg-purple-950/50 peer-data-[state=checked]:shadow-sm transition-all cursor-pointer px-4 py-3"
                            >
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                                scormHierarchy === "course" ? 'border-purple-600 bg-purple-600' : 'border-muted-foreground/30'
                              }`}>
                                {scormHierarchy === "course" && (
                                  <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                              </div>
                              <span className="font-medium">Course</span>
                            </Label>
                          </div>
                          <div className="relative">
                            <RadioGroupItem value="each-unit" id="scorm-each-unit" className="peer sr-only" />
                            <Label
                              htmlFor="scorm-each-unit"
                              className="flex items-center gap-3 rounded-lg border-2 border-border/60 bg-background/50 hover:bg-background hover:border-purple-500/50 peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-purple-50 dark:peer-data-[state=checked]:bg-purple-950/50 peer-data-[state=checked]:shadow-sm transition-all cursor-pointer px-4 py-3"
                            >
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                                scormHierarchy === "each-unit" ? 'border-purple-600 bg-purple-600' : 'border-muted-foreground/30'
                              }`}>
                                {scormHierarchy === "each-unit" && (
                                  <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                              </div>
                              <span className="font-medium">Each Course Unit</span>
                            </Label>
                          </div>
                          <div className="relative">
                            <RadioGroupItem value="specific-unit" id="scorm-specific-unit" className="peer sr-only" />
                            <Label
                              htmlFor="scorm-specific-unit"
                              className="flex items-center gap-3 rounded-lg border-2 border-border/60 bg-background/50 hover:bg-background hover:border-purple-500/50 peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-purple-50 dark:peer-data-[state=checked]:bg-purple-950/50 peer-data-[state=checked]:shadow-sm transition-all cursor-pointer px-4 py-3"
                            >
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                                scormHierarchy === "specific-unit" ? 'border-purple-600 bg-purple-600' : 'border-muted-foreground/30'
                              }`}>
                                {scormHierarchy === "specific-unit" && (
                                  <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                              </div>
                              <span className="font-medium">Specific Course Unit</span>
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>
                      
                      {/* Level Selection for Specific Unit */}
                      {scormHierarchy === "specific-unit" && (
                        <div className="space-y-1">
                          <Label className="text-sm font-semibold">Select Levels</Label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 w-full md:w-1/2 lg:w-1/4">
                            {[
                              { value: "level1", label: level1Name },
                              { value: "level2", label: level2Name },
                              { value: "level3", label: level3Name },
                            ].map((level) => (
                              <div key={level.value} className="flex items-center gap-1 w-fit">
                                <Checkbox
                                  id={`scorm-${level.value}`}
                                  checked={selectedScormLevels.includes(level.value)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedScormLevels([...selectedScormLevels, level.value]);
                                    } else {
                                      setSelectedScormLevels(selectedScormLevels.filter(l => l !== level.value));
                                    }
                                  }}
                                />
                                <Label
                                  htmlFor={`scorm-${level.value}`}
                                  className="text-sm font-normal cursor-pointer capitalize"
                                >
                                  {level.label}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Assessment Questions */}
                    <div className="bg-card/50 rounded-xl p-6 border border-purple-500/20">
                      <Label className="text-base font-semibold mb-4 block flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-purple-600" />
                        Total Number of Assessment Questions
                      </Label>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Single Choice (S.C.Q)</Label>
                          <Select value={scqCount} onValueChange={setScqCount}>
                            <SelectTrigger className="h-11 bg-background/80 backdrop-blur-sm border-2 hover:border-purple-500/50 transition-colors">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card z-50">
                              {[5, 10, 15, 20, 25, 30].map(num => (
                                <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Multiple Choice (M.C.Q)</Label>
                          <Select value={mcqCount} onValueChange={setMcqCount}>
                            <SelectTrigger className="h-11 bg-background/80 backdrop-blur-sm border-2 hover:border-purple-500/50 transition-colors">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card z-50">
                              {[5, 10, 15, 20, 25, 30].map(num => (
                                <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">True/False</Label>
                          <Select value={trueFalseCount} onValueChange={setTrueFalseCount}>
                            <SelectTrigger className="h-11 bg-background/80 backdrop-blur-sm border-2 hover:border-purple-500/50 transition-colors">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card z-50">
                              {[5, 10, 15, 20, 25, 30].map(num => (
                                <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Fill in Blanks (FIB)</Label>
                          <Select value={fibCount} onValueChange={setFibCount}>
                            <SelectTrigger className="h-11 bg-background/80 backdrop-blur-sm border-2 hover:border-purple-500/50 transition-colors">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card z-50">
                              {[5, 10, 15, 20, 25, 30].map(num => (
                                <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Blooms Taxonomy */}
            <div className="bg-gradient-to-br from-background via-blue-500/5 to-blue-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border-[1.5px] border-blue-500/30">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
                    <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-4 sm:space-y-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-blue-700 dark:text-blue-400 mb-1">Blooms Taxonomy</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">Apply Bloom's Taxonomy levels to your course content</p>
                  </div>
                  
                  <div className="space-y-4 sm:space-y-6">
                    {/* Apply Blooms Taxonomy Toggle */}
                    <div className="bg-card/50 rounded-xl p-4 sm:p-6 border border-blue-500/20">
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="apply-blooms" 
                          checked={applyBloomsTaxonomy}
                          onCheckedChange={(checked) => setApplyBloomsTaxonomy(checked as boolean)}
                          className="w-5 h-5"
                        />
                        <Label htmlFor="apply-blooms" className="text-base font-semibold cursor-pointer flex items-center gap-2">
                          <Layers className="w-4 h-4 text-blue-600" />
                          Apply Blooms Taxonomy
                        </Label>
                      </div>
                    </div>

                    {/* Taxonomy Levels */}
                    {applyBloomsTaxonomy && (
                      <div className="bg-card/50 rounded-xl p-6 border border-blue-500/20 animate-fade-in">
                        <Label className="text-base font-semibold mb-4 block flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-blue-600" />
                          Blooms Taxonomy Levels
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <div className="relative">
                            <Checkbox 
                              id="blooms-knowledge" 
                              checked={bloomsKnowledge}
                              onCheckedChange={(checked) => setBloomsKnowledge(checked as boolean)}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor="blooms-knowledge"
                              className={`flex items-center gap-3 rounded-lg border-2 bg-background/50 hover:bg-background hover:border-blue-500/50 transition-all cursor-pointer px-4 py-3 ${
                                bloomsKnowledge 
                                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 shadow-sm' 
                                  : 'border-border/60'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                                bloomsKnowledge ? 'border-blue-600 bg-blue-600' : 'border-muted-foreground/30'
                              }`}>
                                {bloomsKnowledge && (
                                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                )}
                              </div>
                              <span className="font-medium">Knowledge</span>
                            </Label>
                          </div>
                          <div className="relative">
                            <Checkbox 
                              id="blooms-comprehension" 
                              checked={bloomsComprehension}
                              onCheckedChange={(checked) => setBloomsComprehension(checked as boolean)}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor="blooms-comprehension"
                              className={`flex items-center gap-3 rounded-lg border-2 bg-background/50 hover:bg-background hover:border-blue-500/50 transition-all cursor-pointer px-4 py-3 ${
                                bloomsComprehension 
                                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 shadow-sm' 
                                  : 'border-border/60'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                                bloomsComprehension ? 'border-blue-600 bg-blue-600' : 'border-muted-foreground/30'
                              }`}>
                                {bloomsComprehension && (
                                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                )}
                              </div>
                              <span className="font-medium">Comprehension</span>
                            </Label>
                          </div>
                          <div className="relative">
                            <Checkbox 
                              id="blooms-application" 
                              checked={bloomsApplication}
                              onCheckedChange={(checked) => setBloomsApplication(checked as boolean)}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor="blooms-application"
                              className={`flex items-center gap-3 rounded-lg border-2 bg-background/50 hover:bg-background hover:border-blue-500/50 transition-all cursor-pointer px-4 py-3 ${
                                bloomsApplication 
                                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 shadow-sm' 
                                  : 'border-border/60'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                                bloomsApplication ? 'border-blue-600 bg-blue-600' : 'border-muted-foreground/30'
                              }`}>
                                {bloomsApplication && (
                                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                )}
                              </div>
                              <span className="font-medium">Application</span>
                            </Label>
                          </div>
                          <div className="relative">
                            <Checkbox 
                              id="blooms-analysis" 
                              checked={bloomsAnalysis}
                              onCheckedChange={(checked) => setBloomsAnalysis(checked as boolean)}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor="blooms-analysis"
                              className={`flex items-center gap-3 rounded-lg border-2 bg-background/50 hover:bg-background hover:border-blue-500/50 transition-all cursor-pointer px-4 py-3 ${
                                bloomsAnalysis 
                                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 shadow-sm' 
                                  : 'border-border/60'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                                bloomsAnalysis ? 'border-blue-600 bg-blue-600' : 'border-muted-foreground/30'
                              }`}>
                                {bloomsAnalysis && (
                                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                )}
                              </div>
                              <span className="font-medium">Analysis</span>
                            </Label>
                          </div>
                          <div className="relative">
                            <Checkbox 
                              id="blooms-synthesis" 
                              checked={bloomsSynthesis}
                              onCheckedChange={(checked) => setBloomsSynthesis(checked as boolean)}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor="blooms-synthesis"
                              className={`flex items-center gap-3 rounded-lg border-2 bg-background/50 hover:bg-background hover:border-blue-500/50 transition-all cursor-pointer px-4 py-3 ${
                                bloomsSynthesis 
                                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 shadow-sm' 
                                  : 'border-border/60'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                                bloomsSynthesis ? 'border-blue-600 bg-blue-600' : 'border-muted-foreground/30'
                              }`}>
                                {bloomsSynthesis && (
                                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                )}
                              </div>
                              <span className="font-medium">Synthesis</span>
                            </Label>
                          </div>
                          <div className="relative">
                            <Checkbox 
                              id="blooms-evaluation" 
                              checked={bloomsEvaluation}
                              onCheckedChange={(checked) => setBloomsEvaluation(checked as boolean)}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor="blooms-evaluation"
                              className={`flex items-center gap-3 rounded-lg border-2 bg-background/50 hover:bg-background hover:border-blue-500/50 transition-all cursor-pointer px-4 py-3 ${
                                bloomsEvaluation 
                                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 shadow-sm' 
                                  : 'border-border/60'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                                bloomsEvaluation ? 'border-blue-600 bg-blue-600' : 'border-muted-foreground/30'
                              }`}>
                                {bloomsEvaluation && (
                                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                )}
                              </div>
                              <span className="font-medium">Evaluation</span>
                            </Label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Targeted Audience */}
            <div className="bg-gradient-to-br from-background via-emerald-500/5 to-emerald-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border-[1.5px] border-emerald-500/30">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-4 sm:space-y-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-emerald-700 dark:text-emerald-400 mb-1">Targeted Audience</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">Select the target audience for your course</p>
                  </div>
                  <div className="bg-card/50 rounded-xl p-4 sm:p-6 border border-emerald-500/20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="relative">
                        <Checkbox 
                          id="undergraduates" 
                          checked={undergraduates}
                          onCheckedChange={(checked) => setUndergraduates(checked as boolean)}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="undergraduates"
                          className={`flex items-center gap-3 rounded-lg border-2 bg-background/50 hover:bg-background hover:border-emerald-500/50 transition-all cursor-pointer px-4 py-3 ${
                            undergraduates 
                              ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 shadow-sm' 
                              : 'border-muted'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                            undergraduates ? 'border-emerald-600 bg-emerald-600' : 'border-muted-foreground/30'
                          }`}>
                            {undergraduates && (
                              <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            )}
                          </div>
                          <span className="font-medium">Undergraduates</span>
                        </Label>
                      </div>
                      <div className="relative">
                        <Checkbox 
                          id="graduates" 
                          checked={graduates}
                          onCheckedChange={(checked) => setGraduates(checked as boolean)}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="graduates"
                          className={`flex items-center gap-3 rounded-lg border-2 bg-background/50 hover:bg-background hover:border-emerald-500/50 transition-all cursor-pointer px-4 py-3 ${
                            graduates 
                              ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 shadow-sm' 
                              : 'border-muted'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                            graduates ? 'border-emerald-600 bg-emerald-600' : 'border-muted-foreground/30'
                          }`}>
                            {graduates && (
                              <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            )}
                          </div>
                          <span className="font-medium">Graduates</span>
                        </Label>
                      </div>
                      <div className="relative">
                        <Checkbox 
                          id="postgraduates" 
                          checked={postgraduates}
                          onCheckedChange={(checked) => setPostgraduates(checked as boolean)}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="postgraduates"
                          className={`flex items-center gap-3 rounded-lg border-2 bg-background/50 hover:bg-background hover:border-emerald-500/50 transition-all cursor-pointer px-4 py-3 ${
                            postgraduates 
                              ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 shadow-sm' 
                              : 'border-muted'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                            postgraduates ? 'border-emerald-600 bg-emerald-600' : 'border-muted-foreground/30'
                          }`}>
                            {postgraduates && (
                              <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            )}
                          </div>
                          <span className="font-medium">Postgraduates</span>
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Generation Guidelines */}
            <div className="bg-gradient-to-br from-background via-amber-500/5 to-amber-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border-[1.5px] border-amber-500/30">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-600 flex items-center justify-center shadow-lg">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-4 sm:space-y-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-amber-700 dark:text-amber-400 mb-1">Course Generation Guidelines</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">Provide specific guidelines for course generation</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="guidelines" className="text-base font-semibold">Guidelines:</Label>
                      <Popover open={isGuidelinesHelpOpen} onOpenChange={setIsGuidelinesHelpOpen}>
                        <PopoverTrigger asChild>
                          <div 
                            onMouseEnter={() => setIsGuidelinesHelpOpen(true)}
                            onMouseLeave={() => setIsGuidelinesHelpOpen(false)}
                          >
                            <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                              <Info className="w-4 h-4 text-blue-500" />
                            </Button>
                          </div>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-80"
                          onMouseEnter={() => setIsGuidelinesHelpOpen(true)}
                          onMouseLeave={() => setIsGuidelinesHelpOpen(false)}
                        >
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm">Help</h4>
                            <div className="space-y-2 text-sm text-muted-foreground">
                              <p>Set the preferences properly to allow the specific content creation.</p>
                              <p>Ensure the content is fact-checked and based on reliable sources.</p>
                              <p>Make content accessible to all, including those with disabilities. Use clear language, proper formatting.</p>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Textarea
                      id="guidelines"
                      value={guidelines}
                      onChange={(e) => setGuidelines(e.target.value)}
                      placeholder="Enter course generation guidelines..."
                      className="min-h-[120px] bg-background/80 backdrop-blur-sm border-2 focus:border-amber-500/50"
                    />
                    <div className="space-y-3 mt-4">
                      <div className="relative">
                        <input
                          type="file"
                          id="guidelines-file-upload"
                          multiple
                          onChange={handleGuidelinesFileUpload}
                          className="sr-only"
                        />
                        <Label
                          htmlFor="guidelines-file-upload"
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-amber-500 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer font-semibold text-sm"
                        >
                          <Upload className="w-4 h-4" />
                          Upload Guidelines Document
                        </Label>
                      </div>
                      {guidelinesFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {guidelinesFiles.map((file, index) => (
                            <div key={index} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-medium border border-amber-500/20">
                              <span>{file.name}</span>
                              <button
                                onClick={() => removeGuidelinesFile(index)}
                                className="hover:bg-amber-500/20 rounded-full p-0.5 transition-colors"
                                aria-label="Remove file"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Exclusions */}
            <div className="bg-gradient-to-br from-background via-red-500/5 to-red-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border-[1.5px] border-red-500/30">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-600 flex items-center justify-center shadow-lg">
                    <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-4 sm:space-y-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-red-700 dark:text-red-400 mb-1">Exclusions</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">Specify content or topics to exclude from the course</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="exclusions" className="text-base font-semibold">Exclusions</Label>
                      <Popover open={isExclusionsHelpOpen} onOpenChange={setIsExclusionsHelpOpen}>
                        <PopoverTrigger asChild>
                          <div 
                            onMouseEnter={() => setIsExclusionsHelpOpen(true)}
                            onMouseLeave={() => setIsExclusionsHelpOpen(false)}
                          >
                            <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                              <Info className="w-4 h-4 text-blue-500" />
                            </Button>
                          </div>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-80"
                          onMouseEnter={() => setIsExclusionsHelpOpen(true)}
                          onMouseLeave={() => setIsExclusionsHelpOpen(false)}
                        >
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm">Help</h4>
                            <div className="space-y-2 text-sm text-muted-foreground">
                              <p>Set the preferences properly to allow the specific content creation.</p>
                              <p>Ensure the content is fact-checked and based on reliable sources.</p>
                              <p>Make content accessible to all, including those with disabilities. Use clear language, proper formatting.</p>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Textarea
                      id="exclusions"
                      value={exclusions}
                      onChange={(e) => setExclusions(e.target.value)}
                      placeholder="Enter content or topics to exclude..."
                      className="min-h-[120px] bg-background/80 backdrop-blur-sm border-2 focus:border-red-500/50"
                    />
                    <div className="space-y-3 mt-4">
                      <div className="relative">
                        <input
                          type="file"
                          id="exclusions-file-upload"
                          multiple
                          onChange={handleExclusionsFileUpload}
                          className="sr-only"
                        />
                        <Label
                          htmlFor="exclusions-file-upload"
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-red-500 text-red-700 dark:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer font-semibold text-sm"
                        >
                          <Upload className="w-4 h-4" />
                          Upload Exclusions Document
                        </Label>
                      </div>
                      {exclusionsFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {exclusionsFiles.map((file, index) => (
                            <div key={index} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 text-red-700 dark:text-red-400 text-xs font-medium border border-red-500/20">
                              <span>{file.name}</span>
                              <button
                                onClick={() => removeExclusionsFile(index)}
                                className="hover:bg-red-500/20 rounded-full p-0.5 transition-colors"
                                aria-label="Remove file"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Note and Action */}
            <div className="space-y-4 sm:space-y-6 pt-2">
              {/* Generate Complete Course Checkbox */}
              <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border/60 bg-background/80 backdrop-blur-sm hover:bg-background hover:border-primary/50 transition-all">
                <Checkbox
                  id="generate-complete-course"
                  checked={generateCompleteCourse}
                  onCheckedChange={(checked) => setGenerateCompleteCourse(checked as boolean)}
                  className="h-5 w-5"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="generate-complete-course"
                    className="text-sm font-semibold text-foreground cursor-pointer"
                  >
                    Generate Complete Course
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Create a full course with all content and materials
                  </p>
                </div>
              </div>

              <div className="text-xs sm:text-sm text-muted-foreground">
                <span className="font-medium">Note:</span>{" "}
                <span className="italic">
                  The number of questions generated for each {level5Name.charAt(0).toUpperCase() + level5Name.slice(1)} and exported as part of the SCORM will depend on the generated content and the total number of questions generated in the course.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/dashboard")}
                  className="border-2 h-10 sm:h-12 px-4 sm:px-6 hover:bg-primary/10 hover:border-primary text-sm sm:text-base w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button 
                  size="lg" 
                  onClick={handleGenerateCourse}
                  className="px-6 sm:px-8 h-10 sm:h-12 text-sm sm:text-base bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                >
                  Generate Course
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Blueprint Selection Dialog */}
      <Dialog open={isBlueprintDialogOpen} onOpenChange={setIsBlueprintDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0 mx-4">
          <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b flex-row items-center justify-between">
            <div className="text-sm font-semibold text-muted-foreground">
              Total: {blueprints.filter((bp) =>
                bp.title.toLowerCase().includes(searchQuery.toLowerCase())
              ).length}
            </div>
            <DialogTitle className="text-lg sm:text-2xl font-bold flex-1 text-center">Select Blueprint</DialogTitle>
          </DialogHeader>
          
          {/* Search Bar */}
          <div className="px-4 sm:px-6 pt-3 sm:pt-4">
            <div className="relative">
              <Input
                placeholder="Search blueprint..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 pl-4 pr-12 text-base border-2 focus:border-primary/50"
              />
              <Button 
                size="icon" 
                className="absolute right-0 top-0 h-11 w-11 rounded-l-none"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Blueprints List */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4">
            <RadioGroup value={selectedBlueprint} onValueChange={setSelectedBlueprint}>
              <div className="space-y-1.5">
                {blueprints
                  .filter((bp) =>
                    bp.title.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((blueprint) => (
                    <div key={blueprint.id} className="relative">
                      <RadioGroupItem
                        value={blueprint.id}
                        id={`blueprint-${blueprint.id}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`blueprint-${blueprint.id}`}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 rounded-lg border-2 border-muted bg-card/50 hover:bg-accent/20 hover:border-primary/20 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:shadow-sm transition-all cursor-pointer p-2.5 sm:p-2.5"
                      >
                        <div className="flex items-center justify-center flex-shrink-0">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            selectedBlueprint === blueprint.id 
                              ? 'border-primary bg-primary' 
                              : 'border-muted-foreground/30'
                          }`}>
                            {selectedBlueprint === blueprint.id && (
                              <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-1 truncate">
                            {blueprint.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 sm:gap-3 text-[10px] sm:text-xs">
                            <div className="flex items-center gap-1">
                              <span className="font-medium italic text-foreground/70">Course Units:</span>
                              <span className="text-muted-foreground">{blueprint.units}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium italic text-foreground/70">Generated:</span>
                              <span className="text-muted-foreground">{blueprint.generated}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium italic text-foreground/70">Date:</span>
                              <span className="text-muted-foreground">{blueprint.date}</span>
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
              </div>
            </RadioGroup>
          </div>

          {/* Footer */}
          <DialogFooter className="px-4 sm:px-6 py-3 sm:py-4 border-t bg-muted/20">
            <div className="flex gap-3 w-full justify-end">
              <Button
                variant="outline"
                onClick={() => setIsBlueprintDialogOpen(false)}
                className="px-6 h-10"
              >
                Close
              </Button>
              <Button
                onClick={() => setIsBlueprintDialogOpen(false)}
                className="px-6 h-10"
              >
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">Confirm Course Generation</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-2">
              Course generation is a one-time process. Please ensure that Blueprint selection and preferences are accurate. Are you sure, you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmGeneration}
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
            >
              Yes, Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generation Processing Dialog */}
      <Dialog open={isGeneratingDialogOpen} onOpenChange={setIsGeneratingDialogOpen}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">Course Generation</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-2">
              Course generation may take a few minutes. You'll be redirected to the Home page, and the course will appear in the Home page once it is generated.
            </DialogDescription>
          </DialogHeader>
          
          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">Generating your course...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Course Units Dialog */}
      <Dialog open={showCourseUnitsDialog} onOpenChange={setShowCourseUnitsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Configure Course Hierarchy</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-2">
              Define the structure of your course by specifying the number of units at each level.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Chapters - Always visible */}
            <div className="space-y-3 p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold text-primary">
                  No. of Chapters <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-3">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => updateCourseUnit('chapters', false)}
                    disabled={courseUnits.chapters === 0}
                    className="h-8 w-8"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-lg font-bold min-w-[3ch] text-center">
                    {courseUnits.chapters}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => updateCourseUnit('chapters', true)}
                    className="h-8 w-8"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Modules per Chapter */}
            {activeLevels.modulesPerChapter && (
              <div className="space-y-3 p-4 rounded-lg border-2 border-blue-600/20 bg-blue-50/50 dark:bg-blue-950/20">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold text-blue-700 dark:text-blue-400">
                    No. of Modules per Chapter
                  </Label>
                  <div className="flex items-center gap-3">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteLevel('modulesPerChapter')}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateCourseUnit('modulesPerChapter', false)}
                      disabled={courseUnits.modulesPerChapter === 0}
                      className="h-8 w-8"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-lg font-bold min-w-[3ch] text-center">
                      {courseUnits.modulesPerChapter}
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateCourseUnit('modulesPerChapter', true)}
                      className="h-8 w-8"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Topics per Module */}
            {activeLevels.topicsPerModule && (
              <div className="space-y-3 p-4 rounded-lg border-2 border-teal-600/20 bg-teal-50/50 dark:bg-teal-950/20">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold text-teal-700 dark:text-teal-400">
                    No. of Topics per Module
                  </Label>
                  <div className="flex items-center gap-3">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteLevel('topicsPerModule')}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateCourseUnit('topicsPerModule', false)}
                      disabled={courseUnits.topicsPerModule === 0}
                      className="h-8 w-8"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-lg font-bold min-w-[3ch] text-center">
                      {courseUnits.topicsPerModule}
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateCourseUnit('topicsPerModule', true)}
                      className="h-8 w-8"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Subtopics per Topic */}
            {activeLevels.subtopicsPerTopic && (
              <div className="space-y-3 p-4 rounded-lg border-2 border-purple-600/20 bg-purple-50/50 dark:bg-purple-950/20">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold text-purple-700 dark:text-purple-400">
                    No. of Subtopics per Topic
                  </Label>
                  <div className="flex items-center gap-3">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteLevel('subtopicsPerTopic')}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateCourseUnit('subtopicsPerTopic', false)}
                      disabled={courseUnits.subtopicsPerTopic === 0}
                      className="h-8 w-8"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-lg font-bold min-w-[3ch] text-center">
                      {courseUnits.subtopicsPerTopic}
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateCourseUnit('subtopicsPerTopic', true)}
                      className="h-8 w-8"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Learning Outcomes per Subtopic */}
            {activeLevels.learningOutcomesPerSubtopic && (
              <div className="space-y-3 p-4 rounded-lg border-2 border-orange-600/20 bg-orange-50/50 dark:bg-orange-950/20">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold text-orange-700 dark:text-orange-400">
                    No. of Learning Outcomes per Subtopic
                  </Label>
                  <div className="flex items-center gap-3">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteLevel('learningOutcomesPerSubtopic')}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateCourseUnit('learningOutcomesPerSubtopic', false)}
                      disabled={courseUnits.learningOutcomesPerSubtopic === 0}
                      className="h-8 w-8"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-lg font-bold min-w-[3ch] text-center">
                      {courseUnits.learningOutcomesPerSubtopic}
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateCourseUnit('learningOutcomesPerSubtopic', true)}
                      className="h-8 w-8"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Add Next Level Button */}
            {canAddNextLevel() && (
              <Button
                variant="outline"
                onClick={addNextLevel}
                className="w-full border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Next Level
              </Button>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                resetCourseUnits();
                setShowCourseUnitsDialog(false);
              }}
            >
              Reset
            </Button>
            <Button
              onClick={saveCourseUnits}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modify Course Structure Dialog */}
      <ModifyStructureDialog
        open={isModifyStructureDialogOpen}
        onOpenChange={setIsModifyStructureDialogOpen}
      />
    </div>
  );
};

export default CreateCourse;
