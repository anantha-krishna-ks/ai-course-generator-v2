import { useState, useCallback, useRef, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, Play, Share2, Plus, X, Undo2, FileStack, Layers, HelpCircle, Sparkles, Image, Type } from "lucide-react";
import { GuidedTour, type TourStep } from "@/components/GuidedTour/GuidedTour";
import type { AIOptions } from "@/components/Dashboard/AIOptionsPanel";
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

interface SinglePageCourseCreatorProps {
  courseTitle: string;
  aiOptions?: AIOptions | null;
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

export function SinglePageCourseCreator({ courseTitle, aiOptions: initialAIOptions = null }: SinglePageCourseCreatorProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState(courseTitle);
  const [showTour, setShowTour] = useState(true);
  const [tourStep, setTourStep] = useState(0);
  const [contentBlocks, setContentBlocks] = useState<ContentBlockData[]>([
    { id: "description-block", type: "description", content: "" },
  ]);
  const [aiOptions, setAIOptions] = useState<AIOptions | null>(initialAIOptions);
  const [deletedBlocks, setDeletedBlocks] = useState<Map<string, DeletedBlock>>(new Map());
  const deleteTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const tourSteps: TourStep[] = [
    {
      target: "course-heading",
      icon: <Type className="w-5 h-5 text-muted-foreground" />,
      title: "Course Title",
      description: "Click to edit your course title.",
      placement: "bottom",
    },
    {
      target: "content-blocks",
      icon: <Image className="w-5 h-5 text-muted-foreground" />,
      title: "Content Area",
      description: "Add text, images, and other content blocks to build your course.",
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
    if (id === "description-block") {
      setContentBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, content: "" } : b))
      );
      return;
    }

    const idx = contentBlocks.findIndex((b) => b.id === id);
    if (idx === -1) return;
    const block = contentBlocks[idx];

    setDeletedBlocks((prev) => {
      const next = new Map(prev);
      next.set(id, { block, index: idx });
      return next;
    });

    setContentBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const undoDelete = (id: string) => {
    const deleted = deletedBlocks.get(id);
    if (!deleted) return;

    const timer = deleteTimers.current.get(id);
    if (timer) clearTimeout(timer);
    deleteTimers.current.delete(id);

    setContentBlocks((prev) => {
      const next = [...prev];
      const insertAt = Math.min(deleted.index, next.length);
      next.splice(insertAt, 0, deleted.block);
      return next;
    });

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 text-xs font-medium text-foreground transition-colors rounded-md px-3 py-1.5 border border-border bg-muted/50 hover:bg-muted w-fit shadow-sm">
                    <FileStack className="w-3.5 h-3.5 text-muted-foreground" />
                    Single-page layout
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="z-50 bg-background border border-border w-[220px] p-1.5">
                  <DropdownMenuItem
                    onClick={() => {
                      navigate("/create-course-multipage", {
                        state: {
                          title,
                          layout: "multi-page",
                          aiOptions: aiOptions?.enabled ? aiOptions : null,
                        },
                      });
                    }}
                    className="cursor-pointer gap-3 px-3 py-2.5 hover:!bg-muted focus:!bg-muted focus:!text-foreground rounded-md"
                  >
                    <Layers className="w-4 h-4 text-muted-foreground" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">Multi-page</span>
                      <span className="text-[11px] text-muted-foreground">Sections with multiple pages</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer gap-3 px-3 py-2.5 hover:!bg-muted focus:!bg-muted focus:!text-foreground rounded-md">
                    <FileStack className="w-4 h-4 text-muted-foreground" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">Single-page</span>
                      <span className="text-[11px] text-muted-foreground">All content on one page</span>
                    </div>
                    <span className="ml-auto"><svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3" data-tour="header-actions">
            <AIHeaderButton aiOptions={aiOptions} onOptionsChange={setAIOptions} />
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-border"
              onClick={() => {
                // Preview for single page
                toast({ title: "Preview", description: "Single-page preview coming soon." });
              }}
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

      {/* Main Content - Single column, full width */}
      <div className="h-[calc(100vh-4rem)] overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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
              <div className="absolute bottom-0 left-0 w-full h-px bg-transparent group-focus-within:bg-primary transition-colors duration-200" />
            </div>

            {/* Character count */}
            <div className="mt-2">
              <span className="inline-block px-2 py-0.5 text-xs text-muted-foreground bg-muted/50 rounded border border-border">
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
                <div className="space-y-0 overflow-hidden" data-tour="content-blocks">
                  {(() => {
                    const deletedArr = Array.from(deletedBlocks.entries()).sort(
                      ([, a], [, b]) => a.index - b.index
                    );
                    const elements: React.ReactNode[] = [];
                    let blockIdx = 0;
                    let deletedIdx = 0;
                    let position = 0;

                    while (blockIdx < contentBlocks.length || deletedIdx < deletedArr.length) {
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

            {/* Add content button when no non-description blocks exist */}
            {contentBlocks.filter((b) => b.type !== "description").length === 0 && (
              <div className="mt-6">
                <AddContentButton onAddText={() => addTextBlock()} onAddImage={() => addImageBlock()} forceOpen={tourStep === 1} />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

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
