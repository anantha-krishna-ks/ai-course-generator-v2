import { useState, useCallback, useMemo } from "react";
import { Trash2, Copy, GripVertical, LayoutGrid, Type, ImageIcon, Video, Mic, HelpCircle, Plus, Info } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { ContentBlock } from "./ContentBlock";
import { DropIndicator } from "./DropIndicator";
import { AddContentButton } from "./AddContentButton";
import { resolveTemplateDropData } from "./ContentBlocksPanel";

// Variants that don't make sense inside a nested column (multi-column text
// layouts and side-by-side image/video descriptions). These are filtered out
// to avoid confusing nested layouts within layouts.
const DISALLOWED_NESTED_VARIANTS = new Set([
  "any-block-layout",
  "any-block-layout-2",
  "two-columns",
  "three-columns",
  "image-left",
  "image-right",
  "video-left",
  "video-right",
]);
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * NestedLayoutBlock — a safe, additive 2-column container that accepts any block.
 *
 * Persistence: stored as a regular `text` block with variant "any-block-layout".
 * Its `content` is a JSON string of the form:
 *   { kind: "any-block-layout", columns: [ NestedChild[], NestedChild[] ] }
 *
 * Each NestedChild mirrors PageContentBlock minimally:
 *   { id, type, content, variant?, font? }
 *
 * Outside of this component, the block looks like a normal text block, so
 * existing drop, save, restore, delete, and duplicate paths keep working
 * unchanged. We intentionally do NOT propagate a new "layout" type union into
 * any other file.
 */

type NestedChildType =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "doc"
  | "quiz"
  | "image-description"
  | "video-description";

interface NestedChild {
  id: string;
  type: NestedChildType;
  content: string;
  variant?: string;
  font?: string;
}

interface NestedLayoutData {
  kind: "any-block-layout";
  columns: NestedChild[][];
}

function parseLayoutContent(raw: string, columnCount: 1 | 2): NestedLayoutData {
  const empty = (): NestedChild[][] =>
    columnCount === 2 ? [[], []] : [[]];
  if (!raw) return { kind: "any-block-layout", columns: empty() };
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      parsed.kind === "any-block-layout" &&
      Array.isArray(parsed.columns) &&
      parsed.columns.length >= 1
    ) {
      const incoming: NestedChild[][] = parsed.columns.map((c: unknown) =>
        Array.isArray(c) ? (c as NestedChild[]) : [],
      );
      if (columnCount === 1) {
        const merged: NestedChild[] = [];
        for (const c of incoming) merged.push(...c);
        return { kind: "any-block-layout", columns: [merged] };
      }
      const cols: NestedChild[][] = [incoming[0] ?? [], incoming[1] ?? []];
      return { kind: "any-block-layout", columns: cols };
    }
  } catch {
    /* fallthrough */
  }
  return { kind: "any-block-layout", columns: empty() };
}

function getVariantContent(type: NestedChildType, variant?: string): string {
  if (type === "image") return "";
  if (type === "image-description") {
    const layoutMap: Record<string, string> = {
      "image-bottom": "image-bottom",
      "image-left": "image-left",
      "image-right": "image-right",
    };
    return JSON.stringify({
      layout: layoutMap[variant || ""] || "image-top",
      imageUrl: "",
      description: "<p>Add a description here...</p>",
    });
  }
  if (type === "video-description") {
    return JSON.stringify({
      layout: variant === "video-right" ? "video-right" : "video-left",
      videoUrl: "",
      description: "",
    });
  }
  if (type === "video" || type === "audio" || type === "doc") return "";
  if (type === "quiz") return "";
  // text fallthrough — but we explicitly forbid nesting another any-block-layout
  if (type === "text" && variant === "any-block-layout") {
    return "<p>Nested layouts are not allowed.</p>";
  }
  switch (variant) {
    case "heading-text":
      return "<h2>Heading</h2><p>Start writing here...</p>";
    case "two-columns":
      return '<!--layout:two-columns--><h2>Heading</h2><p>Start writing here...</p><!--col-break--><h2>Heading</h2><p>Start writing here...</p>';
    case "three-columns":
      return '<!--layout:three-columns--><h2>Col 1</h2><p>Start...</p><!--col-break--><h2>Col 2</h2><p>Start...</p><!--col-break--><h2>Col 3</h2><p>Start...</p>';
    case "text-only":
    default:
      return "<p>Start writing here...</p>";
  }
}

