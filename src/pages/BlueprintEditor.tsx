import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Copy, Trash2, Globe, ChevronRight, Home, ImageIcon, Sparkles, Layout, Plus, Edit2, ChevronDown, ChevronRight as ChevronRightIcon, X, CopyPlus, GripVertical, Settings, FileText, HelpCircle, Layers, Users, Check } from "lucide-react";
import { CloneBlueprintDialog } from "@/components/BlueprintEditor/CloneBlueprintDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import emptyChaptersImg from "@/assets/empty-chapters.png";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface BlueprintData {
  title: string;
  generateOption: string;
  selectedLayout: string;
  uploadedFiles: File[];
  courseUnits?: any;
}

interface Chapter {
  id: string;
  title: string;
  modules: Module[];
  expanded: boolean;
}

interface Module {
  id: string;
  title: string;
  topics: Topic[];
  expanded: boolean;
}

interface Topic {
  id: string;
  title: string;
  subtopics: Subtopic[];
  expanded: boolean;
}

interface Subtopic {
  id: string;
  title: string;
  learningOutcomes: string[];
}

// Sortable Chapter Item Component
interface SortableChapterItemProps {
  chapter: Chapter;
  index: number;
  onToggleExpand: (id: string) => void;
  onEdit: (type: string, id: string, title: string) => void;
  onDelete: (data: { type: string; id: string }) => void;
  onAddModule: (chapterId: string) => void;
  children: React.ReactNode;
}

const SortableChapterItem = ({ 
  chapter, 
  index, 
  onToggleExpand, 
  onEdit, 
  onDelete, 
  onAddModule,
  children 
}: SortableChapterItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chapter.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`overflow-hidden border-2 ${isDragging ? 'shadow-2xl ring-2 ring-primary' : ''}`}
    >
      <div className="p-4 bg-background border-b flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <button
            {...attributes}
            {...listeners}
            className="p-1.5 hover:bg-muted rounded transition-colors cursor-grab active:cursor-grabbing touch-none"
            aria-label="Drag to reorder"
          >
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </button>
          <button
            onClick={() => onToggleExpand(chapter.id)}
            className="p-1 hover:bg-primary/10 rounded transition-colors"
          >
            {chapter.expanded ? (
              <ChevronDown className="w-5 h-5 text-foreground" />
            ) : (
              <ChevronRightIcon className="w-5 h-5 text-foreground" />
            )}
          </button>
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
            {index + 1}
          </div>
          <h3 className="font-semibold text-lg">{chapter.title}</h3>
        </div>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => onEdit("chapter", chapter.id, chapter.title)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete({ type: "chapter", id: chapter.id })}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {children}
    </Card>
  );
};

// Sortable Module Item Component
interface SortableModuleItemProps {
  module: Module;
  index: number;
  chapterId: string;
  onToggleExpand: (chapterId: string, moduleId: string) => void;
  onEdit: (type: string, id: string, title: string, chapterId?: string) => void;
  onDelete: (data: { type: string; id: string; chapterId?: string }) => void;
  children: React.ReactNode;
}

const SortableModuleItem = ({ 
  module, 
  index,
  chapterId,
  onToggleExpand, 
  onEdit, 
  onDelete,
  children 
}: SortableModuleItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`border-l-4 border-l-blue-500 ${isDragging ? 'shadow-xl ring-2 ring-blue-500' : ''}`}
    >
      <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <button
            {...attributes}
            {...listeners}
            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors cursor-grab active:cursor-grabbing touch-none"
            aria-label="Drag to reorder"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => onToggleExpand(chapterId, module.id)}
            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
          >
            {module.expanded ? (
              <ChevronDown className="w-4 h-4 text-foreground" />
            ) : (
              <ChevronRightIcon className="w-4 h-4 text-foreground" />
            )}
          </button>
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            {index + 1}
          </div>
          <span className="font-medium text-sm">{module.title}</span>
        </div>
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => onEdit("module", module.id, module.title, chapterId)}
          >
            <Edit2 className="w-3 h-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete({ type: "module", id: module.id, chapterId })}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
      {children}
    </Card>
  );
};

// Sortable Topic Item Component
interface SortableTopicItemProps {
  topic: Topic;
  index: number;
  chapterId: string;
  moduleId: string;
  onToggleExpand: (chapterId: string, moduleId: string, topicId: string) => void;
  onEdit: (type: string, id: string, title: string, chapterId?: string, moduleId?: string) => void;
  onDelete: (data: { type: string; id: string; chapterId?: string; moduleId?: string }) => void;
  children: React.ReactNode;
}

const SortableTopicItem = ({ 
  topic, 
  index,
  chapterId,
  moduleId,
  onToggleExpand, 
  onEdit, 
  onDelete,
  children 
}: SortableTopicItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`border-l-4 border-l-teal-500 ${isDragging ? 'shadow-xl ring-2 ring-teal-500' : ''}`}
    >
      <div className="p-2.5 bg-teal-50/50 dark:bg-teal-950/20 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            {...attributes}
            {...listeners}
            className="p-0.5 hover:bg-teal-100 dark:hover:bg-teal-900 rounded transition-colors cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
            aria-label="Drag to reorder"
          >
            <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={() => onToggleExpand(chapterId, moduleId, topic.id)}
            className="p-0.5 hover:bg-teal-100 dark:hover:bg-teal-900 rounded transition-colors flex-shrink-0"
          >
            {topic.expanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-foreground" />
            ) : (
              <ChevronRightIcon className="w-3.5 h-3.5 text-foreground" />
            )}
          </button>
          <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
            {index + 1}
          </div>
          <span className="font-medium text-xs truncate">{topic.title}</span>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => onEdit("topic", topic.id, topic.title, chapterId, moduleId)}
          >
            <Edit2 className="w-3 h-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete({ type: "topic", id: topic.id, chapterId, moduleId })}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
      {children}
    </Card>
  );
};

// Sortable Subtopic Item Component
interface SortableSubtopicItemProps {
  subtopic: Subtopic;
  index: number;
  chapterId: string;
  moduleId: string;
  topicId: string;
  onEdit: (type: string, id: string, title: string, chapterId?: string, moduleId?: string, topicId?: string) => void;
  onDelete: (data: { type: string; id: string; chapterId?: string; moduleId?: string; topicId?: string }) => void;
  onAddOutcome: () => void;
  children: React.ReactNode;
}

const SortableSubtopicItem = ({ 
  subtopic, 
  index,
  chapterId,
  moduleId,
  topicId,
  onEdit, 
  onDelete,
  onAddOutcome,
  children 
}: SortableSubtopicItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subtopic.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`border-l-4 border-l-purple-500 ${isDragging ? 'shadow-xl ring-2 ring-purple-500' : ''}`}
    >
      <div className="p-2 bg-purple-50/50 dark:bg-purple-950/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button
              {...attributes}
              {...listeners}
              className="p-0.5 hover:bg-purple-100 dark:hover:bg-purple-900 rounded transition-colors cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
              aria-label="Drag to reorder"
            >
              <GripVertical className="w-3 h-3 text-muted-foreground" />
            </button>
            <div className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              {index + 1}
            </div>
            <span className="font-medium text-xs truncate">{subtopic.title}</span>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Button
              size="icon"
              variant="ghost"
              className="h-5 w-5"
              onClick={() => onEdit("subtopic", subtopic.id, subtopic.title, chapterId, moduleId, topicId)}
            >
              <Edit2 className="w-2.5 h-2.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-5 w-5 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete({ 
                type: "subtopic", 
                id: subtopic.id, 
                chapterId, 
                moduleId,
                topicId
              })}
            >
              <Trash2 className="w-2.5 h-2.5" />
            </Button>
          </div>
        </div>
        {children}
      </div>
    </Card>
  );
};

