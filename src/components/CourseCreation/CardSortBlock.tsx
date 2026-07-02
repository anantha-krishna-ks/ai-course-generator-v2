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
} from "lucide-react";
import { cn } from "@/lib/utils";
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
  description?: string;
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
    { id: "cat-1", label: "Category 1", description: "" },
    { id: "cat-2", label: "Category 2", description: "" },
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
        categories:
          data.categories.length >= 2 ? data.categories : DEFAULT_CONTENT.categories,
      };
    }
  } catch {}
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
  interactive = false,
  emptyLabel = "All cards sorted",
}: CardStackProps) {
  const current = items[index];
  const hasCards = items.length > 0;

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
          onClick={onPrev}
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
              <div
                key={current?.id}
                draggable={interactive}
                onDragStart={(e) => current && onDragStart?.(e, current.id)}
                className={cn(
                  "absolute inset-0 rounded-2xl bg-card border border-border shadow-md transition-transform duration-300 overflow-hidden",
                  "flex items-center justify-center text-center",
                  interactive && "cursor-grab active:cursor-grabbing active:scale-[0.98]"
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
                  />
                ) : (
                  <p className="px-5 text-sm font-medium text-foreground break-words">
                    {current?.label}
                  </p>
                )}
              </div>

            </>
          ) : (
            <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 flex items-center justify-center text-xs text-muted-foreground italic px-4 text-center">
              {emptyLabel}
            </div>
          )}
        </div>

        {/* Next */}
        <button
          type="button"
          onClick={onNext}
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
        const isActive = activeDropId === cat.id;
        return (
          <div
            key={cat.id}
            onDragOver={interactive ? allowDrop : undefined}
            onDragEnter={interactive ? () => onDragEnter?.(cat.id) : undefined}
            onDragLeave={interactive ? onDragLeave : undefined}
            onDrop={interactive ? onDropTo?.(cat.id) : undefined}
            className={cn(
              "group relative rounded-2xl border-2 border-dashed transition-all min-h-[170px] p-5 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md",
              isActive
                ? "border-primary bg-primary/10 shadow-md scale-[1.01]"
                : "border-primary/30 bg-card hover:border-primary/60 hover:bg-primary/[0.04]"
            )}
          >
            <span
              aria-hidden="true"
              className="absolute top-3 left-3 h-1.5 w-8 rounded-full bg-primary/40 group-hover:bg-primary/70 transition-colors"
            />
            <p className="text-base font-semibold text-foreground">{cat.label}</p>
            {cat.description && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {cat.description}
              </p>
            )}
            {interactive ? (
              count > 0 ? (
                <p className="mt-2 text-xs font-medium text-primary">
                  {count} {count === 1 ? "card" : "cards"} sorted
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
  const [draftCatDescription, setDraftCatDescription] = useState("");

  // Drag state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (index >= data.items.length) setIndex(Math.max(0, data.items.length - 1));
  }, [data.items.length, index]);

  const commit = (next: CardSortContent) => onChange(JSON.stringify(next));

  const prev = useCallback(
    () => setIndex((i) => (i - 1 + data.items.length) % data.items.length),
    [data.items.length]
  );
  const next = useCallback(
    () => setIndex((i) => (i + 1) % data.items.length),
    [data.items.length]
  );

  /* ---------- Card CRUD ---------- */
  const openCreateCard = (categoryId: string | null) => {
    setDraftType("text");
    setDraftLabel("");
    setDraftImage("");
    setEditing({ kind: "item-new", categoryId });
  };

  const openEditCard = (id: string) => {
    const item = data.items.find((i) => i.id === id);
    if (!item) return;
    setDraftType(item.type ?? "text");
    setDraftLabel(item.label ?? "");
    setDraftImage(item.image ?? "");
    setEditing({ kind: "item", id });
  };

  const saveCard = () => {
    if (!editing) return;
    const trimmedLabel = draftLabel.slice(0, TEXT_LIMIT).trim();
    if (draftType === "text" && !trimmedLabel) return;
    if (draftType === "image" && !draftImage) return;

    if (editing.kind === "item-new") {
      const id = `item-${Date.now()}`;
      commit({
        ...data,
        items: [
          ...data.items,
          {
            id,
            type: draftType,
            label: draftType === "text" ? trimmedLabel : trimmedLabel || "Image card",
            image: draftType === "image" ? draftImage : undefined,
            categoryId: editing.categoryId,
          },
        ],
      });
    } else if (editing.kind === "item") {
      commit({
        ...data,
        items: data.items.map((i) =>
          i.id === editing.id
            ? {
                ...i,
                type: draftType,
                label:
                  draftType === "text"
                    ? trimmedLabel
                    : trimmedLabel || i.label || "Image card",
                image: draftType === "image" ? draftImage : undefined,
              }
            : i
        ),
      });
    }
    setEditing(null);
  };

  const removeCard = (id: string) => {
    commit({ ...data, items: data.items.filter((i) => i.id !== id) });
  };

  /* ---------- Category CRUD ---------- */
  const openCreateCategory = () => {
    setDraftCatLabel("");
    setDraftCatDescription("");
    setEditing({ kind: "category-new" });
  };

  const openEditCategory = (id: string) => {
    const cat = data.categories.find((c) => c.id === id);
    if (!cat) return;
    setDraftCatLabel(cat.label);
    setDraftCatDescription(cat.description ?? "");
    setEditing({ kind: "category", id });
  };

  const saveCategory = () => {
    if (!editing) return;
    const label = draftCatLabel.trim() || "Category";
    const description = draftCatDescription.trim();
    if (editing.kind === "category-new") {
      const id = `cat-${Date.now()}`;
      commit({
        ...data,
        categories: [...data.categories, { id, label, description }],
      });
    } else if (editing.kind === "category") {
      commit({
        ...data,
        categories: data.categories.map((c) =>
          c.id === editing.id ? { ...c, label, description } : c
        ),
      });
    }
    setEditing(null);
  };

  const removeCategory = (id: string) => {
    if (data.categories.length <= 2) return;
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
    e.dataTransfer.setData("text/plain", itemId);
    setDraggingId(itemId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverCol(null);
  };

  const handleColDragOver = (colId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverCol !== colId) setDragOverCol(colId);
  };

  const handleColDrop = (categoryId: string | null) => (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggingId;
    setDragOverCol(null);
    setDraggingId(null);
    if (!id) return;

    // Find target index. If dropped on a card inside, we'll reorder before that card.
    const targetCardId = (e.target as HTMLElement)
      .closest("[data-card-id]")
      ?.getAttribute("data-card-id");

    const dragged = data.items.find((i) => i.id === id);
    if (!dragged) return;

    const nextItems = data.items.filter((i) => i.id !== id);
    const updated = { ...dragged, categoryId };

    if (targetCardId && targetCardId !== id) {
      const idx = nextItems.findIndex((i) => i.id === targetCardId);
      if (idx >= 0) {
        nextItems.splice(idx, 0, updated);
        commit({ ...data, items: nextItems });
        return;
      }
    }
    // Append to end of column
    let lastIdxInCol = -1;
    nextItems.forEach((i, idx) => {
      if ((i.categoryId ?? null) === categoryId) lastIdxInCol = idx;
    });
    nextItems.splice(lastIdxInCol + 1, 0, updated);
    commit({ ...data, items: nextItems });
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

  const columns: Array<{ id: string | null; label: string; description?: string }> = [
    { id: null, label: "Unassigned", description: "Cards not yet placed in a category" },
    ...data.categories.map((c) => ({ id: c.id, label: c.label, description: c.description })),
  ];

  const itemsByCol = (colId: string | null) =>
    data.items.filter((i) => (i.categoryId ?? null) === colId);

  const isCategoryEditing =
    editing?.kind === "category" || editing?.kind === "category-new";
  const isCardEditing = editing?.kind === "item" || editing?.kind === "item-new";

  return (
    <div className="w-full space-y-6">
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
        items={data.items}
        index={index}
        total={data.items.length}
        onPrev={prev}
        onNext={next}
      />

      {/* Categories */}
      <CategoryGrid categories={data.categories} />

      {/* Manager modal */}
      <Dialog open={managerOpen} onOpenChange={(open) => !open && setManagerOpen(false)}>
        <DialogContent className="sm:max-w-6xl max-h-[92vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
            <DialogTitle>Manage cards & categories</DialogTitle>
            <DialogDescription>
              Rename categories, add text or image cards, and drag cards between categories.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 bg-muted/20">
            <div
              className="grid gap-5"
              style={{
                gridTemplateColumns: `repeat(${Math.min(
                  data.categories.length,
                  2
                )}, minmax(0, 1fr))`,
              }}
            >
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
                      {data.categories.length > 2 && (
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
                      onDragLeave={() => setDragOverCol(null)}
                      onDrop={handleColDrop(cat.id)}
                      className={cn(
                        "rounded-2xl border bg-card p-5 transition-all shadow-sm",
                        isOver
                          ? "border-primary ring-2 ring-primary/20"
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
                            onClick={() => {
                              setDraftType("text");
                              setDraftLabel("");
                              setDraftImage("");
                              setEditing({ kind: "item-new", categoryId: cat.id });
                            }}
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
                            onClick={() => {
                              setDraftType("image");
                              setDraftLabel("");
                              setDraftImage("");
                              setEditing({ kind: "item-new", categoryId: cat.id });
                            }}
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
                      <div className="pt-4 flex flex-wrap gap-3 min-h-[180px]">
                        {cards.map((item) => (
                          <div
                            key={item.id}
                            data-card-id={item.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item.id)}
                            onDragEnd={handleDragEnd}
                            className={cn(
                              "group relative w-[150px] h-[160px] rounded-xl border bg-card shadow-sm overflow-hidden cursor-grab active:cursor-grabbing transition-all",
                              draggingId === item.id
                                ? "opacity-40 scale-95 border-primary"
                                : "border-border hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5"
                            )}
                          >
                            {/* Actions */}
                            <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                className="w-6 h-6 rounded-md bg-background/90 backdrop-blur border border-border text-muted-foreground hover:text-primary hover:border-primary/40 inline-flex items-center justify-center transition-colors"
                                onClick={() => openEditCard(item.id)}
                                aria-label={`Edit ${item.label || "card"}`}
                              >
                                <Pencil
                                  className="w-3 h-3"
                                  aria-hidden="true"
                                  focusable="false"
                                />
                              </button>
                              <button
                                type="button"
                                className="w-6 h-6 rounded-md bg-background/90 backdrop-blur border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 inline-flex items-center justify-center transition-colors"
                                onClick={() => removeCard(item.id)}
                                aria-label={`Delete ${item.label || "card"}`}
                              >
                                <Trash2
                                  className="w-3 h-3"
                                  aria-hidden="true"
                                  focusable="false"
                                />
                              </button>
                            </div>
                            <span
                              className="absolute top-1.5 left-1.5 z-10 w-6 h-6 rounded-md bg-background/90 backdrop-blur border border-border text-muted-foreground inline-flex items-center justify-center"
                              aria-hidden="true"
                            >
                              <GripVertical
                                className="w-3 h-3"
                                focusable="false"
                              />
                            </span>

                            {item.type === "image" && item.image ? (
                              <img
                                src={item.image}
                                alt={item.label || "Card"}
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center px-3 text-center">
                                <span className="text-sm font-medium text-foreground break-words line-clamp-4">
                                  {item.label || "Untitled card"}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}

                        {cards.length === 0 && (
                          <div className="w-full flex items-center justify-center text-xs text-muted-foreground/70 italic border border-dashed border-border rounded-xl py-10 px-4 text-center">
                            No cards yet — add a Text or Image card, or drag one here.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add category */}
            <div className="mt-5">
              <button
                type="button"
                onClick={openCreateCategory}
                disabled={data.categories.length >= 4}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-card/60 hover:bg-primary/[0.04] hover:border-primary/40 py-3 text-sm font-medium text-muted-foreground hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" aria-hidden="true" focusable="false" />
                Add category
              </button>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-border">
            <Button onClick={() => setManagerOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Card create/edit modal */}
      <Dialog
        open={isCardEditing}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing?.kind === "item-new" ? "Add card" : "Edit card"}
            </DialogTitle>
            <DialogDescription>
              Choose a text or image card. Text is limited to {TEXT_LIMIT} characters.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Type toggle */}
            <div className="inline-flex p-1 rounded-full bg-muted">
              {(["text", "image"] as CardType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDraftType(t)}
                  className={cn(
                    "px-3.5 py-1.5 text-xs font-medium rounded-full transition-all inline-flex items-center gap-1.5",
                    draftType === t
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t === "text" ? (
                    <TypeIcon className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                  ) : (
                    <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                  )}
                  {t === "text" ? "Text" : "Image"}
                </button>
              ))}
            </div>

            {draftType === "text" ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="card-sort-text">Card text</Label>
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {draftLabel.length}/{TEXT_LIMIT}
                  </span>
                </div>
                <Textarea
                  id="card-sort-text"
                  value={draftLabel}
                  onChange={(e) => setDraftLabel(e.target.value.slice(0, TEXT_LIMIT))}
                  maxLength={TEXT_LIMIT}
                  rows={3}
                  placeholder="e.g. Photosynthesis"
                  autoFocus
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Image</Label>
                <div
                  className="relative w-full aspect-[5/4] rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={onPickImage}
                >
                  {draftImage ? (
                    <img
                      src={draftImage}
                      alt="Card preview"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <Upload className="w-5 h-5" aria-hidden="true" focusable="false" />
                      <span className="text-xs">Click to upload image</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileChange}
                  aria-label="Upload card image"
                />
                <div className="space-y-1.5">
                  <Label htmlFor="card-sort-image-label" className="text-xs">
                    Caption (optional)
                  </Label>
                  <Input
                    id="card-sort-image-label"
                    value={draftLabel}
                    onChange={(e) => setDraftLabel(e.target.value.slice(0, TEXT_LIMIT))}
                    maxLength={TEXT_LIMIT}
                    placeholder="Short caption for accessibility"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              onClick={saveCard}
              disabled={
                (draftType === "text" && !draftLabel.trim()) ||
                (draftType === "image" && !draftImage)
              }
            >
              Save
            </Button>
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
              Name the drop category and optionally describe it for learners.
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
            <div className="space-y-2">
              <Label htmlFor="cat-desc">Description (optional)</Label>
              <Input
                id="cat-desc"
                value={draftCatDescription}
                onChange={(e) => setDraftCatDescription(e.target.value)}
                placeholder="Short hint for learners"
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
  const [index, setIndex] = useState(0);
  const [activeDropId, setActiveDropId] = useState<string | null>(null);

  useEffect(() => {
    setAssignments((prev) => {
      const next: Record<string, string | null> = {};
      for (const item of data.items) next[item.id] = prev[item.id] ?? null;
      return next;
    });
    setIndex(0);
  }, [data.items]);

  const unassigned = data.items.filter((i) => !assignments[i.id]);
  const safeIndex = unassigned.length === 0 ? 0 : Math.min(index, unassigned.length - 1);

  const prev = useCallback(() => {
    if (unassigned.length === 0) return;
    setIndex((i) => (i - 1 + unassigned.length) % unassigned.length);
  }, [unassigned.length]);
  const next = useCallback(() => {
    if (unassigned.length === 0) return;
    setIndex((i) => (i + 1) % unassigned.length);
  }, [unassigned.length]);

  const onDragStart = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData("text/card-sort-item", itemId);
    e.dataTransfer.effectAllowed = "move";
  };

  const allowDrop = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("text/card-sort-item")) e.preventDefault();
  };

  const onDropTo = (categoryId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    setActiveDropId(null);
    const id = e.dataTransfer.getData("text/card-sort-item");
    if (!id) return;
    setAssignments((prev) => ({ ...prev, [id]: categoryId }));
    setIndex(0);
  };

  const reset = () => {
    const cleared: Record<string, string | null> = {};
    for (const item of data.items) cleared[item.id] = null;
    setAssignments(cleared);
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

  return (
    <div className="w-full space-y-6">
      <CardStack
        items={unassigned}
        index={safeIndex}
        total={data.items.length}
        onPrev={prev}
        onNext={next}
        onReset={reset}
        onDragStart={onDragStart}
        interactive
        emptyLabel="All cards sorted"
      />
      <CategoryGrid
        categories={data.categories}
        droppedCounts={droppedCounts}
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
