import { Clock, Sparkles, History, User, ArrowLeft as BackIcon, ChevronDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

interface Version {
  id: number;
  content: string;
  editedBy: string;
  editedAt: Date;
  inclusions?: string;
  exclusions?: string;
}

interface IntroductionDialogProps {
  open: boolean;
  onClose: () => void;
  editorContent: string;
  onEditorContentChange: (content: string) => void;
  onSave: () => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
  showVersions: boolean;
  onShowVersionsChange: (show: boolean) => void;
  selectedVersion: number | null;
  versionHistory: Version[];
  onViewVersion: (versionId: number) => void;
  onRestoreVersion: () => void;
}

export function IntroductionDialog({
  open,
  onClose,
  editorContent,
  onEditorContentChange,
  onSave,
  onRegenerate,
  isRegenerating,
  showVersions,
  onShowVersionsChange,
  selectedVersion,
  versionHistory,
  onViewVersion,
  onRestoreVersion,
}: IntroductionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[85vw] lg:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
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
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary flex-shrink-0" />
                <span className="truncate">{showVersions ? "Version History" : "AI Assistant"}</span>
              </DialogTitle>
            </div>
            {!showVersions && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onShowVersionsChange(true)}
                className="flex items-center gap-1 sm:gap-2 flex-shrink-0 h-8 px-2 sm:h-9 sm:px-3"
              >
                <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">Versions</span>
              </Button>
            )}
          </div>
          <DialogDescription className="pt-1 text-xs sm:text-sm">
            {showVersions 
              ? "View and restore previous versions"
              : "Edit your course introduction or use AI to regenerate"}
          </DialogDescription>
        </DialogHeader>

        {/* Editor View */}
        {!showVersions && (
          <>
            <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
              {selectedVersion && (
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-2 sm:p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                    <span className="text-primary font-medium">
                      Version: {versionHistory.find(v => v.id === selectedVersion)?.editedAt.toLocaleString()}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRestoreVersion}
                    className="text-xs h-7 sm:h-8"
                  >
                    Continue Editing
                  </Button>
                </div>
              )}
              <RichTextEditor
                content={editorContent}
                onChange={onEditorContentChange}
              />
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto h-9 text-sm"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={onRegenerate}
                disabled={isRegenerating}
                className="w-full sm:w-auto h-9 text-sm border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary hover:border-primary/50"
              >
                {isRegenerating ? (
                  <>
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                    <span>Regenerating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span>AI Regenerate</span>
                  </>
                )}
              </Button>
              <Button
                onClick={onSave}
                className="w-full sm:w-auto h-9 text-sm"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Versions View */}
        {showVersions && (
          <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
            {versionHistory.map((version, index) => {
              const [isInclusionsOpen, setIsInclusionsOpen] = useState(false);
              const [isExclusionsOpen, setIsExclusionsOpen] = useState(false);
              const isCurrentVersion = index === 0;
              
              return (
                <Card
                  key={version.id}
                  className={`p-3 sm:p-4 cursor-pointer transition-all hover:border-primary/50 ${
                    selectedVersion === version.id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => onViewVersion(version.id)}
                >
                  <div className="space-y-2 sm:space-y-3">
                    {/* Version Header */}
                    <div className="flex items-start justify-between gap-2 sm:gap-4">
                      <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        </div>
                          <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm sm:text-base text-foreground truncate">Version {version.id}</span>
                              {isCurrentVersion && (
                                <Badge variant="default" className="text-xs">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs sm:text-sm text-muted-foreground">by {version.editedBy}</span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 mt-1 text-xs sm:text-sm text-muted-foreground">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">{version.editedAt.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })} at {version.editedAt.toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}</span>
                          </div>
                        </div>
                      </div>
                      {!isCurrentVersion && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewVersion(version.id);
                            onRestoreVersion();
                          }}
                          className="flex-shrink-0 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3"
                        >
                          <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5" />
                          <span>Restore Version</span>
                        </Button>
                      )}
                    </div>
                    
                    {/* Version Content - Prominent Display */}
                    <div className="pl-0 sm:pl-2">
                      <div className="bg-background rounded-lg p-3 sm:p-4 border-2 border-primary/20">
                        <p className="text-xs sm:text-sm font-semibold mb-2 text-primary">Content:</p>
                        <div 
                          className="prose prose-sm sm:prose-base dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: version.content }}
                        />
                      </div>

                      {/* Inclusions - On Demand */}
                      {version.inclusions && (
                        <Collapsible 
                          open={isInclusionsOpen} 
                          onOpenChange={setIsInclusionsOpen}
                          className="mt-3"
                        >
                          <CollapsibleTrigger 
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform ${isInclusionsOpen ? 'rotate-180' : ''}`} />
                            View Inclusions
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2">
                            <div className="bg-muted/50 rounded-lg p-3 border text-xs sm:text-sm">
                              {version.inclusions}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      )}

                      {/* Exclusions - On Demand */}
                      {version.exclusions && (
                        <Collapsible 
                          open={isExclusionsOpen} 
                          onOpenChange={setIsExclusionsOpen}
                          className="mt-2"
                        >
                          <CollapsibleTrigger 
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform ${isExclusionsOpen ? 'rotate-180' : ''}`} />
                            View Exclusions
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2">
                            <div className="bg-muted/50 rounded-lg p-3 border text-xs sm:text-sm">
                              {version.exclusions}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
