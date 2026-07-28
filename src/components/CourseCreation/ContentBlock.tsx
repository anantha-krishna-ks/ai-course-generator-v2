import { useRef, useEffect, useState } from "react";
import { GripVertical, Copy, Trash2, GitBranch, Send, X, Video, Mic, FileText, Type, PenLine, ImageIcon, Clock, RotateCcw, History, LayoutGrid, Heading, Columns2, Columns3, Image as ImageLucide, ImageUp, ImageDown, PanelLeft, PanelRight, Check } from "lucide-react";
import imgStylePhoto from "@/assets/image-style-photorealistic.jpg";
import imgStyleIllustration from "@/assets/image-style-illustration.jpg";
import imgStyleFlat from "@/assets/image-style-flat.jpg";
import imgStyle3d from "@/assets/image-style-3d.jpg";
import imgStyleSketch from "@/assets/image-style-sketch.jpg";
import imgStyleWatercolor from "@/assets/image-style-watercolor.jpg";

const IMAGE_STYLE_OPTIONS = [
  { value: "photorealistic", label: "Photorealistic", preview: imgStylePhoto },
  { value: "illustration", label: "Illustration", preview: imgStyleIllustration },
  { value: "flat", label: "Flat / Minimal", preview: imgStyleFlat },
  { value: "3d", label: "3D Render", preview: imgStyle3d },
  { value: "sketch", label: "Sketch", preview: imgStyleSketch },
  { value: "watercolor", label: "Watercolor", preview: imgStyleWatercolor },
] as const;
import { getFontStack } from "./FontSelectorDropdown";
import { AISparkles } from "@/components/ui/ai-sparkles";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DescriptionEditor } from "./DescriptionEditor";
import { RewriteTextPanel } from "./RewriteTextPanel";
import { ImageBlock } from "./ImageBlock";
import { AIBlockLoader } from "./AIBlockLoader";
import { MediaUploadBlock } from "./MediaUploadBlock";
import { AIAudioBlock } from "./AIAudioBlock";
import { QuizBlock } from "./QuizBlock";
import { ImageDescriptionBlock } from "./ImageDescriptionBlock";
import { VideoDescriptionBlock } from "./VideoDescriptionBlock";
import { HotspotBlock } from "./HotspotBlock";
import { TabsBlock } from "./TabsBlock";
import { AccordionBlock } from "./AccordionBlock";
import { FlashcardsBlock } from "./FlashcardsBlock";
import { CardSortBlock } from "./CardSortBlock";
import { LayoutUtilityBlock, isLayoutUtilityVariant } from "./LayoutUtilityBlock";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sanitizeHtml } from "@/lib/sanitize";
import { AIFeedbackBar } from "./AIFeedbackBar";

const COL_SEPARATOR = "<!--col-break-->";

type ContentLayoutType = "heading-text" | "text-only" | "two-columns" | "three-columns";

const contentLayoutOptions: { id: ContentLayoutType; label: string; icon: React.ComponentType<{ className?: string }>; columns: number }[] = [
  { id: "heading-text", label: "Heading and text", icon: Heading, columns: 1 },
  { id: "text-only", label: "Text", icon: Type, columns: 1 },
  { id: "two-columns", label: "Two columns", icon: Columns2, columns: 2 },
  { id: "three-columns", label: "Three columns", icon: Columns3, columns: 3 },
];

const contentLayoutDefaults: Record<ContentLayoutType, string[]> = {
  "heading-text": ["<h2>Heading</h2><p>Start writing your content here...</p>"],
  "text-only": ["<p>Start writing your content here...</p>"],
  "two-columns": ["<h2>Heading</h2><p>Start writing here...</p>", "<h2>Heading</h2><p>Start writing here...</p>"],
  "three-columns": ["<h2>Column 1</h2><p>Start writing here...</p>", "<h2>Column 2</h2><p>Start writing here...</p>", "<h2>Column 3</h2><p>Start writing here...</p>"],
};

