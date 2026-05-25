import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  addReply,
  getCommentsForCourse,
  markCourseRead,
  subscribe,
  toggleResolved,
  unreadCountForCourse,
  type ReviewComment,
} from "@/services/reviewCommentsStore";

interface Props {
  courseId: string;
  courseTitle: string;
  defaultOpen?: boolean;
}

const AUTHOR_NAME = "You";

export function AuthorReviewCommentsButton({ courseId, courseTitle, defaultOpen }: Props) {
  const [open, setOpen] = useState(!!defaultOpen);
  const [, setTick] = useState(0);
  const [unread, setUnread] = useState<number>(() => unreadCountForCourse(courseId));
  const [comments, setComments] = useState<ReviewComment[]>(() => getCommentsForCourse(courseId));

  useEffect(() => {
    const refresh = () => {
      setUnread(unreadCountForCourse(courseId));
      setComments(getCommentsForCourse(courseId));
      setTick((t) => t + 1);
    };
    refresh();
    const unsub = subscribe(refresh);
    return () => { unsub(); };
  }, [courseId]);

  useEffect(() => {
    if (open && unread > 0) {
      const t = setTimeout(() => markCourseRead(courseId), 400);
      return () => clearTimeout(t);
    }
  }, [open, unread, courseId]);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("review-comments:open", handler);
    return () => window.removeEventListener("review-comments:open", handler);
  }, []);

  return (
    <>
      {/* Floating trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Review comments${unread > 0 ? `, ${unread} new` : ""}`}
        className={cn(
          "fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 h-12 px-5 rounded-full shadow-lg",
          "bg-primary text-primary-foreground hover:bg-primary/90 transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        )}
      >
        <MessageSquare className="w-5 h-5" aria-hidden="true" />
        <span className="font-semibold text-sm">Review comments</span>
        {comments.length > 0 && (
          <span className={cn(
            "min-w-[22px] h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center tabular-nums",
            unread > 0 ? "bg-destructive text-destructive-foreground" : "bg-primary-foreground/20",
          )}>
            {unread > 0 ? unread : comments.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/40 z-50"
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-[440px] bg-card border-l border-border z-50 flex flex-col shadow-2xl"
              role="dialog"
              aria-label="Review comments"
            >
              <header className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-foreground truncate">Review comments</h2>
                  <p className="text-xs text-muted-foreground truncate">{courseTitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </header>

              {comments.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <MessageSquare className="w-6 h-6 text-primary" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-medium text-foreground">No comments yet</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[260px]">
                    When a reviewer leaves feedback on this course, it will appear here.
                  </p>
                </div>
              ) : (
                <ScrollArea className="flex-1">
                  <ul className="divide-y divide-border">
                    {comments.map((c) => (
                      <CommentItem key={c.id} comment={c} courseTitle={courseTitle} />
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function CommentItem({ comment, courseTitle }: { comment: ReviewComment; courseTitle: string }) {
  const [reply, setReply] = useState("");
  const [expanded, setExpanded] = useState(!comment.resolved);

  const submit = () => {
    const t = reply.trim();
    if (!t) return;
    addReply({
      commentId: comment.id,
      courseTitle,
      author: AUTHOR_NAME,
      authorRole: "author",
      text: t,
    });
    setReply("");
  };

  return (
    <li className={cn("px-5 py-4", comment.resolved && "bg-emerald-50/40")}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left flex items-start gap-3"
        aria-expanded={expanded}
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
          {comment.author.slice(0, 1)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground">{comment.author}</span>
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 rounded-full">Reviewer</Badge>
            {comment.resolved && (
              <Badge className="text-[10px] h-4 px-1.5 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Resolved</Badge>
            )}
            {comment.replies.length > 0 && (
              <span className="text-[10px] text-muted-foreground">{comment.replies.length} repl{comment.replies.length === 1 ? "y" : "ies"}</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{comment.blockLabel}</p>
          <p className={cn("text-sm text-foreground mt-1 whitespace-pre-wrap break-words", !expanded && "line-clamp-2")}>
            {comment.text}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">{new Date(comment.createdAt).toLocaleString()}</p>
        </div>
        <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform shrink-0", expanded && "rotate-90")} aria-hidden="true" />
      </button>

      {expanded && (
        <div className="mt-3 pl-11 space-y-3">
          {comment.replies.length > 0 && (
            <ul className="space-y-2 border-l-2 border-border pl-3">
              {comment.replies.map((r) => (
                <li key={r.id} className="flex items-start gap-2">
                  <div className={cn(
                    "w-6 h-6 rounded-full text-[10px] font-semibold flex items-center justify-center shrink-0",
                    r.authorRole === "author" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary",
                  )}>
                    {r.author.slice(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground">{r.author}</span>
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5 rounded-full capitalize">{r.authorRole}</Badge>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap break-words">{r.text}</p>
                    <p className="text-[11px] text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-end gap-2">
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Reply to reviewer…"
              rows={1}
              className="min-h-[36px] text-sm rounded-xl resize-none"
              disabled={comment.resolved}
            />
            <Button size="sm" onClick={submit} disabled={!reply.trim() || comment.resolved} className="rounded-full h-9">
              <Send className="w-3.5 h-3.5" aria-hidden="true" />
            </Button>
          </div>

          <button
            type="button"
            onClick={() => toggleResolved(comment.id)}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-emerald-700"
          >
            {comment.resolved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
            {comment.resolved ? "Reopen" : "Mark as resolved"}
          </button>
        </div>
      )}
    </li>
  );
}
