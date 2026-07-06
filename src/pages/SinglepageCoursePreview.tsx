import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, BookOpen, ChevronDown, ChevronRight, Image as ImageIcon, FileText, HelpCircle, Monitor, Tablet, Smartphone, Video, Music, Download, Menu, X, Check, Home, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import type { SinglePageRestoreState } from "@/components/CourseCreation/SinglePageCourseCreator";
import { InteractiveQuiz } from "@/components/CoursePreview/InteractiveQuiz";
import { getFontStack } from "@/components/CourseCreation/FontSelectorDropdown";
import { CourseBrandingLogo } from "@/components/CourseCreation/CourseBrandingLogo";
import { useCourseContentBackgroundStyle } from "@/services/contentBackgrounds";
import { FlashcardsPreview } from "@/components/CourseCreation/FlashcardsBlock";
import { CardSortPreview } from "@/components/CourseCreation/CardSortBlock";
import { LayoutUtilityBlock, isLayoutUtilityVariant } from "@/components/CourseCreation/LayoutUtilityBlock";
import { PreviewAudioTranscript } from "@/components/CoursePreview/PreviewAudioTranscript";
import { ImageLightbox } from "@/components/CoursePreview/ImageLightbox";

interface CourseItem {
  id: string;
  type: "section" | "page";
  title: string;
  children?: CourseItem[];
}

interface PageContentBlock {
  id: string;
  type: "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description" | "video-description" | "hotspot" | "flashcards";
  content: string;
  variant?: string;
}

interface ContentBlockData {
  id: string;
  type: "text" | "image" | "description" | "video" | "audio" | "doc" | "quiz" | "image-description" | "video-description" | "hotspot" | "flashcards";
  content: string;
}

interface PreviewState {
  title: string;
  items: CourseItem[];
  contentBlocks: ContentBlockData[];
  pageBlocksMap: Record<string, PageContentBlock[]>;
  sectionImages?: Record<string, string | null>;
  returnState?: SinglePageRestoreState;
  fontId?: string;
  courseId?: string;
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [outlineExpandedSections, setOutlineExpandedSections] = useState<Set<string>>(new Set());
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const completionRef = useRef<HTMLDivElement | null>(null);
  const contentBgStyle = useCourseContentBackgroundStyle(String((data ?? previewState)?.courseId ?? ""));

