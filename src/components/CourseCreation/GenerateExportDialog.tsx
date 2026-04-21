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
      <DialogContent className="w-[92vw] max-w-[520px] p-0 overflow-hidden gap-0">
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
