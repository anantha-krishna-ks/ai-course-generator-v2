import { useCallback, useEffect, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  ImagePlus,
  X,
  ChevronDown,
  Settings2,
  Pencil,
  Rows3,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { DescriptionEditor } from "./DescriptionEditor";

const TITLE_MAX = 80;
const DEFAULT_TITLE = "New section";
const ACCEPTED_IMAGE_TYPES = "image/png,image/jpeg,image/jpg,image/svg+xml";

export interface AccordionItem {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
}

type OpenMode = "single" | "multiple";

interface AccordionBlockData {
  items: AccordionItem[];
  openMode: OpenMode;
  defaultOpenIds: string[];
}

interface AccordionBlockProps {
  content: string;
  onChange: (content: string) => void;
}

function makeId() {
  return `acc-${Math.random().toString(36).slice(2, 10)}`;
}

function makeDefaultItem(index = 1): AccordionItem {
  return { id: makeId(), title: `${DEFAULT_TITLE} ${index}`, body: "", imageUrl: "" };
}

function parseContent(raw: string): AccordionBlockData {
  try {
    const parsed = JSON.parse(raw || "{}");
    if (Array.isArray(parsed?.items) && parsed.items.length > 0) {
      const items: AccordionItem[] = parsed.items.map((it: any, i: number) => ({
        id: String(it.id || makeId()),
        title: String(it.title || `${DEFAULT_TITLE} ${i + 1}`).slice(0, TITLE_MAX) || `${DEFAULT_TITLE} ${i + 1}`,
        body: String(it.body || ""),
        imageUrl: typeof it.imageUrl === "string" ? it.imageUrl : "",
      }));
      const openMode: OpenMode = parsed.openMode === "multiple" ? "multiple" : "single";
      const defaultOpenIds = Array.isArray(parsed.defaultOpenIds)
        ? parsed.defaultOpenIds.filter((id: any) => items.some((it) => it.id === id)).map(String)
        : [];
      return { items, openMode, defaultOpenIds };
    }
  } catch {
    /* ignore */
  }
  const first = makeDefaultItem(1);
  return { items: [first], openMode: "single", defaultOpenIds: [first.id] };
}

export function AccordionBlock({ content, onChange }: AccordionBlockProps) {
  const [data, setData] = useState<AccordionBlockData>(() => parseContent(content));
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(parseContent(content).defaultOpenIds));
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Sync external content changes
  useEffect(() => {
    const next = parseContent(content);
    setData((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, [content]);

  const persist = useCallback(
    (next: AccordionBlockData) => {
      setData(next);
      onChange(JSON.stringify(next));
    },
    [onChange]
  );

  // === Expand/collapse ===
  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (data.openMode === "single") next.clear();
        next.add(id);
      }
      return next;
    });
  };

  // === Item CRUD ===
  const addItem = () => {
    const item = makeDefaultItem(data.items.length + 1);
    const next: AccordionBlockData = { ...data, items: [...data.items, item] };
    persist(next);
    // Auto-expand the new one for immediate editing
    setExpandedIds((prev) => {
      const ns = new Set(data.openMode === "single" ? [] : prev);
      ns.add(item.id);
      return ns;
    });
    setRenamingId(item.id);
    setDraftTitle(item.title);
    requestAnimationFrame(() => {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    });
  };

  const startRename = (item: AccordionItem) => {
    setRenamingId(item.id);
    setDraftTitle(item.title);
    requestAnimationFrame(() => {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    });
  };

  const commitRename = () => {
    if (!renamingId) return;
    const cleaned = draftTitle.trim().slice(0, TITLE_MAX) || DEFAULT_TITLE;
    persist({
      ...data,
      items: data.items.map((it) => (it.id === renamingId ? { ...it, title: cleaned } : it)),
    });
    setRenamingId(null);
    setDraftTitle("");
  };

  const cancelRename = () => {
    setRenamingId(null);
    setDraftTitle("");
  };

  const requestDelete = (id: string) => {
    if (data.items.length <= 1) return;
    setConfirmDeleteId(id);
  };

  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    const nextItems = data.items.filter((it) => it.id !== confirmDeleteId);
    persist({
      ...data,
      items: nextItems,
      defaultOpenIds: data.defaultOpenIds.filter((id) => id !== confirmDeleteId),
    });
    setExpandedIds((prev) => {
      const ns = new Set(prev);
      ns.delete(confirmDeleteId);
      return ns;
    });
    setConfirmDeleteId(null);
  };

  const updateBody = (id: string, html: string) => {
    persist({
      ...data,
      items: data.items.map((it) => (it.id === id ? { ...it, body: html } : it)),
    });
  };

  const handleImageUpload = (id: string, file: File) => {
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
    if (!allowed.includes(file.type)) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      persist({
        ...data,
        items: data.items.map((it) => (it.id === id ? { ...it, imageUrl: url } : it)),
      });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (id: string) => {
    persist({
      ...data,
      items: data.items.map((it) => (it.id === id ? { ...it, imageUrl: "" } : it)),
    });
  };

  // === Settings ===
  const setOpenMode = (mode: OpenMode) => {
    let nextDefaults = data.defaultOpenIds;
    if (mode === "single" && nextDefaults.length > 1) {
      nextDefaults = [nextDefaults[0]];
    }
    persist({ ...data, openMode: mode, defaultOpenIds: nextDefaults });
    // Reflect in current view
    setExpandedIds((prev) => {
      if (mode === "single" && prev.size > 1) {
        const first = Array.from(prev)[0];
        return new Set(first ? [first] : []);
      }
      return prev;
    });
  };

  const toggleDefaultOpen = (id: string) => {
    let nextDefaults: string[];
    if (data.openMode === "single") {
      nextDefaults = data.defaultOpenIds.includes(id) ? [] : [id];
    } else {
      nextDefaults = data.defaultOpenIds.includes(id)
        ? data.defaultOpenIds.filter((x) => x !== id)
        : [...data.defaultOpenIds, id];
    }
    persist({ ...data, defaultOpenIds: nextDefaults });
  };

  // === Drag and drop reorder ===
  const onDragStart = (e: React.DragEvent, id: string) => {
    if (renamingId) return;
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
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
    const fromIdx = data.items.findIndex((t) => t.id === dragId);
    const toIdx = data.items.findIndex((t) => t.id === id);
    if (fromIdx === -1 || toIdx === -1) {
      setDragId(null);
      setDragOverId(null);
      return;
    }
    const next = [...data.items];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    persist({ ...data, items: next });
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
            <Rows3 className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">Accordion</span>
          <span className="text-muted-foreground/50" aria-hidden="true">·</span>
          <span className="text-[11px] font-medium text-muted-foreground">
            {data.items.length} {data.items.length === 1 ? "section" : "sections"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Accordion settings"
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-border/70 bg-card text-xs font-semibold text-foreground hover:bg-muted hover:border-border transition-all hover:shadow-sm"
              >
                <Settings2 className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                Settings
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 overflow-hidden rounded-2xl border-border/70 shadow-lg">
              <div className="px-4 py-3 border-b border-border/60 bg-gradient-to-r from-primary/8 via-primary/4 to-transparent">
                <p className="text-sm font-bold text-foreground">Accordion settings</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Configure how learners interact with sections.</p>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Open behavior
                  </Label>
                  <RadioGroup
                    value={data.openMode}
                    onValueChange={(v) => setOpenMode(v as OpenMode)}
                    className="gap-2"
                  >
                    <label className={cn(
                      "flex items-start gap-2.5 rounded-xl border p-3 cursor-pointer transition-all",
                      data.openMode === "single"
                        ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                        : "border-border hover:bg-muted/40 hover:border-border/80"
                    )}>
                      <RadioGroupItem value="single" id="acc-mode-single" className="mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-foreground">Single open</div>
                        <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                          Only one section is open at a time.
                        </p>
                      </div>
                    </label>
                    <label className={cn(
                      "flex items-start gap-2.5 rounded-xl border p-3 cursor-pointer transition-all",
                      data.openMode === "multiple"
                        ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                        : "border-border hover:bg-muted/40 hover:border-border/80"
                    )}>
                      <RadioGroupItem value="multiple" id="acc-mode-multiple" className="mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-foreground">Allow multiple</div>
                        <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                          Learners can keep several sections open.
                        </p>
                      </div>
                    </label>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Default open
                  </Label>
                  <div className="max-h-44 overflow-y-auto space-y-1 pr-1 rounded-xl border border-border/60 bg-muted/20 p-1.5">
                    {data.items.map((it) => {
                      const checked = data.defaultOpenIds.includes(it.id);
                      return (
                        <label
                          key={it.id}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs cursor-pointer transition-colors",
                            checked ? "bg-primary/10 text-foreground" : "hover:bg-card text-foreground"
                          )}
                        >
                          <input
                            type={data.openMode === "single" ? "radio" : "checkbox"}
                            name="acc-default-open"
                            checked={checked}
                            onChange={() => toggleDefaultOpen(it.id)}
                            className="accent-primary"
                          />
                          <span className="truncate font-medium">{it.title}</span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    These sections will be expanded by default when learners open the page.
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Items — stacked cards with soft shadow */}
      <div className="space-y-2.5">
        {data.items.map((item, idx) => {
          const isExpanded = expandedIds.has(item.id);
          const isRenaming = renamingId === item.id;
          const isDragOver = dragOverId === item.id && dragId !== item.id;
          const isDragging = dragId === item.id;
          const isDefaultOpen = data.defaultOpenIds.includes(item.id);
          return (
            <div
              key={item.id}
              draggable={!isRenaming}
              onDragStart={(e) => onDragStart(e, item.id)}
              onDragOver={(e) => onDragOver(e, item.id)}
              onDrop={(e) => onDrop(e, item.id)}
              onDragEnd={onDragEnd}
              className={cn(
                "group/item relative rounded-2xl border bg-card overflow-hidden transition-all duration-200",
                isExpanded
                  ? "border-primary/40 shadow-[0_8px_24px_-12px_hsl(var(--primary)/0.25)] ring-1 ring-primary/10"
                  : "border-border/70 hover:border-border hover:shadow-sm",
                isDragOver && "ring-2 ring-primary/50 border-primary/60",
                isDragging && "opacity-50 scale-[0.99]"
              )}
            >
              {/* Active left accent bar */}
              {isExpanded && (
                <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-primary via-primary to-primary/60" aria-hidden="true" />
              )}

              {/* Header row */}
              <div
                className={cn(
                  "flex items-center gap-2.5 pl-3 pr-2 py-2.5 transition-colors",
                  isExpanded
                    ? "bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent"
                    : "hover:bg-muted/30"
                )}
              >
                <span
                  className="opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/70 hover:text-foreground"
                  aria-hidden="true"
                >
                  <GripVertical className="w-4 h-4" focusable="false" />
                </span>

                {/* Numbered badge */}
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-6 h-6 rounded-lg text-[11px] font-bold shrink-0 transition-colors",
                    isExpanded
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground group-hover/item:bg-muted-foreground/10"
                  )}
                  aria-hidden="true"
                >
                  {idx + 1}
                </span>

                {isRenaming ? (
                  <Input
                    ref={renameInputRef}
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value.slice(0, TITLE_MAX))}
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
                    maxLength={TITLE_MAX}
                    aria-label="Rename section"
                    className="h-8 text-sm font-semibold flex-1 min-w-0 rounded-lg"
                  />
                ) : (
                  <TooltipProvider delayDuration={400}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => toggleExpanded(item.id)}
                          onDoubleClick={() => startRename(item)}
                          aria-expanded={isExpanded}
                          aria-controls={`acc-panel-${item.id}`}
                          className={cn(
                            "flex-1 min-w-0 text-left text-sm font-semibold truncate py-1 outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-md transition-colors",
                            isExpanded ? "text-foreground" : "text-foreground/90 group-hover/item:text-foreground"
                          )}
                        >
                          {item.title}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        Double-click to rename
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {isDefaultOpen && !isRenaming && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
                    Default
                  </span>
                )}

                {!isRenaming && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label={`Options for ${item.title}`}
                        className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 opacity-0 group-hover/item:opacity-100 focus:opacity-100 transition-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-4 h-4" aria-hidden="true" focusable="false" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
                      <DropdownMenuItem onClick={() => startRename(item)}>
                        <Pencil className="w-3.5 h-3.5 mr-2" aria-hidden="true" focusable="false" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleDefaultOpen(item.id)}>
                        <ChevronDown className="w-3.5 h-3.5 mr-2" aria-hidden="true" focusable="false" />
                        {isDefaultOpen ? "Unset default open" : "Open by default"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => requestDelete(item.id)}
                        disabled={data.items.length <= 1}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-2" aria-hidden="true" focusable="false" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Chevron toggle */}
                <button
                  type="button"
                  onClick={() => toggleExpanded(item.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`acc-panel-${item.id}`}
                  aria-label={isExpanded ? `Collapse ${item.title}` : `Expand ${item.title}`}
                  className={cn(
                    "w-8 h-8 inline-flex items-center justify-center rounded-lg shrink-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    isExpanded
                      ? "bg-primary/10 text-primary hover:bg-primary/15"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <ChevronDown
                    className={cn("w-4 h-4 transition-transform duration-300", isExpanded && "rotate-180")}
                    aria-hidden="true"
                    focusable="false"
                  />
                </button>
              </div>

              {/* Panel body */}
              {isExpanded && (
                <div
                  id={`acc-panel-${item.id}`}
                  className="px-4 pb-4 pt-2 border-t border-border/50 bg-background/40 animate-in fade-in slide-in-from-top-1 duration-200"
                >
                  <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-[140px] shrink-0">
                      {item.imageUrl ? (
                        <div className="relative group/img rounded-xl overflow-hidden border border-border/70 bg-muted/30 shadow-sm">
                          <img
                            src={item.imageUrl}
                            alt={`Visual for ${item.title}`}
                            className="w-full h-auto object-cover aspect-[4/3]"
                          />
                          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity" aria-hidden="true" />
                          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity">
                            <ImageUploadButton onUpload={(f) => handleImageUpload(item.id, f)} compact />
                            <button
                              type="button"
                              onClick={() => removeImage(item.id)}
                              aria-label="Remove image"
                              className="w-7 h-7 rounded-full bg-background/90 backdrop-blur border border-border inline-flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/40"
                            >
                              <X className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <ImageUploadButton onUpload={(f) => handleImageUpload(item.id, f)} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 rounded-xl border border-border/50 bg-card p-1">
                      <DescriptionEditor
                        key={item.id}
                        content={item.body}
                        onChange={(html) => updateBody(item.id, html)}
                        placeholder={`Write content for "${item.title}"… Add headings, lists, links, images, and more.`}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add new — subtle solid CTA */}
      <button
        type="button"
        onClick={addItem}
        className="group/add mt-3 w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl border border-primary/30 bg-primary/5 text-sm font-medium text-primary hover:bg-primary/10 hover:border-primary/50 transition-colors"
      >
        <Plus className="w-4 h-4" aria-hidden="true" focusable="false" />
        Add section
      </button>


      {/* Delete confirm */}
      <AlertDialog open={!!confirmDeleteId} onOpenChange={(o) => { if (!o) setConfirmDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete section?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the section
              {confirmDeleteId && (
                <> "<span className="font-medium text-foreground">{data.items.find((t) => t.id === confirmDeleteId)?.title}</span>"</>
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
        aria-label="Upload section image"
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
          className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-primary/50 bg-muted/30 hover:bg-muted/50 hover:border-primary/80 transition-colors flex flex-col items-center justify-center gap-1.5 text-foreground px-2 text-center"
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
