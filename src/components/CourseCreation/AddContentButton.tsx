import { Plus, Type, Image } from "lucide-react";
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

interface AddContentButtonProps {
  onAddText: () => void;
  onAddImage?: () => void;
}

export function AddContentButton({ onAddText, onAddImage }: AddContentButtonProps) {
  return (
    <div className="group/add flex items-center justify-center py-1">
      <div className="flex-1 h-px bg-foreground/15 opacity-0 group-hover/add:opacity-100 transition-opacity duration-200" />
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button className="mx-3 w-7 h-7 rounded-full border border-foreground/20 flex items-center justify-center bg-background/50 hover:bg-background hover:border-primary/50 hover:scale-110 transition-all duration-200">
                <Plus className="w-3.5 h-3.5 text-foreground/40" />
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Add content
          </TooltipContent>
        </Tooltip>
        <PopoverContent
          side="top"
          sideOffset={8}
          className="w-auto p-1.5 flex items-center gap-0.5 rounded-lg border border-border bg-background shadow-lg animate-fade-in"
        >
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
        </PopoverContent>
      </Popover>
      <div className="flex-1 h-px bg-foreground/15 opacity-0 group-hover/add:opacity-100 transition-opacity duration-200" />
    </div>
  );
}
