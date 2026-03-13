import { useState, useCallback, useRef, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ChevronDown, ChevronUp, Play, Share2, Plus, X, Undo2,
  LayoutGrid, FileText, HelpCircle, Layers, Check, Sparkles, Image,
  Type, ImageIcon, Video, FileText as DocIcon, MoreHorizontal,
  GripVertical, Pencil, Copy, Trash2, Send, Loader2, BookOpen,
  MessageCircleQuestion, Mic, ChevronLeft, ChevronRight,
} from "lucide-react";
import { GuidedTour, type TourStep } from "@/components/GuidedTour/GuidedTour";
import type { AIOptions } from "@/components/Dashboard/AIOptionsPanel";
import { AIHeaderButton } from "./AIHeaderButton";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverEvent, DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  arrayMove, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ContentBlock } from "./ContentBlock";
import { DescriptionBlock } from "./DescriptionBlock";
import { AddContentButton } from "./AddContentButton";
import { ContentBlocksPanel, resolveTemplateDropData } from "./ContentBlocksPanel";
import { LayoutSelectorDropdown } from "./LayoutSelectorDropdown";
import { GenerateQuizDialog, type GenerateQuizConfig } from "./GenerateQuizDialog";
import { SectionImageDialog } from "./SectionImageDialog";

interface MultiPageCourseCreatorProps {
  courseTitle: string;
  aiOptions?: AIOptions | null;
}

interface CourseItem {
  id: string;
  type: "section" | "page" | "question";
  title: string;
  inclusions?: string;
  children?: CourseItem[];
}

interface ContentBlockData {
  id: string;
  type: "text" | "image" | "description";
  content: string;
}

interface PageContentBlockData {
  id: string;
  type: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description";
  content: string;
}

interface DeletedBlock {
  block: ContentBlockData;
  index: number;
}

// Sortable wrapper for outline items
function SortableOutlineWrapper({ id, children }: { id: string; children: (listeners: Record<string, unknown>) => ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: transition ?? 'transform 250ms cubic-bezier(0.25, 1, 0.5, 1)',
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
    position: 'relative' as const,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children(listeners ?? {})}
    </div>
  );
}

