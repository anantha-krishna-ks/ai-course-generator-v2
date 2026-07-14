import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Settings2,
  MoveVertical,
  StickyNote,
  AlertTriangle,
  Lightbulb,
  GraduationCap,
  ShieldCheck,
  KeyRound,
  Check,
  Pencil,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Layout Utility Blocks — visual page-flow helpers (dividers, spacing,
 * continue, info cards). Stored as type="text" with a variant so we don't
 * need to widen the block union across the whole codebase.
 */
export type LayoutUtilityVariant =
  | "divider-line"
  | "divider-numbered"
  | "spacer"
  | "continue-button"
  | "info-card";

export function isLayoutUtilityVariant(v?: string): v is LayoutUtilityVariant {
  return (
    v === "divider-line" ||
    v === "divider-numbered" ||
    v === "spacer" ||
    v === "continue-button" ||
    v === "info-card"
  );
}

export const layoutUtilityDefaults: Record<LayoutUtilityVariant, string> = {
  "divider-line": JSON.stringify({ style: "ornament" }),
  "divider-numbered": JSON.stringify({ number: 1, label: "" }),
  spacer: JSON.stringify({ height: 40 }),
  "continue-button": JSON.stringify({ label: "Continue" }),
  "info-card": JSON.stringify({ kind: "", body: "" }),
};

function safeParse<T extends Record<string, unknown>>(content: string, fallback: T): T {
  try {
    const raw = JSON.parse(content || "{}");
    return { ...fallback, ...raw };
  } catch {
    return fallback;
  }
}

interface Props {
  variant: LayoutUtilityVariant;
  content: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
  onContinueClick?: () => void;
}

export function LayoutUtilityBlock({ variant, content, onChange, readOnly, onContinueClick }: Props) {
  switch (variant) {
    case "divider-line":
      return <DividerLine content={content} onChange={onChange} readOnly={readOnly} />;
    case "divider-numbered":
      return <DividerNumbered content={content} onChange={onChange} readOnly={readOnly} />;
    case "spacer":
      return <Spacer content={content} onChange={onChange} readOnly={readOnly} />;
    case "continue-button":
      return (
        <ContinueButton content={content} onChange={onChange} readOnly={readOnly} onClick={onContinueClick} />
      );
    case "info-card":
      return <InfoCard content={content} onChange={onChange} readOnly={readOnly} />;
  }
}

/* ---------- Simple Line ----------
 * Elegant hairline with an optional center ornament. On hover, a discreet
 * settings pill fades in over the line center.
 */

type LineStyle = "solid" | "dashed" | "dotted" | "double" | "ornament";

