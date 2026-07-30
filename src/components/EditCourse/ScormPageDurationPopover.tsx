import { useState, useMemo } from "react";
import { Clock, BookOpen, FileText, Search, RotateCcw, X, Settings, ArrowLeft, MessageSquareText, CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";


export interface DurationItem {
  id: string;
  type: "section" | "page" | "question";
  title: string;
  children?: DurationItem[];
}


interface ScormPageDurationPopoverProps {
  items: DurationItem[];
  defaultDurationSec?: number;
  onClose?: () => void;
  onReset?: () => void;
}

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

function TimeField({
  valueSec,
  onChange,
  compact = false,
  highlight = false,
}: {
  valueSec: number;
  onChange: (sec: number) => void;
  compact?: boolean;
  highlight?: boolean;
}) {
  const mins = Math.floor((valueSec || 0) / 60);
  const secs = (valueSec || 0) % 60;

  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("flex items-center rounded-xl border bg-background transition-colors", compact ? "h-9 px-2" : "h-10 px-2.5", highlight ? "border-primary/40 ring-1 ring-primary/20" : "border-border")}>
        <input
          type="number"
          min={0}
          max={60}
          value={pad2(mins)}
          onChange={(e) => {
            const m = Math.max(0, Math.min(60, Number(e.target.value) || 0));
            onChange(m * 60 + secs);
          }}
          aria-label="Minutes"
          className={cn(
            "w-8 bg-transparent text-center tabular-nums outline-none p-0",
            compact ? "text-[15px] font-semibold" : "text-[17px] font-semibold"
          )}
        />
        <span className={cn("text-muted-foreground font-medium", compact ? "text-[12px] ml-1" : "text-[13px] ml-1.5")}>m</span>
      </div>
      <span className="text-muted-foreground font-light select-none" aria-hidden="true">:</span>
      <div className={cn("flex items-center rounded-xl border bg-background transition-colors", compact ? "h-9 px-2" : "h-10 px-2.5", highlight ? "border-primary/40 ring-1 ring-primary/20" : "border-border")}>
        <input
          type="number"
          min={0}
          max={59}
          value={pad2(secs)}
          onChange={(e) => {
            const s = Math.max(0, Math.min(59, Number(e.target.value) || 0));
            onChange(mins * 60 + s);
          }}
          aria-label="Seconds"
          className={cn(
            "w-8 bg-transparent text-center tabular-nums outline-none p-0",
            compact ? "text-[15px] font-semibold" : "text-[17px] font-semibold"
          )}
        />
        <span className={cn("text-muted-foreground font-medium", compact ? "text-[12px] ml-1" : "text-[13px] ml-1.5")}>s</span>
      </div>
    </div>
  );
}

