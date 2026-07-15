import { useState, useEffect, useCallback, useRef } from "react";
import emptyPageIllustration from "@/assets/empty-page-illustration.png";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, BookOpen, ChevronDown, ChevronRight, Play, Image as ImageIcon, FileText, HelpCircle, Monitor, Tablet, Smartphone, Menu, X, Video, Music, Download, ExternalLink, Maximize2, CheckCircle2, Trophy, Home, Sparkles, Check } from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import type { MultiPageCourseCreatorRestoreState } from "@/components/CourseCreation/MultiPageCourseCreator";
import { InteractiveQuiz } from "@/components/CoursePreview/InteractiveQuiz";
import { GlossaryDialog } from "@/components/CoursePreview/GlossaryDialog";
import { GenerateExportDialog } from "@/components/CourseCreation/GenerateExportDialog";
import { getFontStack } from "@/components/CourseCreation/FontSelectorDropdown";
import { CourseBrandingLogo } from "@/components/CourseCreation/CourseBrandingLogo";
import { useCourseContentBackgroundStyle } from "@/services/contentBackgrounds";
import { CoursePreviewStatusBanner } from "@/components/Course/CoursePreviewStatusBanner";
import { FlashcardsPreview } from "@/components/CourseCreation/FlashcardsBlock";
import { CardSortPreview } from "@/components/CourseCreation/CardSortBlock";
import { LayoutUtilityBlock, isLayoutUtilityVariant } from "@/components/CourseCreation/LayoutUtilityBlock";
import { PreviewAudioTranscript } from "@/components/CoursePreview/PreviewAudioTranscript";
import { ImageLightbox } from "@/components/CoursePreview/ImageLightbox";

interface CourseItem {
  id: string;
  type: "section" | "page" | "question";
  title: string;
  thumbnailUrl?: string;
  children?: CourseItem[];
}

interface PageContentBlock {
  id: string;
  type: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description" | "video-description" | "hotspot" | "tabs" | "flashcards";
  content: string;
  variant?: string;
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
  initialPageId?: string | null;
  fontId?: string;
  courseId?: string | number;
  origin?: string;
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
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [completed, setCompleted] = useState(false);
  const completionRef = useRef<HTMLDivElement | null>(null);
  const contentBgStyle = useCourseContentBackgroundStyle(String((data ?? previewState)?.courseId ?? ""));

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
    const origin = previewState?.origin;

    // Navigate back to edit-course or review-course where state is reloaded from mock data
    if (origin && (origin.startsWith("/edit-course/") || origin.startsWith("/review-course/"))) {
      navigate(origin, { replace: true });
      return;
    }

    // Navigate back to create-course flow with restored state
    if (origin === "/create-course-multipage" && previewState?.returnState) {
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

    // Legacy fallback: returnState present without origin
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
    document.title = `${state.title} - Course Preview`;
    const sections = new Set<string>();
    state.items.forEach((item) => {
      if (item.type === "section") sections.add(item.id);
    });
    setExpandedSections(sections);

    // Auto-start and navigate to specific page if initialPageId is provided
    if (state.initialPageId) {
      // Find the first page to use as fallback
      let fallbackFirstId: string | null = null;
      for (const item of state.items) {
        if (item.type === "page" || item.type === "question") {
          fallbackFirstId = item.id;
          break;
        }
        if (item.children) {
          const firstChild = item.children[0];
          if (firstChild) {
            fallbackFirstId = firstChild.id;
            break;
          }
        }
      }
      // Directly start the course at the target page
      setStarted(true);
      setSelectedId(state.initialPageId);
    }
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

  const isLastPage = currentIndex >= 0 && currentIndex === allPages.length - 1;

  const handleFinish = () => {
    setCompleted(true);
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        completionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      // Fire confetti bursts
      const fire = (originX: number) => {
        confetti({
          particleCount: 80,
          spread: 70,
          startVelocity: 45,
          origin: { x: originX, y: 0.6 },
          colors: ["#22c55e", "#16a34a", "#3B82F6", "#fbbf24", "#f472b6"],
        });
      };
      setTimeout(() => fire(0.25), 200);
      setTimeout(() => fire(0.75), 350);
      setTimeout(() => fire(0.5), 550);
    }
  };

  const goToNext = () => {
    if (isLastPage) {
      handleFinish();
      return;
    }
    if (currentIndex < allPages.length - 1) {
      setSelectedId(allPages[currentIndex + 1].id);
    }
  };

