import { useState, useRef, useEffect } from "react";
import { FileText, MoreHorizontal, Copy, Trash2, GripVertical, ListChecks, ChevronRight } from "lucide-react";
import { PageEditorDialog } from "./PageEditorDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CourseOutlineItem {
  id: string;
  type: "section" | "page" | "question";
  title: string;
  children?: CourseOutlineItem[];
}

interface PageContentBlock {
  id: string;
  type: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description";
  content: string;
}

interface PageItemCardProps {
  id?: string;
  title: string;
  inclusions?: string;
  exclusions?: string;
  aiEnabled?: boolean;
  onTitleChange: (title: string) => void;
  onInclusionsChange?: (inclusions: string) => void;
  onExclusionsChange?: (exclusions: string) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onRenameItem?: (id: string, newTitle: string) => void;
  onDeleteItem?: (id: string) => void;
  onDuplicateItem?: (id: string) => void;
  onAddPageToSection?: (sectionId: string) => void;
  onReorderItems?: (activeId: string, overId: string) => void;
  onReorderChildItems?: (sectionId: string, activeId: string, overId: string) => void;
  onNavigateToPage?: (pageId: string) => void;
  editorOpen?: boolean;
  onOpenEditor?: () => void;
  onCloseEditor?: () => void;
  autoFocus?: boolean;
  courseItems?: CourseOutlineItem[];
  initialBlocks?: PageContentBlock[];
  onBlocksChange?: (blocks: PageContentBlock[]) => void;
  onAddItem?: (type: "section" | "page") => void;
}

const MAX_PAGE_TITLE_LENGTH = 350;

export function PageItemCard({ id, title, inclusions = "", exclusions = "", onTitleChange, onInclusionsChange, onExclusionsChange, onDelete, onDuplicate, onRenameItem, onDeleteItem, onDuplicateItem, onAddPageToSection, onReorderItems, onReorderChildItems, onNavigateToPage, editorOpen, onOpenEditor, onCloseEditor, autoFocus, aiEnabled = false, courseItems = [], initialBlocks, onBlocksChange, onAddItem }: PageItemCardProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showScopeDialog, setShowScopeDialog] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [autoFocus]);

  const displayTitle = title.trim() || "Untitled page";
  const hasInclusions = inclusions.trim().length > 0;
  const hasExclusions = exclusions.trim().length > 0;
  const hasScope = hasInclusions || hasExclusions;

  return (
    <>
      <div className="flex items-center gap-2 group/page">
        <button className="cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-muted transition-all shrink-0 touch-none opacity-0 group-hover/page:opacity-60 hover:!opacity-100">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="relative flex-1 min-w-0 rounded-xl border border-border/60 bg-card overflow-hidden transition-all duration-200 hover:border-border hover:shadow-sm">
          {/* Left accent — lighter than section to show hierarchy difference */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-muted-foreground/15 rounded-l-xl" />

          <div className="flex items-center gap-3 pl-5 pr-4 py-3">
            <div className="w-7 h-7 rounded-lg bg-accent/60 flex items-center justify-center shrink-0">
              <FileText className="w-3.5 h-3.5 text-muted-foreground/60" />
            </div>
            <div className="flex-1 min-w-0 relative">
              <input
                ref={inputRef}
                type="text"
                value={title}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_PAGE_TITLE_LENGTH) {
                    onTitleChange(e.target.value);
                  }
                }}
                className="w-full text-sm font-medium text-foreground bg-transparent outline-none placeholder:text-muted-foreground/35 transition-all"
                placeholder="Untitled page..."
              />
              <div className={cn(
                "absolute -bottom-0.5 left-0 right-0 h-px bg-primary/30 transition-all duration-200 origin-left",
                isFocused ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
              )} />
            </div>
            <span className={cn(
              "text-[9px] text-muted-foreground/50 tabular-nums shrink-0 transition-opacity",
              isFocused ? "opacity-100" : "opacity-0"
            )}>
              {title.length}/{MAX_PAGE_TITLE_LENGTH}
            </span>
            {hasInclusions && (
              <button
                onClick={() => setShowInclusionsDialog(true)}
                className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 hover:bg-primary/20 transition-colors"
                title="View inclusions"
              >
                <ListChecks className="w-2.5 h-2.5 text-primary" />
              </button>
            )}
            <button
              onClick={() => onOpenEditor?.()}
              className="flex items-center gap-0.5 text-[11px] font-medium text-muted-foreground/50 hover:text-primary transition-colors shrink-0"
            >
              Open
              <ChevronRight className="w-3 h-3" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 rounded-md hover:bg-muted transition-colors shrink-0">
                  <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground/50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-background border border-border p-1.5 z-50">
                <DropdownMenuItem
                  onClick={() => setShowInclusionsDialog(true)}
                  className="cursor-pointer gap-3 px-3 py-2 hover:!bg-muted focus:!bg-muted focus:!text-foreground"
                >
                  <ListChecks className="w-4 h-4 text-muted-foreground" />
                  {hasInclusions ? "Edit inclusions" : "Add inclusions"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDuplicate}
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
              Define the scope for "{displayTitle}"
            </p>
          </DialogHeader>
          <div className="mt-4">
            <textarea
              value={inclusions}
              onChange={(e) => onInclusionsChange?.(e.target.value)}
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

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[480px] text-center">
          <DialogHeader className="items-center">
            <DialogTitle className="text-xl font-medium text-foreground">
              Delete "{displayTitle}"
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
                onDelete?.();
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

      <PageEditorDialog
        open={!!editorOpen}
        onClose={() => onCloseEditor?.()}
        pageTitle={title}
        onPageTitleChange={onTitleChange}
        aiEnabled={aiEnabled}
        courseItems={courseItems}
        currentPageId={id}
        onRenameItem={onRenameItem}
        onDuplicateItem={onDuplicateItem}
        onDeleteItem={onDeleteItem}
        onAddPageToSection={onAddPageToSection}
        onReorderItems={onReorderItems}
        onReorderChildItems={onReorderChildItems}
        onNavigateToPage={onNavigateToPage}
        initialBlocks={initialBlocks}
        onBlocksChange={onBlocksChange}
        onAddItem={onAddItem}
      />
    </>
  );
}