// Image layout options: switches between standalone image block and image+description variants
type ImageLayoutId = "image-only" | "image-top" | "image-bottom" | "image-left" | "image-right";
const imageLayoutOptions: { id: ImageLayoutId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "image-only", label: "Single image", icon: ImageLucide },
  { id: "image-top", label: "Image on top", icon: ImageUp },
  { id: "image-bottom", label: "Image on bottom", icon: ImageDown },
  { id: "image-left", label: "Image on left", icon: PanelLeft },
  { id: "image-right", label: "Image on right", icon: PanelRight },
];

// Video layout options
type VideoLayoutId = "video-only" | "video-left" | "video-right";
const videoLayoutOptions: { id: VideoLayoutId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "video-only", label: "Video", icon: Video },
  { id: "video-left", label: "Video on left", icon: PanelLeft },
  { id: "video-right", label: "Video on right", icon: PanelRight },
];

function detectImageLayout(type: string, content: string, variant?: string): ImageLayoutId {
  if (type === "image") return "image-only";
  if (type === "image-description") {
    try {
      const parsed = JSON.parse(content);
      if (parsed.layout === "image-top" || parsed.layout === "image-bottom" || parsed.layout === "image-left" || parsed.layout === "image-right") {
        return parsed.layout;
      }
    } catch { /* noop */ }
    if (variant === "image-top" || variant === "image-bottom" || variant === "image-left" || variant === "image-right") return variant;
    return "image-top";
  }
  return "image-only";
}

function detectVideoLayout(type: string, content: string, variant?: string): VideoLayoutId {
  if (type === "video") return "video-only";
  if (type === "video-description") {
    try {
      const parsed = JSON.parse(content);
      if (parsed.layout === "video-left" || parsed.layout === "video-right") return parsed.layout;
    } catch { /* noop */ }
    if (variant === "video-left" || variant === "video-right") return variant;
    return "video-left";
  }
  return "video-only";
}

// Extract existing media URL when switching layouts so user doesn't lose their upload
function extractImageUrl(type: string, content: string): string {
  if (type === "image") return content || "";
  if (type === "image-description") {
    try { return JSON.parse(content).imageUrl || ""; } catch { return ""; }
  }
  return "";
}

function extractVideoUrl(type: string, content: string): string {
  if (type === "video") return content || "";
  if (type === "video-description") {
    try { return JSON.parse(content).videoUrl || ""; } catch { return ""; }
  }
  return "";
}

function extractDescription(content: string, fallback: string): string {
  try {
    const parsed = JSON.parse(content);
    return parsed.description || fallback;
  } catch { return fallback; }
}

function detectContentLayout(content: string): ContentLayoutType {
  if (content.startsWith("<!--layout:")) {
    const match = content.match(/<!--layout:(\w[\w-]*)-->/);
    if (match) return match[1] as ContentLayoutType;
  }
  return "text-only";
}

function decodeContentColumns(content: string, layout: ContentLayoutType): string[] {
  const colCount = contentLayoutOptions.find((o) => o.id === layout)?.columns ?? 1;
  if (layout === "text-only") return [content.replace(/<!--layout:\w[\w-]*-->/, "")];
  const raw = content.replace(/<!--layout:\w[\w-]*-->/, "");
  const parts = raw.split(COL_SEPARATOR);
  while (parts.length < colCount) parts.push("<p></p>");
  return parts.slice(0, colCount);
}

function encodeContentColumns(layout: ContentLayoutType, columns: string[]): string {
  if (layout === "text-only") return columns[0] || "";
  return `<!--layout:${layout}-->${columns.join(COL_SEPARATOR)}`;
}

