import { useRef, useState } from "react";
import { Sliders, Upload, X, CheckCircle2, XCircle, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import scormPlaceholder from "@/assets/scorm-placeholder.jpg";

interface ScormPreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BgImage {
  name: string;
  url: string;
}

const DEFAULT_PASS = "Congratulations! You've successfully completed this course.";
const DEFAULT_FAIL = "You did not meet the passing criteria. Please review the content and try again.";

export function ScormPreferencesDialog({ open, onOpenChange }: ScormPreferencesDialogProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pageDurationSec, setPageDurationSec] = useState(30);
  const [bgImage, setBgImage] = useState<BgImage | null>(null);
  const [bgOpacity, setBgOpacity] = useState(40);
  const [passMessage, setPassMessage] = useState(DEFAULT_PASS);
  const [failMessage, setFailMessage] = useState(DEFAULT_FAIL);

  const mins = Math.floor(pageDurationSec / 60);
  const secs = pageDurationSec % 60;

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setBgImage({ name: file.name, url });
  };

  const handleSave = () => {
    toast({
      title: "SCORM preferences saved",
      description: "Your SCORM export settings have been updated.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-5 sm:px-6 pt-5 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/20 shrink-0">
              <Sliders className="h-4 w-4 text-primary" aria-hidden="true" focusable="false" />
            </div>
            <span className="text-[16px] font-semibold text-foreground leading-tight">
              SCORM Preferences
            </span>
          </DialogTitle>
          <DialogDescription className="text-[13.5px] text-muted-foreground pl-12 -mt-1">
            Configure how the package behaves inside an LMS
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto scorm-dark-scrollbar">
          <style>{`
            .scorm-dark-scrollbar { scrollbar-width: thin; scrollbar-color: hsl(var(--muted-foreground) / 0.55) transparent; }
            .scorm-dark-scrollbar::-webkit-scrollbar { width: 8px; }
            .scorm-dark-scrollbar::-webkit-scrollbar-track { background: hsl(var(--muted) / 0.4); border-radius: 9999px; }
            .scorm-dark-scrollbar::-webkit-scrollbar-thumb { background-color: hsl(var(--muted-foreground) / 0.55); border-radius: 9999px; border: 2px solid transparent; background-clip: padding-box; }
            .scorm-dark-scrollbar::-webkit-scrollbar-thumb:hover { background-color: hsl(var(--foreground) / 0.65); }
          `}</style>
          <div className="divide-y divide-border">
            {/* Page Duration */}
            <div className="p-5">
              <Label className="text-[16px] font-semibold text-foreground">Page Duration</Label>
              <p className="text-[13.5px] text-muted-foreground mt-1">
                Minimum time learners must spend on each page before progressing.
              </p>
              <div className="mt-3 flex items-end gap-3">
                <div className="flex flex-col">
                  <span className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                    Minutes
                  </span>
                  <Input
                    type="number"
                    min={0}
                    max={60}
                    value={mins}
                    onChange={(e) => {
                      const m = Math.max(0, Math.min(60, Number(e.target.value) || 0));
                      setPageDurationSec(m * 60 + secs);
                    }}
                    aria-label="Minutes"
                    className="h-12 w-20 text-center text-[17px] font-semibold tabular-nums rounded-lg"
                  />
                </div>
                <span aria-hidden="true" className="text-[22px] font-light text-muted-foreground pb-2 select-none">:</span>
                <div className="flex flex-col">
                  <span className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                    Seconds
                  </span>
                  <Input
                    type="number"
                    min={0}
                    max={59}
                    value={secs}
                    onChange={(e) => {
                      const s = Math.max(0, Math.min(59, Number(e.target.value) || 0));
                      setPageDurationSec(mins * 60 + s);
                    }}
                    aria-label="Seconds"
                    className="h-12 w-20 text-center text-[17px] font-semibold tabular-nums rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Background Image */}
            <div className="p-5">
              <Label className="text-[16px] font-semibold text-foreground">Background Image</Label>
              <p className="text-[13.5px] text-muted-foreground mt-1">
                Displayed behind every SCORM page. PNG or JPG, recommended 1920×1080.
              </p>
              {bgImage ? (
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-2.5">
                  <div
                    className="h-16 w-24 rounded-lg bg-center bg-cover shrink-0 border border-border"
                    style={{ backgroundImage: `url(${bgImage.url})` }}
                    role="img"
                    aria-label={bgImage.name}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-foreground truncate">{bgImage.name}</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[13px] font-medium text-primary hover:underline mt-1"
                    >
                      Replace image
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBgImage(null)}
                    aria-label="Remove background image"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-background"
                  >
                    <X className="w-4 h-4" aria-hidden="true" focusable="false" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 w-full flex items-center justify-center gap-2.5 py-5 rounded-xl border-2 border-dashed border-primary/40 bg-primary/[0.04] text-primary hover:bg-primary/[0.08] hover:border-primary/60 transition-colors"
                >
                  <Upload className="w-[18px] h-[18px]" aria-hidden="true" focusable="false" />
                  <span className="text-[15px] font-semibold">Upload background image</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                  e.target.value = "";
                }}
                aria-label="Background image file"
              />
            </div>

            {/* Background Opacity */}
            <div className="p-5">
              <Label className="text-[16px] font-semibold text-foreground">
                Background Opacity
              </Label>
              <p className="text-[13.5px] text-muted-foreground mt-1">
                Drag the slider to adjust how visible the background appears.
              </p>

              {/* Live preview */}
              <div
                className="relative mt-4 h-40 rounded-2xl overflow-hidden border border-border shadow-inner"
                style={{
                  backgroundImage: `url(${bgImage ? bgImage.url : scormPlaceholder})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                aria-hidden="true"
              >
                <div
                  className="absolute inset-0 bg-background transition-opacity"
                  style={{ opacity: 1 - bgOpacity / 100 }}
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/85 backdrop-blur-sm border border-border/60 pointer-events-none">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
                  <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">
                    {bgImage ? "Live preview" : "Sample preview"}
                  </span>
                </div>
                {!bgImage && (
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-background/80 backdrop-blur-sm border border-border/60 pointer-events-none">
                    <span className="text-[11.5px] font-medium text-muted-foreground">Upload an image to preview yours</span>
                  </div>
                )}
              </div>

              {/* Slider with value bubble + tick marks */}
              <div className="mt-6 px-1">
                <div className="relative">
                  <div
                    className="absolute -top-9 -translate-x-1/2 pointer-events-none transition-all"
                    style={{ left: `${bgOpacity}%` }}
                  >
                    <div className="relative flex items-center justify-center min-w-[44px] h-7 px-2 rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold tabular-nums shadow-md">
                      {bgOpacity}%
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-primary" />
                    </div>
                  </div>

                  <Slider
                    value={[bgOpacity]}
                    onValueChange={([v]) => setBgOpacity(v)}
                    min={0}
                    max={100}
                    step={1}
                    aria-label="Background opacity"
                    className="[&_[role=slider]]:h-6 [&_[role=slider]]:w-6 [&_[role=slider]]:shadow-lg [&_[role=slider]]:border-[3px] [&_[data-orientation=horizontal]]:h-2.5 [&>span:first-child]:bg-muted [&>span:first-child>span]:bg-gradient-to-r [&>span:first-child>span]:from-primary/70 [&>span:first-child>span]:to-primary"
                  />

                  <div className="relative mt-2 px-[2px]" aria-hidden="true">
                    <div className="flex justify-between">
                      {[0, 25, 50, 75, 100].map((t) => (
                        <div key={t} className="flex flex-col items-center gap-1">
                          <div className={cn(
                            "w-px h-1.5",
                            bgOpacity >= t ? "bg-primary/60" : "bg-border"
                          )} />
                          <span className="text-[12px] font-medium text-muted-foreground tabular-nums">
                            {t}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-3 text-[13.5px] font-medium text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-muted border border-border" />
                    Transparent
                  </span>
                  <span className="flex items-center gap-1.5">
                    Fully visible
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  </span>
                </div>
              </div>
            </div>

            {/* Completion Messages */}
            <div className="p-5">
              <Label className="text-[16px] font-semibold text-foreground">
                Completion Messages
              </Label>
              <p className="text-[13.5px] text-muted-foreground mt-1">
                Shown to learners based on their final result.
              </p>

              <div className="mt-3 grid grid-cols-1 gap-3">
                {/* Pass */}
                <div className="rounded-xl border border-border bg-background overflow-hidden">
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-primary/5 border-b border-border">
                    <CheckCircle2 className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
                    <Label htmlFor="scorm-pass-msg" className="text-[14.5px] font-semibold text-foreground">
                      Pass criteria message
                    </Label>
                  </div>
                  <Textarea
                    id="scorm-pass-msg"
                    value={passMessage}
                    onChange={(e) => setPassMessage(e.target.value)}
                    rows={3}
                    className="text-[14.5px] min-h-[80px] resize-none border-0 bg-transparent rounded-none focus-visible:ring-0"
                  />
                </div>

                {/* Fail */}
                <div className="rounded-xl border border-border bg-background overflow-hidden">
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-destructive/5 border-b border-border">
                    <XCircle className="w-4 h-4 text-destructive" aria-hidden="true" focusable="false" />
                    <Label htmlFor="scorm-fail-msg" className="text-[14.5px] font-semibold text-foreground">
                      Fail criteria message
                    </Label>
                  </div>
                  <Textarea
                    id="scorm-fail-msg"
                    value={failMessage}
                    onChange={(e) => setFailMessage(e.target.value)}
                    rows={3}
                    className="text-[14.5px] min-h-[80px] resize-none border-0 bg-transparent rounded-none focus-visible:ring-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-5 sm:px-6 py-3 border-t border-border bg-muted/20">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} className="gap-2">
            <Check className="w-4 h-4" aria-hidden="true" focusable="false" />
            Save preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
