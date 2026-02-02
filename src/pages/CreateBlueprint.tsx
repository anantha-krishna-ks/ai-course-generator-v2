import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Layout, Home, ChevronRight, Sparkles, X, Plus, Minus, Trash2, Check, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { blueprintApi, BlueprintApiError } from "@/services/blueprintApi";
import { BlueprintCreateRequest } from "@/types/blueprint";
import { z } from "zod";

// Validation schema for blueprint creation
const blueprintSchema = z.object({
  Title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  BlueprintType: z.number().int().min(0).max(1),
  LayoutType: z.number().int().min(0),
  Operation: z.literal(1),
  BlueprintStatus: z.number().int().min(0),
  NoOfLevels: z.number().int().min(1, "At least one level is required"),
});

const CreateBlueprint = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [generateOption, setGenerateOption] = useState("manual");
  const [selectedLayout, setSelectedLayout] = useState("layout1");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showCourseUnitsDialog, setShowCourseUnitsDialog] = useState(false);
  const [showLayoutPreview, setShowLayoutPreview] = useState(false);
  const [previewLayout, setPreviewLayout] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('api_token'));
  
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
    chapters: true, // Always active, can't be deleted
    modulesPerChapter: false,
    topicsPerModule: false,
    subtopicsPerTopic: false,
    learningOutcomesPerSubtopic: false,
  });

  // Track if hierarchy has been saved to display it
  const [hierarchySaved, setHierarchySaved] = useState(false);

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

  const downloadPdfTemplate = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("Blueprint Structure Template", 20, 20);
    
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
    
    doc.save("blueprint-template.pdf");
    
    toast({
      title: "PDF Downloaded",
      description: "Your PDF template has been downloaded successfully.",
    });
  };

  const downloadWordTemplate = async () => {
    const structure = [
      { text: "Blueprint Structure Template", bold: true, size: 32, spacing: true },
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
    link.download = "blueprint-template.docx";
    link.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Word Document Downloaded",
      description: "Your Word template has been downloaded successfully.",
    });
  };

  const handleGenerateBlueprint = async () => {
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a blueprint title to continue.",
        variant: "destructive",
      });
      return;
    }

    // For Manual Generation, go directly to editor
    if (generateOption === "manual") {
      navigate("/blueprint-editor", {
        state: {
          title,
          generateOption,
          selectedLayout,
          uploadedFiles,
          courseUnits: hierarchySaved ? courseUnits : null,
        }
      });
      return;
    }

    // For other options, call the API to create blueprint
    setIsCreating(true);
    toast({
      title: "Creating Blueprint",
      description: "Your blueprint is being created...",
    });

    try {
      // Prepare the API request
      const blueprintData: BlueprintCreateRequest = {
        Title: title,
        BlueprintType: generateOption === "upload" ? 1 : 0,
        LayoutType: parseInt(selectedLayout.replace("layout", "")) - 1,
        Operation: 1,
        BlueprintStatus: 0, // Draft
        NoOfLevels: Object.values(activeLevels).filter(Boolean).length,
        Levels: hierarchySaved ? {
          chapters: courseUnits.chapters,
          modules: courseUnits.modulesPerChapter,
          topics: courseUnits.topicsPerModule,
          subtopics: courseUnits.subtopicsPerTopic,
          learningOutcomes: courseUnits.learningOutcomesPerSubtopic,
        } : undefined,
        AIConfigs: hierarchySaved ? [{
          CourseUnitCount: courseUnits.chapters,
          Level: 0,
        }] : undefined,
      };

      // Validate the blueprint data
      const validationResult = blueprintSchema.safeParse(blueprintData);
      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive",
        });
        return;
      }

      // Create the blueprint via API
      const response = await blueprintApi.createBlueprint(blueprintData);

      toast({
        title: "Blueprint Created",
        description: "Your blueprint has been created successfully.",
      });

      // Navigate to editor with the created blueprint data
      navigate("/blueprint-editor", {
        state: {
          blueprintId: response.Id,
          title: response.Title,
          generateOption,
          selectedLayout,
          uploadedFiles,
          courseUnits: hierarchySaved ? courseUnits : null,
        }
      });
    } catch (error) {
      console.error("Blueprint creation error:", error);
      
      if (error instanceof BlueprintApiError) {
        const statusHint = error.statusCode === 401 
          ? " (HTTP 401: Please check your API token configuration)"
          : error.statusCode 
            ? ` (HTTP ${error.statusCode})`
            : "";
            
        toast({
          title: "Failed to Create Blueprint",
          description: error.message + statusHint,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to Create Blueprint",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsCreating(false);
    }
  };

  const updateCourseUnit = (field: keyof typeof courseUnits, increment: boolean) => {
    setCourseUnits(prev => ({
      ...prev,
      [field]: Math.max(0, prev[field] + (increment ? 1 : -1))
    }));
  };

  const deleteLevel = (level: keyof typeof activeLevels) => {
    if (level === 'chapters') return; // Can't delete chapters
    
    // Reset the count for this level
    setCourseUnits(prev => ({ ...prev, [level]: 0 }));
    
    // Deactivate this level and all levels below it
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
    
    // Find the first inactive level
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

  const handleLogin = async () => {
    // Validation
    if (!loginId.trim() || !password.trim()) {
      toast({
        title: "Login Failed",
        description: "Please enter both Login ID and Password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoggingIn(true);

    try {
      const response = await fetch("https://seab-testing.excelindia.com/contentv3api/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          LoginId: loginId.trim(),
          Password: password.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Check if login was successful (Status: 0 = success, 2 = error)
      if (data.Status !== 0) {
        throw new Error(data.Message || "Login failed");
      }
      
      // Token is in the Message field
      const token = data.Message;
      
      if (!token) {
        throw new Error("No authentication token received from server");
      }

      // Store the token
      localStorage.setItem('api_token', token);
      setIsLoggedIn(true);
      setShowLoginDialog(false);
      setPassword(""); // Clear password for security
      
      toast({
        title: "Login Successful",
        description: "You are now authenticated and can create blueprints.",
      });
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Failed to authenticate. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('api_token');
    setIsLoggedIn(false);
    setLoginId("");
    setPassword("");
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showTokens tokenCount="932,679" />

      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <nav className="flex items-center gap-2 text-xs sm:text-sm">
            <button
              onClick={() => navigate("/blueprints")}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="font-medium">Blueprints</span>
            </button>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-semibold">Create Blueprint</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Title Section */}
        <div className="bg-gradient-to-br from-background via-primary/5 to-primary/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border-[1.5px] border-primary/30">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
            </div>
            <div className="flex-1 space-y-4 sm:space-y-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-primary mb-1">
                  Title <span className="text-destructive">*</span>
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">Give your blueprint a descriptive name</p>
              </div>
              <div className="space-y-2">
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title of the Blueprint"
                  className="h-10 sm:h-12 text-sm sm:text-base bg-background/80 backdrop-blur-sm border-2 focus:border-primary/50 shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Generate Blueprint Section */}
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
                  Generate Blueprint: <span className="text-destructive">*</span>
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">Choose how you want to create your blueprint</p>
              </div>
              <RadioGroup value={generateOption} onValueChange={setGenerateOption}>
                <div className="space-y-3">
                  <div className="relative">
                    <RadioGroupItem
                      value="upload"
                      id="upload"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="upload"
                      className="flex items-center gap-4 rounded-xl border-2 border-border/60 bg-background/80 backdrop-blur-sm hover:bg-background hover:border-blue-500/50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 dark:peer-data-[state=checked]:bg-blue-950/50 peer-data-[state=checked]:shadow-md transition-all cursor-pointer p-4 sm:p-5"
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        generateOption === "upload"
                          ? 'border-blue-600 bg-blue-600' 
                          : 'border-muted-foreground/30'
                      }`}>
                        {generateOption === "upload" && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">Import from Template</p>
                      </div>
                    </Label>
                    
                    {/* Import from Template Content */}
                    {generateOption === "upload" && (
                      <div className="mt-3 p-4 sm:p-5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800">
                        <div className="space-y-6">
                          {/* Combined Upload Section */}
                          <div className="space-y-4">
                            <div className="relative">
                              <input
                                type="file"
                                id="blueprint-upload"
                                multiple
                                onChange={handleFileUpload}
                                className="sr-only"
                              />
                              <Label
                                htmlFor="blueprint-upload"
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
                            Note: Please ensure that the uploaded documents are relevant to the Blueprint title, as the Blueprint Structure content will be generated based on the uploaded materials.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

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
                        generateOption === "ai"
                          ? 'border-blue-600 bg-blue-600' 
                          : 'border-muted-foreground/30'
                      }`}>
                        {generateOption === "ai" && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">Generate using AI</p>
                      </div>
                    </Label>
                    
                    {/* Generate using AI Content */}
                    {generateOption === "ai" && (
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
                        generateOption === "manual"
                          ? 'border-blue-600 bg-blue-600' 
                          : 'border-muted-foreground/30'
                      }`}>
                        {generateOption === "manual" && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">Manual Generation</p>
                      </div>
                    </Label>
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
                    id="file-upload"
                    multiple
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                  <Label
                    htmlFor="file-upload"
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
                  Note: Please ensure that the uploaded documents are relevant to the Blueprint title, as the content will be generated based on the uploaded materials.
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
                <h2 className="text-xl sm:text-2xl font-semibold text-teal-700 dark:text-teal-400 mb-1">Choose a Layout Template</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">Select the visual layout for your blueprint</p>
              </div>
              <RadioGroup value={selectedLayout} onValueChange={setSelectedLayout}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
                  {/* Layout 1: Image at top, two-column text below */}
                  <div className="relative group h-[240px]">
                    <RadioGroupItem value="layout1" id="layout1" className="peer sr-only" />
                    <Label
                      htmlFor="layout1"
                      onClick={() => {
                        setPreviewLayout("layout1");
                        setShowLayoutPreview(true);
                      }}
                      className="flex flex-col h-full rounded-xl border-2 border-border hover:border-teal-500/50 peer-data-[state=checked]:border-teal-600 peer-data-[state=checked]:shadow-lg peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-teal-500/20 peer-data-[state=checked]:[&>div:last-child]:bg-teal-100 dark:peer-data-[state=checked]:[&>div:last-child]:bg-teal-900/40 peer-data-[state=checked]:[&>div:last-child>p]:text-teal-700 dark:peer-data-[state=checked]:[&>div:last-child>p]:text-teal-300 peer-data-[state=checked]:[&>div:last-child>svg]:opacity-100 transition-all cursor-pointer overflow-hidden bg-background"
                    >
                      <div className="p-4 space-y-4 flex-1">
                        {/* Image placeholder at top */}
                        <div className="w-20 h-20 mx-auto rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-2 border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-lg bg-teal-500/15 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                          </div>
                        </div>
                        {/* Two-column text sections */}
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
                      {/* Fixed footer for label */}
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
                      onClick={() => {
                        setPreviewLayout("layout2");
                        setShowLayoutPreview(true);
                      }}
                      className="flex flex-col h-full rounded-xl border-2 border-border hover:border-teal-500/50 peer-data-[state=checked]:border-teal-600 peer-data-[state=checked]:shadow-lg peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-teal-500/20 peer-data-[state=checked]:[&>div:last-child]:bg-teal-100 dark:peer-data-[state=checked]:[&>div:last-child]:bg-teal-900/40 peer-data-[state=checked]:[&>div:last-child>p]:text-teal-700 dark:peer-data-[state=checked]:[&>div:last-child>p]:text-teal-300 peer-data-[state=checked]:[&>div:last-child>svg]:opacity-100 transition-all cursor-pointer overflow-hidden bg-background"
                    >
                      <div className="p-4 space-y-4 flex-1">
                        {/* Two-column text sections at top */}
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
                        {/* Image placeholder at bottom center */}
                        <div className="w-20 h-20 mx-auto rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-2 border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-lg bg-teal-500/15 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                          </div>
                        </div>
                      </div>
                      {/* Fixed footer for label */}
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
                      onClick={() => {
                        setPreviewLayout("layout3");
                        setShowLayoutPreview(true);
                      }}
                      className="flex flex-col h-full rounded-xl border-2 border-border hover:border-teal-500/50 peer-data-[state=checked]:border-teal-600 peer-data-[state=checked]:shadow-lg peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-teal-500/20 peer-data-[state=checked]:[&>div:last-child]:bg-teal-100 dark:peer-data-[state=checked]:[&>div:last-child]:bg-teal-900/40 peer-data-[state=checked]:[&>div:last-child>p]:text-teal-700 dark:peer-data-[state=checked]:[&>div:last-child>p]:text-teal-300 peer-data-[state=checked]:[&>div:last-child>svg]:opacity-100 transition-all cursor-pointer overflow-hidden bg-background"
                    >
                      <div className="p-4 space-y-4 flex-1">
                        {/* Image placeholder at top center */}
                        <div className="w-20 h-20 mx-auto rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-2 border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-lg bg-teal-500/15 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                          </div>
                        </div>
                        {/* Single column text */}
                        <div className="space-y-1.5">
                          <div className="h-2 bg-foreground/25 rounded w-1/2"></div>
                          <div className="h-1.5 bg-foreground/15 rounded w-full"></div>
                          <div className="h-1.5 bg-foreground/15 rounded w-5/6"></div>
                          <div className="h-1.5 bg-foreground/15 rounded w-4/5"></div>
                          <div className="h-1.5 bg-foreground/15 rounded w-full"></div>
                        </div>
                      </div>
                      {/* Fixed footer for label */}
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
                      onClick={() => {
                        setPreviewLayout("layout4");
                        setShowLayoutPreview(true);
                      }}
                      className="flex flex-col h-full rounded-xl border-2 border-border hover:border-teal-500/50 peer-data-[state=checked]:border-teal-600 peer-data-[state=checked]:shadow-lg peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-teal-500/20 peer-data-[state=checked]:[&>div:last-child]:bg-teal-100 dark:peer-data-[state=checked]:[&>div:last-child]:bg-teal-900/40 peer-data-[state=checked]:[&>div:last-child>p]:text-teal-700 dark:peer-data-[state=checked]:[&>div:last-child>p]:text-teal-300 peer-data-[state=checked]:[&>div:last-child>svg]:opacity-100 transition-all cursor-pointer overflow-hidden bg-background"
                    >
                      <div className="p-4 space-y-4 flex-1">
                        {/* Single column text at top */}
                        <div className="space-y-1.5">
                          <div className="h-2 bg-foreground/25 rounded w-1/2"></div>
                          <div className="h-1.5 bg-foreground/15 rounded w-full"></div>
                          <div className="h-1.5 bg-foreground/15 rounded w-5/6"></div>
                          <div className="h-1.5 bg-foreground/15 rounded w-4/5"></div>
                          <div className="h-1.5 bg-foreground/15 rounded w-full"></div>
                        </div>
                        {/* Image placeholder at bottom center */}
                        <div className="w-20 h-20 mx-auto rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-2 border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-lg bg-teal-500/15 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                          </div>
                        </div>
                      </div>
                      {/* Fixed footer for label */}
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
                      onClick={() => {
                        setPreviewLayout("layout5");
                        setShowLayoutPreview(true);
                      }}
                      className="flex flex-col h-full rounded-xl border-2 border-border hover:border-teal-500/50 peer-data-[state=checked]:border-teal-600 peer-data-[state=checked]:shadow-lg peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-teal-500/20 peer-data-[state=checked]:[&>div:last-child]:bg-teal-100 dark:peer-data-[state=checked]:[&>div:last-child]:bg-teal-900/40 peer-data-[state=checked]:[&>div:last-child>p]:text-teal-700 dark:peer-data-[state=checked]:[&>div:last-child>p]:text-teal-300 peer-data-[state=checked]:[&>div:last-child>svg]:opacity-100 transition-all cursor-pointer overflow-hidden bg-background"
                    >
                      <div className="p-4 flex-1">
                        <div className="grid grid-cols-2 gap-3 items-center h-full">
                          {/* Text on left */}
                          <div className="space-y-1.5">
                            <div className="h-2 bg-foreground/25 rounded w-3/4"></div>
                            <div className="h-1.5 bg-foreground/15 rounded w-full"></div>
                            <div className="h-1.5 bg-foreground/15 rounded w-5/6"></div>
                            <div className="h-1.5 bg-foreground/15 rounded w-4/5"></div>
                            <div className="h-1.5 bg-foreground/15 rounded w-full"></div>
                            <div className="h-1.5 bg-foreground/15 rounded w-5/6"></div>
                          </div>
                          {/* Image on right */}
                          <div className="w-20 h-20 mx-auto rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-2 border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-lg bg-teal-500/15 flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Fixed footer for label */}
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

        {/* Generate Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          {!isLoggedIn ? (
            <Button 
              onClick={() => setShowLoginDialog(true)}
              size="lg"
              className="px-8 py-6 text-base font-semibold"
            >
              Login to Continue
            </Button>
          ) : (
            <Button 
              onClick={handleGenerateBlueprint}
              size="lg"
              className="px-12 py-6 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl"
              disabled={isCreating}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {isCreating ? "Creating..." : "Generate Blueprint"}
            </Button>
          )}
        </div>
      </div>

      {/* Course Units Dialog */}
      <Dialog open={showCourseUnitsDialog} onOpenChange={setShowCourseUnitsDialog}>
        <DialogContent className="w-[95vw] sm:w-[90vw] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] max-h-[90vh] sm:max-h-[85vh] overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-semibold">Set Course Units</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2 sm:py-4 overflow-x-hidden">
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
              Define your course structure hierarchy from top to bottom:
            </p>
            
            <div className="space-y-2 sm:space-y-3 relative">
              {/* No. of Chapters - Level 1 (Always visible, cannot be deleted) */}
              <div className="relative pl-0">
                <div className="flex items-center gap-2 sm:gap-4 p-2.5 sm:p-3 md:p-4 rounded-lg bg-primary/10 border-2 border-primary/30">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
                      1
                    </div>
                    <Label className="text-xs sm:text-sm md:text-base font-semibold text-foreground">
                      No. of Chapters
                    </Label>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateCourseUnit('chapters', false)}
                      className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
                      disabled={courseUnits.chapters === 0}
                    >
                      <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Input
                      type="number"
                      value={courseUnits.chapters}
                      onChange={(e) => setCourseUnits(prev => ({ ...prev, chapters: Math.max(0, parseInt(e.target.value) || 0) }))}
                      className="w-12 sm:w-14 md:w-20 text-center h-7 sm:h-8 md:h-9 font-semibold text-xs sm:text-sm"
                      min="0"
                    />
                    <Button
                      size="icon"
                      onClick={() => updateCourseUnit('chapters', true)}
                      className="bg-primary hover:bg-primary/90 h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* No. of Modules per Chapter - Level 2 */}
              {activeLevels.modulesPerChapter && (
                <div className="relative pl-3 sm:pl-4 md:pl-8">
                  <div className="absolute left-1.5 sm:left-2 md:left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 to-blue-500/50"></div>
                  <div className="flex items-center gap-2 sm:gap-4 p-2.5 sm:p-3 md:p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-500/30">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
                        2
                      </div>
                      <Label className="text-xs sm:text-sm md:text-base font-semibold text-foreground break-words">
                        No. of Modules per Chapter
                      </Label>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteLevel('modulesPerChapter')}
                        className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Delete this level and all below"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateCourseUnit('modulesPerChapter', false)}
                        className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
                        disabled={courseUnits.modulesPerChapter === 0}
                      >
                        <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <Input
                        type="number"
                        value={courseUnits.modulesPerChapter}
                        onChange={(e) => setCourseUnits(prev => ({ ...prev, modulesPerChapter: Math.max(0, parseInt(e.target.value) || 0) }))}
                        className="w-12 sm:w-14 md:w-20 text-center h-7 sm:h-8 md:h-9 font-semibold text-xs sm:text-sm"
                        min="0"
                      />
                      <Button
                        size="icon"
                        onClick={() => updateCourseUnit('modulesPerChapter', true)}
                        className="bg-blue-600 hover:bg-blue-700 h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* No. of Topics per Module - Level 3 */}
              {activeLevels.topicsPerModule && (
                <div className="relative pl-6 sm:pl-8 md:pl-16">
                  <div className="absolute left-1.5 sm:left-2 md:left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 to-teal-500/50"></div>
                  <div className="flex items-center gap-2 sm:gap-4 p-2.5 sm:p-3 md:p-4 rounded-lg bg-teal-50 dark:bg-teal-950/30 border-2 border-teal-500/30">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
                        3
                      </div>
                      <Label className="text-xs sm:text-sm md:text-base font-semibold text-foreground break-words">
                        No. of Topics per Module
                      </Label>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteLevel('topicsPerModule')}
                        className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Delete this level and all below"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateCourseUnit('topicsPerModule', false)}
                        className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
                        disabled={courseUnits.topicsPerModule === 0}
                      >
                        <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <Input
                        type="number"
                        value={courseUnits.topicsPerModule}
                        onChange={(e) => setCourseUnits(prev => ({ ...prev, topicsPerModule: Math.max(0, parseInt(e.target.value) || 0) }))}
                        className="w-12 sm:w-14 md:w-20 text-center h-7 sm:h-8 md:h-9 font-semibold text-xs sm:text-sm"
                        min="0"
                      />
                      <Button
                        size="icon"
                        onClick={() => updateCourseUnit('topicsPerModule', true)}
                        className="bg-teal-600 hover:bg-teal-700 h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* No. of Subtopics per Topic - Level 4 */}
              {activeLevels.subtopicsPerTopic && (
                <div className="relative pl-9 sm:pl-12 md:pl-24">
                  <div className="absolute left-1.5 sm:left-2 md:left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-500/50 to-purple-500/50"></div>
                  <div className="flex items-center gap-2 sm:gap-4 p-2.5 sm:p-3 md:p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 border-2 border-purple-500/30">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
                        4
                      </div>
                      <Label className="text-xs sm:text-sm md:text-base font-semibold text-foreground break-words">
                        No. of Subtopics per Topic
                      </Label>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteLevel('subtopicsPerTopic')}
                        className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Delete this level and all below"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateCourseUnit('subtopicsPerTopic', false)}
                        className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
                        disabled={courseUnits.subtopicsPerTopic === 0}
                      >
                        <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <Input
                        type="number"
                        value={courseUnits.subtopicsPerTopic}
                        onChange={(e) => setCourseUnits(prev => ({ ...prev, subtopicsPerTopic: Math.max(0, parseInt(e.target.value) || 0) }))}
                        className="w-12 sm:w-14 md:w-20 text-center h-7 sm:h-8 md:h-9 font-semibold text-xs sm:text-sm"
                        min="0"
                      />
                      <Button
                        size="icon"
                        onClick={() => updateCourseUnit('subtopicsPerTopic', true)}
                        className="bg-purple-600 hover:bg-purple-700 h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* No. of Learning Outcomes per Subtopic - Level 5 */}
              {activeLevels.learningOutcomesPerSubtopic && (
                <div className="relative pl-12 sm:pl-16 md:pl-32">
                  <div className="absolute left-1.5 sm:left-2 md:left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/50 to-orange-500/50"></div>
                  <div className="flex items-center gap-2 sm:gap-4 p-2.5 sm:p-3 md:p-4 rounded-lg bg-orange-50 dark:bg-orange-950/30 border-2 border-orange-500/30">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
                        5
                      </div>
                      <Label className="text-xs sm:text-sm md:text-base font-semibold text-foreground break-words">
                        No. of Learning Outcomes per Subtopic
                      </Label>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteLevel('learningOutcomesPerSubtopic')}
                        className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Delete this level"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateCourseUnit('learningOutcomesPerSubtopic', false)}
                        className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
                        disabled={courseUnits.learningOutcomesPerSubtopic === 0}
                      >
                        <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <Input
                        type="number"
                        value={courseUnits.learningOutcomesPerSubtopic}
                        onChange={(e) => setCourseUnits(prev => ({ ...prev, learningOutcomesPerSubtopic: Math.max(0, parseInt(e.target.value) || 0) }))}
                        className="w-12 sm:w-14 md:w-20 text-center h-7 sm:h-8 md:h-9 font-semibold text-xs sm:text-sm"
                        min="0"
                      />
                      <Button
                        size="icon"
                        onClick={() => updateCourseUnit('learningOutcomesPerSubtopic', true)}
                        className="bg-orange-600 hover:bg-orange-700 h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Next Level Button */}
              {canAddNextLevel() && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    onClick={addNextLevel}
                    className="gap-2 border-dashed border-2 border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/60 hover:text-primary text-xs sm:text-sm"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    Add Next Level
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 flex-col sm:flex-row pt-2 sm:pt-4">
            <Button variant="outline" onClick={resetCourseUnits} className="w-full sm:w-auto text-sm">
              Reset All
            </Button>
            <Button variant="outline" onClick={() => setShowCourseUnitsDialog(false)} className="w-full sm:w-auto text-sm">
              Cancel
            </Button>
            <Button onClick={saveCourseUnits} className="w-full sm:w-auto text-sm">
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="py-3 sm:py-4">
            <DialogTitle className="text-lg sm:text-xl font-bold text-center">
              Login to Create Blueprints
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 px-1 py-3">
            <p className="text-sm text-muted-foreground">
              Please login with your credentials to access blueprint creation.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="login-id" className="text-sm font-semibold">
                Login ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="login-id"
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="Enter your login ID"
                className="h-10 text-sm"
                disabled={isLoggingIn}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="h-10 text-sm"
                disabled={isLoggingIn}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleLogin();
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 flex-col sm:flex-row pt-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowLoginDialog(false);
                setPassword("");
              }} 
              className="w-full sm:w-auto text-sm"
              disabled={isLoggingIn}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleLogin} 
              className="w-full sm:w-auto text-sm"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Logging in..." : "Login"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Layout Preview Dialog */}
      <Dialog open={showLayoutPreview} onOpenChange={setShowLayoutPreview}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Layout Image</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {previewLayout === "layout1" && (
              <div className="flex flex-col h-[480px] rounded-xl border-2 border-border shadow-lg overflow-hidden bg-background">
                <div className="p-8 space-y-8 flex-1">
                  {/* Image placeholder at top */}
                  <div className="w-40 h-40 mx-auto rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-2 border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-lg bg-teal-500/15 flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-teal-600 dark:text-teal-400" />
                    </div>
                  </div>
                  {/* Two-column text sections */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="h-4 bg-foreground/25 rounded w-3/4"></div>
                      <div className="h-3 bg-foreground/15 rounded w-full"></div>
                      <div className="h-3 bg-foreground/15 rounded w-5/6"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-foreground/25 rounded w-3/4"></div>
                      <div className="h-3 bg-foreground/15 rounded w-full"></div>
                      <div className="h-3 bg-foreground/15 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
                <div className="h-12 flex items-center justify-center border-t border-border/50 bg-teal-100 dark:bg-teal-900/40">
                  <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">Layout 1</p>
                </div>
              </div>
            )}
            {previewLayout === "layout2" && (
              <div className="flex flex-col h-[480px] rounded-xl border-2 border-border shadow-lg overflow-hidden bg-background">
                <div className="p-8 space-y-8 flex-1">
                  {/* Two-column text sections at top */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="h-4 bg-foreground/25 rounded w-3/4"></div>
                      <div className="h-3 bg-foreground/15 rounded w-full"></div>
                      <div className="h-3 bg-foreground/15 rounded w-5/6"></div>
                      <div className="h-3 bg-foreground/15 rounded w-4/5"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-foreground/25 rounded w-3/4"></div>
                      <div className="h-3 bg-foreground/15 rounded w-full"></div>
                      <div className="h-3 bg-foreground/15 rounded w-5/6"></div>
                      <div className="h-3 bg-foreground/15 rounded w-4/5"></div>
                    </div>
                  </div>
                  {/* Image placeholder at bottom center */}
                  <div className="w-40 h-40 mx-auto rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-2 border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-lg bg-teal-500/15 flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-teal-600 dark:text-teal-400" />
                    </div>
                  </div>
                </div>
                <div className="h-12 flex items-center justify-center border-t border-border/50 bg-teal-100 dark:bg-teal-900/40">
                  <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">Layout 2</p>
                </div>
              </div>
            )}
            {previewLayout === "layout3" && (
              <div className="flex flex-col h-[480px] rounded-xl border-2 border-border shadow-lg overflow-hidden bg-background">
                <div className="p-8 space-y-8 flex-1">
                  {/* Image placeholder at top center */}
                  <div className="w-40 h-40 mx-auto rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-2 border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-lg bg-teal-500/15 flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-teal-600 dark:text-teal-400" />
                    </div>
                  </div>
                  {/* Single column text */}
                  <div className="space-y-3">
                    <div className="h-4 bg-foreground/25 rounded w-1/2"></div>
                    <div className="h-3 bg-foreground/15 rounded w-full"></div>
                    <div className="h-3 bg-foreground/15 rounded w-5/6"></div>
                    <div className="h-3 bg-foreground/15 rounded w-4/5"></div>
                    <div className="h-3 bg-foreground/15 rounded w-full"></div>
                  </div>
                </div>
                <div className="h-12 flex items-center justify-center border-t border-border/50 bg-teal-100 dark:bg-teal-900/40">
                  <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">Layout 3</p>
                </div>
              </div>
            )}
            {previewLayout === "layout4" && (
              <div className="flex flex-col h-[480px] rounded-xl border-2 border-border shadow-lg overflow-hidden bg-background">
                <div className="p-8 space-y-8 flex-1">
                  {/* Single column text at top */}
                  <div className="space-y-3">
                    <div className="h-4 bg-foreground/25 rounded w-1/2"></div>
                    <div className="h-3 bg-foreground/15 rounded w-full"></div>
                    <div className="h-3 bg-foreground/15 rounded w-5/6"></div>
                    <div className="h-3 bg-foreground/15 rounded w-4/5"></div>
                    <div className="h-3 bg-foreground/15 rounded w-full"></div>
                  </div>
                  {/* Image placeholder at bottom center */}
                  <div className="w-40 h-40 mx-auto rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-2 border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-lg bg-teal-500/15 flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-teal-600 dark:text-teal-400" />
                    </div>
                  </div>
                </div>
                <div className="h-12 flex items-center justify-center border-t border-border/50 bg-teal-100 dark:bg-teal-900/40">
                  <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">Layout 4</p>
                </div>
              </div>
            )}
            {previewLayout === "layout5" && (
              <div className="flex flex-col h-[480px] rounded-xl border-2 border-border shadow-lg overflow-hidden bg-background">
                <div className="p-8 flex-1">
                  <div className="grid grid-cols-2 gap-6 items-center h-full">
                    {/* Text on left */}
                    <div className="space-y-3">
                      <div className="h-4 bg-foreground/25 rounded w-3/4"></div>
                      <div className="h-3 bg-foreground/15 rounded w-full"></div>
                      <div className="h-3 bg-foreground/15 rounded w-5/6"></div>
                      <div className="h-3 bg-foreground/15 rounded w-4/5"></div>
                      <div className="h-3 bg-foreground/15 rounded w-full"></div>
                      <div className="h-3 bg-foreground/15 rounded w-5/6"></div>
                    </div>
                    {/* Image on right */}
                    <div className="w-40 h-40 mx-auto rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-2 border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-lg bg-teal-500/15 flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-teal-600 dark:text-teal-400" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-12 flex items-center justify-center border-t border-border/50 bg-teal-100 dark:bg-teal-900/40">
                  <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">Layout 5</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="mt-6">
            <Button onClick={() => setShowLayoutPreview(false)} className="w-full sm:w-auto">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateBlueprint;
