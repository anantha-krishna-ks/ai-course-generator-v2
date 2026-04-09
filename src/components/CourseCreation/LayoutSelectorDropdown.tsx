import { ChevronDown, Layers, FileStack } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { AIOptions } from "@/components/Dashboard/AIOptionsPanel";

/** Shared state that gets transferred when switching layouts */
export interface LayoutTransferState {
  title: string;
  items: Array<{
    id: string;
    type: "section" | "page" | "question";
    title: string;
    inclusions?: string;
    exclusions?: string;
    thumbnailUrl?: string;
    children?: Array<{
      id: string;
      type: "section" | "page" | "question";
      title: string;
      inclusions?: string;
      exclusions?: string;
      thumbnailUrl?: string;
    }>;
  }>;
  contentBlocks: Array<{
    id: string;
    type: string;
    content: string;
  }>;
  pageBlocksMap: Record<string, Array<{
    id: string;
    type: string;
    content: string;
  }>>;
  sectionObjectivesMap?: Record<string, string>;
  sectionImages?: Record<string, string | null>;
  aiOptions: AIOptions | null;
}

interface LayoutSelectorDropdownProps {
  currentLayout: "multi-page" | "single-page";
  title: string;
  aiOptions?: AIOptions | null;
  transferState?: LayoutTransferState | null;
}

function MultiPageIllustration() {
  return (
    <svg width="100" height="72" viewBox="0 0 100 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0" aria-hidden="true" focusable="false" role="presentation">
      {/* Card background */}
      <rect x="4" y="4" width="92" height="64" rx="4" className="fill-muted/50 stroke-border" strokeWidth="1" />
      {/* Logo placeholder */}
      <rect x="12" y="10" width="20" height="6" rx="2" className="fill-muted-foreground/20" />
      <text x="14" y="14.5" className="fill-muted-foreground/40" fontSize="4" fontFamily="sans-serif">logo</text>
      {/* Title */}
      <rect x="12" y="20" width="40" height="5" rx="1.5" className="fill-primary/30" />
      <text x="14" y="23.5" className="fill-primary/60" fontSize="4" fontWeight="bold" fontFamily="sans-serif">Course Title</text>
      {/* Content lines */}
      <rect x="12" y="30" width="76" height="2.5" rx="1" className="fill-muted-foreground/15" />
      <rect x="12" y="35" width="60" height="2.5" rx="1" className="fill-muted-foreground/15" />
      <rect x="12" y="40" width="70" height="2.5" rx="1" className="fill-muted-foreground/15" />
      {/* Page separators */}
      <line x1="12" y1="48" x2="88" y2="48" className="stroke-border" strokeWidth="0.5" strokeDasharray="2 2" />
      <rect x="12" y="52" width="50" height="2.5" rx="1" className="fill-muted-foreground/15" />
      <rect x="12" y="57" width="65" height="2.5" rx="1" className="fill-muted-foreground/15" />
    </svg>
  );
}

function SinglePageIllustration() {
  return (
    <svg width="100" height="72" viewBox="0 0 100 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0" aria-hidden="true" focusable="false" role="presentation">
      {/* Card background */}
      <rect x="4" y="4" width="92" height="64" rx="4" className="fill-muted/50 stroke-border" strokeWidth="1" />
      {/* Logo placeholder */}
      <rect x="12" y="10" width="20" height="6" rx="2" className="fill-muted-foreground/20" />
      <text x="14" y="14.5" className="fill-muted-foreground/40" fontSize="4" fontFamily="sans-serif">logo</text>
      {/* Title */}
      <rect x="12" y="20" width="40" height="5" rx="1.5" className="fill-primary/30" />
      <text x="14" y="23.5" className="fill-primary/60" fontSize="4" fontWeight="bold" fontFamily="sans-serif">Course Title</text>
      {/* Content block */}
      <rect x="12" y="30" width="76" height="32" rx="2" className="fill-primary/8 stroke-primary/20" strokeWidth="0.5" />
      <rect x="18" y="36" width="64" height="2.5" rx="1" className="fill-muted-foreground/15" />
      <rect x="18" y="41" width="50" height="2.5" rx="1" className="fill-muted-foreground/15" />
      <rect x="18" y="46" width="58" height="2.5" rx="1" className="fill-muted-foreground/15" />
      <rect x="18" y="51" width="40" height="2.5" rx="1" className="fill-muted-foreground/15" />
    </svg>
  );
}

export function LayoutSelectorDropdown({ currentLayout, title, aiOptions, transferState }: LayoutSelectorDropdownProps) {
  const navigate = useNavigate();

  const handleSelect = (layout: "multi-page" | "single-page") => {
    if (layout === currentLayout) return;
    
    const state: Record<string, unknown> = { 
      title, 
      layout, 
      aiOptions: aiOptions?.enabled ? aiOptions : null,
    };

    // Pass transfer state for data preservation
    if (transferState) {
      state.restoreState = {
        ...transferState,
        title,
      };
    }

    if (layout === "multi-page") {
      navigate("/create-course-multipage", { state });
    } else {
      navigate("/create-course-singlepage", { state });
    }
  };

  const isMulti = currentLayout === "multi-page";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 text-xs font-medium text-foreground transition-colors rounded-md px-3 py-1.5 border border-border bg-muted/50 hover:bg-muted w-fit shadow-sm">
          {isMulti ? (
            <Layers className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" focusable="false" />
          ) : (
            <FileStack className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" focusable="false" />
          )}
          {isMulti ? "Multi-page layout" : "Single-page layout"}
          <ChevronDown className="w-3 h-3 text-muted-foreground" aria-hidden="true" focusable="false" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[420px] p-3 space-y-2">
        {/* Multi-page option */}
        <button
          onClick={() => handleSelect("multi-page")}
          className={cn(
            "w-full flex items-center gap-4 rounded-lg border p-4 text-left transition-all duration-200",
            isMulti
              ? "border-primary/40 bg-primary/5"
              : "border-border hover:border-primary/30 hover:bg-muted/30"
          )}
        >
          <div className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
            isMulti ? "border-primary" : "border-muted-foreground/30"
          )}>
            {isMulti && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Multi-page layout</p>
            <p className="text-xs text-muted-foreground mt-0.5">A full-length course, covering multiple topics</p>
          </div>
          <MultiPageIllustration />
        </button>

        {/* Single-page option */}
        <button
          onClick={() => handleSelect("single-page")}
          className={cn(
            "w-full flex items-center gap-4 rounded-lg border p-4 text-left transition-all duration-200",
            !isMulti
              ? "border-primary/40 bg-primary/5"
              : "border-border hover:border-primary/30 hover:bg-muted/30"
          )}
        >
          <div className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
            !isMulti ? "border-primary" : "border-muted-foreground/30"
          )}>
            {!isMulti && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Single-page layout</p>
            <p className="text-xs text-muted-foreground mt-0.5">A short, focused course designed for quick learning</p>
          </div>
          <SinglePageIllustration />
        </button>
      </PopoverContent>
    </Popover>
  );
}
