import { useEffect, useMemo, useRef } from "react";
import { LoadingCourseProgressDialog } from "@/components/Dashboard/LoadingCourseProgressDialog";
import type { LoadingCourse } from "@/lib/loadingCourses";

interface AIGenerationLoadingDialogProps {
  open: boolean;
  courseTitle: string;
  onComplete: () => void;
}

const TOTAL_DURATION_MS = 8000;

/**
 * AI generation loading dialog — reuses the dashboard's
 * LoadingCourseProgressDialog UI for a consistent generation experience.
 * Auto-completes after TOTAL_DURATION_MS and prevents user-driven close.
 */
export function AIGenerationLoadingDialog({
  open,
  courseTitle,
  onComplete,
}: AIGenerationLoadingDialogProps) {
  const startedAtRef = useRef<number>(Date.now());

  const course = useMemo<LoadingCourse | null>(() => {
    if (!open) return null;
    startedAtRef.current = Date.now();
    return {
      id: `ai-gen-${startedAtRef.current}`,
      title: courseTitle || "AI Generated Course",
      startedAt: startedAtRef.current,
      durationMs: TOTAL_DURATION_MS,
    };
    // Re-create only when the dialog opens or the title changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, courseTitle]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => onComplete(), TOTAL_DURATION_MS + 400);
    return () => clearTimeout(timer);
  }, [open, onComplete]);

  return (
    <LoadingCourseProgressDialog
      open={open}
      // Prevent user-initiated close — generation must run to completion
      onOpenChange={() => {}}
      course={course}
    />
  );
}
