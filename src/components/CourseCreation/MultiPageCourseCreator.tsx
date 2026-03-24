import { useState, useCallback, useRef, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, Eye, Wand2, Plus, X, Undo2, LayoutGrid, FileText, HelpCircle, Layers, FileStack, Check, Sparkles, Image, Type } from "lucide-react";
import { GuidedTour, type TourStep } from "@/components/GuidedTour/GuidedTour";
import type { AIOptions } from "@/components/Dashboard/AIOptionsPanel";
import { PageEditorDialog } from "./PageEditorDialog";
import { AIHeaderButton } from "./AIHeaderButton";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
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
import { AddContentButton } from "./AddContentButton";
import { resolveTemplateDropData } from "./ContentBlocksPanel";
import { DropIndicator } from "./DropIndicator";
import { SectionCard } from "./SectionCard";
import { PageItemCard } from "./PageItemCard";
import { LayoutSelectorDropdown } from "./LayoutSelectorDropdown";

interface MultiPageCourseCreatorProps {
  courseTitle: string;
  aiOptions?: AIOptions | null;
}

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
  type: "text" | "image" | "description";
  content: string;
}

interface PageContentBlockData {
  id: string;
  type: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description" | "video-description";
  content: string;
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

export function MultiPageCourseCreator({ courseTitle, aiOptions: initialAIOptions = null }: MultiPageCourseCreatorProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState(courseTitle);
  const [showTour, setShowTour] = useState(true);
  const [tourStep, setTourStep] = useState(0);
  const [contentBlocks, setContentBlocks] = useState<ContentBlockData[]>([
    { id: "description-block", type: "description", content: "" },
  ]);
  const [items, setItems] = useState<CourseItem[]>([]);
  const [aiOptions, setAIOptions] = useState<AIOptions | null>(initialAIOptions);
  const [deletedBlocks, setDeletedBlocks] = useState<Map<string, DeletedBlock>>(new Map());
  const [activeEditorPageId, setActiveEditorPageId] = useState<string | null>(null);
  const [pageBlocksMap, setPageBlocksMap] = useState<Record<string, PageContentBlockData[]>>({});
  const [sectionObjectivesMap, setSectionObjectivesMap] = useState<Record<string, string>>({});
  const deleteTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const tourSteps: TourStep[] = [
    {
      target: "layout-selector",
      icon: <Layers className="w-5 h-5 text-muted-foreground" />,
      title: "Layout Selection",
      description: "Preview different layouts to see how your course adapts.",
      placement: "bottom",
    },
    {
      target: "text-toolbar",
      icon: <Image className="w-5 h-5 text-muted-foreground" />,
      title: "Course Heading Text Toolbar",
      description: "Make your text stand out with formatting tools.",
      placement: "bottom",
    },
    {
      target: "add-item",
      icon: <Plus className="w-5 h-5 text-muted-foreground" />,
      title: "Add Item",
      description: "Add Sections & Pages. Sections organize your course, but pages can stand alone or sit inside sections — giving you full flexibility.",
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

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [editorDragOver, setEditorDragOver] = useState(false);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [isSidebarDragging, setIsSidebarDragging] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const outlineSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

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
    const defaultContent = `<h2 style="font-size: 1.75rem; font-weight: 600;">Your heading text goes here</h2><br/><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>`;
    const newBlock: ContentBlockData = {
      id: `block-${Date.now()}`,
      type: "text",
      content: defaultContent,
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

  const addGenericBlock = useCallback((type: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description" | "video-description", insertAt?: number, variant?: string) => {
    const id = `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    let content = "";
    let blockType: ContentBlockData["type"] = type as ContentBlockData["type"];
    if (type === "video-description") {
      content = JSON.stringify({ layout: variant === "video-right" ? "video-right" : "video-left", videoUrl: "", description: "" });
    } else if (type === "text") {
      if (variant === "heading-text") {
        content = `<h2 style="font-size: 1.75rem; font-weight: 600;">Your heading text goes here</h2><br/><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>`;
      } else if (variant === "two-columns") {
        content = `<!--two-columns--><h2 style="font-size: 1.75rem; font-weight: 600;">Heading</h2><p>Column one content.</p><!--col-break--><h2 style="font-size: 1.75rem; font-weight: 600;">Heading</h2><p>Column two content.</p>`;
      } else {
        content = `<p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>`;
      }
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
    const newItem: CourseItem = {
      id: `${type}-${Date.now()}`,
      type,
      title: type === "section" ? "Untitled section" : type === "page" ? "" : "New Question",
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

  const deleteItem = (id: string) => {
    setItems((prev) => {
      // Try top-level first
      if (prev.some((item) => item.id === id)) {
        return prev.filter((item) => item.id !== id);
      }
      // Try inside section children
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
      // Search top-level
      let idx = prev.findIndex((item) => item.id === id);
      if (idx !== -1) {
        const original = prev[idx];
        const cloneId = `${original.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const clonedChildren = original.children?.map((child) => {
          const childCloneId = `${child.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          // Clone child page blocks
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
        // Clone the item's own blocks
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
      // Search inside section children
      return prev.map((item) => {
        if (!item.children) return item;
        const childIdx = item.children.findIndex((c) => c.id === id);
        if (childIdx === -1) return item;
        const original = item.children[childIdx];
        const cloneId = `${original.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        // Clone the child page's blocks
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
  };

  const updatePageBlocks = useCallback((pageId: string, blocks: PageContentBlockData[]) => {
    setPageBlocksMap((prev) => ({ ...prev, [pageId]: blocks }));
  }, []);

  const addPageToSection = (sectionId: string) => {
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

  const handlePreview = useCallback(() => {
    navigate("/multipage-preview", {
      state: { title, items, contentBlocks, pageBlocksMap },
    });
  }, [navigate, title, items, contentBlocks, pageBlocksMap]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Go back"
            >
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
                  <TooltipContent side="bottom" className="max-w-[300px] text-sm">
                    {title}
                  </TooltipContent>
                )}
              </Tooltip>
              <span className="text-muted-foreground/30 select-none">|</span>
              <LayoutSelectorDropdown currentLayout="multi-page" title={title} aiOptions={aiOptions} />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3" data-tour="header-actions">
            <AIHeaderButton aiOptions={aiOptions} onOptionsChange={setAIOptions} />
             <Button
               variant="outline"
               size="icon"
               className="rounded-full border-border"
               onClick={handlePreview}
             >
               <Eye className="w-4 h-4" />
             </Button>
            <Button
              variant="outline"
              className="rounded-full border-primary text-primary hover:bg-primary/5 gap-2"
            >
              <Wand2 className="w-4 h-4" />
              <span className="hidden sm:inline">Generate</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setShowTour(true)}
            >
              <HelpCircle className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
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
              <svg viewBox="0 0 48 48" className="w-full h-full text-foreground/[0.06]" fill="currentColor">
                <path d="M48 0 L48 48 L0 0 Z" />
              </svg>
            </div>

            {/* Horizontal ruled lines like a notebook */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="editor-ruled-lines" width="100%" height="32" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="31" x2="100%" y2="31" stroke="currentColor" strokeWidth="1" className="text-foreground" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#editor-ruled-lines)" />
            </svg>

            {/* Left margin line (like a notebook) */}
            <div className="absolute left-12 top-0 bottom-0 w-[1px] bg-destructive/10" />

            {/* Premium bookmark ribbon */}
            <div className="absolute top-0 right-10 w-6 flex flex-col items-center drop-shadow-md">
              <div className="w-full h-24 bg-gradient-to-b from-primary/25 via-primary/20 to-primary/15 rounded-b-none" />
              <svg viewBox="0 0 24 12" className="w-full" preserveAspectRatio="none">
                <path d="M0 0 L12 8 L24 0 L24 0 L0 0 Z" fill="hsl(var(--primary) / 0.15)" />
              </svg>
            </div>
            <div className="absolute top-0 right-10 w-6 h-24 border-x border-primary/10" />
          </div>

          {/* Content */}
          <ScrollArea className="relative z-10 flex-1 min-h-[300px]">
            <div className="p-6 sm:p-8 lg:py-10 lg:pr-10 lg:pl-16">
              {/* Course Title */}
              <div className="relative group" data-tour="course-heading">
                <textarea
                  value={title}
                  onChange={(e) => {
                    if (e.target.value.length <= 275) {
                      setTitle(e.target.value);
                    }
                  }}
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground bg-transparent border-none outline-none w-full placeholder:text-foreground/40 resize-none overflow-hidden leading-tight"
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
                                  <X className="w-3.5 h-3.5" />
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
                            <div key={block.id} className="group/item">
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

                              {index === 0 && !activeId && !isSidebarDragging && block.type !== "description" && (
                                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                                  <AddContentButton onAddText={() => addTextBlock(0)} onAddImage={() => addImageBlock(0)} aiEnabled={!!aiOptions?.enabled} onAIGenerateText={(prompt) => aiGenerateText(prompt, 0)} onAIGenerateImage={(prompt) => aiGenerateImage(prompt, 0)} onDropBlock={(type, variant) => addGenericBlock(type, 0, variant)} />
                                </div>
                              )}

                              <div className="relative">
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
                                    type={block.type as "text" | "image"}
                                    content={block.content}
                                    onChange={(content) => updateBlockContent(block.id, content)}
                                    onDelete={() => deleteBlock(block.id)}
                                    onDuplicate={() => duplicateBlock(block.id)}
                                    autoFocus={!block.content}
                                    aiEnabled={!!aiOptions?.enabled}
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
                                !activeId && block.type !== "description" && (
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
                          className="prose prose-sm dark:prose-invert max-w-none text-foreground/60 [&_h2]:!text-[1.75rem] [&_h2]:!font-semibold [&_h2]:!leading-tight"
                          dangerouslySetInnerHTML={{ __html: displayContent }}
                        />
                      </div>
                    );
                  })() : null}
                </DragOverlay>
              </DndContext>

              {/* Add content button when no blocks exist */}
              {contentBlocks.filter((b) => b.type !== "description").length === 0 && (
                <div className="mt-6">
                  <AddContentButton onAddText={() => addTextBlock()} onAddImage={() => addImageBlock()} aiEnabled={!!aiOptions?.enabled} onAIGenerateText={(prompt) => aiGenerateText(prompt)} onAIGenerateImage={(prompt) => aiGenerateImage(prompt)} onDropBlock={(type, variant) => addGenericBlock(type, undefined, variant)} forceOpen={tourStep === 1} />
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Course Outline */}
        <div className="lg:w-[60%] bg-background border-t lg:border-t-0 lg:border-l border-border flex flex-col overflow-y-auto">
            <div className="p-6 sm:p-10">
              {/* Header row: Course outline + Add item */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Course Outline</h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground transition-colors">
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs max-w-[200px]">
                      Add sections, pages, and questions to build your course outline
                    </TooltipContent>
                  </Tooltip>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 border-border rounded-full"
                      data-tour="add-item"
                    >
                      <Plus className="w-4 h-4" />
                      Add item
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72 bg-background border border-border p-2">
                    <DropdownMenuItem
                      onClick={() => handleAddItem("section")}
                      className="cursor-pointer flex items-start gap-3 px-3 py-3 rounded-md hover:!bg-muted focus:!bg-muted focus:!text-foreground transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg border border-border bg-muted/50 flex items-center justify-center shrink-0 mt-0.5">
                        <LayoutGrid className="w-4 h-4 text-muted-foreground" />
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
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-foreground">New page</span>
                        <span className="text-xs text-muted-foreground">Single learning unit to explain topics</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Outline Items */}
              {items.length > 0 && (
                <DndContext
                  sensors={outlineSensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleOutlineDragEnd}
                >
                  <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-6">
                      {(() => {
                        let sectionIndex = 0;
                        return items.map((item) => {
                          if (item.type === "section") {
                            sectionIndex++;
                            const currentSectionNumber = sectionIndex;
                            return (
                              <SortableOutlineItem key={item.id} id={item.id}>
                                <SectionCard
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
                                />
                              </SortableOutlineItem>
                            );
                          }
                          if (item.type === "page") {
                            return (
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
                                 />
                              </SortableOutlineItem>
                            );
                          }
                          return null;
                        });
                      })()}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              {/* Empty State */}
              {items.length === 0 && (
                <div className="mt-16 border-t border-dashed border-border pt-8">
                  <p className="text-sm text-muted-foreground text-center">
                    Your course outline will appear here
                  </p>
                </div>
              )}
            </div>
        </div>
      </div>

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
              onPreview={handlePreview}
            />
          );

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
                />
              );
          }
        }
        return null;
      })()}

      {/* Guided Tour */}
      <GuidedTour
        steps={tourSteps}
        isOpen={showTour}
        onClose={() => { setShowTour(false); setTourStep(-1); }}
        onStepChange={setTourStep}
      />
    </div>
  );
}
