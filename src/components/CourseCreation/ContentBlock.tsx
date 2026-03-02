import { useRef, useEffect, useState } from "react";
import { GripVertical, Copy, Trash2, Sparkles, GitBranch, Send, X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { DescriptionEditor } from "./DescriptionEditor";
import { ImageBlock } from "./ImageBlock";
import { cn } from "@/lib/utils";

interface ContentBlockProps {
  id: string;
  type: "text" | "image";
  content: string;
  onChange: (content: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  autoFocus?: boolean;
  aiEnabled?: boolean;
}

export function ContentBlock({
  id,
  type,
  content,
  onChange,
  onDelete,
  onDuplicate,
  autoFocus = false,
  aiEnabled = false,
}: ContentBlockProps) {
  const [isEditing, setIsEditing] = useState(autoFocus);
  const [showPrompt, setShowPrompt] = useState(false);
  const [prompt, setPrompt] = useState("");
  const blockRef = useRef<HTMLDivElement>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);

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

  // Auto-focus prompt input
  useEffect(() => {
    if (showPrompt && promptInputRef.current) {
      promptInputRef.current.focus();
    }
  }, [showPrompt]);

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

  const handleGenerateSubmit = () => {
    if (!prompt.trim()) return;
    // TODO: Wire up AI generation API
    console.log("Generate content with prompt:", prompt);
    setPrompt("");
    setShowPrompt(false);
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        (blockRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      style={style}
      className={cn(
        "group/block relative animate-fade-in transition-shadow duration-200",
        isDragging && "z-50 opacity-90 shadow-xl rounded-lg scale-[1.02]"
      )}
    >
      {/* Left sidebar icons */}
      <div className="absolute -left-11 top-1 flex flex-col items-center gap-0.5 opacity-0 group-hover/block:opacity-100 transition-all duration-200 bg-background/90 backdrop-blur-sm border border-border/60 rounded-xl p-1.5 shadow-sm">
        <SidebarButton
          icon={GripVertical}
          label="Drag to reorder"
          className="cursor-grab active:cursor-grabbing"
          onClick={undefined}
        />
        <SidebarButton icon={Copy} label="Duplicate" onClick={onDuplicate} />
        <SidebarButton
          icon={Trash2}
          label="Delete"
          onClick={onDelete}
          className="hover:text-destructive"
        />
      </div>
      {/* Drag handle overlay */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-11 top-1 w-10 h-8 cursor-grab active:cursor-grabbing z-10 opacity-0 group-hover/block:opacity-100"
        aria-label="Drag to reorder"
      />

      {/* Content area - full width */}
      <div className="w-full">
        {type === "image" ? (
          <ImageBlock imageUrl={content} onChange={onChange} />
        ) : isEditing ? (
          <DescriptionEditor content={content} onChange={onChange} />
        ) : (
          <div>
            <button
              onClick={() => setIsEditing(true)}
              className="w-full text-left px-4 py-3 rounded-lg border border-transparent hover:border-foreground/20 hover:bg-background/30 transition-all duration-200 cursor-text"
            >
              {hasContent ? (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-foreground/80 [&_h2]:!text-[1.75rem] [&_h2]:!font-semibold [&_h2]:!leading-tight"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : (
                <span className="text-lg text-foreground/40 italic">
                  Click to edit text...
                </span>
              )}
            </button>

            {/* AI buttons - only for text blocks when AI is enabled */}
            {aiEnabled && type === "text" && (
              <div className="flex items-center gap-2 mt-2 px-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPrompt(!showPrompt);
                  }}
                  className="gap-1.5 text-xs h-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all duration-200"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate content
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs h-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all duration-200"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  Versions
                </Button>
              </div>
            )}

            {/* AI Prompt input */}
            {showPrompt && (
              <div className="mt-2 px-4 animate-fade-in">
                <div className="relative rounded-xl border border-border/60 bg-muted/20 backdrop-blur-sm shadow-sm overflow-hidden">
                  <textarea
                    ref={promptInputRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleGenerateSubmit();
                      }
                      if (e.key === "Escape") {
                        setShowPrompt(false);
                        setPrompt("");
                      }
                    }}
                    placeholder="Describe how you'd like the content to be generated..."
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 resize-none p-3.5 pr-20 focus:outline-none min-h-[80px]"
                    rows={3}
                  />
                  <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setShowPrompt(false);
                        setPrompt("");
                      }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleGenerateSubmit}
                      disabled={!prompt.trim()}
                      className={cn(
                        "p-2 rounded-lg transition-all duration-200",
                        prompt.trim()
                          ? "bg-primary text-primary-foreground shadow-sm hover:opacity-90"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                      )}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground/60 mt-1.5 px-1">
                  Press Enter to generate · Shift+Enter for new line · Esc to cancel
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
