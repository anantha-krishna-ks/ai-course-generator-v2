import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { resolveTemplateDropData } from "./ContentBlocksPanel";

interface DropIndicatorProps {
  index: number;
  isActive: boolean;
  onActivate: (index: number) => void;
  onDeactivate: () => void;
  onDrop: (index: number, type: string, variant?: string) => void;
  onQuizGenerator?: () => void;
}

export function DropIndicator({
  index,
  isActive,
  onActivate,
  onDeactivate,
  onDrop,
  onQuizGenerator,
}: DropIndicatorProps) {
  const hasContentBlockType = (types: DOMStringList | readonly string[]) =>
    Array.from(types).indexOf("application/content-block") >= 0;

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (hasContentBlockType(e.dataTransfer.types)) {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "copy";
        onActivate(index);
      }
    },
    [index, onActivate]
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      if (hasContentBlockType(e.dataTransfer.types)) {
        e.preventDefault();
        e.stopPropagation();
        onActivate(index);
      }
    },
    [index, onActivate]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const { clientX, clientY } = e;
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        onDeactivate();
      }
    },
    [onDeactivate]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onDeactivate();
      const data = e.dataTransfer.getData("application/content-block");
      if (!data) return;
      try {
        const { templateId, categoryId } = JSON.parse(data);
        const resolved = resolveTemplateDropData(templateId, categoryId);
        if (!resolved) {
          onQuizGenerator?.();
          return;
        }
        onDrop(index, resolved.type, resolved.variant);
      } catch {}
    },
    [index, onDrop, onDeactivate, onQuizGenerator]
  );

  return (
    <div
      className={cn(
        "relative transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isActive ? "py-4" : "py-1"
      )}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={cn(
          "flex items-center gap-2 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isActive ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
      >
        <div className="flex-1 h-[2px] rounded-full bg-primary/60" />
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20">
          <Plus className="w-3 h-3" />
        </div>
        <div className="flex-1 h-[2px] rounded-full bg-primary/60" />
      </div>
    </div>
  );
}
