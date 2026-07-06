import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Trash2, GripVertical, ImagePlus, X, Eye, Pencil, ChevronDown, LayoutPanelTop, Columns2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DescriptionEditor } from "./DescriptionEditor";

const TAB_NAME_MAX = 40;
const DEFAULT_TAB_NAME = "Untitled Tab";
const ACCEPTED_IMAGE_TYPES = "image/png,image/jpeg,image/jpg,image/svg+xml";
const PLACEHOLDER = "Add content to this tab";

type ParsedTab = Partial<Pick<TabItem, "id" | "name" | "content" | "imageUrl">>;

export interface TabItem {
  id: string;
  name: string;
  content: string; // HTML from rich text editor
  imageUrl?: string;
}

interface TabsBlockData {
  tabs: TabItem[];
  activeId: string;
}

interface TabsBlockProps {
  content: string;
  onChange: (content: string) => void;
  aiEnabled?: boolean;
  variant?: string;
}

function makeId() {
  return `tab-${Math.random().toString(36).slice(2, 10)}`;
}

function makeDefaultTab(): TabItem {
  return { id: makeId(), name: DEFAULT_TAB_NAME, content: "", imageUrl: "" };
}

function parseContent(raw: string): TabsBlockData {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.tabs) && parsed.tabs.length > 0) {
      const tabs: TabItem[] = parsed.tabs.map((t: ParsedTab) => ({
        id: String(t.id || makeId()),
        name: String(t.name || DEFAULT_TAB_NAME).slice(0, TAB_NAME_MAX) || DEFAULT_TAB_NAME,
        content: String(t.content || ""),
        imageUrl: typeof t.imageUrl === "string" ? t.imageUrl : "",
      }));
      const activeId =
        typeof parsed.activeId === "string" && tabs.some((t) => t.id === parsed.activeId)
          ? parsed.activeId
          : tabs[0].id;
      return { tabs, activeId };
    }
  } catch {
    /* ignore */
  }
  const first = makeDefaultTab();
  return { tabs: [first], activeId: first.id };
}

