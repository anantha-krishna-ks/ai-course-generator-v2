import { useState } from "react";
import { Download, FileText, Presentation, FileType, Globe, FileCheck, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface GenerateExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseTitle?: string;
}

const exportOptions = [
  {
    id: "html",
    label: "HTML",
    description: "Interactive web format",
    icon: Globe,
    gradient: "from-orange-500 to-amber-400",
    shadow: "shadow-orange-500/20",
    ring: "ring-orange-500/30",
  },
  {
    id: "ppt",
    label: "PowerPoint",
    description: "Slide presentation",
    icon: Presentation,
    gradient: "from-red-500 to-rose-400",
    shadow: "shadow-red-500/20",
    ring: "ring-red-500/30",
  },
  {
    id: "word",
    label: "Word",
    description: "Editable document",
    icon: FileText,
    gradient: "from-blue-600 to-blue-400",
    shadow: "shadow-blue-500/20",
    ring: "ring-blue-500/30",
  },
  {
    id: "scorm",
    label: "SCORM",
    description: "LMS package",
    icon: FileCheck,
    gradient: "from-emerald-600 to-emerald-400",
    shadow: "shadow-emerald-500/20",
    ring: "ring-emerald-500/30",
  },
  {
    id: "pdf",
    label: "PDF",
    description: "Print-ready file",
    icon: FileType,
    gradient: "from-violet-600 to-purple-400",
    shadow: "shadow-violet-500/20",
    ring: "ring-violet-500/30",
  },
];

export const GenerateExportDialog = ({
  open,
  onOpenChange,
  courseTitle,
}: GenerateExportDialogProps) => {
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDownload = () => {
    if (!selectedFormat) return;
    const format = exportOptions.find((o) => o.id === selectedFormat);
    onOpenChange(false);
    setSelectedFormat(null);
    toast({
      title: "Download Started",
      description: `Your course "${courseTitle || "Untitled"}" is being exported as ${format?.label}. The download will begin shortly.`,
    });
  };

  const selectedOption = exportOptions.find((o) => o.id === selectedFormat);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-[480px] p-0 overflow-hidden gap-0">
        {/* Header with accent */}
        <div className="relative px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
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

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Export Options */}
        <div className="p-4 sm:p-5 space-y-2">
          {exportOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedFormat === option.id;
            return (
              <button
                key={option.id}
                onClick={() => setSelectedFormat(option.id)}
                className={cn(
                  "relative w-full flex items-center gap-3.5 rounded-xl border px-3.5 py-3 text-left transition-all duration-200",
                  "hover:bg-accent/40",
                  isSelected
                    ? "border-primary/40 bg-primary/[0.04] ring-1 ring-primary/20"
                    : "border-border/60"
                )}
              >
                {/* Icon pill */}
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white transition-all duration-200",
                    option.gradient,
                    isSelected ? cn("shadow-md", option.shadow, "scale-105") : "shadow-sm"
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-[13px] font-semibold leading-tight transition-colors",
                    isSelected ? "text-primary" : "text-foreground"
                  )}>
                    {option.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                    {option.description}
                  </p>
                </div>

                {/* Check */}
                <div className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-all duration-200",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground scale-100"
                    : "border-muted-foreground/25 bg-transparent scale-90"
                )}>
                  {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
                </div>
              </button>
            );
          })}
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
            <Download className="w-3.5 h-3.5" />
            {selectedOption ? `Download ${selectedOption.label}` : "Download"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
