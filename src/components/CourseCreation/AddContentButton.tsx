import { useState, useRef, useEffect } from "react";
import { Plus, Type, Image, Sparkles, Video, Mic, FileText, MessageCircleQuestion, MoreHorizontal, Send, X } from "lucide-react";
import { AISparkles } from "@/components/ui/ai-sparkles";
import { resolveTemplateDropData } from "./ContentBlocksPanel";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface AddContentButtonProps {
  onAddText: () => void;
  onAddImage?: () => void;
  onAddVideo?: () => void;
  onAddAudio?: () => void;
  onAddDoc?: () => void;
  onAddQuiz?: () => void;
  onAICreate?: () => void;
  onAIGenerateText?: (prompt: string) => void;
  onAIGenerateImage?: (prompt: string) => void;
  onMore?: () => void;
  onDropBlock?: (type: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description" | "video-description", variant?: string) => void;
  onOpenQuizGenerator?: () => void;
  aiEnabled?: boolean;
  variant?: "simple" | "full";
  forceOpen?: boolean;
}

export function AddContentButton({
  onAddText,
  onAddImage,
  onAddVideo,
  onAddAudio,
  onAddDoc,
  onAddQuiz,
  onAICreate,
  onAIGenerateText,
  onAIGenerateImage,
  onMore,
  onDropBlock,
  onOpenQuizGenerator,
  aiEnabled = false,
  variant = "simple",
  forceOpen = false,
}: AddContentButtonProps) {
  const isFullToolbar = variant === "full";
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showAiPrompt, setShowAiPrompt] = useState<"text" | "image" | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (showAiPrompt && promptRef.current) {
      setTimeout(() => promptRef.current?.focus(), 100);
    }
  }, [showAiPrompt]);

  const handleAiSubmit = () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    if (showAiPrompt === "text") {
      onAIGenerateText?.(aiPrompt);
    } else if (showAiPrompt === "image") {
      onAIGenerateImage?.(aiPrompt);
    }
    // Simulate completion after parent handles it
    setTimeout(() => {
      setAiGenerating(false);
      setAiPrompt("");
      setShowAiPrompt(null);
    }, 3000);
  };

  return (
    <>
    <Popover open={forceOpen || undefined} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "group/add flex items-center justify-center my-2 cursor-pointer transition-all duration-200",
            isDragOver && "my-4"
          )}
          data-tour="text-toolbar"
          onDragOver={(e) => {
            if (Array.from(e.dataTransfer.types).indexOf("application/content-block") >= 0) {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = "copy";
              setIsDragOver(true);
            }
          }}
          onDragEnter={(e) => {
            if (Array.from(e.dataTransfer.types).indexOf("application/content-block") >= 0) {
              e.preventDefault();
              e.stopPropagation();
              setIsDragOver(true);
            }
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);
            const data = e.dataTransfer.getData("application/content-block");
            if (!data) return;
            try {
              const { templateId, categoryId } = JSON.parse(data);
              const resolved = resolveTemplateDropData(templateId, categoryId);
              if (!resolved) {
                onOpenQuizGenerator?.();
                return;
              }
              onDropBlock?.(resolved.type, resolved.variant);
            } catch {}
          }}
        >
          <div className={cn(
            "flex-1 h-px transition-all duration-200",
            isDragOver ? "bg-primary/50 opacity-100" : "bg-foreground/15",
            !isDragOver && !forceOpen && !isPopoverOpen && "opacity-0 group-hover/add:opacity-100",
            (forceOpen || isPopoverOpen) && "opacity-100"
          )} />
          <div className={cn(
            "mx-3 rounded-full border flex items-center justify-center bg-background/50 hover:bg-background hover:border-primary/50 hover:scale-110 transition-all duration-200",
            isDragOver
              ? "w-9 h-9 border-primary border-dashed bg-primary/5 scale-110 opacity-100"
              : "w-7 h-7 border-foreground/20",
            !isDragOver && !forceOpen && !isPopoverOpen && "opacity-0 group-hover/add:opacity-100",
            (forceOpen || isPopoverOpen) && "opacity-100"
          )}>
            <Plus className={cn("transition-all duration-200", isDragOver ? "w-4 h-4 text-primary" : "w-3.5 h-3.5 text-foreground/40")} />
          </div>
          <div className={cn(
            "flex-1 h-px transition-all duration-200",
            isDragOver ? "bg-primary/50 opacity-100" : "bg-foreground/15",
            !isDragOver && !forceOpen && !isPopoverOpen && "opacity-0 group-hover/add:opacity-100",
            (forceOpen || isPopoverOpen) && "opacity-100"
          )} />
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        sideOffset={8}
        className="w-auto p-0 rounded-2xl border border-border/60 bg-background/95 backdrop-blur-sm shadow-lg animate-fade-in"
        align="center"
      >
        {isFullToolbar ? (
          <div className="flex items-center gap-1 px-2 py-2 w-full">
            <div className="rounded-2xl border border-border/60 bg-muted/20 backdrop-blur-sm px-3 md:px-5 py-2.5 flex items-center flex-1 justify-evenly gap-1 md:gap-2 shadow-sm flex-nowrap min-w-0">
              <Button variant="ghost" className="gap-1.5 md:gap-2 text-muted-foreground text-xs md:text-[13px] h-8 md:h-9 rounded-full hover:text-foreground hover:bg-foreground/5 px-2.5 md:px-4 transition-all duration-200" onClick={onAddText}>
                <Type className="w-3.5 md:w-4 h-3.5 md:h-4" />
                <span>Text</span>
              </Button>
              <Button variant="ghost" className="gap-1.5 md:gap-2 text-muted-foreground text-xs md:text-[13px] h-8 md:h-9 rounded-full hover:text-foreground hover:bg-foreground/5 px-2.5 md:px-4 transition-all duration-200" onClick={onAddImage}>
                <Image className="w-3.5 md:w-4 h-3.5 md:h-4" />
                <span>Image</span>
              </Button>
              <Button variant="ghost" className="gap-1.5 md:gap-2 text-muted-foreground text-xs md:text-[13px] h-8 md:h-9 rounded-full hover:text-foreground hover:bg-foreground/5 px-2.5 md:px-4 transition-all duration-200" onClick={onAddVideo}>
                <Video className="w-3.5 md:w-4 h-3.5 md:h-4" />
                <span>Video</span>
              </Button>
              <Button variant="ghost" className="gap-1.5 md:gap-2 text-muted-foreground text-xs md:text-[13px] h-8 md:h-9 rounded-full hover:text-foreground hover:bg-foreground/5 px-2.5 md:px-4 transition-all duration-200" onClick={onAddDoc}>
                <FileText className="w-3.5 md:w-4 h-3.5 md:h-4" />
                <span>Doc</span>
              </Button>
            </div>
            {onMore && (
              <button
                onClick={onMore}
                className="rounded-2xl border border-dashed border-border/60 bg-muted/10 backdrop-blur-sm self-stretch px-3 md:px-4 shadow-sm shrink-0 flex items-center gap-1.5 text-muted-foreground text-xs md:text-[13px] hover:text-foreground hover:border-primary/30 hover:bg-muted/30 transition-all duration-200 cursor-pointer"
              >
                <MoreHorizontal className="w-3.5 md:w-4 h-3.5 md:h-4" />
                <span className="hidden md:inline">More</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1 p-1.5">
            <button
              onClick={onAddText}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200"
            >
              <Type className="w-3.5 h-3.5" />
              <span>Text</span>
            </button>
            <div className="w-px h-4 bg-border/60" />
            <button
              onClick={onAddImage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200"
            >
              <Image className="w-3.5 h-3.5" />
              <span>Image</span>
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>

    {/* AI Generate Prompt Dialog for simple variant */}
    {showAiPrompt && (
      <div className="my-2 rounded-xl border border-border bg-card shadow-sm animate-fade-in">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <AISparkles className="w-4 h-4" />
            <span className="text-sm font-medium text-foreground">
              Generate {showAiPrompt === "text" ? "text" : "image"} with AI
            </span>
          </div>
           <button
            onClick={() => { setShowAiPrompt(null); setAiPrompt(""); setAiGenerating(false); }}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
            aria-label="Close AI prompt"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="px-4 py-3">
          {aiGenerating ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3 animate-fade-in rounded-xl bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <AISparkles className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-primary animate-pulse">
                {showAiPrompt === "text" ? "Generating text content..." : "Generating image..."}
              </p>
              <p className="text-xs text-muted-foreground">This may take a moment</p>
            </div>
          ) : (
            <>
              <div className="flex items-end gap-2 rounded-2xl border border-border/80 bg-background px-4 py-2 focus-within:border-foreground/30 transition-colors">
                <textarea
                  ref={promptRef}
                  value={aiPrompt}
                  onChange={(e) => {
                    setAiPrompt(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && aiPrompt.trim()) {
                      e.preventDefault();
                      handleAiSubmit();
                    }
                  }}
                  placeholder={
                    showAiPrompt === "text"
                      ? "e.g., Write an introduction about cybersecurity best practices..."
                      : "e.g., A modern illustration of cloud computing architecture..."
                  }
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none resize-none min-h-[28px] max-h-[120px] py-1"
                  rows={1}
                />
                <button
                  onClick={handleAiSubmit}
                  disabled={!aiPrompt.trim()}
                  className={cn(
                    "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center transition-colors mb-0.5",
                    aiPrompt.trim()
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground/50 mt-2 px-1">
                Press Enter to generate · Shift+Enter for new line
              </p>
            </>
          )}
        </div>
      </div>
    )}
    </>
  );
}
