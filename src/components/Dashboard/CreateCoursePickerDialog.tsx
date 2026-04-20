import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import manualIllustration from "@/assets/create-manual-illustration.png";
import aiIllustration from "@/assets/create-ai-illustration.png";

interface CreateCoursePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectManual: () => void;
  onSelectAI: () => void;
}

export function CreateCoursePickerDialog({
  open,
  onOpenChange,
  onSelectManual,
  onSelectAI,
}: CreateCoursePickerDialogProps) {
  const options = [
    {
      key: "manual" as const,
      title: "Manual Generation",
      description: "Craft your course step by step with full creative control over every section and page.",
      illustration: manualIllustration,
      bgClass: "from-[hsl(220,90%,97%)] to-[hsl(280,80%,97%)]",
      ringClass: "hover:ring-[hsl(220,80%,75%)]",
      onClick: onSelectManual,
    },
    {
      key: "ai" as const,
      title: "Generate using AI",
      description: "Turn your ideas into a complete course in seconds with an AI-powered blueprint.",
      illustration: aiIllustration,
      bgClass: "from-[hsl(280,90%,97%)] to-[hsl(330,80%,97%)]",
      ringClass: "hover:ring-[hsl(280,80%,75%)]",
      onClick: onSelectAI,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-2xl border border-border bg-background">
        <DialogHeader className="px-6 pt-6 pb-2 text-center sm:text-left">
          <DialogTitle className="text-2xl font-bold text-foreground">
            How would you like to create your course?
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Choose a starting point — you can always customize everything later.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-6 pb-6 pt-4">
          {options.map((opt, i) => (
            <motion.button
              key={opt.key}
              type="button"
              onClick={() => {
                onOpenChange(false);
                opt.onClick();
              }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              whileHover={{ y: -4 }}
              className={`group relative flex flex-col items-center text-center rounded-2xl border border-border bg-gradient-to-br ${opt.bgClass} p-5 transition-all hover:shadow-lg hover:border-primary/30 ring-2 ring-transparent ${opt.ringClass} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
              aria-label={opt.title}
            >
              <div className="w-full aspect-square max-w-[200px] flex items-center justify-center mb-3">
                <img
                  src={opt.illustration}
                  alt=""
                  role="presentation"
                  loading="lazy"
                  width={768}
                  height={768}
                  className="w-full h-full object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1.5">{opt.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                {opt.description}
              </p>
              <span className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:gap-2.5 transition-all">
                Get started
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
              </span>
            </motion.button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
