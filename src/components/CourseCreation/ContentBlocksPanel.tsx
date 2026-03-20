import { useState } from "react";
import {
  Type,
  ImageIcon,
  Video,
  Mic,
  FileText,
  MessageCircleQuestion,
  Sparkles,
  Lock,
  Heading,
  Columns2,
  ImageUp,
  ImageDown,
  Search,
  HelpCircle,
  GripVertical,
  Mountain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BlockItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  categoryLabel: string;
  type: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description";
  variant?: string;
  locked?: boolean;
  isQuizGenerator?: boolean;
  description?: string;
}

interface ContentBlocksPanelProps {
  onAddBlock: (type: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description", variant?: string) => void;
  onOpenQuizGenerator?: () => void;
  aiEnabled?: boolean;
}

const ALL_BLOCKS: BlockItem[] = [
  // TEXT
  { id: "heading-text", label: "Heading & Text", icon: Heading, category: "text", categoryLabel: "TEXT", type: "text", variant: "heading-text", description: "A bold heading followed by a paragraph of body text" },
  { id: "text-only", label: "Text", icon: Type, category: "text", categoryLabel: "TEXT", type: "text", variant: "text-only", description: "A simple rich-text paragraph block" },
  { id: "two-columns", label: "Two Columns", icon: Columns2, category: "text", categoryLabel: "TEXT", type: "text", variant: "two-columns", description: "Side-by-side text columns for comparisons or dense content" },
  // IMAGES
  { id: "image-full", label: "Single Image", icon: ImageIcon, category: "image", categoryLabel: "IMAGES", type: "image", variant: "image-full", description: "A full-width image block" },
  { id: "image-top", label: "Image on Top", icon: ImageUp, category: "image", categoryLabel: "IMAGES", type: "image-description", variant: "image-top", description: "Image above with descriptive text below" },
  { id: "image-bottom", label: "Image on Bottom", icon: ImageDown, category: "image", categoryLabel: "IMAGES", type: "image-description", variant: "image-bottom", description: "Text content above with an image below" },
  // MEDIA
  { id: "video-upload", label: "Video", icon: Video, category: "media", categoryLabel: "MEDIA", type: "video", variant: "video-upload", description: "Embed or upload a video clip" },
  { id: "audio-upload", label: "Audio", icon: Mic, category: "media", categoryLabel: "MEDIA", type: "audio", variant: "audio-upload", description: "Embed or upload an audio track" },
  // QUESTION
  { id: "question-block", label: "Question", icon: HelpCircle, category: "question", categoryLabel: "QUESTION", type: "quiz", variant: "question-block", description: "Add a single question with answer options" },
  // QUIZ
  { id: "quiz-block", label: "Quiz", icon: MessageCircleQuestion, category: "quiz", categoryLabel: "QUIZ", type: "quiz", variant: "quiz-block", description: "Add a full quiz — one per page" },
];

/** Resolve a dropped template into a block type and variant. Returns null for quiz-generate (needs dialog). */
export function resolveTemplateDropData(
  templateId: string,
  categoryId: string
): { type: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description"; variant?: string } | null {
  const block = ALL_BLOCKS.find((b) => b.id === templateId);
  if (!block || block.isQuizGenerator) return null;
  return { type: block.type, variant: block.variant };
}

/** Larger, more detailed preview for the hover tooltip */
function BlockPreview({ id }: { id: string }) {
  switch (id) {
    case "heading-text":
      return (
        <div className="w-48 p-3 space-y-2">
          <div className="h-3 w-2/3 rounded bg-foreground/30" />
          <div className="space-y-1.5">
            <div className="h-1.5 w-full rounded-sm bg-muted-foreground/20" />
            <div className="h-1.5 w-full rounded-sm bg-muted-foreground/20" />
            <div className="h-1.5 w-4/5 rounded-sm bg-muted-foreground/20" />
            <div className="h-1.5 w-3/5 rounded-sm bg-muted-foreground/15" />
          </div>
        </div>
      );
    case "text-only":
      return (
        <div className="w-48 p-3 space-y-1.5">
          <div className="h-1.5 w-full rounded-sm bg-muted-foreground/25" />
          <div className="h-1.5 w-full rounded-sm bg-muted-foreground/25" />
          <div className="h-1.5 w-full rounded-sm bg-muted-foreground/25" />
          <div className="h-1.5 w-4/5 rounded-sm bg-muted-foreground/20" />
          <div className="h-1.5 w-3/5 rounded-sm bg-muted-foreground/15" />
        </div>
      );
    case "two-columns":
      return (
        <div className="w-48 p-3 flex gap-3">
          <div className="flex-1 space-y-1.5">
            <div className="h-2 w-3/5 rounded-sm bg-foreground/25 mb-2" />
            <div className="h-1.5 w-full rounded-sm bg-muted-foreground/20" />
            <div className="h-1.5 w-4/5 rounded-sm bg-muted-foreground/20" />
            <div className="h-1.5 w-full rounded-sm bg-muted-foreground/20" />
            <div className="h-1.5 w-2/3 rounded-sm bg-muted-foreground/15" />
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2 w-3/5 rounded-sm bg-foreground/25 mb-2" />
            <div className="h-1.5 w-full rounded-sm bg-muted-foreground/20" />
            <div className="h-1.5 w-3/5 rounded-sm bg-muted-foreground/20" />
            <div className="h-1.5 w-full rounded-sm bg-muted-foreground/20" />
            <div className="h-1.5 w-4/5 rounded-sm bg-muted-foreground/15" />
          </div>
        </div>
      );
    case "image-full":
      return (
        <div className="w-48 p-3">
          <div className="w-full h-20 rounded-lg bg-gradient-to-br from-muted-foreground/10 to-muted-foreground/5 border border-muted-foreground/10 flex items-center justify-center">
            <Mountain className="w-6 h-6 text-muted-foreground/25" />
          </div>
        </div>
      );
    case "image-top":
      return (
        <div className="w-48 p-3 space-y-2.5">
          <div className="w-full h-14 rounded-lg bg-gradient-to-br from-muted-foreground/10 to-muted-foreground/5 border border-muted-foreground/10 flex items-center justify-center">
            <Mountain className="w-5 h-5 text-muted-foreground/25" />
          </div>
          <div className="space-y-1.5">
            <div className="h-1.5 w-full rounded-sm bg-muted-foreground/20" />
            <div className="h-1.5 w-full rounded-sm bg-muted-foreground/20" />
            <div className="h-1.5 w-3/5 rounded-sm bg-muted-foreground/15" />
          </div>
        </div>
      );
    case "image-bottom":
      return (
        <div className="w-48 p-3 space-y-2.5">
          <div className="space-y-1.5">
            <div className="h-1.5 w-full rounded-sm bg-muted-foreground/20" />
            <div className="h-1.5 w-full rounded-sm bg-muted-foreground/20" />
            <div className="h-1.5 w-3/5 rounded-sm bg-muted-foreground/15" />
          </div>
          <div className="w-full h-14 rounded-lg bg-gradient-to-br from-muted-foreground/10 to-muted-foreground/5 border border-muted-foreground/10 flex items-center justify-center">
            <Mountain className="w-5 h-5 text-muted-foreground/25" />
          </div>
        </div>
      );
    case "video-upload":
      return (
        <div className="w-48 p-3">
          <div className="w-full h-20 rounded-lg bg-gradient-to-br from-muted-foreground/8 to-muted-foreground/4 border border-muted-foreground/10 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,hsl(var(--muted-foreground)/0.03)_4px,hsl(var(--muted-foreground)/0.03)_5px)]" />
            <div className="w-8 h-8 rounded-full bg-foreground/10 backdrop-blur-sm flex items-center justify-center border border-foreground/10 z-10">
              <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-l-[8px] border-transparent border-l-foreground/40 ml-0.5" />
            </div>
            <div className="absolute bottom-1.5 left-2 right-2 h-1 rounded-full bg-muted-foreground/10 overflow-hidden">
              <div className="h-full w-1/3 rounded-full bg-primary/30" />
            </div>
          </div>
        </div>
      );
    case "audio-upload":
      return (
        <div className="w-48 p-3">
          <div className="w-full h-12 rounded-lg bg-gradient-to-br from-muted-foreground/8 to-muted-foreground/4 border border-muted-foreground/10 flex items-center gap-2 px-3">
            <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center border border-foreground/10 shrink-0">
              <div className="w-0 h-0 border-t-[3px] border-b-[3px] border-l-[5px] border-transparent border-l-foreground/40 ml-0.5" />
            </div>
            <div className="flex-1 flex items-center gap-[2px]">
              {[4, 8, 3, 10, 6, 12, 5, 9, 3, 7, 11, 4, 8, 5, 10, 3, 7, 6, 9, 4].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-full bg-primary/25"
                  style={{ height: `${h}px` }}
                />
              ))}
            </div>
            <span className="text-[8px] text-muted-foreground/50 shrink-0 tabular-nums">1:24</span>
          </div>
        </div>
      );
    case "question-block":
      return (
        <div className="w-48 p-3 space-y-2">
          <div className="h-2 w-4/5 rounded-sm bg-foreground/25" />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 h-5 rounded-md bg-muted-foreground/5 border border-muted-foreground/10 px-2">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-primary/40" />
              <div className="h-1.5 flex-1 rounded-sm bg-muted-foreground/15" />
            </div>
            <div className="flex items-center gap-2 h-5 rounded-md bg-muted-foreground/5 border border-muted-foreground/10 px-2">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-muted-foreground/20" />
              <div className="h-1.5 w-3/5 rounded-sm bg-muted-foreground/15" />
            </div>
            <div className="flex items-center gap-2 h-5 rounded-md bg-muted-foreground/5 border border-muted-foreground/10 px-2">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-muted-foreground/20" />
              <div className="h-1.5 w-4/5 rounded-sm bg-muted-foreground/15" />
            </div>
          </div>
        </div>
      );
    case "quiz-block":
      return (
        <div className="w-48 p-3 space-y-2">
          <div className="flex items-center gap-1.5 mb-1">
            <MessageCircleQuestion className="w-3.5 h-3.5 text-primary/50" />
            <div className="h-2 w-1/2 rounded-sm bg-foreground/25" />
          </div>
          <div className="space-y-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2 h-4 rounded bg-primary/5 border border-primary/10 px-2">
                <div className="w-2 h-2 rounded-sm bg-primary/20" />
                <div className="h-1.5 flex-1 rounded-sm bg-primary/10" />
                <div className="w-6 h-1.5 rounded-sm bg-primary/15" />
              </div>
            ))}
          </div>
          <div className="h-1 w-full rounded-full bg-muted-foreground/10 overflow-hidden mt-1">
            <div className="h-full w-2/3 rounded-full bg-primary/25" />
          </div>
        </div>
      );
    default:
      return null;
  }
}

