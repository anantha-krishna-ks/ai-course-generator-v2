import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, MessageSquarePlus, CheckCircle2, Circle, Send, X, Pencil, Trash2, Info, ShieldCheck, PenLine, Eye, BookOpen, LayoutPanelTop, FileCheck2, Scale, Target, Tag, CornerUpRight } from "lucide-react";
import { dispatchCommentNavigate } from "@/lib/commentNavigation";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  addComment,
  addReply,
  getCommentsForBlock,
  getCommentsForBlocks,
  subscribe,
  toggleResolved,
  deleteComment,
  updateComment,
  deleteReply,
  updateReply,
  REVIEW_CATEGORIES,
  type ReviewCategory,
  type ReviewComment,
} from "@/services/reviewCommentsStore";


interface Props {
  courseId: string;
  blockId: string;
  /** Optional human label shown in notifications, e.g. "Section 1 · Page · Text". */
  label?: string;
  /** Optional course title (used for notifications when reviewer posts). */
  courseTitle?: string;
  /** Override visual variant. Defaults to "floating" (absolute, top-left of parent). */
  variant?: "floating" | "inline";
  /**
   * Read-only summary mode for page/section level.
   * Hides the add-comment composer entirely and renders nothing when there
   * are no comments. When comments exist, shows a compact summary chip
   * (count + unresolved status + last activity) that opens a view-only thread.
   */
  readOnly?: boolean;
  /**
   * In readOnly mode, additional block IDs to aggregate into this chip's
   * count (e.g. a section chip aggregates all its pages and their blocks).
   * The component's own `blockId` is always included.
   */
  aggregateBlockIds?: string[];
}

const REVIEWER_NAME = "Priya Iyer";
const AUTHOR_NAME = "You";

