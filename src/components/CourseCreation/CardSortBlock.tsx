import { useMemo, useState, useEffect } from "react";
import { Pencil, LayoutGrid, FolderOpen, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface CardSortItem {
  id: string;
  label: string;
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
  items: [{ id: "item-1", label: "Item" }],
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
      return data;
    }
  } catch {}
  return DEFAULT_CONTENT;
}

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
  const [editing, setEditing] = useState<EditTarget>(null);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftDescription, setDraftDescription] = useState("");

  const commit = (next: CardSortContent) => onChange(JSON.stringify(next));

  const openEditor = (target: EditTarget) => {
    if (!target) return;
    if (target.kind === "item") {
      const item = data.items.find((i) => i.id === target.id);
      setDraftLabel(item?.label ?? "");
      setDraftDescription("");
    } else {
      const cat = data.categories.find((c) => c.id === target.id);
      setDraftLabel(cat?.label ?? "");
      setDraftDescription(cat?.description ?? "");
    }
    setEditing(target);
  };

  const saveEditor = () => {
    if (!editing) return;
    if (editing.kind === "item") {
      commit({
        ...data,
        items: data.items.map((i) =>
          i.id === editing.id ? { ...i, label: draftLabel.trim() || "Item" } : i
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
    commit({ ...data, items: [...data.items, { id, label: "New item" }] });
  };

  const removeItem = (id: string) => {
    if (data.items.length <= 1) return;
    commit({ ...data, items: data.items.filter((i) => i.id !== id) });
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

  const editingItem =
    editing?.kind === "item" ? data.items.find((i) => i.id === editing.id) : null;
  const editingCategory =
    editing?.kind === "category"
      ? data.categories.find((c) => c.id === editing.id)
      : null;

  return (
    <div className="w-full space-y-5">
      {/* Row 1 — items to sort */}
      <div className="rounded-2xl border border-dashed border-primary/25 bg-primary/[0.03] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Items
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-primary hover:text-primary hover:bg-primary/10"
            onClick={addItem}
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
            Add item
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          {data.items.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all px-4 py-3 min-w-[140px] flex items-center gap-2"
            >
              <span className="text-sm font-medium text-foreground truncate">
                {item.label}
              </span>
              <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  onClick={() => openEditor({ kind: "item", id: item.id })}
                  aria-label={`Edit ${item.label}`}
                >
                  <Pencil className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                </Button>
                {data.items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full text-destructive hover:text-destructive"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Delete ${item.label}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2 — categories */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Drop categories
            </span>
          </div>
          {data.categories.length < 4 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-primary hover:text-primary hover:bg-primary/10"
              onClick={addCategory}
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
              Add category
            </Button>
          )}
        </div>
        <div
          className={cn(
            "grid gap-4",
            data.categories.length === 2
              ? "grid-cols-1 sm:grid-cols-2"
              : data.categories.length === 3
              ? "grid-cols-1 sm:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          )}
        >
          {data.categories.map((cat) => (
            <div
              key={cat.id}
              className="group relative rounded-2xl border-2 border-dashed border-border bg-muted/30 hover:border-primary/40 hover:bg-primary/[0.04] transition-all min-h-[140px] p-4 flex flex-col"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {cat.label}
                  </p>
                  {cat.description ? (
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                      {cat.description}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs text-muted-foreground/70 italic">
                      Drop items here
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    onClick={() => openEditor({ kind: "category", id: cat.id })}
                    aria-label={`Edit ${cat.label}`}
                  >
                    <Pencil className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                  </Button>
                  {data.categories.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full text-destructive hover:text-destructive"
                      onClick={() => removeCategory(cat.id)}
                      aria-label={`Delete ${cat.label}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex-1 mt-3 rounded-xl border border-dashed border-border/60 bg-background/40" />
            </div>
          ))}
        </div>
      </div>

      {/* Edit modal */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit item" : "Edit category"}
            </DialogTitle>
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

interface CardSortPreviewProps {
  content: string;
}

export function CardSortPreview({ content }: CardSortPreviewProps) {
  const data = useMemo(() => parseContent(content), [content]);
  const [assignments, setAssignments] = useState<Record<string, string | null>>(
    {}
  );

  useEffect(() => {
    setAssignments((prev) => {
      const next: Record<string, string | null> = {};
      for (const item of data.items) next[item.id] = prev[item.id] ?? null;
      return next;
    });
  }, [data.items]);

  const onDragStart = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData("text/card-sort-item", itemId);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDropTo = (categoryId: string | null) => (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/card-sort-item");
    if (!id) return;
    setAssignments((prev) => ({ ...prev, [id]: categoryId }));
  };

  const allowDrop = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("text/card-sort-item")) e.preventDefault();
  };

  const unassignedItems = data.items.filter((i) => !assignments[i.id]);

  return (
    <div className="w-full space-y-5">
      <div
        className="rounded-2xl border border-dashed border-primary/25 bg-primary/[0.03] p-4 min-h-[92px]"
        onDragOver={allowDrop}
        onDrop={onDropTo(null)}
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Drag items into the right category
        </p>
        <div className="flex flex-wrap gap-3">
          {unassignedItems.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">All items sorted.</p>
          ) : (
            unassignedItems.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => onDragStart(e, item.id)}
                className="cursor-grab active:cursor-grabbing rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow px-4 py-3 text-sm font-medium text-foreground"
              >
                {item.label}
              </div>
            ))
          )}
        </div>
      </div>

      <div
        className={cn(
          "grid gap-4",
          data.categories.length === 2
            ? "grid-cols-1 sm:grid-cols-2"
            : data.categories.length === 3
            ? "grid-cols-1 sm:grid-cols-3"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        )}
      >
        {data.categories.map((cat) => {
          const dropped = data.items.filter((i) => assignments[i.id] === cat.id);
          return (
            <div
              key={cat.id}
              onDragOver={allowDrop}
              onDrop={onDropTo(cat.id)}
              className="rounded-2xl border-2 border-dashed border-border bg-muted/30 hover:border-primary/40 hover:bg-primary/[0.04] transition-colors min-h-[160px] p-4 flex flex-col"
            >
              <p className="text-sm font-semibold text-foreground">{cat.label}</p>
              {cat.description && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {cat.description}
                </p>
              )}
              <div className="flex-1 mt-3 flex flex-wrap gap-2 content-start">
                {dropped.length === 0 ? (
                  <p className="text-xs text-muted-foreground/70 italic">
                    Drop items here
                  </p>
                ) : (
                  dropped.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, item.id)}
                      className="cursor-grab active:cursor-grabbing rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary shadow-sm"
                    >
                      {item.label}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
