import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check, Loader2, Circle, ChevronRight, FileText, Layers } from "lucide-react";
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

function flatten(items: OutlineItem[]): OutlineItem[] {
  const out: OutlineItem[] = [];
  for (const it of items) {
    out.push(it);
    if (it.children) out.push(...it.children);
  }
  return out;
}

function computeStatuses(items: OutlineItem[], pct: number): Map<string, Status> {
  const flat = flatten(items);
  const total = flat.length;
  const doneCount = Math.floor((pct / 100) * total);
  const map = new Map<string, Status>();
  flat.forEach((it, idx) => {
    if (idx < doneCount) map.set(it.id, "completed");
    else if (idx === doneCount) map.set(it.id, "in-progress");
    else map.set(it.id, "not-started");
  });
  // Section status derived from children
  for (const sec of items) {
    if (!sec.children?.length) continue;
    const statuses = sec.children.map((c) => map.get(c.id)!);
    if (statuses.every((s) => s === "completed")) map.set(sec.id, "completed");
    else if (statuses.some((s) => s === "in-progress" || s === "completed")) map.set(sec.id, "in-progress");
    else map.set(sec.id, "not-started");
  }
  return map;
}

function StatusBadge({ status }: { status: Status }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
        <Check className="w-2.5 h-2.5" aria-hidden="true" focusable="false" strokeWidth={3} />
        Completed
      </span>
    );
  }
  if (status === "in-progress") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
        <Loader2 className="w-2.5 h-2.5 animate-spin" aria-hidden="true" focusable="false" />
        In progress
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-semibold">
      <Circle className="w-2.5 h-2.5" aria-hidden="true" focusable="false" />
      Not started
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

  const summary = (() => {
    const flat = flatten(MOCK_OUTLINE);
    let done = 0, inP = 0, todo = 0;
    flat.forEach((it) => {
      const s = statuses.get(it.id);
      if (s === "completed") done++;
      else if (s === "in-progress") inP++;
      else todo++;
    });
    return { done, inP, todo, total: flat.length };
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border bg-gradient-to-br from-primary/[0.06] via-primary/[0.02] to-transparent">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-background border border-border/70 flex items-center justify-center shrink-0 shadow-sm">
              <AISparkles className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base font-semibold text-foreground truncate">
                {course.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Started {getMinutesAgoLabel(course.startedAt)} · Generating in the background
              </DialogDescription>
            </div>
            <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tabular-nums">
              <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" focusable="false" />
              {pct}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Mini summary */}
          <div className="mt-3 flex items-center gap-4 text-[11px] font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {summary.done} completed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" /> {summary.inP} in progress
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" /> {summary.todo} not started
            </span>
          </div>
        </DialogHeader>

        {/* Outline */}
        <div className="px-3 py-3 max-h-[55vh] overflow-y-auto thin-scrollbar">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Outline
          </div>
          <div className="space-y-1">
            {MOCK_OUTLINE.map((section) => {
              const sStatus = statuses.get(section.id)!;
              return (
                <div key={section.id} className="rounded-xl border border-border/60 bg-card/60 overflow-hidden">
                  <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                        sStatus === "completed" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                        sStatus === "in-progress" && "bg-primary/10 text-primary",
                        sStatus === "not-started" && "bg-muted text-muted-foreground",
                      )}>
                        <Layers className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                      </div>
                      <span className="text-sm font-semibold text-foreground truncate">
                        {section.title}
                      </span>
                    </div>
                    <StatusBadge status={sStatus} />
                  </div>

                  {section.children && section.children.length > 0 && (
                    <div className="border-t border-border/50 bg-muted/20">
                      {section.children.map((page) => {
                        const pStatus = statuses.get(page.id)!;
                        return (
                          <div
                            key={page.id}
                            className="flex items-center justify-between gap-3 pl-10 pr-3.5 py-2 border-b border-border/40 last:border-b-0"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <ChevronRight className="w-3 h-3 text-muted-foreground/60 shrink-0" aria-hidden="true" focusable="false" />
                              <FileText className={cn(
                                "w-3.5 h-3.5 shrink-0",
                                pStatus === "completed" && "text-emerald-600 dark:text-emerald-400",
                                pStatus === "in-progress" && "text-primary",
                                pStatus === "not-started" && "text-muted-foreground/60",
                              )} aria-hidden="true" focusable="false" />
                              <span className={cn(
                                "text-[13px] truncate",
                                pStatus === "completed" && "text-foreground",
                                pStatus === "in-progress" && "text-foreground font-medium",
                                pStatus === "not-started" && "text-muted-foreground",
                              )}>
                                {page.title}
                              </span>
                            </div>
                            <StatusBadge status={pStatus} />
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
      </DialogContent>
    </Dialog>
  );
}
