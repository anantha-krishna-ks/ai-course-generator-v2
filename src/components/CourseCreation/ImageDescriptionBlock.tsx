import { useState, useCallback } from "react";
import { ImageBlock } from "./ImageBlock";
import { DescriptionEditor } from "./DescriptionEditor";
import { cn } from "@/lib/utils";

interface ImageDescriptionData {
  layout: "image-top" | "image-bottom" | "image-left" | "image-right";
  imageUrl: string;
  description: string;
}

interface ImageDescriptionBlockProps {
  content: string;
  onChange: (content: string) => void;
  aiEnabled?: boolean;
}

function parseContent(content: string): ImageDescriptionData {
  try {
    const parsed = JSON.parse(content);
    return {
      layout: parsed.layout || "image-top",
      imageUrl: parsed.imageUrl || "",
      description: parsed.description || "<p>Add a description here...</p>",
    };
  } catch {
    return { layout: "image-top", imageUrl: "", description: "<p>Add a description here...</p>" };
  }
}

export function ImageDescriptionBlock({ content, onChange, aiEnabled = false }: ImageDescriptionBlockProps) {
  const data = parseContent(content);
  const [isEditingText, setIsEditingText] = useState(false);

  const updateField = useCallback(
    (field: keyof ImageDescriptionData, value: string) => {
      const current = parseContent(content);
      onChange(JSON.stringify({ ...current, [field]: value }));
    },
    [content, onChange]
  );

  const hasDescription =
    data.description &&
    data.description !== "<p></p>" &&
    data.description.replace(/<[^>]*>/g, "").trim() !== "" &&
    data.description !== "<p>Add a description here...</p>";

  const imageSection = (
    <ImageBlock
      imageUrl={data.imageUrl}
      onChange={(url) => updateField("imageUrl", url)}
      aiEnabled={aiEnabled}
    />
  );

  const textSection = (
    <div className="px-1">
      {isEditingText ? (
        <DescriptionEditor
          content={data.description}
          onChange={(desc) => updateField("description", desc)}
        />
      ) : (
        <button
          onClick={() => setIsEditingText(true)}
          className="w-full text-left px-3 py-2.5 rounded-lg border border-transparent hover:border-foreground/20 hover:bg-muted/30 transition-all duration-200 cursor-text"
        >
          {hasDescription ? (
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-foreground/80"
              dangerouslySetInnerHTML={{ __html: data.description }}
            />
          ) : (
            <span className="text-sm text-muted-foreground/50 italic">
              Click to add a description...
            </span>
          )}
        </button>
      )}
    </div>
  );

  const isSideBySide = data.layout === "image-left" || data.layout === "image-right";

  const layoutLabels: Record<string, string> = {
    "image-top": "Image + Description",
    "image-bottom": "Description + Image",
    "image-left": "Image Left + Text Right",
    "image-right": "Text Left + Image Right",
  };

  const layoutIndicator = () => {
    if (data.layout === "image-left" || data.layout === "image-right") {
      return (
        <div className="flex gap-0.5">
          <div className={cn("w-2 h-3 rounded-[2px]", data.layout === "image-left" ? "bg-primary/40" : "bg-muted-foreground/25")} />
          <div className={cn("w-2 h-3 rounded-[2px]", data.layout === "image-right" ? "bg-primary/40" : "bg-muted-foreground/25")} />
        </div>
      );
    }
    if (data.layout === "image-top") {
      return (
        <div className="flex flex-col gap-0.5">
          <div className="w-4 h-1.5 rounded-[2px] bg-primary/40" />
          <div className="w-4 h-1 rounded-[2px] bg-muted-foreground/25" />
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-0.5">
        <div className="w-4 h-1 rounded-[2px] bg-muted-foreground/25" />
        <div className="w-4 h-1.5 rounded-[2px] bg-primary/40" />
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card/50 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Subtle layout indicator */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/40 bg-muted/20">
        <div className="flex items-center gap-1.5">
          {layoutIndicator()}
          <span className="text-[11px] font-medium text-muted-foreground tracking-wide">
            {layoutLabels[data.layout] || "Image + Description"}
          </span>
        </div>
      </div>

      {/* Content area */}
      <div className={cn("p-4", isSideBySide ? "flex gap-4 items-start" : "space-y-3")}>
        {data.layout === "image-top" || data.layout === "image-left" ? (
          <>
            <div className={isSideBySide ? "w-1/2 flex-shrink-0" : undefined}>{imageSection}</div>
            <div className={isSideBySide ? "w-1/2 min-w-0" : undefined}>{textSection}</div>
          </>
        ) : data.layout === "image-right" ? (
          <>
            <div className="w-1/2 min-w-0">{textSection}</div>
            <div className="w-1/2 flex-shrink-0">{imageSection}</div>
          </>
        ) : (
          <>
            {textSection}
            {imageSection}
          </>
        )}
      </div>
    </div>
  );
}