interface ContentBlockProps {
  id: string;
  type: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description" | "video-description" | "hotspot" | "tabs" | "flashcards";
  content: string;
  onChange: (content: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  autoFocus?: boolean;
  aiEnabled?: boolean;
  readOnly?: boolean;
  variant?: string;
  onTypeChange?: (newType: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description" | "video-description" | "hotspot" | "tabs" | "flashcards", newContent: string, newVariant?: string) => void;
  /** Per-block font override id. When undefined, the block inherits the course-level font. */
  font?: string;
  /** Update the per-block font override. Pass undefined to revert to course default. */
  onFontChange?: (fontId: string | undefined) => void;
  /** Marks the block content as AI-generated — surfaces the "Was this generation helpful?" feedback bar. */
  aiGenerated?: boolean;
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
  onTypeChange,
  font,
  onFontChange,
  aiGenerated = false,
}: ContentBlockProps) {
  const [isEditing, setIsEditing] = useState(autoFocus && !readOnly);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showRewritePanel, setShowRewritePanel] = useState(false);
  const [rewriteColIndex, setRewriteColIndex] = useState<number | null>(null);
  const [showVersionsDialog, setShowVersionsDialog] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [imageStyle, setImageStyle] = useState<typeof IMAGE_STYLE_OPTIONS[number]["value"]>("photorealistic");
  const [imageGenerating, setImageGenerating] = useState(false);
  const [textGenerating, setTextGenerating] = useState(false);
  const [justGenerated, setJustGenerated] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [versionDialogCol, setVersionDialogCol] = useState<number | null>(null);
  const [isLayoutOpen, setIsLayoutOpen] = useState(false);
  
  const layout = detectContentLayout(content);

  const colCount = contentLayoutOptions.find((o) => o.id === layout)?.columns ?? 1;
  const contentColumns = decodeContentColumns(content, layout);

  const handleColumnChange = (colIndex: number, newContent: string) => {
    const updated = [...contentColumns];
    updated[colIndex] = newContent;
    onChange(encodeContentColumns(layout, updated));
  };

  const handleLayoutChange = (newLayout: ContentLayoutType) => {
    const newCols = contentLayoutDefaults[newLayout];
    onChange(encodeContentColumns(newLayout, newCols));
    setIsEditing(true);
  };

  const isImageBlock = type === "image" || type === "image-description";
  const isVideoBlock = type === "video" || type === "video-description";
  const currentImageLayout = isImageBlock ? detectImageLayout(type, content, variant) : null;
  const currentVideoLayout = isVideoBlock ? detectVideoLayout(type, content, variant) : null;

  const handleImageLayoutChange = (newLayout: ImageLayoutId) => {
    if (!onTypeChange) return;
    const url = extractImageUrl(type, content);
    if (newLayout === "image-only") {
      onTypeChange("image", url, undefined);
    } else {
      const desc = type === "image-description" ? extractDescription(content, "<p>Add a description here...</p>") : "<p>Add a description here...</p>";
      onTypeChange("image-description", JSON.stringify({ layout: newLayout, imageUrl: url, description: desc }), newLayout);
    }
    setIsLayoutOpen(false);
  };

  const handleVideoLayoutChange = (newLayout: VideoLayoutId) => {
    if (!onTypeChange) return;
    const url = extractVideoUrl(type, content);
    if (newLayout === "video-only") {
      onTypeChange("video", url, undefined);
    } else {
      const desc = type === "video-description" ? extractDescription(content, "") : "";
      onTypeChange("video-description", JSON.stringify({ layout: newLayout, videoUrl: url, description: desc }), newLayout);
    }
    setIsLayoutOpen(false);
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
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-rte-popover="true"]')) return;
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

