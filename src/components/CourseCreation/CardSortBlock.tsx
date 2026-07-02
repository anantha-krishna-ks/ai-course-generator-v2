import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import {
  Pencil,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  GripHorizontal,
  RotateCcw,
  Type as TypeIcon,
  Image as ImageIcon,
  X,
  GripVertical,
  Upload,
  Settings2,
  Check,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type CardType = "text" | "image";
const TEXT_LIMIT = 80;

interface CardSortItem {
  id: string;
  label: string;
  type?: CardType;
  image?: string;
  categoryId?: string | null;
}

interface CardSortCategory {
  id: string;
  label: string;
}

interface CardSortContent {
  items: CardSortItem[];
  categories: CardSortCategory[];
}

const DEFAULT_CONTENT: CardSortContent = {
  items: [
    { id: "item-1", label: "Card 1", type: "text", categoryId: null },
    { id: "item-2", label: "Card 2", type: "text", categoryId: null },
    { id: "item-3", label: "Card 3", type: "text", categoryId: null },
  ],
  categories: [
    { id: "cat-1", label: "Category 1" },
    { id: "cat-2", label: "Category 2" },
  ],
};

function parseContent(raw: string): CardSortContent {
  if (!raw) return DEFAULT_CONTENT;
  try {
    const data = JSON.parse(raw);
    if (data && Array.isArray(data.items) && Array.isArray(data.categories)) {
      return {
        items: (data.items.length ? data.items : DEFAULT_CONTENT.items).map(
          (i: CardSortItem) => ({
            type: (i.type as CardType) ?? "text",
            categoryId: i.categoryId ?? null,
            ...i,
          })
        ),
        categories: (data.categories.length >= 1 ? data.categories : DEFAULT_CONTENT.categories).map(
          (c: CardSortCategory) => ({ id: c.id, label: c.label })
        ),
      };
    }
  } catch {
    // Fall back to defaults when old or malformed card sort content is loaded.
  }
  return DEFAULT_CONTENT;
}

/* -------------------------------------------------------------------------- */
/* Shared Card Stack UI                                                       */
/* -------------------------------------------------------------------------- */

interface CardStackProps {
  items: CardSortItem[];
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onReset?: () => void;
  onDragStart?: (e: React.DragEvent, itemId: string) => void;
  onDragEnd?: () => void;
  interactive?: boolean;
  emptyLabel?: string;
}

function CardStack({
  items,
  index,
  total,
  onPrev,
  onNext,
  onReset,
  onDragStart,
  onDragEnd,
  interactive = false,
  emptyLabel = "All items have been placed",
}: CardStackProps) {
  const current = items[index];
  const hasCards = items.length > 0;
  const [direction, setDirection] = useState<"left" | "right" | null>(null);

  const goPrev = () => {
    if (!hasCards || total <= 1) return;
    setDirection("left");
    onPrev();
  };
  const goNext = () => {
    if (!hasCards || total <= 1) return;
    setDirection("right");
    onNext();
  };

  const cardVariants = {
    enter: (dir: "left" | "right" | null) => ({
      x: dir === "right" ? 70 : dir === "left" ? -70 : 30,
      opacity: 0,
      scale: 0.9,
      rotate: dir === "right" ? 4 : dir === "left" ? -4 : 0,
    }),
    center: { x: 0, opacity: 1, scale: 1, rotate: 0 },
    exit: (dir: "left" | "right" | null) => ({
      x: dir === "right" ? -70 : dir === "left" ? 70 : -30,
      opacity: 0,
      scale: 0.9,
      rotate: dir === "right" ? -4 : dir === "left" ? 4 : 0,
    }),
  };

  return (
    <div className="relative w-full">
      {/* Counter + Reset */}
      <div className="flex items-center justify-between px-2 mb-3">
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          {hasCards ? `${index + 1}/${total}` : `0/${total}`}
        </span>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-medium text-muted-foreground hover:text-primary underline-offset-4 hover:underline transition-colors inline-flex items-center gap-1"
            aria-label="Reset sorting"
          >
            <RotateCcw className="w-3 h-3" aria-hidden="true" focusable="false" />
            Reset
          </button>
        )}
      </div>

      {/* Stack area */}
      <div className="relative flex items-center justify-center py-4">
        {/* Prev */}
        <button
          type="button"
          onClick={goPrev}
          disabled={!hasCards || total <= 1}
          className="absolute left-4 sm:left-8 z-10 w-8 h-8 rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:text-primary hover:border-primary/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          aria-label="Previous card"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" focusable="false" />
        </button>

        {/* Stacked cards */}
        <div className="relative w-[220px] h-[220px]">
          {hasCards ? (
            <>
              {/* Depth layers */}
              {total > 2 && (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 rounded-2xl bg-card border border-border shadow-sm"
                  style={{ transform: "translate(10px, 10px) rotate(2deg)", opacity: 0.55 }}
                />
              )}
              {total > 1 && (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 rounded-2xl bg-card border border-border shadow-sm"
                  style={{ transform: "translate(5px, 5px) rotate(1deg)", opacity: 0.8 }}
                />
              )}
              {/* Active card */}
              <div className="absolute inset-0">
                <AnimatePresence initial={false} custom={direction}>
                  <motion.div
                    key={current?.id}
                    custom={direction}
                    variants={cardVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                    draggable={interactive}
                    onDragStart={(e: unknown) =>
                      current && onDragStart?.(e as React.DragEvent, current.id)
                    }
                    onDragEnd={interactive ? onDragEnd : undefined}
                    data-card-stack-item-id={current?.id}
                    className={cn(
                      "absolute inset-0 rounded-2xl bg-card border border-border shadow-md overflow-hidden",
                      "flex items-center justify-center text-center",
                      interactive && "cursor-grab active:cursor-grabbing"
                    )}
                  >
                    <span
                      className="absolute top-3 left-3 z-10 inline-flex items-center justify-center w-6 h-6 rounded-md bg-background/80 backdrop-blur text-muted-foreground"
                      aria-hidden="true"
                    >
                      <GripHorizontal className="w-3.5 h-3.5" focusable="false" />
                    </span>
                    {current?.type === "image" && current.image ? (
                      <img
                        src={current.image}
                        alt={current.label || "Card image"}
                        className="absolute inset-0 w-full h-full object-cover"
                        draggable={false}
                      />
                    ) : (
                      <p className="px-5 text-sm font-medium text-foreground break-words">
                        {current?.label}
                      </p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

            </>
          ) : (
            <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 flex flex-col items-center justify-center gap-4 px-5 text-center">
              <p className="text-sm font-medium text-muted-foreground leading-snug">
                {emptyLabel}
              </p>
              {onReset && (
                <button
                  type="button"
                  onClick={onReset}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-5 py-2 text-xs font-medium text-foreground shadow-sm hover:border-primary/60 hover:text-primary hover:shadow transition-all"
                  aria-label="Restart sorting"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                  Restart
                </button>
              )}
            </div>
          )}
        </div>

        {/* Next */}
        <button
          type="button"
          onClick={goNext}
          disabled={!hasCards || total <= 1}
          className="absolute right-4 sm:right-8 z-10 w-8 h-8 rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:text-primary hover:border-primary/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          aria-label="Next card"
        >
          <ChevronRight className="w-4 h-4" aria-hidden="true" focusable="false" />
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Category grid (shared)                                                      */
/* -------------------------------------------------------------------------- */

interface CategoryGridProps {
  categories: CardSortCategory[];
  droppedCounts?: Record<string, number>;
  onDropTo?: (categoryId: string) => (e: React.DragEvent) => void;
  allowDrop?: (e: React.DragEvent) => void;
  activeDropId?: string | null;
  onDragEnter?: (id: string) => void;
  onDragLeave?: () => void;
  interactive?: boolean;
  feedback?: Record<string, "correct" | "incorrect" | undefined>;
  correctCounts?: Record<string, number>;
}

function CategoryGrid({
  categories,
  droppedCounts,
  onDropTo,
  allowDrop,
  activeDropId,
  onDragEnter,
  onDragLeave,
  interactive,
  feedback,
  correctCounts,
}: CategoryGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        categories.length === 2
          ? "grid-cols-1 sm:grid-cols-2"
          : categories.length === 3
          ? "grid-cols-1 sm:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      )}
    >
      {categories.map((cat) => {
        const count = droppedCounts?.[cat.id] ?? 0;
        const correct = correctCounts?.[cat.id] ?? 0;
        const isActive = activeDropId === cat.id;
        const fb = feedback?.[cat.id];
        return (
          <div
            key={cat.id}
            onDragOver={interactive ? allowDrop : undefined}
            onDragEnter={interactive ? () => onDragEnter?.(cat.id) : undefined}
            onDragLeave={interactive ? onDragLeave : undefined}
            onDrop={interactive ? onDropTo?.(cat.id) : undefined}
            className={cn(
              "group relative rounded-2xl border-2 border-dashed transition-all min-h-[170px] p-5 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md",
              fb === "correct"
                ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/30 scale-[1.01]"
                : fb === "incorrect"
                ? "border-destructive bg-destructive/10 ring-2 ring-destructive/30 animate-[shake_0.35s_ease-in-out]"
                : isActive
                ? "border-primary bg-primary/10 shadow-md scale-[1.01]"
                : "border-primary/30 bg-card hover:border-primary/60 hover:bg-primary/[0.04]"
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-3 left-3 h-1.5 w-8 rounded-full transition-colors",
                fb === "correct"
                  ? "bg-emerald-500"
                  : fb === "incorrect"
                  ? "bg-destructive"
                  : "bg-primary/40 group-hover:bg-primary/70"
              )}
            />
            {interactive && count > 0 && (
              <span
                className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-700 px-2 py-0.5 text-[10px] font-semibold ring-1 ring-emerald-500/20"
                aria-label={`${correct} correctly placed`}
              >
                <Check className="w-3 h-3" aria-hidden="true" focusable="false" />
                {correct}
              </span>
            )}
            <p className="text-base font-semibold text-foreground">{cat.label}</p>
            {interactive ? (
              count > 0 ? (
                <p className="mt-2 text-xs font-medium text-primary">
                  {count} {count === 1 ? "card" : "cards"} placed
                </p>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground/80 italic">
                  Drop cards here
                </p>

              )
            ) : (
              <p className="mt-2 text-xs text-muted-foreground/80 italic">
                Drop zone
              </p>
            )}
          </div>
        );
      })}

    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Inline sort card (editable in place)                                       */
/* -------------------------------------------------------------------------- */

interface InlineSortCardProps {
  item: CardSortItem;
  dragging: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onChange: (patch: Partial<CardSortItem>) => void;
  onDelete: () => void;
}

function InlineSortCard({
  item,
  dragging,
  onDragStart,
  onDragEnd,
  onChange,
  onDelete,
}: InlineSortCardProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const isText = (item.type ?? "text") === "text";

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [item.label]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange({ image: String(reader.result || "") });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div
      data-card-id={item.id}
      draggable
      onDragStart={(e) => onDragStart(e, item.id)}
      onDragEnd={onDragEnd}
      className={cn(
        "group relative w-[190px] h-[230px] rounded-2xl border bg-card overflow-hidden transition-all cursor-grab active:cursor-grabbing",
        "shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)]",
        dragging
          ? "opacity-40 scale-[0.97] border-primary"
          : "border-border/80 hover:border-primary/40 hover:shadow-[0_2px_4px_rgba(15,23,42,0.06),0_16px_36px_-14px_rgba(15,23,42,0.18)] hover:-translate-y-0.5"
      )}
    >
      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-2 py-1.5 bg-gradient-to-b from-background/95 to-background/0">
        <span
          className={cn(
            "inline-flex items-center justify-center w-6 h-6 rounded-md border text-muted-foreground",
            "bg-background/80 backdrop-blur border-border/70"
          )}
          aria-hidden="true"
        >
          {isText ? (
            <TypeIcon className="w-3 h-3" focusable="false" />
          ) : (
            <ImageIcon className="w-3 h-3" focusable="false" />
          )}
        </span>
        <span
          className="inline-flex items-center justify-center w-6 h-6 text-muted-foreground/70"
          aria-hidden="true"
        >
          <GripVertical className="w-3.5 h-3.5" focusable="false" />
        </span>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-background/80 backdrop-blur border border-border/70 text-muted-foreground hover:text-destructive hover:border-destructive/40 opacity-0 group-hover:opacity-100 transition-all"
          aria-label={`Delete ${item.label || "card"}`}
        >
          <Trash2 className="w-3 h-3" aria-hidden="true" focusable="false" />
        </button>
      </div>

      {/* Body */}
      {isText ? (
        <div className="absolute inset-0 pt-9 pb-6 px-3 flex items-center justify-center">
          <Textarea
            ref={textareaRef}
            value={item.label}
            onChange={(e) =>
              onChange({ label: e.target.value.slice(0, TEXT_LIMIT) })
            }
            maxLength={TEXT_LIMIT}
            placeholder="Type card text…"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            rows={1}
            className="w-full resize-none border-0 bg-transparent p-0 text-center text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-0 shadow-none leading-snug overflow-hidden"
          />
          <span className="absolute bottom-2 right-3 text-[10px] font-medium text-muted-foreground tabular-nums">
            {(item.label ?? "").length}/{TEXT_LIMIT}
          </span>
        </div>
      ) : (
        <>
          {item.image ? (
            <>
              <img
                src={item.image}
                alt={item.label || "Card"}
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileRef.current?.click();
                }}
                className="absolute bottom-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-background/90 backdrop-blur border border-border px-2.5 py-1 text-[10px] font-medium text-foreground hover:border-primary/50 hover:text-primary transition-all opacity-0 group-hover:opacity-100 shadow-sm"
              >
                <Upload className="w-3 h-3" aria-hidden="true" focusable="false" />
                Replace
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileRef.current?.click();
              }}
              className="absolute inset-0 pt-9 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-primary/10 text-primary">
                <Upload className="w-4 h-4" aria-hidden="true" focusable="false" />
              </span>
              <span className="text-xs font-medium">Upload image</span>
              <span className="text-[10px] text-muted-foreground/70">
                PNG, JPG up to 20MB
              </span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
            aria-label="Upload card image"
          />
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Editor Block                                                                */
/* -------------------------------------------------------------------------- */


type EditTarget =
  | { kind: "item"; id: string }
  | { kind: "item-new"; categoryId: string | null }
  | { kind: "category"; id: string }
  | { kind: "category-new" }
  | null;

interface CardSortBlockProps {
  content: string;
  onChange: (content: string) => void;
}

export function CardSortBlock({ content, onChange }: CardSortBlockProps) {
  const data = useMemo(() => parseContent(content), [content]);
  const [index, setIndex] = useState(0);
  const [managerOpen, setManagerOpen] = useState(false);
  const [editing, setEditing] = useState<EditTarget>(null);

  // Card draft
  const [draftType, setDraftType] = useState<CardType>("text");
  const [draftLabel, setDraftLabel] = useState("");
  const [draftImage, setDraftImage] = useState<string>("");

  // Category draft
  const [draftCatLabel, setDraftCatLabel] = useState("");
  

  // Drag state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{ colId: string; index: number } | null>(null);

  const computeInsertIndex = (row: HTMLElement, clientX: number, clientY: number) => {
    const cards = Array.from(row.querySelectorAll<HTMLElement>("[data-card-id]"));
    for (let i = 0; i < cards.length; i++) {
      const r = cards[i].getBoundingClientRect();
      // Match rows first (dropping onto a wrapped line)
      if (clientY < r.bottom) {
        if (clientX < r.left + r.width / 2) return i;
      }
    }
    return cards.length;
  };
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (index >= data.items.length) setIndex(Math.max(0, data.items.length - 1));
  }, [data.items.length, index]);

  const commit = (next: CardSortContent) => onChange(JSON.stringify(next));

  const editorUnassignedItems = useMemo(
    () => data.items.filter((item) => !item.categoryId),
    [data.items]
  );
  const editorSafeIndex =
    editorUnassignedItems.length === 0
      ? 0
      : Math.min(index, editorUnassignedItems.length - 1);
  const editorDroppedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of data.categories) counts[cat.id] = 0;
    for (const item of data.items) {
      if (item.categoryId && counts[item.categoryId] !== undefined) {
        counts[item.categoryId] += 1;
      }
    }
    return counts;
  }, [data.categories, data.items]);

  const prev = useCallback(
    () => {
      if (editorUnassignedItems.length === 0) return;
      setIndex((i) => (i - 1 + editorUnassignedItems.length) % editorUnassignedItems.length);
    },
    [editorUnassignedItems.length]
  );
  const next = useCallback(
    () => {
      if (editorUnassignedItems.length === 0) return;
      setIndex((i) => (i + 1) % editorUnassignedItems.length);
    },
    [editorUnassignedItems.length]
  );

  const resetEditorSorting = () => {
    commit({
      ...data,
      items: data.items.map((item) => ({ ...item, categoryId: null })),
    });
    setIndex(0);
    setDragOverCol(null);
  };

  /* ---------- Card CRUD ---------- */
  const addCard = (categoryId: string, type: CardType) => {
    const id = `item-${Date.now()}`;
    commit({
      ...data,
      items: [
        ...data.items,
        {
          id,
          type,
          label: "",
          image: undefined,
          categoryId,
        },
      ],
    });
  };

  const updateItem = (id: string, patch: Partial<CardSortItem>) => {
    commit({
      ...data,
      items: data.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    });
  };


  const removeCard = (id: string) => {
    commit({ ...data, items: data.items.filter((i) => i.id !== id) });
  };

  /* ---------- Category CRUD ---------- */
  const openCreateCategory = () => {
    setDraftCatLabel("");
    setEditing({ kind: "category-new" });
  };

  const openEditCategory = (id: string) => {
    const cat = data.categories.find((c) => c.id === id);
    if (!cat) return;
    setDraftCatLabel(cat.label);
    setEditing({ kind: "category", id });
  };

  const saveCategory = () => {
    if (!editing) return;
    const label = draftCatLabel.trim() || "Category";
    if (editing.kind === "category-new") {
      const id = `cat-${Date.now()}`;
      commit({
        ...data,
        categories: [...data.categories, { id, label }],
      });
    } else if (editing.kind === "category") {
      commit({
        ...data,
        categories: data.categories.map((c) =>
          c.id === editing.id ? { ...c, label } : c
        ),
      });
    }
    setEditing(null);
  };

  const removeCategory = (id: string) => {
    if (data.categories.length <= 1) return;
    commit({
      ...data,
      categories: data.categories.filter((c) => c.id !== id),
      items: data.items.map((i) =>
        i.categoryId === id ? { ...i, categoryId: null } : i
      ),
    });
  };

  /* ---------- Drag & drop within manager ---------- */
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/x-card-sort-item", itemId);
    e.dataTransfer.setData("text/plain", itemId);
    setDraggingId(itemId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverCol(null);
    setDropIndicator(null);
  };

  const handleColDragOver = (colId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverCol !== colId) setDragOverCol(colId);
    const row = (e.currentTarget as HTMLElement).querySelector<HTMLElement>(
      "[data-cards-row]"
    );
    if (row) {
      const idx = computeInsertIndex(row, e.clientX, e.clientY);
      setDropIndicator((prev) =>
        prev && prev.colId === colId && prev.index === idx
          ? prev
          : { colId, index: idx }
      );
    }
  };

  const allowEditorCategoryDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleColDrop = (categoryId: string | null) => (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggingId;
    const indicator = dropIndicator;
    setDragOverCol(null);
    setDraggingId(null);
    setDropIndicator(null);
    if (!id) return;

    const dragged = data.items.find((i) => i.id === id);
    if (!dragged) return;

    // Build ordered list of cards currently in this column (excluding dragged)
    const inCol = data.items.filter(
      (i) => (i.categoryId ?? null) === categoryId && i.id !== id
    );
    const insertAt =
      indicator && indicator.colId === categoryId
        ? Math.min(indicator.index, inCol.length)
        : inCol.length;

    const targetBeforeId = inCol[insertAt]?.id ?? null;

    const nextItems = data.items.filter((i) => i.id !== id);
    const updated = { ...dragged, categoryId };

    if (targetBeforeId) {
      const idx = nextItems.findIndex((i) => i.id === targetBeforeId);
      nextItems.splice(idx, 0, updated);
    } else {
      let lastIdxInCol = -1;
      nextItems.forEach((i, idx) => {
        if ((i.categoryId ?? null) === categoryId) lastIdxInCol = idx;
      });
      nextItems.splice(lastIdxInCol + 1, 0, updated);
    }
    commit({ ...data, items: nextItems });
  };

  const handleEditorDropToCategory = (categoryId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const id =
      e.dataTransfer.getData("application/x-card-sort-item") ||
      e.dataTransfer.getData("text/card-sort-item") ||
      e.dataTransfer.getData("text/plain") ||
      draggingId;

    setDragOverCol(null);
    setDraggingId(null);

    if (!id || !data.items.some((item) => item.id === id)) return;

    commit({
      ...data,
      items: data.items.map((item) =>
        item.id === id ? { ...item, categoryId } : item
      ),
    });
    setIndex(0);
  };

  const onPickImage = () => fileInputRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDraftImage(String(reader.result || ""));
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const columns: Array<{ id: string | null; label: string }> = [
    { id: null, label: "Unassigned" },
    ...data.categories.map((c) => ({ id: c.id, label: c.label })),
  ];

  const itemsByCol = (colId: string | null) =>
    data.items.filter((i) => (i.categoryId ?? null) === colId);

  const isCategoryEditing =
    editing?.kind === "category" || editing?.kind === "category-new";
  const isCardEditing = editing?.kind === "item" || editing?.kind === "item-new";

  return (
    <div className="w-full space-y-6 rounded-2xl border border-primary/10 bg-card p-6 shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-full"
          onClick={() => setManagerOpen(true)}
        >
          <Settings2 className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
          Edit
        </Button>
      </div>

      {/* Card stack */}
      <CardStack
        items={editorUnassignedItems}
        index={editorSafeIndex}
        total={data.items.length}
        onPrev={prev}
        onNext={next}
        onReset={resetEditorSorting}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        interactive
        emptyLabel="All items have been placed"
      />

      {/* Categories */}
      <CategoryGrid
        categories={data.categories}
        droppedCounts={editorDroppedCounts}
        onDropTo={handleEditorDropToCategory}
        allowDrop={allowEditorCategoryDrop}
        activeDropId={dragOverCol}
        onDragEnter={setDragOverCol}
        onDragLeave={() => setDragOverCol(null)}
        interactive
      />

      {/* Manager modal */}
      <Dialog open={managerOpen} onOpenChange={(open) => !open && setManagerOpen(false)}>
        <DialogContent className="w-[98vw] max-w-[1600px] sm:w-[95vw] max-h-[95vh] h-[95vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-4 sm:px-6 pt-5 pb-4 border-b border-border">
            <DialogTitle>Manage cards &amp; categories</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 bg-muted/20">
            <div className="grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-2">

              {data.categories.map((cat, catIdx) => {
                const cards = data.items.filter(
                  (i) =>
                    (i.categoryId ?? data.categories[0]?.id) === cat.id
                );
                const isOver = dragOverCol === cat.id;
                return (
                  <div key={cat.id} className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Category {catIdx + 1}/{data.categories.length}
                      </span>
                      {data.categories.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCategory(cat.id)}
                          className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1 transition-colors"
                          aria-label={`Delete ${cat.label}`}
                        >
                          <Trash2 className="w-3 h-3" aria-hidden="true" focusable="false" />
                          Remove
                        </button>
                      )}
                    </div>

                    <div
                      onDragOver={handleColDragOver(cat.id)}
                      onDragLeave={(e) => {
                        const next = e.relatedTarget as Node | null;
                        if (next && (e.currentTarget as HTMLElement).contains(next)) return;
                        setDragOverCol(null);
                        setDropIndicator((prev) => (prev?.colId === cat.id ? null : prev));
                      }}
                      onDrop={handleColDrop(cat.id)}
                      className={cn(
                        "rounded-2xl border bg-card p-5 transition-all shadow-sm",
                        isOver
                          ? "border-primary border-dashed ring-4 ring-primary/15 bg-primary/[0.03] shadow-[0_10px_40px_-16px_hsl(var(--primary)/0.35)]"
                          : "border-border"
                      )}
                    >
                      {/* Header row: name + action buttons */}
                      <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/60">
                        <div className="flex-1 min-w-0 space-y-1">
                          <Label
                            htmlFor={`cat-name-${cat.id}`}
                            className="text-xs font-normal text-muted-foreground"
                          >
                            Name
                          </Label>
                          <Input
                            id={`cat-name-${cat.id}`}
                            value={cat.label}
                            onChange={(e) =>
                              commit({
                                ...data,
                                categories: data.categories.map((c) =>
                                  c.id === cat.id
                                    ? { ...c, label: e.target.value }
                                    : c
                                ),
                              })
                            }
                            placeholder="Category name"
                            className="border-0 border-b border-dashed border-border rounded-none px-0 h-auto py-1 text-xl font-semibold text-foreground focus-visible:ring-0 focus-visible:border-primary shadow-none"
                          />
                        </div>
                        <div className="flex items-center gap-2 shrink-0 pt-5">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 gap-1.5 rounded-full"
                            onClick={() => addCard(cat.id, "text")}
                          >
                            <TypeIcon
                              className="w-3.5 h-3.5 text-primary"
                              aria-hidden="true"
                              focusable="false"
                            />
                            Text card
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 gap-1.5 rounded-full"
                            onClick={() => addCard(cat.id, "image")}
                          >
                            <ImageIcon
                              className="w-3.5 h-3.5 text-primary"
                              aria-hidden="true"
                              focusable="false"
                            />
                            Image card
                          </Button>
                        </div>

                      </div>

                      {/* Cards row */}
                      <div
                        data-cards-row
                        className="pt-5 flex flex-wrap items-stretch gap-4 min-h-[220px]"
                      >
                        {(() => {
                          const showIndicator =
                            !!draggingId &&
                            dropIndicator?.colId === cat.id &&
                            cards.length > 0;
                          const indicatorIdx = Math.min(
                            dropIndicator?.index ?? cards.length,
                            cards.length
                          );
                          const Indicator = (
                            <div
                              key="__drop-indicator__"
                              aria-hidden="true"
                              className="self-stretch flex items-center pointer-events-none"
                            >
                              <span className="block w-1 h-[210px] rounded-full bg-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.15),0_0_18px_hsl(var(--primary)/0.55)] animate-pulse" />
                            </div>
                          );
                          const nodes: React.ReactNode[] = [];
                          cards.forEach((item, i) => {
                            if (showIndicator && i === indicatorIdx) nodes.push(Indicator);
                            nodes.push(
                              <InlineSortCard
                                key={item.id}
                                item={item}
                                dragging={draggingId === item.id}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                                onChange={(patch) => updateItem(item.id, patch)}
                                onDelete={() => removeCard(item.id)}
                              />
                            );
                          });
                          if (showIndicator && indicatorIdx >= cards.length) nodes.push(Indicator);
                          return nodes;
                        })()}


                        {cards.length === 0 && (
                          <div
                            className={cn(
                              "w-full h-[230px] flex flex-col items-center justify-center gap-1 text-xs italic border-2 border-dashed rounded-xl py-10 px-4 text-center transition-all",
                              isOver && draggingId
                                ? "border-primary bg-primary/5 text-primary not-italic font-medium"
                                : "border-border text-muted-foreground/70"
                            )}
                          >
                            {isOver && draggingId ? (
                              <>Drop here to place in <span className="font-semibold">{cat.label}</span></>
                            ) : (
                              <>No cards yet — add a Text or Image card, or drag one here.</>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
              {/* Add category tile */}
              <button
                type="button"
                onClick={openCreateCategory}
                disabled={data.categories.length >= 4}
                className={cn(
                  "group rounded-2xl border border-dashed border-primary/25 bg-card/30 min-h-[220px] flex flex-col items-center justify-center gap-3 p-5 transition-all",
                  "hover:border-primary/50 hover:bg-primary/[0.04] hover:shadow-sm",
                  "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-primary/25 disabled:hover:shadow-none"
                )}
              >
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <Plus className="w-5 h-5" aria-hidden="true" focusable="false" />
                </span>
                <div className="text-center space-y-0.5">
                  <p className="text-sm font-semibold text-foreground">Add category</p>
                  <p className="text-xs text-muted-foreground">Create a new drop zone</p>
                </div>
                {data.categories.length >= 4 && (
                  <span className="text-[10px] text-muted-foreground/70 mt-1">Maximum 4 categories</span>
                )}
              </button>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-border">
            <Button onClick={() => setManagerOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      {/* Category create/edit modal */}
      <Dialog
        open={isCategoryEditing}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing?.kind === "category-new" ? "Add category" : "Edit category"}
            </DialogTitle>
            <DialogDescription>
              Name the drop category for learners.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cat-label">Name</Label>
              <Input
                id="cat-label"
                value={draftCatLabel}
                onChange={(e) => setDraftCatLabel(e.target.value)}
                placeholder="e.g. Biology"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={saveCategory} disabled={!draftCatLabel.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Learner Preview                                                             */
/* -------------------------------------------------------------------------- */

interface CardSortPreviewProps {
  content: string;
}

export function CardSortPreview({ content }: CardSortPreviewProps) {
  const data = useMemo(() => parseContent(content), [content]);
  const [assignments, setAssignments] = useState<Record<string, string | null>>({});
  const [results, setResults] = useState<Record<string, "correct" | "incorrect">>({});
  const [index, setIndex] = useState(0);
  const [activeDropId, setActiveDropId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, "correct" | "incorrect" | undefined>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const feedbackTimer = useRef<number | null>(null);
  const errorTimer = useRef<number | null>(null);

  // Correct category for each item = the category it was authored under in the editor
  const correctFor = useMemo(() => {
    const map: Record<string, string | null> = {};
    for (const item of data.items) map[item.id] = item.categoryId ?? null;
    return map;
  }, [data.items]);

  useEffect(() => {
    setAssignments((prev) => {
      const next: Record<string, string | null> = {};
      for (const item of data.items) next[item.id] = prev[item.id] ?? null;
      return next;
    });
    setResults({});
    setIndex(0);
  }, [data.items]);

  const unassigned = data.items.filter((i) => !assignments[i.id]);
  const safeIndex = unassigned.length === 0 ? 0 : Math.min(index, unassigned.length - 1);
  const allPlaced = unassigned.length === 0 && data.items.length > 0;
  void results;

  const prev = useCallback(() => {
    if (unassigned.length === 0) return;
    setIndex((i) => (i - 1 + unassigned.length) % unassigned.length);
  }, [unassigned.length]);
  const next = useCallback(() => {
    if (unassigned.length === 0) return;
    setIndex((i) => (i + 1) % unassigned.length);
  }, [unassigned.length]);

  const flashFeedback = (categoryId: string, state: "correct" | "incorrect") => {
    setFeedback({ [categoryId]: state });
    if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setFeedback({}), 900);
  };

  const onDragStart = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData("application/x-card-sort-item", itemId);
    e.dataTransfer.setData("text/card-sort-item", itemId);
    e.dataTransfer.setData("text/plain", itemId);
    e.dataTransfer.effectAllowed = "move";
  };

  const allowDrop = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDropTo = (categoryId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropId(null);
    const id =
      e.dataTransfer.getData("application/x-card-sort-item") ||
      e.dataTransfer.getData("text/card-sort-item") ||
      e.dataTransfer.getData("text/plain");
    if (!id) return;

    const expected = correctFor[id];
    const isCorrect = expected == null ? true : expected === categoryId;
    const targetCat = data.categories.find((c) => c.id === categoryId);

    if (isCorrect) {
      setAssignments((prev) => ({ ...prev, [id]: categoryId }));
      setResults((prev) => ({ ...prev, [id]: "correct" }));
      flashFeedback(categoryId, "correct");
      setErrorMsg(null);
      setIndex(0);
    } else {
      // Reject the drop — card stays on the stack until it fits the right category.
      setResults((prev) => ({ ...prev, [id]: "incorrect" }));
      flashFeedback(categoryId, "incorrect");
      setAttempts((n) => n + 1);
      setErrorMsg(
        targetCat
          ? `That card doesn't belong in "${targetCat.label}". Try another category.`
          : `That card doesn't belong here. Try another category.`
      );
      if (errorTimer.current) window.clearTimeout(errorTimer.current);
      errorTimer.current = window.setTimeout(() => setErrorMsg(null), 2600);
    }
  };

  const reset = () => {
    const cleared: Record<string, string | null> = {};
    for (const item of data.items) cleared[item.id] = null;
    setAssignments(cleared);
    setResults({});
    setFeedback({});
    setErrorMsg(null);
    setAttempts(0);
    setIndex(0);
  };

  const droppedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of data.categories) counts[cat.id] = 0;
    for (const item of data.items) {
      const a = assignments[item.id];
      if (a && counts[a] !== undefined) counts[a] += 1;
    }
    return counts;
  }, [assignments, data.categories, data.items]);

  const correctCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of data.categories) counts[cat.id] = 0;
    for (const item of data.items) {
      const a = assignments[item.id];
      if (a && a === correctFor[item.id] && counts[a] !== undefined) counts[a] += 1;
    }
    return counts;
  }, [assignments, correctFor, data.categories, data.items]);

  return (
    <div className="w-full space-y-4 rounded-2xl border border-primary/10 bg-card p-6 shadow-sm">
      {errorMsg && !allPlaced && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/[0.06] px-3.5 py-2.5 animate-[shake_0.35s_ease-in-out]"
        >
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-destructive/15 text-destructive shrink-0 mt-0.5">
            <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-destructive">Not quite right</p>
            <p className="text-xs text-destructive/80">{errorMsg}</p>
          </div>
        </div>
      )}
      {allPlaced && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-50 px-4 py-3"
        >
          <div className="flex items-center gap-2 text-emerald-800">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-700">
              <Check className="w-4 h-4" aria-hidden="true" focusable="false" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">Nicely sorted!</p>
              <p className="text-xs text-emerald-800/80">
                All {data.items.length} cards placed in the right category
                {attempts > 0 ? ` · ${attempts} retr${attempts === 1 ? "y" : "ies"}` : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-white px-4 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-50 hover:border-emerald-500 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
            Restart
          </button>
        </div>
      )}
      <CardStack
        items={unassigned}
        index={safeIndex}
        total={data.items.length}
        onPrev={prev}
        onNext={next}
        onReset={reset}
        onDragStart={onDragStart}
        interactive
        emptyLabel="All items have been placed"
      />
      <CategoryGrid
        categories={data.categories}
        droppedCounts={droppedCounts}
        correctCounts={correctCounts}
        feedback={feedback}
        onDropTo={onDropTo}
        allowDrop={allowDrop}
        activeDropId={activeDropId}
        onDragEnter={setActiveDropId}
        onDragLeave={() => setActiveDropId(null)}
        interactive
      />
    </div>
  );
}

