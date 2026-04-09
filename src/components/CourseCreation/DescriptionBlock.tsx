import { useRef, useState, useEffect } from "react";
import { GripVertical, Copy, Trash2, LayoutGrid, Type, Columns2, Columns3, Heading, GitBranch, Sparkles, History, Clock, RotateCcw } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DescriptionEditor } from "./DescriptionEditor";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";

interface DescriptionBlockProps {
  id: string;
  content: string;
  onChange: (content: string) => void;
  onClear: () => void;
  onDuplicate: () => void;
}

type LayoutType = "heading-text" | "text-only" | "two-columns" | "three-columns";

const COL_SEPARATOR = "<!--col-break-->";

const layoutOptions: { id: LayoutType; label: string; icon: React.ComponentType<{ className?: string }>; columns: number }[] = [
  { id: "heading-text", label: "Heading and text", icon: Heading, columns: 1 },
  { id: "text-only", label: "Text", icon: Type, columns: 1 },
  { id: "two-columns", label: "Two columns", icon: Columns2, columns: 2 },
  { id: "three-columns", label: "Three columns", icon: Columns3, columns: 3 },
];

function detectLayout(content: string): LayoutType {
  if (content.startsWith("<!--layout:")) {
    const match = content.match(/<!--layout:(\w[\w-]*)-->/);
    if (match) return match[1] as LayoutType;
  }
  return "text-only";
}

function encodeContent(layout: LayoutType, columns: string[]): string {
  if (layout === "text-only") return columns[0] || "";
  return `<!--layout:${layout}-->${columns.join(COL_SEPARATOR)}`;
}

function decodeColumns(content: string, layout: LayoutType): string[] {
  const colCount = layoutOptions.find((o) => o.id === layout)?.columns ?? 1;
  if (layout === "text-only") return [content.replace(/<!--layout:\w[\w-]*-->/, "")];
  const raw = content.replace(/<!--layout:\w[\w-]*-->/, "");
  const parts = raw.split(COL_SEPARATOR);
  // Pad to expected column count
  while (parts.length < colCount) parts.push("<p></p>");
  return parts.slice(0, colCount);
}

const defaultContent: Record<LayoutType, string[]> = {
  "heading-text": ["<h2>Heading</h2><p>Start writing your content here...</p>"],
  "text-only": ["<p>Start writing your content here...</p>"],
  "two-columns": ["<h2>Heading</h2><p>Start writing here...</p>", "<h2>Heading</h2><p>Start writing here...</p>"],
  "three-columns": ["<h2>Column 1</h2><p>Start writing here...</p>", "<h2>Column 2</h2><p>Start writing here...</p>", "<h2>Column 3</h2><p>Start writing here...</p>"],
};

