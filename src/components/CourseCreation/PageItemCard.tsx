import { useState, useRef, useEffect } from "react";
import { FileText, MoreHorizontal, Copy, Trash2, GripVertical, ListChecks } from "lucide-react";
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

interface PageItemCardProps {
  title: string;
  inclusions?: string;
  onTitleChange: (title: string) => void;
  onInclusionsChange?: (inclusions: string) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  autoFocus?: boolean;
}

const MAX_PAGE_TITLE_LENGTH = 350;

export function PageItemCard({ title, inclusions = "", onTitleChange, onInclusionsChange, onDelete, onDuplicate, autoFocus }: PageItemCardProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showInclusionsDialog, setShowInclusionsDialog] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [autoFocus]);

  const displayTitle = title.trim() || "Untitled page";
  const hasInclusions = inclusions.trim().length > 0;

  return (
    <>
      <div className="flex items-center gap-2 group/page">
        <button className="cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-muted transition-all shrink-0 touch-none opacity-0 group-hover/page:opacity-100">
          <GripVertical className="w-4 h-4 text-muted-foreground/50" />
        </button>
        <div className="rounded-lg border border-border bg-card overflow-hidden flex-1 min-w-0">
          <div className="flex items-center gap-2 px-4 py-3">
            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
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
                className={cn(
                  "w-full text-sm text-foreground bg-transparent border-b-[1.5px] outline-none placeholder:text-muted-foreground/50 transition-all duration-200",
                  isFocused ? "border-primary/50" : "border-transparent"
                )}
                placeholder="Enter page title..."
              />
            </div>
            <span className={cn(
              "text-xs text-muted-foreground tabular-nums shrink-0 transition-opacity duration-200",
              isFocused ? "opacity-100" : "opacity-0"
            )}>
              {title.length}/{MAX_PAGE_TITLE_LENGTH}
            </span>
            {/* Inclusions indicator */}
            {hasInclusions && (
              <button
                onClick={() => setShowInclusionsDialog(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-medium hover:bg-primary/15 transition-colors shrink-0"
              >
                <ListChecks className="w-3 h-3" />
                Inclusions
              </button>
            )}
            <Button variant="outline" size="sm" className="text-xs border-border h-8 shrink-0" onClick={() => setShowEditor(true)}>
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
            <Button
              onClick={() => setShowInclusionsDialog(false)}
              className="rounded-full px-6"
            >
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
              Delete content "{displayTitle}"
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

      <PageEditorDialog
        open={showEditor}
        onClose={() => setShowEditor(false)}
        pageTitle={title}
        onPageTitleChange={onTitleChange}
      />
    </>
  );
}