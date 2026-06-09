// Mock per-course "copied items" store. Persists to localStorage so copies
// made from one course show up on the destination course in real time.

export interface CopiedPageBlock {
  id: string;
  type: string;
  content: string;
  variant?: string;
  font?: string;
}

export interface CopiedPage {
  id: string;
  title: string;
  inclusions?: string;
  exclusions?: string;
  blocks?: CopiedPageBlock[];
}

export interface CopiedSection {
  id: string;
  title: string;
  pages?: CopiedPage[];
}

interface CourseCopyData {
  // Pages copied INTO existing sections of this course, keyed by destination
  // section id.
  pagesBySection: Record<string, CopiedPage[]>;
  // Whole sections copied INTO this course (appended after existing sections).
  sections: CopiedSection[];
}

const STORAGE_KEY = "course-copy-store-v1";
const EVENT_NAME = "course-copy-updated";

type AllData = Record<string, CourseCopyData>;

function readAll(): AllData {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeAll(data: AllData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

function ensure(data: AllData, courseId: string): CourseCopyData {
  if (!data[courseId]) {
    data[courseId] = { pagesBySection: {}, sections: [] };
  }
  return data[courseId];
}

export function getCourseCopies(courseId: string): CourseCopyData {
  const all = readAll();
  return all[courseId] || { pagesBySection: {}, sections: [] };
}

export function addCopiedPage(
  courseId: string,
  sectionId: string,
  page: CopiedPage,
) {
  const all = readAll();
  const entry = ensure(all, courseId);
  if (!entry.pagesBySection[sectionId]) entry.pagesBySection[sectionId] = [];
  // Ensure unique id within destination to avoid collisions.
  const newPage: CopiedPage = {
    ...page,
    id: `copied-page-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  };
  entry.pagesBySection[sectionId].push(newPage);
  writeAll(all);
}

export function addCopiedSection(courseId: string, section: CopiedSection) {
  const all = readAll();
  const entry = ensure(all, courseId);
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const newSection: CopiedSection = {
    ...section,
    id: `copied-sec-${stamp}`,
    pages: (section.pages || []).map((p, i) => ({
      ...p,
      id: `copied-page-${stamp}-${i}`,
    })),
  };
  entry.sections.push(newSection);
  writeAll(all);
}

export function subscribeCourseCopies(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener("storage", handler);
  };
}
