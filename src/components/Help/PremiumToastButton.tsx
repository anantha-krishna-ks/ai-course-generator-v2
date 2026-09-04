import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { BellRing, Sparkles, CheckCircle2 } from "lucide-react";

const TOAST_DURATION = 5000;

/**
 * Demo trigger for the premium snackbar — glassy toast with gradient icon,
 * auto-close (5s) and an animated countdown progress bar.
 */
export const PremiumToastButton = () => {
  const { toast } = useToast();

  const showToast = () => {
    toast({
      variant: "success",
      duration: TOAST_DURATION,
      title: "Course published",
      description: (
        <span className="block">
          <span className="flex items-start gap-2">
            <CheckCircle2
              className="w-4 h-4 mt-0.5 shrink-0 text-success"
              aria-hidden="true"
              focusable="false"
            />
            <span>
              “Introduction to Workplace Safety” is now available to all learners.
              This notification closes automatically.
            </span>
          </span>
          {/* Auto-close countdown */}
          <span
            className="mt-3 block h-1 w-full overflow-hidden rounded-full bg-foreground/10"
            aria-hidden="true"
          >
            <span
              className="block h-full w-full rounded-full bg-gradient-to-r from-success via-primary to-primary animate-toast-progress"
              style={{ ["--toast-duration" as string]: `${TOAST_DURATION}ms` }}
            />
          </span>
        </span>
      ),
    });
  };

  return (
    <Button
      size="lg"
      variant="outline"
      className="rounded-full gap-2"
      onClick={showToast}
    >
      <BellRing className="w-4 h-4" aria-hidden="true" focusable="false" />
      Try premium toast
    </Button>
  );
};
