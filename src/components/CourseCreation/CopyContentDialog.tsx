import React, { useMemo, useState } from "react";
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
  ChevronsUpDown,
  Search,
  Users,
  User,
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
        className="p-0 gap-0 w-[98vw] h-[96dvh] max-w-7xl sm:rounded-2xl rounded-2xl border border-border flex flex-col bg-background overflow-hidden shadow-2xl"
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
                    className="w-full justify-between rounded-full h-12 px-3 text-left font-normal"
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
