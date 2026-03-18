import { useState, useRef, useEffect } from "react";
import { Plus, Type, Image, Sparkles, Video, Mic, FileText, MessageCircleQuestion, MoreHorizontal, Send, X } from "lucide-react";
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
  onDropBlock?: (type: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description", variant?: string) => void;
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
  aiEnabled = false,
  variant = "simple",
  forceOpen = false,
}: AddContentButtonProps) {
  const isFullToolbar = variant === "full";
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
    <Popover open={forceOpen || undefined}>
      <PopoverTrigger asChild>
        <div className="group/add flex items-center justify-center my-2 cursor-pointer" data-tour="text-toolbar">
          <div className={cn("flex-1 h-px bg-foreground/15 transition-opacity duration-200", forceOpen ? "opacity-100" : "opacity-0 group-hover/add:opacity-100")} />
          <div className={cn("mx-3 w-7 h-7 rounded-full border border-foreground/20 flex items-center justify-center bg-background/50 hover:bg-background hover:border-primary/50 hover:scale-110 transition-all duration-200", forceOpen ? "opacity-100" : "opacity-0 group-hover/add:opacity-100")}>
            <Plus className="w-3.5 h-3.5 text-foreground/40" />
          </div>
          <div className={cn("flex-1 h-px bg-foreground/15 transition-opacity duration-200", forceOpen ? "opacity-100" : "opacity-0 group-hover/add:opacity-100")} />
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        sideOffset={8}
        className="w-auto p-0 rounded-2xl border border-border/60 bg-background/95 backdrop-blur-sm shadow-lg animate-fade-in"
      >
        {isFullToolbar ? (
          <div className="flex items-center gap-0.5 px-2 py-2">
            <div className="rounded-2xl border border-border/60 bg-muted/20 backdrop-blur-sm px-2 sm:px-4 py-2 sm:py-2.5 flex items-center flex-1 justify-evenly gap-0.5 shadow-sm flex-nowrap">
              {aiEnabled && (
                <button
                  onClick={onAICreate}
                  className="relative gap-1.5 sm:gap-2 text-xs sm:text-[13px] h-8 sm:h-9 rounded-full px-3 sm:px-4 flex items-center font-medium text-foreground/90 hover:bg-primary/5 transition-colors duration-200"
                >
                  <span
                    className="absolute inset-0 rounded-full p-[1.5px]"
                    style={{
                      background: 'linear-gradient(135deg, hsl(217, 91%, 70%), hsl(280, 65%, 65%), hsl(217, 91%, 55%))',
                    }}
                  >
                    <span className="block w-full h-full rounded-full bg-background" />
                  </span>
                  <Sparkles className="w-3.5 sm:w-4 h-3.5 sm:h-4 relative" />
                  <span className="relative hidden sm:inline">Create with AI</span>
                  <span className="relative sm:hidden">AI</span>
                </button>
              )}
              <Button variant="ghost" className="gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-[13px] h-8 sm:h-9 rounded-full hover:text-foreground hover:bg-foreground/5 px-2.5 sm:px-4 transition-all duration-200" onClick={onAddText}>
                <Type className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                <span className="hidden sm:inline">Text</span>
              </Button>
              <Button variant="ghost" className="gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-[13px] h-8 sm:h-9 rounded-full hover:text-foreground hover:bg-foreground/5 px-2.5 sm:px-4 transition-all duration-200" onClick={onAddImage}>
                <Image className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                <span className="hidden sm:inline">Image</span>
              </Button>
              <Button variant="ghost" className="gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-[13px] h-8 sm:h-9 rounded-full hover:text-foreground hover:bg-foreground/5 px-2.5 sm:px-4 transition-all duration-200" onClick={onAddVideo}>
                <Video className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                <span className="hidden sm:inline">Video</span>
              </Button>
              <Button variant="ghost" className="gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-[13px] h-8 sm:h-9 rounded-full hover:text-foreground hover:bg-foreground/5 px-2.5 sm:px-4 transition-all duration-200" onClick={onAddDoc}>
                <FileText className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                <span className="hidden sm:inline">Doc</span>
              </Button>
            </div>
            {onMore && (
              <button
                onClick={onMore}
                className="rounded-2xl border border-dashed border-border/60 bg-muted/10 backdrop-blur-sm self-stretch px-3 sm:px-4 shadow-sm shrink-0 flex items-center gap-1.5 text-muted-foreground text-xs sm:text-[13px] hover:text-foreground hover:border-primary/30 hover:bg-muted/30 transition-all duration-200 cursor-pointer"
              >
                <MoreHorizontal className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                <span className="hidden sm:inline">More</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-0.5 p-1.5">
            <button
              onClick={onAddText}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
            >
              <Type className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-border" />
            <button
              onClick={onAddImage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
            >
              <Image className="w-4 h-4" />
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
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Generate {showAiPrompt === "text" ? "text" : "image"} with AI
            </span>
          </div>
          <button
            onClick={() => { setShowAiPrompt(null); setAiPrompt(""); setAiGenerating(false); }}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="px-4 py-3">
          {aiGenerating ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3 animate-fade-in rounded-xl bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary animate-pulse" />
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