function DividerLine({ content, onChange, readOnly }: Omit<Props, "variant" | "onContinueClick">) {
  const data = safeParse(content, { style: "ornament" as LineStyle });
  const set = (patch: Partial<typeof data>) => onChange(JSON.stringify({ ...data, ...patch }));

  const renderLine = (style: LineStyle, className = "") => {
    if (style === "double") {
      return (
        <div className={cn("flex-1 flex flex-col gap-[5px]", className)}>
          <div className="h-[2px] w-full bg-foreground/40 rounded-full" />
          <div className="h-[2px] w-full bg-foreground/40 rounded-full" />
        </div>
      );
    }
    if (style === "ornament") {
      return (
      <div className={cn("flex-1 flex items-center gap-3", className)}>
          <div
            className="flex-1 h-0 rounded-full"
            style={{ borderTopWidth: 2.5, borderTopStyle: "dashed", borderTopColor: "hsl(var(--foreground) / 0.55)" }}
          />
          <div className="w-2 h-2 rounded-full bg-foreground/55" aria-hidden="true" />
          <div className="w-3 h-3 rotate-45 border-[2px] border-foreground/55 bg-background" aria-hidden="true" />
          <div className="w-2 h-2 rounded-full bg-foreground/55" aria-hidden="true" />
          <div
            className="flex-1 h-0 rounded-full"
            style={{ borderTopWidth: 2.5, borderTopStyle: "dashed", borderTopColor: "hsl(var(--foreground) / 0.55)" }}
          />
        </div>
      );
    }
    const thickness = style === "dotted" ? 3 : 2.5;
    return (
      <div
        className={cn("flex-1 h-0 rounded-full", className)}
        style={{
          borderTopWidth: thickness,
          borderTopStyle: style,
          borderTopColor: "hsl(var(--foreground) / 0.45)",
        }}
      />
    );
  };

  if (readOnly) {
    return <div className="w-full py-6 flex items-center">{renderLine(data.style)}</div>;
  }

  return (
    <div className="w-full py-6 relative group/util">
      <div className="flex items-center">{renderLine(data.style)}</div>
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover/util:opacity-100 transition-all duration-200 h-7 px-2.5 rounded-full border border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary/40 hover:shadow-[0_4px_12px_-4px_hsl(var(--primary)/0.35)] flex items-center gap-1.5 text-[11px] font-medium shrink-0"
            aria-label="Line divider settings"
          >
            <Settings2 className="w-3 h-3" aria-hidden="true" focusable="false" />
            <span className="capitalize">{data.style}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="center" className="w-64 p-3 space-y-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Line style</p>
          <div className="grid grid-cols-1 gap-1.5">
            {(["solid", "dashed", "dotted", "double", "ornament"] as const).map((s) => (
              <button
                key={s}
                onClick={() => set({ style: s })}
                className={cn(
                  "group flex items-center gap-3 px-2.5 py-2 rounded-lg border text-[12px] capitalize transition-all",
                  data.style === s
                    ? "border-primary/50 bg-primary/5 text-foreground shadow-[0_1px_2px_hsl(var(--primary)/0.1)]"
                    : "border-transparent hover:border-border hover:bg-muted/60 text-foreground",
                )}
                aria-pressed={data.style === s}
              >
                <span className="w-14 shrink-0 font-medium">{s}</span>
                <div className="flex-1 flex items-center min-w-0">{renderLine(s)}</div>
                {data.style === s && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/* ---------- Numbered Divider ----------
 * Milestone marker: gradient line, ornamental dots, elevated pill with a
 * gradient-numbered chip and inline-editable label.
 */

function DividerNumbered({ content, onChange, readOnly }: Omit<Props, "variant" | "onContinueClick">) {
  const data = safeParse(content, { number: 1, label: "" });
  const [label, setLabel] = useState(String(data.label ?? ""));
  const [num, setNum] = useState(String(data.number ?? 1));

  useEffect(() => {
    setLabel(String(data.label ?? ""));
    setNum(String(data.number ?? 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const commit = (patch: Partial<{ number: number; label: string }>) =>
    onChange(JSON.stringify({ ...data, ...patch }));

  const sideOrnament = (dir: "l" | "r") => (
    <div className="flex-1 flex items-center gap-2 min-w-0">
      {dir === "r" && (
        <div className="w-2 h-2 rounded-full bg-foreground/40 ring-2 ring-foreground/10 shrink-0" aria-hidden="true" />
      )}
      <div
        className={cn(
          "flex-1 h-[2.5px] rounded-full",
          dir === "l"
            ? "bg-gradient-to-r from-transparent via-foreground/40 to-foreground/60"
            : "bg-gradient-to-l from-transparent via-foreground/40 to-foreground/60",
        )}
      />
      {dir === "l" && (
        <div className="w-2 h-2 rounded-full bg-foreground/40 ring-2 ring-foreground/10 shrink-0" aria-hidden="true" />
      )}
    </div>
  );

  return (
    <div className="w-full py-5 flex items-center gap-3">
      {sideOrnament("l")}
      <div className="flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-full border border-border/60 bg-card shadow-[0_2px_8px_-4px_hsl(220_43%_15%/0.12),0_1px_2px_hsl(220_43%_15%/0.04)]">
        <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-primary via-primary to-primary/70 text-primary-foreground text-xs font-bold flex items-center justify-center shadow-[inset_0_1px_0_hsl(0_0%_100%/0.25),0_2px_6px_-2px_hsl(var(--primary)/0.55)] shrink-0">
          <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/15" aria-hidden="true" />
          {readOnly ? (
            <span className="relative">{Number(num) || 1}</span>
          ) : (
            <input
              type="number"
              min={1}
              value={num}
              onChange={(e) => setNum(e.target.value)}
              onBlur={() => commit({ number: Number(num) || 1 })}
              className="relative w-7 bg-transparent text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              aria-label="Section number"
            />
          )}
        </div>
        {readOnly ? (
          label ? (
            <span className="text-sm font-semibold text-foreground tracking-tight">{label}</span>
          ) : null
        ) : (
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={() => commit({ label })}
            placeholder="Section label…"
            className="bg-transparent outline-none text-sm font-semibold tracking-tight text-foreground placeholder:text-muted-foreground placeholder:font-normal min-w-[10ch] max-w-[26ch]"
            aria-label="Divider label"
          />
        )}
      </div>
      {sideOrnament("r")}
    </div>
  );
}

/* ---------- Spacer ----------
 * Ruler-style spacer with tick marks on both edges. Height chip is centered
 * and pops on hover. Popover exposes slider + presets.
 */

function Spacer({ content, onChange, readOnly }: Omit<Props, "variant" | "onContinueClick">) {
  const data = safeParse(content, { height: 40 });
  const height = Math.min(240, Math.max(8, Number(data.height) || 40));

  if (readOnly) {
    return <div aria-hidden="true" style={{ height }} />;
  }

  const tickCount = Math.max(2, Math.min(6, Math.round(height / 24)));

  return (
    <div className="w-full relative group/util my-1">
      <Popover>
        <PopoverTrigger asChild>
          <button
            style={{ height }}
            className="w-full rounded-lg border border-dashed border-border/60 bg-[linear-gradient(135deg,hsl(var(--muted)/0.15)_0%,hsl(var(--muted)/0.35)_100%)] hover:border-primary/40 hover:bg-[linear-gradient(135deg,hsl(var(--primary)/0.04)_0%,hsl(var(--primary)/0.08)_100%)] transition-all duration-200 flex items-center justify-between px-2 relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label={`Adjust spacing (currently ${height} pixels)`}
          >
            {/* left ticks */}
            <div className="flex flex-col justify-between h-full py-1.5 opacity-40 group-hover/util:opacity-80 transition-opacity">
              {Array.from({ length: tickCount }).map((_, i) => (
                <span key={i} className="block w-1.5 h-px bg-muted-foreground" aria-hidden="true" />
              ))}
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/90 backdrop-blur border border-border/70 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground group-hover/util:text-foreground group-hover/util:border-primary/40 transition-all shadow-sm">
              <MoveVertical className="w-3 h-3" aria-hidden="true" focusable="false" />
              {height}px
            </span>
            {/* right ticks */}
            <div className="flex flex-col justify-between h-full py-1.5 opacity-40 group-hover/util:opacity-80 transition-opacity">
              {Array.from({ length: tickCount }).map((_, i) => (
                <span key={i} className="block w-1.5 h-px bg-muted-foreground" aria-hidden="true" />
              ))}
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent align="center" className="w-64 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Spacing</p>
            <span className="text-xs font-semibold tabular-nums text-foreground px-2 py-0.5 rounded-md bg-muted">
              {height}px
            </span>
          </div>
          <Slider
            value={[height]}
            min={8}
            max={240}
            step={4}
            onValueChange={(v) => onChange(JSON.stringify({ height: v[0] }))}
          />
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: "XS", value: 16 },
              { label: "S", value: 32 },
              { label: "M", value: 64 },
              { label: "L", value: 120 },
            ].map((preset) => (
              <button
                key={preset.value}
                onClick={() => onChange(JSON.stringify({ height: preset.value }))}
                className={cn(
                  "h-8 rounded-md border text-[11px] font-medium transition-colors flex flex-col items-center justify-center leading-none gap-0.5",
                  height === preset.value
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border hover:bg-muted text-foreground",
                )}
                aria-label={`${preset.label} spacing (${preset.value} pixels)`}
              >
                <span className="font-semibold">{preset.label}</span>
                <span className="text-[9px] tabular-nums opacity-70">{preset.value}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/* ---------- Continue Button ----------
 * Refined pill with soft inner highlight, animated chevron, and inline-
 * editable label in edit mode.
 */

function ContinueButton({
  content,
  onChange,
  readOnly,
  onClick,
}: Omit<Props, "variant"> & { onClick?: () => void }) {
  const data = safeParse(content, { label: "Continue" });
  const [label, setLabel] = useState(String(data.label ?? "Continue"));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLabel(String(data.label ?? "Continue"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const commit = () => onChange(JSON.stringify({ label: label || "Continue" }));

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    window.scrollBy({ top: window.innerHeight * 0.9, behavior: "smooth" });
  };

  if (readOnly) {
    return (
      <div className="w-full flex justify-center py-4">
        <Button
          onClick={handleClick}
          className="group/cta relative rounded-full pl-6 pr-5 h-12 gap-2.5 text-sm font-semibold tracking-tight text-primary-foreground bg-gradient-to-b from-primary to-primary/85 shadow-[0_1px_0_hsl(0_0%_100%/0.2)_inset,0_10px_24px_-10px_hsl(var(--primary)/0.55),0_2px_4px_-2px_hsl(var(--primary)/0.4)] hover:shadow-[0_1px_0_hsl(0_0%_100%/0.25)_inset,0_14px_28px_-10px_hsl(var(--primary)/0.6),0_2px_6px_-2px_hsl(var(--primary)/0.45)] hover:-translate-y-[1px] transition-all duration-200"
        >
          <span className="absolute inset-x-3 top-0 h-px rounded-full bg-white/25" aria-hidden="true" />
          {label || "Continue"}
          <span className="w-6 h-6 rounded-full bg-primary-foreground/15 flex items-center justify-center transition-transform duration-200 group-hover/cta:translate-x-0.5">
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
          </span>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center py-4">
      <div className="group/cta relative inline-flex items-center gap-1 rounded-full pl-2 pr-1 py-1 bg-gradient-to-b from-primary to-primary/85 shadow-[0_1px_0_hsl(0_0%_100%/0.2)_inset,0_10px_24px_-10px_hsl(var(--primary)/0.55)]">
        <span className="pointer-events-none absolute inset-x-3 top-0 h-px rounded-full bg-white/25" aria-hidden="true" />
        <input
          ref={inputRef}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              inputRef.current?.blur();
            }
          }}
          placeholder="Continue"
          aria-label="Continue button label"
          className="bg-transparent outline-none text-sm font-semibold tracking-tight text-primary-foreground placeholder:text-primary-foreground/70 px-3 h-9 min-w-[10ch] max-w-[28ch] text-center"
        />
        <div className="w-9 h-9 rounded-full bg-primary-foreground/15 flex items-center justify-center transition-transform duration-200 group-hover/cta:translate-x-0.5">
          <ArrowRight className="w-4 h-4 text-primary-foreground" aria-hidden="true" focusable="false" />
        </div>
      </div>
    </div>
  );
}

/* ---------- Info Card ----------
 * Callout card with 6 flavours: note, important, tip, expert-insight,
 * best-practice, key-takeaway. Uses design-token driven soft tints, a
 * rounded icon medallion, an uppercase eyebrow label, editable body, and a
 * folded corner accent. First-run forces a mandatory type selection.
 */

type InfoCardKind =
  | "note"
  | "important"
  | "tip"
  | "expert-insight"
  | "best-practice"
  | "key-takeaway";

interface InfoCardPreset {
  id: InfoCardKind;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Soft background tint (HSL with alpha) */
  bg: string;
  /** Border/ring tint */
  border: string;
  /** Accent (icon + eyebrow) */
  accent: string;
  /** Folded corner tint */
  fold: string;
  placeholder: string;
}

const INFO_CARD_PRESETS: InfoCardPreset[] = [
  {
    id: "note",
    label: "Note",
    icon: StickyNote,
    bg: "hsl(215 90% 96%)",
    border: "hsl(215 60% 82%)",
    accent: "hsl(215 75% 42%)",
    fold: "hsl(215 75% 86%)",
    placeholder: "Add a note learners should keep in mind…",
  },
  {
    id: "important",
    label: "Important",
    icon: AlertTriangle,
    bg: "hsl(0 82% 96%)",
    border: "hsl(0 65% 84%)",
    accent: "hsl(0 72% 46%)",
    fold: "hsl(0 75% 86%)",
    placeholder: "Highlight a critical warning or caveat…",
  },
  {
    id: "tip",
    label: "Tip",
    icon: Lightbulb,
    bg: "hsl(38 96% 94%)",
    border: "hsl(38 80% 80%)",
    accent: "hsl(30 90% 42%)",
    fold: "hsl(40 88% 82%)",
    placeholder: "Share a helpful tip or shortcut…",
  },
  {
    id: "expert-insight",
    label: "Expert Insight",
    icon: GraduationCap,
    bg: "hsl(262 70% 96%)",
    border: "hsl(262 55% 84%)",
    accent: "hsl(262 65% 50%)",
    fold: "hsl(262 65% 86%)",
    placeholder: "Add commentary from a subject-matter expert…",
  },
  {
    id: "best-practice",
    label: "Best Practice",
    icon: ShieldCheck,
    bg: "hsl(158 60% 94%)",
    border: "hsl(158 45% 76%)",
    accent: "hsl(158 65% 32%)",
    fold: "hsl(158 50% 82%)",
    placeholder: "Describe the recommended way to do this…",
  },
  {
    id: "key-takeaway",
    label: "Key Takeaway",
    icon: KeyRound,
    bg: "hsl(188 78% 94%)",
    border: "hsl(188 55% 78%)",
    accent: "hsl(192 80% 32%)",
    fold: "hsl(188 70% 88%)",
    placeholder: "Summarise the key point to remember…",
  },
];

function getPreset(kind: string): InfoCardPreset | undefined {
  return INFO_CARD_PRESETS.find((p) => p.id === kind);
}

function InfoCard({ content, onChange, readOnly }: Omit<Props, "variant" | "onContinueClick">) {
  const data = safeParse(content, { kind: "" as string, body: "" });
  const preset = getPreset(String(data.kind || ""));
  const [body, setBody] = useState(String(data.body ?? ""));
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setBody(String(data.body ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      const el = textareaRef.current;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [isEditing]);

  const commit = (patch: Partial<{ kind: string; body: string }>) => {
    onChange(JSON.stringify({ ...data, ...patch }));
  };

  // ----- Type picker (mandatory first step) -----
  if (!preset) {
    if (readOnly) return null;
    return (
      <div className="w-full py-2">
        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-[11px] font-bold">?</span>
            <h4 className="text-sm font-semibold text-foreground tracking-tight">Choose an Info Card type</h4>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Pick the callout style that matches the message you want to highlight.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {INFO_CARD_PRESETS.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => commit({ kind: p.id })}
                  className="group relative overflow-hidden rounded-xl border text-left px-3 py-3 transition-all hover:-translate-y-[1px] hover:shadow-[0_6px_16px_-8px_hsl(220_43%_15%/0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  style={{ backgroundColor: p.bg, borderColor: p.border }}
                  aria-label={`Use ${p.label} card`}
                >
                  <div
                    className="absolute top-0 right-0 w-5 h-5"
                    style={{
                      background: `linear-gradient(225deg, ${p.fold} 50%, transparent 50%)`,
                    }}
                    aria-hidden="true"
                  />
                  <div
                    className="w-8 h-8 rounded-full bg-background flex items-center justify-center shadow-sm mb-2"
                    style={{ boxShadow: `inset 0 0 0 1px ${p.border}` }}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" focusable="false" />
                  </div>
                  <span
                    className="block text-[10px] font-bold uppercase tracking-[0.12em]"
                    style={{ color: p.accent }}
                  >
                    {p.label}
                  </span>
                  <span className="block text-[10.5px] text-foreground/70 leading-snug mt-0.5">
                    {p.id === "note" && "General information"}
                    {p.id === "important" && "Critical warning"}
                    {p.id === "tip" && "Helpful advice"}
                    {p.id === "expert-insight" && "Subject-matter view"}
                    {p.id === "best-practice" && "Recommended approach"}
                    {p.id === "key-takeaway" && "Point to remember"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ----- Rendered card -----
  const Icon = preset.icon;
  const hasBody = body.trim().length > 0;

  return (
    <div className="w-full py-2 group/util">
      <div
        className="relative rounded-[18px] border pl-4 pr-5 py-4 sm:pl-5 sm:py-[18px] flex gap-4 items-start shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_28px_-18px_rgba(15,23,42,0.18)] transition-shadow duration-200 group-hover/util:shadow-[0_1px_2px_rgba(15,23,42,0.05),0_14px_32px_-16px_rgba(15,23,42,0.22)]"
        style={{
          background: `linear-gradient(135deg, ${preset.bg} 0%, hsl(0 0% 100% / 0.35) 100%), ${preset.bg}`,
          borderColor: preset.border,
        }}
      >
        {/* Folded corner — realistic dog-ear with crease shadow */}
        <div
          className="absolute top-0 right-0 pointer-events-none"
          aria-hidden="true"
          style={{ width: 30, height: 30 }}
        >
          {/* The flap: a triangle occupying top-right corner, gradient makes it read
              like paper catching light; drop-shadow along the diagonal simulates
              the crease casting a soft shadow onto the card body. */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: "polygon(0 0, 100% 0, 100% 100%)",
              background: `linear-gradient(135deg, ${preset.fold} 0%, hsl(0 0% 100% / 0.75) 100%)`,
              filter: "drop-shadow(-1.5px 1.5px 1.5px rgba(15, 23, 42, 0.10))",
              borderTopRightRadius: "17px",
            }}
          />
          {/* Thin crease highlight along the diagonal for extra depth */}
          <div
            className="absolute"
            style={{
              top: -1,
              left: -1,
              width: "150%",
              height: 1,
              background: `linear-gradient(90deg, transparent 20%, hsl(0 0% 100% / 0.9) 50%, transparent 80%)`,
              transformOrigin: "top left",
              transform: "rotate(45deg) translateY(0.5px)",
            }}
          />
        </div>

        {/* Icon medallion */}
        <div
          className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(0 0% 100% / 0.85) 100%)",
            boxShadow: `inset 0 0 0 1px ${preset.border}, 0 1px 2px rgba(15,23,42,0.06), 0 4px 10px -6px ${preset.accent}`,
          }}
        >
          <Icon className="w-5 h-5" style={{ color: preset.accent }} aria-hidden="true" focusable="false" />
        </div>


        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ color: preset.accent }}
            >
              {preset.label}
            </span>
            {!readOnly && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="opacity-0 group-hover/util:opacity-100 transition-opacity h-5 px-1.5 rounded-md border border-border/60 bg-background/80 backdrop-blur text-[9px] font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 flex items-center gap-1"
                    aria-label="Change info card type"
                  >
                    <Settings2 className="w-2.5 h-2.5" aria-hidden="true" focusable="false" />
                    Change
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-64 p-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1 pb-1.5">
                    Info Card Type
                  </p>
                  <div className="grid grid-cols-1 gap-1">
                    {INFO_CARD_PRESETS.map((p) => {
                      const PIcon = p.icon;
                      const active = p.id === preset.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => commit({ kind: p.id })}
                          className={cn(
                            "flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-[12px] transition-colors",
                            active
                              ? "bg-primary/5 text-foreground"
                              : "hover:bg-muted/60 text-foreground",
                          )}
                        >
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: p.bg, boxShadow: `inset 0 0 0 1px ${p.border}` }}
                          >
                            <PIcon className="w-3 h-3" style={{ color: p.accent }} aria-hidden="true" focusable="false" />
                          </span>
                          <span className="flex-1 font-medium">{p.label}</span>
                          {active && <Check className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />}
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {readOnly ? (
            <p className="text-sm text-foreground/85 leading-relaxed mt-1 whitespace-pre-wrap break-words">
              {body || preset.placeholder}
            </p>
          ) : isEditing ? (
            <textarea
              ref={textareaRef}
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = `${el.scrollHeight}px`;
              }}
              onBlur={() => {
                setIsEditing(false);
                commit({ body });
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.currentTarget.blur();
                }
              }}
              placeholder={preset.placeholder}
              aria-label={`${preset.label} body`}
              rows={2}
              className="w-full resize-none bg-transparent outline-none text-sm text-foreground/90 leading-relaxed mt-1 placeholder:text-muted-foreground/70"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="w-full text-left mt-1 group/edit inline-flex items-start gap-1.5"
            >
              <span
                className={cn(
                  "text-sm leading-relaxed whitespace-pre-wrap break-words",
                  hasBody ? "text-foreground/85" : "text-muted-foreground/80 italic",
                )}
              >
                {hasBody ? body : preset.placeholder}
              </span>
              <Pencil
                className="w-3 h-3 mt-1 shrink-0 opacity-0 group-hover/edit:opacity-60 transition-opacity text-muted-foreground"
                aria-hidden="true"
                focusable="false"
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