  const hasContent = content && content !== "<p></p>" && content.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]*>/g, "").trim() !== "";

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
          aria-label={label}
        >
          <Icon className="w-4 h-4" aria-hidden="true" />
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
    } else if (type === "text") {
      setTextGenerating(true);
      setIsEditing(false);
      // Simulated generation — replace with real API call wiring.
      window.setTimeout(() => {
        setTextGenerating(false);
      }, 4200);
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
        <div data-block-toolbar="true" className={cn("absolute -left-11 top-1 flex flex-col items-center gap-0.5 transition-all duration-200 bg-background/90 backdrop-blur-sm border border-border/60 rounded-xl p-1.5 shadow-sm", isLayoutOpen ? "opacity-100" : "opacity-0 group-hover/block:opacity-100")}>
          <SidebarButton
            icon={GripVertical}
            label="Drag to reorder"
            className="cursor-grab active:cursor-grabbing"
            onClick={undefined}
          />
          {type === "text" && !isLayoutUtilityVariant(variant) && (
            <Popover open={isLayoutOpen} onOpenChange={setIsLayoutOpen}>
              <PopoverTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Change content layout"
                >
                  <LayoutGrid className="w-4 h-4" aria-hidden="true" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="left" align="start" className="w-48 p-0">
                <div className="px-3 pt-3 pb-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Change layout</p>
                </div>
                <div className="px-1.5 pb-1.5">
                  {contentLayoutOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isActive = layout === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLayoutChange(opt.id);
                          setIsLayoutOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-foreground hover:bg-muted hover:text-foreground"
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
          )}
          {/* Per-block font selector now lives in the rich-text editor toolbar (BlockFontChip) */}
          {(isImageBlock || isVideoBlock) && onTypeChange && (
            <Popover open={isLayoutOpen} onOpenChange={setIsLayoutOpen}>
              <PopoverTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label={isImageBlock ? "Change image layout" : "Change video layout"}
                >
                  <LayoutGrid className="w-4 h-4" aria-hidden="true" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="left" align="start" className="w-52 p-0">
                <div className="px-3 pt-3 pb-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Change layout</p>
                </div>
                <div className="px-1.5 pb-1.5">
                  {(isImageBlock ? imageLayoutOptions : videoLayoutOptions).map((opt) => {
                    const Icon = opt.icon;
                    const isActive = isImageBlock
                      ? currentImageLayout === opt.id
                      : currentVideoLayout === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isImageBlock) {
                            handleImageLayoutChange(opt.id as ImageLayoutId);
                          } else {
                            handleVideoLayoutChange(opt.id as VideoLayoutId);
                          }
                        }}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-foreground hover:bg-muted hover:text-foreground"
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
          )}
          <SidebarButton icon={Copy} label="Duplicate" onClick={onDuplicate} />
          <SidebarButton
            icon={Trash2}
            label="Delete"
            onClick={onDelete}
            className="hover:text-destructive"
          />
          {aiEnabled && (type === "text" || type === "image") && !isLayoutUtilityVariant(variant) && (
            <>
              <div className="w-5 h-px bg-border/60 my-0.5" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      if (type === "text") {
                        if (hasContent) {
                          setRewriteColIndex(null);
                          setShowRewritePanel(true);
                          setIsEditing(true);
                        } else {
                          setShowGenerateDialog(true);
                        }
                      } else {
                        setShowGenerateDialog(true);
                      }
                    }}
                    className="p-1.5 rounded-md hover:bg-muted transition-colors"
                    aria-label={type === "text" ? "Edit with AI: Rewrite text" : "Generate image with AI"}
                  >
                    <AISparkles className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" className="text-xs">
                  {type === "text" ? "Edit with AI · Rewrite text" : "Generate image with AI"}
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
          role="button"
          tabIndex={0}
          className="absolute -left-11 top-1 w-10 h-8 cursor-grab active:cursor-grabbing z-10 opacity-0 group-hover/block:opacity-100"
          aria-label="Drag to reorder content block"
        />
        {/* Content area - full width */}
        <div
          className="w-full"
          style={type === "text" && font ? { fontFamily: getFontStack(font) } : undefined}
        >
          {type === "text" && isLayoutUtilityVariant(variant) ? (
            <LayoutUtilityBlock variant={variant} content={content} onChange={onChange} readOnly={readOnly} />
          ) : type === "video-description" ? (
            <VideoDescriptionBlock content={content} onChange={onChange} />
          ) : type === "text" && variant === "accordion" ? (
            <AccordionBlock content={content} onChange={onChange} />
          ) : type === "text" && variant === "card-sort" ? (
            <CardSortBlock content={content} onChange={onChange} />

          ) : type === "tabs" ? (
            <TabsBlock content={content} onChange={onChange} aiEnabled={aiEnabled} variant={variant} />
          ) : type === "hotspot" ? (
            <HotspotBlock content={content} onChange={onChange} aiEnabled={aiEnabled} />
          ) : type === "flashcards" ? (
            <FlashcardsBlock content={content} onChange={onChange} />

          ) : type === "image-description" ? (
            <ImageDescriptionBlock content={content} onChange={onChange} aiEnabled={aiEnabled} />
          ) : type === "quiz" ? (
            <QuizBlock content={content} onChange={onChange} aiEnabled={aiEnabled} variant={variant} />
          ) : type === "image" ? (
            <ImageBlock imageUrl={content} onChange={onChange} aiEnabled={aiEnabled} externalGenerating={imageGenerating} onExternalGeneratingDone={() => setImageGenerating(false)} />
          ) : type === "audio" && variant === "ai-audio" ? (
            <AIAudioBlock content={content} onChange={onChange} />
          ) : type === "video" || type === "audio" || type === "doc" ? (
            <MediaUploadBlock type={type} fileUrl={content} onChange={onChange} blockId={id} />

          ) : textGenerating && type === "text" ? (
            <div className="w-full px-1">
              {colCount > 1 ? (
                <div className={cn("grid gap-4", colCount === 3 ? "grid-cols-3" : "grid-cols-2")}>
                  {Array.from({ length: colCount }).map((_, i) => (
                    <AIBlockLoader key={i} />
                  ))}
                </div>
              ) : (
                <AIBlockLoader />
              )}
            </div>
          ) : readOnly ? (
            <div className="w-full px-4 py-3">
              {hasContent ? (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-foreground break-words [overflow-wrap:anywhere] [&_h2]:!text-[1.75rem] [&_h2]:!font-semibold [&_h2]:!leading-tight"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : (
                <span className="text-lg text-muted-foreground italic">No content</span>
              )}
            </div>
          ) : isEditing ? (
            <div className="w-full">
              {colCount > 1 ? (
                <div className={cn("grid gap-4", colCount === 3 ? "grid-cols-3" : "grid-cols-2")}>
                  {contentColumns.map((col, i) => {
                    const colPlain = col.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]*>/g, "").trim();
                    const colHasContent = colPlain.length > 0;
                    return (
                      <div key={i} className="min-w-0">
                        <DescriptionEditor content={col} onChange={(val) => handleColumnChange(i, val)} />
                        <div className="flex items-center gap-2 mt-2 px-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="rounded-full px-4 gap-1.5 h-8 text-xs bg-primary/5 text-primary hover:bg-primary/10 border border-primary/15"
                            onClick={() => {
                              if (colHasContent) {
                                setRewriteColIndex(i);
                                setShowRewritePanel(true);
                              } else {
                                setShowGenerateDialog(true);
                              }
                            }}
                          >
                            <AISparkles className="w-3 h-3" />
                            {colHasContent ? "Rewrite with AI" : "Ask AI"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="rounded-full px-4 gap-1.5 h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/60"
                            onClick={() => {
                              setVersionDialogCol(i);
                              setSelectedVersionId(null);
                            }}
                          >
                            <GitBranch className="w-3 h-3" aria-hidden="true" focusable="false" />
                            Version History
                          </Button>
                        </div>
                        {showRewritePanel && rewriteColIndex === i && type === "text" && (
                          <RewriteTextPanel
                            content={col}
                            onReplace={(next) => {
                              handleColumnChange(i, next);
                              setShowRewritePanel(false);
                              setRewriteColIndex(null);
                            }}
                            onCancel={() => {
                              setShowRewritePanel(false);
                              setRewriteColIndex(null);
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <>
                  <DescriptionEditor
                    content={content}
                    onChange={onChange}
                    blockFont={font}
                    onBlockFontChange={type === "text" ? onFontChange : undefined}
                  />
                  {aiEnabled && (
                    <div className="flex items-center gap-2 mt-2 px-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full px-4 gap-1.5 h-8 text-xs bg-primary/5 text-primary hover:bg-primary/10 border border-primary/15"
                        onClick={() => {
                          if (type === "text" && hasContent) {
                            setRewriteColIndex(null);
                            setShowRewritePanel(true);
                          } else {
                            setShowGenerateDialog(true);
                          }
                        }}
                      >
                        <AISparkles className="w-3 h-3" />
                        {type === "text" && hasContent ? "Rewrite with AI" : "Ask AI"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full px-4 gap-1.5 h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/60"
                        onClick={() => setShowVersionsDialog(true)}
                      >
                        <GitBranch className="w-3 h-3" aria-hidden="true" focusable="false" />
                        Version History
                      </Button>
                    </div>
                  )}
                  {aiEnabled && showRewritePanel && rewriteColIndex === null && type === "text" && (
                    <RewriteTextPanel
                      content={content}
                      onReplace={(next) => {
                        onChange(next);
                        setShowRewritePanel(false);
                      }}
                      onCancel={() => setShowRewritePanel(false)}
                    />
                  )}
                </>
              )}
            </div>
          ) : !hasContent ? (
            <div className="w-full rounded-lg border-2 border-dashed border-foreground/20 bg-background/80 py-8 px-6 flex flex-col items-center justify-center gap-3 transition-all duration-200 hover:border-primary/50">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Type className="w-6 h-6 text-primary" aria-hidden="true" />
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
                  <PenLine className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                  Enter Text
                </Button>
                {aiEnabled && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-full px-5 gap-1.5 h-9 bg-primary/10 text-primary hover:bg-primary/20 border-0"
                    onClick={() => setShowGenerateDialog(true)}
                  >
                    <AISparkles className="w-3.5 h-3.5" />
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
              {colCount > 1 ? (
                <div className={cn("grid gap-6", colCount === 3 ? "grid-cols-3" : "grid-cols-2")}>
                  {contentColumns.map((col, i) => (
                    <div
                      key={i}
                      className="prose prose-sm dark:prose-invert max-w-none text-foreground break-words [overflow-wrap:anywhere] text-lg leading-relaxed [&_h2]:!text-[1.75rem] [&_h2]:!font-semibold [&_h2]:!leading-tight"
                      dangerouslySetInnerHTML={{ __html: col }}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-foreground break-words [overflow-wrap:anywhere] [&_h2]:!text-[1.75rem] [&_h2]:!font-semibold [&_h2]:!leading-tight [&_div[style*='grid']]:!grid [&_div[style*='grid']]:!max-w-none [&_div[style*='grid']>div]:!max-w-none"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Generate Content Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="w-[95vw] max-w-[720px] max-h-[90vh] overflow-y-auto gap-0 p-0 sm:rounded-lg">
          <DialogHeader className="px-4 sm:px-6 pt-5 sm:pt-6 pb-3 sm:pb-4">
            <DialogTitle className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-base font-semibold">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <AISparkles className="w-4 h-4" />
              </div>
              {type === "image" ? "Generate image with AI" : "Generate text with AI"}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-1.5">
              {type === "image"
                ? "Describe the image you'd like to generate for this block."
                : "Describe what text content you'd like to generate for this block."}
            </DialogDescription>
          </DialogHeader>

          <div className="px-4 sm:px-6 pb-2">
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
                aria-label={type === "image" ? "Image generation prompt" : "Text generation prompt"}
                autoComplete="off"
                placeholder={type === "image"
                  ? "e.g., A modern illustration of cloud computing architecture..."
                  : "e.g., Write an introduction about the importance of cybersecurity in modern businesses..."
                }
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none p-4 focus:outline-none min-h-[120px]"
                rows={4}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 px-1">
              Press Enter to generate · Shift+Enter for new line
            </p>

            {type === "image" && (
              <div className="mt-4">
                <div className="mb-2">
                  <div className="text-[13px] font-semibold text-foreground leading-tight">
                    Visual style
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Choose the look and feel for this image
                  </div>
                </div>
                <div
                  className="grid grid-cols-3 sm:grid-cols-3 gap-2"
                  role="radiogroup"
                  aria-label="Image visual style"
                >
                  {IMAGE_STYLE_OPTIONS.map((opt) => {
                    const selected = imageStyle === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        aria-label={`${opt.label} image style`}
                        onClick={() => setImageStyle(opt.value)}
                        className={cn(
                          "group relative flex flex-col overflow-hidden rounded-md border bg-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                          selected
                            ? "border-primary/60 ring-2 ring-primary/40 shadow-sm"
                            : "border-border hover:border-primary/30"
                        )}
                      >
                        <div className="relative aspect-[3/2] w-full overflow-hidden bg-muted">
                          <img
                            src={opt.preview}
                            alt=""
                            aria-hidden="true"
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          {selected && (
                            <div className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground shadow">
                              <Check className="w-2.5 h-2.5" aria-hidden="true" focusable="false" />
                            </div>
                          )}
                        </div>
                        <span className={cn(
                          "text-[10px] leading-tight font-medium py-1 px-1 text-center",
                          selected ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 px-4 sm:px-6 py-3 sm:py-4 border-t border-border/60 bg-muted/20">
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
              <Send className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
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
              <History className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" aria-hidden="true" focusable="false" />
              Version History
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
              View and restore previous versions
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-2 sm:py-3 border-b bg-muted/30 flex-shrink-0">
            <div className="flex items-center gap-2">
              <GitBranch className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" aria-hidden="true" focusable="false" />
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
                            <Clock className="w-3 h-3 flex-shrink-0" aria-hidden="true" focusable="false" />
                            <span>{version.editedAt.toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric'
                            })} at {version.editedAt.toLocaleTimeString('en-US', {
                              hour: '2-digit', minute: '2-digit'
                            })}</span>
                            <span className="text-muted-foreground">·</span>
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
                            <RotateCcw className="w-3 h-3 mr-1.5" aria-hidden="true" focusable="false" />
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

      {/* Per-column Version History Dialog */}
      <Dialog open={versionDialogCol !== null} onOpenChange={(open) => {
        if (!open) {
          setVersionDialogCol(null);
          setSelectedVersionId(null);
        }
      }}>
        <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[85vw] lg:max-w-4xl h-[85vh] sm:h-[80vh] p-0 flex flex-col overflow-hidden">
          <DialogHeader className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b flex-shrink-0">
            <DialogTitle className="text-sm sm:text-base md:text-lg font-bold flex items-center gap-2">
              <History className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" aria-hidden="true" focusable="false" />
              Version History — Column {(versionDialogCol ?? 0) + 1}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
              View and restore previous versions of this column
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-2 sm:py-3 border-b bg-muted/30 flex-shrink-0">
            <div className="flex items-center gap-2">
              <GitBranch className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" aria-hidden="true" focusable="false" />
              <span className="text-xs sm:text-sm font-medium">All Versions</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {versionDialogCol !== null ? getMockVersionsForColumn(versionDialogCol).length : 0} versions
            </Badge>
          </div>

          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-3 px-3 sm:px-4 md:px-6 py-3 sm:py-4">
              {versionDialogCol !== null && getMockVersionsForColumn(versionDialogCol).map((version, index) => {
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
                      <div className="flex items-start justify-between gap-2 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-sm">
                              Version {getMockVersionsForColumn(versionDialogCol).length - index}
                            </h4>
                            {isCurrentVersion && (
                              <Badge variant="secondary" className="text-[11px] px-2.5 py-0.5 h-5 font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full">Current</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                            <Clock className="w-3 h-3 flex-shrink-0" aria-hidden="true" focusable="false" />
                            <span>{version.editedAt.toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric'
                            })} at {version.editedAt.toLocaleTimeString('en-US', {
                              hour: '2-digit', minute: '2-digit'
                            })}</span>
                            <span className="text-muted-foreground">·</span>
                            <span>{version.editedBy}</span>
                          </div>
                        </div>
                        {!isCurrentVersion && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (versionDialogCol !== null) {
                                handleColumnChange(versionDialogCol, version.content);
                                setVersionDialogCol(null);
                                setSelectedVersionId(null);
                              }
                            }}
                            className="flex-shrink-0 h-7 sm:h-8 text-xs px-2 sm:px-3 rounded-full"
                          >
                            <RotateCcw className="w-3 h-3 mr-1.5" aria-hidden="true" focusable="false" />
                            Restore Version
                          </Button>
                        )}
                      </div>

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
