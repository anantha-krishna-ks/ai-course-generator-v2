import { useState, useRef, useEffect } from "react";
import { ChevronUp, ChevronDown, MoreHorizontal, Plus, Image as ImageIcon, HelpCircle, Settings2, Copy, Trash2, FileText, ArrowUp, ArrowDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SectionImageDialog } from "./SectionImageDialog";

interface SectionCardProps {
  sectionNumber: number;
  title: string;
  onTitleChange: (title: string) => void;
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
}

export function SectionCard({
  sectionNumber,
  title,
  onTitleChange,
  onDelete,
  onDuplicate,
  onOpenSection,
  onAddPage,
  onAddLearningObjective,
}: SectionCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showObjective, setShowObjective] = useState(false);
  const [objectiveText, setObjectiveText] = useState("");
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [isObjectiveFocused, setIsObjectiveFocused] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [pages, setPages] = useState<PageEntry[]>([]);
  const [focusedPageId, setFocusedPageId] = useState<string | null>(null);
  const newPageRef = useRef<HTMLInputElement>(null);

  const handleAddPage = () => {
    const newPage: PageEntry = { id: crypto.randomUUID(), title: "" };
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
      const copy = { ...prev[idx], id: crypto.randomUUID() };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  };

  const handleMovePage = (id: string, direction: "up" | "down") => {
    setPages((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx === -1) return prev;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next;
    });
  };

  return (
    <div className="space-y-0">
      {/* Section Card */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
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
                      onClick={() => setShowObjective(!showObjective)}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ChevronUp className={cn(
                        "w-3.5 h-3.5 transition-transform duration-200",
                        !showObjective && "rotate-180"
                      )} />
                      {showObjective ? "Hide learning objective" : "Add learning objective"}
                    </button>
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

            {/* Pages section */}
            <div className="px-5 pt-3 pb-4 space-y-3">
              {pages.length > 0 && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-muted-foreground">Pages:</span>
                  <span className="text-xs font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">{pages.length}</span>
                </div>
              )}

              {pages.map((page, idx) => (
                <div key={page.id} className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <input
                      ref={idx === pages.length - 1 ? newPageRef : undefined}
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
                        "w-full text-sm text-foreground bg-transparent border-b-[1.5px] outline-none pb-1.5 placeholder:text-muted-foreground/50 transition-all duration-200",
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-border h-8 shrink-0"
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
                        onClick={() => handleMovePage(page.id, "up")}
                        disabled={idx === 0}
                        className="cursor-pointer gap-3 px-3 py-2 hover:!bg-muted focus:!bg-muted focus:!text-foreground"
                      >
                        <ArrowUp className="w-4 h-4 text-muted-foreground" />
                        Move up
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleMovePage(page.id, "down")}
                        disabled={idx === pages.length - 1}
                        className="cursor-pointer gap-3 px-3 py-2 hover:!bg-muted focus:!bg-muted focus:!text-foreground"
                      >
                        <ArrowDown className="w-4 h-4 text-muted-foreground" />
                        Move down
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDuplicatePage(page.id)}
                        className="cursor-pointer gap-3 px-3 py-2 hover:!bg-muted focus:!bg-muted focus:!text-foreground"
                      >
                        <Copy className="w-4 h-4 text-muted-foreground" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeletePage(page.id)}
                        className="cursor-pointer gap-3 px-3 py-2 text-destructive hover:!bg-muted focus:!bg-muted focus:!text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}

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
  );
}
