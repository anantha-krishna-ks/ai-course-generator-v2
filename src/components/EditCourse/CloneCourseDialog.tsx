import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy } from "lucide-react";

interface CloneCourseDialogProps {
  open: boolean;
  onClose: (open: boolean) => void;
  onClone: (newTitle: string) => void;
  currentTitle: string;
  isCloning?: boolean;
}

export const CloneCourseDialog = ({ open, onClose, onClone, currentTitle, isCloning = false }: CloneCourseDialogProps) => {
  const [cloneTitle, setCloneTitle] = useState(`${currentTitle} (Copy)`);

  const handleClone = () => {
    if (cloneTitle.trim()) {
      onClone(cloneTitle.trim());
      onClose(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Copy className="w-5 h-5 text-primary" />
            Clone Course
          </DialogTitle>
          <DialogDescription>
            Create a copy of this course with a new title. All content, chapters, and preferences will be duplicated.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="clone-title" className="text-sm font-semibold">
              New Course Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="clone-title"
              value={cloneTitle}
              onChange={(e) => setCloneTitle(e.target.value)}
              placeholder="Enter new course title"
              className="h-11 text-base"
              disabled={isCloning}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onClose(false)} disabled={isCloning}>
            Cancel
          </Button>
          <Button 
            onClick={handleClone} 
            disabled={!cloneTitle.trim() || isCloning}
            className="gap-2"
          >
            {isCloning ? (
              <>
                <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                Cloning...
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Clone Course
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
