import { cn } from "@/lib/utils";
import { FileText, Layers, Loader2, Copy, Trash2, Plus, Sparkles } from "lucide-react";

export type OutlineItemSkeletonVariant = "page" | "section" | "section-child-page" | "sidebar-page" | "sidebar-child-page";
export type OutlineItemSkeletonAction = "adding" | "duplicating" | "deleting" | "rephrasing";

interface OutlineItemSkeletonProps {
  variant?: OutlineItemSkeletonVariant;
  action?: OutlineItemSkeletonAction;
  className?: string;
}

const actionMeta: Record<OutlineItemSkeletonAction, { verb: string; Icon: React.ComponentType<React.SVGAttributes<SVGElement>> }> = {
  adding: { verb: "Adding", Icon: Plus },
  duplicating: { verb: "Duplicating", Icon: Copy },
  deleting: { verb: "Removing", Icon: Trash2 },
  rephrasing: { verb: "Rephrasing", Icon: Sparkles },
};

/**
 * Adaptive shimmer placeholder for outline items (pages, sections, child pages),
 * shown while items are being added, duplicated, deleted, or rephrased.
 *
 * Variants mirror the live elements in MultiPageCourseCreator's Course Outline
 * (`page`, `section`) and PageEditorDialog's sidebar (`sidebar-page`, `sidebar-child-page`).
 */
export function OutlineItemSkeleton({
  variant = "page",
  action = "adding",
  className,
}: OutlineItemSkeletonProps) {
  const { verb, Icon } = actionMeta[action];
  const label = `${verb} ${variant.includes("section") ? "section" : "page"}…`;

  const Shimmer = (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-foreground/[0.06] to-transparent"
    />
  );

  if (variant === "section") {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={label}
        className={cn(
          "relative w-full overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-4 animate-fade-in",
          className,
        )}
      >
        {Shimmer}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-muted-foreground/50" aria-hidden="true" focusable="false" />
            <div className="h-2.5 w-16 rounded-full bg-muted-foreground/15" />
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" focusable="false" />
            <span>{label}</span>
          </div>
        </div>
        <div className="mt-3 h-4 w-2/3 rounded-md bg-muted-foreground/15" />
        <div className="mt-3 space-y-1.5">
          <div className="h-2.5 w-full rounded-full bg-muted-foreground/10" />
          <div className="h-2.5 w-[85%] rounded-full bg-muted-foreground/10" />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-7 w-24 rounded-full bg-muted-foreground/10" />
          <div className="h-7 w-20 rounded-full bg-muted-foreground/10" />
        </div>
      </div>
    );
  }

  if (variant === "section-child-page") {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={label}
        className={cn(
          "relative flex items-center gap-2 rounded-md border border-border/50 bg-muted/20 px-3 py-2 overflow-hidden animate-fade-in",
          className,
        )}
      >
        {Shimmer}
        <FileText className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" aria-hidden="true" focusable="false" />
        <div className="flex-1 h-2.5 rounded-full bg-muted-foreground/15" />
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" focusable="false" />
          <span className="hidden sm:inline">{verb}…</span>
        </div>
      </div>
    );
  }

  if (variant === "sidebar-page" || variant === "sidebar-child-page") {
    const isChild = variant === "sidebar-child-page";
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={label}
        className={cn(
          "relative flex items-center gap-2 overflow-hidden rounded-md py-2 animate-fade-in",
          isChild ? "pl-3 pr-1" : "px-2",
          "bg-muted/30",
          className,
        )}
      >
        {Shimmer}
        <FileText
          className={cn("text-muted-foreground/50 shrink-0", isChild ? "w-3.5 h-3.5" : "w-4 h-4")}
          aria-hidden="true"
          focusable="false"
        />
        <div className="flex-1 h-2.5 rounded-full bg-muted-foreground/15" />
        <Loader2 className="w-3 h-3 animate-spin text-muted-foreground/70 shrink-0" aria-hidden="true" focusable="false" />
      </div>
    );
  }

  // Default: top-level page in outline
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-border/60 bg-card/60 p-3.5 animate-fade-in",
        className,
      )}
    >
      {Shimmer}
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-muted-foreground/50" aria-hidden="true" focusable="false" />
        <div className="h-2.5 w-12 rounded-full bg-muted-foreground/15" />
        <div className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" focusable="false" />
          <span>{label}</span>
        </div>
      </div>
      <div className="mt-2.5 h-4 w-1/2 rounded-md bg-muted-foreground/15" />
      <div className="mt-2.5 h-2.5 w-[70%] rounded-full bg-muted-foreground/10" />
    </div>
  );
}

/** Small inline shimmer placeholder for a title being rephrased by AI. */
export function TitleRephraseSkeleton({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-live="polite"
      aria-label="Rephrasing title…"
      className={cn(
        "relative inline-flex items-center gap-2 overflow-hidden rounded-md bg-muted/40 px-2 py-1.5 align-middle animate-fade-in",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-foreground/[0.08] to-transparent"
      />
      <Sparkles className="w-3 h-3 text-muted-foreground/70 shrink-0" aria-hidden="true" focusable="false" />
      <span className="block h-2.5 w-32 rounded-full bg-muted-foreground/20" />
    </span>
  );
}
