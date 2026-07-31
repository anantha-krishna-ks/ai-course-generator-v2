import { useState } from "react";
import { ChevronDown, Lock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getLanguage } from "@/services/courseLanguageStore";
import { CourseLanguageList } from "@/components/CourseCreation/CourseLanguagePicker";

interface TitleLanguageAffixProps {
  value: string;
  onChange: (code: string) => void;
  /** Read-only chip once the course language is locked. */
  locked?: boolean;
  className?: string;
}

/**
 * Language control that lives *inside* the course-title field, sitting on the
 * same baseline as the title text so it reads as part of the title, not as a
 * separate setting.
 */
export function TitleLanguageAffix({ value, onChange, locked = false, className }: TitleLanguageAffixProps) {
  const [open, setOpen] = useState(false);
  const lang = getLanguage(value);

  const inner = (
    <>
      <span
        aria-hidden="true"
        className="text-[10px] font-bold uppercase tracking-wider text-primary"
      >
        {lang.code}
      </span>
      <span className="text-xs font-medium text-muted-foreground max-w-[92px] truncate hidden sm:inline">
        {lang.label}
      </span>
      {lang.dir === "rtl" && (
        <span className="text-[9px] font-semibold uppercase tracking-wide text-primary/80">RTL</span>
      )}
      {locked ? (
        <Lock className="w-3 h-3 text-muted-foreground" aria-hidden="true" focusable="false" />
      ) : (
        <ChevronDown className="w-3 h-3 text-muted-foreground" aria-hidden="true" focusable="false" />
      )}
    </>
  );

  const base = cn(
    "inline-flex items-center gap-1.5 h-7 px-2 rounded-full bg-muted/60 border border-transparent transition-colors shrink-0",
    className,
  );

  if (locked) {
    return (
      <span className={base} title={`Course language: ${lang.label} (locked)`}>
        {inner}
        <span className="sr-only">Course language {lang.label} is locked</span>
      </span>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Course language: ${lang.label}. Click to change.`}
          className={cn(
            base,
            "hover:bg-muted hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          )}
        >
          {inner}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[300px] p-3">
        <CourseLanguageList
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
