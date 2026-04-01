import { useRef, useEffect, useState } from "react";
import { GripVertical, Copy, Trash2, Sparkles, GitBranch, Send, X, Video, Mic, FileText, Type, PenLine, ImageIcon, Clock, RotateCcw, History } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sanitizeHtml } from "@/lib/sanitize";

const COL_SEPARATOR = "<!--col-break-->";

function detectColumnLayout(content: string): { colCount: number; layoutType: string } {
  if (content.startsWith("<!--layout:")) {
    const match = content.match(/<!--layout:(\w[\w-]*)-->/);
    if (match) {
      if (match[1] === "three-columns") return { colCount: 3, layoutType: match[1] };
      if (match[1] === "two-columns") return { colCount: 2, layoutType: match[1] };
    }
  }
  return { colCount: 1, layoutType: "single" };
}

function decodeContentColumns(content: string, colCount: number): string[] {
  if (colCount <= 1) return [content];
  const raw = content.replace(/<!--layout:\w[\w-]*-->/, "");
  const parts = raw.split(COL_SEPARATOR);
  while (parts.length < colCount) parts.push("<p></p>");
  return parts.slice(0, colCount);
}

function encodeContentColumns(layoutType: string, columns: string[]): string {
  if (layoutType === "single") return columns[0] || "";
  return `<!--layout:${layoutType}-->${columns.join(COL_SEPARATOR)}`;
}

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
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [versionDialogCol, setVersionDialogCol] = useState<number | null>(null);

  const { colCount, layoutType } = detectColumnLayout(content);
  const contentColumns = decodeContentColumns(content, colCount);

  const handleColumnChange = (colIndex: number, newContent: string) => {
    const updated = [...contentColumns];
    updated[colIndex] = newContent;
    onChange(encodeContentColumns(layoutType, updated));
  };

  const getMockVersionsForColumn = (colIndex: number) => [
    {
      id: 1,
      content: contentColumns[colIndex] || "<p>Current version content</p>",
      editedBy: "You",
      editedAt: new Date(),
    },
    {
      id: 2,
      content: `<h2>Previous Draft</h2><p>An earlier version of column ${colIndex + 1} with different content.</p>`,
      editedBy: "AI Assistant",
      editedAt: new Date(Date.now() - 86400000),
    },
    {
      id: 3,
      content: `<p>Initial draft of column ${colIndex + 1} created during course setup.</p>`,
      editedBy: "You",
      editedAt: new Date(Date.now() - 3 * 86400000),
    },
  ];
  const mockTextVersions = [
    {
      id: 1,
      content: content || "<p>Current version content</p>",
      editedBy: "You",
      editedAt: new Date(),
    },
    {
      id: 2,
      content: "<h2>Previous Draft</h2><p>An earlier version of this text block with different content and structure.</p>",
      editedBy: "AI Assistant",
      editedAt: new Date(Date.now() - 86400000),
    },
    {
      id: 3,
      content: "<p>Initial draft of the content block created during course setup.</p>",
      editedBy: "You",
      editedAt: new Date(Date.now() - 3 * 86400000),
    },
  ];
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
    console.log("Generate content with prompt:", prompt);
    setPrompt("");
    setShowGenerateDialog(false);
    if (type === "image") {
      setImageGenerating(true);
    }
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
              <SidebarButton
                icon={GitBranch}
                label="Versions"
                onClick={() => setShowVersionsDialog(true)}
              />
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
            <ImageBlock imageUrl={content} onChange={onChange} aiEnabled={aiEnabled} externalGenerating={imageGenerating} onExternalGeneratingDone={() => setImageGenerating(false)} />
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
            <div className="w-full">
              <DescriptionEditor content={content} onChange={onChange} />
              {aiEnabled && (
                <div className="flex items-center gap-2 mt-2 px-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full px-4 gap-1.5 h-8 text-xs bg-primary/5 text-primary hover:bg-primary/10 border border-primary/15"
                    onClick={() => setShowGenerateDialog(true)}
                  >
                    <Sparkles className="w-3 h-3" style={{ stroke: 'url(#ai-gradient-edit)' }} />
                    <svg width="0" height="0" className="absolute">
                      <defs>
                        <linearGradient id="ai-gradient-edit" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="hsl(211, 100%, 50%)" />
                          <stop offset="100%" stopColor="hsl(270, 80%, 55%)" />
                        </linearGradient>
                      </defs>
                    </svg>
                    Ask AI Text
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full px-4 gap-1.5 h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/60"
                    onClick={() => setShowVersionsDialog(true)}
                  >
                    <GitBranch className="w-3 h-3" />
                    Version History
                  </Button>
                </div>
              )}
            </div>
          ) : !hasContent ? (
            <div className="w-full rounded-lg border-2 border-dashed border-foreground/20 bg-background/80 py-8 px-6 flex flex-col items-center justify-center gap-3 transition-all duration-200 hover:border-primary/50">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Type className="w-6 h-6 text-primary/70" />
              </div>
              <p className="text-sm text-muted-foreground">Click to add text content...</p>
              <div className="flex items-center gap-2.5">
                <Button
                  size="sm"
                  variant="default"
                  className="rounded-full px-5 gap-1.5 h-9"
                  onClick={() => {
                    const dummyContent = `<h2 style="font-size: 1.75rem; font-weight: 600;">Your heading text goes here</h2><br/><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>`;
                    onChange(dummyContent);
                    setIsEditing(true);
                  }}
                >
                  <PenLine className="w-3.5 h-3.5" />
                  Enter Text
                </Button>
                {aiEnabled && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-full px-5 gap-1.5 h-9 bg-primary/10 text-primary hover:bg-primary/20 border-0"
                    onClick={() => setShowGenerateDialog(true)}
                  >
                    <Sparkles className="w-3.5 h-3.5" style={{ stroke: 'url(#ai-gradient-btn)' }} />
                    <svg width="0" height="0" className="absolute">
                      <defs>
                        <linearGradient id="ai-gradient-btn" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="hsl(211, 100%, 50%)" />
                          <stop offset="100%" stopColor="hsl(270, 80%, 55%)" />
                        </linearGradient>
                      </defs>
                    </svg>
                    Ask AI
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full text-left px-4 py-3 rounded-lg border border-transparent hover:border-foreground/20 hover:bg-background/30 transition-all duration-200 cursor-text overflow-hidden max-w-full"
            >
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-foreground/80 break-words [overflow-wrap:anywhere] [&_h2]:!text-[1.75rem] [&_h2]:!font-semibold [&_h2]:!leading-tight [&_div[style*='grid']]:!grid [&_div[style*='grid']]:!max-w-none [&_div[style*='grid']>div]:!max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
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
      <Dialog open={showVersionsDialog} onOpenChange={(open) => {
        setShowVersionsDialog(open);
        if (!open) setSelectedVersionId(null);
      }}>
        <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[85vw] lg:max-w-4xl h-[85vh] sm:h-[80vh] p-0 flex flex-col overflow-hidden">
          <DialogHeader className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b flex-shrink-0">
            <DialogTitle className="text-sm sm:text-base md:text-lg font-bold flex items-center gap-2">
              <History className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
              Version History
            </DialogTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              View and restore previous versions
            </p>
          </DialogHeader>

          <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-2 sm:py-3 border-b bg-muted/30 flex-shrink-0">
            <div className="flex items-center gap-2">
              <GitBranch className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
              <span className="text-xs sm:text-sm font-medium">All Versions</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {mockTextVersions.length} version{mockTextVersions.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-3 px-3 sm:px-4 md:px-6 py-3 sm:py-4">
              {mockTextVersions.map((version, index) => {
                const isCurrentVersion = index === 0;
                return (
                  <div
                    key={version.id}
                    className={cn(
                      "border rounded-lg p-3 sm:p-4 transition-all hover:border-primary/50 bg-card shadow-sm relative",
                      isCurrentVersion && "border-primary/40 bg-primary/[0.03] ring-1 ring-primary/15",
                      selectedVersionId === version.id && "border-primary bg-primary/5"
                    )}
                    onClick={() => setSelectedVersionId(version.id)}
                  >
                    {isCurrentVersion && (
                      <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-primary" />
                    )}
                    <div className="space-y-2.5">
                      {/* Version Header */}
                      <div className="flex items-start justify-between gap-2 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-sm">
                              Version {mockTextVersions.length - index}
                            </h4>
                            {isCurrentVersion && (
                              <Badge variant="secondary" className="text-[11px] px-2.5 py-0.5 h-5 font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full">Current</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span>{version.editedAt.toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric'
                            })} at {version.editedAt.toLocaleTimeString('en-US', {
                              hour: '2-digit', minute: '2-digit'
                            })}</span>
                            <span className="text-muted-foreground/60">·</span>
                            <span>{version.editedBy}</span>
                          </div>
                        </div>
                        {!isCurrentVersion && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onChange(version.content);
                              setShowVersionsDialog(false);
                              setSelectedVersionId(null);
                            }}
                            className="flex-shrink-0 h-7 sm:h-8 text-xs px-2 sm:px-3 rounded-full"
                          >
                            <RotateCcw className="w-3 h-3 mr-1.5" />
                            Restore Version
                          </Button>
                        )}
                      </div>

                      {/* Content Preview */}
                      <div className="bg-muted/50 rounded-lg p-3 border overflow-hidden">
                        <div
                          className="prose prose-sm dark:prose-invert max-w-none line-clamp-4 break-words"
                          style={{ overflowWrap: 'anywhere' }}
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(version.content) }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
