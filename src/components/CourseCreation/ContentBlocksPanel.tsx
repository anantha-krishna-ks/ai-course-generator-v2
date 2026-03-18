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
  { id: "doc-upload", label: "Document", icon: FileText, category: "media", categoryLabel: "MEDIA", type: "doc", variant: "doc-upload" },
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

function BlockGridItem({
  block,
  onClick,
  locked,
}: {
  block: BlockItem;
  onClick: () => void;
  locked?: boolean;
}) {
  const Icon = block.icon;

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
    // Set a drag image for visual feedback
    if (e.dataTransfer.setDragImage && e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.currentTarget, 40, 20);
    }
  };

  // Stop pointer events from propagating to dnd-kit's document-level sensors
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
        "flex flex-col items-center justify-center gap-2 p-3 rounded-lg transition-all duration-200 select-none relative group",
        locked
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-muted cursor-grab active:cursor-grabbing"
      )}
    >
      {locked && (
        <div className="absolute top-1.5 right-1.5">
          <Lock className="w-3 h-3 text-muted-foreground/50" />
        </div>
      )}
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
          locked
            ? "text-muted-foreground/40"
            : "text-foreground/70 group-hover:text-foreground"
        )}
      >
        <Icon className="w-6 h-6" />
      </div>
      <span
        className={cn(
          "text-[11px] font-medium text-center leading-tight",
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
