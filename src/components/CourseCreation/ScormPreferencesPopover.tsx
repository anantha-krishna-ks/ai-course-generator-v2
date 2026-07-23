import { useEffect, useMemo, useState } from "react";
import { Sliders, Clock, BookOpen, FileText, X, Search, RotateCcw, AlertCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OutlineItem {
  id: string;
  type: "section" | "page" | "question";
  title: string;
  children?: OutlineItem[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: OutlineItem[];
  currentPageId?: string;
  trigger: React.ReactNode;
}

const DEFAULT_MMSS = "05:00";
const MIN_TOTAL_SECONDS = 60; // per acceptance criteria: ≥ 1 minute
const MAX_MINUTES = 99;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function splitMMSS(v: string): { mm: string; ss: string } {
  const [m = "00", s = "00"] = (v || DEFAULT_MMSS).split(":");
  return { mm: m.padStart(2, "0"), ss: s.padStart(2, "0") };
}

function toSeconds(v: string): number {
  const { mm, ss } = splitMMSS(v);
  return parseInt(mm, 10) * 60 + parseInt(ss, 10);
}

function DurationInput({
  value,
  onChange,
  highlighted,
  ariaLabel,
  invalid,
}: {
  value: string;
  onChange: (v: string) => void;
  highlighted?: boolean;
  ariaLabel: string;
  invalid?: boolean;
}) {
  const [mm, setMm] = useState(() => splitMMSS(value).mm);
  const [ss, setSs] = useState(() => splitMMSS(value).ss);

  useEffect(() => {
    const parts = splitMMSS(value);
    setMm(parts.mm);
    setSs(parts.ss);
  }, [value]);

  const commit = (nextMm: string, nextSs: string) => {
    const m = clamp(parseInt(nextMm || "0", 10) || 0, 0, MAX_MINUTES)
      .toString()
      .padStart(2, "0");
    const s = clamp(parseInt(nextSs || "0", 10) || 0, 0, 59)
      .toString()
      .padStart(2, "0");
    setMm(m);
    setSs(s);
    onChange(`${m}:${s}`);
  };

  const borderClass = invalid
    ? "border-destructive/70 text-destructive bg-destructive/[0.04] focus-visible:ring-destructive/30"
    : highlighted
      ? "border-primary/70 text-primary bg-primary/[0.04] focus-visible:ring-primary/30"
      : "border-border text-foreground bg-background";

  const base = cn(
    "h-8 w-9 text-center text-[13px] font-semibold tabular-nums rounded-md px-0 border",
    borderClass
  );

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      aria-invalid={invalid || undefined}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg px-1 py-0.5",
        invalid ? "bg-destructive/[0.04]" : highlighted ? "bg-primary/[0.04]" : "bg-transparent"
      )}
    >
      <div className="flex items-center gap-0.5">
        <Input
          value={mm}
          onChange={(e) => setMm(e.target.value.replace(/\D/g, "").slice(0, 2))}
          onFocus={(e) => e.currentTarget.select()}
          onBlur={() => commit(mm, ss)}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
          }}
          inputMode="numeric"
          aria-label={`${ariaLabel} minutes`}
          className={base}
        />
        <span className="text-[10px] font-medium text-muted-foreground select-none">
          m
        </span>
      </div>
      <span
        className="text-[11px] font-semibold text-muted-foreground px-0.5 select-none"
        aria-hidden="true"
      >
        :
      </span>
      <div className="flex items-center gap-0.5">
        <Input
          value={ss}
          onChange={(e) => setSs(e.target.value.replace(/\D/g, "").slice(0, 2))}
          onFocus={(e) => e.currentTarget.select()}
          onBlur={() => commit(mm, ss)}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
          }}
          inputMode="numeric"
          aria-label={`${ariaLabel} seconds`}
          className={base}
        />
        <span className="text-[10px] font-medium text-muted-foreground select-none">
          s
        </span>
      </div>
    </div>
  );
}

