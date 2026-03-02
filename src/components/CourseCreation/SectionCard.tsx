import { useState, useRef, useEffect } from "react";
import { ChevronUp, MoreHorizontal, Plus, Image as ImageIcon, HelpCircle, Settings2, Copy, Trash2, FileText, GripVertical, ListChecks } from "lucide-react";
import { PageEditorDialog } from "./PageEditorDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SectionImageDialog } from "./SectionImageDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface SectionCardProps {
  sectionNumber: number;
  title: string;
  inclusions?: string;
  aiEnabled?: boolean;
  onTitleChange: (title: string) => void;
  onInclusionsChange?: (inclusions: string) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onOpenSection?: () => void;
  onAddPage?: () => void;
  onAddLearningObjective?: () => void;
}

const MAX_TITLE_LENGTH = 255;
const MAX_OBJECTIVE_LENGTH = 255;
const MAX_PAGE_TITLE_LENGTH = 350;

interface PageEntry {
  id: string;
  title: string;
  inclusions: string;
}

interface SortablePageRowProps {
  page: PageEntry;
  idx: number;
  isLastPage: boolean;
  newPageRef: React.RefObject<HTMLInputElement>;
  focusedPageId: string | null;
  setFocusedPageId: (id: string | null) => void;
  setPages: React.Dispatch<React.SetStateAction<PageEntry[]>>;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onInclusionsChange: (id: string, inclusions: string) => void;
  aiEnabled?: boolean;
}

function SortablePageRow({ page, idx, isLastPage, newPageRef, focusedPageId, setFocusedPageId, setPages, onDuplicate, onDelete, onInclusionsChange, aiEnabled }: SortablePageRowProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showInclusionsDialog, setShowInclusionsDialog] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const pageDisplayTitle = page.title.trim() || "Untitled page";
  const hasPageInclusions = page.inclusions.trim().length > 0;

  return (
    <>
      <div ref={setNodeRef} style={style} className="group/row flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-muted transition-all shrink-0 touch-none opacity-0 group-hover/row:opacity-100"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground/50" />
        </button>
        <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <input
            ref={isLastPage ? newPageRef : undefined}
            type="text"
            value={page.title}
            onFocus={() => setFocusedPageId(page.id)}
            onBlur={() => setFocusedPageId(null)}
            onChange={(e) => {
              if (e.target.value.length <= MAX_PAGE_TITLE_LENGTH) {
                setPages((prev) =>
                  prev.map((p) => p.id === page.id ? { ...p, title: e.target.value } : p)
                );
              }
            }}
            className={cn(
              "w-full text-sm text-foreground bg-transparent border-b-[1.5px] outline-none placeholder:text-muted-foreground/50 transition-all duration-200",
              focusedPageId === page.id ? "border-primary/50" : "border-transparent"
            )}
            placeholder="Enter page title..."
          />
        </div>
        <span className={cn(
          "text-xs text-muted-foreground tabular-nums shrink-0 transition-opacity duration-200",
          focusedPageId === page.id ? "opacity-100" : "opacity-0"
        )}>
          {page.title.length}/{MAX_PAGE_TITLE_LENGTH}
        </span>
        {hasPageInclusions && (
          <button
            onClick={() => setShowInclusionsDialog(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-medium hover:bg-primary/15 transition-colors shrink-0"
          >
            <ListChecks className="w-3 h-3" />
            Inclusions
          </button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="text-xs border-border h-8 shrink-0"
          onClick={() => setShowEditor(true)}
        >
          Open
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 rounded-md hover:bg-muted transition-colors shrink-0">
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-background border border-border p-1.5 z-50">
            <DropdownMenuItem
              onClick={() => setShowInclusionsDialog(true)}
              className="cursor-pointer gap-3 px-3 py-2 hover:!bg-muted focus:!bg-muted focus:!text-foreground"
            >
              <ListChecks className="w-4 h-4 text-muted-foreground" />
              {hasPageInclusions ? "Edit inclusions" : "Add inclusions"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDuplicate(page.id)}
              className="cursor-pointer gap-3 px-3 py-2 hover:!bg-muted focus:!bg-muted focus:!text-foreground"
            >
              <Copy className="w-4 h-4 text-muted-foreground" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="cursor-pointer gap-3 px-3 py-2 text-destructive hover:!bg-muted focus:!bg-muted focus:!text-destructive"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[480px] text-center">
          <DialogHeader className="items-center">
            <DialogTitle className="text-xl font-medium text-foreground">
              Delete content "{pageDisplayTitle}"
            </DialogTitle>
          </DialogHeader>

          <div className="my-4 rounded-lg bg-destructive/5 border border-destructive/10 px-5 py-4">
            <p className="text-sm font-semibold text-foreground mb-2 text-left">Important information:</p>
            <div className="flex items-center gap-2 text-left">
              <span className="text-destructive font-bold">!</span>
              <span className="text-sm text-muted-foreground">This action cannot be undone</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 pt-2">
            <Button
              variant="destructive"
              className="w-fit px-10 bg-[hsl(0,80%,68%)] hover:bg-[hsl(0,80%,60%)] text-white"
              onClick={() => {
                onDelete(page.id);
                setShowDeleteDialog(false);
              }}
            >
              Delete content
            </Button>
            <button
              onClick={() => setShowDeleteDialog(false)}
              className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Inclusions Dialog */}
      <Dialog open={showInclusionsDialog} onOpenChange={setShowInclusionsDialog}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-muted-foreground" />
              Inclusions
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Define the scope for "{pageDisplayTitle}"
            </p>
          </DialogHeader>
          <div className="mt-4">
            <textarea
              value={page.inclusions}
              onChange={(e) => onInclusionsChange(page.id, e.target.value)}
              autoFocus
              className="w-full text-sm text-foreground bg-muted/30 rounded-lg border border-border p-4 outline-none placeholder:text-muted-foreground/50 transition-colors duration-200 focus:border-primary/50 resize-none min-h-[140px]"
              placeholder="Define what topics, content, or scope should be included in this page..."
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.max(140, target.scrollHeight) + 'px';
              }}
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={() => setShowInclusionsDialog(false)} className="rounded-full px-6">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PageEditorDialog
        open={showEditor}
        onClose={() => setShowEditor(false)}
        pageTitle={page.title}
        aiEnabled={aiEnabled}
        onPageTitleChange={(newTitle) =>
          setPages((prev) =>
            prev.map((p) => p.id === page.id ? { ...p, title: newTitle } : p)
          )
        }
      />
    </>
  );
}

