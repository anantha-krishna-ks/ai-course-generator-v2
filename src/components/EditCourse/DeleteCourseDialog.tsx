import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteCourseDialogProps {
  open: boolean;
  onClose: (open: boolean) => void;
  onDelete: () => void;
  courseTitle: string;
  isDeleting?: boolean;
}

export const DeleteCourseDialog = ({ open, onClose, onDelete, courseTitle, isDeleting = false }: DeleteCourseDialogProps) => {
  const handleDelete = () => {
    onDelete();
    onClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Delete Course
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{courseTitle}"? This action cannot be undone and will permanently remove all course content, chapters, and settings.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onClose(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDelete} 
            disabled={isDeleting}
            className="gap-2"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                Delete Course
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