  const goToPrev = () => {
    if (completed) setCompleted(false);
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

        if (isLayoutUtilityVariant(block.variant)) {
          return <LayoutUtilityBlock variant={block.variant} content={content} onChange={() => {}} readOnly onContinueClick={goToNext} />;
        }


        // Accordion variant (currently stored as a text block) renders as a collapsible panel
        if (block.variant === "accordion") {
          return <AccordionPreview content={content} />;
        }
        if (block.variant === "card-sort") {
          return <CardSortPreview content={content} />;
        }

        // Vertical tabs variant renders using the tabs preview in vertical orientation
        if (block.variant === "vertical-tabs") {
          return <VerticalTextTabsPreview content={content} isMobile={isMobileView} />;
        }

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
                <div key={i} className="prose prose-base max-w-none text-foreground prose-headings:tracking-tight prose-headings:font-bold prose-headings:text-foreground prose-p:leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHtml(col.trim()) }} />
              ))}
            </div>
          );
        }

        return (
          <div
            className="prose prose-base max-w-none text-foreground prose-headings:tracking-tight prose-headings:font-bold prose-headings:text-foreground prose-p:leading-relaxed prose-p:text-[17px]"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(cleanContent) }}
          />

        );
      }
      case "image":
        return block.content ? (
          <img data-zoomable="true" src={block.content} alt="Course content image" className="w-full rounded-2xl shadow-md ring-1 ring-border/40 cursor-zoom-in transition-transform duration-200 hover:scale-[1.005] hover:shadow-lg" />
        ) : null;
      case "image-description": {
        try {
          const parsed = JSON.parse(block.content);
          const imgSrc = parsed.imageUrl || parsed.image || "";
          const descHtml = parsed.description || parsed.text || "";
          const rightLayout = parsed.layout === "image-right";
          return (
            <div className={cn(
              "flex gap-6 sm:gap-8 items-center",
              isCompactView ? "flex-col" : rightLayout ? "flex-row-reverse" : "flex-row"
            )}>
              {imgSrc && (
                <img data-zoomable="true" src={imgSrc} alt="Course illustration" className={cn(
                  "rounded-2xl shadow-md ring-1 ring-border/40 object-cover cursor-zoom-in transition-transform duration-200 hover:scale-[1.005] hover:shadow-lg",
                  isCompactView ? "w-full" : "w-1/2"
                )} />
              )}
              <div className="flex-1 prose prose-base max-w-none text-foreground prose-headings:tracking-tight prose-p:leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHtml(descHtml) }} />
            </div>
          );
        } catch {
          return null;
        }
      }

      case "quiz": {
        let questions: unknown[] = [];
        let settings: Record<string, unknown> | undefined;
        try {
          const raw = (block.content || "").trim();
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              questions = parsed;
            } else if (parsed && typeof parsed === "object") {
              questions = Array.isArray(parsed.questions) ? parsed.questions : [];
              settings = parsed;
            }
          }
        } catch {
          // fall through to demo
        }
        if (!Array.isArray(questions) || questions.length === 0) {
          questions = JSON.parse(DEMO_QUIZ_CONTENT);
          settings = undefined;
        }
        return <InteractiveQuiz questions={questions as never} settings={settings as never} isCompactView={isCompactView} />;
      }
      case "video": {
        const videoSrc = block.content || DEMO_VIDEO_URL;
        return (
          <div className="rounded-xl overflow-hidden border border-border/40 bg-black/5">
            <video
              src={videoSrc}
              controls
              className="w-full max-h-[400px] rounded-xl"
              aria-label={block.content ? "Course video" : "Sample video"}
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
          const videoSrc = parsed.videoUrl || parsed.video || "";
          const descHtml = parsed.description || parsed.text || "";
          const rightLayout = parsed.layout === "video-right";
          return (
            <div className={cn(
              "flex gap-6 sm:gap-8 items-center",
              isCompactView ? "flex-col" : rightLayout ? "flex-row-reverse" : "flex-row"
            )}>
              <div className={cn(
                "rounded-2xl overflow-hidden border border-border/40 bg-black/5 shadow-md",
                isCompactView ? "w-full" : "w-1/2"
              )}>
                {videoSrc ? (
                  <video src={videoSrc} controls className="w-full rounded-2xl" />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <Video className="w-8 h-8 text-muted-foreground/40" />
                    <p className="text-xs text-muted-foreground/50">No video</p>
                  </div>
                )}
              </div>
              <div className="flex-1 prose prose-base max-w-none text-foreground prose-headings:tracking-tight prose-p:leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHtml(descHtml) }} />
            </div>
          );
        } catch {
          return null;
        }
      }

      case "hotspot": {
        try {
          const parsed = JSON.parse(block.content || "{}");
          const img: string = parsed.imageUrl || "";
          const list: any[] = Array.isArray(parsed.hotspots) ? parsed.hotspots : [];
          const color: string = parsed.settings?.color || "hsl(211, 100%, 50%)";
          if (!img) return null;
          return (
            <div className="relative rounded-xl overflow-hidden border border-border/40 bg-muted/20">
              <img src={img} alt="Interactive hotspot image" className="block w-full h-auto" />
              {list.map((hs, idx) => (
                <details key={hs.id || idx} className="absolute group" style={{ left: `${hs.x}%`, top: `${hs.y}%`, width: `${hs.width ?? hs.w ?? 10}%`, height: `${hs.height ?? hs.h ?? 10}%` }}>

                  <summary className="list-none cursor-pointer w-full h-full flex items-center justify-center rounded-md transition-all" style={{ background: `${color.replace("hsl(", "hsla(").replace(")", " / 0.25)")}`, border: `2px solid ${color}` }} aria-label={hs.title || `Hotspot ${idx + 1}`}>
                    <span className="text-[11px] font-semibold text-white px-2 py-0.5 rounded-full shadow" style={{ background: color }}>{idx + 1}</span>
                  </summary>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg p-3 z-20">
                    {hs.title && <p className="text-sm font-semibold mb-1">{hs.title}</p>}
                    {hs.imageUrl && <img src={hs.imageUrl} alt="" className="w-full rounded-lg mb-2" />}
                    <div className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: sanitizeHtml(hs.description || "") }} />
                    {hs.linkUrl && (
                      <a href={hs.linkUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-xs text-primary hover:underline">
                        Open link →
                      </a>
                    )}
                  </div>
                </details>
              ))}
            </div>
          );
        } catch {
          return null;
        }
      }
      case "tabs": {
        if (block.variant === "vertical-tabs") {
          return <VerticalTextTabsPreview content={block.content || ""} isMobile={isMobileView} />;
        }
        return <TabsPreview content={block.content || ""} />;
      }
      case "flashcards": {
        return <FlashcardsPreview content={block.content || ""} />;
      }
      case "audio": {
        if (block.variant === "ai-audio") {
          let aiState: { audioUrl?: string; transcript?: string; showTranscriptToLearners?: boolean; voiceId?: string } = {};
          try { aiState = JSON.parse(block.content || "{}"); } catch { /* ignore */ }
          const audioSrc = aiState.audioUrl || DEMO_AUDIO_URL;
          const showTranscript = aiState.showTranscriptToLearners !== false && !!aiState.transcript;
          return (
            <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.04] via-background to-background overflow-hidden">
              <div className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-primary/10">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                  <Music className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">AI Narration</p>
                  <p className="text-xs text-muted-foreground">Generated voiceover</p>
                </div>
              </div>
              <div className="p-4">
                <audio src={audioSrc} controls className="w-full h-9" aria-label="AI-generated narration" />
                {showTranscript && (
                  <details className="group mt-3 rounded-xl bg-gradient-to-br from-muted/30 to-muted/50 border border-border/50 hover:border-primary/30 transition-colors [&_summary::-webkit-details-marker]:hidden">
                    <summary className="cursor-pointer select-none flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-foreground">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center transition-transform group-open:rotate-180">
                        <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                      </span>
                      <span className="flex-1">Transcript</span>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{aiState.transcript?.split(/\s+/).filter(Boolean).length ?? 0} words</span>
                    </summary>
                    <div className="px-4 pb-4 pt-1">
                      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere] border-l-2 border-primary/30 pl-3">{aiState.transcript}</p>
                    </div>
                  </details>
                )}
              </div>
            </div>
          );
        }
        const audioSrc = block.content || DEMO_AUDIO_URL;
        return (
          <div>
            <div className="rounded-xl border border-border/40 bg-muted/20 p-4 sm:p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Music className="w-6 h-6 text-primary/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground mb-2">{block.content ? "Audio" : "Sample Audio Track"}</p>
                  <audio src={audioSrc} controls className="w-full h-8" aria-label={block.content ? "Course audio" : "Sample audio track"} />
                  {!block.content && (
                    <p className="text-xs text-muted-foreground italic mt-1">Sample audio — replace with your own content</p>
                  )}
                </div>
              </div>
            </div>
            <PreviewAudioTranscript blockId={block.id} />
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
                  "w-full flex items-start justify-between gap-2 px-5 py-3 text-left text-sm transition-colors border-l-[3px]",
                  hasActiveChild
                    ? "border-primary bg-primary/[0.04] text-foreground font-medium"
                    : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
                onClick={() => toggleSection(item.id)}
                aria-expanded={isExpanded}
                aria-label={`${item.title || "Untitled section"} section, ${isExpanded ? "collapse" : "expand"}`}
              >
                <span className="pr-2 break-words [overflow-wrap:anywhere] text-left flex-1 min-w-0">{item.title || "Untitled section"}</span>
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground mt-0.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground mt-0.5" />
                )}
              </button>
              {isExpanded && item.children && item.children.length > 0 && (
                <div>
                  {item.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => onPageSelect(child.id)}
                      aria-label={`Navigate to ${child.title || "Untitled page"}`}
                      aria-current={child.id === selectedId ? "page" : undefined}
                      className={cn(
                        "w-full flex items-start gap-2 pl-8 pr-5 py-2.5 text-left text-[13px] transition-colors border-l-[3px]",
                        child.id === selectedId
                          ? "border-primary bg-primary/[0.06] text-foreground font-medium"
                          : "border-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                      )}
                    >
                      {child.type === "question" ? (
                        <HelpCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      )}
                      <span className="break-words [overflow-wrap:anywhere] text-left flex-1 min-w-0">{child.title || "Untitled page"}</span>
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
            aria-label={`Navigate to ${item.title || "Untitled page"}`}
            aria-current={item.id === selectedId ? "page" : undefined}
            className={cn(
              "w-full flex items-start gap-2 px-5 py-3 text-left text-sm transition-colors border-l-[3px]",
              item.id === selectedId
                ? "border-primary bg-primary/[0.06] text-foreground font-medium"
                : "border-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground"
            )}
          >
            {item.type === "question" ? (
              <HelpCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            ) : (
              <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            )}
            <span className="break-words [overflow-wrap:anywhere] text-left flex-1 min-w-0">{item.title || "Untitled page"}</span>
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
            <h3 className="text-sm font-semibold text-foreground" id="mobile-outline-heading">Course Outline</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {currentIndex + 1} of {totalPages} pages · {progress}% complete
            </p>
          </div>
          <button
            onClick={() => setMobileOutlineOpen(false)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Close course outline"
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
      <div className="min-h-screen bg-background flex flex-col" style={{ fontFamily: getFontStack(data?.fontId ?? previewState?.fontId ?? "default") }}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
          <div className="flex items-center gap-2 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="rounded-full shrink-0"
              aria-label="Go back"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" focusable="false" />
            </Button>
            <span aria-hidden="true" className="hidden sm:block h-6 w-px bg-border mx-1" />
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 min-w-0">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full px-2 py-1 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Go to home"
              >
                <Home className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                <span className="hidden sm:inline">Home</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden="true" focusable="false" />
              <span className="text-sm font-medium text-foreground whitespace-nowrap px-1" aria-current="page">Course Preview</span>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <DeviceToggle />
            <span aria-hidden="true" className="hidden sm:block h-7 w-px bg-border mx-1" />
            <GlossaryDialog />
            <Button
              variant="outline"
              className="rounded-full border-primary text-primary hover:bg-primary/5 gap-2"
              onClick={() => setShowExportDialog(true)}
            >
              <Download className="w-4 h-4" aria-hidden="true" focusable="false" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>
        <CoursePreviewStatusBanner courseId={(data ?? previewState)?.courseId} />

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
                  <CourseBrandingLogo courseId={String((data ?? previewState)?.courseId ?? "")} slot="intro" />
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

            <div
              className={cn(
                "border-l bg-card flex-shrink-0 overflow-auto",
                isCompactView ? "w-full border-l-0 border-t" : "w-full lg:w-[60%]"
              )}
              style={contentBgStyle}
            >
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
                                  <img src={item.thumbnailUrl} alt={`${item.title} section thumbnail`} className="w-full h-full object-cover" />
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
                                  aria-label={`Start ${child.title || "Untitled page"}`}
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
                        aria-label={`Start ${item.title || "Untitled page"}`}
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
        <GenerateExportDialog
          open={showExportDialog}
          onOpenChange={setShowExportDialog}
          courseTitle={data?.title}
        />
      </div>
    );
  }

  // Content view with sidebar (desktop) / bottom bar + sheet (mobile)
  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ fontFamily: getFontStack(data?.fontId ?? previewState?.fontId ?? "default") }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => setStarted(false)} className="rounded-full shrink-0" aria-label="Go back to course landing">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" focusable="false" />
          </Button>
          <span aria-hidden="true" className="hidden sm:block h-6 w-px bg-border mx-1" />
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 min-w-0">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full px-2 py-1 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Go to home"
            >
              <Home className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
              <span className="hidden sm:inline">Home</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden="true" focusable="false" />
            <span className="text-sm font-medium text-foreground whitespace-nowrap px-1" aria-current="page">Course Preview</span>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <DeviceToggle />
          <span aria-hidden="true" className="hidden sm:block h-7 w-px bg-border mx-1" />
          <GlossaryDialog />
          <Button
            variant="outline"
            className="rounded-full border-primary text-primary hover:bg-primary/5 gap-2"
            onClick={() => setShowExportDialog(true)}
          >
            <Download className="w-4 h-4" aria-hidden="true" focusable="false" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
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
                  <div className="w-full h-1 bg-primary-foreground/20 rounded-full overflow-visible relative">
                    <div
                      className="h-full bg-primary-foreground rounded-full transition-all duration-500 relative"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary-foreground transition-all duration-500 shadow-[0_0_0_1.5px_hsl(var(--primary))]">
                        <div className="absolute inset-[3px] rounded-full bg-primary" />
                      </div>
                    </div>
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
          <div
            className={cn(
              "flex-1 overflow-auto",
              isCompactView && "pb-20" // space for bottom bar
            )}
            style={contentBgStyle}
          >
            <div className={cn(
              "max-w-3xl mx-auto space-y-10 sm:space-y-12",
              isCompactView ? "px-5 py-8" : "px-8 sm:px-14 lg:px-16 py-14"
            )}>

              {currentPage ? (
                <>
                   {/* Page indicator */}
                   <div className="space-y-3 sm:space-y-4">
                     <CourseBrandingLogo courseId={String((data ?? previewState)?.courseId ?? "")} slot="content" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                      Page {currentIndex + 1} of {totalPages}
                    </span>
                    <h2 className={cn(
                      "font-semibold text-foreground leading-[1.1] tracking-tight",
                      isCompactView ? "text-2xl" : "text-3xl sm:text-[2.5rem]"
                    )}>
                      {currentPage.title || "Untitled"}
                    </h2>
                    {currentPage.type === "question" && (
                      <span className="inline-flex text-xs text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">Quiz</span>
                    )}
                    <div className="h-1 w-16 rounded-full bg-gradient-to-r from-primary to-primary/40" />
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
                      <div className="space-y-8 sm:space-y-10">
                        {blocksToRender.map((block) => (
                          <div key={block.id}>{renderBlockContent(block)}</div>
                        ))}
                      </div>

                    );
                  })()}

                  {/* Navigation - desktop inline, mobile uses bottom bar */}
                  {!isCompactView && (() => {
                    const prevPage = currentIndex > 0 ? allPages[currentIndex - 1] : null;
                    return (
                      <div className="pt-10 mt-4 border-t border-border/60 flex justify-between items-center w-full">
                        <button
                          type="button"
                          onClick={goToPrev}
                          disabled={!prevPage}
                          className="group flex items-center gap-2 px-2 py-1 transition-colors disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                          aria-label="Go to previous page"
                        >
                          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" focusable="false" />
                          <span className="text-sm font-medium">Previous</span>
                        </button>
                        <button
                          type="button"
                          onClick={goToNext}
                          disabled={currentIndex < 0}
                          className={cn(
                            "group flex items-center gap-2 px-2 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded",
                            isLastPage ? "text-foreground" : "text-foreground"
                          )}
                          aria-label={isLastPage ? "Finish course" : "Go to next page"}
                        >
                          <span className="text-sm font-medium">{isLastPage ? "Finish" : "Next"}</span>
                          {isLastPage ? (
                            <Check className="w-4 h-4" aria-hidden="true" focusable="false" />
                          ) : (
                            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" focusable="false" />
                          )}
                        </button>
                      </div>
                    );
                  })()}


                  {/* Completion banner */}
                  {completed && (
                    <div
                      ref={completionRef}
                      className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-10 sm:p-14 mt-4 animate-fade-in"
                    >
                      {/* Decorative sparkles */}
                      <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-primary/20 blur-3xl" aria-hidden="true" />
                      <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
                      <Sparkles className="absolute top-4 right-4 w-5 h-5 text-primary/60" aria-hidden="true" focusable="false" />
                      <Sparkles className="absolute bottom-6 left-6 w-4 h-4 text-primary/40" aria-hidden="true" focusable="false" />

                      <div className="relative flex flex-col items-center text-center space-y-6">
                        {/* Decorative completion illustration */}
                        <svg
                          viewBox="0 0 200 140"
                          className="w-44 sm:w-52 h-auto animate-scale-in"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <defs>
                            <linearGradient id="bookGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
                              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.55" />
                            </linearGradient>
                          </defs>
                          <ellipse cx="100" cy="124" rx="60" ry="5" fill="hsl(var(--primary))" opacity="0.12" />
                          <path d="M30 90 Q100 70 170 90 L170 110 Q100 92 30 110 Z" fill="url(#bookGrad)" />
                          <path d="M100 78 L100 108" stroke="hsl(var(--background))" strokeWidth="1.5" opacity="0.6" />
                          <path d="M50 86 Q75 80 98 84" stroke="hsl(var(--background))" strokeWidth="1" fill="none" opacity="0.55" />
                          <path d="M102 84 Q125 80 150 86" stroke="hsl(var(--background))" strokeWidth="1" fill="none" opacity="0.55" />
                          <g transform="translate(100 48)">
                            <path d="M-30 0 L0 -14 L30 0 L0 14 Z" fill="hsl(var(--foreground))" />
                            <path d="M-18 4 L-18 18 Q0 26 18 18 L18 4 L0 11 Z" fill="hsl(var(--foreground))" opacity="0.85" />
                            <line x1="22" y1="2" x2="28" y2="20" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" />
                            <circle cx="29" cy="22" r="2.5" fill="hsl(var(--primary))" />
                          </g>
                          <g fill="hsl(var(--primary))">
                            <circle cx="40" cy="40" r="1.8" />
                            <circle cx="160" cy="36" r="2.2" />
                            <circle cx="170" cy="62" r="1.5" opacity="0.7" />
                            <circle cx="30" cy="62" r="1.5" opacity="0.7" />
                          </g>
                        </svg>
                        <div className="space-y-3">
                          <h3 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
                            You&apos;ve reached the end of this course
                          </h3>
                        </div>
                        <Button
                          onClick={() => navigate("/dashboard")}
                          size="lg"
                          className="mt-2 gap-2 shadow-md"
                          aria-label="Back to homepage"
                        >
                          <Home className="w-4 h-4" aria-hidden="true" focusable="false" />
                          Back to Homepage
                        </Button>
                      </div>
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
                aria-label="Open course outline"
              >
                <Menu className="w-4 h-4" aria-hidden="true" />
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
                  aria-label="Previous page"
                >
                  <ArrowLeft className="w-4 h-4 text-foreground" />
                </button>
                <button
                  onClick={goToNext}
                  disabled={currentIndex < 0}
                  className={cn(
                    "p-2 rounded-full transition-colors disabled:opacity-30",
                    isLastPage
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "hover:bg-muted"
                  )}
                  aria-label={isLastPage ? "Finish course" : "Next page"}
                >
                  {isLastPage ? (
                    <Check className="w-4 h-4" aria-hidden="true" focusable="false" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-foreground" aria-hidden="true" focusable="false" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Mobile outline bottom sheet */}
          {isCompactView && <MobileOutlineSheet />}
        </div>
        )}
      </div>
      <GenerateExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        courseTitle={data?.title}
      />
      <ImageLightbox />
    </div>
  );
};