interface NestedLayoutBlockProps {
  id: string;
  content: string;
  onChange: (content: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  aiEnabled?: boolean;
  /** Number of side-by-side columns to render. Defaults to 1. */
  columnCount?: 1 | 2;
}

export function NestedLayoutBlock({
  id,
  content,
  onChange,
  onDelete,
  onDuplicate,
  aiEnabled = false,
  columnCount = 1,
}: NestedLayoutBlockProps) {
  const data = useMemo(() => parseLayoutContent(content, columnCount), [content, columnCount]);

  // Sortable wiring so the container participates in the page-level reorder DnD,
  // matching the behavior of regular ContentBlocks.
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const sortableStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Per-column drop-target index (for showing drop indicators between nested blocks).
  const [activeDrop, setActiveDrop] = useState<{ col: number; idx: number } | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  const persist = useCallback(
    (next: NestedLayoutData) => {
      onChange(JSON.stringify(next));
    },
    [onChange],
  );

  const updateChild = useCallback(
    (colIdx: number, childId: string, patch: Partial<NestedChild>) => {
      const cols = data.columns.map((col, ci) =>
        ci === colIdx ? col.map((c) => (c.id === childId ? { ...c, ...patch } : c)) : col,
      );
      persist({ ...data, columns: cols });
    },
    [data, persist],
  );

  const insertChild = useCallback(
    (colIdx: number, atIndex: number, type: NestedChildType, variant?: string) => {
      // Block disallowed variants (nested layouts and side-by-side variants
      // that don't fit within a column).
      if (variant && DISALLOWED_NESTED_VARIANTS.has(variant)) {
        return;
      }
      const id = `nested-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const newChild: NestedChild = {
        id,
        type,
        content: getVariantContent(type, variant),
        variant,
      };
      const cols = data.columns.map((col, ci) => {
        if (ci !== colIdx) return col;
        const next = [...col];
        next.splice(atIndex, 0, newChild);
        return next;
      });
      persist({ ...data, columns: cols });
    },
    [data, persist],
  );

  const removeChild = useCallback(
    (colIdx: number, childId: string) => {
      const cols = data.columns.map((col, ci) =>
        ci === colIdx ? col.filter((c) => c.id !== childId) : col,
      );
      persist({ ...data, columns: cols });
    },
    [data, persist],
  );

  const duplicateChild = useCallback(
    (colIdx: number, childId: string) => {
      const cols = data.columns.map((col, ci) => {
        if (ci !== colIdx) return col;
        const i = col.findIndex((c) => c.id === childId);
        if (i < 0) return col;
        const original = col[i];
        const dup: NestedChild = {
          ...original,
          id: `nested-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        };
        const next = [...col];
        next.splice(i + 1, 0, dup);
        return next;
      });
      persist({ ...data, columns: cols });
    },
    [data, persist],
  );

  const handlePositionalDrop = useCallback(
    (colIdx: number) =>
      (atIndex: number, type: string, variant?: string) => {
        setActiveDrop(null);
        setHoveredCol(null);
        insertChild(colIdx, atIndex, type as NestedChildType, variant);
      },
    [insertChild],
  );

  const handleColumnDragOver = useCallback((colIdx: number) => (e: React.DragEvent) => {
    if (Array.from(e.dataTransfer.types).indexOf("application/content-block") >= 0) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      setHoveredCol(colIdx);
    }
  }, []);

  const handleColumnDragLeave = useCallback((colIdx: number) => (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      setHoveredCol((prev) => (prev === colIdx ? null : prev));
    }
  }, []);

  const handleColumnDrop = useCallback(
    (colIdx: number) => (e: React.DragEvent) => {
      // Only handles drops that didn't land on a DropIndicator (which stops propagation).
      e.preventDefault();
      setHoveredCol(null);
      setActiveDrop(null);
      const raw = e.dataTransfer.getData("application/content-block");
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw) as { templateId: string; categoryId: string };
        const resolved = resolveTemplateDropData(parsed.templateId, parsed.categoryId);
        if (!resolved) return;
        // Append to end of column.
        const appendIndex = data.columns[colIdx]?.length ?? 0;
        insertChild(colIdx, appendIndex, resolved.type as NestedChildType, resolved.variant);
      } catch {
        /* ignore */
      }
    },
    [data.columns, insertChild],
  );




  return (
    <div
      ref={setNodeRef}
      style={sortableStyle}
      {...attributes}
      className="group/layout relative rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.02] to-primary/[0.05] p-3 my-2"
      aria-label={columnCount === 2 ? "Two-column layout container" : "Single-column layout container"}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                {...listeners}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-grab active:cursor-grabbing touch-none"
                aria-label="Drag to reorder layout"
              >
                <GripVertical className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">Drag to reorder</TooltipContent>
          </Tooltip>
          <LayoutGrid className="w-3.5 h-3.5 text-primary/70" aria-hidden="true" focusable="false" />
          <span>{columnCount === 2 ? "2-Column Layout" : "1-Column Layout"}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover/layout:opacity-100 transition-opacity">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onDuplicate}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Duplicate layout"
              >
                <Copy className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">Duplicate</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onDelete}
                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                aria-label="Delete layout"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">Delete</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Columns */}
      <div className={cn("grid gap-3", columnCount === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
        {data.columns.map((col, colIdx) => (
          <div
            key={`col-${colIdx}`}
            onDragOver={handleColumnDragOver(colIdx)}
            onDragLeave={handleColumnDragLeave(colIdx)}
            onDrop={handleColumnDrop(colIdx)}
            className={cn(
              "min-h-[140px] rounded-xl border-2 border-dashed transition-colors p-2",
              hoveredCol === colIdx
                ? "border-primary/60 bg-primary/[0.06]"
                : col.length === 0
                ? "border-primary/25 bg-background/40"
                : "border-transparent bg-background/40",
            )}
          >
            {col.length === 0 ? (
              <div className="h-full min-h-[140px] flex flex-col items-center justify-center gap-2.5 text-center px-4 py-6 select-none">
                {/* Faux block stack preview */}
                <div className="w-full max-w-[180px] flex flex-col gap-1.5 mb-1" aria-hidden="true">
                  <div className="h-2 rounded-full bg-primary/25 w-2/3 mx-auto" />
                  <div className="w-full h-9 rounded-md bg-primary/10 border border-primary/15 flex items-center justify-center">
                    <ImageIcon className="w-3.5 h-3.5 text-primary/55" focusable="false" />
                  </div>
                  <div className="h-1.5 rounded-full bg-primary/15 w-full" />
                  <div className="h-1.5 rounded-full bg-primary/15 w-5/6 mx-auto" />
                </div>
                {/* Accepted block-type pills */}
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  {[Type, ImageIcon, Video, Mic, HelpCircle].map((Icon, i) => (
                    <span
                      key={i}
                      className="w-6 h-6 rounded-full bg-background border border-primary/20 flex items-center justify-center text-primary/70"
                    >
                      <Icon className="w-3 h-3" focusable="false" />
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Drag a block here, or</p>
                {/* Add content button (compact, opens block picker popover) */}
                <div className="w-full max-w-[260px] mt-0.5" onPointerDown={(e) => e.stopPropagation()}>
                  <AddContentButton
                    variant="simple"
                    aiEnabled={aiEnabled}
                    onAddText={() => insertChild(colIdx, 0, "text")}
                    onAddImage={() => insertChild(colIdx, 0, "image")}
                    onAddVideo={() => insertChild(colIdx, 0, "video")}
                    onAddAudio={() => insertChild(colIdx, 0, "audio")}
                    onAddDoc={() => insertChild(colIdx, 0, "doc")}
                    onAddQuiz={() => insertChild(colIdx, 0, "quiz")}
                    onDropBlock={(type, variant) =>
                      insertChild(colIdx, 0, type as NestedChildType, variant)
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                {/* Drop indicator before first */}
                <DropIndicator
                  index={0}
                  isActive={activeDrop?.col === colIdx && activeDrop?.idx === 0}
                  onActivate={(i) => setActiveDrop({ col: colIdx, idx: i })}
                  onDeactivate={() => setActiveDrop(null)}
                  onDrop={handlePositionalDrop(colIdx)}
                />
                {col.map((child, i) => (
                  <div key={child.id}>
                    <ContentBlock
                      id={child.id}
                      type={child.type}
                      content={child.content}
                      variant={child.variant}
                      font={child.font}
                      onChange={(c) => updateChild(colIdx, child.id, { content: c })}
                      onDelete={() => removeChild(colIdx, child.id)}
                      onDuplicate={() => duplicateChild(colIdx, child.id)}
                      onTypeChange={(t, c, v) =>
                        updateChild(colIdx, child.id, { type: t, content: c, variant: v })
                      }
                      onFontChange={(fid) => updateChild(colIdx, child.id, { font: fid })}
                      aiEnabled={aiEnabled}
                    />
                    <DropIndicator
                      index={i + 1}
                      isActive={activeDrop?.col === colIdx && activeDrop?.idx === i + 1}
                      onActivate={(idx) => setActiveDrop({ col: colIdx, idx })}
                      onDeactivate={() => setActiveDrop(null)}
                      onDrop={handlePositionalDrop(colIdx)}
                    />
                  </div>
                ))}
                {/* Add another block at the end of the column */}
                <div className="mt-1" onPointerDown={(e) => e.stopPropagation()}>
                  <AddContentButton
                    variant="simple"
                    aiEnabled={aiEnabled}
                    onAddText={() => insertChild(colIdx, col.length, "text")}
                    onAddImage={() => insertChild(colIdx, col.length, "image")}
                    onAddVideo={() => insertChild(colIdx, col.length, "video")}
                    onAddAudio={() => insertChild(colIdx, col.length, "audio")}
                    onAddDoc={() => insertChild(colIdx, col.length, "doc")}
                    onAddQuiz={() => insertChild(colIdx, col.length, "quiz")}
                    onDropBlock={(type, variant) =>
                      insertChild(colIdx, col.length, type as NestedChildType, variant)
                    }
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
