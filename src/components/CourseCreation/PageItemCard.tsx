import { useState, useRef, useEffect } from "react";
import { FileText, MoreHorizontal, Copy, Trash2, GripVertical, ListChecks, ChevronRight, Upload, X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CourseOutlineItem {
  id: string;
  type: "section" | "page" | "question";
  title: string;
  children?: CourseOutlineItem[];
}

interface PageContentBlock {
  id: string;
  type: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description" | "video-description";
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
  onPreview?: () => void;
}

const MAX_PAGE_TITLE_LENGTH = 350;

export function PageItemCard({ id, title, inclusions = "", exclusions = "", onTitleChange, onInclusionsChange, onExclusionsChange, onDelete, onDuplicate, onRenameItem, onDeleteItem, onDuplicateItem, onAddPageToSection, onReorderItems, onReorderChildItems, onNavigateToPage, editorOpen, onOpenEditor, onCloseEditor, autoFocus, aiEnabled = false, courseItems = [], initialBlocks, onBlocksChange, onAddItem, onPreview }: PageItemCardProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showScopeDialog, setShowScopeDialog] = useState(false);
  const [pageInclusionDocs, setPageInclusionDocs] = useState<string[]>([]);
  const [pageExclusionDocs, setPageExclusionDocs] = useState<string[]>([]);
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
        <button className="cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-muted transition-all shrink-0 touch-none opacity-0 group-hover/page:opacity-60 hover:!opacity-100" aria-label="Drag to reorder page">
          <GripVertical className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        </button>

        <div className="relative flex-1 min-w-0 rounded-xl border border-border bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.04),0_1px_2px_-1px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-200 hover:border-border hover:shadow-sm">
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
                className="w-full text-sm font-medium text-foreground bg-transparent outline-none placeholder:text-muted-foreground/50 transition-all"
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
            {hasScope && (
              <button
                onClick={() => setShowScopeDialog(true)}
                className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 hover:bg-primary/20 transition-colors"
                aria-label="View page scope"
              >
                <ListChecks className="w-2.5 h-2.5 text-primary" aria-hidden="true" />
              </button>
            )}
            <button
              onClick={() => onOpenEditor?.()}
              className="flex items-center gap-0.5 text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors shrink-0"
              aria-label={`Open page ${displayTitle}`}
            >
              Open
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 rounded-md hover:bg-muted transition-colors shrink-0" aria-label={`More options for ${displayTitle}`}>
                  <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-background border border-border p-1.5 z-50">
                <DropdownMenuItem
                  onClick={() => setShowScopeDialog(true)}
                  className="cursor-pointer gap-3 px-3 py-2 hover:!bg-muted focus:!bg-muted focus:!text-foreground"
                >
                  <ListChecks className="w-4 h-4 text-muted-foreground" />
                  {hasScope ? "Edit scope" : "Add scope"}
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

      <Dialog open={showScopeDialog} onOpenChange={setShowScopeDialog}>
        <DialogContent className="w-[95vw] max-w-[1100px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-muted-foreground" />
              Scope
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Define the scope for "{displayTitle}"
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
                placeholder="Define what topics, content, or scope should be included in this page..."
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.max(150, target.scrollHeight) + 'px';
                }}
              />
              <PageScopeDocUploadZone
                documents={pageInclusionDocs}
                onDocumentsChange={setPageInclusionDocs}
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
                placeholder="Define what topics or content should be excluded from this page..."
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.max(150, target.scrollHeight) + 'px';
                }}
              />
              <PageScopeDocUploadZone
                documents={pageExclusionDocs}
                onDocumentsChange={setPageExclusionDocs}
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={() => setShowScopeDialog(false)} className="rounded-full px-6">
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
        onPreview={onPreview}
      />
    </>
  );
}

function PageScopeDocUploadZone({
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
