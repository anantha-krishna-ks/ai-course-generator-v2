// Mock per-course lifecycle status store. Persists in localStorage so transitions
// done in one screen are reflected across dashboard, editor and preview.

export type CourseStatus =
  | "draft"
  | "in-review"
  | "ready-to-publish"
  | "published"
  | "archived";

export interface CourseStatusMeta {
  id: CourseStatus;
  label: string;
  short: string;
  description: string;
  // Tailwind classes for badge background + text. Uses semantic-ish neutral tones
  // so it works in both light and dark mode without raw color tokens leaking
  // outside the badge.
  className: string;
  dotClassName: string;
}

export const COURSE_STATUS_META: Record<CourseStatus, CourseStatusMeta> = {
  draft: {
    id: "draft",
    label: "Draft",
    short: "Draft",
    description: "Author is still creating or editing this course.",
    className: "bg-slate-100 text-slate-700 border-slate-200",
    dotClassName: "bg-slate-500",
  },
  "in-review": {
    id: "in-review",
    label: "In Review",
    short: "In Review",
    description: "Submitted for review. Reviewers are validating the content.",
    className: "bg-amber-100 text-amber-800 border-amber-200",
    dotClassName: "bg-amber-500",
  },
  "ready-to-publish": {
    id: "ready-to-publish",
    label: "Ready to Publish",
    short: "Ready",
    description: "Reviewed and approved. Awaiting final publication.",
    className: "bg-blue-100 text-blue-800 border-blue-200",
    dotClassName: "bg-blue-500",
  },
  published: {
    id: "published",
    label: "Published",
    short: "Published",
    description: "Live and accessible to learners.",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
    dotClassName: "bg-emerald-500",
  },
  archived: {
    id: "archived",
    label: "Archived",
    short: "Archived",
    description: "Retired from learner access. Retained for audit and reference.",
    className: "bg-zinc-200 text-zinc-700 border-zinc-300",
    dotClassName: "bg-zinc-500",
  },
};

// Demo seed mapping so each course in the dashboard has a sensible default.
const DEFAULT_STATUS_BY_ID: Record<string, CourseStatus> = {
  "1": "published",
  "2": "published",
  "3": "draft",
  "4": "in-review",
  "5": "ready-to-publish",
  "6": "draft",
  "7": "published",
  "8": "in-review",
  "9": "ready-to-publish",
  "10": "in-review",
  "11": "draft",
  "12": "published",
  "13": "archived",
  "14": "draft",
  "15": "ready-to-publish",
};

const STORAGE_KEY = "course_statuses_v1";

type StatusMap = Record<string, CourseStatus>;

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function read(): StatusMap {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function write(map: StatusMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function getCourseStatus(courseId: string | number | undefined | null): CourseStatus {
  if (courseId == null) return "draft";
  const key = String(courseId);
  const map = read();
  return map[key] ?? DEFAULT_STATUS_BY_ID[key] ?? "draft";
}

export function setCourseStatus(courseId: string | number, status: CourseStatus): void {
  const key = String(courseId);
  const map = read();
  map[key] = status;
  write(map);
  emit();
}

export function subscribeStatus(fn: () => void): () => void {
  listeners.add(fn);
  // Cross-tab + cross-component via storage event.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) fn();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

export interface StatusTransition {
  id: string;
  label: string;
  to: CourseStatus;
  description: string;
  // Visual hint for the action button.
  tone: "default" | "primary" | "success" | "warning" | "destructive";
}

export interface TransitionContext {
  /** True when there is at least one reviewer comment on the course. */
  hasReviewerComments?: boolean;
  /** True when all reviewer comments have been marked resolved. */
  allCommentsResolved?: boolean;
  /** True when the current user has publish privilege. */
  canPublish?: boolean;
}

export function getAvailableTransitions(
  current: CourseStatus,
  ctx: TransitionContext = {},
): StatusTransition[] {
  switch (current) {
    case "draft": {
      const list: StatusTransition[] = [
        {
          id: "submit",
          label: "Submit for Review",
          to: "in-review",
          description: "Send this course to reviewers for validation.",
          tone: "primary",
        },
      ];
      // Author "Approve" path: only meaningful after a review cycle, once every
      // reviewer comment has been addressed (resolved) by the author.
      if (ctx.hasReviewerComments && ctx.allCommentsResolved) {
        list.push({
          id: "approve",
          label: "Approve",
          to: "ready-to-publish",
          description: "All reviewer feedback addressed. Approve for publication.",
          tone: "success",
        });
      }
      return list;
    }
    case "in-review":
      return [
        {
          id: "approve",
          label: "Mark Ready to Publish",
          to: "ready-to-publish",
          description: "All feedback addressed. Approve for publication.",
          tone: "success",
        },
        {
          id: "request-changes",
          label: "Submit Feedback to Author",
          to: "draft",
          description: "Send your comments back to the author for revisions.",
          tone: "warning",
        },
      ];
    case "ready-to-publish": {
      const list: StatusTransition[] = [];
      if (ctx.canPublish !== false) {
        list.push({
          id: "publish",
          label: "Publish",
          to: "published",
          description: "Make the course live and accessible to learners.",
          tone: "success",
        });
      }
      list.push({
        id: "back-to-draft",
        label: "Return to Draft",
        to: "draft",
        description: "Re-open the course for further edits.",
        tone: "default",
      });
      return list;
    }
    case "published":
      return [
        {
          id: "archive",
          label: "Archive",
          to: "archived",
          description: "Remove the course from learner access.",
          tone: "destructive",
        },
      ];
    case "archived":
      return [
        {
          id: "restore",
          label: "Restore to Draft",
          to: "draft",
          description: "Re-open the archived course as a draft.",
          tone: "default",
        },
      ];
  }
}
