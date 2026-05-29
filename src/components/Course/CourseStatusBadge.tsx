import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  COURSE_STATUS_META,
  type CourseStatus,
  getCourseStatus,
  subscribeStatus,
} from "@/services/courseStatusStore";

interface CourseStatusBadgeProps {
  /** Pass either an explicit status or a courseId to subscribe to live updates. */
  status?: CourseStatus;
  courseId?: string | number;
  size?: "xs" | "sm" | "md";
  showDot?: boolean;
  className?: string;
}

const sizeClasses: Record<NonNullable<CourseStatusBadgeProps["size"]>, string> = {
  xs: "text-[10px] px-2 py-0.5 gap-1",
  sm: "text-[11px] px-2.5 py-1 gap-1.5",
  md: "text-xs px-3 py-1.5 gap-1.5",
};

export function useLiveCourseStatus(courseId?: string | number): CourseStatus {
  const [status, setStatus] = useState<CourseStatus>(() => getCourseStatus(courseId));
  useEffect(() => {
    setStatus(getCourseStatus(courseId));
    return subscribeStatus(() => setStatus(getCourseStatus(courseId)));
  }, [courseId]);
  return status;
}

export function CourseStatusBadge({
  status,
  courseId,
  size = "sm",
  showDot = true,
  className,
}: CourseStatusBadgeProps) {
  const live = useLiveCourseStatus(courseId);
  const effective = status ?? live;
  const meta = COURSE_STATUS_META[effective];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-semibold leading-none whitespace-nowrap",
        sizeClasses[size],
        meta.className,
        className,
      )}
      aria-label={`Course status: ${meta.label}`}
    >
      {showDot && (
        <span
          aria-hidden="true"
          className={cn("h-1.5 w-1.5 rounded-full", meta.dotClassName)}
        />
      )}
      {meta.label}
    </span>
  );
}
