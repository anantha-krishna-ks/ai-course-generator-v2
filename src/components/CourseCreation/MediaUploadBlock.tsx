import { useRef, useState, useCallback } from "react";
import { Upload, Video, Mic, FileText, X, File } from "lucide-react";
import { cn } from "@/lib/utils";

type MediaType = "video" | "audio" | "doc";

interface MediaUploadBlockProps {
  type: MediaType;
  fileUrl: string;
  onChange: (url: string) => void;
}

const mediaConfig: Record<MediaType, {
  icon: typeof Video;
  label: string;
  accept: string;
  maxSize: string;
  formats: string;
}> = {
  video: {
    icon: Video,
    label: "Video",
    accept: "video/mp4,video/webm,video/quicktime",
    maxSize: "2 GB",
    formats: "MP4, WebM, MOV",
  },
  audio: {
    icon: Mic,
    label: "Audio",
    accept: "audio/mpeg,audio/wav,audio/mp3,audio/ogg",
    maxSize: "2 GB",
    formats: "MP3, WAV, OGG",
  },
  doc: {
    icon: FileText,
    label: "Document",
    accept: ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx",
    maxSize: "100 MB",
    formats: "PDF, DOCX, PPTX, XLSX",
  },
};

export function MediaUploadBlock({ type, fileUrl, onChange }: MediaUploadBlockProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const config = mediaConfig[type];
  const Icon = config.icon;

  const handleFile = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file);
      setFileName(file.name);
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

  const handleRemove = () => {
    setFileName(null);
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (fileUrl) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {fileName || `${config.label} file`}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {config.label} uploaded successfully
            </p>
          </div>
          <button
            onClick={handleRemove}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
            title="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview for video/audio */}
        {type === "video" && (
          <video
            src={fileUrl}
            controls
            className="mt-3 w-full rounded-lg bg-black/5 max-h-[300px]"
          />
        )}
        {type === "audio" && (
          <audio src={fileUrl} controls className="mt-3 w-full" />
        )}
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onClick={() => fileInputRef.current?.click()}
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
          <Icon className="w-5 h-5" />
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground/70">
          Click to upload or drag & drop
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {config.formats} up to {config.maxSize}
        </p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={config.accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
