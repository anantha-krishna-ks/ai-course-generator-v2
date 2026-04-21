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
            <div className="px-4 sm:px-5 pb-5">
              <div className="rounded-2xl border border-border/70 bg-gradient-to-b from-primary/[0.03] to-transparent overflow-hidden">
                {/* Section header */}
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/60 bg-background/40 backdrop-blur-sm">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                    <Sliders className="h-3.5 w-3.5 text-primary" aria-hidden="true" focusable="false" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[13px] font-semibold text-foreground leading-tight">SCORM Preferences</h3>
                    <p className="text-[11px] text-muted-foreground leading-tight">Tune playback inside an LMS</p>
                  </div>
                </div>

                <div className="p-4 space-y-3.5">
                  {/* Row: Page duration + Opacity */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-xl border border-border/60 bg-background p-3">
                      <Label htmlFor="scorm-duration" className="flex items-center gap-1.5 text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wide">
                        <Clock className="w-3 h-3" aria-hidden="true" focusable="false" />
                        Page Duration
                      </Label>
                      <div className="mt-2 flex items-baseline gap-1.5">
                        <Input
                          id="scorm-duration"
                          type="number"
                          min={5}
                          max={600}
                          value={pageDuration}
                          onChange={(e) => setPageDuration(Number(e.target.value))}
                          className="h-9 text-sm font-medium border-0 bg-muted/40 px-2.5 focus-visible:ring-1"
                        />
                        <span className="text-[11px] text-muted-foreground shrink-0">sec</span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/60 bg-background p-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="scorm-opacity" className="flex items-center gap-1.5 text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wide">
                          <Sliders className="w-3 h-3" aria-hidden="true" focusable="false" />
                          Opacity
                        </Label>
                        <span className="text-[12px] font-semibold text-primary tabular-nums">{opacity}%</span>
                      </div>
                      <div className="mt-3.5">
                        <Slider
                          id="scorm-opacity"
                          value={[opacity]}
                          onValueChange={(v) => setOpacity(v[0])}
                          min={0}
                          max={100}
                          step={5}
                          aria-label="Background opacity"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Background Image */}
                  <div className="rounded-xl border border-border/60 bg-background p-3">
                    <Label className="flex items-center gap-1.5 text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wide">
                      <ImagePlus className="w-3 h-3" aria-hidden="true" focusable="false" />
                      Background Image
                    </Label>
                    {bgImage ? (
                      <div className="mt-2 flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/30 p-2">
                        <div
                          className="h-12 w-16 rounded-md bg-center bg-cover shrink-0 border border-border/40"
                          style={{ backgroundImage: `url(${bgImage.url})` }}
                          role="img"
                          aria-label={bgImage.name}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-medium text-foreground truncate">{bgImage.name}</p>
                          <p className="text-[10.5px] text-muted-foreground">Background image</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setBgImage(null)}
                          aria-label="Remove background image"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-background"
                        >
                          <X className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-primary/40 bg-primary/[0.04] text-primary hover:bg-primary/[0.08] transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                        <span className="text-[12px] font-medium">Upload image</span>
                        <span className="text-[10.5px] text-muted-foreground">PNG, JPG · 1920×1080</span>
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

                  {/* Pass / Fail messages */}
                  <div className="grid grid-cols-1 gap-2.5">
                    <div className="rounded-xl border border-border/60 bg-background p-3">
                      <Label htmlFor="scorm-pass" className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-primary">
                        <CheckCircle2 className="w-3 h-3" aria-hidden="true" focusable="false" />
                        Pass Message
                      </Label>
                      <Textarea
                        id="scorm-pass"
                        value={passMessage}
                        onChange={(e) => setPassMessage(e.target.value)}
                        rows={2}
                        className="mt-1.5 text-[12.5px] min-h-[52px] resize-none border-0 bg-muted/30 focus-visible:ring-1 focus-visible:ring-primary/40"
                      />
                    </div>

                    <div className="rounded-xl border border-border/60 bg-background p-3">
                      <Label htmlFor="scorm-fail" className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-destructive">
                        <XCircle className="w-3 h-3" aria-hidden="true" focusable="false" />
                        Fail Message
                      </Label>
                      <Textarea
                        id="scorm-fail"
                        value={failMessage}
                        onChange={(e) => setFailMessage(e.target.value)}
                        rows={2}
                        className="mt-1.5 text-[12.5px] min-h-[52px] resize-none border-0 bg-muted/30 focus-visible:ring-1 focus-visible:ring-destructive/40"
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
