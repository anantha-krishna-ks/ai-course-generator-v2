import { useRef, useState, useEffect } from "react";
import { GripVertical, Copy, Trash2, LayoutGrid, Type, Columns2, Heading } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DescriptionEditor } from "./DescriptionEditor";
import { cn } from "@/lib/utils";

interface DescriptionBlockProps {
  id: string;
  content: string;
  onChange: (content: string) => void;
  onClear: () => void;
  onDuplicate: () => void;
}

type LayoutType = "heading-text" | "text-only" | "two-columns";

const COL_SEPARATOR = "<!--col-break-->";

const layoutOptions: { id: LayoutType; label: string; icon: React.ComponentType<{ className?: string }>; columns: number }[] = [
  { id: "heading-text", label: "Heading and text", icon: Heading, columns: 1 },
  { id: "text-only", label: "Text", icon: Type, columns: 1 },
  { id: "two-columns", label: "Two columns", icon: Columns2, columns: 2 },
];

function detectLayout(content: string): LayoutType {
  if (content.startsWith("<!--layout:")) {
    const match = content.match(/<!--layout:(\w[\w-]*)-->/);
    if (match) return match[1] as LayoutType;
  }
  return "text-only";
}

function encodeContent(layout: LayoutType, columns: string[]): string {
  if (layout === "text-only") return columns[0] || "";
  return `<!--layout:${layout}-->${columns.join(COL_SEPARATOR)}`;
}

function decodeColumns(content: string, layout: LayoutType): string[] {
  const colCount = layoutOptions.find((o) => o.id === layout)?.columns ?? 1;
  if (layout === "text-only") return [content.replace(/<!--layout:\w[\w-]*-->/, "")];
  const raw = content.replace(/<!--layout:\w[\w-]*-->/, "");
  const parts = raw.split(COL_SEPARATOR);
  // Pad to expected column count
  while (parts.length < colCount) parts.push("<p></p>");
  return parts.slice(0, colCount);
}

const defaultContent: Record<LayoutType, string[]> = {
  "heading-text": ["<h2>Heading</h2><p>Start writing your content here...</p>"],
  "text-only": ["<p>Start writing your content here...</p>"],
  "two-columns": ["<h2>Heading</h2><p>Start writing here...</p>", "<h2>Heading</h2><p>Start writing here...</p>"],
};

export function DescriptionBlock({
  id,
  content,
  onChange,
  onClear,
  onDuplicate,
}: DescriptionBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLayoutOpen, setIsLayoutOpen] = useState(false);
  const [layout, setLayout] = useState<LayoutType>(() => detectLayout(content));
  const blockRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (!isEditing) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (blockRef.current && !blockRef.current.contains(e.target as Node)) {
        setIsEditing(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing]);

  const columns = decodeColumns(content, layout);

  const hasContent = columns.some(
    (col) => col && col !== "<p></p>" && col.replace(/<[^>]*>/g, "").trim() !== ""
  );

  const handleColumnChange = (colIndex: number, newContent: string) => {
    const updated = [...columns];
    updated[colIndex] = newContent;
    onChange(encodeContent(layout, updated));
  };

  const handleLayoutChange = (newLayout: LayoutType) => {
    setLayout(newLayout);
    const newCols = defaultContent[newLayout];
    onChange(encodeContent(newLayout, newCols));
    setIsEditing(true);
  };

  const colCount = layoutOptions.find((o) => o.id === layout)?.columns ?? 1;

  const SidebarButton = ({
    icon: Icon,
    label,
    onClick,
    className: btnClass,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    onClick?: () => void;
    className?: string;
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className={cn(
            "p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
            btnClass
          )}
        >
          <Icon className="w-4 h-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="left" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );

  const renderPreview = () => {
    if (!hasContent) {
      return (
        <span className="text-lg text-foreground/40 italic">
          Tell your learners what the course will be about...
        </span>
      );
    }

    if (colCount > 1) {
      return (
        <div className="grid gap-6 grid-cols-2">
          {columns.map((col, i) => (
            <div
              key={i}
              className="prose prose-sm dark:prose-invert max-w-none text-foreground/80 break-words [overflow-wrap:anywhere]"
              dangerouslySetInnerHTML={{ __html: col }}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        className="prose prose-sm dark:prose-invert max-w-none text-foreground/80 break-words [overflow-wrap:anywhere]"
        dangerouslySetInnerHTML={{ __html: columns[0] }}
      />
    );
  };

  const renderEditor = () => {
    if (colCount > 1) {
      return (
        <div className="grid gap-4 grid-cols-2">
          {columns.map((col, i) => (
            <div key={i} className="min-w-0">
              <DescriptionEditor content={col} onChange={(val) => handleColumnChange(i, val)} />
            </div>
          ))}
        </div>
      );
    }

    return <DescriptionEditor content={columns[0]} onChange={(val) => handleColumnChange(0, val)} />;
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        (blockRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      style={style}
      className={cn(
        "group/desc relative animate-fade-in transition-shadow duration-200 min-w-0",
        isDragging && "z-50 opacity-90 shadow-xl rounded-lg scale-[1.02]"
      )}
    >
      {/* Sidebar actions */}
      <div className={cn("absolute -left-11 top-1 flex flex-col items-center gap-0.5 transition-all duration-200 bg-background/90 backdrop-blur-sm border border-border/60 rounded-xl p-1.5 shadow-sm", isLayoutOpen ? "opacity-100" : "opacity-0 group-hover/desc:opacity-100")}>
        <SidebarButton
          icon={GripVertical}
          label="Drag to reorder"
          className="cursor-grab active:cursor-grabbing"
        />

        {/* Change layout popover */}
        <Popover open={isLayoutOpen} onOpenChange={setIsLayoutOpen}>
          <PopoverTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="left" align="start" className="w-48 p-0">
            <div className="px-3 pt-3 pb-1.5">
              <p className="text-xs font-medium text-muted-foreground">Change layout</p>
            </div>
            <div className="px-1.5 pb-1.5">
              {layoutOptions.map((opt) => {
                const Icon = opt.icon;
                const isActive = layout === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLayoutChange(opt.id);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground/80 hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        <SidebarButton icon={Copy} label="Duplicate" onClick={onDuplicate} />
        <SidebarButton
          icon={Trash2}
          label="Clear"
          onClick={onClear}
          className="hover:text-destructive"
        />
      </div>

      {/* Drag handle overlay */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-11 top-1 w-10 h-8 cursor-grab active:cursor-grabbing z-10 opacity-0 group-hover/desc:opacity-100"
        aria-label="Drag to reorder"
      />

      {/* Content area */}
      <div className="w-full">
        {isEditing ? (
          renderEditor()
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full text-left px-4 py-3 rounded-lg border border-transparent hover:border-foreground/20 hover:bg-background/30 transition-all duration-200 cursor-text overflow-hidden max-w-full"
          >
            {renderPreview()}
          </button>
        )}
      </div>
    </div>
  );
}
