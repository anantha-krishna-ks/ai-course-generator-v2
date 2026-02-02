import { useState } from "react";
import { Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EditChapterDialogProps {
  open: boolean;
  onClose: () => void;
  chapterTitle: string;
  onSave: (newTitle: string) => void;
}

export const EditChapterDialog = ({
  open,
  onClose,
  chapterTitle,
  onSave,
}: EditChapterDialogProps) => {
  const [title, setTitle] = useState(chapterTitle);

  const handleSave = () => {
    if (title.trim()) {
      onSave(title.trim());
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="w-5 h-5" />
            Edit Chapter
          </DialogTitle>
          <DialogDescription>
            Update the chapter title below
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="chapter-title">Chapter Title</Label>
            <Input
              id="chapter-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter chapter title"
              className="w-full"
            />
          </div>

          <Alert>
            <AlertDescription className="text-xs text-muted-foreground">
              <strong>Note:</strong> Modifying the title may misalign the previously generated content. 
              Please regenerate the content if necessary to ensure it aligns with the updated title.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
