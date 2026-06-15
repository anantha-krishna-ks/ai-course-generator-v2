import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen,
  Check,
  CopyPlus,
  FileText,
  Layers,
  Search,
  User,
  Users,
  X,
} from "lucide-react";

interface CourseOption {
  id: string;
  title: string;
  meta: string;
}

const MY_COURSES: CourseOption[] = [
  { id: "c1", title: "Onboarding Essentials", meta: "12 pages · 4 sections" },
  { id: "c2", title: "Workplace Safety 101", meta: "8 pages · 3 sections" },
  { id: "c3", title: "Customer Service Basics", meta: "15 pages · 5 sections" },
  { id: "c4", title: "Leadership Foundations", meta: "20 pages · 6 sections" },
  { id: "c5", title: "Compliance Refresher", meta: "6 pages · 2 sections" },
];

const SHARED_COURSES: CourseOption[] = [
  { id: "s1", title: "Brand Guidelines (Shared)", meta: "10 pages · 3 sections" },
  { id: "s2", title: "Product Knowledge — Team", meta: "18 pages · 5 sections" },
  { id: "s3", title: "Sales Playbook", meta: "22 pages · 7 sections" },
];

type SourceType = "my" | "shared";
type Mode = "sections" | "pages";

interface CopyContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect?: (payload: {
    course: CourseOption;
    mode: Mode;
    sourceType: SourceType;
  }) => void;
}

