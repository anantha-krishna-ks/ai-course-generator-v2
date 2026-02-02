import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { blueprintApi } from "@/services/blueprintApi";
import { demoBlueprintStore } from "@/services/demoBlueprintStore";
import { BlueprintListItem } from "@/types/blueprint";
import { Loader2 } from "lucide-react";

interface CloneBlueprintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blueprintId: string;
  originalTitle: string;
}

export function CloneBlueprintDialog({
  open,
  onOpenChange,
  blueprintId,
  originalTitle,
}: CloneBlueprintDialogProps) {
  const [title, setTitle] = useState(`${originalTitle} (Copy)`);
  const [isCloning, setIsCloning] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleClone = async () => {
    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a blueprint title.",
        variant: "destructive",
      });
      return;
    }

    setIsCloning(true);
    try {
      // Check if this is a dummy blueprint (temporary until real APIs are available)
      const isDummyBlueprint = blueprintId.startsWith('dummy-');
      
      if (isDummyBlueprint) {
        // Simulate API call with dummy data - replace this block when real API is ready
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const now = new Date().toISOString();
        const newId = `dummy-${Date.now()}`;
        const newItem: BlueprintListItem = {
          Id: newId,
          Title: title.trim(),
          BlueprintStatus: 0,
          BlueprintType: 1,
          CreatedDate: now,
          UpdatedDate: now,
          NoOfLevels: 3,
        };

        demoBlueprintStore.addClone(newItem);
        
        toast({
          title: "Blueprint Cloned",
          description: "Your blueprint has been cloned successfully (demo mode).",
        });
      } else {
        // Real API call - keep this for when proper APIs are available
        await blueprintApi.cloneBlueprint(blueprintId, title);
        
        toast({
          title: "Blueprint Cloned",
          description: "Your blueprint has been cloned successfully.",
        });
      }
      
      onOpenChange(false);
      navigate("/blueprints");
    } catch (error) {
      toast({
        title: "Clone Failed",
        description: error instanceof Error ? error.message : "Failed to clone blueprint",
        variant: "destructive",
      });
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clone Blueprint</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="clone-title">Blueprint Title</Label>
            <Input
              id="clone-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter blueprint title"
              disabled={isCloning}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCloning}
          >
            Cancel
          </Button>
          <Button onClick={handleClone} disabled={isCloning}>
            {isCloning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cloning...
              </>
            ) : (
              "Clone Blueprint"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
