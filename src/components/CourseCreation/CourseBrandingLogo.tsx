import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  courseBrandingStore,
  CourseBranding,
  DEFAULT_COURSE_BRANDING,
  LogoPosition,
} from "@/services/courseBrandingStore";

interface CourseBrandingLogoProps {
  courseId: string | undefined;
  slot: "intro" | "content";
  className?: string;
  /** Max logo height in px. Defaults differ per slot. */
  maxHeight?: number;
}

const POSITION_CLASS: Record<LogoPosition, string> = {
  "top-left": "justify-start",
  "top-center": "justify-center",
  "top-right": "justify-end",
};

/**
 * Renders the course-level branding logo (intro or content) at the position
 * configured in CourseBranding. Listens to live changes so the editor
 * updates immediately after Save & Close on the branding page.
 */
export function CourseBrandingLogo({
  courseId,
  slot,
  className,
  maxHeight,
}: CourseBrandingLogoProps) {
  const [branding, setBranding] = useState<CourseBranding>(
    courseId ? courseBrandingStore.get(courseId) : DEFAULT_COURSE_BRANDING
  );

  useEffect(() => {
    if (!courseId) return;
    setBranding(courseBrandingStore.get(courseId));
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ courseId: string; value: CourseBranding }>).detail;
      if (detail?.courseId === courseId) setBranding(detail.value);
    };
    window.addEventListener("courseBrandingChanged", handler as EventListener);
    return () => window.removeEventListener("courseBrandingChanged", handler as EventListener);
  }, [courseId]);

  const logo = slot === "intro" ? branding.introLogo : branding.contentLogo;
  const position = slot === "intro" ? branding.introPosition : branding.contentPosition;
  if (!logo) return null;

  const h = maxHeight ?? (slot === "intro" ? 48 : 36);

  return (
    <div
      className={cn("w-full flex items-center mb-4", POSITION_CLASS[position], className)}
      aria-hidden="false"
    >
      <img
        src={logo}
        alt="Course logo"
        style={{ maxHeight: h }}
        className="w-auto object-contain"
      />
    </div>
  );
}
