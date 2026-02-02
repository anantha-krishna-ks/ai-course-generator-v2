import { useState } from "react";
import { FileText, RotateCcw, History, Clock, CheckCircle, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface OverviewVersion {
  id: number;
  content: string;
  inclusions: string;
  exclusions: string;
  timestamp: string;
  operation: string;
}

interface EditOverviewDialogProps {
  open: boolean;
  onClose: () => void;
  chapterTitle: string;
  overviewText: string;
  versionHistory?: OverviewVersion[];
  onSave?: (data: { content: string; inclusions: string; exclusions: string }) => void;
  onRegenerate?: () => void;
  onRestoreVersion?: (versionId: number) => void;
}

export const EditOverviewDialog = ({
  open,
  onClose,
  chapterTitle,
  overviewText,
  versionHistory = [],
  onSave,
  onRegenerate,
  onRestoreVersion,
}: EditOverviewDialogProps) => {
  const [content, setContent] = useState(overviewText);
  const [inclusions, setInclusions] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [specificInstructions, setSpecificInstructions] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const handleSave = () => {
    onSave?.({ content, inclusions, exclusions });
    onClose();
  };

  const handleRegenerate = () => {
    onRegenerate?.();
  };

  const handleRestoreVersion = (versionId: number) => {
    const version = versionHistory.find(v => v.id === versionId);
    if (version) {
      setContent(version.content);
      setInclusions(version.inclusions);
      setExclusions(version.exclusions);
      onRestoreVersion?.(versionId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b flex-shrink-0 pr-12 sm:pr-14">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0 pr-2 sm:pr-0">
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="truncate">Edit Chapter Overview</span>
              </DialogTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                {chapterTitle}
              </p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVersionHistory(!showVersionHistory)}
              className="gap-2 flex-shrink-0 w-full sm:w-auto sm:mr-2"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">{showVersionHistory ? "Edit" : "Version History"}</span>
              <span className="sm:hidden">{showVersionHistory ? "Edit" : "Versions"}</span>
              {versionHistory.length > 0 && (
                <Badge variant="secondary" className="text-xs ml-1">
                  {versionHistory.length}
                </Badge>
              )}
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-4 sm:px-6 py-3 sm:py-4" style={{ maxHeight: "calc(90vh - 180px)" }}>
          {showVersionHistory ? (
            // Version History View
            <div className="space-y-3 py-2">
              {versionHistory.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <History className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    No version history yet
                  </p>
                </div>
              ) : (
                versionHistory.map((version, index) => (
                  <div
                    key={version.id}
                    className="border rounded-lg p-3 sm:p-4 transition-all hover:border-primary/50 bg-card"
                  >
                    <div className="space-y-3">
                      {/* Version Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-sm">
                              Version {versionHistory.length - index}
                            </h4>
                            {index === 0 && (
                              <Badge variant="default" className="text-xs">
                                Current
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">
                              {new Date(version.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        {index !== 0 && (
                          <Button
                            size="sm"
                            onClick={() => handleRestoreVersion(version.id)}
                            className="text-xs w-full sm:w-auto flex-shrink-0"
                          >
                            <RotateCcw className="w-3 h-3 mr-1.5" />
                            Restore
                          </Button>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {version.operation}
                      </p>

                      {/* Content Preview */}
                      <div className="space-y-2">
                        <div className="text-xs font-medium">Content:</div>
                        <div className="text-xs text-muted-foreground bg-muted/30 p-2 sm:p-3 rounded border max-h-32 overflow-y-auto">
                          <div dangerouslySetInnerHTML={{ __html: version.content }} />
                        </div>
                      </div>

                      {/* Inclusions/Exclusions */}
                      {(version.inclusions || version.exclusions) && (
                        <div className="grid sm:grid-cols-2 gap-3">
                          {version.inclusions && (
                            <div>
                              <div className="text-xs font-medium mb-1">Inclusions:</div>
                              <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded border">
                                {version.inclusions}
                              </div>
                            </div>
                          )}
                          {version.exclusions && (
                            <div>
                              <div className="text-xs font-medium mb-1">Exclusions:</div>
                              <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded border">
                                {version.exclusions}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            // Edit View
            <div className="space-y-4 sm:space-y-6">
              {/* Rich Text Editor for Content */}
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-semibold">Content</Label>
                <RichTextEditor content={content} onChange={setContent} />
              </div>

              <Separator />

              {/* Inclusions and Exclusions */}
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="inclusions" className="text-sm sm:text-base font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Inclusions
                  </Label>
                  <Textarea
                    id="inclusions"
                    value={inclusions}
                    onChange={(e) => setInclusions(e.target.value)}
                    placeholder="What should be included in this chapter..."
                    className="min-h-[120px] sm:min-h-[150px] resize-none text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exclusions" className="text-sm sm:text-base font-semibold flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    Exclusions
                  </Label>
                  <Textarea
                    id="exclusions"
                    value={exclusions}
                    onChange={(e) => setExclusions(e.target.value)}
                    placeholder="What should be excluded from this chapter..."
                    className="min-h-[120px] sm:min-h-[150px] resize-none text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Footer Actions */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t bg-muted/30 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            {!showVersionHistory && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <Button
                  variant="outline"
                  className="gap-2 text-sm"
                  onClick={handleRegenerate}
                >
                  <RotateCcw className="w-4 h-4" />
                  Regenerate Content
                </Button>
                
                <div className="flex items-center gap-2 px-2 sm:px-0">
                  <Switch
                    id="specific-instructions"
                    checked={specificInstructions}
                    onCheckedChange={setSpecificInstructions}
                  />
                  <Label htmlFor="specific-instructions" className="text-xs sm:text-sm cursor-pointer">
                    Specific instructions
                  </Label>
                </div>
              </div>
            )}

            <div className={`flex items-center gap-2 sm:gap-3 ${showVersionHistory ? 'ml-auto' : ''}`}>
              <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none text-sm">
                Cancel
              </Button>
              {!showVersionHistory && (
                <Button onClick={handleSave} className="flex-1 sm:flex-none text-sm">
                  Save & Close
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
