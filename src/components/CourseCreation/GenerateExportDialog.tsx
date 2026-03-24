import { useState } from "react";
import { Download, FileText, Presentation, FileType, Globe, FileCheck, Check, Package } from "lucide-react";
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
    bg: "bg-orange-500",
    selectedBg: "bg-orange-600",
  },
  {
    id: "ppt",
    label: "PowerPoint",
    description: "Slide presentation",
    icon: Presentation,
    bg: "bg-red-500",
    selectedBg: "bg-red-600",
  },
  {
    id: "word",
    label: "Word",
    description: "Editable document",
    icon: FileText,
    bg: "bg-blue-600",
    selectedBg: "bg-blue-700",
  },
  {
    id: "scorm",
    label: "SCORM",
    description: "LMS package",
    icon: FileCheck,
    bg: "bg-emerald-600",
    selectedBg: "bg-emerald-700",
  },
  {
    id: "pdf",
    label: "PDF",
    description: "Print-ready file",
    icon: FileType,
    bg: "bg-violet-600",
    selectedBg: "bg-violet-700",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-[520px] p-0 overflow-hidden gap-0">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-4 w-4 text-primary" />
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
              const Icon = option.icon;
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
                  {/* Check badge */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary">
                      <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
                    </div>
                  )}

                  {/* Icon */}
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-xl text-white transition-transform duration-200",
                      isSelected ? cn(option.selectedBg, "scale-110 shadow-md") : cn(option.bg, "shadow-sm"),
                    )}
                  >
                    <Icon className="h-5 w-5" />
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
            <Download className="w-3.5 h-3.5" />
            {selectedOption ? `Download ${selectedOption.label}` : "Download"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
