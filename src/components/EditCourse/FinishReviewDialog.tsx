import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, MessageSquare, Send, Sparkles, Rocket } from "lucide-react";
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
  const [submitting, setSubmitting] = useState(false);

  const commentCount = useMemo(
    () => (open && courseId ? getCommentsForCourse(courseId).length : 0),
    [open, courseId],
  );

  const finish = (mode: "draft" | "ready") => {
    setSubmitting(true);
    setTimeout(() => {
      toast({
        title: mode === "ready" ? "Marked as Ready to Publish" : "Feedback submitted",
        description:
          mode === "ready"
            ? "Course status updated to Ready to Publish."
            : commentCount
              ? `Your ${commentCount} comment${commentCount === 1 ? "" : "s"} ${commentCount === 1 ? "has" : "have"} been shared with the author. Course remains in Draft.`
              : "The author has been notified. Course remains in Draft.",
      });
      setSubmitting(false);
      onOpenChange(false);
      setTimeout(() => navigate("/dashboard"), 400);
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[600px] sm:max-w-[600px] p-0 overflow-hidden gap-0 rounded-2xl max-h-[90vh] overflow-y-auto">
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

          <div className="rounded-xl border border-border bg-background px-4 py-3">
            <p className="text-xs font-semibold text-foreground inline-flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
              What happens next
            </p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
                The author receives your review with all comments attached.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
                You won't be able to add new comments after submitting.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
                You'll be navigated to your dashboard.
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="px-4 sm:px-6 py-4 border-t border-border bg-muted/30 flex-col sm:flex-row gap-2 sm:gap-3 [&>button]:w-full sm:[&>button]:w-auto sm:[&>button]:flex-1 sm:[&>button]:max-w-[260px]">
          <Button
            variant="outline"
            onClick={() => finish("ready")}
            disabled={submitting}
            className="rounded-full gap-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
          >
            <Rocket className="w-4 h-4" aria-hidden="true" focusable="false" />
            Ready to Publish
          </Button>
          <Button
            onClick={() => finish("draft")}
            disabled={submitting}
            className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700 gap-2"
          >
            <Send className="w-4 h-4" aria-hidden="true" focusable="false" />
            {submitting ? "Submitting…" : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
