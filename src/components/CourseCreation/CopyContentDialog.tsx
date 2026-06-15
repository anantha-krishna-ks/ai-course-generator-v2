import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen,
  Check,
  ChevronsUpDown,
  Search,
  Users,
  User,
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

  const courses = useMemo(
    () => (sourceType === "my" ? MY_COURSES : SHARED_COURSES),
    [sourceType]
  );

  const handleTypeChange = (t: SourceType) => {
    setSourceType(t);
    setCourse(null);
  };

  const handleSelectMode = (mode: "sections" | "pages") => {
    if (!course) return;
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
        }
      }}
    >
      <DialogContent
        className="p-0 gap-0 w-[97vw] h-[96dvh] max-w-6xl sm:rounded-2xl rounded-2xl border border-border flex flex-col bg-background overflow-hidden shadow-2xl"
      >
        <DialogHeader className="px-6 sm:px-10 py-5 border-b border-border shrink-0">
          <DialogTitle className="text-xl font-semibold">Copy Content</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Pull a section or pages from another course into your outline.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-6 sm:px-10 py-8 space-y-8">
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
                    className="w-full justify-between rounded-full h-12 px-4 text-left font-normal"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <Search className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" focusable="false" />
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
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <BookOpen className="w-4 h-4 text-muted-foreground" aria-hidden="true" focusable="false" />
                            </div>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <OptionCard
                  disabled={!course}
                  title="Select Section"
                  description="Bring over an entire section with all its pages."
                  onClick={() => handleSelectMode("sections")}
                  illustration={<SectionIllustration />}
                />
                <OptionCard
                  disabled={!course}
                  title="Select Individual Pages"
                  description="Cherry-pick specific pages to copy in."
                  onClick={() => handleSelectMode("pages")}
                  illustration={<PagesIllustration />}
                />
              </div>
            </section>
          </div>
        </div>

        <div className="px-6 sm:px-10 py-4 border-t border-border flex items-center justify-end gap-2 shrink-0 bg-background">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full">
            Cancel
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
}: {
  title: string;
  description: string;
  illustration: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={title}
      className={cn(
        "group relative flex flex-col items-start gap-4 rounded-2xl border p-5 text-left transition-all overflow-hidden",
        disabled
          ? "border-border bg-muted/30 opacity-60 cursor-not-allowed"
          : "border-border bg-card hover:border-primary hover:shadow-lg hover:-translate-y-0.5"
      )}
    >
      <div
        className={cn(
          "w-full aspect-[16/9] rounded-xl flex items-center justify-center",
          disabled ? "bg-muted" : "bg-primary/5"
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