export function TabsBlock({ content, onChange, variant }: TabsBlockProps) {
  const isVertical = variant === "vertical-tabs";
  const [data, setData] = useState<TabsBlockData>(() => parseContent(content));
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const tabBarRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Sync external changes (e.g., undo/redo)
  useEffect(() => {
    const next = parseContent(content);
    setData((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
      return next;
    });
  }, [content]);

  const persist = useCallback(
    (next: TabsBlockData) => {
      setData(next);
      onChange(JSON.stringify(next));
    },
    [onChange]
  );

  const activeTab = data.tabs.find((t) => t.id === data.activeId) ?? data.tabs[0];

  // === Tab CRUD ===
  const addTab = () => {
    const t = makeDefaultTab();
    const next: TabsBlockData = { tabs: [...data.tabs, t], activeId: t.id };
    persist(next);
    // Defer focus to allow render
    setRenamingId(t.id);
    setDraftName(t.name);
    requestAnimationFrame(() => {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
      // Scroll new tab into view
      tabBarRef.current?.scrollTo({ left: tabBarRef.current.scrollWidth, behavior: "smooth" });
    });
  };

  const startRename = (tab: TabItem) => {
    if (previewMode) return;
    setRenamingId(tab.id);
    setDraftName(tab.name);
    requestAnimationFrame(() => {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    });
  };

  const commitRename = () => {
    if (!renamingId) return;
    const cleaned = draftName.trim().slice(0, TAB_NAME_MAX) || DEFAULT_TAB_NAME;
    persist({
      ...data,
      tabs: data.tabs.map((t) => (t.id === renamingId ? { ...t, name: cleaned } : t)),
    });
    setRenamingId(null);
    setDraftName("");
  };

  const cancelRename = () => {
    setRenamingId(null);
    setDraftName("");
  };

  const requestDelete = (id: string) => {
    if (data.tabs.length <= 1) return; // Enforce minimum of one
    setConfirmDeleteId(id);
  };

  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    const idx = data.tabs.findIndex((t) => t.id === confirmDeleteId);
    if (idx === -1) {
      setConfirmDeleteId(null);
      return;
    }
    const nextTabs = data.tabs.filter((t) => t.id !== confirmDeleteId);
    let nextActive = data.activeId;
    if (data.activeId === confirmDeleteId) {
      const adjacent = nextTabs[idx] ?? nextTabs[idx - 1] ?? nextTabs[0];
      nextActive = adjacent.id;
    }
    persist({ tabs: nextTabs, activeId: nextActive });
    setConfirmDeleteId(null);
  };

  const activateTab = (id: string) => {
    if (renamingId) return;
    if (data.activeId !== id) persist({ ...data, activeId: id });
  };

  const updateActiveContent = (html: string) => {
    if (!activeTab) return;
    persist({
      ...data,
      tabs: data.tabs.map((t) => (t.id === activeTab.id ? { ...t, content: html } : t)),
    });
  };

  const handleImageUpload = (file: File) => {
    if (!activeTab) return;
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
    if (!allowed.includes(file.type)) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      persist({
        ...data,
        tabs: data.tabs.map((t) => (t.id === activeTab.id ? { ...t, imageUrl: url } : t)),
      });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    if (!activeTab) return;
    persist({
      ...data,
      tabs: data.tabs.map((t) => (t.id === activeTab.id ? { ...t, imageUrl: "" } : t)),
    });
  };

  // === Drag and drop reorder (native HTML5) ===
  const onDragStart = (e: React.DragEvent, id: string) => {
    if (previewMode || renamingId) return;
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
    // Required for Firefox
    e.dataTransfer.setData("text/plain", id);
  };

  const onDragOver = (e: React.DragEvent, id: string) => {
    if (!dragId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverId(id);
  };

  const onDrop = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (!dragId || dragId === id) {
      setDragId(null);
      setDragOverId(null);
      return;
    }
    const fromIdx = data.tabs.findIndex((t) => t.id === dragId);
    const toIdx = data.tabs.findIndex((t) => t.id === id);
    if (fromIdx === -1 || toIdx === -1) {
      setDragId(null);
      setDragOverId(null);
      return;
    }
    const next = [...data.tabs];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    persist({ ...data, tabs: next });
    setDragId(null);
    setDragOverId(null);
  };

  const onDragEnd = () => {
    setDragId(null);
    setDragOverId(null);
  };

  return (
    <div className="w-full px-1">
      {/* Header — pill bar with glass feel */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="inline-flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-border/70 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent backdrop-blur-sm">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/15 text-primary">
            {isVertical
              ? <Columns2 className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
              : <LayoutPanelTop className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            {isVertical ? "Vertical Tabs" : "Horizontal Tabs"}
          </span>
          <span className="text-muted-foreground/50" aria-hidden="true">·</span>
          <span className="text-[11px] font-medium text-muted-foreground">
            {data.tabs.length} {data.tabs.length === 1 ? "tab" : "tabs"}
          </span>
        </div>
      </div>


      {/* Tab bar */}
      <div className={cn("rounded-2xl border border-border/70 bg-card shadow-md shadow-foreground/[0.04] ring-1 ring-foreground/[0.02] overflow-hidden", isVertical && "flex items-stretch max-h-[600px]")}>
        <div className={cn(
          "flex bg-muted/40",
          isVertical
            ? "flex-col w-48 shrink-0 border-r border-border"
            : "items-stretch border-b border-border",
        )}>
          {!previewMode && (
            <button
              type="button"
              onClick={addTab}
              aria-label="Add a new tab"
              className={cn(
                "shrink-0 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 transition-colors",
                isVertical
                  ? "mx-2 mt-2 mb-1 h-9 rounded-lg border border-primary/30 hover:border-primary/50"
                  : "my-2 ml-2 mr-1 px-3 h-9 rounded-lg border border-primary/30 hover:border-primary/50",
              )}
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
              Add Tab
            </button>
          )}

          <div
            ref={tabBarRef}
            className={cn(
              "flex-1 flex min-w-0",
              isVertical ? "flex-col overflow-y-auto" : "items-stretch overflow-x-auto scrollbar-thin scrollbar-thumb-border",
            )}
          >
            {data.tabs.map((tab) => {
              const isActive = tab.id === data.activeId;
              const isRenaming = renamingId === tab.id;
              const isDragOver = dragOverId === tab.id && dragId !== tab.id;
              return (
                <div
                  key={tab.id}
                  draggable={!previewMode && !isRenaming}
                  onDragStart={(e) => onDragStart(e, tab.id)}
                  onDragOver={(e) => onDragOver(e, tab.id)}
                  onDrop={(e) => onDrop(e, tab.id)}
                  onDragEnd={onDragEnd}
                  className={cn(
                    "group/tab relative flex items-center gap-1.5 pl-2 pr-1.5 py-2 shrink-0 transition-colors",
                    isVertical
                      ? "w-full border-b border-border last:border-b-0 max-w-none"
                      : "border-r border-border max-w-[220px]",
                    isActive
                      ? "bg-card text-foreground"
                      : "bg-transparent text-muted-foreground hover:bg-card/60 hover:text-foreground cursor-pointer",
                    isDragOver && "ring-2 ring-primary/40 ring-inset",
                    dragId === tab.id && "opacity-50",
                  )}
                >
                  {isActive && (
                    <span
                      className={cn(
                        "absolute bg-primary",
                        isVertical
                          ? "left-0 top-0 bottom-0 w-[2px]"
                          : "left-0 right-0 bottom-0 h-[2px]",
                      )}
                      aria-hidden="true"
                    />
                  )}
                  {!previewMode && !isRenaming && (
                    <GripVertical
                      className="w-3.5 h-3.5 text-muted-foreground/60 opacity-0 group-hover/tab:opacity-100 transition-opacity shrink-0 cursor-grab active:cursor-grabbing"
                      aria-hidden="true"
                      focusable="false"
                    />
                  )}
                  {isRenaming ? (
                    <Input
                      ref={renameInputRef}
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value.slice(0, TAB_NAME_MAX))}
                      onBlur={commitRename}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          commitRename();
                        } else if (e.key === "Escape") {
                          e.preventDefault();
                          cancelRename();
                        }
                      }}
                      maxLength={TAB_NAME_MAX}
                      aria-label="Rename tab"
                      className="h-7 w-[160px] text-xs px-2 rounded-md"
                    />
                  ) : (
                    <TooltipProvider delayDuration={400}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => activateTab(tab.id)}
                            onDoubleClick={() => startRename(tab)}
                            className={cn(
                              "flex-1 min-w-0 text-left text-xs font-medium truncate py-0.5 outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded",
                              isActive && "text-foreground font-semibold"
                            )}
                          >
                            {tab.name}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs max-w-[260px]">
                          {tab.name}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {!previewMode && !isRenaming && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          aria-label={`Tab options for ${tab.name}`}
                          className={cn(
                            "ml-auto w-5 h-5 rounded inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted shrink-0",
                            isActive ? "opacity-100" : "opacity-0 group-hover/tab:opacity-100"
                          )}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => startRename(tab)}>
                          <Pencil className="w-3.5 h-3.5 mr-2" aria-hidden="true" focusable="false" /> Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => requestDelete(tab.id)}
                          disabled={data.tabs.length <= 1}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-2" aria-hidden="true" focusable="false" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tab panel */}
        {activeTab && (
          <div className={cn("p-4 flex-1 min-w-0", isVertical && "min-h-0 overflow-y-auto")}>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Image (left) — optional. Hidden in preview when there's no image so text uses full width */}
              {!(previewMode && !activeTab.imageUrl) && (
                <div className="w-full md:w-[140px] shrink-0">
                  {activeTab.imageUrl ? (
                    <div className="relative group/img rounded-xl overflow-hidden border border-border bg-muted/30">
                      <img
                        src={activeTab.imageUrl}
                        alt={`Visual for ${activeTab.name}`}
                        className="w-full h-auto object-cover aspect-[4/3]"
                      />
                      {!previewMode && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity">
                          <ImageUploadButton onUpload={handleImageUpload} compact />
                          <button
                            type="button"
                            onClick={removeImage}
                            aria-label="Remove image"
                            className="w-7 h-7 rounded-full bg-background/90 backdrop-blur border border-border inline-flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/40"
                          >
                            <X className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <ImageUploadButton onUpload={handleImageUpload} />
                  )}
                </div>
              )}

              {/* Rich text (right) */}
              <div className="flex-1 min-w-0">
                {previewMode ? (
                  activeTab.content && activeTab.content.replace(/<[^>]+>/g, "").trim().length > 0 ? (
                    <div
                      className="prose prose-sm max-w-none text-foreground break-words [overflow-wrap:anywhere]"
                      dangerouslySetInnerHTML={{ __html: activeTab.content }}
                    />
                  ) : (
                    <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                      {PLACEHOLDER}
                    </div>
                  )
                ) : (
                  <DescriptionEditor
                    key={activeTab.id}
                    content={activeTab.content}
                    onChange={updateActiveContent}
                    placeholder={`Write content for "${activeTab.name}"… Add headings, lists, links, images, and more.`}
                  />

                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!confirmDeleteId} onOpenChange={(o) => { if (!o) setConfirmDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tab?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the tab
              {confirmDeleteId && (
                <> "<span className="font-medium text-foreground">{data.tabs.find((t) => t.id === confirmDeleteId)?.name}</span>"</>
              )}
              {" "}and all of its content. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ImageUploadButton({ onUpload, compact }: { onUpload: (f: File) => void; compact?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        className="hidden"
        aria-label="Upload tab image"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = "";
        }}
      />
      {compact ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label="Replace image"
          className="w-7 h-7 rounded-full bg-background/90 backdrop-blur border border-border inline-flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40"
        >
          <ImagePlus className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-primary/60 bg-muted/30 hover:bg-muted/50 hover:border-primary/80 transition-colors flex flex-col items-center justify-center gap-1.5 text-foreground px-2 text-center"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground" aria-hidden="true">
            <ImagePlus className="w-4 h-4" aria-hidden="true" focusable="false" />
          </span>
          <span className="text-xs font-semibold leading-tight">Upload image <span className="text-muted-foreground font-medium">(optional)</span></span>
          <span className="text-[10px] font-medium text-muted-foreground leading-tight">JPG, JPEG, PNG · 600×450px (4:3)</span>
        </button>
      )}
    </>
  );
}
