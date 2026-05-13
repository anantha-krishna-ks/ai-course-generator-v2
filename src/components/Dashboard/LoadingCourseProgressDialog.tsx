import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Check, Loader2, Circle, FileText, LayoutGrid, X, Layers, Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AISparkles } from "@/components/ui/ai-sparkles";
import { getMinutesAgoLabel, getProgress, type LoadingCourse } from "@/lib/loadingCourses";

type Status = "completed" | "in-progress" | "not-started";

interface OutlineItem {
  id: string;
  type: "section" | "page";
  title: string;
  children?: OutlineItem[];
}

const MOCK_OUTLINE: OutlineItem[] = [
  {
    id: "s1", type: "section", title: "Introduction & Overview",
    children: [
      { id: "s1-p1", type: "page", title: "Welcome & Course Overview" },
      { id: "s1-p2", type: "page", title: "Learning Objectives" },
    ],
  },
  {
    id: "s2", type: "section", title: "Core Concepts",
    children: [
      { id: "s2-p1", type: "page", title: "Fundamental Principles" },
      { id: "s2-p2", type: "page", title: "Key Terminology" },
      { id: "s2-p3", type: "page", title: "Practical Applications" },
    ],
  },
  {
    id: "s3", type: "section", title: "Deep Dive & Analysis",
    children: [
      { id: "s3-p1", type: "page", title: "Case Studies" },
      { id: "s3-p2", type: "page", title: "Best Practices" },
      { id: "s3-p3", type: "page", title: "Interactive Workshop" },
    ],
  },
  {
    id: "s4", type: "section", title: "Assessment & Wrap-Up",
    children: [
      { id: "s4-p1", type: "page", title: "Course Summary" },
      { id: "s4-p2", type: "page", title: "Final Assessment" },
    ],
  },
];

function flattenPages(items: OutlineItem[]): OutlineItem[] {
  const out: OutlineItem[] = [];
  for (const it of items) {
    if (it.children) out.push(...it.children);
    else out.push(it);
  }
  return out;
}

function computeStatuses(items: OutlineItem[], pct: number): Map<string, Status> {
  const pages = flattenPages(items);
  const total = pages.length;
  const doneCount = Math.floor((pct / 100) * total);
  const map = new Map<string, Status>();
  pages.forEach((p, idx) => {
    if (idx < doneCount) map.set(p.id, "completed");
    else if (idx === doneCount) map.set(p.id, "in-progress");
    else map.set(p.id, "not-started");
  });
  for (const sec of items) {
    if (!sec.children?.length) continue;
    const statuses = sec.children.map((c) => map.get(c.id)!);
    if (statuses.every((s) => s === "completed")) map.set(sec.id, "completed");
    else if (statuses.some((s) => s === "in-progress" || s === "completed")) map.set(sec.id, "in-progress");
    else map.set(sec.id, "not-started");
  }
  return map;
}

function StatusDot({ status }: { status: Status }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0" aria-label="Completed">
        <Check className="w-3 h-3" aria-hidden="true" focusable="false" strokeWidth={3} />
      </span>
    );
  }
  if (status === "in-progress") {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary shrink-0" aria-label="In progress">
        <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" focusable="false" />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted text-muted-foreground/60 shrink-0" aria-label="Not started">
      <Circle className="w-2.5 h-2.5" aria-hidden="true" focusable="false" />
    </span>
  );
}

