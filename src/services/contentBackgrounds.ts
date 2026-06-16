// Content background presets for course Outline / Page Editor / Preview surfaces.
// Lightweight palette + premium CSS-only textured backgrounds.

import type React from "react";
import { useEffect, useState } from "react";
import {
  CourseBranding,
  DEFAULT_COURSE_BRANDING,
  courseBrandingStore,
} from "./courseBrandingStore";

export type ContentBackgroundCategory = "color" | "texture";

export interface ContentBackgroundPreset {
  id: string;
  label: string;
  category: ContentBackgroundCategory;
  /** Style used in the picker swatch (small square). */
  swatchStyle: React.CSSProperties;
  /** Style applied to the container that hosts the content. */
  style: React.CSSProperties;
}

export const CONTENT_BACKGROUNDS: ContentBackgroundPreset[] = [
  {
    id: "default",
    label: "Default",
    category: "color",
    swatchStyle: { backgroundColor: "hsl(var(--background))" },
    style: {},
  },
  {
    id: "paper",
    label: "Soft Paper",
    category: "color",
    swatchStyle: { backgroundColor: "#FAF7F2" },
    style: { backgroundColor: "#FAF7F2" },
  },
  {
    id: "mist",
    label: "Cool Mist",
    category: "color",
    swatchStyle: { backgroundColor: "#F1F5F9" },
    style: { backgroundColor: "#F1F5F9" },
  },
  {
    id: "sage",
    label: "Sage",
    category: "color",
    swatchStyle: { backgroundColor: "#EEF2EC" },
    style: { backgroundColor: "#EEF2EC" },
  },
  {
    id: "blush",
    label: "Blush",
    category: "color",
    swatchStyle: { backgroundColor: "#FBF1EE" },
    style: { backgroundColor: "#FBF1EE" },
  },
  {
    id: "lavender",
    label: "Lavender",
    category: "color",
    swatchStyle: { backgroundColor: "#F2EEFB" },
    style: { backgroundColor: "#F2EEFB" },
  },
  {
    id: "aurora",
    label: "Aurora",
    category: "texture",
    swatchStyle: {
      backgroundColor: "#FAFAFF",
      backgroundImage:
        "radial-gradient(at 20% 20%, #dbeafe 0%, transparent 50%), radial-gradient(at 80% 0%, #fce7f3 0%, transparent 50%), radial-gradient(at 80% 80%, #ddd6fe 0%, transparent 50%)",
    },
    style: {
      backgroundColor: "#FAFAFF",
      backgroundImage:
        "radial-gradient(at 20% 20%, #dbeafe 0%, transparent 50%), radial-gradient(at 80% 0%, #fce7f3 0%, transparent 50%), radial-gradient(at 80% 80%, #ddd6fe 0%, transparent 50%)",
      backgroundAttachment: "local",
    },
  },
  {
    id: "linen-dots",
    label: "Linen Dots",
    category: "texture",
    swatchStyle: {
      backgroundColor: "#FBFAF7",
      backgroundImage: "radial-gradient(rgba(0,0,0,0.08) 1px, transparent 1px)",
      backgroundSize: "12px 12px",
    },
    style: {
      backgroundColor: "#FBFAF7",
      backgroundImage: "radial-gradient(rgba(0,0,0,0.08) 1px, transparent 1px)",
      backgroundSize: "14px 14px",
    },
  },
  {
    id: "architect-grid",
    label: "Architect Grid",
    category: "texture",
    swatchStyle: {
      backgroundColor: "#F8FAFC",
      backgroundImage:
        "linear-gradient(rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px)",
      backgroundSize: "10px 10px",
    },
    style: {
      backgroundColor: "#F8FAFC",
      backgroundImage:
        "linear-gradient(rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px)",
      backgroundSize: "24px 24px",
    },
  },
  {
    id: "silk-waves",
    label: "Silk Waves",
    category: "texture",
    // Subtle SVG wave pattern — light, premium, calm.
    swatchStyle: {
      backgroundColor: "#FBFCFE",
      backgroundImage:
        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='60' viewBox='0 0 120 60'><path d='M0 40 C 30 10, 60 70, 120 40' fill='none' stroke='%233B82F6' stroke-opacity='0.10' stroke-width='1.2'/><path d='M0 52 C 30 22, 60 82, 120 52' fill='none' stroke='%236366F1' stroke-opacity='0.08' stroke-width='1.2'/></svg>\")",
      backgroundSize: "120px 60px",
    },
    style: {
      backgroundColor: "#FBFCFE",
      backgroundImage:
        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='80' viewBox='0 0 160 80'><path d='M0 54 C 40 14, 80 94, 160 54' fill='none' stroke='%233B82F6' stroke-opacity='0.09' stroke-width='1.25'/><path d='M0 68 C 40 28, 80 108, 160 68' fill='none' stroke='%236366F1' stroke-opacity='0.07' stroke-width='1.25'/></svg>\")",
      backgroundSize: "160px 80px",
    },
  },


];

export function getContentBackgroundStyle(
  id?: string | null,
): React.CSSProperties {
  if (!id) return {};
  const preset = CONTENT_BACKGROUNDS.find((p) => p.id === id);
  return preset?.style ?? {};
}

/** Subscribe to a course's branding and re-render on changes. */
export function useCourseBranding(courseId: string | undefined): CourseBranding {
  const [branding, setBranding] = useState<CourseBranding>(() =>
    courseId ? courseBrandingStore.get(courseId) : { ...DEFAULT_COURSE_BRANDING },
  );

  useEffect(() => {
    if (!courseId) return;
    setBranding(courseBrandingStore.get(courseId));
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as
        | { courseId: string; value: CourseBranding }
        | undefined;
      if (!detail || detail.courseId !== courseId) return;
      setBranding(detail.value);
    };
    window.addEventListener("courseBrandingChanged", handler as EventListener);
    return () =>
      window.removeEventListener(
        "courseBrandingChanged",
        handler as EventListener,
      );
  }, [courseId]);

  return branding;
}

/** Convenience hook returning a ready-to-apply style for the content surface. */
export function useCourseContentBackgroundStyle(
  courseId: string | undefined,
): React.CSSProperties {
  const branding = useCourseBranding(courseId);
  return getContentBackgroundStyle(branding.contentBackground);
}
