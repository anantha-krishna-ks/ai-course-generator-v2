import { useState, useCallback } from "react";
import { X, FileText, LayoutGrid, Plus, Sparkles, Type, ImageIcon, Video, FileText as DocIcon, Layers, MoreHorizontal, MessageSquare, Mic, Play, ChevronLeft, ChevronRight, ChevronUp, MoreHorizontal as Dots, Undo2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
} from "@dnd-kit/sortable";
import { ContentBlock } from "./ContentBlock";
import { TooltipProvider } from "@/components/ui/tooltip";

interface PageContentBlock {
  id: string;
  type: "text" | "image";
  content: string;
}

interface PageEditorDialogProps {
  open: boolean;
  onClose: () => void;
  pageTitle: string;
  onPageTitleChange: (title: string) => void;
  aiEnabled?: boolean;
}

export function PageEditorDialog({ open, onClose, pageTitle, onPageTitleChange, aiEnabled = false }: PageEditorDialogProps) {
  const [activeTab, setActiveTab] = useState<"outline" | "blocks">("outline");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [blocks, setBlocks] = useState<PageContentBlock[]>([]);
  const [lastAddedBlockId, setLastAddedBlockId] = useState<string | null>(null);
  const [deletedBlocks, setDeletedBlocks] = useState<Map<string, { block: PageContentBlock; index: number }>>(new Map());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const addBlock = useCallback((type: "text" | "image") => {
    const id = `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const defaultContent = type === "text"
      ? "<p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>"
      : "";
    setBlocks((prev) => [...prev, { id, type, content: defaultContent }]);
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
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[98vw] w-[1600px] h-[95vh] p-0 gap-0 overflow-hidden flex flex-col [&>button]:hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
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
              sidebarCollapsed ? "w-0 overflow-hidden border-r-0" : "w-[380px]"
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
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === "outline" ? (
                <div className="space-y-4">
                  {/* Navigate to */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Navigate to:</span>
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 border-border">
                      <Plus className="w-3 h-3" />
                      Add
                    </Button>
                  </div>

                  {/* Current page - highlighted */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary/5 border-l-2 border-primary">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm text-foreground truncate">
                      {pageTitle || "Untitled page"}
                    </span>
                  </div>

                  {/* Section placeholder */}
                  <div className="rounded-lg border border-border bg-card p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Section 1</span>
                      <div className="flex items-center gap-1">
                        <button className="p-1 rounded-md hover:bg-muted transition-colors">
                          <Dots className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button className="p-1 rounded-md hover:bg-muted transition-colors">
                          <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-foreground block">Untitled section</span>
                    <div className="flex items-center gap-2 px-2 py-1.5">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Untitled page</span>
                    </div>
                    <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <Plus className="w-3 h-3" />
                      Add page
                    </button>
                    <div className="border-t border-dashed border-border" />
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-8">
                  Content blocks will appear here
                </div>
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
            <div className="max-w-[800px] mx-auto py-10 px-8">
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


              {/* Content type toolbar */}
              <div className="rounded-full border border-border bg-muted/30 px-3 py-2 flex items-center gap-1.5 w-fit">
                {aiEnabled && (
                  <button
                    className="relative gap-2 text-sm h-9 rounded-full px-5 flex items-center font-medium text-foreground/90 hover:bg-primary/5 transition-colors duration-200"
                  >
                    <span
                      className="absolute inset-0 rounded-full p-[1.5px]"
                      style={{
                        background: 'linear-gradient(135deg, hsl(217, 91%, 70%), hsl(280, 65%, 65%), hsl(217, 91%, 55%))',
                      }}
                    >
                      <span className="block w-full h-full rounded-full bg-background" />
                    </span>
                    <Sparkles className="w-4 h-4 relative" />
                    <span className="relative">Create with AI</span>
                  </button>
                )}
                <Button variant="ghost" className="gap-2 text-muted-foreground text-sm h-9 rounded-full hover:text-foreground px-4" onClick={() => addBlock("text")}>
                  <Type className="w-4 h-4" />
                  Text
                </Button>
                <Button variant="ghost" className="gap-2 text-muted-foreground text-sm h-9 rounded-full hover:text-foreground px-4" onClick={() => addBlock("image")}>
                  <ImageIcon className="w-4 h-4" />
                  Image
                </Button>
                <Button variant="ghost" className="gap-2 text-muted-foreground text-sm h-9 rounded-full hover:text-foreground px-4">
                  <Video className="w-4 h-4" />
                  Video
                </Button>
                <Button variant="ghost" className="gap-2 text-muted-foreground text-sm h-9 rounded-full hover:text-foreground px-4">
                  <Mic className="w-4 h-4" />
                  Audio
                </Button>
                <Button variant="ghost" className="gap-2 text-muted-foreground text-sm h-9 rounded-full hover:text-foreground px-4">
                  <DocIcon className="w-4 h-4" />
                  Doc
                </Button>
                <Button variant="ghost" className="gap-2 text-muted-foreground text-sm h-9 rounded-full hover:text-foreground px-4">
                  <MessageSquare className="w-4 h-4" />
                  Quiz
                </Button>
              </div>

              {/* Content blocks with inline undo banners */}
              {(blocks.length > 0 || deletedBlocks.size > 0) ? (
                <TooltipProvider delayDuration={300}>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                      <div className="mt-6 space-y-4">
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
                              position++;
                              continue;
                            }

                            if (blockIdx < blocks.length) {
                              const block = blocks[blockIdx];
                              elements.push(
                                <ContentBlock
                                  key={block.id}
                                  id={block.id}
                                  type={block.type}
                                  content={block.content}
                                  onChange={(content) => updateBlock(block.id, content)}
                                  onDelete={() => deleteBlock(block.id)}
                                  onDuplicate={() => duplicateBlock(block.id)}
                                  autoFocus={block.id === lastAddedBlockId}
                                />
                              );
                              blockIdx++;
                              position++;
                            } else {
                              break;
                            }
                          }

                          // Remaining deleted banners at the end
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
              ) : (
                <div className="min-h-[300px]" />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
