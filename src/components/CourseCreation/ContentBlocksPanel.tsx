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
  type: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description" | "video-description";
  variant?: string;
  locked?: boolean;
  isQuizGenerator?: boolean;
  description?: string;
}

interface ContentBlocksPanelProps {
  onAddBlock: (type: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description" | "video-description", variant?: string) => void;
  onOpenQuizGenerator?: () => void;
  aiEnabled?: boolean;
}

const ALL_BLOCKS: BlockItem[] = [
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
  // DOCUMENT
  { id: "doc-upload", label: "Document", icon: FileText, category: "doc", categoryLabel: "DOCUMENT", type: "doc", variant: "doc-upload", description: "Upload a PDF document" },
  // ASSESSMENT
  { id: "question-block", label: "Question", icon: HelpCircle, category: "assessment", categoryLabel: "QUESTION & QUIZ", type: "quiz", variant: "question-block", description: "Add a single question with answer options" },
  { id: "quiz-block", label: "Quiz", icon: MessageCircleQuestion, category: "assessment", categoryLabel: "QUESTION & QUIZ", type: "quiz", variant: "quiz-block", description: "Add a full quiz — one per page" },
];

/** Resolve a dropped template into a block type and variant. Returns null for quiz-generate (needs dialog). */
export function resolveTemplateDropData(
  templateId: string,
  categoryId: string
): { type: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description" | "video-description"; variant?: string } | null {
  const block = ALL_BLOCKS.find((b) => b.id === templateId);
  if (!block || block.isQuizGenerator) return null;
  return { type: block.type, variant: block.variant };
}

/** Hover tooltip preview — looks like a real rendered page section */
function BlockPreview({ id }: { id: string }) {
  const card = "bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-[hsl(220,13%,91%)] overflow-hidden";

  switch (id) {
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
    default:
      return null;
  }
}

/** Miniature thumbnails — styled as tiny page screenshots with real images and text */
function BlockThumbnail({ id }: { id: string }) {
  const wrapper = "w-full rounded-[6px] bg-[hsl(220,14%,96%)] p-[5px] overflow-hidden";
  const miniCard = "bg-white rounded-[4px] shadow-[0_0.5px_2px_rgba(0,0,0,0.07)] border border-[hsl(220,13%,91%)]";

  switch (id) {
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
