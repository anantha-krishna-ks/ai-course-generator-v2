import { useState } from "react";
import { History, Clock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ChapterImageVersion {
  id: number;
  imageUrl: string;
  timestamp: string;
  operation: string;
  inputTokens: number;
  outputTokens: number;
}

interface ChapterImageDialogProps {
  open: boolean;
  onClose: () => void;
  chapterTitle: string;
  versionHistory?: ChapterImageVersion[];
  onViewVersion?: (versionId: number) => void;
  onRestoreVersion?: (versionId: number) => void;
}

export const ChapterImageDialog = ({
  open,
  onClose,
  chapterTitle,
  versionHistory = [],
  onViewVersion,
  onRestoreVersion
}: ChapterImageDialogProps) => {
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

  const handleRestoreVersion = (versionId: number) => {
    onRestoreVersion?.(versionId);
    setSelectedVersion(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-[95vw] h-[85vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="px-4 sm:px-6 py-4 border-b flex-shrink-0">
          <DialogTitle className="text-base sm:text-lg font-bold">
            {chapterTitle} - Image Versions
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm mt-1">
            View and restore previous image versions
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs sm:text-sm font-medium">Version History</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {versionHistory.length} version{versionHistory.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        <ScrollArea className="flex-1 px-4 sm:px-6">
          {versionHistory.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                No version history yet
              </p>
            </div>
          ) : (
            <div className="space-y-3 py-4">
              {versionHistory.map((version, index) => (
                <div
                  key={version.id}
                  className="border rounded-lg p-3 sm:p-4 transition-all hover:border-primary/50 bg-card"
                >
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    {/* Image Thumbnail */}
                    <div className="w-full sm:w-32 md:w-36 h-32 md:h-36 flex-shrink-0 mx-auto sm:mx-0">
                      <img
                        src={version.imageUrl}
                        alt={`Version ${versionHistory.length - index}`}
                        className="w-full h-full object-cover rounded-md border"
                      />
                    </div>

                    {/* Version Details */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
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
                            <span className="break-all">
                              {new Date(version.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>


                      {/* Actions */}
                      {index !== 0 && (
                        <div className="pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleRestoreVersion(version.id)}
                            className="text-xs w-full sm:w-auto"
                          >
                            <RotateCcw className="w-3 h-3 mr-1.5" />
                            Restore Version
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
