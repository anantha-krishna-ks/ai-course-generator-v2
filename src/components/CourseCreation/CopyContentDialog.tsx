import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import * as PopoverPrimitive from "@radix-ui/react-popover";
const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
      className,
    )}
    {...props}
  />
));
PopoverContent.displayName = "InlinePopoverContent";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  ChevronsUpDown,
  CopyPlus,
  Eye,
  FileText,
  Folder,
  Search,
  Users,
  User,
  X,
} from "lucide-react";

interface CourseOption {
  id: string;
  title: string;
  meta: string;
  thumbnail: string;
}

interface MockPage {
  id: string;
  title: string;
  excerpt: string;
}
interface MockSection {
  id: string;
  title: string;
  pages: MockPage[];
}

const MY_COURSES: CourseOption[] = [
  { id: "c1", title: "Carbon Accounting-ACCA", meta: "12 pages · 4 sections", thumbnail: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=400&h=300&fit=crop" },
  { id: "c2", title: "Budgeting in Management", meta: "8 pages · 3 sections", thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop" },
  { id: "c3", title: "carbon accounting-0810-01", meta: "15 pages · 5 sections", thumbnail: "https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=400&h=300&fit=crop" },
  { id: "c4", title: "Financial Analysis Fundamentals", meta: "20 pages · 6 sections", thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop" },
  { id: "c5", title: "Advanced Cost Management", meta: "6 pages · 2 sections", thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop" },
  { id: "c6", title: "Taxation and Compliance 2024", meta: "14 pages · 4 sections", thumbnail: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop" },
  { id: "c7", title: "Strategic Financial Planning", meta: "18 pages · 5 sections", thumbnail: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=300&fit=crop" },
];

const SHARED_COURSES: CourseOption[] = [
  { id: "s1", title: "Auditing Standards & Practices", meta: "10 pages · 3 sections", thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop" },
  { id: "s2", title: "Corporate Finance Essentials", meta: "18 pages · 5 sections", thumbnail: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop" },
  { id: "s3", title: "Management Accounting Pro", meta: "22 pages · 7 sections", thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop" },
  { id: "s4", title: "International Financial Reporting", meta: "16 pages · 4 sections", thumbnail: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=300&fit=crop" },
  { id: "s5", title: "Risk Assessment & Control", meta: "9 pages · 3 sections", thumbnail: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop" },
];

/** Deterministic mock course outline derived from a course id so each course
 * has stable sections / pages / sample content for the live preview. */
function buildMockCourse(courseId: string): { sections: MockSection[]; rootPages: MockPage[] } {
  const seed = courseId.charCodeAt(courseId.length - 1) || 3;
  const sectionTitles = [
    "Getting started",
    "Core fundamentals",
    "Practical application",
    "Advanced topics",
    "Case studies",
  ];
  const pageTitles = [
    ["Welcome & overview", "How this course works", "What you'll learn"],
    ["Key concepts", "Frameworks & models", "Worked example", "Common pitfalls"],
    ["Hands-on walkthrough", "Try it yourself", "Solution review"],
    ["Industry deep-dive", "Regulatory landscape", "Tooling & automation"],
    ["Mini case: Acme Co.", "Mini case: Globex"],
  ];
  const excerpts = [
    "This page introduces the topic with a clear, learner-friendly framing and outlines what comes next.",
    "We break the concept down into digestible building blocks, with diagrams and short examples throughout.",
    "Apply what you learned in a guided exercise, then compare your answer against the model solution.",
    "A focused look at how this plays out in the real world, with current data and credible references.",
  ];
  const sectionCount = 3 + (seed % 2); // 3 or 4
  const sections: MockSection[] = Array.from({ length: sectionCount }, (_, i) => {
    const titles = pageTitles[i % pageTitles.length];
    return {
      id: `${courseId}-s${i + 1}`,
      title: sectionTitles[i % sectionTitles.length],
      pages: titles.map((t, j) => ({
        id: `${courseId}-s${i + 1}-p${j + 1}`,
        title: t,
        excerpt: excerpts[(i + j) % excerpts.length],
      })),
    };
  });
  const rootPages: MockPage[] = [
    { id: `${courseId}-rp1`, title: "Course primer", excerpt: excerpts[0] },
    { id: `${courseId}-rp2`, title: "Quick reference sheet", excerpt: excerpts[1] },
    { id: `${courseId}-rp3`, title: "Final recap", excerpt: excerpts[2] },
    { id: `${courseId}-rp4`, title: "Resources & links", excerpt: excerpts[3] },
  ];
  return { sections, rootPages };
}

type SourceType = "my" | "shared";
type Step = "config" | "review";

interface CopyContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect?: (payload: {
    course: CourseOption;
    mode: "sections" | "pages";
    sourceType: SourceType;
    selectedSectionId?: string;
    selectedPageIds: string[];
  }) => void;
}

export function CopyContentDialog({ open, onOpenChange, onSelect }: CopyContentDialogProps) {
  const { toast } = useToast();
  const [sourceType, setSourceType] = useState<SourceType>("my");
  const [course, setCourse] = useState<CourseOption | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mode, setMode] = useState<"sections" | "pages" | null>(null);
  const [step, setStep] = useState<Step>("config");

  // Selection state for the review step
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
  const [previewPageId, setPreviewPageId] = useState<string | null>(null);

  const courses = useMemo(
    () => (sourceType === "my" ? MY_COURSES : SHARED_COURSES),
    [sourceType]
  );

  const mockCourse = useMemo(
    () => (course ? buildMockCourse(course.id) : null),
    [course]
  );

  const resetAll = () => {
    setSourceType("my");
    setCourse(null);
    setPickerOpen(false);
    setMode(null);
    setStep("config");
    setSelectedSectionId(null);
    setSelectedPageIds([]);
    setPreviewPageId(null);
  };

  const handleTypeChange = (t: SourceType) => {
    setSourceType(t);
    setCourse(null);
    setMode(null);
  };

  const handleContinue = () => {
    if (!course || !mode || !mockCourse) return;
    if (mode === "sections") {
      const first = mockCourse.sections[0];
      setSelectedSectionId(first.id);
      setSelectedPageIds(first.pages.map((p) => p.id));
      setPreviewPageId(first.pages[0]?.id ?? null);
    } else {
      const initial = mockCourse.rootPages.slice(0, 2).map((p) => p.id);
      setSelectedPageIds(initial);
      setPreviewPageId(initial[0] ?? null);
    }
    setStep("review");
  };

  const handleSectionChange = (sectionId: string) => {
    if (!mockCourse) return;
    setSelectedSectionId(sectionId);
    const section = mockCourse.sections.find((s) => s.id === sectionId);
    const ids = section?.pages.map((p) => p.id) ?? [];
    setSelectedPageIds(ids);
    setPreviewPageId(ids[0] ?? null);
  };

  const togglePage = (pageId: string) => {
    setSelectedPageIds((prev) => {
      const next = prev.includes(pageId)
        ? prev.filter((id) => id !== pageId)
        : [...prev, pageId];
      if (!next.includes(previewPageId ?? "")) {
        setPreviewPageId(next[0] ?? null);
      }
      return next;
    });
  };

  const handleCopy = () => {
    if (!course || !mode) return;
    onSelect?.({
      course,
      mode,
      sourceType,
      selectedSectionId: selectedSectionId ?? undefined,
      selectedPageIds,
    });
    toast({
      title: "Content queued to copy",
      description:
        mode === "sections"
          ? `${selectedPageIds.length} page(s) from selected section will be copied.`
          : `${selectedPageIds.length} page(s) will be copied.`,
    });
    onOpenChange(false);
  };

  // Resolve preview data
  const activeSection = mockCourse?.sections.find((s) => s.id === selectedSectionId) ?? null;
  const pagePool: MockPage[] =
    mode === "sections"
      ? activeSection?.pages ?? []
      : mockCourse?.rootPages ?? [];
  const selectedPages = pagePool.filter((p) => selectedPageIds.includes(p.id));
  const previewPage =
    selectedPages.find((p) => p.id === previewPageId) ?? selectedPages[0] ?? null;



  const isReview = step === "review";

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) resetAll();
      }}
    >
      <DialogContent
        className={cn(
          "p-0 gap-0 h-auto max-h-[92dvh] sm:rounded-2xl rounded-2xl border border-border flex flex-col bg-background overflow-hidden shadow-2xl [&>button]:hidden transition-[max-width] duration-300",
          isReview ? "w-[97vw] max-w-[1280px]" : "w-[95vw] max-w-4xl"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0 shadow-[0_1px_2px_0_hsl(var(--foreground)/0.03),0_2px_6px_-1px_hsl(var(--foreground)/0.04)] z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            {isReview && (
              <button
                onClick={() => setStep("config")}
                aria-label="Back to selection"
                className="p-1.5 -ml-1 rounded-md hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-muted-foreground" aria-hidden="true" focusable="false" />
              </button>
            )}
            <CopyPlus className="w-4 h-4 text-muted-foreground" aria-hidden="true" focusable="false" />
            <DialogTitle className="text-sm font-medium text-foreground truncate">
              {isReview
                ? `Copy from "${course?.title ?? ""}"`
                : "Copy Content"}
            </DialogTitle>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="p-2.5 rounded-md hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" aria-hidden="true" focusable="false" />
          </button>
        </div>
        <DialogDescription className="sr-only">
          {isReview
            ? "Review selected content and live preview before copying."
            : "Pull a section or pages from another course into your outline."}
        </DialogDescription>

        {!isReview && (
          <div className="flex-1 overflow-y-auto pretty-scrollbar">
            <div className="mx-auto w-full max-w-4xl px-6 sm:px-10 py-8 space-y-8">
              {/* Step 1: Type of course */}
              <section className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Type of course <span className="text-destructive">*</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Choose where to pull content from.
                  </p>
                </div>
                <div
                  role="radiogroup"
                  aria-label="Type of course"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  {[
                    { id: "my" as const, label: "My Courses", desc: "Courses you own", Icon: User },
                    { id: "shared" as const, label: "Shared Courses", desc: "Shared with you", Icon: Users },
                  ].map(({ id, label, desc, Icon }) => {
                    const active = sourceType === id;
                    return (
                      <button
                        key={id}
                        role="radio"
                        aria-checked={active}
                        onClick={() => handleTypeChange(id)}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border p-4 text-left transition-all",
                          active
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border bg-card hover:border-foreground/30"
                        )}
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                            active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          )}
                        >
                          <Icon className="w-5 h-5" aria-hidden="true" focusable="false" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-foreground">{label}</div>
                          <div className="text-xs text-muted-foreground">{desc}</div>
                        </div>
                        {active && <Check className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Step 2: Course picker */}
              <section className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Select course <span className="text-destructive">*</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Search and pick the source course.
                  </p>
                </div>
                <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={pickerOpen}
                      aria-label="Select course"
                      className={cn(
                        "w-full justify-between rounded-full h-12 px-3 text-left font-normal transition-all",
                        "border-2 border-border bg-card shadow-sm",
                        "hover:border-primary/50 hover:shadow-md hover:bg-card",
                        pickerOpen && "border-primary ring-4 ring-primary/15 shadow-md",
                        course && !pickerOpen && "border-primary/40"
                      )}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        {course ? (
                          <img
                            src={course.thumbnail}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <Search className="w-4 h-4 text-muted-foreground shrink-0 ml-1" aria-hidden="true" focusable="false" />
                        )}
                        <span className={cn("truncate", !course && "text-muted-foreground")}>
                          {course ? course.title : "Search courses…"}
                        </span>
                      </span>
                      <ChevronsUpDown className="w-4 h-4 text-muted-foreground shrink-0 ml-2" aria-hidden="true" focusable="false" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="p-0 w-[--radix-popover-trigger-width] max-w-[calc(100vw-2rem)]"
                  >
                    <Command>
                      <CommandInput placeholder="Search courses…" />
                      <CommandList>
                        <CommandEmpty>No courses found.</CommandEmpty>
                        <CommandGroup heading={sourceType === "my" ? "My Courses" : "Shared Courses"}>
                          {courses.map((c) => (
                            <CommandItem
                              key={c.id}
                              value={c.title}
                              onSelect={() => {
                                setCourse(c);
                                setPickerOpen(false);
                              }}
                              className="flex items-center gap-3 py-2.5"
                            >
                              <img
                                src={c.thumbnail}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover shrink-0 border border-border"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{c.title}</div>
                                <div className="text-xs text-muted-foreground truncate">{c.meta}</div>
                              </div>
                              {course?.id === c.id && (
                                <Check className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </section>

              {/* Step 3: Options */}
              <section className="space-y-3">
                <div>
                  <h3
                    className={cn(
                      "text-sm font-semibold",
                      course ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    What would you like to copy?
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {course
                      ? `From "${course.title}"`
                      : "Select a course to enable these options."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-4 sm:gap-5 items-stretch">
                  <div className="order-1 sm:order-none h-full">
                    <OptionCard
                      disabled={!course}
                      selected={mode === "sections"}
                      title="Select Section"
                      description="Bring over an entire section with all its pages."
                      onClick={() => setMode("sections")}
                      illustration={<SectionIllustration />}
                    />
                  </div>

                  {/* OR divider */}
                  <div
                    className="order-2 sm:order-none flex sm:flex-col items-center justify-center gap-3 sm:gap-2 sm:self-stretch px-1 sm:px-0"
                    aria-hidden="true"
                  >
                    <span className="h-px sm:h-auto sm:w-px flex-1 min-w-8 sm:min-w-0 sm:min-h-8 bg-border" />
                    <span className="inline-flex h-7 min-w-[2.35rem] items-center justify-center rounded-full bg-background border border-border px-2 text-[10px] font-bold tracking-[0.15em] text-muted-foreground shadow-sm [text-indent:0.15em]">
                      OR
                    </span>
                    <span className="h-px sm:h-auto sm:w-px flex-1 min-w-8 sm:min-w-0 sm:min-h-8 bg-border" />
                  </div>

                  <div className="order-3 sm:order-none h-full">
                    <OptionCard
                      disabled={!course}
                      selected={mode === "pages"}
                      title="Select Individual Pages"
                      description="Cherry-pick specific pages to copy in."
                      onClick={() => setMode("pages")}
                      illustration={<PagesIllustration />}
                    />
                  </div>

                </div>
              </section>
            </div>
          </div>
        )}

        {isReview && mockCourse && course && (
          <ReviewPanel
            mode={mode!}
            course={course}
            mockCourse={mockCourse}
            selectedSectionId={selectedSectionId}
            selectedPageIds={selectedPageIds}
            previewPage={previewPage}
            previewPageId={previewPageId}
            onSectionChange={handleSectionChange}
            onTogglePage={togglePage}
            onPreviewPage={setPreviewPageId}
          />
        )}

        <div className="px-6 sm:px-10 py-4 border-t border-border flex items-center justify-between gap-2 shrink-0 bg-background">
          <div className="text-xs text-muted-foreground">
            {isReview
              ? `${selectedPageIds.length} page${selectedPageIds.length === 1 ? "" : "s"} selected`
              : ""}
          </div>
          <div className="flex items-center gap-2">
            {isReview && (
              <Button variant="ghost" onClick={() => setStep("config")} className="rounded-full">
                Back
              </Button>
            )}
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full">
              Cancel
            </Button>
            {!isReview ? (
              <Button
                onClick={handleContinue}
                disabled={!course || !mode}
                className="rounded-full px-6"
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={handleCopy}
                disabled={selectedPageIds.length === 0}
                className="rounded-full px-6"
              >
                Copy to course
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Review step — left config panel + right live preview                */
/* ------------------------------------------------------------------ */
function ReviewPanel({
  mode,
  course,
  mockCourse,
  selectedSectionId,
  selectedPageIds,
  previewPage,
  previewPageId,
  onSectionChange,
  onTogglePage,
  onPreviewPage,
}: {
  mode: "sections" | "pages";
  course: CourseOption;
  mockCourse: { sections: MockSection[]; rootPages: MockPage[] };
  selectedSectionId: string | null;
  selectedPageIds: string[];
  previewPage: MockPage | null;
  previewPageId: string | null;
  onSectionChange: (id: string) => void;
  onTogglePage: (id: string) => void;
  onPreviewPage: (id: string) => void;
}) {
  const activeSection = mockCourse.sections.find((s) => s.id === selectedSectionId) ?? null;
  const pagePool: MockPage[] =
    mode === "sections" ? activeSection?.pages ?? [] : mockCourse.rootPages;

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] min-h-0 overflow-hidden">
      {/* LEFT: configuration */}
      <div className="border-b lg:border-b-0 lg:border-r border-border bg-muted/20 flex flex-col min-h-0">
        <div className="px-5 py-4 border-b border-border bg-background/50">
          <h3 className="text-sm font-semibold text-foreground">
            {mode === "sections" ? "Choose section & pages" : "Choose pages"}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {mode === "sections"
              ? "Pick one section, then refine which pages to copy."
              : "Select the individual pages you'd like to copy."}
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {/* Summary bar */}
            <div className="flex items-center justify-between px-1">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {mode === "sections" ? "Course outline" : "Individual pages"}
              </div>
              <div className="text-[11px] font-medium text-foreground tabular-nums">
                {selectedPageIds.length}
                <span className="text-muted-foreground font-normal"> selected</span>
              </div>
            </div>

            {mode === "sections" ? (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <Accordion
                  type="single"
                  collapsible
                  value={selectedSectionId ?? undefined}
                  onValueChange={(v) => v && onSectionChange(v)}
                  className="divide-y divide-border"
                >
                  {mockCourse.sections.map((s, i) => {
                    const active = s.id === selectedSectionId;
                    const sectionSelectedCount = s.pages.filter((p) =>
                      selectedPageIds.includes(p.id)
                    ).length;
                    return (
                      <AccordionItem
                        key={s.id}
                        value={s.id}
                        className="border-0 relative"
                      >
                        {active && (
                          <span
                            aria-hidden="true"
                            className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary"
                          />
                        )}
                        <AccordionTrigger
                          className={cn(
                            "px-3.5 py-2.5 hover:no-underline gap-2 transition-colors",
                            active ? "bg-primary/[0.04]" : "hover:bg-muted/50"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="text-[11px] font-mono text-muted-foreground tabular-nums shrink-0 w-5">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span
                              className={cn(
                                "text-sm truncate flex-1 text-left transition-colors",
                                active ? "font-semibold text-foreground" : "font-medium text-foreground"
                              )}
                            >
                              {s.title}
                            </span>
                            {sectionSelectedCount > 0 ? (
                              <span className="text-[10.5px] font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5 tabular-nums shrink-0">
                                {sectionSelectedCount}/{s.pages.length}
                              </span>
                            ) : (
                              <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                                {s.pages.length}
                              </span>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-2 pt-0">
                          <ul className="pl-8 pr-2 relative">
                            <span
                              aria-hidden="true"
                              className="absolute left-[22px] top-0 bottom-1 w-px bg-border"
                            />
                            {s.pages.map((p) => {
                              const checked = selectedPageIds.includes(p.id);
                              const isPreview = p.id === previewPageId;
                              return (
                                <li key={p.id} className="relative">
                                  <span
                                    aria-hidden="true"
                                    className="absolute left-[-10px] top-1/2 w-2.5 h-px bg-border"
                                  />
                                  <div
                                    className={cn(
                                      "group flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors",
                                      isPreview
                                        ? "bg-primary/10"
                                        : checked
                                        ? "bg-primary/[0.04] hover:bg-primary/[0.07]"
                                        : "hover:bg-muted/60"
                                    )}
                                  >
                                    <Checkbox
                                      id={`pg-${p.id}`}
                                      checked={checked}
                                      onCheckedChange={() => onTogglePage(p.id)}
                                      aria-label={`Select ${p.title}`}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => onPreviewPage(p.id)}
                                      className="flex-1 min-w-0 text-left"
                                      aria-label={`Preview ${p.title}`}
                                    >
                                      <span
                                        className={cn(
                                          "text-[13px] truncate block transition-colors",
                                          checked
                                            ? "text-foreground font-medium"
                                            : "text-foreground/80"
                                        )}
                                      >
                                        {p.title}
                                      </span>
                                    </button>
                                    {isPreview && (
                                      <Eye
                                        className="w-3.5 h-3.5 text-primary shrink-0"
                                        aria-hidden="true"
                                        focusable="false"
                                      />
                                    )}
                                  </div>
                                </li>
                              );
                            })}
                            {s.pages.length === 0 && (
                              <li className="text-xs text-muted-foreground px-1 py-2">
                                No pages in this section.
                              </li>
                            )}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
                {pagePool.map((p, i) => {
                  const checked = selectedPageIds.includes(p.id);
                  const isPreview = p.id === previewPageId;
                  return (
                    <div
                      key={p.id}
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-2.5 transition-colors relative",
                        isPreview
                          ? "bg-primary/10"
                          : checked
                          ? "bg-primary/[0.04] hover:bg-primary/[0.07]"
                          : "hover:bg-muted/50"
                      )}
                    >
                      {isPreview && (
                        <span
                          aria-hidden="true"
                          className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary"
                        />
                      )}
                      <Checkbox
                        id={`pg-${p.id}`}
                        checked={checked}
                        onCheckedChange={() => onTogglePage(p.id)}
                        aria-label={`Select ${p.title}`}
                      />
                      <span className="text-[11px] font-mono text-muted-foreground tabular-nums shrink-0 w-5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <button
                        type="button"
                        onClick={() => onPreviewPage(p.id)}
                        className="flex-1 min-w-0 text-left"
                        aria-label={`Preview ${p.title}`}
                      >
                        <span
                          className={cn(
                            "text-[13px] truncate block transition-colors",
                            checked ? "text-foreground font-medium" : "text-foreground/80"
                          )}
                        >
                          {p.title}
                        </span>
                      </button>
                      {isPreview && (
                        <Eye
                          className="w-3.5 h-3.5 text-primary shrink-0"
                          aria-hidden="true"
                          focusable="false"
                        />
                      )}
                    </div>
                  );
                })}
                {pagePool.length === 0 && (
                  <div className="text-xs text-muted-foreground px-3 py-6 text-center">
                    No pages available.
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>



      {/* RIGHT: live preview */}
      <div className="flex flex-col min-h-0 bg-background">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-background/50">
          <div className="flex items-center gap-2 min-w-0">
            <Eye className="w-4 h-4 text-muted-foreground" aria-hidden="true" focusable="false" />
            <span className="text-sm font-semibold text-foreground truncate">Live preview</span>
          </div>
          <span className="text-[11px] text-muted-foreground truncate">
            {course.title}
          </span>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-6 lg:p-10">
            <PreviewContent
              mode={mode}
              section={activeSection}
              selectedPages={pagePool.filter((p) => selectedPageIds.includes(p.id))}
              previewPage={previewPage}
              onPickPage={onPreviewPage}
            />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

function PreviewContent({
  mode,
  section,
  selectedPages,
  previewPage,
  onPickPage,
}: {
  mode: "sections" | "pages";
  section: MockSection | null;
  selectedPages: MockPage[];
  previewPage: MockPage | null;
  onPickPage: (id: string) => void;
}) {
  if (selectedPages.length === 0) {
    return (
      <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center gap-2 text-muted-foreground">
        <BookOpen className="w-8 h-8" aria-hidden="true" focusable="false" />
        <p className="text-sm">Select at least one page to preview.</p>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-2 pb-4 border-b border-border">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
          {mode === "sections" && section ? section.title : "Individual pages"}
        </div>
        {previewPage && (
          <h1 className="text-2xl font-bold text-foreground leading-tight">
            {previewPage.title}
          </h1>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileText className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
          <span>
            Page {Math.max(1, selectedPages.findIndex((p) => p.id === previewPage?.id) + 1)} of {selectedPages.length}
          </span>
        </div>
      </header>

      {previewPage && (
        <div className="space-y-4">
          <div className="aspect-[16/9] rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-muted border border-border flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-primary/40" aria-hidden="true" focusable="false" />
          </div>
          <p className="text-base text-foreground leading-relaxed">
            {previewPage.excerpt}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This is a sample of how "{previewPage.title}" will appear once copied
            into your course. Formatting, media, and interactive blocks are
            preserved during the copy.
          </p>
        </div>
      )}

      {selectedPages.length > 1 && (
        <nav
          aria-label="Selected pages"
          className="pt-6 border-t border-border space-y-2"
        >
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Pages in this preview
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {selectedPages.map((p, i) => {
              const active = p.id === previewPage?.id;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => onPickPage(p.id)}
                    aria-label={`Preview ${p.title}`}
                    aria-pressed={active}
                    className={cn(
                      "w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors",
                      active
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-foreground/30"
                    )}
                  >
                    <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden="true" focusable="false" />
                    <span className="text-sm text-foreground truncate">{p.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </article>
  );
}


function OptionCard({
  title,
  description,
  illustration,
  onClick,
  disabled,
  selected,
}: {
  title: string;
  description: string;
  illustration: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={title}
      aria-pressed={selected}
      className={cn(
        "group relative h-full w-full flex flex-col items-start gap-4 rounded-2xl border-2 p-5 text-left transition-all overflow-hidden",
        disabled
          ? "border-border bg-muted/30 opacity-60 cursor-not-allowed"
          : selected
            ? "border-primary bg-primary/5 ring-4 ring-primary/15 shadow-md"
            : "border-border bg-card hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5"
      )}
    >
      {selected && !disabled && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
          <Check className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
        </div>
      )}
      <div
        className={cn(
          "w-full aspect-[16/9] shrink-0 rounded-xl flex items-center justify-center overflow-hidden",
          disabled ? "bg-muted" : selected ? "bg-primary/10" : "bg-primary/5"
        )}
        aria-hidden="true"
      >
        {illustration}
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}

/**
 * Mini course-outline preview that mirrors the real editor sidebar
 * (sections with chevrons + nested page rows with file icons + numeric
 * indices). Renders the whole "Section 02" container as the selection so
 * users immediately recognize that the parent and every child are copied.
 */
function SectionIllustration() {
  const sections = [
    { idx: "01", title: "Getting started", pages: 3, open: false, active: false },
    {
      idx: "02",
      title: "Fundamentals",
      open: true,
      active: true,
      pages: [
        { n: "01", title: "Introduction" },
        { n: "02", title: "Core concepts" },
        { n: "03", title: "Worked example" },
        { n: "04", title: "Summary" },
      ],
    },
    { idx: "03", title: "Advanced topics", pages: 5, open: false, active: false },
  ] as const;

  return (
    <div
      className="w-[92%] h-[92%] rounded-lg bg-background border border-border shadow-sm overflow-hidden flex text-left"
      aria-hidden="true"
    >
      {/* Sidebar (mimics outline panel) */}
      <div className="w-full flex flex-col">
        <div className="flex items-center justify-between px-2 py-1 border-b border-border bg-muted/40">
          <span className="text-[7px] font-semibold tracking-wider text-muted-foreground uppercase">Outline</span>
          <span className="flex gap-0.5">
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
          </span>
        </div>
        <div className="flex-1 p-1 space-y-0.5 overflow-hidden">
          {sections.map((s) => (
            <React.Fragment key={s.idx}>
              <div
                className={cn(
                  "flex items-center gap-1 rounded px-1 py-1",
                  s.active && "bg-primary/15 ring-1 ring-primary/40"
                )}
              >
                <ChevronDown
                  className={cn(
                    "w-2 h-2 shrink-0 transition-transform",
                    s.active ? "text-primary" : "text-muted-foreground/60",
                    !s.open && "-rotate-90"
                  )}
                  aria-hidden="true"
                  focusable="false"
                />
                <Folder
                  className={cn("w-2 h-2 shrink-0", s.active ? "text-primary" : "text-muted-foreground/60")}
                  aria-hidden="true"
                  focusable="false"
                />
                <span
                  className={cn(
                    "text-[7px] font-mono shrink-0",
                    s.active ? "text-primary" : "text-muted-foreground/60"
                  )}
                >
                  {s.idx}
                </span>
                <span
                  className={cn(
                    "text-[7.5px] font-semibold truncate",
                    s.active ? "text-primary" : "text-foreground/70"
                  )}
                >
                  {s.title}
                </span>
                {s.active && (
                  <span className="ml-auto inline-flex items-center justify-center w-2.5 h-2.5 rounded-full bg-primary">
                    <Check className="w-1.5 h-1.5 text-primary-foreground" strokeWidth={4} aria-hidden="true" focusable="false" />
                  </span>
                )}
              </div>
              {s.open && Array.isArray(s.pages) &&
                s.pages.map((p) => (
                  <div
                    key={p.n}
                    className="flex items-center gap-1 pl-4 pr-1 py-0.5 rounded bg-primary/5"
                  >
                    <FileText className="w-2 h-2 text-primary/70 shrink-0" aria-hidden="true" focusable="false" />
                    <span className="text-[6.5px] font-mono text-primary/70 shrink-0">{p.n}</span>
                    <span className="text-[7px] text-foreground/80 truncate">{p.title}</span>
                  </div>
                ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Sibling preview to SectionIllustration — represents "individual pages"
 * as standalone pages that live OUTSIDE any section (top-level items in
 * the outline), each ticked via its own checkbox. A collapsed section is
 * shown alongside them so the contrast (root-level pages vs. section)
 * is obvious at a glance.
 */
function PagesIllustration() {
  type Row =
    | { kind: "section"; idx: string; title: string }
    | { kind: "page"; idx: string; title: string; checked: boolean };

  const rows: Row[] = [
    { kind: "section", idx: "01", title: "Getting started" },
    { kind: "page", idx: "02", title: "Quick reference", checked: true },
    { kind: "section", idx: "03", title: "Fundamentals" },
    { kind: "page", idx: "04", title: "Cheat sheet", checked: false },
    { kind: "page", idx: "05", title: "Final recap", checked: true },
  ];

  return (
    <div
      className="w-[92%] h-[92%] rounded-lg bg-background border border-border shadow-sm overflow-hidden flex text-left"
      aria-hidden="true"
    >
      <div className="w-full flex flex-col">
        <div className="flex items-center justify-between px-2 py-1 border-b border-border bg-muted/40">
          <span className="text-[7px] font-semibold tracking-wider text-muted-foreground uppercase">Outline</span>
          <span className="flex gap-0.5">
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
          </span>
        </div>
        <div className="flex-1 p-1 space-y-0.5 overflow-hidden">
          {rows.map((r) =>
            r.kind === "section" ? (
              <div key={r.idx} className="flex items-center gap-1 rounded px-1 py-1">
                <ChevronDown
                  className="w-2 h-2 shrink-0 text-muted-foreground/60 -rotate-90"
                  aria-hidden="true"
                  focusable="false"
                />
                <Folder className="w-2 h-2 shrink-0 text-muted-foreground/60" aria-hidden="true" focusable="false" />
                <span className="text-[7px] font-mono text-muted-foreground/60 shrink-0">{r.idx}</span>
                <span className="text-[7.5px] font-semibold text-foreground/70 truncate">{r.title}</span>
              </div>
            ) : (
              <div
                key={r.idx}
                className={cn(
                  "flex items-center gap-1 px-1 py-1 rounded",
                  r.checked && "bg-primary/10 ring-1 ring-primary/30"
                )}
              >
                <span
                  className={cn(
                    "w-2 h-2 rounded-[2px] border flex items-center justify-center shrink-0",
                    r.checked ? "bg-primary border-primary" : "border-muted-foreground/40 bg-background"
                  )}
                >
                  {r.checked && (
                    <Check className="w-1.5 h-1.5 text-primary-foreground" strokeWidth={4} aria-hidden="true" focusable="false" />
                  )}
                </span>
                <FileText
                  className={cn("w-2 h-2 shrink-0", r.checked ? "text-primary" : "text-muted-foreground/60")}
                  aria-hidden="true"
                  focusable="false"
                />
                <span
                  className={cn(
                    "text-[7px] font-mono shrink-0",
                    r.checked ? "text-primary" : "text-muted-foreground/60"
                  )}
                >
                  {r.idx}
                </span>
                <span
                  className={cn(
                    "text-[7.5px] truncate",
                    r.checked ? "text-foreground font-semibold" : "text-foreground/70"
                  )}
                >
                  {r.title}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