function formatRelative(ts: number): string {
  if (!ts) return "just now";
  const diff = Date.now() - ts;
  const sec = Math.max(1, Math.floor(diff / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(ts).toLocaleDateString();
}

function SummaryStat({ label, value, tone = "muted" }: { label: string; value: string; tone?: "muted" | "primary" | "emerald" }) {
  const toneClass =
    tone === "primary"
      ? "text-primary"
      : tone === "emerald"
        ? "text-emerald-600"
        : "text-foreground";
  return (
    <div className="flex flex-col items-center justify-center py-1">
      <span className={cn("text-sm font-semibold tabular-nums", toneClass)}>{value}</span>
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
    </div>
  );
}

function ShowResolvedToggle({ showResolved, resolvedCount, onToggle }: { showResolved: boolean; resolvedCount: number; onToggle: () => void }) {
  return (
    <div className="px-4 py-2 border-b border-border bg-muted/40 flex items-center justify-between">
      <span className="text-[11px] font-medium text-muted-foreground">
        {resolvedCount} resolved {resolvedCount === 1 ? "comment" : "comments"} {showResolved ? "shown" : "hidden"}
      </span>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={showResolved}
        className={cn(
          "inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11px] font-semibold border transition-colors",
          showResolved
            ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
            : "bg-card border-border text-foreground hover:bg-muted",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        )}
      >
        {showResolved ? <Eye className="w-3 h-3" aria-hidden="true" /> : <CheckCircle2 className="w-3 h-3" aria-hidden="true" />}
        {showResolved ? "Hide resolved" : "Show resolved"}
      </button>
    </div>
  );
}

interface TimelineListProps {
  comments: ReviewComment[];
  resolvedShown: boolean;
  renderRow: (c: ReviewComment) => React.ReactNode;
}

function TimelineList({ comments, resolvedShown, renderRow }: TimelineListProps) {
  const open = comments.filter((c) => !c.resolved);
  const resolved = comments.filter((c) => c.resolved);
  const showResolvedSection = resolvedShown && resolved.length > 0;

  const Rail = ({ children, dimmed = false }: { children: React.ReactNode; dimmed?: boolean }) => (
    <ul
      className={cn(
        "relative",
        // vertical rail at avatar center (px-3 padding + 16px to avatar center = 28px)
        "before:content-[''] before:absolute before:top-4 before:bottom-4 before:left-[28px] before:w-px before:bg-border",
        dimmed && "opacity-75",
      )}
    >
      {children}
    </ul>
  );

  return (
    <div>
      {open.length > 0 && <Rail>{open.map(renderRow)}</Rail>}

      {showResolvedSection && (
        <>
          {open.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 mt-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" aria-hidden="true" focusable="false" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Resolved · {resolved.length}
              </span>
              <div className="h-px flex-1 bg-border" aria-hidden="true" />
            </div>
          )}
          <Rail dimmed>{resolved.map(renderRow)}</Rail>
        </>
      )}
    </div>
  );
}

export function BlockCommentIndicator({ courseId, blockId, label, courseTitle, variant = "floating", readOnly = false, aggregateBlockIds }: Props) {
  const location = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const isReviewer = location.pathname.startsWith("/review-course");
  const resolvedCourseId = courseId || (params.courseId as string | undefined) || "";

  const aggregateKey = (aggregateBlockIds || []).join("|");
  const effectiveIds = useMemo(
    () => (aggregateBlockIds && aggregateBlockIds.length
      ? Array.from(new Set([blockId, ...aggregateBlockIds]))
      : [blockId]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [blockId, aggregateKey],
  );
  const isAggregated = effectiveIds.length > 1;

  const loadComments = () => (isAggregated
    ? getCommentsForBlocks(resolvedCourseId, effectiveIds)
    : getCommentsForBlock(resolvedCourseId, blockId));

  const [comments, setComments] = useState<ReviewComment[]>(() => loadComments());
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [category, setCategory] = useState<ReviewCategory | "">("");
  const [showResolved, setShowResolved] = useState(false);
  const visibleComments = useMemo(
    () => (showResolved ? comments : comments.filter((c) => !c.resolved)),
    [comments, showResolved],
  );
  const resolvedCount = comments.length - comments.filter((c) => !c.resolved).length;

  useEffect(() => {
    const refresh = () => setComments(loadComments());
    refresh();
    const unsub = subscribe(refresh);
    return () => { unsub(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedCourseId, blockId, aggregateKey]);

  const total = comments.length;
  const unresolved = comments.filter((c) => !c.resolved).length;
  const allResolved = total > 0 && unresolved === 0;
  const threadTitle = useMemo(() => label ?? comments[0]?.blockLabel ?? "", [label, comments]);

  // Always show indicator (for both reviewer and author) so threads are reachable everywhere.

  const submitNew = () => {
    const t = draft.trim();
    if (!t) return;
    if (isReviewer && !category) return;
    addComment({
      courseId: resolvedCourseId,
      courseTitle: courseTitle || threadTitle || "Course",
      blockId,
      blockLabel: label || threadTitle || blockId,
      author: isReviewer ? REVIEWER_NAME : AUTHOR_NAME,
      text: t,
      category: isReviewer ? (category as ReviewCategory) : undefined,
    });
    setDraft("");
    setCategory("");
    toast({ title: "Comment posted", description: isReviewer ? "The author will be notified." : "Visible to the reviewer." });
  };


  const triggerClasses = variant === "floating"
    ? "absolute z-20 top-2 -right-3 sm:-right-4"
    : "relative";

  const bgClass = total === 0
    ? "bg-card border-border text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5"
    : allResolved
      ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
      : "bg-primary text-primary-foreground border-primary/40 hover:bg-primary/90";

  const tooltipLabel = total === 0
    ? (isReviewer ? "Add comment" : "Add comment")
    : allResolved
      ? `${total} resolved comment${total > 1 ? "s" : ""}`
      : `${unresolved} unresolved comment${unresolved > 1 ? "s" : ""}`;

  // Read-only summary chip (used at page/section level — no add-comment composer).
  if (readOnly) {
    const lastActivity = comments.reduce<number>((acc, c) => {
      const replyMax = c.replies.reduce((a, r) => Math.max(a, new Date(r.createdAt).getTime()), 0);
      return Math.max(acc, new Date(c.createdAt).getTime(), replyMax);
    }, 0);
    const relative = lastActivity ? formatRelative(lastActivity) : "";
    const summaryLabel = total === 0
      ? "No comments yet"
      : allResolved
        ? `${total} comment${total > 1 ? "s" : ""} · all resolved · updated ${relative}`
        : `${unresolved} unresolved of ${total} · updated ${relative}`;
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label={summaryLabel}
                  onClick={() => {
                    if (comments.length > 0) {
                      const target = comments.find((c) => !c.resolved) ?? comments[0];
                      dispatchCommentNavigate(target.blockId);
                    }
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 h-6 px-2 rounded-full border text-[11px] font-medium tabular-nums transition-colors shrink-0",
                    total === 0
                      ? "bg-muted/60 border-border text-muted-foreground hover:bg-muted"
                      : allResolved
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                        : "bg-primary/10 border-primary/30 text-primary hover:bg-primary/15",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  )}
                >
                  {total === 0 ? (
                    <MessageSquare className="w-3 h-3 opacity-70" aria-hidden="true" focusable="false" />
                  ) : allResolved ? (
                    <CheckCircle2 className="w-3 h-3" aria-hidden="true" focusable="false" />
                  ) : (
                    <MessageSquare className="w-3 h-3" aria-hidden="true" focusable="false" />
                  )}
                  <span>{total === 0 ? "0" : allResolved ? total : `${unresolved}/${total}`}</span>
                  {relative && (
                    <>
                      <span className="opacity-60">·</span>
                      <span className="opacity-80">{relative}</span>
                    </>
                  )}
                </button>
              </PopoverTrigger>
            </TooltipTrigger>
            {!open && (
              <TooltipContent side="top" className="text-xs">
                {summaryLabel}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        <PopoverContent
          side="bottom"
          align="start"
          sideOffset={8}
          data-review-comment-thread="true"
          className="w-[360px] p-0 rounded-2xl border border-border shadow-xl z-[60]"
        >
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-foreground">Comments</h4>
              <p className="text-[11px] text-muted-foreground truncate">{threadTitle || "Thread summary"}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="px-4 py-2 border-b border-border bg-muted/30 grid grid-cols-3 gap-2 text-center">
            <SummaryStat label="Total" value={String(total)} />
            <SummaryStat label="Open" value={String(unresolved)} tone={unresolved > 0 ? "primary" : "muted"} />
            <SummaryStat label="Resolved" value={String(total - unresolved)} tone="emerald" />
          </div>
          {total === 0 ? (
            <div className="px-4 py-6 text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-muted flex items-center justify-center mb-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" aria-hidden="true" focusable="false" />
              </div>
              <p className="text-xs text-muted-foreground">No comments yet at this level.</p>
            </div>
          ) : (
            <>
              {resolvedCount > 0 && (
                <ShowResolvedToggle
                  showResolved={showResolved}
                  resolvedCount={resolvedCount}
                  onToggle={() => setShowResolved((v) => !v)}
                />
              )}
              <div className="max-h-[55vh] overflow-y-auto overscroll-contain thin-scrollbar bg-muted/20 p-3 space-y-2.5">
                {visibleComments.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">All comments are resolved. Toggle "Show resolved" to view them.</p>
                ) : (
                  visibleComments.map((c) => (
                    <div key={c.id} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                      <CommentRow
                        comment={c}
                        courseTitle={courseTitle || threadTitle}
                        authorName={isReviewer ? REVIEWER_NAME : AUTHOR_NAME}
                        authorRole={isReviewer ? "reviewer" : "author"}
                        onJumpToBlock={(blockId) => {
                          dispatchCommentNavigate(blockId);
                          setOpen(false);
                        }}
                      />
                    </div>
                  ))
                )}
              </div>
            </>
          )}
          <div className="px-4 py-2 border-t border-border text-[11px] text-muted-foreground">
            Open the block to add or reply to comments.
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                aria-label={
                  total === 0
                    ? "Add reviewer comment"
                    : `${unresolved > 0 ? `${unresolved} unresolved` : `${total}`} reviewer comment${total > 1 ? "s" : ""}`
                }
                className={cn(
                  triggerClasses,
                  "inline-flex items-center justify-center w-9 h-9 rounded-full shadow-md border backdrop-blur-sm transition-colors",
                  bgClass,
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                )}
              >
                {total === 0 ? (
                  <MessageSquarePlus className="w-[18px] h-[18px]" aria-hidden="true" focusable="false" />
                ) : allResolved ? (
                  <CheckCircle2 className="w-[18px] h-[18px]" aria-hidden="true" focusable="false" />
                ) : (
                  <MessageSquare className="w-[18px] h-[18px]" aria-hidden="true" focusable="false" />
                )}
                {total > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-background border border-border text-[10px] font-bold tabular-nums leading-none text-foreground flex items-center justify-center shadow-sm">
                    {unresolved > 0 ? unresolved : total}
                  </span>
                )}
                <AnimatePresence>
                  {total > 0 && !allResolved && !open && (
                    <motion.span
                      key="pulse"
                      initial={{ opacity: 0.5, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.6 }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                      className="absolute inset-0 rounded-full bg-primary/40"
                      aria-hidden="true"
                    />
                  )}
                </AnimatePresence>
              </motion.button>
            </PopoverTrigger>
          </TooltipTrigger>
          {!open && (
            <TooltipContent side="top" className="text-xs">
              {tooltipLabel}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      <PopoverContent
        side={variant === "floating" ? "left" : "bottom"}
        align="start"
        sideOffset={10}
        data-review-comment-thread="true"
        className="w-[360px] p-0 rounded-2xl border border-border shadow-xl z-[60]"
      >
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-foreground">{isReviewer ? "Reviewer comments" : "Comments"}</h4>
            <p className="text-[11px] text-muted-foreground truncate">{threadTitle || "Add a comment for the author"}</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {total === 0 ? (
          <div className="px-4 py-6 text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <MessageSquarePlus className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
            </div>
            <p className="text-xs text-muted-foreground">No comments yet on this {label?.toLowerCase().includes("section") ? "section" : label?.toLowerCase().includes("page") ? "page" : "block"}.</p>
          </div>
        ) : (
          <>
            {resolvedCount > 0 && (
              <ShowResolvedToggle
                showResolved={showResolved}
                resolvedCount={resolvedCount}
                onToggle={() => setShowResolved((v) => !v)}
              />
            )}
            <div className="max-h-[50vh] overflow-y-auto overscroll-contain thin-scrollbar bg-muted/20 p-3 space-y-2.5">
              {visibleComments.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">All comments are resolved. Toggle "Show resolved" to view them.</p>
              ) : (
                visibleComments.map((c) => (
                  <div key={c.id} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                    <CommentRow
                      comment={c}
                      courseTitle={courseTitle || threadTitle}
                      authorName={isReviewer ? REVIEWER_NAME : AUTHOR_NAME}
                      authorRole={isReviewer ? "reviewer" : "author"}
                    />
                  </div>
                ))
              )}
            </div>
          </>
        )}

        <div className="border-t border-border p-3 space-y-2">
          {isReviewer && (
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground" htmlFor={`cat-${blockId}`}>
                Category <span className="text-destructive">*</span>
              </label>
              <Select value={category} onValueChange={(v) => setCategory(v as ReviewCategory)}>
                <SelectTrigger id={`cat-${blockId}`} aria-label="Comment category" className="h-9 rounded-xl text-sm">
                  <SelectValue placeholder="Select a category first…" />
                </SelectTrigger>
                <SelectContent className="z-[70]">
                  {REVIEW_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={
              isReviewer
                ? category
                  ? "Write a comment for the author…"
                  : "Select a category to enable commenting…"
                : "Write a comment…"
            }
            rows={2}
            disabled={isReviewer && !category}
            className="text-sm rounded-xl resize-none"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={submitNew}
              disabled={!draft.trim() || (isReviewer && !category)}
              className="rounded-full"
            >
              <Send className="w-3.5 h-3.5 mr-1" aria-hidden="true" focusable="false" />
              Post comment
            </Button>
          </div>
        </div>

      </PopoverContent>
    </Popover>
  );
}

const CATEGORY_META: Record<string, { dot: string; text: string; bg: string; border: string }> = {
  "Clarity & Readability":      { dot: "bg-sky-500",     text: "text-sky-700",     bg: "bg-sky-50",     border: "border-sky-200" },
  "Structure & Presentation":   { dot: "bg-indigo-500",  text: "text-indigo-700",  bg: "bg-indigo-50",  border: "border-indigo-200" },
  "Accuracy & Completeness":    { dot: "bg-amber-500",   text: "text-amber-800",   bg: "bg-amber-50",   border: "border-amber-200" },
  "Consistency & Standards":    { dot: "bg-fuchsia-500", text: "text-fuchsia-700", bg: "bg-fuchsia-50", border: "border-fuchsia-200" },
  "Relevance & Actionability":  { dot: "bg-rose-500",    text: "text-rose-700",    bg: "bg-rose-50",    border: "border-rose-200" },
};

function RoleBadge({ role }: { role: "author" | "reviewer" }) {
  const isAuthor = role === "author";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 h-[20px] px-2 rounded-full text-[10px] font-semibold tracking-wide border",
        isAuthor
          ? "bg-primary/8 text-primary border-primary/20"
          : "bg-violet-50 text-violet-700 border-violet-200",
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          isAuthor ? "bg-primary" : "bg-violet-500",
        )}
        aria-hidden="true"
      />
      {isAuthor ? "Author" : "Reviewer"}
    </span>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const meta = CATEGORY_META[category] ?? { dot: "bg-muted-foreground", text: "text-foreground", bg: "bg-muted", border: "border-border" };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 h-[20px] px-2 rounded-full text-[10px] font-medium border",
        meta.bg, meta.text, meta.border,
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", meta.dot)} aria-hidden="true" />
      <span className="truncate max-w-[180px]">{category}</span>
    </span>
  );
}

function ResolvedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 h-[20px] px-2 rounded-full text-[10px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
      Resolved
    </span>
  );
}

const RESOLVED_TIP = "Mark as resolved after you've addressed this feedback. Resolved threads are hidden from the open list and signal to the reviewer that no further action is needed.";

function OwnerActions({ onEdit, onDelete, label }: { onEdit: () => void; onDelete: () => void; label: string }) {
  return (
    <div className="inline-flex items-center gap-0.5 shrink-0">
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${label}`}
        className="w-6 h-6 rounded-full text-muted-foreground hover:text-primary hover:bg-muted flex items-center justify-center"
      >
        <Pencil className="w-3 h-3" aria-hidden="true" focusable="false" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Delete ${label}`}
        className="w-6 h-6 rounded-full text-muted-foreground hover:text-destructive hover:bg-muted flex items-center justify-center"
      >
        <Trash2 className="w-3 h-3" aria-hidden="true" focusable="false" />
      </button>
    </div>
  );
}

function CommentRow({ comment, courseTitle, authorName, authorRole, onJumpToBlock }: { comment: ReviewComment; courseTitle: string; authorName: string; authorRole: "reviewer" | "author"; onJumpToBlock?: (blockId: string) => void }) {
  const [reply, setReply] = useState("");
  const [markResolved, setMarkResolved] = useState(false);
  const isAuthorView = authorRole === "author";

  const [editingComment, setEditingComment] = useState(false);
  const [commentDraft, setCommentDraft] = useState(comment.text);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [confirm, setConfirm] = useState<null | { kind: "comment" } | { kind: "reply"; id: string }>(null);

  const canEditComment = comment.author === authorName;

  const submit = () => {
    const t = reply.trim();
    if (!t) return;
    addReply({
      commentId: comment.id,
      courseTitle,
      author: authorName,
      authorRole,
      text: t,
    });
    if (isAuthorView && markResolved && !comment.resolved) {
      toggleResolved(comment.id);
    }
    setReply("");
    setMarkResolved(false);
  };

  const saveCommentEdit = () => {
    const t = commentDraft.trim();
    if (!t) return;
    updateComment(comment.id, t);
    setEditingComment(false);
  };

  const saveReplyEdit = (replyId: string) => {
    const t = replyDraft.trim();
    if (!t) return;
    updateReply(comment.id, replyId, t);
    setEditingReplyId(null);
  };

  return (
    <li className={cn("group/comment relative px-3 py-3", comment.resolved && "opacity-90")}>
      {/* Header: avatar + identity */}
      <div className="flex items-start gap-2.5">
        <div className={cn(
          "w-8 h-8 rounded-full text-[11px] font-semibold flex items-center justify-center shrink-0 relative z-10 ring-4 ring-popover",
          comment.authorRole === "author" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary",
        )}>
          {comment.author.slice(0, 1).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[13px] font-semibold text-foreground truncate leading-tight">{comment.author}</span>
            <span className="text-[10.5px] text-muted-foreground tabular-nums leading-tight whitespace-nowrap">
              {formatRelative(new Date(comment.createdAt).getTime())}
            </span>
            <div className="ml-auto inline-flex items-center gap-0.5">
              {onJumpToBlock && (
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => onJumpToBlock(comment.blockId)}
                        aria-label="Jump to commented block"
                        className="w-6 h-6 rounded-full text-muted-foreground hover:text-primary hover:bg-muted flex items-center justify-center"
                      >
                        <CornerUpRight className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">Jump to block</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {canEditComment && !editingComment && (
                <span className="opacity-0 group-hover/comment:opacity-100 focus-within:opacity-100 transition-opacity">
                  <OwnerActions
                    label="comment"
                    onEdit={() => { setCommentDraft(comment.text); setEditingComment(true); }}
                    onDelete={() => setConfirm({ kind: "comment" })}
                  />
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <RoleBadge role={comment.authorRole} />
            {comment.category && <CategoryBadge category={comment.category} />}
            {comment.resolved && <ResolvedBadge />}
          </div>
        </div>
      </div>

      {/* Comment body */}
      <div className="mt-2 pl-[42px]">
        {editingComment ? (
          <div className="space-y-2">
            <Textarea
              value={commentDraft}
              onChange={(e) => setCommentDraft(e.target.value)}
              rows={2}
              className="text-[13px] rounded-xl resize-none"
            />
            <div className="flex justify-end gap-1.5">
              <Button size="sm" variant="ghost" className="rounded-full h-7 px-3 text-xs" onClick={() => setEditingComment(false)}>Cancel</Button>
              <Button size="sm" className="rounded-full h-7 px-3 text-xs" onClick={saveCommentEdit} disabled={!commentDraft.trim()}>Save</Button>
            </div>
          </div>
        ) : (
          <p className="text-[13px] leading-relaxed text-foreground whitespace-pre-wrap break-words">{comment.text}</p>
        )}
      </div>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <ul className="mt-3 pl-[42px] space-y-2.5">
          {comment.replies.map((r) => {
            const canEditReply = r.author === authorName;
            const isEditing = editingReplyId === r.id;
            return (
              <li key={r.id} className="group/reply flex items-start gap-2 pl-3 border-l-2 border-border">
                <div className={cn(
                  "w-6 h-6 rounded-full text-[10px] font-semibold flex items-center justify-center shrink-0",
                  r.authorRole === "author" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary",
                )}>
                  {r.author.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[12px] font-semibold text-foreground truncate">{r.author}</span>
                    <RoleBadge role={r.authorRole} />
                    <span className="text-muted-foreground/40 text-[10px]">·</span>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {formatRelative(new Date(r.createdAt).getTime())}
                    </span>
                    {canEditReply && !isEditing && (
                      <span className="ml-auto opacity-0 group-hover/reply:opacity-100 focus-within:opacity-100 transition-opacity">
                        <OwnerActions
                          label="reply"
                          onEdit={() => { setReplyDraft(r.text); setEditingReplyId(r.id); }}
                          onDelete={() => setConfirm({ kind: "reply", id: r.id })}
                        />
                      </span>
                    )}
                  </div>
                  {isEditing ? (
                    <div className="mt-1 space-y-2">
                      <Textarea
                        value={replyDraft}
                        onChange={(e) => setReplyDraft(e.target.value)}
                        rows={2}
                        className="text-[13px] rounded-xl resize-none"
                      />
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" variant="ghost" className="rounded-full h-7 px-3 text-xs" onClick={() => setEditingReplyId(null)}>Cancel</Button>
                        <Button size="sm" className="rounded-full h-7 px-3 text-xs" onClick={() => saveReplyEdit(r.id)} disabled={!replyDraft.trim()}>Save</Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[13px] leading-relaxed text-foreground whitespace-pre-wrap break-words mt-0.5">{r.text}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Composer + actions footer */}
      {!comment.resolved && (
        <div className="mt-3 pl-[42px] space-y-2">
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
            }}
            placeholder={isAuthorView ? "Write a reply…" : "Reply…"}
            rows={1}
            className="min-h-[38px] max-h-[200px] text-[13px] rounded-xl resize-none overflow-y-auto thin-scrollbar"
          />
          <div className="flex items-center justify-between gap-2">
            {isAuthorView ? (
              <label className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer select-none">
                <Checkbox
                  checked={markResolved}
                  onCheckedChange={(v) => setMarkResolved(v === true)}
                  aria-label="Mark as resolved"
                  className="h-3.5 w-3.5"
                />
                <span>Mark as resolved</span>
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" aria-label="What does mark as resolved mean?" className="text-muted-foreground hover:text-primary">
                        <Info className="w-3 h-3" aria-hidden="true" focusable="false" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[240px] text-xs leading-relaxed">
                      {RESOLVED_TIP}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
            ) : (
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => toggleResolved(comment.id)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-emerald-700 transition-colors"
                    >
                      <Circle className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                      Mark resolved
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[240px] text-xs leading-relaxed">
                    {RESOLVED_TIP}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Button
              size="sm"
              onClick={submit}
              disabled={!reply.trim()}
              className="rounded-full h-7 px-3 text-xs"
            >
              <Send className="w-3 h-3 mr-1" aria-hidden="true" focusable="false" />
              {isAuthorView ? "Submit" : "Reply"}
            </Button>
          </div>
        </div>
      )}

      {isAuthorView && comment.resolved && (
        <div className="mt-2 pl-[42px]">
          <button
            type="button"
            onClick={() => toggleResolved(comment.id)}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
            Reopen thread
          </button>
        </div>
      )}

      <AlertDialog open={!!confirm} onOpenChange={(o) => { if (!o) setConfirm(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {confirm?.kind === "reply" ? "reply" : "comment"}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. {confirm?.kind === "comment" ? "All replies on this comment will also be removed." : "The reply will be permanently removed from this thread."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {(() => {
            if (!confirm) return null;
            const target = confirm.kind === "comment"
              ? comment
              : comment.replies.find((r) => r.id === confirm.id);
            if (!target) return null;
            const replyCount = confirm.kind === "comment" ? comment.replies.length : 0;
            return (
              <div className="rounded-xl border border-border bg-muted/40 p-3">
                <div className="flex items-start gap-2.5">
                  <div className={cn(
                    "w-7 h-7 rounded-full text-[11px] font-semibold flex items-center justify-center shrink-0",
                    target.authorRole === "author" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary",
                  )}>
                    {target.author.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[12px] font-semibold text-foreground truncate">{target.author}</span>
                      <RoleBadge role={target.authorRole} />
                      <span className="text-muted-foreground/40 text-[10px]">·</span>
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        {formatRelative(new Date(target.createdAt).getTime())}
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] leading-relaxed text-foreground whitespace-pre-wrap break-words line-clamp-4">
                      {target.text}
                    </p>
                    {confirm.kind === "comment" && replyCount > 0 && (
                      <p className="mt-2 text-[11px] font-medium text-destructive">
                        {replyCount} {replyCount === 1 ? "reply" : "replies"} will also be deleted
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!confirm) return;
                if (confirm.kind === "comment") deleteComment(comment.id);
                else deleteReply(comment.id, confirm.id);
                setConfirm(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}


