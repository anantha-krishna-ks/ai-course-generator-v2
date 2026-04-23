import { cn } from "@/lib/utils";

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

export type BlockSkeletonAction =
  | "adding"
  | "duplicating"
  | "deleting"
  | "drop"
  | "uploading"
  | "replacing"
  | "removing";

interface BlockSkeletonProps {
  variant?: BlockSkeletonVariant;
  action?: BlockSkeletonAction;
  /** Optional explicit min-height override. */
  minHeight?: number | string;
  className?: string;
  /** Optional accessible label. */
  label?: string;
}

const variantMinHeight: Record<BlockSkeletonVariant, string> = {
  text: "8rem",
  image: "14rem",
  video: "16rem",
  audio: "4.5rem",
  doc: "20rem",
  quiz: "11rem",
  "image-description": "14rem",
  "video-description": "14rem",
  generic: "6rem",
};

const variantLabel: Record<BlockSkeletonVariant, string> = {
  text: "text",
  image: "image",
  video: "video",
  audio: "audio",
  doc: "document",
  quiz: "quiz",
  "image-description": "image and description",
  "video-description": "video and description",
  generic: "block",
};

const actionVerb: Record<BlockSkeletonAction, string> = {
  adding: "Loading",
  duplicating: "Duplicating",
  deleting: "Removing",
  drop: "Loading",
  uploading: "Uploading",
  replacing: "Replacing",
  removing: "Removing",
};

/**
 * Instagram-style shimmer placeholder.
 * Clean grayscale surfaces with a soft, continuous gradient sweep — no
 * captions, no spinners, no icons. Adapts to its container's height while
 * providing a sensible per-variant minimum so it never collapses.
 */
export function BlockSkeleton({
  variant = "generic",
  action = "adding",
  minHeight,
  className,
  label,
}: BlockSkeletonProps) {
  const computedLabel = label ?? `${actionVerb[action]} ${variantLabel[variant]}`;
  const resolvedMin = minHeight ?? variantMinHeight[variant];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={computedLabel}
      style={{ minHeight: resolvedMin }}
      className={cn("w-full h-full animate-fade-in", className)}
    >
      <span className="sr-only">{computedLabel}</span>

      {variant === "text" && (
        <div className="h-full w-full flex flex-col gap-2.5 py-1">
          <Shimmer className="h-3.5 w-[55%] rounded-md" />
          <Shimmer className="h-3 w-full rounded-md" />
          <Shimmer className="h-3 w-[94%] rounded-md" />
          <Shimmer className="h-3 w-[88%] rounded-md" />
          <Shimmer className="h-3 w-[72%] rounded-md" />
        </div>
      )}

      {(variant === "image" || variant === "video") && (
        <Shimmer className="h-full w-full rounded-xl" style={{ minHeight: resolvedMin }} />
      )}

      {variant === "audio" && (
        <div className="h-full w-full flex items-center gap-3">
          <Shimmer className="w-11 h-11 rounded-full shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <Shimmer className="h-2.5 w-1/3 rounded-md" />
            <Shimmer className="h-2.5 w-2/3 rounded-md" />
          </div>
        </div>
      )}

      {variant === "doc" && (
        <Shimmer className="h-full w-full rounded-xl" style={{ minHeight: resolvedMin }} />
      )}

      {variant === "quiz" && (
        <div className="h-full w-full flex flex-col gap-3">
          <Shimmer className="h-3.5 w-1/2 rounded-md" />
          <div className="grid grid-cols-2 gap-2 mt-1">
            <Shimmer className="h-9 rounded-lg" />
            <Shimmer className="h-9 rounded-lg" />
            <Shimmer className="h-9 rounded-lg" />
            <Shimmer className="h-9 rounded-lg" />
          </div>
        </div>
      )}

      {(variant === "image-description" || variant === "video-description") && (
        <div className="h-full w-full flex gap-3" style={{ minHeight: resolvedMin }}>
          <Shimmer className="flex-1 rounded-xl" />
          <div className="flex-1 flex flex-col gap-2 py-1">
            <Shimmer className="h-3.5 w-1/2 rounded-md" />
            <Shimmer className="h-2.5 w-full rounded-md" />
            <Shimmer className="h-2.5 w-[92%] rounded-md" />
            <Shimmer className="h-2.5 w-[80%] rounded-md" />
            <Shimmer className="h-2.5 w-[64%] rounded-md" />
          </div>
        </div>
      )}

      {variant === "generic" && <Shimmer className="h-full w-full rounded-xl" />}
    </div>
  );
}

/**
 * Instagram-style shimmer surface.
 * A flat muted base with a slow, smooth gradient sweep moving across.
 */
function Shimmer({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      style={style}
      className={cn(
        "relative overflow-hidden bg-muted/60",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-[shimmer_1.6s_ease-in-out_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-foreground/[0.06] before:to-transparent",
        className,
      )}
    />
  );
}
