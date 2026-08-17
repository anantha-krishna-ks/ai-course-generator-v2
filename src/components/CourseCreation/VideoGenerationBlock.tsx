import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Check,
  Loader2,
  Sparkles,
  Type as TypeIcon,
  Upload,
  PenLine,
  Clock,
  Video as VideoIcon,
  UserRound,
  Trash2,
  Plus,
  ShieldCheck,
  Captions,
  FileText,
  AlertTriangle,
  Languages,
  Gauge,
  MoveDiagonal,
  Minimize2,
  Maximize2,
  RotateCcw,
  Download,
  Settings2,
  Image as ImageIcon,
  Square,
  Circle,
  Triangle,
  MessageSquare,
  ArrowRight,
  Palette,
  Shapes,
  Volume2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { CONTENT_BACKGROUNDS } from "@/services/contentBackgrounds";
import { readableTextColor } from "@/services/courseBrandingStore";
import { VOICE_LIBRARY, VoiceLibraryDialog } from "@/components/CourseCreation/AIAudioBlock";

import ariaImg from "@/assets/voices/aria.jpg";
import georgeImg from "@/assets/voices/george.jpg";

/* ------------------------------------------------------------------ */
/* Avatar library (mirrors the shipped Voice Library)                  */
/* ------------------------------------------------------------------ */

export interface AvatarOption {
  id: string;
  name: string;
  style: "Corporate" | "Casual" | "Educator" | "Clinical";
  setting: "Office" | "Studio" | "Classroom" | "Neutral";
  gender: "Female" | "Male";
  voice: string;
  image: string;
  enabled: boolean;
}

export const AVATAR_LIBRARY: AvatarOption[] = [
  { id: "av-aria", name: "Aria", style: "Corporate", setting: "Studio", gender: "Female", voice: "Aria · English (US)", image: ariaImg, enabled: true },
  { id: "av-george", name: "George", style: "Corporate", setting: "Office", gender: "Male", voice: "George · English (UK)", image: georgeImg, enabled: true },
];

export function getAvatar(id?: string) {
  return AVATAR_LIBRARY.find((a) => a.id === id);
}

/* ------------------------------------------------------------------ */
/* Text & annotation style library                                     */
/* ------------------------------------------------------------------ */

export type TextStyleId =
  | "title"
  | "subtitle"
  | "bullets"
  | "bubble"
  | "chip"
  | "lower-third"
  | "callout"
  | "quote";

export const TEXT_STYLES: {
  id: TextStyleId;
  label: string;
  purpose: string;
  limit: number;
  lines?: number;
}[] = [
  { id: "title", label: "Title", purpose: "Large heading", limit: 60 },
  { id: "subtitle", label: "Subtitle", purpose: "Supporting line under a title", limit: 80 },
  { id: "bullets", label: "Bullet card", purpose: "Up to 4 short lines", limit: 160, lines: 4 },
  { id: "bubble", label: "Speech bubble", purpose: "Beside the avatar — a term and its meaning", limit: 60 },
  { id: "chip", label: "Key-term chip", purpose: "A small pill for one term as it is spoken", limit: 30 },
  { id: "lower-third", label: "Lower third", purpose: "A name and role band", limit: 40 },
  { id: "callout", label: "Callout arrow", purpose: "Points at something in the frame", limit: 40 },
  { id: "quote", label: "Quote", purpose: "An emphasised line", limit: 120 },
];

export const ZONES = [
  "top-left", "top-centre", "top-right",
  "middle-left", "centre", "middle-right",
  "bottom-left", "bottom-centre", "bottom-right",
] as const;
export type ZoneId = (typeof ZONES)[number];

export const LANGUAGES = [
  { id: "en", label: "English", rtl: false },
  { id: "es", label: "Spanish", rtl: false },
  { id: "fr", label: "French", rtl: false },
  { id: "de", label: "German", rtl: false },
  { id: "ar", label: "Arabic", rtl: true },
  { id: "he", label: "Hebrew", rtl: true },
];

/* ------------------------------------------------------------------ */
/* State + serialisation                                               */
/* ------------------------------------------------------------------ */

export type ShapeId =
  | "rectangle"
  | "circle"
  | "triangle"
  | "comment"
  | "arrow-right"
  | "arrow-left"
  | "arrow-up"
  | "arrow-down";

export const SHAPES: { id: ShapeId; label: string; icon: typeof Square }[] = [
  { id: "rectangle", label: "Rectangle", icon: Square },
  { id: "circle", label: "Circle", icon: Circle },
  { id: "triangle", label: "Triangle", icon: Triangle },
  { id: "comment", label: "Comment", icon: MessageSquare },
  { id: "arrow-right", label: "Arrow right", icon: ArrowRight },
  { id: "arrow-left", label: "Arrow left", icon: ArrowRight },
  { id: "arrow-up", label: "Arrow up", icon: ArrowRight },
  { id: "arrow-down", label: "Arrow down", icon: ArrowRight },
];

export const SHAPE_COLOURS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#0F172A", "#FFFFFF"];

export type MediaKind = "text" | "shape" | "image";

export interface VideoBackground {
  mode: "none" | "color" | "preset" | "image";
  color: string;
  presetId: string;
  image: string | null;
  imageName: string;
}

export interface VideoLogo {
  src: string | null;
  name: string;
  zone: ZoneId;
  size: number; // 1 - 3
  fullRange: boolean;
  start: number;
  end: number;
  /** free placement on the stage — percent of stage width/height (centre) */
  x?: number;
  y?: number;
}

export interface VideoTextElement {
  id: string;
  /** text (default), shape or image */
  kind?: MediaKind;
  shape?: ShapeId;
  color?: string;
  src?: string;
  size?: number; // 1 - 3, shapes & images
  /** free positioning on the stage — percent of stage width/height (element centre) */
  x?: number;
  y?: number;
  /** free resize multiplier applied on top of `size` */
  scale?: number;
  style: TextStyleId;
  text: string;
  zone: ZoneId;
  timingMode: "anchor" | "fixed";
  anchorPhrase: string;
  start: number;
  duration: number;
  staysUntil: "seconds" | "sentence" | "video";
  animation: "fade" | "none";
}

export interface VideoGenState {
  avatarId: string;
  avatarZone: ZoneId;
  avatarSize: number; // 1 - 3
  avatarFullRange: boolean;
  avatarStart: number;
  avatarEnd: number;
  /** free placement on the stage — percent of stage width/height (centre) */
  avatarX?: number;
  avatarY?: number;
  source: "ai" | "self" | "upload";
  aiTopic: string;
  script: string;
  scriptIsDraft: boolean;
  scriptApproved: boolean;
  uploadName: string;
  rightsConfirmed: boolean;
  transcriptEdited: boolean;
  language: string;
  pace: "slow" | "natural" | "fast";
  voiceId: string;
  background: VideoBackground;
  logo: VideoLogo;
  elements: VideoTextElement[];
  status: "draft" | "generating" | "generated" | "outdated";
  paidSignature: string;
  captions: boolean;
  /** legacy fields — no longer surfaced in the UI */
  writtenVersion?: boolean;
  audioOnly?: boolean;
}

export const DEFAULT_BACKGROUND: VideoBackground = {
  mode: "none",
  color: "#0F172A",
  presetId: "aurora",
  image: null,
  imageName: "",
};

/** Curated studio backdrop colours — broadcast-grade, avatar-friendly. */
export const STUDIO_BG_COLORS: { label: string; hex: string }[] = [
  { label: "Midnight Ink", hex: "#0F172A" },
  { label: "Graphite", hex: "#1F2430" },
  { label: "Deep Teal", hex: "#0B3B3C" },
  { label: "Forest Noir", hex: "#12281F" },
  { label: "Royal Indigo", hex: "#1E1B4B" },
  { label: "Aubergine", hex: "#2E1065" },
  { label: "Oxblood", hex: "#4C1D24" },
  { label: "Espresso", hex: "#2B211B" },
  { label: "Studio Blue", hex: "#1D4ED8" },
  { label: "Cyan Wash", hex: "#0E7490" },
  { label: "Emerald", hex: "#047857" },
  { label: "Amber Glow", hex: "#B45309" },
  { label: "Terracotta", hex: "#C2603F" },
  { label: "Dusty Rose", hex: "#B76E79" },
  { label: "Slate Mist", hex: "#94A3B8" },
  { label: "Sandstone", hex: "#D6C7AE" },
  { label: "Soft Linen", hex: "#F1EBE1" },
  { label: "Cloud Grey", hex: "#E5E7EB" },
  { label: "Pale Sky", hex: "#DCEAF7" },
  { label: "Chroma Green", hex: "#00B140" },
];

export const DEFAULT_LOGO: VideoLogo = {
  src: null,
  name: "",
  zone: "top-right",
  size: 2,
  fullRange: true,
  start: 0,
  end: 0,
};

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
export const SUPPORTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];

export const MAX_SCRIPT_WORDS = 900;
export const MAX_DURATION_SEC = 360;

const EMPTY_STATE: VideoGenState = {
  avatarId: "",
  avatarZone: "bottom-right",
  avatarSize: 2,
  avatarFullRange: true,
  avatarStart: 0,
  avatarEnd: 0,
  source: "ai",
  aiTopic: "",
  script: "",
  scriptIsDraft: false,
  scriptApproved: false,
  uploadName: "",
  rightsConfirmed: false,
  transcriptEdited: false,
  language: "en",
  pace: "natural",
  voiceId: "aria",
  background: { ...DEFAULT_BACKGROUND },
  logo: { ...DEFAULT_LOGO },
  elements: [],
  status: "draft",
  paidSignature: "",
  captions: true,
};

export function parseVideoGenContent(raw?: string): VideoGenState {
  if (!raw) return { ...EMPTY_STATE };
  try {
    const stripped = raw.replace(/^<!--videogen:/, "").replace(/-->$/, "");
    const parsed = JSON.parse(stripped);
    return {
      ...EMPTY_STATE,
      ...parsed,
      background: { ...DEFAULT_BACKGROUND, ...(parsed.background ?? {}) },
      logo: { ...DEFAULT_LOGO, ...(parsed.logo ?? {}) },
      elements: Array.isArray(parsed.elements)
        ? parsed.elements.map((e: VideoTextElement) => ({ kind: "text" as MediaKind, ...e }))
        : [],
    };
  } catch {
    return { ...EMPTY_STATE };
  }
}

