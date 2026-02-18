import { useRef, useState, useCallback } from "react";
import { ImagePlus, Upload, Minus, Plus, Image, RectangleHorizontal, Maximize, ChevronDown, GripHorizontal, Square, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ImageBlockProps {
  imageUrl: string;
  onChange: (url: string) => void;
}

type FitMode = "contain" | "cover" | "fill";
type RadiusMode = "none" | "rounded" | "pill";

export function ImageBlock({ imageUrl, onChange }: ImageBlockProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [fitMode, setFitMode] = useState<FitMode>("contain");
  const [containerHeight, setContainerHeight] = useState(300);
  const [borderRadius, setBorderRadius] = useState<RadiusMode>("rounded");
  const [isResizing, setIsResizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      onChange(url);
      setZoom(100);
      setIsEditing(true);
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
    const base: React.CSSProperties = {
      transform: `scale(${zoom / 100})`,
      transition: isResizing ? "none" : "transform 0.15s ease",
    };
    return { ...base, objectFit: fitMode as React.CSSProperties["objectFit"], width: "100%", height: "100%" };
  };

  if (imageUrl) {
    return (
      <div className="relative rounded-lg">
        {/* Editing toolbar */}
        {isEditing && (
          <div className="flex items-center gap-2 p-2 mb-2 rounded-lg border border-border bg-background/95 backdrop-blur-sm shadow-sm animate-fade-in">
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

            {/* Border radius toggle */}
            <div className="flex items-center gap-0.5 p-0.5 rounded-md bg-muted/50">
              <button
                onClick={() => setBorderRadius("none")}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  borderRadius === "none"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Sharp corners"
              >
                <Square className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setBorderRadius("rounded")}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  borderRadius === "rounded"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Rounded corners"
              >
                <div className="w-3.5 h-3.5 border-2 border-current rounded-md" />
              </button>
              <button
                onClick={() => setBorderRadius("pill")}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  borderRadius === "pill"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Full round"
              >
                <Circle className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Spacer + Done */}
            <div className="flex-1" />
            <button
              onClick={() => setIsEditing(false)}
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
            "overflow-hidden cursor-pointer flex items-center justify-center bg-muted/20 transition-[border-radius] duration-200",
            borderRadius === "none" && "rounded-none",
            borderRadius === "rounded" && "rounded-xl",
            borderRadius === "pill" && "rounded-[2rem]",
            isEditing && "ring-2 ring-primary ring-offset-2 ring-offset-background",
            isResizing && "select-none"
          )}
          style={{ height: `${containerHeight}px`, transition: isResizing ? "border-radius 0.2s ease" : "height 0.15s ease, border-radius 0.2s ease" }}
          onClick={() => {
            if (!isEditing) setIsEditing(true);
          }}
        >
          <img
            src={imageUrl}
            alt="Content"
            style={getImageStyle()}
            className="pointer-events-none"
          />
        </div>

        {/* Resize handle */}
        {isEditing && (
          <div
            onMouseDown={handleResizeStart}
            className="flex items-center justify-center mx-auto mt-2 w-24 h-7 cursor-ns-resize group/resize"
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
