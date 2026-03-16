import { useRef, useState, useEffect } from "react";
import { GripVertical, Copy, Trash2, LayoutGrid, Type, Columns2, Columns3, Quote } from "lucide-react";
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

const textTemplates = [
  {
    id: "heading-text",
    label: "Heading and text",
    html: "<h2>Heading</h2><p>Start writing your content here...</p>",
    preview: (
      <div className="space-y-2">
        <div className="h-2.5 w-16 rounded bg-foreground/20" />
        <div className="space-y-1.5">
          <div className="h-1.5 w-full rounded bg-muted-foreground/15" />
          <div className="h-1.5 w-4/5 rounded bg-muted-foreground/15" />
        </div>
      </div>
    ),
  },
  {
    id: "text-only",
    label: "Text",
    html: "<p>Start writing your content here...</p>",
    preview: (
      <div className="space-y-1.5">
        <div className="h-1.5 w-full rounded bg-muted-foreground/15" />
        <div className="h-1.5 w-5/6 rounded bg-muted-foreground/15" />
        <div className="h-1.5 w-3/4 rounded bg-muted-foreground/15" />
      </div>
    ),
  },
  {
    id: "two-columns",
    label: "Two columns",
    html: "<h2>Heading</h2><p>Left column content...</p><h2>Heading</h2><p>Right column content...</p>",
    preview: (
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <div className="h-2 w-12 rounded bg-foreground/20" />
          <div className="h-1.5 w-full rounded bg-muted-foreground/15" />
          <div className="h-1.5 w-3/4 rounded bg-muted-foreground/15" />
        </div>
        <div className="space-y-1.5">
          <div className="h-2 w-12 rounded bg-foreground/20" />
          <div className="h-1.5 w-full rounded bg-muted-foreground/15" />
          <div className="h-1.5 w-3/4 rounded bg-muted-foreground/15" />
        </div>
      </div>
    ),
  },
];

export function DescriptionBlock({
  id,
  content,
  onChange,
  onClear,
  onDuplicate,
}: DescriptionBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
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

  // Click outside to collapse
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

  const hasContent = content && content !== "<p></p>" && content.replace(/<[^>]*>/g, "").trim() !== "";

  const handleTemplateSelect = (template: typeof textTemplates[0]) => {
    onChange(template.html);
    setIsEditing(true);
  };

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
      <div className="absolute -left-11 top-1 flex flex-col items-center gap-0.5 opacity-0 group-hover/desc:opacity-100 transition-all duration-200 bg-background/90 backdrop-blur-sm border border-border/60 rounded-xl p-1.5 shadow-sm">
        <SidebarButton
          icon={GripVertical}
          label="Drag to reorder"
          className="cursor-grab active:cursor-grabbing"
        />
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
          <DescriptionEditor
            content={content}
            onChange={onChange}
          />
        ) : hasContent ? (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full text-left px-4 py-3 rounded-lg border border-transparent hover:border-foreground/20 hover:bg-background/30 transition-all duration-200 cursor-text overflow-hidden max-w-full"
          >
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-foreground/80 break-words [overflow-wrap:anywhere]"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </button>
        ) : (
          /* Template picker when empty */
          <div className="px-4 py-5">
            <p className="text-xs font-medium text-muted-foreground mb-3">Choose a layout</p>
            <div className="grid grid-cols-3 gap-3">
              {textTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => handleTemplateSelect(tpl)}
                  className="flex flex-col items-center gap-2 group/tpl"
                >
                  <div className="w-full rounded-xl border border-border/60 bg-card p-4 min-h-[72px] flex flex-col justify-center transition-all duration-200 hover:border-primary/30 hover:shadow-md">
                    {tpl.preview}
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground group-hover/tpl:text-foreground transition-colors">
                    {tpl.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
