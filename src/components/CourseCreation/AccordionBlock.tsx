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
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Accordion</span>
          <span className="text-muted-foreground/60">·</span>
          <span className="text-muted-foreground">
            {data.items.length} {data.items.length === 1 ? "section" : "sections"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Accordion settings"
                className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                <Settings2 className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                Settings
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Open behavior
                </Label>
                <RadioGroup
                  value={data.openMode}
                  onValueChange={(v) => setOpenMode(v as OpenMode)}
                  className="gap-2"
                >
                  <label className="flex items-start gap-2.5 rounded-lg border border-border p-2.5 hover:bg-muted/40 cursor-pointer">
                    <RadioGroupItem value="single" id="acc-mode-single" className="mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">Single open</div>
                      <p className="text-[11px] text-muted-foreground leading-snug">
                        Only one section is open at a time.
                      </p>
                    </div>
                  </label>
                  <label className="flex items-start gap-2.5 rounded-lg border border-border p-2.5 hover:bg-muted/40 cursor-pointer">
                    <RadioGroupItem value="multiple" id="acc-mode-multiple" className="mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">Allow multiple</div>
                      <p className="text-[11px] text-muted-foreground leading-snug">
                        Learners can keep several sections open.
                      </p>
                    </div>
                  </label>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Default open
                </Label>
                <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
                  {data.items.map((it) => {
                    const checked = data.defaultOpenIds.includes(it.id);
                    return (
                      <label
                        key={it.id}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-muted/50 cursor-pointer"
                      >
                        <input
                          type={data.openMode === "single" ? "radio" : "checkbox"}
                          name="acc-default-open"
                          checked={checked}
                          onChange={() => toggleDefaultOpen(it.id)}
                          className="accent-primary"
                        />
                        <span className="truncate text-foreground">{it.title}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  These sections will be expanded by default when learners open the page.
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Items */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
        {data.items.map((item) => {
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
                "group/item transition-colors",
                isDragOver && "ring-2 ring-primary/40 ring-inset",
                isDragging && "opacity-50"
              )}
            >
              {/* Header row */}
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5",
                  isExpanded ? "bg-primary/[0.04]" : "hover:bg-muted/40"
                )}
              >
                <GripVertical
                  className="w-4 h-4 text-muted-foreground/60 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0 cursor-grab active:cursor-grabbing"
                  aria-hidden="true"
                  focusable="false"
                />
                <button
                  type="button"
                  onClick={() => toggleExpanded(item.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`acc-panel-${item.id}`}
                  className="w-6 h-6 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-label={isExpanded ? `Collapse ${item.title}` : `Expand ${item.title}`}
                >
                  <ChevronDown
                    className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180 text-primary")}
                    aria-hidden="true"
                    focusable="false"
                  />
                </button>
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
                    className="h-8 text-sm flex-1 min-w-0"
                  />
                ) : (
                  <TooltipProvider delayDuration={400}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => toggleExpanded(item.id)}
                          onDoubleClick={() => startRename(item)}
                          className="flex-1 min-w-0 text-left text-sm font-semibold text-foreground truncate py-1 outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
                        >
                          {item.title}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs max-w-[260px]">
                        Double-click to rename
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {isDefaultOpen && !isRenaming && (
                  <span className="hidden sm:inline-flex items-center text-[10px] font-semibold uppercase tracking-wide text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                    Default open
                  </span>
                )}
                {!isRenaming && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label={`Options for ${item.title}`}
                        className="ml-auto w-7 h-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 opacity-0 group-hover/item:opacity-100 focus:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Pencil className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
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
              </div>

              {/* Panel body */}
              {isExpanded && (
                <div id={`acc-panel-${item.id}`} className="px-4 pb-4 pt-1">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-[220px] shrink-0">
                      {item.imageUrl ? (
                        <div className="relative group/img rounded-xl overflow-hidden border border-border bg-muted/30">
                          <img
                            src={item.imageUrl}
                            alt={`Visual for ${item.title}`}
                            className="w-full h-auto object-cover aspect-[4/3]"
                          />
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
                    <div className="flex-1 min-w-0">
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

      {/* Add new */}
      <button
        type="button"
        onClick={addItem}
        className="mt-3 w-full inline-flex items-center justify-center gap-2 h-10 rounded-xl border border-dashed border-border bg-muted/20 text-sm font-semibold text-primary hover:bg-primary/5 hover:border-primary/50 transition-colors"
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
          className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-primary/50 bg-muted/30 hover:bg-muted/50 hover:border-primary/80 transition-colors flex flex-col items-center justify-center gap-2 text-foreground px-3 text-center"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground" aria-hidden="true">
            <ImagePlus className="w-4 h-4" aria-hidden="true" focusable="false" />
          </span>
          <span className="text-xs font-semibold">Upload image <span className="text-muted-foreground font-medium">(optional)</span></span>
          <span className="text-[10px] font-medium text-muted-foreground">PNG, JPG, SVG · 4:3</span>
        </button>
      )}
    </>
  );
}
