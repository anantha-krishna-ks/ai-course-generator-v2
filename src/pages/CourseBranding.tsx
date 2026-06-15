import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Upload, Image as ImageIcon, AlertTriangle, Info, Palette, RotateCcw, Save, LayoutTemplate, Check, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import defaultLogo from "@/assets/logo.png";
import introHero from "@/assets/block-preview-landscape.jpg";
import sectionHero from "@/assets/block-preview-workspace.jpg";
import {
  courseBrandingStore,
  CourseBranding,
  DEFAULT_COURSE_BRANDING,
  LogoPosition,
  hexToRgba,
  readableTextColor,
} from "@/services/courseBrandingStore";
import { mockCourseData } from "@/data/mockCourseData";

const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
const SUPPORTED_LABEL = "PNG, JPG, SVG, WEBP · max 2MB";
const MAX_FILE_SIZE = 2 * 1024 * 1024;

const POSITION_OPTIONS: { value: LogoPosition; label: string; icon: typeof AlignLeft }[] = [
  { value: "top-left", label: "Top Left", icon: AlignLeft },
  { value: "top-center", label: "Top Center", icon: AlignCenter },
  { value: "top-right", label: "Top Right", icon: AlignRight },
];


const POSITION_CLASS: Record<LogoPosition, string> = {
  "top-left": "items-start justify-start",
  "top-center": "items-start justify-center",
  "top-right": "items-start justify-end",
};

const COLOR_PRESETS = ["#3B82F6", "#6366F1", "#8B5CF6", "#EC4899", "#F97316", "#10B981", "#0EA5E9", "#111827"];

interface LogoFieldProps {
  id: string;
  label: string;
  value: string | null;
  onChange: (val: string | null) => void;
  warningTooLarge: boolean;
  setWarningTooLarge: (v: boolean) => void;
}

