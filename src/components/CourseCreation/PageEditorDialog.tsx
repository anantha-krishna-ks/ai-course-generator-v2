import { useState, useCallback, useRef, useEffect } from "react";
import { X, FileText, LayoutGrid, Plus, Sparkles, Type, ImageIcon, Video, FileText as DocIcon, Layers, MoreHorizontal, MessageCircleQuestion, Mic, Play, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, MoreHorizontal as Dots, Undo2, Send, BookOpen, GripVertical, Pencil, Copy, Trash2, Check, ArrowLeft, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { AIOptions } from "@/components/Dashboard/AIOptionsPanel";
import { AIHeaderButton } from "./AIHeaderButton";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ContentBlock } from "./ContentBlock";
import { AddContentButton } from "./AddContentButton";
import { ContentBlocksPanel } from "./ContentBlocksPanel";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GenerateQuizDialog, type GenerateQuizConfig } from "./GenerateQuizDialog";

interface PageContentBlock {
  id: string;
  type: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description";
  content: string;
}

interface CourseOutlineItem {
  id: string;
  type: "section" | "page" | "question";
  title: string;
  children?: CourseOutlineItem[];
}

interface PageEditorDialogProps {
  open: boolean;
  onClose: () => void;
  pageTitle: string;
  onPageTitleChange: (title: string) => void;
  aiEnabled?: boolean;
  aiOptions?: AIOptions | null;
  onAiOptionsChange?: (options: AIOptions) => void;
  courseItems?: CourseOutlineItem[];
  currentPageId?: string;
  onRenameItem?: (id: string, newTitle: string) => void;
  onDuplicateItem?: (id: string) => void;
  onDeleteItem?: (id: string) => void;
  onAddPageToSection?: (sectionId: string) => void;
  onReorderItems?: (activeId: string, overId: string) => void;
  onReorderChildItems?: (sectionId: string, activeId: string, overId: string) => void;
  onNavigateToPage?: (pageId: string) => void;
  onAddItem?: (type: "section" | "page") => void;
  initialBlocks?: PageContentBlock[];
  onBlocksChange?: (blocks: PageContentBlock[]) => void;
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

export function PageEditorDialog({ open, onClose, pageTitle, onPageTitleChange, aiEnabled = false, aiOptions = null, onAiOptionsChange, courseItems = [], currentPageId, onRenameItem, onDuplicateItem, onDeleteItem, onAddPageToSection, onReorderItems, onReorderChildItems, onNavigateToPage, onAddItem, initialBlocks, onBlocksChange }: PageEditorDialogProps) {
  const [activeTab, setActiveTab] = useState<"outline" | "blocks">("outline");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<{ id: string; title: string } | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [blocks, setBlocks] = useState<PageContentBlock[]>(initialBlocks || []);
  const onBlocksChangeRef = useRef(onBlocksChange);
  onBlocksChangeRef.current = onBlocksChange;

  // Sync blocks to parent whenever they change
  useEffect(() => {
    onBlocksChangeRef.current?.(blocks);
  }, [blocks]);

  // Find all navigable page IDs from the outline
  const getAllPageIds = useCallback((): string[] => {
    const ids: string[] = [];
    for (const item of courseItems) {
      if (item.type === "page") ids.push(item.id);
      if (item.children) {
        for (const child of item.children) {
          if (child.type === "page") ids.push(child.id);
        }
      }
    }
    return ids;
  }, [courseItems]);

  // Delete a page and navigate to an adjacent one if it's the current page
  const handleDeletePage = useCallback((id: string) => {
    if (id === currentPageId) {
      const pageIds = getAllPageIds();
      const idx = pageIds.indexOf(id);
      const nextId = pageIds[idx + 1] ?? pageIds[idx - 1];
      if (nextId) {
        onNavigateToPage?.(nextId);
      }
    }
    onDeleteItem?.(id);
  }, [currentPageId, getAllPageIds, onDeleteItem, onNavigateToPage]);

  const [lastAddedBlockId, setLastAddedBlockId] = useState<string | null>(null);
  const [deletedBlocks, setDeletedBlocks] = useState<Map<string, { block: PageContentBlock; index: number }>>(new Map());
  const [showAiBlock, setShowAiBlock] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiBlockType, setAiBlockType] = useState<"text" | "image" | "quiz" | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showAiSheet, setShowAiSheet] = useState(false);
  const [aiSheetSection, setAiSheetSection] = useState<string | null>(null);
  const aiPromptRef = useRef<HTMLTextAreaElement>(null);
  const [showQuizGenerateDialog, setShowQuizGenerateDialog] = useState(false);
  const [isQuizGenerating, setIsQuizGenerating] = useState(false);
  
  // AI review state
  const [aiReviewBlockId, setAiReviewBlockId] = useState<string | null>(null);
  const [aiReviewMode, setAiReviewMode] = useState<"review" | "modify">("review");
  const [modifyPrompt, setModifyPrompt] = useState("");
  const modifyInputRef = useRef<HTMLTextAreaElement>(null);

  const handleQuizGenerate = useCallback((config: GenerateQuizConfig) => {
    setIsQuizGenerating(true);
    setTimeout(() => {
      // Add a quiz block with generated questions
      const id = `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const questions: any[] = [];
      let idCounter = 1;
      for (let i = 0; i < config.scqCount; i++) {
        questions.push({ id: idCounter++, type: "SCQ", question: `Sample single choice question ${i + 1}?`, options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A", explanation: "This is the explanation for the correct answer." });
      }
      for (let i = 0; i < config.mcqCount; i++) {
        questions.push({ id: idCounter++, type: "MCQ", question: `Sample multiple choice question ${i + 1}?`, options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A, Option B", explanation: "These are the correct answers." });
      }
      for (let i = 0; i < config.trueFalseCount; i++) {
        questions.push({ id: idCounter++, type: "TrueFalse", question: `Sample true/false statement ${i + 1}.`, options: ["True", "False"], answer: "True", explanation: "This statement is true because..." });
      }
      for (let i = 0; i < config.fibCount; i++) {
        questions.push({ id: idCounter++, type: "FIB", question: `The _____ is a sample fill-in-the-blank question ${i + 1}.`, options: [], answer: "answer", explanation: "The correct word to fill in is 'answer'." });
      }
      setBlocks((prev) => [...prev, { id, type: "quiz", content: JSON.stringify(questions) }]);
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
        ? `<h3>${prompt}</h3><p>Based on your prompt, here is an AI-generated overview of the topic. This section covers the key concepts and practical applications that learners need to understand. The content has been structured to facilitate progressive learning and knowledge retention.</p><p>Key takeaways include understanding the fundamental principles, recognizing common patterns, and applying best practices in real-world scenarios. Each concept builds upon the previous one to create a comprehensive learning experience.</p>`
        : "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=400&fit=crop";
      setBlocks((prev) => [...prev, { id, type, content }]);
      setLastAddedBlockId(id);
      setAiGenerating(false);
      setShowAiBlock(false);
      setAiBlockType(null);
      // Enter review mode for text blocks
      if (type === "text") {
        setAiReviewBlockId(id);
        setAiReviewMode("review");
      }
    }, 3000);
  }, []);

  const handleAiReviewAdd = useCallback(() => {
    setAiReviewBlockId(null);
    setAiReviewMode("review");
    setModifyPrompt("");
  }, []);

  const handleAiReviewCancel = useCallback(() => {
    if (aiReviewBlockId) {
      setBlocks((prev) => prev.filter((b) => b.id !== aiReviewBlockId));
    }
    setAiReviewBlockId(null);
    setAiReviewMode("review");
    setModifyPrompt("");
  }, [aiReviewBlockId]);

  const handleAiModifySubmit = useCallback(() => {
    if (!modifyPrompt.trim() || !aiReviewBlockId) return;
    setAiGenerating(true);
    // Simulate AI modification
    setTimeout(() => {
      setBlocks((prev) => prev.map((b) => {
        if (b.id !== aiReviewBlockId) return b;
        return { ...b, content: `${b.content}<p><em>Modified based on: "${modifyPrompt}"</em></p><p>The content has been updated to reflect your requested changes. The key points have been restructured and additional context has been provided where needed.</p>` };
      }));
      setAiGenerating(false);
      setAiReviewMode("review");
      setModifyPrompt("");
    }, 2000);
  }, [modifyPrompt, aiReviewBlockId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const outlineSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

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
        return "<h2>Heading</h2><p>Employee-generated Learning empowers experts to create learning content using their own knowledge and expertise. This approach leverages institutional knowledge to build comprehensive training materials.</p>";
      case "text-only":
        return "<p>Employee-generated Learning empowers experts to create learning content using their own knowledge and expertise as a source of input for e-learning. This method ensures authentic and practical educational resources.</p>";
      case "two-columns":
        return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem"><div><h3>Heading</h3><p>Employee-generated Learning enables employees to learn from each other through shared expertise.</p></div><div><h3>Heading</h3><p>Employee-generated Learning enables employees to learn from each other through shared expertise.</p></div></div>';
      default:
        return "<p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>";
    }
  };

  const addBlock = useCallback((type: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description", atIndex?: number, variant?: string) => {
    const id = `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const defaultContent = getVariantContent(type, variant);
    setBlocks((prev) => {
      if (atIndex !== undefined) {
        const next = [...prev];
        next.splice(atIndex, 0, { id, type, content: defaultContent });
        return next;
      }
      return [...prev, { id, type, content: defaultContent }];
    });
    setLastAddedBlockId(id);
  }, []);

  const updateBlock = useCallback((id: string, content: string) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content } : b)));
  }, []);

  const deleteBlock = useCallback((id: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const block = prev[idx];
      setDeletedBlocks((dm) => {
        const next = new Map(dm);
        next.set(id, { block, index: idx });
        return next;
      });
      return prev.filter((b) => b.id !== id);
    });
  }, []);

  const undoDeleteBlock = useCallback((id: string) => {
    setDeletedBlocks((dm) => {
      const entry = dm.get(id);
      if (!entry) return dm;
      setBlocks((prev) => {
        const next = [...prev];
        const insertAt = Math.min(entry.index, next.length);
        next.splice(insertAt, 0, entry.block);
        return next;
      });
      const nextMap = new Map(dm);
      nextMap.delete(id);
      return nextMap;
    });
  }, []);

  const dismissDeletedBlock = useCallback((id: string) => {
    setDeletedBlocks((dm) => {
      const next = new Map(dm);
      next.delete(id);
      return next;
    });
  }, []);

  const duplicateBlock = useCallback((id: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const newId = `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const copy = { ...prev[idx], id: newId };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks((prev) => {
        const oldIndex = prev.findIndex((b) => b.id === active.id);
        const newIndex = prev.findIndex((b) => b.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);

  return (
    <>
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[98vw] w-[1600px] h-[95vh] p-0 gap-0 overflow-hidden flex flex-col [&>button]:hidden data-[state=open]:!animate-none data-[state=closed]:!animate-none data-[state=open]:!duration-0 data-[state=closed]:!duration-0">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0 shadow-[0_1px_2px_0_hsl(var(--foreground)/0.03),0_2px_6px_-1px_hsl(var(--foreground)/0.04)] z-10">
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Page editor</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-full border-border h-9 w-9">
              <Play className="w-4 h-4" />
            </Button>
            <span className="w-px h-5 bg-border" />
            <button
              onClick={onClose}
              className="p-2.5 rounded-md hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">
          {/* Left Sidebar */}
          <div
            className={cn(
              "border-r border-border bg-muted/20 flex flex-col shrink-0 transition-all duration-300 relative",
              sidebarCollapsed ? "w-0 overflow-hidden border-r-0" : "w-[320px]"
            )}
          >
            {/* Collapse button on divider */}
            {!sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="absolute -right-3 top-4 z-10 w-6 h-6 rounded-full border border-border bg-background shadow-sm flex items-center justify-center hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}

            {/* Tabs */}
            <div className="flex items-center gap-0 px-4 pt-3 border-b border-border whitespace-nowrap">
              <button
                onClick={() => setActiveTab("outline")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors",
                  activeTab === "outline"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Course outline
              </button>
              <button
                onClick={() => setActiveTab("blocks")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors",
                  activeTab === "blocks"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Layers className="w-3.5 h-3.5" />
                Content blocks
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-4 thin-scrollbar">
              {activeTab === "outline" ? (
                <div className="space-y-4">
                  {/* Navigate to */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Navigate to:</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-border rounded-full px-4">
                          <Plus className="w-3.5 h-3.5" />
                          Add
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52 p-1.5">
                        <DropdownMenuItem className="cursor-pointer gap-2.5 px-3 py-2.5 rounded-md" onClick={() => onAddItem?.("section")}>
                          <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium">New section</span>
                            <span className="text-[11px] text-muted-foreground">Group related pages</span>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer gap-2.5 px-3 py-2.5 rounded-md" onClick={() => onAddItem?.("page")}>
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium">New page</span>
                            <span className="text-[11px] text-muted-foreground">Single learning unit</span>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Dynamic outline items */}
                  {courseItems.length > 0 ? (
                    <DndContext
                      sensors={outlineSensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event: DragEndEvent) => {
                        const { active, over } = event;
                        if (over && active.id !== over.id) {
                          onReorderItems?.(String(active.id), String(over.id));
                        }
                      }}
                    >
                      <SortableContext items={courseItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                        {(() => {
                          let sectionIndex = 0;
                          return courseItems.map((item) => {
                            if (item.type === "page") {
                              const isCurrentPage = item.id === currentPageId;
                              return (
                                <SortableOutlineWrapper key={item.id} id={item.id}>
                                  {(listeners: Record<string, unknown>) => (
                                    <div
                                      onClick={() => !isCurrentPage && onNavigateToPage?.(item.id)}
                                      className={cn(
                                        "group/nav-page flex items-center gap-2.5 py-2.5 transition-colors cursor-pointer relative rounded-md",
                                        isCurrentPage && "border-l-[3px] border-green-500 pl-3 bg-muted/60",
                                        !isCurrentPage && "pl-1 hover:bg-muted/40 px-2"
                                      )}
                                    >
                                      {/* Drag handle */}
                                      <span
                                        className="opacity-0 group-hover/nav-page:opacity-100 transition-opacity shrink-0 cursor-grab active:cursor-grabbing"
                                        {...listeners}
                                      >
                                        <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40" />
                                      </span>
                                      <FileText className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                                      <span className={cn(
                                        "text-sm truncate flex-1",
                                        isCurrentPage ? "text-foreground font-medium" : "text-foreground/80"
                                      )}>
                                        {item.title || "Untitled page"}
                                      </span>
                                      {/* Three-dot menu on hover */}
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <button
                                            className="opacity-0 group-hover/nav-page:opacity-100 p-1 rounded-md hover:bg-muted transition-all shrink-0"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <Dots className="w-4 h-4 text-muted-foreground" />
                                          </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-44">
                                          <DropdownMenuItem className="gap-2 text-sm" onClick={() => {
                                            setRenameValue(item.title || "");
                                            setRenameTarget({ id: item.id, title: item.title || "" });
                                          }}>
                                            <Pencil className="w-3.5 h-3.5" /> Rename
                                          </DropdownMenuItem>
                                          <DropdownMenuItem className="gap-2 text-sm" onClick={() => onDuplicateItem?.(item.id)}>
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
                              return (
                                <SortableOutlineWrapper key={item.id} id={item.id}>
                                  {(listeners: Record<string, unknown>) => (
                                    <div
                                      className="rounded-xl border border-border bg-card p-4 space-y-3 cursor-pointer hover:border-primary/30 transition-colors"
                                      onClick={() => {
                                        // Expand section if collapsed
                                        setCollapsedSections((prev) => {
                                          const next = new Set(prev);
                                          next.delete(item.id);
                                          return next;
                                        });
                                        // Navigate to first child page if available
                                        if (item.children && item.children.length > 0) {
                                          onNavigateToPage?.(item.children[0].id);
                                        }
                                      }}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span
                                          className="text-xs text-muted-foreground font-medium cursor-grab active:cursor-grabbing flex items-center gap-1"
                                          {...listeners}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <GripVertical className="w-3 h-3 text-muted-foreground/40" />
                                          Section {sectionIndex}
                                        </span>
                                        <div className="flex items-center gap-0" onClick={(e) => e.stopPropagation()}>
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <button className="p-1.5 rounded-md hover:bg-muted transition-colors">
                                                <Dots className="w-4 h-4 text-muted-foreground" />
                                              </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-44">
                                              <DropdownMenuItem className="gap-2 text-sm" onClick={() => {
                                                setRenameValue(item.title || "");
                                                setRenameTarget({ id: item.id, title: item.title || "" });
                                              }}>
                                                <Pencil className="w-3.5 h-3.5" /> Rename
                                              </DropdownMenuItem>
                                              <DropdownMenuItem className="gap-2 text-sm" onClick={() => onDuplicateItem?.(item.id)}>
                                                <Copy className="w-3.5 h-3.5" /> Duplicate
                                              </DropdownMenuItem>
                                              <DropdownMenuSeparator />
                                              <DropdownMenuItem className="gap-2 text-sm text-destructive focus:text-destructive" onClick={() => setDeleteConfirmId(item.id)}>
                                                <Trash2 className="w-3.5 h-3.5" /> Delete
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                          <span className="w-px h-4 bg-border" />
                                          <button
                                            className="p-1.5 rounded-md hover:bg-muted transition-colors"
                                            onClick={() => setCollapsedSections(prev => {
                                              const next = new Set(prev);
                                              if (next.has(item.id)) next.delete(item.id);
                                              else next.add(item.id);
                                              return next;
                                            })}
                                          >
                                            {collapsedSections.has(item.id)
                                              ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                              : <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                            }
                                          </button>
                                        </div>
                                      </div>
                                      <span className="text-[15px] font-semibold text-foreground block text-left">
                                        {item.title || "Untitled section"}
                                      </span>
                                      {!collapsedSections.has(item.id) && (<>
                                      {/* Section children (pages) */}
                                      {item.children && item.children.length > 0 && (
                                        <DndContext
                                          sensors={outlineSensors}
                                          collisionDetection={closestCenter}
                                          onDragEnd={(event: DragEndEvent) => {
                                            const { active, over } = event;
                                            if (over && active.id !== over.id) {
                                              onReorderChildItems?.(item.id, String(active.id), String(over.id));
                                            }
                                          }}
                                        >
                                          <SortableContext items={item.children.map(c => c.id)} strategy={verticalListSortingStrategy}>
                                            <div className="space-y-1 pt-2 ml-1">
                                              {item.children.map((child) => {
                                                const isCurrentChild = child.id === currentPageId;
                                                return (
                                                  <SortableOutlineWrapper key={child.id} id={child.id}>
                                                    {(childListeners: Record<string, unknown>) => (
                                                      <div
                                                        className={cn(
                                                          "group/child-page flex items-center gap-1.5 py-2 rounded-md transition-colors pr-1",
                                                          isCurrentChild
                                                            ? "bg-muted/60 border-l-[3px] border-green-500 pl-2"
                                                            : "hover:bg-muted/50 pl-3"
                                                        )}
                                                      >
                                                        <span
                                                          className="opacity-0 group-hover/child-page:opacity-100 transition-opacity shrink-0 cursor-grab active:cursor-grabbing"
                                                          {...childListeners}
                                                        >
                                                          <GripVertical className="w-3 h-3 text-muted-foreground/40" />
                                                        </span>
                                                        <FileText className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                                                        <span
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (!isCurrentChild) onNavigateToPage?.(child.id);
                                                          }}
                                                          className={cn(
                                                            "flex-1 min-w-0 text-sm truncate cursor-pointer hover:underline",
                                                            isCurrentChild ? "text-foreground font-medium" : "text-foreground/80"
                                                          )}
                                                          title={child.title || "Untitled page"}
                                                        >
                                                          {child.title || "Untitled page"}
                                                        </span>
                                                        {/* Three-dot menu on hover */}
                                                        <DropdownMenu>
                                                          <DropdownMenuTrigger asChild>
                                                            <button
                                                              className="opacity-0 group-hover/child-page:opacity-100 p-1 rounded-md hover:bg-muted transition-all shrink-0"
                                                              onClick={(e) => e.stopPropagation()}
                                                            >
                                                              <Dots className="w-3.5 h-3.5 text-muted-foreground" />
                                                            </button>
                                                          </DropdownMenuTrigger>
                                                          <DropdownMenuContent align="end" className="w-44">
                                                            <DropdownMenuItem className="gap-2 text-sm" onClick={() => {
                                                              setRenameValue(child.title || "");
                                                              setRenameTarget({ id: child.id, title: child.title || "" });
                                                            }}>
                                                              <Pencil className="w-3.5 h-3.5" /> Rename
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="gap-2 text-sm" onClick={() => onDuplicateItem?.(child.id)}>
                                                              <Copy className="w-3.5 h-3.5" /> Duplicate
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="gap-2 text-sm text-destructive focus:text-destructive" onClick={() => setDeleteConfirmId(child.id)}>
                                                              <Trash2 className="w-3.5 h-3.5" /> Delete
                                                            </DropdownMenuItem>
                                                          </DropdownMenuContent>
                                                        </DropdownMenu>
                                                      </div>
                                                    )}
                                                  </SortableOutlineWrapper>
                                                );
                                              })}
                                            </div>
                                          </SortableContext>
                                        </DndContext>
                                      )}
                                      {/* Add page button */}
                                      <button
                                        onClick={() => onAddPageToSection?.(item.id)}
                                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors pt-2 ml-1 pl-3"
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                        Add page
                                      </button>
                                      <div className="border-t border-dashed border-border mt-3" />
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
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No items in the outline yet
                    </p>
                  )}
                </div>
              ) : (
                <ContentBlocksPanel onAddBlock={(type, variant) => addBlock(type, undefined, variant)} onOpenQuizGenerator={() => setShowQuizGenerateDialog(true)} aiEnabled={aiEnabled} />
              )}
            </div>
          </div>

          {/* Collapsed sidebar toggle */}
          {sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="shrink-0 px-2 py-4 border-r border-border hover:bg-muted/50 transition-colors flex items-start pt-6"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          )}

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            <div className="max-w-[800px] mx-auto py-10 px-4 sm:px-6">
              {/* Page title label */}
              <span className="text-sm text-muted-foreground block mb-2">Page title</span>

              {/* Editable title */}
              <input
                type="text"
                value={pageTitle}
                onChange={(e) => {
                  if (e.target.value.length <= 350) {
                    onPageTitleChange(e.target.value);
                  }
                }}
                className="text-3xl font-bold text-foreground bg-transparent border-none outline-none w-full placeholder:text-muted-foreground/40"
                placeholder="Untitled page"
              />

              {/* Dotted separator */}
              <div className="border-t border-dashed border-border my-6" />

              {/* Content blocks with inline undo banners */}
              {(blocks.length > 0 || deletedBlocks.size > 0) ? (
                <TooltipProvider delayDuration={300}>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-1">
                        {(() => {
                          const elements: React.ReactNode[] = [];
                          const deletedArr = Array.from(deletedBlocks.entries()).sort((a, b) => a[1].index - b[1].index);
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
                                      <button
                                        onClick={() => undoDeleteBlock(deletedId)}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors not-italic ml-2"
                                      >
                                        <Undo2 className="w-3 h-3" />
                                        Undo
                                      </button>
                                    </p>
                                    <button
                                      onClick={() => dismissDeletedBlock(deletedId)}
                                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      Close
                                    </button>
                                  </div>
                                </div>
                              );
                              deletedIdx++;
                            } else if (blockIdx < blocks.length) {
                              const block = blocks[blockIdx];
                              const currentBlockIdx = blockIdx;
                              if (block.id === aiReviewBlockId) {
                                // Wrap content + review bar in a unified frame
                                elements.push(
                                  <div key={`ai-frame-${block.id}`} className="animate-fade-in rounded-xl border border-primary/20 bg-primary/[0.02] shadow-sm overflow-hidden">
                                    <div className="px-2 py-2">
                                      <ContentBlock
                                        id={block.id}
                                        type={block.type}
                                        content={block.content}
                                        onChange={(content) => updateBlock(block.id, content)}
                                        onDelete={() => deleteBlock(block.id)}
                                        onDuplicate={() => {}}
                                        autoFocus={false}
                                        aiEnabled={aiEnabled}
                                        readOnly
                                      />
                                    </div>
                                    <div className="border-t border-primary/10 bg-muted/20">
                                      {aiGenerating ? (
                                        <div className="flex items-center gap-3 px-4 py-3">
                                          <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                                          <span className="text-xs font-medium text-muted-foreground">Generating content…</span>
                                        </div>
                                      ) : aiReviewMode === "review" ? (
                                        <div className="flex items-center gap-3 px-4 py-2.5">
                                          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                                            <span>AI Generated</span>
                                          </div>
                                          <div className="h-4 w-px bg-border/60" />
                                          <div className="flex items-center gap-1.5 ml-auto">
                                            <Button
                                              size="sm"
                                              onClick={handleAiReviewAdd}
                                              className="h-7 gap-1.5 rounded-lg px-3 text-xs font-medium"
                                            >
                                              <Check className="w-3.5 h-3.5" />
                                              Accept
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => {
                                                setAiReviewMode("modify");
                                                setTimeout(() => modifyInputRef.current?.focus(), 100);
                                              }}
                                              className="h-7 gap-1.5 rounded-lg px-3 text-xs font-medium"
                                            >
                                              <Pencil className="w-3 h-3" />
                                              Modify
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={handleAiReviewCancel}
                                              className="h-7 rounded-lg px-2.5 text-xs font-medium text-muted-foreground hover:text-destructive"
                                            >
                                              <X className="w-3.5 h-3.5" />
                                              Discard
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="space-y-0">
                                          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/40">
                                            <button
                                              onClick={() => setAiReviewMode("review")}
                                              className="p-1 rounded-md hover:bg-background/80 transition-colors text-muted-foreground hover:text-foreground"
                                            >
                                              <ArrowLeft className="w-3.5 h-3.5" />
                                            </button>
                                            <span className="text-xs font-medium text-foreground">What do you want to modify?</span>
                                          </div>
                                          <div className="flex items-end gap-2 p-2">
                                            <div className="flex-1 rounded-lg bg-background border border-border/40 overflow-hidden focus-within:border-foreground/20 transition-colors">
                                              <textarea
                                                ref={modifyInputRef}
                                                value={modifyPrompt}
                                                onChange={(e) => {
                                                  setModifyPrompt(e.target.value);
                                                  e.target.style.height = 'auto';
                                                  e.target.style.height = e.target.scrollHeight + 'px';
                                                }}
                                                onKeyDown={(e) => {
                                                  if (e.key === "Enter" && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleAiModifySubmit();
                                                  }
                                                }}
                                                placeholder="e.g., Make it more concise, add examples..."
                                                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 resize-none px-3 py-2.5 focus:outline-none"
                                                rows={1}
                                              />
                                            </div>
                                            <Button
                                              size="icon"
                                              onClick={handleAiModifySubmit}
                                              disabled={!modifyPrompt.trim() || aiGenerating}
                                              className="h-9 w-9 rounded-lg shrink-0"
                                            >
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
                                  <ContentBlock
                                    key={block.id}
                                    id={block.id}
                                    type={block.type}
                                    content={block.content}
                                    onChange={(content) => updateBlock(block.id, content)}
                                    onDelete={() => deleteBlock(block.id)}
                                    onDuplicate={() => {}}
                                    autoFocus={block.id === lastAddedBlockId}
                                    aiEnabled={aiEnabled}
                                  />
                                );
                              }
                              if (blockIdx < blocks.length - 1) {
                                elements.push(
                                  <AddContentButton
                                    key={`add-${block.id}`}
                                    variant="full"
                                    aiEnabled={aiEnabled}
                                    onAddText={() => addBlock("text", currentBlockIdx + 1)}
                                    onAddImage={() => addBlock("image", currentBlockIdx + 1)}
                                    onAddVideo={() => addBlock("video", currentBlockIdx + 1)}
                                    onAddAudio={() => addBlock("audio", currentBlockIdx + 1)}
                                    onAddDoc={() => addBlock("doc", currentBlockIdx + 1)}
                                    onAddQuiz={() => addBlock("quiz", currentBlockIdx + 1)}
                                    onMore={() => { setSidebarCollapsed(false); setActiveTab("blocks"); }}
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
                                    Content was removed...{" "}
                                    <button
                                      onClick={() => undoDeleteBlock(deletedId)}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors not-italic ml-2"
                                    >
                                      <Undo2 className="w-3 h-3" />
                                      Undo
                                    </button>
                                  </p>
                                  <button
                                    onClick={() => dismissDeletedBlock(deletedId)}
                                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    Close
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

              {/* Content type toolbar - below blocks */}
              <div className={cn("flex items-center gap-2", blocks.length > 0 && "mt-6")}>
                <div className="rounded-2xl border border-border/60 bg-muted/20 backdrop-blur-sm px-2 sm:px-4 py-2 sm:py-2.5 flex flex-wrap items-center flex-1 justify-evenly gap-0.5 shadow-sm">
                  {aiEnabled && (
                    <button
                      onClick={() => {
                        setShowAiBlock(!showAiBlock);
                        if (!showAiBlock) {
                          setTimeout(() => aiPromptRef.current?.focus(), 150);
                        }
                      }}
                      className={cn(
                        "relative gap-1.5 sm:gap-2 text-xs sm:text-[13px] h-8 sm:h-9 rounded-full px-3 sm:px-4 flex items-center font-medium text-foreground/90 hover:bg-primary/5 transition-colors duration-200",
                        showAiBlock && "bg-primary/5"
                      )}
                    >
                      <span
                        className="absolute inset-0 rounded-full p-[1.5px]"
                        style={{
                          background: 'linear-gradient(135deg, hsl(217, 91%, 70%), hsl(280, 65%, 65%), hsl(217, 91%, 55%))',
                        }}
                      >
                        <span className="block w-full h-full rounded-full bg-background" />
                      </span>
                      <Sparkles className="w-3.5 sm:w-4 h-3.5 sm:h-4 relative" />
                      <span className="relative hidden sm:inline">Create with AI</span>
                      <span className="relative sm:hidden">AI</span>
                    </button>
                  )}
                  <Button variant="ghost" className="gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-[13px] h-8 sm:h-9 rounded-full hover:text-foreground hover:bg-foreground/5 px-2.5 sm:px-4 transition-all duration-200" onClick={() => addBlock("text")}>
                    <Type className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    <span className="hidden sm:inline">Text</span>
                  </Button>
                  <Button variant="ghost" className="gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-[13px] h-8 sm:h-9 rounded-full hover:text-foreground hover:bg-foreground/5 px-2.5 sm:px-4 transition-all duration-200" onClick={() => addBlock("image")}>
                    <ImageIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    <span className="hidden sm:inline">Image</span>
                  </Button>
                  <Button variant="ghost" className="gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-[13px] h-8 sm:h-9 rounded-full hover:text-foreground hover:bg-foreground/5 px-2.5 sm:px-4 transition-all duration-200" onClick={() => addBlock("video")}>
                    <Video className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    <span className="hidden sm:inline">Video</span>
                  </Button>
                  <Button variant="ghost" className="gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-[13px] h-8 sm:h-9 rounded-full hover:text-foreground hover:bg-foreground/5 px-2.5 sm:px-4 transition-all duration-200" onClick={() => addBlock("doc")}>
                    <DocIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    <span className="hidden sm:inline">Doc</span>
                  </Button>
                  <Button variant="ghost" className="gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-[13px] h-8 sm:h-9 rounded-full hover:text-foreground hover:bg-foreground/5 px-2.5 sm:px-4 transition-all duration-200" onClick={() => addBlock("quiz")}>
                    <MessageCircleQuestion className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    <span className="hidden sm:inline">Questions</span>
                  </Button>
                </div>
                <button
                  onClick={() => { setSidebarCollapsed(false); setActiveTab("blocks"); }}
                  className="rounded-2xl border border-dashed border-border/60 bg-muted/10 backdrop-blur-sm self-stretch px-3 sm:px-4 shadow-sm shrink-0 flex items-center gap-1.5 text-muted-foreground text-xs sm:text-[13px] hover:text-foreground hover:border-primary/30 hover:bg-muted/30 transition-all duration-200 cursor-pointer"
                >
                  <MoreHorizontal className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  <span className="hidden sm:inline">More</span>
                </button>
              </div>

              {/* AI Creation Block */}
              {showAiBlock && aiEnabled && (
                <div className="mt-4 rounded-xl border border-border bg-card shadow-sm animate-fade-in">
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">Create a content block with AI</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowAiBlock(false)}
                        className="p-1.5 rounded-md hover:bg-muted transition-colors"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                  <div className="px-5 py-3.5">
                    {aiGenerating ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-4 animate-fade-in rounded-xl bg-gradient-to-br from-[hsl(217,91%,60%)]/5 via-[hsl(270,70%,60%)]/5 to-[hsl(217,91%,60%)]/5">
                        <div className="relative w-12 h-12 flex items-center justify-center">
                          <Sparkles className="w-8 h-8 animate-sparkle-spin" fill="url(#sparkle-grad)" color="url(#sparkle-grad)" />
                          <Sparkles className="w-4 h-4 absolute -top-1 -left-1 animate-sparkle-float" fill="hsl(270,70%,60%)" color="hsl(270,70%,60%)" />
                          <Sparkles className="w-3.5 h-3.5 absolute -bottom-0.5 -right-1 animate-sparkle-orbit" fill="hsl(217,91%,60%)" color="hsl(217,91%,60%)" />
                          <svg width="0" height="0" className="absolute">
                            <defs>
                              <linearGradient id="sparkle-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="hsl(217,91%,60%)" />
                                <stop offset="100%" stopColor="hsl(270,70%,60%)" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                        <p className="text-sm font-semibold bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(270,70%,60%)] bg-clip-text text-transparent animate-pulse">Finding the best way to present it...</p>
                        <p className="text-xs text-[hsl(270,70%,60%)]/60">This may take a few minutes</p>
                      </div>
                    ) : (
                      <div className="flex items-end gap-2 rounded-2xl border border-border/80 bg-background px-4 py-2 focus-within:border-foreground/30 transition-colors">
                        <textarea
                          ref={aiPromptRef}
                          value={aiPrompt}
                          onChange={(e) => {
                            setAiPrompt(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey && aiPrompt.trim()) {
                              e.preventDefault();
                              handleAiGenerate(aiPrompt, aiBlockType);
                              setAiPrompt("");
                              e.currentTarget.style.height = 'auto';
                            }
                          }}
                          placeholder="Example: Create a comparison table for collaboration vs individual work"
                          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none resize-none min-h-[28px] max-h-[150px] py-1"
                          rows={1}
                        />
                        <button
                          onClick={() => {
                            if (aiPrompt.trim()) {
                              handleAiGenerate(aiPrompt, aiBlockType);
                              setAiPrompt("");
                              if (aiPromptRef.current) aiPromptRef.current.style.height = 'auto';
                            }
                          }}
                          disabled={!aiPrompt.trim()}
                          className={cn(
                            "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center transition-colors mb-0.5",
                            aiPrompt.trim()
                              ? "bg-primary text-primary-foreground hover:bg-primary/90"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  {!aiGenerating && <div className="px-5 pb-4">
                    <span className="text-xs text-muted-foreground block mb-2">Select content block</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAiBlockType(aiBlockType === "text" ? null : "text")}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all",
                          aiBlockType === "text"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                        )}
                      >
                        <Type className="w-4 h-4" />
                        Text
                      </button>
                      <button
                        onClick={() => setAiBlockType(aiBlockType === "image" ? null : "image")}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all",
                          aiBlockType === "image"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                        )}
                      >
                        <ImageIcon className="w-4 h-4" />
                        Image
                      </button>
                      <button
                        onClick={() => setShowQuizGenerateDialog(true)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all",
                          "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                        )}
                      >
                        <MessageCircleQuestion className="w-4 h-4" />
                        Quiz
                      </button>
                    </div>
                  </div>}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* AI Support Sheet - rendered outside Dialog to avoid Radix focus trap conflicts */}
    {aiEnabled && (
      <AIHeaderButton
        aiOptions={aiOptions}
        onOptionsChange={onAiOptionsChange}
        externalOpen={showAiSheet}
        onExternalOpenChange={(v) => {
          setShowAiSheet(v);
          if (!v) setAiSheetSection(null);
        }}
        scrollToSection={aiSheetSection}
      />
    )}

    <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete item</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this item? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => {
              if (deleteConfirmId) {
                handleDeletePage(deleteConfirmId);
                setDeleteConfirmId(null);
              }
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Rename Dialog */}
    <Dialog open={!!renameTarget} onOpenChange={(open) => { if (!open) setRenameTarget(null); }}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-muted-foreground" />
            Rename
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Enter a new name below.
          </DialogDescription>
        </DialogHeader>
        <div className="py-3">
          <Label htmlFor="rename-input" className="text-sm font-medium mb-2 block">Title</Label>
          <Input
            id="rename-input"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && renameTarget && renameValue.trim()) {
                onRenameItem?.(renameTarget.id, renameValue.trim());
                setRenameTarget(null);
              }
            }}
            placeholder="Enter title…"
            autoFocus
            maxLength={350}
            className="w-full"
          />
          <span className="text-xs text-muted-foreground mt-1.5 block text-right">{renameValue.length}/350</span>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setRenameTarget(null)}>Cancel</Button>
          <Button
            onClick={() => {
              if (renameTarget && renameValue.trim()) {
                onRenameItem?.(renameTarget.id, renameValue.trim());
                setRenameTarget(null);
              }
            }}
            disabled={!renameValue.trim()}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Generate Quiz Dialog */}
    <GenerateQuizDialog
      open={showQuizGenerateDialog}
      onClose={() => setShowQuizGenerateDialog(false)}
      onGenerate={handleQuizGenerate}
      isGenerating={isQuizGenerating}
    />
    </>
  );
}