export function ScormPageDurationPopover({
  items,
  defaultDurationSec = 60,
  onClose,
  onReset,
}: ScormPageDurationPopoverProps) {
  const [courseDefault, setCourseDefault] = useState(defaultDurationSec);
  const [search, setSearch] = useState("");
  const [overrides, setOverrides] = useState<Record<string, number>>({});

  const query = search.trim().toLowerCase();

  const filteredItems = useMemo(() => {
    const visible = (i: DurationItem) => i.type !== "question";
    const visibleChildren = (children?: DurationItem[]) =>
      children?.filter(visible).map((page) => ({ ...page, children: undefined })) ?? [];

    if (!query) return items.filter(visible).map((s) => ({ ...s, children: visibleChildren(s.children) }));
    return items
      .map((section) => {
        if (!visible(section)) return null;
        const sectionMatch = section.title.toLowerCase().includes(query);
        const children = visibleChildren(section.children).filter((page) =>
          page.title.toLowerCase().includes(query)
        );
        if (sectionMatch) return { ...section, children: visibleChildren(section.children) };
        if (children.length) return { ...section, children };
        return null;
      })
      .filter(Boolean) as DurationItem[];
  }, [items, query]);

  const handleReset = () => {
    setCourseDefault(defaultDurationSec);
    setOverrides({});
    setSearch("");
    onReset?.();
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
          {view === "duration" ? (
            <Clock className="h-5 w-5 text-primary" aria-hidden="true" focusable="false" />
          ) : (
            <MessageSquareText className="h-5 w-5 text-primary" aria-hidden="true" focusable="false" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-foreground leading-tight">SCORM Preferences</h3>
          <p className="text-[13px] text-muted-foreground">
            {view === "duration" ? "Page duration" : "Completion messages"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {view === "duration" ? (
            <>
              <button
                type="button"
                onClick={() => setView("messages")}
                aria-label="Open completion messages settings"
                className="h-8 w-8 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Settings className="h-4 w-4" aria-hidden="true" focusable="false" />
              </button>
              <button
                type="button"
                onClick={handleReset}
                aria-label="Reset page durations"
                className="h-8 w-8 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" focusable="false" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setView("duration")}
              aria-label="Back to page duration"
              className="h-8 w-8 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" focusable="false" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="h-8 w-8 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" aria-hidden="true" focusable="false" />
          </button>
        </div>
      </div>

      {view === "messages" ? (
        <div className="flex-1 overflow-y-auto p-5 scorm-page-duration-scrollbar max-h-[60vh]">
          <p className="text-[13px] text-muted-foreground mb-3">
            Shown to learners based on their final result.
          </p>
          <div className="grid grid-cols-1 gap-3">
            <div className="rounded-xl border border-border bg-background overflow-hidden">
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-primary/5 border-b border-border">
                <CheckCircle2 className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
                <Label htmlFor="scorm-pass-msg" className="text-[14px] font-semibold text-foreground">
                  Pass criteria message
                </Label>
              </div>
              <Textarea
                id="scorm-pass-msg"
                value={passMessage}
                onChange={(e) => setPassMessage(e.target.value)}
                rows={3}
                className="text-[14px] min-h-[80px] resize-none border-0 bg-transparent rounded-none focus-visible:ring-0"
              />
            </div>

            <div className="rounded-xl border border-border bg-background overflow-hidden">
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-destructive/5 border-b border-border">
                <XCircle className="w-4 h-4 text-destructive" aria-hidden="true" focusable="false" />
                <Label htmlFor="scorm-fail-msg" className="text-[14px] font-semibold text-foreground">
                  Fail criteria message
                </Label>
              </div>
              <Textarea
                id="scorm-fail-msg"
                value={failMessage}
                onChange={(e) => setFailMessage(e.target.value)}
                rows={3}
                className="text-[14px] min-h-[80px] resize-none border-0 bg-transparent rounded-none focus-visible:ring-0"
              />
            </div>
          </div>
        </div>
      ) : (
      /* Body */
      <div className="flex-1 overflow-y-auto p-5 scorm-page-duration-scrollbar max-h-[60vh]">

        <style>{`
          .scorm-page-duration-scrollbar { scrollbar-width: thin; scrollbar-color: hsl(var(--muted-foreground) / 0.55) transparent; }
          .scorm-page-duration-scrollbar::-webkit-scrollbar { width: 8px; }
          .scorm-page-duration-scrollbar::-webkit-scrollbar-track { background: hsl(var(--muted) / 0.4); border-radius: 9999px; }
          .scorm-page-duration-scrollbar::-webkit-scrollbar-thumb { background-color: hsl(var(--muted-foreground) / 0.55); border-radius: 9999px; border: 2px solid transparent; background-clip: padding-box; }
          .scorm-page-duration-scrollbar::-webkit-scrollbar-thumb:hover { background-color: hsl(var(--foreground) / 0.65); }
        `}</style>

        {/* Course default */}
        <div className="rounded-2xl border border-primary/20 bg-primary/[0.06] p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 shrink-0">
              <Clock className="h-4 w-4 text-primary" aria-hidden="true" focusable="false" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold text-primary leading-tight">Course default</div>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                Applies to all sections and pages in the course
              </p>
              <div className="mt-3">
                <TimeField valueSec={courseDefault} onChange={setCourseDefault} highlight />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" focusable="false" />
          <Input
            type="text"
            placeholder="Search sections or pages"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search sections or pages"
            className="h-10 pl-9 pr-3 rounded-xl text-[14px] bg-muted/40 border-border"
          />
        </div>

        {/* Sections & pages */}
        <div className="space-y-3">
          {filteredItems.map((section) => (
            <div
              key={section.id}
              className="rounded-2xl border border-border bg-card overflow-hidden"
            >
              {/* Section row */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-b-0">
                <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" focusable="false" />
                <span className="min-w-0 flex-1 text-[14px] font-medium text-foreground truncate">
                  {section.title}
                </span>
                <TimeField
                  valueSec={overrides[section.id] ?? courseDefault}
                  onChange={(sec) => setOverrides((prev) => ({ ...prev, [section.id]: sec }))}
                  compact
                />
              </div>

              {/* Page rows */}
              {section.children?.map((page) => (
                <div
                  key={page.id}
                  className="flex items-center gap-3 px-4 py-3 bg-muted/30 border-t border-border"
                >
                  <div className="w-5 shrink-0 flex justify-center">
                    <div className="w-1 h-4 rounded-full bg-border" aria-hidden="true" />
                  </div>
                  <FileText className="h-4 w-4 text-primary shrink-0" aria-hidden="true" focusable="false" />
                  <span className="min-w-0 flex-1 text-[14px] font-medium text-primary truncate">
                    {page.title}
                  </span>
                  <TimeField
                    valueSec={overrides[page.id] ?? courseDefault}
                    onChange={(sec) => setOverrides((prev) => ({ ...prev, [page.id]: sec }))}
                    compact
                  />
                </div>
              ))}
            </div>
          ))}
          {filteredItems.length === 0 && (
            <div className="text-center py-8 text-[13px] text-muted-foreground">
              No sections or pages match your search.
            </div>
          )}
        </div>
      </div>
      )}

    </div>
  );
}
