import { useState, useCallback } from "react";
import { Video } from "lucide-react";
import { MediaUploadBlock } from "./MediaUploadBlock";
import { cn } from "@/lib/utils";

interface VideoDescriptionData {
  layout: "video-left" | "video-right";
  videoUrl: string;
  description: string;
}

interface VideoDescriptionBlockProps {
  content: string;
  onChange: (content: string) => void;
}

function parseContent(content: string): VideoDescriptionData {
  try {
    const parsed = JSON.parse(content);
    return {
      layout: parsed.layout || "video-left",
      videoUrl: parsed.videoUrl || "",
      description: parsed.description || "",
    };
  } catch {
    return { layout: "video-left", videoUrl: "", description: "" };
  }
}

export function VideoDescriptionBlock({ content, onChange }: VideoDescriptionBlockProps) {
  const data = parseContent(content);

  const updateField = useCallback(
    (field: keyof VideoDescriptionData, value: string) => {
      const current = parseContent(content);
      onChange(JSON.stringify({ ...current, [field]: value }));
    },
    [content, onChange]
  );

  const hasDescription =
    data.description &&
    data.description !== "<p></p>" &&
    data.description.replace(/<[^>]*>/g, "").trim() !== "";

  const videoSection = (
    <div className="flex-1 min-w-0">
      <MediaUploadBlock
        type="video"
        fileUrl={data.videoUrl}
        onChange={(url) => updateField("videoUrl", url)}
      />
    </div>
  );

  const textSection = (
    <div className="flex-1 min-w-0 flex">
      <textarea
        value={data.description}
        onChange={(e) => {
          updateField("description", e.target.value);
        }}
        placeholder="Add a description..."
        className="w-full h-full rounded-lg border border-transparent hover:border-foreground/20 focus:border-foreground/20 bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none transition-colors"
      />
    </div>
  );

  const isLeft = data.layout === "video-left";

  return (
    <div className="rounded-xl border border-border/60 bg-card/50 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Layout indicator */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/40 bg-muted/20">
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            <div className={cn(
              "w-2 h-3 rounded-[2px]",
              isLeft ? "bg-primary/40" : "bg-muted-foreground/25"
            )} />
            <div className={cn(
              "w-2 h-3 rounded-[2px]",
              isLeft ? "bg-muted-foreground/25" : "bg-primary/40"
            )} />
          </div>
          <span className="text-[11px] font-medium text-muted-foreground tracking-wide">
            {isLeft ? "Video + Description" : "Description + Video"}
          </span>
        </div>
      </div>

      {/* Content area — side by side */}
      <div className="p-4">
        <div className="flex gap-4 items-stretch">
          {isLeft ? (
            <>
              {videoSection}
              {textSection}
            </>
          ) : (
            <>
              {textSection}
              {videoSection}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
