import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { COURSE_LANGUAGES, getLanguage } from "@/services/courseLanguageStore";

interface TranslateCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseTitle: string;
  sourceLanguage: string;
  onTranslate: (targetCode: string) => void;
}

/**
 * Translation creates a NEW course in the target language — the source course
 * is never modified. Text and media narration are translated; attached
 * documents are carried over untranslated.
 */
export function TranslateCourseDialog({
  open,
  onOpenChange,
  courseTitle,
  sourceLanguage,
  onTranslate,
}: TranslateCourseDialogProps) {
  const [target, setTarget] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const source = getLanguage(sourceLanguage);

  const handleTranslate = () => {
    if (!target) return;
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      onTranslate(target);
      onOpenChange(false);
      setTarget("");
    }, 1400);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-primary" aria-hidden="true" focusable="false" />
            Translate course
          </DialogTitle>
          <DialogDescription>
            Creates a new course in the selected language. “{courseTitle}” ({source.label}) stays unchanged.
            Attached source documents are copied without translation.
          </DialogDescription>
        </DialogHeader>

        <div
          role="radiogroup"
          aria-label="Target language"
          className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[320px] overflow-y-auto pretty-scrollbar pr-1"
        >
          {COURSE_LANGUAGES.filter((l) => l.code !== sourceLanguage).map((lang) => {
            const isActive = lang.code === target;
            return (
              <button
                key={lang.code}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setTarget(lang.code)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-all",
                  isActive
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card hover:border-primary/40 hover:bg-muted/40",
                )}
              >
                <span className="block text-sm font-semibold text-foreground truncate">{lang.label}</span>
                <span className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-muted-foreground truncate" dir={lang.dir}>
                    {lang.native}
                  </span>
                  {lang.dir === "rtl" && (
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-primary rounded-full bg-primary/10 px-1.5 py-0.5">
                      RTL
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="rounded-full gap-2" disabled={!target || busy} onClick={handleTranslate}>
            {busy && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" focusable="false" />}
            {busy ? "Translating…" : "Translate course"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
