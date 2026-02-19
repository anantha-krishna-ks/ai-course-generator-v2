import { useRef, useState } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SectionImageDialogProps {
  open: boolean;
  onClose: () => void;
  currentImage: string | null;
  onImageChange: (url: string) => void;
}

const ACCEPTED_FORMATS = ".jpeg,.jpg,.png,.bmp,.gif";

export function SectionImageDialog({
  open,
  onClose,
  currentImage,
  onImageChange,
}: SectionImageDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onImageChange(url);
    }
    e.target.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-card rounded-xl border border-border shadow-xl w-full max-w-md mx-4 p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Title */}
        <h3 className="text-xl font-semibold text-foreground mb-1">
          Change section image
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Choose a relevant image or simply upload one that matches the topic of the section
        </p>

        {/* Preview + Info */}
        <div className="flex gap-6 mb-6">
          {/* Preview area */}
          <div
            className={cn(
              "w-[140px] h-[140px] rounded-lg border border-dashed border-border bg-muted/30 flex items-center justify-center shrink-0 overflow-hidden"
            )}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Section preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm text-muted-foreground/50">No image yet</span>
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

        {/* Actions */}
        <div className="flex items-center gap-3">
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
        </div>
      </div>
    </div>
  );
}
