import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, MessageSquarePlus, CheckCircle2, Circle, Send, X } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  addComment,
  addReply,
  getCommentsForBlock,
  subscribe,
  toggleResolved,
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

export function BlockCommentIndicator({ courseId, blockId, label, courseTitle, variant = "floating", readOnly = false }: Props) {
  const location = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const isReviewer = location.pathname.startsWith("/review-course");
  const resolvedCourseId = courseId || (params.courseId as string | undefined) || "";

  const [comments, setComments] = useState<ReviewComment[]>(() => getCommentsForBlock(resolvedCourseId, blockId));
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const refresh = () => setComments(getCommentsForBlock(resolvedCourseId, blockId));
    refresh();
    const unsub = subscribe(refresh);
    return () => { unsub(); };
  }, [resolvedCourseId, blockId]);

  const total = comments.length;
  const unresolved = comments.filter((c) => !c.resolved).length;
  const allResolved = total > 0 && unresolved === 0;
  const threadTitle = useMemo(() => label ?? comments[0]?.blockLabel ?? "", [label, comments]);

  // Always show indicator (for both reviewer and author) so threads are reachable everywhere.

  const submitNew = () => {
    const t = draft.trim();
    if (!t) return;
    addComment({
      courseId: resolvedCourseId,
      courseTitle: courseTitle || threadTitle || "Course",
      blockId,
      blockLabel: label || threadTitle || blockId,
      author: isReviewer ? REVIEWER_NAME : AUTHOR_NAME,
      text: t,
    });
    setDraft("");
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
          <ScrollArea className="max-h-[360px]">
            <ul className="divide-y divide-border">
              {comments.map((c) => (
                <CommentRow
                  key={c.id}
                  comment={c}
                  courseTitle={courseTitle || threadTitle}
                  authorName={isReviewer ? REVIEWER_NAME : AUTHOR_NAME}
                  authorRole={isReviewer ? "reviewer" : "author"}
                />
              ))}
            </ul>
          </ScrollArea>
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
          <ScrollArea className="max-h-[360px]">
            <ul className="divide-y divide-border">
              {comments.map((c) => (
                <CommentRow
                  key={c.id}
                  comment={c}
                  courseTitle={courseTitle || threadTitle}
                  authorName={isReviewer ? REVIEWER_NAME : AUTHOR_NAME}
                  authorRole={isReviewer ? "reviewer" : "author"}
                />
              ))}
            </ul>
          </ScrollArea>
        )}

        <div className="border-t border-border p-3 space-y-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={isReviewer ? "Write a comment for the author…" : "Write a comment…"}
            rows={2}
            className="text-sm rounded-xl resize-none"
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={submitNew} disabled={!draft.trim()} className="rounded-full">
              <Send className="w-3.5 h-3.5 mr-1" aria-hidden="true" focusable="false" />
              Post comment
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function CommentRow({ comment, courseTitle, authorName, authorRole }: { comment: ReviewComment; courseTitle: string; authorName: string; authorRole: "reviewer" | "author" }) {
  const [reply, setReply] = useState("");
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
    setReply("");
  };

  return (
    <li className={cn("p-3 space-y-2", comment.resolved && "bg-emerald-50/40")}>
      <div className="flex items-start gap-2">
        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
          {comment.author.slice(0, 1)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-foreground">{comment.author}</span>
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 rounded-full">Reviewer</Badge>
            {comment.resolved && (
              <Badge className="text-[10px] h-4 px-1.5 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Resolved</Badge>
            )}
          </div>
          <p className="text-sm text-foreground mt-1 whitespace-pre-wrap break-words">{comment.text}</p>
          <p className="text-[10px] text-muted-foreground mt-1">{new Date(comment.createdAt).toLocaleString()}</p>
        </div>
      </div>

      {comment.replies.length > 0 && (
        <ul className="pl-9 space-y-2 border-l-2 border-border ml-3">
          {comment.replies.map((r) => (
            <li key={r.id} className="flex items-start gap-2">
              <div className={cn(
                "w-6 h-6 rounded-full text-[10px] font-semibold flex items-center justify-center shrink-0",
                r.authorRole === "author" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary",
              )}>
                {r.author.slice(0, 1)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">{r.author}</p>
                <p className="text-sm text-foreground whitespace-pre-wrap break-words">{r.text}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!comment.resolved && (
        <div className="pl-9 flex items-end gap-2">
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Reply…"
            rows={1}
            className="min-h-[36px] text-sm rounded-xl resize-none"
          />
          <Button size="sm" onClick={submit} disabled={!reply.trim()} className="rounded-full h-9" aria-label="Send reply">
            <Send className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
          </Button>
        </div>
      )}

      <div className="pl-9">
        <button
          type="button"
          onClick={() => toggleResolved(comment.id)}
          className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-emerald-700"
        >
          {comment.resolved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
          {comment.resolved ? "Reopen" : "Mark resolved"}
        </button>
      </div>
    </li>
  );
}