  const handleFinish = () => {
    setCompleted(true);
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        completionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
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
    setOutlineExpandedSections(new Set(sections));
  }, [navigate, previewState]);

  // Track active section/page based on scroll position
  useEffect(() => {
    if (!data) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveItemId(visible[0].target.id.replace('preview-item-', ''));
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );
    data.items.forEach((item) => {
      const el = document.getElementById(`preview-item-${item.id}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [data, expandedSections]);

  const toggleOutlineSection = (id: string) => {
    setOutlineExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const scrollToSection = (id: string) => {
    // Ensure the section is expanded in the content view
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    // Scroll to the element after a tick
    setTimeout(() => {
      const el = document.getElementById(`preview-item-${id}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    // Close sidebar on mobile
    if (isCompactView) setSidebarOpen(false);
  };

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
                "overflow-hidden bg-background relative flex flex-col",
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
        if (isLayoutUtilityVariant(block.variant)) {
          return <LayoutUtilityBlock variant={block.variant} content={content} onChange={() => {}} readOnly />;
        }
        if (block.variant === "card-sort") {
          return <CardSortPreview content={content} />;
        }



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
        return block.content ? <img data-zoomable="true" src={block.content} alt="Course content image" className="w-full max-w-2xl rounded-xl shadow-sm cursor-zoom-in transition-transform duration-200 hover:scale-[1.005] hover:shadow-md" /> : null;
      case "image-description": {
        try {
          const parsed = JSON.parse(block.content);
          return (
            <div className={cn("flex gap-4 sm:gap-6 items-start", isCompactView ? "flex-col" : parsed.layout === "image-right" ? "flex-row-reverse" : "flex-row")}>
              {parsed.image && <img data-zoomable="true" src={parsed.image} alt="Course illustration" className={cn("rounded-xl shadow-sm object-cover cursor-zoom-in transition-transform duration-200 hover:scale-[1.005] hover:shadow-md", isCompactView ? "w-full" : "w-1/2")} />}
              <div className="flex-1 prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: sanitizeHtml(parsed.text || "") }} />
            </div>
          );
        } catch { return null; }
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
                <details key={hs.id || idx} className="absolute group" style={{ left: `${hs.x}%`, top: `${hs.y}%`, width: `${hs.width}%`, height: `${hs.height}%` }}>
                  <summary className="list-none cursor-pointer w-full h-full flex items-center justify-center rounded-md transition-all" style={{ background: `${color.replace("hsl(", "hsla(").replace(")", " / 0.25)")}`, border: `2px solid ${color}` }} aria-label={hs.title || `Hotspot ${idx + 1}`}>
                    <span className="text-[11px] font-semibold text-white px-2 py-0.5 rounded-full shadow" style={{ background: color }}>{idx + 1}</span>
                  </summary>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg p-3 z-20">
                    {hs.title && <p className="text-sm font-semibold mb-1">{hs.title}</p>}
                    {hs.imageUrl && <img src={hs.imageUrl} alt="" className="w-full rounded-lg mb-2" />}
                    <div className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: sanitizeHtml(hs.description || "") }} />
                    {hs.linkUrl && (
                      <a href={hs.linkUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-xs text-primary hover:underline">Open link →</a>
                    )}
                  </div>
                </details>
              ))}
            </div>
          );
        } catch { return null; }
      }
      case "flashcards": {
        return <FlashcardsPreview content={block.content || ""} />;
      }
      case "audio": {
        if (block.variant === "ai-audio") {
          let aiState: { audioUrl?: string; transcript?: string; showTranscriptToLearners?: boolean } = {};
          try { aiState = JSON.parse(block.content || "{}"); } catch { /* ignore */ }
          const audioSrc = aiState.audioUrl || DEMO_AUDIO_URL;
          const showTranscript = aiState.showTranscriptToLearners !== false && !!aiState.transcript;
          return (
            <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.04] via-background to-background overflow-hidden">
              <div className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-primary/10">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center"><Music className="w-4 h-4 text-primary-foreground" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">AI Narration</p>
                  <p className="text-xs text-muted-foreground">Generated voiceover</p>
                </div>
              </div>
              <div className="p-4">
                <audio src={audioSrc} controls className="w-full h-9" aria-label="AI-generated narration" />
                {showTranscript && (
                  <details className="mt-3 rounded-lg bg-muted/40 border border-border/40">
                    <summary className="cursor-pointer select-none px-3 py-2 text-xs font-medium text-foreground">Show transcript</summary>
                    <p className="px-3 pb-3 text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]">{aiState.transcript}</p>
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
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"><Music className="w-6 h-6 text-primary/70" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground mb-2">{block.content ? "Audio" : "Sample Audio Track"}</p>
                  <audio src={audioSrc} controls className="w-full h-8" aria-label={block.content ? "Course audio" : "Sample audio track"} />
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
          <div key={item.id} id={`preview-item-${item.id}`} className="space-y-3 scroll-mt-4">
            <CourseBrandingLogo courseId={data.courseId} slot="content" />
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
                    <div key={child.id} id={`preview-item-${child.id}`} className="space-y-4 scroll-mt-4">
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
          <div key={item.id} id={`preview-item-${item.id}`} className="space-y-4 scroll-mt-4">
            <CourseBrandingLogo courseId={data.courseId} slot="content" />
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

  // Outline sidebar content
  const renderOutlineItems = () => {
    if (!data) return null;
    return (
      <div className="space-y-0.5">
        {data.items.map((item) => {
          if (item.type === "section") {
            const isExpanded = outlineExpandedSections.has(item.id);
            return (
              <div key={item.id}>
                <button
                  className="w-full flex items-start justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                  onClick={() => toggleOutlineSection(item.id)}
                  aria-expanded={isExpanded}
                  aria-label={`${item.title || "Untitled section"}, ${isExpanded ? "collapse" : "expand"}`}
                >
                  <span className="pr-2 font-medium break-words [overflow-wrap:anywhere] text-left flex-1 min-w-0">{item.title || "Untitled section"}</span>
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground mt-0.5" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground mt-0.5" aria-hidden="true" />
                  )}
                </button>
                {isExpanded && item.children && item.children.length > 0 && (
                  <div>
                    {item.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => scrollToSection(item.id)}
                        className="w-full flex items-start gap-2 pl-8 pr-4 py-2 text-left text-[13px] text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-colors"
                        aria-label={`Navigate to ${child.title || "Untitled"}`}
                      >
                        {child.type === "page" ? (
                          <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" aria-hidden="true" />
                        ) : (
                          <HelpCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" aria-hidden="true" />
                        )}
                        <span className="break-words [overflow-wrap:anywhere] text-left flex-1 min-w-0">{child.title || "Untitled"}</span>
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
              onClick={() => scrollToSection(item.id)}
              className="w-full flex items-start gap-2 px-4 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-colors"
              aria-label={`Navigate to ${item.title || "Untitled"}`}
            >
              <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span className="break-words [overflow-wrap:anywhere] text-left flex-1 min-w-0">{item.title || "Untitled"}</span>
            </button>
          );
        })}
      </div>
    );
  };

  const scrollContent = (
    <div
      className={cn(
        "bg-background w-full relative flex flex-col h-full min-h-0 overflow-hidden",
        isDeviceFramed && "flex-1",
        !isDeviceFramed && deviceView !== 'desktop' && "border-x border-border shadow-lg mx-auto"
      )}
      style={{ maxWidth: !isDeviceFramed && deviceView !== 'desktop' ? deviceSizes[deviceView as keyof typeof deviceSizes]?.width : undefined }}
    >
      <div className="flex-1 min-h-0 overflow-auto">
        {/* In-preview top bar with hamburger — sticky within the visible scroll region */}
        <div className="sticky top-0 z-30 flex items-center gap-2 px-3 py-2 border-b border-border/60 bg-background">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            aria-label={sidebarOpen ? "Close outline" : "Open outline"}
          >
            {sidebarOpen ? <X className="w-4 h-4 text-foreground" aria-hidden="true" /> : <Menu className="w-4 h-4 text-foreground" aria-hidden="true" />}
          </button>
          <span className={cn(
            "font-medium text-foreground truncate",
            isCompactView ? "text-xs" : "text-sm"
          )}>
            {data.title}
          </span>
        </div>

        {/* Course content */}
        <div className={cn("relative flex", !isCompactView && "flex-row")}>
          {/* Desktop left icon rail — only when sidebar closed */}
          {!isCompactView && !sidebarOpen && (
            <div className="sticky top-[41px] self-start flex flex-col items-center gap-1 py-3 w-12 flex-shrink-0 border-r border-border/30 bg-background z-[5]" style={{ height: 'fit-content' }}>
              {data.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200",
                    activeItemId === item.id
                      ? "bg-primary/10 text-primary ring-1 ring-primary/30 shadow-sm"
                      : item.type === "section"
                        ? "text-primary/50 hover:bg-muted hover:text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  aria-label={`Navigate to ${item.title || "Untitled"}`}
                >
                  {item.type === "section" ? (
                    <BookOpen className={cn("transition-all", activeItemId === item.id ? "w-[18px] h-[18px]" : "w-4 h-4")} aria-hidden="true" />
                  ) : (
                    <FileText className={cn("transition-all", activeItemId === item.id ? "w-[18px] h-[18px]" : "w-4 h-4")} aria-hidden="true" />
                  )}
                </button>
              ))}
              <div className="w-6 h-px bg-border/40 my-1.5" aria-hidden="true" />
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
            </div>
          )}

          <div className="relative flex-1 min-w-0">
            {/* Course header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-primary/8 to-accent/10 flex-shrink-0">
              <div className={cn(
                "relative z-[1]",
                isCompactView ? "px-3 py-5" : "px-8 sm:px-12 py-10"
              )}>
                <div className="max-w-3xl mx-auto">
                  <CourseBrandingLogo courseId={data.courseId} slot="intro" />
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

            {/* All content */}
            <div
              className={cn(
                "flex-1",
                isCompactView ? "px-3 py-4" : "px-8 sm:px-12 py-10"
              )}
              style={contentBgStyle}
            >
              <div className="max-w-3xl mx-auto space-y-6">
                {renderSinglePageContent()}

                {/* Finish button */}
                <div className="flex justify-end pt-4">
                  <Button
                    variant={completed ? "ghost" : "default"}
                    onClick={handleFinish}
                    disabled={completed}
                    className={cn(
                      "gap-2",
                      !completed && "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                    )}
                    aria-label="Finish course"
                  >
                    <Check className="w-4 h-4" aria-hidden="true" focusable="false" />
                    Finish
                  </Button>
                </div>

                {/* Completion banner */}
                {completed && (
                  <div
                    ref={completionRef}
                    className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-10 sm:p-14 mt-4 animate-fade-in"
                  >
                    <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-primary/20 blur-3xl" aria-hidden="true" />
                    <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
                    <Sparkles className="absolute top-4 right-4 w-5 h-5 text-primary/60" aria-hidden="true" focusable="false" />
                    <Sparkles className="absolute bottom-6 left-6 w-4 h-4 text-primary/40" aria-hidden="true" focusable="false" />

                    <div className="relative flex flex-col items-center text-center space-y-6">
                      <svg
                        viewBox="0 0 200 140"
                        className="w-44 sm:w-52 h-auto animate-scale-in"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <defs>
                          <linearGradient id="bookGradSingle" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.55" />
                          </linearGradient>
                        </defs>
                        <ellipse cx="100" cy="124" rx="60" ry="5" fill="hsl(var(--primary))" opacity="0.12" />
                        <path d="M30 90 Q100 70 170 90 L170 110 Q100 92 30 110 Z" fill="url(#bookGradSingle)" />
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar overlay and panel — anchored to the visible preview viewport */}
      {sidebarOpen && (
        <>
          <div
            className="absolute inset-0 z-40 bg-foreground/20"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />

          <div
            className={cn(
              "absolute inset-y-0 left-0 z-50 bg-card border-r border-border flex flex-col shadow-lg",
              isCompactView ? "w-[220px]" : "w-[260px]"
            )}
          >
            <div className="px-4 py-3 border-b border-border/60 flex-shrink-0">
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                Course Outline
              </h3>
            </div>
            <ScrollArea className="flex-1">
              <div className="py-1">
                {renderOutlineItems()}
              </div>
            </ScrollArea>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="h-screen bg-background flex flex-col" style={{ fontFamily: getFontStack(data?.fontId ?? previewState?.fontId ?? "default") }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full" aria-label="Go back">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </Button>
          <span className="text-sm font-medium text-foreground">Course Preview</span>
        </div>
        <DeviceToggle />
      </div>

      <div className="flex-1 min-h-0 flex justify-center overflow-hidden bg-muted/20">
        {renderDeviceFrame(scrollContent)}
      </div>
      <ImageLightbox />
    </div>
  );
};

export default SinglepageCoursePreview;
