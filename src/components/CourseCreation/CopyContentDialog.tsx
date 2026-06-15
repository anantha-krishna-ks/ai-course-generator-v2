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
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Check,
  ChevronDown,
  ChevronsUpDown,
  CopyPlus,
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

type SourceType = "my" | "shared";

interface CopyContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect?: (payload: {
    course: CourseOption;
    mode: "sections" | "pages";
    sourceType: SourceType;
  }) => void;
}

export function CopyContentDialog({ open, onOpenChange, onSelect }: CopyContentDialogProps) {
  const { toast } = useToast();
  const [sourceType, setSourceType] = useState<SourceType>("my");
  const [course, setCourse] = useState<CourseOption | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mode, setMode] = useState<"sections" | "pages" | null>(null);

  const courses = useMemo(
    () => (sourceType === "my" ? MY_COURSES : SHARED_COURSES),
    [sourceType]
  );

  const handleTypeChange = (t: SourceType) => {
    setSourceType(t);
    setCourse(null);
    setMode(null);
  };

  const handleContinue = () => {
    if (!course || !mode) return;
    onSelect?.({ course, mode, sourceType });
    toast({
      title: mode === "sections" ? "Section picker" : "Page picker",
      description: `Pick ${mode} from "${course.title}" to copy into this course.`,
    });
    onOpenChange(false);
  };


  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) {
          setSourceType("my");
          setCourse(null);
          setPickerOpen(false);
          setMode(null);
        }
      }}
    >
      <DialogContent
        className="p-0 gap-0 w-[95vw] h-auto max-h-[92dvh] max-w-4xl sm:rounded-2xl rounded-2xl border border-border flex flex-col bg-background overflow-hidden shadow-2xl [&>button]:hidden"
      >
        {/* Header — matches PageEditorDialog */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0 shadow-[0_1px_2px_0_hsl(var(--foreground)/0.03),0_2px_6px_-1px_hsl(var(--foreground)/0.04)] z-10">
          <div className="flex items-center gap-2.5">
            <CopyPlus className="w-4 h-4 text-muted-foreground" aria-hidden="true" focusable="false" />
            <DialogTitle className="text-sm font-medium text-foreground">Copy Content</DialogTitle>
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
          Pull a section or pages from another course into your outline.
        </DialogDescription>

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
                <div className="order-1 sm:order-none">
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

                <div className="order-3 sm:order-none">
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

        <div className="px-6 sm:px-10 py-4 border-t border-border flex items-center justify-end gap-2 shrink-0 bg-background">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full">
            Cancel
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!course || !mode}
            className="rounded-full px-6"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
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
        "group relative flex flex-col items-start gap-4 rounded-2xl border-2 p-5 text-left transition-all overflow-hidden",
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
          "w-full aspect-[16/9] rounded-xl flex items-center justify-center",
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
