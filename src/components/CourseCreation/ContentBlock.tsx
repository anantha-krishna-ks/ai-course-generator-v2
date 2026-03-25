import { useRef, useEffect, useState } from "react";
import { GripVertical, Copy, Trash2, Sparkles, GitBranch, Send, X, Video, Mic, FileText } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DescriptionEditor } from "./DescriptionEditor";
import { ImageBlock } from "./ImageBlock";
import { MediaUploadBlock } from "./MediaUploadBlock";
import { QuizBlock } from "./QuizBlock";
import { ImageDescriptionBlock } from "./ImageDescriptionBlock";
import { VideoDescriptionBlock } from "./VideoDescriptionBlock";
import { cn } from "@/lib/utils";

interface ContentBlockProps {
  id: string;
  type: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description" | "video-description";
  content: string;
  onChange: (content: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  autoFocus?: boolean;
  aiEnabled?: boolean;
  readOnly?: boolean;
  variant?: string;
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
  readOnly = false,
  variant,
}: ContentBlockProps) {
  const [isEditing, setIsEditing] = useState(autoFocus && !readOnly);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showVersionsDialog, setShowVersionsDialog] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [imageGenerating, setImageGenerating] = useState(false);
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
    if (showGenerateDialog && promptInputRef.current) {
      setTimeout(() => promptInputRef.current?.focus(), 100);
    }
  }, [showGenerateDialog]);

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
    setShowGenerateDialog(false);
  };

  return (
    <>
      <div
        ref={(node) => {
          setNodeRef(node);
          (blockRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        style={style}
        className={cn(
          "group/block relative animate-fade-in transition-shadow duration-200 min-w-0",
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
          {aiEnabled && (type === "text" || type === "image") && (
            <>
              <div className="w-5 h-px bg-border/60 my-0.5" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowGenerateDialog(true)}
                    className="p-1.5 rounded-md hover:bg-muted transition-colors"
                  >
                    <Sparkles className="w-4 h-4" style={{ stroke: 'url(#ai-gradient)' }} />
                    <svg width="0" height="0" className="absolute">
                      <defs>
                        <linearGradient id="ai-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="hsl(211, 100%, 50%)" />
                          <stop offset="100%" stopColor="hsl(270, 80%, 55%)" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" className="text-xs">
                  {type === "text" ? "Generate text with AI" : "Generate image with AI"}
                </TooltipContent>
              </Tooltip>
              {type === "text" && (
                <SidebarButton
                  icon={GitBranch}
                  label="Versions"
                  onClick={() => setShowVersionsDialog(true)}
                />
              )}
            </>
          )}
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
          {type === "video-description" ? (
            <VideoDescriptionBlock content={content} onChange={onChange} />
          ) : type === "image-description" ? (
            <ImageDescriptionBlock content={content} onChange={onChange} aiEnabled={aiEnabled} />
          ) : type === "quiz" ? (
            <QuizBlock content={content} onChange={onChange} aiEnabled={aiEnabled} variant={variant} />
          ) : type === "image" ? (
            <ImageBlock imageUrl={content} onChange={onChange} aiEnabled={aiEnabled} />
          ) : type === "video" || type === "audio" || type === "doc" ? (
            <MediaUploadBlock type={type} fileUrl={content} onChange={onChange} />
          ) : readOnly ? (
            <div className="w-full px-4 py-3">
              {hasContent ? (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-foreground/80 break-words [overflow-wrap:anywhere] [&_h2]:!text-[1.75rem] [&_h2]:!font-semibold [&_h2]:!leading-tight"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : (
                <span className="text-lg text-foreground/40 italic">No content</span>
              )}
            </div>
          ) : isEditing ? (
            <DescriptionEditor content={content} onChange={onChange} />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full text-left px-4 py-3 rounded-lg border border-transparent hover:border-foreground/20 hover:bg-background/30 transition-all duration-200 cursor-text overflow-hidden max-w-full max-w-full"
            >
              {hasContent ? (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-foreground/80 break-words [overflow-wrap:anywhere] [&_h2]:!text-[1.75rem] [&_h2]:!font-semibold [&_h2]:!leading-tight [&_div[style*='grid']]:!grid [&_div[style*='grid']]:!max-w-none [&_div[style*='grid']>div]:!max-w-none"
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

      {/* Generate Content Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="sm:max-w-[520px] gap-0 p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="flex items-center gap-2.5 text-base font-semibold">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              {type === "image" ? "Generate image with AI" : "Generate text with AI"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1.5">
              {type === "image"
                ? "Describe the image you'd like to generate for this block."
                : "Describe what text content you'd like to generate for this block."}
            </p>
          </DialogHeader>

          <div className="px-6 pb-2">
            <div className="rounded-xl border border-border/60 bg-muted/10 overflow-hidden focus-within:border-foreground/20 transition-colors">
              <textarea
                ref={promptInputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerateSubmit();
                  }
                }}
                placeholder={type === "image"
                  ? "e.g., A modern illustration of cloud computing architecture..."
                  : "e.g., Write an introduction about the importance of cybersecurity in modern businesses..."
                }
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 resize-none p-4 focus:outline-none min-h-[120px]"
                rows={4}
              />
            </div>
            <p className="text-[11px] text-muted-foreground/50 mt-2 px-1">
              Press Enter to generate · Shift+Enter for new line
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/60 bg-muted/20">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowGenerateDialog(false);
                setPrompt("");
              }}
              className="rounded-full px-4"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleGenerateSubmit}
              disabled={!prompt.trim()}
              className="rounded-full px-4 gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Generate
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Versions Dialog */}
      <Dialog open={showVersionsDialog} onOpenChange={setShowVersionsDialog}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-base font-semibold">
              <div className="p-1.5 rounded-lg bg-muted">
                <GitBranch className="w-4 h-4 text-muted-foreground" />
              </div>
              Content versions
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1.5">
              View and manage different versions of this content block.
            </p>
          </DialogHeader>

          <div className="py-8 text-center">
            <GitBranch className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No versions yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Generate content with AI to create your first version.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
