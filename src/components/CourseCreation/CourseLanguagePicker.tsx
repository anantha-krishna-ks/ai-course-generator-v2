import { useMemo, useState } from "react";
import { Check, ChevronDown, Languages, Lock, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { COURSE_LANGUAGES, getLanguage } from "@/services/courseLanguageStore";

interface CourseLanguagePickerProps {
  value: string;
  onChange: (code: string) => void;
  /** When locked, the trigger renders as a read-only chip with a lock icon. */
  locked?: boolean;
  /** "pill" = tall labelled pill (dialog footer), "chip" = compact chip (editor header). */
  variant?: "pill" | "chip";
  className?: string;
}

function LanguageList({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (code: string) => void;
}) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COURSE_LANGUAGES;
    return COURSE_LANGUAGES.filter(
      (l) =>
        l.label.toLowerCase().includes(q) ||
        l.native.toLowerCase().includes(q) ||
        l.code.includes(q),
    );
  }, [query]);

  return (
    <div>
      <div className="px-1 pb-2">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Course language
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Content is generated and displayed in this language. App labels stay in English.
        </p>
      </div>
      <div className="relative mb-2">
        <Search
          className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
          focusable="false"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search languages"
          aria-label="Search languages"
          className="h-9 pl-8 rounded-full text-sm"
        />
      </div>
      <div
        role="radiogroup"
        aria-label="Course language"
        className="max-h-[240px] overflow-y-auto pretty-scrollbar pr-1 space-y-1"
      >
        {results.map((lang) => {
          const isActive = lang.code === value;
          return (
            <button
              key={lang.code}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onSelect(lang.code)}
              className={cn(
                "w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors",
                isActive ? "bg-primary/10 text-foreground" : "hover:bg-muted",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "inline-flex items-center justify-center w-8 h-8 rounded-lg text-[11px] font-bold uppercase shrink-0",
                  isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {lang.code}
              </span>
              <span className="flex flex-col min-w-0 leading-tight">
                <span className="text-sm font-medium text-foreground truncate">{lang.label}</span>
                <span className="text-xs text-muted-foreground truncate" dir={lang.dir}>
                  {lang.native}
                </span>
              </span>
              {lang.dir === "rtl" && (
                <span className="ms-auto text-[10px] font-semibold uppercase tracking-wide text-muted-foreground rounded-full border border-border px-1.5 py-0.5">
                  RTL
                </span>
              )}
              {isActive && (
                <Check
                  className={cn("w-4 h-4 text-primary shrink-0", lang.dir === "rtl" ? "ms-1.5" : "ms-auto")}
                  aria-hidden="true"
                  focusable="false"
                />
              )}
            </button>
          );
        })}
        {results.length === 0 && (
          <p className="text-xs text-muted-foreground px-2 py-4 text-center">No languages found</p>
        )}
      </div>
    </div>
  );
}

export function CourseLanguagePicker({
  value,
  onChange,
  locked = false,
  variant = "pill",
  className,
}: CourseLanguagePickerProps) {
  const [open, setOpen] = useState(false);
  const current = getLanguage(value);

  const triggerClasses =
    variant === "pill"
      ? "inline-flex items-center gap-2 rounded-full border border-border bg-background hover:bg-muted h-10 sm:h-11 md:h-12 pl-3 pr-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      : "inline-flex items-center gap-2 rounded-full border border-border bg-background hover:bg-muted h-9 pl-2.5 pr-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

  const content = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-muted text-foreground",
          variant === "pill" ? "w-7 h-7" : "w-6 h-6",
        )}
      >
        <Languages className="w-3.5 h-3.5" />
      </span>
      {variant === "pill" ? (
        <span className="flex flex-col items-start leading-tight">
          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
            Language
          </span>
          <span className="text-xs sm:text-sm font-semibold text-foreground max-w-[120px] truncate">
            {current.label}
          </span>
        </span>
      ) : (
        <span className="text-xs font-semibold text-foreground max-w-[110px] truncate">
          {current.label}
        </span>
      )}
      {current.dir === "rtl" && (
        <span className="text-[9px] font-semibold uppercase tracking-wide text-primary rounded-full bg-primary/10 px-1.5 py-0.5">
          RTL
        </span>
      )}
      {locked ? (
        <Lock className="w-3.5 h-3.5 text-muted-foreground ms-0.5" aria-hidden="true" focusable="false" />
      ) : (
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ms-0.5" aria-hidden="true" focusable="false" />
      )}
    </>
  );

  if (locked) {
    return (
      <span
        className={cn(triggerClasses, "cursor-default hover:bg-background", className)}
        title="Language is locked for this course"
      >
        {content}
        <span className="sr-only">Course language {current.label} is locked</span>
      </span>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Course language: ${current.label}. Click to change.`}
          className={cn(triggerClasses, className)}
        >
          {content}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" side="top" sideOffset={8} className="w-[300px] p-3">
        <LanguageList
          value={value}
          onSelect={(code) => {
            onChange(code);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

export { LanguageList as CourseLanguageList };
