import { Plus, Type, Image, Sparkles, Video, Mic, FileText, MessageSquare } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface AddContentButtonProps {
  onAddText: () => void;
  onAddImage?: () => void;
  onAddVideo?: () => void;
  onAddAudio?: () => void;
  onAddDoc?: () => void;
  onAddQuiz?: () => void;
  onAICreate?: () => void;
  aiEnabled?: boolean;
  variant?: "simple" | "full";
}

export function AddContentButton({
  onAddText,
  onAddImage,
  onAddVideo,
  onAddAudio,
  onAddDoc,
  onAddQuiz,
  onAICreate,
  aiEnabled = false,
  variant = "simple",
}: AddContentButtonProps) {
  const isFullToolbar = variant === "full";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="group/add flex items-center justify-center -my-1 cursor-pointer">
          <div className="flex-1 h-px bg-foreground/15 opacity-0 group-hover/add:opacity-100 transition-opacity duration-200" />
          <div className="mx-3 w-7 h-7 rounded-full border border-foreground/20 flex items-center justify-center bg-background/50 hover:bg-background hover:border-primary/50 hover:scale-110 transition-all duration-200 opacity-0 group-hover/add:opacity-100">
            <Plus className="w-3.5 h-3.5 text-foreground/40" />
          </div>
          <div className="flex-1 h-px bg-foreground/15 opacity-0 group-hover/add:opacity-100 transition-opacity duration-200" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        sideOffset={8}
        className={
          isFullToolbar
            ? "w-auto p-2 rounded-2xl border border-border/60 bg-background/95 backdrop-blur-sm shadow-lg animate-fade-in"
            : "w-auto p-1.5 flex items-center gap-0.5 rounded-lg border border-border bg-background shadow-lg animate-fade-in"
        }
      >
        {isFullToolbar ? (
          <div className="flex flex-wrap items-center justify-center gap-1">
            {aiEnabled && (
              <button
                onClick={onAICreate}
                className="relative gap-1.5 text-xs h-8 rounded-full px-3 flex items-center font-medium text-foreground/90 hover:bg-primary/5 transition-colors duration-200"
              >
                <span
                  className="absolute inset-0 rounded-full p-[1.5px]"
                  style={{
                    background: 'linear-gradient(135deg, hsl(217, 91%, 70%), hsl(280, 65%, 65%), hsl(217, 91%, 55%))',
                  }}
                >
                  <span className="block w-full h-full rounded-full bg-background" />
                </span>
                <Sparkles className="w-3.5 h-3.5 relative" />
                <span className="relative">AI</span>
              </button>
            )}
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground text-xs h-8 rounded-full hover:text-foreground hover:bg-foreground/5 px-3 transition-all duration-200" onClick={onAddText}>
              <Type className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Text</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground text-xs h-8 rounded-full hover:text-foreground hover:bg-foreground/5 px-3 transition-all duration-200" onClick={onAddImage}>
              <Image className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Image</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground text-xs h-8 rounded-full hover:text-foreground hover:bg-foreground/5 px-3 transition-all duration-200" onClick={onAddVideo}>
              <Video className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Video</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground text-xs h-8 rounded-full hover:text-foreground hover:bg-foreground/5 px-3 transition-all duration-200" onClick={onAddAudio}>
              <Mic className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Audio</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground text-xs h-8 rounded-full hover:text-foreground hover:bg-foreground/5 px-3 transition-all duration-200" onClick={onAddDoc}>
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Doc</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground text-xs h-8 rounded-full hover:text-foreground hover:bg-foreground/5 px-3 transition-all duration-200" onClick={onAddQuiz}>
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quiz</span>
            </Button>
          </div>
        ) : (
          <>
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
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
