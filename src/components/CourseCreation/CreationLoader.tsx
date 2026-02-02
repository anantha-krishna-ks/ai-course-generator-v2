import { Loader2 } from "lucide-react";

interface CreationLoaderProps {
  courseTitle: string;
}

export function CreationLoader({ courseTitle }: CreationLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Simple spinning loader */}
      <div className="relative mb-6">
        <div className="w-12 h-12 rounded-full border-2 border-primary/20" />
        <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-primary animate-spin" />
      </div>

      {/* Text */}
      <p className="text-sm text-muted-foreground">
        Setting up <span className="font-medium text-foreground">"{courseTitle}"</span>
      </p>
    </div>
  );
}