export default MultipageCoursePreview;

// ============= Interactive preview components =============

const EmptyTabContent = () => (
  <div className="rounded-xl border border-dashed border-border bg-gradient-to-br from-muted/30 to-muted/10 px-6 py-10 flex flex-col items-center justify-center text-center gap-4">
    <svg
      width="120"
      height="96"
      viewBox="0 0 120 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className="text-primary"
    >
      {/* Back page */}
      <rect x="22" y="14" width="64" height="76" rx="6" className="fill-muted" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.2" />
      {/* Front page */}
      <rect x="32" y="8" width="64" height="76" rx="6" fill="hsl(var(--background))" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.4" />
      {/* Header bar */}
      <rect x="40" y="18" width="32" height="5" rx="2.5" fill="currentColor" fillOpacity="0.9" />
      {/* Content lines */}
      <rect x="40" y="30" width="48" height="3" rx="1.5" fill="currentColor" fillOpacity="0.18" />
      <rect x="40" y="38" width="44" height="3" rx="1.5" fill="currentColor" fillOpacity="0.18" />
      <rect x="40" y="46" width="40" height="3" rx="1.5" fill="currentColor" fillOpacity="0.18" />
      {/* Image placeholder block */}
      <rect x="40" y="56" width="48" height="20" rx="3" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="2 2" />
      <circle cx="48" cy="65" r="2" fill="currentColor" fillOpacity="0.35" />
      <path d="M54 72 L62 64 L72 72 L84 60" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Plus badge */}
      <circle cx="92" cy="14" r="9" fill="currentColor" />
      <path d="M92 10 V18 M88 14 H96" stroke="hsl(var(--primary-foreground))" strokeWidth="1.6" strokeLinecap="round" />
      {/* Sparkle */}
      <path d="M14 36 L15.5 39 L18.5 40.5 L15.5 42 L14 45 L12.5 42 L9.5 40.5 L12.5 39 Z" fill="currentColor" fillOpacity="0.5" />
      <circle cx="108" cy="74" r="2" fill="currentColor" fillOpacity="0.5" />
    </svg>
    <div className="space-y-1">
      <p className="text-sm font-medium text-foreground">Nothing here yet</p>
      <p className="text-xs text-muted-foreground">Add content to bring this tab to life.</p>
    </div>
  </div>
);


