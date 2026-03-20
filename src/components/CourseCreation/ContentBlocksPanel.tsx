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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

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
}

interface ContentBlocksPanelProps {
  onAddBlock: (type: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description", variant?: string) => void;
  onOpenQuizGenerator?: () => void;
  aiEnabled?: boolean;
}

const ALL_BLOCKS: BlockItem[] = [
  // TEXT
  { id: "heading-text", label: "Heading & Text", icon: Heading, category: "text", categoryLabel: "TEXT", type: "text", variant: "heading-text" },
  { id: "text-only", label: "Text", icon: Type, category: "text", categoryLabel: "TEXT", type: "text", variant: "text-only" },
  { id: "two-columns", label: "Two Columns", icon: Columns2, category: "text", categoryLabel: "TEXT", type: "text", variant: "two-columns" },
  // IMAGES
  { id: "image-full", label: "Single Image", icon: ImageIcon, category: "image", categoryLabel: "IMAGES", type: "image", variant: "image-full" },
  { id: "image-top", label: "Image on Top", icon: ImageUp, category: "image", categoryLabel: "IMAGES", type: "image-description", variant: "image-top" },
  { id: "image-bottom", label: "Image on Bottom", icon: ImageDown, category: "image", categoryLabel: "IMAGES", type: "image-description", variant: "image-bottom" },
  // MEDIA
  { id: "video-upload", label: "Video", icon: Video, category: "media", categoryLabel: "MEDIA", type: "video", variant: "video-upload" },
  { id: "audio-upload", label: "Audio", icon: Mic, category: "media", categoryLabel: "MEDIA", type: "audio", variant: "audio-upload" },
  // { id: "doc-upload", label: "Document", icon: FileText, category: "media", categoryLabel: "MEDIA", type: "doc", variant: "doc-upload" },
  // QUESTION / QUIZ
  { id: "question-block", label: "Question", icon: HelpCircle, category: "quiz", categoryLabel: "QUESTION / QUIZ", type: "quiz", variant: "question-block" },
  { id: "quiz-generate", label: "Quiz (AI)", icon: Sparkles, category: "quiz", categoryLabel: "QUESTION / QUIZ", type: "quiz", isQuizGenerator: true },
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

/** Miniature layout thumbnails for each block variant */
function BlockThumbnail({ id }: { id: string }) {
  const base = "w-full h-full rounded";

  switch (id) {
    case "heading-text":
      return (
        <div className="flex flex-col gap-1.5 w-full px-1">
          <div className="h-2 w-3/5 rounded-sm bg-foreground/25" />
          <div className="space-y-1">
            <div className="h-1 w-full rounded-sm bg-muted-foreground/15" />
            <div className="h-1 w-4/5 rounded-sm bg-muted-foreground/15" />
            <div className="h-1 w-3/5 rounded-sm bg-muted-foreground/15" />
          </div>
        </div>
      );
    case "text-only":
      return (
        <div className="flex flex-col gap-1 w-full px-1">
          <div className="h-1 w-full rounded-sm bg-muted-foreground/20" />
          <div className="h-1 w-full rounded-sm bg-muted-foreground/20" />
          <div className="h-1 w-4/5 rounded-sm bg-muted-foreground/20" />
          <div className="h-1 w-3/5 rounded-sm bg-muted-foreground/20" />
        </div>
      );
    case "two-columns":
      return (
        <div className="flex gap-1.5 w-full px-1">
          <div className="flex-1 space-y-1">
            <div className="h-1 w-full rounded-sm bg-muted-foreground/20" />
            <div className="h-1 w-4/5 rounded-sm bg-muted-foreground/20" />
            <div className="h-1 w-full rounded-sm bg-muted-foreground/20" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="h-1 w-full rounded-sm bg-muted-foreground/20" />
            <div className="h-1 w-3/5 rounded-sm bg-muted-foreground/20" />
            <div className="h-1 w-full rounded-sm bg-muted-foreground/20" />
          </div>
        </div>
      );
    case "image-full":
      return (
        <div className="w-full px-1">
          <div className="w-full h-8 rounded bg-muted-foreground/10 flex items-center justify-center">
            <ImageIcon className="w-3.5 h-3.5 text-muted-foreground/30" />
          </div>
        </div>
      );
    case "image-top":
      return (
        <div className="flex flex-col gap-1.5 w-full px-1">
          <div className="w-full h-5 rounded bg-muted-foreground/10 flex items-center justify-center">
            <ImageIcon className="w-3 h-3 text-muted-foreground/30" />
          </div>
          <div className="space-y-1">
            <div className="h-1 w-full rounded-sm bg-muted-foreground/15" />
            <div className="h-1 w-4/5 rounded-sm bg-muted-foreground/15" />
          </div>
        </div>
      );
    case "image-bottom":
      return (
        <div className="flex flex-col gap-1.5 w-full px-1">
          <div className="space-y-1">
            <div className="h-1 w-full rounded-sm bg-muted-foreground/15" />
            <div className="h-1 w-4/5 rounded-sm bg-muted-foreground/15" />
          </div>
          <div className="w-full h-5 rounded bg-muted-foreground/10 flex items-center justify-center">
            <ImageIcon className="w-3 h-3 text-muted-foreground/30" />
          </div>
        </div>
      );
    case "video-upload":
      return (
        <div className="w-full px-1">
          <div className="w-full h-8 rounded bg-muted-foreground/10 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-muted-foreground/15 flex items-center justify-center">
              <div className="w-0 h-0 border-t-[3px] border-b-[3px] border-l-[5px] border-transparent border-l-muted-foreground/30 ml-0.5" />
            </div>
          </div>
        </div>
      );
    case "audio-upload":
      return (
        <div className="w-full px-1">
          <div className="w-full h-7 rounded bg-muted-foreground/10 flex items-center gap-0.5 px-2">
            <div className="w-3 h-3 rounded-full bg-muted-foreground/15 flex items-center justify-center">
              <div className="w-0 h-0 border-t-[2px] border-b-[2px] border-l-[3px] border-transparent border-l-muted-foreground/30 ml-0.5" />
            </div>
            <div className="flex-1 flex items-center gap-[2px] px-1">
              {[3, 5, 2, 6, 4, 7, 3, 5, 2, 4, 6, 3].map((h, i) => (
                <div key={i} className="flex-1 rounded-full bg-muted-foreground/20" style={{ height: `${h}px` }} />
              ))}
            </div>
          </div>
        </div>
      );
    case "question-block":
      return (
        <div className="flex flex-col gap-1.5 w-full px-1">
          <div className="h-1.5 w-4/5 rounded-sm bg-muted-foreground/20" />
          <div className="space-y-1">
            <div className="h-3 w-full rounded bg-muted-foreground/8 border border-muted-foreground/10" />
            <div className="h-3 w-full rounded bg-muted-foreground/8 border border-muted-foreground/10" />
          </div>
        </div>
      );
    case "quiz-generate":
      return (
        <div className="flex flex-col items-center gap-1 w-full px-1">
          <Sparkles className="w-4 h-4 text-primary/50" />
          <div className="space-y-1 w-full">
            <div className="h-1 w-full rounded-sm bg-primary/15" />
            <div className="h-1 w-3/5 rounded-sm bg-primary/15 mx-auto" />
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
    <div
      role="button"
      tabIndex={locked ? -1 : 0}
      onClick={locked ? undefined : onClick}
      draggable={!locked}
      onDragStart={handleDragStart}
      onPointerDown={locked ? undefined : handlePointerDown}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-2.5 rounded-xl border transition-all duration-200 select-none relative group",
        locked
          ? "opacity-50 cursor-not-allowed border-transparent"
          : "border-border/50 hover:border-border hover:shadow-sm hover:bg-muted/50 cursor-grab active:cursor-grabbing"
      )}
    >
      {locked && (
        <div className="absolute top-1.5 right-1.5">
          <Lock className="w-3 h-3 text-muted-foreground/50" />
        </div>
      )}
      <div className="w-full h-10 flex items-center justify-center">
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
  );
}

export function ContentBlocksPanel({ onAddBlock, onOpenQuizGenerator, aiEnabled = false }: ContentBlocksPanelProps) {
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
    if (block.isQuizGenerator) {
      onOpenQuizGenerator?.();
      return;
    }
    onAddBlock(block.type, block.variant);
  };

  return (
    <div className="flex flex-col h-full -m-4">
      {/* Search */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
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
              <span className="text-[11px] font-semibold text-muted-foreground/70 tracking-[0.12em]">
                {group.label}
              </span>
            </div>

            {/* 3-column grid */}
            <div className="grid grid-cols-3 gap-1">
              {group.blocks.map((block) => (
                <BlockGridItem
                  key={block.id}
                  block={block}
                  onClick={() => handleClick(block)}
                  locked={block.isQuizGenerator && !aiEnabled}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