export function DescriptionBlock({
  id,
  content,
  onChange,
  onClear,
  onDuplicate,
}: DescriptionBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLayoutOpen, setIsLayoutOpen] = useState(false);
  const [layout, setLayout] = useState<LayoutType>(() => detectLayout(content));
  const [versionDialogCol, setVersionDialogCol] = useState<number | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const blockRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (!isEditing) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (blockRef.current && !blockRef.current.contains(e.target as Node)) {
        setIsEditing(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing]);

  const columns = decodeColumns(content, layout);

  const getMockVersionsForColumn = (colIndex: number) => [
    {
      id: 1,
      content: columns[colIndex] || "<p>Current version content</p>",
      editedBy: "You",
      editedAt: new Date(),
    },
    {
      id: 2,
      content: `<h2>Previous Draft</h2><p>An earlier version of column ${colIndex + 1} with different content.</p>`,
      editedBy: "AI Assistant",
      editedAt: new Date(Date.now() - 86400000),
    },
    {
      id: 3,
      content: `<p>Initial draft of column ${colIndex + 1} created during course setup.</p>`,
      editedBy: "You",
      editedAt: new Date(Date.now() - 3 * 86400000),
    },
  ];

  const hasContent = columns.some(
    (col) => col && col !== "<p></p>" && col.replace(/<[^>]*>/g, "").trim() !== ""
  );

  const handleColumnChange = (colIndex: number, newContent: string) => {
    const updated = [...columns];
    updated[colIndex] = newContent;
    onChange(encodeContent(layout, updated));
  };

  const handleLayoutChange = (newLayout: LayoutType) => {
    setLayout(newLayout);
    const newCols = defaultContent[newLayout];
    onChange(encodeContent(newLayout, newCols));
    setIsEditing(true);
  };

  const colCount = layoutOptions.find((o) => o.id === layout)?.columns ?? 1;

  const SidebarButton = ({
    icon: Icon,
    label,
    onClick,
    className: btnClass,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    onClick?: () => void;
    className?: string;
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className={cn(
            "p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
            btnClass
          )}
          aria-label={label}
        >
          <Icon className="w-4 h-4" aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="left" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );

  const renderPreview = () => {
    if (!hasContent) {
      return (
        <span className="text-lg text-muted-foreground italic">
          Tell your learners what the course will be about...
        </span>
      );
    }

    if (colCount > 1) {
      return (
        <div className={cn("grid gap-6", colCount === 3 ? "grid-cols-3" : "grid-cols-2")}>
          {columns.map((col, i) => (
            <div
              key={i}
              className="prose prose-sm dark:prose-invert max-w-none text-foreground break-words [overflow-wrap:anywhere] text-lg leading-relaxed [&_h2]:!text-[1.75rem] [&_h2]:!font-semibold [&_h2]:!leading-tight"
              dangerouslySetInnerHTML={{ __html: col }}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        className="prose prose-sm dark:prose-invert max-w-none text-foreground break-words [overflow-wrap:anywhere] text-lg leading-relaxed [&_h2]:!text-[1.75rem] [&_h2]:!font-semibold [&_h2]:!leading-tight"
        dangerouslySetInnerHTML={{ __html: columns[0] }}
      />
    );
  };

  const renderEditor = () => {
    if (colCount > 1) {
      return (
        <div className={cn("grid gap-4", colCount === 3 ? "grid-cols-3" : "grid-cols-2")}>
          {columns.map((col, i) => (
            <div key={i} className="min-w-0">
              <DescriptionEditor content={col} onChange={(val) => handleColumnChange(i, val)} />
              <div className="flex items-center gap-2 mt-2 px-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full px-4 gap-1.5 h-8 text-xs bg-primary/5 text-primary hover:bg-primary/10 border border-primary/15"
                >
                  <Sparkles className="w-3 h-3" />
                  Ask AI
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full px-4 gap-1.5 h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/60"
                  onClick={() => {
                    setVersionDialogCol(i);
                    setSelectedVersionId(null);
                  }}
                >
                  <GitBranch className="w-3 h-3" />
                  Version History
                </Button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return <DescriptionEditor content={columns[0]} onChange={(val) => handleColumnChange(0, val)} />;
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        (blockRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      style={style}
      className={cn(
        "group/desc relative animate-fade-in transition-shadow duration-200 min-w-0",
        isDragging && "z-50 opacity-90 shadow-xl rounded-lg scale-[1.02]"
      )}
    >
      {/* Sidebar actions */}
      <div className={cn("absolute -left-11 top-1 flex flex-col items-center gap-0.5 transition-all duration-200 bg-background/90 backdrop-blur-sm border border-border/60 rounded-xl p-1.5 shadow-sm", isLayoutOpen ? "opacity-100" : "opacity-0 group-hover/desc:opacity-100")}>
        <SidebarButton
          icon={GripVertical}
          label="Drag to reorder"
          className="cursor-grab active:cursor-grabbing"
        />

        {/* Change layout popover */}
        <Popover open={isLayoutOpen} onOpenChange={setIsLayoutOpen}>
          <PopoverTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Change description layout"
            >
              <LayoutGrid className="w-4 h-4" aria-hidden="true" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="left" align="start" className="w-48 p-0">
            <div className="px-3 pt-3 pb-1.5">
              <p className="text-xs font-medium text-muted-foreground">Change layout</p>
            </div>
            <div className="px-1.5 pb-1.5">
              {layoutOptions.map((opt) => {
                const Icon = opt.icon;
                const isActive = layout === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLayoutChange(opt.id);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        <SidebarButton icon={Copy} label="Duplicate" onClick={onDuplicate} />
        <SidebarButton
          icon={Trash2}
          label="Clear"
          onClick={onClear}
          className="hover:text-destructive"
        />
      </div>

      {/* Drag handle overlay */}
      <div
        {...attributes}
        {...listeners}
        role="button"
        tabIndex={0}
        className="absolute -left-11 top-1 w-10 h-8 cursor-grab active:cursor-grabbing z-10 opacity-0 group-hover/desc:opacity-100"
        aria-label="Drag to reorder description block"
      />

      {/* Content area */}
      <div className="w-full">
        {isEditing ? (
          renderEditor()
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full text-left px-4 py-3 rounded-lg border border-transparent hover:border-foreground/20 hover:bg-background/30 transition-all duration-200 cursor-text overflow-hidden max-w-full"
          >
            {renderPreview()}
          </button>
        )}
      </div>

      {/* Per-column Version History Dialog */}
      <Dialog open={versionDialogCol !== null} onOpenChange={(open) => {
        if (!open) {
          setVersionDialogCol(null);
          setSelectedVersionId(null);
        }
      }}>
        <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[85vw] lg:max-w-4xl h-[85vh] sm:h-[80vh] p-0 flex flex-col overflow-hidden">
          <DialogHeader className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b flex-shrink-0">
            <DialogTitle className="text-sm sm:text-base md:text-lg font-bold flex items-center gap-2">
              <History className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
              Version History — Column {(versionDialogCol ?? 0) + 1}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
              View and restore previous versions of this column
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-2 sm:py-3 border-b bg-muted/30 flex-shrink-0">
            <div className="flex items-center gap-2">
              <GitBranch className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
              <span className="text-xs sm:text-sm font-medium">All Versions</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {versionDialogCol !== null ? getMockVersionsForColumn(versionDialogCol).length : 0} versions
            </Badge>
          </div>

          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-3 px-3 sm:px-4 md:px-6 py-3 sm:py-4">
              {versionDialogCol !== null && getMockVersionsForColumn(versionDialogCol).map((version, index) => {
                const isCurrentVersion = index === 0;
                return (
                  <div
                    key={version.id}
                    className={cn(
                      "border rounded-lg p-3 sm:p-4 transition-all hover:border-primary/50 bg-card shadow-sm relative",
                      isCurrentVersion && "border-primary/40 bg-primary/[0.03] ring-1 ring-primary/15",
                      selectedVersionId === version.id && "border-primary bg-primary/5"
                    )}
                    onClick={() => setSelectedVersionId(version.id)}
                  >
                    {isCurrentVersion && (
                      <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-primary" />
                    )}
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-sm">
                              Version {getMockVersionsForColumn(versionDialogCol).length - index}
                            </h4>
                            {isCurrentVersion && (
                              <Badge variant="secondary" className="text-[11px] px-2.5 py-0.5 h-5 font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full">Current</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span>{version.editedAt.toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric'
                            })} at {version.editedAt.toLocaleTimeString('en-US', {
                              hour: '2-digit', minute: '2-digit'
                            })}</span>
                            <span className="text-muted-foreground">·</span>
                            <span>{version.editedBy}</span>
                          </div>
                        </div>
                        {!isCurrentVersion && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (versionDialogCol !== null) {
                                handleColumnChange(versionDialogCol, version.content);
                                setVersionDialogCol(null);
                                setSelectedVersionId(null);
                              }
                            }}
                            className="flex-shrink-0 h-7 sm:h-8 text-xs px-2 sm:px-3 rounded-full"
                          >
                            <RotateCcw className="w-3 h-3 mr-1.5" />
                            Restore Version
                          </Button>
                        )}
                      </div>

                      <div className="bg-muted/50 rounded-lg p-3 border overflow-hidden">
                        <div
                          className="prose prose-sm dark:prose-invert max-w-none line-clamp-4 break-words"
                          style={{ overflowWrap: 'anywhere' }}
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(version.content) }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
