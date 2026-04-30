import { useState, useCallback, useMemo } from "react";
import { Trash2, Copy, GripVertical, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContentBlock } from "./ContentBlock";
import { DropIndicator } from "./DropIndicator";
import { resolveTemplateDropData } from "./ContentBlocksPanel";
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

const DEFAULT_DATA: NestedLayoutData = {
  kind: "any-block-layout",
  columns: [[], []],
};

function parseLayoutContent(raw: string): NestedLayoutData {
  if (!raw) return { kind: "any-block-layout", columns: [[], []] };
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      parsed.kind === "any-block-layout" &&
      Array.isArray(parsed.columns) &&
      parsed.columns.length >= 1
    ) {
      // Ensure exactly 2 columns
      const cols: NestedChild[][] = [
        Array.isArray(parsed.columns[0]) ? parsed.columns[0] : [],
        Array.isArray(parsed.columns[1]) ? parsed.columns[1] : [],
      ];
      return { kind: "any-block-layout", columns: cols };
    }
  } catch {
    /* fallthrough */
  }
  return { kind: "any-block-layout", columns: [[], []] };
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
}

export function NestedLayoutBlock({
  content,
  onChange,
  onDelete,
  onDuplicate,
  aiEnabled = false,
}: NestedLayoutBlockProps) {
  const data = useMemo(() => parseLayoutContent(content), [content]);

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
      // Prevent nesting another any-block-layout inside a column.
      if (type === "text" && variant === "any-block-layout") {
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
      // Only handle drop here when not landing on a DropIndicator (which stops propagation).
      e.preventDefault();
      setHoveredCol(null);
      setActiveDrop(null);
      const data = e.dataTransfer.getData("application/content-block");
      if (!data) return;
      try {
        // Late-import-style — inline parse to avoid importing resolveTemplateDropData here would still work, but reusing it keeps semantics aligned.
        const parsed = JSON.parse(data) as { templateId: string; categoryId: string };
        // Inline minimal resolver: read the catalog reference dynamically.
        // We keep this self-contained by re-using the dynamic import pattern.
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { resolveTemplateDropData } = require("./ContentBlocksPanel") as typeof import("./ContentBlocksPanel");
        const resolved = resolveTemplateDropData(parsed.templateId, parsed.categoryId);
        if (!resolved) return;
        // Append to end of column.
        insertChild(colIdx, getColumnLength(colIdx), resolved.type as NestedChildType, resolved.variant);
      } catch {
        /* ignore */
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [insertChild],
  );

  const getColumnLength = (colIdx: number) => data.columns[colIdx]?.length ?? 0;

  return (
    <div
      className="group/layout relative rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.02] to-primary/[0.05] p-3 my-2"
      aria-label="Two-column layout container"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <LayoutGrid className="w-3.5 h-3.5 text-primary/70" aria-hidden="true" focusable="false" />
          <span>2-Column Layout</span>
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

      {/* Two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              <div className="h-full min-h-[120px] flex flex-col items-center justify-center gap-1.5 text-center px-3 py-6 select-none">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <GripVertical className="w-4 h-4 text-primary/60" aria-hidden="true" focusable="false" />
                </div>
                <p className="text-xs font-medium text-foreground/70">Drop a block here</p>
                <p className="text-[11px] text-muted-foreground">Text, image, video, quiz, audio…</p>
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
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
