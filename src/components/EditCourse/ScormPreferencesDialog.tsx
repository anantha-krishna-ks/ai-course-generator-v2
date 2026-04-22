import { useState } from "react";
import { FileStack, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface ScormPreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScormPreferencesDialog({ open, onOpenChange }: ScormPreferencesDialogProps) {
  const { toast } = useToast();
  const [version, setVersion] = useState("scorm-2004-4");
  const [completion, setCompletion] = useState("80");
  const [trackProgress, setTrackProgress] = useState(true);
  const [reportScore, setReportScore] = useState(true);
  const [allowReview, setAllowReview] = useState(false);

  const handleSave = () => {
    toast({
      title: "SCORM preferences saved",
      description: "Your SCORM export settings have been updated.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileStack className="w-5 h-5 text-primary" aria-hidden="true" focusable="false" />
            SCORM Preferences
          </DialogTitle>
          <DialogDescription>
            Configure how your course behaves when exported as a SCORM package for your LMS.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label htmlFor="scorm-version">SCORM version</Label>
            <Select value={version} onValueChange={setVersion}>
              <SelectTrigger id="scorm-version" aria-label="SCORM version">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scorm-1.2">SCORM 1.2</SelectItem>
                <SelectItem value="scorm-2004-3">SCORM 2004 (3rd Edition)</SelectItem>
                <SelectItem value="scorm-2004-4">SCORM 2004 (4th Edition)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="completion-threshold">Completion threshold (%)</Label>
            <Input
              id="completion-threshold"
              type="number"
              min={0}
              max={100}
              value={completion}
              onChange={(e) => setCompletion(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Minimum score required to mark the course as completed.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="track-progress" className="cursor-pointer">Track learner progress</Label>
                <p className="text-xs text-muted-foreground">Send progress data back to the LMS.</p>
              </div>
              <Switch id="track-progress" checked={trackProgress} onCheckedChange={setTrackProgress} />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="report-score" className="cursor-pointer">Report quiz scores</Label>
                <p className="text-xs text-muted-foreground">Submit score and completion status to the LMS.</p>
              </div>
              <Switch id="report-score" checked={reportScore} onCheckedChange={setReportScore} />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="allow-review" className="cursor-pointer">Allow review after completion</Label>
                <p className="text-xs text-muted-foreground">Let learners revisit content once finished.</p>
              </div>
              <Switch id="allow-review" checked={allowReview} onCheckedChange={setAllowReview} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} className="gap-2">
            <Check className="w-4 h-4" aria-hidden="true" focusable="false" />
            Save preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