interface PreviewTab {
  id: string;
  name: string;
  content: string;
  imageUrl?: string;
}

function parseTabs(raw: string): { tabs: PreviewTab[]; activeId: string } | null {
  try {
    const parsed = JSON.parse(raw || "{}");
    if (!Array.isArray(parsed.tabs) || parsed.tabs.length === 0) return null;
    const tabs: PreviewTab[] = parsed.tabs.map((t: any, i: number) => ({
      id: String(t.id || `tab-${i}`),
      name: String(t.name || "Untitled Tab"),
      content: String(t.content || ""),
      imageUrl: typeof t.imageUrl === "string" ? t.imageUrl : "",
    }));
    const activeId =
      typeof parsed.activeId === "string" && tabs.some((t) => t.id === parsed.activeId)
        ? parsed.activeId
        : tabs[0].id;
    return { tabs, activeId };
  } catch {
    return null;
  }
}

const TabsPreview = ({ content }: { content: string }) => {
  const initial = parseTabs(content);
  const [activeId, setActiveId] = useState<string>(initial?.activeId ?? "");
  if (!initial) {
    return (
      <div className="p-4 bg-muted/30 rounded-xl border border-border/40 text-sm text-muted-foreground">
        No tabs configured yet.
      </div>
    );
  }
  const { tabs } = initial;
  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];
  const hasBody = (active.content || "").replace(/<[^>]+>/g, "").trim().length > 0;

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-md shadow-foreground/[0.04] ring-1 ring-foreground/[0.02]">
      <div className="relative border-b border-border/60 bg-gradient-to-b from-muted/40 to-muted/10">
        <div
          role="tablist"
          aria-label="Info tabs"
          className="flex items-stretch overflow-x-auto pretty-scrollbar"
        >
          {tabs.map((tab, idx) => {
            const isActive = tab.id === active.id;
            return (
              <div key={tab.id} className="flex items-stretch shrink-0">
                {idx > 0 && (
                  <span
                    aria-hidden="true"
                    className="self-center h-6 w-px bg-gradient-to-b from-transparent via-border to-transparent"
                  />
                )}
                <button
                  role="tab"
                  aria-selected={isActive}
                  type="button"
                  onClick={() => setActiveId(tab.id)}
                  title={tab.name}
                  className={cn(
                    "group relative shrink-0 inline-flex items-center gap-2.5 px-4 py-3 text-sm font-medium whitespace-nowrap max-w-[240px] transition-all duration-200",
                    isActive
                      ? "text-foreground bg-gradient-to-b from-primary/10 via-primary/[0.04] to-transparent"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/70"
                  )}
                >
                  {/* Top accent rail */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute left-3 right-3 top-0 h-[3px] rounded-b-full bg-primary transition-all duration-300 ease-out origin-center",
                      isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
                    )}
                  />
                  <span
                    aria-hidden="true"
                    className={cn(
                      "shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-md text-[10px] font-bold tabular-nums transition-colors",
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                    )}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate">{tab.name}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div role="tabpanel" className="p-4 sm:p-6 animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
          {active.imageUrl ? (
            <div className="w-full md:w-[140px] shrink-0">
              <img
                data-zoomable="true"
                src={active.imageUrl}
                alt={`Visual for ${active.name}`}
                className="w-full h-auto rounded-xl border border-border/40 object-cover aspect-[4/3] shadow-sm cursor-zoom-in transition-transform duration-200 hover:scale-[1.005] hover:shadow-md"
              />
            </div>
          ) : null}
          <div className="flex-1 min-w-0">
            {hasBody ? (
              <div
                className="prose prose-sm max-w-none text-foreground break-words [overflow-wrap:anywhere]"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(active.content) }}
              />
            ) : (
              <EmptyTabContent />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};




const VerticalTextTabsPreview = ({ content, isMobile = false }: { content: string; isMobile?: boolean }) => {
  // Vertical tabs share the tabs JSON shape; if parseable use it, otherwise render content as a single panel
  const parsed = parseTabs(content);
  const [activeId, setActiveId] = useState<string>(parsed?.activeId ?? "");
  const panelRef = useRef<HTMLDivElement | null>(null);
  if (!parsed) {
    return (
      <div
        className="prose prose-sm max-w-none text-foreground"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(content || "") }}
      />
    );
  }
  const { tabs } = parsed;
  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];
  const hasBody = (active.content || "").replace(/<[^>]+>/g, "").trim().length > 0;
  const handleTabSelect = (tabId: string) => {
    setActiveId(tabId);
    requestAnimationFrame(() => {
      if (panelRef.current) panelRef.current.scrollTop = 0;
    });
  };

  return (
    <>
      {/* Mobile: compact vertical tabs with rotated labels */}
      {isMobile && (
      <div className="grid grid-cols-[2.25rem_minmax(0,1fr)] rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden min-h-[16rem]">
        <div role="tablist" aria-label="Info tabs" className="flex flex-col bg-muted/40 border-r border-border">
          {tabs.map((tab) => {
            const isActive = tab.id === active.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                type="button"
                onClick={() => handleTabSelect(tab.id)}
                title={tab.name}
                className={cn(
                  "relative flex-1 min-h-[5rem] flex items-center justify-center px-1 py-3 transition-colors border-b border-border last:border-b-0",
                  isActive
                    ? "bg-card text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/60"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary" aria-hidden="true" />
                )}
                <span
                  className="text-[11px] font-semibold tracking-wide uppercase truncate max-h-full"
                  style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                >
                  {tab.name}
                </span>
              </button>
            );
          })}
        </div>
        <div role="tabpanel" className="p-4 min-w-0 overflow-y-auto max-h-[70vh]">
          {active.imageUrl && (
            <img
              data-zoomable="true"
              src={active.imageUrl}
              alt={`Visual for ${active.name}`}
              className="w-full h-auto rounded-xl border border-border/40 object-cover mb-3 cursor-zoom-in transition-transform duration-200 hover:scale-[1.005] hover:shadow-md"
            />
          )}
          {hasBody ? (
            <div
              className="prose prose-sm max-w-none text-foreground break-words [overflow-wrap:anywhere]"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(active.content) }}
            />
          ) : (
            <EmptyTabContent />
          )}
        </div>
      </div>
      )}


      {/* Desktop: vertical tabs */}
      {!isMobile && (
      <div className="grid rounded-2xl border border-border/60 bg-card shadow-md shadow-foreground/[0.04] ring-1 ring-foreground/[0.02] grid-cols-[12rem_minmax(0,1fr)] max-h-[calc(100vh-8rem)] min-h-0 overflow-hidden">
        <div
          role="tablist"
          aria-label="Info tabs"
          className="flex flex-col shrink-0 gap-1 border-r border-border/60 bg-gradient-to-b from-muted/40 to-muted/10 p-2.5 max-h-[calc(100vh-8rem)] overflow-y-auto pretty-scrollbar rounded-l-2xl"
        >
          {tabs.map((tab, idx) => {
            const isActive = tab.id === active.id;
            const prevActive = idx > 0 && tabs[idx - 1].id === active.id;
            return (
              <div key={tab.id} className="flex flex-col">
                {idx > 0 && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mx-3 h-px bg-gradient-to-r from-transparent via-border to-transparent transition-opacity duration-200",
                      isActive || prevActive ? "opacity-0" : "opacity-100"
                    )}
                  />
                )}
                <button
                  role="tab"
                  aria-selected={isActive}
                  type="button"
                  onClick={() => handleTabSelect(tab.id)}
                  title={tab.name}
                  className={cn(
                    "group relative text-left pl-3 pr-2.5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 shrink-0 inline-flex items-center gap-2.5 overflow-hidden",
                    isActive
                      ? "bg-gradient-to-r from-primary/10 via-primary/[0.04] to-transparent text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-card/70 hover:text-foreground"
                  )}
                >
                  {/* Active rail */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-primary transition-all duration-300 origin-center",
                      isActive ? "opacity-100 scale-y-100" : "opacity-0 scale-y-50"
                    )}
                  />
                  <span
                    aria-hidden="true"
                    className={cn(
                      "shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-md text-[10px] font-bold tabular-nums transition-colors",
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                    )}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate flex-1">{tab.name}</span>
                </button>
              </div>
            );
          })}

        </div>
        <div ref={panelRef} role="tabpanel" className="p-6 flex-1 min-w-0 min-h-0 max-h-[calc(100vh-8rem)] overflow-y-auto pretty-scrollbar animate-in fade-in duration-300">
          {active.imageUrl && (
            <img
              data-zoomable="true"
              src={active.imageUrl}
              alt={`Visual for ${active.name}`}
              className="w-full max-w-md h-auto rounded-xl border border-border/40 object-cover mb-4 shadow-sm cursor-zoom-in transition-transform duration-200 hover:scale-[1.005] hover:shadow-md"
            />
          )}
          {hasBody ? (
            <div
              className="prose prose-sm max-w-none text-foreground break-words [overflow-wrap:anywhere]"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(active.content) }}
            />
          ) : (
            <EmptyTabContent />
          )}
        </div>
      </div>
      )}

    </>
  );
};

