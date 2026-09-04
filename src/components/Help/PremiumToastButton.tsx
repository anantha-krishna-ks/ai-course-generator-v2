import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Info,
  AlertTriangle,
  XCircle,
  type LucideIcon,
} from "lucide-react";

const TOAST_DURATION = 5000;

type ToastKind = "success" | "info" | "warning" | "error";

/**
 * iOS-inspired filled toast config — vibrant gradient fills deep enough
 * for white text to pass WCAG AA (>= 4.5:1).
 */
const KINDS: Record<
  ToastKind,
  {
    icon: LucideIcon;
    label: string;
    title: string;
    message: string;
    /** Filled gradient background */
    fill: string;
    /** Icon tile treatment */
    tile: string;
    /** Trigger button styling */
    trigger: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    label: "Success",
    title: "Course published",
    message: "“Introduction to Workplace Safety” is now live for all learners.",
    fill: "border-transparent bg-gradient-to-br from-[hsl(152_72%_28%)] to-[hsl(168_80%_22%)] shadow-[0_12px_32px_-8px_hsl(158_80%_24%/0.55),0_2px_6px_hsl(158_80%_20%/0.35)]",
    tile: "bg-white/15 ring-1 ring-inset ring-white/25",
    trigger:
      "bg-[hsl(152_72%_30%)] text-white hover:bg-[hsl(152_72%_26%)] border-transparent",
  },
  info: {
    icon: Info,
    label: "Info",
    title: "Sync complete",
    message: "All learner progress has been synced across your devices.",
    fill: "border-transparent bg-gradient-to-br from-[hsl(211_95%_38%)] to-[hsl(230_70%_30%)] shadow-[0_12px_32px_-8px_hsl(215_90%_32%/0.55),0_2px_6px_hsl(215_90%_26%/0.35)]",
    tile: "bg-white/15 ring-1 ring-inset ring-white/25",
    trigger:
      "bg-[hsl(211_95%_40%)] text-white hover:bg-[hsl(211_95%_35%)] border-transparent",
  },
  warning: {
    icon: AlertTriangle,
    label: "Warning",
    title: "Storage almost full",
    message: "You’ve used 92% of your media storage. Consider archiving older drafts.",
    fill: "border-transparent bg-gradient-to-br from-[hsl(28_90%_34%)] to-[hsl(16_85%_30%)] shadow-[0_12px_32px_-8px_hsl(24_90%_30%/0.55),0_2px_6px_hsl(24_90%_24%/0.35)]",
    tile: "bg-white/15 ring-1 ring-inset ring-white/25",
    trigger:
      "bg-[hsl(28_90%_36%)] text-white hover:bg-[hsl(28_90%_31%)] border-transparent",
  },
  error: {
    icon: XCircle,
    label: "Error",
    title: "Publish failed",
    message: "We couldn’t reach the server. Your changes are saved as a draft.",
    fill: "border-transparent bg-gradient-to-br from-[hsl(355_75%_42%)] to-[hsl(340_70%_32%)] shadow-[0_12px_32px_-8px_hsl(350_75%_36%/0.55),0_2px_6px_hsl(350_75%_28%/0.35)]",
    tile: "bg-white/15 ring-1 ring-inset ring-white/25",
    trigger:
      "bg-[hsl(355_75%_44%)] text-white hover:bg-[hsl(355_75%_39%)] border-transparent",
  },
};

/**
 * Demo triggers for the premium filled snackbar — iOS-style vibrant gradient
 * toast with an app-icon tile, spring pop entrance, white-on-color AA text,
 * and an animated auto-close countdown bar.
 */
export const PremiumToastButton = () => {
  const { toast } = useToast();

  const showToast = (kind: ToastKind) => {
    const k = KINDS[kind];
    const Icon = k.icon;
    toast({
      duration: TOAST_DURATION,
      className: [
        // Kill the flat card look + old ribbon, go filled iOS style
        "rounded-[22px] border p-0 backdrop-blur-sm",
        "[&_.toast-ribbon]:hidden",
        // Replace the default entrance with a spring pop
        "data-[state=open]:animate-none animate-toast-spring",
        k.fill,
      ].join(" "),
      title: (
        <span className="sr-only">{k.title}</span>
      ),
      description: (
        <span className="block">
          <span className="flex items-start gap-3">
            {/* iOS app-icon style tile */}
            <span
              className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] backdrop-blur-md ${k.tile}`}
              aria-hidden="true"
            >
              <Icon className="h-5 w-5 text-white" aria-hidden="true" focusable="false" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold leading-tight text-white">
                {k.title}
              </span>
              <span className="mt-0.5 block text-[13px] leading-snug text-white">
                {k.message}
              </span>
            </span>
          </span>
          {/* Auto-close countdown */}
          <span
            className="mt-3 block h-[3px] w-full overflow-hidden rounded-full bg-white/25"
            aria-hidden="true"
          >
            <span
              className="block h-full w-full rounded-full bg-white/90 animate-toast-progress"
              style={{ ["--toast-duration" as string]: `${TOAST_DURATION}ms` }}
            />
          </span>
        </span>
      ),
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Premium toast demos">
      {(Object.keys(KINDS) as ToastKind[]).map((kind) => {
        const k = KINDS[kind];
        const Icon = k.icon;
        return (
          <Button
            key={kind}
            size="lg"
            variant="outline"
            className={`rounded-full gap-2 shadow-sm ${k.trigger}`}
            onClick={() => showToast(kind)}
          >
            <Icon className="w-4 h-4" aria-hidden="true" focusable="false" />
            {k.label}
          </Button>
        );
      })}
    </div>
  );
};
