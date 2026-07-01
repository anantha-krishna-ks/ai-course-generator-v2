import { useEffect, useRef, useState } from "react";
import { ArrowRight, Settings2, Move } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Layout Utility Blocks — visual page-flow helpers (dividers, spacing,
 * continue). Stored as type="text" with a variant so we don't need to widen
 * the block union across the whole codebase.
 */
export type LayoutUtilityVariant =
  | "divider-line"
  | "divider-numbered"
  | "spacer"
  | "continue-button";

export function isLayoutUtilityVariant(v?: string): v is LayoutUtilityVariant {
  return (
    v === "divider-line" ||
    v === "divider-numbered" ||
    v === "spacer" ||
    v === "continue-button"
  );
}

export const layoutUtilityDefaults: Record<LayoutUtilityVariant, string> = {
  "divider-line": JSON.stringify({ style: "solid" }),
  "divider-numbered": JSON.stringify({ number: 1, label: "" }),
  spacer: JSON.stringify({ height: 40 }),
  "continue-button": JSON.stringify({ label: "Continue" }),
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
  }
}

/* ---------- Simple Line ---------- */

function DividerLine({ content, onChange, readOnly }: Omit<Props, "variant" | "onContinueClick">) {
  const data = safeParse(content, { style: "solid" as "solid" | "dashed" | "dotted" });
  const set = (patch: Partial<typeof data>) => onChange(JSON.stringify({ ...data, ...patch }));

  const line = (
    <div className="flex-1 h-0" style={{ borderTopWidth: 1, borderTopStyle: data.style, borderTopColor: "hsl(var(--border))" }} />
  );

  if (readOnly) {
    return <div className="w-full py-3 flex items-center">{line}</div>;
  }

  return (
    <div className="w-full py-2 flex items-center gap-2 group/util">
      {line}
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="opacity-0 group-hover/util:opacity-100 transition-opacity h-7 w-7 rounded-md border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center shrink-0"
            aria-label="Line divider settings"
          >
            <Settings2 className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-56 p-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Line style</p>
          <div className="grid grid-cols-3 gap-2">
            {(["solid", "dashed", "dotted"] as const).map((s) => (
              <button
                key={s}
                onClick={() => set({ style: s })}
                className={cn(
                  "h-9 rounded-md border text-[11px] capitalize transition-colors",
                  data.style === s
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border hover:bg-muted text-foreground",
                )}
              >
                <div
                  className="w-full mt-2"
                  style={{ borderTopWidth: 1, borderTopStyle: s, borderTopColor: "currentColor" }}
                />
                <span className="text-[10px] mt-1 block">{s}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {line}
    </div>
  );
}

/* ---------- Numbered Divider ---------- */

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

  return (
    <div className="w-full py-4 flex items-center gap-3">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-border/70 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xs font-bold flex items-center justify-center shadow-sm shrink-0">
          {readOnly ? (
            <span>{Number(num) || 1}</span>
          ) : (
            <input
              type="number"
              min={1}
              value={num}
              onChange={(e) => setNum(e.target.value)}
              onBlur={() => commit({ number: Number(num) || 1 })}
              className="w-6 bg-transparent text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              aria-label="Section number"
            />
          )}
        </div>
        {readOnly ? (
          label ? (
            <span className="text-sm font-medium text-foreground pr-1">{label}</span>
          ) : null
        ) : (
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={() => commit({ label })}
            placeholder="Add a label…"
            className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground min-w-[8ch] max-w-[24ch]"
            aria-label="Divider label"
          />
        )}
      </div>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border" />
    </div>
  );
}

/* ---------- Spacer ---------- */

function Spacer({ content, onChange, readOnly }: Omit<Props, "variant" | "onContinueClick">) {
  const data = safeParse(content, { height: 40 });
  const height = Math.min(240, Math.max(8, Number(data.height) || 40));

  if (readOnly) {
    return <div aria-hidden="true" style={{ height }} />;
  }

  return (
    <div className="w-full relative group/util">
      <div
        style={{ height }}
        className="w-full rounded-md border border-dashed border-border/70 bg-muted/20 group-hover/util:bg-muted/40 group-hover/util:border-primary/30 transition-colors flex items-center justify-center"
      >
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 group-hover/util:text-muted-foreground">
          Space · {height}px
        </span>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="absolute top-1 right-1 opacity-0 group-hover/util:opacity-100 transition-opacity h-7 w-7 rounded-md border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center"
            aria-label="Adjust spacing"
          >
            <Move className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Height</p>
            <span className="text-xs font-semibold tabular-nums text-foreground">{height}px</span>
          </div>
          <Slider
            value={[height]}
            min={8}
            max={240}
            step={4}
            onValueChange={(v) => onChange(JSON.stringify({ height: v[0] }))}
          />
          <div className="grid grid-cols-4 gap-1.5">
            {[16, 32, 64, 120].map((preset) => (
              <button
                key={preset}
                onClick={() => onChange(JSON.stringify({ height: preset }))}
                className={cn(
                  "h-7 rounded-md border text-[11px] transition-colors",
                  height === preset
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border hover:bg-muted text-foreground",
                )}
              >
                {preset}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/* ---------- Continue Button ---------- */

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
    // Fallback: advance the page in preview by scrolling forward.
    window.scrollBy({ top: window.innerHeight * 0.9, behavior: "smooth" });
  };

  if (readOnly) {
    return (
      <div className="w-full flex justify-center py-3">
        <Button
          onClick={handleClick}
          className="rounded-full px-6 h-11 gap-2 text-sm font-semibold shadow-[0_6px_16px_-6px_hsl(var(--primary)/0.5)] bg-gradient-to-r from-primary to-primary/85 hover:opacity-95"
        >
          {label || "Continue"}
          <ArrowRight className="w-4 h-4" aria-hidden="true" focusable="false" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center py-3">
      <div className="inline-flex items-center gap-2 rounded-full pl-2 pr-1 py-1 bg-gradient-to-r from-primary to-primary/85 shadow-[0_6px_16px_-6px_hsl(var(--primary)/0.5)]">
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
          className="bg-transparent outline-none text-sm font-semibold text-primary-foreground placeholder:text-primary-foreground/70 px-3 min-w-[10ch] max-w-[28ch] text-center"
        />
        <div className="w-9 h-9 rounded-full bg-primary-foreground/15 flex items-center justify-center">
          <ArrowRight className="w-4 h-4 text-primary-foreground" aria-hidden="true" focusable="false" />
        </div>
      </div>
    </div>
  );
}
