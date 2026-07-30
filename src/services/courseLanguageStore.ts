import { useEffect, useState } from "react";

/**
 * Course language store (multilingual + RTL support).
 *
 * A course's authoring language is chosen at creation time and locked once
 * generation starts. Learner-facing content is rendered in the course
 * language with the correct reading direction; UI chrome stays in English (v1).
 */

export type TextDirection = "ltr" | "rtl";

export interface CourseLanguage {
  code: string;
  label: string;
  native: string;
  dir: TextDirection;
}

export const COURSE_LANGUAGES: CourseLanguage[] = [
  { code: "en", label: "English", native: "English", dir: "ltr" },
  { code: "es", label: "Spanish", native: "Español", dir: "ltr" },
  { code: "fr", label: "French", native: "Français", dir: "ltr" },
  { code: "de", label: "German", native: "Deutsch", dir: "ltr" },
  { code: "pt", label: "Portuguese", native: "Português", dir: "ltr" },
  { code: "it", label: "Italian", native: "Italiano", dir: "ltr" },
  { code: "nl", label: "Dutch", native: "Nederlands", dir: "ltr" },
  { code: "zh", label: "Chinese", native: "中文", dir: "ltr" },
  { code: "ja", label: "Japanese", native: "日本語", dir: "ltr" },
  { code: "ko", label: "Korean", native: "한국어", dir: "ltr" },
  { code: "hi", label: "Hindi", native: "हिन्दी", dir: "ltr" },
  { code: "ar", label: "Arabic", native: "العربية", dir: "rtl" },
  { code: "he", label: "Hebrew", native: "עברית", dir: "rtl" },
  { code: "fa", label: "Persian", native: "فارسی", dir: "rtl" },
  { code: "ur", label: "Urdu", native: "اردو", dir: "rtl" },
];

export const DEFAULT_LANGUAGE_CODE = "en";

export function getLanguage(code: string | undefined | null): CourseLanguage {
  return (
    COURSE_LANGUAGES.find((l) => l.code === code) ??
    COURSE_LANGUAGES[0]
  );
}

export function isRTL(code: string | undefined | null): boolean {
  return getLanguage(code).dir === "rtl";
}

interface CourseLanguageEntry {
  code: string;
  /** Locked once course generation has begun (language cannot change mid-course). */
  locked: boolean;
}

const STORAGE_KEY = "course-language-store";

function readAll(): Record<string, CourseLanguageEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CourseLanguageEntry>) : {};
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, CourseLanguageEntry>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota errors */
  }
}

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeCourseLanguage(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCourseLanguageEntry(courseId: string): CourseLanguageEntry {
  return readAll()[courseId] ?? { code: DEFAULT_LANGUAGE_CODE, locked: false };
}

export function getCourseLanguageCode(courseId: string): string {
  return getCourseLanguageEntry(courseId).code;
}

export function setCourseLanguage(courseId: string, code: string, locked = false) {
  const all = readAll();
  all[courseId] = { code, locked };
  writeAll(all);
  emit();
}

export function lockCourseLanguage(courseId: string) {
  const all = readAll();
  const current = all[courseId] ?? { code: DEFAULT_LANGUAGE_CODE, locked: false };
  all[courseId] = { ...current, locked: true };
  writeAll(all);
  emit();
}

/** React hook — live course language for a given course id ("draft" for new courses). */
export function useCourseLanguage(courseId: string | undefined | null) {
  const key = courseId ? String(courseId) : "draft";
  const [entry, setEntry] = useState<CourseLanguageEntry>(() => getCourseLanguageEntry(key));

  useEffect(() => {
    setEntry(getCourseLanguageEntry(key));
    return subscribeCourseLanguage(() => setEntry(getCourseLanguageEntry(key)));
  }, [key]);

  const language = getLanguage(entry.code);
  return {
    code: entry.code,
    locked: entry.locked,
    language,
    dir: language.dir,
    isRTL: language.dir === "rtl",
    setCode: (code: string) => setCourseLanguage(key, code, entry.locked),
  };
}
