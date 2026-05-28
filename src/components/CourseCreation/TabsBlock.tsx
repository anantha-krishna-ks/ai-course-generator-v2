import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Trash2, GripVertical, ImagePlus, X, Eye, Pencil, ChevronDown, Layers, MousePointerClick } from "lucide-react";
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
      const tabs: TabItem[] = parsed.tabs.map((t: any) => ({
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

export function TabsBlock({ content, onChange }: TabsBlockProps) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="w-full">
      {/* Header — label chip + segmented preview toggle */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-muted/60 border border-border/60 px-3 py-1">
          <Layers className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground">Info Tabs</span>
          <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
            {data.tabs.length}
          </span>
        </div>
        <div
          role="group"
          aria-label="Editor mode"
          className="inline-flex items-center rounded-full bg-muted/60 border border-border/60 p-0.5"
        >
          <button
            type="button"
            onClick={() => { setPreviewMode(false); cancelRename(); }}
            aria-pressed={!previewMode}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 h-7 text-xs font-medium transition-colors",
              !previewMode
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Pencil className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => { setPreviewMode(true); cancelRename(); }}
            aria-pressed={previewMode}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 h-7 text-xs font-medium transition-colors",
              previewMode
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
            Preview
          </button>
        </div>
      </div>

      {/* Tab container card */}
      <div className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="relative flex items-stretch bg-gradient-to-b from-muted/50 to-muted/20 border-b border-border/70">
          <div
            ref={tabBarRef}
            className="flex-1 flex items-stretch overflow-x-auto scrollbar-thin scrollbar-thumb-border min-w-0 px-1.5 pt-1.5"
          >
            {data.tabs.map((tab, idx) => {
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
                    "group/tab relative flex items-center gap-1 pl-2 pr-1 mr-1 rounded-t-xl shrink-0 max-w-[220px] transition-all duration-150",
                    isActive
                      ? "bg-card text-foreground shadow-[0_-1px_0_0_hsl(var(--border))_inset,1px_0_0_0_hsl(var(--border))_inset,-1px_0_0_0_hsl(var(--border))_inset]"
                      : "bg-transparent text-muted-foreground hover:bg-card/70 hover:text-foreground cursor-pointer",
                    isDragOver && "ring-2 ring-primary/50 ring-offset-1 ring-offset-muted/40",
                    dragId === tab.id && "opacity-40 scale-[0.98]",
                  )}
                >
                  {/* Active indicator — sits flush with bottom border, slight glow */}
                  {isActive && (
                    <span
                      className="absolute left-1.5 right-1.5 -bottom-px h-[2px] bg-primary rounded-full shadow-[0_0_8px_hsl(var(--primary)/0.4)]"
                      aria-hidden="true"
                    />
                  )}
                  {!previewMode && !isRenaming && (
                    <GripVertical
                      className="w-3.5 h-3.5 text-muted-foreground/50 opacity-0 group-hover/tab:opacity-100 transition-opacity shrink-0 cursor-grab active:cursor-grabbing"
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
                      className="h-7 w-[170px] text-xs px-2 rounded-md my-1.5"
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
                              "text-xs truncate max-w-[160px] py-2 outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded",
                              isActive ? "text-foreground font-semibold" : "font-medium"
                            )}
                          >
                            {tab.name}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs max-w-[260px]">
                          {tab.name}
                          {!previewMode && (
                            <span className="block mt-0.5 text-[10px] text-muted-foreground">Double-click to rename</span>
                          )}
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
                            "w-5 h-5 rounded inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 transition-opacity",
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
          {!previewMode && (
            <div className="shrink-0 flex items-center pr-2 pl-1 py-1.5">
              <button
                type="button"
                onClick={addTab}
                aria-label="Add a new tab"
                className="h-7 inline-flex items-center gap-1.5 rounded-full bg-primary/10 hover:bg-primary/15 text-primary px-3 text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                Add Tab
              </button>
            </div>
          )}
        </div>

        {/* Tab panel */}
        {activeTab && (
          <div className="p-5 sm:p-6">
            <div className="flex flex-col md:flex-row gap-5">
              {/* Image (left) — optional. Hidden in preview when there's no image so text uses full width */}
              {!(previewMode && !activeTab.imageUrl) && (
                <div className="w-full md:w-[260px] shrink-0">
                  {activeTab.imageUrl ? (
                    <div className="relative group/img rounded-xl overflow-hidden border border-border/60 bg-muted/30 shadow-sm">
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
                    <EmptyTabPreview />
                  )
                ) : (
                  <DescriptionEditor
                    key={activeTab.id}
                    content={activeTab.content}
                    onChange={updateActiveContent}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer hint — only in edit mode */}
      {!previewMode && (
        <div className="mt-2.5 px-1 flex items-center gap-2 text-[11px] text-muted-foreground">
          <MousePointerClick className="w-3 h-3" aria-hidden="true" focusable="false" />
          <span>Double-click a tab to rename · Drag tabs to reorder · Click <span className="font-semibold text-primary">+ Add Tab</span> for more</span>
        </div>
      )}

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
          className="w-full aspect-[4/3] rounded-xl border border-dashed border-border bg-muted/20 hover:bg-muted/40 hover:border-primary/40 transition-colors flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-primary px-3 text-center"
        >
          <ImagePlus className="w-6 h-6" aria-hidden="true" focusable="false" />
          <span className="text-xs font-medium">Upload image <span className="text-muted-foreground font-normal">(optional)</span></span>
          <span className="text-[10px] text-muted-foreground">PNG, JPG, SVG</span>
          <span className="text-[10px] text-muted-foreground">Recommended: 800×600px (4:3)</span>
          <span className="text-[10px] text-muted-foreground">PNG, JPG, SVG</span>
        </button>
      )}
    </>
  );
}
