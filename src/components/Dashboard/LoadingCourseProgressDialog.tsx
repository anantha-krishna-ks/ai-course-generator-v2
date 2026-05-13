import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Check, Loader2, FileText, LayoutGrid, X, Sparkles, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMinutesAgoLabel, getProgress, type LoadingCourse } from "@/lib/loadingCourses";
import Lottie from "lottie-react";
import courseCreationAnimation from "@/assets/course-creation-lottie.json";
import { useEffect, useState } from "react";

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

function StatusNode({ status, kind }: { status: Status; kind: "section" | "page" }) {
  const size = kind === "section" ? "w-5 h-5" : "w-3.5 h-3.5";
  const ring = kind === "section" ? "ring-4" : "ring-[3px]";
  if (status === "completed") {
    return (
      <span
        className={cn(
          "relative inline-flex items-center justify-center rounded-full bg-emerald-500 text-white shrink-0 shadow-[0_0_0_2px_hsl(var(--background))]",
          size
        )}
        aria-label="Completed"
      >
        <Check className={cn(kind === "section" ? "w-3 h-3" : "w-2.5 h-2.5")} aria-hidden="true" focusable="false" strokeWidth={3.5} />
      </span>
    );
  }
  if (status === "in-progress") {
    return (
      <span
        className={cn(
          "relative inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0 shadow-[0_0_0_2px_hsl(var(--background))]",
          size,
          ring,
          "ring-primary/15"
        )}
        aria-label="In progress"
      >
        <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-40" aria-hidden="true" />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center rounded-full bg-background border-2 border-border shrink-0",
        size
      )}
      aria-label="Not started"
    />
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

  // Per-page progress for the page currently being generated
  const sliceSize = 100 / pages.length;
  const currentPageProgress = currentPage
    ? Math.min(100, Math.max(0, ((pct - summary.done * sliceSize) / sliceSize) * 100))
    : 0;
  const currentSection = currentPage
    ? MOCK_OUTLINE.find((s) => s.children?.some((c) => c.id === currentPage.id))
    : undefined;

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

            {/* Outline list — timeline rail */}
            <div className="flex-1 overflow-y-auto px-4 py-5 thin-scrollbar">
              <div className="relative">
                {/* Vertical rail */}
                <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" aria-hidden="true" />

                <div className="space-y-5">
                  {MOCK_OUTLINE.map((section) => {
                    const sStatus = statuses.get(section.id)!;
                    return (
                      <div key={section.id} className="relative">
                        {/* Section row */}
                        <div className="flex items-center gap-3 relative">
                          <div className="relative z-10 flex items-center justify-center w-[22px]">
                            <StatusNode status={sStatus} kind="section" />
                          </div>
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className={cn(
                              "text-[13px] font-semibold truncate",
                              sStatus === "completed" && "text-foreground",
                              sStatus === "in-progress" && "text-foreground",
                              sStatus === "not-started" && "text-muted-foreground",
                            )}>
                              {section.title}
                            </span>
                            {sStatus === "in-progress" && (
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                                · Working
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Pages */}
                        {section.children && (
                          <div className="mt-2.5 space-y-1.5 pl-[34px]">
                            {section.children.map((page) => {
                              const pStatus = statuses.get(page.id)!;
                              return (
                                <div
                                  key={page.id}
                                  className={cn(
                                    "group flex items-center gap-2.5 py-1 pl-2 pr-2.5 rounded-md transition-colors",
                                    pStatus === "in-progress" && "bg-primary/[0.05]"
                                  )}
                                >
                                  <StatusNode status={pStatus} kind="page" />
                                  <span className={cn(
                                    "text-[12.5px] truncate flex-1",
                                    pStatus === "completed" && "text-foreground/80 line-through decoration-emerald-500/40 decoration-[1.5px]",
                                    pStatus === "in-progress" && "text-foreground font-medium",
                                    pStatus === "not-started" && "text-muted-foreground",
                                  )}>
                                    {page.title}
                                  </span>
                                  {pStatus === "in-progress" && (
                                    <Loader2 className="w-3 h-3 text-primary animate-spin shrink-0" aria-hidden="true" focusable="false" />
                                  )}
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
            </div>
          </div>

          {/* Right pane — Lottie + live page status */}
          <RightPane
            course={course}
            currentPage={currentPage}
            currentSection={currentSection}
            currentPageProgress={currentPageProgress}
            summary={summary}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RightPane({
  course,
  currentPage,
  currentSection,
  currentPageProgress,
  summary,
}: {
  course: LoadingCourse;
  currentPage: OutlineItem | undefined;
  currentSection: OutlineItem | undefined;
  currentPageProgress: number;
  summary: { done: number; inP: number; todo: number; total: number };
}) {
  // Rotating "thinking" messages for personality
  const messages = [
    "Drafting page content…",
    "Composing learning blocks…",
    "Selecting visuals…",
    "Refining tone of voice…",
    "Polishing transitions…",
  ];
  const [msgIdx, setMsgIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setMsgIdx((i) => (i + 1) % messages.length), 2400);
    return () => clearInterval(id);
  }, [messages.length]);

  const remainingMs = Math.max(0, course.durationMs - (Date.now() - course.startedAt));
  const remainingMin = Math.ceil(remainingMs / 60000);

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-background to-primary/[0.015] relative overflow-hidden">
      {/* Single subtle ambient glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-primary/[0.05] blur-[120px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative flex-1 flex flex-col items-center justify-center px-10 py-10 max-w-md mx-auto w-full">
        {/* Lottie hero */}
        <div className="relative w-[200px] h-[200px] mb-2">
          <Lottie
            animationData={courseCreationAnimation}
            loop
            autoplay
            className="relative w-full h-full"
            aria-hidden="true"
          />
        </div>

        {/* Course title */}
        <h2 className="text-[15px] font-medium text-muted-foreground tracking-tight text-center mb-8">
          {course.title}
        </h2>

        {/* Current page card — the focus */}
        {currentPage ? (
          <div className="w-full rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-5 shadow-[0_8px_30px_-12px_hsl(var(--primary)/0.15)]">
            {/* Section breadcrumb */}
            {currentSection && (
              <div className="text-[11px] font-medium text-muted-foreground mb-1.5 truncate">
                {currentSection.title}
              </div>
            )}

            {/* Page title */}
            <div className="flex items-start gap-2.5 mb-1">
              <h3 className="text-[17px] font-semibold tracking-tight text-foreground leading-snug flex-1 min-w-0">
                {currentPage.title}
              </h3>
            </div>

            {/* Rotating activity message */}
            <div
              key={msgIdx}
              className="text-[13px] text-muted-foreground animate-fade-in flex items-center gap-1.5 mb-5"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" focusable="false" />
              <span className="truncate">{messages[msgIdx]}</span>
            </div>

            {/* Per-page progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Generating page
                </span>
                <span className="text-[12px] font-semibold text-foreground tabular-nums">
                  {Math.round(currentPageProgress)}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden relative">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700 relative"
                  style={{ width: `${currentPageProgress}%` }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,hsl(var(--background)/0.5)_50%,transparent_100%)] animate-[shimmer_2s_linear_infinite]" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 text-white mb-2">
              <Check className="w-5 h-5" strokeWidth={3} aria-hidden="true" focusable="false" />
            </div>
            <div className="text-[15px] font-semibold text-foreground">All pages generated</div>
            <div className="text-[12px] text-muted-foreground mt-0.5">Wrapping things up…</div>
          </div>
        )}

        {/* Footer hint */}
        <div className="mt-6 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3 h-3" aria-hidden="true" focusable="false" />
            Started {getMinutesAgoLabel(course.startedAt)}
          </span>
          <span className="w-px h-3 bg-border" aria-hidden="true" />
          <span className="inline-flex items-center gap-1.5">
            <Zap className="w-3 h-3" aria-hidden="true" focusable="false" />
            ~{remainingMin} min remaining
          </span>
          <span className="w-px h-3 bg-border" aria-hidden="true" />
          <span className="tabular-nums">
            {summary.done}/{summary.total} pages
          </span>
        </div>
      </div>
    </div>
  );
}
