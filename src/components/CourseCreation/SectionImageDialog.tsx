import { useRef, useState, useCallback, useEffect } from "react";
import { X, Minus, Plus, Image, Maximize, RectangleHorizontal, ChevronDown, FlipHorizontal, FlipVertical, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface SectionImageDialogProps {
  open: boolean;
  onClose: () => void;
  currentImage: string | null;
  onImageChange: (url: string) => void;
}

const ACCEPTED_FORMATS = ".jpeg,.jpg,.png,.bmp,.gif";

type FitMode = "cover" | "contain" | "fill";

const FIT_OPTIONS: { label: string; value: FitMode }[] = [
  { label: "Cover", value: "cover" },
  { label: "Contain", value: "contain" },
  { label: "Fill", value: "fill" },
];

export function SectionImageDialog({
  open,
  onClose,
  currentImage,
  onImageChange,
}: SectionImageDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage);
  const [zoom, setZoom] = useState(100);
  const [fitMode, setFitMode] = useState<FitMode>("cover");
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [rotation, setRotation] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sync currentImage when dialog opens
  useEffect(() => {
    if (open) {
      setPreviewUrl(currentImage);
      setZoom(100);
      setFitMode("cover");
      setFlipH(false);
      setFlipV(false);
      setRotation(0);
    }
  }, [open, currentImage]);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setZoom(100);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
    }
    e.target.value = "";
  };

  const handleDone = () => {
    if (previewUrl) {
      // If transforms are applied, render to canvas and export
      if (zoom !== 100 || rotation !== 0 || flipH || flipV) {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const size = Math.max(img.width, img.height);
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.scale(
            (flipH ? -1 : 1) * (zoom / 100),
            (flipV ? -1 : 1) * (zoom / 100)
          );
          ctx.drawImage(img, -img.width / 2, -img.height / 2);
          ctx.restore();
          const dataUrl = canvas.toDataURL("image/png");
          onImageChange(dataUrl);
        };
        img.src = previewUrl;
      } else {
        onImageChange(previewUrl);
      }
    }
  };

  const imageTransformStyle: React.CSSProperties = {
    transform: `scale(${(zoom / 100) * (flipH ? -1 : 1)}, ${(zoom / 100) * (flipV ? -1 : 1)}) rotate(${rotation}deg)`,
    transition: "transform 0.2s ease",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <canvas ref={canvasRef} className="hidden" />

      <div className="relative bg-card rounded-xl border border-border shadow-xl w-full max-w-xl mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-muted transition-colors z-10"
        >
          <X className="w-5 h-5 text-muted-foreground" aria-hidden="true" focusable="false" />
        </button>

        {/* Title area */}
        <div className="p-6 pb-0">
          <h3 className="text-xl font-semibold text-foreground mb-1">
            Change section image
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Choose a relevant image or simply upload one that matches the topic of the section
          </p>
        </div>

        {/* Toolbar - shown when image is uploaded */}
        {previewUrl && (
          <div className="flex items-center gap-2 px-6 py-3 border-b border-border">
            {/* Zoom controls */}
            <button
              onClick={() => setZoom((z) => Math.max(10, z - 10))}
              aria-label="Zoom out"
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Minus className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
            </button>
            <Slider
              value={[zoom]}
              onValueChange={([v]) => setZoom(v)}
              min={10}
              max={200}
              step={5}
              className="w-32"
            />
            <button
              onClick={() => setZoom((z) => Math.min(200, z + 10))}
              aria-label="Zoom in"
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
            </button>

            <div className="w-px h-5 bg-border mx-1" />

            {/* Replace image */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Replace image"
            >
              <Image className="w-4 h-4" aria-hidden="true" focusable="false" />
            </button>

            <div className="w-px h-5 bg-border mx-1" />

            {/* Fit mode dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-2 py-1 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="Image fit mode">
                  {fitMode === "contain" && <Maximize className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />}
                  {fitMode === "cover" && <RectangleHorizontal className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />}
                  {fitMode === "fill" && <RectangleHorizontal className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />}
                  <ChevronDown className="w-3 h-3" aria-hidden="true" focusable="false" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="bg-background border border-border min-w-[100px]">
                <DropdownMenuItem onClick={() => setFitMode("contain")} className={cn("cursor-pointer", fitMode === "contain" && "bg-primary/10")}>
                  <Maximize className="w-3.5 h-3.5 mr-2" /> Fit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFitMode("cover")} className={cn("cursor-pointer", fitMode === "cover" && "bg-primary/10")}>
                  <RectangleHorizontal className="w-3.5 h-3.5 mr-2" /> Fill
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFitMode("fill")} className={cn("cursor-pointer", fitMode === "fill" && "bg-primary/10")}>
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
                aria-label="Flip horizontal"
              >
                <FlipHorizontal className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
              </button>
              <button
                onClick={() => setFlipV(!flipV)}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  flipV ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                aria-label="Flip vertical"
              >
                <FlipVertical className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
              </button>
              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Rotate 90 degrees"
              >
                <RotateCw className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
              </button>
            </div>

            <div className="flex-1" />

            {/* Done button */}
            <button
              onClick={handleDone}
              className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Done
            </button>
          </div>
        )}

        {/* Preview + Info */}
        <div className="flex gap-6 p-6">
          {/* Preview area */}
          <div className="w-[180px] h-[200px] rounded-lg border border-dashed border-border bg-muted/30 flex items-center justify-center shrink-0 overflow-hidden">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Section preview"
                className={cn("w-full h-full")}
                style={{
                  objectFit: fitMode,
                  ...imageTransformStyle,
                }}
              />
            ) : (
              <span className="text-sm text-muted-foreground">No image yet</span>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Recommended size:</p>
              <p className="text-sm text-muted-foreground">from 240x280px</p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Allowed formats:</p>
              <p className="text-sm text-muted-foreground">jpeg, jpg, png, bmp, gif</p>
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="flex items-center gap-3 px-6 pb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_FORMATS}
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {previewUrl ? "Change image" : "Upload image"}
          </Button>
          {previewUrl && (
            <Button
              variant="outline"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="gap-1.5 border-border"
            >
              <RotateCw className="w-4 h-4" aria-hidden="true" focusable="false" />
              Rotate 90°
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
