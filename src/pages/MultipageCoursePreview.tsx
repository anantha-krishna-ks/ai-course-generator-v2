import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, BookOpen, ChevronDown, ChevronRight, Play, Image as ImageIcon, FileText, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";

interface CourseItem {
  id: string;
  type: "section" | "page" | "question";
  title: string;
  children?: CourseItem[];
}

interface PageContentBlock {
  id: string;
  type: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description";
  content: string;
}

interface ContentBlockData {
  id: string;
  type: "text" | "image" | "description";
  content: string;
}

interface PreviewState {
  title: string;
  items: CourseItem[];
  contentBlocks: ContentBlockData[];
  pageBlocksMap: Record<string, PageContentBlock[]>;
}

const MultipageCoursePreview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState<PreviewState | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const state = location.state as PreviewState | null;
    if (!state) {
      navigate("/dashboard", { replace: true });
      return;
    }
    setData(state);
    // Auto-expand all sections
    const sections = new Set<string>();
    state.items.forEach((item) => {
      if (item.type === "section") sections.add(item.id);
    });
    setExpandedSections(sections);
  }, [location.state, navigate]);

  if (!data) return null;

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Flatten all navigable items (pages & questions)
  const getAllPages = (): CourseItem[] => {
    const pages: CourseItem[] = [];
    data.items.forEach((item) => {
      if (item.type === "page" || item.type === "question") {
        pages.push(item);
      } else if (item.type === "section" && item.children) {
        item.children.forEach((child) => pages.push(child));
      }
    });
    return pages;
  };

  const allPages = getAllPages();

  // Get description from intro content blocks
  const descriptionBlock = data.contentBlocks.find((b) => b.type === "description");
  const descriptionText = descriptionBlock?.content || "";

  // Get hero image from content blocks
  const heroImageBlock = data.contentBlocks.find((b) => b.type === "image" && b.content);
  const heroImage = heroImageBlock?.content || "";

  // Count total pages
  const totalPages = allPages.length;

  // Current page content
  const currentPageBlocks = selectedId ? (data.pageBlocksMap[selectedId] || []) : [];

  // Find current page info
  const currentPage = selectedId
    ? allPages.find((p) => p.id === selectedId) ||
      data.items.find((i) => i.id === selectedId)
    : null;

  // Progress
  const currentIndex = selectedId ? allPages.findIndex((p) => p.id === selectedId) : -1;
  const progress = totalPages > 0 && currentIndex >= 0 ? Math.round(((currentIndex + 1) / totalPages) * 100) : 0;

  const goToNext = () => {
    if (currentIndex < allPages.length - 1) {
      setSelectedId(allPages[currentIndex + 1].id);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setSelectedId(allPages[currentIndex - 1].id);
    }
  };

  const renderBlockContent = (block: PageContentBlock) => {
    switch (block.type) {
      case "text":
        return (
          <div
            className="prose prose-sm max-w-none text-foreground"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.content) }}
          />
        );
      case "image":
        return block.content ? (
          <img src={block.content} alt="" className="w-full max-w-2xl rounded-xl shadow-sm" />
        ) : null;
      case "image-description": {
        try {
          const parsed = JSON.parse(block.content);
          return (
            <div className={cn("flex gap-6 items-start", parsed.layout === "image-right" ? "flex-row-reverse" : "flex-row")}>
              {parsed.image && (
                <img src={parsed.image} alt="" className="w-1/2 rounded-xl shadow-sm object-cover" />
              )}
              <div className="flex-1 prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: sanitizeHtml(parsed.text || "") }} />
            </div>
          );
        } catch {
          return null;
        }
      }
      case "quiz":
        try {
          const questions = JSON.parse(block.content);
          if (!Array.isArray(questions)) return null;
          return (
            <div className="space-y-4">
              {questions.map((q: any, qi: number) => (
                <div key={qi} className="bg-muted/40 rounded-xl p-5 border border-border/60">
                  <p className="font-medium text-foreground mb-3">{qi + 1}. {q.text}</p>
                  <div className="space-y-2">
                    {q.answers?.map((a: any, ai: number) => (
                      <div key={ai} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-background border border-border/40 text-sm">
                        <div className="w-5 h-5 rounded-full border-2 border-border flex-shrink-0" />
                        <span>{a.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        } catch {
          return null;
        }
      default:
        return block.content ? (
          <div className="p-4 bg-muted/30 rounded-xl border border-border/40 text-sm text-muted-foreground">
            <span className="capitalize">{block.type}</span> content
          </div>
        ) : null;
    }
  };

  // Hero / Landing view
  if (!started) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium text-foreground">Course Preview</span>
          </div>
        </div>

        {/* Hero section */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-57px)]">
          {/* Left: Info */}
          <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-24 py-12 bg-primary/90">
            <div className="max-w-xl space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-sm font-bold">
                  {data.title.charAt(0).toUpperCase()}
                </div>
                <span className="text-primary-foreground/80 text-sm font-medium">Course</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-[1.1] tracking-tight">
                {data.title}
              </h1>

              {descriptionText && (
                <p className="text-primary-foreground/70 text-lg leading-relaxed max-w-md">
                  {descriptionText.substring(0, 200)}{descriptionText.length > 200 ? "..." : ""}
                </p>
              )}

              <div className="flex items-center gap-4 text-primary-foreground/60 text-sm">
                {totalPages > 0 && (
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    {totalPages} {totalPages === 1 ? "page" : "pages"}
                  </span>
                )}
                {data.items.filter((i) => i.type === "section").length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    {data.items.filter((i) => i.type === "section").length} sections
                  </span>
                )}
              </div>

              <Button
                onClick={() => {
                  setStarted(true);
                  if (allPages.length > 0) setSelectedId(allPages[0].id);
                }}
                className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 py-3 h-auto text-sm font-semibold uppercase tracking-wider"
              >
                Start Course
              </Button>
            </div>
          </div>

          {/* Right: Image */}
          <div className="flex-1 relative overflow-hidden bg-muted/20 min-h-[300px] lg:min-h-0">
            {heroImage ? (
              <img src={heroImage} alt={data.title} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted/40 to-muted/10">
                <div className="text-center space-y-3 text-muted-foreground/40">
                  <ImageIcon className="w-20 h-20 mx-auto" />
                  <p className="text-sm">Course Image</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Content view with sidebar
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setStarted(false)} className="rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-foreground truncate max-w-[200px]">{data.title}</span>
        </div>
        {/* Progress */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            You completed {progress}%
          </span>
          <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Content area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-3xl mx-auto px-6 sm:px-10 py-10 space-y-8">
            {currentPage ? (
              <>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                    {currentPage.title || "Untitled"}
                  </h2>
                  {currentPage.type === "question" && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Quiz</span>
                  )}
                </div>

                {currentPageBlocks.length > 0 ? (
                  <div className="space-y-6">
                    {currentPageBlocks.map((block) => (
                      <div key={block.id}>{renderBlockContent(block)}</div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center text-muted-foreground/50">
                    <FileText className="w-12 h-12 mx-auto mb-3" />
                    <p className="text-sm">No content on this page yet</p>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-8 border-t border-border/40">
                  <Button
                    variant="ghost"
                    onClick={goToPrev}
                    disabled={currentIndex <= 0}
                    className="gap-2 text-muted-foreground"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {currentIndex + 1} / {totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    onClick={goToNext}
                    disabled={currentIndex >= allPages.length - 1}
                    className="gap-2 text-muted-foreground"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-muted-foreground/50">
                <BookOpen className="w-16 h-16 mx-auto mb-4" />
                <p>Select a page from the outline to begin</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Outline sidebar */}
        <div className="w-[340px] border-l bg-muted/10 flex-shrink-0 hidden md:flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-5 space-y-1">
              {data.items.map((item) => {
                if (item.type === "section") {
                  const isExpanded = expandedSections.has(item.id);
                  const hasActiveChild = item.children?.some((c) => c.id === selectedId);
                  return (
                    <div key={item.id} className="mb-1">
                      {/* Section card */}
                      <div
                        className={cn(
                          "rounded-xl border bg-card p-4 cursor-pointer transition-colors",
                          hasActiveChild ? "border-primary/30 bg-primary/[0.03]" : "border-border/60 hover:border-border"
                        )}
                        onClick={() => toggleSection(item.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-lg bg-muted/60 border border-border/40 flex items-center justify-center flex-shrink-0">
                              <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
                            </div>
                            <span className="text-sm font-semibold text-foreground">{item.title || "Untitled section"}</span>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      {/* Children */}
                      {isExpanded && item.children && item.children.length > 0 && (
                        <div className="mt-1 space-y-0.5 pl-2">
                          {item.children.map((child) => (
                            <button
                              key={child.id}
                              onClick={() => setSelectedId(child.id)}
                              className={cn(
                                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors text-sm",
                                child.id === selectedId
                                  ? "bg-muted/60 text-foreground font-medium border-l-[3px] border-primary"
                                  : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                              )}
                            >
                              {child.type === "question" ? (
                                <HelpCircle className="w-4 h-4 flex-shrink-0" />
                              ) : (
                                <FileText className="w-4 h-4 flex-shrink-0" />
                              )}
                              <span className="truncate">{child.title || "Untitled page"}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                // Top-level page or question
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors text-sm",
                      item.id === selectedId
                        ? "bg-muted/60 text-foreground font-medium border-l-[3px] border-primary"
                        : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                    )}
                  >
                    {item.type === "question" ? (
                      <HelpCircle className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <FileText className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span className="truncate">{item.title || "Untitled page"}</span>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default MultipageCoursePreview;
