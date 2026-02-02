import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type LayoutType = "multi-page" | "single-page";

export function CreateCourseDialog({ open, onOpenChange }: CreateCourseDialogProps) {
  const navigate = useNavigate();
  const [courseTitle, setCourseTitle] = useState("");
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>("multi-page");

  const handleStartCreating = () => {
    if (!courseTitle.trim()) return;
    
    // Navigate to create course with the selected options
    navigate("/create-course", { 
      state: { 
        title: courseTitle.trim(), 
        layout: selectedLayout 
      } 
    });
    onOpenChange(false);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset form when closing
      setCourseTitle("");
      setSelectedLayout("multi-page");
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] p-10">
        <DialogHeader className="text-center space-y-2 pb-2">
          <DialogTitle className="text-2xl font-bold text-foreground">
            Create your course from scratch
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Description Text */}
          <p className="text-muted-foreground/80 text-base text-center max-w-lg mx-auto leading-relaxed">
            Enter a title and pick a layout that best suits your course requirements. You can switch layouts later if you change your mind
          </p>

          {/* Course Title Input */}
          <div>
            <Input
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              placeholder="Enter course title..."
              className="h-14 text-[1rem] bg-background border-2 border-border focus:border-primary placeholder:text-foreground/50"
            />
          </div>

          {/* Layout Options */}
          <div className="grid grid-cols-2 gap-4">
            {/* Multi-page Layout Option */}
            <button
              type="button"
              onClick={() => setSelectedLayout("multi-page")}
              className={cn(
                "relative p-4 rounded-lg border-2 transition-all text-left",
                selectedLayout === "multi-page"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              {/* Radio indicator */}
              <div className="absolute top-3 left-3">
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    selectedLayout === "multi-page"
                      ? "border-primary"
                      : "border-muted-foreground/40"
                  )}
                >
                  {selectedLayout === "multi-page" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  )}
                </div>
              </div>

              {/* Layout Preview Illustration */}
              <div className="mt-6 mb-4 flex justify-center">
                <div className="w-32 h-20 bg-muted rounded border border-border p-2 flex gap-2">
                  <div className="flex-1 space-y-1">
                    <div className="text-[8px] text-muted-foreground font-medium">logo</div>
                    <div className="text-[9px] font-semibold text-foreground">Course Title</div>
                    <div className="space-y-1 mt-2">
                      <div className="h-1 bg-muted-foreground/20 rounded w-full" />
                      <div className="h-1 bg-muted-foreground/20 rounded w-4/5" />
                      <div className="h-1 bg-muted-foreground/20 rounded w-full" />
                    </div>
                  </div>
                  <div className="w-12 space-y-1">
                    <div className="h-2 bg-muted-foreground/20 rounded" />
                    <div className="h-2 bg-muted-foreground/20 rounded" />
                    <div className="h-2 bg-muted-foreground/20 rounded" />
                    <div className="h-2 bg-muted-foreground/20 rounded" />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h3 className="font-semibold text-foreground mb-1">Multi-page layout</h3>
                <p className="text-sm text-muted-foreground">
                  A full-length course, covering multiple topics
                </p>
              </div>
            </button>

            {/* Single-page Layout Option */}
            <button
              type="button"
              onClick={() => setSelectedLayout("single-page")}
              className={cn(
                "relative p-4 rounded-lg border-2 transition-all text-left",
                selectedLayout === "single-page"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              {/* Radio indicator */}
              <div className="absolute top-3 left-3">
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    selectedLayout === "single-page"
                      ? "border-primary"
                      : "border-muted-foreground/40"
                  )}
                >
                  {selectedLayout === "single-page" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  )}
                </div>
              </div>

              {/* Layout Preview Illustration */}
              <div className="mt-6 mb-4 flex justify-center">
                <div className="w-32 h-20 bg-muted rounded border border-border p-2">
                  <div className="text-[8px] text-muted-foreground font-medium">logo</div>
                  <div className="text-[9px] font-semibold text-foreground text-center mt-1">Course Title</div>
                  <div className="space-y-1 mt-2 px-4">
                    <div className="h-1 bg-muted-foreground/20 rounded w-full" />
                    <div className="h-1 bg-muted-foreground/20 rounded w-4/5 mx-auto" />
                    <div className="h-1 bg-muted-foreground/20 rounded w-full" />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h3 className="font-semibold text-foreground mb-1">Single-page layout</h3>
                <p className="text-sm text-muted-foreground">
                  A short, focused course designed for quick learning
                </p>
              </div>
            </button>
          </div>

          {/* Start Creating Button */}
          <div className="pt-2 flex justify-center">
            <Button
              onClick={handleStartCreating}
              disabled={!courseTitle.trim()}
              className="h-12 px-8 text-base font-semibold rounded-full gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Start creating
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