export function serializeVideoGenContent(state: VideoGenState) {
  return `<!--videogen:${JSON.stringify(state)}-->`;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const PACE_WPS: Record<VideoGenState["pace"], number> = { slow: 2.1, natural: 2.5, fast: 3.0 };

export function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function estimateDuration(state: VideoGenState) {
  const words = wordCount(state.script);
  if (!words) return 0;
  return Math.min(MAX_DURATION_SEC, Math.round(words / PACE_WPS[state.pace]));
}

export function formatTime(sec: number) {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Time (in seconds) at which the anchored phrase is spoken. */
export function anchorTime(state: VideoGenState, phrase: string) {
  if (!phrase) return 0;
  const idx = state.script.toLowerCase().indexOf(phrase.trim().toLowerCase());
  if (idx < 0) return 0;
  const before = wordCount(state.script.slice(0, idx));
  return Math.round(before / PACE_WPS[state.pace]);
}

export function elementWindow(state: VideoGenState, el: VideoTextElement) {
  const total = estimateDuration(state);
  const start = el.timingMode === "anchor" ? anchorTime(state, el.anchorPhrase) : el.start;
  const end =
    el.staysUntil === "video" ? total : Math.min(total || el.start + el.duration, start + el.duration);
  return { start: Math.min(start, total), end: Math.max(end, start + 1) };
}

function paidSignature(s: VideoGenState) {
  return [s.script, s.avatarId, s.language, s.pace, s.source, s.uploadName].join("|");
}

const zoneClass: Record<ZoneId, string> = {
  "top-left": "items-start justify-start text-left",
  "top-centre": "items-start justify-center text-center",
  "top-right": "items-start justify-end text-right",
  "middle-left": "items-center justify-start text-left",
  centre: "items-center justify-center text-center",
  "middle-right": "items-center justify-end text-right",
  "bottom-left": "items-end justify-start text-left",
  "bottom-centre": "items-end justify-center text-center",
  "bottom-right": "items-end justify-end text-right",
};

const AI_DRAFT = `Every workplace has hazards. A hazard is anything with the potential to cause harm — a trailing cable, a spill on a walkway, a machine without a guard.

Spotting one is only half the job. The moment you notice a hazard you either remove it, or you report it, so that somebody who can remove it knows about it.

In the next few minutes we will look at the four hazard families you will meet most often, and the single question that tells you how urgently to act.`;

/* ------------------------------------------------------------------ */
/* Shared stage renderer (editor preview + learner preview)            */
/* ------------------------------------------------------------------ */

function TextElementChip({
  el,
  compact,
}: {
  el: VideoTextElement;
  compact?: boolean;
}) {
  const base = "pointer-events-none max-w-[70%] [overflow-wrap:anywhere]";
  /** soft, single-source lighting instead of a hard drop shadow */
  const lift = { boxShadow: "0 8px 24px -12px hsl(222 47% 6% / 0.45)" } as CSSProperties;
  const inkGlow = { textShadow: "0 1px 2px hsl(222 47% 6% / 0.35)" } as CSSProperties;

  switch (el.style) {
    case "title":
      return (
        <span
          style={inkGlow}
          className={cn(
            base,
            "block font-semibold tracking-[-0.02em] leading-tight text-primary-foreground",
            compact ? "text-base" : "text-[2rem]"
          )}
        >
          {el.text}
        </span>
      );
    case "subtitle":
      return (
        <span
          style={inkGlow}
          className={cn(
            base,
            "block font-medium tracking-tight text-primary-foreground/85",
            compact ? "text-[10px]" : "text-lg"
          )}
        >
          {el.text}
        </span>
      );
    case "bullets":
      return (
        <div
          style={lift}
          className={cn(
            base,
            "rounded-2xl bg-background/70 backdrop-blur-xl border border-primary-foreground/15 px-4 py-3 space-y-1.5",
            compact ? "text-[9px] px-2.5 py-2" : "text-sm"
          )}
        >
          {el.text.split("\n").slice(0, 4).map((line, i) => (
            <div key={i} className="flex items-start gap-2 text-foreground">
              <span
                className="mt-[7px] w-1.5 h-1.5 rounded-full bg-gradient-to-br from-primary to-primary/50 shrink-0"
                aria-hidden="true"
              />
              <span>{line}</span>
            </div>
          ))}
        </div>
      );
    case "bubble":
      return (
        <div
          style={lift}
          className={cn(
            base,
            "relative rounded-2xl bg-background/85 backdrop-blur-xl border border-primary-foreground/15 text-foreground",
            compact ? "text-[9px] px-2.5 py-1.5" : "text-sm px-4 py-2.5"
          )}
        >
          {el.text}
          <span
            className="absolute -bottom-1 left-5 w-2.5 h-2.5 rotate-45 bg-background/85 border-b border-r border-primary-foreground/15"
            aria-hidden="true"
          />
        </div>
      );
    case "chip":
      return (
        <span
          style={lift}
          className={cn(
            base,
            "inline-flex items-center rounded-full bg-gradient-to-b from-primary to-primary/80 text-primary-foreground font-semibold tracking-tight border border-primary-foreground/20",
            compact ? "text-[9px] px-2.5 py-0.5" : "text-sm px-4 py-1.5"
          )}
        >
          {el.text}
        </span>
      );
    case "lower-third":
      return (
        <div
          style={lift}
          className={cn(
            base,
            "relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/95 to-primary/70 backdrop-blur-md text-primary-foreground pl-4 pr-5",
            compact ? "text-[9px] py-1.5" : "text-sm py-2.5"
          )}
        >
          <span
            className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-primary-foreground/80"
            aria-hidden="true"
          />
          <span className="font-semibold tracking-tight">{el.text}</span>
        </div>
      );
    case "callout":
      return (
        <div
          style={lift}
          className={cn(
            base,
            "flex items-center gap-2 rounded-xl bg-background/80 backdrop-blur-xl border border-primary/25 text-foreground font-medium",
            compact ? "text-[9px] px-2.5 py-1.5" : "text-sm px-3.5 py-2"
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
          {el.text}
        </div>
      );
    case "quote":
    default:
      return (
        <span
          style={inkGlow}
          className={cn(
            base,
            "block italic font-light text-primary-foreground/95 border-l-2 border-primary-foreground/50 pl-4",
            compact ? "text-[9px]" : "text-lg leading-snug"
          )}
        >
          “{el.text}”
        </span>
      );
  }
}

export function backgroundStyle(bg: VideoBackground | undefined): CSSProperties {
  if (!bg) return {};
  if (bg.mode === "color") return { backgroundColor: bg.color };
  if (bg.mode === "preset")
    return CONTENT_BACKGROUNDS.find((p) => p.id === bg.presetId)?.style ?? {};
  if (bg.mode === "image" && bg.image)
    return { backgroundImage: `url(${bg.image})`, backgroundSize: "cover", backgroundPosition: "center" };
  return {};
}

const SHAPE_SIZE_PCT = [10, 16, 24];

/** glossy fill: a soft top-light sheen laid over the chosen colour */
const glossFill = (colour: string) =>
  `linear-gradient(155deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.08) 42%, rgba(0,0,0,0.10) 100%), ${colour}`;
const glossShadow = (colour: string) =>
  `0 14px 30px -12px ${colour}99, 0 1px 0 0 rgba(255,255,255,0.35) inset`;

function ShapeGlyph({ el, compact }: { el: VideoTextElement; compact?: boolean }) {
  const colour = el.color ?? "#3B82F6";
  const pct = SHAPE_SIZE_PCT[(el.size ?? 2) - 1] ?? 16;
  const px = (compact ? 2.6 : 5.2) * pct;
  const common = { width: px, height: px } as CSSProperties;
  const gradId = `shape-grad-${el.id}`;

  switch (el.shape) {
    case "circle":
      return (
        <span
          className="block rounded-full"
          style={{ ...common, background: glossFill(colour), boxShadow: glossShadow(colour) }}
        />
      );
    case "triangle":
      return (
        <span
          className="block"
          style={{
            ...common,
            background: glossFill(colour),
            clipPath: "polygon(50% 4%, 96% 94%, 4% 94%)",
            filter: `drop-shadow(0 10px 18px ${colour}66)`,
          }}
        />
      );
    case "comment":
      return (
        <span
          className="relative flex items-center justify-center rounded-2xl px-3.5 py-2 border border-white/25"
          style={{ background: glossFill(colour), minWidth: px, boxShadow: glossShadow(colour) }}
        >
          <span className={cn("font-medium text-primary-foreground", compact ? "text-[9px]" : "text-sm")}>{el.text}</span>
          <span
            className="absolute -bottom-1 left-4 w-2.5 h-2.5 rotate-45"
            style={{ background: colour }}
            aria-hidden="true"
          />
        </span>
      );
    case "arrow-right":
    case "arrow-left":
    case "arrow-up":
    case "arrow-down": {
      const rotate = { "arrow-right": 0, "arrow-left": 180, "arrow-up": -90, "arrow-down": 90 }[el.shape] ?? 0;
      return (
        <span
          className="block"
          style={{ ...common, transform: `rotate(${rotate}deg)`, filter: `drop-shadow(0 10px 18px ${colour}66)` }}
        >
          <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0.6" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
                <stop offset="45%" stopColor={colour} />
                <stop offset="100%" stopColor={colour} stopOpacity="0.85" />
              </linearGradient>
            </defs>
            <path d="M2 9.2h11.4V4.4l8.2 7.6-8.2 7.6v-4.8H2z" fill={`url(#${gradId})`} />
          </svg>
        </span>
      );
    }
    case "rectangle":
    default:
      return (
        <span
          className="block rounded-xl"
          style={{
            ...common,
            height: px * 0.6,
            background: glossFill(colour),
            boxShadow: glossShadow(colour),
          }}
        />
      );
  }
}

function ImageGlyph({ el, compact }: { el: VideoTextElement; compact?: boolean }) {
  const pct = SHAPE_SIZE_PCT[(el.size ?? 2) - 1] ?? 16;
  const px = (compact ? 2.6 : 5.2) * pct;
  if (!el.src) return null;
  return (
    <span
      className="relative block rounded-2xl overflow-hidden ring-1 ring-white/25"
      style={{ width: px, boxShadow: "0 18px 36px -16px hsl(222 47% 6% / 0.6)" }}
    >
      <img src={el.src} alt={el.text || "On-screen image"} className="w-full h-auto object-contain" />
      <span
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(150deg,rgba(255,255,255,0.28),transparent_45%)]"
        aria-hidden="true"
      />
    </span>
  );
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Shared pointer-drag: reports new centre position in stage percentages. */
function startFreeDrag(
  e: React.PointerEvent,
  stage: HTMLDivElement | null,
  from: { x: number; y: number },
  onMove: (x: number, y: number) => void,
  onEnd?: () => void
) {
  if (!stage) return;
  e.preventDefault();
  e.stopPropagation();
  const rect = stage.getBoundingClientRect();
  const originX = e.clientX;
  const originY = e.clientY;
  const move = (ev: PointerEvent) => {
    onMove(
      clamp(from.x + ((ev.clientX - originX) / rect.width) * 100, 2, 98),
      clamp(from.y + ((ev.clientY - originY) / rect.height) * 100, 2, 98)
    );
  };
  const up = () => {
    onEnd?.();
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
}

/** Free move + resize wrapper for an on-stage element. */
function StageElement({
  el,
  compact,
  selected,
  onSelect,
  onPatch,
  stageRef,
}: {
  el: VideoTextElement;
  compact?: boolean;
  selected: boolean;
  onSelect?: (id: string | null) => void;
  onPatch?: (id: string, patch: Partial<VideoTextElement>) => void;
  stageRef: React.RefObject<HTMLDivElement>;
}) {
  const [mode, setMode] = useState<"idle" | "move" | "resize">("idle");
  const interactive = Boolean(onPatch);
  const free = el.x !== undefined && el.y !== undefined;
  const scale = el.scale ?? 1;

  const glyph =
    el.kind === "shape" ? (
      <ShapeGlyph el={el} compact={compact} />
    ) : el.kind === "image" ? (
      <ImageGlyph el={el} compact={compact} />
    ) : (
      <TextElementChip el={el} compact={compact} />
    );

  const beginMove = (e: React.PointerEvent) => {
    if (!onPatch || !stageRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect?.(el.id);
    const rect = stageRef.current.getBoundingClientRect();
    const startX = el.x ?? 50;
    const startY = el.y ?? 50;
    const originX = e.clientX;
    const originY = e.clientY;
    setMode("move");
    const move = (ev: PointerEvent) => {
      const nx = startX + ((ev.clientX - originX) / rect.width) * 100;
      const ny = startY + ((ev.clientY - originY) / rect.height) * 100;
      onPatch(el.id, { x: clamp(nx, 2, 98), y: clamp(ny, 2, 98) });
    };
    const up = () => {
      setMode("idle");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const beginResize = (e: React.PointerEvent) => {
    if (!onPatch) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect?.(el.id);
    const target = (e.currentTarget as HTMLElement).parentElement;
    const box = target?.getBoundingClientRect();
    const cx = box ? box.left + box.width / 2 : e.clientX;
    const cy = box ? box.top + box.height / 2 : e.clientY;
    const startDist = Math.max(12, Math.hypot(e.clientX - cx, e.clientY - cy));
    const startScale = scale;
    setMode("resize");
    const move = (ev: PointerEvent) => {
      const dist = Math.hypot(ev.clientX - cx, ev.clientY - cy);
      onPatch(el.id, { scale: clamp((startScale * dist) / startDist, 0.3, 4) });
    };
    const up = () => {
      setMode("idle");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!onPatch) return;
    const step = e.shiftKey ? 5 : 1;
    const x = el.x ?? 50;
    const y = el.y ?? 50;
    if (e.key === "ArrowLeft") { e.preventDefault(); onPatch(el.id, { x: clamp(x - step, 2, 98), y }); }
    else if (e.key === "ArrowRight") { e.preventDefault(); onPatch(el.id, { x: clamp(x + step, 2, 98), y }); }
    else if (e.key === "ArrowUp") { e.preventDefault(); onPatch(el.id, { y: clamp(y - step, 2, 98), x }); }
    else if (e.key === "ArrowDown") { e.preventDefault(); onPatch(el.id, { y: clamp(y + step, 2, 98), x }); }
    else if (e.key === "+" || e.key === "=") { e.preventDefault(); onPatch(el.id, { scale: clamp(scale + 0.1, 0.3, 4) }); }
    else if (e.key === "-") { e.preventDefault(); onPatch(el.id, { scale: clamp(scale - 0.1, 0.3, 4) }); }
  };

  const inner = (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={
        interactive
          ? `${el.kind === "shape" ? el.shape : el.kind === "image" ? "Image" : el.style} element — drag to move, arrow keys to nudge, plus and minus to resize`
          : undefined
      }
      onPointerDown={interactive ? beginMove : undefined}
      onKeyDown={interactive ? onKeyDown : undefined}
      onClick={() => onSelect?.(el.id)}
      className={cn(
        "relative rounded-lg",
        interactive && "pointer-events-auto cursor-grab touch-none select-none",
        mode === "move" && "cursor-grabbing"
      )}
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "center",
        transition: mode === "idle" ? "transform 120ms ease-out" : "none",
        // ring drawn with a scale-compensated box-shadow so it stays 2px visually
        boxShadow: selected
          ? `0 0 0 ${2 / scale}px hsl(var(--primary)), 0 0 0 ${4 / scale}px hsl(var(--primary) / 0.18)`
          : undefined,
      }}
    >
      {glyph}
      {interactive && selected && (
        <span
          role="button"
          tabIndex={0}
          aria-label="Resize element"
          onPointerDown={beginResize}
          onKeyDown={onKeyDown}
          className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-primary border-2 border-background shadow cursor-nwse-resize touch-none"
          style={{ transform: `scale(${1 / scale}) translate(50%, 50%)`, transformOrigin: "bottom right" }}
        />
      )}

    </div>
  );

  if (free) {
    return (
      <div
        className="absolute z-20"
        style={{
          left: `${el.x}%`,
          top: `${el.y}%`,
          transform: "translate(-50%, -50%)",
          transition: mode === "move" ? "none" : "left 120ms ease-out, top 120ms ease-out",
        }}
      >
        {inner}
      </div>
    );
  }

  return (
    <motion.div
      initial={el.animation === "fade" ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("pointer-events-none absolute inset-0 flex p-4 z-20", zoneClass[el.zone])}
    >
      {inner}
    </motion.div>
  );
}

export function VideoStage({
  state,
  time,
  compact,
  selectedId,
  onSelect,
  onPatchElement,
  onPatchState,
  showZones,
  generated,
}: {
  state: VideoGenState;
  time: number;
  compact?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onPatchElement?: (id: string, patch: Partial<VideoTextElement>) => void;
  onPatchState?: (patch: Partial<VideoGenState>) => void;
  showZones?: boolean;
  generated?: boolean;
}) {
  const avatar = getAvatar(state.avatarId);
  const total = estimateDuration(state);
  const rtl = LANGUAGES.find((l) => l.id === state.language)?.rtl;
  const stageRef = useRef<HTMLDivElement>(null);
  const onPatch = onPatchElement;
  const avatarVisible =
    state.avatarFullRange || (time >= state.avatarStart && time <= (state.avatarEnd || total));

  const sizePct = [18, 26, 36][state.avatarSize - 1] ?? 26;
  const logoPct = [8, 12, 18][state.logo?.size - 1] ?? 12;
  const canMove = Boolean(onPatchState);
  const avatarFree = state.avatarX !== undefined && state.avatarY !== undefined;
  const logoFree = state.logo?.x !== undefined && state.logo?.y !== undefined;

  const freeStyle = (x?: number, y?: number): CSSProperties => ({
    left: `${x}%`,
    top: `${y}%`,
    transform: "translate(-50%, -50%)",
  });

  /** current centre of a zone-placed node, so dragging starts where it sits */
  const centreOf = (node: HTMLElement): { x: number; y: number } => {
    const stage = stageRef.current?.getBoundingClientRect();
    const box = node.getBoundingClientRect();
    if (!stage) return { x: 50, y: 50 };
    return {
      x: clamp(((box.left + box.width / 2 - stage.left) / stage.width) * 100, 2, 98),
      y: clamp(((box.top + box.height / 2 - stage.top) / stage.height) * 100, 2, 98),
    };
  };

  const dragAvatar = (e: React.PointerEvent) =>
    startFreeDrag(
      e,
      stageRef.current,
      avatarFree
        ? { x: state.avatarX!, y: state.avatarY! }
        : centreOf(e.currentTarget as HTMLElement),
      (x, y) => onPatchState?.({ avatarX: x, avatarY: y })
    );

  const dragLogo = (e: React.PointerEvent) =>
    startFreeDrag(
      e,
      stageRef.current,
      logoFree
        ? { x: state.logo.x!, y: state.logo.y! }
        : centreOf(e.currentTarget as HTMLElement),
      (x, y) => onPatchState?.({ logo: { ...state.logo, x, y } })
    );

  const nudge = (
    e: React.KeyboardEvent,
    cur: { x: number; y: number },
    apply: (x: number, y: number) => void
  ) => {
    const step = e.shiftKey ? 5 : 1;
    const map: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const d = map[e.key];
    if (!d) return;
    e.preventDefault();
    apply(clamp(cur.x + d[0], 2, 98), clamp(cur.y + d[1], 2, 98));
  };

  return (
    <div
      ref={stageRef}
      dir={rtl ? "rtl" : "ltr"}
      className="relative w-full aspect-video rounded-xl overflow-hidden bg-[linear-gradient(150deg,hsl(var(--foreground)/0.92),hsl(var(--primary)/0.55))]"
    >
      {/* Background layer (solid colour, preset or uploaded image) */}
      {state.background && state.background.mode !== "none" && (
        <div className="absolute inset-0" style={backgroundStyle(state.background)} aria-hidden="true" />
      )}

      {/* subtle studio vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.22),transparent_60%)]" aria-hidden="true" />

      {showZones && (
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3" aria-hidden="true">
          {ZONES.map((z) => (
            <div key={z} className="border border-dashed border-primary-foreground/20" />
          ))}
        </div>
      )}

      {/* Avatar */}
      <AnimatePresence>
        {avatar && avatarVisible && (
          <motion.div
            key="avatar"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35 }}
            className={cn(
              "absolute",
              avatarFree ? "z-[15]" : cn("inset-0 flex p-3", zoneClass[state.avatarZone]),
              !canMove && "pointer-events-none"
            )}
            style={avatarFree ? { ...freeStyle(state.avatarX, state.avatarY), width: `${sizePct}%` } : undefined}
          >
            <div
              role={canMove ? "button" : undefined}
              tabIndex={canMove ? 0 : undefined}
              aria-label={canMove ? "Avatar — drag to move, arrow keys to nudge" : undefined}
              onPointerDown={canMove ? dragAvatar : undefined}
              onKeyDown={
                canMove
                  ? (e) =>
                      nudge(e, { x: state.avatarX ?? 50, y: state.avatarY ?? 50 }, (x, y) =>
                        onPatchState?.({ avatarX: x, avatarY: y })
                      )
                  : undefined
              }
              className={cn(
                "relative rounded-2xl overflow-hidden ring-1 ring-white/25",
                canMove ? "cursor-grab touch-none select-none" : "pointer-events-none"
              )}
              style={{ width: avatarFree ? "100%" : `${sizePct}%`, boxShadow: "0 24px 48px -20px hsl(222 47% 6% / 0.7)" }}
            >
              <img
                src={avatar.image}
                alt={`${avatar.name} presenter avatar`}
                className="w-full h-full object-cover aspect-[3/4]"
              />
              <span
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.2),transparent_40%)]"
                aria-hidden="true"
              />
              {generated && (
                <span className="absolute bottom-1 left-1 rounded-full bg-background/85 px-1.5 py-[1px] text-[8px] font-semibold text-foreground">
                  Speaking
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Brand logo */}
      {state.logo?.src &&
        (state.logo.fullRange || (time >= state.logo.start && time <= (state.logo.end || total))) && (
          <div
            className={cn(
              "absolute z-10",
              logoFree ? "" : cn("inset-0 flex p-3", zoneClass[state.logo.zone]),
              !canMove && "pointer-events-none"
            )}
            style={logoFree ? { ...freeStyle(state.logo.x, state.logo.y), width: `${logoPct}%` } : undefined}
          >
            <span
              role={canMove ? "button" : undefined}
              tabIndex={canMove ? 0 : undefined}
              aria-label={canMove ? "Brand logo — drag to move, arrow keys to nudge" : undefined}
              onPointerDown={canMove ? dragLogo : undefined}
              onKeyDown={
                canMove
                  ? (e) =>
                      nudge(e, { x: state.logo.x ?? 50, y: state.logo.y ?? 50 }, (x, y) =>
                        onPatchState?.({ logo: { ...state.logo, x, y } })
                      )
                  : undefined
              }
              className={cn("block", canMove ? "cursor-grab touch-none select-none" : "pointer-events-none")}
              style={{ width: logoFree ? "100%" : `${logoPct}%` }}
            >
              <img
                src={state.logo.src}
                alt=""
                className="w-full object-contain"
                style={{ filter: "drop-shadow(0 6px 14px hsl(222 47% 6% / 0.45))" }}
              />
            </span>
          </div>
        )}

      {/* On-screen elements — text, shapes and images */}
      {state.elements.map((el) => {
        const { start, end } = elementWindow(state, el);
        const visible = time >= start && time <= end;
        if (!visible) return null;
        return (
          <StageElement
            key={el.id}
            el={el}
            compact={compact}
            selected={selectedId === el.id}
            onSelect={onSelect}
            onPatch={onPatch}
            stageRef={stageRef}
          />
        );
      })}


      {!avatar && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-primary-foreground/80">
          <UserRound className="w-7 h-7" aria-hidden="true" focusable="false" />
          <p className="text-xs font-medium">Choose an avatar to start</p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Avatar sample clip player                                           */
/* ------------------------------------------------------------------ */

const AVATAR_SAMPLE_SCRIPT: Record<string, string[]> = {
  "av-aria": [
    "Hi, I'm Aria — your studio presenter.",
    "I'll narrate your lesson in a clear, warm voice.",
    "Add slides, captions and key terms as I speak.",
  ],
  "av-george": [
    "Hello, I'm George — your corporate presenter.",
    "I keep the pace steady and the tone professional.",
    "Perfect for compliance and onboarding modules.",
  ],
};

const SAMPLE_LINE_MS = 2600;

/** Plays a short sample clip: cinematic camera move, word-synced captions and glass transport. */
function AvatarSampleStage({
  avatar,
  playing,
  onEnded,
}: {
  avatar: AvatarOption;
  playing: boolean;
  onEnded: () => void;
}) {
  const lines = AVATAR_SAMPLE_SCRIPT[avatar.id] ?? [`Hi, I'm ${avatar.name}.`];
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const total = lines.length * SAMPLE_LINE_MS;

  useEffect(() => {
    if (!playing) {
      setIndex(0);
      setElapsed(0);
      return;
    }
    setIndex(0);
    setElapsed(0);
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const t = performance.now() - start;
      if (t >= total) {
        setElapsed(total);
        onEnded();
        return;
      }
      setElapsed(t);
      setIndex(Math.min(lines.length - 1, Math.floor(t / SAMPLE_LINE_MS)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, avatar.id]);

  const words = lines[index].split(" ");
  const lineProgress = ((elapsed % SAMPLE_LINE_MS) / SAMPLE_LINE_MS) * words.length;
  const progress = playing ? (elapsed / total) * 100 : 0;
  const seconds = Math.floor(elapsed / 1000);
  const totalSeconds = Math.round(total / 1000);
  const fmt = (s: number) => `0:${String(s).padStart(2, "0")}`;

  return (
    <>
      <motion.img
        src={avatar.image}
        alt={`${avatar.name} avatar`}
        className="w-full h-full object-cover"
        animate={playing ? { scale: [1.02, 1.09, 1.04], y: [0, -8, -3], x: [0, 4, 0] } : { scale: 1, y: 0, x: 0 }}
        transition={playing ? { duration: total / 1000, ease: [0.33, 0, 0.2, 1] } : { duration: 0.5, ease: "easeOut" }}
      />

      <AnimatePresence>
        {playing && (
          <motion.div
            key="sample-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            {/* cinematic grade: vignette + bottom scrim */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(120% 80% at 50% 30%, transparent 40%, hsl(var(--background) / 0.55) 100%), linear-gradient(to top, hsl(var(--background) / 0.92) 0%, hsl(var(--background) / 0.35) 34%, transparent 62%)",
              }}
              aria-hidden="true"
            />

            {/* light sweep */}
            <motion.div
              className="absolute inset-y-0 w-1/3 pointer-events-none"
              style={{ background: "linear-gradient(100deg, transparent, hsl(0 0% 100% / 0.16), transparent)" }}
              initial={{ x: "-120%" }}
              animate={{ x: ["-120%", "320%"] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden="true"
            />

            {/* now-playing chip */}
            <motion.span
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-2 left-2 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-background/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold tracking-wide text-foreground shadow-lg"
            >
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]"
                animate={{ opacity: [1, 0.3, 1], scale: [1, 0.85, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                aria-hidden="true"
              />
              SAMPLE
            </motion.span>

            {/* equaliser + timecode */}
            <div className="absolute bottom-[62px] left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-white/12 bg-background/55 backdrop-blur-md px-2.5 py-1 shadow-lg">
              <span className="flex items-end gap-[2.5px] h-3.5" aria-hidden="true">
                {[0, 1, 2, 3, 4, 5, 6].map((b) => (
                  <motion.span
                    key={b}
                    className="w-[2.5px] rounded-full bg-gradient-to-t from-primary/60 to-primary"
                    style={{ height: "35%" }}
                    animate={{ height: ["25%", "100%", "45%", "85%", "30%"] }}
                    transition={{ duration: 0.85, repeat: Infinity, delay: b * 0.07, ease: "easeInOut" }}
                  />
                ))}
              </span>
              <span className="text-[9px] font-mono font-medium text-foreground tabular-nums">
                {fmt(seconds)} / {fmt(totalSeconds)}
              </span>
            </div>

            {/* word-synced caption */}
            <div className="absolute bottom-3 left-2.5 right-2.5">
              <AnimatePresence mode="wait">
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="text-center text-[11px] leading-relaxed font-medium rounded-xl border border-white/12 bg-background/65 backdrop-blur-md px-2.5 py-1.5 shadow-xl"
                >
                  {words.map((w, i) => (
                    <span
                      key={`${w}-${i}`}
                      className={cn(
                        "transition-colors duration-200",
                        i <= lineProgress ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {w}{i < words.length - 1 ? " " : ""}
                    </span>
                  ))}
                </motion.p>
              </AnimatePresence>

              {/* chaptered scrubber */}
              <div className="mt-2 flex items-center gap-1">
                {lines.map((_, i) => {
                  const seg = clamp((elapsed - i * SAMPLE_LINE_MS) / SAMPLE_LINE_MS, 0, 1) * 100;
                  return (
                    <span key={i} className="h-[3px] flex-1 rounded-full bg-foreground/20 overflow-hidden">
                      <span
                        className="block h-full rounded-full bg-gradient-to-r from-primary/70 to-primary"
                        style={{ width: `${seg}%` }}
                      />
                    </span>
                  );
                })}
              </div>
            </div>

            <span className="sr-only">{`${Math.round(progress)} percent played`}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <span className="sr-only" aria-live="polite">
        {playing ? `Playing sample clip for ${avatar.name}: ${lines[index]}` : ""}
      </span>
    </>

  );
}

/* ------------------------------------------------------------------ */
/* Avatar library dialog                                               */
/* ------------------------------------------------------------------ */


function AvatarLibraryDialog({
  open,
  onOpenChange,
  selectedId,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [playing, setPlaying] = useState<string | null>(null);
  const list = AVATAR_LIBRARY.filter((a) => a.enabled);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[620px]">
        <DialogHeader>
          <DialogTitle>Choose a presenter</DialogTitle>
          <DialogDescription>
            Two presenters are available. Sample clips are pre-recorded and cost nothing.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          {list.map((a) => (
            <div
              key={a.id}
              className={cn(
                "rounded-2xl border bg-card overflow-hidden transition-all",
                selectedId === a.id ? "border-primary ring-2 ring-primary/25" : "border-border hover:border-primary/40"
              )}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <AvatarSampleStage avatar={a} playing={playing === a.id} onEnded={() => setPlaying(null)} />
                <button
                  type="button"
                  onClick={() => setPlaying(playing === a.id ? null : a.id)}
                  aria-label={`${playing === a.id ? "Pause" : "Play"} sample clip for ${a.name}`}
                  className="absolute bottom-2 left-2 w-8 h-8 rounded-full bg-background/90 flex items-center justify-center shadow-md hover:bg-background"
                >
                  {playing === a.id ? (
                    <Pause className="w-3.5 h-3.5 text-foreground" aria-hidden="true" focusable="false" />
                  ) : (
                    <Play className="w-3.5 h-3.5 text-foreground" aria-hidden="true" focusable="false" />
                  )}
                </button>
                {selectedId === a.id && (
                  <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                  </span>
                )}
              </div>

              <div className="p-3">
                <p className="text-sm font-semibold text-foreground">{a.name} · {a.gender}</p>
                <p className="text-xs text-muted-foreground truncate">{a.voice}</p>
                <Button
                  size="sm"
                  variant={selectedId === a.id ? "secondary" : "default"}
                  className="w-full mt-2 rounded-full h-8 text-xs"
                  onClick={() => { onSelect(a.id); onOpenChange(false); }}
                >
                  {selectedId === a.id ? "Selected" : `Use ${a.name}`}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Zone picker                                                         */
/* ------------------------------------------------------------------ */

function ZonePicker({ value, onChange, label }: { value: ZoneId; onChange: (z: ZoneId) => void; label: string }) {
  return (
    <div>
      <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      <div className="mt-1.5 grid grid-cols-3 gap-1 w-[108px]">
        {ZONES.map((z) => (
          <button
            key={z}
            type="button"
            onClick={() => onChange(z)}
            aria-label={`Place in ${z.replace("-", " ")} zone`}
            aria-pressed={value === z}
            className={cn(
              "h-8 rounded-md border transition-all",
              value === z ? "bg-primary border-primary shadow-sm" : "bg-muted/50 border-border hover:border-primary/50"
            )}
          />
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground mt-1.5 capitalize">{value.replace("-", " ")}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Editor block                                                        */
/* ------------------------------------------------------------------ */

export function VideoGenerationBlock({
  content,
  onChange,
  readOnly,
}: {
  content: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
}) {
  const [state, setState] = useState<VideoGenState>(() => parseVideoGenContent(content));
  const [tab, setTab] = useState<"avatar" | "speech" | "media" | "timing">("avatar");
  const [editorOpen, setEditorOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [mediaSection, setMediaSection] = useState<"text" | "shapes" | "images">("text");
  const bgInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [selectedEl, setSelectedEl] = useState<string | null>(null);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [progress, setProgress] = useState(0);
  const generatingRef = useRef(false);

  const total = estimateDuration(state);
  const avatar = getAvatar(state.avatarId);
  const words = wordCount(state.script);
  const voice = VOICE_LIBRARY.find((v) => v.id === state.voiceId) ?? VOICE_LIBRARY[0];

  const update = (patch: Partial<VideoGenState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      if (next.status === "generated" && paidSignature(next) !== next.paidSignature) {
        next.status = "outdated";
      }
      onChange(serializeVideoGenContent(next));
      return next;
    });
  };

  /** Reads an image upload into a data URL after validating type and size. */
  const readImage = (file: File | undefined, onDone: (dataUrl: string, name: string) => void) => {
    if (!file) return;
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      toast({ title: "Unsupported file", description: "Use a PNG, JPG, SVG or WebP image.", variant: "destructive" });
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast({ title: "File too large", description: "Images must be 2 MB or smaller.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onDone(String(reader.result), file.name);
    reader.readAsDataURL(file);
  };

  // Free preview playhead
  useEffect(() => {
    if (!playing || total === 0) return;
    const id = window.setInterval(() => {
      setTime((t) => {
        if (t >= total) { setPlaying(false); return total; }
        return t + 0.25;
      });
    }, 250);
    return () => window.clearInterval(id);
  }, [playing, total]);

  const checklist = useMemo(
    () => [
      { id: "avatar", label: "An avatar is chosen and placed", ok: !!state.avatarId },
      {
        id: "speech",
        label: state.source === "upload" ? "Audio uploaded and transcribed" : "A script is written",
        ok: state.source === "upload" ? !!state.uploadName && !!state.script : words > 0,
      },
      { id: "approved", label: "AI draft approved by you", ok: !state.scriptIsDraft || state.scriptApproved },
      { id: "rights", label: "Recording rights confirmed", ok: state.source !== "upload" || state.rightsConfirmed },
      { id: "limits", label: `Within limits (${MAX_SCRIPT_WORDS} words · ${formatTime(MAX_DURATION_SEC)})`, ok: words <= MAX_SCRIPT_WORDS && total <= MAX_DURATION_SEC },
    ],
    [state, words, total]
  );
  const ready = checklist.every((c) => c.ok);

  const timerRef = useRef<number | null>(null);
  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);

  const finishGenerate = () => {
    generatingRef.current = false;
    setState((prev) => {
      const next: VideoGenState = { ...prev, status: "generated", paidSignature: paidSignature(prev) };
      onChange(serializeVideoGenContent(next));
      return next;
    });
    toast({ title: "Video ready", description: "Captions were generated alongside the video." });
  };

  const runGenerate = () => {
    if (generatingRef.current) return; // second press ignored, never queued twice
    generatingRef.current = true;
    setGenerateOpen(false);
    update({ status: "generating" });
    setProgress(0);
    toast({ title: "Generating video", description: "It runs in the background — you can leave this page." });

    let p = 0;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      p += 5;
      setProgress(Math.min(p, 100));
      if (p >= 100) {
        if (timerRef.current) window.clearInterval(timerRef.current);
        timerRef.current = null;
        finishGenerate();
      }
    }, 220);
  };

  const addElement = (style: TextStyleId) => {
    const def = TEXT_STYLES.find((s) => s.id === style)!;
    const el: VideoTextElement = {
      id: `el-${Date.now()}`,
      style,
      text: def.label === "Bullet card" ? "First point\nSecond point" : def.label,
      zone: style === "lower-third" ? "bottom-left" : style === "title" ? "top-left" : "centre",
      timingMode: "anchor",
      anchorPhrase: "",
      start: 0,
      duration: 4,
      staysUntil: "seconds",
      animation: "fade",
    };
    update({ elements: [...state.elements, el] });
    setSelectedEl(el.id);
    setTab("media");
  };

  const addShape = (shape: ShapeId) => {
    const el: VideoTextElement = {
      id: `el-${Date.now()}`,
      kind: "shape",
      shape,
      color: SHAPE_COLOURS[0],
      size: 2,
      x: 50,
      y: 50,
      scale: 1,
      style: "chip",
      text: shape === "comment" ? "Add a note" : "",
      zone: "centre",
      timingMode: "fixed",
      anchorPhrase: "",
      start: 0,
      duration: 4,
      staysUntil: "seconds",
      animation: "fade",
    };
    update({ elements: [...state.elements, el] });
    setSelectedEl(el.id);
  };

  const addImage = (src: string, name: string) => {
    const el: VideoTextElement = {
      id: `el-${Date.now()}`,
      kind: "image",
      src,
      size: 2,
      x: 50,
      y: 50,
      scale: 1,
      style: "chip",
      text: name,
      zone: "centre",
      timingMode: "fixed",
      anchorPhrase: "",
      start: 0,
      duration: 4,
      staysUntil: "seconds",
      animation: "fade",
    };
    update({ elements: [...state.elements, el] });
    setSelectedEl(el.id);
  };

  /** Timeline drag handler — moving or trimming a clip pins it to a fixed time. */
  const retimeElement = (id: string, start: number, end: number) => {
    const target = state.elements.find((e) => e.id === id);
    if (!target) return;
    patchElement(id, {
      timingMode: "fixed",
      staysUntil: "seconds",
      start: Math.max(0, Number(start.toFixed(1))),
      duration: Math.max(0.5, Number((end - start).toFixed(1))),
    });
  };

  const patchElement = (id: string, patch: Partial<VideoTextElement>) =>
    update({ elements: state.elements.map((e) => (e.id === id ? { ...e, ...patch } : e)) });

  const statusChip = {
    draft: { label: "Not generated", cls: "bg-muted text-muted-foreground" },
    generating: { label: "Generating…", cls: "bg-primary/10 text-primary" },
    generated: { label: "Generated", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
    outdated: { label: "Out of date", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  }[state.status];

  const el = state.elements.find((e) => e.id === selectedEl) ?? null;
  const elDef = el ? TEXT_STYLES.find((s) => s.id === el.style)! : null;

  if (readOnly) {
    return <VideoGenerationPreview content={content} />;
  }

  return (
    <>
      {/* ---- Compact block shown in the editor ---- */}
      {state.status === "generated" || state.status === "outdated" ? (
        <div className="w-full space-y-2">
          <VideoGenerationPreview content={content} />
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", statusChip.cls)}>
              {statusChip.label}
            </span>
            {state.status === "outdated" && (
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" aria-hidden="true" focusable="false" />
                Regenerate to publish your latest changes
              </span>
            )}
            <div className="flex-1" />
            <Button size="sm" variant="outline" className="rounded-full h-8 text-xs" onClick={() => setEditorOpen(true)}>
              <Settings2 className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" focusable="false" /> Edit video
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="relative aspect-video bg-[linear-gradient(150deg,hsl(var(--foreground)/0.92),hsl(var(--primary)/0.55))] flex flex-col items-center justify-center gap-3">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.22),transparent_60%)]" aria-hidden="true" />
            {state.status === "generating" ? (
              <div className="relative w-[70%] max-w-[320px] text-center">
                <Loader2 className="w-6 h-6 mx-auto text-primary-foreground animate-spin mb-2" aria-hidden="true" focusable="false" />
                <p className="text-xs font-medium text-primary-foreground">Generating your video — {progress}%</p>
                <div className="h-1.5 mt-2 rounded-full bg-primary-foreground/25 overflow-hidden">
                  <div className="h-full rounded-full bg-primary-foreground transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-[11px] text-primary-foreground/80 mt-2">Runs in the background — you can keep editing.</p>
              </div>
            ) : (
              <>
                <span className="relative w-11 h-11 rounded-2xl bg-background/90 flex items-center justify-center shadow-lg">
                  <VideoIcon className="w-5 h-5 text-primary" aria-hidden="true" focusable="false" />
                </span>
                <div className="relative text-center px-6">
                  <p className="text-sm font-semibold text-primary-foreground">Video Generation</p>
                  <p className="text-[11px] text-primary-foreground/80 mt-0.5">
                    {avatar ? `${avatar.name} · ${formatTime(total)} · ${words} words` : "Choose an avatar, add a script and generate"}
                  </p>
                </div>
                <Button size="sm" className="relative rounded-full h-8" onClick={() => setEditorOpen(true)}>
                  <Settings2 className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" focusable="false" />
                  {avatar || words ? "Continue setup" : "Set up video"}
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ---- Full configuration workspace ---- */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-[1440px] w-[97vw] h-[92vh] overflow-hidden p-0 gap-0 flex flex-col">
          <DialogHeader className="sr-only">
            <DialogTitle>Configure video generation</DialogTitle>
            <DialogDescription>Choose an avatar, write the script, add on-screen text and generate the video.</DialogDescription>
          </DialogHeader>
          <div className="w-full h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-border bg-gradient-to-r from-primary/[0.06] to-transparent">

        <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <VideoIcon className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight">Video Generation</p>
          <p className="text-[11px] text-muted-foreground">Avatar · script · on-screen text</p>
        </div>
        <span className={cn("ml-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold", statusChip.cls)}>
          {statusChip.label}
        </span>
        <div className="flex-1" />
        <span className="hidden sm:flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          <Clock className="w-3 h-3" aria-hidden="true" focusable="false" />
          {formatTime(total)}
        </span>
        <Button
          size="sm"
          className="rounded-full h-8"
          disabled={state.status === "generating"}
          onClick={() => {
            const missing = checklist.filter((c) => !c.ok);
            if (missing.length) {
              toast({
                title: "Almost there",
                description: `Still needed: ${missing.map((m) => m.label).join(", ")}`,
                variant: "destructive",
              });
              return;
            }
            setGenerateOpen(true);
          }}
        >
          {state.status === "generating" ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" aria-hidden="true" focusable="false" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" focusable="false" />
          )}
          {state.status === "generated" ? "Regenerate" : "Generate video"}
        </Button>
      </div>

      {state.status === "outdated" && (
        <div className="flex items-start gap-2 px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-[1px] shrink-0" aria-hidden="true" focusable="false" />
          <p className="text-xs text-foreground">
            The script, avatar, voice, pace or language changed. The published video still plays the old version until you regenerate.
          </p>
        </div>
      )}

      {state.status === "generating" && (
        <div className="px-4 py-2.5 border-b border-border">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
            <span>Generating in the background — we'll notify you</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] items-start flex-1 min-h-0">
        {/* Stage + timeline */}
        <div className="min-w-0 h-full p-4 space-y-3 border-b lg:border-b-0 lg:border-r border-border overflow-y-auto">
          <VideoStage
            state={state}
            time={time}
            compact
            selectedId={selectedEl}
            onSelect={setSelectedEl}
            onPatchElement={patchElement}
            onPatchState={update}
            showZones={tab === "avatar" || tab === "media"}
            generated={state.status === "generated"}
          />

          {/* Free preview note */}
          <div className="flex items-center justify-end">
            <Badge variant="secondary" className="rounded-full text-[10px] font-semibold shrink-0">Live preview</Badge>
          </div>


          {/* Timeline — NLE style */}
          <NleTimeline
            total={total}
            time={time}
            onSeek={setTime}
            playing={playing}
            onTogglePlay={() => setPlaying((p) => !p)}
            tracks={[
              {
                id: "avatar",
                kind: "avatar",
                header: avatar ? avatar.name : "Avatar",
                clips: [
                  {
                    id: "avatar-clip",
                    label: avatar ? `${avatar.name} — presenter` : "Presenter",
                    start: state.avatarFullRange ? 0 : state.avatarStart,
                    end: state.avatarFullRange ? total : state.avatarEnd || total,
                    selected: false,
                    draggable: !state.avatarFullRange,
                    onChange: (st: number, en: number) =>
                      update({ avatarStart: Number(st.toFixed(1)), avatarEnd: Number(en.toFixed(1)) }),
                  },
                ],
              },
              ...(state.logo.src
                ? [
                    {
                      id: "logo",
                      kind: "image" as const,
                      header: "Logo",
                      clips: [
                        {
                          id: "logo-clip",
                          label: state.logo.name || "Logo",
                          start: state.logo.fullRange ? 0 : state.logo.start,
                          end: state.logo.fullRange ? total : state.logo.end || total,
                          selected: false,
                          draggable: !state.logo.fullRange,
                          onChange: (st: number, en: number) =>
                            update({ logo: { ...state.logo, start: Number(st.toFixed(1)), end: Number(en.toFixed(1)) } }),
                        },
                      ],
                    },
                  ]
                : []),
              // One track per on-screen element so every item can be timed independently
              ...state.elements.map((e) => {
                const w = elementWindow(state, e);
                const kind = (e.kind ?? "text") as "text" | "shape" | "image";
                const label =
                  kind === "shape"
                    ? SHAPES.find((sh) => sh.id === e.shape)?.label ?? "Shape"
                    : e.text.split("\n")[0].slice(0, 28) || (kind === "image" ? "Image" : e.style);
                return {
                  id: e.id,
                  kind,
                  header: label,
                  clips: [
                    {
                      id: e.id,
                      label,
                      start: w.start,
                      end: w.end,
                      selected: selectedEl === e.id,
                      draggable: e.staysUntil !== "video",
                      onClick: () => { setSelectedEl(e.id); setTab("media"); },
                      onChange: (st: number, en: number) => retimeElement(e.id, st, en),
                    },
                  ],
                };
              }),
              ...(state.elements.length === 0
                ? [
                    {
                      id: "graphics-empty",
                      kind: "text" as const,
                      header: "Graphics",
                      clips: [],
                      emptyHint: "Nothing on screen yet — add text, a shape or an image from the Media panel.",
                    },
                  ]
                : []),
            ]}
          />


        </div>

        {/* Properties panel */}
        <div className="min-w-0 h-full p-4 overflow-y-auto">
          <div className="relative flex items-center bg-foreground/[0.06] border border-border/50 rounded-lg p-[3px] mb-3">
            {/* Sliding pill indicator */}
            <div
              className="absolute top-[3px] bottom-[3px] rounded-md bg-background shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_-1px_rgba(0,0,0,0.05)] transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
              style={{
                width: "calc(25% - 1.5px)",
                left: `calc(${["avatar", "speech", "media", "timing"].indexOf(tab) * 25}% + 3px)`,
              }}
              aria-hidden="true"
            />
            {([
              { id: "avatar", label: "Avatar", icon: UserRound },
              { id: "speech", label: "Speech", icon: Mic2Icon },
              { id: "media", label: "Media", icon: Shapes },
              { id: "timing", label: "Output", icon: Captions },
            ] as const).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-pressed={tab === t.id}
                className={cn(
                  "relative z-10 flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-xs font-semibold rounded-md transition-colors duration-300",
                  tab === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <t.icon className="w-3 h-3" aria-hidden="true" focusable="false" />
                {t.label}
              </button>
            ))}
          </div>


          {tab === "avatar" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-border p-2.5">
                {avatar ? (
                  <img src={avatar.image} alt={`${avatar.name} avatar`} className="w-12 h-14 rounded-lg object-cover" />
                ) : (
                  <span className="w-12 h-14 rounded-lg bg-muted flex items-center justify-center">
                    <UserRound className="w-5 h-5 text-muted-foreground" aria-hidden="true" focusable="false" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">{avatar ? avatar.name : "No avatar yet"}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{avatar ? avatar.voice : "Browsing and samples are free"}</p>
                </div>
                <Button size="sm" variant="outline" className="rounded-full h-8 text-xs" onClick={() => setLibraryOpen(true)}>
                  {avatar ? "Change" : "Browse"}
                </Button>
              </div>

              <ZonePicker value={state.avatarZone} onChange={(z) => update({ avatarZone: z, avatarX: undefined, avatarY: undefined })} label="Placement zone" />
              <p className="text-[11px] text-muted-foreground -mt-2">
                Zones keep the layout predictable across languages, aspect ratios and screen sizes.
              </p>

              <div>
                <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <MoveDiagonal className="w-3 h-3" aria-hidden="true" focusable="false" /> How much of the frame the presenter fills
                </Label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[
                    { label: "25%", name: "Small", scale: 0.4 },
                    { label: "40%", name: "Medium", scale: 0.62 },
                    { label: "60%", name: "Large", scale: 0.9 },
                  ].map((s, i) => {
                    const active = state.avatarSize === i + 1;
                    return (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => update({ avatarSize: i + 1 })}
                        aria-pressed={active}
                        aria-label={`${s.name} presenter, fills about ${s.label} of the frame height`}
                        className={cn(
                          "group rounded-xl border p-2 transition-all",
                          active
                            ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                            : "border-border hover:border-primary/40 hover:bg-muted/40"
                        )}
                      >
                        {/* 16:9 mini frame with proportional presenter silhouette */}
                        <span
                          className={cn(
                            "relative flex aspect-video w-full items-end justify-center overflow-hidden rounded-lg border",
                            active ? "border-primary/30 bg-background" : "border-border bg-muted/50"
                          )}
                          aria-hidden="true"
                        >
                          <span className="flex flex-col items-center" style={{ height: `${s.scale * 100}%` }}>
                            {/* head */}
                            <span
                              className={cn("rounded-full", active ? "bg-primary" : "bg-muted-foreground/60")}
                              style={{ width: `${s.scale * 14}px`, height: `${s.scale * 14}px` }}
                            />
                            {/* shoulders */}
                            <span
                              className={cn("mt-[2px] flex-1 rounded-t-full", active ? "bg-primary" : "bg-muted-foreground/60")}
                              style={{ width: `${s.scale * 26}px` }}
                            />
                          </span>
                        </span>
                        <span className={cn("mt-1.5 block text-xs font-semibold", active ? "text-primary" : "text-foreground")}>
                          {s.name}
                        </span>
                        <span className="block text-[11px] leading-tight text-muted-foreground">≈ {s.label} of frame</span>
                      </button>
                    );
                  })}
                </div>
              </div>



              <div className="rounded-xl border border-border p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="avatar-range" className="text-xs font-medium text-foreground">On screen for the whole video</Label>
                  <Switch id="avatar-range" checked={state.avatarFullRange} onCheckedChange={(v) => update({ avatarFullRange: v, avatarEnd: v ? 0 : total })} />
                </div>
                {!state.avatarFullRange && (
                  <>
                    <div className="flex items-center gap-2">
                      <Input type="number" min={0} value={state.avatarStart} onChange={(e) => update({ avatarStart: Number(e.target.value) })} className="h-8 text-xs" aria-label="Avatar visible from (seconds)" />
                      <span className="text-xs text-muted-foreground">to</span>
                      <Input type="number" min={0} value={state.avatarEnd || total} onChange={(e) => update({ avatarEnd: Number(e.target.value) })} className="h-8 text-xs" aria-label="Avatar visible until (seconds)" />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Hiding the avatar does not stop the narration — the voice carries on over whatever else is on screen.
                    </p>
                  </>
                )}
              </div>

              {/* ---- Background (CR-01) ---- */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/40">
                  <Palette className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" focusable="false" />
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground flex-1">Background</p>
                  {state.background.mode !== "none" && (
                    <button
                      type="button"
                      onClick={() => update({ background: { ...DEFAULT_BACKGROUND } })}
                      className="text-[11px] font-medium text-muted-foreground hover:text-destructive"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="p-3 space-y-3">
                  <div className="grid grid-cols-4 gap-1.5">
                    {([
                      { id: "none", label: "Default" },
                      { id: "color", label: "Colour" },
                      { id: "preset", label: "Preset" },
                      { id: "image", label: "Upload" },
                    ] as const).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        aria-pressed={state.background.mode === m.id}
                        onClick={() => {
                          if (m.id === "image") { bgInputRef.current?.click(); return; }
                          update({ background: { ...state.background, mode: m.id } });
                        }}
                        className={cn(
                          "rounded-full border py-1.5 text-[11px] font-medium transition-all",
                          state.background.mode === m.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/40"
                        )}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {state.background.mode === "color" && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-7 gap-2">
                        {STUDIO_BG_COLORS.map((c) => {
                          const selected = state.background.color?.toLowerCase() === c.hex.toLowerCase();
                          return (
                            <button
                              key={c.hex}
                              type="button"
                              title={c.label}
                              aria-label={`Use ${c.label} background`}
                              aria-pressed={selected}
                              onClick={() => update({ background: { ...state.background, mode: "color", color: c.hex } })}
                              className={cn(
                                "group relative h-10 w-full rounded-lg border-2 transition-all duration-200",
                                selected
                                  ? "border-primary ring-2 ring-primary/25 scale-[1.02]"
                                  : "border-transparent hover:scale-[1.02] hover:border-primary/30"
                              )}
                              style={{ background: c.hex }}
                            >
                              {selected && (
                                <span className="absolute inset-0 flex items-center justify-center">
                                  <Check
                                    className={cn(
                                      "w-4 h-4 drop-shadow-md",
                                      readableTextColor(c.hex) === "#FFFFFF" ? "text-white" : "text-black"
                                    )}
                                    aria-hidden="true"
                                    focusable="false"
                                  />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={state.background.color}
                          onChange={(e) => update({ background: { ...state.background, mode: "color", color: e.target.value } })}
                          aria-label="Background colour"
                          className="h-8 w-12 rounded-md border border-border bg-background p-0.5 cursor-pointer"
                        />
                        <Input
                          value={state.background.color}
                          onChange={(e) => update({ background: { ...state.background, mode: "color", color: e.target.value } })}
                          aria-label="Background colour hex value"
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {STUDIO_BG_COLORS.find((c) => c.hex.toLowerCase() === state.background.color?.toLowerCase())?.label ?? "Custom colour"}
                      </p>
                    </div>
                  )}


                  {state.background.mode === "preset" && (
                    <div className="grid grid-cols-5 gap-1.5">
                      {CONTENT_BACKGROUNDS.filter((b) => b.id !== "default").map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          aria-label={`Use ${b.label} background`}
                          aria-pressed={state.background.presetId === b.id}
                          onClick={() => update({ background: { ...state.background, mode: "preset", presetId: b.id } })}
                          className={cn(
                            "h-10 rounded-lg border transition-all",
                            state.background.presetId === b.id
                              ? "border-primary ring-2 ring-primary/25"
                              : "border-border hover:border-primary/40"
                          )}
                          style={b.swatchStyle}
                        />
                      ))}
                    </div>
                  )}

                  {state.background.mode === "image" && state.background.image && (
                    <div className="flex items-center gap-2 rounded-lg border border-border p-2">
                      <img src={state.background.image} alt="" className="w-14 h-9 rounded object-cover" />
                      <span className="text-[11px] text-muted-foreground truncate flex-1">{state.background.imageName}</span>
                      <Button size="sm" variant="outline" className="h-7 rounded-full text-[11px]" onClick={() => bgInputRef.current?.click()}>
                        Replace
                      </Button>
                    </div>
                  )}

                  <input
                    ref={bgInputRef}
                    type="file"
                    accept={SUPPORTED_IMAGE_TYPES.join(",")}
                    className="hidden"
                    aria-label="Upload background image"
                    onChange={(e) => {
                      readImage(e.target.files?.[0], (dataUrl, name) =>
                        update({ background: { ...state.background, mode: "image", image: dataUrl, imageName: name } })
                      );
                      e.target.value = "";
                    }}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    The avatar always sits above the background. PNG, JPG, SVG or WebP up to 2 MB.
                  </p>
                </div>
              </div>

              {/* ---- Logo (CR-02) ---- */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/40">
                  <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" focusable="false" />
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground flex-1">Logo</p>
                  {state.logo.src && (
                    <button
                      type="button"
                      onClick={() => update({ logo: { ...DEFAULT_LOGO } })}
                      className="text-[11px] font-medium text-muted-foreground hover:text-destructive"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="p-3 space-y-3">
                  {state.logo.src ? (
                    <div className="flex items-center gap-2 rounded-lg border border-border p-2">
                      <img src={state.logo.src} alt="" className="w-12 h-8 object-contain" />
                      <span className="text-[11px] text-muted-foreground truncate flex-1">{state.logo.name}</span>
                      <Button size="sm" variant="outline" className="h-7 rounded-full text-[11px]" onClick={() => logoInputRef.current?.click()}>
                        Replace
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="w-full rounded-xl border-2 border-dashed border-border hover:border-primary/50 p-3 text-center transition-all"
                    >
                      <Upload className="w-4 h-4 mx-auto text-muted-foreground mb-1" aria-hidden="true" focusable="false" />
                      <p className="text-xs font-medium text-foreground">Upload a logo</p>
                      <p className="text-[11px] text-muted-foreground">PNG, JPG, SVG or WebP · up to 2 MB</p>
                    </button>
                  )}
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept={SUPPORTED_IMAGE_TYPES.join(",")}
                    className="hidden"
                    aria-label="Upload logo"
                    onChange={(e) => {
                      readImage(e.target.files?.[0], (dataUrl, name) =>
                        update({ logo: { ...state.logo, src: dataUrl, name } })
                      );
                      e.target.value = "";
                    }}
                  />

                  {state.logo.src && (
                    <>
                      <ZonePicker
                        value={state.logo.zone}
                        onChange={(z) => update({ logo: { ...state.logo, zone: z, x: undefined, y: undefined } })}
                        label="Logo zone"
                      />
                      {state.logo.zone === state.avatarZone && (
                        <p className="text-[11px] text-amber-700 dark:text-amber-400 flex items-start gap-1.5">
                          <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" aria-hidden="true" focusable="false" />
                          The logo shares a zone with the avatar — move one of them to avoid an overlap.
                        </p>
                      )}
                      <div>
                        <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Logo size</Label>
                        <div className="mt-1.5 flex gap-1.5">
                          {["Small", "Medium", "Large"].map((sz, i) => (
                            <button
                              key={sz}
                              type="button"
                              aria-pressed={state.logo.size === i + 1}
                              onClick={() => update({ logo: { ...state.logo, size: i + 1 } })}
                              className={cn(
                                "flex-1 rounded-full border py-1.5 text-[11px] font-medium transition-all",
                                state.logo.size === i + 1
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border text-muted-foreground hover:border-primary/40"
                              )}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
                        <Label htmlFor="logo-range" className="text-xs font-medium text-foreground">Show for the whole video</Label>
                        <Switch
                          id="logo-range"
                          checked={state.logo.fullRange}
                          onCheckedChange={(v) => update({ logo: { ...state.logo, fullRange: v, start: 0, end: v ? 0 : total } })}
                        />
                      </div>
                      {!state.logo.fullRange && (
                        <p className="text-[11px] text-muted-foreground">
                          Drag the logo clip on the timeline to set exactly when it appears.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === "speech" && (
            <div className="space-y-3">
              {/* Voice (CR-06) */}
              <div className="flex items-center gap-3 rounded-xl border border-border p-2.5">
                <span className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0">
                  {voice ? (
                    <img src={voice.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-muted-foreground" aria-hidden="true" focusable="false" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Voice</p>
                  <p className="text-xs font-medium text-foreground truncate">
                    {voice ? `${voice.name} · ${voice.language}` : "No voice selected"}
                  </p>
                </div>
                <Button size="sm" variant="outline" className="rounded-full h-8 text-xs" onClick={() => setVoiceOpen(true)}>
                  Change voice
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {([
                  { id: "ai", label: "Let AI write", icon: Sparkles },
                  { id: "self", label: "Write myself", icon: PenLine },
                  { id: "upload", label: "Upload audio", icon: Upload },
                ] as const).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => update({ source: r.id })}
                    aria-pressed={state.source === r.id}
                    className={cn(
                      "rounded-xl border p-2 flex flex-col items-center gap-1 text-[10px] font-medium transition-all",
                      state.source === r.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    <r.icon className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                    <span className="text-center leading-tight">{r.label}</span>
                  </button>
                ))}
              </div>

              {state.source === "ai" && (
                <div className="space-y-2">
                  <Label htmlFor="ai-topic" className="text-xs font-medium text-foreground">Topic or prompt</Label>
                  <div className="flex gap-1.5">
                    <Input
                      id="ai-topic"
                      value={state.aiTopic}
                      onChange={(e) => update({ aiTopic: e.target.value })}
                      placeholder="e.g. Spotting workplace hazards"
                      className="h-9 text-xs"
                    />
                    <Button
                      size="sm"
                      className="h-9 rounded-lg shrink-0"
                      disabled={!state.aiTopic.trim() || drafting}
                      onClick={() => {
                        setDrafting(true);
                        setTimeout(() => {
                          setDrafting(false);
                          update({ script: AI_DRAFT, scriptIsDraft: true, scriptApproved: false });
                        }, 1200);
                      }}
                    >
                      {drafting ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" focusable="false" /> : "Draft"}
                    </Button>
                  </div>
                </div>
              )}

              {state.source === "upload" && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => update({ uploadName: "hazard-intro-v2.mp3", script: AI_DRAFT, transcriptEdited: false })}
                    className="w-full rounded-xl border-2 border-dashed border-border hover:border-primary/50 p-4 text-center transition-all"
                  >
                    <Upload className="w-4 h-4 mx-auto text-muted-foreground mb-1" aria-hidden="true" focusable="false" />
                    <p className="text-xs font-medium text-foreground">{state.uploadName || "Upload an audio recording"}</p>
                    <p className="text-[11px] text-muted-foreground">MP3 or WAV · transcribed automatically</p>
                  </button>
                  <label className="flex items-start gap-2 rounded-xl border border-border p-2.5 cursor-pointer">
                    <Checkbox checked={state.rightsConfirmed} onCheckedChange={(v) => update({ rightsConfirmed: !!v })} aria-label="Confirm recording rights" />
                    <span className="text-[11px] text-muted-foreground">
                      I have the right to use this recording and the consent of the person speaking.
                    </span>
                  </label>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="vg-script" className="text-xs font-medium text-foreground">
                    {state.source === "upload" ? "Transcript (editable)" : "Script"}
                  </Label>
                  {state.scriptIsDraft && !state.scriptApproved && (
                    <Badge variant="secondary" className="rounded-full text-[10px]">AI draft</Badge>
                  )}
                </div>
                <Textarea
                  id="vg-script"
                  value={state.script}
                  onChange={(e) => update({ script: e.target.value, scriptApproved: state.scriptIsDraft ? false : state.scriptApproved })}
                  placeholder={state.source === "upload" ? "The transcript appears here once the file is processed" : "Type or paste the script the avatar will speak"}
                  className="min-h-[140px] text-xs leading-relaxed"
                />
                <div className="flex items-center justify-between mt-1.5">
                  <p className={cn("text-[11px]", words > MAX_SCRIPT_WORDS ? "text-destructive" : "text-muted-foreground")}>
                    {words} / {MAX_SCRIPT_WORDS} words · {formatTime(total)}
                    {words > MAX_SCRIPT_WORDS && ` · ${words - MAX_SCRIPT_WORDS} over`}
                  </p>
                  {state.scriptIsDraft && !state.scriptApproved && (
                    <Button size="sm" variant="outline" className="h-7 rounded-full text-[11px]" onClick={() => update({ scriptApproved: true })}>
                      <Check className="w-3 h-3 mr-1" aria-hidden="true" focusable="false" /> Save
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                    <Languages className="w-3 h-3" aria-hidden="true" focusable="false" /> Language
                  </Label>
                  <Select value={state.language} onValueChange={(v) => update({ language: v })}>
                    <SelectTrigger className="h-8 mt-1 text-xs" aria-label="Video language"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((l) => (
                        <SelectItem key={l.id} value={l.id}>{l.label}{l.rtl ? " (RTL)" : ""}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                    <Gauge className="w-3 h-3" aria-hidden="true" focusable="false" /> Pace
                  </Label>
                  <Select value={state.pace} onValueChange={(v) => update({ pace: v as VideoGenState["pace"] })}>
                    <SelectTrigger className="h-8 mt-1 text-xs" aria-label="Speaking pace"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Slow</SelectItem>
                      <SelectItem value="natural">Natural</SelectItem>
                      <SelectItem value="fast">Fast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {tab === "media" && (
            <div className="space-y-3">
              {/* Sub-section switch */}
              <div className="grid grid-cols-3 gap-1.5">
                {([
                  { id: "text", label: "Text", icon: TypeIcon },
                  { id: "shapes", label: "Shapes", icon: Shapes },
                  { id: "images", label: "Images", icon: ImageIcon },
                ] as const).map((sct) => (
                  <button
                    key={sct.id}
                    type="button"
                    onClick={() => setMediaSection(sct.id)}
                    aria-pressed={mediaSection === sct.id}
                    className={cn(
                      "rounded-full border py-1.5 flex items-center justify-center gap-1.5 text-[11px] font-medium transition-all",
                      mediaSection === sct.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    <sct.icon className="w-3 h-3" aria-hidden="true" focusable="false" />
                    {sct.label}
                  </button>
                ))}
              </div>

              {mediaSection === "text" && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full rounded-full h-8 text-xs">
                      <Plus className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" focusable="false" /> Add on-screen text
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-[280px] p-1.5">
                    <p className="px-2 py-1.5 text-[11px] text-muted-foreground">
                      Fonts and colours come from the workspace brand kit.
                    </p>
                    <div className="max-h-[260px] overflow-y-auto thin-scrollbar">
                      {TEXT_STYLES.map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => addElement(st.id)}
                          className="w-full text-left rounded-lg px-2 py-1.5 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-foreground">{st.label}</span>
                            <span className="text-[10px] text-muted-foreground">{st.limit} chars</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">{st.purpose}</p>
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {mediaSection === "shapes" && (
                <div className="grid grid-cols-4 gap-1.5">
                  {SHAPES.map((sh) => {
                    const rotate = sh.id === "arrow-left" ? "rotate-180" : sh.id === "arrow-up" ? "-rotate-90" : sh.id === "arrow-down" ? "rotate-90" : "";
                    return (
                      <button
                        key={sh.id}
                        type="button"
                        onClick={() => addShape(sh.id)}
                        aria-label={`Add ${sh.label}`}
                        className="rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 p-2 flex flex-col items-center gap-1 transition-all"
                      >
                        <sh.icon className={cn("w-4 h-4 text-foreground", rotate)} aria-hidden="true" focusable="false" />
                        <span className="text-[9px] text-muted-foreground text-center leading-tight">{sh.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {mediaSection === "images" && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="w-full rounded-xl border-2 border-dashed border-border hover:border-primary/50 p-4 text-center transition-all"
                  >
                    <Upload className="w-4 h-4 mx-auto text-muted-foreground mb-1" aria-hidden="true" focusable="false" />
                    <p className="text-xs font-medium text-foreground">Add an image to the frame</p>
                    <p className="text-[11px] text-muted-foreground">PNG, JPG, SVG or WebP · up to 2 MB</p>
                  </button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept={SUPPORTED_IMAGE_TYPES.join(",")}
                    className="hidden"
                    aria-label="Upload on-screen image"
                    onChange={(e) => {
                      readImage(e.target.files?.[0], (dataUrl, name) => addImage(dataUrl, name));
                      e.target.value = "";
                    }}
                  />
                </div>
              )}

              {state.elements.length === 0 && (
                <p className="text-[11px] text-muted-foreground">
                  Text, shapes and images all sit on their own timeline track — drag a clip to change when it appears.
                </p>
              )}

              <div className="space-y-1.5">
                {state.elements.map((e) => {
                  const Icon = e.kind === "shape" ? Shapes : e.kind === "image" ? ImageIcon : TypeIcon;
                  const label =
                    e.kind === "shape"
                      ? SHAPES.find((sh) => sh.id === e.shape)?.label ?? "Shape"
                      : e.text.split("\n")[0] || e.style;
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setSelectedEl(e.id)}
                      className={cn(
                        "w-full flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left transition-all",
                        selectedEl === e.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      )}
                    >
                      <Icon className="w-3 h-3 text-muted-foreground shrink-0" aria-hidden="true" focusable="false" />
                      <span className="text-xs text-foreground truncate flex-1">{label}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">{formatTime(elementWindow(state, e).start)}</span>
                    </button>
                  );
                })}
              </div>

              {el && (
                <div className="rounded-xl border border-border p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-foreground">
                      {el.kind === "shape"
                        ? SHAPES.find((sh) => sh.id === el.shape)?.label
                        : el.kind === "image"
                          ? "Image"
                          : elDef?.label}
                    </p>
                    <button
                      type="button"
                      onClick={() => { update({ elements: state.elements.filter((x) => x.id !== el.id) }); setSelectedEl(null); }}
                      aria-label="Delete element"
                      className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                    </button>
                  </div>

                  {(el.kind ?? "text") === "text" && elDef && (
                    <div>
                      <Label htmlFor="el-text" className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Text</Label>
                      <Textarea
                        id="el-text"
                        value={el.text}
                        maxLength={elDef.limit}
                        onChange={(ev) => patchElement(el.id, { text: ev.target.value })}
                        className="mt-1 min-h-[56px] text-xs"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1 text-right">{el.text.length}/{elDef.limit}</p>
                    </div>
                  )}

                  {el.kind === "shape" && (
                    <>
                      {el.shape === "comment" && (
                        <div>
                          <Label htmlFor="shape-text" className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Note</Label>
                          <Input
                            id="shape-text"
                            value={el.text}
                            maxLength={60}
                            onChange={(ev) => patchElement(el.id, { text: ev.target.value })}
                            className="h-8 mt-1 text-xs"
                          />
                        </div>
                      )}
                      <div>
                        <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Colour</Label>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {SHAPE_COLOURS.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => patchElement(el.id, { color: c })}
                              aria-label={`Use colour ${c}`}
                              aria-pressed={el.color === c}
                              className={cn(
                                "w-7 h-7 rounded-full border transition-all",
                                el.color === c ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/40"
                              )}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {(el.kind === "shape" || el.kind === "image") && (
                    <div>
                      <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Size</Label>
                      <div className="mt-1.5 flex gap-1.5">
                        {["Small", "Medium", "Large"].map((sz, i) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => patchElement(el.id, { size: i + 1 })}
                            aria-pressed={(el.size ?? 2) === i + 1}
                            className={cn(
                              "flex-1 rounded-full border py-1.5 text-[11px] font-medium transition-all",
                              (el.size ?? 2) === i + 1
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border text-muted-foreground hover:border-primary/40"
                            )}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <ZonePicker
                    value={el.zone}
                    onChange={(z) => patchElement(el.id, { zone: z, x: undefined, y: undefined })}
                    label="Zone"
                  />
                  {(el.kind === "shape" || el.kind === "image") && (
                    <p className="text-[10px] text-muted-foreground">
                      Drag the element on the stage to place it freely, or drag the corner dot to resize. Arrow keys nudge, + / − resize.
                    </p>
                  )}

                  <div className="flex gap-1.5">
                    {(["anchor", "fixed"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => patchElement(el.id, { timingMode: m })}
                        aria-pressed={el.timingMode === m}
                        className={cn(
                          "flex-1 rounded-full border py-1.5 text-[11px] font-medium transition-all",
                          el.timingMode === m ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                        )}
                      >
                        {m === "anchor" ? "Anchor to a word" : "Fixed time"}
                      </button>
                    ))}
                  </div>

                  {el.timingMode === "anchor" ? (
                    <div>
                      <Label htmlFor="el-anchor" className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Spoken phrase</Label>
                      <Input
                        id="el-anchor"
                        value={el.anchorPhrase}
                        onChange={(ev) => patchElement(el.id, { anchorPhrase: ev.target.value })}
                        placeholder="Paste a phrase from the script"
                        className="h-8 mt-1 text-xs"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Appears at {formatTime(anchorTime(state, el.anchorPhrase))} — it moves with the words if the script changes.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="el-start" className="text-[11px] text-muted-foreground">Start (s)</Label>
                        <Input id="el-start" type="number" min={0} value={el.start} onChange={(ev) => patchElement(el.id, { start: Number(ev.target.value) })} className="h-8 text-xs" />
                      </div>
                      <div>
                        <Label htmlFor="el-dur" className="text-[11px] text-muted-foreground">Length (s)</Label>
                        <Input id="el-dur" type="number" min={1} value={el.duration} onChange={(ev) => patchElement(el.id, { duration: Number(ev.target.value) })} className="h-8 text-xs" />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[11px] text-muted-foreground">Stays until</Label>
                      <Select value={el.staysUntil} onValueChange={(v) => patchElement(el.id, { staysUntil: v as VideoTextElement["staysUntil"] })}>
                        <SelectTrigger className="h-8 mt-1 text-xs" aria-label="Stays until"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="seconds">A number of seconds</SelectItem>
                          <SelectItem value="sentence">End of the sentence</SelectItem>
                          <SelectItem value="video">End of the video</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[11px] text-muted-foreground">Animation</Label>
                      <Select value={el.animation} onValueChange={(v) => patchElement(el.id, { animation: v as VideoTextElement["animation"] })}>
                        <SelectTrigger className="h-8 mt-1 text-xs" aria-label="Animation"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fade">Fade</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "timing" && (
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 rounded-xl border border-border p-2.5">
                <Captions className="w-4 h-4 text-muted-foreground mt-0.5" aria-hidden="true" focusable="false" />
                <div className="flex-1 min-w-0">
                  <Label htmlFor="opt-captions" className="text-xs font-medium text-foreground">Captions</Label>
                  <p className="text-[11px] text-muted-foreground">Generated from the script and shown in the player</p>
                </div>
                <Switch id="opt-captions" checked={state.captions} onCheckedChange={(v) => update({ captions: v })} />
              </div>

              <div className="rounded-xl border border-border p-3 space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Summary</p>
                <p className="text-xs text-foreground">{avatar ? avatar.name : "No avatar"} · {voice?.name ?? "No voice"} · {formatTime(total)}</p>
                <p className="text-[11px] text-muted-foreground">{state.elements.length} on-screen element{state.elements.length === 1 ? "" : "s"}{state.logo.src ? " · logo applied" : ""}{state.background.mode !== "none" ? " · custom background" : ""}</p>
              </div>

              {state.status === "generated" && (
                <Button variant="outline" size="sm" className="w-full rounded-full h-8 text-xs" onClick={() => toast({ title: "Download prepared", description: "A plain file loses captions and in-course search." })}>
                  <Download className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" focusable="false" /> Download video file
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
          </div>
        </DialogContent>
      </Dialog>



      <VoiceLibraryDialog
        open={voiceOpen}
        onOpenChange={setVoiceOpen}
        voices={VOICE_LIBRARY}
        currentVoiceId={state.voiceId}
        favourites={[]}
        onToggleFavourite={() => {}}
        onSelect={(id) => { update({ voiceId: id }); setVoiceOpen(false); }}
      />

      <AvatarLibraryDialog
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        selectedId={state.avatarId}
        onSelect={(id) => update({ avatarId: id })}
      />

      {/* Generate confirmation */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Generate this video</DialogTitle>
            <DialogDescription>Everything is checked before the video is built.</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {checklist.map((c) => (
              <div key={c.id} className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2">
                <span className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0", c.ok ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground")}>
                  {c.ok ? <Check className="w-3 h-3" aria-hidden="true" focusable="false" /> : <AlertTriangle className="w-3 h-3" aria-hidden="true" focusable="false" />}
                </span>
                <span className="text-xs text-foreground">{c.label}</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Estimated length</span>
              <span className="font-semibold text-foreground">{formatTime(total)}</span>
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3" aria-hidden="true" focusable="false" />
              It runs in the background — you can leave the page and we'll notify you when it's done.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" className="rounded-full" onClick={() => setGenerateOpen(false)}>Cancel</Button>
            <Button className="rounded-full" disabled={!ready} onClick={runGenerate}>
              <Sparkles className="w-4 h-4 mr-1.5" aria-hidden="true" focusable="false" />
              Generate video
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>

  );
}

/* small inline icon to avoid an extra import name clash */
function Mic2Icon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden="true" focusable="false">
      <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10a7 7 0 0 1-14 0M12 17v5" />
    </svg>
  );
}

type NleClip = {
  id: string;
  label: string;
  start: number;
  end: number;
  selected?: boolean;
  draggable?: boolean;
  onClick?: () => void;
  onChange?: (start: number, end: number) => void;
};

type NleTrack = {
  id: string;
  kind: "avatar" | "text" | "shape" | "image";
  header: string;
  clips: NleClip[];
  emptyHint?: string;
};

const TRACK_ICON = {
  avatar: UserRound,
  text: TypeIcon,
  shape: Shapes,
  image: ImageIcon,
} as const;

function NleTimeline({
  total,
  time,
  onSeek,
  playing,
  onTogglePlay,
  tracks,
}: {
  total: number;
  time: number;
  onSeek: (t: number) => void;
  playing: boolean;
  onTogglePlay: () => void;
  tracks: NleTrack[];
}) {
  const trackAreaRef = useRef<HTMLDivElement>(null);
  const safeTotal = Math.max(total, 1);
  const pct = Math.min(time / safeTotal, 1) * 100;

  const seekFromEvent = (clientX: number) => {
    const el = trackAreaRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const ratio = Math.min(Math.max((clientX - r.left) / r.width, 0), 1);
    onSeek(Number((ratio * safeTotal).toFixed(2)));
  };

  // Ruler ticks — aim for ~10 major divisions
  const step = safeTotal <= 12 ? 1 : safeTotal <= 30 ? 5 : safeTotal <= 90 ? 10 : 30;
  const ticks: number[] = [];
  for (let t = 0; t <= safeTotal; t += step) ticks.push(t);

  return (
    <div className="dark rounded-xl border border-border bg-card overflow-hidden shadow-[0_10px_30px_-18px_rgba(0,0,0,0.9)]">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 h-10 bg-muted/40 border-b border-border">
        <button
          type="button"
          onClick={onTogglePlay}
          aria-label={playing ? "Pause preview" : "Play preview"}
          className="w-6 h-6 rounded-[5px] bg-primary text-primary-foreground flex items-center justify-center hover:brightness-110 transition"
        >
          {playing
            ? <Pause className="w-3 h-3" aria-hidden="true" focusable="false" />
            : <Play className="w-3 h-3 ml-[1px]" aria-hidden="true" focusable="false" />}
        </button>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Timeline</span>
        <span className="ml-auto font-mono text-[12px] tabular-nums text-foreground bg-background/70 border border-border rounded px-2 py-0.5">
          {formatTime(time)}
          <span className="text-muted-foreground"> / {formatTime(total)}</span>
        </span>
      </div>

      <div className="flex">
        {/* Track headers */}
        <div className="w-[124px] shrink-0 border-r border-border bg-muted/25">
          <div className="h-6 border-b border-border" aria-hidden="true" />
          {tracks.map((tr, i) => (
            <div
              key={tr.id}
              className="h-[46px] flex items-center gap-2 px-2.5 border-b border-border/70 last:border-b-0"
            >
              {(() => {
                const Icon = TRACK_ICON[tr.kind];
                return (
                  <span
                    className={cn(
                      "w-5 h-5 rounded-[5px] flex items-center justify-center shrink-0",
                      tr.kind === "avatar" ? "bg-primary/20 text-primary" : "bg-foreground/10 text-foreground"
                    )}
                    aria-hidden="true"
                  >
                    <Icon className="w-3 h-3" aria-hidden="true" focusable="false" />
                  </span>
                );
              })()}
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold text-foreground truncate">{tr.header}</span>
                <span className="block text-[9px] uppercase tracking-wider text-muted-foreground">
                  V{i + 1}
                </span>
              </span>
            </div>
          ))}
        </div>

        {/* Track area */}
        <div
          ref={trackAreaRef}
          className="relative flex-1 min-w-0 cursor-col-resize select-none"
          onPointerDown={(e) => {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            seekFromEvent(e.clientX);
          }}
          onPointerMove={(e) => { if (e.buttons === 1) seekFromEvent(e.clientX); }}
        >
          {/* Ruler */}
          <div className="relative h-6 border-b border-border bg-background/40">
            {ticks.map((t) => (
              <div
                key={t}
                className="absolute top-0 bottom-0 border-l border-border/70"
                style={{ left: `${(t / safeTotal) * 100}%` }}
                aria-hidden="true"
              >
                <span className="absolute left-1 top-[3px] font-mono text-[9px] text-muted-foreground">
                  {formatTime(t)}
                </span>
              </div>
            ))}
          </div>

          {/* Lanes */}
          {tracks.map((tr) => (
            <div
              key={tr.id}
              className="relative h-[46px] border-b border-border/70 last:border-b-0 bg-background/20"
            >
              {/* grid lines */}
              {ticks.map((t) => (
                <div
                  key={t}
                  className="absolute top-0 bottom-0 border-l border-border/40"
                  style={{ left: `${(t / safeTotal) * 100}%` }}
                  aria-hidden="true"
                />
              ))}

              {tr.clips.length === 0 && tr.emptyHint && (
                <p className="absolute inset-0 flex items-center px-3 text-[10px] text-muted-foreground">
                  {tr.emptyHint}
                </p>
              )}

              {tr.clips.map((c) => {
                const left = (c.start / safeTotal) * 100;
                const width = Math.max(((c.end - c.start) / safeTotal) * 100, 3);

                /** Drag the clip body (move) or an edge handle (trim), clamped to the video. */
                const beginDrag = (
                  e: React.PointerEvent,
                  mode: "move" | "left" | "right"
                ) => {
                  if (!c.draggable || !c.onChange) return;
                  e.stopPropagation();
                  e.preventDefault();
                  const area = trackAreaRef.current;
                  if (!area) return;
                  const rect = area.getBoundingClientRect();
                  const startX = e.clientX;
                  const s0 = c.start;
                  const e0 = c.end;
                  const toSec = (dx: number) => (dx / rect.width) * safeTotal;

                  const onMove = (ev: PointerEvent) => {
                    const d = toSec(ev.clientX - startX);
                    if (mode === "move") {
                      const len = e0 - s0;
                      const ns = Math.min(Math.max(0, s0 + d), Math.max(0, safeTotal - len));
                      c.onChange!(ns, ns + len);
                    } else if (mode === "left") {
                      const ns = Math.min(Math.max(0, s0 + d), e0 - 0.5);
                      c.onChange!(ns, e0);
                    } else {
                      const ne = Math.max(Math.min(safeTotal, e0 + d), s0 + 0.5);
                      c.onChange!(s0, ne);
                    }
                  };
                  const onUp = () => {
                    window.removeEventListener("pointermove", onMove);
                    window.removeEventListener("pointerup", onUp);
                  };
                  window.addEventListener("pointermove", onMove);
                  window.addEventListener("pointerup", onUp);
                };

                return (
                  <div
                    key={c.id}
                    role="button"
                    tabIndex={0}
                    onPointerDown={(e) => { e.stopPropagation(); beginDrag(e, "move"); }}
                    onClick={c.onClick}
                    onKeyDown={(ev) => {
                      if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); c.onClick?.(); return; }
                      if (!c.draggable || !c.onChange) return;
                      const len = c.end - c.start;
                      if (ev.key === "ArrowLeft") {
                        ev.preventDefault();
                        const ns = Math.max(0, c.start - 0.5);
                        c.onChange(ns, ns + len);
                      }
                      if (ev.key === "ArrowRight") {
                        ev.preventDefault();
                        const ns = Math.min(safeTotal - len, c.start + 0.5);
                        c.onChange(ns, ns + len);
                      }
                    }}
                    aria-label={`${c.label}, ${formatTime(c.start)} to ${formatTime(c.end)}${c.draggable ? ". Drag or use the arrow keys to move it." : ""}`}
                    className={cn(
                      "group absolute top-[5px] bottom-[5px] rounded-[6px] overflow-hidden text-left transition-shadow",
                      "border",
                      tr.kind === "avatar"
                        ? "border-primary/60 bg-gradient-to-b from-primary/70 to-primary/40"
                        : "border-foreground/25 bg-gradient-to-b from-foreground/35 to-foreground/20",
                      c.selected && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                      c.draggable ? "cursor-grab active:cursor-grabbing" : "cursor-default",
                      (c.onClick || c.draggable) && "hover:brightness-110"
                    )}
                    style={{ left: `${left}%`, width: `${Math.min(width, 100 - left)}%` }}
                  >
                    {c.draggable && (
                      <>
                        <span
                          role="presentation"
                          onPointerDown={(e) => beginDrag(e, "left")}
                          className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                        <span
                          role="presentation"
                          onPointerDown={(e) => beginDrag(e, "right")}
                          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </>
                    )}
                    {/* clip top strip */}
                    <span
                      className={cn(
                        "absolute inset-x-0 top-0 h-[3px]",
                        tr.kind === "avatar" ? "bg-primary" : "bg-foreground/60"
                      )}
                      aria-hidden="true"
                    />
                    <span className="absolute inset-0 flex items-center px-2.5 pt-[3px] pointer-events-none">
                      <span className="text-[10px] font-semibold text-background dark:text-foreground truncate drop-shadow-sm">
                        {c.label}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Playhead */}
          <div
            className="pointer-events-none absolute top-0 bottom-0 z-20"
            style={{ left: `${pct}%` }}
            aria-hidden="true"
          >
            <div className="absolute -top-[1px] -left-[5px] w-[10px] h-[9px] rounded-[2px] bg-primary shadow" />
            <div className="absolute top-0 bottom-0 w-[2px] -left-[1px] bg-primary/90" />
          </div>
        </div>
      </div>
    </div>
  );
}


export function VideoGenerationPreview({ content }: { content: string }) {
  const state = useMemo(() => parseVideoGenContent(content), [content]);
  const total = estimateDuration(state);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showCaptions, setShowCaptions] = useState(state.captions);
  const [showTranscript, setShowTranscript] = useState(false);

  const sentences = useMemo(
    () => state.script.split(/(?<=[.!?])\s+/).filter(Boolean),
    [state.script]
  );

  useEffect(() => {
    if (!playing || total === 0) return;
    const id = window.setInterval(() => {
      setTime((t) => {
        if (t >= total) { setPlaying(false); return total; }
        return t + 0.25;
      });
    }, 250);
    return () => window.clearInterval(id);
  }, [playing, total]);

  const perSentence = sentences.length ? total / sentences.length : 0;
  const caption = perSentence ? sentences[Math.min(sentences.length - 1, Math.floor(time / perSentence))] : "";

  if (!state.avatarId && !state.script) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        This video block has not been set up yet.
      </div>
    );
  }

  return (
    <figure className="w-full rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
      <div className="relative">
        <VideoStage state={state} time={time} generated={state.status === "generated"} />

        {!playing && (
          <button
            type="button"
            onClick={() => { if (time >= total) setTime(0); setPlaying(true); }}
            aria-label="Play video"
            className="absolute inset-0 flex items-center justify-center bg-foreground/25 backdrop-blur-[1px] transition-opacity hover:bg-foreground/35"
          >
            <span className="w-14 h-14 rounded-full bg-background/95 flex items-center justify-center shadow-xl">
              <Play className="w-6 h-6 ml-1 text-foreground" aria-hidden="true" focusable="false" />
            </span>
          </button>
        )}

        {showCaptions && caption && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center px-6 pointer-events-none">
            <p className="rounded-lg bg-foreground/80 text-background text-sm px-3 py-1.5 max-w-[85%] text-center [overflow-wrap:anywhere]">
              {caption}
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 px-3 py-2.5 border-t border-border">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause video" : "Play video"}
          className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0"
        >
          {playing ? <Pause className="w-4 h-4" aria-hidden="true" focusable="false" /> : <Play className="w-4 h-4 ml-[1px]" aria-hidden="true" focusable="false" />}
        </button>
        <span className="text-[11px] tabular-nums text-muted-foreground">{formatTime(time)}</span>
        <Slider value={[Math.min(time, total)]} max={Math.max(total, 1)} step={0.25} onValueChange={(v) => setTime(v[0])} aria-label="Seek video" className="flex-1" />
        <span className="text-[11px] tabular-nums text-muted-foreground">{formatTime(total)}</span>
        <button
          type="button"
          onClick={() => setShowCaptions((c) => !c)}
          aria-label="Toggle captions"
          aria-pressed={showCaptions}
          className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-colors", showCaptions ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted")}
        >
          <Captions className="w-4 h-4" aria-hidden="true" focusable="false" />
        </button>
        <button
          type="button"
          onClick={() => setTime(0)}
          aria-label="Restart video"
          className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" focusable="false" />
        </button>
      </div>

      {state.script && (
        <div className="border-t border-border">
          <button
            type="button"
            onClick={() => setShowTranscript((s) => !s)}
            aria-expanded={showTranscript}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <FileText className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
            {showTranscript ? "Hide written version" : "Read the written version"}
          </button>
          {showTranscript && (
            <div className="px-4 pb-4 space-y-2">
              {sentences.map((s, i) => (
                <p
                  key={i}
                  className={cn(
                    "text-sm leading-relaxed [overflow-wrap:anywhere] transition-colors",
                    perSentence && Math.floor(time / perSentence) === i ? "text-foreground font-medium" : "text-muted-foreground"
                  )}
                >
                  {s}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </figure>
  );
}

export default VideoGenerationBlock;