interface AccordionItem {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
}

function parseAccordion(raw: string): AccordionItem[] {
  // 1) Try structured JSON { items: [{title, body, imageUrl}] }
  try {
    const parsed = JSON.parse(raw || "{}");
    if (Array.isArray(parsed?.items)) {
      if (parsed.items.length === 0) return [];
      return parsed.items.map((it: any, i: number) => ({
        id: String(it.id || `acc-${i}`),
        title: String(it.title || `Section ${i + 1}`),
        body: String(it.body || ""),
        imageUrl: typeof it.imageUrl === "string" ? it.imageUrl : undefined,
      }));
    }
  } catch {
    /* fall through */
  }


  // 2) Split HTML by headings (h2/h3) — each heading becomes a panel
  if (raw && /<h[23][^>]*>/i.test(raw)) {
    const parts = raw.split(/(?=<h[23][^>]*>)/i).filter(Boolean);
    return parts.map((chunk, i) => {
      const match = chunk.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>([\s\S]*)/i);
      if (!match) return { id: `acc-${i}`, title: `Section ${i + 1}`, body: chunk };
      return {
        id: `acc-${i}`,
        title: match[1].replace(/<[^>]+>/g, "").trim() || `Section ${i + 1}`,
        body: (match[2] || "").trim(),
      };
    });
  }

  // 3) Single panel fallback
  return [{ id: "acc-0", title: "Section 1", body: raw || "" }];
}

