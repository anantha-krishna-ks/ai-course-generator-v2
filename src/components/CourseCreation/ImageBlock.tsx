import { useRef, useState, useCallback } from "react";
import { ImagePlus, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageBlockProps {
  imageUrl: string;
  onChange: (url: string) => void;
}

export function ImageBlock({ imageUrl, onChange }: ImageBlockProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      onChange(url);
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

  if (imageUrl) {
    return (
      <div className="relative group/img rounded-lg overflow-hidden">
        <img
          src={imageUrl}
          alt="Content"
          className="w-full h-auto rounded-lg"
        />
        <button
          onClick={handleClick}
          className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 text-sm font-medium text-foreground"
        >
          Click to replace
        </button>
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
