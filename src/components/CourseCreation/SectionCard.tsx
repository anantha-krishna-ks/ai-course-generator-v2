import { useState, useRef } from "react";
import { ChevronDown, MoreHorizontal, Plus, Image as ImageIcon, HelpCircle, Copy, Trash2, FileText, GripVertical, ListChecks, Crosshair, ChevronRight, ExternalLink, Upload, X } from "lucide-react";
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
import { ImageBlock } from "./ImageBlock";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface PageEntry {
  id: string;
  title: string;
  inclusions: string;
  exclusions: string;
}

interface SectionCardProps {
  sectionNumber: number;
  title: string;
  inclusions?: string;
  exclusions?: string;
  aiEnabled?: boolean;
  thumbnailUrl?: string | null;
  onThumbnailChange?: (url: string | null) => void;
  onTitleChange: (title: string) => void;
  onInclusionsChange?: (inclusions: string) => void;
  onExclusionsChange?: (exclusions: string) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onOpenSection?: () => void;
  onAddPage?: () => void;
  onAddLearningObjective?: () => void;
  objective?: string;
  onObjectiveChange?: (objective: string) => void;
  pages?: PageEntry[];
  onPagesChange?: (pages: PageEntry[]) => void;
}

const MAX_TITLE_LENGTH = 255;
const MAX_OBJECTIVE_LENGTH = 255;
const MAX_PAGE_TITLE_LENGTH = 350;

interface SortablePageRowProps {
  page: PageEntry;
  idx: number;
  totalPages: number;
  isLastPage: boolean;
  newPageRef: React.RefObject<HTMLInputElement>;
  focusedPageId: string | null;
  setFocusedPageId: (id: string | null) => void;
  setPages: React.Dispatch<React.SetStateAction<PageEntry[]>>;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onInclusionsChange: (id: string, inclusions: string) => void;
  onExclusionsChange: (id: string, exclusions: string) => void;
  aiEnabled?: boolean;
}

