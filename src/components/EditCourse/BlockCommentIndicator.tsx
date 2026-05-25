import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, CheckCircle2, Circle, Send, X } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  addReply,
  getCommentsForBlock,
  subscribe,
  toggleResolved,
  type ReviewComment,
} from "@/services/reviewCommentsStore";

interface Props {
  courseId: string;
  blockId: string;
}

const AUTHOR_NAME = "You";

export function BlockCommentIndicator({ courseId, blockId }: Props) {
  const [comments, setComments] = useState<ReviewComment[]>(() => getCommentsForBlock(courseId, blockId));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const refresh = () => setComments(getCommentsForBlock(courseId, blockId));
    refresh();
    const unsub = subscribe(refresh);
    return () => { unsub(); };
  }, [courseId, blockId]);

  if (comments.length === 0) return null;

  const unresolved = comments.filter((c) => !c.resolved).length;
  const total = comments.length;
  const allResolved = unresolved === 0;
  const courseTitle = comments[0]?.blockLabel ?? "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.6, x: -6 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          aria-label={`${unresolved > 0 ? `${unresolved} unresolved` : `${total}`} reviewer comment${total > 1 ? "s" : ""}`}
          className={cn(
            "absolute z-20 top-2 -left-3 sm:-left-4",
            "inline-flex items-center gap-1 h-7 pl-1.5 pr-2 rounded-full shadow-md",
            "border backdrop-blur-sm transition-colors",
            allResolved
              ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              : "bg-primary text-primary-foreground border-primary/40 hover:bg-primary/90",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          )}
        >
          <span className="relative inline-flex items-center justify-center w-5 h-5 rounded-full">
            {allResolved ? (
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
            ) : (
              <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
            )}
            <AnimatePresence>
              {!allResolved && !open && (
                <motion.span
                  key="pulse"
                  initial={{ opacity: 0.6, scale: 1 }}
                  animate={{ opacity: 0, scale: 1.8 }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full bg-primary-foreground/40"
                  aria-hidden="true"
                />
              )}
            </AnimatePresence>
          </span>
          <span className="text-[11px] font-semibold tabular-nums leading-none">
            {unresolved > 0 ? unresolved : total}
          </span>
        </motion.button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={12}
        data-review-comment-thread="true"
        className="w-[360px] p-0 rounded-2xl border border-border shadow-xl z-[60]"
      >
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-foreground">Reviewer comments</h4>
            <p className="text-[11px] text-muted-foreground truncate">{courseTitle}</p>
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
        <ScrollArea className="max-h-[420px]">
          <ul className="divide-y divide-border">
            {comments.map((c) => (
              <CommentRow key={c.id} comment={c} courseTitle={courseTitle} />
            ))}
          </ul>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function CommentRow({ comment, courseTitle }: { comment: ReviewComment; courseTitle: string }) {
  const [reply, setReply] = useState("");
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
