import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "group relative flex w-full touch-none select-none items-center py-2",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track
      className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted/70 shadow-inner transition-[height] duration-200 ease-out group-hover:h-2 group-active:h-2"
    >
      <SliderPrimitive.Range
        className="absolute h-full rounded-full bg-gradient-to-r from-primary/80 via-primary to-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.15)] transition-all duration-200 ease-out"
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className={cn(
        "relative block h-5 w-5 rounded-full bg-background",
        "border border-primary/30",
        "shadow-[0_1px_2px_hsl(var(--foreground)/0.08),0_4px_12px_-2px_hsl(var(--primary)/0.35)]",
        "ring-offset-background outline-none",
        "transition-all duration-200 ease-out",
        "before:absolute before:inset-1 before:rounded-full before:bg-gradient-to-br before:from-primary before:to-primary/80 before:transition-transform before:duration-200",
        "after:absolute after:inset-0 after:rounded-full after:bg-primary/20 after:scale-0 after:opacity-0 after:transition-all after:duration-300",
        "hover:scale-110 hover:shadow-[0_2px_4px_hsl(var(--foreground)/0.1),0_6px_16px_-2px_hsl(var(--primary)/0.45)]",
        "active:scale-95 active:after:scale-[2.4] active:after:opacity-100",
        "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50"
      )}
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
