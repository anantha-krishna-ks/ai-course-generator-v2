import { Type, ImageIcon, Video, Mic, FileText, Sparkles, Columns2, ListOrdered, Heading1, AlignLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlockTemplate {
  id: string;
  label: string;
  preview: React.ReactNode;
}

interface BlockCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  templates: BlockTemplate[];
}

interface ContentBlocksPanelProps {
  onAddBlock: (type: "text" | "image" | "video" | "audio" | "doc", variant?: string) => void;
}

function TemplateCard({ label, preview, onClick }: { label: string; preview: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left group/tpl"
    >
      <div className="rounded-lg border border-border/80 bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all duration-200 min-h-[80px] flex flex-col justify-center">
        {preview}
      </div>
      <p className="text-xs text-muted-foreground text-center mt-2 group-hover/tpl:text-foreground transition-colors">
        {label}
      </p>
    </button>
  );
}

function CategorySection({ category, onAddBlock }: { category: BlockCategory; onAddBlock: ContentBlocksPanelProps["onAddBlock"] }) {
  const Icon = category.icon;

  const handleTemplateClick = (templateId: string) => {
    const typeMap: Record<string, "text" | "image" | "video" | "audio" | "doc"> = {
      text: "text",
      image: "image",
      video: "video",
      audio: "audio",
      doc: "doc",
    };
    onAddBlock(typeMap[category.id] || "text", templateId);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-muted/60 border border-border/60 flex items-center justify-center">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{category.label}</span>
      </div>
      <div className="grid grid-cols-1 gap-3 pl-1">
        {category.templates.map((tpl) => (
          <TemplateCard
            key={tpl.id}
            label={tpl.label}
            preview={tpl.preview}
            onClick={() => handleTemplateClick(tpl.id)}
          />
        ))}
      </div>
    </div>
  );
}

const categories: BlockCategory[] = [
  {
    id: "text",
    label: "Text",
    icon: Type,
    templates: [
      {
        id: "heading-text",
        label: "Heading and text",
        preview: (
          <div className="space-y-2">
            <div className="h-3.5 w-24 bg-foreground/80 rounded-sm" />
            <div className="space-y-1.5">
              <div className="h-2 w-full bg-muted-foreground/20 rounded-sm" />
              <div className="h-2 w-[90%] bg-muted-foreground/20 rounded-sm" />
              <div className="h-2 w-[75%] bg-muted-foreground/20 rounded-sm" />
            </div>
          </div>
        ),
      },
      {
        id: "text-only",
        label: "Text",
        preview: (
          <div className="space-y-1.5">
            <div className="h-2 w-full bg-muted-foreground/20 rounded-sm" />
            <div className="h-2 w-[95%] bg-muted-foreground/20 rounded-sm" />
            <div className="h-2 w-[80%] bg-muted-foreground/20 rounded-sm" />
            <div className="h-2 w-[70%] bg-muted-foreground/20 rounded-sm" />
          </div>
        ),
      },
      {
        id: "two-columns",
        label: "Two columns",
        preview: (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="h-3 w-16 bg-foreground/80 rounded-sm" />
              <div className="h-2 w-full bg-muted-foreground/20 rounded-sm" />
              <div className="h-2 w-[85%] bg-muted-foreground/20 rounded-sm" />
              <div className="h-2 w-[70%] bg-muted-foreground/20 rounded-sm" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-16 bg-foreground/80 rounded-sm" />
              <div className="h-2 w-full bg-muted-foreground/20 rounded-sm" />
              <div className="h-2 w-[80%] bg-muted-foreground/20 rounded-sm" />
              <div className="h-2 w-[65%] bg-muted-foreground/20 rounded-sm" />
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: "image",
    label: "Image",
    icon: ImageIcon,
    templates: [
      {
        id: "image-full",
        label: "Full width image",
        preview: (
          <div className="w-full h-16 bg-muted/80 rounded-md border border-dashed border-border flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
          </div>
        ),
      },
      {
        id: "image-text",
        label: "Image with caption",
        preview: (
          <div className="space-y-2">
            <div className="w-full h-14 bg-muted/80 rounded-md border border-dashed border-border flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
            </div>
            <div className="h-2 w-[60%] bg-muted-foreground/20 rounded-sm mx-auto" />
          </div>
        ),
      },
    ],
  },
  {
    id: "video",
    label: "Video",
    icon: Video,
    templates: [
      {
        id: "video-upload",
        label: "Video upload",
        preview: (
          <div className="w-full h-16 bg-muted/80 rounded-md border border-dashed border-border flex items-center justify-center gap-2">
            <Video className="w-5 h-5 text-muted-foreground/40" />
            <span className="text-xs text-muted-foreground/40">Upload video</span>
          </div>
        ),
      },
    ],
  },
  {
    id: "audio",
    label: "Audio",
    icon: Mic,
    templates: [
      {
        id: "audio-upload",
        label: "Audio upload",
        preview: (
          <div className="w-full h-14 bg-muted/80 rounded-md border border-dashed border-border flex items-center justify-center gap-2">
            <Mic className="w-5 h-5 text-muted-foreground/40" />
            <span className="text-xs text-muted-foreground/40">Upload audio</span>
          </div>
        ),
      },
    ],
  },
  {
    id: "doc",
    label: "Document",
    icon: FileText,
    templates: [
      {
        id: "doc-upload",
        label: "Document upload",
        preview: (
          <div className="w-full h-14 bg-muted/80 rounded-md border border-dashed border-border flex items-center justify-center gap-2">
            <FileText className="w-5 h-5 text-muted-foreground/40" />
            <span className="text-xs text-muted-foreground/40">Upload document</span>
          </div>
        ),
      },
    ],
  },
  {
    id: "quiz",
    label: "Quiz",
    icon: Sparkles,
    templates: [
      {
        id: "quiz-block",
        label: "Quiz question",
        preview: (
          <div className="space-y-2">
            <div className="h-2.5 w-[70%] bg-foreground/60 rounded-sm" />
            <div className="space-y-1.5 pl-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-muted-foreground/30" />
                <div className="h-2 w-[60%] bg-muted-foreground/20 rounded-sm" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-muted-foreground/30" />
                <div className="h-2 w-[50%] bg-muted-foreground/20 rounded-sm" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-muted-foreground/30" />
                <div className="h-2 w-[55%] bg-muted-foreground/20 rounded-sm" />
              </div>
            </div>
          </div>
        ),
      },
    ],
  },
];

export function ContentBlocksPanel({ onAddBlock }: ContentBlocksPanelProps) {
  return (
    <div className="space-y-8">
      {categories.map((cat) => (
        <CategorySection key={cat.id} category={cat} onAddBlock={onAddBlock} />
      ))}
    </div>
  );
}
