import { Info, Sparkles, Archive, Clock, CheckCircle2 } from "lucide-react";
import {
  COURSE_STATUS_META,
  type CourseStatus,
} from "@/services/courseStatusStore";
import { useLiveCourseStatus } from "./CourseStatusBadge";
import { cn } from "@/lib/utils";

interface Props {
  courseId?: string | number;
}

const TONE: Record<CourseStatus, { wrap: string; Icon: React.ComponentType<{ className?: string }>; copy: string }> = {
  draft: {
    wrap: "bg-slate-50 text-slate-700 border-slate-200",
    Icon: Info,
    copy: "Preview of a Draft course. It is not yet visible to learners.",
  },
  "in-review": {
    wrap: "bg-amber-50 text-amber-800 border-amber-200",
    Icon: Clock,
    copy: "This course is currently In Review. Reviewers may still request changes.",
  },
  "ready-to-publish": {
    wrap: "bg-blue-50 text-blue-800 border-blue-200",
    Icon: Sparkles,
    copy: "Ready to Publish — approved and awaiting final release to learners.",
  },
  published: {
    wrap: "bg-emerald-50 text-emerald-800 border-emerald-200",
    Icon: CheckCircle2,
    copy: "Published — this course is live and accessible to learners.",
  },
  archived: {
    wrap: "bg-zinc-100 text-zinc-700 border-zinc-300",
    Icon: Archive,
    copy: "Archived — this course is no longer accessible to learners. Preserved for audit and reference.",
  },
};

export function CoursePreviewStatusBanner({ courseId }: Props) {
  const status = useLiveCourseStatus(courseId);
  if (!courseId) return null;
  const meta = COURSE_STATUS_META[status];
  const tone = TONE[status];
  const { Icon } = tone;

  return (
    <div
      role="status"
      className={cn(
        "w-full border-b px-6 py-2 flex items-center gap-2.5 text-xs font-medium",
        tone.wrap,
      )}
    >
      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" focusable="false" />
      <span className="font-semibold uppercase tracking-wider text-[10px]">{meta.label}</span>
      <span aria-hidden="true" className="opacity-50">·</span>
      <span className="truncate">{tone.copy}</span>
    </div>
  );
}