const AccordionPreview = ({ content }: { content: string }) => {
  const items = parseAccordion(content);
  // Parse open mode + default open ids from JSON if available
  let openMode: "single" | "multiple" = "single";
  let defaultOpenIds: string[] = [];
  try {
    const parsed = JSON.parse(content || "{}");
    if (parsed?.openMode === "multiple") openMode = "multiple";
    if (Array.isArray(parsed?.defaultOpenIds)) {
      defaultOpenIds = parsed.defaultOpenIds.map(String).filter((id: string) => items.some((it) => it.id === id));
    }
  } catch {
    /* ignore */
  }
  const initialOpen: string[] =
    defaultOpenIds.length > 0
      ? (openMode === "single" ? [defaultOpenIds[0]] : defaultOpenIds)
      : (items[0] ? [items[0].id] : []);
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(initialOpen));

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (openMode === "single") next.clear();
        next.add(id);
      }
      return next;
    });
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 bg-gradient-to-br from-muted/40 via-card to-card p-8 sm:p-10 flex flex-col items-center justify-center text-center">
        <svg
          width="120"
          height="96"
          viewBox="0 0 120 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
          className="mb-4"
        >
          <defs>
            <linearGradient id="acc-empty-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.18" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.04" />
            </linearGradient>
          </defs>
          {/* Stacked cards */}
          <rect x="14" y="14" width="92" height="20" rx="6" fill="url(#acc-empty-grad)" stroke="hsl(var(--border))" />
          <rect x="14" y="38" width="92" height="20" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border))" />
          <rect x="14" y="62" width="92" height="20" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border))" />
          {/* Lines inside top expanded card */}
          <rect x="22" y="22" width="40" height="4" rx="2" fill="hsl(var(--primary))" opacity="0.5" />
          <rect x="22" y="46" width="60" height="3" rx="1.5" fill="hsl(var(--muted-foreground))" opacity="0.35" />
          <rect x="22" y="70" width="50" height="3" rx="1.5" fill="hsl(var(--muted-foreground))" opacity="0.35" />
          {/* Chevrons */}
          <path d="M92 22 l4 4 l4 -4" stroke="hsl(var(--primary))" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M92 46 l4 4 l4 -4" stroke="hsl(var(--muted-foreground))" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5" />
          <path d="M92 70 l4 4 l4 -4" stroke="hsl(var(--muted-foreground))" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5" />
        </svg>
        <p className="text-sm font-semibold text-foreground">No sections yet</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Add sections in the editor to build a collapsible accordion of content.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm space-y-2 p-2 sm:p-3">
      {items.map((item, idx) => {
        const isOpen = openIds.has(item.id);
        const hasBody = (item.body || "").replace(/<[^>]+>/g, "").trim().length > 0;
        const imageUrl = (item as any).imageUrl as string | undefined;
        return (
          <div
            key={item.id}
            className={cn(
              "group relative rounded-xl border transition-all duration-300 ease-out overflow-hidden",
              isOpen
                ? "border-primary/30 bg-gradient-to-br from-primary/[0.06] via-primary/[0.02] to-transparent shadow-[0_8px_24px_-12px_hsl(var(--primary)/0.25)]"
                : "border-border/60 bg-card hover:border-border hover:shadow-sm"
            )}
          >
            {/* Active left accent bar — clean flush rail */}
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute left-0 top-0 bottom-0 w-[3px] bg-primary",
                "transition-all duration-300 ease-out origin-top",
                isOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"
              )}
            />



            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              aria-controls={`acc-prev-${item.id}`}
              className="w-full flex items-center gap-3 sm:gap-4 pl-4 sm:pl-5 pr-3 sm:pr-4 py-3.5 text-left"
            >
              {/* Numbered badge */}
              <span
                className={cn(
                  "shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-lg text-[11px] font-bold tabular-nums transition-all duration-300",
                  isOpen
                    ? "bg-primary text-primary-foreground shadow-sm scale-105"
                    : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                )}
                aria-hidden="true"
              >
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className={cn(
                "flex-1 text-sm sm:text-base font-semibold break-words [overflow-wrap:anywhere] transition-colors",
                isOpen ? "text-foreground" : "text-foreground/90"
              )}>{item.title}</span>
              {/* Animated chevron in pill */}
              <span
                className={cn(
                  "shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300",
                  isOpen ? "bg-primary/15 text-primary rotate-180" : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                )}
                aria-hidden="true"
              >
                <ChevronDown className="w-4 h-4" />
              </span>
            </button>
            {/* Smooth expand using grid rows trick */}
            <div
              id={`acc-prev-${item.id}`}
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <div className="px-4 sm:px-5 pb-4 pt-1 animate-in fade-in slide-in-from-top-1 duration-300">
                  <div className="flex flex-col md:flex-row gap-4">
                    {imageUrl && (
                      <div className="w-full md:w-[140px] shrink-0">
                        <img
                          data-zoomable="true"
                          src={imageUrl}
                          alt={`Visual for ${item.title}`}
                          className="w-full h-auto aspect-[4/3] rounded-xl border border-border/40 object-cover shadow-sm cursor-zoom-in transition-transform duration-200 hover:scale-[1.005] hover:shadow-md"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {hasBody ? (
                        <div
                          className="prose prose-sm max-w-none text-foreground break-words [overflow-wrap:anywhere]"
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.body) }}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No content in this panel yet.</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

