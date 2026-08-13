import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Search,
  Check,
  Loader2,
  Sparkles,
  Type as TypeIcon,
  Upload,
  PenLine,
  Clock,
  Coins,
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
  Eye,
  MoveDiagonal,
  RotateCcw,
  Download,
  Settings2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
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

export interface VideoTextElement {
  id: string;
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
  elements: VideoTextElement[];
  status: "draft" | "generating" | "generated" | "outdated";
  paidSignature: string;
  captions: boolean;
  writtenVersion: boolean;
  audioOnly: boolean;
}

export const MAX_SCRIPT_WORDS = 900;
export const MAX_DURATION_SEC = 360;
const COST_PER_MINUTE = 4;
const ALLOWANCE_MINUTES = 60;
const USED_MINUTES = 23.5;

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
  elements: [],
  status: "draft",
  paidSignature: "",
  captions: true,
  writtenVersion: true,
  audioOnly: false,
};

export function parseVideoGenContent(raw?: string): VideoGenState {
  if (!raw) return { ...EMPTY_STATE };
  try {
    const stripped = raw.replace(/^<!--videogen:/, "").replace(/-->$/, "");
    const parsed = JSON.parse(stripped);
    return { ...EMPTY_STATE, ...parsed, elements: Array.isArray(parsed.elements) ? parsed.elements : [] };
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
  const base = "pointer-events-none max-w-[70%] shadow-lg";
  switch (el.style) {
    case "title":
      return (
        <span className={cn(base, "font-bold tracking-tight text-primary-foreground drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]", compact ? "text-base" : "text-3xl")}>
          {el.text}
        </span>
      );
    case "subtitle":
      return (
        <span className={cn(base, "font-medium text-primary-foreground/90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]", compact ? "text-[10px]" : "text-lg")}>
          {el.text}
        </span>
      );
    case "bullets":
      return (
        <div className={cn(base, "rounded-xl bg-background/90 backdrop-blur-md border border-border px-3 py-2 space-y-1", compact ? "text-[9px]" : "text-sm")}>
          {el.text.split("\n").slice(0, 4).map((line, i) => (
            <div key={i} className="flex items-start gap-1.5 text-foreground">
              <span className="mt-[6px] w-1 h-1 rounded-full bg-primary shrink-0" aria-hidden="true" />
              <span className="[overflow-wrap:anywhere]">{line}</span>
            </div>
          ))}
        </div>
      );
    case "bubble":
      return (
        <div className={cn(base, "relative rounded-2xl bg-background/95 border border-border px-3 py-2 text-foreground", compact ? "text-[9px]" : "text-sm")}>
          {el.text}
          <span className="absolute -bottom-1 left-5 w-2.5 h-2.5 rotate-45 bg-background border-b border-r border-border" aria-hidden="true" />
        </div>
      );
    case "chip":
      return (
        <span className={cn(base, "rounded-full bg-primary text-primary-foreground font-semibold px-3 py-1", compact ? "text-[9px]" : "text-sm")}>
          {el.text}
        </span>
      );
    case "lower-third":
      return (
        <div className={cn(base, "rounded-md bg-primary/90 text-primary-foreground px-3 py-1.5 border-l-4 border-primary-foreground/70", compact ? "text-[9px]" : "text-sm")}>
          <span className="font-semibold">{el.text}</span>
        </div>
      );
    case "callout":
      return (
        <div className={cn(base, "flex items-center gap-1.5 rounded-lg bg-accent text-accent-foreground px-2.5 py-1.5 font-medium", compact ? "text-[9px]" : "text-sm")}>
          <span aria-hidden="true">➜</span>
          {el.text}
        </div>
      );
    case "quote":
    default:
      return (
        <span className={cn(base, "italic text-primary-foreground border-l-2 border-primary pl-3", compact ? "text-[9px]" : "text-base")}>
          “{el.text}”
        </span>
      );
  }
}

export function VideoStage({
  state,
  time,
  compact,
  selectedId,
  onSelect,
  showZones,
  generated,
}: {
  state: VideoGenState;
  time: number;
  compact?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  showZones?: boolean;
  generated?: boolean;
}) {
  const avatar = getAvatar(state.avatarId);
  const total = estimateDuration(state);
  const rtl = LANGUAGES.find((l) => l.id === state.language)?.rtl;
  const avatarVisible =
    state.avatarFullRange || (time >= state.avatarStart && time <= (state.avatarEnd || total));

  const sizePct = [18, 26, 36][state.avatarSize - 1] ?? 26;

  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      className="relative w-full aspect-video rounded-xl overflow-hidden bg-[linear-gradient(150deg,hsl(var(--foreground)/0.92),hsl(var(--primary)/0.55))]"
    >
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
            className={cn("pointer-events-none absolute inset-0 flex p-3", zoneClass[state.avatarZone])}
          >
            <div
              className="relative rounded-xl overflow-hidden ring-2 ring-primary-foreground/30 shadow-2xl"
              style={{ width: `${sizePct}%` }}
            >
              <img
                src={avatar.image}
                alt={`${avatar.name} presenter avatar`}
                className="w-full h-full object-cover aspect-[3/4]"
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

      {/* Text elements */}
      {state.elements.map((el) => {
        const { start, end } = elementWindow(state, el);
        const visible = time >= start && time <= end;
        if (!visible) return null;
        return (
          <motion.div
            key={el.id}
            initial={el.animation === "fade" ? { opacity: 0, y: 8 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn("pointer-events-none absolute inset-0 flex p-4", zoneClass[el.zone])}
          >
            <button
              type="button"
              onClick={() => onSelect?.(el.id)}
              disabled={!onSelect}
              aria-label={`Select ${el.style} element`}
              className={cn(
                "pointer-events-auto rounded-lg",
                onSelect && "cursor-pointer",
                selectedId === el.id && "ring-2 ring-primary ring-offset-2 ring-offset-transparent"
              )}
            >
              <TextElementChip el={el} compact={compact} />
            </button>
          </motion.div>
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
                <img src={a.image} alt={`${a.name} avatar`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setPlaying(playing === a.id ? null : a.id);
                    toast({ title: `Sample clip — ${a.name}`, description: "Pre-recorded sample. No generation used." });
                  }}
                  aria-label={`Play sample clip for ${a.name}`}
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
  const [tab, setTab] = useState<"avatar" | "speech" | "text" | "timing">("avatar");
  const [editorOpen, setEditorOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
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
  const costMinutes = Math.max(total / 60, 0);
  const cost = Math.max(1, Math.ceil(costMinutes * COST_PER_MINUTE));

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
    toast({ title: "Video ready", description: "Captions and the written version were generated free of charge." });
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
    setTab("text");
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
        <DialogContent className="max-w-[1440px] w-[97vw] max-h-[92vh] overflow-hidden p-0 gap-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Configure video generation</DialogTitle>
            <DialogDescription>Choose an avatar, write the script, add on-screen text and generate the video.</DialogDescription>
          </DialogHeader>
          <div className="w-full max-h-[92vh] overflow-y-auto lg:overflow-hidden">
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
        <span className="flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          <Coins className="w-3 h-3" aria-hidden="true" focusable="false" />
          {cost} credits to generate
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

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] items-start">
        {/* Stage + timeline */}
        <div className="min-w-0 p-4 space-y-3 border-b lg:border-b-0 lg:border-r border-border overflow-y-auto lg:max-h-[calc(92vh-120px)]">
          <VideoStage
            state={state}
            time={time}
            compact
            selectedId={selectedEl}
            onSelect={setSelectedEl}
            showZones={tab === "avatar" || tab === "text"}
            generated={state.status === "generated"}
          />

          {/* Free preview controls */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              disabled={total === 0}
              aria-label={playing ? "Pause preview" : "Play preview"}
              className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 disabled:opacity-40"
            >
              {playing ? <Pause className="w-4 h-4" aria-hidden="true" focusable="false" /> : <Play className="w-4 h-4 ml-[1px]" aria-hidden="true" focusable="false" />}
            </button>
            <span className="text-[11px] tabular-nums text-muted-foreground w-9">{formatTime(time)}</span>
            <Slider
              value={[Math.min(time, total)]}
              max={Math.max(total, 1)}
              step={0.25}
              onValueChange={(v) => setTime(v[0])}
              aria-label="Preview position"
              className="flex-1"
            />
            <span className="text-[11px] tabular-nums text-muted-foreground w-9 text-right">{formatTime(total)}</span>
            <Badge variant="secondary" className="rounded-full text-[10px] font-semibold shrink-0">Preview is free</Badge>
          </div>

          {/* Timeline lanes */}
          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Timeline</p>
            <div className="relative">
              <div className="space-y-1.5">
                <TimelineLane
                  label={avatar ? avatar.name : "Avatar"}
                  total={total}
                  start={state.avatarFullRange ? 0 : state.avatarStart}
                  end={state.avatarFullRange ? total : state.avatarEnd || total}
                  tone="primary"
                />
                {state.elements.map((e) => {
                  const w = elementWindow(state, e);
                  return (
                    <TimelineLane
                      key={e.id}
                      label={e.text.split("\n")[0].slice(0, 22) || e.style}
                      total={total}
                      start={w.start}
                      end={w.end}
                      tone={selectedEl === e.id ? "primary" : "muted"}
                      onClick={() => { setSelectedEl(e.id); setTab("text"); }}
                    />
                  );
                })}
                {state.elements.length === 0 && (
                  <p className="text-[11px] text-muted-foreground">No on-screen text yet — add one from the panel.</p>
                )}
              </div>
              {/* Playhead — confined to the lane track so it never overlaps the stage */}
              <div className="pointer-events-none absolute inset-y-0 left-[112px] right-0" aria-hidden="true">
                <div
                  className="absolute inset-y-0 w-px bg-primary"
                  style={{ left: `${(total ? Math.min(time / total, 1) : 0) * 100}%` }}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Properties panel */}
        <div className="min-w-0 p-4 overflow-y-auto lg:max-h-[calc(92vh-120px)]">
          <div className="grid grid-cols-4 gap-1 rounded-full bg-muted p-1 mb-3">
            {([
              { id: "avatar", label: "Avatar", icon: UserRound },
              { id: "speech", label: "Speech", icon: Mic2Icon },
              { id: "text", label: "Text", icon: TypeIcon },
              { id: "timing", label: "Output", icon: Captions },
            ] as const).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-pressed={tab === t.id}
                className={cn(
                  "flex items-center justify-center gap-1 rounded-full py-1.5 text-[11px] font-medium transition-all",
                  tab === t.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
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

              <ZonePicker value={state.avatarZone} onChange={(z) => update({ avatarZone: z })} label="Placement zone" />
              <p className="text-[11px] text-muted-foreground -mt-2">
                Zones keep the layout predictable across languages, aspect ratios and screen sizes.
              </p>

              <div>
                <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <MoveDiagonal className="w-3 h-3" aria-hidden="true" focusable="false" /> Size
                </Label>
                <div className="mt-1.5 flex gap-1.5">
                  {["Small", "Medium", "Large"].map((s, i) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => update({ avatarSize: i + 1 })}
                      aria-pressed={state.avatarSize === i + 1}
                      className={cn(
                        "flex-1 rounded-full border py-1.5 text-[11px] font-medium transition-all",
                        state.avatarSize === i + 1 ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                      )}
                    >
                      {s}
                    </button>
                  ))}
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
            </div>
          )}

          {tab === "speech" && (
            <div className="space-y-3">
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
                      <Check className="w-3 h-3 mr-1" aria-hidden="true" focusable="false" /> Approve draft
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

          {tab === "text" && (
            <div className="space-y-3">
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
                    {TEXT_STYLES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => addElement(s.id)}
                        className="w-full text-left rounded-lg px-2 py-1.5 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-foreground">{s.label}</span>
                          <span className="text-[10px] text-muted-foreground">{s.limit} chars</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{s.purpose}</p>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {state.elements.length === 0 && (
                <p className="text-[11px] text-muted-foreground">
                  On-screen labels carry a term, a number or a name — captions handle the full narration.
                </p>
              )}

              <div className="space-y-1.5">
                {state.elements.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setSelectedEl(e.id)}
                    className={cn(
                      "w-full flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left transition-all",
                      selectedEl === e.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    )}
                  >
                    <TypeIcon className="w-3 h-3 text-muted-foreground shrink-0" aria-hidden="true" focusable="false" />
                    <span className="text-xs text-foreground truncate flex-1">{e.text.split("\n")[0] || e.style}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{formatTime(elementWindow(state, e).start)}</span>
                  </button>
                ))}
              </div>

              {el && elDef && (
                <div className="rounded-xl border border-border p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-foreground">{elDef.label}</p>
                    <button
                      type="button"
                      onClick={() => { update({ elements: state.elements.filter((x) => x.id !== el.id) }); setSelectedEl(null); }}
                      aria-label="Delete element"
                      className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                    </button>
                  </div>

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

                  <ZonePicker value={el.zone} onChange={(z) => patchElement(el.id, { zone: z })} label="Zone" />

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

                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-3 h-3" aria-hidden="true" focusable="false" />
                    Restyling and re-timing never costs a generate.
                  </p>
                </div>
              )}
            </div>
          )}

          {tab === "timing" && (
            <div className="space-y-3">
              {[
                { key: "captions" as const, icon: Captions, label: "Captions", hint: "Generated from the script, free" },
                { key: "writtenVersion" as const, icon: FileText, label: "Written version", hint: "Readable and searchable across the course" },
                { key: "audioOnly" as const, icon: Eye, label: "Audio-only version", hint: "For learners on poor connections" },
              ].map((o) => (
                <div key={o.key} className="flex items-start gap-2.5 rounded-xl border border-border p-2.5">
                  <o.icon className="w-4 h-4 text-muted-foreground mt-0.5" aria-hidden="true" focusable="false" />
                  <div className="flex-1 min-w-0">
                    <Label htmlFor={`opt-${o.key}`} className="text-xs font-medium text-foreground">{o.label}</Label>
                    <p className="text-[11px] text-muted-foreground">{o.hint}</p>
                  </div>
                  <Switch id={`opt-${o.key}`} checked={state[o.key]} onCheckedChange={(v) => update({ [o.key]: v } as Partial<VideoGenState>)} />
                </div>
              ))}

              <div className="rounded-xl border border-border overflow-hidden">
                <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted/40">
                  What costs money
                </p>
                <div className="p-3 space-y-2">
                  <p className="text-[11px] text-foreground flex items-start gap-1.5">
                    <Check className="w-3 h-3 mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" focusable="false" />
                    Free: browsing avatars, sample clips, writing or drafting the script, previewing, moving the avatar, adding or re-timing text.
                  </p>
                  <p className="text-[11px] text-foreground flex items-start gap-1.5">
                    <Coins className="w-3 h-3 mt-0.5 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" focusable="false" />
                    Paid: generating the video, and generating again after a change to the script, avatar, voice, pace or language.
                  </p>
                </div>
              </div>

              {state.status === "generated" && (
                <Button variant="outline" size="sm" className="w-full rounded-full h-8 text-xs" onClick={() => toast({ title: "Download prepared", description: "A plain file loses captions, the written version and course search." })}>
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
            <DialogDescription>Everything is checked and priced before anything runs.</DialogDescription>
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
              <span className="text-muted-foreground">Estimated cost</span>
              <span className="font-semibold text-foreground">{cost} credits · {formatTime(total)}</span>
            </div>
            <div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                <span>Team allowance this month</span>
                <span>{Math.round(ALLOWANCE_MINUTES - USED_MINUTES)} of {ALLOWANCE_MINUTES} min left</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(USED_MINUTES / ALLOWANCE_MINUTES) * 100}%` }} />
              </div>
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
              Generate for {cost} credits
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

function TimelineLane({
  label,
  total,
  start,
  end,
  tone,
  onClick,
}: {
  label: string;
  total: number;
  start: number;
  end: number;
  tone: "primary" | "muted";
  onClick?: () => void;
}) {
  const left = total ? (start / total) * 100 : 0;
  const width = total ? Math.max(((end - start) / total) * 100, 4) : 100;
  return (
    <div className="flex items-center gap-2">
      <span className="w-[104px] shrink-0 text-[10px] text-muted-foreground truncate">{label}</span>
      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        aria-label={`${label} appears from ${formatTime(start)} to ${formatTime(end)}`}
        className="relative flex-1 h-5 rounded-md bg-muted overflow-hidden"
      >
        <span
          className={cn(
            "absolute top-0 bottom-0 rounded-md",
            tone === "primary" ? "bg-gradient-to-r from-primary to-primary/70" : "bg-foreground/25"
          )}
          style={{ left: `${left}%`, width: `${Math.min(width, 100 - left)}%` }}
        />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Learner-facing preview                                              */
/* ------------------------------------------------------------------ */

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

      {state.writtenVersion && state.script && (
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
