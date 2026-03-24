import { useState } from "react";
import { Download, FileText, Presentation, FileType, Globe, FileCheck, Check } from "lucide-react";
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
    description: "Web-ready interactive format",
    icon: Globe,
    color: "from-orange-500 to-amber-500",
    bgLight: "bg-orange-50",
  },
  {
    id: "ppt",
    label: "PPT",
    description: "PowerPoint presentation",
    icon: Presentation,
    color: "from-red-500 to-rose-500",
    bgLight: "bg-red-50",
  },
  {
    id: "word",
    label: "Word",
    description: "Microsoft Word document",
    icon: FileText,
    color: "from-blue-500 to-indigo-500",
    bgLight: "bg-blue-50",
  },
  {
    id: "scorm",
    label: "SCORM",
    description: "LMS-compatible package",
    icon: FileCheck,
    color: "from-emerald-500 to-teal-500",
    bgLight: "bg-emerald-50",
  },
  {
    id: "pdf",
    label: "PDF",
    description: "Portable document format",
    icon: FileType,
    color: "from-violet-500 to-purple-500",
    bgLight: "bg-violet-50",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg sm:max-w-xl p-0 overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 sm:px-6 sm:pt-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-semibold">
              Generate & Export
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Select a format to export your course.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Export Options Grid */}
        <div className="px-5 pb-2 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {exportOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedFormat === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedFormat(option.id)}
                  className={cn(
                    "group relative flex flex-col items-center gap-2.5 rounded-xl border p-4 sm:p-5 text-center transition-all duration-200",
                    "hover:shadow-sm hover:-translate-y-0.5",
                    isSelected
                      ? "border-primary bg-primary/[0.04] shadow-sm"
                      : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}

                  {/* Icon */}
                  <div
                    className={cn(
                      "flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm transition-transform duration-200",
                      option.color,
                      isSelected && "scale-110"
                    )}
                  >
                    <Icon className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
                  </div>

                  {/* Label */}
                  <div>
                    <p className={cn(
                      "text-sm font-semibold transition-colors",
                      isSelected ? "text-primary" : "text-foreground"
                    )}>
                      {option.label}
                    </p>
                    <p className="text-[11px] leading-tight text-muted-foreground mt-0.5 hidden sm:block">
                      {option.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 px-5 py-4 sm:px-6 border-t bg-muted/30">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="sm:w-auto w-full"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDownload}
            disabled={!selectedFormat}
            className="gap-2 sm:w-auto w-full"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
