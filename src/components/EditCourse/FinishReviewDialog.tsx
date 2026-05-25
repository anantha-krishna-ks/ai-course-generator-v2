import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, MessageSquare, Send, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getCommentsForCourse } from "@/services/reviewCommentsStore";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FinishReviewDialog({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { courseId } = useParams<{ courseId: string }>();
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const commentCount = useMemo(
    () => (open && courseId ? getCommentsForCourse(courseId).length : 0),
    [open, courseId],
  );

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      toast({
        title: "Review submitted",
        description: commentCount
          ? `Your ${commentCount} comment${commentCount === 1 ? "" : "s"} ${commentCount === 1 ? "has" : "have"} been shared with the author.`
          : "The author has been notified that your review is complete.",
      });
      setSubmitting(false);
      onOpenChange(false);
      setNote("");
      setTimeout(() => navigate("/dashboard"), 400);
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden gap-0 rounded-2xl">
        {/* Hero band */}
        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-br from-emerald-50 via-emerald-50/60 to-background border-b border-border">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <CheckCircle2 className="w-6 h-6" aria-hidden="true" focusable="false" />
            </div>
            <div className="min-w-0 pt-0.5">
              <DialogHeader className="text-left space-y-1">
                <DialogTitle className="text-lg font-semibold text-foreground">
                  Finish review?
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  The author will be notified and can act on your feedback.
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" aria-hidden="true" focusable="false" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                {commentCount === 0
                  ? "No comments added"
                  : `${commentCount} comment${commentCount === 1 ? "" : "s"} ready to send`}
              </p>
              <p className="text-xs text-muted-foreground">
                {commentCount === 0
                  ? "You can still finish and let the author know it's reviewed."
                  : "All comments will be visible to the author."}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="finish-review-note" className="text-xs font-semibold text-foreground inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
              Summary note <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Textarea
              id="finish-review-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a quick overall message for the author…"
              rows={3}
              className="resize-none rounded-xl text-sm"
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/30 gap-2 sm:gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="rounded-full"
          >
            Keep reviewing
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700 gap-2"
          >
            <Send className="w-4 h-4" aria-hidden="true" focusable="false" />
            {submitting ? "Submitting…" : "Submit review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