function SortablePageRow({ page, idx, totalPages, isLastPage, newPageRef, focusedPageId, setFocusedPageId, setPages, onDuplicate, onDelete, onInclusionsChange, onExclusionsChange, aiEnabled }: SortablePageRowProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showInclusionsDialog, setShowInclusionsDialog] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const pageDisplayTitle = page.title.trim() || "Untitled page";
  const hasPageInclusions = page.inclusions.trim().length > 0;
  const hasPageExclusions = page.exclusions.trim().length > 0;
  const hasPageScope = hasPageInclusions || hasPageExclusions;
  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="group/row relative flex items-center"
      >
        {/* Tree connector line */}
        <div className="relative w-6 flex items-center justify-center shrink-0 self-stretch">
          {/* Vertical line */}
          <div className={cn(
            "absolute left-1/2 -translate-x-1/2 w-px bg-border/50",
            idx === 0 ? "top-1/2 bottom-0" : isLastPage ? "top-0 h-1/2" : "inset-y-0"
          )} />
          {/* Horizontal branch */}
          <div className="absolute left-1/2 top-1/2 -translate-y-1/2 w-3 h-px bg-border/50" />
          {/* Dot */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-muted-foreground/20 border-2 border-background z-10 group-hover/row:bg-primary/50 transition-colors" />
        </div>

        {/* Page card */}
        <div className="flex-1 flex items-center gap-2.5 py-2.5 pr-3 pl-2.5 rounded-xl border border-border/60 bg-card shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] hover:border-border hover:shadow-sm transition-all duration-150 min-w-0 my-0.5">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-0.5 rounded shrink-0 touch-none opacity-0 group-hover/row:opacity-60 hover:!opacity-100 transition-opacity"
          >
            <GripVertical className="w-3 h-3 text-muted-foreground" />
          </button>
          <div className="w-6 h-6 rounded-md bg-accent/60 flex items-center justify-center shrink-0">
            <FileText className="w-3 h-3 text-muted-foreground/60" />
          </div>
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
              className="w-full text-[13px] font-medium text-foreground bg-transparent outline-none placeholder:text-muted-foreground/35"
              placeholder="Untitled page..."
            />
          </div>
          <span className={cn(
            "text-[9px] text-muted-foreground/50 tabular-nums shrink-0 transition-opacity duration-200",
            focusedPageId === page.id ? "opacity-100" : "opacity-0"
          )}>
            {page.title.length}/{MAX_PAGE_TITLE_LENGTH}
          </span>
          {hasPageScope && (
            <button
              onClick={() => setShowInclusionsDialog(true)}
              className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 hover:bg-primary/20 transition-colors"
              title="View scope"
            >
              <ListChecks className="w-2.5 h-2.5 text-primary" />
            </button>
          )}
          <button
            onClick={() => setShowEditor(true)}
            className="flex items-center gap-0.5 text-[11px] font-medium text-muted-foreground/50 hover:text-primary transition-colors shrink-0"
          >
            Open
            <ChevronRight className="w-3 h-3" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-md hover:bg-muted transition-colors shrink-0">
                <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-background border border-border p-1.5 z-50">
              <DropdownMenuItem
                onClick={() => setShowInclusionsDialog(true)}
                className="cursor-pointer gap-3 px-3 py-2 hover:!bg-muted focus:!bg-muted focus:!text-foreground"
              >
                <ListChecks className="w-4 h-4 text-muted-foreground" />
                {hasPageScope ? "Edit scope" : "Add scope"}
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
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[480px] text-center">
          <DialogHeader className="items-center">
            <DialogTitle className="text-xl font-medium text-foreground">
              Delete "{pageDisplayTitle}"
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
              Delete
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

      {/* Scope Dialog for Page */}
      <Dialog open={showInclusionsDialog} onOpenChange={setShowInclusionsDialog}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-muted-foreground" />
              Scope
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Define the scope for "{pageDisplayTitle}"
            </p>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground/70 mb-1.5 block">Inclusions</label>
              <textarea
                value={page.inclusions}
                onChange={(e) => onInclusionsChange(page.id, e.target.value)}
                autoFocus
                className="w-full text-sm text-foreground bg-muted/30 rounded-lg border border-border p-4 outline-none placeholder:text-muted-foreground/50 transition-colors duration-200 focus:border-primary/50 resize-none min-h-[120px]"
                placeholder="Define what topics, content, or scope should be included in this page..."
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.max(120, target.scrollHeight) + 'px';
                }}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground/70 mb-1.5 block">Exclusions</label>
              <textarea
                value={page.exclusions}
                onChange={(e) => onExclusionsChange(page.id, e.target.value)}
                className="w-full text-sm text-foreground bg-muted/30 rounded-lg border border-border p-4 outline-none placeholder:text-muted-foreground/50 transition-colors duration-200 focus:border-primary/50 resize-none min-h-[120px]"
                placeholder="Define what topics or content should be excluded from this page..."
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.max(120, target.scrollHeight) + 'px';
                }}
              />
            </div>
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
  exclusions = "",
  aiEnabled = false,
  thumbnailUrl: externalThumbnail,
  onThumbnailChange,
  onTitleChange,
  onInclusionsChange,
  onExclusionsChange,
  onDelete,
  onDuplicate,
  onOpenSection,
  onAddPage,
  onAddLearningObjective,
  objective: externalObjective,
  onObjectiveChange,
  pages: externalPages,
  onPagesChange,
}: SectionCardProps) {
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showObjective, setShowObjective] = useState(!!(externalObjective && externalObjective.trim()));
  const objectiveText = externalObjective ?? "";
  const setObjectiveText = (val: string) => onObjectiveChange?.(val);
  const [showInclusionsDialog, setShowInclusionsDialog] = useState(false);
  const [inclusionDocs, setInclusionDocs] = useState<string[]>([]);
  const [exclusionDocs, setExclusionDocs] = useState<string[]>([]);
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [isObjectiveFocused, setIsObjectiveFocused] = useState(false);
  const [internalThumbnail, setInternalThumbnail] = useState<string | null>(null);
  const thumbnailUrl = externalThumbnail !== undefined ? externalThumbnail : internalThumbnail;
  const setThumbnailUrl = (url: string | null) => {
    if (onThumbnailChange) onThumbnailChange(url);
    else setInternalThumbnail(url);
  };
  const [showImageBlock, setShowImageBlock] = useState(false);
  const [internalPages, setInternalPages] = useState<PageEntry[]>([]);
  const [focusedPageId, setFocusedPageId] = useState<string | null>(null);
  const newPageRef = useRef<HTMLInputElement>(null);
  const objectiveRef = useRef<HTMLInputElement>(null);

  const pages = externalPages ?? internalPages;
  const setPages: React.Dispatch<React.SetStateAction<PageEntry[]>> = (action) => {
    if (onPagesChange) {
      const newPages = typeof action === 'function' ? action(pages) : action;
      onPagesChange(newPages);
    } else {
      setInternalPages(action);
    }
  };

  const handleAddPage = () => {
    const newPage: PageEntry = { id: crypto.randomUUID(), title: "", inclusions: "", exclusions: "" };
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

  const hasInclusions = inclusions.trim().length > 0;
  const hasExclusions = exclusions.trim().length > 0;
  const hasScope = hasInclusions || hasExclusions;

  return (
    <div className="group/section">
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button className="cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-muted transition-all shrink-0 touch-none opacity-0 group-hover/section:opacity-60 hover:!opacity-100 mt-3">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="flex-1 min-w-0">
          {/* Section card with left accent */}
          <div className="relative rounded-xl border border-border bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.04),0_1px_2px_-1px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-200 hover:border-border hover:shadow-sm">
            {/* Left accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/40 rounded-l-xl" />

            {/* Header */}
            <div className="pl-5 pr-4 pt-3.5 pb-3 flex items-center gap-3">
              {/* Section number pill */}
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70 bg-primary/8 px-2.5 py-1 rounded-full shrink-0">
                {sectionNumber.toString().padStart(2, '0')}
              </span>

              {/* Title */}
              <div className="flex-1 min-w-0 relative">
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
                  className="w-full text-sm font-semibold text-foreground bg-transparent outline-none placeholder:text-muted-foreground/35 transition-all"
                  placeholder="Untitled section..."
                />
                <div className={cn(
                  "absolute -bottom-0.5 left-0 right-0 h-px bg-primary/30 transition-all duration-200 origin-left",
                  isTitleFocused ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
                )} />
              </div>

              <span className={cn(
                "text-[9px] text-muted-foreground/50 tabular-nums shrink-0 transition-opacity",
                isTitleFocused ? "opacity-100" : "opacity-0"
              )}>
                {title.length}/{MAX_TITLE_LENGTH}
              </span>

              {/* Quick actions */}
              <div className="flex items-center gap-1 shrink-0">
                {hasScope && (
                  <button
                    onClick={() => setShowInclusionsDialog(true)}
                    className="p-1.5 rounded-md text-primary hover:bg-primary/10 transition-colors"
                    title="View scope"
                  >
                    <ListChecks className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => {
                    if (isCollapsed) setIsCollapsed(false);
                    onOpenSection?.();
                  }}
                  className="flex items-center gap-0.5 text-[11px] font-medium text-muted-foreground/50 hover:text-primary transition-colors shrink-0"
                >
                  Open
                  <ChevronRight className="w-3 h-3" />
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-7 h-7 rounded-lg border border-border bg-muted/50 hover:bg-muted data-[state=open]:bg-primary/10 data-[state=open]:border-primary/30 flex items-center justify-center transition-colors shrink-0 group/trigger">
                      <MoreHorizontal className="w-4 h-4 text-foreground/70 group-data-[state=open]/trigger:text-primary transition-colors" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 bg-background border border-border p-1.5">
                    <DropdownMenuItem
                      onClick={() => setShowInclusionsDialog(true)}
                      className="cursor-pointer gap-3 px-3 py-2.5 hover:!bg-muted focus:!bg-muted focus:!text-foreground"
                    >
                      <ListChecks className="w-4 h-4 text-muted-foreground" />
                      {hasScope ? "Edit scope" : "Add scope"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setShowObjective(!showObjective);
                        if (!showObjective) setTimeout(() => objectiveRef.current?.focus(), 350);
                      }}
                      className="cursor-pointer gap-3 px-3 py-2.5 hover:!bg-muted focus:!bg-muted focus:!text-foreground"
                    >
                      <Crosshair className="w-4 h-4 text-muted-foreground" />
                      {showObjective ? "Hide objective" : "Add objective"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={onOpenSection}
                      className="cursor-pointer gap-3 px-3 py-2.5 hover:!bg-muted focus:!bg-muted focus:!text-foreground"
                    >
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      Open section
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={onDuplicate}
                      className="cursor-pointer gap-3 px-3 py-2.5 hover:!bg-muted focus:!bg-muted focus:!text-foreground"
                    >
                      <Copy className="w-4 h-4 text-muted-foreground" />
                      Duplicate
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
                  <ChevronDown className={cn(
                    "w-3.5 h-3.5 text-muted-foreground/50 transition-transform duration-300",
                    isCollapsed && "-rotate-90"
                  )} />
                </button>
              </div>
            </div>

            {/* Inline image block - always visible */}
            <div className="px-4 pt-2 pb-1">
              <ImageBlock
                imageUrl={thumbnailUrl || ""}
                onChange={(url) => {
                  setThumbnailUrl(url);
                }}
              />
            </div>

            {/* Learning Objective (inline, collapsible) */}
            <div className={cn(
              "grid transition-all duration-300 ease-in-out",
              showObjective ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            )}>
              <div className="overflow-hidden">
                <div className="pl-5 pr-4 pb-3">
                  <div className="flex items-center gap-2 rounded-lg bg-accent/40 px-3 py-2.5">
                    <Crosshair className="w-3.5 h-3.5 text-primary/50 shrink-0" />
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
                      className="flex-1 text-xs text-foreground bg-transparent outline-none placeholder:text-muted-foreground/35"
                      placeholder="What will learners achieve?"
                    />
                    <span className={cn(
                      "text-[9px] text-muted-foreground/50 tabular-nums transition-opacity",
                      isObjectiveFocused ? "opacity-100" : "opacity-0"
                    )}>
                      {objectiveText.length}/{MAX_OBJECTIVE_LENGTH}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Collapsible pages area */}
            <div className={cn(
              "grid transition-all duration-300 ease-in-out",
              isCollapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
            )}>
              <div className="overflow-hidden">
                {/* Pages tree */}
                <div className="pl-8 pr-3 pb-3">
                  {/* Empty state */}
                  {pages.length === 0 && (
                    <div className="flex items-center gap-3 py-4 px-3 rounded-lg border border-dashed border-border/50 bg-accent/20 mb-2">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-muted-foreground/40" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground/70">No pages yet</p>
                        <p className="text-[11px] text-muted-foreground/50 mt-0.5">Add pages to build this section's content</p>
                      </div>
                    </div>
                  )}
                  <DndContext
                    sensors={pageSensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handlePageDragEnd}
                  >
                    <SortableContext items={pages.map(p => p.id)} strategy={verticalListSortingStrategy}>
                      {pages.map((page, idx) => (
                        <SortablePageRow
                          key={page.id}
                          page={page}
                          idx={idx}
                          totalPages={pages.length}
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
                          onExclusionsChange={(id, val) => {
                            setPages((prev) =>
                              prev.map((p) => p.id === id ? { ...p, exclusions: val } : p)
                            );
                          }}
                          aiEnabled={aiEnabled}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>

                  {/* Add page button (tree-style) */}
                  <div className="relative flex items-center">
                    <div className="relative w-6 flex items-center justify-center shrink-0 self-stretch">
                      {pages.length > 0 && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-0 h-1/2 w-px bg-border/50" />
                      )}
                      <div className={cn(
                        "absolute left-1/2 top-1/2 -translate-y-1/2 w-3 h-px bg-border/50",
                        pages.length > 0 ? "opacity-100" : "opacity-0"
                      )} />
                    </div>
                    <button
                      onClick={handleAddPage}
                      className="flex items-center gap-1.5 py-2 pl-2 pr-3 rounded-lg text-[12px] text-muted-foreground/50 hover:text-primary hover:bg-primary/5 transition-all duration-150 group/add"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add page</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Scope Dialog */}
      <Dialog open={showInclusionsDialog} onOpenChange={setShowInclusionsDialog}>
        <DialogContent className="w-[95vw] max-w-[1100px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-muted-foreground" />
              Scope
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Define the scope for "{title || "Untitled section"}"
            </p>
          </DialogHeader>
          <div className="mt-4 flex flex-col md:flex-row gap-0 md:gap-0">
            {/* Inclusions */}
            <div className="flex-1 rounded-xl border border-border bg-muted/20 p-4">
              <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider mb-2.5 block">Inclusions</label>
              <textarea
                value={inclusions}
                onChange={(e) => onInclusionsChange?.(e.target.value)}
                autoFocus
                className="w-full text-sm text-foreground bg-background rounded-lg border border-border p-4 outline-none placeholder:text-muted-foreground/50 transition-colors duration-200 focus:border-primary/50 resize-none min-h-[150px]"
                placeholder="Define what topics, content, or scope should be included in this section..."
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.max(150, target.scrollHeight) + 'px';
                }}
              />
              <ScopeDocUploadZone
                documents={inclusionDocs}
                onDocumentsChange={setInclusionDocs}
              />
            </div>

            {/* Divider */}
            <div className="hidden md:flex flex-col items-center justify-center px-1 py-4">
              <div className="flex-1 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
              <div className="w-6 h-6 rounded-full border border-border bg-background flex items-center justify-center my-2 shrink-0">
                <span className="text-[9px] font-semibold text-muted-foreground/60">vs</span>
              </div>
              <div className="flex-1 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
            </div>
            <div className="flex md:hidden items-center gap-3 py-3 px-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              <span className="text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-widest">vs</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>

            {/* Exclusions */}
            <div className="flex-1 rounded-xl border border-border bg-muted/20 p-4">
              <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider mb-2.5 block">Exclusions</label>
              <textarea
                value={exclusions}
                onChange={(e) => onExclusionsChange?.(e.target.value)}
                className="w-full text-sm text-foreground bg-background rounded-lg border border-border p-4 outline-none placeholder:text-muted-foreground/50 transition-colors duration-200 focus:border-primary/50 resize-none min-h-[150px]"
                placeholder="Define what topics or content should be excluded from this section..."
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.max(150, target.scrollHeight) + 'px';
                }}
              />
              <ScopeDocUploadZone
                documents={exclusionDocs}
                onDocumentsChange={setExclusionDocs}
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={() => setShowInclusionsDialog(false)} className="rounded-full px-6">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ScopeDocUploadZone({
  documents,
  onDocumentsChange,
}: {
  documents: string[];
  onDocumentsChange: (docs: string[]) => void;
}) {
  return (
    <div className="space-y-2 mt-2">
      {documents.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {documents.map((doc, i) => (
            <Badge key={i} variant="secondary" className="gap-1.5 text-xs font-normal h-6 pr-1.5">
              <FileText className="w-3 h-3" />
              {doc}
              <button
                type="button"
                onClick={() => onDocumentsChange(documents.filter((_, idx) => idx !== i))}
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <div
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary', 'bg-primary/5'); }}
        onDragLeave={(e) => { e.currentTarget.classList.remove('border-primary', 'bg-primary/5'); }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
          const files = Array.from(e.dataTransfer.files);
          if (files.length > 0) {
            onDocumentsChange([...documents, ...files.map(f => f.name)]);
          }
        }}
        onClick={() => onDocumentsChange([...documents, `Reference_${Date.now().toString(36)}.pdf`])}
        className="w-full border border-dashed border-primary/50 rounded-lg py-3 text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
      >
        <Upload className="w-3.5 h-3.5" />
        <span className="font-medium">Attach reference document</span>
      </div>
    </div>
  );
}
