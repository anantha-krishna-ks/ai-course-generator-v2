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
                  "absolute inset-0 rounded-2xl bg-card border border-border shadow-md transition-transform duration-300",
                  "flex items-center justify-center px-5 text-center",
                  interactive && "cursor-grab active:cursor-grabbing active:scale-[0.98]"
                )}
              >
                <span
                  className="absolute top-3 left-3 inline-flex items-center justify-center w-6 h-6 rounded-md bg-muted text-muted-foreground"
                  aria-hidden="true"
                >
                  <GripHorizontal className="w-3.5 h-3.5" focusable="false" />
                </span>
                <p className="text-sm font-medium text-foreground break-words">
                  {current?.label}
                </p>
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
  | { kind: "category"; id: string }
  | null;

interface CardSortBlockProps {
  content: string;
  onChange: (content: string) => void;
}

export function CardSortBlock({ content, onChange }: CardSortBlockProps) {
  const data = useMemo(() => parseContent(content), [content]);
  const [index, setIndex] = useState(0);
  const [editing, setEditing] = useState<EditTarget>(null);
  const [managingCategories, setManagingCategories] = useState(false);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftDescription, setDraftDescription] = useState("");

  useEffect(() => {
    if (index >= data.items.length) setIndex(Math.max(0, data.items.length - 1));
  }, [data.items.length, index]);

  const commit = (next: CardSortContent) => onChange(JSON.stringify(next));

  const current = data.items[index];

  const openItemEditor = () => {
    if (!current) return;
    setDraftLabel(current.label);
    setDraftDescription("");
    setEditing({ kind: "item", id: current.id });
  };

  const openCategoryEditor = (id: string) => {
    const cat = data.categories.find((c) => c.id === id);
    if (!cat) return;
    setDraftLabel(cat.label);
    setDraftDescription(cat.description ?? "");
    setEditing({ kind: "category", id });
  };

  const saveEditor = () => {
    if (!editing) return;
    if (editing.kind === "item") {
      commit({
        ...data,
        items: data.items.map((i) =>
          i.id === editing.id ? { ...i, label: draftLabel.trim() || "Card" } : i
        ),
      });
    } else {
      commit({
        ...data,
        categories: data.categories.map((c) =>
          c.id === editing.id
            ? {
                ...c,
                label: draftLabel.trim() || "Category",
                description: draftDescription.trim(),
              }
            : c
        ),
      });
    }
    setEditing(null);
  };

  const addItem = () => {
    const id = `item-${Date.now()}`;
    const next = { ...data, items: [...data.items, { id, label: `Card ${data.items.length + 1}` }] };
    commit(next);
    setIndex(next.items.length - 1);
  };

  const removeCurrentItem = () => {
    if (!current || data.items.length <= 1) return;
    commit({ ...data, items: data.items.filter((i) => i.id !== current.id) });
  };

  const addCategory = () => {
    if (data.categories.length >= 4) return;
    const id = `cat-${Date.now()}`;
    commit({
      ...data,
      categories: [
        ...data.categories,
        { id, label: `Category ${data.categories.length + 1}`, description: "" },
      ],
    });
  };

  const removeCategory = (id: string) => {
    if (data.categories.length <= 2) return;
    commit({ ...data, categories: data.categories.filter((c) => c.id !== id) });
  };

  const prev = useCallback(
    () => setIndex((i) => (i - 1 + data.items.length) % data.items.length),
    [data.items.length]
  );
  const next = useCallback(
    () => setIndex((i) => (i + 1) % data.items.length),
    [data.items.length]
  );

  const editingItem =
    editing?.kind === "item" ? data.items.find((i) => i.id === editing.id) : null;
  const editingCategory =
    editing?.kind === "category"
      ? data.categories.find((c) => c.id === editing.id)
      : null;

  return (
    <div className="w-full space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-full"
          onClick={() => setManagingCategories(true)}
        >
          <Pencil className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
          Edit categories
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 rounded-full text-primary hover:text-primary hover:bg-primary/10"
          onClick={addItem}
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
          Add card
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 rounded-full"
          onClick={openItemEditor}
          disabled={!current}
        >
          <Pencil className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
          Edit card
        </Button>
        {data.items.length > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={removeCurrentItem}
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
            Delete card
          </Button>
        )}
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

      {/* Manage categories dialog */}
      <Dialog
        open={managingCategories}
        onOpenChange={(open) => !open && setManagingCategories(false)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage categories</DialogTitle>
            <DialogDescription>
              Rename, add, or remove the categories learners will sort cards into.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2 max-h-[50vh] overflow-y-auto">
            {data.categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-2 rounded-xl border border-border p-2.5"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {cat.label}
                  </p>
                  {cat.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {cat.description}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => {
                    setManagingCategories(false);
                    openCategoryEditor(cat.id);
                  }}
                  aria-label={`Edit ${cat.label}`}
                >
                  <Pencil className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                </Button>
                {data.categories.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-destructive hover:text-destructive"
                    onClick={() => removeCategory(cat.id)}
                    aria-label={`Delete ${cat.label}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="gap-1.5"
              onClick={addCategory}
              disabled={data.categories.length >= 4}
            >
              <Plus className="w-4 h-4" aria-hidden="true" focusable="false" />
              Add category
            </Button>
            <Button onClick={() => setManagingCategories(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit label/description modal */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit card" : "Edit category"}</DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Update the label learners will see on this sortable card."
                : "Rename this drop category and add optional guidance for learners."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="card-sort-label">Label</Label>
              <Input
                id="card-sort-label"
                value={draftLabel}
                onChange={(e) => setDraftLabel(e.target.value)}
                placeholder={editingItem ? "e.g. Photosynthesis" : "e.g. Biology"}
                autoFocus
              />
            </div>
            {editingCategory && (
              <div className="space-y-2">
                <Label htmlFor="card-sort-description">Description (optional)</Label>
                <Input
                  id="card-sort-description"
                  value={draftDescription}
                  onChange={(e) => setDraftDescription(e.target.value)}
                  placeholder="Short hint for learners"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={saveEditor}>Save</Button>
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