export function SectionCard({
  sectionNumber,
  title,
  inclusions = "",
  aiEnabled = false,
  onTitleChange,
  onInclusionsChange,
  onDelete,
  onDuplicate,
  onOpenSection,
  onAddPage,
  onAddLearningObjective,
}: SectionCardProps) {
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showObjective, setShowObjective] = useState(false);
  const [objectiveText, setObjectiveText] = useState("");
  const [showInclusionsDialog, setShowInclusionsDialog] = useState(false);
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [isObjectiveFocused, setIsObjectiveFocused] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [pages, setPages] = useState<PageEntry[]>([]);
  const [focusedPageId, setFocusedPageId] = useState<string | null>(null);
  const newPageRef = useRef<HTMLInputElement>(null);
  const objectiveRef = useRef<HTMLInputElement>(null);

  const handleAddPage = () => {
    const newPage: PageEntry = { id: crypto.randomUUID(), title: "", inclusions: "" };
    setPages((prev) => [...prev, newPage]);
    setTimeout(() => newPageRef.current?.focus(), 50);
  };

  const handleDeletePage = (id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
  };

  const handleDuplicatePage = (id: string) => {
    setPages((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx === -1) return prev;
      const original = prev[idx];
      const copy = { ...original, id: crypto.randomUUID() };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      
      toast({
        title: "Page duplicated",
        description: `"${original.title || "Untitled page"}" has been duplicated successfully.`,
      });
      
      return next;
    });
  };

  const pageSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handlePageDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setPages((prev) => {
      const oldIdx = prev.findIndex((p) => p.id === active.id);
      const newIdx = prev.findIndex((p) => p.id === over.id);
      return arrayMove(prev, oldIdx, newIdx);
    });
  };

  return (
    <div className="space-y-0">
      <div className="flex items-center gap-2 group/section">
        <button className="cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-muted transition-all shrink-0 touch-none opacity-0 group-hover/section:opacity-100 self-start mt-4">
          <GripVertical className="w-4 h-4 text-muted-foreground/50" />
        </button>
        {/* Section Card */}
        <div className="rounded-lg border border-border bg-card overflow-hidden flex-1 min-w-0">
        {/* Section Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <span className="text-xs font-medium text-muted-foreground">
            Section {sectionNumber}
          </span>
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 rounded-md hover:bg-muted transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-background border border-border p-1.5">
                <DropdownMenuItem
                  onClick={() => setShowInclusionsDialog(true)}
                  className="cursor-pointer gap-3 px-3 py-2.5 hover:!bg-muted focus:!bg-muted focus:!text-foreground"
                >
                  <ListChecks className="w-4 h-4 text-muted-foreground" />
                  {inclusions.trim() ? "Edit inclusions" : "Add inclusions"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowImageDialog(true)}
                  className="cursor-pointer gap-3 px-3 py-2.5 hover:!bg-muted focus:!bg-muted focus:!text-foreground"
                >
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  Change section image
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onDuplicate}
                  className="cursor-pointer gap-3 px-3 py-2.5 hover:!bg-muted focus:!bg-muted focus:!text-foreground"
                >
                  <Copy className="w-4 h-4 text-muted-foreground" />
                  Duplicate section
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="cursor-pointer gap-3 px-3 py-2.5 text-destructive hover:!bg-muted focus:!bg-muted focus:!text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete section
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
            >
              <ChevronUp className={cn(
                "w-4 h-4 text-muted-foreground transition-transform duration-300 ease-in-out",
                isCollapsed && "rotate-180"
              )} />
            </button>
          </div>
        </div>

        {/* Collapsible content area */}
        <div
          className={cn(
            "grid transition-all duration-300 ease-in-out",
            isCollapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
          )}
        >
          <div className="overflow-hidden">
            <div className="px-5 pb-5">
              <div className="flex gap-4">
                {/* Thumbnail */}
                <SectionImageDialog
                  open={showImageDialog}
                  onClose={() => setShowImageDialog(false)}
                  currentImage={thumbnailUrl}
                  onImageChange={(url) => {
                    setThumbnailUrl(url);
                    setShowImageDialog(false);
                  }}
                />
                <div
                  onClick={() => setShowImageDialog(true)}
                  className="w-[120px] h-[110px] rounded-lg border border-dashed border-border bg-muted/30 flex items-center justify-center shrink-0 group/thumb cursor-pointer hover:border-primary/40 hover:bg-muted/50 transition-all duration-200 relative overflow-hidden"
                >
                  {thumbnailUrl ? (
                    <>
                      <img src={thumbnailUrl} alt="Section thumbnail" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200">
                        <ImageIcon className="w-5 h-5 text-white mb-1" />
                        <span className="text-[10px] font-medium text-white">Change image</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-6 h-6 text-muted-foreground/40 group-hover/thumb:opacity-0 transition-opacity duration-200" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200">
                        <ImageIcon className="w-5 h-5 text-primary/60 mb-1" />
                        <span className="text-[10px] font-medium text-primary/60">Upload image</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Title and actions */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={title}
                    onFocus={() => setIsTitleFocused(true)}
                    onBlur={() => setIsTitleFocused(false)}
                    onChange={(e) => {
                      if (e.target.value.length <= MAX_TITLE_LENGTH) {
                        onTitleChange(e.target.value);
                      }
                    }}
                    className={cn(
                      "w-full text-lg font-medium text-foreground bg-transparent outline-none pb-1 placeholder:text-muted-foreground/50 transition-all duration-200",
                      isTitleFocused ? "border-b border-border-foreground/30" : "border-b border-transparent"
                    )}
                    placeholder="Untitled section"
                  />
                  <div className={cn(
                    "flex justify-end mt-1 transition-opacity duration-200",
                    isTitleFocused ? "opacity-100" : "opacity-0"
                  )}>
                    <span className="text-xs text-muted-foreground">
                      {title.length}/{MAX_TITLE_LENGTH}
                    </span>
                  </div>

                  {/* Actions row */}
                  <div className="flex items-center justify-between mt-3">
                    <button
                      onClick={() => {
                        const next = !showObjective;
                        setShowObjective(next);
                        if (next) {
                          setTimeout(() => objectiveRef.current?.focus(), 350);
                        }
                      }}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ChevronUp className={cn(
                        "w-3.5 h-3.5 transition-transform duration-200",
                        !showObjective && "rotate-180"
                      )} />
                      {showObjective ? "Hide learning objective" : "Add learning objective"}
                    </button>
                    <div className="flex items-center gap-2">
                      {inclusions.trim() && (
                        <button
                          onClick={() => setShowInclusionsDialog(true)}
                          className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-medium hover:bg-primary/15 transition-colors"
                        >
                          <ListChecks className="w-3 h-3" />
                          Inclusions
                        </button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onOpenSection}
                        className="text-sm border-border"
                      >
                        Open section
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Objective Panel */}
            <div
              className={cn(
                "grid transition-all duration-300 ease-in-out",
                showObjective ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <div className="mx-5 mb-5 rounded-lg border border-border bg-card p-5">
                  {/* Objective header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-foreground">Learning objective</span>
                      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60" />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-border gap-1.5 h-8"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                      Objective maker
                    </Button>
                  </div>

                  {/* Objective input */}
                  <input
                    ref={objectiveRef}
                    type="text"
                    value={objectiveText}
                    onFocus={() => setIsObjectiveFocused(true)}
                    onBlur={() => setIsObjectiveFocused(false)}
                    onChange={(e) => {
                      if (e.target.value.length <= MAX_OBJECTIVE_LENGTH) {
                        setObjectiveText(e.target.value);
                      }
                    }}
                    className={cn(
                      "w-full text-sm text-foreground bg-transparent border-b-[1.5px] outline-none pb-2 placeholder:text-muted-foreground/50 transition-all duration-200",
                      isObjectiveFocused ? "border-primary/40" : "border-transparent"
                    )}
                    placeholder="Enter learning objective for this section..."
                  />
                  <div className={cn(
                    "flex justify-end mt-1.5 transition-opacity duration-200",
                    isObjectiveFocused ? "opacity-100" : "opacity-0"
                  )}>
                    <span className="text-xs text-muted-foreground">
                      {objectiveText.length}/{MAX_OBJECTIVE_LENGTH}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inclusions Dialog */}
            <Dialog open={showInclusionsDialog} onOpenChange={setShowInclusionsDialog}>
              <DialogContent className="sm:max-w-[560px]">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-muted-foreground" />
                    Inclusions
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Define the scope for "{title || "Untitled section"}"
                  </p>
                </DialogHeader>
                <div className="mt-4">
                  <textarea
                    value={inclusions}
                    onChange={(e) => onInclusionsChange?.(e.target.value)}
                    autoFocus
                    className="w-full text-sm text-foreground bg-muted/30 rounded-lg border border-border p-4 outline-none placeholder:text-muted-foreground/50 transition-colors duration-200 focus:border-primary/50 resize-none min-h-[140px]"
                    placeholder="Define what topics, content, or scope should be included in this section..."
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = Math.max(140, target.scrollHeight) + 'px';
                    }}
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <Button onClick={() => setShowInclusionsDialog(false)} className="rounded-full px-6">
                    Done
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="px-5 pt-3 pb-4 space-y-3">
              {pages.length > 0 && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-muted-foreground">Pages:</span>
                  <span className="text-xs font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">{pages.length}</span>
                </div>
              )}

              <DndContext
                sensors={pageSensors}
                collisionDetection={closestCenter}
                onDragEnd={handlePageDragEnd}
              >
                <SortableContext items={pages.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  {pages.map((page, idx) => (
                    <div key={page.id}>
                      {idx > 0 && (
                        <div className="mx-1 my-1.5 border-t border-border/40" />
                      )}
                      <SortablePageRow
                        page={page}
                        idx={idx}
                        isLastPage={idx === pages.length - 1}
                        newPageRef={newPageRef}
                        focusedPageId={focusedPageId}
                        setFocusedPageId={setFocusedPageId}
                        setPages={setPages}
                        onDuplicate={handleDuplicatePage}
                        onDelete={handleDeletePage}
                        onInclusionsChange={(id, val) => {
                          setPages((prev) =>
                            prev.map((p) => p.id === id ? { ...p, inclusions: val } : p)
                          );
                        }}
                        aiEnabled={aiEnabled}
                      />
                    </div>
                  ))}
                </SortableContext>
              </DndContext>

              <button
                onClick={handleAddPage}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add page
              </button>
            </div>

            {/* Dashed divider */}
            <div className="border-b border-dashed border-border" />
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