function LogoField({ id, label, value, onChange, warningTooLarge, setWarningTooLarge }: LogoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = (file?: File | null) => {
    if (!file) return;
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      toast({ title: "Unsupported format", description: SUPPORTED_LABEL, variant: "destructive" });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast({ title: "File too large", description: "Please upload a file under 2MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      onChange(dataUrl);
      // Detect oversized logos that may overlap title on small screens.
      const img = new window.Image();
      img.onload = () => {
        const tooBig = img.width > 480 || img.height > 240;
        setWarningTooLarge(tooBig);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const displayed = value ?? defaultLogo;
  const isDefault = !value;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
        {!isDefault && (
          <button
            type="button"
            onClick={() => { onChange(null); setWarningTooLarge(false); }}
            className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
          >
            Reset to default
          </button>
        )}
      </div>

      <div className="flex items-stretch gap-4">
        <div className="w-32 h-32 shrink-0 rounded-xl border border-border bg-muted/30 flex items-center justify-center overflow-hidden">
          <img src={displayed} alt={`${label} preview`} className="max-w-[80%] max-h-[80%] object-contain" />
        </div>
        <div className="flex-1 flex flex-col justify-between gap-2">
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="w-4 h-4" aria-hidden="true" focusable="false" />
              {isDefault ? "Upload Logo" : "Replace Logo"}
            </Button>
            <input
              ref={inputRef}
              id={id}
              type="file"
              accept={SUPPORTED_FORMATS.join(",")}
              className="sr-only"
              aria-label={`Upload ${label}`}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
              Supported: {SUPPORTED_LABEL}
            </p>
            {isDefault && (
              <p className="text-xs text-muted-foreground">Using default brand logo.</p>
            )}
          </div>
          {warningTooLarge && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300"
            >
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" focusable="false" />
              <span>Logo may overlap title on smaller screens. Consider using a more compact mark.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange, helper }: { label: string; value: string; onChange: (v: string) => void; helper?: string }) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        {helper && <p className="text-xs text-muted-foreground mt-1">{helper}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            aria-label={`${label} color picker`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-12 rounded-md border border-input cursor-pointer bg-transparent"
          />
        </div>
        <Input
          aria-label={`${label} hex value`}
          value={value.toUpperCase()}
          onChange={(e) => {
            const v = e.target.value.trim();
            if (/^#?[0-9A-Fa-f]{0,6}$/.test(v)) {
              onChange(v.startsWith("#") ? v : `#${v}`);
            }
          }}
          className="h-10 w-32 font-mono uppercase"
        />
        <div className="flex flex-wrap gap-1.5">
          {COLOR_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Use color ${c}`}
              onClick={() => onChange(c)}
              className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
                value.toLowerCase() === c.toLowerCase() ? "border-foreground" : "border-border"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const OUTLINE_PREVIEW: { title: string; pages: string[] }[] = [
  { title: "Introduction & Overview", pages: ["Course Welcome", "Learning Objectives"] },
  { title: "Core Concepts", pages: ["Fundamental Principles", "Key Terminology", "Practical Applications"] },
  { title: "Advanced Topics", pages: ["Case Studies", "Best Practices"] },
  { title: "Assessment & Review", pages: ["Summary", "Final Assessment Quiz"] },
];

function IntroductionPreview({
  title,
  logo,
  position,
  primary,
  cta,
}: {
  title: string;
  logo: string | null;
  position: LogoPosition;
  primary: string;
  cta: string;
}) {
  const introTint = hexToRgba(primary, 0.1);
  const ctaText = readableTextColor(cta);
  const displayedLogo = logo ?? defaultLogo;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/40">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Introduction</span>
        <span className="text-[10px] text-muted-foreground">Live</span>
      </div>

      {/* Side-by-side editor preview: left = notebook intro, right = course outline */}
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* LEFT: Notebook-style intro panel mirroring /edit-course */}
        <div className="relative overflow-hidden border-b md:border-b-0 md:border-r border-border" style={{ background: `linear-gradient(135deg, ${hexToRgba(primary, 0.18)} 0%, ${introTint} 60%, ${hexToRgba(primary, 0.16)} 100%)` }}>
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-foreground/[0.06] to-transparent" />
            <div className="absolute right-2 top-0 bottom-0 w-px bg-foreground/[0.08]" />
            <div className="absolute top-0 right-0 w-8 h-8">
              <svg viewBox="0 0 48 48" className="w-full h-full text-foreground/[0.06]" fill="currentColor" aria-hidden="true" focusable="false" role="presentation">
                <path d="M48 0 L48 48 L0 0 Z" />
              </svg>
            </div>
            <svg className="absolute inset-0 w-full h-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" role="presentation">
              <defs>
                <pattern id="branding-ruled-lines" width="100%" height="22" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="21" x2="100%" y2="21" stroke="currentColor" strokeWidth="1" className="text-foreground" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#branding-ruled-lines)" />
            </svg>
            <div className="absolute left-8 top-0 bottom-0 w-px bg-destructive/15" />
            <div className="absolute top-0 right-6 w-4 flex flex-col items-center drop-shadow-md">
              <div className="w-full h-14" style={{ background: `linear-gradient(to bottom, ${hexToRgba(primary, 0.3)}, ${hexToRgba(primary, 0.15)})` }} />
              <svg viewBox="0 0 24 12" className="w-full" preserveAspectRatio="none" aria-hidden="true" focusable="false" role="presentation">
                <path d="M0 0 L12 8 L24 0 L24 0 L0 0 Z" fill={hexToRgba(primary, 0.18)} />
              </svg>
            </div>
          </div>

          {/* Logo at chosen position */}
          <div className={`relative z-10 flex px-4 pt-4 ${POSITION_CLASS[position]}`}>
            <div className="h-8 max-w-[110px] flex items-center rounded-md bg-white/85 backdrop-blur px-2 py-1 shadow-sm">
              <img src={displayedLogo} alt="Logo preview" className="max-h-6 max-w-full object-contain" />
            </div>
          </div>

          <div className="relative z-10 px-4 pt-3 pb-5 pl-10">
            <h3 className="text-base sm:text-lg font-bold text-foreground leading-tight break-words">
              {title}
            </h3>
            <div className="mt-2">
              <span className="inline-block px-1.5 py-0.5 text-[9px] text-muted-foreground bg-background/80 rounded border border-border">
                {title.length}/ 275
              </span>
            </div>
            <div className="mt-2 mb-3">
              <div className="h-1 rounded-full w-full" style={{ backgroundColor: hexToRgba(primary, 0.35) }} />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold" style={{ color: primary }}>Welcome to the Course</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-4">
                This comprehensive course is designed to provide you with in-depth knowledge and practical skills. Through carefully structured modules and engaging content, you'll gain expertise in key concepts and real-world applications.
              </p>
            </div>

            <button
              type="button"
              className="mt-3 inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-medium shadow-sm transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: cta, color: ctaText }}
            >
              Start Course
            </button>
          </div>
        </div>

        {/* RIGHT: Course Outline mock mirroring /edit-course right panel */}
        <div className="bg-background p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Course Outline</h4>
            <span
              className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium"
              style={{ borderColor: hexToRgba(primary, 0.4), color: primary, backgroundColor: hexToRgba(primary, 0.08) }}
            >
              + Add item
            </span>
          </div>

          <div className="space-y-2">
            {OUTLINE_PREVIEW.map((sec, sIdx) => (
              <div key={sec.title} className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="flex items-center gap-2 px-2.5 py-2 bg-muted/40 border-b border-border">
                  <span
                    className="flex items-center justify-center w-5 h-5 rounded text-[10px] font-semibold"
                    style={{ backgroundColor: hexToRgba(primary, 0.15), color: primary }}
                  >
                    {sIdx + 1}
                  </span>
                  <span className="text-[11px] font-semibold text-foreground truncate">{sec.title}</span>
                </div>
                <ul className="divide-y divide-border">
                  {sec.pages.map((p, pIdx) => (
                    <li key={p} className="flex items-center gap-2 px-3 py-1.5">
                      <span className="text-[10px] text-muted-foreground w-6">{sIdx + 1}.{pIdx + 1}</span>
                      <span className="text-[11px] text-foreground truncate flex-1">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function SectionPagePreview({
  courseTitle,
  logo,
  position,
  primary,
  cta,
}: {
  courseTitle: string;
  logo: string | null;
  position: LogoPosition;
  primary: string;
  cta: string;
}) {
  const primaryText = readableTextColor(primary);
  const ctaText = readableTextColor(cta);
  const displayedLogo = logo ?? defaultLogo;
  const progress = 22;
  // Active page: section 1, page 1
  const activeSec = 0;
  const activePage = 0;

  // Flatten page numbering for "Page X of Y"
  const totalPages = OUTLINE_PREVIEW.reduce((acc, s) => acc + s.pages.length, 0);
  const currentPageNum =
    OUTLINE_PREVIEW.slice(0, activeSec).reduce((acc, s) => acc + s.pages.length, 0) + activePage + 1;
  const currentPageTitle = OUTLINE_PREVIEW[activeSec].pages[activePage];

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/40">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Section / Page</span>
        <span className="text-[10px] text-muted-foreground">Live</span>
      </div>

      <div className="grid grid-cols-[minmax(0,185px)_minmax(0,1fr)] bg-background min-h-[380px]">
        {/* LEFT: Sidebar navigation */}
        <div className="flex flex-col border-r border-border">
          {/* Course title card (primary colored) */}
          <div className="p-3 space-y-2" style={{ backgroundColor: primary, color: primaryText }}>
            <h3 className="text-[11px] font-bold leading-tight line-clamp-2">{courseTitle}</h3>
            <div className="space-y-1">
              <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: hexToRgba(primaryText === "#FFFFFF" ? "#FFFFFF" : "#000000", 0.2) }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: primaryText }} />
              </div>
              <span className="text-[8px] uppercase tracking-wider font-semibold opacity-80">{progress}% Complete</span>
            </div>
          </div>


          {/* Outline list */}
          <div className="flex-1 overflow-hidden py-1.5">
            {OUTLINE_PREVIEW.map((sec, sIdx) => (
              <div key={sec.title} className="mb-1">
                <div className="flex items-center gap-1.5 px-2 py-1">
                  <span
                    className="flex items-center justify-center w-3.5 h-3.5 rounded text-[8px] font-bold"
                    style={{ backgroundColor: hexToRgba(primary, 0.15), color: primary }}
                  >
                    {sIdx + 1}
                  </span>
                  <span className="text-[9px] font-semibold text-foreground truncate flex-1">{sec.title}</span>
                </div>
                <ul>
                  {sec.pages.map((p, pIdx) => {
                    const isActive = sIdx === activeSec && pIdx === activePage;
                    return (
                      <li
                        key={p}
                        className="flex items-center gap-1.5 pl-6 pr-2 py-1 text-[9px] leading-tight transition-colors"
                        style={
                          isActive
                            ? { backgroundColor: hexToRgba(primary, 0.12), color: primary, fontWeight: 600, borderLeft: `2px solid ${primary}` }
                            : { color: "hsl(var(--muted-foreground))" }
                        }
                      >
                        <span className="truncate flex-1">{p}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Content area */}
        <div className="flex flex-col p-4">
          <div className={`flex mb-2 ${POSITION_CLASS[position]}`}>
            <div className="h-7 max-w-[110px] flex items-center rounded-md border border-border bg-white px-2 py-1 shadow-sm">
              <img src={displayedLogo} alt="Logo preview" className="max-h-5 max-w-full object-contain" />
            </div>
          </div>
          <div className="space-y-1.5">
            <span className="text-[9px] text-muted-foreground italic">
              Page {currentPageNum} of {totalPages}
            </span>

            <h3 className="text-sm font-bold text-foreground leading-tight">{currentPageTitle}</h3>
            <div className="w-10 h-[2px] rounded-full" style={{ backgroundColor: primary }} />
          </div>

          <p className="mt-3 text-[10px] text-muted-foreground leading-relaxed line-clamp-4">
            Welcome to this course! In this module, you will learn the foundational concepts that will guide your understanding throughout the program.
          </p>

          {/* Mock content blocks */}
          <div className="mt-3 space-y-2 flex-1">
            <div className="aspect-video rounded-md overflow-hidden border border-border bg-muted/40 flex items-center justify-center">
              <img src={sectionHero} alt="" aria-hidden="true" className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-1.5">
              <span className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: hexToRgba(primary, 0.25) }} />
              <span className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: hexToRgba(primary, 0.15) }} />
              <span className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: hexToRgba(primary, 0.1) }} />
            </div>
          </div>

          {/* Prev / Next */}
          <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between">
            <button
              type="button"
              className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-3 h-3" aria-hidden="true" focusable="false" />
              Previous
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full px-3 py-1 text-[10px] font-medium shadow-sm"
              style={{ backgroundColor: cta, color: ctaText }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}



function PreviewCard({
  title,
  logo,
  position,
  primary,
  cta,
  badge,
  heroImage,
  ctaLabel,
  subtitle,
}: {
  title: string;
  logo: string | null;
  position: LogoPosition;
  primary: string;
  cta: string;
  badge: string;
  heroImage: string;
  ctaLabel: string;
  subtitle: string;
}) {
  const introTint = hexToRgba(primary, 0.1);
  const ctaText = readableTextColor(cta);
  const displayedLogo = logo ?? defaultLogo;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/40">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{badge}</span>
      </div>
      <div className="relative aspect-[4/3] flex flex-col">
        {/* Hero image */}
        <div className="relative h-1/2 w-full overflow-hidden">
          <img src={heroImage} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(180deg, ${hexToRgba(primary, 0.15)} 0%, ${hexToRgba(primary, 0.55)} 100%)` }}
            aria-hidden="true"
          />
          <div className={`relative z-10 flex p-3 h-full ${POSITION_CLASS[position]}`}>
            <div className="h-9 max-w-[120px] flex items-center rounded-md bg-white/85 backdrop-blur px-2 py-1 shadow-sm">
              <img src={displayedLogo} alt="Logo preview" className="max-h-7 max-w-full object-contain" />
            </div>
          </div>
        </div>

        {/* Content area */}
        <div
          className="flex-1 flex flex-col items-center justify-center text-center px-5 py-4"
          style={{ background: introTint }}
        >
          <h3 className="text-base font-semibold leading-tight" style={{ color: primary }}>{title}</h3>
          <p className="text-[11px] text-muted-foreground mt-1.5 max-w-xs line-clamp-2">{subtitle}</p>
          <button
            type="button"
            className="mt-3 inline-flex items-center justify-center rounded-full px-4 py-1.5 text-xs font-medium shadow-sm transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: cta, color: ctaText }}
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </Card>
  );
}

export default function CourseBrandingPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const courseTitle = useMemo(() => {
    if (!courseId) return "Course";
    return mockCourseData[courseId]?.title ?? "Course";
  }, [courseId]);

  const [branding, setBranding] = useState<CourseBranding>(DEFAULT_COURSE_BRANDING);
  const [introWarn, setIntroWarn] = useState(false);
  const [contentWarn, setContentWarn] = useState(false);
  const [activeSection, setActiveSection] = useState<"intro" | "content" | "color">("intro");

  const introRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (courseId) setBranding(courseBrandingStore.get(courseId));
  }, [courseId]);

  useEffect(() => {
    const sections: Array<["intro" | "content" | "color", React.RefObject<HTMLDivElement>]> = [
      ["intro", introRef],
      ["content", contentRef],
      ["color", colorRef],
    ];

    const computeActive = () => {
      const offset = 160; // header + breathing room
      let current: "intro" | "content" | "color" = "intro";
      for (const [key, ref] of sections) {
        const el = ref.current;
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top - offset <= 0) current = key;
      }
      // If bottom of page reached, force last
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = sections[sections.length - 1][0];
      }
      setActiveSection(current);
    };

    computeActive();
    window.addEventListener("scroll", computeActive, { passive: true });
    window.addEventListener("resize", computeActive);
    return () => {
      window.removeEventListener("scroll", computeActive);
      window.removeEventListener("resize", computeActive);
    };
  }, []);


  const scrollToSection = (key: "intro" | "content" | "color") => {
    const map = { intro: introRef, content: contentRef, color: colorRef };
    map[key].current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const update = <K extends keyof CourseBranding>(key: K, value: CourseBranding[K]) =>
    setBranding((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    if (!courseId) return;
    courseBrandingStore.set(courseId, branding);
    toast({ title: "Branding saved", description: "Your course branding has been updated." });
    navigate(`/edit-course/${courseId}`);
  };

  const handleReset = () => {
    setBranding(DEFAULT_COURSE_BRANDING);
    setIntroWarn(false);
    setContentWarn(false);
  };

  const timelineItems = [
    { key: "intro" as const, label: "Intro Branding", icon: LayoutTemplate, done: !!branding.introLogo },
    { key: "content" as const, label: "Content Image", icon: ImageIcon, done: !!branding.contentLogo },
    {
      key: "color" as const,
      label: "Color Theme",
      icon: Palette,
      done:
        branding.primaryColor !== DEFAULT_COURSE_BRANDING.primaryColor ||
        branding.ctaColor !== DEFAULT_COURSE_BRANDING.ctaColor,
    },
  ];




  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-b from-muted/30 via-background to-background">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="w-full px-6 lg:px-10 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Back to course editor"
                    onClick={() => navigate(`/edit-course/${courseId}`)}
                  >
                    <ArrowLeft className="w-5 h-5" aria-hidden="true" focusable="false" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Back to editor</TooltipContent>
              </Tooltip>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold truncate flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" aria-hidden="true" focusable="false" />
                  Course Branding
                </h1>
                <p className="text-xs text-muted-foreground truncate">{courseTitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleReset} className="gap-2">
                <RotateCcw className="w-4 h-4" aria-hidden="true" focusable="false" />
                Reset
              </Button>
              <Button size="sm" onClick={handleSave} className="gap-2">
                <Save className="w-4 h-4" aria-hidden="true" focusable="false" />
                Save & Close
              </Button>
            </div>
          </div>
        </header>

        <main className="w-full px-6 lg:px-10 py-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.25fr)] items-start">
            {/* Editor column */}
              <nav aria-label="Section navigation" className="relative space-y-5 lg:pl-10">
                {/* Connecting rail behind markers (desktop only) */}
                <span
                  aria-hidden="true"
                  className="hidden lg:block pointer-events-none absolute left-[14px] top-9 bottom-9 w-px rounded-full bg-gradient-to-b from-transparent via-border to-transparent"
                />
                <span
                  aria-hidden="true"
                  className="hidden lg:block pointer-events-none absolute left-[14px] top-9 w-px rounded-full bg-gradient-to-b from-primary via-primary/60 to-transparent transition-all duration-500"
                  style={{
                    height:
                      activeSection === "intro"
                        ? "20%"
                        : activeSection === "content"
                        ? "60%"
                        : "calc(100% - 72px)",
                    boxShadow: "0 0 12px hsl(var(--primary) / 0.45)",
                  }}
                />




              {timelineItems.map((item, idx) => {
                const Icon = item.icon;
                const isActive = activeSection === item.key;
                const isDone = item.done;
                const cardRef = item.key === "intro" ? introRef : item.key === "content" ? contentRef : colorRef;

                return (
                  <div key={item.key} className="relative">
                    {/* Inline section marker (left of card) */}
                    <Tooltip delayDuration={150}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => scrollToSection(item.key)}
                          aria-label={`Go to ${item.label}`}
                          aria-current={isActive ? "step" : undefined}
                          className="hidden lg:flex absolute -left-10 top-6 z-10 items-center justify-center w-7 h-7 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                          <span
                            className={`flex items-center justify-center rounded-full transition-all duration-300 ${
                              isActive
                                ? "w-7 h-7 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-[0_0_14px_hsl(var(--primary)/0.55)] ring-4 ring-primary/15"
                                : isDone
                                ? "w-3 h-3 bg-primary/70 hover:scale-125"
                                : "w-2.5 h-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/60 hover:scale-125"
                            }`}
                          >
                            {isActive && (
                              <span className="text-[10px] font-mono font-semibold">{idx + 1}</span>
                            )}
                            {isDone && !isActive && (
                              <Check className="w-2.5 h-2.5 text-primary-foreground" aria-hidden="true" focusable="false" />
                            )}
                          </span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="text-xs">
                        <span className="font-mono text-muted-foreground mr-1.5">0{idx + 1}</span>
                        {item.label}
                      </TooltipContent>
                    </Tooltip>

                    <Card
                      ref={cardRef as any}
                      data-section={item.key}
                      className={`relative overflow-hidden scroll-mt-32 transition-all duration-500 ${
                        isActive
                          ? "border-primary/40 shadow-xl shadow-primary/10 -translate-y-px"
                          : "hover:border-primary/20"
                      }`}
                    >

                    {/* Left accent strip */}
                    <span
                      className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-500 ${
                        isActive
                          ? "bg-gradient-to-b from-primary via-primary to-primary/40"
                          : isDone
                          ? "bg-primary/30"
                          : "bg-transparent"
                      }`}
                      aria-hidden="true"
                    />

                    <div
                      className={`flex items-center gap-4 px-5 py-4 border-b transition-colors ${
                        isActive ? "bg-primary/5" : "bg-muted/20"
                      }`}
                    >
                      {/* Editorial chapter number */}
                      <span
                        className={`font-serif italic text-3xl leading-none tracking-tight transition-colors ${
                          isActive ? "text-primary" : "text-muted-foreground/40"
                        }`}
                        aria-hidden="true"
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </span>

                      <span
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                          isActive
                            ? "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md shadow-primary/30"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        <Icon className="w-4 h-4" aria-hidden="true" focusable="false" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <h2 className="text-sm font-semibold leading-tight">{item.label}</h2>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.key === "intro"
                            ? "Logo & position on the course introduction page."
                            : item.key === "content"
                            ? "Displayed on all sections & lesson pages."
                            : "Brand primary & call-to-action button color."}
                        </p>
                      </div>
                      {isDone && (
                        <span
                          className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center ring-1 ring-primary/20"
                          aria-label="Configured"
                        >
                          <Check className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                        </span>
                      )}
                    </div>


                      <div className="p-5 space-y-4">
                        {item.key === "intro" && (
                          <>
                            <LogoField
                              id="intro-logo"
                              label="Introduction Image"
                              value={branding.introLogo}
                              onChange={(v) => update("introLogo", v)}
                              warningTooLarge={introWarn}
                              setWarningTooLarge={setIntroWarn}
                            />
                            <div className="flex flex-wrap items-center gap-3">
                              <Label className="text-xs font-medium text-muted-foreground">Position</Label>
                              <RadioGroup
                                value={branding.introPosition}
                                onValueChange={(v) => update("introPosition", v as LogoPosition)}
                                className="flex flex-wrap gap-2"
                              >
                                {POSITION_OPTIONS.map((opt) => {
                                  const PosIcon = opt.icon;
                                  return (
                                    <label
                                      key={opt.value}
                                      className="flex items-center gap-1.5 cursor-pointer text-xs rounded-full border border-border px-3 py-1.5 hover:bg-muted/50 transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:text-primary has-[[data-state=checked]]:bg-primary/5"
                                    >
                                      <RadioGroupItem value={opt.value} aria-label={opt.label} className="h-3.5 w-3.5" />
                                      <PosIcon className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                                      {opt.label}
                                    </label>
                                  );
                                })}

                              </RadioGroup>
                            </div>
                          </>
                        )}

                        {item.key === "content" && (
                          <>
                            <LogoField
                              id="content-logo"
                              label="Content Logo"
                              value={branding.contentLogo}
                              onChange={(v) => update("contentLogo", v)}
                              warningTooLarge={contentWarn}
                              setWarningTooLarge={setContentWarn}
                            />
                            <div className="flex flex-wrap items-center gap-3">
                              <Label className="text-xs font-medium text-muted-foreground">Position</Label>
                              <RadioGroup
                                value={branding.contentPosition}
                                onValueChange={(v) => update("contentPosition", v as LogoPosition)}
                                className="flex flex-wrap gap-2"
                              >
                                {POSITION_OPTIONS.map((opt) => {
                                  const PosIcon = opt.icon;
                                  return (
                                    <label
                                      key={opt.value}
                                      className="flex items-center gap-1.5 cursor-pointer text-xs rounded-full border border-border px-3 py-1.5 hover:bg-muted/50 transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:text-primary has-[[data-state=checked]]:bg-primary/5"
                                    >
                                      <RadioGroupItem value={opt.value} aria-label={opt.label} className="h-3.5 w-3.5" />
                                      <PosIcon className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                                      {opt.label}
                                    </label>
                                  );
                                })}

                              </RadioGroup>
                            </div>
                          </>
                        )}

                        {item.key === "color" && (
                          <>
                            <ColorField
                              label="Brand Color (Primary)"
                              value={branding.primaryColor}
                              onChange={(v) => update("primaryColor", v)}
                              helper="Headers & highlights. Intro background uses 10% of this color."
                            />
                            <ColorField
                              label="Call-to-Action Button Color"
                              value={branding.ctaColor}
                              onChange={(v) => update("ctaColor", v)}
                              helper="Start, Next, Submit buttons. Text color auto-adjusts for contrast."
                            />
                          </>
                        )}
                      </div>
                    </Card>
                  </div>
                );


              })}
            </nav>



            {/* Preview column */}
            <div className="space-y-3 xl:sticky xl:top-24 xl:self-start">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Live Preview</h2>
                  <p className="text-xs text-muted-foreground mt-1">All changes reflect instantly.</p>
                </div>
              </div>
              <Tabs defaultValue="introduction" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="introduction">Introduction</TabsTrigger>
                  <TabsTrigger value="section">Section / Page</TabsTrigger>
                </TabsList>
                <TabsContent value="introduction" className="mt-3">
                  <IntroductionPreview
                    title={courseTitle}
                    logo={branding.introLogo}
                    position={branding.introPosition}
                    primary={branding.primaryColor}
                    cta={branding.ctaColor}
                  />
                </TabsContent>
                <TabsContent value="section" className="mt-3">
                  <SectionPagePreview
                    courseTitle={courseTitle}
                    logo={branding.contentLogo}
                    position={branding.contentPosition}
                    primary={branding.primaryColor}
                    cta={branding.ctaColor}
                  />
                </TabsContent>

              </Tabs>
            </div>
          </div>
        </main>

      </div>
    </TooltipProvider>
  );
}