/** Miniature layout thumbnails for each block variant */
function BlockThumbnail({ id }: { id: string }) {
  switch (id) {
    case "heading-text":
      return (
        <div className="flex flex-col gap-1.5 w-full px-1.5">
          <div className="h-2.5 w-3/5 rounded-[3px] bg-foreground/20" />
          <div className="space-y-[3px]">
            <div className="h-[3px] w-full rounded-sm bg-muted-foreground/12" />
            <div className="h-[3px] w-4/5 rounded-sm bg-muted-foreground/12" />
            <div className="h-[3px] w-3/5 rounded-sm bg-muted-foreground/10" />
          </div>
        </div>
      );
    case "text-only":
      return (
        <div className="flex flex-col gap-[3px] w-full px-1.5">
          <div className="h-[3px] w-full rounded-sm bg-muted-foreground/15" />
          <div className="h-[3px] w-full rounded-sm bg-muted-foreground/15" />
          <div className="h-[3px] w-4/5 rounded-sm bg-muted-foreground/12" />
          <div className="h-[3px] w-3/5 rounded-sm bg-muted-foreground/10" />
        </div>
      );
    case "two-columns":
      return (
        <div className="flex gap-2 w-full px-1.5">
          <div className="flex-1 space-y-[3px]">
            <div className="h-[3px] w-full rounded-sm bg-muted-foreground/15" />
            <div className="h-[3px] w-4/5 rounded-sm bg-muted-foreground/12" />
            <div className="h-[3px] w-full rounded-sm bg-muted-foreground/15" />
          </div>
          <div className="w-px bg-border/60" />
          <div className="flex-1 space-y-[3px]">
            <div className="h-[3px] w-full rounded-sm bg-muted-foreground/15" />
            <div className="h-[3px] w-3/5 rounded-sm bg-muted-foreground/12" />
            <div className="h-[3px] w-full rounded-sm bg-muted-foreground/15" />
          </div>
        </div>
      );
    case "image-full":
      return (
        <div className="w-full px-1.5">
          <div className="w-full h-9 rounded-md bg-gradient-to-br from-muted-foreground/8 to-muted-foreground/4 border border-muted-foreground/8 flex items-center justify-center">
            <Mountain className="w-3.5 h-3.5 text-muted-foreground/20" />
          </div>
        </div>
      );
    case "image-top":
      return (
        <div className="flex flex-col gap-1.5 w-full px-1.5">
          <div className="w-full h-5 rounded-md bg-gradient-to-br from-muted-foreground/8 to-muted-foreground/4 border border-muted-foreground/8 flex items-center justify-center">
            <Mountain className="w-2.5 h-2.5 text-muted-foreground/20" />
          </div>
          <div className="space-y-[3px]">
            <div className="h-[3px] w-full rounded-sm bg-muted-foreground/12" />
            <div className="h-[3px] w-4/5 rounded-sm bg-muted-foreground/10" />
          </div>
        </div>
      );
    case "image-bottom":
      return (
        <div className="flex flex-col gap-1.5 w-full px-1.5">
          <div className="space-y-[3px]">
            <div className="h-[3px] w-full rounded-sm bg-muted-foreground/12" />
            <div className="h-[3px] w-4/5 rounded-sm bg-muted-foreground/10" />
          </div>
          <div className="w-full h-5 rounded-md bg-gradient-to-br from-muted-foreground/8 to-muted-foreground/4 border border-muted-foreground/8 flex items-center justify-center">
            <Mountain className="w-2.5 h-2.5 text-muted-foreground/20" />
          </div>
        </div>
      );
    case "video-upload":
      return (
        <div className="w-full px-1.5">
          <div className="w-full h-9 rounded-md bg-gradient-to-br from-muted-foreground/8 to-muted-foreground/4 border border-muted-foreground/8 flex items-center justify-center relative">
            <div className="w-5 h-5 rounded-full bg-foreground/8 flex items-center justify-center border border-foreground/8">
              <div className="w-0 h-0 border-t-[3px] border-b-[3px] border-l-[5px] border-transparent border-l-foreground/25 ml-0.5" />
            </div>
            <div className="absolute bottom-1 left-1.5 right-1.5 h-[2px] rounded-full bg-muted-foreground/10 overflow-hidden">
              <div className="h-full w-1/3 rounded-full bg-primary/25" />
            </div>
          </div>
        </div>
      );
    case "audio-upload":
      return (
        <div className="w-full px-1.5">
          <div className="w-full h-8 rounded-md bg-gradient-to-br from-muted-foreground/8 to-muted-foreground/4 border border-muted-foreground/8 flex items-center gap-1 px-1.5">
            <div className="w-3 h-3 rounded-full bg-foreground/8 flex items-center justify-center shrink-0">
              <div className="w-0 h-0 border-t-[2px] border-b-[2px] border-l-[3px] border-transparent border-l-foreground/25 ml-0.5" />
            </div>
            <div className="flex-1 flex items-center gap-[1px]">
              {[3, 5, 2, 6, 4, 7, 3, 5, 2, 4, 6, 3].map((h, i) => (
                <div key={i} className="flex-1 rounded-full bg-primary/20" style={{ height: `${h}px` }} />
              ))}
            </div>
          </div>
        </div>
      );
    case "question-block":
      return (
        <div className="flex flex-col gap-1 w-full px-1.5">
          <div className="h-[3px] w-4/5 rounded-sm bg-foreground/15" />
          <div className="space-y-[3px]">
            <div className="flex items-center gap-1 h-3 rounded bg-muted-foreground/5 border border-muted-foreground/8 px-1">
              <div className="w-1.5 h-1.5 rounded-full border border-primary/30" />
              <div className="h-[2px] flex-1 rounded-sm bg-muted-foreground/10" />
            </div>
            <div className="flex items-center gap-1 h-3 rounded bg-muted-foreground/5 border border-muted-foreground/8 px-1">
              <div className="w-1.5 h-1.5 rounded-full border border-muted-foreground/15" />
              <div className="h-[2px] w-3/5 rounded-sm bg-muted-foreground/10" />
            </div>
          </div>
        </div>
      );
    case "quiz-block":
      return (
        <div className="flex flex-col gap-1 w-full px-1.5">
          <div className="flex items-center gap-1">
            <MessageCircleQuestion className="w-2.5 h-2.5 text-primary/30" />
            <div className="h-[3px] w-2/5 rounded-sm bg-foreground/15" />
          </div>
          <div className="space-y-[2px]">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-1 h-2.5 rounded bg-primary/5 border border-primary/8 px-1">
                <div className="w-1.5 h-1.5 rounded-sm bg-primary/15" />
                <div className="h-[2px] flex-1 rounded-sm bg-primary/10" />
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
}

function BlockGridItem({
  block,
  onClick,
  locked,
}: {
  block: BlockItem;
  onClick: () => void;
  locked?: boolean;
}) {
  const handleDragStart = (e: React.DragEvent) => {
    if (locked) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData(
      "application/content-block",
      JSON.stringify({ templateId: block.id, categoryId: block.category })
    );
    e.dataTransfer.effectAllowed = "copy";
    if (e.dataTransfer.setDragImage && e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.currentTarget, 40, 20);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
  };

  return (
    <Tooltip delayDuration={400}>
      <TooltipTrigger asChild>
        <div
          role="button"
          tabIndex={locked ? -1 : 0}
          onClick={locked ? undefined : onClick}
          draggable={!locked}
          onDragStart={handleDragStart}
          onPointerDown={locked ? undefined : handlePointerDown}
          className={cn(
            "flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all duration-200 select-none relative group bg-[#ffffff]",
            locked
              ? "opacity-50 cursor-not-allowed border-border/30"
              : "border-border/60 hover:border-primary/30 hover:shadow-[0_2px_8px_-2px_hsl(var(--primary)/0.12)] hover:bg-[#ffffff] cursor-grab active:cursor-grabbing active:scale-[0.97]"
          )}
        >
          {locked && (
            <div className="absolute top-1.5 right-1.5">
              <Lock className="w-3 h-3 text-muted-foreground/50" />
            </div>
          )}
          <div className="w-full h-11 flex items-center justify-center">
            <BlockThumbnail id={block.id} />
          </div>
          <span
            className={cn(
              "text-[10px] font-medium text-center leading-tight",
              locked ? "text-muted-foreground/50" : "text-muted-foreground group-hover:text-foreground"
            )}
          >
            {block.label}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={8}
        className="p-0 overflow-hidden rounded-xl border border-border shadow-lg bg-popover max-w-[220px]"
      >
        <div className="border-b border-border/60 bg-muted/30">
          <BlockPreview id={block.id} />
        </div>
        <div className="px-3 py-2">
          <p className="text-xs font-semibold text-foreground">{block.label}</p>
          {block.description && (
            <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{block.description}</p>
          )}
          {locked ? (
            <p className="text-[10px] text-muted-foreground/60 mt-1.5 flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" />
              Only one quiz per page
            </p>
          ) : (
            <p className="text-[10px] text-muted-foreground/60 mt-1.5 flex items-center gap-1">
              <GripVertical className="w-2.5 h-2.5" />
              Click or drag to add
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export function ContentBlocksPanel({ onAddBlock, onOpenQuizGenerator, aiEnabled = false, hasQuizBlock = false }: ContentBlocksPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBlocks = searchQuery.trim()
    ? ALL_BLOCKS.filter((b) => b.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : ALL_BLOCKS;

  // Group by category preserving order
  const grouped: { label: string; blocks: BlockItem[] }[] = [];
  for (const block of filteredBlocks) {
    const existing = grouped.find((g) => g.label === block.categoryLabel);
    if (existing) {
      existing.blocks.push(block);
    } else {
      grouped.push({ label: block.categoryLabel, blocks: [block] });
    }
  }

  const handleClick = (block: BlockItem) => {
    if (block.id === "quiz-block" && hasQuizBlock) return;
    onAddBlock(block.type, block.variant);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full -m-4">
        {/* Search */}
        <div className="px-4 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search blocks…"
              className="pl-9 h-9 bg-background border-border focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-primary/50 text-sm"
            />
          </div>
        </div>

        {/* Blocks grid */}
        <div className="flex-1 overflow-y-auto thin-scrollbar px-4 pb-4">
          {grouped.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No blocks found</p>
          )}

          {grouped.map((group) => (
            <div key={group.label}>
              {/* Category label */}
              <div className="pt-3 pb-2">
                <span className="text-[10px] font-semibold text-muted-foreground/60 tracking-[0.14em] uppercase">
                  {group.label}
                </span>
              </div>

              {/* 3-column grid */}
              <div className="grid grid-cols-3 gap-1.5">
                {group.blocks.map((block) => (
                  <BlockGridItem
                    key={block.id}
                    block={block}
                    onClick={() => handleClick(block)}
                    locked={block.id === "quiz-block" && hasQuizBlock}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
