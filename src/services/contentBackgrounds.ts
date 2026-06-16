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
    label: "Azure Silk",
    category: "texture",
    // Large flowing soft blue waves — premium, subtle, full-bleed.
    swatchStyle: {
      backgroundColor: "#F4F8FF",
      backgroundImage:
        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='100' viewBox='0 0 160 100' preserveAspectRatio='none'><defs><linearGradient id='g1' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%23DCE9FF'/><stop offset='100%' stop-color='%23F4F8FF'/></linearGradient></defs><rect width='160' height='100' fill='url(%23g1)'/><path d='M-10 70 C 40 30, 90 95, 180 55 L180 100 L-10 100 Z' fill='%23BFD6F6' fill-opacity='0.35'/><path d='M-10 85 C 50 55, 110 110, 180 75 L180 100 L-10 100 Z' fill='%23A9C7F0' fill-opacity='0.25'/></svg>\")",
      backgroundSize: "cover",
    },
    style: {
      backgroundColor: "#F4F8FF",
      backgroundImage:
        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='900' viewBox='0 0 1600 900' preserveAspectRatio='xMidYMid slice'><defs><linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%23EAF2FF'/><stop offset='55%' stop-color='%23F6FAFF'/><stop offset='100%' stop-color='%23E6EFFC'/></linearGradient></defs><rect width='1600' height='900' fill='url(%23bg)'/><path d='M0 220 C 380 60, 760 360, 1240 180 C 1420 110, 1520 150, 1600 130 L1600 0 L0 0 Z' fill='%23D6E5F8' fill-opacity='0.55'/><path d='M0 320 C 300 180, 720 460, 1100 300 C 1340 200, 1480 280, 1600 250 L1600 120 L0 140 Z' fill='%23C7DAF1' fill-opacity='0.35'/><path d='M0 760 C 320 600, 700 880, 1080 720 C 1320 620, 1480 700, 1600 680 L1600 900 L0 900 Z' fill='%23CFDEF2' fill-opacity='0.55'/><path d='M0 820 C 380 700, 820 940, 1200 800 C 1380 740, 1500 770, 1600 760 L1600 900 L0 900 Z' fill='%23BBD0EC' fill-opacity='0.4'/><path d='M0 600 C 400 520, 800 700, 1200 580 C 1400 520, 1520 560, 1600 545' fill='none' stroke='%23B5CDEB' stroke-opacity='0.35' stroke-width='1.2'/><path d='M0 500 C 400 420, 800 600, 1200 480 C 1400 420, 1520 460, 1600 445' fill='none' stroke='%23B5CDEB' stroke-opacity='0.25' stroke-width='1.2'/></svg>\")",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "local",
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
