import { useRef, useState, useEffect } from "react";
import { GripVertical, Copy, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DescriptionEditor } from "./DescriptionEditor";
import { cn } from "@/lib/utils";

interface DescriptionBlockProps {
  id: string;
  content: string;
  onChange: (content: string) => void;
  onClear: () => void;
  onDuplicate: () => void;
}

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
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full text-left px-4 py-3 rounded-lg border border-transparent hover:border-foreground/20 hover:bg-background/30 transition-all duration-200 cursor-text overflow-hidden max-w-full"
          >
            {hasContent ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-foreground/80 break-words [overflow-wrap:anywhere]"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <span className="text-lg text-foreground/40 italic">
                Tell your learners what the course will be about...
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
