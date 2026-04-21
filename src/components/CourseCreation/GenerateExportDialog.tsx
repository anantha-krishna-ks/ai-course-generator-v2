import { useRef, useState } from "react";
import { Download, Check, Wand2, Clock, ImagePlus, Sliders, CheckCircle2, XCircle, Upload, X } from "lucide-react";
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
            <div className="px-5 sm:px-6 pb-6">
              <div className="rounded-2xl border border-border/70 bg-gradient-to-b from-primary/[0.03] to-transparent overflow-hidden">
                {/* Section header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border/60 bg-background/40 backdrop-blur-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Sliders className="h-4 w-4 text-primary" aria-hidden="true" focusable="false" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold text-foreground leading-tight">SCORM Preferences</h3>
                    <p className="text-[13px] text-muted-foreground leading-tight mt-0.5">Tune playback inside an LMS</p>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Page Duration */}
                  <div className="rounded-xl border border-border/60 bg-background p-4">
                    <Label htmlFor="scorm-duration" className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
                      <Clock className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
                      Page Duration
                    </Label>
                    <p className="text-[12.5px] text-muted-foreground mt-0.5">Minimum time learners spend per page.</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Input
                        id="scorm-duration"
                        type="number"
                        min={5}
                        max={600}
                        value={pageDuration}
                        onChange={(e) => setPageDuration(Number(e.target.value))}
                        className="h-10 text-[14px] font-medium border-0 bg-muted/40 px-3 focus-visible:ring-1 max-w-[140px]"
                      />
                      <span className="text-[13px] text-muted-foreground">seconds</span>
                    </div>
                  </div>

                  {/* Background Image */}
                  <div className="rounded-xl border border-border/60 bg-background p-4">
                    <Label className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
                      <ImagePlus className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
                      Background Image
                    </Label>
                    <p className="text-[12.5px] text-muted-foreground mt-0.5">Shown behind every SCORM page.</p>
                    {bgImage ? (
                      <div className="mt-3 flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-2.5">
                        <div
                          className="h-14 w-20 rounded-md bg-center bg-cover shrink-0 border border-border/40"
                          style={{ backgroundImage: `url(${bgImage.url})` }}
                          role="img"
                          aria-label={bgImage.name}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[13.5px] font-medium text-foreground truncate">{bgImage.name}</p>
                          <p className="text-[12px] text-muted-foreground">Background image</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setBgImage(null)}
                          aria-label="Remove background image"
                          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-background"
                        >
                          <X className="w-4 h-4" aria-hidden="true" focusable="false" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-3 w-full flex flex-col items-center justify-center gap-1 py-5 rounded-lg border-2 border-dashed border-primary/40 bg-primary/[0.04] text-primary hover:bg-primary/[0.08] transition-colors"
                      >
                        <Upload className="w-4 h-4" aria-hidden="true" focusable="false" />
                        <span className="text-[13.5px] font-medium">Click to upload background</span>
                        <span className="text-[12px] text-muted-foreground">PNG or JPG · Recommended 1920×1080</span>
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

                  {/* Opacity — modern UI: live preview + preset chips + slider */}
                  <div className="rounded-xl border border-border/60 bg-background p-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="scorm-opacity" className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
                        <Sliders className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
                        Background Opacity
                      </Label>
                      <div className="flex items-baseline gap-1 rounded-md bg-primary/10 px-2.5 py-1">
                        <span className="text-[15px] font-bold text-primary tabular-nums leading-none">{opacity}</span>
                        <span className="text-[11px] font-medium text-primary/70">%</span>
                      </div>
                    </div>
                    <p className="text-[12.5px] text-muted-foreground mt-0.5">How prominent the background image appears.</p>

                    {/* Live preview strip */}
                    <div
                      className="relative mt-3 h-14 rounded-lg overflow-hidden border border-border/60"
                      style={{
                        backgroundImage: bgImage
                          ? `url(${bgImage.url})`
                          : "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.6) 100%)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                      aria-hidden="true"
                    >
                      <div
                        className="absolute inset-0 bg-background transition-opacity"
                        style={{ opacity: 1 - opacity / 100 }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[12.5px] font-medium text-foreground/80 px-2 py-0.5 rounded bg-background/60 backdrop-blur-sm">
                          Preview
                        </span>
                      </div>
                    </div>

                    {/* Preset chips */}
                    <div className="mt-3 grid grid-cols-5 gap-1.5">
                      {[0, 25, 50, 75, 100].map((preset) => {
                        const active = opacity === preset;
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setOpacity(preset)}
                            aria-pressed={active}
                            className={cn(
                              "h-8 rounded-md text-[12.5px] font-semibold border transition-colors",
                              active
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted/40 text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground"
                            )}
                          >
                            {preset}%
                          </button>
                        );
                      })}
                    </div>

                    {/* Fine-tune slider */}
                    <div className="mt-4">
                      <Slider
                        id="scorm-opacity"
                        value={[opacity]}
                        onValueChange={(v) => setOpacity(v[0])}
                        min={0}
                        max={100}
                        step={1}
                        aria-label="Background opacity"
                      />
                      <div className="flex justify-between mt-1.5 text-[11.5px] text-muted-foreground">
                        <span>Transparent</span>
                        <span>Opaque</span>
                      </div>
                    </div>
                  </div>

                  {/* Pass / Fail messages */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-border/60 bg-background p-4">
                      <Label htmlFor="scorm-pass" className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
                        Pass Message
                      </Label>
                      <p className="text-[12.5px] text-muted-foreground mt-0.5">Shown on successful completion.</p>
                      <Textarea
                        id="scorm-pass"
                        value={passMessage}
                        onChange={(e) => setPassMessage(e.target.value)}
                        rows={3}
                        className="mt-2 text-[13.5px] min-h-[72px] resize-none border-0 bg-muted/30 focus-visible:ring-1 focus-visible:ring-primary/40"
                      />
                    </div>

                    <div className="rounded-xl border border-border/60 bg-background p-4">
                      <Label htmlFor="scorm-fail" className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
                        <XCircle className="w-3.5 h-3.5 text-destructive" aria-hidden="true" focusable="false" />
                        Fail Message
                      </Label>
                      <p className="text-[12.5px] text-muted-foreground mt-0.5">Shown when learners fall short.</p>
                      <Textarea
                        id="scorm-fail"
                        value={failMessage}
                        onChange={(e) => setFailMessage(e.target.value)}
                        rows={3}
                        className="mt-2 text-[13.5px] min-h-[72px] resize-none border-0 bg-muted/30 focus-visible:ring-1 focus-visible:ring-destructive/40"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
