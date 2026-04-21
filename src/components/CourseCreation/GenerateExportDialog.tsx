import { useRef, useState } from "react";
import { Download, Check, Wand2, Sliders, CheckCircle2, XCircle, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import scormPlaceholder from "@/assets/scorm-placeholder.jpg";
import {
  HtmlIcon,
  PowerPointIcon,
  WordIcon,
  ScormIcon,
  PdfIcon,
} from "./exportFormatIcons";

interface GenerateExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseTitle?: string;
}

const exportOptions = [
  { id: "html", label: "HTML", description: "Interactive web format", Icon: HtmlIcon },
  { id: "ppt", label: "PowerPoint", description: "Slide presentation", Icon: PowerPointIcon },
  { id: "word", label: "Word", description: "Editable document", Icon: WordIcon },
  { id: "scorm", label: "SCORM", description: "LMS package", Icon: ScormIcon },
  { id: "pdf", label: "PDF", description: "Print-ready file", Icon: PdfIcon },
];

export const GenerateExportDialog = ({
  open,
  onOpenChange,
  courseTitle,
}: GenerateExportDialogProps) => {
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [pageDuration, setPageDuration] = useState<number>(30);
  const [bgImage, setBgImage] = useState<{ name: string; url: string } | null>(null);
  const [opacity, setOpacity] = useState<number>(40);
  const [passMessage, setPassMessage] = useState<string>(
    "Congratulations! You have successfully completed the course."
  );
  const [failMessage, setFailMessage] = useState<string>(
    "You did not meet the passing criteria. Please review the material and try again."
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleBgUpload = (file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBgImage({ name: file.name, url });
  };

  const handleDownload = () => {
    if (!selectedFormat) return;
    const format = exportOptions.find((o) => o.id === selectedFormat);
    onOpenChange(false);
    setSelectedFormat(null);
    const { update, id } = toast({
      title: "Download Started",
      description: `Your course "${courseTitle || "Untitled"}" is being exported as ${format?.label}. The download will begin shortly.`,
    });

    setTimeout(() => {
      update({
        id,
        title: "Download Completed",
        description: `Your course "${courseTitle || "Untitled"}" has been successfully exported as ${format?.label}.`,
      });
    }, 1500);
  };

  const selectedOption = exportOptions.find((o) => o.id === selectedFormat);
  const isScorm = selectedFormat === "scorm";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] max-w-[680px] p-0 overflow-hidden gap-0 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Wand2 className="h-4 w-4 text-primary" />
            </div>
            <DialogHeader className="space-y-0">
              <DialogTitle className="text-base sm:text-lg font-semibold leading-tight">
                Export Course
              </DialogTitle>
            </DialogHeader>
          </div>
          <DialogDescription className="text-[13px] text-muted-foreground pl-[42px]">
            Choose your preferred format
          </DialogDescription>
        </div>

        <div className="h-px bg-border" />

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Grid layout */}
          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {exportOptions.map((option) => {
                const Icon = option.Icon;
                const isSelected = selectedFormat === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedFormat(option.id)}
                    className={cn(
                      "group relative flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all duration-200",
                      "hover:bg-accent/50 hover:shadow-sm",
                      isSelected
                        ? "border-primary/50 bg-primary/[0.06] ring-1 ring-primary/20 shadow-sm"
                        : "border-border/60"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} aria-hidden="true" focusable="false" />
                      </div>
                    )}

                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center transition-transform duration-200",
                        isSelected && "scale-110",
                      )}
                    >
                      <Icon className="h-11 w-11 drop-shadow-sm" />
                    </div>

                    {/* Label */}
                    <div>
                      <p className={cn(
                        "text-[13px] font-semibold leading-tight",
                        isSelected ? "text-primary" : "text-foreground"
                      )}>
                        {option.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                        {option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SCORM Preferences */}
          {isScorm && (
            <section className="px-5 sm:px-6 pb-6" aria-labelledby="scorm-prefs-title">
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                {/* Section header */}
                <header className="flex items-center justify-between gap-3 px-5 py-4 bg-gradient-to-r from-primary/[0.07] via-primary/[0.04] to-transparent border-b border-border">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/20">
                      <Sliders className="h-[18px] w-[18px] text-primary" aria-hidden="true" focusable="false" />
                    </div>
                    <div className="min-w-0">
                      <h3 id="scorm-prefs-title" className="text-[17px] font-semibold text-foreground leading-tight">
                        SCORM Preferences
                      </h3>
                      <p className="text-[13.5px] text-muted-foreground leading-snug mt-0.5">
                        Configure how the package behaves inside an LMS
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex items-center text-[12px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    Optional
                  </span>
                </header>

                {/* Body — divided rows with icon gutter */}
                <div className="divide-y divide-border">
                  {/* Row 1 — Page Duration */}
                  <div className="p-5">
                    <div className="min-w-0">
                      <Label htmlFor="scorm-duration" className="text-[14.5px] font-semibold text-foreground">
                        Page Duration
                      </Label>
                      <p className="text-[13px] text-muted-foreground mt-1">
                        Minimum time learners must spend on each page before progressing.
                      </p>
                      <div className="mt-3 flex items-end gap-3">
                        {/* Minutes */}
                        <div className="flex flex-col">
                          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                            Minutes
                          </span>
                          <Input
                            id="scorm-duration"
                            type="number"
                            min={0}
                            max={60}
                            value={Math.floor(pageDuration / 60)}
                            onChange={(e) => {
                              const mins = Math.max(0, Math.min(60, Number(e.target.value) || 0));
                              const secs = pageDuration % 60;
                              setPageDuration(mins * 60 + secs);
                            }}
                            aria-label="Minutes"
                            className="h-12 w-20 text-center text-[17px] font-semibold tabular-nums rounded-lg border border-border bg-background focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0"
                          />
                        </div>

                        {/* Separator */}
                        <span aria-hidden="true" className="text-[22px] font-light text-muted-foreground pb-2 select-none">
                          :
                        </span>

                        {/* Seconds */}
                        <div className="flex flex-col">
                          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                            Seconds
                          </span>
                          <Input
                            type="number"
                            min={0}
                            max={59}
                            value={pageDuration % 60}
                            onChange={(e) => {
                              const secs = Math.max(0, Math.min(59, Number(e.target.value) || 0));
                              const mins = Math.floor(pageDuration / 60);
                              setPageDuration(mins * 60 + secs);
                            }}
                            aria-label="Seconds"
                            className="h-12 w-20 text-center text-[17px] font-semibold tabular-nums rounded-lg border border-border bg-background focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 2 — Background Image */}
                  <div className="p-5">
                    <div className="min-w-0">
                      <Label className="text-[14.5px] font-semibold text-foreground">
                        Background Image
                      </Label>
                      <p className="text-[13px] text-muted-foreground mt-1">
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
                              className="text-[12.5px] font-medium text-primary hover:underline mt-1"
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
                          <span className="text-[14.5px] font-semibold">Upload background image</span>
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg"
                        className="hidden"
                        onChange={(e) => handleBgUpload(e.target.files?.[0])}
                        aria-label="Upload background image"
                      />
                    </div>
                  </div>

                  {/* Row 3 — Background Opacity */}
                  <div className="p-5">
                    <Label htmlFor="scorm-opacity" className="text-[14.5px] font-semibold text-foreground">
                      Background Opacity
                    </Label>
                    <p className="text-[13px] text-muted-foreground mt-1">
                      Drag the slider to adjust how visible the background appears.
                    </p>
                    <div className="mt-3 flex items-center gap-4">
                      <div
                        className="relative h-16 w-28 rounded-lg border border-border bg-muted/40 overflow-hidden shrink-0"
                        role="img"
                        aria-label="Sample preview"
                      >
                        {bgImage ? (
                          <div
                            className="absolute inset-0 bg-center bg-cover"
                            style={{
                              backgroundImage: `url(${bgImage.url})`,
                              opacity: opacity / 100,
                            }}
                          />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center text-[10.5px] text-muted-foreground px-2 text-center">
                            Upload an image to preview
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[12.5px] font-semibold text-foreground tabular-nums">
                            {opacity}%
                          </span>
                        </div>
                        <Slider
                          id="scorm-opacity"
                          value={[opacity]}
                          onValueChange={([v]) => setOpacity(v)}
                          min={0}
                          max={100}
                          step={5}
                          aria-label="Background opacity"
                        />
                        <div className="flex justify-between mt-1.5 text-[10.5px] text-muted-foreground">
                          <span>Transparent</span>
                          <span>Fully visible</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 4 — Completion Messages */}
                  <div className="p-5 space-y-4">
                    <div>
                      <Label className="text-[14.5px] font-semibold text-foreground">
                        Completion Messages
                      </Label>
                      <p className="text-[13px] text-muted-foreground mt-1">
                        Shown to learners based on their final result.
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="scorm-pass" className="text-[12.5px] font-medium text-foreground">
                        Pass criteria message
                      </Label>
                      <Textarea
                        id="scorm-pass"
                        value={passMessage}
                        onChange={(e) => setPassMessage(e.target.value)}
                        rows={2}
                        className="resize-none rounded-lg text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="scorm-fail" className="text-[12.5px] font-medium text-foreground">
                        Fail criteria message
                      </Label>
                      <Textarea
                        id="scorm-fail"
                        value={failMessage}
                        onChange={(e) => setFailMessage(e.target.value)}
                        rows={2}
                        className="resize-none rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="h-px bg-border" />
        <DialogFooter className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 px-5 py-3.5 sm:px-6 bg-muted/20">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="sm:w-auto w-full h-9 text-[13px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDownload}
            disabled={!selectedFormat}
            className="gap-2 sm:w-auto w-full h-9 text-[13px]"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
            {selectedOption ? `Download ${selectedOption.label}` : "Download"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
