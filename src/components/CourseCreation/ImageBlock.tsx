import { useRef, useState, useCallback, useEffect } from "react";
import { ImagePlus, Upload, Minus, Plus, Image, RectangleHorizontal, Maximize, ChevronDown, GripHorizontal, FlipHorizontal, FlipVertical, RotateCw, SlidersHorizontal, Sparkles, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ImageBlockProps {
  imageUrl: string;
  onChange: (url: string) => void;
  altText?: string;
  onAltTextChange?: (alt: string) => void;
  aiEnabled?: boolean;
}

type FitMode = "contain" | "cover" | "fill";
type EditorMode = "none" | "simple" | "full";

export function ImageBlock({ imageUrl, onChange, altText = "", onAltTextChange, aiEnabled = false }: ImageBlockProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>("none");
  const [zoom, setZoom] = useState(100);
  const [fitMode, setFitMode] = useState<FitMode>("contain");
  const [containerHeight, setContainerHeight] = useState(300);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isResizing, setIsResizing] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [localAlt, setLocalAlt] = useState(altText);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => setLocalAlt(altText), [altText]);

  // Click-outside detection
  useEffect(() => {
    if (editorMode === "none" || isClosing) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        editorRef.current &&
        !editorRef.current.contains(e.target as Node) &&
        !(fileInputRef.current && fileInputRef.current.contains(e.target as Node))
      ) {
        closeEditor();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editorMode, isClosing]);

  const closeEditor = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setEditorMode("none");
      setIsClosing(false);
    }, 200);
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      onChange(url);
      setZoom(100);
      setEditorMode("simple");
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const fitModeLabels: Record<FitMode, string> = {
    contain: "Fit",
    cover: "Fill",
    fill: "Stretch",
  };

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    const startY = e.clientY;
    const startHeight = containerHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientY - startY;
      setContainerHeight(Math.max(100, Math.min(800, startHeight + delta)));
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [containerHeight]);

  const getImageStyle = (): React.CSSProperties => {
    const transforms = [
      `scale(${(flipH ? -1 : 1) * zoom / 100}, ${(flipV ? -1 : 1) * zoom / 100})`,
      `rotate(${rotation}deg)`,
    ].join(" ");
    return {
      transform: transforms,
      transition: isResizing ? "none" : "transform 0.2s ease",
      objectFit: fitMode as React.CSSProperties["objectFit"],
      width: "100%",
      height: "100%",
    };
  };

  const handleAltSave = (value: string) => {
    setLocalAlt(value);
    onAltTextChange?.(value);
  };

  if (imageUrl) {
    const isActive = editorMode !== "none" && !isClosing;

    return (
      <div ref={editorRef} className="relative rounded-lg">
        {/* Simple toolbar - shown on single click */}
        {editorMode === "simple" && (
          <div className={cn(
            "absolute -top-12 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-2 py-1.5 rounded-full border border-border bg-background/95 backdrop-blur-sm shadow-lg transition-all duration-200",
            isClosing ? "animate-fade-out opacity-0" : "animate-fade-in"
          )}>
            {/* Change image */}
            <button
              onClick={handleClick}
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Change image"
            >
              <Image className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-border" />

            {/* Open full editor */}
            <button
              onClick={() => setEditorMode("full")}
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Edit image"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-border" />

            {/* Alt text popover */}
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <Popover>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <button
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium transition-colors",
                          localAlt
                            ? "bg-primary/10 text-primary hover:bg-primary/20"
                            : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                        )}
                      >
                        {localAlt ? "Alt ✓" : "Alt"}
                      </button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  {localAlt && (
                    <TooltipContent side="bottom" align="center" className="max-w-[220px] p-3 space-y-1.5">
                      <p className="text-xs font-medium text-popover-foreground leading-snug break-words">"{localAlt}"</p>
                      <p className="text-[10px] text-muted-foreground italic">Note: only the author sees this label</p>
                    </TooltipContent>
                  )}
                  <PopoverContent className="w-72 p-4" side="right" align="start" sideOffset={8}>
                    <p className="text-sm text-muted-foreground leading-snug mb-4">
                      Add screen-readable descriptions to content images to help improve accessibility.
                    </p>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground block">
                        Alternative text
                      </label>
                      <Input
                        value={localAlt}
                        onChange={(e) => setLocalAlt(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleAltSave(localAlt); }}
                        placeholder="Describe this image…"
                        className="h-10 text-sm"
                      />
                    </div>
                    <button
                      onClick={() => handleAltSave(localAlt)}
                      className="mt-4 px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Done
                    </button>
                  </PopoverContent>
                </Popover>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* Full toolbar */}
        {editorMode === "full" && (
          <div className={cn(
            "flex items-center gap-2 p-2 mb-2 rounded-lg border border-border bg-background/95 backdrop-blur-sm shadow-sm transition-all duration-200",
            isClosing ? "animate-fade-out opacity-0" : "animate-fade-in"
          )}>
            {/* Zoom controls */}
            <button
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <Slider
              value={[zoom]}
              onValueChange={([v]) => setZoom(v)}
              min={50}
              max={200}
              step={5}
              className="w-24"
            />
            <button
              onClick={() => setZoom(Math.min(200, zoom + 10))}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-5 bg-border mx-1" />

            {/* Replace image */}
            <button
              onClick={handleClick}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Replace image"
            >
              <Image className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-border mx-1" />

            {/* Fit mode dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-2 py-1 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  {fitMode === "contain" && <Maximize className="w-3.5 h-3.5" />}
                  {fitMode === "cover" && <RectangleHorizontal className="w-3.5 h-3.5" />}
                  {fitMode === "fill" && <RectangleHorizontal className="w-3.5 h-3.5" />}
                  <span className="text-xs">{fitModeLabels[fitMode]}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-background border min-w-[100px]">
                <DropdownMenuItem onClick={() => setFitMode("contain")} className={cn(fitMode === "contain" && "bg-primary/10")}>
                  <Maximize className="w-3.5 h-3.5 mr-2" /> Fit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFitMode("cover")} className={cn(fitMode === "cover" && "bg-primary/10")}>
                  <RectangleHorizontal className="w-3.5 h-3.5 mr-2" /> Fill
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFitMode("fill")} className={cn(fitMode === "fill" && "bg-primary/10")}>
                  <RectangleHorizontal className="w-3.5 h-3.5 mr-2" /> Stretch
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-px h-5 bg-border mx-1" />

            {/* Flip & Rotate */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setFlipH(!flipH)}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  flipH ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                title="Flip horizontal"
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setFlipV(!flipV)}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  flipV ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                title="Flip vertical"
              >
                <FlipVertical className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setRotation((rotation + 90) % 360)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Rotate 90°"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Spacer + Done */}
            <div className="flex-1" />
            <button
              onClick={closeEditor}
              className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Done
            </button>
          </div>
        )}

        {/* Image display */}
        <div
          ref={containerRef}
          className={cn(
            "rounded-lg overflow-hidden cursor-pointer flex items-center justify-center bg-muted/20 transition-shadow duration-200 relative",
            isActive && "ring-2 ring-primary ring-offset-2 ring-offset-background",
            isResizing && "select-none"
          )}
          style={{ height: `${containerHeight}px`, transition: isResizing ? "none" : "height 0.15s ease" }}
          onClick={() => {
            if (editorMode === "none") setEditorMode("simple");
          }}
          onDoubleClick={() => {
            setEditorMode("full");
          }}
        >
          <img
            src={imageUrl}
            alt={localAlt || "Content"}
            style={getImageStyle()}
            className="pointer-events-none"
          />

          {/* Alt text badge on image when not editing */}
          {editorMode === "none" && localAlt && (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/90 backdrop-blur-sm border border-border text-[11px] font-medium text-muted-foreground shadow-sm pointer-events-auto">
                    Alt ✓
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" align="start" className="max-w-[220px] p-3 space-y-1.5">
                  <p className="text-xs font-medium text-popover-foreground leading-snug break-words">"{localAlt}"</p>
                  <p className="text-[10px] text-muted-foreground italic">Note: only the author sees this label</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Resize handle - full mode only */}
        {editorMode === "full" && (
          <div
            onMouseDown={handleResizeStart}
            className={cn(
              "flex items-center justify-center mx-auto mt-2 w-24 h-7 cursor-ns-resize group/resize transition-all duration-200",
              isClosing ? "animate-fade-out opacity-0" : "animate-fade-in"
            )}
          >
            <div className={cn(
              "flex items-center justify-center w-16 h-5 rounded-full border transition-all duration-200 shadow-sm",
              isResizing
                ? "bg-primary/20 border-primary/40 shadow-primary/10"
                : "bg-background border-border hover:border-primary/50 hover:bg-primary/10 hover:shadow-md"
            )}>
              <GripHorizontal className={cn(
                "w-5 h-4 transition-colors",
                isResizing ? "text-primary" : "text-muted-foreground group-hover/resize:text-primary"
              )} />
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
        />
      </div>
    );
  }

  const handleGenerateSubmit = () => {
    if (!imagePrompt.trim()) return;
    // TODO: Wire up AI image generation API
    console.log("Generate image with prompt:", imagePrompt);
    setImagePrompt("");
    setShowGenerateDialog(false);
  };

  return (
    <>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={cn(
          "group/upload flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed py-12 px-6 cursor-pointer transition-all duration-200",
          isDragOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-foreground/20 hover:border-primary/50 hover:bg-primary/5 bg-background/80"
        )}
      >
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
            isDragOver ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground group-hover/upload:bg-primary/10 group-hover/upload:text-primary"
          )}
        >
          {isDragOver ? (
            <Upload className="w-5 h-5" />
          ) : (
            <ImagePlus className="w-5 h-5" />
          )}
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground/70">
            Click to upload or drag &amp; drop
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Recommended size: from 240×280px
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Allowed formats: JPEG, JPG, PNG, BMP, GIF
          </p>
        </div>
        {aiEnabled && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowGenerateDialog(true);
            }}
            className="gap-1.5 text-xs h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 mt-1 transition-all duration-200"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generate with AI
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
        />
      </div>

      {/* Generate Image Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="sm:max-w-[520px] gap-0 p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="flex items-center gap-2.5 text-base font-semibold">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              Generate image
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1.5">
              Describe the image you'd like to generate for this block.
            </p>
          </DialogHeader>

          <div className="px-6 pb-2">
            <div className="rounded-xl border border-border/60 bg-muted/10 overflow-hidden focus-within:border-foreground/20 transition-colors">
              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerateSubmit();
                  }
                }}
                placeholder="e.g., A professional illustration showing cybersecurity concepts with a shield and lock icons..."
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 resize-none p-4 focus:outline-none min-h-[120px]"
                rows={4}
                autoFocus
              />
            </div>
            <p className="text-[11px] text-muted-foreground/50 mt-2 px-1">
              Press Enter to generate · Shift+Enter for new line
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/60 bg-muted/20">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowGenerateDialog(false);
                setImagePrompt("");
              }}
              className="rounded-full px-4"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleGenerateSubmit}
              disabled={!imagePrompt.trim()}
              className="rounded-full px-4 gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Generate
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
