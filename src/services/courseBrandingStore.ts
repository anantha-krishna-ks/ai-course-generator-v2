// Course-level branding store (per course). Persists to localStorage.
// Keep concerns isolated from customer branding (brandingService.ts).

export type LogoPosition = "top-left" | "top-center" | "top-right";

export interface CourseBranding {
  introLogo: string | null; // data URL or asset path
  contentLogo: string | null;
  introPosition: LogoPosition;
  contentPosition: LogoPosition;
  primaryColor: string; // hex e.g. #3B82F6
  ctaColor: string; // hex
  /** Preset id for content surface background. See contentBackgrounds.ts */
  contentBackground: string;
}

export const DEFAULT_COURSE_BRANDING: CourseBranding = {
  introLogo: null,
  contentLogo: null,
  introPosition: "top-left",
  contentPosition: "top-left",
  primaryColor: "#3B82F6",
  ctaColor: "#3B82F6",
  contentBackground: "default",
};

const key = (courseId: string) => `course_branding:${courseId}`;

export const courseBrandingStore = {
  get(courseId: string): CourseBranding {
    try {
      const raw = localStorage.getItem(key(courseId));
      if (!raw) return { ...DEFAULT_COURSE_BRANDING };
      return { ...DEFAULT_COURSE_BRANDING, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_COURSE_BRANDING };
    }
  },
  set(courseId: string, value: CourseBranding) {
    localStorage.setItem(key(courseId), JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("courseBrandingChanged", { detail: { courseId, value } }));
  },
};

// Convert hex (#rrggbb) to rgba string with given alpha.
export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Determine readable text color (black/white) for a given hex background.
export function readableTextColor(hex: string): "#000000" | "#FFFFFF" {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);
  // Relative luminance
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#000000" : "#FFFFFF";
}
