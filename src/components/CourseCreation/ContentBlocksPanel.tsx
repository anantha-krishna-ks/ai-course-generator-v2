import { useState } from "react";
import {
  Type,
  ImageIcon,
  Video,
  Mic,
  FileText,
  MessageCircleQuestion,
  Sparkles,
  Lock,
  Heading,
  Columns2,
  Columns3,
  ImageUp,
  ImageDown,
  Search,
  HelpCircle,
  GripVertical,
  Mountain,
  PanelLeft,
  PanelRight,
  LayoutGrid,
  Rows,
  MousePointerClick,
  LayoutPanelTop,
  LayoutPanelLeft,
  Rows3,
  ChevronDown,
  Layers,
  RefreshCw,
  Minus,
  Hash,
  MoveVertical,
  ArrowRight,
  Group,



} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import workspaceImg from "@/assets/block-preview-workspace.jpg";
import landscapeImg from "@/assets/block-preview-landscape.jpg";

interface BlockItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  categoryLabel: string;
  type: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description" | "video-description" | "hotspot" | "tabs" | "flashcards";
  variant?: string;
  locked?: boolean;
  isQuizGenerator?: boolean;
  description?: string;
}

interface ContentBlocksPanelProps {
  onAddBlock: (type: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description" | "video-description" | "hotspot" | "tabs" | "flashcards", variant?: string) => void;
  onOpenQuizGenerator?: () => void;
  aiEnabled?: boolean;
}

const ALL_BLOCKS: BlockItem[] = [
  // LAYOUT — flexible containers that accept any block type
  { id: "layout-any-block", label: "Single Block", icon: Rows, category: "layout", categoryLabel: "LAYOUT", type: "text", variant: "any-block-layout", description: "A flexible container that accepts any block — text, image, video, quiz, and more" },
  { id: "layout-any-block-2", label: "Dual Block", icon: LayoutGrid, category: "layout", categoryLabel: "LAYOUT", type: "text", variant: "any-block-layout-2", description: "A two-column container — drop any block into either side" },
  { id: "divider-line", label: "Simple Line", icon: Minus, category: "layout", categoryLabel: "LAYOUT", type: "text", variant: "divider-line", description: "A thin horizontal divider to visually separate sections" },
  { id: "divider-numbered", label: "Numbered Divider", icon: Hash, category: "layout", categoryLabel: "LAYOUT", type: "text", variant: "divider-numbered", description: "A numbered milestone divider with an optional label — perfect for step-by-step sections" },
  { id: "spacer", label: "Space", icon: MoveVertical, category: "layout", categoryLabel: "LAYOUT", type: "text", variant: "spacer", description: "Add adjustable vertical space between blocks for better rhythm" },
  { id: "continue-button", label: "Continue", icon: ArrowRight, category: "layout", categoryLabel: "LAYOUT", type: "text", variant: "continue-button", description: "A primary call-to-action button learners tap to move forward" },
  // TEXT
  { id: "heading-text", label: "Heading & Text", icon: Heading, category: "text", categoryLabel: "TEXT", type: "text", variant: "heading-text", description: "A bold heading followed by a paragraph of body text" },
  { id: "text-only", label: "Text", icon: Type, category: "text", categoryLabel: "TEXT", type: "text", variant: "text-only", description: "A simple rich-text paragraph block" },
  { id: "two-columns", label: "Two Columns", icon: Columns2, category: "text", categoryLabel: "TEXT", type: "text", variant: "two-columns", description: "Side-by-side text columns for comparisons or dense content" },
  { id: "three-columns", label: "Three Columns", icon: Columns3, category: "text", categoryLabel: "TEXT", type: "text", variant: "three-columns", description: "Three text columns for structured content" },
  // IMAGES
  { id: "image-full", label: "Single Image", icon: ImageIcon, category: "image", categoryLabel: "IMAGES", type: "image", variant: "image-full", description: "A full-width image block" },
  { id: "image-top", label: "Image on Top", icon: ImageUp, category: "image", categoryLabel: "IMAGES", type: "image-description", variant: "image-top", description: "Image above with descriptive text below" },
  { id: "image-bottom", label: "Image on Bottom", icon: ImageDown, category: "image", categoryLabel: "IMAGES", type: "image-description", variant: "image-bottom", description: "Text content above with an image below" },
  { id: "image-left", label: "Image on Left", icon: PanelLeft, category: "image", categoryLabel: "IMAGES", type: "image-description", variant: "image-left", description: "Image on the left with text on the right" },
  { id: "image-right", label: "Image on Right", icon: PanelRight, category: "image", categoryLabel: "IMAGES", type: "image-description", variant: "image-right", description: "Text on the left with image on the right" },
  // VIDEO
  { id: "video-upload", label: "Video", icon: Video, category: "video", categoryLabel: "VIDEO", type: "video", variant: "video-upload", description: "Embed or upload a video clip" },
  { id: "video-left", label: "Video on Left", icon: Video, category: "video", categoryLabel: "VIDEO", type: "video-description", variant: "video-left", description: "Video on the left with text on the right" },
  { id: "video-right", label: "Video on Right", icon: Video, category: "video", categoryLabel: "VIDEO", type: "video-description", variant: "video-right", description: "Text on the left with video on the right" },
  // AUDIO
  { id: "audio-upload", label: "Audio", icon: Mic, category: "audio", categoryLabel: "AUDIO", type: "audio", variant: "audio-upload", description: "Embed or upload an audio track" },
  { id: "audio-ai", label: "AI Audio", icon: Sparkles, category: "audio", categoryLabel: "AUDIO", type: "audio", variant: "ai-audio", description: "Generate lifelike voiceover narration from a typed script — pick a voice from the AI library" },
  // DOCUMENT
  { id: "doc-upload", label: "Document", icon: FileText, category: "doc", categoryLabel: "DOCUMENT", type: "doc", variant: "doc-upload", description: "Upload a PDF document" },
  // ASSESSMENT
  { id: "question-block", label: "Question", icon: HelpCircle, category: "assessment", categoryLabel: "QUESTION & QUIZ", type: "quiz", variant: "question-block", description: "Add a single question with answer options" },
  { id: "quiz-block", label: "Quiz", icon: MessageCircleQuestion, category: "assessment", categoryLabel: "QUESTION & QUIZ", type: "quiz", variant: "quiz-block", description: "Add a full quiz — one per page" },
  // INTERACTIVITY
  { id: "hotspot-block", label: "Hotspot on Image", icon: MousePointerClick, category: "interactivity", categoryLabel: "INTERACTIVITY", type: "hotspot", variant: "hotspot", description: "Make an image clickable — add labels, tooltips, links, and reveals on hotspots" },
  { id: "horizontal-tabs", label: "Horizontal Tabs", icon: LayoutPanelTop, category: "interactivity", categoryLabel: "INTERACTIVITY", type: "tabs", variant: "horizontal-tabs", description: "Organise content into tabs arranged horizontally across the top" },
  { id: "vertical-tabs", label: "Vertical Tabs", icon: LayoutPanelLeft, category: "interactivity", categoryLabel: "INTERACTIVITY", type: "tabs", variant: "vertical-tabs", description: "Organise content into a list of tabs stacked along the left" },
  { id: "accordion", label: "Accordion", icon: Rows3, category: "interactivity", categoryLabel: "INTERACTIVITY", type: "text", variant: "accordion", description: "Collapsible panels — click a heading to expand or collapse its content" },
  { id: "flashcards", label: "Flashcards", icon: Layers, category: "interactivity", categoryLabel: "INTERACTIVITY", type: "flashcards", variant: "flashcards", description: "Two-sided cards learners flip to reveal answers, definitions or images" },
  { id: "card-sort", label: "Card Sorting", icon: Group, category: "interactivity", categoryLabel: "INTERACTIVITY", type: "text", variant: "card-sort", description: "Learners drag items into the right category — great for grouping and classification exercises" },
];

/** Resolve a dropped template into a block type and variant. Returns null for quiz-generate (needs dialog). */
export function resolveTemplateDropData(
  templateId: string,
  categoryId: string
): { type: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description" | "video-description" | "hotspot" | "tabs" | "flashcards"; variant?: string } | null {
  const block = ALL_BLOCKS.find((b) => b.id === templateId);
  if (!block || block.isQuizGenerator) return null;
  return { type: block.type, variant: block.variant };
}

/** Hover tooltip preview — looks like a real rendered page section */
function BlockPreview({ id }: { id: string }) {
  const card = "bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-[hsl(220,13%,91%)] overflow-hidden";

  switch (id) {
    case "layout-one-column":
      return (
        <div className="w-56 p-4 bg-[hsl(220,14%,96%)]">
          <div className={cn(card, "p-3")}>
            <div className="relative rounded-md border-2 border-dashed border-primary/25 bg-gradient-to-br from-primary/[0.04] to-primary/[0.10] h-24 overflow-hidden">
              {/* Faux content lines suggesting "any block goes here" */}
              <div className="absolute inset-0 p-3 flex flex-col justify-center gap-1.5">
                <div className="h-1.5 rounded-full bg-primary/20 w-3/4" />
                <div className="h-1.5 rounded-full bg-primary/15 w-full" />
                <div className="h-1.5 rounded-full bg-primary/15 w-5/6" />
                <div className="h-1.5 rounded-full bg-primary/10 w-2/3" />
              </div>
              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center">
                <div className="w-2 h-[1.5px] bg-primary/60 rounded-full" />
                <div className="absolute w-[1.5px] h-2 bg-primary/60 rounded-full" />
              </div>
            </div>
            <p className="text-[9px] text-[hsl(220,8%,46%)] mt-2 px-0.5">Drop any block — text, image, video, quiz…</p>
          </div>
        </div>
      );
    case "layout-two-columns":
      return (
        <div className="w-56 p-4 bg-[hsl(220,14%,96%)]">
          <div className={cn(card, "p-3")}>
            <div className="flex gap-2">
              <div className="relative flex-1 rounded-md border-2 border-dashed border-primary/25 bg-gradient-to-br from-primary/[0.04] to-primary/[0.10] h-24 overflow-hidden">
                <div className="absolute inset-0 p-2 flex flex-col justify-center gap-1.5">
                  <div className="h-[5px] rounded-full bg-primary/25 w-2/3" />
                  <div className="h-1.5 rounded-full bg-primary/15 w-full" />
                  <div className="h-1.5 rounded-full bg-primary/15 w-4/5" />
                </div>
                <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center">
                  <div className="w-1.5 h-[1px] bg-primary/60" />
                  <div className="absolute w-[1px] h-1.5 bg-primary/60" />
                </div>
              </div>
              <div className="relative flex-1 rounded-md border-2 border-dashed border-primary/25 bg-gradient-to-br from-primary/[0.04] to-primary/[0.10] h-24 overflow-hidden">
                <div className="absolute inset-0 p-2 flex flex-col justify-center items-center gap-1.5">
                  <div className="w-full aspect-[16/9] rounded-sm bg-primary/15 flex items-center justify-center">
                    <ImageIcon className="w-3 h-3 text-primary/50" aria-hidden="true" focusable="false" />
                  </div>
                  <div className="h-1.5 rounded-full bg-primary/15 w-4/5" />
                </div>
                <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center">
                  <div className="w-1.5 h-[1px] bg-primary/60" />
                  <div className="absolute w-[1px] h-1.5 bg-primary/60" />
                </div>
              </div>
            </div>
            <p className="text-[9px] text-[hsl(220,8%,46%)] mt-2 px-0.5">Two side-by-side drop zones for any blocks</p>
          </div>
        </div>
      );
    case "layout-any-block":
      return (
        <div className="w-60 p-4 bg-[hsl(220,14%,96%)]">
          <div className={cn(card, "p-3")}>
            <div className="relative rounded-md border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/[0.06] to-primary/[0.14] p-2.5 flex flex-col gap-1.5">
              {/* heading */}
              <div className="h-[6px] rounded-full bg-primary/30 w-2/3" />
              {/* image */}
              <div className="w-full h-10 rounded bg-primary/15 flex items-center justify-center">
                <ImageIcon className="w-3.5 h-3.5 text-primary/55" aria-hidden="true" focusable="false" />
              </div>
              {/* video */}
              <div className="w-full h-8 rounded bg-[hsl(225,15%,18%)] relative overflow-hidden flex items-center justify-center">
                <div className="w-3.5 h-3.5 rounded-full bg-white/25 flex items-center justify-center">
                  <div className="w-0 h-0 border-t-[3px] border-b-[3px] border-l-[5px] border-transparent border-l-white ml-[1px]" />
                </div>
              </div>
              {/* text lines */}
              <div className="h-[5px] rounded-full bg-primary/15 w-full" />
              <div className="h-[5px] rounded-full bg-primary/15 w-5/6" />
            </div>
            <p className="text-[9px] text-[hsl(220,8%,46%)] mt-2 px-0.5">Stack any blocks — text, image, video, quiz, audio…</p>
          </div>
        </div>
      );
    case "layout-any-block-2":
      return (
        <div className="w-60 p-4 bg-[hsl(220,14%,96%)]">
          <div className={cn(card, "p-3")}>
            <div className="flex gap-2">
              <div className="relative flex-1 rounded-md border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/[0.06] to-primary/[0.14] p-2 flex flex-col gap-1.5 h-28">
                <div className="h-[6px] rounded-full bg-primary/30 w-3/4" />
                <div className="w-full h-8 rounded bg-[hsl(225,15%,18%)] relative overflow-hidden flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-white/25 flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[2.5px] border-b-[2.5px] border-l-[4px] border-transparent border-l-white ml-[1px]" />
                  </div>
                </div>
                <div className="h-[5px] rounded-full bg-primary/15 w-full" />
              </div>
              <div className="relative flex-1 rounded-md border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/[0.06] to-primary/[0.14] p-2 flex flex-col gap-1.5 h-28">
                <div className="w-full h-10 rounded bg-primary/15 flex items-center justify-center">
                  <ImageIcon className="w-3.5 h-3.5 text-primary/55" aria-hidden="true" focusable="false" />
                </div>
                <div className="h-[5px] rounded-full bg-primary/15 w-5/6" />
                <div className="h-[5px] rounded-full bg-primary/15 w-2/3" />
              </div>
            </div>
            <p className="text-[9px] text-[hsl(220,8%,46%)] mt-2 px-0.5">Mix any blocks across two side-by-side drop zones</p>
          </div>
        </div>
      );
    case "heading-text":
      return (
        <div className="w-56 p-4 bg-[hsl(220,14%,96%)]">
          <div className={cn(card, "p-4")}>
            <h4 className="text-[13px] font-bold text-[hsl(220,15%,15%)] leading-tight mb-2">Getting Started Guide</h4>
            <p className="text-[10px] text-[hsl(220,8%,46%)] leading-[1.7] mb-1.5">Learn the fundamentals of building your first project with our comprehensive step-by-step guide.</p>
            <p className="text-[10px] text-[hsl(220,8%,58%)] leading-[1.7]">Follow along to set up your environment and get running quickly.</p>
          </div>
        </div>
      );
    case "text-only":
      return (
        <div className="w-56 p-4 bg-[hsl(220,14%,96%)]">
          <div className={cn(card, "p-4")}>
            <p className="text-[10px] text-[hsl(220,8%,46%)] leading-[1.7] mb-1.5">Effective learning combines theory with hands-on practice. Each module builds upon the previous one, ensuring a smooth progression.</p>
            <p className="text-[10px] text-[hsl(220,8%,58%)] leading-[1.7]">Take your time with each section to maximize your understanding.</p>
          </div>
        </div>
      );
    case "two-columns":
      return (
        <div className="w-56 p-4 bg-[hsl(220,14%,96%)]">
          <div className={cn(card, "p-4 flex gap-3")}>
            <div className="flex-1 min-w-0">
              <h5 className="text-[10px] font-semibold text-[hsl(220,15%,20%)] mb-1.5">Overview</h5>
              <p className="text-[9px] text-[hsl(220,8%,50%)] leading-[1.65]">Core concepts and principles for effective learning paths.</p>
            </div>
            <div className="w-px bg-[hsl(220,13%,90%)]" />
            <div className="flex-1 min-w-0">
              <h5 className="text-[10px] font-semibold text-[hsl(220,15%,20%)] mb-1.5">Details</h5>
              <p className="text-[9px] text-[hsl(220,8%,50%)] leading-[1.65]">Advanced techniques and best practices for implementation.</p>
            </div>
          </div>
        </div>
      );
    case "three-columns":
      return (
        <div className="w-64 p-4 bg-[hsl(220,14%,96%)]">
          <div className={cn(card, "p-4 flex gap-2.5")}>
            <div className="flex-1 min-w-0">
              <h5 className="text-[10px] font-semibold text-[hsl(220,15%,20%)] mb-1">Column 1</h5>
              <p className="text-[9px] text-[hsl(220,8%,50%)] leading-[1.65]">Key concepts and fundamentals.</p>
            </div>
            <div className="w-px bg-[hsl(220,13%,90%)]" />
            <div className="flex-1 min-w-0">
              <h5 className="text-[10px] font-semibold text-[hsl(220,15%,20%)] mb-1">Column 2</h5>
              <p className="text-[9px] text-[hsl(220,8%,50%)] leading-[1.65]">Practical applications.</p>
            </div>
            <div className="w-px bg-[hsl(220,13%,90%)]" />
            <div className="flex-1 min-w-0">
              <h5 className="text-[10px] font-semibold text-[hsl(220,15%,20%)] mb-1">Column 3</h5>
              <p className="text-[9px] text-[hsl(220,8%,50%)] leading-[1.65]">Best practices.</p>
            </div>
          </div>
        </div>
      );
      return (
        <div className="w-56 p-4 bg-[hsl(220,14%,96%)]">
          <div className={cn(card, "p-3")}>
            <img src={landscapeImg} alt="Landscape preview" className="w-full h-24 rounded-md object-cover" />
          </div>
        </div>
      );
    case "image-top":
      return (
        <div className="w-56 p-4 bg-[hsl(220,14%,96%)]">
          <div className={cn(card, "p-3")}>
            <img src={workspaceImg} alt="Workspace" className="w-full h-16 rounded-md object-cover mb-3" />
            <p className="text-[9px] text-[hsl(220,8%,50%)] leading-[1.65] px-1">A modern workspace setup featuring essential tools for productivity and creative thinking.</p>
          </div>
        </div>
      );
    case "image-bottom":
      return (
        <div className="w-56 p-4 bg-[hsl(220,14%,96%)]">
          <div className={cn(card, "p-3")}>
            <p className="text-[9px] text-[hsl(220,8%,50%)] leading-[1.65] px-1 mb-3">Nature provides a stunning backdrop for understanding ecological systems and environmental balance.</p>
            <img src={landscapeImg} alt="Landscape" className="w-full h-16 rounded-md object-cover" />
          </div>
        </div>
      );
    case "image-left":
      return (
        <div className="w-56 p-4 bg-[hsl(220,14%,96%)]">
          <div className={cn(card, "p-3 flex gap-3")}>
            <img src={workspaceImg} alt="Workspace" className="flex-1 h-24 rounded-md object-cover" />
            <div className="flex-1 min-w-0 pt-1">
              <h5 className="text-[10px] font-semibold text-[hsl(220,15%,20%)] mb-1.5">Visual Guide</h5>
              <p className="text-[9px] text-[hsl(220,8%,50%)] leading-[1.65]">Image on the left with supporting text content on the right side.</p>
            </div>
          </div>
        </div>
      );
    case "image-right":
      return (
        <div className="w-56 p-4 bg-[hsl(220,14%,96%)]">
          <div className={cn(card, "p-3 flex gap-3")}>
            <div className="flex-1 min-w-0 pt-1">
              <h5 className="text-[10px] font-semibold text-[hsl(220,15%,20%)] mb-1.5">Description</h5>
              <p className="text-[9px] text-[hsl(220,8%,50%)] leading-[1.65]">Text content on the left with a supporting image on the right side.</p>
            </div>
            <img src={landscapeImg} alt="Landscape" className="flex-1 h-24 rounded-md object-cover" />
          </div>
        </div>
      );
    case "video-upload":
      return (
        <div className="w-56 p-4 bg-[hsl(220,14%,96%)]">
          <div className={cn(card, "p-3")}>
            <div className="w-full h-24 rounded-md bg-[hsl(225,15%,12%)] flex items-center justify-center relative overflow-hidden">
              <img src={landscapeImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/15 z-10">
                <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-l-[10px] border-transparent border-l-white ml-1" />
              </div>
              <div className="absolute bottom-2 left-3 right-3 flex items-center gap-2 z-10">
                <span className="text-[8px] text-white/50 tabular-nums">0:00</span>
                <div className="flex-1 h-[3px] rounded-full bg-white/15 overflow-hidden">
                  <div className="h-full w-0 rounded-full bg-white/60" />
                </div>
                <span className="text-[8px] text-white/50 tabular-nums">3:24</span>
              </div>
            </div>
          </div>
        </div>
      );
    case "video-left":
      return (
        <div className="w-56 p-4 bg-[hsl(220,14%,96%)]">
          <div className={cn(card, "p-3 flex gap-3")}>
            <div className="flex-1 h-24 rounded-md bg-[hsl(225,15%,12%)] flex items-center justify-center relative overflow-hidden">
              <img src={workspaceImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center border border-white/15 z-10">
                <div className="w-0 h-0 border-t-[4px] border-b-[4px] border-l-[7px] border-transparent border-l-white ml-0.5" />
              </div>
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <h5 className="text-[10px] font-semibold text-[hsl(220,15%,20%)] mb-1.5">Introduction to Design</h5>
              <p className="text-[9px] text-[hsl(220,8%,50%)] leading-[1.65]">Watch this walkthrough to learn the core principles of effective visual design.</p>
            </div>
          </div>
        </div>
      );
    case "video-right":
      return (
        <div className="w-56 p-4 bg-[hsl(220,14%,96%)]">
          <div className={cn(card, "p-3 flex gap-3")}>
            <div className="flex-1 min-w-0 pt-1">
              <h5 className="text-[10px] font-semibold text-[hsl(220,15%,20%)] mb-1.5">Project Walkthrough</h5>
              <p className="text-[9px] text-[hsl(220,8%,50%)] leading-[1.65]">Follow along as we build a complete project from scratch step by step.</p>
            </div>
            <div className="flex-1 h-24 rounded-md bg-[hsl(225,15%,12%)] flex items-center justify-center relative overflow-hidden">
              <img src={landscapeImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center border border-white/15 z-10">
                <div className="w-0 h-0 border-t-[4px] border-b-[4px] border-l-[7px] border-transparent border-l-white ml-0.5" />
              </div>
            </div>
          </div>
        </div>
      );
    case "audio-upload":
      return (
        <div className="w-56 p-4 bg-[hsl(220,14%,96%)]">
          <div className={cn(card, "p-3")}>
            <div className="w-full rounded-lg bg-[hsl(220,14%,97%)] border border-[hsl(220,13%,91%)] p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <div className="w-0 h-0 border-t-[4px] border-b-[4px] border-l-[7px] border-transparent border-l-primary/60 ml-0.5" />
              </div>
              <div className="flex-1 flex items-end gap-[2px]">
                {[5, 9, 4, 12, 7, 15, 5, 10, 3, 8, 13, 6, 11, 4, 9, 6, 12, 3, 8, 5, 10, 4, 7].map((h, i) => (
                  <div key={i} className="flex-1 rounded-[1px] bg-primary/30" style={{ height: `${h}px` }} />
                ))}
              </div>
              <span className="text-[9px] font-medium text-[hsl(220,8%,50%)] shrink-0 tabular-nums">1:24</span>
            </div>
          </div>
        </div>
      );
    case "audio-ai":
      return (
        <div className="w-64 p-4 bg-[hsl(220,14%,96%)]">
          <div className={cn(card, "p-3")}>
            {/* Premium AI narration card */}
            <div className="w-full rounded-xl border border-primary/15 bg-gradient-to-br from-primary/[0.04] to-primary/[0.08] p-3">
              {/* Top row: avatar + meta */}
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-[hsl(220,15%,15%)] leading-tight">AI Narration</p>
                  <p className="text-[9px] text-[hsl(220,8%,50%)] leading-tight">Voiced by Aria</p>
                </div>
                <span className="text-[9px] font-medium text-muted-foreground tabular-nums">0:42</span>
              </div>
              {/* Waveform strip */}
              <div className="flex items-end gap-[2px] h-5 px-1">
                {[3, 7, 4, 10, 6, 13, 8, 11, 5, 9, 12, 7, 10, 6, 8, 4, 10, 5, 7, 4, 9, 5, 6, 8, 4].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-full"
                    style={{
                      height: `${h * 1.4}px`,
                      background: i < 14 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.35)",
                      opacity: i < 14 ? 1 : 0.65,
                    }}
                  />
                ))}
              </div>
              {/* Script snippet */}
              <div className="mt-2.5 rounded-lg bg-white/80 border border-[hsl(220,13%,91%)] p-2">
                <p className="text-[8.5px] text-[hsl(220,8%,50%)] leading-relaxed line-clamp-2">
                  Welcome to this lesson. In the next few minutes, we'll walk through the key concepts…
                </p>
              </div>
            </div>
          </div>
        </div>
      );

    case "doc-upload":
      return (
        <div className="w-56 p-4 bg-[hsl(220,14%,96%)]">
          <div className={cn(card, "p-4")}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-12 rounded-md bg-[hsl(0,72%,51%)]/10 border border-[hsl(0,72%,51%)]/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[hsl(0,72%,51%)]/70" aria-hidden="true" focusable="false" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-[hsl(220,15%,15%)] truncate">Course_Material.pdf</p>
                <p className="text-[9px] text-[hsl(220,8%,55%)]">PDF · 2.4 MB</p>
              </div>
            </div>
            <div className="h-px bg-[hsl(220,13%,91%)]" />
            <p className="text-[9px] text-[hsl(220,8%,55%)] mt-2">Upload PDF documents up to 100 MB</p>
          </div>
        </div>
      );
    case "question-block":
      return (
        <div className="w-56 p-4 bg-[hsl(220,14%,96%)]">
          <div className={cn(card, "p-4")}>
            <p className="text-[11px] font-semibold text-[hsl(220,15%,15%)] mb-3">Which is the correct answer?</p>
            <div className="space-y-2">
              {["Cloud storage", "Local memory", "External drive"].map((opt, i) => (
                <label key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-[hsl(220,13%,91%)] bg-white cursor-pointer">
                  <div className={cn("w-3.5 h-3.5 rounded-full border-2 shrink-0", i === 0 ? "border-primary bg-primary" : "border-[hsl(220,10%,78%)]")}>
                    {i === 0 && <div className="w-full h-full rounded-full flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-white" /></div>}
                  </div>
                  <span className="text-[10px] text-[hsl(220,8%,35%)]">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      );
    case "quiz-block":
      return (
        <div className="w-56 p-4 bg-[hsl(220,14%,96%)]">
          <div className={cn(card, "p-4")}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
                  <MessageCircleQuestion className="w-3 h-3 text-primary" aria-hidden="true" focusable="false" />
                </div>
                <span className="text-[11px] font-semibold text-[hsl(220,15%,15%)]">Module 1 Quiz</span>
              </div>
              <span className="text-[9px] text-[hsl(220,8%,55%)] bg-[hsl(220,14%,96%)] px-1.5 py-0.5 rounded-md">3 Qs</span>
            </div>
            <div className="space-y-1.5">
              {["Fundamentals of the topic", "Core concepts review", "Practical application"].map((q, i) => (
                <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[hsl(220,14%,97%)] border border-[hsl(220,13%,93%)]">
                  <span className="text-[9px] font-semibold text-primary shrink-0">{i + 1}.</span>
                  <span className="text-[9px] text-[hsl(220,8%,46%)]">{q}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-[5px] rounded-full bg-[hsl(220,13%,93%)] overflow-hidden">
                <div className="h-full w-2/3 rounded-full bg-primary/40" />
              </div>
              <span className="text-[8px] text-[hsl(220,8%,55%)] tabular-nums">67%</span>
            </div>
          </div>
        </div>
      );
    case "hotspot-block":
      return (
        <div className="w-60 p-4 bg-[hsl(220,14%,96%)]">
          <div className={cn(card, "p-3")}>
            <div className="relative w-full h-28 rounded-md overflow-hidden">
              <img src={landscapeImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
              {/* hotspot markers */}
              {[
                { l: "20%", t: "32%", n: 1 },
                { l: "55%", t: "55%", n: 2 },
                { l: "78%", t: "28%", n: 3 },
              ].map((p) => (
                <div key={p.n} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: p.l, top: p.t }}>
                  <div className="w-4 h-4 rounded-full bg-primary text-white text-[8px] font-bold flex items-center justify-center border-2 border-white shadow-md">
                    {p.n}
                  </div>
                </div>
              ))}
              {/* faux selection */}
              <div className="absolute border-2 border-primary/80 bg-primary/15 rounded-md" style={{ left: "42%", top: "42%", width: "22%", height: "32%" }} />
            </div>
            <p className="text-[9px] text-[hsl(220,8%,46%)] mt-2 px-0.5">Click to reveal info — labels, links, images</p>
          </div>
        </div>
      );
    case "horizontal-tabs":
      return (
        <div className="w-64 p-4 bg-[hsl(220,14%,96%)]">
          {/* Card */}

          <div className="rounded-xl border border-[hsl(220,13%,88%)] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="flex items-stretch bg-[hsl(220,14%,97%)] border-b border-[hsl(220,13%,91%)]">
              {["Overview", "Details", "FAQ"].map((t, i) => (
                <div
                  key={t}
                  className={cn(
                    "relative px-2 py-1.5 text-[8px] font-semibold border-r border-[hsl(220,13%,91%)] last:border-r-0",
                    i === 0 ? "bg-white text-[hsl(220,15%,18%)]" : "text-[hsl(220,8%,55%)]"
                  )}
                >
                  {t}
                  {i === 0 && <span className="absolute left-0 right-0 bottom-0 h-[1.5px] bg-primary" />}
                </div>
              ))}
            </div>
            <div className="p-2.5 space-y-1">
              <div className="h-1.5 rounded-full bg-[hsl(220,13%,93%)] w-3/4" />
              <div className="h-1.5 rounded-full bg-[hsl(220,13%,93%)] w-full" />
              <div className="h-1.5 rounded-full bg-[hsl(220,13%,93%)] w-5/6" />
            </div>
          </div>
          <p className="text-[9px] text-[hsl(220,8%,46%)] mt-2 px-0.5">Switch between sections of content</p>
        </div>
      );
    case "vertical-tabs":
      return (
        <div className="w-64 p-4 bg-[hsl(220,14%,96%)]">
          {/* Card */}

          <div className="rounded-xl border border-[hsl(220,13%,88%)] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden flex items-stretch">
            <div className="flex flex-col w-20 shrink-0 bg-[hsl(220,14%,97%)] border-r border-[hsl(220,13%,91%)]">
              {["Intro", "Setup", "Usage", "FAQ"].map((t, i) => (
                <div
                  key={t}
                  className={cn(
                    "relative px-2 py-1.5 text-[8px] font-semibold border-b border-[hsl(220,13%,91%)] last:border-b-0",
                    i === 0 ? "bg-white text-[hsl(220,15%,18%)]" : "text-[hsl(220,8%,55%)]"
                  )}
                >
                  {t}
                  {i === 0 && <span className="absolute left-0 top-0 bottom-0 w-[1.5px] bg-primary" />}
                </div>
              ))}
            </div>
            <div className="flex-1 p-2.5 space-y-1">
              <div className="h-1.5 rounded-full bg-[hsl(220,13%,93%)] w-3/4" />
              <div className="h-1.5 rounded-full bg-[hsl(220,13%,93%)] w-full" />
              <div className="h-1.5 rounded-full bg-[hsl(220,13%,93%)] w-5/6" />
              <div className="h-1.5 rounded-full bg-[hsl(220,13%,93%)] w-2/3" />
            </div>
          </div>
          <p className="text-[9px] text-[hsl(220,8%,46%)] mt-2 px-0.5">Stacked tabs along the left edge</p>
        </div>
      );
    case "accordion":
      return (
        <div className="w-64 p-4 bg-[hsl(220,14%,96%)]">
          <div className="space-y-1.5">

            {[
              { q: "What's included?", open: true },
              { q: "How do I get started?", open: false },
              { q: "Is there a free trial?", open: false },
            ].map((row, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-xl border bg-white overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
                  row.open ? "border-primary/40" : "border-[hsl(220,13%,88%)]"
                )}
              >
                <div className={cn("flex items-center justify-between px-2.5 py-1.5", row.open && "bg-primary/[0.06]")}>
                  <span className="text-[9px] font-semibold text-[hsl(220,15%,18%)]">{row.q}</span>
                  <ChevronDown
                    className={cn("w-2.5 h-2.5 text-primary transition-transform", row.open ? "rotate-180" : "rotate-0")}
                    aria-hidden="true"
                    focusable="false"
                  />
                </div>
                {row.open && (
                  <div className="px-2.5 pb-2 pt-1 space-y-1 border-t border-[hsl(220,13%,93%)]">
                    <div className="h-1.5 rounded-full bg-[hsl(220,13%,93%)] w-full" />
                    <div className="h-1.5 rounded-full bg-[hsl(220,13%,93%)] w-5/6" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-[9px] text-[hsl(220,8%,46%)] mt-2 px-0.5">Click headings to expand each panel</p>
        </div>
      );
    case "flashcards":
      return (
        <div className="w-64 p-4 bg-[hsl(220,14%,96%)]">
          <div className="flex items-center justify-center gap-3 py-2">
            {/* Front UNO-style card */}
            <div
              className="relative w-[88px] h-[124px] rounded-xl p-[6px] shadow-[0_8px_20px_-6px_rgba(0,0,0,0.28)] -rotate-[8deg]"
              style={{ background: "linear-gradient(135deg,#0EA5E9,#0369A1)" }}
            >
              <div className="w-full h-full rounded-[8px] bg-white relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-[5px] rounded-[6px] border border-[#0EA5E9]/30" />
                <span className="absolute top-1.5 left-2 text-[8px] font-bold tracking-wider" style={{ color: "#0C4A6E" }}>A</span>
                <span className="absolute bottom-1.5 right-2 text-[8px] font-bold tracking-wider rotate-180" style={{ color: "#0C4A6E" }}>A</span>
                <div className="text-center px-1">
                  <div className="text-[7px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "#0EA5E9" }}>Term</div>
                  <div className="text-[10px] font-bold leading-tight" style={{ color: "#0C4A6E" }}>Photosynthesis</div>
                </div>
              </div>
            </div>
            {/* Back UNO-style card */}
            <div
              className="relative w-[88px] h-[124px] rounded-xl p-[6px] shadow-[0_8px_20px_-6px_rgba(0,0,0,0.28)] rotate-[8deg]"
              style={{ background: "linear-gradient(135deg,#F59E0B,#B45309)" }}
            >
              <div className="w-full h-full rounded-[8px] bg-white relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-[5px] rounded-[6px] border border-[#F59E0B]/35" />
                <span className="absolute top-1.5 left-2 text-[8px] font-bold tracking-wider" style={{ color: "#713F12" }}>B</span>
                <span className="absolute bottom-1.5 right-2 text-[8px] font-bold tracking-wider rotate-180" style={{ color: "#713F12" }}>B</span>
                <div className="text-center px-1">
                  <div className="text-[7px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "#F59E0B" }}>Def.</div>
                  <div className="text-[7.5px] font-medium leading-tight" style={{ color: "#713F12" }}>Plants convert light into energy</div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-[9px] text-[hsl(220,8%,46%)] mt-2 px-0.5 flex items-center gap-1">
            <RefreshCw className="w-2.5 h-2.5" aria-hidden="true" focusable="false" />
            Click cards to flip front ↔ back
          </p>
        </div>
      );
    case "card-sort":
      return (
        <div className="w-64 p-4 bg-[hsl(220,14%,96%)]">
          <div className={cn(card, "p-3 space-y-2.5")}>
            {/* UNO-style card carousel */}
            <div className="flex items-center justify-center gap-1.5">
              <div className="w-4 h-4 rounded-full border border-[hsl(220,13%,85%)] bg-white flex items-center justify-center text-[9px] text-[hsl(220,10%,45%)] leading-none">‹</div>
              <div className="relative w-[54px] h-[68px]">
                <div className="absolute inset-0 rounded-md bg-white border border-[hsl(220,13%,85%)] shadow-[0_1px_3px_rgba(0,0,0,0.06)] rotate-[-5deg] -translate-x-1" />
                <div className="absolute inset-0 rounded-md bg-white border border-[hsl(220,13%,82%)] shadow-[0_1px_3px_rgba(0,0,0,0.08)] rotate-[3deg] translate-x-1" />
                <div className="absolute inset-0 rounded-md bg-white border border-primary/40 shadow-[0_2px_6px_-1px_rgba(0,0,0,0.12)] flex items-center justify-center">
                  <span className="text-[9px] font-semibold text-[hsl(220,15%,25%)]">Card 1</span>
                </div>
              </div>
              <div className="w-4 h-4 rounded-full border border-[hsl(220,13%,85%)] bg-white flex items-center justify-center text-[9px] text-[hsl(220,10%,45%)] leading-none">›</div>
            </div>
            {/* Category rows */}
            <div className="space-y-1.5">
              <div className="rounded-md border border-dashed border-[hsl(220,13%,80%)] bg-[hsl(220,14%,97%)] px-2 py-1.5">
                <p className="text-[9px] font-bold text-[hsl(220,15%,20%)]">Fruits</p>
              </div>
              <div className="rounded-md border border-dashed border-[hsl(220,13%,80%)] bg-[hsl(220,14%,97%)] px-2 py-1.5">
                <p className="text-[9px] font-bold text-[hsl(220,15%,20%)]">Vegetables</p>
              </div>
            </div>
          </div>
          <p className="text-[9px] text-[hsl(220,8%,46%)] mt-2 px-0.5">Drag each card into the right category</p>
        </div>
      );

    case "divider-line":

      return (
        <div className="w-60 p-4 bg-[hsl(220,14%,96%)]">
          <div className={cn(card, "p-4")}>
            <p className="text-[9px] font-semibold text-[hsl(220,15%,20%)] mb-1">Chapter One</p>
            <p className="text-[8px] text-[hsl(220,8%,50%)] leading-[1.6] mb-2.5">Wraps up the introduction to the subject.</p>
            <div className="flex items-center gap-1.5 my-2.5">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[hsl(220,13%,80%)] to-[hsl(220,13%,80%)]" />
              <div className="w-[3px] h-[3px] rounded-full bg-[hsl(220,13%,75%)]" />
              <div className="w-1.5 h-1.5 rotate-45 border border-[hsl(220,13%,75%)] bg-white" />
              <div className="w-[3px] h-[3px] rounded-full bg-[hsl(220,13%,75%)]" />
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[hsl(220,13%,80%)] to-[hsl(220,13%,80%)]" />
            </div>
            <p className="text-[9px] font-semibold text-[hsl(220,15%,20%)] mt-2">Chapter Two</p>
            <p className="text-[8px] text-[hsl(220,8%,50%)] leading-[1.6]">A new topic begins.</p>
          </div>
        </div>
      );
    case "divider-numbered":
      return (
        <div className="w-60 p-4 bg-[hsl(220,14%,96%)]">
          <div className={cn(card, "p-4")}>
            <div className="flex items-center gap-2 my-2">
              <div className="flex items-center gap-1 flex-1">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[hsl(220,13%,80%)]" />
                <div className="w-[3px] h-[3px] rounded-full bg-[hsl(220,13%,80%)]" />
              </div>
              <div className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full border border-[hsl(220,13%,88%)] bg-white shadow-[0_1px_3px_-1px_rgba(0,0,0,0.08)]">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-[hsl(var(--primary)/0.75)] text-white text-[8px] font-bold flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">2</div>
                <span className="text-[9px] font-semibold tracking-tight text-[hsl(220,15%,20%)]">Getting Started</span>
              </div>
              <div className="flex items-center gap-1 flex-1">
                <div className="w-[3px] h-[3px] rounded-full bg-[hsl(220,13%,80%)]" />
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[hsl(220,13%,80%)]" />
              </div>
            </div>
            <p className="text-[8px] text-[hsl(220,8%,50%)] leading-[1.6] mt-2 text-center">A numbered milestone between sections.</p>
          </div>
        </div>
      );
    case "spacer":
      return (
        <div className="w-60 p-4 bg-[hsl(220,14%,96%)]">
          <div className={cn(card, "p-3")}>
            <div className="h-2 rounded bg-[hsl(220,13%,93%)] mb-1.5 w-4/5" />
            <div className="h-2 rounded bg-[hsl(220,13%,93%)] mb-2 w-full" />
            <div className="my-2 h-9 rounded-lg border border-dashed border-[hsl(220,13%,78%)] bg-gradient-to-br from-[hsl(220,14%,98%)] to-[hsl(220,14%,95%)] flex items-center justify-between px-1.5">
              <div className="flex flex-col justify-between h-full py-1 opacity-60">
                {[0, 1, 2].map((i) => <span key={i} className="block w-1 h-px bg-[hsl(220,8%,55%)]" />)}
              </div>
              <span className="inline-flex items-center gap-1 px-1.5 py-[2px] rounded-full bg-white border border-[hsl(220,13%,88%)] text-[7px] font-semibold uppercase tracking-wider text-[hsl(220,8%,45%)] shadow-sm">40px</span>
              <div className="flex flex-col justify-between h-full py-1 opacity-60">
                {[0, 1, 2].map((i) => <span key={i} className="block w-1 h-px bg-[hsl(220,8%,55%)]" />)}
              </div>
            </div>
            <div className="h-2 rounded bg-[hsl(220,13%,93%)] w-3/4" />
          </div>
        </div>
      );
    case "continue-button":
      return (
        <div className="w-60 p-4 bg-[hsl(220,14%,96%)]">
          <div className={cn(card, "p-4 flex flex-col items-center gap-2.5")}>
            <p className="text-[8px] text-[hsl(220,8%,55%)] leading-[1.5] text-center">Ready to move on to the next lesson?</p>
            <div className="relative inline-flex items-center gap-1.5 rounded-full pl-3 pr-1 py-1 bg-gradient-to-b from-primary to-[hsl(var(--primary)/0.85)] shadow-[0_4px_10px_-3px_hsl(var(--primary)/0.55)]">
              <span className="absolute inset-x-2 top-0 h-px rounded-full bg-white/30" aria-hidden="true" />
              <span className="text-[10px] font-semibold tracking-tight text-white">Continue</span>
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                <ArrowRight className="w-2.5 h-2.5 text-white" aria-hidden="true" focusable="false" />
              </span>
            </div>
          </div>
        </div>
      );

      default:
      return null;
  }
}



/** Miniature thumbnails — styled as tiny page screenshots with real images and text */
function BlockThumbnail({ id }: { id: string }) {
  const wrapper = "w-full rounded-[6px] bg-[hsl(220,14%,96%)] p-[5px] overflow-hidden";
  const miniCard = "bg-white rounded-[4px] shadow-[0_0.5px_2px_rgba(0,0,0,0.07)] border border-[hsl(220,13%,91%)]";

  switch (id) {
    case "layout-one-column":
      return (
        <div className={wrapper}>
          <div className={cn(miniCard, "p-[4px]")}>
            <div className="relative rounded-[3px] border border-dashed border-primary/30 bg-gradient-to-br from-primary/[0.05] to-primary/[0.12] h-[34px] overflow-hidden">
              <div className="absolute inset-0 px-[5px] flex flex-col justify-center gap-[2px]">
                <div className="h-[2px] rounded-full bg-primary/25 w-3/4" />
                <div className="h-[2px] rounded-full bg-primary/20 w-full" />
                <div className="h-[2px] rounded-full bg-primary/20 w-5/6" />
                <div className="h-[2px] rounded-full bg-primary/15 w-2/3" />
              </div>
              <div className="absolute top-[1.5px] right-[1.5px] w-[6px] h-[6px] rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <div className="w-[3px] h-[0.75px] bg-primary/70" />
                <div className="absolute w-[0.75px] h-[3px] bg-primary/70" />
              </div>
            </div>
          </div>
        </div>
      );
    case "layout-two-columns":
      return (
        <div className={wrapper}>
          <div className={cn(miniCard, "p-[4px] flex gap-[3px]")}>
            <div className="relative flex-1 rounded-[3px] border border-dashed border-primary/30 bg-gradient-to-br from-primary/[0.05] to-primary/[0.12] h-[34px] overflow-hidden">
              <div className="absolute inset-0 p-[3px] flex flex-col justify-center gap-[2px]">
                <div className="h-[1.5px] rounded-full bg-primary/30 w-2/3" />
                <div className="h-[2px] rounded-full bg-primary/20 w-full" />
                <div className="h-[2px] rounded-full bg-primary/20 w-4/5" />
              </div>
              <div className="absolute top-[1px] right-[1px] w-[5px] h-[5px] rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <div className="w-[2px] h-[0.75px] bg-primary/70" />
                <div className="absolute w-[0.75px] h-[2px] bg-primary/70" />
              </div>
            </div>
            <div className="relative flex-1 rounded-[3px] border border-dashed border-primary/30 bg-gradient-to-br from-primary/[0.05] to-primary/[0.12] h-[34px] overflow-hidden">
              <div className="absolute inset-0 p-[3px] flex flex-col justify-center items-center gap-[2px]">
                <div className="w-full h-[14px] rounded-[1px] bg-primary/15 flex items-center justify-center">
                  <ImageIcon className="w-[5px] h-[5px] text-primary/55" aria-hidden="true" focusable="false" />
                </div>
                <div className="h-[1.5px] rounded-full bg-primary/20 w-3/4" />
              </div>
              <div className="absolute top-[1px] right-[1px] w-[5px] h-[5px] rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <div className="w-[2px] h-[0.75px] bg-primary/70" />
                <div className="absolute w-[0.75px] h-[2px] bg-primary/70" />
              </div>
            </div>
          </div>
        </div>
      );
    case "layout-any-block":
      return (
        <div className={wrapper}>
          <div className={cn(miniCard, "p-[4px]")}>
            <div className="relative w-full rounded-[3px] border border-dashed border-primary/35 bg-gradient-to-br from-primary/[0.06] to-primary/[0.14] h-[40px] overflow-hidden p-[3px] flex flex-col gap-[1.5px]">
              {/* heading */}
              <div className="h-[2px] rounded-full bg-primary/30 w-2/3" />
              {/* image */}
              <div className="w-full h-[10px] rounded-[1px] bg-primary/20 flex items-center justify-center">
                <ImageIcon className="w-[5px] h-[5px] text-primary/60" aria-hidden="true" focusable="false" />
              </div>
              {/* video */}
              <div className="w-full h-[8px] rounded-[1px] bg-[hsl(225,15%,18%)] flex items-center justify-center">
                <div className="w-[5px] h-[5px] rounded-full bg-white/30 flex items-center justify-center">
                  <div className="w-0 h-0 border-t-[1px] border-b-[1px] border-l-[2px] border-transparent border-l-white" />
                </div>
              </div>
              {/* text */}
              <div className="h-[1.5px] rounded-full bg-primary/20 w-full" />
              <div className="h-[1.5px] rounded-full bg-primary/20 w-5/6" />
            </div>
          </div>
        </div>
      );
    case "layout-any-block-2":
      return (
        <div className={wrapper}>
          <div className={cn(miniCard, "p-[4px] flex gap-[3px]")}>
            <div className="relative flex-1 rounded-[3px] border border-dashed border-primary/35 bg-gradient-to-br from-primary/[0.06] to-primary/[0.14] h-[40px] overflow-hidden p-[2.5px] flex flex-col gap-[1.5px]">
              <div className="h-[2px] rounded-full bg-primary/30 w-3/4" />
              <div className="w-full h-[10px] rounded-[1px] bg-[hsl(225,15%,18%)] flex items-center justify-center">
                <div className="w-[5px] h-[5px] rounded-full bg-white/30 flex items-center justify-center">
                  <div className="w-0 h-0 border-t-[1px] border-b-[1px] border-l-[2px] border-transparent border-l-white" />
                </div>
              </div>
              <div className="h-[1.5px] rounded-full bg-primary/20 w-full" />
              <div className="h-[1.5px] rounded-full bg-primary/20 w-2/3" />
            </div>
            <div className="relative flex-1 rounded-[3px] border border-dashed border-primary/35 bg-gradient-to-br from-primary/[0.06] to-primary/[0.14] h-[40px] overflow-hidden p-[2.5px] flex flex-col gap-[1.5px]">
              <div className="w-full h-[12px] rounded-[1px] bg-primary/20 flex items-center justify-center">
                <ImageIcon className="w-[5px] h-[5px] text-primary/60" aria-hidden="true" focusable="false" />
              </div>
              <div className="h-[2px] rounded-full bg-primary/25 w-full" />
              <div className="h-[1.5px] rounded-full bg-primary/20 w-5/6" />
              <div className="h-[1.5px] rounded-full bg-primary/20 w-2/3" />
            </div>
          </div>
        </div>
      );
    case "heading-text":
      return (
        <div className={wrapper}>
          <div className={cn(miniCard, "p-2.5")}>
            <p className="text-[5px] font-bold text-[hsl(220,15%,15%)] leading-[1.3] mb-[4px]">Getting Started Guide</p>
            <p className="text-[3.5px] text-[hsl(220,8%,50%)] leading-[1.7]">Learn the fundamentals of building your first project with our comprehensive step-by-step guide.</p>
            <p className="text-[3.5px] text-[hsl(220,8%,62%)] leading-[1.7] mt-[2px]">Follow along to set up everything you need.</p>
          </div>
        </div>
      );
    case "text-only":
      return (
        <div className={wrapper}>
          <div className={cn(miniCard, "p-2.5")}>
            <p className="text-[3.5px] text-[hsl(220,8%,50%)] leading-[1.7]">Effective learning combines theory with hands-on practice. Each module builds upon the previous one, ensuring smooth progression through all topics.</p>
            <p className="text-[3.5px] text-[hsl(220,8%,62%)] leading-[1.7] mt-[2px]">Take your time with each section.</p>
          </div>
        </div>
      );
    case "two-columns":
      return (
        <div className={wrapper}>
          <div className={cn(miniCard, "p-2.5 flex gap-[5px]")}>
            <div className="flex-1 min-w-0">
              <p className="text-[4px] font-semibold text-[hsl(220,15%,18%)] mb-[3px]">Overview</p>
              <p className="text-[3px] text-[hsl(220,8%,52%)] leading-[1.6]">Core concepts and key principles for effective learning paths.</p>
            </div>
            <div className="w-px bg-[hsl(220,13%,90%)]" />
            <div className="flex-1 min-w-0">
              <p className="text-[4px] font-semibold text-[hsl(220,15%,18%)] mb-[3px]">Details</p>
              <p className="text-[3px] text-[hsl(220,8%,52%)] leading-[1.6]">Advanced techniques and best practices for implementation.</p>
            </div>
          </div>
        </div>
      );
    case "three-columns":
      return (
        <div className={wrapper}>
          <div className={cn(miniCard, "p-2.5 flex gap-[4px]")}>
            <div className="flex-1 min-w-0">
              <p className="text-[3.5px] font-semibold text-[hsl(220,15%,18%)] mb-[2px]">Col 1</p>
              <p className="text-[3px] text-[hsl(220,8%,52%)] leading-[1.6]">Key concepts.</p>
            </div>
            <div className="w-px bg-[hsl(220,13%,90%)]" />
            <div className="flex-1 min-w-0">
              <p className="text-[3.5px] font-semibold text-[hsl(220,15%,18%)] mb-[2px]">Col 2</p>
              <p className="text-[3px] text-[hsl(220,8%,52%)] leading-[1.6]">Applications.</p>
            </div>
            <div className="w-px bg-[hsl(220,13%,90%)]" />
            <div className="flex-1 min-w-0">
              <p className="text-[3.5px] font-semibold text-[hsl(220,15%,18%)] mb-[2px]">Col 3</p>
              <p className="text-[3px] text-[hsl(220,8%,52%)] leading-[1.6]">Practices.</p>
            </div>
          </div>
        </div>
      );
    case "image-full":
      return (
        <div className={wrapper}>
          <div className={cn(miniCard, "p-[3px]")}>
            <img src={landscapeImg} alt="" className="w-full h-[32px] rounded-[3px] object-cover" />
          </div>
        </div>
      );
    case "image-top":
      return (
        <div className={wrapper}>
          <div className={cn(miniCard, "p-[3px]")}>
            <img src={workspaceImg} alt="" className="w-full h-[18px] rounded-[3px] object-cover mb-[3px]" />
            <div className="px-[3px]">
              <p className="text-[3px] text-[hsl(220,8%,52%)] leading-[1.6]">A modern workspace setup for productivity and creative work.</p>
            </div>
          </div>
        </div>
      );
    case "image-bottom":
      return (
        <div className={wrapper}>
          <div className={cn(miniCard, "p-[3px]")}>
            <div className="px-[3px] mb-[3px]">
              <p className="text-[3px] text-[hsl(220,8%,52%)] leading-[1.6]">Nature provides a stunning backdrop for understanding ecological balance.</p>
            </div>
            <img src={landscapeImg} alt="" className="w-full h-[18px] rounded-[3px] object-cover" />
          </div>
        </div>
      );
    case "image-left":
      return (
        <div className={wrapper}>
          <div className={cn(miniCard, "p-[4px] flex gap-[4px]")}>
            <img src={workspaceImg} alt="" className="flex-1 h-[28px] rounded-[3px] object-cover" />
            <div className="flex-1 min-w-0 pt-[2px]">
              <p className="text-[4px] font-semibold text-[hsl(220,15%,18%)] mb-[2px]">Visual Guide</p>
              <p className="text-[3px] text-[hsl(220,8%,52%)] leading-[1.6]">Image left with text.</p>
            </div>
          </div>
        </div>
      );
    case "image-right":
      return (
        <div className={wrapper}>
          <div className={cn(miniCard, "p-[4px] flex gap-[4px]")}>
            <div className="flex-1 min-w-0 pt-[2px]">
              <p className="text-[4px] font-semibold text-[hsl(220,15%,18%)] mb-[2px]">Description</p>
              <p className="text-[3px] text-[hsl(220,8%,52%)] leading-[1.6]">Text left with image.</p>
            </div>
            <img src={landscapeImg} alt="" className="flex-1 h-[28px] rounded-[3px] object-cover" />
          </div>
        </div>
      );
    case "video-upload":
      return (
        <div className={wrapper}>
          <div className={cn(miniCard, "p-[3px]")}>
            <div className="w-full h-[32px] rounded-[3px] bg-[hsl(225,15%,14%)] flex items-center justify-center relative overflow-hidden">
              <img src={landscapeImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
              <div className="w-[14px] h-[14px] rounded-full bg-white/25 flex items-center justify-center z-10">
                <div className="w-0 h-0 border-t-[3px] border-b-[3px] border-l-[5px] border-transparent border-l-white ml-[1px]" />
              </div>
              <div className="absolute bottom-[3px] left-[4px] right-[4px] h-[2px] rounded-full bg-white/15 overflow-hidden z-10">
                <div className="h-full w-0 rounded-full bg-white/50" />
              </div>
            </div>
          </div>
        </div>
      );
    case "video-left":
      return (
        <div className={wrapper}>
          <div className={cn(miniCard, "p-[4px] flex gap-[4px]")}>
            <div className="flex-1 h-[28px] rounded-[3px] bg-[hsl(225,15%,14%)] flex items-center justify-center relative overflow-hidden">
              <img src={workspaceImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
              <div className="w-[10px] h-[10px] rounded-full bg-white/25 flex items-center justify-center z-10">
                <div className="w-0 h-0 border-t-[2px] border-b-[2px] border-l-[3px] border-transparent border-l-white ml-[0.5px]" />
              </div>
            </div>
            <div className="flex-1 min-w-0 pt-[2px]">
              <p className="text-[4px] font-semibold text-[hsl(220,15%,18%)] mb-[2px]">Introduction</p>
              <p className="text-[3px] text-[hsl(220,8%,52%)] leading-[1.6]">Watch this video to learn the basics.</p>
            </div>
          </div>
        </div>
      );
    case "video-right":
      return (
        <div className={wrapper}>
          <div className={cn(miniCard, "p-[4px] flex gap-[4px]")}>
            <div className="flex-1 min-w-0 pt-[2px]">
              <p className="text-[4px] font-semibold text-[hsl(220,15%,18%)] mb-[2px]">Walkthrough</p>
              <p className="text-[3px] text-[hsl(220,8%,52%)] leading-[1.6]">Follow along step by step.</p>
            </div>
            <div className="flex-1 h-[28px] rounded-[3px] bg-[hsl(225,15%,14%)] flex items-center justify-center relative overflow-hidden">
              <img src={landscapeImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
              <div className="w-[10px] h-[10px] rounded-full bg-white/25 flex items-center justify-center z-10">
                <div className="w-0 h-0 border-t-[2px] border-b-[2px] border-l-[3px] border-transparent border-l-white ml-[0.5px]" />
              </div>
            </div>
          </div>
        </div>
      );
    case "audio-upload":
      return (
        <div className={wrapper}>
          <div className={cn(miniCard, "p-[4px]")}>
            <div className="w-full h-[22px] rounded-[3px] bg-[hsl(220,14%,97%)] border border-[hsl(220,13%,93%)] flex items-center gap-[3px] px-[4px]">
              <div className="w-[12px] h-[12px] rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <div className="w-0 h-0 border-t-[2px] border-b-[2px] border-l-[3px] border-transparent border-l-primary/50 ml-[0.5px]" />
              </div>
              <div className="flex-1 flex items-end gap-[1px]">
                {[3, 6, 2, 8, 5, 10, 4, 7, 2, 5, 9, 3].map((h, i) => (
                  <div key={i} className="flex-1 rounded-[0.5px] bg-primary/25" style={{ height: `${h * 0.7}px` }} />
                ))}
              </div>
              <span className="text-[5px] text-[hsl(220,8%,60%)] shrink-0 tabular-nums">1:24</span>
            </div>
          </div>
        </div>
      );
    case "audio-ai":
      return (
        <div className={wrapper}>
          <div className={cn(miniCard, "p-[4px]")}>
            <div className="w-full h-[22px] rounded-[3px] bg-[hsl(220,14%,97%)] border border-[hsl(220,13%,93%)] flex items-center gap-[3px] px-[4px]">
              <div className="w-[12px] h-[12px] rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-[6px] h-[6px] text-primary" aria-hidden="true" focusable="false" />
              </div>
              <div className="flex-1 flex items-end gap-[1px]">
                {[3, 6, 2, 8, 5, 10, 4, 7, 2, 5, 9, 3].map((h, i) => (
                  <div key={i} className="flex-1 rounded-[0.5px] bg-primary/25" style={{ height: `${h * 0.7}px` }} />
                ))}
              </div>
              <span className="text-[5px] text-[hsl(220,8%,60%)] shrink-0 tabular-nums">0:42</span>
            </div>
          </div>
        </div>
      );
    case "doc-upload":
      return (
        <div className={wrapper}>
          <div className={cn(miniCard, "p-2.5")}>
            <div className="flex items-center gap-[4px]">
              <div className="w-[12px] h-[14px] rounded-[2px] bg-[hsl(0,72%,51%)]/10 border border-[hsl(0,72%,51%)]/20 flex items-center justify-center">
                <FileText className="w-[7px] h-[7px] text-[hsl(0,72%,51%)]/60" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[4px] font-semibold text-[hsl(220,15%,18%)] truncate">Course_Material.pdf</p>
                <p className="text-[3px] text-[hsl(220,8%,55%)]">PDF · 2.4 MB</p>
              </div>
            </div>
          </div>
        </div>
      );
    case "question-block":
      return (
        <div className={wrapper}>
          <div className={cn(miniCard, "p-2.5")}>
            <p className="text-[4px] font-semibold text-[hsl(220,15%,18%)] mb-[4px]">Select the correct answer:</p>
            <div className="space-y-[2px]">
              {["Cloud storage", "Local memory", "External drive"].map((opt, i) => (
                <div key={i} className="flex items-center gap-[3px] h-[9px] rounded-[2px] border border-[hsl(220,13%,91%)] bg-white px-[4px]">
                  <div className={cn("w-[4px] h-[4px] rounded-full border-[1px] shrink-0", i === 0 ? "border-primary bg-primary" : "border-[hsl(220,10%,80%)]")}>
                    {i === 0 && <div className="w-full h-full rounded-full flex items-center justify-center"><div className="w-[1.5px] h-[1.5px] rounded-full bg-white" /></div>}
                  </div>
                  <span className="text-[3.5px] text-[hsl(220,8%,45%)]">{opt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    case "quiz-block":
      return (
        <div className={wrapper}>
          <div className={cn(miniCard, "p-2.5")}>
            <div className="flex items-center gap-[3px] mb-[4px]">
              <div className="w-[8px] h-[8px] rounded-[2px] bg-primary/10 flex items-center justify-center">
                <MessageCircleQuestion className="w-[5px] h-[5px] text-primary" />
              </div>
              <span className="text-[4px] font-bold text-[hsl(220,15%,18%)]">Module 1 Quiz</span>
            </div>
            <div className="space-y-[2px]">
              {["Basics", "Core concepts", "Practice"].map((label, i) => (
                <div key={i} className="flex items-center gap-[3px] h-[8px] rounded-[2px] bg-[hsl(220,14%,97%)] border border-[hsl(220,13%,93%)] px-[4px]">
                  <span className="text-[3.5px] font-semibold text-primary">{i + 1}.</span>
                  <span className="text-[3.5px] text-[hsl(220,8%,50%)]">{label}</span>
                </div>
              ))}
            </div>
            <div className="mt-[3px] h-[2px] w-full rounded-full bg-[hsl(220,13%,93%)] overflow-hidden">
              <div className="h-full w-2/3 rounded-full bg-primary/35" />
            </div>
          </div>
        </div>
      );
    case "hotspot-block":
      return (
        <div className={wrapper}>
          <div className={cn(miniCard, "p-[3px]")}>
            <div className="relative w-full h-[32px] rounded-[3px] overflow-hidden">
              <img src={landscapeImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
              {/* hotspot markers */}
              <div className="absolute" style={{ left: "22%", top: "30%" }}>
                <div className="w-[6px] h-[6px] rounded-full bg-primary border-[1px] border-white shadow-sm" />
              </div>
              <div className="absolute" style={{ left: "58%", top: "55%" }}>
                <div className="w-[6px] h-[6px] rounded-full bg-primary border-[1px] border-white shadow-sm" />
              </div>
              <div className="absolute" style={{ left: "75%", top: "25%" }}>
                <div className="w-[6px] h-[6px] rounded-full bg-primary border-[1px] border-white shadow-sm" />
              </div>
              {/* faux selection rect */}
              <div className="absolute border-[1px] border-primary/80 bg-primary/15 rounded-[1px]" style={{ left: "40%", top: "40%", width: "20%", height: "30%" }} />
            </div>
          </div>
        </div>
      );
    case "horizontal-tabs":
      return (
        <div className={wrapper}>
          <div className={cn(miniCard, "p-[3px]")}>
            <div className="flex items-end gap-[3px] border-b border-[hsl(220,13%,91%)] px-[2px]">
              {["Overview", "Features", "Pricing", "FAQ"].map((label, i) => (
                <div
                  key={label}
                  className={cn(
                    "relative px-[3px] pb-[2px] pt-[1px] text-[3px] font-semibold leading-none",
                    i === 0 ? "text-primary" : "text-[hsl(220,8%,55%)]"
                  )}
                >
                  {label}
                  {i === 0 && (
                    <span className="absolute -bottom-[0.5px] left-0 right-0 h-[1px] bg-primary rounded-full" />
                  )}
                </div>
              ))}
            </div>
            <div className="pt-[3px] px-[2px] flex gap-[4px]">
              <img src={workspaceImg} alt="" className="w-[18px] h-[16px] rounded-[2px] object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[3.5px] font-bold text-[hsl(220,15%,15%)] leading-[1.3] mb-[1.5px]">What you'll learn</p>
                <p className="text-[3px] text-[hsl(220,8%,52%)] leading-[1.55]">A guided tour of every topic — from fundamentals to advanced patterns.</p>
              </div>
            </div>
          </div>
        </div>
      );
    case "vertical-tabs":
      return (
        <div className={wrapper}>
          <div className={cn(miniCard, "p-[3px] flex gap-[3px]")}>
            <div className="flex flex-col gap-[1.5px] w-[24px] border-r border-[hsl(220,13%,91%)] pr-[2px]">
              {["Intro", "Setup", "Usage", "FAQ"].map((label, i) => (
                <div
                  key={label}
                  className={cn(
                    "relative flex items-center gap-[2px] px-[2px] py-[1.5px] text-[3px] font-semibold rounded-[1.5px] text-left truncate",
                    i === 0 ? "bg-primary/10 text-primary" : "text-[hsl(220,8%,55%)]"
                  )}
                >
                  {i === 0 && (
                    <span className="absolute left-0 top-[1px] bottom-[1px] w-[0.75px] bg-primary rounded-full" />
                  )}
                  <span className={cn("w-[2px] h-[2px] rounded-full shrink-0", i === 0 ? "bg-primary" : "bg-[hsl(220,13%,80%)]")} />
                  <span className="truncate">{label}</span>
                </div>
              ))}
            </div>
            <div className="flex-1 min-w-0 pt-[1px]">
              <p className="text-[3.5px] font-bold text-[hsl(220,15%,15%)] leading-[1.3] mb-[1.5px]">Introduction</p>
              <p className="text-[3px] text-[hsl(220,8%,52%)] leading-[1.55] mb-[2px]">Welcome — here's everything you need to begin the journey.</p>
              <div className="h-[8px] rounded-[1.5px] bg-[hsl(220,14%,96%)] border border-[hsl(220,13%,93%)] flex items-center justify-center">
                <ImageIcon className="w-[4px] h-[4px] text-[hsl(220,8%,60%)]" aria-hidden="true" focusable="false" />
              </div>
            </div>
          </div>
        </div>
      );
    case "accordion":
      return (
        <div className={wrapper}>
          <div className={cn(miniCard, "p-[3px] space-y-[1.5px]")}>
            {[
              { q: "What's included in the course?", open: true },
              { q: "How long do I have access?", open: false },
              { q: "Is there a free trial available?", open: false },
            ].map((row, i) => (
              <div key={i} className={cn("rounded-[2px] border overflow-hidden", row.open ? "border-primary/30 bg-primary/[0.04]" : "border-[hsl(220,13%,91%)]")}>
                <div className="flex items-center justify-between px-[3px] h-[8px] gap-[3px]">
                  <span className={cn("text-[3px] font-semibold truncate", row.open ? "text-primary" : "text-[hsl(220,15%,22%)]")}>{row.q}</span>
                  <span className={cn("text-[4px] leading-none transition-transform shrink-0", row.open ? "rotate-180 text-primary" : "rotate-0 text-[hsl(220,8%,55%)]")}>⌄</span>
                </div>
                {row.open && (
                  <div className="px-[3px] pt-[1px] pb-[2.5px] border-t border-primary/15">
                    <p className="text-[3px] text-[hsl(220,8%,48%)] leading-[1.55]">12 lessons, 4 hands-on projects, and full lifetime access on any device.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    case "flashcards":
      return (
        <div className={wrapper}>
          <div className={cn(miniCard, "p-[4px] flex items-center justify-center gap-[5px] h-[44px]")}>
            {/* Front card (UNO-style) */}
            <div
              className="relative w-[22px] h-[34px] rounded-[3px] p-[1.5px] shadow-[0_1px_2px_rgba(0,0,0,0.2)] -rotate-[8deg]"
              style={{ background: "linear-gradient(135deg,#0EA5E9,#0369A1)" }}
            >
              <div className="w-full h-full rounded-[2px] bg-white flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-[1.5px] rounded-[1.5px] border border-[#0EA5E9]/30" />
                <span className="text-[3px] font-bold tracking-wide" style={{ color: "#0C4A6E" }}>TERM</span>
              </div>
            </div>
            {/* Back card */}
            <div
              className="relative w-[22px] h-[34px] rounded-[3px] p-[1.5px] shadow-[0_1px_2px_rgba(0,0,0,0.2)] rotate-[8deg]"
              style={{ background: "linear-gradient(135deg,#F59E0B,#B45309)" }}
            >
              <div className="w-full h-full rounded-[2px] bg-white flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-[1.5px] rounded-[1.5px] border border-[#F59E0B]/35" />
                <span className="text-[3px] font-bold tracking-wide" style={{ color: "#713F12" }}>DEF</span>
              </div>
            </div>
          </div>
        </div>
      );
    case "card-sort":
      return (
        <div className={wrapper}>
          <div className={cn(miniCard, "p-[3px] h-[44px] flex flex-col justify-center gap-[2px]")}>
            {/* UNO-style card carousel */}
            <div className="flex items-center justify-center gap-[2px]">
              <span className="text-[4px] text-[hsl(220,13%,60%)] leading-none">‹</span>
              <div className="relative w-[16px] h-[14px]">
                <div className="absolute inset-0 rounded-[2px] bg-white border border-[hsl(220,13%,82%)] shadow-[0_0.5px_1px_rgba(0,0,0,0.08)] rotate-[-4deg] translate-x-[-1px]" />
                <div className="absolute inset-0 rounded-[2px] bg-white border border-primary/40 shadow-[0_0.5px_1.5px_rgba(0,0,0,0.1)] flex items-center justify-center">
                  <span className="text-[3.5px] font-semibold text-[hsl(220,15%,25%)]">Card</span>
                </div>
              </div>
              <span className="text-[4px] text-[hsl(220,13%,60%)] leading-none">›</span>
            </div>
            {/* Category rows */}
            <div className="flex flex-col gap-[1.5px]">
              <div className="rounded-[2px] border border-dashed border-[hsl(220,13%,78%)] bg-[hsl(220,14%,97%)] h-[8px] flex items-center px-[3px]">
                <span className="text-[3px] font-bold text-[hsl(220,15%,25%)]">A</span>
              </div>
              <div className="rounded-[2px] border border-dashed border-[hsl(220,13%,78%)] bg-[hsl(220,14%,97%)] h-[8px] flex items-center px-[3px]">
                <span className="text-[3px] font-bold text-[hsl(220,15%,25%)]">B</span>
              </div>
            </div>
          </div>
        </div>
      );

    case "divider-line":

      return (
        <div className={wrapper}>
          <div className={cn(miniCard, "p-2 flex items-center justify-center gap-[2px] h-[44px]")}>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[hsl(220,13%,80%)]" />
            <div className="w-[3px] h-[3px] rotate-45 border border-[hsl(220,13%,75%)] bg-white" />
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[hsl(220,13%,80%)]" />
          </div>
        </div>
      );
    case "divider-numbered":
      return (
        <div className={wrapper}>
          <div className={cn(miniCard, "p-2 flex items-center justify-center gap-[3px] h-[44px]")}>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[hsl(220,13%,82%)]" />
            <div className="flex items-center gap-[2px] pl-[2px] pr-[3px] py-[1px] rounded-full border border-[hsl(220,13%,88%)] bg-white shadow-[0_0.5px_1px_rgba(0,0,0,0.06)]">
              <div className="w-[8px] h-[8px] rounded-full bg-gradient-to-br from-primary to-[hsl(var(--primary)/0.75)] text-white text-[4px] font-bold flex items-center justify-center">2</div>
              <span className="text-[4px] font-semibold text-[hsl(220,15%,20%)]">Step</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[hsl(220,13%,82%)]" />
          </div>
        </div>
      );
    case "spacer":
      return (
        <div className={wrapper}>
          <div className={cn(miniCard, "p-[3px] h-[44px] flex flex-col justify-center gap-[2px]")}>
            <div className="h-[2px] rounded bg-[hsl(220,13%,90%)] w-4/5" />
            <div className="my-[2px] h-[10px] rounded-[3px] border border-dashed border-[hsl(220,13%,78%)] bg-gradient-to-br from-[hsl(220,14%,98%)] to-[hsl(220,14%,95%)] flex items-center justify-between px-[3px]">
              <div className="flex flex-col justify-between h-full py-[1px] opacity-60">
                {[0,1].map(i => <span key={i} className="block w-[2px] h-px bg-[hsl(220,8%,55%)]" />)}
              </div>
              <span className="text-[4px] font-semibold text-[hsl(220,8%,45%)] uppercase tracking-wider">40</span>
              <div className="flex flex-col justify-between h-full py-[1px] opacity-60">
                {[0,1].map(i => <span key={i} className="block w-[2px] h-px bg-[hsl(220,8%,55%)]" />)}
              </div>
            </div>
            <div className="h-[2px] rounded bg-[hsl(220,13%,90%)] w-2/3" />
          </div>
        </div>
      );
    case "continue-button":
      return (
        <div className={wrapper}>
          <div className={cn(miniCard, "p-2 flex items-center justify-center h-[44px]")}>
            <div className="relative inline-flex items-center gap-[3px] rounded-full pl-[6px] pr-[2px] py-[2px] bg-gradient-to-b from-primary to-[hsl(var(--primary)/0.85)] shadow-[0_1.5px_4px_-1px_hsl(var(--primary)/0.5)]">
              <span className="absolute inset-x-[3px] top-0 h-px rounded-full bg-white/30" aria-hidden="true" />
              <span className="text-[5px] font-semibold text-white tracking-tight">Continue</span>
              <span className="w-[8px] h-[8px] rounded-full bg-white/20 flex items-center justify-center">
                <ArrowRight className="w-[5px] h-[5px] text-white" aria-hidden="true" focusable="false" />
              </span>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
}

function BlockGridItem({
  block,
  onClick,
  locked,
  lockedReason,
}: {
  block: BlockItem;
  onClick: () => void;
  locked?: boolean;
  lockedReason?: string;
}) {
  const handleDragStart = (e: React.DragEvent) => {
    if (locked) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData(
      "application/content-block",
      JSON.stringify({ templateId: block.id, categoryId: block.category })
    );
    e.dataTransfer.effectAllowed = "copy";
    if (e.dataTransfer.setDragImage && e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.currentTarget, 40, 20);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
  };

  return (
    <Tooltip delayDuration={400}>
      <TooltipTrigger asChild>
        <div
          role="button"
          tabIndex={locked ? -1 : 0}
          onClick={locked ? undefined : onClick}
          draggable={!locked}
          onDragStart={handleDragStart}
          onPointerDown={locked ? undefined : handlePointerDown}
          className={cn(
            "flex flex-col items-center justify-center gap-1.5 p-2 pb-2.5 rounded-xl border transition-all duration-200 select-none relative group",
            locked
              ? "opacity-50 cursor-not-allowed border-border/40 bg-muted/30"
              : "border-border/70 bg-[#ffffff] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_3px_12px_-2px_rgba(0,0,0,0.1)] hover:border-primary/30 cursor-grab active:cursor-grabbing active:scale-[0.97]"
          )}
        >
          {locked && (
            <div className="absolute top-1.5 right-1.5">
              <Lock className="w-3 h-3 text-muted-foreground" aria-hidden="true" focusable="false" />
            </div>
          )}
          <div className="w-full flex items-center justify-center overflow-hidden rounded-lg">
            <BlockThumbnail id={block.id} />
          </div>
          <span
            className={cn(
              "text-[10px] font-medium text-center leading-tight",
              locked ? "text-muted-foreground" : "text-muted-foreground group-hover:text-foreground"
            )}
          >
            {block.label}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={8}
        className="p-0 overflow-hidden rounded-xl border border-border shadow-lg bg-popover max-w-[240px]"
      >
        <div className="border-b border-border/60 bg-muted/30">
          <BlockPreview id={block.id} />
        </div>
        <div className="px-3 py-2">
          <p className="text-xs font-semibold text-foreground">{block.label}</p>
          {locked && lockedReason ? (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 leading-snug mt-0.5 flex items-center gap-1">
              <Lock className="w-3 h-3 shrink-0" aria-hidden="true" focusable="false" />
              {lockedReason}
            </p>
          ) : (
            <>
              {block.description && (
                <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{block.description}</p>
              )}
              <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                <GripVertical className="w-2.5 h-2.5" aria-hidden="true" focusable="false" />
                Click or drag to add
              </p>
            </>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export function ContentBlocksPanel({ onAddBlock, onOpenQuizGenerator, aiEnabled = false }: ContentBlocksPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBlocks = searchQuery.trim()
    ? ALL_BLOCKS.filter((b) => b.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : ALL_BLOCKS;

  // Group by category preserving order
  const grouped: { label: string; blocks: BlockItem[] }[] = [];
  for (const block of filteredBlocks) {
    const existing = grouped.find((g) => g.label === block.categoryLabel);
    if (existing) {
      existing.blocks.push(block);
    } else {
      grouped.push({ label: block.categoryLabel, blocks: [block] });
    }
  }

  const handleClick = (block: BlockItem) => {
    onAddBlock(block.type, block.variant);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full -m-4">
        {/* Search */}
        <div className="px-4 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" focusable="false" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search blocks…"
              className="pl-9 h-9 bg-background border-border focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-primary/50 text-sm"
            />
          </div>
        </div>

        {/* Blocks grid */}
        <div className="flex-1 overflow-y-auto thin-scrollbar px-4 pb-4">
          {grouped.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No blocks found</p>
          )}

          {grouped.map((group) => (
            <div key={group.label}>
              {/* Category label */}
              <div className="pt-4 pb-3 flex items-center gap-2">
                <span className="text-[10px] font-semibold text-muted-foreground tracking-[0.14em] uppercase whitespace-nowrap">
                  {group.label}
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
              </div>

              {/* 3-column grid */}
              <div className="grid grid-cols-3 gap-2.5">
                {group.blocks.map((block) => {
                  const isQuizLocked = block.id === "quiz-block" && !aiEnabled;
                  return (
                    <BlockGridItem
                      key={block.id}
                      block={block}
                      onClick={() => handleClick(block)}
                      locked={isQuizLocked}
                      lockedReason={isQuizLocked ? "Enable AI Support to use Quiz generation" : undefined}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
