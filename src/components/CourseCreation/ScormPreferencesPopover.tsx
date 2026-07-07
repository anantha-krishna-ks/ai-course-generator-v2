import { useEffect, useMemo, useState } from "react";
import { Sliders, Clock, BookOpen, FileText, X, Search, RotateCcw } from "lucide-react";
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

const DEFAULT_MMSS = "01:00";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function splitMMSS(v: string): { mm: string; ss: string } {
  const [m = "00", s = "00"] = (v || DEFAULT_MMSS).split(":");
  return { mm: m.padStart(2, "0"), ss: s.padStart(2, "0") };
}

function DurationInput({
  value,
  onChange,
  highlighted,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  highlighted?: boolean;
  ariaLabel: string;
}) {
  const [mm, setMm] = useState(() => splitMMSS(value).mm);
  const [ss, setSs] = useState(() => splitMMSS(value).ss);

  // Keep local state in sync when the external value changes (course default
  // propagation, Reset all, etc.)
  useEffect(() => {
    const parts = splitMMSS(value);
    setMm(parts.mm);
    setSs(parts.ss);
  }, [value]);

  const commit = (nextMm: string, nextSs: string) => {
    const m = clamp(parseInt(nextMm || "0", 10) || 0, 0, 99)
      .toString()
      .padStart(2, "0");
    const s = clamp(parseInt(nextSs || "0", 10) || 0, 0, 59)
      .toString()
      .padStart(2, "0");
    setMm(m);
    setSs(s);
    onChange(`${m}:${s}`);
  };

  const base = cn(
    "h-8 w-9 text-center text-[13px] font-semibold tabular-nums rounded-md px-0 border",
    highlighted
      ? "border-primary/70 text-primary bg-primary/[0.04] focus-visible:ring-primary/30"
      : "border-border text-foreground bg-background"
  );

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-1 rounded-lg px-1.5 py-1",
        highlighted ? "bg-primary/[0.04]" : "bg-transparent"
      )}
    >
      <div className="flex flex-col items-center">
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
        <span className="text-[7px] font-normal uppercase tracking-wider text-muted-foreground/70 mt-0 leading-none">
          min
        </span>
      </div>
      <span
        className="text-[13px] font-semibold text-muted-foreground -mt-3"
        aria-hidden="true"
      >
        :
      </span>
      <div className="flex flex-col items-center">
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
        <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground mt-0.5">
          sec
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
  const [durations, setDurations] = useState<Record<string, string>>({});
  const [courseDefault, setCourseDefault] = useState<string>(DEFAULT_MMSS);
  const [query, setQuery] = useState("");

  // Course default falls through as the value for any item without an explicit
  // override, so changing the default updates all section/page fields live.
  const getDur = (id: string) => durations[id] ?? courseDefault;
  const setDur = (id: string, v: string) =>
    setDurations((d) => ({ ...d, [id]: v }));

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
        className="w-[420px] p-0 rounded-2xl border-border shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/20 shrink-0">
            <Sliders className="h-4 w-4 text-primary" aria-hidden="true" focusable="false" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-semibold text-foreground leading-tight">
              SCORM Preferences
            </h3>
            <p className="text-[12px] text-muted-foreground leading-tight mt-0.5">
              Page duration
            </p>
          </div>
          <button
            type="button"
            onClick={resetAll}
            aria-label="Reset all durations"
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
                Applies to all sections and pages in the course
              </p>
            </div>
            <DurationInput
              value={courseDefault}
              onChange={setCourseDefault}
              ariaLabel="Course default duration"
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
                    <DurationInput
                      value={getDur(section.id)}
                      onChange={(v) => setDur(section.id, v)}
                      highlighted
                      ariaLabel={`Duration for section ${section.title}`}
                    />
                  </div>
                  {pages.length > 0 && (
                    <div className="border-t border-border/70 bg-muted/20 divide-y divide-border/60">
                      {pages.map((p) => {
                        const isCurrent = p.id === currentPageId;
                        return (
                          <div
                            key={p.id}
                            className={cn(
                              "flex items-center gap-2.5 pl-8 pr-3 py-1.5 transition-colors",
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
                            <DurationInput
                              value={getDur(p.id)}
                              onChange={(v) => setDur(p.id, v)}
                              highlighted={isCurrent}
                              ariaLabel={`Duration for page ${p.title}`}
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
          <span className="text-[11.5px] text-muted-foreground">
            Minutes : Seconds
          </span>
          <Button
            size="sm"
            className="h-8 rounded-full text-[12.5px] px-4"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
