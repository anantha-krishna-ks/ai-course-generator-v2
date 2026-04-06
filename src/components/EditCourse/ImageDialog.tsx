import { useMemo } from "react";
import { Clock, Sparkles, History, ArrowLeft as BackIcon, Image as ImageIcon, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface ImageVersion {
  id: number;
  operation: string;
  imageUrl: string;
  editedBy: string;
  editedAt: Date;
  inputTokens: number;
  outputTokens: number;
}

interface ImageDialogProps {
  open: boolean;
  onClose: () => void;
  courseImage: string;
  onSave: () => void;
  onRegenerate: () => void;
  onUpload: () => void;
  isGenerating: boolean;
  showVersions: boolean;
  onShowVersionsChange: (show: boolean) => void;
  selectedVersion: number | null;
  imageVersionHistory: ImageVersion[];
  onViewVersion: (versionId: number) => void;
  onRestoreVersion: () => void;
}

export function ImageDialog({
  open,
  onClose,
  courseImage,
  onSave,
  onRegenerate,
  onUpload,
  isGenerating,
  showVersions,
  onShowVersionsChange,
  selectedVersion,
  imageVersionHistory,
  onViewVersion,
  onRestoreVersion,
}: ImageDialogProps) {
  const totalInputTokens = useMemo(() => 
    imageVersionHistory.reduce((sum, v) => sum + v.inputTokens, 0) + 17716,
    [imageVersionHistory]
  );
  
  const totalOutputTokens = useMemo(() => 
    imageVersionHistory.reduce((sum, v) => sum + v.outputTokens, 0) + 22728,
    [imageVersionHistory]
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[85vw] lg:max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6">
        <DialogHeader className="pr-6 sm:pr-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
              {showVersions && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onShowVersionsChange(false)}
                  className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                >
                  <BackIcon className="w-4 h-4" />
                </Button>
              )}
              <DialogTitle className="text-base sm:text-xl lg:text-2xl flex items-center gap-1 sm:gap-2 truncate">
                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600 flex-shrink-0" />
                <span className="truncate">{showVersions ? "Image History" : "Course Image"}</span>
              </DialogTitle>
            </div>
            {!showVersions && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onShowVersionsChange(true)}
                className="flex items-center gap-1 sm:gap-2 flex-shrink-0 h-8 px-2 sm:h-9 sm:px-3 border-purple-600/40 text-purple-600 hover:border-purple-600/60 hover:bg-purple-600/10 hover:text-purple-700"
              >
                <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">Versions</span>
              </Button>
            )}
          </div>
          <DialogDescription className="pt-1 text-xs sm:text-sm">
            {showVersions 
              ? "View and restore previous image versions"
              : "Upload an image or generate one with AI"}
          </DialogDescription>
        </DialogHeader>

        {/* Image Editor View */}
        {!showVersions && (
          <>
            <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
              {selectedVersion && (
                <div className="bg-purple-600/10 border border-purple-600/30 rounded-lg p-2.5 sm:p-3 md:p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                    <div className="flex items-start gap-2 text-xs sm:text-sm flex-1 min-w-0">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-purple-600 font-medium break-words">
                        Version: {imageVersionHistory.find(v => v.id === selectedVersion)?.editedAt.toLocaleString()}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onRestoreVersion}
                      className="w-full sm:w-auto text-xs h-7 sm:h-8 border-purple-600/40 bg-purple-600/10 hover:bg-purple-600/20 text-purple-600 hover:border-purple-600/60 hover:text-purple-700 whitespace-nowrap flex-shrink-0"
                    >
                      Continue Editing
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Current Image Preview */}
              <div className="border-2 border-dashed border-border rounded-lg p-3 sm:p-4 md:p-6 bg-muted/20 overflow-hidden">
                {courseImage ? (
                  <div className="space-y-3">
                    <img 
                      src={courseImage} 
                      alt="Course" 
                      className="w-full max-h-[250px] sm:max-h-[300px] md:max-h-[350px] lg:max-h-[400px] rounded-lg object-contain mx-auto"
                    />
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <ImageIcon className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground text-xs sm:text-sm">No image selected</p>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm order-last sm:order-first"
              >
                Cancel
              </Button>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={onUpload}
                  className="w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm border-purple-600/30 bg-purple-600/10 hover:bg-purple-600/20 text-purple-600 hover:border-purple-600/50"
                >
                  <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                  <span className="truncate">Upload Image</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={onRegenerate}
                  disabled={isGenerating}
                  className="w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm border-purple-600/30 bg-purple-600/10 hover:bg-purple-600/20 text-purple-600 hover:border-purple-600/50 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-1.5 sm:mr-2 flex-shrink-0" />
                      <span className="truncate">Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                      <span className="truncate">AI Regenerate</span>
                    </>
                  )}
                </Button>
              </div>
              <Button
                onClick={onSave}
                className="w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm bg-purple-600 hover:bg-purple-700 whitespace-nowrap"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Image Versions View */}
        {showVersions && (
          <div className="space-y-4 sm:space-y-6 py-3 sm:py-4">
            {/* Image Versions List */}
            
            <div className="space-y-3 sm:space-y-4">
                {imageVersionHistory.length > 0 ? (
                  imageVersionHistory.map((version, index) => (
                    <div
                      key={version.id}
                      className={`border rounded-lg p-3 sm:p-4 transition-all cursor-pointer hover:border-primary/50 ${
                        selectedVersion === version.id
                          ? 'border-purple-600 bg-purple-600/5'
                          : 'border-border bg-background'
                      }`}
                      onClick={() => onViewVersion(version.id)}
                    >
                      <div className="space-y-2 sm:space-y-3">
                        {/* Version Header */}
                        <div className="flex items-start justify-between gap-2 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h4 className="font-semibold text-sm sm:text-base">
                                Version {version.id}
                              </h4>
                              {index === 0 && (
                                <Badge variant="default" className="text-xs">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-start gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                              <span className="break-words">
                                {version.editedAt.toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                          {index !== 0 && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewVersion(version.id);
                                onRestoreVersion();
                              }}
                              className="flex-shrink-0 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap"
                            >
                              <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5" />
                              <span>Restore Version</span>
                            </Button>
                          )}
                        </div>

                        {/* Image Preview */}
                        <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border overflow-hidden">
                          <img
                            src={version.imageUrl}
                            alt={`Version ${version.id}`}
                            className="w-full max-h-[200px] object-contain rounded"
                          />
                        </div>

                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No version history available</p>
                  </div>
                )}
              </div>
            
            <DialogFooter className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
