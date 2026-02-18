import { useRef, useEffect, useState } from "react";
import { GripVertical, LayoutGrid, Copy, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DescriptionEditor } from "./DescriptionEditor";
import { cn } from "@/lib/utils";

interface ContentBlockProps {
  id: string;
  type: "text" | "image";
  content: string;
  onChange: (content: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  autoFocus?: boolean;
}

export function ContentBlock({
  id,
  type,
  content,
  onChange,
  onDelete,
  onDuplicate,
  autoFocus = false,
}: ContentBlockProps) {
  const [isEditing, setIsEditing] = useState(autoFocus);
  const blockRef = useRef<HTMLDivElement>(null);

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
    className,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    onClick?: () => void;
    className?: string;
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
            className
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
    <div ref={blockRef} className="group/block relative flex gap-2 animate-fade-in">
      {/* Left sidebar icons */}
      <div className="flex flex-col items-center gap-1 pt-2 opacity-0 group-hover/block:opacity-100 transition-opacity duration-200">
        <SidebarButton
          icon={GripVertical}
          label="Drag to reorder"
          className="cursor-grab active:cursor-grabbing"
        />
        <SidebarButton icon={LayoutGrid} label="Layout" />
        <SidebarButton icon={Copy} label="Duplicate" onClick={onDuplicate} />
        <SidebarButton
          icon={Trash2}
          label="Delete"
          onClick={onDelete}
          className="hover:text-destructive"
        />
      </div>

      {/* Content area */}
      <div className="flex-1 min-w-0 w-full">
        {isEditing ? (
          <DescriptionEditor content={content} onChange={onChange} />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full text-left px-4 py-3 rounded-lg border border-transparent hover:border-foreground/20 hover:bg-background/30 transition-all duration-200 cursor-text"
          >
            {hasContent ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-foreground/80"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <span className="text-lg text-foreground/40 italic">
                Click to edit text...
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
