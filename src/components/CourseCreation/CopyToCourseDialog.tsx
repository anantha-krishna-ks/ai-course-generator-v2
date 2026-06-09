import { useState, useEffect, useMemo } from "react";
import { Copy, BookOpen, Layers } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { mockCourseData, buildMockRestoreState } from "@/data/mockCourseData";

interface CopyToCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "page" | "section";
  itemTitle: string;
}

export function CopyToCourseDialog({ open, onOpenChange, mode, itemTitle }: CopyToCourseDialogProps) {
  const { toast } = useToast();
  const [courseId, setCourseId] = useState<string>("");
  const [sectionId, setSectionId] = useState<string>("");

  useEffect(() => {
    if (!open) {
      setCourseId("");
      setSectionId("");
    }
  }, [open]);

  const courses = useMemo(
    () => Object.entries(mockCourseData).map(([id, c]) => ({ id, title: c.title })),
    []
  );

  const sections = useMemo(() => {
    if (!courseId) return [];
    const course = mockCourseData[courseId];
    if (!course) return [];
    const state = buildMockRestoreState(course.title);
    return state.items
      .filter((i) => i.type === "section")
      .map((s) => ({ id: s.id, title: s.title }));
  }, [courseId]);

  const canConfirm = mode === "section" ? !!courseId : !!courseId && !!sectionId;

  const handleConfirm = () => {
    const course = mockCourseData[courseId];
    if (mode === "page") {
      const section = sections.find((s) => s.id === sectionId);
      toast({
        title: "Page copied",
        description: `"${itemTitle}" copied to ${course?.title} › ${section?.title}.`,
      });
    } else {
      toast({
        title: "Section copied",
        description: `"${itemTitle}" copied to ${course?.title}.`,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Copy className="w-5 h-5 text-muted-foreground" aria-hidden="true" focusable="false" />
            Copy {mode} to…
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Choose where to copy <span className="font-medium text-foreground">"{itemTitle}"</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <div className="space-y-2">
            <label htmlFor="copy-course-select" className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" focusable="false" />
              Destination course
            </label>
            <Select value={courseId} onValueChange={(v) => { setCourseId(v); setSectionId(""); }}>
              <SelectTrigger id="copy-course-select" aria-label="Destination course" className="w-full">
                <SelectValue placeholder="Select a course…" />
              </SelectTrigger>
              <SelectContent className="z-[60] max-h-[300px] bg-popover">
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {mode === "page" && (
            <div className="space-y-2">
              <label htmlFor="copy-section-select" className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" focusable="false" />
                Destination section
              </label>
              <Select value={sectionId} onValueChange={setSectionId} disabled={!courseId}>
                <SelectTrigger id="copy-section-select" aria-label="Destination section" className="w-full">
                  <SelectValue placeholder={courseId ? "Select a section…" : "Pick a course first"} />
                </SelectTrigger>
                <SelectContent className="z-[60] max-h-[300px] bg-popover">
                  {sections.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm} className="rounded-full px-6">
            Copy {mode}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