export function CopyContentDialog({ open, onOpenChange, onSelect }: CopyContentDialogProps) {
  const { toast } = useToast();
  const [sourceType, setSourceType] = useState<SourceType>("my");
  const [course, setCourse] = useState<CourseOption | null>(null);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<Mode | null>(null);

  const courses = useMemo(
    () => (sourceType === "my" ? MY_COURSES : SHARED_COURSES),
    [sourceType],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((c) => c.title.toLowerCase().includes(q));
  }, [courses, search]);

  const reset = () => {
    setSourceType("my");
    setCourse(null);
    setSearch("");
    setMode(null);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(reset, 200);
  };

  const handleConfirm = () => {
    if (!course || !mode) return;
    onSelect?.({ course, mode, sourceType });
    toast({
      title: mode === "sections" ? "Section picker" : "Page picker",
      description: `Pick ${mode} from "${course.title}" to copy into this course.`,
    });
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        className="max-w-[98vw] w-[1280px] h-[92vh] p-0 gap-0 overflow-hidden flex flex-col [&>button]:hidden data-[state=open]:!animate-none data-[state=closed]:!animate-none data-[state=open]:!duration-0 data-[state=closed]:!duration-0"
      >
        <DialogTitle className="sr-only">Copy Content</DialogTitle>
        <DialogDescription className="sr-only">
          Pull a section or pages from another course into your outline.
        </DialogDescription>

        {/* Top bar — mirrors Page editor header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0 shadow-[0_1px_2px_0_hsl(var(--foreground)/0.03),0_2px_6px_-1px_hsl(var(--foreground)/0.04)] z-10">
          <div className="flex items-center gap-2.5">
            <CopyPlus className="w-4 h-4 text-muted-foreground" aria-hidden="true" focusable="false" />
            <span className="text-sm font-medium text-foreground">Copy Content</span>
            <span className="hidden sm:inline text-xs text-muted-foreground">
              · Pull a section or pages from another course
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="rounded-full h-9 px-4 text-sm"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              className="rounded-full h-9 px-4 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!course || !mode}
              onClick={handleConfirm}
            >
              <Check className="w-4 h-4" aria-hidden="true" focusable="false" />
              Continue
            </Button>
            <span className="w-px h-5 bg-border" aria-hidden="true" />
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="p-2.5 rounded-md hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" aria-hidden="true" focusable="false" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0 flex-col md:flex-row">
          {/* Left sidebar — source picker */}
          <aside className="w-full md:w-[340px] border-b md:border-b-0 md:border-r border-border bg-muted/20 flex flex-col min-h-0">
            <div className="px-4 pt-4 pb-3">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Source
              </div>
              {/* Segmented type toggle */}
              <div className="relative flex items-center bg-foreground/[0.06] border border-border/50 rounded-lg p-[3px]">
                <div
                  aria-hidden="true"
                  className="absolute top-[3px] bottom-[3px] rounded-md bg-background shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_-1px_rgba(0,0,0,0.05)] transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                  style={{
                    left: sourceType === "my" ? "3px" : "calc(50% + 1.5px)",
                    width: "calc(50% - 4.5px)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setSourceType("my");
                    setCourse(null);
                  }}
                  className={cn(
                    "relative z-10 flex-1 flex items-center justify-center gap-1.5 h-8 text-xs font-medium rounded-md transition-colors",
                    sourceType === "my" ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <User className="w-3 h-3" aria-hidden="true" focusable="false" />
                  My Courses
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSourceType("shared");
                    setCourse(null);
                  }}
                  className={cn(
                    "relative z-10 flex-1 flex items-center justify-center gap-1.5 h-8 text-xs font-medium rounded-md transition-colors",
                    sourceType === "shared" ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <Users className="w-3 h-3" aria-hidden="true" focusable="false" />
                  Shared
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="px-4 pb-3">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                  aria-hidden="true"
                  focusable="false"
                />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search courses…"
                  aria-label="Search courses"
                  className="h-9 pl-9 rounded-full bg-background border-border text-sm"
                />
              </div>
            </div>

            {/* Course list */}
            <div className="flex-1 overflow-y-auto thin-scrollbar px-2 pb-3 min-h-0">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Select course <span className="text-destructive">*</span>
              </div>
              {filtered.length === 0 ? (
                <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                  No courses found.
                </div>
              ) : (
                <ul className="space-y-1">
                  {filtered.map((c) => {
                    const active = course?.id === c.id;
                    return (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => setCourse(c)}
                          aria-pressed={active}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                            active
                              ? "bg-primary/10 ring-1 ring-primary/30"
                              : "hover:bg-background",
                          )}
                        >
                          <div
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                              active
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            <BookOpen className="w-4 h-4" aria-hidden="true" focusable="false" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">
                              {c.title}
                            </div>
                            <div className="text-[11px] text-muted-foreground truncate">
                              {c.meta}
                            </div>
                          </div>
                          {active && (
                            <Check
                              className="w-4 h-4 text-primary shrink-0"
                              aria-hidden="true"
                              focusable="false"
                            />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>

          {/* Right main — mode picker */}
          <section className="flex-1 min-h-0 overflow-y-auto bg-background">
            <div className="mx-auto w-full max-w-3xl px-6 sm:px-10 py-8">
              <div className="mb-6">
                <h2 className="text-base font-semibold text-foreground">
                  What would you like to copy?
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {course
                    ? <>From <span className="text-foreground font-medium">"{course.title}"</span></>
                    : "Select a course on the left to enable these options."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ModeCard
                  active={mode === "sections"}
                  disabled={!course}
                  title="Select Section"
                  description="Bring over an entire section with all its pages."
                  onClick={() => setMode("sections")}
                  illustration={<SectionIllustration />}
                  icon={<Layers className="w-4 h-4" aria-hidden="true" focusable="false" />}
                />
                <ModeCard
                  active={mode === "pages"}
                  disabled={!course}
                  title="Select Individual Pages"
                  description="Cherry-pick specific pages to copy in."
                  onClick={() => setMode("pages")}
                  illustration={<PagesIllustration />}
                  icon={<FileText className="w-4 h-4" aria-hidden="true" focusable="false" />}
                />
              </div>

              {!course && (
                <div className="mt-8 rounded-xl border border-dashed border-border bg-muted/30 px-5 py-4 text-xs text-muted-foreground">
                  Tip: pick a course from the source panel to enable Section or
                  Page selection.
                </div>
              )}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ModeCard({
  title,
  description,
  illustration,
  icon,
  onClick,
  disabled,
  active,
}: {
  title: string;
  description: string;
  illustration: React.ReactNode;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={title}
      aria-pressed={active}
      className={cn(
        "group relative flex flex-col items-start gap-4 rounded-2xl border p-5 text-left transition-all overflow-hidden",
        disabled
          ? "border-border bg-muted/30 opacity-60 cursor-not-allowed"
          : active
            ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
            : "border-border bg-card hover:border-primary/60 hover:shadow-md hover:-translate-y-0.5",
      )}
    >
      <div
        className={cn(
          "w-full aspect-[16/9] rounded-xl flex items-center justify-center",
          active ? "bg-primary/10" : disabled ? "bg-muted" : "bg-primary/5",
        )}
        aria-hidden="true"
      >
        {illustration}
      </div>
      <div className="space-y-1 w-full">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
              active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            {icon}
          </span>
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {active && (
            <Check
              className="w-4 h-4 text-primary ml-auto"
              aria-hidden="true"
              focusable="false"
            />
          )}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}

function SectionIllustration() {
  return (
    <svg viewBox="0 0 200 110" className="w-3/4 h-auto" aria-hidden="true" focusable="false">
      <rect x="20" y="14" width="160" height="22" rx="6" className="fill-primary/20" />
      <rect x="28" y="22" width="60" height="6" rx="3" className="fill-primary" />
      <rect x="30" y="46" width="140" height="14" rx="4" className="fill-muted-foreground/20" />
      <rect x="30" y="66" width="140" height="14" rx="4" className="fill-muted-foreground/20" />
      <rect x="30" y="86" width="100" height="14" rx="4" className="fill-muted-foreground/20" />
    </svg>
  );
}

function PagesIllustration() {
  return (
    <svg viewBox="0 0 200 110" className="w-3/4 h-auto" aria-hidden="true" focusable="false">
      <rect x="20" y="18" width="50" height="74" rx="6" className="fill-muted-foreground/15" />
      <rect x="26" y="26" width="38" height="5" rx="2" className="fill-muted-foreground/40" />
      <rect x="26" y="36" width="30" height="4" rx="2" className="fill-muted-foreground/30" />
      <rect x="26" y="44" width="34" height="4" rx="2" className="fill-muted-foreground/30" />

      <rect x="75" y="18" width="50" height="74" rx="6" className="fill-primary/20 stroke-primary" strokeWidth="1.5" />
      <rect x="81" y="26" width="38" height="5" rx="2" className="fill-primary" />
      <rect x="81" y="36" width="30" height="4" rx="2" className="fill-primary/60" />
      <rect x="81" y="44" width="34" height="4" rx="2" className="fill-primary/60" />
      <circle cx="118" cy="86" r="6" className="fill-primary" />
      <path d="M115 86 L117.5 88.5 L121 84.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      <rect x="130" y="18" width="50" height="74" rx="6" className="fill-muted-foreground/15" />
      <rect x="136" y="26" width="38" height="5" rx="2" className="fill-muted-foreground/40" />
      <rect x="136" y="36" width="30" height="4" rx="2" className="fill-muted-foreground/30" />
      <rect x="136" y="44" width="34" height="4" rx="2" className="fill-muted-foreground/30" />
    </svg>
  );
}
