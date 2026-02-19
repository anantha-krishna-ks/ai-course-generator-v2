import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, Play, Share2, Plus, X, Undo2, LayoutGrid, FileText, HelpCircle } from "lucide-react";
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
} from "@dnd-kit/sortable";
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

interface MultiPageCourseCreatorProps {
  courseTitle: string;
}

interface CourseItem {
  id: string;
  type: "section" | "page" | "question";
  title: string;
  children?: CourseItem[];
}

interface ContentBlockData {
  id: string;
  type: "text" | "image" | "description";
  content: string;
}

interface DeletedBlock {
  block: ContentBlockData;
  index: number;
}

export function MultiPageCourseCreator({ courseTitle }: MultiPageCourseCreatorProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState(courseTitle);
  const [contentBlocks, setContentBlocks] = useState<ContentBlockData[]>([
    { id: "description-block", type: "description", content: "" },
  ]);
  const [items, setItems] = useState<CourseItem[]>([]);
  const [deletedBlocks, setDeletedBlocks] = useState<Map<string, DeletedBlock>>(new Map());
  const deleteTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
      const clone = { ...prev[idx], id: `block-${Date.now()}` };
      const next = [...prev];
      next.splice(idx + 1, 0, clone);
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
      title: type === "section" ? "New Section" : type === "page" ? "New Page" : "New Question",
    };
    setItems([...items, newItem]);
  };

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

            <div className="flex flex-col min-w-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-md px-2 py-1 w-fit">
                    Multi-page layout
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-background border border-border w-[150px]">
                  <DropdownMenuItem className="cursor-pointer">
                    Multi-page layout
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    Single-page layout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm font-medium text-foreground mt-0.5 truncate max-w-[180px] sm:max-w-[250px] lg:max-w-[350px] cursor-default">
                    {title.length > 40 ? `${title.slice(0, 40)}...` : title}
                  </span>
                </TooltipTrigger>
                {title.length > 40 && (
                  <TooltipContent side="bottom" className="max-w-[300px] text-sm">
                    {title}
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-border"
            >
              <Play className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-primary text-primary hover:bg-primary/5 gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Publish</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
        {/* Left Panel - Course Overview */}
        <div className="lg:w-1/2 relative overflow-hidden flex flex-col">
          {/* Blue gradient background with decorative shapes */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 pointer-events-none">
            {/* Decorative shapes */}
            <div className="absolute bottom-0 left-0 w-full h-1/3">
              <svg
                viewBox="0 0 800 300"
                className="w-full h-full"
                preserveAspectRatio="xMidYMax slice"
              >
                <ellipse
                  cx="200"
                  cy="350"
                  rx="300"
                  ry="200"
                  fill="hsl(var(--primary) / 0.15)"
                />
                <ellipse
                  cx="600"
                  cy="400"
                  rx="250"
                  ry="180"
                  fill="hsl(var(--primary) / 0.1)"
                />
                <ellipse
                  cx="400"
                  cy="380"
                  rx="200"
                  ry="150"
                  fill="hsl(var(--primary) / 0.08)"
                />
              </svg>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="relative z-10 flex-1 min-h-[300px]">
            <div className="p-6 sm:p-8 lg:p-10">
              {/* Course Title */}
              <div className="relative group">
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
                  <div className="mt-6 space-y-0">
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
                              {index === 0 && !activeId && block.type !== "description" && (
                                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                                  <AddContentButton onAddText={() => addTextBlock(0)} onAddImage={() => addImageBlock(0)} />
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

                              {!activeId && block.type !== "description" && (
                                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                                  <AddContentButton onAddText={() => addTextBlock(index + 1)} onAddImage={() => addImageBlock(index + 1)} />
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
                  <AddContentButton onAddText={() => addTextBlock()} onAddImage={() => addImageBlock()} />
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Course Outline */}
        <div className="lg:w-1/2 bg-background border-t lg:border-t-0 lg:border-l border-border flex flex-col overflow-y-auto">
            <div className="p-6 sm:p-10">
              {/* Instructions */}
              <p className="text-muted-foreground mb-6">
                Add sections, pages, and questions to build your course outline
              </p>

              {/* Add Item Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 border-border hover:border-primary/50"
                  >
                    <Plus className="w-4 h-4" />
                    Add item
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-72 bg-background border border-border p-2">
                  <DropdownMenuItem
                    onClick={() => handleAddItem("section")}
                    className="cursor-pointer flex items-start gap-3 px-3 py-3 rounded-md hover:!bg-muted/60 focus:!bg-muted/60 focus:!text-foreground transition-colors"
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
                    className="cursor-pointer flex items-start gap-3 px-3 py-3 rounded-md hover:!bg-muted/60 focus:!bg-muted/60 focus:!text-foreground transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg border border-border bg-muted/50 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-foreground">New page</span>
                      <span className="text-xs text-muted-foreground">Single learning unit to explain topics</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleAddItem("question")}
                    className="cursor-pointer flex items-start gap-3 px-3 py-3 rounded-md hover:!bg-muted/60 focus:!bg-muted/60 focus:!text-foreground transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg border border-border bg-muted/50 flex items-center justify-center shrink-0 mt-0.5">
                      <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-foreground">New question</span>
                      <span className="text-xs text-muted-foreground">Test knowledge with a quiz question</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Course Items */}
              {items.length > 0 && (
                <div className="mt-6 space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors cursor-pointer",
                        item.type === "section" && "border-l-4 border-l-primary"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            item.type === "section" && "bg-primary",
                            item.type === "page" && "bg-muted-foreground",
                            item.type === "question" && "bg-primary/50"
                          )}
                        />
                        <span className="text-sm font-medium text-foreground">
                          {item.title}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize ml-auto">
                          {item.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
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
    </div>
  );
}
