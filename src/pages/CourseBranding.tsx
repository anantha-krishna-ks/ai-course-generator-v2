import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, Image as ImageIcon, AlertTriangle, Info, Palette, RotateCcw, Save, Sparkles, LayoutTemplate, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

const POSITION_OPTIONS: { value: LogoPosition; label: string }[] = [
  { value: "top-left", label: "Top Left" },
  { value: "top-center", label: "Top Center" },
  { value: "top-right", label: "Top Right" },
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

  useEffect(() => {
    if (courseId) setBranding(courseBrandingStore.get(courseId));
  }, [courseId]);

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

  const sectionMeta = [
    {
      key: "intro" as const,
      title: "Intro Branding",
      description: "Logo & position for the course introduction page.",
      icon: LayoutTemplate,
      done: !!branding.introLogo,
    },
    {
      key: "content" as const,
      title: "Content Image",
      description: "Logo shown on every section & lesson page.",
      icon: ImageIcon,
      done: !!branding.contentLogo,
    },
    {
      key: "color" as const,
      title: "Color Theme",
      description: "Primary brand color & call-to-action button color.",
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

        <main className="w-full px-6 lg:px-10 py-8 space-y-8">
          {/* Section selector */}
          <section aria-label="Branding sections">
            <div className="mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                Customize in 3 steps
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Pick a section below — your changes preview live on the right.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {sectionMeta.map((s, idx) => {
                const Icon = s.icon;
                const active = activeSection === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setActiveSection(s.key)}
                    aria-pressed={active}
                    aria-label={`${s.title}: ${s.description}`}
                    className={`group relative text-left rounded-2xl border p-5 transition-all overflow-hidden ${
                      active
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 ring-2 ring-primary/40"
                        : "border-border bg-card hover:border-primary/40 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          active
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground group-hover:bg-primary/10"
                        }`}
                      >
                        <Icon className="w-5 h-5" aria-hidden="true" focusable="false" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                            active
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          0{idx + 1}
                        </span>
                        {s.done && (
                          <span
                            className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center"
                            aria-label="Configured"
                          >
                            <Check className="w-3 h-3" aria-hidden="true" focusable="false" />
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{s.description}</p>
                    {active && (
                      <div
                        className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary via-primary/70 to-primary"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Editor + Preview */}
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            <Card className="p-6 lg:p-8 space-y-6">
              {activeSection === "intro" && (
                <>
                  <header>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <LayoutTemplate className="w-5 h-5 text-primary" aria-hidden="true" focusable="false" />
                      Intro Branding
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configure the logo and its position on the course introduction page.
                    </p>
                  </header>
                  <LogoField
                    id="intro-logo"
                    label="Introduction Image"
                    value={branding.introLogo}
                    onChange={(v) => update("introLogo", v)}
                    warningTooLarge={introWarn}
                    setWarningTooLarge={setIntroWarn}
                  />
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Position</Label>
                    <RadioGroup
                      value={branding.introPosition}
                      onValueChange={(v) => update("introPosition", v as LogoPosition)}
                      className="flex flex-wrap gap-3"
                    >
                      {POSITION_OPTIONS.map((opt) => (
                        <label
                          key={opt.value}
                          className="flex items-center gap-2 cursor-pointer text-sm rounded-md border border-border px-3 py-2 hover:bg-muted/50 transition-colors"
                        >
                          <RadioGroupItem value={opt.value} aria-label={opt.label} />
                          {opt.label}
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                </>
              )}

              {activeSection === "content" && (
                <>
                  <header>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-primary" aria-hidden="true" focusable="false" />
                      Content Image
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      The logo will be displayed on all Sections and Pages of the course.
                    </p>
                  </header>
                  <LogoField
                    id="content-logo"
                    label="Content Logo"
                    value={branding.contentLogo}
                    onChange={(v) => update("contentLogo", v)}
                    warningTooLarge={contentWarn}
                    setWarningTooLarge={setContentWarn}
                  />
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Position</Label>
                    <RadioGroup
                      value={branding.contentPosition}
                      onValueChange={(v) => update("contentPosition", v as LogoPosition)}
                      className="flex flex-wrap gap-3"
                    >
                      {POSITION_OPTIONS.map((opt) => (
                        <label
                          key={opt.value}
                          className="flex items-center gap-2 cursor-pointer text-sm rounded-md border border-border px-3 py-2 hover:bg-muted/50 transition-colors"
                        >
                          <RadioGroupItem value={opt.value} aria-label={opt.label} />
                          {opt.label}
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                  <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" focusable="false" />
                    <span>
                      Transparent logos blend with any background; non-transparent logos render on their own tile to avoid color clashes.
                    </span>
                  </div>
                </>
              )}

              {activeSection === "color" && (
                <>
                  <header>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Palette className="w-5 h-5 text-primary" aria-hidden="true" focusable="false" />
                      Color Theme
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Drives the overall branding feel — headers, highlights, and key actions.
                    </p>
                  </header>
                  <ColorField
                    label="Brand Color (Primary)"
                    value={branding.primaryColor}
                    onChange={(v) => update("primaryColor", v)}
                    helper="Used for headers and highlights. The Introduction background uses 10% of this color."
                  />
                  <ColorField
                    label="Call-to-Action Button Color"
                    value={branding.ctaColor}
                    onChange={(v) => update("ctaColor", v)}
                    helper="Used for Start, Next, and Submit buttons. Text color auto-adjusts for contrast."
                  />
                </>
              )}
            </Card>

            {/* Preview column */}
            <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Live Preview
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  See exactly how learners will experience your course.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <PreviewCard
                  badge="Introduction"
                  title={courseTitle}
                  logo={branding.introLogo}
                  position={branding.introPosition}
                  primary={branding.primaryColor}
                  cta={branding.ctaColor}
                  heroImage={introHero}
                  ctaLabel="Start Course"
                  subtitle="Welcome — your branded course introduction."
                />
                <PreviewCard
                  badge="Section / Page"
                  title="Lesson Title"
                  logo={branding.contentLogo}
                  position={branding.contentPosition}
                  primary={branding.primaryColor}
                  cta={branding.ctaColor}
                  heroImage={sectionHero}
                  ctaLabel="Next"
                  subtitle="Section header on every content page."
                />
              </div>
            </div>
          </section>
        </main>
      </div>
    </TooltipProvider>
  );
}
