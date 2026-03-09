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

        <div className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-57px)]">
          {/* Left: Course intro card */}
          <div className="flex-1 relative overflow-hidden">
            {/* Background with hero image or gradient */}
            <div className="absolute inset-0">
              {heroImage ? (
                <img src={heroImage} alt="" className="w-full h-full object-cover opacity-30" />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20" />
            </div>

            <div className="relative z-10 flex flex-col justify-between h-full px-8 sm:px-12 lg:px-16 py-10">
              {/* Logo / brand */}

              {/* Title */}
              <div className="mt-auto space-y-6">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground leading-[1.1] tracking-tight">
                  {data.title}
                </h1>

                {/* Progress bar */}
                <div className="space-y-2 max-w-md">
                  <div className="w-full h-[2px] bg-border rounded-full" />
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                    You completed 0%
                  </span>
                </div>

                {/* Description / content preview */}
                {descriptionText && (
                  <div className="space-y-4 max-w-lg">
                    <p className="text-foreground/70 text-base leading-relaxed">
                      {descriptionText.substring(0, 300)}{descriptionText.length > 300 ? "..." : ""}
                    </p>
                  </div>
                )}

                {/* Start button */}
                <Button
                  onClick={() => {
                    setStarted(true);
                    if (allPages.length > 0) setSelectedId(allPages[0].id);
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-10 py-3 h-auto text-sm font-semibold uppercase tracking-wider shadow-lg"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Start Course
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Course outline */}
          <div className="w-full lg:w-[420px] xl:w-[480px] border-l bg-card flex-shrink-0 overflow-auto">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-1">
                <div className="mb-4">
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">Course Outline</h3>
                </div>
                {data.items.map((item) => {
                  if (item.type === "section") {
                    const isExpanded = expandedSections.has(item.id);
                    return (
                      <div key={item.id} className="mb-2">
                        <div
                          className="rounded-xl border border-border/60 bg-muted/30 p-4 cursor-pointer hover:border-primary/40 hover:bg-muted/50 transition-colors"
                          onClick={() => toggleSection(item.id)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-lg bg-card border border-border/40 flex items-center justify-center flex-shrink-0">
                              <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-semibold text-foreground block truncate">{item.title || "Untitled section"}</span>
                              {item.children && item.children.length > 0 && (
                                <span className="text-xs text-muted-foreground mt-0.5 block">
                                  {item.children.length} {item.children.length === 1 ? "page" : "pages"}
                                </span>
                              )}
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            )}
                          </div>
                        </div>
                        {isExpanded && item.children && item.children.length > 0 && (
                          <div className="mt-1 space-y-0.5 pl-3">
                            {item.children.map((child) => (
                              <button
                                key={child.id}
                                onClick={() => {
                                  setStarted(true);
                                  setSelectedId(child.id);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                              >
                                {child.type === "question" ? (
                                  <HelpCircle className="w-4 h-4 flex-shrink-0 text-muted-foreground/60" />
                                ) : (
                                  <FileText className="w-4 h-4 flex-shrink-0 text-muted-foreground/60" />
                                )}
                                <span className="truncate">{child.title || "Untitled page"}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setStarted(true);
                        setSelectedId(item.id);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left text-sm text-muted-foreground border-b border-border/30 last:border-b-0 hover:bg-muted/50 hover:text-foreground transition-colors cursor-pointer"
                    >
                      {item.type === "question" ? (
                        <HelpCircle className="w-4 h-4 flex-shrink-0 text-muted-foreground/60" />
                      ) : (
                        <BookOpen className="w-4 h-4 flex-shrink-0 text-muted-foreground/60" />
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
  }

  // Content view with left sidebar navigation + right content
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setStarted(false)} className="rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-foreground">Course Preview</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Sidebar with course info + outline */}
        <div className="w-[260px] flex-shrink-0 hidden md:flex flex-col border-r bg-card">
          {/* Course title card */}
          <div className="bg-primary p-5 space-y-4">
            <h2 className="text-lg font-bold text-primary-foreground leading-snug">
              {data.title}
            </h2>
            <div className="space-y-1.5">
              <div className="w-full h-1 bg-primary-foreground/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-foreground rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[11px] text-primary-foreground/70 uppercase tracking-widest font-semibold">
                {progress}% Complete
              </span>
            </div>
          </div>

          {/* Outline navigation */}
          <ScrollArea className="flex-1">
            <div className="py-2">
              {data.items.map((item) => {
                if (item.type === "section") {
                  const isExpanded = expandedSections.has(item.id);
                  const hasActiveChild = item.children?.some((c) => c.id === selectedId);
                  return (
                    <div key={item.id}>
                      <button
                        className={cn(
                          "w-full flex items-center justify-between px-5 py-3 text-left text-sm transition-colors border-l-[3px]",
                          hasActiveChild
                            ? "border-primary bg-primary/[0.04] text-foreground font-medium"
                            : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                        )}
                        onClick={() => toggleSection(item.id)}
                      >
                        <span className="truncate pr-2">{item.title || "Untitled section"}</span>
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
                        )}
                      </button>
                      {isExpanded && item.children && item.children.length > 0 && (
                        <div>
                          {item.children.map((child) => (
                            <button
                              key={child.id}
                              onClick={() => setSelectedId(child.id)}
                              className={cn(
                                "w-full flex items-center gap-2 pl-8 pr-5 py-2.5 text-left text-[13px] transition-colors border-l-[3px]",
                                child.id === selectedId
                                  ? "border-primary bg-primary/[0.06] text-foreground font-medium"
                                  : "border-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                              )}
                            >
                              {child.type === "question" ? (
                                <HelpCircle className="w-3.5 h-3.5 flex-shrink-0" />
                              ) : (
                                <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                              )}
                              <span className="truncate">{child.title || "Untitled page"}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-5 py-3 text-left text-sm transition-colors border-l-[3px]",
                      item.id === selectedId
                        ? "border-primary bg-primary/[0.06] text-foreground font-medium"
                        : "border-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                    )}
                  >
                    {item.type === "question" ? (
                      <HelpCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                    )}
                    <span className="truncate">{item.title || "Untitled page"}</span>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Right: Content area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-3xl mx-auto px-8 sm:px-12 py-10 space-y-8">
            {currentPage ? (
              <>
                {/* Page indicator */}
                <div className="space-y-3">
                  <span className="text-xs text-muted-foreground italic">
                    Page {currentIndex + 1} of {totalPages}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                    {currentPage.title || "Untitled"}
                  </h2>
                  {currentPage.type === "question" && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Quiz</span>
                  )}
                  <div className="w-16 h-[3px] bg-primary rounded-full" />
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
      </div>
    </div>
  );
};

export default MultipageCoursePreview;
