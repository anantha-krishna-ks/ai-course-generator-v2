import { useState } from "react";
import { Type, ImageIcon, Video, Mic, FileText, MessageCircleQuestion, Sparkles, HelpCircle } from "lucide-react";
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
  onAddBlock: (type: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description", variant?: string) => void;
  onOpenQuizGenerator?: () => void;
}

function TemplateCard({ label, preview, onClick }: { label: string; preview: React.ReactNode; onClick: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onClick}
        className="w-full rounded-xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-md transition-all duration-250 p-5 min-h-[90px] flex flex-col justify-center group/card"
      >
        {preview}
      </button>
      <span className="text-[11px] font-medium text-muted-foreground tracking-wide">
        {label}
      </span>
    </div>
  );
}

const categories: BlockCategory[] = [
  {
    id: "text",
    label: "TEXT",
    icon: Type,
    templates: [
      {
        id: "heading-text",
        label: "Heading and text",
        preview: (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground/80">Heading</p>
            <div className="space-y-1.5">
              <p className="text-[11px] leading-relaxed text-muted-foreground/70">
                Employee-generated Learning empowers experts to create learning content using their own knowledge and expertise.
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "text-only",
        label: "Text",
        preview: (
          <div className="space-y-1.5 py-2">
            <p className="text-[11px] leading-relaxed text-muted-foreground/70">
              Employee-generated Learning empowers experts to create learning content using their own knowledge and expertise as a source of input for e-learning.
            </p>
          </div>
        ),
      },
      {
        id: "two-columns",
        label: "Two columns",
        preview: (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-foreground/80">Heading</p>
              <p className="text-[10px] leading-relaxed text-muted-foreground/60">
                Employee-generated Learning enables employees to learn from each other.
              </p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-foreground/80">Heading</p>
              <p className="text-[10px] leading-relaxed text-muted-foreground/60">
                Employee-generated Learning enables employees to learn from each other.
              </p>
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: "image",
    label: "IMAGES",
    icon: ImageIcon,
    templates: [
      {
        id: "image-full",
        label: "Single image",
        preview: (
          <div className="w-full h-20 rounded-lg overflow-hidden">
            <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=200&fit=crop" alt="Mountain peak" className="w-full h-full object-cover" />
          </div>
        ),
      },
      {
        id: "image-top",
        label: "Image on the top",
        preview: (
          <div className="space-y-2.5">
            <div className="w-full h-20 rounded-lg overflow-hidden">
              <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=200&fit=crop" alt="Mountain peak" className="w-full h-full object-cover" />
            </div>
            <p className="text-[10px] leading-relaxed text-muted-foreground/60 text-center">
              Employee-generated Learning enables employees learn from each other.
            </p>
          </div>
        ),
      },
      {
        id: "image-bottom",
        label: "Image on the bottom",
        preview: (
          <div className="space-y-2.5">
            <p className="text-[10px] leading-relaxed text-muted-foreground/60 text-center">
              Employee-generated Learning enables employees learn from each other.
            </p>
            <div className="w-full h-20 rounded-lg overflow-hidden">
              <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=200&fit=crop" alt="Mountain peak" className="w-full h-full object-cover" />
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: "video",
    label: "VIDEO",
    icon: Video,
    templates: [
      {
        id: "video-upload",
        label: "Video upload",
        preview: (
          <div className="w-full h-20 bg-muted/40 rounded-lg border border-dashed border-border/60 flex items-center justify-center gap-2">
            <Video className="w-6 h-6 text-muted-foreground/25" />
          </div>
        ),
      },
    ],
  },
  {
    id: "audio",
    label: "AUDIO",
    icon: Mic,
    templates: [
      {
        id: "audio-upload",
        label: "Audio upload",
        preview: (
          <div className="w-full h-16 bg-muted/40 rounded-lg border border-dashed border-border/60 flex items-center justify-center gap-2">
            <Mic className="w-6 h-6 text-muted-foreground/25" />
          </div>
        ),
      },
    ],
  },
  {
    id: "doc",
    label: "DOC",
    icon: FileText,
    templates: [
      {
        id: "doc-upload",
        label: "Document upload",
        preview: (
          <div className="w-full h-16 bg-muted/40 rounded-lg border border-dashed border-border/60 flex items-center justify-center gap-2">
            <FileText className="w-6 h-6 text-muted-foreground/25" />
          </div>
        ),
      },
    ],
  },
  {
    id: "quiz",
    label: "QUESTION / QUIZ",
    icon: MessageCircleQuestion,
    templates: [
      {
        id: "question-block",
        label: "Question",
        preview: (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 mb-1">
              <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/40" />
              <p className="text-[11px] font-medium text-foreground/70">Add a question</p>
            </div>
            <div className="space-y-2 pl-1">
              {["Option A", "Option B", "Option C"].map((opt) => (
                <div key={opt} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-[1.5px] border-muted-foreground/25 shrink-0" />
                  <span className="text-[10px] text-muted-foreground/60">{opt}</span>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        id: "quiz-generate",
        label: "Quiz",
        preview: (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-primary/50" />
              <p className="text-[11px] font-medium text-foreground/70">Generate quiz with AI</p>
            </div>
            <div className="space-y-1.5 pl-1">
              <div className="flex items-center gap-2">
                <div className="w-full h-2 rounded-full bg-primary/10" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3/4 h-2 rounded-full bg-primary/10" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5/6 h-2 rounded-full bg-primary/10" />
              </div>
            </div>
          </div>
        ),
      },
    ],
  },
];

export function ContentBlocksPanel({ onAddBlock, onOpenQuizGenerator }: ContentBlocksPanelProps) {
  const [activeCategory, setActiveCategory] = useState("text");
  const activeCat = categories.find((c) => c.id === activeCategory)!;

  const handleTemplateClick = (templateId: string) => {
    // Quiz generate opens the dialog instead of adding a block
    if (templateId === "quiz-generate") {
      onOpenQuizGenerator?.();
      return;
    }
    if (templateId === "question-block") {
      onAddBlock("quiz", templateId);
      return;
    }
    // Image + description composite templates
    if (templateId === "image-top") {
      onAddBlock("image-description", "image-top");
      return;
    }
    if (templateId === "image-bottom") {
      onAddBlock("image-description", "image-bottom");
      return;
    }
    const typeMap: Record<string, "text" | "image" | "video" | "audio" | "doc"> = {
      text: "text", image: "image", video: "video", audio: "audio", doc: "doc",
    };
    onAddBlock(typeMap[activeCategory] || "text", templateId);
  };

  return (
    <div className="flex h-full -m-4">
      {/* Icon side nav */}
      <div className="flex flex-col items-center gap-2 py-4 px-1.5 border-r border-border/40 shrink-0">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200",
                isActive
                  ? "bg-muted shadow-sm text-foreground"
                  : "text-muted-foreground/70 hover:text-muted-foreground hover:bg-muted/50"
              )}
              title={cat.label}
            >
              <Icon className={cn("w-5 h-5", isActive && "w-[22px] h-[22px]")} />
            </button>
          );
        })}
      </div>

      {/* Templates content */}
      <div className="flex-1 overflow-y-auto thin-scrollbar">
        {/* Category header with line */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <span className="text-xs font-semibold text-primary tracking-[0.15em] whitespace-nowrap">
            {activeCat.label}
          </span>
          <div className="flex-1 h-px bg-border/60" />
        </div>

        {/* Template cards */}
        <div className="px-4 pb-4 space-y-5">
          {activeCat.templates.map((tpl) => (
            <TemplateCard
              key={tpl.id}
              label={tpl.label}
              preview={tpl.preview}
              onClick={() => handleTemplateClick(tpl.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
