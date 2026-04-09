import { useRef, useState, useCallback } from "react";
import { Upload, Video, Mic, FileText, X, RefreshCw, Trash2, Download, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

type MediaType = "video" | "audio" | "doc";

interface MediaUploadBlockProps {
  type: MediaType;
  fileUrl: string;
  onChange: (url: string) => void;
  description?: string;
  onDescriptionChange?: (desc: string) => void;
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

export function MediaUploadBlock({ type, fileUrl, onChange, description = "", onDescriptionChange }: MediaUploadBlockProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [localDescription, setLocalDescription] = useState(description);
  const [fileType, setFileType] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const changeFileInputRef = useRef<HTMLInputElement>(null);
  const config = mediaConfig[type];
  const Icon = config.icon;

  const handleFile = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file);
      setFileName(file.name);
      setFileType(file.type);
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

  const handleDescriptionChange = (val: string) => {
    setLocalDescription(val);
    onDescriptionChange?.(val);
  };

  if (fileUrl) {
    // Document type - rich preview matching the course preview viewer
    if (type === "doc") {
      return (
        <div className="rounded-xl border border-border/60 bg-background overflow-hidden shadow-sm animate-fade-in">
          {/* Header bar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40 bg-muted/30">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 border border-border/40">
              <FileText className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {fileName || "Document file"}
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => changeFileInputRef.current?.click()}
                className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                aria-label="Change document"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                onClick={handleRemove}
                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                aria-label="Delete document"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <input
              ref={changeFileInputRef}
              type="file"
              accept={config.accept}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>

          {/* Embedded document viewer or static preview */}
          <div className="relative bg-muted/10">
            {fileType === "application/pdf" ? (
              <iframe
                src={fileUrl}
                className="w-full border-0"
                style={{ height: '500px' }}
                title="Document viewer"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6 gap-4">
                <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center border border-border/40">
                  <FileText className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-foreground">{fileName || "Document file"}</p>
                  <p className="text-xs text-muted-foreground">
                    Preview not available for this file type. Use the open button to view.
                  </p>
                </div>
                <button
                  onClick={() => window.open(fileUrl, '_blank')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  Open File
                </button>
              </div>
            )}
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-border/30 bg-muted/20">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-xs font-medium text-muted-foreground">
                {fileName || "Document"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">100%</span>
              <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
            </div>
          </div>
        </div>
      );
    }

    // Video & Audio - existing layout
    return (
      <div className="rounded-lg border border-border bg-card p-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {fileName || `${config.label} file`}
            </p>
            <p className="text-xs text-muted-foreground">
              {config.label} uploaded successfully
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => changeFileInputRef.current?.click()}
              className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              aria-label={`Change ${config.label.toLowerCase()}`}
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              onClick={handleRemove}
              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              aria-label={`Delete ${config.label.toLowerCase()}`}
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
          <input
            ref={changeFileInputRef}
            type="file"
            accept={config.accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
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
          <>
            <audio src={fileUrl} controls className="mt-3 w-full" />
            <textarea
              value={localDescription}
              onChange={(e) => {
                handleDescriptionChange(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              placeholder="Add a description for this audio (optional)"
              className="mt-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none overflow-hidden min-h-[36px]"
              rows={1}
            />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "group/upload flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-8 px-6 cursor-pointer transition-all duration-200",
          isDragOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-foreground/20 hover:border-primary/50 hover:bg-primary/5 bg-background/80"
        )}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
            isDragOver ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground group-hover/upload:bg-primary/10 group-hover/upload:text-primary"
          )}
        >
          {isDragOver ? (
            <Upload className="w-4 h-4" />
          ) : (
            <Icon className="w-4 h-4" />
          )}
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground/70">
            Click to upload or drag & drop
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
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
      {type === "audio" && (
        <textarea
          value={localDescription}
          onChange={(e) => {
            handleDescriptionChange(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
          placeholder="Add a description for this audio (optional)"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none overflow-hidden min-h-[36px]"
          rows={1}
        />
      )}
    </div>
  );
}
