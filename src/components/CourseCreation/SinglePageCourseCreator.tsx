import { useState, useCallback, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Play, Share2, Plus, X, Undo2,
  FileStack, Layers, HelpCircle, Sparkles, Type, ImageIcon, Video, FileText as DocIcon,
  LayoutGrid, FileText, MoreHorizontal, MessageCircleQuestion, GripVertical, Pencil, Copy, Trash2,
  Check, Send, Loader2, ArrowLeft as ArrowLeftIcon,
} from "lucide-react";
import { GuidedTour, type TourStep } from "@/components/GuidedTour/GuidedTour";
import type { AIOptions } from "@/components/Dashboard/AIOptionsPanel";
import { AIHeaderButton } from "./AIHeaderButton";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ContentBlock } from "./ContentBlock";
import { DescriptionBlock } from "./DescriptionBlock";
import { AddContentButton } from "./AddContentButton";
import { ContentBlocksPanel, resolveTemplateDropData } from "./ContentBlocksPanel";
import { GenerateQuizDialog, type GenerateQuizConfig } from "./GenerateQuizDialog";
import { SectionImageDialog } from "./SectionImageDialog";
import { LayoutSelectorDropdown } from "./LayoutSelectorDropdown";

interface SinglePageCourseCreatorProps {
  courseTitle: string;
  aiOptions?: AIOptions | null;
}

interface CourseItem {
  id: string;
  type: "section" | "page";
  title: string;
  children?: CourseItem[];
}

interface PageContentBlock {
  id: string;
  type: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description" | "video-description";
  content: string;
}

interface ContentBlockData {
  id: string;
  type: "text" | "image" | "description" | "video" | "audio" | "doc" | "quiz" | "image-description" | "video-description";
  content: string;
}

interface DeletedBlock {
  block: ContentBlockData;
  index: number;
}

