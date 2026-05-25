import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, CheckCircle2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getCommentsForBlock, subscribe, type ReviewComment } from "@/services/reviewCommentsStore";

interface Props {
  courseId: string;
  blockId: string;
}

export const OPEN_REVIEW_COMMENTS_EVENT = "review-comments:open";

export function BlockCommentIndicator({ courseId, blockId }: Props) {
  const [comments, setComments] = useState<ReviewComment[]>(() => getCommentsForBlock(courseId, blockId));

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
  const latest = comments[0];

  const handleOpen = () => {
    window.dispatchEvent(new CustomEvent(OPEN_REVIEW_COMMENTS_EVENT, { detail: { blockId } }));
  };

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            type="button"
            onClick={handleOpen}
            initial={{ opacity: 0, scale: 0.6, x: -6 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`${unresolved > 0 ? `${unresolved} unresolved` : `${total}`} reviewer comment${total > 1 ? "s" : ""}`}
            className={cn(
              "absolute z-10 top-2 -left-3 sm:-left-4 lg:-left-5",
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
                {!allResolved && (
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
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-[260px]">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold">
              {unresolved > 0
                ? `${unresolved} unresolved comment${unresolved > 1 ? "s" : ""}`
                : `${total} resolved comment${total > 1 ? "s" : ""}`}
            </p>
            <p className="text-[11px] text-muted-foreground line-clamp-2">
              <span className="font-medium text-foreground">{latest.author}:</span> {latest.text}
            </p>
            <p className="text-[10px] text-muted-foreground">Click to open thread</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