export function ScormPreferencesPopover({
  open,
  onOpenChange,
  items,
  currentPageId,
  trigger,
}: Props) {
  // `durations` only holds explicit per-item overrides. Absence = inherit course default.
  const [durations, setDurations] = useState<Record<string, string>>({});
  const [courseDefault, setCourseDefault] = useState<string>(DEFAULT_MMSS);
  const [query, setQuery] = useState("");

  const isCustom = (id: string) => Object.prototype.hasOwnProperty.call(durations, id);
  const getDur = (id: string) => durations[id] ?? courseDefault;
  const setDur = (id: string, v: string) =>
    setDurations((d) => ({ ...d, [id]: v }));
  const resetItem = (id: string) =>
    setDurations((d) => {
      const { [id]: _omit, ...rest } = d;
      return rest;
    });

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items
      .map((section) => {
        const matchSection = section.title.toLowerCase().includes(q);
        const kids = (section.children ?? []).filter((c) =>
          c.title.toLowerCase().includes(q)
        );
        if (matchSection) return section;
        if (kids.length) return { ...section, children: kids };
        return null;
      })
      .filter(Boolean) as OutlineItem[];
  }, [items, query]);

  const invalidCount = useMemo(
    () =>
      Object.entries(durations).filter(([, v]) => toSeconds(v) < MIN_TOTAL_SECONDS).length +
      (toSeconds(courseDefault) < MIN_TOTAL_SECONDS ? 1 : 0),
    [durations, courseDefault]
  );

  const overrideCount = Object.keys(durations).length;

  const resetAll = () => {
    setDurations({});
    setCourseDefault(DEFAULT_MMSS);
    setQuery("");
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[460px] p-0 rounded-2xl border-border shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/20 shrink-0">
            <Sliders className="h-4 w-4 text-primary" aria-hidden="true" focusable="false" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-semibold text-foreground leading-tight">
              Page Duration
            </h3>
            <p className="text-[12px] text-muted-foreground leading-tight mt-0.5">
              {overrideCount === 0
                ? "All pages inherit the course default"
                : `${overrideCount} custom override${overrideCount === 1 ? "" : "s"}`}
            </p>
          </div>
          <button
            type="button"
            onClick={resetAll}
            aria-label="Reset all durations to course default"
            className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Reset all"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" focusable="false" />
          </button>
        </div>

        {/* Course default */}
        <div className="px-4 pt-3">
          <div className="flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/[0.06] px-3.5 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 shrink-0">
              <Clock className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-primary leading-tight">
                Course default
              </p>
              <p className="text-[11.5px] text-muted-foreground leading-tight mt-0.5">
                Applied to any page without a custom duration
              </p>
            </div>
            <DurationInput
              value={courseDefault}
              onChange={setCourseDefault}
              ariaLabel="Course default duration"
              invalid={toSeconds(courseDefault) < MIN_TOTAL_SECONDS}
            />
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pt-3">
          <div className="relative">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none"
              aria-hidden="true"
              focusable="false"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sections or pages"
              aria-label="Search"
              className="h-8 pl-8 text-[12.5px] rounded-md"
            />
          </div>
        </div>

        {/* List */}
        <div className="px-4 pt-3 pb-4 max-h-[380px] overflow-y-auto thin-scrollbar">
          <div className="space-y-2.5">
            {filtered.length === 0 && (
              <p className="text-[13px] text-muted-foreground text-center py-6">
                No matching items
              </p>
            )}
            {filtered.map((section) => {
              const pages = (section.children ?? []).filter(
                (c) => c.type === "page"
              );
              const sectionCustom = isCustom(section.id);
              const sectionInvalid = sectionCustom && toSeconds(getDur(section.id)) < MIN_TOTAL_SECONDS;
              return (
                <div
                  key={section.id}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  <div className="flex items-center gap-2.5 px-3 py-2">
                    <BookOpen
                      className="w-3.5 h-3.5 text-muted-foreground shrink-0"
                      aria-hidden="true"
                      focusable="false"
                    />
                    <p
                      className="flex-1 min-w-0 text-[13px] font-semibold text-foreground truncate"
                      title={section.title}
                    >
                      {section.title}
                    </p>
                    {sectionCustom && (
                      <button
                        type="button"
                        onClick={() => resetItem(section.id)}
                        aria-label={`Use course default for section ${section.title}`}
                        title="Use course default"
                        className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" aria-hidden="true" focusable="false" />
                      </button>
                    )}
                    <DurationInput
                      value={getDur(section.id)}
                      onChange={(v) => setDur(section.id, v)}
                      highlighted={sectionCustom}
                      ariaLabel={`Duration for section ${section.title}`}
                      invalid={sectionInvalid}
                    />
                  </div>
                  {pages.length > 0 && (
                    <div className="border-t border-border/70 bg-muted/20 divide-y divide-border/60">
                      {pages.map((p) => {
                        const isCurrent = p.id === currentPageId;
                        const custom = isCustom(p.id);
                        const invalid = custom && toSeconds(getDur(p.id)) < MIN_TOTAL_SECONDS;
                        return (
                          <div
                            key={p.id}
                            className={cn(
                              "flex items-center gap-2 pl-8 pr-3 py-1.5 transition-colors",
                              isCurrent && "bg-primary/[0.04]"
                            )}
                          >
                            <FileText
                              className={cn(
                                "w-3.5 h-3.5 shrink-0",
                                isCurrent ? "text-primary" : "text-muted-foreground"
                              )}
                              aria-hidden="true"
                              focusable="false"
                            />
                            <p
                              className={cn(
                                "flex-1 min-w-0 text-[12.5px] truncate",
                                isCurrent
                                  ? "text-primary font-medium"
                                  : "text-foreground"
                              )}
                              title={p.title}
                            >
                              {p.title}
                            </p>
                            <span
                              className={cn(
                                "shrink-0 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full border",
                                custom
                                  ? "border-primary/30 bg-primary/10 text-primary"
                                  : "border-border bg-muted/60 text-muted-foreground"
                              )}
                              aria-label={custom ? "Custom duration" : "Inherits course default"}
                            >
                              {custom ? "Custom" : "Default"}
                            </span>
                            {custom && (
                              <button
                                type="button"
                                onClick={() => resetItem(p.id)}
                                aria-label={`Use course default for page ${p.title}`}
                                title="Use course default"
                                className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0"
                              >
                                <RotateCcw className="w-3 h-3" aria-hidden="true" focusable="false" />
                              </button>
                            )}
                            <DurationInput
                              value={getDur(p.id)}
                              onChange={(v) => setDur(p.id, v)}
                              highlighted={custom || isCurrent}
                              ariaLabel={`Duration for page ${p.title}`}
                              invalid={invalid}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-t border-border bg-muted/20">
          {invalidCount > 0 ? (
            <span className="flex items-center gap-1.5 text-[11.5px] text-destructive font-medium">
              <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
              Duration must be at least 1 minute
            </span>
          ) : (
            <span className="text-[11.5px] text-muted-foreground">
              Minutes : Seconds · min 1:00
            </span>
          )}
          <Button
            size="sm"
            className="h-8 rounded-full text-[12.5px] px-4"
            onClick={() => onOpenChange(false)}
            disabled={invalidCount > 0}
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
