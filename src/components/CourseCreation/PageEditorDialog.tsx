import { useState } from "react";
import { X, FileText, LayoutGrid, Plus, Sparkles, Type, ImageIcon, Video, FileText as DocIcon, Layers, MoreHorizontal, MessageSquare, Mic, Play, ChevronLeft, ChevronRight, ChevronUp, MoreHorizontal as Dots } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageEditorDialogProps {
  open: boolean;
  onClose: () => void;
  pageTitle: string;
  onPageTitleChange: (title: string) => void;
}

export function PageEditorDialog({ open, onClose, pageTitle, onPageTitleChange }: PageEditorDialogProps) {
  const [activeTab, setActiveTab] = useState<"outline" | "blocks">("outline");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[98vw] w-[1600px] h-[95vh] p-0 gap-0 overflow-hidden flex flex-col [&>button]:hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Page editor</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-md hover:bg-muted transition-colors">
              <Sparkles className="w-4 h-4 text-primary" />
            </button>
            <button className="p-2 rounded-md hover:bg-muted transition-colors">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="p-2 rounded-md hover:bg-muted transition-colors">
              <Mic className="w-4 h-4 text-muted-foreground" />
            </button>
            <Button variant="outline" size="icon" className="rounded-full border-border h-8 w-8 ml-1">
              <Play className="w-3.5 h-3.5" />
            </Button>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-muted transition-colors ml-1"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">
          {/* Left Sidebar */}
          <div
            className={cn(
              "border-r border-border bg-muted/20 flex flex-col shrink-0 transition-all duration-300 relative",
              sidebarCollapsed ? "w-0 overflow-hidden border-r-0" : "w-[380px]"
            )}
          >
            {/* Collapse button on divider */}
            {!sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="absolute -right-3 top-4 z-10 w-6 h-6 rounded-full border border-border bg-background shadow-sm flex items-center justify-center hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}

            {/* Tabs */}
            <div className="flex items-center gap-0 px-4 pt-3 border-b border-border whitespace-nowrap">
              <button
                onClick={() => setActiveTab("outline")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors",
                  activeTab === "outline"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Course outline
              </button>
              <button
                onClick={() => setActiveTab("blocks")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors",
                  activeTab === "blocks"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Layers className="w-3.5 h-3.5" />
                Content blocks
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === "outline" ? (
                <div className="space-y-4">
                  {/* Navigate to */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Navigate to:</span>
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 border-border">
                      <Plus className="w-3 h-3" />
                      Add
                    </Button>
                  </div>

                  {/* Current page - highlighted */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary/5 border-l-2 border-primary">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm text-foreground truncate">
                      {pageTitle || "Untitled page"}
                    </span>
                  </div>

                  {/* Section placeholder */}
                  <div className="rounded-lg border border-border bg-card p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Section 1</span>
                      <div className="flex items-center gap-1">
                        <button className="p-1 rounded-md hover:bg-muted transition-colors">
                          <Dots className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button className="p-1 rounded-md hover:bg-muted transition-colors">
                          <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-foreground block">Untitled section</span>
                    <div className="flex items-center gap-2 px-2 py-1.5">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Untitled page</span>
                    </div>
                    <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <Plus className="w-3 h-3" />
                      Add page
                    </button>
                    <div className="border-t border-dashed border-border" />
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-8">
                  Content blocks will appear here
                </div>
              )}
            </div>
          </div>

          {/* Collapsed sidebar toggle */}
          {sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="shrink-0 px-2 py-4 border-r border-border hover:bg-muted/50 transition-colors flex items-start pt-6"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          )}

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            <div className="max-w-[800px] mx-auto py-10 px-8">
              {/* Page title label */}
              <span className="text-sm text-muted-foreground block mb-2">Page title</span>

              {/* Editable title */}
              <input
                type="text"
                value={pageTitle}
                onChange={(e) => {
                  if (e.target.value.length <= 350) {
                    onPageTitleChange(e.target.value);
                  }
                }}
                className="text-3xl font-bold text-foreground bg-transparent border-none outline-none w-full placeholder:text-muted-foreground/40"
                placeholder="Untitled page"
              />

              {/* Dotted separator */}
              <div className="border-t border-dashed border-border my-6" />


              {/* Content type toolbar */}
              <div className="rounded-full border border-border bg-muted/30 px-2 py-1.5 flex items-center gap-1 w-fit">
                <Button
                  variant="outline"
                  className="gap-2 border-primary/30 text-primary hover:bg-primary/5 text-sm h-8 rounded-full"
                >
                  <Sparkles className="w-4 h-4" />
                  Create with AI
                </Button>
                <Button variant="ghost" className="gap-2 text-muted-foreground text-sm h-8 rounded-full hover:text-foreground">
                  <Type className="w-4 h-4" />
                  Text
                </Button>
                <Button variant="ghost" className="gap-2 text-muted-foreground text-sm h-8 rounded-full hover:text-foreground">
                  <ImageIcon className="w-4 h-4" />
                  Image
                </Button>
              </div>

              {/* Empty content area */}
              <div className="min-h-[300px]" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
