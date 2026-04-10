import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, BookOpen, ChevronDown, ChevronRight, Image as ImageIcon, FileText, HelpCircle, Monitor, Tablet, Smartphone, Video, Music, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import type { SinglePageRestoreState } from "@/components/CourseCreation/SinglePageCourseCreator";
import { InteractiveQuiz } from "@/components/CoursePreview/InteractiveQuiz";

interface CourseItem {
  id: string;
  type: "section" | "page";
  title: string;
  children?: CourseItem[];
}

interface PageContentBlock {
  id: string;
  type: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description" | "video-description";
  content: string;
}

interface ContentBlockData {
  id: string;
  type: "text" | "image" | "description" | "video" | "audio" | "doc" | "quiz" | "image-description" | "video-description";
  content: string;
}

interface PreviewState {
  title: string;
  items: CourseItem[];
  contentBlocks: ContentBlockData[];
  pageBlocksMap: Record<string, PageContentBlock[]>;
  sectionImages?: Record<string, string | null>;
  returnState?: SinglePageRestoreState;
}

const DEMO_VIDEO_URL = "/demo/Motion_Video.mp4";
const DEMO_AUDIO_URL = "/demo/actAudio.mp3";
const DEMO_PDF_URL = "/demo/G2_EVS.pdf";
const DEMO_QUIZ_CONTENT = JSON.stringify([
  { question: "What is the primary purpose of instructional design?", type: "SCQ", options: ["Entertainment", "Creating effective learning experiences", "Data analysis", "Software development"], answer: "Creating effective learning experiences", explanation: "Instructional design focuses on creating effective and engaging learning experiences." },
  { question: "Which of the following are key principles of multimedia learning?", type: "MCQ", options: ["Coherence principle", "Redundancy principle", "Signaling principle", "Complexity principle"], answer: "Coherence principle", explanation: "The coherence, redundancy, and signaling principles are core to Mayer's multimedia learning theory." },
]);

