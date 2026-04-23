import { cn } from "@/lib/utils";
import { ImageIcon, Video, Mic, FileText, Type, HelpCircle, Loader2 } from "lucide-react";

export type BlockSkeletonVariant =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "doc"
  | "quiz"
  | "image-description"
  | "video-description"
  | "generic";

export type BlockSkeletonAction = "adding" | "duplicating" | "deleting" | "drop" | "uploading" | "replacing" | "removing";

interface BlockSkeletonProps {
  variant?: BlockSkeletonVariant;
  action?: BlockSkeletonAction;
  /** Optional explicit min-height override. By default each variant picks a sensible height. */
  minHeight?: number | string;
  className?: string;
  /** Optional caption override. */
  label?: string;
}

const variantIcon: Record<BlockSkeletonVariant, React.ComponentType<{ className?: string }>> = {
  text: Type,
  image: ImageIcon,
  video: Video,
  audio: Mic,
  doc: FileText,
  quiz: HelpCircle,
  "image-description": ImageIcon,
  "video-description": Video,
  generic: Loader2,
};

const variantLabel: Record<BlockSkeletonVariant, string> = {
  text: "text block",
  image: "image",
  video: "video",
  audio: "audio",
  doc: "document",
  quiz: "quiz",
  "image-description": "image + description",
  "video-description": "video + description",
  generic: "block",
};

const actionVerb: Record<BlockSkeletonAction, string> = {
  adding: "Adding",
  duplicating: "Duplicating",
  deleting: "Removing",
  drop: "Placing",
  uploading: "Uploading",
  replacing: "Replacing",
  removing: "Removing",
};

const variantMinHeight: Record<BlockSkeletonVariant, string> = {
  text: "9rem",
  image: "14rem",
  video: "16rem",
  audio: "6rem",
  doc: "20rem",
  quiz: "11rem",
  "image-description": "16rem",
  "video-description": "16rem",
  generic: "8rem",
};

/**
 * Adaptive shimmer placeholder for any block area.
 * Fills the height of its container (or a sensible default for the variant)
 * while content is being uploaded, replaced, deleted, duplicated, dragged in
 * or otherwise transitioning.
 */
export function BlockSkeleton({
  variant = "generic",
  action = "adding",
  minHeight,
  className,
  label,
}: BlockSkeletonProps) {
  const Icon = variantIcon[variant];
  const computedLabel = label ?? `${actionVerb[action]} ${variantLabel[variant]}…`;
  const resolvedMin = minHeight ?? variantMinHeight[variant];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={computedLabel}
      style={{ minHeight: resolvedMin }}
      className={cn(
        "relative w-full h-full overflow-hidden rounded-xl border border-border/60 bg-muted/30",
        "animate-fade-in",
        className,
      )}
    >
      {/* Shimmer sweep */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-primary/[0.08] to-transparent"
      />

      <div className="relative h-full w-full flex flex-col gap-3 p-4">
        {/* Variant-specific shimmer body */}
        {variant === "text" && (
          <div className="flex-1 space-y-2.5">
            <div className="h-3.5 w-2/3 rounded-full bg-muted-foreground/15" />
            <div className="h-3 w-full rounded-full bg-muted-foreground/10" />
            <div className="h-3 w-[92%] rounded-full bg-muted-foreground/10" />
            <div className="h-3 w-[78%] rounded-full bg-muted-foreground/10" />
          </div>
        )}

        {(variant === "image" || variant === "video") && (
          <div className="flex-1 rounded-lg bg-muted-foreground/10 flex items-center justify-center">
            <Icon className="w-8 h-8 text-muted-foreground/40" aria-hidden="true" focusable="false" />
          </div>
        )}

        {variant === "audio" && (
          <div className="flex-1 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted-foreground/15 flex items-center justify-center">
              <Icon className="w-4 h-4 text-muted-foreground/40" aria-hidden="true" focusable="false" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-2.5 w-1/3 rounded-full bg-muted-foreground/15" />
              <div className="h-2 w-2/3 rounded-full bg-muted-foreground/10" />
            </div>
          </div>
        )}

        {variant === "doc" && (
          <div className="flex-1 rounded-lg bg-muted-foreground/10 flex flex-col">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40">
              <Icon className="w-4 h-4 text-muted-foreground/50" aria-hidden="true" focusable="false" />
              <div className="h-2.5 w-32 rounded-full bg-muted-foreground/20" />
            </div>
            <div className="flex-1 p-4 space-y-2">
              <div className="h-2.5 w-full rounded-full bg-muted-foreground/15" />
              <div className="h-2.5 w-[90%] rounded-full bg-muted-foreground/15" />
              <div className="h-2.5 w-[80%] rounded-full bg-muted-foreground/15" />
              <div className="h-2.5 w-[60%] rounded-full bg-muted-foreground/15" />
            </div>
          </div>
        )}

        {variant === "quiz" && (
          <div className="flex-1 space-y-2.5">
            <div className="h-3.5 w-1/2 rounded-full bg-muted-foreground/15" />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="h-8 rounded-md bg-muted-foreground/10" />
              <div className="h-8 rounded-md bg-muted-foreground/10" />
              <div className="h-8 rounded-md bg-muted-foreground/10" />
              <div className="h-8 rounded-md bg-muted-foreground/10" />
            </div>
          </div>
        )}

        {(variant === "image-description" || variant === "video-description") && (
          <div className="flex-1 flex gap-3">
            <div className="flex-1 rounded-lg bg-muted-foreground/10 flex items-center justify-center">
              <Icon className="w-7 h-7 text-muted-foreground/40" aria-hidden="true" focusable="false" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/2 rounded-full bg-muted-foreground/15" />
              <div className="h-2.5 w-full rounded-full bg-muted-foreground/10" />
              <div className="h-2.5 w-[88%] rounded-full bg-muted-foreground/10" />
              <div className="h-2.5 w-[70%] rounded-full bg-muted-foreground/10" />
            </div>
          </div>
        )}

        {variant === "generic" && (
          <div className="flex-1 flex items-center justify-center">
            <Icon className="w-5 h-5 text-muted-foreground/50 animate-spin" aria-hidden="true" focusable="false" />
          </div>
        )}

        {/* Footer label */}
        <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground/80">
          <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" focusable="false" />
          <span>{computedLabel}</span>
        </div>
      </div>
    </div>
  );
}
