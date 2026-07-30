import { useState, useCallback, useRef, useEffect, ReactNode, lazy, Suspense } from "react";
import Lottie from "lottie-react";
import emptyOutlineAnimation from "@/assets/empty-outline.json";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, ChevronDown, Eye, Wand2, Plus, X, Undo2, LayoutGrid, FileText, HelpCircle, Layers, FileStack, Check, Sparkles, Image, Type, Download, MoreVertical, Copy, Trash2, Coins, TrendingUp, ArrowUpRight, ArrowDownRight, UsersRound, ShieldCheck, CaseSensitive, Palette, CopyPlus, Sliders } from "lucide-react";
import { CollaboratorsDrawer } from "@/components/EditCourse/CollaboratorsDrawer";
import { FinishReviewDialog } from "@/components/EditCourse/FinishReviewDialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CloneCourseDialog } from "@/components/EditCourse/CloneCourseDialog";
import { DeleteCourseDialog } from "@/components/EditCourse/DeleteCourseDialog";
import { GuidedTour, type TourStep } from "@/components/GuidedTour/GuidedTour";
import type { AIOptions } from "@/components/Dashboard/AIOptionsPanel";
import { PageEditorDialog } from "./PageEditorDialog";
import { CourseBrandingLogo } from "./CourseBrandingLogo";
import { useCourseContentBackgroundStyle } from "@/services/contentBackgrounds";
import { AIHeaderButton } from "./AIHeaderButton";
import {
  DndContext,
  closestCenter,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ContentBlock } from "./ContentBlock";
import { DescriptionBlock } from "./DescriptionBlock";
import { BlockCommentIndicator } from "@/components/EditCourse/BlockCommentIndicator";
import { AddContentButton } from "./AddContentButton";
import { resolveTemplateDropData } from "./ContentBlocksPanel";
import { DropIndicator } from "./DropIndicator";
import { SectionCard } from "./SectionCard";
import { PageItemCard } from "./PageItemCard";
import { LayoutSelectorDropdown, type LayoutTransferState } from "./LayoutSelectorDropdown";
import { FontSelectorDropdown, DEFAULT_FONT_ID, getFontStack, FONT_OPTIONS } from "./FontSelectorDropdown";
import { GenerateExportDialog } from "./GenerateExportDialog";
import { TokenConsumptionDialog } from "@/components/EditCourse/TokenConsumptionDialog";
import { ScormPreferencesDialog, ScormPreferencesContent } from "@/components/EditCourse/ScormPreferencesDialog";
import { OutlineItemSkeleton } from "./OutlineItemSkeleton";
import { CourseStatusMenu } from "@/components/Course/CourseStatusMenu";
import { CourseStatusBadge } from "@/components/Course/CourseStatusBadge";
import { CopyContentDialog } from "./CopyContentDialog";

interface CourseItem {
  id: string;
  type: "section" | "page" | "question";
  title: string;
  inclusions?: string;
  exclusions?: string;
  thumbnailUrl?: string;
  children?: CourseItem[];
}

interface ContentBlockData {
  id: string;
  type: "text" | "image" | "description" | "video" | "audio" | "doc" | "quiz" | "image-description" | "video-description" | "hotspot" | "tabs" | "flashcards";
  content: string;
  variant?: string;
  font?: string;
  aiGenerated?: boolean;
}

interface PageContentBlockData {
  id: string;
  type: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description" | "video-description" | "hotspot" | "tabs" | "flashcards";
  content: string;
  variant?: string;
  font?: string;
  aiGenerated?: boolean;
}

export interface MultiPageCourseCreatorRestoreState {
  title: string;
  items: CourseItem[];
  contentBlocks: ContentBlockData[];
  pageBlocksMap: Record<string, PageContentBlockData[]>;
  sectionObjectivesMap: Record<string, string>;
  activeEditorPageId: string | null;
  aiOptions: AIOptions | null;
}

interface MultiPageCourseCreatorProps {
  courseTitle: string;
  aiOptions?: AIOptions | null;
  initialRestoreState?: MultiPageCourseCreatorRestoreState | null;
  readOnly?: boolean;
}

interface DeletedBlock {
  block: ContentBlockData;
  index: number;
}

