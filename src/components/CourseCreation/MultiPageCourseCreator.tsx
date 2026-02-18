import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, Play, Share2, Plus, Type, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ContentBlock } from "./ContentBlock";

interface MultiPageCourseCreatorProps {
  courseTitle: string;
}

interface CourseItem {
  id: string;
  type: "section" | "page" | "question";
  title: string;
  children?: CourseItem[];
}

interface ContentBlockData {
  id: string;
  type: "text" | "image";
  content: string;
}

export function MultiPageCourseCreator({ courseTitle }: MultiPageCourseCreatorProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState(courseTitle);
  const [contentBlocks, setContentBlocks] = useState<ContentBlockData[]>([]);
  const [items, setItems] = useState<CourseItem[]>([]);

  const addTextBlock = () => {
    const newBlock: ContentBlockData = {
      id: `block-${Date.now()}`,
      type: "text",
      content: "",
    };
    setContentBlocks((prev) => [...prev, newBlock]);
  };

  const updateBlockContent = (id: string, content: string) => {
    setContentBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, content } : b))
    );
  };

  const deleteBlock = (id: string) => {
    setContentBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const duplicateBlock = (id: string) => {
    setContentBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const clone = { ...prev[idx], id: `block-${Date.now()}` };
      const next = [...prev];
      next.splice(idx + 1, 0, clone);
      return next;
    });
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleAddItem = (type: "section" | "page" | "question") => {
    const newItem: CourseItem = {
      id: `${type}-${Date.now()}`,
      type,
      title: type === "section" ? "New Section" : type === "page" ? "New Page" : "New Question",
    };
    setItems([...items, newItem]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="flex flex-col min-w-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-md px-2 py-1 w-fit">
                    Multi-page layout
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-background border border-border w-[150px]">
                  <DropdownMenuItem className="cursor-pointer">
                    Multi-page layout
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    Single-page layout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm font-medium text-foreground mt-0.5 truncate max-w-[180px] sm:max-w-[250px] lg:max-w-[350px] cursor-default">
                    {title.length > 40 ? `${title.slice(0, 40)}...` : title}
                  </span>
                </TooltipTrigger>
                {title.length > 40 && (
                  <TooltipContent side="bottom" className="max-w-[300px] text-sm">
                    {title}
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-border"
            >
              <Play className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-primary text-primary hover:bg-primary/5 gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Publish</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
        {/* Left Panel - Course Overview */}
        <div className="lg:w-1/2 relative overflow-hidden flex flex-col">
          {/* Blue gradient background with decorative shapes */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 pointer-events-none">
            {/* Decorative shapes */}
            <div className="absolute bottom-0 left-0 w-full h-1/3">
              <svg
                viewBox="0 0 800 300"
                className="w-full h-full"
                preserveAspectRatio="xMidYMax slice"
              >
                <ellipse
                  cx="200"
                  cy="350"
                  rx="300"
                  ry="200"
                  fill="hsl(var(--primary) / 0.15)"
                />
                <ellipse
                  cx="600"
                  cy="400"
                  rx="250"
                  ry="180"
                  fill="hsl(var(--primary) / 0.1)"
                />
                <ellipse
                  cx="400"
                  cy="380"
                  rx="200"
                  ry="150"
                  fill="hsl(var(--primary) / 0.08)"
                />
              </svg>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="relative z-10 flex-1 min-h-[300px]">
            <div className="p-6 sm:p-10 lg:p-16">
              {/* Course Title */}
              <div className="relative group">
                <textarea
                  value={title}
                  onChange={(e) => {
                    if (e.target.value.length <= 275) {
                      setTitle(e.target.value);
                    }
                  }}
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground bg-transparent border-none outline-none w-full placeholder:text-foreground/40 resize-none overflow-hidden leading-tight"
                  placeholder="Untitled course"
                  rows={1}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = target.scrollHeight + 'px';
                  }}
                />
                {/* Active underline - only visible when focused */}
                <div className="absolute bottom-0 left-0 w-full h-px bg-transparent group-focus-within:bg-primary transition-colors duration-200" />
              </div>
              
              {/* Character count */}
              <div className="mt-2">
                <span className="inline-block px-2 py-0.5 text-xs text-muted-foreground bg-background/80 rounded border border-border">
                  {title.length}/ 275
                </span>
              </div>

              {/* Decorative Underline */}
              <div className="mt-4 mb-8">
                <div className="h-1 bg-primary/30 rounded-full w-full" />
              </div>

              {/* Content Blocks */}
              <div className="mt-6 space-y-4">
                {contentBlocks.map((block) => (
                  <ContentBlock
                    key={block.id}
                    id={block.id}
                    type={block.type}
                    content={block.content}
                    onChange={(content) => updateBlockContent(block.id, content)}
                    onDelete={() => deleteBlock(block.id)}
                    onDuplicate={() => duplicateBlock(block.id)}
                    autoFocus={!block.content}
                  />
                ))}

                {/* Add content button */}
                <div className="group flex items-center justify-center mt-3">
                  <div className="flex-1 h-px bg-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <Popover>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <button className="mx-3 w-7 h-7 rounded-full border border-foreground/30 flex items-center justify-center bg-background/50 hover:bg-background hover:border-primary/50 hover:scale-110 transition-all duration-200">
                            <Plus className="w-3.5 h-3.5 text-foreground/50" />
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
                        onClick={addTextBlock}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Type className="w-4 h-4" />
                      </button>
                      <div className="w-px h-5 bg-border" />
                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Image className="w-4 h-4" />
                      </button>
                    </PopoverContent>
                  </Popover>
                  <div className="flex-1 h-px bg-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Course Outline */}
        <div className="lg:w-1/2 bg-background border-t lg:border-t-0 lg:border-l border-border flex flex-col overflow-y-auto">
            <div className="p-6 sm:p-10">
              {/* Instructions */}
              <p className="text-muted-foreground mb-6">
                Add sections, pages, and questions to build your course outline
              </p>

              {/* Add Item Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 border-border hover:border-primary/50"
                  >
                    <Plus className="w-4 h-4" />
                    Add item
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-background border border-border">
                  <DropdownMenuItem
                    onClick={() => handleAddItem("section")}
                    className="cursor-pointer"
                  >
                    <div className="w-3 h-3 rounded bg-primary/20 mr-2" />
                    Section
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleAddItem("page")}
                    className="cursor-pointer"
                  >
                    <div className="w-3 h-3 rounded bg-muted-foreground/20 mr-2" />
                    Page
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleAddItem("question")}
                    className="cursor-pointer"
                  >
                    <div className="w-3 h-3 rounded bg-primary/10 mr-2" />
                    Question
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Course Items */}
              {items.length > 0 && (
                <div className="mt-6 space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors cursor-pointer",
                        item.type === "section" && "border-l-4 border-l-primary"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            item.type === "section" && "bg-primary",
                            item.type === "page" && "bg-muted-foreground",
                            item.type === "question" && "bg-primary/50"
                          )}
                        />
                        <span className="text-sm font-medium text-foreground">
                          {item.title}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize ml-auto">
                          {item.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {items.length === 0 && (
                <div className="mt-16 border-t border-dashed border-border pt-8">
                  <p className="text-sm text-muted-foreground text-center">
                    Your course outline will appear here
                  </p>
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
