import { useRef, useState, useCallback, useEffect } from "react";
import { ImagePlus, Upload, Minus, Plus, Image, RectangleHorizontal, Maximize, ChevronDown, GripHorizontal, FlipHorizontal, FlipVertical, RotateCw, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
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
}

type FitMode = "contain" | "cover" | "fill";
type EditorMode = "none" | "simple" | "full";

export function ImageBlock({ imageUrl, onChange, altText = "", onAltTextChange }: ImageBlockProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>("none");
  const [zoom, setZoom] = useState(100);
  const [fitMode, setFitMode] = useState<FitMode>("contain");
  const [containerHeight, setContainerHeight] = useState(300);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isResizing, setIsResizing] = useState(false);
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
            <Popover>
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

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed py-12 px-6 cursor-pointer transition-all duration-200",
        isDragOver
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-foreground/20 hover:border-primary/50 bg-background/80 hover:bg-background"
      )}
    >
      <div
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
          isDragOver ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
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
          PNG, JPG, GIF up to 10MB
        </p>
      </div>
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
