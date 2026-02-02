import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ExportCourseDialogProps {
  children?: React.ReactNode;
}

const templates = [
  {
    id: "artistic-essence",
    name: "Artistic Essence",
    preview: "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 50%, #e57373 100%)",
  },
  {
    id: "visionary-design",
    name: "Visionary Design",
    preview: "linear-gradient(135deg, #fff9e6 0%, #ffecb3 50%, #ffe082 100%)",
  },
  {
    id: "minimalist-magic",
    name: "Minimalist Magic",
    preview: "linear-gradient(135deg, #f5f0e8 0%, #d7ccc8 50%, #bcaaa4 100%)",
  },
  {
    id: "whitespace-wonders",
    name: "Whitespace Wonders",
    preview: "linear-gradient(135deg, #f0f9f4 0%, #c8e6c9 50%, #a5d6a7 100%)",
  },
];

const exportFormats = [
  { value: "scorm-2004", label: "SCORM 2004" },
  { value: "ms-word", label: "MS Word" },
  { value: "ppt", label: "PPT" },
  { value: "pdf", label: "PDF" },
  { value: "html", label: "Html" },
];

export const ExportCourseDialog = ({ children }: ExportCourseDialogProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<string>("");
  const [open, setOpen] = useState(false);

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Exporting with:", { selectedTemplate, exportFormat });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Export Course</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Export Format Selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Export Format:</span>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-background">
                {exportFormats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Template Grid - Only show for PPT */}
          {exportFormat === "ppt" && (
            <>
              <div>
                <h3 className="text-lg font-semibold">Available Templates:</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-lg",
                      selectedTemplate === template.id && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="p-4 space-y-3">
                      {/* Template Preview */}
                      <div
                        className="aspect-[4/3] rounded-lg"
                        style={{
                          background: template.preview,
                        }}
                      >
                        <div className="h-full p-4 flex flex-col">
                          <div className="text-[10px] font-semibold text-gray-700 mb-2">
                            Course Description
                          </div>
                          <div className="space-y-1">
                            <div className="h-1 bg-black/10 rounded w-3/4"></div>
                            <div className="h-1 bg-black/10 rounded w-full"></div>
                            <div className="h-1 bg-black/10 rounded w-5/6"></div>
                            <div className="h-1 bg-black/10 rounded w-4/5"></div>
                            <div className="h-1 bg-black/10 rounded w-full"></div>
                            <div className="h-1 bg-black/10 rounded w-2/3"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Template Name */}
                      <h4 className="text-center font-medium text-sm">
                        {template.name}
                      </h4>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
          <Button
            onClick={handleExport}
            disabled={!exportFormat || (exportFormat === "ppt" && !selectedTemplate)}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
