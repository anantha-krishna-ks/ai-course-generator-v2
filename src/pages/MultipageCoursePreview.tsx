import { useState, useEffect, useCallback } from "react";
import emptyPageIllustration from "@/assets/empty-page-illustration.png";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, BookOpen, ChevronDown, ChevronRight, Play, Image as ImageIcon, FileText, HelpCircle, Monitor, Tablet, Smartphone, Menu, X, Video, Music, Download, ExternalLink, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import type { MultiPageCourseCreatorRestoreState } from "@/components/CourseCreation/MultiPageCourseCreator";

interface CourseItem {
  id: string;
  type: "section" | "page" | "question";
  title: string;
  thumbnailUrl?: string;
  children?: CourseItem[];
}

interface PageContentBlock {
  id: string;
  type: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description" | "video-description";
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
  returnState?: MultiPageCourseCreatorRestoreState;
}

const MultipageCoursePreview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const previewState = location.state as PreviewState | null;
  const [data, setData] = useState<PreviewState | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [started, setStarted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [foldDirection, setFoldDirection] = useState<'in' | 'out' | null>(null);
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet-landscape' | 'tablet' | 'mobile'>('desktop');
  const [mobileOutlineOpen, setMobileOutlineOpen] = useState(false);

  const isMobileView = deviceView === 'mobile';
  const isTabletView = deviceView === 'tablet';
  const isLandscapeView = deviceView === 'tablet-landscape';
  const isCompactView = isMobileView || isTabletView || isLandscapeView;

  const startCourse = useCallback((pageId?: string, fallbackFirstId?: string) => {
    setFoldDirection('out');
    setTransitioning(true);
    setMobileOutlineOpen(false);
    setTimeout(() => {
      setStarted(true);
      setSelectedId(pageId || fallbackFirstId || null);
      setFoldDirection('in');
      setTimeout(() => {
        setFoldDirection(null);
        setTransitioning(false);
      }, 300);
    }, 250);
  }, []);

  const deviceSizes = {
    mobile: { width: '375px', label: 'Mobile' },
    tablet: { width: '580px', label: 'Tablet' },
    'tablet-landscape': { width: '620px', label: 'Landscape' },
    desktop: { width: '100%', label: 'Desktop' },
  };

  const devices = [
    { key: 'desktop' as const, icon: Monitor, label: 'Desktop' },
    { key: 'tablet' as const, icon: Tablet, label: 'Tablet' },
    { key: 'mobile' as const, icon: Smartphone, label: 'Mobile' },
    { key: 'tablet-landscape' as const, icon: Smartphone, label: 'Landscape', rotate: true },
  ];

  const DeviceToggle = () => (
    <div className="flex items-center gap-1.5 rounded-full bg-muted/50 p-1.5 border border-border">
      {devices.map(({ key, icon: Icon, label, rotate }) => {
        const isActive = deviceView === key;
        return (
          <button
            key={key}
            onClick={() => setDeviceView(key)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-background text-foreground shadow-sm border border-border/60"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            )}
            title={label}
          >
            <Icon className={cn("w-4 h-4", rotate && "rotate-90")} />
            {isActive && <span className="hidden sm:inline">{label}</span>}
          </button>
        );
      })}
    </div>
  );

  const isDeviceFramed = deviceView === 'mobile' || deviceView === 'tablet' || deviceView === 'tablet-landscape';

  const renderDeviceFrame = (children: React.ReactNode) => {
    if (!isDeviceFramed) return children;

    const isLandscape = deviceView === 'tablet-landscape';
    const isPhone = deviceView === 'mobile' || isLandscape;

    return (
      <div className="flex items-start justify-center py-6 px-4 overflow-auto flex-1">
        {/* Outer chassis */}
        <div
          className={cn(
            "relative flex-shrink-0 w-full",
            isPhone ? "rounded-[3rem] p-[10px]" : "rounded-[1.75rem] p-[10px]"
          )}
          style={{
            maxWidth: deviceSizes[deviceView as keyof typeof deviceSizes]?.width,
            background: 'linear-gradient(145deg, #f0f0f3 0%, #e4e4e9 30%, #d8d8de 100%)',
            boxShadow: [
              '0 25px 60px -12px rgba(0,0,0,0.15)',
              '0 12px 28px -8px rgba(0,0,0,0.1)',
              'inset 0 1px 0 rgba(255,255,255,0.9)',
              'inset 0 -1px 0 rgba(0,0,0,0.06)',
              '0 0 0 1px rgba(0,0,0,0.06)',
            ].join(', '),
          }}
        >
          {/* Side button details - power button (right) */}
          {isPhone && !isLandscape && (
            <>
              <div
                className="absolute right-[-2px] top-[120px] w-[3px] h-[40px] rounded-r-sm"
                style={{ background: 'linear-gradient(180deg, #c8c8ce, #b8b8c0, #c8c8ce)' }}
              />
              {/* Volume buttons (left) */}
              <div
                className="absolute left-[-2px] top-[100px] w-[3px] h-[28px] rounded-l-sm"
                style={{ background: 'linear-gradient(180deg, #c8c8ce, #b8b8c0, #c8c8ce)' }}
              />
              <div
                className="absolute left-[-2px] top-[140px] w-[3px] h-[28px] rounded-l-sm"
                style={{ background: 'linear-gradient(180deg, #c8c8ce, #b8b8c0, #c8c8ce)' }}
              />
              {/* Silent switch */}
              <div
                className="absolute left-[-2px] top-[68px] w-[3px] h-[16px] rounded-l-sm"
                style={{ background: 'linear-gradient(180deg, #c8c8ce, #b8b8c0, #c8c8ce)' }}
              />
            </>
          )}

          {/* Side buttons for landscape (rotated: power on top, volume on bottom) */}
          {isLandscape && (
            <>
              {/* Power button (top) */}
              <div
                className="absolute top-[-2px] right-[120px] h-[3px] w-[40px] rounded-t-sm"
                style={{ background: 'linear-gradient(90deg, #c8c8ce, #b8b8c0, #c8c8ce)' }}
              />
              {/* Volume buttons (bottom) */}
              <div
                className="absolute bottom-[-2px] right-[100px] h-[3px] w-[28px] rounded-b-sm"
                style={{ background: 'linear-gradient(90deg, #c8c8ce, #b8b8c0, #c8c8ce)' }}
              />
              <div
                className="absolute bottom-[-2px] right-[140px] h-[3px] w-[28px] rounded-b-sm"
                style={{ background: 'linear-gradient(90deg, #c8c8ce, #b8b8c0, #c8c8ce)' }}
              />
              {/* Silent switch (bottom, near left) */}
              <div
                className="absolute bottom-[-2px] right-[200px] h-[3px] w-[16px] rounded-b-sm"
                style={{ background: 'linear-gradient(90deg, #c8c8ce, #b8b8c0, #c8c8ce)' }}
              />
            </>
          )}

          {/* Tablet side buttons */}
          {deviceView === 'tablet' && (
            <>
              <div
                className="absolute right-[-2px] top-[60px] w-[3px] h-[32px] rounded-r-sm"
                style={{ background: 'linear-gradient(180deg, #c8c8ce, #b8b8c0, #c8c8ce)' }}
              />
              <div
                className="absolute top-[-2px] right-[70px] h-[3px] w-[28px] rounded-t-sm"
                style={{ background: 'linear-gradient(90deg, #c8c8ce, #b8b8c0, #c8c8ce)' }}
              />
              <div
                className="absolute top-[-2px] right-[106px] h-[3px] w-[28px] rounded-t-sm"
                style={{ background: 'linear-gradient(90deg, #c8c8ce, #b8b8c0, #c8c8ce)' }}
              />
            </>
          )}

          {/* Inner bezel - thin silver edge */}
          <div
            className={cn(
              "p-[2px]",
              isPhone ? "rounded-[2.5rem]" : "rounded-[1.25rem]"
            )}
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.7), rgba(255,255,255,0.3))',
            }}
          >
            {/* Screen bezel (very thin black border around screen) */}
            <div
              className={cn(
                "p-[2px] bg-[#c0c0c6]",
                isPhone ? "rounded-[2.4rem]" : "rounded-[1.15rem]"
              )}
            >
              {/* Dynamic Island (phone only) */}
              {deviceView === 'mobile' && (
                <div className="absolute top-[6px] left-1/2 -translate-x-1/2 z-20">
                  <div className="w-[40px] h-[4px] rounded-full" style={{ background: '#1a1a1e' }} />
                </div>
              )}

              {/* Dynamic Island - landscape (thin bar on left side) */}
              {isLandscape && (
                <div className="absolute left-[6px] top-1/2 -translate-y-1/2 z-20">
                  <div className="h-[40px] w-[4px] rounded-full" style={{ background: '#1a1a1e' }} />
                </div>
              )}

              {/* Front camera for tablet (small dot) */}
              {deviceView === 'tablet' && (
                <div className="absolute top-[16px] left-1/2 -translate-x-1/2 z-20">
                  <div className="w-[8px] h-[8px] rounded-full" style={{
                    background: 'radial-gradient(circle at 35% 35%, #1a2a4a, #0a0a15)',
                    boxShadow: '0 0 3px rgba(0,100,200,0.2), 0 0 0 1px rgba(100,100,110,0.3)',
                  }} />
                </div>
              )}

              {/* Screen */}
              <div className={cn(
                "overflow-auto bg-background relative flex flex-col",
                isPhone ? "rounded-[2.15rem]" : "rounded-[0.9rem]",
                deviceView === 'mobile' && "h-[620px]",
                deviceView === 'tablet' && "h-[600px]",
                deviceView === 'tablet-landscape' && "h-[375px]"
              )}>
                {/* Status bar glow effect at top */}
                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none opacity-50" />
                {children}
              </div>
            </div>
          </div>

          {/* Home indicator */}
          <div className="flex justify-center mt-2 mb-0.5">
            <div
              className={cn(
                "h-[4px] rounded-full",
                isPhone ? "w-[100px]" : "w-[80px]"
              )}
              style={{
                background: 'linear-gradient(90deg, rgba(0,0,0,0.06), rgba(0,0,0,0.12), rgba(0,0,0,0.06))',
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  const handleBack = useCallback(() => {
    if (previewState?.returnState) {
      navigate("/create-course-multipage", {
        replace: true,
        state: {
          title: previewState.returnState.title,
          layout: "multi-page",
          aiOptions: previewState.returnState.aiOptions,
          restoreState: previewState.returnState,
        },
      });
      return;
    }

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    if (previewState?.title) {
      navigate("/create-course-multipage", {
        replace: true,
        state: {
          title: previewState.title,
          layout: "multi-page",
        },
      });
      return;
    }

    navigate("/dashboard", { replace: true });
  }, [navigate, previewState]);

  useEffect(() => {
    const state = previewState;
    if (!state) {
      navigate("/dashboard", { replace: true });
      return;
    }
    setData(state);
    const sections = new Set<string>();
    state.items.forEach((item) => {
      if (item.type === "section") sections.add(item.id);
    });
    setExpandedSections(sections);
  }, [navigate, previewState]);

  if (!data) return null;

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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

  const descriptionBlock = data.contentBlocks.find((b) => b.type === "description");
  const descriptionRaw = descriptionBlock?.content || "";
  const descriptionLayoutMatch = descriptionRaw.match(/<!--layout:(\w[\w-]*)-->/);
  const descriptionLayout = descriptionLayoutMatch ? descriptionLayoutMatch[1] : "heading-text";
  const descriptionClean = descriptionRaw.replace(/<!--layout:\w[\w-]*-->/, "");
  const COL_SEP = "<!--col-break-->";
  const descriptionColumns = descriptionClean.includes(COL_SEP) ? descriptionClean.split(COL_SEP) : [descriptionClean];
  const descriptionText = descriptionClean.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]*>/g, "").trim();

  const heroImageBlock = data.contentBlocks.find((b) => b.type === "image" && b.content);
  const heroImage = heroImageBlock?.content || "";

  const totalPages = allPages.length;
  const currentPageBlocks = selectedId ? (data.pageBlocksMap[selectedId] || []) : [];
  const currentPage = selectedId
    ? allPages.find((p) => p.id === selectedId) || data.items.find((i) => i.id === selectedId)
    : null;
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

  const handleMobilePageSelect = (pageId: string) => {
    setSelectedId(pageId);
    setMobileOutlineOpen(false);
  };

  // Demo fallback content for preview
  const DEMO_VIDEO_URL = "/demo/Motion_Video.mp4";
  const DEMO_AUDIO_URL = "/demo/actAudio.mp3";
  const DEMO_PDF_URL = "/demo/G2_EVS.pdf";
  const DEMO_QUIZ_CONTENT = JSON.stringify([
    {
      question: "What is the primary purpose of instructional design?",
      type: "SCQ",
      options: ["Entertainment", "Creating effective learning experiences", "Data analysis", "Software development"],
      answer: "Creating effective learning experiences",
      explanation: "Instructional design focuses on creating effective and engaging learning experiences tailored to learner needs."
    },
    {
      question: "Which of the following are key principles of multimedia learning?",
      type: "MCQ",
      options: ["Coherence principle", "Redundancy principle", "Signaling principle", "Complexity principle"],
      answer: "Coherence principle",
      explanation: "The coherence, redundancy, and signaling principles are core to Mayer's multimedia learning theory."
    },
    {
      question: "Bloom's Taxonomy classifies learning objectives into cognitive levels.",
      type: "SCQ",
      options: ["True", "False"],
      answer: "True",
      explanation: "Bloom's Taxonomy organizes cognitive skills from lower-order (remembering) to higher-order (creating)."
    }
  ]);

  const renderBlockContent = (block: PageContentBlock) => {
    switch (block.type) {
      case "text": {
        const content = block.content || "";
        const COL_SEPARATOR = "<!--col-break-->";
        const layoutMatch = content.match(/<!--layout:(\w[\w-]*)-->/);
        const layout = layoutMatch ? layoutMatch[1] : "heading-text";
        const cleanContent = content.replace(/<!--layout:\w[\w-]*-->/, "");

        if ((layout === "two-columns" || layout === "three-columns") && cleanContent.includes(COL_SEPARATOR)) {
          const columns = cleanContent.split(COL_SEPARATOR);
          return (
            <div className={cn(
              "grid gap-4 sm:gap-6",
              layout === "three-columns" ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"
            )}>
              {columns.map((col, i) => (
                <div key={i} className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: sanitizeHtml(col.trim()) }} />
              ))}
            </div>
          );
        }

        return (
          <div
            className="prose prose-sm max-w-none text-foreground"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(cleanContent) }}
          />
        );
      }
      case "image":
        return block.content ? (
          <img src={block.content} alt="" className="w-full max-w-2xl rounded-xl shadow-sm" />
        ) : null;
      case "image-description": {
        try {
          const parsed = JSON.parse(block.content);
          return (
            <div className={cn(
              "flex gap-4 sm:gap-6 items-start",
              isCompactView ? "flex-col" : parsed.layout === "image-right" ? "flex-row-reverse" : "flex-row"
            )}>
              {parsed.image && (
                <img src={parsed.image} alt="" className={cn(
                  "rounded-xl shadow-sm object-cover",
                  isCompactView ? "w-full" : "w-1/2"
                )} />
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
          const quizContent = block.content || DEMO_QUIZ_CONTENT;
          const questions = JSON.parse(quizContent);
          if (!Array.isArray(questions)) return null;
          return <InteractiveQuiz questions={questions} isCompactView={isCompactView} />;
        } catch {
          return null;
        }
      case "video": {
        const videoSrc = block.content || DEMO_VIDEO_URL;
        return (
          <div className="rounded-xl overflow-hidden border border-border/40 bg-black/5">
            <video
              src={videoSrc}
              controls
              className="w-full max-h-[400px] rounded-xl"
              poster={!block.content ? "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&q=80" : undefined}
            />
            {!block.content && (
              <div className="px-4 py-2 bg-muted/30 border-t border-border/30">
                <p className="text-xs text-muted-foreground italic">Sample video — replace with your own content</p>
              </div>
            )}
          </div>
        );
      }
      case "video-description": {
        try {
          const parsed = JSON.parse(block.content);
          return (
            <div className={cn(
              "flex gap-4 sm:gap-6 items-start",
              isCompactView ? "flex-col" : parsed.layout === "video-right" ? "flex-row-reverse" : "flex-row"
            )}>
              <div className={cn(
                "rounded-xl overflow-hidden border border-border/40 bg-black/5",
                isCompactView ? "w-full" : "w-1/2"
              )}>
                {parsed.video ? (
                  <video src={parsed.video} controls className="w-full rounded-xl" />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <Video className="w-8 h-8 text-muted-foreground/40" />
                    <p className="text-xs text-muted-foreground/50">No video</p>
                  </div>
                )}
              </div>
              <div className="flex-1 prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: sanitizeHtml(parsed.text || "") }} />
            </div>
          );
        } catch {
          return null;
        }
      }
      case "audio": {
        const audioSrc = block.content || DEMO_AUDIO_URL;
        return (
          <div className="rounded-xl border border-border/40 bg-muted/20 p-4 sm:p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Music className="w-6 h-6 text-primary/70" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground mb-2">{block.content ? "Audio" : "Sample Audio Track"}</p>
                <audio src={audioSrc} controls className="w-full h-8" />
                {!block.content && (
                  <p className="text-xs text-muted-foreground italic mt-1">Sample audio — replace with your own content</p>
                )}
              </div>
            </div>
          </div>
        );
      }
      case "doc": {
        const docSrc = block.content || DEMO_PDF_URL;
        return (
          <div className="rounded-xl border border-border/60 bg-background overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-border/40 bg-muted/30">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 border border-border/40">
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-semibold text-foreground truncate">
                  {block.content ? "Course Document" : "Sample Course Document"}
                </p>
                {!block.content && (
                  <p className="text-xs text-muted-foreground">Sample PDF — replace with your own document</p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full gap-1.5 text-xs font-medium flex-shrink-0 h-8 px-4 border-border"
                onClick={() => window.open(docSrc, '_blank')}
              >
                <Download className="w-3.5 h-3.5" />
                DOWNLOAD
              </Button>
            </div>
            <div className="relative bg-muted/20">
              <iframe
                src={docSrc}
                className="w-full border-0"
                style={{ height: isCompactView ? '400px' : '600px' }}
                title="Document viewer"
              />
            </div>
          </div>
        );
      }
      default:
        return block.content ? (
          <div className="p-4 bg-muted/30 rounded-xl border border-border/40 text-sm text-muted-foreground">
            <span className="capitalize">{block.type}</span> content
          </div>
        ) : null;
    }
  };

  // Shared outline renderer for sidebar & mobile sheet
  const renderOutlineItems = (onPageSelect: (id: string) => void) => (
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
                      onClick={() => onPageSelect(child.id)}
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
            onClick={() => onPageSelect(item.id)}
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
  );

  // Mobile bottom sheet overlay for outline navigation
  const MobileOutlineSheet = () => (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 z-40 transition-opacity duration-300",
          mobileOutlineOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileOutlineOpen(false)}
      />
      {/* Sheet */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl shadow-2xl border-t border-border transition-transform duration-300 ease-out",
          mobileOutlineOpen ? "translate-y-0" : "translate-y-full"
        )}
        style={{ maxHeight: "75vh" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-border/60">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Course Outline</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {currentIndex + 1} of {totalPages} pages · {progress}% complete
            </p>
          </div>
          <button
            onClick={() => setMobileOutlineOpen(false)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-5 py-3">
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Outline list */}
        <ScrollArea className="flex-1" style={{ maxHeight: "calc(75vh - 130px)" }}>
          {renderOutlineItems(handleMobilePageSelect)}
        </ScrollArea>
      </div>
    </>
  );

  // Hero / Landing view
  if (!started) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium text-foreground">Course Preview</span>
          </div>
          <DeviceToggle />
        </div>

        <div className={cn(
          "flex-1 flex justify-center overflow-hidden bg-muted/20",
          foldDirection === 'out' && "page-fold-out",
          foldDirection === 'in' && "page-fold-in"
        )}>
          {renderDeviceFrame(
          <div
            className={cn(
              "flex transition-all duration-300",
              isDeviceFramed ? "min-h-full flex-1" : "min-h-[calc(100vh-57px)] flex-1",
              isCompactView ? "flex-col" : "flex-row",
              !isDeviceFramed && deviceView !== 'desktop' && "border-x border-border shadow-lg",
              isDeviceFramed && "w-full"
            )}
            style={{ maxWidth: !isDeviceFramed && deviceView !== 'desktop' ? deviceSizes[deviceView as keyof typeof deviceSizes]?.width : undefined }}
          >
            {/* Left: Course intro card */}
            <div className={cn(
              "relative overflow-hidden flex-1",
              isCompactView ? "w-full" : "w-full lg:w-[40%]"
            )}>
              {/* Background with hero image or gradient */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20" />
              </div>

              {/* Decorative elements */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-foreground/[0.06] to-transparent" />
                <div className="absolute right-3 top-0 bottom-0 w-[1px] bg-foreground/[0.08]" />
                <div className="absolute top-0 right-0 w-12 h-12">
                  <svg viewBox="0 0 48 48" className="w-full h-full text-foreground/[0.06]" fill="currentColor">
                    <path d="M48 0 L48 48 L0 0 Z" />
                  </svg>
                </div>
                <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="ruled-lines" width="100%" height="32" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="31" x2="100%" y2="31" stroke="currentColor" strokeWidth="1" className="text-foreground" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#ruled-lines)" />
                </svg>
                <div className="absolute left-12 top-0 bottom-0 w-[1px] bg-destructive/10" />
                {!isCompactView && (
                  <>
                    <div className="absolute top-0 right-10 w-6 flex flex-col items-center drop-shadow-md">
                      <div className="w-full h-24 bg-gradient-to-b from-primary/25 via-primary/20 to-primary/15 rounded-b-none" />
                      <svg viewBox="0 0 24 12" className="w-full" preserveAspectRatio="none">
                        <path d="M0 0 L12 8 L24 0 L24 0 L0 0 Z" fill="hsl(var(--primary) / 0.15)" />
                      </svg>
                    </div>
                    <div className="absolute top-0 right-10 w-6 h-24 border-x border-primary/10" />
                  </>
                )}
              </div>

              <div className={cn(
                "relative z-10 flex flex-col justify-center h-full",
                isCompactView ? "px-6 py-10" : "px-8 sm:px-12 lg:px-16 py-10"
              )}>
                <div className="space-y-5">
                  <h1 className={cn(
                    "font-semibold text-foreground leading-[1.1] tracking-tight",
                    isCompactView ? "text-2xl" : "text-3xl sm:text-4xl lg:text-5xl"
                  )}>
                    {data.title}
                  </h1>

                  {/* Progress bar */}
                  <div className="space-y-2 max-w-md">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium">Progress</span>
                      <span className="text-xs font-semibold text-primary">0%</span>
                    </div>
                    <div className="w-full h-2 bg-foreground/10 rounded-full overflow-hidden ring-1 ring-foreground/5">
                      <div className="h-full w-0 bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500 ease-out" />
                    </div>
                  </div>

                  <Button
                    onClick={() => startCourse(undefined, allPages[0]?.id)}
                    disabled={transitioning}
                    className={cn(
                      "bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-auto font-semibold uppercase tracking-wider shadow-lg",
                      isCompactView ? "px-8 py-2.5 text-xs w-full" : "px-10 py-3 text-sm"
                    )}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Start Course
                  </Button>

                  {/* Render all content blocks */}
                  {data.contentBlocks.map((block, idx) => (
                    <div key={idx}>
                      {renderBlockContent({ ...block, type: block.type === "description" ? "text" : block.type } as any)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Course outline */}
            <div className={cn(
              "border-l bg-card flex-shrink-0 overflow-auto",
              isCompactView ? "w-full border-l-0 border-t" : "w-full lg:w-[60%]"
            )}>
              <ScrollArea className="h-full">
                <div className={cn("p-6 space-y-1", isCompactView && "p-4")}>
                  <div className="mb-4">
                    <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">Course Outline</h3>
                  </div>
                  {data.items.map((item) => {
                    if (item.type === "section") {
                      const isExpanded = expandedSections.has(item.id);
                      return (
                        <div key={item.id} className="mb-3">
                          <div
                            className="group/outline rounded-xl border border-border/60 overflow-hidden cursor-pointer hover:border-primary/40 transition-all duration-200 hover:shadow-sm"
                            onClick={() => toggleSection(item.id)}
                          >
                            <div className="flex items-center gap-4 p-4 bg-muted/30">
                              <div className={cn(
                                "rounded-lg bg-card border border-border/40 flex items-center justify-center flex-shrink-0 overflow-hidden",
                                isCompactView ? "w-10 h-10" : "w-12 h-12"
                              )}>
                                {item.thumbnailUrl ? (
                                  <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
                                )}
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
                                  onClick={() => startCourse(child.id)}
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
                        onClick={() => startCourse(item.id)}
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
          )}
        </div>
      </div>
    );
  }

  // Content view with sidebar (desktop) / bottom bar + sheet (mobile)
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
        <DeviceToggle />
      </div>

      <div className={cn(
        "flex-1 flex justify-center overflow-hidden bg-muted/20",
        foldDirection === 'out' && "page-fold-out",
        foldDirection === 'in' && "page-fold-in"
      )}>
        {renderDeviceFrame(
        <div
          className={cn(
            "flex transition-all duration-300 bg-background",
            isDeviceFramed ? "min-h-full flex-1" : "flex-1",
            !isDeviceFramed && deviceView !== 'desktop' && "border-x border-border shadow-lg",
            isCompactView && "flex-col relative",
            isDeviceFramed && "w-full"
          )}
          style={{ maxWidth: !isDeviceFramed && deviceView !== 'desktop' ? deviceSizes[deviceView as keyof typeof deviceSizes]?.width : undefined }}
        >
          {/* Desktop sidebar */}
          {!isCompactView && (
            <div className="w-[260px] flex-shrink-0 flex flex-col border-r bg-card">
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

              <ScrollArea className="flex-1">
                {renderOutlineItems((id) => setSelectedId(id))}
              </ScrollArea>
            </div>
          )}

          {/* Content area */}
          <div className={cn(
            "flex-1 overflow-auto",
            isCompactView && "pb-20" // space for bottom bar
          )}>
            <div className={cn(
              "max-w-3xl mx-auto space-y-6 sm:space-y-8",
              isCompactView ? "px-5 py-6" : "px-8 sm:px-12 py-10"
            )}>
              {currentPage ? (
                <>
                  {/* Page indicator */}
                  <div className="space-y-2 sm:space-y-3">
                    <span className="text-xs text-muted-foreground italic">
                      Page {currentIndex + 1} of {totalPages}
                    </span>
                    <h2 className={cn(
                      "font-bold text-foreground leading-tight",
                      isCompactView ? "text-xl" : "text-2xl sm:text-3xl"
                    )}>
                      {currentPage.title || "Untitled"}
                    </h2>
                    {currentPage.type === "question" && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Quiz</span>
                    )}
                    <div className="w-16 h-[3px] bg-primary rounded-full" />
                  </div>

                  {(() => {
                    // Use actual blocks, or inject demo blocks if page has none
                    const blocksToRender = currentPageBlocks.length > 0 ? currentPageBlocks : [
                      { id: "demo-text", type: "text" as const, content: "<h3>Welcome to this lesson</h3><p>This page demonstrates how different content types appear in the course preview. Below you'll find sample video, audio, document, and quiz content blocks.</p>" },
                      { id: "demo-video", type: "video" as const, content: "" },
                      { id: "demo-audio", type: "audio" as const, content: "" },
                      { id: "demo-doc", type: "doc" as const, content: "" },
                      { id: "demo-quiz", type: "quiz" as const, content: "" },
                    ];
                    return (
                      <div className="space-y-5 sm:space-y-6">
                        {blocksToRender.map((block) => (
                          <div key={block.id}>{renderBlockContent(block)}</div>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Navigation - desktop inline, mobile uses bottom bar */}
                  {!isCompactView && (
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
                  )}
                </>
              ) : (
                <div className="py-20 text-center text-muted-foreground/50">
                  <BookOpen className="w-16 h-16 mx-auto mb-4" />
                  <p>Select a page from the outline to begin</p>
                </div>
              )}
            </div>
          </div>

          {/* Mobile bottom navigation bar */}
          {isCompactView && (
            <div className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-30 px-3 py-2 flex items-center gap-2">
              {/* Outline button */}
              <button
                onClick={() => setMobileOutlineOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted/60 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <Menu className="w-4 h-4" />
                <span className="text-xs">Outline</span>
              </button>

              {/* Progress pill */}
              <div className="flex-1 flex items-center gap-2 px-3">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground font-semibold whitespace-nowrap">
                  {currentIndex + 1}/{totalPages}
                </span>
              </div>

              {/* Prev/Next */}
              <div className="flex items-center gap-1">
                <button
                  onClick={goToPrev}
                  disabled={currentIndex <= 0}
                  className="p-2 rounded-full hover:bg-muted transition-colors disabled:opacity-30"
                >
                  <ArrowLeft className="w-4 h-4 text-foreground" />
                </button>
                <button
                  onClick={goToNext}
                  disabled={currentIndex >= allPages.length - 1}
                  className="p-2 rounded-full hover:bg-muted transition-colors disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4 text-foreground" />
                </button>
              </div>
            </div>
          )}

          {/* Mobile outline bottom sheet */}
          {isCompactView && <MobileOutlineSheet />}
        </div>
        )}
      </div>
    </div>
  );
};

export default MultipageCoursePreview;
