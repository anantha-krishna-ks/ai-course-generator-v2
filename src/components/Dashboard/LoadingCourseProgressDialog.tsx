import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Check, Loader2, FileText, LayoutGrid, X, Sparkles, Clock, Zap, ArrowLeft, BarChart3, Type, Image as ImageIcon, ListChecks } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getMinutesAgoLabel, getProgress, type LoadingCourse } from "@/lib/loadingCourses";
import { CourseGenerationAnimation } from "./CourseGenerationAnimation";
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
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  useEffect(() => {
    if (!open) setSelectedPageId(null);
  }, [open]);
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
            <ContentInsightsButton statuses={statuses} />
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
                              const isCompleted = pStatus === "completed";
                              const isSelected = selectedPageId === page.id;
                              const handleOpenPage = () => setSelectedPageId(page.id);
                              return (
                                <div
                                  key={page.id}
                                  role={isCompleted ? "button" : undefined}
                                  tabIndex={isCompleted ? 0 : undefined}
                                  onClick={isCompleted ? handleOpenPage : undefined}
                                  onKeyDown={
                                    isCompleted
                                      ? (e) => {
                                          if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            handleOpenPage();
                                          }
                                        }
                                      : undefined
                                  }
                                  aria-label={isCompleted ? `Preview ${page.title}` : undefined}
                                  aria-pressed={isCompleted ? isSelected : undefined}
                                  className={cn(
                                    "group flex items-center gap-2.5 py-1 pl-2 pr-2.5 rounded-md transition-colors",
                                    pStatus === "in-progress" && !isSelected && "bg-primary/[0.05]",
                                    isSelected && "bg-primary/10 ring-1 ring-primary/30",
                                    isCompleted && !isSelected &&
                                      "cursor-pointer hover:bg-emerald-500/[0.06] focus-visible:bg-emerald-500/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                                  )}
                                >
                                  <StatusNode status={pStatus} kind="page" />
                                  <span className={cn(
                                    "text-[12.5px] truncate flex-1",
                                    pStatus === "completed" && "text-foreground",
                                    pStatus === "in-progress" && "text-foreground font-medium",
                                    pStatus === "not-started" && "text-muted-foreground",
                                    isSelected && "text-primary font-medium",
                                  )}>
                                    {page.title}
                                  </span>
                                  {pStatus === "in-progress" && !isSelected && (
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
          {(() => {
            const selectedPage = selectedPageId ? pages.find((p) => p.id === selectedPageId) : undefined;
            const selectedSection = selectedPage
              ? MOCK_OUTLINE.find((s) => s.children?.some((c) => c.id === selectedPage.id))
              : undefined;
            return (
              <RightPane
                course={course}
                currentPage={currentPage}
                currentSection={currentSection}
                currentPageProgress={currentPageProgress}
                summary={summary}
                selectedPage={selectedPage}
                selectedSection={selectedSection}
                onClearSelection={() => setSelectedPageId(null)}
              />
            );
          })()}
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
  selectedPage,
  selectedSection,
  onClearSelection,
}: {
  course: LoadingCourse;
  currentPage: OutlineItem | undefined;
  currentSection: OutlineItem | undefined;
  currentPageProgress: number;
  summary: { done: number; inP: number; todo: number; total: number };
  selectedPage?: OutlineItem;
  selectedSection?: OutlineItem;
  onClearSelection: () => void;
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

  // Selected completed page preview takes over the right pane
  if (selectedPage) {
    return (
      <CompletedPagePreview
        page={selectedPage}
        section={selectedSection}
        onBack={onClearSelection}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-background to-primary/[0.015] relative overflow-hidden">
      {/* Single subtle ambient glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-primary/[0.05] blur-[120px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative flex-1 flex flex-col items-center justify-center px-10 py-10 max-w-md mx-auto w-full">
        {/* Hero animation */}
        <div className="relative w-[220px] h-[220px] mb-2">
          <CourseGenerationAnimation />
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

// ── Mock generated content per page ──────────────────────────────────────
type QuizQ = { q: string; options: string[]; answerIdx: number; explanation?: string };

type Block =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "callout"; text: string }
  | { kind: "image"; src: string; alt: string; caption?: string }
  | { kind: "video"; src: string; poster?: string; caption?: string }
  | { kind: "audio"; src: string; label: string }
  | { kind: "doc"; name: string; meta?: string }
  | { kind: "quiz"; questions: QuizQ[] };

const PAGE_CONTENT: Record<string, Block[]> = {
  "s1-p1": [
    { kind: "heading", text: "Welcome to the Course" },
    { kind: "paragraph", text: "This course is designed to give you a structured, hands-on path through the subject. Across the next few sections you'll move from foundational ideas to applied practice, building confidence at each step." },
    { kind: "image", src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop", alt: "Workspace with notes and laptop", caption: "A practical, applied approach throughout the course." },
    { kind: "callout", text: "Set aside ~60 minutes for the full course. You can pause and resume anytime." },
    { kind: "list", items: ["Clear, bite-sized lessons", "Real-world examples", "Quick checks for understanding"] },
  ],
  "s1-p2": [
    { kind: "heading", text: "Learning Objectives" },
    { kind: "paragraph", text: "By the end of this course you will be able to:" },
    { kind: "list", items: ["Explain the core concepts in your own words", "Apply key frameworks to realistic scenarios", "Identify common pitfalls and how to avoid them", "Decide which approach fits a given situation"] },
  ],
  "s2-p1": [
    { kind: "heading", text: "Fundamental Principles" },
    { kind: "paragraph", text: "Every discipline rests on a few load-bearing ideas. Here we unpack the principles that the rest of the course will build on, with concrete examples of each in action." },
    { kind: "image", src: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&auto=format&fit=crop", alt: "Whiteboard with concepts" },
    { kind: "callout", text: "Tip: revisit this page whenever a later section feels abstract — the answer is usually a principle from here." },
  ],
  "s2-p2": [
    { kind: "heading", text: "Key Terminology" },
    { kind: "list", items: ["Term A — a precise, working definition", "Term B — how it differs from Term A", "Term C — when to prefer it in practice"] },
    { kind: "paragraph", text: "Shared vocabulary makes the rest of the conversation faster. We'll keep these terms consistent throughout the course." },
  ],
  "s2-p3": [
    { kind: "heading", text: "Practical Applications" },
    { kind: "paragraph", text: "Theory is useful only if it changes what you do. This page walks through three short scenarios where the principles meet day-to-day decisions." },
    { kind: "image", src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop", alt: "Analytics dashboard" },
    { kind: "list", items: ["Scenario 1 — a typical first encounter", "Scenario 2 — a common edge case", "Scenario 3 — a high-stakes variant"] },
  ],
  "s3-p1": [
    { kind: "heading", text: "Case Studies" },
    { kind: "paragraph", text: "Two short case studies — one success, one cautionary — show the principles unfolding in real organizations. Pay attention to the decisions made at each branch point." },
    { kind: "image", src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&auto=format&fit=crop", alt: "Team reviewing a case study" },
  ],
  "s3-p2": [
    { kind: "heading", text: "Best Practices" },
    { kind: "list", items: ["Define success before you begin", "Make decisions traceable", "Review outcomes on a fixed cadence", "Document what you'd do differently"] },
  ],
  "s3-p3": [
    { kind: "heading", text: "Interactive Workshop" },
    { kind: "paragraph", text: "A guided exercise that asks you to apply what you've learned to a fresh, slightly messy scenario. There's no single right answer — only better and worse trade-offs." },
    { kind: "callout", text: "Allow ~15 minutes for the workshop and capture your reasoning as you go." },
  ],
  "s4-p1": [
    { kind: "heading", text: "Course Summary" },
    { kind: "paragraph", text: "A quick recap of the principles, terminology, and practices we've covered, with pointers back to the sections where each idea was introduced." },
    { kind: "list", items: ["Principles you can name and apply", "A shared vocabulary across the course", "A short list of best practices to reuse"] },
  ],
  "s4-p2": [
    { kind: "heading", text: "Final Assessment" },
    { kind: "paragraph", text: "A short assessment to confirm the key takeaways have landed. Review the questions and answers below." },
    {
      kind: "quiz",
      questions: [
        {
          q: "What is the primary purpose of this course?",
          options: ["Entertainment", "Building foundational knowledge and practical skills", "Data entry", "Social networking"],
          answerIdx: 1,
          explanation: "The course is designed to provide in-depth knowledge and practical skills through structured modules.",
        },
        {
          q: "Case studies help reinforce theoretical concepts with real-world examples.",
          options: ["True", "False"],
          answerIdx: 0,
          explanation: "Case studies bridge the gap between theory and practice by examining real-world scenarios.",
        },
        {
          q: "Which is a best practice we covered?",
          options: ["Skip planning to move faster", "Make decisions traceable", "Avoid documenting outcomes", "Decide alone for speed"],
          answerIdx: 1,
        },
      ],
    },
  ],
};

function CompletedPagePreview({
  page,
  section,
  onBack,
}: {
  page: OutlineItem;
  section?: OutlineItem;
  onBack: () => void;
}) {
  const blocks = PAGE_CONTENT[page.id] ?? [
    { kind: "paragraph", text: "This page has been generated. Detailed preview will appear here." },
  ];

  return (
    <div className="flex-1 flex flex-col bg-background min-w-0">
      {/* Sub-header */}
      <div className="flex items-center justify-between gap-3 px-6 py-3 border-b border-border bg-card/60 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md px-2 py-1 -ml-2 hover:bg-muted"
            aria-label="Back to live progress"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
            Back to progress
          </button>
          <span className="w-px h-4 bg-border" aria-hidden="true" />
          <div className="min-w-0 flex items-center gap-2 text-[12px] text-muted-foreground truncate">
            {section && <span className="truncate">{section.title}</span>}
            <span aria-hidden="true">/</span>
            <span className="text-foreground font-medium truncate">{page.title}</span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold shrink-0">
          <Check className="w-3 h-3" strokeWidth={3} aria-hidden="true" focusable="false" />
          Generated · view only
        </span>
      </div>

      {/* Page body */}
      <div className="flex-1 overflow-y-auto thin-scrollbar">
        <article className="max-w-2xl mx-auto px-8 py-10">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary mb-2">
            {section?.title ?? "Page preview"}
          </div>
          <h1 className="text-[26px] font-semibold tracking-tight text-foreground leading-tight mb-6">
            {page.title}
          </h1>

          <div className="space-y-6">
            {blocks.map((b, i) => (
              <PreviewBlock key={i} block={b} />
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}

function PreviewBlock({ block: b }: { block: Block }) {
  if (b.kind === "heading") {
    return (
      <h2 className="text-[18px] font-semibold tracking-tight text-foreground mt-2">{b.text}</h2>
    );
  }
  if (b.kind === "paragraph") {
    return (
      <p className="text-[14.5px] leading-relaxed text-foreground/85 [overflow-wrap:anywhere]">
        {b.text}
      </p>
    );
  }
  if (b.kind === "list") {
    return (
      <ul className="list-disc pl-5 space-y-1.5 text-[14.5px] leading-relaxed text-foreground/85">
        {b.items.map((it, j) => (
          <li key={j}>{it}</li>
        ))}
      </ul>
    );
  }
  if (b.kind === "callout") {
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-primary/15 bg-primary/[0.06] px-4 py-3">
        <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" aria-hidden="true" focusable="false" />
        <p className="text-[13.5px] leading-relaxed text-foreground">{b.text}</p>
      </div>
    );
  }
  if (b.kind === "image") {
    return (
      <figure className="rounded-xl overflow-hidden border border-border bg-muted">
        <img src={b.src} alt={b.alt} className="w-full h-auto block" loading="lazy" />
        {b.caption && (
          <figcaption className="px-3 py-2 text-[12px] text-muted-foreground bg-card border-t border-border">
            {b.caption}
          </figcaption>
        )}
      </figure>
    );
  }
  if (b.kind === "video") {
    return (
      <figure className="rounded-xl overflow-hidden border border-border bg-black">
        <video
          src={b.src}
          poster={b.poster}
          controls
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          className="w-full h-auto block bg-black"
        />
        {b.caption && (
          <figcaption className="px-3 py-2 text-[12px] text-muted-foreground bg-card border-t border-border">
            {b.caption}
          </figcaption>
        )}
      </figure>
    );
  }
  if (b.kind === "audio") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
        <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0">
          <Zap className="w-4 h-4" aria-hidden="true" focusable="false" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12.5px] font-medium text-foreground truncate">{b.label}</div>
          <audio src={b.src} controls className="mt-1.5 w-full h-8" />
        </div>
      </div>
    );
  }
  if (b.kind === "doc") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
        <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-foreground/[0.06] text-foreground shrink-0">
          <FileText className="w-4 h-4" aria-hidden="true" focusable="false" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-foreground truncate">{b.name}</div>
          {b.meta && <div className="text-[11.5px] text-muted-foreground truncate">{b.meta}</div>}
        </div>
      </div>
    );
  }
  // quiz
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-primary/10 text-primary">
          <Sparkles className="w-3 h-3" aria-hidden="true" focusable="false" />
        </span>
        Quiz preview
      </div>
      <ol className="space-y-5">
        {b.questions.map((q, qi) => (
          <li key={qi} className="space-y-2">
            <div className="text-[14px] font-medium text-foreground leading-snug">
              <span className="text-muted-foreground tabular-nums mr-1.5">{qi + 1}.</span>
              {q.q}
            </div>
            <ul className="space-y-1.5">
              {q.options.map((opt, oi) => {
                const correct = oi === q.answerIdx;
                return (
                  <li
                    key={oi}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg border text-[13px]",
                      correct
                        ? "border-emerald-500/30 bg-emerald-500/[0.06] text-foreground"
                        : "border-border bg-background text-foreground/80"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex items-center justify-center w-4 h-4 rounded-full border shrink-0",
                        correct
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-border bg-card"
                      )}
                      aria-hidden="true"
                    >
                      {correct && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {correct && (
                      <span className="text-[10.5px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Correct
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            {q.explanation && (
              <p className="text-[12.5px] text-muted-foreground leading-relaxed pl-1">
                <span className="font-semibold text-foreground/80">Why: </span>
                {q.explanation}
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

// ── Content insights popover ─────────────────────────────────────────────
function countContent(statuses: Map<string, Status>) {
  let text = 0;
  let images = 0;
  let quizzes = 0;
  let quizQuestions = 0;
  let pagesWithContent = 0;
  let totalText = 0;
  let totalImages = 0;
  let totalQuizzes = 0;
  let totalQuizQuestions = 0;

  for (const [pageId, blocks] of Object.entries(PAGE_CONTENT)) {
    const isCompleted = statuses.get(pageId) === "completed";
    if (isCompleted) pagesWithContent += 1;
    for (const b of blocks) {
      const isText =
        b.kind === "heading" || b.kind === "paragraph" || b.kind === "list" || b.kind === "callout";
      if (isText) {
        totalText += 1;
        if (isCompleted) text += 1;
      } else if (b.kind === "image") {
        totalImages += 1;
        if (isCompleted) images += 1;
      } else if (b.kind === "quiz") {
        totalQuizzes += 1;
        totalQuizQuestions += b.questions.length;
        if (isCompleted) {
          quizzes += 1;
          quizQuestions += b.questions.length;
        }
      }
    }
  }
  return {
    text,
    images,
    quizzes,
    quizQuestions,
    pagesWithContent,
    totalText,
    totalImages,
    totalQuizzes,
    totalQuizQuestions,
  };
}

function ContentInsightsButton({ statuses }: { statuses: Map<string, Status> }) {
  const counts = countContent(statuses);
  const total = counts.text + counts.images + counts.quizzes;
  const totalPages = Array.from(statuses.values()).filter((s) => s !== undefined).length;
  const completedPages = Array.from(statuses.values()).filter((s) => s === "completed").length;

  const items = [
    {
      key: "text",
      label: "Text blocks",
      hint: "Headings, paragraphs, lists & callouts",
      value: counts.text,
      Icon: Type,
      tone: "text-primary",
      bg: "bg-primary/10",
    },
    {
      key: "images",
      label: "Images",
      hint: "Visual blocks across all pages",
      value: counts.images,
      Icon: ImageIcon,
      tone: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      key: "quizzes",
      label: "Quizzes",
      hint: `${counts.quizQuestions} question${counts.quizQuestions === 1 ? "" : "s"} total`,
      value: counts.quizzes,
      Icon: ListChecks,
      tone: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-border bg-background hover:bg-muted text-foreground text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label="View content insights"
        >
          <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" focusable="false" />
          Content insights
          {total > 0 && (
            <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary/10 text-primary text-[10.5px] font-semibold tabular-nums">
              {total}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[320px] p-0 overflow-hidden rounded-xl border-border shadow-lg"
      >
        <div className="px-4 pt-3.5 pb-3 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] font-semibold text-foreground">Content insights</div>
              <div className="text-[11.5px] text-muted-foreground tabular-nums">
                <span className="font-medium text-foreground">{completedPages}</span>
                <span className="mx-0.5">/</span>
                <span>{totalPages}</span>
                <span className="ml-1">page{totalPages === 1 ? "" : "s"} generated</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[18px] font-semibold text-foreground tabular-nums leading-none">
                {total}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                blocks
              </div>
            </div>
          </div>
        </div>

        <ul className="p-2 space-y-1">
          {items.map(({ key, label, hint, value, Icon, tone, bg }) => (
            <li
              key={key}
              className="flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-muted/60 transition-colors"
            >
              <span
                className={cn("inline-flex items-center justify-center w-9 h-9 rounded-lg shrink-0", bg)}
                aria-hidden="true"
              >
                <Icon className={cn("w-4 h-4", tone)} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-foreground">{label}</div>
                <div className="text-[11.5px] text-muted-foreground truncate">{hint}</div>
              </div>
              <span className="text-[16px] font-semibold text-foreground tabular-nums">
                {value}
              </span>
            </li>
          ))}
        </ul>

        {counts.pagesWithContent === 0 && (
          <div className="px-4 py-3 text-[11.5px] text-muted-foreground border-t border-border bg-muted/20">
            Counts will appear here as pages finish generating.
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
