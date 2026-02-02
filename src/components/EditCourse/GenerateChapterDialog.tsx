import { useState } from "react";
import { Sparkles, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GenerateChapterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isGenerating: boolean;
}

export const GenerateChapterDialog = ({
  open,
  onOpenChange,
  onConfirm,
  isGenerating,
}: GenerateChapterDialogProps) => {
  if (isGenerating) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="max-w-4xl max-h-[80vh]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
              Generating Chapter...
            </AlertDialogTitle>
          </AlertDialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 py-4">
              {/* Title Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>

              {/* Image Skeleton */}
              <Skeleton className="h-64 w-full rounded-lg" />

              {/* Overview Section */}
              <div className="space-y-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>

              {/* Modules Section */}
              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                
                {/* Module 1 */}
                <div className="space-y-2 pl-4 border-l-2 border-muted">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  
                  {/* Topics */}
                  <div className="space-y-2 pl-4 pt-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>

                {/* Module 2 */}
                <div className="space-y-2 pl-4 border-l-2 border-muted">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  
                  {/* Topics */}
                  <div className="space-y-2 pl-4 pt-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>

                {/* Module 3 */}
                <div className="space-y-2 pl-4 border-l-2 border-muted">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                </div>
              </div>

              {/* Quiz Section */}
              <div className="space-y-3">
                <Skeleton className="h-6 w-40" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <div className="space-y-1 pl-4">
                    <Skeleton className="h-3 w-5/6" />
                    <Skeleton className="h-3 w-4/6" />
                    <Skeleton className="h-3 w-3/6" />
                    <Skeleton className="h-3 w-4/6" />
                  </div>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="pt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="animate-pulse">AI is generating your chapter content...</span>
              </div>
            </div>
          </ScrollArea>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Confirm Chapter Generation
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            Generating the chapter will overwrite any previously generated content and will use
            additional tokens as well as time. Are you sure you want to proceed?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Yes, generate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
