import { useEffect, useState } from "react";
import { ChevronDown, Send, CheckCircle2, RotateCcw, Rocket, Archive, Undo2, ThumbsUp } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import {
  COURSE_STATUS_META,
  type CourseStatus,
  type StatusTransition,
  getAvailableTransitions,
  setCourseStatus,
} from "@/services/courseStatusStore";
import { CourseStatusBadge, useLiveCourseStatus } from "./CourseStatusBadge";
import { cn } from "@/lib/utils";
import { canPublish, getCurrentRole, subscribeRole } from "@/services/currentUserStore";
import { getCommentsForCourse, subscribe as subscribeComments } from "@/services/reviewCommentsStore";

interface CourseStatusMenuProps {
  courseId: string | number | undefined;
  /** When true, the trigger is read-only (no dropdown). */
  readOnly?: boolean;
  className?: string;
}

const TRANSITION_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  submit: Send,
  approve: ThumbsUp,
  "request-changes": RotateCcw,
  publish: Rocket,
  "back-to-draft": Undo2,
  archive: Archive,
  restore: Undo2,
};

const toneClasses: Record<StatusTransition["tone"], string> = {
  default: "text-foreground hover:bg-muted",
  primary: "text-primary hover:bg-primary/10",
  success: "text-emerald-700 hover:bg-emerald-50",
  warning: "text-amber-800 hover:bg-amber-50",
  destructive: "text-destructive hover:bg-destructive/10",
};

export function CourseStatusMenu({ courseId, readOnly, className }: CourseStatusMenuProps) {
  const current = useLiveCourseStatus(courseId);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState<StatusTransition | null>(null);

  const transitions = getAvailableTransitions(current);

  if (!courseId || readOnly || transitions.length === 0) {
    return <CourseStatusBadge status={current} size="sm" className={className} />;
  }

  const onConfirm = () => {
    if (!confirm) return;
    setCourseStatus(courseId, confirm.to);
    toast({
      title: `Status updated to ${COURSE_STATUS_META[confirm.to].label}`,
      description: confirm.description,
    });
    setConfirm(null);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={`Course status: ${COURSE_STATUS_META[current].label}. Open status actions`}
            className={cn(
              "inline-flex items-center gap-1 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors",
              className,
            )}
          >
            <CourseStatusBadge status={current} size="sm" />
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" focusable="false" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-72 p-0 overflow-hidden rounded-2xl border border-border/70 shadow-xl"
        >
          <div className="px-4 py-3 border-b border-border bg-muted/40">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Course status
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <CourseStatusBadge status={current} size="sm" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground leading-snug">
              {COURSE_STATUS_META[current].description}
            </p>
          </div>
          <div className="py-1">
            <p className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Move to
            </p>
            {transitions.map((t) => {
              const Icon = TRANSITION_ICON[t.id] ?? Send;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setConfirm(t);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-2.5 flex items-start gap-2.5 transition-colors",
                    toneClasses[t.tone],
                  )}
                >
                  <Icon className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium">{t.label}</span>
                    <span className="block text-[11px] text-muted-foreground leading-snug">
                      {t.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm?.label}?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.description} The course will move from{" "}
              <strong>{COURSE_STATUS_META[current].label}</strong> to{" "}
              <strong>{confirm ? COURSE_STATUS_META[confirm.to].label : ""}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction className="rounded-full" onClick={onConfirm}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