function SortableOutlineItem({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: transition ?? 'transform 250ms cubic-bezier(0.25, 1, 0.5, 1)',
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
    position: 'relative' as const,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

function TopLevelEndDropZone() {
  const { setNodeRef, isOver } = useDroppable({ id: "outline-top-end-drop" });
  return (
    <div
      ref={setNodeRef}
      role="region"
      aria-label="Drop here to make this a standalone page"
      className={cn(
        "mt-2 rounded-xl border-2 border-dashed transition-colors",
        isOver
          ? "border-primary bg-primary/10"
          : "border-border/40 bg-muted/20"
      )}
    >
      <div className="py-5 px-4 text-center text-xs font-medium text-muted-foreground">
        {isOver ? "Release to make a standalone page" : "Drop here to pull out of section"}
      </div>
    </div>
  );
}

function OutlineGapDropZone({ index }: { index: number }) {
  const { setNodeRef, isOver } = useDroppable({ id: `outline-top-gap-${index}` });
  return (
    <div
      ref={setNodeRef}
      role="region"
      aria-label="Drop here to place as a standalone page"
      className={cn(
        "rounded-lg border border-dashed transition-all my-1.5",
        isOver
          ? "border-primary bg-primary/10 h-12"
          : "border-border/40 bg-muted/10 h-6"
      )}
    >
      <div className={cn(
        "h-full flex items-center justify-center text-[11px] font-medium transition-colors",
        isOver ? "text-primary" : "text-muted-foreground/70"
      )}>
        {isOver ? "Release to place here as standalone page" : "Drop here for standalone"}
      </div>
    </div>
  );
}




export function MultiPageCourseCreator({ courseTitle, aiOptions: initialAIOptions = null, initialRestoreState = null, readOnly = false }: MultiPageCourseCreatorProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeCourseId, courseId: routeCourseIdAlt } = useParams<{ id?: string; courseId?: string }>();
  const courseId = routeCourseIdAlt ?? routeCourseId ?? "draft";
  const contentBgStyle = useCourseContentBackgroundStyle(courseId);
  // Show More menu on the edit-course route, OR on any creator route when an existing
  // course is being loaded (initialRestoreState present). Hide for brand-new blank courses.
  const isEditCoursePage =
    location.pathname.startsWith("/edit-course") || initialRestoreState != null;
  const isSharedCourse = new URLSearchParams(location.search).get("shared") === "1";
  const { toast } = useToast();
  const [title, setTitle] = useState(initialRestoreState?.title ?? courseTitle);
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const [showFinishReviewDialog, setShowFinishReviewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTour, setShowTour] = useState(() => {
    if (initialRestoreState) return false;
    return !sessionStorage.getItem("multipage-tour-dismissed");
  });
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showCopyContentDialog, setShowCopyContentDialog] = useState(false);
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [scormOpen, setScormOpen] = useState(false);
  const [showCollaboratorsDrawer, setShowCollaboratorsDrawer] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [contentBlocks, setContentBlocks] = useState<ContentBlockData[]>(
    initialRestoreState?.contentBlocks ?? [
      { id: "description-block", type: "description", content: "" },
    ],
  );
  const [items, setItems] = useState<CourseItem[]>(initialRestoreState?.items ?? []);
  const [aiOptions, setAIOptions] = useState<AIOptions | null>(initialRestoreState?.aiOptions ?? initialAIOptions);
  const [fontId, setFontId] = useState<string>(DEFAULT_FONT_ID);
  const [deletedBlocks, setDeletedBlocks] = useState<Map<string, DeletedBlock>>(new Map());
  const [activeEditorPageId, setActiveEditorPageId] = useState<string | null>(initialRestoreState?.activeEditorPageId ?? null);
  const [pageBlocksMap, setPageBlocksMap] = useState<Record<string, PageContentBlockData[]>>(initialRestoreState?.pageBlocksMap ?? {});
  const [sectionObjectivesMap, setSectionObjectivesMap] = useState<Record<string, string>>(initialRestoreState?.sectionObjectivesMap ?? {});
  const deleteTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Outline-item lazy-loader transitions (visual feedback for page/section CRUD).
  // - pendingTopAdds:  IDs marking placeholder rows appended at the bottom of the top-level outline
  //                    while a fresh page/section is being created.
  // - pendingChildAdds: per-section list of placeholder IDs for nested page additions.
  // - duplicatingIds:  IDs that should render a duplicate-skeleton directly under the source.
  // - deletingIds:     IDs whose card should be replaced by a "removing" skeleton during the brief
  //                    delay before the actual removal commits.
  const [pendingTopAdds, setPendingTopAdds] = useState<{ id: string; kind: "section" | "page" }[]>([]);
  const [pendingChildAdds, setPendingChildAdds] = useState<Record<string, string[]>>({});
  const [duplicatingIds, setDuplicatingIds] = useState<Map<string, "section" | "page">>(new Map());
  const [deletingIds, setDeletingIds] = useState<Map<string, "section" | "page">>(new Map());
  const SKELETON_DELAY = 500;

  const tourSteps: TourStep[] = [
    {
      target: "layout-selector",
      icon: <Layers className="w-5 h-5 text-muted-foreground" aria-hidden="true" focusable="false" />,
      title: "Layout Selection",
      description: "Preview different layouts to see how your course adapts.",
      placement: "bottom",
    },
    {
      target: "text-toolbar",
      icon: <Image className="w-5 h-5 text-muted-foreground" aria-hidden="true" focusable="false" />,
      title: "Course Heading Text Toolbar",
      description: "Make your text stand out with formatting tools.",
      placement: "bottom",
    },
    {
      target: "add-item",
      icon: <Plus className="w-5 h-5 text-muted-foreground" aria-hidden="true" focusable="false" />,
      title: "Add Item",
      description: "Add Sections & Pages. Sections organize your course, but pages can stand alone or sit inside sections — giving you full flexibility.",
      placement: "bottom",
    },
    {
      target: "header-actions",
      icon: <Sparkles className="w-5 h-5 text-muted-foreground" aria-hidden="true" focusable="false" />,
      title: "AI Support, Preview & Publish",
      description: "AI Support improves your course, Preview shows it, Publish shares it.",
      placement: "bottom",
    },
  ];

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [editorDragOver, setEditorDragOver] = useState(false);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [isSidebarDragging, setIsSidebarDragging] = useState(false);
  const [activeOutlineId, setActiveOutlineId] = useState<string | null>(null);

  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const outlineSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // --- Outline tree drag helpers (cross-container page moves) ---
  type ItemLoc =
    | { kind: "section"; container: "top"; index: number }
    | { kind: "page"; container: "top" | string; index: number };

  const findLoc = (list: CourseItem[], id: string): ItemLoc | null => {
    const topIdx = list.findIndex((i) => i.id === id);
    if (topIdx >= 0) {
      const it = list[topIdx];
      return { kind: it.type === "section" ? "section" : "page", container: "top", index: topIdx } as ItemLoc;
    }
    for (const it of list) {
      if (it.type === "section" && it.children) {
        const ci = it.children.findIndex((c) => c.id === id);
        if (ci >= 0) return { kind: "page", container: it.id, index: ci };
      }
    }
    return null;
  };

  const movePage = (
    list: CourseItem[],
    from: ItemLoc,
    toContainer: "top" | string,
    toIndex?: number,
  ): CourseItem[] => {
    let moved: CourseItem | null = null;
    let next: CourseItem[] = list;
    if (from.container === "top") {
      moved = list[from.index];
      next = list.filter((_, i) => i !== from.index);
    } else {
      next = list.map((it) => {
        if (it.id === from.container && it.children) {
          moved = it.children[from.index];
          return { ...it, children: it.children.filter((_, i) => i !== from.index) };
        }
        return it;
      });
    }
    if (!moved) return list;
    const pageNode: CourseItem = { ...moved, type: "page", children: undefined };

    if (toContainer === "top") {
      const idx = toIndex ?? next.length;
      const out = [...next];
      out.splice(idx, 0, pageNode);
      return out;
    }
    return next.map((it) => {
      if (it.id === toContainer) {
        const children = it.children ? [...it.children] : [];
        const idx = toIndex ?? children.length;
        children.splice(idx, 0, pageNode);
        return { ...it, children };
      }
      return it;
    });
  };

  const resolveOverTarget = (
    list: CourseItem[],
    overId: string,
  ): { container: "top" | string; index?: number } | null => {
    if (overId === "outline-top-end-drop") {
      return { container: "top" };
    }
    if (overId.startsWith("outline-top-gap-")) {
      const idx = parseInt(overId.slice("outline-top-gap-".length), 10);
      return { container: "top", index: Number.isFinite(idx) ? idx : undefined };
    }
    if (overId.startsWith("section-drop:")) {
      return { container: overId.slice("section-drop:".length) };
    }
    const loc = findLoc(list, overId);
    if (!loc) return null;
    return { container: loc.container, index: loc.index };
  };


  const handleOutlineDragStart = useCallback((event: DragStartEvent) => {
    setActiveOutlineId(String(event.active.id));
  }, []);

  const handleOutlineDragCancel = useCallback(() => {
    setActiveOutlineId(null);
  }, []);

  const handleOutlineDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    setItems((prev) => {
      const activeLoc = findLoc(prev, activeId);
      if (!activeLoc || activeLoc.kind === "section") return prev;
      const target = resolveOverTarget(prev, overId);
      if (!target) return prev;
      if (target.container === activeLoc.container) return prev;
      return movePage(prev, activeLoc, target.container, target.index);
    });
  }, []);

  const handleOutlineDragEnd = useCallback((event: DragEndEvent) => {
    setActiveOutlineId(null);
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    setItems((prev) => {
      const activeLoc = findLoc(prev, activeId);
      if (!activeLoc) return prev;

      if (activeLoc.kind === "section") {
        const overLoc = findLoc(prev, overId);
        if (!overLoc || overLoc.container !== "top") return prev;
        return arrayMove(prev, activeLoc.index, overLoc.index);
      }

      let targetContainer: "top" | string;
      let targetIndex: number;
      if (overId === "outline-top-end-drop") {
        targetContainer = "top";
        targetIndex = prev.length;
      } else if (overId.startsWith("outline-top-gap-")) {
        const idx = parseInt(overId.slice("outline-top-gap-".length), 10);
        targetContainer = "top";
        targetIndex = Number.isFinite(idx) ? Math.min(idx, prev.length) : prev.length;
      } else if (overId.startsWith("section-drop:")) {
        targetContainer = overId.slice("section-drop:".length);
        const sec = prev.find((i) => i.id === targetContainer);
        targetIndex = sec?.children?.length ?? 0;
      } else {
        const overLoc = findLoc(prev, overId);
        if (!overLoc) return prev;
        targetContainer = overLoc.container;
        targetIndex = overLoc.index;
      }

      if (targetContainer === activeLoc.container) {
        if (targetContainer === "top") {
          return arrayMove(prev, activeLoc.index, targetIndex);
        }
        return prev.map((item) => {
          if (item.id === targetContainer && item.children) {
            return { ...item, children: arrayMove(item.children, activeLoc.index, targetIndex) };
          }
          return item;
        });
      }

      return movePage(prev, activeLoc, targetContainer, targetIndex);
    });
  }, []);

  // True when the user is currently dragging a child page (one nested inside a section).
  const isDraggingChildPage = (() => {
    if (!activeOutlineId) return false;
    for (const it of items) {
      if (it.type === "section" && it.children?.some((c) => c.id === activeOutlineId)) return true;
    }
    return false;
  })();




  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverId(event.over?.id as string | null);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);
    if (over && active.id !== over.id) {
      setContentBlocks((prev) => {
        const oldIndex = prev.findIndex((b) => b.id === active.id);
        const newIndex = prev.findIndex((b) => b.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setOverId(null);
  }, []);

  const addTextBlock = useCallback((insertAt?: number) => {
    const newBlock: ContentBlockData = {
      id: `block-${Date.now()}`,
      type: "text",
      content: "",
    };
    setContentBlocks((prev) => {
      if (insertAt !== undefined) {
        const next = [...prev];
        next.splice(insertAt, 0, newBlock);
        return next;
      }
      return [...prev, newBlock];
    });
  }, []);

  const addImageBlock = useCallback((insertAt?: number) => {
    const newBlock: ContentBlockData = {
      id: `block-${Date.now()}`,
      type: "image",
      content: "",
    };
    setContentBlocks((prev) => {
      if (insertAt !== undefined) {
        const next = [...prev];
        next.splice(insertAt, 0, newBlock);
        return next;
      }
      return [...prev, newBlock];
    });
  }, []);

  const addGenericBlock = useCallback((type: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description" | "video-description" | "hotspot" | "tabs" | "flashcards", insertAt?: number, variant?: string) => {
    const id = `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    let content = "";
    let blockType: ContentBlockData["type"] = type as ContentBlockData["type"];
    if (type === "video-description") {
      content = JSON.stringify({ layout: variant === "video-right" ? "video-right" : "video-left", videoUrl: "", description: "" });
    } else if (type === "text") {
      content = "";
    }
    const newBlock: ContentBlockData = { id, type: blockType, content };
    setContentBlocks((prev) => {
      if (insertAt !== undefined) {
        const next = [...prev];
        next.splice(insertAt, 0, newBlock);
        return next;
      }
      return [...prev, newBlock];
    });
  }, []);

  const aiGenerateText = useCallback((prompt: string, insertAt?: number) => {
    const id = `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const content = `<h3>${prompt}</h3><p>Based on your prompt, here is an AI-generated overview of the topic. This section covers the key concepts and practical applications that learners need to understand. The content has been structured to facilitate progressive learning and knowledge retention.</p><p>Key takeaways include understanding the fundamental principles, recognizing common patterns, and applying best practices in real-world scenarios.</p>`;
    const newBlock: ContentBlockData = { id, type: "text", content };
    setContentBlocks((prev) => {
      if (insertAt !== undefined) {
        const next = [...prev];
        next.splice(insertAt, 0, newBlock);
        return next;
      }
      return [...prev, newBlock];
    });
  }, []);

  const aiGenerateImage = useCallback((prompt: string, insertAt?: number) => {
    const id = `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const content = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=400&fit=crop";
    const newBlock: ContentBlockData = { id, type: "image", content };
    setContentBlocks((prev) => {
      if (insertAt !== undefined) {
        const next = [...prev];
        next.splice(insertAt, 0, newBlock);
        return next;
      }
      return [...prev, newBlock];
    });
  }, []);

  const updateBlockContent = (id: string, content: string) => {
    setContentBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, content } : b))
    );
  };

  const updateBlockFont = (id: string, fontIdValue: string | undefined) => {
    setContentBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, font: fontIdValue } : b))
    );
  };

  const updateBlockType = (id: string, newType: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description" | "video-description" | "hotspot" | "tabs" | "flashcards", newContent: string, newVariant?: string) => {
    setContentBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, type: newType, content: newContent, variant: newVariant } : b))
    );
  };

  const deleteBlock = (id: string) => {
    // Description block can't be removed, only cleared
    if (id === "description-block") {
      setContentBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, content: "" } : b))
      );
      return;
    }

    const idx = contentBlocks.findIndex((b) => b.id === id);
    if (idx === -1) return;
    const block = contentBlocks[idx];
    
    // Store deleted block for undo
    setDeletedBlocks((prev) => {
      const next = new Map(prev);
      next.set(id, { block, index: idx });
      return next;
    });

    // Remove from content
    setContentBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const undoDelete = (id: string) => {
    const deleted = deletedBlocks.get(id);
    if (!deleted) return;

    // Clear timer
    const timer = deleteTimers.current.get(id);
    if (timer) clearTimeout(timer);
    deleteTimers.current.delete(id);

    // Restore block at original position
    setContentBlocks((prev) => {
      const next = [...prev];
      const insertAt = Math.min(deleted.index, next.length);
      next.splice(insertAt, 0, deleted.block);
      return next;
    });

    // Remove from deleted map
    setDeletedBlocks((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  };

  const dismissDeletedBlock = (id: string) => {
    const timer = deleteTimers.current.get(id);
    if (timer) clearTimeout(timer);
    deleteTimers.current.delete(id);
    setDeletedBlocks((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  };

  const duplicateBlock = (id: string) => {
    setContentBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const original = prev[idx];
      const clone = { ...original, id: `block-${Date.now()}` };
      const next = [...prev];
      next.splice(idx + 1, 0, clone);
      
      toast({
        title: "Block duplicated",
        description: `Content block has been duplicated successfully.`,
      });
      
      return next;
    });
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleAddItem = (type: "section" | "page" | "question") => {
    // Show a placeholder skeleton at the bottom of the outline before the real item commits.
    if (type === "section" || type === "page") {
      const placeholderId = `pending-${type}-${Date.now()}`;
      setPendingTopAdds((prev) => [...prev, { id: placeholderId, kind: type }]);
      window.setTimeout(() => {
        const newItem: CourseItem = {
          id: `${type}-${Date.now()}`,
          type,
          title: type === "section" ? "Untitled section" : "",
        };
        setItems((prev) => [...prev, newItem]);
        setPendingTopAdds((prev) => prev.filter((p) => p.id !== placeholderId));
      }, SKELETON_DELAY);
      return;
    }
    const newItem: CourseItem = {
      id: `${type}-${Date.now()}`,
      type,
      title: "New Question",
    };
    setItems([...items, newItem]);
  };

  const updateItemTitle = (id: string, newTitle: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) return { ...item, title: newTitle };
        if (item.children) {
          const updatedChildren = item.children.map((c) => c.id === id ? { ...c, title: newTitle } : c);
          if (updatedChildren !== item.children) return { ...item, children: updatedChildren };
        }
        return item;
      })
    );
  };

  const updateItemInclusions = (id: string, inclusions: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, inclusions } : item))
    );
  };

  const updateItemExclusions = (id: string, exclusions: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, exclusions } : item))
    );
  };

  // Internal helper that performs the actual removal of an item by id (top-level or nested).
  const removeItemById = useCallback((id: string) => {
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
  }, []);

  const deleteItem = (id: string) => {
    // Determine type for the skeleton variant.
    let kind: "section" | "page" = "page";
    const top = items.find((i) => i.id === id);
    if (top) kind = top.type === "section" ? "section" : "page";
    else {
      for (const it of items) {
        if (it.children?.some((c) => c.id === id)) { kind = "page"; break; }
      }
    }
    setDeletingIds((m) => {
      const next = new Map(m);
      next.set(id, kind);
      return next;
    });
    window.setTimeout(() => {
      removeItemById(id);
      setDeletingIds((m) => {
        const next = new Map(m);
        next.delete(id);
        return next;
      });
    }, SKELETON_DELAY);
  };

  // Internal: actually clones the item. The public `duplicateItem` wraps this with
  // a brief skeleton placeholder so users see lazy-loader feedback at the destination.
  const performDuplicate = useCallback((id: string) => {
    setItems((prev) => {
      // Search top-level
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
          description: `"${original.title || `Untitled ${original.type}`}" has been duplicated successfully.`,
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
        toast({
          title: "Page duplicated",
          description: `"${original.title || "Untitled page"}" has been duplicated successfully.`,
        });
        return { ...item, children: newChildren };
      });
    });
  }, [pageBlocksMap, toast]);

  const duplicateItem = (id: string) => {
    // Determine type for skeleton variant.
    let kind: "section" | "page" = "page";
    const top = items.find((i) => i.id === id);
    if (top) kind = top.type === "section" ? "section" : "page";
    setDuplicatingIds((m) => {
      const next = new Map(m);
      next.set(id, kind);
      return next;
    });
    window.setTimeout(() => {
      performDuplicate(id);
      setDuplicatingIds((m) => {
        const next = new Map(m);
        next.delete(id);
        return next;
      });
    }, SKELETON_DELAY);
  };

  const updatePageBlocks = useCallback((pageId: string, blocks: PageContentBlockData[]) => {
    setPageBlocksMap((prev) => ({ ...prev, [pageId]: blocks }));
  }, []);

  const addPageToSection = (sectionId: string) => {
    const placeholderId = `pending-page-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setPendingChildAdds((prev) => ({
      ...prev,
      [sectionId]: [...(prev[sectionId] || []), placeholderId],
    }));
    window.setTimeout(() => {
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
      setPendingChildAdds((prev) => {
        const next = { ...prev };
        next[sectionId] = (next[sectionId] || []).filter((p) => p !== placeholderId);
        if (next[sectionId].length === 0) delete next[sectionId];
        return next;
      });
    }, SKELETON_DELAY);
  };

  // Find a page item by id (top-level or nested in sections)
  const findPageItem = (pageId: string): CourseItem | null => {
    for (const item of items) {
      if (item.id === pageId) return item;
      if (item.children) {
        const child = item.children.find((c) => c.id === pageId);
        if (child) return child;
      }
    }
    return null;
  };

  const navigateToPage = (pageId: string) => {
    const page = findPageItem(pageId);
    if (page) {
      setActiveEditorPageId(pageId);
    }
  };

  // ── Comment navigation: jump to a specific commented block from any chip ──
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ blockId: string }>).detail;
      const blockId = detail?.blockId;
      if (!blockId) return;

      // Section-level chip → close any open page editor, scroll to section card.
      if (blockId.startsWith("section:")) {
        setActiveEditorPageId(null);
        setTimeout(() => {
          import("@/lib/commentNavigation").then(({ scrollToCommentAnchor }) =>
            scrollToCommentAnchor(blockId),
          );
        }, 50);
        return;
      }

      // Page-level chip → open that page in the editor dialog.
      if (blockId.startsWith("page:")) {
        const pageId = blockId.slice("page:".length);
        const page = findPageItem(pageId);
        if (page) {
          setActiveEditorPageId(pageId);
        } else {
          setActiveEditorPageId(null);
          setTimeout(() => {
            import("@/lib/commentNavigation").then(({ scrollToCommentAnchor }) =>
              scrollToCommentAnchor(blockId),
            );
          }, 50);
        }
        return;
      }

      // Block-level: find the page that owns this block.
      const ownerPageId = Object.entries(pageBlocksMap).find(([, blocks]) =>
        blocks.some((b) => b.id === blockId),
      )?.[0];

      if (ownerPageId) {
        setActiveEditorPageId(ownerPageId);
        // Scroll once the editor dialog has mounted the target block.
        setTimeout(() => {
          import("@/lib/commentNavigation").then(({ scrollToCommentAnchor }) =>
            scrollToCommentAnchor(blockId),
          );
        }, 350);
        return;
      }

      // Fallback: top-level (single-page) content block visible on the main canvas.
      setActiveEditorPageId(null);
      setTimeout(() => {
        import("@/lib/commentNavigation").then(({ scrollToCommentAnchor }) =>
          scrollToCommentAnchor(blockId),
        );
      }, 50);
    };
    window.addEventListener("review-comments:navigate", handler);
    return () => window.removeEventListener("review-comments:navigate", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageBlocksMap, items]);

  const handlePreview = useCallback((initialPageId?: string | null) => {
    const returnState: MultiPageCourseCreatorRestoreState = {
      title,
      items,
      contentBlocks,
      pageBlocksMap,
      sectionObjectivesMap,
      activeEditorPageId,
      aiOptions,
    };

    navigate("/multipage-preview", {
      state: {
        title,
        items,
        contentBlocks,
        pageBlocksMap,
        returnState,
        initialPageId: initialPageId || null,
        fontId,
        courseId,
        origin: window.location.pathname,
      },
    });
  }, [navigate, title, items, contentBlocks, pageBlocksMap, sectionObjectivesMap, activeEditorPageId, aiOptions, fontId]);

  return (
    <div className="min-h-screen bg-background" data-review-mode={readOnly ? "true" : undefined}>
      {/* Skip to main content */}
      <a href="#course-main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md">
        Skip to main content
      </a>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="banner">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" aria-hidden="true" focusable="false" />
            </button>

            <div className="flex items-center gap-3 min-w-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-base font-semibold text-foreground truncate max-w-[180px] sm:max-w-[250px] lg:max-w-[350px] cursor-default">
                    {title.length > 40 ? `${title.slice(0, 40)}...` : title}
                  </span>
                </TooltipTrigger>
                {title.length > 40 && (
                  <TooltipContent side="bottom" className="max-w-[300px] text-sm">
                    {title}
                  </TooltipContent>
                )}
              </Tooltip>
              {!readOnly && <span className="text-muted-foreground select-none" aria-hidden="true">|</span>}
              {!readOnly && (
                <LayoutSelectorDropdown currentLayout="multi-page" title={title} aiOptions={aiOptions} transferState={{
                  title,
                  items: items as LayoutTransferState["items"],
                  contentBlocks,
                  pageBlocksMap,
                  sectionObjectivesMap,
                  sectionImages: Object.fromEntries(
                    items.filter(i => i.type === "section" && i.thumbnailUrl).map(i => [i.id, i.thumbnailUrl!])
                  ),
                  aiOptions,
                }} />
              )}
              {readOnly && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-1 text-[11px] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                  Reviewer · view only
                </span>
              )}
              {readOnly && isEditCoursePage && (
                <CourseStatusBadge courseId={courseId} size="sm" />
              )}
              {!readOnly && isEditCoursePage && (
                <CourseStatusMenu courseId={courseId} />
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3" data-tour="header-actions">
            {readOnly && (
              <Button
                className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700 gap-2"
                onClick={() => setShowFinishReviewDialog(true)}
              >
                <Check className="w-4 h-4" aria-hidden="true" focusable="false" />
                Finish review
              </Button>
            )}
            {!readOnly && isEditCoursePage && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full border-border"
                    onClick={() => setShowCollaboratorsDrawer(true)}
                    aria-label="Collaborators"
                  >
                    <UsersRound className="w-4 h-4" aria-hidden="true" focusable="false" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Collaborators</TooltipContent>
              </Tooltip>
            )}
            {!readOnly && <AIHeaderButton aiOptions={aiOptions} onOptionsChange={setAIOptions} />}
             <Tooltip>
               <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full border-border"
                    onClick={() => handlePreview()}
                    aria-label="Preview course"
                  >
                    <Eye className="w-4 h-4" aria-hidden="true" focusable="false" />
                  </Button>
               </TooltipTrigger>
               <TooltipContent>Preview</TooltipContent>
              </Tooltip>
             {!readOnly && isEditCoursePage && (
               <DropdownMenu>
                 <Tooltip>
                   <TooltipTrigger asChild>
                     <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full border-border"
                          aria-label="More course actions"
                        >
                          <MoreVertical className="w-4 h-4" aria-hidden="true" focusable="false" />
                        </Button>
                     </DropdownMenuTrigger>
                   </TooltipTrigger>
                   <TooltipContent>More</TooltipContent>
                 </Tooltip>
                  <DropdownMenuContent align="end" className="w-52">
                   <DropdownMenuItem onClick={() => setShowCloneDialog(true)} className="gap-2 cursor-pointer">
                     <Copy className="w-4 h-4" aria-hidden="true" focusable="false" />
                     Clone course
                   </DropdownMenuItem>
                   <DropdownMenuSub>
                     <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
                       <CaseSensitive className="w-4 h-4" aria-hidden="true" focusable="false" />
                       Change font ({(FONT_OPTIONS.find((f) => f.id === fontId) ?? FONT_OPTIONS[0]).label})
                     </DropdownMenuSubTrigger>
                     <DropdownMenuPortal>
                       <DropdownMenuSubContent className="w-56">
                         {FONT_OPTIONS.map((font) => {
                           const isActive = font.id === fontId;
                           return (
                             <DropdownMenuItem
                               key={font.id}
                               onClick={() => {
                                 if (font.id !== fontId) {
                                   setFontId(font.id);
                                   toast({
                                     title: "Course font updated",
                                     description: "Your course-level font style has been updated. Text blocks with custom font styles were not modified.",
                                   });
                                 }
                               }}
                               className="cursor-pointer flex items-center justify-between gap-2"
                               style={{ fontFamily: font.stack }}
                             >
                               <span className="text-sm">{font.label}</span>
                               {isActive && <Check className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />}
                             </DropdownMenuItem>
                           );
                         })}
                       </DropdownMenuSubContent>
                     </DropdownMenuPortal>
                   </DropdownMenuSub>
                    <DropdownMenuItem onClick={() => navigate(`/edit-course/${courseId}/branding`)} className="gap-2 cursor-pointer">
                      <Palette className="w-4 h-4" aria-hidden="true" focusable="false" />
                      Branding
                    </DropdownMenuItem>
                   {!isSharedCourse && (
                     <DropdownMenuItem
                       onClick={() => setShowDeleteDialog(true)}
                       className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                     >
                       <Trash2 className="w-4 h-4" aria-hidden="true" focusable="false" />
                       Delete course
                     </DropdownMenuItem>
                   )}
                 </DropdownMenuContent>
               </DropdownMenu>
             )}
             {!readOnly && isEditCoursePage && (
               <span
                 aria-hidden="true"
                 className="hidden sm:block h-7 w-px bg-gradient-to-b from-transparent via-border to-transparent mx-1"
               />
             )}
             {!readOnly && (
               <Button
                 variant="outline"
                 className="rounded-full border-primary text-primary hover:bg-primary/5 gap-2"
                 onClick={() => setShowExportDialog(true)}
               >
                 <Download className="w-4 h-4" />
                 <span className="hidden sm:inline">Export</span>
               </Button>
             )}
               {isEditCoursePage ? (
                 <Popover>
                   <Tooltip>
                     <TooltipTrigger asChild>
                       <PopoverTrigger asChild>
                         <Button
                           variant="outline"
                           size="icon"
                           className="rounded-full border-primary text-primary hover:bg-primary/5"
                           aria-label="View token usage"
                         >
                           <Coins className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
                         </Button>
                       </PopoverTrigger>
                     </TooltipTrigger>
                     <TooltipContent>Token usage</TooltipContent>
                   </Tooltip>
                   <PopoverContent
                     align="end"
                     sideOffset={10}
                     className="w-[340px] p-0 overflow-hidden rounded-2xl border border-border/70 shadow-xl"
                   >
                     {/* Header */}
                     <div className="relative px-5 pt-5 pb-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
                       <div className="flex items-start justify-between">
                         <div className="flex items-center gap-2.5">
                           <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                             <Coins className="w-4.5 h-4.5 text-primary" aria-hidden="true" focusable="false" />
                           </div>
                           <div>
                             <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Token Usage</p>
                             <p className="text-sm font-semibold text-foreground leading-tight">This course</p>
                           </div>
                         </div>
                       </div>

                       {/* Total */}
                       <div className="mt-4">
                         <div className="flex items-baseline gap-1.5">
                           <span className="text-[28px] font-bold text-foreground tabular-nums leading-none">40,444</span>
                           <span className="text-xs font-medium text-muted-foreground">tokens</span>
                         </div>
                         <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                           <div className="h-full w-[42%] rounded-full bg-gradient-to-r from-primary to-[hsl(var(--primary)/0.6)]" />
                         </div>
                         <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                           <span>42% of monthly quota</span>
                           <span className="tabular-nums">96,000 left</span>
                         </div>
                       </div>
                     </div>

                     {/* Breakdown */}
                     <div className="px-5 py-4 space-y-2.5 border-t border-border/60">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
                             <ArrowDownRight className="w-3.5 h-3.5 text-accent-foreground" aria-hidden="true" focusable="false" />
                           </div>
                           <div>
                             <p className="text-xs font-medium text-foreground">Input</p>
                             <p className="text-[10px] text-muted-foreground">Prompts & context</p>
                           </div>
                         </div>
                         <span className="text-sm font-semibold text-foreground tabular-nums">17,716</span>
                       </div>
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                             <ArrowUpRight className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
                           </div>
                           <div>
                             <p className="text-xs font-medium text-foreground">Output</p>
                             <p className="text-[10px] text-muted-foreground">Generated content</p>
                           </div>
                         </div>
                         <span className="text-sm font-semibold text-foreground tabular-nums">22,728</span>
                       </div>
                     </div>

                     {/* Footer action */}
                     <div className="px-5 py-3 border-t border-border/60 bg-muted/30 flex items-center justify-between">
                       <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                         <TrendingUp className="w-3 h-3" aria-hidden="true" focusable="false" />
                         <span>Updated just now</span>
                       </div>
                       <Button
                         variant="ghost"
                         size="sm"
                         className="h-7 px-2.5 text-[11px] font-medium text-primary hover:bg-primary/10 rounded-full"
                         onClick={() => setShowTokenDialog(true)}
                       >
                         View details
                       </Button>
                     </div>
                   </PopoverContent>
                 </Popover>
               ) : (
                 <Button
                   variant="ghost"
                   size="icon"
                   className="rounded-full"
                   onClick={() => setShowTour(true)}
                   aria-label="Start guided tour"
                 >
                   <HelpCircle className="w-4 h-4 text-muted-foreground" aria-hidden="true" focusable="false" />
                 </Button>
               )}
               </div>
             </div>
         </header>

      {/* Main Content */}
      <main id="course-main-content" className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]" style={{ fontFamily: getFontStack(fontId) }}>
        {/* Left Panel - Course Overview */}
        <div className="lg:w-[40%] relative overflow-hidden flex flex-col">
          {/* Blue gradient background with decorative shapes */}
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 pointer-events-none" />

          {/* Decorative notebook elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Book spine edge */}
            <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-foreground/[0.06] to-transparent" />
            <div className="absolute right-3 top-0 bottom-0 w-[1px] bg-foreground/[0.08]" />
            
            {/* Page corner fold */}
            <div className="absolute top-0 right-0 w-12 h-12">
            <svg viewBox="0 0 48 48" className="w-full h-full text-foreground/[0.06]" fill="currentColor" aria-hidden="true" focusable="false" role="presentation">
                <path d="M48 0 L48 48 L0 0 Z" />
              </svg>
            </div>

            {/* Horizontal ruled lines like a notebook */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" role="presentation">
              <defs>
                <pattern id="editor-ruled-lines-multipage" width="100%" height="32" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="31" x2="100%" y2="31" stroke="currentColor" strokeWidth="1" className="text-foreground" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#editor-ruled-lines-multipage)" />
            </svg>

            {/* Left margin line (like a notebook) */}
            <div className="absolute left-12 top-0 bottom-0 w-[1px] bg-destructive/10" />

            {/* Premium bookmark ribbon */}
            <div className="absolute top-0 right-10 w-6 flex flex-col items-center drop-shadow-md">
              <div className="w-full h-24 bg-gradient-to-b from-primary/25 via-primary/20 to-primary/15 rounded-b-none" />
              <svg viewBox="0 0 24 12" className="w-full" preserveAspectRatio="none" aria-hidden="true" focusable="false" role="presentation">
                <path d="M0 0 L12 8 L24 0 L24 0 L0 0 Z" fill="hsl(var(--primary) / 0.15)" />
              </svg>
            </div>
            <div className="absolute top-0 right-10 w-6 h-24 border-x border-primary/10" />
          </div>

          {/* Content */}
          <ScrollArea className="relative z-10 flex-1 min-h-[300px] [&_[data-radix-scroll-area-thumb]]:!bg-muted-foreground/50 [&_[data-radix-scroll-area-thumb]:hover]:!bg-muted-foreground/70">
            <div className="p-6 sm:p-8 lg:py-10 lg:pr-10 lg:pl-16">
              {/* Course branding logo (intro) */}
              <CourseBrandingLogo courseId={courseId} slot="intro" />

              {/* Course Title */}
              <div className="relative group" data-tour="course-heading">
                <textarea
                  value={title}
                  onChange={(e) => {
                    if (e.target.value.length <= 275) {
                      setTitle(e.target.value);
                    }
                  }}
                  aria-label="Course title"
                  autoComplete="off"
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground bg-transparent border-none outline-none w-full placeholder:text-muted-foreground resize-none overflow-hidden leading-tight"
                  placeholder="Untitled course"
                  rows={1}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = target.scrollHeight + 'px';
                  }}
                />
                {/* Active underline - only visible when focused */}
                <div className="absolute bottom-0 left-0 w-full h-px bg-transparent group-focus-within:bg-primary transition-colors duration-200" />
              </div>
              
              {/* Character count */}
              <div className="mt-2">
                <span className="inline-block px-2 py-0.5 text-xs text-muted-foreground bg-background/80 rounded border border-border">
                  {title.length}/ 275
                </span>
              </div>

              {/* Decorative Underline */}
              <div className="mt-4 mb-8">
                <div className="h-1 bg-primary/30 rounded-full w-full" />
              </div>

              {/* Content Blocks */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
              >
                <SortableContext
                  items={contentBlocks.map((b) => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div
                    className={cn("mt-6 space-y-0 transition-all duration-200", editorDragOver && "ring-2 ring-dashed ring-primary/40 rounded-lg bg-primary/5")}
                    data-tour="content-blocks"
                    onDragOver={(e) => {
                      if (Array.from(e.dataTransfer.types).indexOf("application/content-block") >= 0) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.dataTransfer.dropEffect = "copy";
                        setEditorDragOver(true);
                        setIsSidebarDragging(true);
                      }
                    }}
                    onDragEnter={(e) => {
                      if (Array.from(e.dataTransfer.types).indexOf("application/content-block") >= 0) {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditorDragOver(true);
                        setIsSidebarDragging(true);
                      }
                    }}
                    onDragLeave={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
                        setEditorDragOver(false);
                        setIsSidebarDragging(false);
                        setDropTargetIndex(null);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setEditorDragOver(false);
                      setIsSidebarDragging(false);
                      setDropTargetIndex(null);
                      const data = e.dataTransfer.getData("application/content-block");
                      if (!data) return;
                      try {
                        const { templateId, categoryId } = JSON.parse(data);
                        const resolved = resolveTemplateDropData(templateId, categoryId);
                        if (!resolved) return;
                        addGenericBlock(resolved.type, undefined, resolved.variant);
                      } catch {}
                    }}
                  >
                    {(() => {
                      // Merge content blocks and deleted block banners by index
                      const deletedArr = Array.from(deletedBlocks.entries()).sort(
                        ([, a], [, b]) => a.index - b.index
                      );
                      const elements: React.ReactNode[] = [];
                      let blockIdx = 0;
                      let deletedIdx = 0;
                      let position = 0;

                      while (blockIdx < contentBlocks.length || deletedIdx < deletedArr.length) {
                        // Check if a deleted banner belongs at this position
                        if (deletedIdx < deletedArr.length && deletedArr[deletedIdx][1].index <= position) {
                          const [deletedId] = deletedArr[deletedIdx];
                          elements.push(
                            <div key={`deleted-${deletedId}`} className="animate-fade-in my-2">
                              <div className="flex items-center justify-between px-5 py-3.5 rounded-lg border border-border bg-background/80 backdrop-blur-sm">
                                <p className="text-sm text-muted-foreground italic">
                                  Content was removed...{" "}
                                  <button
                                    onClick={() => undoDelete(deletedId)}
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
                                  <X className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                                  Close
                                </button>
                              </div>
                            </div>
                          );
                          deletedIdx++;
                          position++;
                          continue;
                        }

                        if (blockIdx < contentBlocks.length) {
                          const block = contentBlocks[blockIdx];
                          const index = blockIdx;
                          const isOver = overId === block.id && activeId !== block.id;
                          const activeBlockIdx = contentBlocks.findIndex((b) => b.id === activeId);
                          const showAbove = isOver && activeBlockIdx > index;
                          const showBelow = isOver && activeBlockIdx < index;

                          elements.push(
                            <div key={block.id} data-comment-anchor={block.id} className="group/item">
                              {/* Drop indicator BEFORE first block during sidebar drag */}
                              {index === 0 && isSidebarDragging && (
                                <DropIndicator
                                  index={0}
                                  isActive={dropTargetIndex === 0}
                                  onActivate={setDropTargetIndex}
                                  onDeactivate={() => setDropTargetIndex(null)}
                                  onDrop={(idx, type, variant) => {
                                    setDropTargetIndex(null);
                                    setIsSidebarDragging(false);
                                    setEditorDragOver(false);
                                    addGenericBlock(type as any, idx, variant);
                                  }}
                                />
                              )}

                              {!readOnly && index === 0 && !activeId && !isSidebarDragging && block.type !== "description" && (
                                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                                  <AddContentButton onAddText={() => addTextBlock(0)} onAddImage={() => addImageBlock(0)} aiEnabled={!!aiOptions?.enabled} onAIGenerateText={(prompt) => aiGenerateText(prompt, 0)} onAIGenerateImage={(prompt) => aiGenerateImage(prompt, 0)} onDropBlock={(type, variant) => addGenericBlock(type, 0, variant)} />
                                </div>
                              )}


                              <div className="relative">
                                <BlockCommentIndicator courseId={courseId} blockId={block.id} />
                                <div
                                  className={cn(
                                    "absolute -top-1 left-0 right-0 h-[3px] rounded-full bg-primary transition-all duration-200 z-20",
                                    showAbove ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
                                  )}
                                >
                                  <div className="absolute -left-1 -top-[3px] w-[9px] h-[9px] rounded-full bg-primary" />
                                  <div className="absolute -right-1 -top-[3px] w-[9px] h-[9px] rounded-full bg-primary" />
                                </div>

                                {block.type === "description" ? (
                                  <DescriptionBlock
                                    id={block.id}
                                    content={block.content}
                                    onChange={(content) => updateBlockContent(block.id, content)}
                                    onClear={() => deleteBlock(block.id)}
                                    onDuplicate={() => duplicateBlock(block.id)}
                                  />
                                ) : (
                                  <ContentBlock
                                    id={block.id}
                                    type={block.type as "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description" | "video-description" | "hotspot" | "tabs" | "flashcards"}
                                    content={block.content}
                                    onChange={(content) => updateBlockContent(block.id, content)}
                                    onDelete={() => deleteBlock(block.id)}
                                    onDuplicate={() => duplicateBlock(block.id)}
                                    autoFocus={false}
                                    aiEnabled={!!aiOptions?.enabled}
                                    font={block.font}
                                    onFontChange={(fid) => updateBlockFont(block.id, fid)}
                                    readOnly={readOnly}
                                    variant={block.variant}
                                    onTypeChange={(t, c, v) => updateBlockType(block.id, t, c, v)}
                                    onConvertKeepBoth={(t, v) => addGenericBlock(t, index + 1, v)}
                                    aiGenerated={block.aiGenerated}
                                  />

                                )}

                                <div
                                  className={cn(
                                    "absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-primary transition-all duration-200 z-20",
                                    showBelow ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
                                  )}
                                >
                                  <div className="absolute -left-1 -top-[3px] w-[9px] h-[9px] rounded-full bg-primary" />
                                  <div className="absolute -right-1 -top-[3px] w-[9px] h-[9px] rounded-full bg-primary" />
                                </div>
                              </div>

                              {/* Drop indicator AFTER each block during sidebar drag */}
                              {isSidebarDragging ? (
                                <DropIndicator
                                  index={index + 1}
                                  isActive={dropTargetIndex === index + 1}
                                  onActivate={setDropTargetIndex}
                                  onDeactivate={() => setDropTargetIndex(null)}
                                  onDrop={(idx, type, variant) => {
                                    setDropTargetIndex(null);
                                    setIsSidebarDragging(false);
                                    setEditorDragOver(false);
                                    addGenericBlock(type as any, idx, variant);
                                  }}
                                />
                              ) : (
                                !readOnly && !activeId && block.type !== "description" && (
                                  <div className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                                    <AddContentButton onAddText={() => addTextBlock(index + 1)} onAddImage={() => addImageBlock(index + 1)} aiEnabled={!!aiOptions?.enabled} onAIGenerateText={(prompt) => aiGenerateText(prompt, index + 1)} onAIGenerateImage={(prompt) => aiGenerateImage(prompt, index + 1)} onDropBlock={(type, variant) => addGenericBlock(type, index + 1, variant)} />
                                  </div>
                                )

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
                <DragOverlay dropAnimation={{
                  duration: 200,
                  easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
                }}>
                  {activeId ? (() => {
                    const activeBlock = contentBlocks.find((b) => b.id === activeId);
                    const displayContent = activeBlock?.type === "description"
                      ? (activeBlock.content || "Tell your learners what the course will be about...")
                      : (activeBlock?.content || "");
                    return (
                      <div className="opacity-80 shadow-2xl rounded-lg border border-primary/30 bg-background/95 backdrop-blur-sm p-4">
                        <div
                          className="prose prose-sm dark:prose-invert max-w-none text-foreground [&_h2]:!text-[1.75rem] [&_h2]:!font-semibold [&_h2]:!leading-tight"
                          dangerouslySetInnerHTML={{ __html: displayContent }}
                        />
                      </div>
                    );
                  })() : null}
                </DragOverlay>
              </DndContext>

              {/* Add content button when no blocks exist */}
              {!readOnly && contentBlocks.filter((b) => b.type !== "description").length === 0 && (
                <div className="mt-6">
                  <AddContentButton onAddText={() => addTextBlock()} onAddImage={() => addImageBlock()} aiEnabled={!!aiOptions?.enabled} onAIGenerateText={(prompt) => aiGenerateText(prompt)} onAIGenerateImage={(prompt) => aiGenerateImage(prompt)} onDropBlock={(type, variant) => addGenericBlock(type, undefined, variant)} forceOpen={tourStep === 1} />
                </div>
              )}

            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Course Outline */}
        <div
          className="lg:w-[60%] bg-background border-t lg:border-t-0 lg:border-l border-border flex flex-col overflow-y-auto"
          style={contentBgStyle}
        >
            <div className="p-6 sm:p-10">

              {/* Header row: Course outline + Add item */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Course Outline</h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Course outline help">
                        <HelpCircle className="w-4 h-4" aria-hidden="true" focusable="false" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs max-w-[200px]">
                      Add sections, pages, and questions to build your course outline
                    </TooltipContent>
                  </Tooltip>
                </div>

                {!readOnly && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 border-border rounded-full"
                      data-tour="add-item"
                    >
                      <Plus className="w-4 h-4" aria-hidden="true" focusable="false" />
                      Add item
                      <ChevronDown className="w-3 h-3 ml-1" aria-hidden="true" focusable="false" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72 bg-background border border-border p-2">
                    <DropdownMenuItem
                      onClick={() => handleAddItem("section")}
                      className="cursor-pointer flex items-start gap-3 px-3 py-3 rounded-md hover:!bg-muted focus:!bg-muted focus:!text-foreground transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg border border-border bg-muted/50 flex items-center justify-center shrink-0 mt-0.5">
                        <LayoutGrid className="w-4 h-4 text-muted-foreground" aria-hidden="true" focusable="false" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-foreground">New section</span>
                        <span className="text-xs text-muted-foreground">Introduce a topic or concept</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleAddItem("page")}
                      className="cursor-pointer flex items-start gap-3 px-3 py-3 rounded-md hover:!bg-muted focus:!bg-muted focus:!text-foreground transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg border border-border bg-muted/50 flex items-center justify-center shrink-0 mt-0.5">
                        <FileText className="w-4 h-4 text-muted-foreground" aria-hidden="true" focusable="false" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-foreground">New page</span>
                        <span className="text-xs text-muted-foreground">Single learning unit to explain topics</span>
                      </div>
                    </DropdownMenuItem>
                    <div className="my-2 h-px bg-border" aria-hidden="true" />
                    <DropdownMenuItem
                      onClick={() => setShowCopyContentDialog(true)}
                      className="cursor-pointer flex items-start gap-3 px-3 py-3 rounded-md hover:!bg-muted focus:!bg-muted focus:!text-foreground transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg border border-primary/30 bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <CopyPlus className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-foreground">Copy Content</span>
                        <span className="text-xs text-muted-foreground">Pull a section or pages from another course.</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                )}
              </div>


              {/* Outline Items */}
              {(items.length > 0 || pendingTopAdds.length > 0) && (
                <DndContext
                  sensors={outlineSensors}
                  collisionDetection={closestCorners}
                  onDragStart={handleOutlineDragStart}
                  onDragOver={handleOutlineDragOver}
                  onDragEnd={handleOutlineDragEnd}
                  onDragCancel={handleOutlineDragCancel}
                >


                  <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-6">
                      {(() => {
                        let sectionIndex = 0;
                        const rendered: React.ReactNode[] = [];
                        items.forEach((item, topIdx) => {
                          // Gap drop zone before each top-level item (only while dragging a child page)
                          if (isDraggingChildPage && !deletingIds.has(item.id)) {
                            rendered.push(
                              <OutlineGapDropZone key={`gap-${topIdx}`} index={topIdx} />
                            );
                          }

                          // Deleting -> swap card for skeleton
                          if (deletingIds.has(item.id)) {
                            rendered.push(
                              <OutlineItemSkeleton
                                key={`del-${item.id}`}
                                variant={deletingIds.get(item.id) === "section" ? "section" : "page"}
                                action="deleting"
                              />,
                            );
                            return;
                          }

                          if (item.type === "section") {
                            sectionIndex++;
                            const currentSectionNumber = sectionIndex;
                            rendered.push(
                              <SortableOutlineItem key={item.id} id={item.id}>
                                <SectionCard
                                  sectionId={item.id}
                                  sectionNumber={currentSectionNumber}
                                  title={item.title}
                                  inclusions={item.inclusions || ""}
                                  exclusions={item.exclusions || ""}
                                  aiEnabled={!!aiOptions?.enabled}
                                  thumbnailUrl={item.thumbnailUrl || null}
                                  onThumbnailChange={(url) => {
                                    setItems((prev) => prev.map((i) =>
                                      i.id === item.id ? { ...i, thumbnailUrl: url || undefined } : i
                                    ));
                                  }}
                                  onTitleChange={(newTitle) => updateItemTitle(item.id, newTitle)}
                                  onInclusionsChange={(val) => updateItemInclusions(item.id, val)}
                                  onExclusionsChange={(val) => updateItemExclusions(item.id, val)}
                                  onDelete={() => deleteItem(item.id)}
                                  onDuplicate={() => duplicateItem(item.id)}
                                  onOpenSection={() => setActiveEditorPageId(item.id)}
                                  onOpenPage={navigateToPage}
                                  onAddPage={() => handleAddItem("page")}
                                  onAddLearningObjective={() => {}}
                                  objective={sectionObjectivesMap[item.id] || ""}
                                  onObjectiveChange={(obj) => setSectionObjectivesMap((prev) => ({ ...prev, [item.id]: obj }))}
                                  pages={(item.children || []).map(c => ({ id: c.id, title: c.title, inclusions: c.inclusions || "", exclusions: c.exclusions || "" }))}
                                  onPagesChange={(newPages) => {
                                    setItems((prev) => prev.map((i) => {
                                      if (i.id === item.id) {
                                        return {
                                          ...i,
                                          children: newPages.map(p => ({
                                            id: p.id,
                                            type: "page" as const,
                                            title: p.title,
                                            inclusions: p.inclusions,
                                            exclusions: p.exclusions,
                                          })),
                                        };
                                      }
                                      return i;
                                    }));
                                  }}
                                  readOnly={readOnly}
                                  getBlockIdsForPage={(pageId) => (pageBlocksMap[pageId] || []).map((b) => b.id)}
                                />

                              </SortableOutlineItem>,
                            );
                            // Pending child page additions for this section -> show skeleton placeholders
                            const pending = pendingChildAdds[item.id] || [];
                            pending.forEach((pid) => {
                              rendered.push(
                                <div key={pid} className="ml-4">
                                  <OutlineItemSkeleton variant="section-child-page" action="adding" />
                                </div>,
                              );
                            });
                          } else if (item.type === "page") {
                            rendered.push(
                              <SortableOutlineItem key={item.id} id={item.id}>
                                <PageItemCard
                                  id={item.id}
                                  title={item.title}
                                  inclusions={item.inclusions || ""}
                                  exclusions={item.exclusions || ""}
                                  aiEnabled={!!aiOptions?.enabled}
                                  onTitleChange={(newTitle) => updateItemTitle(item.id, newTitle)}
                                  onInclusionsChange={(val) => updateItemInclusions(item.id, val)}
                                  onExclusionsChange={(val) => updateItemExclusions(item.id, val)}
                                  onDelete={() => deleteItem(item.id)}
                                  onDuplicate={() => duplicateItem(item.id)}
                                  onRenameItem={(id, newTitle) => updateItemTitle(id, newTitle)}
                                  onDeleteItem={(id) => deleteItem(id)}
                                  onDuplicateItem={(id) => duplicateItem(id)}
                                  onAddPageToSection={(sectionId) => addPageToSection(sectionId)}
                                  onReorderItems={(activeId, overId) => {
                                    setItems((prev) => {
                                      const oldIndex = prev.findIndex((i) => i.id === activeId);
                                      const newIndex = prev.findIndex((i) => i.id === overId);
                                      if (oldIndex === -1 || newIndex === -1) return prev;
                                      return arrayMove(prev, oldIndex, newIndex);
                                    });
                                  }}
                                  onReorderChildItems={(sectionId, activeId, overId) => {
                                    setItems((prev) => prev.map((item) => {
                                      if (item.id === sectionId && item.children) {
                                        const oldIndex = item.children.findIndex((c) => c.id === activeId);
                                        const newIndex = item.children.findIndex((c) => c.id === overId);
                                        if (oldIndex === -1 || newIndex === -1) return item;
                                        return { ...item, children: arrayMove(item.children, oldIndex, newIndex) };
                                      }
                                      return item;
                                    }));
                                  }}
                                  onNavigateToPage={navigateToPage}
                                  editorOpen={activeEditorPageId === item.id}
                                  onOpenEditor={() => setActiveEditorPageId(item.id)}
                                  onCloseEditor={() => setActiveEditorPageId(null)}
                                  autoFocus={item.title === ""}
                                  courseItems={items}
                                  initialBlocks={pageBlocksMap[item.id] || []}
                                  onBlocksChange={(blocks) => updatePageBlocks(item.id, blocks)}
                                   onAddItem={(type) => handleAddItem(type)}
                                   onPreview={handlePreview}
                                   readOnly={readOnly}
                                 />
                              </SortableOutlineItem>,
                            );
                          }

                          // Duplicating -> show clone skeleton directly under the source
                          if (duplicatingIds.has(item.id)) {
                            rendered.push(
                              <OutlineItemSkeleton
                                key={`dup-${item.id}`}
                                variant={duplicatingIds.get(item.id) === "section" ? "section" : "page"}
                                action="duplicating"
                              />,
                            );
                          }
                        });

                        // Trailing gap drop zone (after last top-level item)
                        if (isDraggingChildPage) {
                          rendered.push(
                            <OutlineGapDropZone key={`gap-${items.length}`} index={items.length} />
                          );
                        }


                        // Pending top-level additions -> placeholder at bottom
                        pendingTopAdds.forEach((p) => {
                          rendered.push(
                            <OutlineItemSkeleton
                              key={p.id}
                              variant={p.kind}
                              action="adding"
                            />,
                          );
                        });

                        return rendered;
                      })()}
                    </div>
                  </SortableContext>
                  {isDraggingChildPage && <TopLevelEndDropZone />}
                </DndContext>

              )}

              {/* Empty State */}
              {items.length === 0 && pendingTopAdds.length === 0 && (
                <div className="mt-12 flex flex-col items-center justify-center gap-4">
                  <div className="w-48 h-48">
                    <Lottie animationData={emptyOutlineAnimation} loop autoplay />
                  </div>
                  <div className="text-center space-y-1.5">
                    <p className="text-sm font-medium text-foreground">No items yet</p>
                    <p className="text-xs text-muted-foreground max-w-[240px]">
                      Add sections and pages to build your course outline
                    </p>
                  </div>
                </div>
              )}
            </div>
        </div>
      </main>

      {/* Standalone PageEditorDialog for child pages navigated from sidebar */}
      {(() => {
        if (!activeEditorPageId) return null;
        // Check if it's a top-level item
        const topLevel = items.find((i) => i.id === activeEditorPageId);
        // If it's a top-level page, it's handled by PageItemCard's own editor
        if (topLevel && topLevel.type === "page") return null;
        
        // If it's a top-level section, render the editor for it
        if (topLevel && topLevel.type === "section") {
          return (
            <PageEditorDialog
              key={topLevel.id}
              open={true}
              onClose={() => setActiveEditorPageId(null)}
              pageTitle={topLevel.title}
              onPageTitleChange={(newTitle) => updateItemTitle(topLevel.id, newTitle)}
              aiEnabled={!!aiOptions?.enabled}
              courseItems={items}
              currentPageId={topLevel.id}
              onRenameItem={(id, newTitle) => updateItemTitle(id, newTitle)}
              onDeleteItem={(id) => deleteItem(id)}
              onDuplicateItem={(id) => duplicateItem(id)}
              onAddPageToSection={(sectionId) => addPageToSection(sectionId)}
              onReorderItems={(activeId, overId) => {
                setItems((prev) => {
                  const oldIndex = prev.findIndex((i) => i.id === activeId);
                  const newIndex = prev.findIndex((i) => i.id === overId);
                  if (oldIndex === -1 || newIndex === -1) return prev;
                  return arrayMove(prev, oldIndex, newIndex);
                });
              }}
              onReorderChildItems={(sectionId, activeId, overId) => {
                setItems((prev) => prev.map((item) => {
                  if (item.id === sectionId && item.children) {
                    const oldIdx = item.children.findIndex((c) => c.id === activeId);
                    const newIdx = item.children.findIndex((c) => c.id === overId);
                    if (oldIdx === -1 || newIdx === -1) return item;
                    return { ...item, children: arrayMove(item.children, oldIdx, newIdx) };
                  }
                  return item;
                }));
              }}
              onNavigateToPage={navigateToPage}
              initialBlocks={pageBlocksMap[topLevel.id] || []}
              onBlocksChange={(blocks) => updatePageBlocks(topLevel.id, blocks)}
              onAddItem={(type) => handleAddItem(type)}
              sectionObjectives={sectionObjectivesMap[topLevel.id] || ""}
              onSectionObjectivesChange={(obj) => setSectionObjectivesMap((prev) => ({ ...prev, [topLevel.id]: obj }))}
              sectionThumbnailUrl={topLevel.thumbnailUrl || null}
              onSectionThumbnailChange={(url) => {
                setItems((prev) => prev.map((i) =>
                  i.id === topLevel.id ? { ...i, thumbnailUrl: url || undefined } : i
                ));
              }}
              onPreview={handlePreview}
              outlineDeletingIds={deletingIds}
              outlineDuplicatingIds={duplicatingIds}
              outlinePendingTopAdds={pendingTopAdds}
              outlinePendingChildAdds={pendingChildAdds}
              readOnly={readOnly}
            />
           );
        }

        // Find in section children
        for (const section of items) {
          if (section.children) {
            const child = section.children.find((c) => c.id === activeEditorPageId);
            if (child) {
              return (
                <PageEditorDialog
                  key={child.id}
                  open={true}
                  onClose={() => setActiveEditorPageId(null)}
                  pageTitle={child.title}
                  onPageTitleChange={(newTitle) => updateItemTitle(child.id, newTitle)}
                  aiEnabled={!!aiOptions?.enabled}
                  courseItems={items}
                  currentPageId={child.id}
                  onRenameItem={(id, newTitle) => updateItemTitle(id, newTitle)}
                  onDeleteItem={(id) => deleteItem(id)}
                  onDuplicateItem={(id) => duplicateItem(id)}
                  onAddPageToSection={(sectionId) => addPageToSection(sectionId)}
                  onReorderItems={(activeId, overId) => {
                    setItems((prev) => {
                      const oldIndex = prev.findIndex((i) => i.id === activeId);
                      const newIndex = prev.findIndex((i) => i.id === overId);
                      if (oldIndex === -1 || newIndex === -1) return prev;
                      return arrayMove(prev, oldIndex, newIndex);
                    });
                  }}
                  onReorderChildItems={(sectionId, activeId, overId) => {
                    setItems((prev) => prev.map((item) => {
                      if (item.id === sectionId && item.children) {
                        const oldIdx = item.children.findIndex((c) => c.id === activeId);
                        const newIdx = item.children.findIndex((c) => c.id === overId);
                        if (oldIdx === -1 || newIdx === -1) return item;
                        return { ...item, children: arrayMove(item.children, oldIdx, newIdx) };
                      }
                      return item;
                    }));
                  }}
                  onNavigateToPage={navigateToPage}
                  initialBlocks={pageBlocksMap[child.id] || []}
                  onBlocksChange={(blocks) => updatePageBlocks(child.id, blocks)}
                  onAddItem={(type) => handleAddItem(type)}
                  onPreview={handlePreview}
                  outlineDeletingIds={deletingIds}
                  outlineDuplicatingIds={duplicatingIds}
                  outlinePendingTopAdds={pendingTopAdds}
                  outlinePendingChildAdds={pendingChildAdds}
                  readOnly={readOnly}
                />
              );
            }
          }
        }
        return null;
      })()}

      {/* Guided Tour */}
      <GuidedTour
        steps={tourSteps}
        isOpen={showTour}
        onClose={() => { setShowTour(false); setTourStep(-1); sessionStorage.setItem("multipage-tour-dismissed", "true"); }}
        onStepChange={setTourStep}
      />

      <GenerateExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        courseTitle={title}
      />

      <TokenConsumptionDialog
        open={showTokenDialog}
        onClose={() => setShowTokenDialog(false)}
        imageVersionHistory={[]}
      />

      <CollaboratorsDrawer
        open={showCollaboratorsDrawer}
        onOpenChange={setShowCollaboratorsDrawer}
        courseId={courseId}
        courseTitle={title}
      />


      <CopyContentDialog
        open={showCopyContentDialog}
        onOpenChange={setShowCopyContentDialog}
      />

      {readOnly && (
        <FinishReviewDialog open={showFinishReviewDialog} onOpenChange={setShowFinishReviewDialog} />
      )}
      {isEditCoursePage && (
        <>
          <CloneCourseDialog
            open={showCloneDialog}
            onClose={setShowCloneDialog}
            currentTitle={title}
            onClone={(newTitle) => {
              toast({ title: "Course cloned", description: `"${newTitle}" created from "${title}".` });
            }}
          />
          <DeleteCourseDialog
            open={showDeleteDialog}
            onClose={setShowDeleteDialog}
            courseTitle={title}
            onDelete={() => {
              toast({ title: "Course deleted", description: `"${title}" has been deleted.`, variant: "destructive" });
              navigate("/dashboard");
            }}
          />
        </>
      )}
    </div>
  );
}
