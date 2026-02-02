import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Copy, 
  Trash2, 
  Eye, 
  BarChart3, 
  Home, 
  ChevronRight,
  FileText,
  Image as ImageIcon,
  List,
  Settings,
  BookOpen,
  Layout,
  Sparkles,
  ChevronDown,
  HelpCircle,
  Layers,
  Users,
  Check,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { courseApi } from "@/services/courseApi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/Header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog } from "@/components/ui/dialog";
import { TokenConsumptionDialog } from "@/components/EditCourse/TokenConsumptionDialog";
import { IntroductionDialog } from "@/components/EditCourse/IntroductionDialog";
import { ImageDialog } from "@/components/EditCourse/ImageDialog";
import { ChaptersSection, mockChapters } from "@/components/EditCourse/ChaptersSection";
import { mockVersionHistory, mockImageVersionHistory, layoutTemplates } from "@/components/EditCourse/constants";
import { MetricsDialog } from "@/components/EditCourse/MetricsDialog";
import { CloneCourseDialog } from "@/components/EditCourse/CloneCourseDialog";
import { DeleteCourseDialog } from "@/components/EditCourse/DeleteCourseDialog";
import { ModifyStructureDialog } from "@/components/EditCourse/ModifyStructureDialog";

const EditCourse = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [tokensConsumed, setTokensConsumed] = useState(14421);
  const [isTokenDialogOpen, setIsTokenDialogOpen] = useState(false);
  const [isIntroductionDialogOpen, setIsIntroductionDialogOpen] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

  // Image dialog states
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [showImageVersions, setShowImageVersions] = useState(false);
  const [selectedImageVersion, setSelectedImageVersion] = useState<number | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Metrics dialog state
  const [isMetricsDialogOpen, setIsMetricsDialogOpen] = useState(false);
  
  // Clone dialog state
  const [isCloneDialogOpen, setIsCloneDialogOpen] = useState(false);
  const [isCloning, setIsCloning] = useState(false);

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modify structure dialog state
  const [isModifyStructureDialogOpen, setIsModifyStructureDialogOpen] = useState(false);

  // Mock data from constants
  const [versionHistory] = useState(mockVersionHistory);
  const [imageVersionHistory] = useState(mockImageVersionHistory);
  
  // Course Details State
  const [title, setTitle] = useState("");
  const [selectedLayout, setSelectedLayout] = useState("layout1");
  const [courseIntroduction, setCourseIntroduction] = useState("");
  const [courseImage, setCourseImage] = useState("");
  
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
  const [applyBloomsTaxonomy, setApplyBloomsTaxonomy] = useState(true);
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

  const [activeSection, setActiveSection] = useState("preferences");

  useEffect(() => {
    // TODO: Fetch course data using courseId
    // For now, just simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [courseId]);

  const handleCopy = useCallback(() => {
    setIsCloneDialogOpen(true);
  }, []);

  const handleCloneCourse = useCallback(async (newTitle: string) => {
    setIsCloning(true);
    try {
      // TODO: Implement actual cloning API call
      // const clonedCourse = await courseApi.createCourse({ ...courseData, title: newTitle });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsCloneDialogOpen(false);
      toast({
        title: "Course Cloned Successfully",
        description: `"${newTitle}" has been created and added to your dashboard.`,
      });
      
      // Optionally navigate to dashboard
      // navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Clone Failed",
        description: error instanceof Error ? error.message : "Failed to clone the course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCloning(false);
    }
  }, [toast]);

  const handleModifyStructure = useCallback(() => {
    setIsModifyStructureDialogOpen(true);
  }, []);

  const handleDelete = useCallback(() => {
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteCourse = async () => {
    setIsDeleting(true);
    try {
      // Simulate API call to delete course
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Course Deleted",
        description: "The course has been successfully deleted.",
      });
      
      // Navigate back to dashboard after deletion
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete the course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handlePreview = useCallback(() => {
    // Navigate to preview page with course data
    navigate(`/course-preview/${courseId}`, {
      state: {
        title,
        courseIntroduction,
        courseImage,
        selectedLayout,
        chapters: mockChapters
      }
    });
  }, [navigate, courseId, title, courseIntroduction, courseImage, selectedLayout]);

  const handleViewMetrics = useCallback(() => {
    setIsMetricsDialogOpen(true);
  }, []);

  const handleClose = () => {
    navigate("/dashboard");
  };

  // Chapter action handlers
  const handleEditChapterOverview = (chapterId: string) => {
    toast({
      title: "Edit Chapter",
      description: `Editing chapter: ${chapterId}`,
    });
  };

  const handleRegenerateChapterImage = (chapterId: string) => {
    toast({
      title: "Regenerate Image",
      description: `Regenerating image for: ${chapterId}`,
    });
  };

  const handleGenerateChapterQuiz = (chapterId: string) => {
    toast({
      title: "Generate Quiz",
      description: `Generating quiz for: ${chapterId}`,
    });
  };

  const handleGenerateCompleteChapter = (chapterId: string) => {
    toast({
      title: "Generate Complete Chapter",
      description: `Generating complete chapter: ${chapterId}`,
    });
  };

  const handleSave = async () => {
    try {
      toast({
        title: "Saving Course",
        description: "Your changes are being saved...",
      });
      
      // TODO: Call update API
      
      toast({
        title: "Course Saved",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to Save",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleSaveIntroduction = useCallback(() => {
    setCourseIntroduction(editorContent);
    setIsIntroductionDialogOpen(false);
    setShowVersions(false);
    toast({
      title: "Introduction Updated",
      description: "Course introduction has been saved successfully.",
    });
  }, [editorContent, toast]);

  const handleViewVersion = useCallback((versionId: number) => {
    const version = versionHistory.find(v => v.id === versionId);
    if (version) {
      setSelectedVersion(versionId);
      setEditorContent(version.content);
    }
  }, [versionHistory]);

  const handleRestoreVersion = useCallback(() => {
    setShowVersions(false);
    setSelectedVersion(null);
    toast({
      title: "Version Selected",
      description: "You can now edit or save this version.",
    });
  }, [toast]);

  const handleCloseIntroductionDialog = useCallback(() => {
    setIsIntroductionDialogOpen(false);
    setShowVersions(false);
    setSelectedVersion(null);
  }, []);

  const handleViewImageVersion = useCallback((versionId: number) => {
    const version = imageVersionHistory.find(v => v.id === versionId);
    if (version) {
      setSelectedImageVersion(versionId);
      setCourseImage(version.imageUrl);
    }
  }, [imageVersionHistory]);

  const handleRestoreImageVersion = useCallback(() => {
    setShowImageVersions(false);
    setSelectedImageVersion(null);
    toast({
      title: "Version Selected",
      description: "You can now use this image version.",
    });
  }, [toast]);

  const handleSaveImage = useCallback(() => {
    setIsImageDialogOpen(false);
    setShowImageVersions(false);
    setSelectedImageVersion(null);
    toast({
      title: "Image Updated",
      description: "Course image has been saved successfully.",
    });
  }, [toast]);

  const handleRegenerateImage = async () => {
    setIsGeneratingImage(true);
    try {
      // Simulate AI image generation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      const newImageUrl = `https://images.unsplash.com/photo-${Date.now()}?w=800&auto=format&fit=crop`;
      setCourseImage(newImageUrl);
      toast({
        title: "Image Generated",
        description: "New image has been generated by AI.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleUploadImage = () => {
    // Trigger file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageUrl = event.target?.result as string;
          setCourseImage(imageUrl);
          toast({
            title: "Image Uploaded",
            description: "Image has been uploaded successfully.",
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleCloseImageDialog = () => {
    setIsImageDialogOpen(false);
    setShowImageVersions(false);
    setSelectedImageVersion(null);
  };

  const handleRegenerateIntroduction = async () => {
    setIsRegenerating(true);
    try {
      // Simulate AI regeneration - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      const regeneratedContent = `<h2>Welcome to ${title || 'Your Course'}</h2><p>This comprehensive course is designed to provide you with in-depth knowledge and practical skills. Through carefully structured modules and engaging content, you'll gain expertise in key concepts and real-world applications.</p><p>Our curriculum combines theoretical foundations with hands-on practice, ensuring you develop both understanding and proficiency. Whether you're a beginner or looking to advance your knowledge, this course offers valuable insights and learning opportunities.</p>`;
      setEditorContent(regeneratedContent);
      toast({
        title: "Content Regenerated",
        description: "New introduction content has been generated by AI.",
      });
    } catch (error) {
      toast({
        title: "Regeneration Failed",
        description: "Failed to regenerate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showTokens tokenCount="932,679" />

      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <nav className="flex items-center gap-2 text-xs sm:text-sm overflow-x-auto">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
            >
              <Home className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium whitespace-nowrap">Dashboard</span>
            </button>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-foreground font-semibold whitespace-nowrap">Edit Course</span>
          </nav>
        </div>
      </div>

      {/* Token Consumption Header */}
      <div className="border-b bg-card/50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              onClick={() => setIsTokenDialogOpen(true)}
              className="inline-flex items-center justify-center gap-2 h-9 px-3 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary hover:border-primary/50 transition-all"
            >
              <Coins className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">{tokensConsumed.toLocaleString()} tokens</span>
            </button>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:ml-auto">
              <Button variant="outline" size="sm" onClick={handlePreview} className="w-full sm:w-auto">
                <Eye className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline ml-2">Preview</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleModifyStructure} className="w-full sm:w-auto hidden sm:flex">
                <Layout className="w-4 h-4 mr-2" />
                Modify
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopy} className="w-full sm:w-auto">
                <Copy className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline ml-2">Clone</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleViewMetrics} className="w-full sm:w-auto hidden sm:flex">
                <BarChart3 className="w-4 h-4 mr-2" />
                Metrics
              </Button>
              <Button variant="outline" size="sm" onClick={handleDelete} className="w-full sm:w-auto hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors">
                <Trash2 className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline ml-2">Delete</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Token Details Dialog */}
      <TokenConsumptionDialog 
        open={isTokenDialogOpen}
        onClose={() => setIsTokenDialogOpen(false)}
        imageVersionHistory={imageVersionHistory}
      />

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          {/* Course Title */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Introduction to Web Development</h1>
            <p className="text-sm text-muted-foreground">Review and manage your course</p>
          </div>

         {/* Navigation Tabs */}
         <div className="sticky top-0 z-50 bg-gradient-to-br from-background via-muted/30 to-muted/50 rounded-xl sm:rounded-2xl p-2 border-[1.5px] border-border/50 backdrop-blur-md transition-all duration-500 ease-out hover:shadow-lg hover:border-border">
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
               <button
                 onClick={() => setActiveSection("preferences")}
                 className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-3 sm:py-4 rounded-lg font-semibold text-xs sm:text-sm md:text-base transition-all ${
                   activeSection === "preferences"
                     ? "bg-primary text-primary-foreground shadow-md"
                     : "hover:bg-muted/50"
                 }`}
               >
                 <Settings className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                 <span className="hidden sm:inline">Preferences</span>
                 <span className="sm:hidden truncate">Prefs</span>
               </button>
               <button
                 onClick={() => setActiveSection("introduction")}
                 className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-3 sm:py-4 rounded-lg font-semibold text-xs sm:text-sm md:text-base transition-all ${
                   activeSection === "introduction"
                     ? "bg-primary text-primary-foreground shadow-md"
                     : "hover:bg-muted/50"
                 }`}
               >
                 <FileText className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                 <span className="hidden sm:inline">Introduction</span>
                 <span className="sm:hidden truncate">Intro</span>
               </button>
               <button
                 onClick={() => setActiveSection("chapters")}
                 className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-3 sm:py-4 rounded-lg font-semibold text-xs sm:text-sm md:text-base transition-all ${
                   activeSection === "chapters"
                     ? "bg-primary text-primary-foreground shadow-md"
                     : "hover:bg-muted/50"
                 }`}
               >
                 <List className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                 <span className="hidden sm:inline">Chapters</span>
                 <span className="sm:hidden truncate">Chap</span>
               </button>
             </div>
          </div>

          {/* Preferences Section */}
          {activeSection === "preferences" && (
            <div className="space-y-6">
              {/* Level Names */}
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
                      <p className="text-xs sm:text-sm text-muted-foreground">Configure content duration and chapter settings</p>
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
                            <SelectItem value="chapter">Each Chapter</SelectItem>
                            <SelectItem value="unit">Each Course Unit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="chapter-span" className="text-sm sm:text-base font-semibold">
                          Chapter Span Time (In Minutes) <span className="text-destructive">*</span>
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
                    <div className="bg-card/50 rounded-xl p-4 sm:p-6 border border-cyan-500/20">
                      <RadioGroup value={imageGeneration} onValueChange={setImageGeneration}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                            <RadioGroupItem value="each-chapter" id="img-each-chapter" className="peer sr-only" />
                            <Label
                              htmlFor="img-each-chapter"
                              className="flex items-center gap-3 rounded-lg border-2 border-border/60 bg-background/50 hover:bg-background hover:border-cyan-500/50 peer-data-[state=checked]:border-cyan-600 peer-data-[state=checked]:bg-cyan-50 dark:peer-data-[state=checked]:bg-cyan-950/50 peer-data-[state=checked]:shadow-sm transition-all cursor-pointer px-4 py-3"
                            >
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                                imageGeneration === "each-chapter" ? 'border-cyan-600 bg-cyan-600' : 'border-muted-foreground/30'
                              }`}>
                                {imageGeneration === "each-chapter" && (
                                  <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                              </div>
                              <span className="font-medium">Each Chapter</span>
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
                        <div className="space-y-1 mt-4">
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
                    <div className="bg-card/50 rounded-xl p-4 sm:p-6 border border-orange-500/20">
                      <RadioGroup value={questionGeneration} onValueChange={setQuestionGeneration}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                            <RadioGroupItem value="each-chapter" id="q-each-chapter" className="peer sr-only" />
                            <Label
                              htmlFor="q-each-chapter"
                              className="flex items-center gap-3 rounded-lg border-2 border-border/60 bg-background/50 hover:bg-background hover:border-orange-500/50 peer-data-[state=checked]:border-orange-600 peer-data-[state=checked]:bg-orange-50 dark:peer-data-[state=checked]:bg-orange-950/50 peer-data-[state=checked]:shadow-sm transition-all cursor-pointer px-4 py-3"
                            >
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                                questionGeneration === "each-chapter" ? 'border-orange-600 bg-orange-600' : 'border-muted-foreground/30'
                              }`}>
                                {questionGeneration === "each-chapter" && (
                                  <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                              </div>
                              <span className="font-medium">Each Chapter</span>
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
                      
                      {/* Level Selection for Specific Unit */}
                      {questionGeneration === "specific-unit" && (
                        <div className="space-y-1 mt-4">
                          <Label className="text-sm font-semibold">Select Levels</Label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 w-full md:w-1/2 lg:w-1/4">
                            {[
                              { value: "level1", label: level1Name },
                              { value: "level2", label: level2Name },
                              { value: "level3", label: level3Name },
                            ].map((level) => (
                              <div key={level.value} className="flex items-center gap-1 w-fit">
                                <Checkbox
                                  id={`q-${level.value}`}
                                  checked={selectedQuestionLevels.includes(level.value)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedQuestionLevels([...selectedQuestionLevels, level.value]);
                                    } else {
                                      setSelectedQuestionLevels(selectedQuestionLevels.filter(l => l !== level.value));
                                    }
                                  }}
                                />
                                <Label
                                  htmlFor={`q-${level.value}`}
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

              {/* SCORM Export */}
              <div className="bg-gradient-to-br from-background via-purple-500/5 to-purple-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border-[1.5px] border-purple-500/30">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-4 sm:space-y-5">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-semibold text-purple-700 dark:text-purple-400 mb-1">SCORM Export</h2>
                      <p className="text-xs sm:text-sm text-muted-foreground">Configure SCORM export settings and question hierarchy</p>
                    </div>
                    
                    <div className="space-y-4 sm:space-y-6">
                      {/* Question Display Hierarchy */}
                      <div className="bg-card/50 rounded-xl p-4 sm:p-6 border border-purple-500/20">
                        <Label className="text-base font-semibold mb-4 block flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-600" />
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
                          <div className="space-y-1 mt-4">
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
                                : 'border-border/60'
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
                                : 'border-border/60'
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
                                : 'border-border/60'
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
                      <Label htmlFor="guidelines" className="text-base font-semibold">Guidelines:</Label>
                      <Textarea
                        id="guidelines"
                        value={guidelines}
                        onChange={(e) => setGuidelines(e.target.value)}
                        placeholder="Enter course generation guidelines..."
                        className="min-h-[120px] bg-background/80 backdrop-blur-sm border-2 focus:border-amber-500/50"
                      />
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
                      <Label htmlFor="exclusions" className="text-base font-semibold">Exclusions</Label>
                      <Textarea
                        id="exclusions"
                        value={exclusions}
                        onChange={(e) => setExclusions(e.target.value)}
                        placeholder="Enter content or topics to exclude..."
                        className="min-h-[120px] bg-background/80 backdrop-blur-sm border-2 focus:border-red-500/50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Course Introduction Section */}
          {activeSection === "introduction" && (
            <div className="space-y-6">
              {/* Introduction Content */}
              <div className="bg-gradient-to-br from-background via-blue-500/5 to-blue-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border-[1.5px] border-blue-500/30">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-4 sm:space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-semibold text-blue-700 dark:text-blue-400 mb-1">Course Introduction</h2>
                        <p className="text-xs sm:text-sm text-muted-foreground">Your course introduction content</p>
                      </div>
                      <Button
                        onClick={() => setIsIntroductionDialogOpen(true)}
                        className="flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        Edit Course
                      </Button>
                    </div>
                    <div className="min-h-[200px] bg-background/80 backdrop-blur-sm border-2 border-border rounded-lg p-4">
                      {courseIntroduction ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <p className="whitespace-pre-wrap text-foreground">{courseIntroduction}</p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No introduction added yet. Click "Edit Course" to add one.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Image */}
              <div className="bg-gradient-to-br from-background via-purple-500/5 to-purple-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border-[1.5px] border-purple-500/30">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg">
                      <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-4 sm:space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-semibold text-purple-700 dark:text-purple-400 mb-1">Course Image</h2>
                        <p className="text-xs sm:text-sm text-muted-foreground">Your course visual</p>
                      </div>
                      <Button
                        onClick={() => setIsImageDialogOpen(true)}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                      >
                        <Sparkles className="w-4 h-4" />
                        Edit Image
                      </Button>
                    </div>
                    <div className="min-h-[200px] bg-background/80 backdrop-blur-sm border-2 border-border rounded-lg p-4 flex items-center justify-center">
                      {courseImage ? (
                        <img 
                          src={courseImage} 
                          alt="Course" 
                          className="max-w-full max-h-[400px] rounded-lg object-contain"
                        />
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground text-sm">No image added yet. Click "Edit Image" to add one.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chapters Section */}
          {activeSection === "chapters" && (
            <div className="bg-gradient-to-br from-background via-green-500/5 to-green-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border-[1.5px] border-green-500/30">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-600 flex items-center justify-center shadow-lg">
                    <List className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-semibold text-green-700 dark:text-green-400 mb-1">Course Chapters</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">Manage your course structure and chapters</p>
                </div>
              </div>
              <ChaptersSection
                onEditChapter={handleEditChapterOverview}
                onRegenerateImage={handleRegenerateChapterImage}
                onGenerateQuiz={handleGenerateChapterQuiz}
                onGenerateCompleteChapter={handleGenerateCompleteChapter}
              />
            </div>
          )}

          {/* Navigation and Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
            {/* Navigation Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const sections = ["preferences", "introduction", "image", "chapters"];
                  const currentIndex = sections.indexOf(activeSection);
                  if (currentIndex > 0) {
                    setActiveSection(sections[currentIndex - 1]);
                  }
                }}
                disabled={activeSection === "preferences"}
                className="border-2 hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
              >
                <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const sections = ["preferences", "introduction", "image", "chapters"];
                  const currentIndex = sections.indexOf(activeSection);
                  if (currentIndex < sections.length - 1) {
                    setActiveSection(sections[currentIndex + 1]);
                  }
                }}
                disabled={activeSection === "chapters"}
                className="border-2 hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleClose}
                className="w-full sm:w-auto border-2 hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                className="w-full sm:w-auto shadow-md"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        {/* Introduction Editor Dialog */}
        <IntroductionDialog 
          open={isIntroductionDialogOpen}
          onClose={handleCloseIntroductionDialog}
          editorContent={editorContent}
          onEditorContentChange={setEditorContent}
          onSave={handleSaveIntroduction}
          onRegenerate={handleRegenerateIntroduction}
          isRegenerating={isRegenerating}
          showVersions={showVersions}
          onShowVersionsChange={setShowVersions}
          selectedVersion={selectedVersion}
          versionHistory={versionHistory}
          onViewVersion={handleViewVersion}
          onRestoreVersion={handleRestoreVersion}
        />

        {/* Image Editor Dialog */}
        <ImageDialog 
          open={isImageDialogOpen}
          onClose={handleCloseImageDialog}
          courseImage={courseImage}
          onSave={handleSaveImage}
          onRegenerate={handleRegenerateImage}
          onUpload={handleUploadImage}
          isGenerating={isGeneratingImage}
          showVersions={showImageVersions}
          onShowVersionsChange={setShowImageVersions}
          selectedVersion={selectedImageVersion}
          imageVersionHistory={imageVersionHistory}
          onViewVersion={handleViewImageVersion}
          onRestoreVersion={handleRestoreImageVersion}
        />

        {/* Metrics Dialog */}
        <MetricsDialog
          open={isMetricsDialogOpen}
          onOpenChange={setIsMetricsDialogOpen}
          courseName={title || "Rational Numbers and Decimal Systems - Foundation Course"}
          tokensConsumed={tokensConsumed}
          chapters={mockChapters}
        />

        {/* Clone Course Dialog */}
        <CloneCourseDialog
          open={isCloneDialogOpen}
          onClose={setIsCloneDialogOpen}
          onClone={handleCloneCourse}
          currentTitle={title || "Course"}
          isCloning={isCloning}
        />

        {/* Delete Course Dialog */}
        <DeleteCourseDialog
          open={isDeleteDialogOpen}
          onClose={setIsDeleteDialogOpen}
          onDelete={handleDeleteCourse}
          courseTitle={title || "Course"}
          isDeleting={isDeleting}
        />

        {/* Modify Structure Dialog */}
        <ModifyStructureDialog
          open={isModifyStructureDialogOpen}
          onOpenChange={setIsModifyStructureDialogOpen}
        />
      </div>
    </div>
  );
};

export default EditCourse;