function StatusPill({ status }: { status: Status }) {
  const config = {
    "completed": { label: "Completed", cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
    "in-progress": { label: "In progress", cls: "bg-primary/10 text-primary" },
    "not-started": { label: "Not started", cls: "bg-muted text-muted-foreground" },
  }[status];
  return (
    <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0", config.cls)}>
      {config.label}
    </span>
  );
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: LoadingCourse | null;
}

export function LoadingCourseProgressDialog({ open, onOpenChange, course }: Props) {
  if (!course) return null;
  const pct = getProgress(course);
  const statuses = computeStatuses(MOCK_OUTLINE, pct);
  const pages = flattenPages(MOCK_OUTLINE);
  const currentPage = pages.find((p) => statuses.get(p.id) === "in-progress");
  const summary = (() => {
    let done = 0, inP = 0, todo = 0;
    pages.forEach((p) => {
      const s = statuses.get(p.id);
      if (s === "completed") done++;
      else if (s === "in-progress") inP++;
      else todo++;
    });
    return { done, inP, todo, total: pages.length };
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideCloseButton
        className="max-w-[98vw] w-[1600px] h-[95vh] p-0 gap-0 overflow-hidden flex flex-col data-[state=open]:!animate-none data-[state=closed]:!animate-none"
      >
        {/* Header — mirrors Page editor */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0 shadow-[0_1px_2px_0_hsl(var(--foreground)/0.03),0_2px_6px_-1px_hsl(var(--foreground)/0.04)] z-10 bg-card">
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-muted-foreground" aria-hidden="true" focusable="false" />
            <span className="text-sm font-medium text-foreground">Page editor</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 ml-3 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
              <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" focusable="false" />
              Generating · {pct}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenChange(false)}
              className="p-2.5 rounded-md hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-muted-foreground" aria-hidden="true" focusable="false" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">
          {/* Left Sidebar — outline only */}
          <div className="border-r border-border bg-muted/20 flex flex-col shrink-0 w-[360px]">
            {/* Outline header (no toggle, no Blocks tab) */}
            <div className="px-4 pt-4 pb-3 border-b border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-foreground/[0.06] border border-border/50">
                  <LayoutGrid className="w-3.5 h-3.5 text-foreground" aria-hidden="true" focusable="false" />
                </div>
                <span className="text-sm font-semibold text-foreground">Outline</span>
              </div>

              {/* Overall progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-medium">
                  <span className="text-muted-foreground tabular-nums">{summary.done} of {summary.total} pages</span>
                  <span className="text-primary tabular-nums font-semibold">{pct}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Legend */}
              <div className="mt-3 flex items-center gap-3 text-[10px] font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Done</span>
                <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary" />Working</span>
                <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />Pending</span>
              </div>
            </div>

            {/* Outline list */}
            <div className="flex-1 overflow-y-auto p-3 thin-scrollbar space-y-2">
              {MOCK_OUTLINE.map((section) => {
                const sStatus = statuses.get(section.id)!;
                return (
                  <div key={section.id} className="rounded-xl border border-border/60 bg-card overflow-hidden">
                    <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <StatusDot status={sStatus} />
                        <Layers className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden="true" focusable="false" />
                        <span className="text-[13px] font-semibold text-foreground truncate">
                          {section.title}
                        </span>
                      </div>
                      <StatusPill status={sStatus} />
                    </div>
                    {section.children && (
                      <div className="border-t border-border/40 bg-muted/10 py-1">
                        {section.children.map((page) => {
                          const pStatus = statuses.get(page.id)!;
                          return (
                            <div
                              key={page.id}
                              className={cn(
                                "flex items-center justify-between gap-2 pl-7 pr-3 py-1.5 rounded-md mx-1 my-0.5",
                                pStatus === "in-progress" && "bg-primary/[0.06]"
                              )}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <StatusDot status={pStatus} />
                                <FileText className="w-3 h-3 text-muted-foreground/70 shrink-0" aria-hidden="true" focusable="false" />
                                <span className={cn(
                                  "text-[12px] truncate",
                                  pStatus === "completed" && "text-foreground",
                                  pStatus === "in-progress" && "text-foreground font-medium",
                                  pStatus === "not-started" && "text-muted-foreground",
                                )}>
                                  {page.title}
                                </span>
                              </div>
                              <StatusPill status={pStatus} />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right pane — empty state with live status */}
          <div className="flex-1 flex flex-col items-center justify-center p-10 bg-background relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-primary/[0.04] blur-[100px] animate-pulse" style={{ animationDuration: "6s" }} />
              <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-accent/[0.06] blur-[80px] animate-pulse" style={{ animationDuration: "8s" }} />
            </div>

            <div className="relative max-w-md w-full text-center space-y-5">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center shadow-sm">
                <AISparkles className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-lg font-semibold text-foreground">{course.title}</h2>
                <p className="text-sm text-muted-foreground">
                  Generating in the background · Started {getMinutesAgoLabel(course.startedAt)}
                </p>
              </div>

              {currentPage && (
                <div className="rounded-2xl border border-border/70 bg-card/80 backdrop-blur-sm p-5 text-left shadow-sm">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-primary mb-2">
                    <Sparkles className="w-3 h-3" aria-hidden="true" focusable="false" />
                    Currently working on
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <FileText className="w-4 h-4 text-muted-foreground" aria-hidden="true" focusable="false" />
                    <span className="text-sm font-medium truncate">{currentPage.title}</span>
                  </div>
                  <div className="mt-4 h-1 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-5 pt-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-foreground tabular-nums">{summary.done}</span> done
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="font-semibold text-foreground tabular-nums">{summary.inP}</span> working
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                  <span className="font-semibold text-foreground tabular-nums">{summary.todo}</span> pending
                </span>
              </div>

              <p className="text-[11px] text-muted-foreground/80 pt-2 inline-flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3" aria-hidden="true" focusable="false" />
                You can close this and keep working — we'll keep generating in the background.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
