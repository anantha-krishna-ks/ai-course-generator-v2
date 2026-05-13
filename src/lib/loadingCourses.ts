export interface LoadingCourse {
  id: string;
  title: string;
  startedAt: number; // epoch ms
  durationMs: number; // estimated total duration
}

const KEY = "loadingCourses";

export function getLoadingCourses(): LoadingCourse[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addLoadingCourse(course: Omit<LoadingCourse, "id" | "startedAt" | "durationMs"> & Partial<LoadingCourse>) {
  const list = getLoadingCourses();
  const item: LoadingCourse = {
    id: course.id ?? `loading-${Date.now()}`,
    title: course.title,
    startedAt: course.startedAt ?? Date.now(),
    durationMs: course.durationMs ?? 5 * 60 * 1000,
  };
  list.unshift(item);
  localStorage.setItem(KEY, JSON.stringify(list));
  return item;
}

export function removeLoadingCourse(id: string) {
  const list = getLoadingCourses().filter((c) => c.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getProgress(course: LoadingCourse): number {
  const elapsed = Date.now() - course.startedAt;
  return Math.min(95, Math.max(2, Math.floor((elapsed / course.durationMs) * 100)));
}

export function getMinutesAgoLabel(startedAt: number): string {
  const sec = Math.floor((Date.now() - startedAt) / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min${min === 1 ? "" : "s"} ago`;
  const hr = Math.floor(min / 60);
  return `${hr} hr${hr === 1 ? "" : "s"} ago`;
}