// Function to generate realistic dummy data based on blueprint ID
const getDummyBlueprintData = (blueprintId: string): BlueprintData => {
  const blueprintMap: Record<string, BlueprintData> = {
    "dummy-1": {
      title: "Business Analytics Fundamentals",
      generateOption: "ai",
      selectedLayout: "layout1",
      uploadedFiles: [],
      courseUnits: { chapters: 5 }
    },
    "dummy-2": {
      title: "Advanced Financial Modeling",
      generateOption: "upload",
      selectedLayout: "layout2",
      uploadedFiles: [
        new File([""], "financial_concepts.pdf", { type: "application/pdf" }),
        new File([""], "excel_formulas.xlsx", { type: "application/vnd.ms-excel" })
      ]
    },
    "dummy-3": {
      title: "Strategic Management Course",
      generateOption: "manual",
      selectedLayout: "layout3",
      uploadedFiles: []
    }
  };

  return blueprintMap[blueprintId] || {
    title: "Sample Blueprint",
    generateOption: "manual",
    selectedLayout: "layout1",
    uploadedFiles: []
  };
};

// Generate realistic dummy chapters for the blueprint
const getDummyChapters = (blueprintId: string): Chapter[] => {
  if (blueprintId === "dummy-1") {
    return [
      {
        id: "chapter-1",
        title: "Introduction to Business Analytics",
        expanded: false,
        modules: [
          {
            id: "module-1-1",
            title: "What is Business Analytics?",
            expanded: false,
            topics: [
              {
                id: "topic-1-1-1",
                title: "Defining Business Analytics",
                expanded: false,
                subtopics: [
                  {
                    id: "subtopic-1-1-1-1",
                    title: "Core Concepts",
                    learningOutcomes: [
                      "Understand the definition of business analytics",
                      "Identify key components of analytics"
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: "chapter-2",
        title: "Data Collection and Preparation",
        expanded: false,
        modules: []
      }
    ];
  } else if (blueprintId === "dummy-2") {
    return [
      {
        id: "chapter-1",
        title: "Financial Modeling Basics",
        expanded: false,
        modules: [
          {
            id: "module-1-1",
            title: "Excel Fundamentals",
            expanded: false,
            topics: []
          }
        ]
      }
    ];
  }
  return [];
};

const BlueprintEditor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { blueprintId } = useParams<{ blueprintId: string }>();
  const { toast } = useToast();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Get blueprint data from location state or generate dummy data based on ID
  const initialBlueprintData = location.state as BlueprintData | null;
  const [blueprintData, setBlueprintData] = useState<BlueprintData | null>(initialBlueprintData);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showChapterSection, setShowChapterSection] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  
  // Load dummy data if coming from blueprint cards (blueprintId in URL but no state)
  useEffect(() => {
    if (!initialBlueprintData && blueprintId) {
      const dummyData = getDummyBlueprintData(blueprintId);
      setBlueprintData(dummyData);
      
      const dummyChapters = getDummyChapters(blueprintId);
      if (dummyChapters.length > 0) {
        setChapters(dummyChapters);
        setShowChapterSection(true);
      }
    }
  }, [blueprintId, initialBlueprintData]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAddModuleDialog, setShowAddModuleDialog] = useState(false);
  const [showAddTopicDialog, setShowAddTopicDialog] = useState(false);
  const [showAddSubtopicDialog, setShowAddSubtopicDialog] = useState(false);
  const [showAddOutcomeDialog, setShowAddOutcomeDialog] = useState(false);
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const [showPreferencesDialog, setShowPreferencesDialog] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newSubtopicTitle, setNewSubtopicTitle] = useState("");
  const [newOutcomeTitle, setNewOutcomeTitle] = useState("");
  
  // Level names state
  const [level1Name, setLevel1Name] = useState("chapter");
  const [level2Name, setLevel2Name] = useState("module");
  const [level3Name, setLevel3Name] = useState("topic");
  const [level4Name, setLevel4Name] = useState("subtopic");
  const [level5Name, setLevel5Name] = useState("learning outcome");
  const [currentChapterId, setCurrentChapterId] = useState<string | null>(null);
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);
  const [currentTopicId, setCurrentTopicId] = useState<string | null>(null);
  const [currentSubtopicId, setCurrentSubtopicId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ 
    type: string; 
    id: string; 
    chapterId?: string;
    moduleId?: string;
    topicId?: string;
    subtopicId?: string;
  } | null>(null);
  const [editingItem, setEditingItem] = useState<{ 
    type: string; 
    id: string; 
    value: string; 
    chapterId?: string;
    moduleId?: string;
    topicId?: string;
    subtopicId?: string;
  } | null>(null);

  // If no data and no blueprintId, redirect back
  if (!blueprintData && !blueprintId) {
    navigate("/create-blueprint");
    return null;
  }

  // Show loading state while dummy data is being set
  if (!blueprintData) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  const handleCopy = () => {
    setShowCloneDialog(true);
  };

  const handleDelete = () => {
    toast({
      title: "Blueprint Deleted",
      description: "The blueprint has been deleted successfully.",
      variant: "destructive",
    });
    navigate("/blueprints");
  };

  const handlePublish = () => {
    toast({
      title: "Blueprint Published",
      description: "Your blueprint is now live and accessible.",
    });
    setShowPublishDialog(false);
    navigate("/blueprints");
  };

  const handleNext = () => {
    setShowChapterSection(true);
    toast({
      title: "Chapter Management",
      description: "You can now add and manage chapters for your blueprint.",
    });
  };

  const handleAddChapter = () => {
    if (!newChapterTitle.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a chapter title.",
        variant: "destructive",
      });
      return;
    }

    const newChapter: Chapter = {
      id: `chapter-${Date.now()}`,
      title: newChapterTitle,
      modules: [],
      expanded: true, // Auto-expand new chapter
    };

    setChapters([...chapters, newChapter]);
    setNewChapterTitle("");
    setShowAddDialog(false);
    toast({
      title: "Chapter Added",
      description: "New chapter has been added successfully.",
    });
  };

  const handleAddModule = () => {
    if (!newModuleTitle.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a module title.",
        variant: "destructive",
      });
      return;
    }

    if (!currentChapterId) return;

    const newModule: Module = {
      id: `module-${Date.now()}`,
      title: newModuleTitle,
      topics: [],
      expanded: true,
    };

    setChapters(chapters.map(ch => 
      ch.id === currentChapterId 
        ? { ...ch, modules: [...ch.modules, newModule] }
        : ch
    ));

    setNewModuleTitle("");
    setShowAddModuleDialog(false);
    setCurrentChapterId(null);
    toast({
      title: "Module Added",
      description: "New module has been added successfully.",
    });
  };

  const handleAddTopic = () => {
    if (!newTopicTitle.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a topic title.",
        variant: "destructive",
      });
      return;
    }

    if (!currentChapterId || !currentModuleId) return;

    const newTopic: Topic = {
      id: `topic-${Date.now()}`,
      title: newTopicTitle,
      subtopics: [],
      expanded: true,
    };

    setChapters(chapters.map(ch =>
      ch.id === currentChapterId
        ? {
            ...ch,
            modules: ch.modules.map(m =>
              m.id === currentModuleId
                ? { ...m, topics: [...m.topics, newTopic] }
                : m
            )
          }
        : ch
    ));

    setNewTopicTitle("");
    setShowAddTopicDialog(false);
    setCurrentModuleId(null);
    setCurrentChapterId(null);
    toast({
      title: "Topic Added",
      description: "New topic has been added successfully.",
    });
  };

  const handleAddSubtopic = () => {
    if (!newSubtopicTitle.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a subtopic title.",
        variant: "destructive",
      });
      return;
    }

    if (!currentChapterId || !currentModuleId || !currentTopicId) return;

    const newSubtopic: Subtopic = {
      id: `subtopic-${Date.now()}`,
      title: newSubtopicTitle,
      learningOutcomes: [],
    };

    setChapters(chapters.map(ch =>
      ch.id === currentChapterId
        ? {
            ...ch,
            modules: ch.modules.map(m =>
              m.id === currentModuleId
                ? {
                    ...m,
                    topics: m.topics.map(t =>
                      t.id === currentTopicId
                        ? { ...t, subtopics: [...t.subtopics, newSubtopic] }
                        : t
                    )
                  }
                : m
            )
          }
        : ch
    ));

    setNewSubtopicTitle("");
    setShowAddSubtopicDialog(false);
    setCurrentTopicId(null);
    setCurrentModuleId(null);
    setCurrentChapterId(null);
    toast({
      title: "Subtopic Added",
      description: "New subtopic has been added successfully.",
    });
  };

  const handleAddOutcome = () => {
    if (!newOutcomeTitle.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a learning outcome.",
        variant: "destructive",
      });
      return;
    }

    if (!currentChapterId || !currentModuleId || !currentTopicId || !currentSubtopicId) return;

    setChapters(chapters.map(ch =>
      ch.id === currentChapterId
        ? {
            ...ch,
            modules: ch.modules.map(m =>
              m.id === currentModuleId
                ? {
                    ...m,
                    topics: m.topics.map(t =>
                      t.id === currentTopicId
                        ? {
                            ...t,
                            subtopics: t.subtopics.map(st =>
                              st.id === currentSubtopicId
                                ? { ...st, learningOutcomes: [...st.learningOutcomes, newOutcomeTitle] }
                                : st
                            )
                          }
                        : t
                    )
                  }
                : m
            )
          }
        : ch
    ));

    setNewOutcomeTitle("");
    setShowAddOutcomeDialog(false);
    setCurrentSubtopicId(null);
    setCurrentTopicId(null);
    setCurrentModuleId(null);
    setCurrentChapterId(null);
    toast({
      title: "Learning Outcome Added",
      description: "New learning outcome has been added successfully.",
    });
  };

  const handleEdit = (type: string, id: string, currentValue: string, chapterId?: string, moduleId?: string, topicId?: string, subtopicId?: string) => {
    setEditingItem({ type, id, value: currentValue, chapterId, moduleId, topicId, subtopicId });
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;

    if (!editingItem.value.trim()) {
      toast({
        title: "Validation Error",
        description: "Title cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    if (editingItem.type === "chapter") {
      setChapters(chapters.map(ch =>
        ch.id === editingItem.id ? { ...ch, title: editingItem.value } : ch
      ));
    } else if (editingItem.type === "module" && editingItem.chapterId) {
      setChapters(chapters.map(ch =>
        ch.id === editingItem.chapterId
          ? {
              ...ch,
              modules: ch.modules.map(m =>
                m.id === editingItem.id ? { ...m, title: editingItem.value } : m
              )
            }
          : ch
      ));
    } else if (editingItem.type === "topic" && editingItem.chapterId && editingItem.moduleId) {
      setChapters(chapters.map(ch =>
        ch.id === editingItem.chapterId
          ? {
              ...ch,
              modules: ch.modules.map(m =>
                m.id === editingItem.moduleId
                  ? {
                      ...m,
                      topics: m.topics.map(t =>
                        t.id === editingItem.id ? { ...t, title: editingItem.value } : t
                      )
                    }
                  : m
              )
            }
          : ch
      ));
    } else if (editingItem.type === "subtopic" && editingItem.chapterId && editingItem.moduleId && editingItem.topicId) {
      setChapters(chapters.map(ch =>
        ch.id === editingItem.chapterId
          ? {
              ...ch,
              modules: ch.modules.map(m =>
                m.id === editingItem.moduleId
                  ? {
                      ...m,
                      topics: m.topics.map(t =>
                        t.id === editingItem.topicId
                          ? {
                              ...t,
                              subtopics: t.subtopics.map(st =>
                                st.id === editingItem.id ? { ...st, title: editingItem.value } : st
                              )
                            }
                          : t
                      )
                    }
                  : m
              )
            }
          : ch
      ));
    }

    setEditingItem(null);
    toast({
      title: "Updated",
      description: `${editingItem.type} has been updated successfully.`,
    });
  };

  const toggleExpand = (chapterId: string) => {
    setChapters(chapters.map(ch => 
      ch.id === chapterId ? { ...ch, expanded: !ch.expanded } : ch
    ));
  };

  const toggleModuleExpand = (chapterId: string, moduleId: string) => {
    setChapters(chapters.map(ch =>
      ch.id === chapterId
        ? {
            ...ch,
            modules: ch.modules.map(m =>
              m.id === moduleId ? { ...m, expanded: !m.expanded } : m
            )
          }
        : ch
    ));
  };

  const toggleTopicExpand = (chapterId: string, moduleId: string, topicId: string) => {
    setChapters(chapters.map(ch =>
      ch.id === chapterId
        ? {
            ...ch,
            modules: ch.modules.map(m =>
              m.id === moduleId
                ? {
                    ...m,
                    topics: m.topics.map(t =>
                      t.id === topicId ? { ...t, expanded: !t.expanded } : t
                    )
                  }
                : m
            )
          }
        : ch
    ));
  };

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === "chapter") {
      setChapters(chapters.filter(ch => ch.id !== itemToDelete.id));
      toast({ title: "Chapter Deleted", description: "The chapter has been deleted successfully." });
    } else if (itemToDelete.type === "module" && itemToDelete.chapterId) {
      setChapters(chapters.map(ch =>
        ch.id === itemToDelete.chapterId
          ? { ...ch, modules: ch.modules.filter(m => m.id !== itemToDelete.id) }
          : ch
      ));
      toast({ title: "Module Deleted", description: "The module has been deleted successfully." });
    } else if (itemToDelete.type === "topic" && itemToDelete.chapterId && itemToDelete.moduleId) {
      setChapters(chapters.map(ch =>
        ch.id === itemToDelete.chapterId
          ? {
              ...ch,
              modules: ch.modules.map(m =>
                m.id === itemToDelete.moduleId
                  ? { ...m, topics: m.topics.filter(t => t.id !== itemToDelete.id) }
                  : m
              )
            }
          : ch
      ));
      toast({ title: "Topic Deleted", description: "The topic has been deleted successfully." });
    } else if (itemToDelete.type === "subtopic" && itemToDelete.chapterId && itemToDelete.moduleId && itemToDelete.topicId) {
      setChapters(chapters.map(ch =>
        ch.id === itemToDelete.chapterId
          ? {
              ...ch,
              modules: ch.modules.map(m =>
                m.id === itemToDelete.moduleId
                  ? {
                      ...m,
                      topics: m.topics.map(t =>
                        t.id === itemToDelete.topicId
                          ? { ...t, subtopics: t.subtopics.filter(st => st.id !== itemToDelete.id) }
                          : t
                      )
                    }
                  : m
              )
            }
          : ch
      ));
      toast({ title: "Subtopic Deleted", description: "The subtopic has been deleted successfully." });
    } else if (itemToDelete.type === "outcome" && itemToDelete.chapterId && itemToDelete.moduleId && itemToDelete.topicId && itemToDelete.subtopicId) {
      setChapters(chapters.map(ch =>
        ch.id === itemToDelete.chapterId
          ? {
              ...ch,
              modules: ch.modules.map(m =>
                m.id === itemToDelete.moduleId
                  ? {
                      ...m,
                      topics: m.topics.map(t =>
                        t.id === itemToDelete.topicId
                          ? {
                              ...t,
                              subtopics: t.subtopics.map(st =>
                                st.id === itemToDelete.subtopicId
                                  ? { ...st, learningOutcomes: st.learningOutcomes.filter((_, idx) => idx.toString() !== itemToDelete.id) }
                                  : st
                              )
                            }
                          : t
                      )
                    }
                  : m
              )
            }
          : ch
      ));
      toast({ title: "Learning Outcome Deleted", description: "The learning outcome has been deleted successfully." });
    }
    
    setShowDeleteDialog(false);
    setItemToDelete(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setChapters((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        toast({
          title: "Chapter Reordered",
          description: "Chapter position has been updated.",
        });
        
        return newOrder;
      });
    }
  };

  const handleModuleDragEnd = (event: DragEndEvent, chapterId: string) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setChapters((chapters) => {
        return chapters.map(chapter => {
          if (chapter.id === chapterId) {
            const oldIndex = chapter.modules.findIndex((item) => item.id === active.id);
            const newIndex = chapter.modules.findIndex((item) => item.id === over.id);
            const newOrder = arrayMove(chapter.modules, oldIndex, newIndex);
            
            toast({
              title: "Module Reordered",
              description: "Module position has been updated.",
            });
            
            return { ...chapter, modules: newOrder };
          }
          return chapter;
        });
      });
    }
  };

  const handleTopicDragEnd = (event: DragEndEvent, chapterId: string, moduleId: string) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setChapters((chapters) => {
        return chapters.map(chapter => {
          if (chapter.id === chapterId) {
            return {
              ...chapter,
              modules: chapter.modules.map(module => {
                if (module.id === moduleId) {
                  const oldIndex = module.topics.findIndex((item) => item.id === active.id);
                  const newIndex = module.topics.findIndex((item) => item.id === over.id);
                  const newOrder = arrayMove(module.topics, oldIndex, newIndex);
                  
                  toast({
                    title: "Topic Reordered",
                    description: "Topic position has been updated.",
                  });
                  
                  return { ...module, topics: newOrder };
                }
                return module;
              })
            };
          }
          return chapter;
        });
      });
    }
  };

  const handleSubtopicDragEnd = (event: DragEndEvent, chapterId: string, moduleId: string, topicId: string) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setChapters((chapters) => {
        return chapters.map(chapter => {
          if (chapter.id === chapterId) {
            return {
              ...chapter,
              modules: chapter.modules.map(module => {
                if (module.id === moduleId) {
                  return {
                    ...module,
                    topics: module.topics.map(topic => {
                      if (topic.id === topicId) {
                        const oldIndex = topic.subtopics.findIndex((item) => item.id === active.id);
                        const newIndex = topic.subtopics.findIndex((item) => item.id === over.id);
                        const newOrder = arrayMove(topic.subtopics, oldIndex, newIndex);
                        
                        toast({
                          title: "Subtopic Reordered",
                          description: "Subtopic position has been updated.",
                        });
                        
                        return { ...topic, subtopics: newOrder };
                      }
                      return topic;
                    })
                  };
                }
                return module;
              })
            };
          }
          return chapter;
        });
      });
    }
  };

  const getGenerationLabel = (option: string) => {
    switch (option) {
      case "upload": return "Upload Documents";
      case "import": return "Import Structure";
      case "ai": return "Generate using AI";
      case "manual": return "Manual Generation";
      default: return option;
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
              onClick={() => navigate("/blueprints")}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="font-medium">Blueprints</span>
            </button>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-semibold">{blueprintData.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">{blueprintData.title}</h1>
            <p className="text-sm text-muted-foreground">Review and manage your blueprint</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => setShowPreferencesDialog(true)}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              Preferences
            </Button>
            <Button
              variant="outline"
              onClick={handleCopy}
              className="gap-2"
            >
              <CopyPlus className="w-4 h-4" />
              Clone
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
            <Button
              onClick={() => setShowPublishDialog(true)}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <Globe className="w-4 h-4" />
              Publish
            </Button>
          </div>
        </div>

        {/* Blueprint Details */}
        <div className="space-y-6">
          {/* Title Card */}
          <Card className="p-6 border-2 hidden">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg flex-shrink-0">
                <ImageIcon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">Title</h3>
                <p className="text-base text-muted-foreground">{blueprintData.title}</p>
              </div>
            </div>
          </Card>

          {/* Generation Type Card */}
          <Card className="p-4 sm:p-6 border-2">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 w-full">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">Generation Type</h3>
                
                {blueprintData.uploadedFiles && blueprintData.uploadedFiles.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Uploaded Files:</p>
                    <div className="flex flex-wrap gap-2">
                      {blueprintData.uploadedFiles.map((file, index) => (
                        <Badge key={index} variant="secondary" className="text-xs px-3 py-1.5 gap-1.5 font-medium">
                          <FileText className="w-3.5 h-3.5" />
                          {file.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {blueprintData.generateOption === "ai" && blueprintData.courseUnits && (
                  <div className="mt-4 p-3 sm:p-4 rounded-lg bg-background/50 border border-border">
                    <p className="text-sm font-semibold mb-3">Course Structure Hierarchy:</p>
                    <div className="space-y-3 sm:space-y-4">
                      {/* Chapter 1 */}
                      <div className="rounded-lg border-2 border-primary/20 bg-primary/[0.02] p-3 sm:p-4 space-y-2 sm:space-y-3 animate-fade-in hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
                            01
                          </div>
                          <span className="font-semibold text-primary text-sm sm:text-base break-words">Chapter 1: Introduction to Concepts</span>
                        </div>
                        
                        {/* Module 1.1 */}
                        <div className="ml-2 sm:ml-4 pl-2 sm:pl-4 border-l-2 border-border space-y-2 sm:space-y-3">
                          <div className="rounded-md border border-border bg-background/30 p-2 sm:p-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-blue-600 flex items-center justify-center text-white text-[9px] sm:text-[10px] font-semibold flex-shrink-0">
                                M1
                              </div>
                              <span className="font-medium text-blue-600 text-xs sm:text-sm break-words">Module 1.1: Core Principles</span>
                            </div>
                            
                            {/* Topic 1.1.1 */}
                            <div className="ml-1 sm:ml-2 pl-2 sm:pl-3 border-l border-border space-y-2">
                              <div className="rounded-sm bg-muted/20 p-2 space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-teal-600 flex items-center justify-center text-white text-[8px] sm:text-[9px] font-medium flex-shrink-0">
                                    T1
                                  </div>
                                  <span className="text-teal-600 text-xs sm:text-sm break-words">Topic 1.1.1: Fundamentals</span>
                                </div>
                                
                                {/* Subtopics */}
                                <div className="ml-4 sm:ml-7 space-y-1">
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <div className="w-1 h-1 rounded-full bg-teal-400 flex-shrink-0"></div>
                                    <span className="break-words">Basic Definitions</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <div className="w-1 h-1 rounded-full bg-teal-400 flex-shrink-0"></div>
                                    <span className="break-words">Key Terms</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <div className="w-1 h-1 rounded-full bg-teal-400 flex-shrink-0"></div>
                                    <span className="break-words">Core Concepts</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Topic 1.1.2 */}
                              <div className="rounded-sm bg-muted/20 p-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-teal-600 flex items-center justify-center text-white text-[8px] sm:text-[9px] font-medium flex-shrink-0">
                                    T2
                                  </div>
                                  <span className="text-teal-600 text-xs sm:text-sm break-words">Topic 1.1.2: Advanced Theory</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Module 1.2 */}
                          <div className="rounded-md border border-border bg-background/30 p-2 sm:p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-blue-600 flex items-center justify-center text-white text-[9px] sm:text-[10px] font-semibold flex-shrink-0">
                                M2
                              </div>
                              <span className="font-medium text-blue-600 text-xs sm:text-sm break-words">Module 1.2: Practical Applications</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Chapter 2 */}
                      <div className="rounded-lg border-2 border-primary/20 bg-primary/[0.02] p-3 sm:p-4 space-y-2 sm:space-y-3 animate-fade-in hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
                            02
                          </div>
                          <span className="font-semibold text-primary text-sm sm:text-base break-words">Chapter 2: Advanced Topics</span>
                        </div>
                        
                        <div className="ml-2 sm:ml-4 pl-2 sm:pl-4 border-l-2 border-border">
                          <div className="rounded-md border border-border bg-background/30 p-2 sm:p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-blue-600 flex items-center justify-center text-white text-[9px] sm:text-[10px] font-semibold flex-shrink-0">
                                M1
                              </div>
                              <span className="font-medium text-blue-600 text-xs sm:text-sm break-words">Module 2.1: Deep Dive</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="pt-2 sm:pt-3 mt-2 border-t-2 border-border">
                        <div className="flex items-center justify-between text-xs">
                          <p className="text-muted-foreground break-words">
                            <span className="font-semibold text-foreground">{blueprintData.courseUnits.chapters}</span> Chapters • 
                            <span className="font-semibold text-foreground ml-1">3</span> Modules • 
                            <span className="font-semibold text-foreground ml-1">2</span> Topics • 
                            <span className="font-semibold text-foreground ml-1">3</span> Subtopics
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Layout Card */}
          <Card className="p-4 sm:p-6 border-2">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-teal-600 flex items-center justify-center shadow-lg flex-shrink-0">
                <Layout className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 w-full">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">Selected Layout</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4">Visual layout template for your blueprint</p>
                <div className="flex flex-col h-40 sm:h-52 w-48 sm:w-64 rounded-xl border-2 border-teal-600 bg-teal-50 dark:bg-teal-950/50 shadow-lg overflow-hidden">
                  <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
                    {blueprintData.selectedLayout === 'layout1' && (
                      <div className="w-full h-full flex flex-col gap-3">
                        <div className="w-16 h-16 mx-auto rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-2 border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <div className="h-1.5 bg-foreground/25 rounded w-3/4"></div>
                            <div className="h-1 bg-foreground/15 rounded w-full"></div>
                            <div className="h-1 bg-foreground/15 rounded w-5/6"></div>
                          </div>
                          <div className="space-y-1">
                            <div className="h-1.5 bg-foreground/25 rounded w-3/4"></div>
                            <div className="h-1 bg-foreground/15 rounded w-full"></div>
                            <div className="h-1 bg-foreground/15 rounded w-5/6"></div>
                          </div>
                        </div>
                      </div>
                    )}
                    {blueprintData.selectedLayout === 'layout2' && (
                      <div className="w-full h-full flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <div className="h-1.5 bg-foreground/25 rounded w-3/4"></div>
                            <div className="h-1 bg-foreground/15 rounded w-full"></div>
                            <div className="h-1 bg-foreground/15 rounded w-5/6"></div>
                            <div className="h-1 bg-foreground/15 rounded w-4/5"></div>
                          </div>
                          <div className="space-y-1">
                            <div className="h-1.5 bg-foreground/25 rounded w-3/4"></div>
                            <div className="h-1 bg-foreground/15 rounded w-full"></div>
                            <div className="h-1 bg-foreground/15 rounded w-5/6"></div>
                            <div className="h-1 bg-foreground/15 rounded w-4/5"></div>
                          </div>
                        </div>
                        <div className="w-16 h-16 mx-auto rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-2 border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                          </div>
                        </div>
                      </div>
                    )}
                    {blueprintData.selectedLayout === 'layout3' && (
                      <div className="w-full h-full flex flex-col gap-3">
                        <div className="w-16 h-16 mx-auto rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-2 border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="h-1.5 bg-foreground/25 rounded w-1/2"></div>
                          <div className="h-1 bg-foreground/15 rounded w-full"></div>
                          <div className="h-1 bg-foreground/15 rounded w-5/6"></div>
                          <div className="h-1 bg-foreground/15 rounded w-4/5"></div>
                        </div>
                      </div>
                    )}
                    {blueprintData.selectedLayout === 'layout4' && (
                      <div className="w-full h-full flex flex-col gap-3">
                        <div className="space-y-1">
                          <div className="h-1.5 bg-foreground/25 rounded w-1/2"></div>
                          <div className="h-1 bg-foreground/15 rounded w-full"></div>
                          <div className="h-1 bg-foreground/15 rounded w-5/6"></div>
                          <div className="h-1 bg-foreground/15 rounded w-4/5"></div>
                        </div>
                        <div className="w-16 h-16 mx-auto rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-2 border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                          </div>
                        </div>
                      </div>
                    )}
                    {blueprintData.selectedLayout === 'layout5' && (
                      <div className="w-full h-full">
                        <div className="grid grid-cols-2 gap-3 items-center h-full">
                          <div className="space-y-1">
                            <div className="h-1.5 bg-foreground/25 rounded w-3/4"></div>
                            <div className="h-1 bg-foreground/15 rounded w-full"></div>
                            <div className="h-1 bg-foreground/15 rounded w-5/6"></div>
                            <div className="h-1 bg-foreground/15 rounded w-4/5"></div>
                            <div className="h-1 bg-foreground/15 rounded w-full"></div>
                          </div>
                          <div className="w-16 h-16 mx-auto rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-2 border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Layout Label Footer */}
                  <div className="h-8 flex items-center justify-center border-t border-teal-600/30 bg-teal-100 dark:bg-teal-900/40">
                    <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">
                      {blueprintData.selectedLayout.replace('layout', 'Layout ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Next Button / Chapter Section Toggle */}
        {!showChapterSection && (
          <div className="flex justify-center mt-8">
            <Button 
              onClick={handleNext}
              size="lg"
              className="px-12 py-6 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl"
            >
              Next: Add Chapters
            </Button>
          </div>
        )}

        {/* Chapter Management Section */}
        {showChapterSection && (
          <div className="mt-8 space-y-6">
            <div className="border-t-2 pt-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Chapter Management</h2>
                  <p className="text-sm text-muted-foreground">Define the hierarchical structure of your blueprint</p>
                </div>
                <Button 
                  onClick={() => setShowAddDialog(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Chapter
                </Button>
              </div>

              {/* Chapters List */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={chapters.map(ch => ch.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {chapters.length === 0 ? (
                      <Card className="p-12 text-center border-2 border-dashed">
                        <div className="max-w-sm mx-auto">
                          <img 
                            src={emptyChaptersImg} 
                            alt="No chapters added" 
                            className="w-full h-auto mb-6 rounded-lg"
                          />
                          <p className="text-muted-foreground text-lg mb-4">No chapters added yet</p>
                          <Button onClick={() => setShowAddDialog(true)} variant="outline" className="gap-2">
                            <Plus className="w-4 h-4" />
                            Add Your First Chapter
                          </Button>
                        </div>
                      </Card>
                    ) : (
                      chapters.map((chapter, index) => (
                        <SortableChapterItem
                          key={chapter.id}
                          chapter={chapter}
                          index={index}
                          onToggleExpand={toggleExpand}
                          onEdit={handleEdit}
                          onDelete={(data) => {
                            setItemToDelete(data);
                            setShowDeleteDialog(true);
                          }}
                          onAddModule={(chapterId) => {
                            setCurrentChapterId(chapterId);
                            setShowAddModuleDialog(true);
                          }}
                        >
                          {chapter.expanded && (
                        <div className="p-4 bg-muted/30 space-y-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-foreground">Modules</p>
                            <Button
                              size="sm"
                              onClick={() => {
                                setCurrentChapterId(chapter.id);
                                setShowAddModuleDialog(true);
                              }}
                              className="gap-2 h-8"
                            >
                              <Plus className="w-3 h-3" />
                              Add Module
                            </Button>
                          </div>

                          {chapter.modules.length === 0 ? (
                            <div className="text-center py-6 border-2 border-dashed rounded-lg">
                              <p className="text-sm text-muted-foreground mb-2">No modules yet</p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setCurrentChapterId(chapter.id);
                                  setShowAddModuleDialog(true);
                                }}
                                className="gap-2"
                              >
                                <Plus className="w-3 h-3" />
                                Add First Module
                              </Button>
                            </div>
                          ) : (
                            <DndContext
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragEnd={(e) => handleModuleDragEnd(e, chapter.id)}
                            >
                              <SortableContext
                                items={chapter.modules.map(m => m.id)}
                                strategy={verticalListSortingStrategy}
                              >
                                <div className="space-y-3">
                                  {chapter.modules.map((module, moduleIndex) => (
                                    <SortableModuleItem
                                      key={module.id}
                                      module={module}
                                      index={moduleIndex}
                                      chapterId={chapter.id}
                                      onToggleExpand={toggleModuleExpand}
                                      onEdit={handleEdit}
                                      onDelete={(data) => {
                                        setItemToDelete(data);
                                        setShowDeleteDialog(true);
                                      }}
                                    >
                                    {module.expanded && (
                                      <div className="p-3 bg-teal-50/30 dark:bg-teal-950/10 space-y-3">
                                      <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-medium text-foreground">Topics</p>
                                        <Button
                                          size="sm"
                                          onClick={() => {
                                            setCurrentChapterId(chapter.id);
                                            setCurrentModuleId(module.id);
                                            setShowAddTopicDialog(true);
                                          }}
                                          className="gap-2 h-7 text-xs"
                                        >
                                          <Plus className="w-3 h-3" />
                                          Add Topic
                                        </Button>
                                      </div>

                                      {module.topics.length === 0 ? (
                                        <div className="text-center py-4 border-2 border-dashed rounded-lg">
                                          <p className="text-xs text-muted-foreground mb-2">No topics yet</p>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                              setCurrentChapterId(chapter.id);
                                              setCurrentModuleId(module.id);
                                              setShowAddTopicDialog(true);
                                            }}
                                            className="gap-2 h-7 text-xs"
                                          >
                                            <Plus className="w-3 h-3" />
                                            Add First Topic
                                          </Button>
                                        </div>
                                      ) : (
                                        <DndContext
                                          sensors={sensors}
                                          collisionDetection={closestCenter}
                                          onDragEnd={(e) => handleTopicDragEnd(e, chapter.id, module.id)}
                                        >
                                          <SortableContext
                                            items={module.topics.map(t => t.id)}
                                            strategy={verticalListSortingStrategy}
                                          >
                                            <div className="space-y-2">
                                              {module.topics.map((topic, topicIndex) => (
                                                <SortableTopicItem
                                                  key={topic.id}
                                                  topic={topic}
                                                  index={topicIndex}
                                                  chapterId={chapter.id}
                                                  moduleId={module.id}
                                                  onToggleExpand={toggleTopicExpand}
                                                  onEdit={handleEdit}
                                                  onDelete={(data) => {
                                                    setItemToDelete(data);
                                                    setShowDeleteDialog(true);
                                                  }}
                                                >

                                              {topic.expanded && (
                                                <div className="p-2.5 bg-purple-50/30 dark:bg-purple-950/10 space-y-2">
                                                  <div className="flex items-center justify-between mb-2">
                                                    <p className="text-xs font-medium text-foreground">Subtopics</p>
                                                    <Button
                                                      size="sm"
                                                      onClick={() => {
                                                        setCurrentChapterId(chapter.id);
                                                        setCurrentModuleId(module.id);
                                                        setCurrentTopicId(topic.id);
                                                        setShowAddSubtopicDialog(true);
                                                      }}
                                                      className="gap-2 h-6 text-xs"
                                                    >
                                                      <Plus className="w-2.5 h-2.5" />
                                                      Add Subtopic
                                                    </Button>
                                                  </div>

                                                  {topic.subtopics.length === 0 ? (
                                                    <div className="text-center py-3 border-2 border-dashed rounded-lg">
                                                      <p className="text-xs text-muted-foreground mb-2">No subtopics yet</p>
                                                      <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                          setCurrentChapterId(chapter.id);
                                                          setCurrentModuleId(module.id);
                                                          setCurrentTopicId(topic.id);
                                                          setShowAddSubtopicDialog(true);
                                                        }}
                                                        className="gap-2 h-6 text-xs"
                                                      >
                                                        <Plus className="w-2.5 h-2.5" />
                                                        Add First Subtopic
                                                      </Button>
                                                    </div>
                                                   ) : (
                                                     <DndContext
                                                       sensors={sensors}
                                                       collisionDetection={closestCenter}
                                                       onDragEnd={(e) => handleSubtopicDragEnd(e, chapter.id, module.id, topic.id)}
                                                     >
                                                       <SortableContext
                                                         items={topic.subtopics.map(st => st.id)}
                                                         strategy={verticalListSortingStrategy}
                                                       >
                                                         <div className="space-y-2">
                                                           {topic.subtopics.map((subtopic, subtopicIndex) => (
                                                             <SortableSubtopicItem
                                                               key={subtopic.id}
                                                               subtopic={subtopic}
                                                               index={subtopicIndex}
                                                               chapterId={chapter.id}
                                                               moduleId={module.id}
                                                               topicId={topic.id}
                                                               onEdit={handleEdit}
                                                               onDelete={(data) => {
                                                                 setItemToDelete(data);
                                                                 setShowDeleteDialog(true);
                                                               }}
                                                               onAddOutcome={() => {
                                                                 setCurrentChapterId(chapter.id);
                                                                 setCurrentModuleId(module.id);
                                                                 setCurrentTopicId(topic.id);
                                                                 setCurrentSubtopicId(subtopic.id);
                                                                 setShowAddOutcomeDialog(true);
                                                               }}
                                                             >
                                                               <div className="pl-6 space-y-1">
                                                              <div className="flex items-center justify-between mb-1">
                                                                <p className="text-xs font-medium text-muted-foreground">Learning Outcomes</p>
                                                                <Button
                                                                  size="sm"
                                                                  onClick={() => {
                                                                    setCurrentChapterId(chapter.id);
                                                                    setCurrentModuleId(module.id);
                                                                    setCurrentTopicId(topic.id);
                                                                    setCurrentSubtopicId(subtopic.id);
                                                                    setShowAddOutcomeDialog(true);
                                                                  }}
                                                                  className="gap-1 h-5 text-xs px-2"
                                                                >
                                                                  <Plus className="w-2 h-2" />
                                                                  Add
                                                                </Button>
                                                              </div>

                                                              {subtopic.learningOutcomes.length === 0 ? (
                                                                <p className="text-xs text-muted-foreground italic">No learning outcomes yet</p>
                                                              ) : (
                                                                <ul className="space-y-1">
                                                                   {subtopic.learningOutcomes.map((outcome, outcomeIndex) => (
                                                                     <li key={outcomeIndex} className="flex items-start gap-2 text-xs group">
                                                                       <span className="text-orange-600 dark:text-orange-400 font-bold flex-shrink-0">•</span>
                                                                       <span className="flex-1 text-foreground">{outcome}</span>
                                                                       <Button
                                                                         size="icon"
                                                                         variant="ghost"
                                                                         className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                         onClick={() => {
                                                                           setItemToDelete({ 
                                                                             type: "outcome", 
                                                                             id: outcomeIndex.toString(), 
                                                                             chapterId: chapter.id, 
                                                                             moduleId: module.id,
                                                                             topicId: topic.id,
                                                                             subtopicId: subtopic.id
                                                                           });
                                                                           setShowDeleteDialog(true);
                                                                         }}
                                                                       >
                                                                         <X className="w-2.5 h-2.5" />
                                                                       </Button>
                                                                     </li>
                                                                   ))}
                                                                 </ul>
                                                               )}
                                                             </div>
                                                             </SortableSubtopicItem>
                                                           ))}
                                                         </div>
                                                       </SortableContext>
                                                     </DndContext>
                                                   )}
                                                 </div>
                                               )}
                                                </SortableTopicItem>
                                              ))}
                                            </div>
                                          </SortableContext>
                                        </DndContext>
                                      )}
                                    </div>
                                  )}
                                    </SortableModuleItem>
                                  ))}
                                </div>
                              </SortableContext>
                            </DndContext>
                          )}
                          </div>
                        )}
                        </SortableChapterItem>
                      ))
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        )}
      </div>

      {/* Add Chapter Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Chapter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="chapter-title">Chapter Title</Label>
              <Input
                id="chapter-title"
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                placeholder="Enter chapter title"
                onKeyDown={(e) => e.key === 'Enter' && handleAddChapter()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddChapter}>
              Add Chapter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Module Dialog */}
      <Dialog open={showAddModuleDialog} onOpenChange={setShowAddModuleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Module</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="module-title">Module Title</Label>
              <Input
                id="module-title"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                placeholder="Enter module title"
                onKeyDown={(e) => e.key === 'Enter' && handleAddModule()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModuleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddModule}>
              Add Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Topic Dialog */}
      <Dialog open={showAddTopicDialog} onOpenChange={setShowAddTopicDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Topic</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="topic-title">Topic Title</Label>
              <Input
                id="topic-title"
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                placeholder="Enter topic title"
                onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTopicDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTopic}>
              Add Topic
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Subtopic Dialog */}
      <Dialog open={showAddSubtopicDialog} onOpenChange={setShowAddSubtopicDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Subtopic</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subtopic-title">Subtopic Title</Label>
              <Input
                id="subtopic-title"
                value={newSubtopicTitle}
                onChange={(e) => setNewSubtopicTitle(e.target.value)}
                placeholder="Enter subtopic title"
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtopic()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSubtopicDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSubtopic}>
              Add Subtopic
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Learning Outcome Dialog */}
      <Dialog open={showAddOutcomeDialog} onOpenChange={setShowAddOutcomeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Learning Outcome</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="outcome-title">Learning Outcome</Label>
              <Input
                id="outcome-title"
                value={newOutcomeTitle}
                onChange={(e) => setNewOutcomeTitle(e.target.value)}
                placeholder="Enter learning outcome"
                onKeyDown={(e) => e.key === 'Enter' && handleAddOutcome()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddOutcomeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddOutcome}>
              Add Outcome
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editingItem?.type}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editingItem?.value || ""}
                onChange={(e) => setEditingItem(editingItem ? { ...editingItem, value: e.target.value } : null)}
                placeholder="Enter title"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {itemToDelete ? `Delete ${itemToDelete.type}?` : 'Delete Blueprint?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete 
                ? `This action cannot be undone. This will permanently delete this ${itemToDelete.type} and all its contents.`
                : `This action cannot be undone. This will permanently delete the blueprint "${blueprintData.title}".`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={itemToDelete ? handleDeleteConfirm : handleDelete} 
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Publish Confirmation Dialog */}
      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Publish</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure, do you want to publish the blueprint?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handlePublish} 
              className="bg-green-600 hover:bg-green-700"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clone Blueprint Dialog */}
      <CloneBlueprintDialog
        open={showCloneDialog}
        onOpenChange={setShowCloneDialog}
        blueprintId={blueprintId || ""}
        originalTitle={blueprintData.title}
      />

      {/* Preferences Dialog */}
      <Dialog open={showPreferencesDialog} onOpenChange={setShowPreferencesDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col">
          <DialogHeader className="p-6 pb-4 flex-shrink-0">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Blueprint Preferences
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 overflow-y-auto flex-1">
            <div className="space-y-6 pb-6">
              {/* Level Names */}
              <div className="bg-gradient-to-br from-background via-indigo-500/5 to-indigo-500/10 rounded-xl p-6 border-[1.5px] border-indigo-500/30">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg">
                      <Layers className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400 mb-1">Level Names</h2>
                      <p className="text-sm text-muted-foreground">Customize the names for each hierarchical level in your course structure</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
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
              <div className="bg-gradient-to-br from-background via-purple-500/5 to-purple-500/10 rounded-xl p-6 border-[1.5px] border-purple-500/30">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold text-purple-700 dark:text-purple-400 mb-1">Content Setup</h2>
                      <p className="text-sm text-muted-foreground">Content duration and chapter settings</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Content Duration Scope</Label>
                        <Input value="Complete Course" disabled className="bg-muted/50" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Chapter Span Time (Minutes)</Label>
                        <Input value="60" disabled className="bg-muted/50" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Generation */}
              <div className="bg-gradient-to-br from-background via-cyan-500/5 to-cyan-500/10 rounded-xl p-6 border-[1.5px] border-cyan-500/30">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-cyan-600 flex items-center justify-center shadow-lg">
                      <ImageIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold text-cyan-700 dark:text-cyan-400 mb-1">Image Generation</h2>
                      <p className="text-sm text-muted-foreground">Image generation settings for course</p>
                    </div>
                    <div className="bg-card/50 rounded-xl p-4 border border-cyan-500/20">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex items-center gap-3 rounded-lg border-2 border-border/60 bg-background/50 px-4 py-3">
                          <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                          <span className="font-medium text-sm">Each Course Unit</span>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border-2 border-border/60 bg-background/50 px-4 py-3">
                          <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                          <span className="font-medium text-sm">Each Chapter</span>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border-2 border-cyan-600 bg-cyan-50 dark:bg-cyan-950/50 px-4 py-3">
                          <div className="w-4 h-4 rounded-full border-2 border-cyan-600 bg-cyan-600 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                          <span className="font-medium text-sm">None</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question Generation */}
              <div className="bg-gradient-to-br from-background via-orange-500/5 to-orange-500/10 rounded-xl p-6 border-[1.5px] border-orange-500/30">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg">
                      <HelpCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold text-orange-700 dark:text-orange-400 mb-1">Question Generation</h2>
                      <p className="text-sm text-muted-foreground">Question generation settings for course</p>
                    </div>
                    <div className="bg-card/50 rounded-xl p-4 border border-orange-500/20">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex items-center gap-3 rounded-lg border-2 border-border/60 bg-background/50 px-4 py-3">
                          <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                          <span className="font-medium text-sm">Each Course Unit</span>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border-2 border-border/60 bg-background/50 px-4 py-3">
                          <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                          <span className="font-medium text-sm">Each Chapter</span>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border-2 border-orange-600 bg-orange-50 dark:bg-orange-950/50 px-4 py-3">
                          <div className="w-4 h-4 rounded-full border-2 border-orange-600 bg-orange-600 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                          <span className="font-medium text-sm">None</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SCORM Export */}
              <div className="bg-gradient-to-br from-background via-purple-500/5 to-purple-500/10 rounded-xl p-6 border-[1.5px] border-purple-500/30">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold text-purple-700 dark:text-purple-400 mb-1">SCORM Export</h2>
                      <p className="text-sm text-muted-foreground">SCORM export settings and question hierarchy</p>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Question Display Hierarchy */}
                      <div className="bg-card/50 rounded-xl p-4 border border-purple-500/20">
                        <Label className="text-sm font-semibold mb-3 block flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-600" />
                          Question Display Hierarchy
                        </Label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="flex items-center gap-3 rounded-lg border-2 border-purple-600 bg-purple-50 dark:bg-purple-950/50 px-4 py-3">
                            <div className="w-4 h-4 rounded-full border-2 border-purple-600 bg-purple-600 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white" />
                            </div>
                            <span className="font-medium text-sm">Course</span>
                          </div>
                          <div className="flex items-center gap-3 rounded-lg border-2 border-border/60 bg-background/50 px-4 py-3">
                            <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                            <span className="font-medium text-sm">Each Course Unit</span>
                          </div>
                          <div className="flex items-center gap-3 rounded-lg border-2 border-border/60 bg-background/50 px-4 py-3">
                            <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                            <span className="font-medium text-sm">Specific Course Unit</span>
                          </div>
                        </div>
                      </div>

                      {/* Assessment Questions */}
                      <div className="bg-card/50 rounded-xl p-4 border border-purple-500/20">
                        <Label className="text-sm font-semibold mb-3 block flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-purple-600" />
                          Total Number of Assessment Questions
                        </Label>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground">Single Choice (S.C.Q)</Label>
                            <Input value="20" disabled className="bg-muted/50 h-10" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground">Multiple Choice (M.C.Q)</Label>
                            <Input value="20" disabled className="bg-muted/50 h-10" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground">True/False</Label>
                            <Input value="5" disabled className="bg-muted/50 h-10" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground">Fill in Blanks (FIB)</Label>
                            <Input value="5" disabled className="bg-muted/50 h-10" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blooms Taxonomy */}
              <div className="bg-gradient-to-br from-background via-blue-500/5 to-blue-500/10 rounded-xl p-6 border-[1.5px] border-blue-500/30">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
                      <Layers className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400 mb-1">Blooms Taxonomy</h2>
                      <p className="text-sm text-muted-foreground">Bloom's Taxonomy levels applied to content</p>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Apply Blooms Taxonomy Toggle */}
                      <div className="bg-card/50 rounded-xl p-4 border border-blue-500/20">
                        <div className="flex items-center space-x-3">
                          <Checkbox id="apply-blooms-view" checked disabled className="w-5 h-5" />
                          <Label className="text-sm font-semibold flex items-center gap-2">
                            <Layers className="w-4 h-4 text-blue-600" />
                            Apply Blooms Taxonomy
                          </Label>
                        </div>
                      </div>

                      {/* Taxonomy Levels */}
                      <div className="bg-card/50 rounded-xl p-4 border border-blue-500/20">
                        <Label className="text-sm font-semibold mb-3 block flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-blue-600" />
                          Blooms Taxonomy Levels
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <div className="flex items-center gap-3 rounded-lg border-2 border-blue-600 bg-blue-50 dark:bg-blue-950/50 px-4 py-3">
                            <div className="w-4 h-4 rounded border-2 border-blue-600 bg-blue-600 flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </div>
                            <span className="font-medium text-sm">Knowledge</span>
                          </div>
                          <div className="flex items-center gap-3 rounded-lg border-2 border-blue-600 bg-blue-50 dark:bg-blue-950/50 px-4 py-3">
                            <div className="w-4 h-4 rounded border-2 border-blue-600 bg-blue-600 flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </div>
                            <span className="font-medium text-sm">Comprehension</span>
                          </div>
                          <div className="flex items-center gap-3 rounded-lg border-2 border-border/60 bg-background/50 px-4 py-3">
                            <div className="w-4 h-4 rounded border-2 border-muted-foreground/30" />
                            <span className="font-medium text-sm">Application</span>
                          </div>
                          <div className="flex items-center gap-3 rounded-lg border-2 border-border/60 bg-background/50 px-4 py-3">
                            <div className="w-4 h-4 rounded border-2 border-muted-foreground/30" />
                            <span className="font-medium text-sm">Analysis</span>
                          </div>
                          <div className="flex items-center gap-3 rounded-lg border-2 border-border/60 bg-background/50 px-4 py-3">
                            <div className="w-4 h-4 rounded border-2 border-muted-foreground/30" />
                            <span className="font-medium text-sm">Synthesis</span>
                          </div>
                          <div className="flex items-center gap-3 rounded-lg border-2 border-border/60 bg-background/50 px-4 py-3">
                            <div className="w-4 h-4 rounded border-2 border-muted-foreground/30" />
                            <span className="font-medium text-sm">Evaluation</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Targeted Audience */}
              <div className="bg-gradient-to-br from-background via-emerald-500/5 to-emerald-500/10 rounded-xl p-6 border-[1.5px] border-emerald-500/30">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold text-emerald-700 dark:text-emerald-400 mb-1">Targeted Audience</h2>
                      <p className="text-sm text-muted-foreground">Target audience for the course</p>
                    </div>
                    <div className="bg-card/50 rounded-xl p-4 border border-emerald-500/20">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex items-center gap-3 rounded-lg border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-4 py-3">
                          <div className="w-4 h-4 rounded border-2 border-emerald-600 bg-emerald-600 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          </div>
                          <span className="font-medium text-sm">Undergraduates</span>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-4 py-3">
                          <div className="w-4 h-4 rounded border-2 border-emerald-600 bg-emerald-600 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          </div>
                          <span className="font-medium text-sm">Graduates</span>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border-2 border-border/60 bg-background/50 px-4 py-3">
                          <div className="w-4 h-4 rounded border-2 border-muted-foreground/30" />
                          <span className="font-medium text-sm">Postgraduates</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Generation Guidelines */}
              <div className="bg-gradient-to-br from-background via-amber-500/5 to-amber-500/10 rounded-xl p-6 border-[1.5px] border-amber-500/30">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-amber-600 flex items-center justify-center shadow-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold text-amber-700 dark:text-amber-400 mb-1">Course Generation Guidelines</h2>
                      <p className="text-sm text-muted-foreground">Specific guidelines for course generation</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Guidelines:</Label>
                      <Textarea
                        value="No guidelines specified"
                        disabled
                        className="min-h-[100px] bg-background border-2 text-foreground"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Exclusions */}
              <div className="bg-gradient-to-br from-background via-red-500/5 to-red-500/10 rounded-xl p-6 border-[1.5px] border-red-500/30">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center shadow-lg">
                      <Settings className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-1">Exclusions</h2>
                      <p className="text-sm text-muted-foreground">Content or topics to exclude from the course</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Exclusions:</Label>
                      <Textarea
                        value="No exclusions specified"
                        disabled
                        className="min-h-[100px] bg-background border-2 text-foreground"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <span className="font-semibold">Note:</span> The number of questions generated for each Learning Outcome and exported as part of the SCORM will depend on the generated content and the total number of questions generated in the course.
                </p>
              </div>

              {/* Close Button */}
              <div className="flex justify-center pt-2">
                <Button 
                  onClick={() => setShowPreferencesDialog(false)}
                  size="sm"
                  className="px-8 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlueprintEditor;
