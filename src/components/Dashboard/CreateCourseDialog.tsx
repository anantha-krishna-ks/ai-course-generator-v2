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
import { MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreationLoader } from "@/components/CourseCreation/CreationLoader";

interface CreateCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type LayoutType = "multi-page" | "single-page";

export function CreateCourseDialog({ open, onOpenChange }: CreateCourseDialogProps) {
  const navigate = useNavigate();
  const [courseTitle, setCourseTitle] = useState("");
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>("multi-page");
  const [isLoading, setIsLoading] = useState(false);

  const handleStartCreating = () => {
    if (!courseTitle.trim()) return;
    
    // Show loader for multi-page layout
    if (selectedLayout === "multi-page") {
      setIsLoading(true);
    } else {
      // Navigate directly for single-page
      navigate("/create-course", { 
        state: { 
          title: courseTitle.trim(), 
          layout: selectedLayout 
        } 
      });
      onOpenChange(false);
    }
  };

  const handleLoaderComplete = () => {
    navigate("/create-course-multipage", { 
      state: { 
        title: courseTitle.trim(), 
        layout: selectedLayout 
      } 
    });
    setIsLoading(false);
    onOpenChange(false);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen && !isLoading) {
      // Reset form when closing
      setCourseTitle("");
      setSelectedLayout("multi-page");
    }
    if (!isLoading) {
      onOpenChange(isOpen);
    }
  };

  // Show loader overlay
  if (isLoading) {
    return <CreationLoader courseTitle={courseTitle} onComplete={handleLoaderComplete} />;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-[800px] max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-10">
        <DialogHeader className="space-y-2 pb-2">
          <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-foreground text-left">
            Create your course from scratch
          </DialogTitle>
          <p className="text-muted-foreground/80 text-xs sm:text-sm md:text-base text-left leading-relaxed">
            Enter a title and pick a layout that best suits your course requirements. You can switch layouts later if you change your mind
          </p>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">

          {/* Course Title Input */}
          <div>
            <Input
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              placeholder="Enter course title..."
              className="h-12 sm:h-14 text-base sm:text-lg md:text-xl bg-background border-2 border-border focus:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors placeholder:text-base sm:placeholder:text-lg md:placeholder:text-xl placeholder:text-foreground/70 placeholder:font-medium"
            />
          </div>

          {/* Layout Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Multi-page Layout Option */}
            <button
              type="button"
              onClick={() => setSelectedLayout("multi-page")}
              className={cn(
                "relative p-3 sm:p-4 rounded-lg border-2 transition-all text-left",
                selectedLayout === "multi-page"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              {/* Radio indicator */}
              <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                <div
                  className={cn(
                    "w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center",
                    selectedLayout === "multi-page"
                      ? "border-primary"
                      : "border-muted-foreground/40"
                  )}
                >
                  {selectedLayout === "multi-page" && (
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-primary" />
                  )}
                </div>
              </div>

              {/* Layout Preview Illustration */}
              <div className="mt-5 sm:mt-6 mb-3 sm:mb-4 flex justify-center">
                <div className="w-28 sm:w-32 h-16 sm:h-20 bg-muted rounded border border-border p-1.5 sm:p-2 flex gap-1.5 sm:gap-2">
                  <div className="flex-1 space-y-0.5 sm:space-y-1">
                    <div className="text-[7px] sm:text-[8px] text-muted-foreground font-medium">logo</div>
                    <div className="text-[8px] sm:text-[9px] font-semibold text-foreground">Course Title</div>
                    <div className="space-y-0.5 sm:space-y-1 mt-1 sm:mt-2">
                      <div className="h-0.5 sm:h-1 bg-muted-foreground/20 rounded w-full" />
                      <div className="h-0.5 sm:h-1 bg-muted-foreground/20 rounded w-4/5" />
                      <div className="h-0.5 sm:h-1 bg-muted-foreground/20 rounded w-full" />
                    </div>
                  </div>
                  <div className="w-10 sm:w-12 space-y-0.5 sm:space-y-1">
                    <div className="h-1.5 sm:h-2 bg-muted-foreground/20 rounded" />
                    <div className="h-1.5 sm:h-2 bg-muted-foreground/20 rounded" />
                    <div className="h-1.5 sm:h-2 bg-muted-foreground/20 rounded" />
                    <div className="h-1.5 sm:h-2 bg-muted-foreground/20 rounded" />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h3 className="font-semibold text-sm sm:text-base text-foreground mb-0.5 sm:mb-1">Multi-page layout</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  A full-length course, covering multiple topics
                </p>
              </div>
            </button>

            {/* Single-page Layout Option */}
            <button
              type="button"
              onClick={() => setSelectedLayout("single-page")}
              className={cn(
                "relative p-3 sm:p-4 rounded-lg border-2 transition-all text-left",
                selectedLayout === "single-page"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              {/* Radio indicator */}
              <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                <div
                  className={cn(
                    "w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center",
                    selectedLayout === "single-page"
                      ? "border-primary"
                      : "border-muted-foreground/40"
                  )}
                >
                  {selectedLayout === "single-page" && (
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-primary" />
                  )}
                </div>
              </div>

              {/* Layout Preview Illustration */}
              <div className="mt-5 sm:mt-6 mb-3 sm:mb-4 flex justify-center">
                <div className="w-28 sm:w-32 h-16 sm:h-20 bg-muted rounded border border-border p-1.5 sm:p-2">
                  <div className="text-[7px] sm:text-[8px] text-muted-foreground font-medium">logo</div>
                  <div className="text-[8px] sm:text-[9px] font-semibold text-foreground text-center mt-0.5 sm:mt-1">Course Title</div>
                  <div className="space-y-0.5 sm:space-y-1 mt-1 sm:mt-2 px-3 sm:px-4">
                    <div className="h-0.5 sm:h-1 bg-muted-foreground/20 rounded w-full" />
                    <div className="h-0.5 sm:h-1 bg-muted-foreground/20 rounded w-4/5 mx-auto" />
                    <div className="h-0.5 sm:h-1 bg-muted-foreground/20 rounded w-full" />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h3 className="font-semibold text-sm sm:text-base text-foreground mb-0.5 sm:mb-1">Single-page layout</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  A short, focused course designed for quick learning
                </p>
              </div>
            </button>
          </div>

          {/* Start Creating Button */}
          <div className="pt-1 sm:pt-2 flex justify-center">
            <Button
              onClick={handleStartCreating}
              disabled={!courseTitle.trim()}
              className="h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-semibold rounded-full gap-2"
            >
              <MousePointerClick className="w-4 h-4 sm:w-5 sm:h-5" />
              Start creating
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
