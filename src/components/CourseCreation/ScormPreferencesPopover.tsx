import { useMemo, useState } from "react";
import { Sliders, Clock, Folder, FileText, X, Search, RotateCcw } from "lucide-react";
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

function normalize(v: string): string {
  // Accept "1:30", "01:30", "90" (seconds) -> mm:ss
  const trimmed = v.trim();
  if (!trimmed) return DEFAULT_MMSS;
  if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
    const [m, s] = trimmed.split(":").map(Number);
    const mm = Math.min(99, m).toString().padStart(2, "0");
    const ss = Math.min(59, s).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  }
  const n = Number(trimmed);
  if (!isNaN(n)) {
    const mm = Math.floor(n).toString().padStart(2, "0");
    return `${mm}:00`;
  }
  return DEFAULT_MMSS;
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
  const [local, setLocal] = useState(value);
  return (
    <Input
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onFocus={(e) => e.currentTarget.select()}
      onBlur={() => {
        const n = normalize(local);
        setLocal(n);
        onChange(n);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
      }}
      aria-label={ariaLabel}
      className={cn(
        "h-8 w-[68px] text-center text-[13px] font-semibold tabular-nums rounded-md px-1.5",
        highlighted
          ? "border-primary/70 text-primary bg-primary/[0.04] focus-visible:ring-primary/30"
          : "border-border text-foreground bg-background"
      )}
    />
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

  const getDur = (id: string) => durations[id] ?? DEFAULT_MMSS;
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
                New sections &amp; pages start with this
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
                  <div className="flex items-center gap-2.5 px-3 py-2.5">
                    <Folder
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
                              "flex items-center gap-2.5 pl-8 pr-3 py-2 transition-colors",
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
            Format: mm:ss
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