const SinglepageCoursePreview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const previewState = location.state as PreviewState | null;
  const [data, setData] = useState<PreviewState | null>(null);
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet-landscape' | 'tablet' | 'mobile'>('desktop');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const isCompactView = deviceView === 'mobile' || deviceView === 'tablet' || deviceView === 'tablet-landscape';
  const isDeviceFramed = deviceView === 'mobile' || deviceView === 'tablet' || deviceView === 'tablet-landscape';

  useEffect(() => {
    if (!previewState) {
      navigate("/dashboard", { replace: true });
      return;
    }
    setData(previewState);
    document.title = `${previewState.title} - Course Preview`;
    const sections = new Set<string>();
    previewState.items.forEach((item) => {
      if (item.type === "section") sections.add(item.id);
    });
    setExpandedSections(sections);
  }, [navigate, previewState]);

  const handleBack = useCallback(() => {
    if (previewState?.returnState) {
      navigate("/create-course-singlepage", {
        replace: true,
        state: {
          title: previewState.returnState.title,
          layout: "single-page",
          aiOptions: previewState.returnState.aiOptions,
          restoreState: {
            title: previewState.returnState.title,
            items: previewState.returnState.items,
            contentBlocks: previewState.returnState.contentBlocks,
            pageBlocksMap: previewState.returnState.pageBlocksMap,
            sectionImages: previewState.returnState.sectionImages,
            aiOptions: previewState.returnState.aiOptions,
          },
        },
      });
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/dashboard", { replace: true });
  }, [navigate, previewState]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
    <div className="flex items-center gap-1.5 rounded-full bg-muted/50 p-1.5 border border-border" role="radiogroup" aria-label="Device preview size">
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
            role="radio"
            aria-checked={isActive}
            aria-label={`${label} view`}
          >
            <Icon className={cn("w-4 h-4", rotate && "rotate-90")} aria-hidden="true" />
            {isActive && <span className="hidden sm:inline">{label}</span>}
          </button>
        );
      })}
    </div>
  );

  const renderDeviceFrame = (children: React.ReactNode) => {
    if (!isDeviceFramed) return children;
    const isLandscape = deviceView === 'tablet-landscape';
    const isPhone = deviceView === 'mobile' || isLandscape;

    return (
      <div className="flex items-start justify-center py-6 px-4 overflow-auto flex-1">
        <div
          className={cn(
            "relative flex-shrink-0 w-full",
            isPhone ? "rounded-[3rem] p-[10px]" : "rounded-[1.75rem] p-[10px]"
          )}
          style={{
            maxWidth: deviceSizes[deviceView as keyof typeof deviceSizes]?.width,
            background: 'linear-gradient(145deg, #f0f0f3 0%, #e4e4e9 30%, #d8d8de 100%)',
            boxShadow: '0 25px 60px -12px rgba(0,0,0,0.15), 0 12px 28px -8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.06)',
          }}
        >
          {isPhone && !isLandscape && (
            <>
              <div className="absolute right-[-2px] top-[120px] w-[3px] h-[40px] rounded-r-sm" style={{ background: 'linear-gradient(180deg, #c8c8ce, #b8b8c0, #c8c8ce)' }} />
              <div className="absolute left-[-2px] top-[100px] w-[3px] h-[28px] rounded-l-sm" style={{ background: 'linear-gradient(180deg, #c8c8ce, #b8b8c0, #c8c8ce)' }} />
              <div className="absolute left-[-2px] top-[140px] w-[3px] h-[28px] rounded-l-sm" style={{ background: 'linear-gradient(180deg, #c8c8ce, #b8b8c0, #c8c8ce)' }} />
              <div className="absolute left-[-2px] top-[68px] w-[3px] h-[16px] rounded-l-sm" style={{ background: 'linear-gradient(180deg, #c8c8ce, #b8b8c0, #c8c8ce)' }} />
            </>
          )}
          {isLandscape && (
            <>
              <div className="absolute top-[-2px] right-[120px] h-[3px] w-[40px] rounded-t-sm" style={{ background: 'linear-gradient(90deg, #c8c8ce, #b8b8c0, #c8c8ce)' }} />
              <div className="absolute bottom-[-2px] right-[100px] h-[3px] w-[28px] rounded-b-sm" style={{ background: 'linear-gradient(90deg, #c8c8ce, #b8b8c0, #c8c8ce)' }} />
              <div className="absolute bottom-[-2px] right-[140px] h-[3px] w-[28px] rounded-b-sm" style={{ background: 'linear-gradient(90deg, #c8c8ce, #b8b8c0, #c8c8ce)' }} />
              <div className="absolute bottom-[-2px] right-[200px] h-[3px] w-[16px] rounded-b-sm" style={{ background: 'linear-gradient(90deg, #c8c8ce, #b8b8c0, #c8c8ce)' }} />
            </>
          )}
          {deviceView === 'tablet' && (
            <>
              <div className="absolute right-[-2px] top-[60px] w-[3px] h-[32px] rounded-r-sm" style={{ background: 'linear-gradient(180deg, #c8c8ce, #b8b8c0, #c8c8ce)' }} />
              <div className="absolute top-[-2px] right-[70px] h-[3px] w-[28px] rounded-t-sm" style={{ background: 'linear-gradient(90deg, #c8c8ce, #b8b8c0, #c8c8ce)' }} />
              <div className="absolute top-[-2px] right-[106px] h-[3px] w-[28px] rounded-t-sm" style={{ background: 'linear-gradient(90deg, #c8c8ce, #b8b8c0, #c8c8ce)' }} />
            </>
          )}
          <div className={cn("p-[2px]", isPhone ? "rounded-[2.5rem]" : "rounded-[1.25rem]")} style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.7), rgba(255,255,255,0.3))' }}>
            <div className={cn("p-[2px] bg-[#c0c0c6]", isPhone ? "rounded-[2.4rem]" : "rounded-[1.15rem]")}>
              {deviceView === 'mobile' && (
                <div className="absolute top-[6px] left-1/2 -translate-x-1/2 z-20">
                  <div className="w-[40px] h-[4px] rounded-full" style={{ background: '#1a1a1e' }} />
                </div>
              )}
              {isLandscape && (
                <div className="absolute left-[6px] top-1/2 -translate-y-1/2 z-20">
                  <div className="h-[40px] w-[4px] rounded-full" style={{ background: '#1a1a1e' }} />
                </div>
              )}
              {deviceView === 'tablet' && (
                <div className="absolute top-[16px] left-1/2 -translate-x-1/2 z-20">
                  <div className="w-[8px] h-[8px] rounded-full" style={{ background: 'radial-gradient(circle at 35% 35%, #1a2a4a, #0a0a15)', boxShadow: '0 0 3px rgba(0,100,200,0.2), 0 0 0 1px rgba(100,100,110,0.3)' }} />
                </div>
              )}
              <div className={cn(
                "overflow-auto bg-background relative flex flex-col",
                isPhone ? "rounded-[2.15rem]" : "rounded-[0.9rem]",
                deviceView === 'mobile' && "h-[620px]",
                deviceView === 'tablet' && "h-[600px]",
                deviceView === 'tablet-landscape' && "h-[375px]"
              )}>
                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none opacity-50" />
                {children}
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-2 mb-0.5">
            <div className={cn("h-[4px] rounded-full", isPhone ? "w-[100px]" : "w-[80px]")} style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.06), rgba(0,0,0,0.12), rgba(0,0,0,0.06))' }} />
          </div>
        </div>
      </div>
    );
  };

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
            <div className={cn("grid gap-4 sm:gap-6", layout === "three-columns" ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2")}>
              {columns.map((col, i) => (
                <div key={i} className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: sanitizeHtml(col.trim()) }} />
              ))}
            </div>
          );
        }
        return <div className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: sanitizeHtml(cleanContent) }} />;
      }
      case "image":
        return block.content ? <img src={block.content} alt="Course content image" className="w-full max-w-2xl rounded-xl shadow-sm" /> : null;
      case "image-description": {
        try {
          const parsed = JSON.parse(block.content);
          return (
            <div className={cn("flex gap-4 sm:gap-6 items-start", isCompactView ? "flex-col" : parsed.layout === "image-right" ? "flex-row-reverse" : "flex-row")}>
              {parsed.image && <img src={parsed.image} alt="Course illustration" className={cn("rounded-xl shadow-sm object-cover", isCompactView ? "w-full" : "w-1/2")} />}
              <div className="flex-1 prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: sanitizeHtml(parsed.text || "") }} />
            </div>
          );
        } catch { return null; }
      }
      case "quiz":
        try {
          const quizContent = block.content || DEMO_QUIZ_CONTENT;
          const questions = JSON.parse(quizContent);
          if (!Array.isArray(questions)) return null;
          return <InteractiveQuiz questions={questions} isCompactView={isCompactView} />;
        } catch { return null; }
      case "video": {
        const videoSrc = block.content || DEMO_VIDEO_URL;
        return (
          <div className="rounded-xl overflow-hidden border border-border/40 bg-black/5">
            <video src={videoSrc} controls className="w-full max-h-[400px] rounded-xl" aria-label={block.content ? "Course video" : "Sample video"} />
            {!block.content && <div className="px-4 py-2 bg-muted/30 border-t border-border/30"><p className="text-xs text-muted-foreground italic">Sample video — replace with your own content</p></div>}
          </div>
        );
      }
      case "video-description": {
        try {
          const parsed = JSON.parse(block.content);
          return (
            <div className={cn("flex gap-4 sm:gap-6 items-start", isCompactView ? "flex-col" : parsed.layout === "video-right" ? "flex-row-reverse" : "flex-row")}>
              <div className={cn("rounded-xl overflow-hidden border border-border/40 bg-black/5", isCompactView ? "w-full" : "w-1/2")}>
                {parsed.video ? <video src={parsed.video} controls className="w-full rounded-xl" /> : (
                  <div className="flex flex-col items-center justify-center py-12 gap-2"><Video className="w-8 h-8 text-muted-foreground/40" /><p className="text-xs text-muted-foreground/50">No video</p></div>
                )}
              </div>
              <div className="flex-1 prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: sanitizeHtml(parsed.text || "") }} />
            </div>
          );
        } catch { return null; }
      }
      case "audio": {
        const audioSrc = block.content || DEMO_AUDIO_URL;
        return (
          <div className="rounded-xl border border-border/40 bg-muted/20 p-4 sm:p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"><Music className="w-6 h-6 text-primary/70" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground mb-2">{block.content ? "Audio" : "Sample Audio Track"}</p>
                <audio src={audioSrc} controls className="w-full h-8" aria-label={block.content ? "Course audio" : "Sample audio track"} />
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
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 border border-border/40"><FileText className="w-5 h-5 text-muted-foreground" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-semibold text-foreground truncate">{block.content ? "Course Document" : "Sample Course Document"}</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-full gap-1.5 text-xs font-medium flex-shrink-0 h-8 px-4 border-border" onClick={() => window.open(docSrc, '_blank')}>
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                DOWNLOAD
              </Button>
            </div>
            <div className="relative bg-muted/20">
              <iframe src={docSrc} className="w-full border-0" style={{ height: isCompactView ? '400px' : '600px' }} title="Document viewer" />
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

  if (!data) return null;

  // Build a flat ordered list of all content for single-page scroll
  const renderSinglePageContent = () => {
    const sections: React.ReactNode[] = [];

    // Render top-level content blocks (intro/description/image)
    if (data.contentBlocks.length > 0) {
      sections.push(
        <div key="intro-blocks" className="space-y-5">
          {data.contentBlocks.map((block) => (
            <div key={block.id}>
              {renderBlockContent({ ...block, type: block.type === "description" ? "text" : block.type } as PageContentBlock)}
            </div>
          ))}
        </div>
      );
    }

    // Render each item
    data.items.forEach((item) => {
      if (item.type === "section") {
        const isExpanded = expandedSections.has(item.id);
        const sectionImage = data.sectionImages?.[item.id];

        sections.push(
          <div key={item.id} className="space-y-3">
            {/* Section header */}
            <button
              className={cn(
                "w-full flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/50 transition-colors text-left",
                isCompactView ? "p-3" : "p-4 gap-4"
              )}
              onClick={() => toggleSection(item.id)}
              aria-expanded={isExpanded}
              aria-label={`${item.title || "Untitled section"}, ${isExpanded ? "collapse" : "expand"}`}
            >
              <div className={cn(
                "rounded-lg bg-card border border-border/40 flex items-center justify-center flex-shrink-0 overflow-hidden",
                isCompactView ? "w-9 h-9" : "w-12 h-12"
              )}>
                {sectionImage ? (
                  <img src={sectionImage} alt={`${item.title} section`} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className={cn("text-muted-foreground/40", isCompactView ? "w-4 h-4" : "w-5 h-5")} aria-hidden="true" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className={cn("font-semibold text-foreground truncate", isCompactView ? "text-sm" : "text-base")}>{item.title || "Untitled Section"}</h2>
                {item.children && item.children.length > 0 && (
                  <span className="text-xs text-muted-foreground">{item.children.length} {item.children.length === 1 ? "topic" : "topics"}</span>
                )}
              </div>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
              )}
            </button>

            {/* Section children content - all rendered inline */}
            {isExpanded && item.children && item.children.length > 0 && (
              <div className={cn("space-y-5 border-l-2 border-primary/20", isCompactView ? "pl-3 ml-4" : "pl-4 ml-6")}>
                {item.children.map((child) => {
                  const childBlocks = data.pageBlocksMap[child.id] || [];
                  return (
                    <div key={child.id} className="space-y-4">
                      <div className="flex items-center gap-2">
                        {child.type === "page" ? (
                          <FileText className="w-4 h-4 text-primary/60 flex-shrink-0" aria-hidden="true" />
                        ) : (
                          <HelpCircle className="w-4 h-4 text-primary/60 flex-shrink-0" aria-hidden="true" />
                        )}
                        <h3 className="text-sm font-semibold text-foreground">{child.title || "Untitled"}</h3>
                      </div>
                      {childBlocks.length > 0 ? (
                        <div className="space-y-4">
                          {childBlocks.map((block) => (
                            <div key={block.id}>{renderBlockContent(block)}</div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No content yet</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      } else {
        // Top-level page
        const pageBlocks = data.pageBlocksMap[item.id] || [];
        sections.push(
          <div key={item.id} className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary/60 flex-shrink-0" aria-hidden="true" />
              <h2 className="text-base font-semibold text-foreground">{item.title || "Untitled"}</h2>
            </div>
            {pageBlocks.length > 0 ? (
              <div className="space-y-4">
                {pageBlocks.map((block) => (
                  <div key={block.id}>{renderBlockContent(block)}</div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No content yet</p>
            )}
          </div>
        );
      }
    });

    return sections;
  };

  const scrollContent = (
    <div
      className={cn(
        "bg-background w-full",
        isDeviceFramed ? "flex-1 overflow-auto" : "flex-1 flex flex-col min-h-[calc(100vh-57px)]",
        !isDeviceFramed && deviceView !== 'desktop' && "border-x border-border shadow-lg mx-auto"
      )}
      style={{ maxWidth: !isDeviceFramed && deviceView !== 'desktop' ? deviceSizes[deviceView as keyof typeof deviceSizes]?.width : undefined }}
    >
      {/* Course header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-primary/8 to-accent/10 flex-shrink-0">
        <div className={cn(
          "relative z-10",
          isCompactView ? "px-3 py-5" : "px-8 sm:px-12 py-10"
        )}>
          <div className="max-w-3xl mx-auto">
            <h1 className={cn(
              "font-semibold text-foreground leading-[1.1] tracking-tight break-words",
              isCompactView ? "text-lg" : "text-2xl sm:text-3xl lg:text-4xl"
            )}>
              {data.title}
            </h1>
            <p className="text-xs text-muted-foreground mt-1.5">Single-page course</p>
          </div>
        </div>
      </div>

      {/* All content in one scrollable area */}
      <div className={cn(
        "flex-1",
        isCompactView ? "px-3 py-4" : "px-8 sm:px-12 py-10"
      )}>
        <div className="max-w-3xl mx-auto space-y-6">
          {renderSinglePageContent()}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full" aria-label="Go back">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </Button>
          <span className="text-sm font-medium text-foreground">Course Preview</span>
        </div>
        <DeviceToggle />
      </div>

      <div className="flex-1 flex justify-center overflow-hidden bg-muted/20">
        {renderDeviceFrame(scrollContent)}
      </div>
    </div>
  );
};

export default SinglepageCoursePreview;
