import { useState, useRef, useEffect } from "react";
import { FileText, MoreHorizontal, Copy, Trash2, GripVertical, ChevronUp, ListChecks } from "lucide-react";
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
  onTitleChange: (title: string) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  autoFocus?: boolean;
}

const MAX_PAGE_TITLE_LENGTH = 350;

export function PageItemCard({ title, onTitleChange, onDelete, onDuplicate, autoFocus }: PageItemCardProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showInclusions, setShowInclusions] = useState(false);
  const [inclusionsText, setInclusionsText] = useState("");
  const [isInclusionsFocused, setIsInclusionsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inclusionsRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [autoFocus]);

  const displayTitle = title.trim() || "Untitled page";

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

          {/* Inclusions toggle */}
          <div className="px-4 pb-3">
            <button
              onClick={() => {
                const next = !showInclusions;
                setShowInclusions(next);
                if (next) {
                  setTimeout(() => inclusionsRef.current?.focus(), 350);
                }
              }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronUp className={cn(
                "w-3.5 h-3.5 transition-transform duration-200",
                !showInclusions && "rotate-180"
              )} />
              {showInclusions ? "Hide inclusions" : "Add inclusions"}
            </button>
          </div>

          {/* Inclusions Panel */}
          <div
            className={cn(
              "grid transition-all duration-300 ease-in-out",
              showInclusions ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden">
              <div className="mx-4 mb-4 rounded-lg border border-border bg-card p-5">
                <div className="flex items-center gap-1.5 mb-4">
                  <ListChecks className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">Inclusions</span>
                </div>
                <textarea
                  ref={inclusionsRef}
                  value={inclusionsText}
                  onFocus={() => setIsInclusionsFocused(true)}
                  onBlur={() => setIsInclusionsFocused(false)}
                  onChange={(e) => setInclusionsText(e.target.value)}
                  className={cn(
                    "w-full text-sm text-foreground bg-transparent border-b-[1.5px] outline-none pb-2 placeholder:text-muted-foreground/50 transition-all duration-200 resize-none min-h-[60px]",
                    isInclusionsFocused ? "border-primary/40" : "border-transparent"
                  )}
                  placeholder="Define what topics, content, or scope should be included in this page..."
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = target.scrollHeight + 'px';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

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
