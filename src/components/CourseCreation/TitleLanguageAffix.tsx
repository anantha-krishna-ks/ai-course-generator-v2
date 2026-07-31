import { useState } from "react";
import { ChevronDown, Globe, Lock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm"
      >
        <Globe className="w-3 h-3" />
      </span>
      <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-foreground">
        {lang.code}
      </span>
      <span aria-hidden="true" className="h-3 w-px bg-border hidden sm:block" />
      <span className="text-[11px] font-medium text-muted-foreground max-w-[92px] truncate hidden sm:inline">
        {lang.label}
      </span>
      {lang.dir === "rtl" && (
        <span className="text-[9px] font-bold uppercase tracking-wide text-primary bg-primary/10 rounded-full px-1.5 py-px">
          RTL
        </span>
      )}
      {locked ? (
        <Lock className="w-3 h-3 text-muted-foreground" aria-hidden="true" focusable="false" />
      ) : (
        <ChevronDown
          className={cn(
            "w-3 h-3 text-muted-foreground transition-transform duration-200",
            open && "rotate-180 text-primary",
          )}
          aria-hidden="true"
          focusable="false"
        />
      )}
    </>
  );

  const base = cn(
    "inline-flex items-center gap-1.5 h-8 ps-1 pe-2.5 rounded-full shrink-0 transition-all duration-200",
    "border border-border/70 bg-gradient-to-b from-background to-muted/60 shadow-[0_1px_2px_hsl(var(--foreground)/0.06)] backdrop-blur-sm",
    className,
  );

  return (
    <TooltipProvider delayDuration={180}>
      <Tooltip>
        <TooltipTrigger asChild>
          {locked ? (
            <span className={cn(base, "opacity-90 cursor-default")}>
              {inner}
              <span className="sr-only">Course language {lang.label} is locked</span>
            </span>
          ) : (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label={`Course language: ${lang.label}. Click to change.`}
                  className={cn(
                    base,
                    "hover:border-primary/50 hover:shadow-[0_2px_8px_hsl(var(--primary)/0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    open && "border-primary/60 ring-2 ring-primary/20",
                  )}
                >
                  {inner}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[300px] p-3 rounded-2xl shadow-xl">
                <CourseLanguageList
                  value={value}
                  onSelect={(code) => {
                    onChange(code);
                    setOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          )}
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8} className="rounded-lg px-2.5 py-1.5 text-xs font-medium">
          {locked ? (
            <span>Course language: <span className="font-semibold">{lang.label}</span> (locked)</span>
          ) : (
            <span>
              Course language: <span className="font-semibold">{lang.label}</span>
              <span className="text-muted-foreground"> · {lang.dir === "rtl" ? "RTL" : "LTR"}</span>
              <span className="text-muted-foreground"> — click to change</span>
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