function SortableOutlineWrapper({ id, children }: { id: string; children: (listeners: Record<string, unknown>) => React.ReactNode }) {
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

export function SinglePageCourseCreator({ courseTitle, aiOptions: initialAIOptions = null }: SinglePageCourseCreatorProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState(courseTitle);
  const [showTour, setShowTour] = useState(true);
  const [tourStep, setTourStep] = useState(0);
  const [aiOptions, setAIOptions] = useState<AIOptions | null>(initialAIOptions);

  // Course outline items
  const [items, setItems] = useState<CourseItem[]>([]);
  // Page-level content blocks map
  const [pageBlocksMap, setPageBlocksMap] = useState<Record<string, PageContentBlock[]>>({});
  // Section images map
  const [sectionImages, setSectionImages] = useState<Record<string, string | null>>({});
  const [showSectionImageDialog, setShowSectionImageDialog] = useState<string | null>(null);
  // Last added block tracking
  const [lastAddedBlockId, setLastAddedBlockId] = useState<string | null>(null);

  // Introduction content blocks (top-level)
  const [contentBlocks, setContentBlocks] = useState<ContentBlockData[]>([
    { id: "description-block", type: "description", content: "" },
  ]);
  const [deletedBlocks, setDeletedBlocks] = useState<Map<string, DeletedBlock>>(new Map());
  const deleteTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"outline" | "blocks">("outline");
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  // Dialogs
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<{ id: string; title: string } | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // AI state
  const [showAiBlock, setShowAiBlock] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiBlockType, setAiBlockType] = useState<"text" | "image" | "quiz" | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiReviewBlockId, setAiReviewBlockId] = useState<string | null>(null);
  const [aiReviewMode, setAiReviewMode] = useState<"review" | "modify">("review");
  const [modifyPrompt, setModifyPrompt] = useState("");
  const modifyInputRef = useRef<HTMLTextAreaElement>(null);
  const aiPromptRef = useRef<HTMLTextAreaElement>(null);
  const [showQuizGenerateDialog, setShowQuizGenerateDialog] = useState(false);
  const [isQuizGenerating, setIsQuizGenerating] = useState(false);

  // Currently active section/page for adding blocks
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  // Per-item deleted blocks
  const [itemDeletedBlocks, setItemDeletedBlocks] = useState<Record<string, Map<string, { block: PageContentBlock; index: number }>>>({});

  const aiEnabled = !!aiOptions?.enabled;

  const tourSteps: TourStep[] = [
    { target: "course-heading", icon: <Type className="w-5 h-5 text-muted-foreground" />, title: "Course Title", description: "Click to edit your course title.", placement: "bottom" },
    { target: "content-blocks", icon: <ImageIcon className="w-5 h-5 text-muted-foreground" />, title: "Content Area", description: "Add text, images, and other content blocks to build your course.", placement: "bottom" },
    { target: "header-actions", icon: <Sparkles className="w-5 h-5 text-muted-foreground" />, title: "AI Support, Preview & Publish", description: "AI Support improves your course, Preview shows it, Publish shares it.", placement: "bottom" },
  ];

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const outlineSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // --- Intro content block handlers ---
  const addIntroBlock = useCallback((type: ContentBlockData["type"], insertAt?: number, variant?: string) => {
    const id = `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    let content = "";
    if (type === "text") {
      content = variant === "heading-text"
        ? "<h2>Heading</h2><p>Employee-generated Learning empowers experts to create learning content.</p>"
        : variant === "text-only"
        ? "<p>Employee-generated Learning empowers experts to create learning content using their own knowledge.</p>"
        : `<h2 style="font-size: 1.75rem; font-weight: 600;">Your heading text goes here</h2><br/><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>`;
    } else if (type === "image-description") {
      content = JSON.stringify({ layout: variant === "image-bottom" ? "image-bottom" : "image-top", imageUrl: "", description: "<p>Add a description here...</p>" });
    } else if (type === "quiz") {
      content = "[]";
    }
    const newBlock: ContentBlockData = { id, type, content };
    setContentBlocks((prev) => {
      if (insertAt !== undefined) { const next = [...prev]; next.splice(insertAt, 0, newBlock); return next; }
      return [...prev, newBlock];
    });
    setLastAddedBlockId(id);
  }, []);

  const updateIntroBlockContent = (id: string, content: string) => {
    setContentBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content } : b)));
  };

  const deleteIntroBlock = (id: string) => {
    if (id === "description-block") {
      setContentBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content: "" } : b)));
      return;
    }
    const idx = contentBlocks.findIndex((b) => b.id === id);
    if (idx === -1) return;
    const block = contentBlocks[idx];
    setDeletedBlocks((prev) => { const next = new Map(prev); next.set(id, { block, index: idx }); return next; });
    setContentBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const undoIntroDelete = (id: string) => {
    const deleted = deletedBlocks.get(id);
    if (!deleted) return;
    const timer = deleteTimers.current.get(id);
    if (timer) clearTimeout(timer);
    deleteTimers.current.delete(id);
    setContentBlocks((prev) => { const next = [...prev]; next.splice(Math.min(deleted.index, next.length), 0, deleted.block); return next; });
    setDeletedBlocks((prev) => { const next = new Map(prev); next.delete(id); return next; });
  };

  const dismissIntroDeletedBlock = (id: string) => {
    const timer = deleteTimers.current.get(id);
    if (timer) clearTimeout(timer);
    deleteTimers.current.delete(id);
    setDeletedBlocks((prev) => { const next = new Map(prev); next.delete(id); return next; });
  };

  const duplicateIntroBlock = (id: string) => {
    setContentBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const clone = { ...prev[idx], id: `block-${Date.now()}` };
      const next = [...prev]; next.splice(idx + 1, 0, clone);
      toast({ title: "Block duplicated", description: "Content block has been duplicated successfully." });
      return next;
    });
  };

  const handleIntroDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setContentBlocks((prev) => {
        const oldIndex = prev.findIndex((b) => b.id === active.id);
        const newIndex = prev.findIndex((b) => b.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);

  // --- Outline item handlers ---
  const handleAddItem = (type: "section" | "page") => {
    const newItem: CourseItem = {
      id: `${type}-${Date.now()}`,
      type,
      title: type === "section" ? "Untitled section" : "",
    };
    setItems([...items, newItem]);
    setPageBlocksMap((prev) => ({ ...prev, [newItem.id]: [] }));
  };

  const updateItemTitle = (id: string, newTitle: string) => {
    setItems((prev) => prev.map((item) => {
      if (item.id === id) return { ...item, title: newTitle };
      if (item.children) {
        const updatedChildren = item.children.map((c) => c.id === id ? { ...c, title: newTitle } : c);
        return { ...item, children: updatedChildren };
      }
      return item;
    }));
  };

  const deleteItem = (id: string) => {
    setItems((prev) => {
      if (prev.some((item) => item.id === id)) return prev.filter((item) => item.id !== id);
      return prev.map((item) => {
        if (!item.children) return item;
        const filtered = item.children.filter((c) => c.id !== id);
        if (filtered.length !== item.children.length) return { ...item, children: filtered };
        return item;
      });
    });
  };

  const duplicateItem = (id: string) => {
    setItems((prev) => {
      const idx = prev.findIndex((item) => item.id === id);
      if (idx !== -1) {
        const original = prev[idx];
        const cloneId = `${original.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const clonedChildren = original.children?.map((child) => {
          const childCloneId = `${child.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          if (pageBlocksMap[child.id]) {
            setPageBlocksMap((pm) => ({ ...pm, [childCloneId]: pageBlocksMap[child.id].map((b) => ({ ...b, id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` })) }));
          }
          return { ...child, id: childCloneId };
        });
        if (pageBlocksMap[id]) {
          setPageBlocksMap((pm) => ({ ...pm, [cloneId]: pageBlocksMap[id].map((b) => ({ ...b, id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` })) }));
        }
        const clone = { ...original, id: cloneId, children: clonedChildren };
        const next = [...prev]; next.splice(idx + 1, 0, clone);
        toast({ title: `${original.type.charAt(0).toUpperCase() + original.type.slice(1)} duplicated`, description: `"${original.title || `Untitled ${original.type}`}" has been duplicated.` });
        return next;
      }
      // Inside section children
      return prev.map((item) => {
        if (!item.children) return item;
        const childIdx = item.children.findIndex((c) => c.id === id);
        if (childIdx === -1) return item;
        const original = item.children[childIdx];
        const cloneId = `${original.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        if (pageBlocksMap[id]) {
          setPageBlocksMap((pm) => ({ ...pm, [cloneId]: pageBlocksMap[id].map((b) => ({ ...b, id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` })) }));
        }
        const newChildren = [...item.children]; newChildren.splice(childIdx + 1, 0, { ...original, id: cloneId });
        toast({ title: "Page duplicated", description: `"${original.title || "Untitled page"}" has been duplicated.` });
        return { ...item, children: newChildren };
      });
    });
  };

  const addPageToSection = (sectionId: string) => {
    const newPage: CourseItem = { id: `page-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, type: "page", title: "" };
    setItems((prev) => prev.map((item) => {
      if (item.id === sectionId && item.type === "section") return { ...item, children: [...(item.children || []), newPage] };
      return item;
    }));
    setPageBlocksMap((prev) => ({ ...prev, [newPage.id]: [] }));
  };

  const handleOutlineDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id);
        const newIndex = prev.findIndex((i) => i.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);

  // --- Page content block handlers ---
  const getVariantContent = (type: string, variant?: string): string => {
    if (type === "quiz") return "[]";
    if (type === "image") return "";
    if (type === "image-description") {
      return JSON.stringify({ layout: variant === "image-bottom" ? "image-bottom" : "image-top", imageUrl: "", description: "<p>Add a description here...</p>" });
    }
    if (type === "video-description") {
      return JSON.stringify({ layout: variant === "video-right" ? "video-right" : "video-left", videoUrl: "", description: "" });
    }
    if (type !== "text") return "";
    switch (variant) {
      case "heading-text": return "<h2>Heading</h2><p>Employee-generated Learning empowers experts to create learning content.</p>";
      case "text-only": return "<p>Employee-generated Learning empowers experts to create learning content using their own knowledge.</p>";
      case "two-columns": return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem"><div><h3>Heading</h3><p>Content here.</p></div><div><h3>Heading</h3><p>Content here.</p></div></div>';
      default: return "<p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>";
    }
  };

  const addBlockToItem = useCallback((itemId: string, type: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description" | "video-description", atIndex?: number, variant?: string) => {
    const id = `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const defaultContent = getVariantContent(type, variant);
    setPageBlocksMap((prev) => {
      const blocks = prev[itemId] || [];
      if (atIndex !== undefined) {
        const next = [...blocks]; next.splice(atIndex, 0, { id, type, content: defaultContent }); return { ...prev, [itemId]: next };
      }
      return { ...prev, [itemId]: [...blocks, { id, type, content: defaultContent }] };
    });
    setLastAddedBlockId(id);
  }, []);

  const updateItemBlock = useCallback((itemId: string, blockId: string, content: string) => {
    setPageBlocksMap((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || []).map((b) => (b.id === blockId ? { ...b, content } : b)),
    }));
  }, []);

  const deleteItemBlock = useCallback((itemId: string, blockId: string) => {
    setPageBlocksMap((prev) => {
      const blocks = prev[itemId] || [];
      const idx = blocks.findIndex((b) => b.id === blockId);
      if (idx === -1) return prev;
      const block = blocks[idx];
      setItemDeletedBlocks((dm) => {
        const map = dm[itemId] ? new Map(dm[itemId]) : new Map();
        map.set(blockId, { block, index: idx });
        return { ...dm, [itemId]: map };
      });
      return { ...prev, [itemId]: blocks.filter((b) => b.id !== blockId) };
    });
  }, []);

  const undoItemBlockDelete = useCallback((itemId: string, blockId: string) => {
    setItemDeletedBlocks((dm) => {
      const map = dm[itemId];
      if (!map) return dm;
      const entry = map.get(blockId);
      if (!entry) return dm;
      setPageBlocksMap((prev) => {
        const blocks = [...(prev[itemId] || [])];
        blocks.splice(Math.min(entry.index, blocks.length), 0, entry.block);
        return { ...prev, [itemId]: blocks };
      });
      const newMap = new Map(map);
      newMap.delete(blockId);
      return { ...dm, [itemId]: newMap };
    });
  }, []);

  const dismissItemDeletedBlock = useCallback((itemId: string, blockId: string) => {
    setItemDeletedBlocks((dm) => {
      const map = dm[itemId];
      if (!map) return dm;
      const newMap = new Map(map);
      newMap.delete(blockId);
      return { ...dm, [itemId]: newMap };
    });
  }, []);

  const duplicateItemBlock = useCallback((itemId: string, blockId: string) => {
    setPageBlocksMap((prev) => {
      const blocks = prev[itemId] || [];
      const idx = blocks.findIndex((b) => b.id === blockId);
      if (idx === -1) return prev;
      const newId = `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const copy = { ...blocks[idx], id: newId };
      const next = [...blocks]; next.splice(idx + 1, 0, copy);
      return { ...prev, [itemId]: next };
    });
  }, []);

  const handleItemBlockDragEnd = useCallback((itemId: string, event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPageBlocksMap((prev) => {
        const blocks = prev[itemId] || [];
        const oldIndex = blocks.findIndex((b) => b.id === active.id);
        const newIndex = blocks.findIndex((b) => b.id === over.id);
        return { ...prev, [itemId]: arrayMove(blocks, oldIndex, newIndex) };
      });
    }
  }, []);

  // AI handlers
  const handleAiGenerate = useCallback((prompt: string, blockType: "text" | "image" | "quiz" | null, itemId: string) => {
    setAiGenerating(true);
    const type = blockType || "text";
    setTimeout(() => {
      const id = `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const content = type === "text"
        ? `<h3>${prompt}</h3><p>AI-generated content based on your prompt. This section covers key concepts and practical applications.</p>`
        : "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=400&fit=crop";
      setPageBlocksMap((prev) => ({ ...prev, [itemId]: [...(prev[itemId] || []), { id, type, content }] }));
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
    if (aiReviewBlockId && activeItemId) {
      setPageBlocksMap((prev) => ({ ...prev, [activeItemId]: (prev[activeItemId] || []).filter((b) => b.id !== aiReviewBlockId) }));
    }
    setAiReviewBlockId(null); setAiReviewMode("review"); setModifyPrompt("");
  }, [aiReviewBlockId, activeItemId]);

  const handleQuizGenerate = useCallback((config: GenerateQuizConfig) => {
    if (!activeItemId) return;
    setIsQuizGenerating(true);
    setTimeout(() => {
      const id = `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const questions: any[] = [];
      let idCounter = 1;
      for (let i = 0; i < config.scqCount; i++) questions.push({ id: idCounter++, type: "SCQ", question: `Sample question ${i + 1}?`, options: ["A", "B", "C", "D"], answer: "A", explanation: "Explanation." });
      for (let i = 0; i < config.mcqCount; i++) questions.push({ id: idCounter++, type: "MCQ", question: `Sample MCQ ${i + 1}?`, options: ["A", "B", "C", "D"], answer: "A, B", explanation: "Explanation." });
      for (let i = 0; i < config.trueFalseCount; i++) questions.push({ id: idCounter++, type: "TrueFalse", question: `True/false ${i + 1}.`, options: ["True", "False"], answer: "True", explanation: "Explanation." });
      for (let i = 0; i < config.fibCount; i++) questions.push({ id: idCounter++, type: "FIB", question: `Fill in _____ ${i + 1}.`, options: [], answer: "answer", explanation: "Explanation." });
      setPageBlocksMap((prev) => ({ ...prev, [activeItemId]: [...(prev[activeItemId] || []), { id, type: "quiz", content: JSON.stringify(questions) }] }));
      setLastAddedBlockId(id);
      setIsQuizGenerating(false);
      setShowQuizGenerateDialog(false);
    }, 1500);
  }, [activeItemId]);

  // Drop handler for blocks dragged from ContentBlocksPanel
  const [isDragOver, setIsDragOver] = useState<string | null>(null);

  const handleContentDrop = useCallback((e: React.DragEvent, targetItemId: string) => {
    e.preventDefault();
    setIsDragOver(null);
    const data = e.dataTransfer.getData("application/content-block");
    if (!data) return;
    try {
      const { templateId, categoryId } = JSON.parse(data);
      const resolved = resolveTemplateDropData(templateId, categoryId);
      if (!resolved) {
        // quiz-generate needs dialog
        setActiveItemId(targetItemId);
        setShowQuizGenerateDialog(true);
        return;
      }
      if (targetItemId === "intro") {
        addIntroBlock(resolved.type as ContentBlockData["type"], undefined, resolved.variant);
      } else {
        addBlockToItem(targetItemId, resolved.type, undefined, resolved.variant);
      }
    } catch {}
  }, [addIntroBlock, addBlockToItem]);

  const handleDragOver = useCallback((e: React.DragEvent, targetId: string) => {
    if (Array.from(e.dataTransfer.types).indexOf("application/content-block") >= 0) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "copy";
      setIsDragOver(targetId);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const { clientX, clientY } = e;
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
      setIsDragOver(null);
    }
  }, []);

  const handleBack = () => navigate("/dashboard");

  // Scroll to section/page
  const scrollToItem = (id: string) => {
    const el = document.getElementById(`item-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Flatten all items for rendering
  const getAllFlatItems = (): { item: CourseItem; sectionIndex?: number; parentId?: string }[] => {
    const result: { item: CourseItem; sectionIndex?: number; parentId?: string }[] = [];
    let sIdx = 0;
    for (const item of items) {
      if (item.type === "section") {
        sIdx++;
        result.push({ item, sectionIndex: sIdx });
        if (item.children) {
          for (const child of item.children) {
            result.push({ item: child, parentId: item.id });
          }
        }
      } else {
        result.push({ item });
      }
    }
    return result;
  };

  // Render content blocks for an item
  const renderItemBlocks = (itemId: string) => {
    const blocks = pageBlocksMap[itemId] || [];
    const deleted = itemDeletedBlocks[itemId] || new Map();

    return (
      <div
        onDragOver={(e) => handleDragOver(e, itemId)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleContentDrop(e, itemId)}
        className={cn("rounded-xl transition-all duration-200", isDragOver === itemId && "ring-2 ring-primary/40 ring-dashed bg-primary/5")}
      >
      <TooltipProvider delayDuration={300}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleItemBlockDragEnd(itemId, e)}>
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1">
              {(() => {
                const elements: React.ReactNode[] = [];
                const deletedArr = Array.from(deleted.entries()).sort((a, b) => a[1].index - b[1].index);
                let blockIdx = 0;
                let deletedIdx = 0;
                let position = 0;

                while (blockIdx < blocks.length || deletedIdx < deletedArr.length) {
                  if (deletedIdx < deletedArr.length && deletedArr[deletedIdx][1].index <= position) {
                    const [deletedId] = deletedArr[deletedIdx];
                    elements.push(
                      <div key={`deleted-${deletedId}`} className="animate-fade-in">
                        <div className="flex items-center justify-between px-5 py-3.5 rounded-lg border border-border bg-background/80 backdrop-blur-sm">
                          <p className="text-sm text-muted-foreground italic">
                            Content was removed...{" "}
                            <button onClick={() => undoItemBlockDelete(itemId, deletedId)} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors not-italic ml-2">
                              <Undo2 className="w-3 h-3" /> Undo
                            </button>
                          </p>
                          <button onClick={() => dismissItemDeletedBlock(itemId, deletedId)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <X className="w-3.5 h-3.5" /> Close
                          </button>
                        </div>
                      </div>
                    );
                    deletedIdx++;
                  } else if (blockIdx < blocks.length) {
                    const block = blocks[blockIdx];
                    const currentBlockIdx = blockIdx;
                    elements.push(
                      <ContentBlock
                        key={block.id}
                        id={block.id}
                        type={block.type}
                        content={block.content}
                        onChange={(content) => updateItemBlock(itemId, block.id, content)}
                        onDelete={() => deleteItemBlock(itemId, block.id)}
                        onDuplicate={() => duplicateItemBlock(itemId, block.id)}
                        autoFocus={block.id === lastAddedBlockId}
                        aiEnabled={aiEnabled}
                      />
                    );
                    if (blockIdx < blocks.length - 1) {
                      elements.push(
                        <AddContentButton
                          key={`add-${block.id}`}
                          variant="full"
                          aiEnabled={aiEnabled}
                          onAddText={() => addBlockToItem(itemId, "text", currentBlockIdx + 1)}
                          onAddImage={() => addBlockToItem(itemId, "image", currentBlockIdx + 1)}
                          onAddVideo={() => addBlockToItem(itemId, "video", currentBlockIdx + 1)}
                          onAddAudio={() => addBlockToItem(itemId, "audio", currentBlockIdx + 1)}
                          onAddDoc={() => addBlockToItem(itemId, "doc", currentBlockIdx + 1)}
                          onAddQuiz={() => addBlockToItem(itemId, "quiz", currentBlockIdx + 1)}
                          onMore={() => { setSidebarCollapsed(false); setActiveTab("blocks"); setActiveItemId(itemId); }}
                          onDropBlock={(type, variant) => addBlockToItem(itemId, type as any, currentBlockIdx + 1, variant)}
                          onOpenQuizGenerator={() => { setActiveItemId(itemId); setShowQuizGenerateDialog(true); }}
                        />
                      );
                    }
                    blockIdx++;
                    position++;
                  } else { break; }
                }

                while (deletedIdx < deletedArr.length) {
                  const [deletedId] = deletedArr[deletedIdx];
                  elements.push(
                    <div key={`deleted-${deletedId}`} className="animate-fade-in">
                      <div className="flex items-center justify-between px-5 py-3.5 rounded-lg border border-border bg-background/80 backdrop-blur-sm">
                        <p className="text-sm text-muted-foreground italic">
                          Content was removed...{" "}
                          <button onClick={() => undoItemBlockDelete(itemId, deletedId)} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors not-italic ml-2">
                            <Undo2 className="w-3 h-3" /> Undo
                          </button>
                        </p>
                        <button onClick={() => dismissItemDeletedBlock(itemId, deletedId)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
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
      </div>
    );
  };

  // Content toolbar for a section/page
  const renderContentToolbar = (itemId: string) => (
    <div className="flex items-center gap-2 mt-4">
      <div className="rounded-2xl border border-border/60 bg-muted/20 backdrop-blur-sm px-2 sm:px-4 py-2 sm:py-2.5 flex flex-wrap items-center flex-1 justify-evenly gap-0.5 shadow-sm">
        {aiEnabled && (
          <button
            onClick={() => { setActiveItemId(itemId); setShowAiBlock(!showAiBlock); if (!showAiBlock) setTimeout(() => aiPromptRef.current?.focus(), 150); }}
            className="relative gap-1.5 sm:gap-2 text-xs sm:text-[13px] h-8 sm:h-9 rounded-full px-3 sm:px-4 flex items-center font-medium text-foreground/90 hover:bg-primary/5 transition-colors duration-200"
          >
            <span className="absolute inset-0 rounded-full p-[1.5px]" style={{ background: 'linear-gradient(135deg, hsl(217, 91%, 70%), hsl(280, 65%, 65%), hsl(217, 91%, 55%))' }}>
              <span className="block w-full h-full rounded-full bg-background" />
            </span>
            <Sparkles className="w-3.5 sm:w-4 h-3.5 sm:h-4 relative" />
            <span className="relative hidden sm:inline">Create with AI</span>
            <span className="relative sm:hidden">AI</span>
          </button>
        )}
        <Button variant="ghost" className="gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-[13px] h-8 sm:h-9 rounded-full hover:text-foreground hover:bg-foreground/5 px-2.5 sm:px-4" onClick={() => addBlockToItem(itemId, "text")}>
          <Type className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> <span className="hidden sm:inline">Text</span>
        </Button>
        <Button variant="ghost" className="gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-[13px] h-8 sm:h-9 rounded-full hover:text-foreground hover:bg-foreground/5 px-2.5 sm:px-4" onClick={() => addBlockToItem(itemId, "image")}>
          <ImageIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> <span className="hidden sm:inline">Image</span>
        </Button>
        <Button variant="ghost" className="gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-[13px] h-8 sm:h-9 rounded-full hover:text-foreground hover:bg-foreground/5 px-2.5 sm:px-4" onClick={() => addBlockToItem(itemId, "video")}>
          <Video className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> <span className="hidden sm:inline">Video</span>
        </Button>
        <Button variant="ghost" className="gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-[13px] h-8 sm:h-9 rounded-full hover:text-foreground hover:bg-foreground/5 px-2.5 sm:px-4" onClick={() => addBlockToItem(itemId, "doc")}>
          <DocIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> <span className="hidden sm:inline">Doc</span>
        </Button>
      </div>
      <button
        onClick={() => { setSidebarCollapsed(false); setActiveTab("blocks"); setActiveItemId(itemId); }}
        className="rounded-2xl border border-dashed border-border/60 bg-muted/10 backdrop-blur-sm self-stretch px-3 sm:px-4 shadow-sm shrink-0 flex items-center gap-1.5 text-muted-foreground text-xs sm:text-[13px] hover:text-foreground hover:border-primary/30 hover:bg-muted/30 transition-all duration-200 cursor-pointer"
      >
        <MoreHorizontal className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> <span className="hidden sm:inline">More</span>
      </button>
    </div>
  );

  const flatItems = getAllFlatItems();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
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
                {title.length > 40 && <TooltipContent side="bottom" className="max-w-[300px] text-sm">{title}</TooltipContent>}
              </Tooltip>
              <span className="text-muted-foreground/30 select-none">|</span>
              <LayoutSelectorDropdown currentLayout="single-page" title={title} aiOptions={aiOptions} />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3" data-tour="header-actions">
            <AIHeaderButton aiOptions={aiOptions} onOptionsChange={setAIOptions} />
            <Button variant="outline" size="icon" className="rounded-full border-border" onClick={() => toast({ title: "Preview", description: "Single-page preview coming soon." })}>
              <Play className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="rounded-full border-primary text-primary hover:bg-primary/5 gap-2">
              <Share2 className="w-4 h-4" /> <span className="hidden sm:inline">Publish</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowTour(true)}>
              <HelpCircle className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main body with sidebar */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar */}
        <div className={cn("border-r border-border bg-muted/20 flex flex-col shrink-0 transition-all duration-300 relative", sidebarCollapsed ? "w-0 overflow-hidden border-r-0" : "w-[320px]")}>
          {!sidebarCollapsed && (
            <button onClick={() => setSidebarCollapsed(true)} className="absolute -right-3 top-4 z-10 w-6 h-6 rounded-full border border-border bg-background shadow-sm flex items-center justify-center hover:bg-muted transition-colors">
              <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-0 px-4 pt-3 border-b border-border whitespace-nowrap">
            <button onClick={() => setActiveTab("outline")} className={cn("flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors", activeTab === "outline" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
              <LayoutGrid className="w-3.5 h-3.5" /> Course outline
            </button>
            <button onClick={() => setActiveTab("blocks")} className={cn("flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors", activeTab === "blocks" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
              <Layers className="w-3.5 h-3.5" /> Content blocks
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4 thin-scrollbar">
            {activeTab === "outline" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Navigate to:</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-border rounded-full px-4">
                        <Plus className="w-3.5 h-3.5" /> Add
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 p-1.5">
                      <DropdownMenuItem className="cursor-pointer gap-2.5 px-3 py-2.5 rounded-md" onClick={() => handleAddItem("section")}>
                        <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium">New section</span>
                          <span className="text-[11px] text-muted-foreground">Group related content</span>
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

                {/* Outline items */}
                {items.length > 0 ? (
                  <DndContext sensors={outlineSensors} collisionDetection={closestCenter} onDragEnd={handleOutlineDragEnd}>
                    <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                      {(() => {
                        let sectionIndex = 0;
                        return items.map((item) => {
                          if (item.type === "page") {
                            return (
                              <SortableOutlineWrapper key={item.id} id={item.id}>
                                {(listeners) => (
                                  <div onClick={() => scrollToItem(item.id)} className="group/nav-page flex items-center gap-2.5 py-2.5 transition-colors cursor-pointer relative rounded-md pl-1 hover:bg-muted/40 px-2">
                                    <span className="opacity-0 group-hover/nav-page:opacity-100 transition-opacity shrink-0 cursor-grab active:cursor-grabbing" {...listeners}>
                                      <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40" />
                                    </span>
                                    <FileText className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                                    <span className="text-sm truncate flex-1 text-foreground/80">{item.title || "Untitled page"}</span>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <button className="opacity-0 group-hover/nav-page:opacity-100 p-1 rounded-md hover:bg-muted transition-all shrink-0" onClick={(e) => e.stopPropagation()}>
                                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-44">
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
                                )}
                              </SortableOutlineWrapper>
                            );
                          }
                          if (item.type === "section") {
                            sectionIndex++;
                            const currentSectionNumber = sectionIndex;
                            return (
                              <SortableOutlineWrapper key={item.id} id={item.id}>
                                {(listeners) => (
                                  <div className="rounded-xl border border-border bg-card p-4 space-y-3 transition-colors">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-muted-foreground font-medium cursor-grab active:cursor-grabbing flex items-center gap-1" {...listeners} onClick={(e) => e.stopPropagation()}>
                                        <GripVertical className="w-3 h-3 text-muted-foreground/40" />
                                        Section {currentSectionNumber}
                                      </span>
                                      <div className="flex items-center gap-0" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <button className="p-1.5 rounded-md hover:bg-muted transition-colors">
                                              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                            </button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end" className="w-44">
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
                                        <span className="w-px h-4 bg-border" />
                                        <button className="p-1.5 rounded-md hover:bg-muted transition-colors" onClick={() => setCollapsedSections(prev => { const next = new Set(prev); if (next.has(item.id)) next.delete(item.id); else next.add(item.id); return next; })}>
                                          {collapsedSections.has(item.id) ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
                                        </button>
                                      </div>
                                    </div>
                                    <span className="text-[15px] font-semibold text-foreground block text-left cursor-pointer hover:text-primary transition-colors" onClick={() => scrollToItem(item.id)}>
                                      {item.title || "Untitled section"}
                                    </span>
                                    {!collapsedSections.has(item.id) && (<>
                                      {item.children && item.children.length > 0 && (
                                        <div className="space-y-1 pl-2 border-l-2 border-border/40 ml-1">
                                          {item.children.map((child) => (
                                            <div key={child.id} onClick={() => scrollToItem(child.id)} className="group/child flex items-center gap-2 py-2 px-2 rounded-md hover:bg-muted/40 cursor-pointer transition-colors">
                                              <FileText className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                                              <span className="text-sm text-foreground/80 truncate flex-1">{child.title || "Untitled page"}</span>
                                              <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                  <button className="opacity-0 group-hover/child:opacity-100 p-1 rounded-md hover:bg-muted transition-all shrink-0" onClick={(e) => e.stopPropagation()}>
                                                    <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                                                  </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-44">
                                                  <DropdownMenuItem className="gap-2 text-sm" onClick={() => { setRenameValue(child.title || ""); setRenameTarget({ id: child.id, title: child.title || "" }); }}>
                                                    <Pencil className="w-3.5 h-3.5" /> Rename
                                                  </DropdownMenuItem>
                                                  <DropdownMenuItem className="gap-2 text-sm" onClick={() => duplicateItem(child.id)}>
                                                    <Copy className="w-3.5 h-3.5" /> Duplicate
                                                  </DropdownMenuItem>
                                                  <DropdownMenuSeparator />
                                                  <DropdownMenuItem className="gap-2 text-sm text-destructive focus:text-destructive" onClick={() => setDeleteConfirmId(child.id)}>
                                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                                  </DropdownMenuItem>
                                                </DropdownMenuContent>
                                              </DropdownMenu>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      <button onClick={() => addPageToSection(item.id)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors pt-1 ml-1 pl-3">
                                        <Plus className="w-3.5 h-3.5" /> Add page
                                      </button>
                                      <div className="border-t border-dashed border-border mt-2" />
                                    </>)}
                                  </div>
                                )}
                              </SortableOutlineWrapper>
                            );
                          }
                          return null;
                        });
                      })()}
                    </SortableContext>
                  </DndContext>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No items in the outline yet</p>
                )}
              </div>
            ) : (
              <ContentBlocksPanel
                onAddBlock={(type, variant) => {
                  if (activeItemId === "intro") {
                    addIntroBlock(type as ContentBlockData["type"], undefined, variant);
                  } else if (activeItemId) {
                    addBlockToItem(activeItemId, type, undefined, variant);
                  }
                }}
                onOpenQuizGenerator={() => setShowQuizGenerateDialog(true)}
                aiEnabled={aiEnabled}
              />
            )}
          </div>
        </div>

        {/* Collapsed sidebar toggle */}
        {sidebarCollapsed && (
          <button onClick={() => setSidebarCollapsed(false)} className="shrink-0 px-2 py-4 border-r border-border hover:bg-muted/50 transition-colors flex items-start pt-6">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        )}

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* Course Title */}
            <div className="relative group" data-tour="course-heading">
              <textarea
                value={title}
                onChange={(e) => { if (e.target.value.length <= 275) setTitle(e.target.value); }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground bg-transparent border-none outline-none w-full placeholder:text-foreground/40 resize-none overflow-hidden leading-tight"
                placeholder="Untitled course"
                rows={1}
                onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; }}
              />
              <div className="absolute bottom-0 left-0 w-full h-px bg-transparent group-focus-within:bg-primary transition-colors duration-200" />
            </div>
            <div className="mt-2">
              <span className="inline-block px-2 py-0.5 text-xs text-muted-foreground bg-muted/50 rounded border border-border">{title.length}/ 275</span>
            </div>
            <div className="mt-4 mb-8">
              <div className="h-1 bg-primary/30 rounded-full w-full" />
            </div>

            {/* Introduction Content Blocks */}
            <div
              onDragOver={(e) => handleDragOver(e, "intro")}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleContentDrop(e, "intro")}
              className={cn("rounded-xl transition-all duration-200", isDragOver === "intro" && "ring-2 ring-primary/40 ring-dashed bg-primary/5")}
            >
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleIntroDragEnd}>
              <SortableContext items={contentBlocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-0" data-tour="content-blocks">
                  {contentBlocks.map((block, index) => (
                    <div key={block.id} className="group/item">
                      {index === 0 && block.type !== "description" && (
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                          <AddContentButton
                            variant="full"
                            aiEnabled={aiEnabled}
                            onAddText={() => addIntroBlock("text", 0)}
                            onAddImage={() => addIntroBlock("image", 0)}
                            onAddVideo={() => addIntroBlock("video", 0)}
                            onAddDoc={() => addIntroBlock("doc", 0)}
                            onAddQuiz={() => addIntroBlock("quiz", 0)}
                            onMore={() => { setSidebarCollapsed(false); setActiveTab("blocks"); setActiveItemId("intro"); }}
                            onDropBlock={(type, variant) => addIntroBlock(type as any, 0, variant)}
                            onOpenQuizGenerator={() => setShowQuizGenerateDialog(true)}
                          />
                        </div>
                      )}
                      {block.type === "description" ? (
                        <DescriptionBlock id={block.id} content={block.content} onChange={(content) => updateIntroBlockContent(block.id, content)} onClear={() => deleteIntroBlock(block.id)} onDuplicate={() => duplicateIntroBlock(block.id)} />
                      ) : (
                        <ContentBlock id={block.id} type={block.type as any} content={block.content} onChange={(content) => updateIntroBlockContent(block.id, content)} onDelete={() => deleteIntroBlock(block.id)} onDuplicate={() => duplicateIntroBlock(block.id)} autoFocus={block.id === lastAddedBlockId} aiEnabled={aiEnabled} />
                      )}
                      {block.type !== "description" && (
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                          <AddContentButton
                            variant="full"
                            aiEnabled={aiEnabled}
                            onAddText={() => addIntroBlock("text", index + 1)}
                            onAddImage={() => addIntroBlock("image", index + 1)}
                            onAddVideo={() => addIntroBlock("video", index + 1)}
                            onAddDoc={() => addIntroBlock("doc", index + 1)}
                            onAddQuiz={() => addIntroBlock("quiz", index + 1)}
                            onMore={() => { setSidebarCollapsed(false); setActiveTab("blocks"); setActiveItemId("intro"); }}
                            onDropBlock={(type, variant) => addIntroBlock(type as any, index + 1, variant)}
                            onOpenQuizGenerator={() => setShowQuizGenerateDialog(true)}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            </div>

            {/* Intro content toolbar */}
            <div className="flex items-center gap-2 mt-6">
              <div className="rounded-2xl border border-border/60 bg-muted/20 backdrop-blur-sm px-2 sm:px-4 py-2 sm:py-2.5 flex flex-wrap items-center flex-1 justify-evenly gap-0.5 shadow-sm">
                {aiEnabled && (
                  <button
                    onClick={() => { setActiveItemId("intro"); setShowAiBlock(!showAiBlock); }}
                    className="relative gap-1.5 sm:gap-2 text-xs sm:text-[13px] h-8 sm:h-9 rounded-full px-3 sm:px-4 flex items-center font-medium text-foreground/90 hover:bg-primary/5 transition-colors duration-200"
                  >
                    <span className="absolute inset-0 rounded-full p-[1.5px]" style={{ background: 'linear-gradient(135deg, hsl(217, 91%, 70%), hsl(280, 65%, 65%), hsl(217, 91%, 55%))' }}>
                      <span className="block w-full h-full rounded-full bg-background" />
                    </span>
                    <Sparkles className="w-3.5 sm:w-4 h-3.5 sm:h-4 relative" />
                    <span className="relative hidden sm:inline">Create with AI</span>
                    <span className="relative sm:hidden">AI</span>
                  </button>
                )}
                <Button variant="ghost" className="gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-[13px] h-8 sm:h-9 rounded-full hover:text-foreground hover:bg-foreground/5 px-2.5 sm:px-4" onClick={() => addIntroBlock("text")}>
                  <Type className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> <span className="hidden sm:inline">Text</span>
                </Button>
                <Button variant="ghost" className="gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-[13px] h-8 sm:h-9 rounded-full hover:text-foreground hover:bg-foreground/5 px-2.5 sm:px-4" onClick={() => addIntroBlock("image")}>
                  <ImageIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> <span className="hidden sm:inline">Image</span>
                </Button>
                <Button variant="ghost" className="gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-[13px] h-8 sm:h-9 rounded-full hover:text-foreground hover:bg-foreground/5 px-2.5 sm:px-4" onClick={() => addIntroBlock("video")}>
                  <Video className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> <span className="hidden sm:inline">Video</span>
                </Button>
                <Button variant="ghost" className="gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-[13px] h-8 sm:h-9 rounded-full hover:text-foreground hover:bg-foreground/5 px-2.5 sm:px-4" onClick={() => addIntroBlock("doc")}>
                  <DocIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> <span className="hidden sm:inline">Doc</span>
                </Button>
              </div>
              <button
                onClick={() => { setSidebarCollapsed(false); setActiveTab("blocks"); setActiveItemId("intro"); }}
                className="rounded-2xl border border-dashed border-border/60 bg-muted/10 backdrop-blur-sm self-stretch px-3 sm:px-4 shadow-sm shrink-0 flex items-center gap-1.5 text-muted-foreground text-xs sm:text-[13px] hover:text-foreground hover:border-primary/30 hover:bg-muted/30 transition-all duration-200 cursor-pointer"
              >
                <MoreHorizontal className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> <span className="hidden sm:inline">More</span>
              </button>
            </div>

            {/* Inline Sections & Pages */}
            {flatItems.map(({ item, sectionIndex, parentId }) => {
              if (item.type === "section") {
                return (
                  <div key={item.id} id={`item-${item.id}`} className="mt-12">
                    {/* Section divider label */}
                    <div className="flex items-center gap-3 mb-6">
                      <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-primary border border-primary/30 rounded-full bg-primary/5">
                        Section {sectionIndex}: {item.title || "Untitled section"}
                      </span>
                      <div className="flex-1 h-px border-t border-dashed border-border" />
                    </div>

                    {/* Section title + image area */}
                    <div className="mb-6">
                      <div className="flex gap-4">
                        {/* Section image thumbnail */}
                        <div
                          onClick={() => setShowSectionImageDialog(item.id)}
                          className="w-[120px] h-[110px] rounded-lg border border-dashed border-border bg-muted/30 flex items-center justify-center shrink-0 group/thumb cursor-pointer hover:border-primary/40 hover:bg-muted/50 transition-all duration-200 relative overflow-hidden"
                        >
                          {sectionImages[item.id] ? (
                            <>
                              <img src={sectionImages[item.id]!} alt="Section thumbnail" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200">
                                <ImageIcon className="w-5 h-5 text-white mb-1" />
                                <span className="text-[10px] font-medium text-white">Change image</span>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center gap-1.5 text-muted-foreground/50 group-hover/thumb:text-primary/60 transition-colors">
                              <ImageIcon className="w-6 h-6" />
                              <span className="text-[10px] font-medium">Add image</span>
                            </div>
                          )}
                        </div>

                        {/* Title input */}
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-muted-foreground block mb-2">Section title</span>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => { if (e.target.value.length <= 350) updateItemTitle(item.id, e.target.value); }}
                            className="text-2xl sm:text-3xl font-bold text-foreground bg-transparent border-none outline-none w-full placeholder:text-muted-foreground/40"
                            placeholder="Untitled section"
                          />
                        </div>
                      </div>
                      <div className="border-t border-dashed border-border my-4" />

                      {/* Section Image Dialog */}
                      <SectionImageDialog
                        open={showSectionImageDialog === item.id}
                        onClose={() => setShowSectionImageDialog(null)}
                        currentImage={sectionImages[item.id] || null}
                        onImageChange={(url) => {
                          setSectionImages((prev) => ({ ...prev, [item.id]: url }));
                          setShowSectionImageDialog(null);
                        }}
                      />
                    </div>

                    {/* Section content blocks */}
                    {renderItemBlocks(item.id)}
                    {renderContentToolbar(item.id)}
                  </div>
                );
              }

              // Page item (top-level or child)
              return (
                <div key={item.id} id={`item-${item.id}`} className={cn("mt-10", parentId && "ml-4 pl-4 border-l-2 border-primary/20")}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-muted-foreground border border-border rounded-full bg-muted/30">
                      <FileText className="w-3 h-3 mr-1.5" />
                      {item.title || "Untitled page"}
                    </span>
                    {!parentId && <div className="flex-1 h-px border-t border-dashed border-border" />}
                  </div>

                  <div className="mb-4">
                    <span className="text-sm text-muted-foreground block mb-2">Page title</span>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => { if (e.target.value.length <= 350) updateItemTitle(item.id, e.target.value); }}
                      className="text-xl sm:text-2xl font-bold text-foreground bg-transparent border-none outline-none w-full placeholder:text-muted-foreground/40"
                      placeholder="Untitled page"
                    />
                    <div className="border-t border-dashed border-border my-4" />
                  </div>

                  {renderItemBlocks(item.id)}
                  {renderContentToolbar(item.id)}
                </div>
              );
            })}

            {/* Empty state for outline */}
            {items.length === 0 && (
              <div className="mt-12 border-t border-dashed border-border pt-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">Add sections and pages to build your course</p>
                <div className="flex items-center justify-center gap-3">
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => handleAddItem("section")}>
                    <LayoutGrid className="w-4 h-4" /> Add section
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => handleAddItem("page")}>
                    <FileText className="w-4 h-4" /> Add page
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete item</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this item? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (deleteConfirmId) { deleteItem(deleteConfirmId); setDeleteConfirmId(null); } }}>
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
            <Input
              id="rename-input"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && renameTarget && renameValue.trim()) { updateItemTitle(renameTarget.id, renameValue.trim()); setRenameTarget(null); } }}
              placeholder="Enter title…"
              autoFocus
              maxLength={350}
              className="w-full"
            />
            <span className="text-xs text-muted-foreground mt-1.5 block text-right">{renameValue.length}/350</span>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>Cancel</Button>
            <Button onClick={() => { if (renameTarget && renameValue.trim()) { updateItemTitle(renameTarget.id, renameValue.trim()); setRenameTarget(null); } }} disabled={!renameValue.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quiz Generate Dialog */}
      <GenerateQuizDialog open={showQuizGenerateDialog} onClose={() => setShowQuizGenerateDialog(false)} onGenerate={handleQuizGenerate} isGenerating={isQuizGenerating} />

      {/* Guided Tour */}
      <GuidedTour steps={tourSteps} isOpen={showTour} onClose={() => { setShowTour(false); setTourStep(-1); }} onStepChange={setTourStep} />
    </div>
  );
}