export function MultiPageCourseCreator({ courseTitle, aiOptions: initialAIOptions = null }: MultiPageCourseCreatorProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState(courseTitle);
  const [showTour, setShowTour] = useState(true);
  const [tourStep, setTourStep] = useState(0);

  // Introduction content blocks
  const [introBlocks, setIntroBlocks] = useState<ContentBlockData[]>([
    { id: "description-block", type: "description", content: "" },
  ]);

  // Course outline items
  const [items, setItems] = useState<CourseItem[]>([]);
  const [aiOptions, setAIOptions] = useState<AIOptions | null>(initialAIOptions);

  // Deleted intro blocks for undo
  const [deletedIntroBlocks, setDeletedIntroBlocks] = useState<Map<string, DeletedBlock>>(new Map());
  const deleteTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Page content blocks map
  const [pageBlocksMap, setPageBlocksMap] = useState<Record<string, PageContentBlockData[]>>({});

  // Navigation: "introduction" | page/section id
  const [selectedItemId, setSelectedItemId] = useState<string>("introduction");

  // Sidebar
  const [sidebarTab, setSidebarTab] = useState<"outline" | "blocks">("outline");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  // Outline management dialogs
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<{ id: string; title: string } | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Intro drag state
  const [introActiveId, setIntroActiveId] = useState<string | null>(null);
  const [introOverId, setIntroOverId] = useState<string | null>(null);

  // Page editor state
  const [pageBlocks, setPageBlocks] = useState<PageContentBlockData[]>([]);
  const [lastAddedBlockId, setLastAddedBlockId] = useState<string | null>(null);
  const [deletedPageBlocks, setDeletedPageBlocks] = useState<Map<string, { block: PageContentBlockData; index: number }>>(new Map());
  const [showAiBlock, setShowAiBlock] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiBlockType, setAiBlockType] = useState<"text" | "image" | "quiz" | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const aiPromptRef = useRef<HTMLTextAreaElement>(null);
  const [showQuizGenerateDialog, setShowQuizGenerateDialog] = useState(false);
  const [isQuizGenerating, setIsQuizGenerating] = useState(false);

  // AI review state
  const [aiReviewBlockId, setAiReviewBlockId] = useState<string | null>(null);
  const [aiReviewMode, setAiReviewMode] = useState<"review" | "modify">("review");
  const [modifyPrompt, setModifyPrompt] = useState("");
  const modifyInputRef = useRef<HTMLTextAreaElement>(null);

  // Drop zone state
  const [isDragOver, setIsDragOver] = useState(false);

  // Section image state
  const [sectionImages, setSectionImages] = useState<Record<string, string>>({});
  const [showSectionImageDialog, setShowSectionImageDialog] = useState<string | null>(null);

  const aiEnabled = !!aiOptions?.enabled;

  const tourSteps: TourStep[] = [
    {
      target: "layout-selector",
      icon: <Layers className="w-5 h-5 text-muted-foreground" />,
      title: "Layout Selection",
      description: "Preview different layouts to see how your course adapts.",
      placement: "bottom",
    },
    {
      target: "sidebar-outline",
      icon: <LayoutGrid className="w-5 h-5 text-muted-foreground" />,
      title: "Course Outline",
      description: "Navigate your course structure. Click Introduction, sections, or pages to edit them.",
      placement: "right",
    },
    {
      target: "add-item",
      icon: <Plus className="w-5 h-5 text-muted-foreground" />,
      title: "Add Item",
      description: "Add Sections & Pages. Sections organize your course, but pages can stand alone or sit inside sections.",
      placement: "bottom",
    },
    {
      target: "header-actions",
      icon: <Sparkles className="w-5 h-5 text-muted-foreground" />,
      title: "AI Support, Preview & Publish",
      description: "AI Support improves your course, Preview shows it, Publish shares it.",
      placement: "bottom",
    },
  ];

  // Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const outlineSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // --- Sync page blocks when navigating ---
  useEffect(() => {
    if (selectedItemId === "introduction") {
      setPageBlocks([]);
      setDeletedPageBlocks(new Map());
      setShowAiBlock(false);
      setAiReviewBlockId(null);
      return;
    }
    setPageBlocks(pageBlocksMap[selectedItemId] || []);
    setDeletedPageBlocks(new Map());
    setShowAiBlock(false);
    setAiReviewBlockId(null);
  }, [selectedItemId]);

  // Sync page blocks back to map
  const pageBlocksRef = useRef(pageBlocks);
  pageBlocksRef.current = pageBlocks;
  useEffect(() => {
    if (selectedItemId !== "introduction") {
      setPageBlocksMap((prev) => ({ ...prev, [selectedItemId]: pageBlocksRef.current }));
    }
  }, [pageBlocks, selectedItemId]);

  // --- OUTLINE MANAGEMENT ---
  const handleOutlineDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id);
        const newIndex = prev.findIndex((i) => i.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);

  const handleAddItem = useCallback((type: "section" | "page") => {
    const newItem: CourseItem = {
      id: `${type}-${Date.now()}`,
      type,
      title: type === "section" ? "Untitled section" : "",
    };
    setItems((prev) => [...prev, newItem]);
  }, []);

  const updateItemTitle = useCallback((id: string, newTitle: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) return { ...item, title: newTitle };
        if (item.children) {
          const updatedChildren = item.children.map((c) => c.id === id ? { ...c, title: newTitle } : c);
          return { ...item, children: updatedChildren };
        }
        return item;
      })
    );
  }, []);

  const updateItemInclusions = useCallback((id: string, inclusions: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, inclusions } : item))
    );
  }, []);

  const deleteItem = useCallback((id: string) => {
    // If deleting the selected item, navigate to introduction
    if (selectedItemId === id) {
      setSelectedItemId("introduction");
    }
    setItems((prev) => {
      if (prev.some((item) => item.id === id)) {
        return prev.filter((item) => item.id !== id);
      }
      return prev.map((item) => {
        if (!item.children) return item;
        const filtered = item.children.filter((c) => c.id !== id);
        if (filtered.length !== item.children.length) return { ...item, children: filtered };
        return item;
      });
    });
  }, [selectedItemId]);

  const duplicateItem = useCallback((id: string) => {
    setItems((prev) => {
      let idx = prev.findIndex((item) => item.id === id);
      if (idx !== -1) {
        const original = prev[idx];
        const cloneId = `${original.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const clonedChildren = original.children?.map((child) => {
          const childCloneId = `${child.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          if (pageBlocksMap[child.id]) {
            setPageBlocksMap((prev) => ({
              ...prev,
              [childCloneId]: pageBlocksMap[child.id].map((b) => ({
                ...b,
                id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              })),
            }));
          }
          return { ...child, id: childCloneId };
        });
        if (pageBlocksMap[id]) {
          setPageBlocksMap((prev) => ({
            ...prev,
            [cloneId]: pageBlocksMap[id].map((b) => ({
              ...b,
              id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            })),
          }));
        }
        const clone = { ...original, id: cloneId, children: clonedChildren };
        const next = [...prev];
        next.splice(idx + 1, 0, clone);
        toast({
          title: `${original.type.charAt(0).toUpperCase() + original.type.slice(1)} duplicated`,
          description: `"${original.title || `Untitled ${original.type}`}" has been duplicated.`,
        });
        return next;
      }
      return prev.map((item) => {
        if (!item.children) return item;
        const childIdx = item.children.findIndex((c) => c.id === id);
        if (childIdx === -1) return item;
        const original = item.children[childIdx];
        const cloneId = `${original.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        if (pageBlocksMap[id]) {
          setPageBlocksMap((prev) => ({
            ...prev,
            [cloneId]: pageBlocksMap[id].map((b) => ({
              ...b,
              id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            })),
          }));
        }
        const clone = { ...original, id: cloneId };
        const newChildren = [...item.children];
        newChildren.splice(childIdx + 1, 0, clone);
        toast({ title: "Page duplicated", description: `"${original.title || "Untitled page"}" duplicated.` });
        return { ...item, children: newChildren };
      });
    });
  }, [pageBlocksMap, toast]);

  const addPageToSection = useCallback((sectionId: string) => {
    const newPage: CourseItem = {
      id: `page-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: "page",
      title: "",
    };
    setItems((prev) => prev.map((item) => {
      if (item.id === sectionId && item.type === "section") {
        return { ...item, children: [...(item.children || []), newPage] };
      }
      return item;
    }));
  }, []);

  const findPageItem = useCallback((pageId: string): CourseItem | null => {
    for (const item of items) {
      if (item.id === pageId) return item;
      if (item.children) {
        const child = item.children.find((c) => c.id === pageId);
        if (child) return child;
      }
    }
    return null;
  }, [items]);

  // --- INTRODUCTION BLOCK MANAGEMENT ---
  const addIntroTextBlock = useCallback((insertAt?: number) => {
    const defaultContent = `<h2 style="font-size: 1.75rem; font-weight: 600;">Your heading text goes here</h2><br/><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>`;
    const newBlock: ContentBlockData = { id: `block-${Date.now()}`, type: "text", content: defaultContent };
    setIntroBlocks((prev) => {
      if (insertAt !== undefined) {
        const next = [...prev];
        next.splice(insertAt, 0, newBlock);
        return next;
      }
      return [...prev, newBlock];
    });
  }, []);

  const addIntroImageBlock = useCallback((insertAt?: number) => {
    const newBlock: ContentBlockData = { id: `block-${Date.now()}`, type: "image", content: "" };
    setIntroBlocks((prev) => {
      if (insertAt !== undefined) {
        const next = [...prev];
        next.splice(insertAt, 0, newBlock);
        return next;
      }
      return [...prev, newBlock];
    });
  }, []);

  const updateIntroBlockContent = useCallback((id: string, content: string) => {
    setIntroBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content } : b)));
  }, []);

  const deleteIntroBlock = useCallback((id: string) => {
    if (id === "description-block") {
      setIntroBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content: "" } : b)));
      return;
    }
    const idx = introBlocks.findIndex((b) => b.id === id);
    if (idx === -1) return;
    const block = introBlocks[idx];
    setDeletedIntroBlocks((prev) => { const next = new Map(prev); next.set(id, { block, index: idx }); return next; });
    setIntroBlocks((prev) => prev.filter((b) => b.id !== id));
  }, [introBlocks]);

  const undoIntroDelete = useCallback((id: string) => {
    const deleted = deletedIntroBlocks.get(id);
    if (!deleted) return;
    const timer = deleteTimers.current.get(id);
    if (timer) clearTimeout(timer);
    deleteTimers.current.delete(id);
    setIntroBlocks((prev) => {
      const next = [...prev];
      next.splice(Math.min(deleted.index, next.length), 0, deleted.block);
      return next;
    });
    setDeletedIntroBlocks((prev) => { const next = new Map(prev); next.delete(id); return next; });
  }, [deletedIntroBlocks]);

  const dismissIntroDeletedBlock = useCallback((id: string) => {
    const timer = deleteTimers.current.get(id);
    if (timer) clearTimeout(timer);
    deleteTimers.current.delete(id);
    setDeletedIntroBlocks((prev) => { const next = new Map(prev); next.delete(id); return next; });
  }, []);

  const duplicateIntroBlock = useCallback((id: string) => {
    setIntroBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const clone = { ...prev[idx], id: `block-${Date.now()}` };
      const next = [...prev];
      next.splice(idx + 1, 0, clone);
      toast({ title: "Block duplicated", description: "Content block duplicated." });
      return next;
    });
  }, [toast]);

  // Intro drag handlers
  const handleIntroDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setIntroActiveId(null);
    setIntroOverId(null);
    if (over && active.id !== over.id) {
      setIntroBlocks((prev) => {
        const oldIndex = prev.findIndex((b) => b.id === active.id);
        const newIndex = prev.findIndex((b) => b.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);

  // --- PAGE BLOCK MANAGEMENT ---
  const getVariantContent = (type: string, variant?: string): string => {
    if (type === "quiz") return "[]";
    if (type === "image") return "";
    if (type === "image-description") {
      return JSON.stringify({
        layout: variant === "image-bottom" ? "image-bottom" : "image-top",
        imageUrl: "",
        description: "<p>Add a description here...</p>",
      });
    }
    if (type !== "text") return "";
    switch (variant) {
      case "heading-text":
        return "<h2>Heading</h2><p>Employee-generated Learning empowers experts to create learning content using their own knowledge and expertise.</p>";
      case "text-only":
        return "<p>Employee-generated Learning empowers experts to create learning content using their own knowledge and expertise as a source of input for e-learning.</p>";
      case "two-columns":
        return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem"><div><h3>Heading</h3><p>Employee-generated Learning enables employees to learn from each other through shared expertise.</p></div><div><h3>Heading</h3><p>Employee-generated Learning enables employees to learn from each other through shared expertise.</p></div></div>';
      default:
        return "<p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>";
    }
  };

  const addPageBlock = useCallback((type: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description", atIndex?: number, variant?: string) => {
    const id = `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const defaultContent = getVariantContent(type, variant);
    setPageBlocks((prev) => {
      if (atIndex !== undefined) {
        const next = [...prev];
        next.splice(atIndex, 0, { id, type, content: defaultContent });
        return next;
      }
      return [...prev, { id, type, content: defaultContent }];
    });
    setLastAddedBlockId(id);
  }, []);

  const updatePageBlock = useCallback((id: string, content: string) => {
    setPageBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content } : b)));
  }, []);

  const deletePageBlock = useCallback((id: string) => {
    setPageBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const block = prev[idx];
      setDeletedPageBlocks((dm) => { const next = new Map(dm); next.set(id, { block, index: idx }); return next; });
      return prev.filter((b) => b.id !== id);
    });
  }, []);

  const undoDeletePageBlock = useCallback((id: string) => {
    setDeletedPageBlocks((dm) => {
      const entry = dm.get(id);
      if (!entry) return dm;
      setPageBlocks((prev) => {
        const next = [...prev];
        next.splice(Math.min(entry.index, next.length), 0, entry.block);
        return next;
      });
      const nextMap = new Map(dm);
      nextMap.delete(id);
      return nextMap;
    });
  }, []);

  const dismissDeletedPageBlock = useCallback((id: string) => {
    setDeletedPageBlocks((dm) => { const next = new Map(dm); next.delete(id); return next; });
  }, []);

  const duplicatePageBlock = useCallback((id: string) => {
    setPageBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const newId = `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const copy = { ...prev[idx], id: newId };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }, []);

  const handlePageDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPageBlocks((prev) => {
        const oldIndex = prev.findIndex((b) => b.id === active.id);
        const newIndex = prev.findIndex((b) => b.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);

  // Drop handler for blocks from ContentBlocksPanel
  const handleContentDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const data = e.dataTransfer.getData("application/content-block");
    if (!data) return;
    try {
      const { templateId, categoryId } = JSON.parse(data);
      const resolved = resolveTemplateDropData(templateId, categoryId);
      if (!resolved) {
        setShowQuizGenerateDialog(true);
        return;
      }
      if (selectedItemId === "introduction") {
        // Add to intro blocks based on type
        if (resolved.type === "text") addIntroTextBlock();
        else if (resolved.type === "image") addIntroImageBlock();
      } else {
        addPageBlock(resolved.type, undefined, resolved.variant);
      }
    } catch {}
  }, [selectedItemId, addIntroTextBlock, addIntroImageBlock, addPageBlock]);

  const handleEditorDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("application/content-block")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      setIsDragOver(true);
    }
  }, []);

  const handleEditorDragLeave = useCallback((e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const { clientX, clientY } = e;
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
      setIsDragOver(false);
    }
  }, []);

  // AI handlers
  const handleQuizGenerate = useCallback((config: GenerateQuizConfig) => {
    setIsQuizGenerating(true);
    setTimeout(() => {
      const id = `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const questions: any[] = [];
      let idCounter = 1;
      for (let i = 0; i < config.scqCount; i++) questions.push({ id: idCounter++, type: "SCQ", question: `Sample single choice question ${i + 1}?`, options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A", explanation: "Explanation." });
      for (let i = 0; i < config.mcqCount; i++) questions.push({ id: idCounter++, type: "MCQ", question: `Sample multiple choice question ${i + 1}?`, options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A, Option B", explanation: "Explanation." });
      for (let i = 0; i < config.trueFalseCount; i++) questions.push({ id: idCounter++, type: "TrueFalse", question: `Sample true/false statement ${i + 1}.`, options: ["True", "False"], answer: "True", explanation: "Explanation." });
      for (let i = 0; i < config.fibCount; i++) questions.push({ id: idCounter++, type: "FIB", question: `The _____ is a sample fill-in-the-blank ${i + 1}.`, options: [], answer: "answer", explanation: "Explanation." });
      setPageBlocks((prev) => [...prev, { id, type: "quiz", content: JSON.stringify(questions) }]);
      setLastAddedBlockId(id);
      setIsQuizGenerating(false);
      setShowQuizGenerateDialog(false);
    }, 1500);
  }, []);

  const handleAiGenerate = useCallback((prompt: string, blockType: "text" | "image" | "quiz" | null) => {
    setAiGenerating(true);
    const type = blockType || "text";
    setTimeout(() => {
      const id = `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const content = type === "text"
        ? `<h3>${prompt}</h3><p>Based on your prompt, here is an AI-generated overview. This section covers key concepts and practical applications.</p><p>Key takeaways include understanding fundamental principles and applying best practices.</p>`
        : "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=400&fit=crop";
      setPageBlocks((prev) => [...prev, { id, type, content }]);
      setLastAddedBlockId(id);
      setAiGenerating(false);
      setShowAiBlock(false);
      setAiBlockType(null);
      if (type === "text") { setAiReviewBlockId(id); setAiReviewMode("review"); }
    }, 3000);
  }, []);

  const handleAiReviewAdd = useCallback(() => {
    setAiReviewBlockId(null); setAiReviewMode("review"); setModifyPrompt("");
  }, []);

  const handleAiReviewCancel = useCallback(() => {
    if (aiReviewBlockId) setPageBlocks((prev) => prev.filter((b) => b.id !== aiReviewBlockId));
    setAiReviewBlockId(null); setAiReviewMode("review"); setModifyPrompt("");
  }, [aiReviewBlockId]);

  const handleAiModifySubmit = useCallback(() => {
    if (!modifyPrompt.trim() || !aiReviewBlockId) return;
    setAiGenerating(true);
    setTimeout(() => {
      setPageBlocks((prev) => prev.map((b) => {
        if (b.id !== aiReviewBlockId) return b;
        return { ...b, content: `${b.content}<p><em>Modified: "${modifyPrompt}"</em></p><p>Content updated to reflect your changes.</p>` };
      }));
      setAiGenerating(false); setAiReviewMode("review"); setModifyPrompt("");
    }, 2000);
  }, [modifyPrompt, aiReviewBlockId]);

  const handleBack = () => navigate("/dashboard");

  // Current selected item
  const currentItem = findPageItem(selectedItemId);
  const isCurrentSection = currentItem?.type === "section";

  // Reorder child items in a section
  const reorderChildItems = useCallback((sectionId: string, activeId: string, overId: string) => {
    setItems((prev) => prev.map((item) => {
      if (item.id === sectionId && item.children) {
        const oldIdx = item.children.findIndex((c) => c.id === activeId);
        const newIdx = item.children.findIndex((c) => c.id === overId);
        if (oldIdx === -1 || newIdx === -1) return item;
        return { ...item, children: arrayMove(item.children, oldIdx, newIdx) };
      }
      return item;
    }));
  }, []);

  // Delete handling for outline (with navigation)
  const handleDeleteOutlineItem = useCallback((id: string) => {
    if (id === selectedItemId) {
      // Navigate to adjacent item or introduction
      const allIds: string[] = ["introduction"];
      items.forEach((item) => {
        allIds.push(item.id);
        item.children?.forEach((c) => allIds.push(c.id));
      });
      const idx = allIds.indexOf(id);
      const nextId = allIds[idx + 1] ?? allIds[idx - 1] ?? "introduction";
      setSelectedItemId(nextId);
    }
    deleteItem(id);
  }, [selectedItemId, items, deleteItem]);

  // Flatten all navigable IDs for prev/next
  const allNavIds = (() => {
    const ids: string[] = ["introduction"];
    items.forEach((item) => {
      ids.push(item.id);
      item.children?.forEach((c) => ids.push(c.id));
    });
    return ids;
  })();

  const currentNavIndex = allNavIds.indexOf(selectedItemId);
  const canGoPrev = currentNavIndex > 0;
  const canGoNext = currentNavIndex < allNavIds.length - 1;
  const goToPrev = () => { if (canGoPrev) setSelectedItemId(allNavIds[currentNavIndex - 1]); };
  const goToNext = () => { if (canGoNext) setSelectedItemId(allNavIds[currentNavIndex + 1]); };

  // Get breadcrumb info
  const getBreadcrumb = () => {
    if (selectedItemId === "introduction") return [{ label: "Introduction", icon: BookOpen }];
    for (const item of items) {
      if (item.id === selectedItemId) {
        return [{ label: item.type === "section" ? (item.title || "Untitled section") : (item.title || "Untitled page"), icon: item.type === "section" ? LayoutGrid : FileText }];
      }
      if (item.children) {
        const child = item.children.find((c) => c.id === selectedItemId);
        if (child) {
          return [
            { label: item.title || "Untitled section", icon: LayoutGrid },
            { label: child.title || "Untitled page", icon: FileText },
          ];
        }
      }
    }
    return [];
  };

  // Get current page count label
  const getPageLabel = () => {
    const idx = currentNavIndex;
    const total = allNavIds.length;
    return `${idx + 1} / ${total}`;
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Go back">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-3 min-w-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-base font-semibold text-foreground truncate max-w-[180px] sm:max-w-[250px] lg:max-w-[350px] cursor-default">
                    {title.length > 40 ? `${title.slice(0, 40)}...` : title}
                  </span>
                </TooltipTrigger>
                {title.length > 40 && (
                  <TooltipContent side="bottom" className="max-w-[300px] text-sm">{title}</TooltipContent>
                )}
              </Tooltip>
              <span className="text-muted-foreground/30 select-none">|</span>
              <LayoutSelectorDropdown currentLayout="multi-page" title={title} aiOptions={aiOptions} />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3" data-tour="header-actions">
            <AIHeaderButton aiOptions={aiOptions} onOptionsChange={setAIOptions} />
            <Button variant="outline" size="icon" className="rounded-full border-border" onClick={() => {
              navigate("/multipage-preview", { state: { title, items, contentBlocks: introBlocks, pageBlocksMap } });
            }}>
              <Play className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="rounded-full border-primary text-primary hover:bg-primary/5 gap-2">
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Publish</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowTour(true)}>
              <HelpCircle className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Bar — horizontal outline strip */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm" data-tour="sidebar-outline">
        <div className="flex items-center h-11 px-4 sm:px-6 gap-2 overflow-x-auto thin-scrollbar">
          {/* Prev/Next navigation */}
          <div className="flex items-center gap-1 shrink-0 mr-2">
            <button
              onClick={goToPrev}
              disabled={!canGoPrev}
              className="p-1.5 rounded-md hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <span className="text-xs font-medium text-muted-foreground tabular-nums min-w-[40px] text-center">{getPageLabel()}</span>
            <button
              onClick={goToNext}
              disabled={!canGoNext}
              className="p-1.5 rounded-md hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="w-px h-5 bg-border shrink-0" />

          {/* Introduction pill */}
          <button
            onClick={() => setSelectedItemId("introduction")}
            className={cn(
              "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              selectedItemId === "introduction"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <BookOpen className="w-3 h-3" />
            Intro
          </button>

          {/* Outline items as pills */}
          {(() => {
            let sectionIndex = 0;
            return items.map((item) => {
              if (item.type === "section") {
                sectionIndex++;
                const isSectionActive = selectedItemId === item.id;
                const hasActiveChild = item.children?.some((c) => c.id === selectedItemId) ?? false;
                const activeChild = item.children?.find((c) => c.id === selectedItemId);

                return (
                  <DropdownMenu key={item.id}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={cn(
                          "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                          (isSectionActive || hasActiveChild)
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <LayoutGrid className="w-3 h-3" />
                        <span className="truncate max-w-[120px]">{item.title || `Section ${sectionIndex}`}</span>
                        <ChevronDown className="w-3 h-3 opacity-60" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 p-1.5">
                      {/* Section header */}
                      <DropdownMenuItem
                        className={cn(
                          "gap-2.5 px-3 py-2.5 rounded-md font-medium",
                          isSectionActive && "bg-primary/10 text-primary"
                        )}
                        onClick={() => setSelectedItemId(item.id)}
                      >
                        <LayoutGrid className="w-4 h-4" />
                        <span className="truncate">{item.title || "Untitled section"}</span>
                      </DropdownMenuItem>
                      {item.children && item.children.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          {item.children.map((child, idx) => (
                            <DropdownMenuItem
                              key={child.id}
                              className={cn(
                                "gap-2.5 px-3 py-2 rounded-md pl-6",
                                child.id === selectedItemId && "bg-primary/10 text-primary font-medium"
                              )}
                              onClick={() => setSelectedItemId(child.id)}
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span className="truncate">{child.title || `Page ${idx + 1}`}</span>
                            </DropdownMenuItem>
                          ))}
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="gap-2.5 px-3 py-2 rounded-md text-muted-foreground" onClick={() => addPageToSection(item.id)}>
                        <Plus className="w-3.5 h-3.5" />
                        Add page
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="gap-2 text-sm" onClick={() => { setRenameValue(item.title || ""); setRenameTarget({ id: item.id, title: item.title || "" }); }}>
                        <Pencil className="w-3.5 h-3.5" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-sm" onClick={() => duplicateItem(item.id)}>
                        <Copy className="w-3.5 h-3.5" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-sm text-destructive focus:text-destructive" onClick={() => setDeleteConfirmId(item.id)}>
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }

              // Standalone page
              const isPageActive = item.id === selectedItemId;
              return (
                <div key={item.id} className="shrink-0 flex items-center group/pill">
                  <button
                    onClick={() => setSelectedItemId(item.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                      isPageActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <FileText className="w-3 h-3" />
                    <span className="truncate max-w-[120px]">{item.title || "Untitled page"}</span>
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-0.5 rounded-md opacity-0 group-hover/pill:opacity-100 hover:bg-muted transition-all ml-0.5">
                        <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-40">
                      <DropdownMenuItem className="gap-2 text-sm" onClick={() => { setRenameValue(item.title || ""); setRenameTarget({ id: item.id, title: item.title || "" }); }}>
                        <Pencil className="w-3.5 h-3.5" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-sm" onClick={() => duplicateItem(item.id)}>
                        <Copy className="w-3.5 h-3.5" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="gap-2 text-sm text-destructive focus:text-destructive" onClick={() => setDeleteConfirmId(item.id)}>
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            });
          })()}

          <div className="w-px h-5 bg-border shrink-0" />

          {/* Add item */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-all" data-tour="add-item">
                <Plus className="w-3 h-3" />
                Add
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 p-1.5">
              <DropdownMenuItem className="cursor-pointer gap-2.5 px-3 py-2.5 rounded-md" onClick={() => handleAddItem("section")}>
                <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">New section</span>
                  <span className="text-[11px] text-muted-foreground">Group related pages</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2.5 px-3 py-2.5 rounded-md" onClick={() => handleAddItem("page")}>
                <FileText className="w-4 h-4 text-muted-foreground" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">New page</span>
                  <span className="text-[11px] text-muted-foreground">Single learning unit</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Breadcrumb bar */}
      <div className="border-b border-border/60 bg-background px-6 sm:px-10">
        <div className="max-w-4xl mx-auto flex items-center h-10 gap-2">
          {getBreadcrumb().map((crumb, idx) => (
            <span key={idx} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {idx > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground/40" />}
              <crumb.icon className="w-3.5 h-3.5" />
              <span className={cn(idx === getBreadcrumb().length - 1 ? "text-foreground font-medium" : "")}>
                {crumb.label}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Main Editor Area — full width, centered */}
      <div
        className={cn(
          "flex-1 overflow-y-auto thin-scrollbar transition-all",
          isDragOver && "ring-2 ring-primary/30 ring-inset bg-primary/[0.02]"
        )}
        onDragOver={handleEditorDragOver}
        onDragLeave={handleEditorDragLeave}
        onDrop={handleContentDrop}
      >
        {selectedItemId === "introduction" ? (
          /* ===== INTRODUCTION EDITOR ===== */
          <div className="max-w-4xl mx-auto px-6 sm:px-10 py-8 sm:py-12">
            {/* Course Title */}
            <div className="relative group mb-2">
              <textarea
                value={title}
                onChange={(e) => { if (e.target.value.length <= 275) setTitle(e.target.value); }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground bg-transparent border-none outline-none w-full placeholder:text-foreground/40 resize-none overflow-hidden leading-tight"
                placeholder="Untitled course"
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = target.scrollHeight + 'px';
                }}
              />
              <div className="absolute bottom-0 left-0 w-full h-px bg-transparent group-focus-within:bg-primary transition-colors duration-200" />
            </div>
            <span className="inline-block px-2 py-0.5 text-xs text-muted-foreground bg-muted/50 rounded border border-border/60 mb-6">
              {title.length}/275
            </span>

            {/* Decorative line */}
            <div className="h-1 bg-primary/20 rounded-full w-full mb-8" />

            {/* Content Blocks */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={(e) => setIntroActiveId(e.active.id as string)}
              onDragOver={(e) => setIntroOverId(e.over?.id as string | null)}
              onDragEnd={handleIntroDragEnd}
              onDragCancel={() => { setIntroActiveId(null); setIntroOverId(null); }}
            >
              <SortableContext items={introBlocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-0">
                  {(() => {
                    const deletedArr = Array.from(deletedIntroBlocks.entries()).sort(([, a], [, b]) => a.index - b.index);
                    const elements: React.ReactNode[] = [];
                    let blockIdx = 0;
                    let deletedIdx = 0;
                    let position = 0;

                    while (blockIdx < introBlocks.length || deletedIdx < deletedArr.length) {
                      if (deletedIdx < deletedArr.length && deletedArr[deletedIdx][1].index <= position) {
                        const [deletedId] = deletedArr[deletedIdx];
                        elements.push(
                          <div key={`deleted-${deletedId}`} className="animate-fade-in my-2">
                            <div className="flex items-center justify-between px-5 py-3.5 rounded-lg border border-border bg-background/80 backdrop-blur-sm">
                              <p className="text-sm text-muted-foreground italic">
                                Content was removed...
                                <button onClick={() => undoIntroDelete(deletedId)} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors not-italic ml-2">
                                  <Undo2 className="w-3 h-3" /> Undo
                                </button>
                              </p>
                              <button onClick={() => dismissIntroDeletedBlock(deletedId)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                <X className="w-3.5 h-3.5" /> Close
                              </button>
                            </div>
                          </div>
                        );
                        deletedIdx++;
                        position++;
                        continue;
                      }
                      if (blockIdx < introBlocks.length) {
                        const block = introBlocks[blockIdx];
                        const index = blockIdx;
                        const isOver = introOverId === block.id && introActiveId !== block.id;
                        const activeBlockIdx = introBlocks.findIndex((b) => b.id === introActiveId);
                        const showAbove = isOver && activeBlockIdx > index;
                        const showBelow = isOver && activeBlockIdx < index;

                        elements.push(
                          <div key={block.id} className="group/item">
                            {index === 0 && !introActiveId && block.type !== "description" && (
                              <div className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                                <AddContentButton onAddText={() => addIntroTextBlock(0)} onAddImage={() => addIntroImageBlock(0)} />
                              </div>
                            )}
                            <div className="relative">
                              <div className={cn("absolute -top-1 left-0 right-0 h-[3px] rounded-full bg-primary transition-all duration-200 z-20", showAbove ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0")}>
                                <div className="absolute -left-1 -top-[3px] w-[9px] h-[9px] rounded-full bg-primary" />
                                <div className="absolute -right-1 -top-[3px] w-[9px] h-[9px] rounded-full bg-primary" />
                              </div>
                              {block.type === "description" ? (
                                <DescriptionBlock id={block.id} content={block.content} onChange={(c) => updateIntroBlockContent(block.id, c)} onClear={() => deleteIntroBlock(block.id)} onDuplicate={() => duplicateIntroBlock(block.id)} />
                              ) : (
                                <ContentBlock id={block.id} type={block.type as "text" | "image"} content={block.content} onChange={(c) => updateIntroBlockContent(block.id, c)} onDelete={() => deleteIntroBlock(block.id)} onDuplicate={() => duplicateIntroBlock(block.id)} autoFocus={!block.content} />
                              )}
                              <div className={cn("absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-primary transition-all duration-200 z-20", showBelow ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0")}>
                                <div className="absolute -left-1 -top-[3px] w-[9px] h-[9px] rounded-full bg-primary" />
                                <div className="absolute -right-1 -top-[3px] w-[9px] h-[9px] rounded-full bg-primary" />
                              </div>
                            </div>
                            {!introActiveId && block.type !== "description" && (
                              <div className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                                <AddContentButton onAddText={() => addIntroTextBlock(index + 1)} onAddImage={() => addIntroImageBlock(index + 1)} />
                              </div>
                            )}
                          </div>
                        );
                        blockIdx++;
                        position++;
                      }
                    }
                    return elements;
                  })()}
                </div>
              </SortableContext>
              <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
                {introActiveId ? (() => {
                  const activeBlock = introBlocks.find((b) => b.id === introActiveId);
                  const displayContent = activeBlock?.type === "description"
                    ? (activeBlock.content || "Course description...")
                    : (activeBlock?.content || "");
                  return (
                    <div className="opacity-80 shadow-2xl rounded-lg border border-primary/30 bg-background/95 backdrop-blur-sm p-4">
                      <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/60" dangerouslySetInnerHTML={{ __html: displayContent }} />
                    </div>
                  );
                })() : null}
              </DragOverlay>
            </DndContext>

            {introBlocks.filter((b) => b.type !== "description").length === 0 && (
              <div className="mt-6">
                <AddContentButton onAddText={() => addIntroTextBlock()} onAddImage={() => addIntroImageBlock()} />
              </div>
            )}
          </div>
        ) : isCurrentSection ? (
          /* ===== SECTION EDITOR ===== */
          <div className="max-w-4xl mx-auto px-6 sm:px-10 py-8 sm:py-12">
            {/* Section title */}
            <input
              type="text"
              value={currentItem?.title || ""}
              onChange={(e) => { if (e.target.value.length <= 255) updateItemTitle(selectedItemId, e.target.value); }}
              className="text-3xl font-bold text-foreground bg-transparent border-none outline-none w-full placeholder:text-muted-foreground/40 mb-6"
              placeholder="Untitled section"
            />

            <div className="border-t border-dashed border-border my-6" />

            {/* Child pages as cards */}
            <div className="space-y-3">
              <span className="text-sm font-medium text-muted-foreground">Pages in this section</span>
              {currentItem?.children && currentItem.children.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {currentItem.children.map((child, idx) => {
                    const childBlocks = pageBlocksMap[child.id] || [];
                    const previewText = childBlocks.find(b => b.type === "text")?.content?.replace(/<[^>]*>/g, '').slice(0, 80) || "";
                    return (
                      <div
                        key={child.id}
                        onClick={() => setSelectedItemId(child.id)}
                        className="group p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-sm cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">{idx + 1}</span>
                          <FileText className="w-3.5 h-3.5 text-muted-foreground/60" />
                        </div>
                        <h4 className="text-sm font-medium text-foreground truncate mb-1">{child.title || "Untitled page"}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{previewText || "No content yet"}</p>
                        <div className="flex items-center gap-1.5 mt-3 text-[10px] text-muted-foreground/50">
                          <Layers className="w-3 h-3" />
                          {childBlocks.length} block{childBlocks.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No pages in this section yet</p>
                </div>
              )}
              <Button variant="outline" size="sm" className="gap-1.5 mt-2" onClick={() => addPageToSection(selectedItemId)}>
                <Plus className="w-3.5 h-3.5" /> Add page
              </Button>
            </div>

            {/* Section content blocks */}
            <div className="border-t border-dashed border-border my-8" />
            <span className="text-sm font-medium text-muted-foreground mb-4 block">Section content</span>

            {renderPageEditor()}
          </div>
        ) : (
          /* ===== PAGE EDITOR ===== */
          <div className="max-w-4xl mx-auto px-6 sm:px-10 py-8 sm:py-12">
            {/* Page title */}
            <input
              type="text"
              value={currentItem?.title || ""}
              onChange={(e) => { if (e.target.value.length <= 350) updateItemTitle(selectedItemId, e.target.value); }}
              className="text-3xl font-bold text-foreground bg-transparent border-none outline-none w-full placeholder:text-muted-foreground/40 mb-2"
              placeholder="Untitled page"
            />

            <div className="border-t border-dashed border-border my-6" />

            {renderPageEditor()}
          </div>
        )}
      </div>

      {/* Bottom page navigator — slide deck style */}
      {allNavIds.length > 1 && (
        <div className="border-t border-border bg-card/80 backdrop-blur-sm">
          <div className="flex items-center h-16 px-4 sm:px-6 gap-2 overflow-x-auto thin-scrollbar">
            {allNavIds.map((navId) => {
              const isActive = navId === selectedItemId;
              let label = "Introduction";
              let icon = BookOpen;
              if (navId !== "introduction") {
                const item = findPageItem(navId);
                if (item) {
                  label = item.title || (item.type === "section" ? "Section" : "Page");
                  icon = item.type === "section" ? LayoutGrid : FileText;
                }
              }
              return (
                <button
                  key={navId}
                  onClick={() => setSelectedItemId(navId)}
                  className={cn(
                    "shrink-0 flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg border transition-all min-w-[72px] max-w-[100px]",
                    isActive
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/60 bg-background hover:bg-muted/50 hover:border-border"
                  )}
                >
                  {React.createElement(icon, { className: cn("w-3.5 h-3.5 shrink-0", isActive ? "text-primary" : "text-muted-foreground/60") })}
                  <span className={cn("text-[10px] truncate w-full text-center", isActive ? "text-primary font-medium" : "text-muted-foreground")}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete item</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (deleteConfirmId) { handleDeleteOutlineItem(deleteConfirmId); setDeleteConfirmId(null); } }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename Dialog */}
      <Dialog open={!!renameTarget} onOpenChange={(open) => { if (!open) setRenameTarget(null); }}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Pencil className="w-4 h-4 text-muted-foreground" /> Rename</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">Enter a new name below.</DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <Label htmlFor="rename-input" className="text-sm font-medium mb-2 block">Title</Label>
            <Input id="rename-input" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && renameTarget && renameValue.trim()) { updateItemTitle(renameTarget.id, renameValue.trim()); setRenameTarget(null); } }} placeholder="Enter title…" autoFocus maxLength={350} className="w-full" />
            <span className="text-xs text-muted-foreground mt-1.5 block text-right">{renameValue.length}/350</span>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>Cancel</Button>
            <Button onClick={() => { if (renameTarget && renameValue.trim()) { updateItemTitle(renameTarget.id, renameValue.trim()); setRenameTarget(null); } }} disabled={!renameValue.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Quiz Dialog */}
      <GenerateQuizDialog open={showQuizGenerateDialog} onClose={() => setShowQuizGenerateDialog(false)} onGenerate={handleQuizGenerate} isGenerating={isQuizGenerating} />

      {/* Section Image Dialog */}
      {showSectionImageDialog && (
        <SectionImageDialog
          open={true}
          onClose={() => setShowSectionImageDialog(null)}
          currentImage={sectionImages[showSectionImageDialog] || null}
          onImageChange={(url) => {
            setSectionImages((prev) => ({ ...prev, [showSectionImageDialog!]: url }));
            setShowSectionImageDialog(null);
          }}
        />
      )}

      {/* Guided Tour */}
      <GuidedTour steps={tourSteps} isOpen={showTour} onClose={() => { setShowTour(false); setTourStep(-1); }} onStepChange={setTourStep} />
    </div>
  );

  // Reusable page/section content editor
  function renderPageEditor() {
    return (
      <div className="min-h-[200px]">
        {(pageBlocks.length > 0 || deletedPageBlocks.size > 0) ? (
          <TooltipProvider delayDuration={300}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handlePageDragEnd}>
              <SortableContext items={pageBlocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-1">
                  {(() => {
                    const elements: React.ReactNode[] = [];
                    const deletedArr = Array.from(deletedPageBlocks.entries()).sort((a, b) => a[1].index - b[1].index);
                    let blockIdx = 0;
                    let deletedIdx = 0;
                    let position = 0;

                    while (blockIdx < pageBlocks.length || deletedIdx < deletedArr.length) {
                      if (deletedIdx < deletedArr.length && deletedArr[deletedIdx][1].index <= position) {
                        const [deletedId] = deletedArr[deletedIdx];
                        elements.push(
                          <div key={`deleted-${deletedId}`} className="animate-fade-in">
                            <div className="flex items-center justify-between px-5 py-3.5 rounded-lg border border-border bg-background/80 backdrop-blur-sm">
                              <p className="text-sm text-muted-foreground italic">
                                Content was removed...
                                <button onClick={() => undoDeletePageBlock(deletedId)} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors not-italic ml-2">
                                  <Undo2 className="w-3 h-3" /> Undo
                                </button>
                              </p>
                              <button onClick={() => dismissDeletedPageBlock(deletedId)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                <X className="w-3.5 h-3.5" /> Close
                              </button>
                            </div>
                          </div>
                        );
                        deletedIdx++;
                      } else if (blockIdx < pageBlocks.length) {
                        const block = pageBlocks[blockIdx];
                        const currentBlockIdx = blockIdx;

                        if (block.id === aiReviewBlockId) {
                          elements.push(
                            <div key={`ai-frame-${block.id}`} className="animate-fade-in rounded-xl border border-primary/20 bg-primary/[0.02] shadow-sm overflow-hidden">
                              <div className="px-2 py-2">
                                <ContentBlock id={block.id} type={block.type} content={block.content} onChange={(c) => updatePageBlock(block.id, c)} onDelete={() => deletePageBlock(block.id)} onDuplicate={() => duplicatePageBlock(block.id)} autoFocus={false} aiEnabled={aiEnabled} readOnly />
                              </div>
                              <div className="border-t border-primary/10 bg-muted/20">
                                {aiGenerating ? (
                                  <div className="flex items-center gap-3 px-4 py-3">
                                    <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                                    <span className="text-xs font-medium text-muted-foreground">Generating…</span>
                                  </div>
                                ) : aiReviewMode === "review" ? (
                                  <div className="flex items-center gap-3 px-4 py-2.5">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                                      <span>AI Generated</span>
                                    </div>
                                    <div className="h-4 w-px bg-border/60" />
                                    <div className="flex items-center gap-1.5 ml-auto">
                                      <Button size="sm" onClick={handleAiReviewAdd} className="h-7 gap-1.5 rounded-lg px-3 text-xs font-medium">
                                        <Check className="w-3.5 h-3.5" /> Accept
                                      </Button>
                                      <Button variant="outline" size="sm" onClick={() => { setAiReviewMode("modify"); setTimeout(() => modifyInputRef.current?.focus(), 100); }} className="h-7 gap-1.5 rounded-lg px-3 text-xs font-medium">
                                        <Pencil className="w-3 h-3" /> Modify
                                      </Button>
                                      <Button variant="ghost" size="sm" onClick={handleAiReviewCancel} className="h-7 rounded-lg px-2.5 text-xs font-medium text-muted-foreground hover:text-destructive">
                                        <X className="w-3.5 h-3.5" /> Discard
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-0">
                                    <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/40">
                                      <button onClick={() => setAiReviewMode("review")} className="p-1 rounded-md hover:bg-background/80 transition-colors text-muted-foreground hover:text-foreground">
                                        <ArrowLeft className="w-3.5 h-3.5" />
                                      </button>
                                      <span className="text-xs font-medium text-foreground">What do you want to modify?</span>
                                    </div>
                                    <div className="flex items-end gap-2 p-2">
                                      <div className="flex-1 rounded-lg bg-background border border-border/40 overflow-hidden focus-within:border-foreground/20 transition-colors">
                                        <textarea ref={modifyInputRef} value={modifyPrompt} onChange={(e) => { setModifyPrompt(e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAiModifySubmit(); } }} placeholder="e.g., Make it more concise..." className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 resize-none px-3 py-2.5 focus:outline-none" rows={1} />
                                      </div>
                                      <Button size="icon" onClick={handleAiModifySubmit} disabled={!modifyPrompt.trim() || aiGenerating} className="h-9 w-9 rounded-lg shrink-0">
                                        <Send className="w-3.5 h-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        } else {
                          elements.push(
                            <ContentBlock key={block.id} id={block.id} type={block.type} content={block.content} onChange={(c) => updatePageBlock(block.id, c)} onDelete={() => deletePageBlock(block.id)} onDuplicate={() => duplicatePageBlock(block.id)} autoFocus={block.id === lastAddedBlockId} aiEnabled={aiEnabled} />
                          );
                        }
                        if (blockIdx < pageBlocks.length - 1) {
                          elements.push(
                            <AddContentButton
                              key={`add-${block.id}`}
                              variant="full"
                              aiEnabled={aiEnabled}
                              onAddText={() => addPageBlock("text", currentBlockIdx + 1)}
                              onAddImage={() => addPageBlock("image", currentBlockIdx + 1)}
                              onAddVideo={() => addPageBlock("video", currentBlockIdx + 1)}
                              onAddAudio={() => addPageBlock("audio", currentBlockIdx + 1)}
                              onAddDoc={() => addPageBlock("doc", currentBlockIdx + 1)}
                              onAddQuiz={() => addPageBlock("quiz", currentBlockIdx + 1)}
                              onMore={() => {}}
                            />
                          );
                        }
                        blockIdx++;
                        position++;
                      } else {
                        break;
                      }
                    }

                    while (deletedIdx < deletedArr.length) {
                      const [deletedId] = deletedArr[deletedIdx];
                      elements.push(
                        <div key={`deleted-${deletedId}`} className="animate-fade-in">
                          <div className="flex items-center justify-between px-5 py-3.5 rounded-lg border border-border bg-background/80 backdrop-blur-sm">
                            <p className="text-sm text-muted-foreground italic">
                              Content was removed...
                              <button onClick={() => undoDeletePageBlock(deletedId)} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors not-italic ml-2">
                                <Undo2 className="w-3 h-3" /> Undo
                              </button>
                            </p>
                            <button onClick={() => dismissDeletedPageBlock(deletedId)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                              <X className="w-3.5 h-3.5" /> Close
                            </button>
                          </div>
                        </div>
                      );
                      deletedIdx++;
                    }

                    return elements;
                  })()}
                </div>
              </SortableContext>
            </DndContext>
          </TooltipProvider>
        ) : null}

        {/* Content type toolbar */}
        <div className={cn("flex items-center gap-2", pageBlocks.length > 0 && "mt-6")}>
          <div className="rounded-2xl border border-border/60 bg-muted/20 backdrop-blur-sm px-2 sm:px-4 py-2 sm:py-2.5 flex flex-wrap items-center flex-1 justify-evenly gap-0.5 shadow-sm">
            {aiEnabled && (
              <button
                onClick={() => { setShowAiBlock(!showAiBlock); if (!showAiBlock) setTimeout(() => aiPromptRef.current?.focus(), 150); }}
                className={cn(
                  "relative gap-1.5 sm:gap-2 text-xs sm:text-[13px] h-8 sm:h-9 rounded-full px-3 sm:px-4 flex items-center font-medium text-foreground/90 hover:bg-primary/5 transition-colors duration-200",
                  showAiBlock && "bg-primary/5"
                )}
              >
                <span className="absolute inset-0 rounded-full p-[1.5px]" style={{ background: 'linear-gradient(135deg, hsl(217, 91%, 70%), hsl(280, 65%, 65%), hsl(217, 91%, 55%))' }}>
                  <span className="block w-full h-full rounded-full bg-background" />
                </span>
                <Sparkles className="w-3.5 sm:w-4 h-3.5 sm:h-4 relative" />
                <span className="relative hidden sm:inline">Create with AI</span>
                <span className="relative sm:hidden">AI</span>
              </button>
            )}
            <Button variant="ghost" className="gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-[13px] h-8 sm:h-9 rounded-full hover:text-foreground hover:bg-foreground/5 px-2.5 sm:px-4" onClick={() => addPageBlock("text")}>
              <Type className="w-3.5 sm:w-4 h-3.5 sm:h-4" /><span className="hidden sm:inline">Text</span>
            </Button>
            <Button variant="ghost" className="gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-[13px] h-8 sm:h-9 rounded-full hover:text-foreground hover:bg-foreground/5 px-2.5 sm:px-4" onClick={() => addPageBlock("image")}>
              <ImageIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" /><span className="hidden sm:inline">Image</span>
            </Button>
            <Button variant="ghost" className="gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-[13px] h-8 sm:h-9 rounded-full hover:text-foreground hover:bg-foreground/5 px-2.5 sm:px-4" onClick={() => addPageBlock("video")}>
              <Video className="w-3.5 sm:w-4 h-3.5 sm:h-4" /><span className="hidden sm:inline">Video</span>
            </Button>
            <Button variant="ghost" className="gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-[13px] h-8 sm:h-9 rounded-full hover:text-foreground hover:bg-foreground/5 px-2.5 sm:px-4" onClick={() => addPageBlock("doc")}>
              <DocIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" /><span className="hidden sm:inline">Doc</span>
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-2xl border border-dashed border-border/60 bg-muted/10 backdrop-blur-sm self-stretch px-3 sm:px-4 shadow-sm shrink-0 flex items-center gap-1.5 text-muted-foreground text-xs sm:text-[13px] hover:text-foreground hover:border-primary/30 hover:bg-muted/30 transition-all duration-200 cursor-pointer">
                <MoreHorizontal className="w-3.5 sm:w-4 h-3.5 sm:h-4" /><span className="hidden sm:inline">More</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-1.5">
              <DropdownMenuItem className="gap-2 text-sm" onClick={() => addPageBlock("audio")}>
                <Mic className="w-4 h-4" /> Audio
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-sm" onClick={() => addPageBlock("image-description")}>
                <ImageIcon className="w-4 h-4" /> Image + Description
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-sm" onClick={() => setShowQuizGenerateDialog(true)}>
                <MessageCircleQuestion className="w-4 h-4" /> Quiz
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* AI Creation Block */}
        {showAiBlock && aiEnabled && (
          <div className="mt-4 rounded-xl border border-border bg-card shadow-sm animate-fade-in">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Create with AI</span>
              </div>
              <button onClick={() => setShowAiBlock(false)} className="p-1.5 rounded-md hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="px-5 py-3.5">
              {aiGenerating ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4 animate-fade-in rounded-xl bg-gradient-to-br from-[hsl(217,91%,60%)]/5 via-[hsl(270,70%,60%)]/5 to-[hsl(217,91%,60%)]/5">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 animate-sparkle-spin" fill="url(#sparkle-grad-inline)" color="url(#sparkle-grad-inline)" />
                    <Sparkles className="w-4 h-4 absolute -top-1 -left-1 animate-sparkle-float" fill="hsl(270,70%,60%)" color="hsl(270,70%,60%)" />
                    <Sparkles className="w-3.5 h-3.5 absolute -bottom-0.5 -right-1 animate-sparkle-orbit" fill="hsl(217,91%,60%)" color="hsl(217,91%,60%)" />
                    <svg width="0" height="0" className="absolute"><defs><linearGradient id="sparkle-grad-inline" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="hsl(217,91%,60%)" /><stop offset="100%" stopColor="hsl(270,70%,60%)" /></linearGradient></defs></svg>
                  </div>
                  <p className="text-sm font-semibold bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(270,70%,60%)] bg-clip-text text-transparent animate-pulse">Finding the best way to present it...</p>
                  <p className="text-xs text-[hsl(270,70%,60%)]/60">This may take a few minutes</p>
                </div>
              ) : (
                <div className="flex items-end gap-2 rounded-2xl border border-border/80 bg-background px-4 py-2 focus-within:border-foreground/30 transition-colors">
                  <textarea
                    ref={aiPromptRef}
                    value={aiPrompt}
                    onChange={(e) => { setAiPrompt(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px'; }}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && aiPrompt.trim()) { e.preventDefault(); handleAiGenerate(aiPrompt, aiBlockType); setAiPrompt(""); e.currentTarget.style.height = 'auto'; } }}
                    placeholder="Example: Create a comparison table for collaboration vs individual work"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none resize-none min-h-[28px] max-h-[150px] py-1"
                    rows={1}
                  />
                  <button onClick={() => { if (aiPrompt.trim()) { handleAiGenerate(aiPrompt, aiBlockType); setAiPrompt(""); if (aiPromptRef.current) aiPromptRef.current.style.height = 'auto'; } }} disabled={!aiPrompt.trim()} className={cn("w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center transition-colors mb-0.5", aiPrompt.trim() ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground")}>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            {!aiGenerating && (
              <div className="px-5 pb-4">
                <span className="text-xs text-muted-foreground block mb-2">Select content block</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setAiBlockType(aiBlockType === "text" ? null : "text")} className={cn("flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all", aiBlockType === "text" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground")}>
                    <Type className="w-4 h-4" /> Text
                  </button>
                  <button onClick={() => setAiBlockType(aiBlockType === "image" ? null : "image")} className={cn("flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all", aiBlockType === "image" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground")}>
                    <ImageIcon className="w-4 h-4" /> Image
                  </button>
                  <button onClick={() => setShowQuizGenerateDialog(true)} className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm font-medium text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-all">
                    <MessageCircleQuestion className="w-4 h-4" /> Quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}
