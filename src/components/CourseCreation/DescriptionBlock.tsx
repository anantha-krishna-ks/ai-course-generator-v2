import { useRef, useState, useEffect } from "react";
import { GripVertical, Copy, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  const [isActive, setIsActive] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  // Auto-resize textarea on activation
  useEffect(() => {
    if (isActive && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
      textareaRef.current.focus();
    }
  }, [isActive]);

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
        "group/desc relative animate-fade-in transition-shadow duration-200 min-w-0 overflow-hidden",
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
      <div
        className={cn(
          "rounded-lg border px-5 pt-4 transition-colors cursor-text overflow-hidden",
          isActive
            ? "border-foreground/20 bg-primary/[0.04]"
            : "border-transparent pb-4"
        )}
        onClick={() => {
          if (!isActive) setIsActive(true);
        }}
      >
        {content.trim() && !isActive ? (
          <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word]">
            {content}
          </p>
        ) : isActive ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              onChange(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            onBlur={() => setIsActive(false)}
            placeholder="Tell your learners what the course will be about..."
            className="w-full bg-transparent text-base text-foreground leading-relaxed resize-none outline-none placeholder:text-muted-foreground/60 min-h-[28px] break-words overflow-hidden"
            rows={1}
          />
        ) : (
          <p className="text-base text-muted-foreground/60 select-none">
            <span className="mr-1.5">+</span>
            Tell your learners what the course will be about...
          </p>
        )}
      </div>
    </div>
  );
}
