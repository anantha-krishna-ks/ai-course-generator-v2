import { useState } from "react";
import { Download, FileText, Presentation, FileType, Globe, FileCheck } from "lucide-react";
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
  },
  {
    id: "ppt",
    label: "PPT",
    description: "PowerPoint presentation",
    icon: Presentation,
  },
  {
    id: "word",
    label: "Word",
    description: "Microsoft Word document",
    icon: FileText,
  },
  {
    id: "scorm",
    label: "SCORM",
    description: "LMS-compatible package",
    icon: FileCheck,
  },
  {
    id: "pdf",
    label: "PDF",
    description: "Portable document format",
    icon: FileType,
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Generate & Export Course
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose an export format to generate and download your course.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 py-4">
          {exportOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedFormat === option.id;
            return (
              <button
                key={option.id}
                onClick={() => setSelectedFormat(option.id)}
                className={cn(
                  "flex items-center gap-4 rounded-lg border px-4 py-3 text-left transition-all hover:bg-accent/50",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isSelected && "text-primary"
                    )}
                  >
                    {option.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <DialogFooter className="flex items-center gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDownload}
            disabled={!selectedFormat}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
