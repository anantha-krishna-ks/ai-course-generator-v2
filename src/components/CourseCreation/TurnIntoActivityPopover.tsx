import { useState } from "react";
import {
  PenLine,
  Wand2,
  ChevronRight,
  ChevronLeft,
  Rows3,
  LayoutPanelTop,
  LayoutPanelLeft,
  Layers,
  Group,
  MousePointerClick,
  Info,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AISparkles } from "@/components/ui/ai-sparkles";
import { cn } from "@/lib/utils";

export type ActivityKind =
  | "accordion"
  | "horizontal-tabs"
  | "vertical-tabs"
  | "flashcards"
  | "card-sort"
  | "hotspot";

export type BlockKind = "text" | "image";

export interface ActivityChoice {
  id: ActivityKind;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  needs: BlockKind;
  targetType: "text" | "tabs" | "flashcards" | "hotspot";
  targetVariant?: string;
}

const ACTIVITIES: ActivityChoice[] = [
  { id: "accordion", label: "Accordion", hint: "Collapsible panels from each sub-topic", icon: Rows3, needs: "text", targetType: "text", targetVariant: "accordion" },
  { id: "horizontal-tabs", label: "Horizontal Tabs", hint: "2–5 sub-topics as tabs across the top", icon: LayoutPanelTop, needs: "text", targetType: "tabs", targetVariant: "horizontal-tabs" },
  { id: "vertical-tabs", label: "Vertical Tabs", hint: "2–5 sub-topics as a stacked list", icon: LayoutPanelLeft, needs: "text", targetType: "tabs", targetVariant: "vertical-tabs" },
  { id: "flashcards", label: "Flashcards", hint: "Term/definition or Q&A pairs", icon: Layers, needs: "text", targetType: "flashcards", targetVariant: "flashcards" },
  { id: "card-sort", label: "Card Sorting", hint: "Sort items into the right categories", icon: Group, needs: "text", targetType: "text", targetVariant: "card-sort" },
  { id: "hotspot", label: "Hotspot on Image", hint: "Place labelled points on an image", icon: MousePointerClick, needs: "image", targetType: "hotspot", targetVariant: "hotspot" },
];

type View = "root" | "activities" | "preview" | "generating";

interface Props {
  blockKind: BlockKind;
  hasContent: boolean;
  onOpenRewrite: () => void;
  onOpenGenerate: () => void;
  onReplace?: (targetType: ActivityChoice["targetType"], targetVariant?: string) => void;
  onKeepBoth?: (targetType: ActivityChoice["targetType"], targetVariant?: string) => void;
  onClose: () => void;
}

export function TurnIntoActivityPopover({
  blockKind,
  hasContent,
  onOpenRewrite,
  onOpenGenerate,
  onReplace,
  onKeepBoth,
  onClose,
}: Props) {
  const [view, setView] = useState<View>("root");
  const [selected, setSelected] = useState<ActivityChoice | null>(null);
  const [regenKey, setRegenKey] = useState(0);

  const rewriteLabel = blockKind === "text"
    ? (hasContent ? "Rewrite with AI" : "Generate text with AI")
    : "Generate image with AI";
  const rewriteSub = blockKind === "text"
    ? (hasContent ? "Refine, shorten, expand or change the tone" : "Draft new text from a prompt")
    : "Create a new image from a prompt";

  const handleRewrite = () => {
    if (blockKind === "text" && hasContent) onOpenRewrite();
    else onOpenGenerate();
    onClose();
  };

  const startGenerate = (choice: ActivityChoice) => {
    setSelected(choice);
    setView("generating");
    window.setTimeout(() => setView("preview"), 1400);
  };

  return (
    <div className="w-[340px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/60">
        <div className="flex items-center gap-2 min-w-0">
          {view !== "root" && (
            <button
              type="button"
              onClick={() => {
                if (view === "preview" || view === "generating") setView("activities");
                else setView("root");
              }}
              className="p-1 -ml-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Back"
            >
              <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
          <div className="flex items-center gap-1.5 min-w-0">
            <AISparkles className="w-3.5 h-3.5" />
            <span className="text-[12px] font-semibold text-foreground truncate">
              {view === "root" && "Ask AI"}
              {view === "activities" && "Turn into activity"}
              {view === "preview" && `Preview · ${selected?.label}`}
              {view === "generating" && `Building ${selected?.label}…`}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* Body */}
      <AnimatePresence mode="wait">
        {view === "root" && (
          <motion.div
            key="root"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
            className="p-1.5"
          >
            <MenuRow
              icon={PenLine}
              label={rewriteLabel}
              sub={rewriteSub}
              onClick={handleRewrite}
            />
            <MenuRow
              icon={Wand2}
              label="Turn into activity"
              sub="Convert this block into an interactive element"
              onClick={() => setView("activities")}
              trailing={<ChevronRight className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />}
            />
          </motion.div>
        )}

        {view === "activities" && (
          <motion.div
            key="activities"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
            className="p-1.5 max-h-[360px] overflow-y-auto"
          >
            <p className="px-2 pt-1 pb-1.5 text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
              Choose an activity
            </p>
            {ACTIVITIES.map((a) => {
              const disabled = a.needs !== blockKind;
              return (
                <ActivityRow
                  key={a.id}
                  activity={a}
                  disabled={disabled}
                  reason={
                    disabled
                      ? a.needs === "image"
                        ? "Needs an image block"
                        : "Needs a text block"
                      : undefined
                  }
                  onSelect={() => startGenerate(a)}
                />
              );
            })}
          </motion.div>
        )}

        {view === "generating" && selected && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-8 flex flex-col items-center justify-center gap-3"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
              className="w-9 h-9 rounded-full border-2 border-primary/25 border-t-primary"
              aria-hidden="true"
            />
            <p className="text-[12px] font-medium text-foreground">Building {selected.label.toLowerCase()} from your content</p>
            <p className="text-[11px] text-muted-foreground text-center max-w-[240px]">
              The AI is structuring your text into the activity format.
            </p>
          </motion.div>
        )}

        {view === "preview" && selected && (
          <motion.div
            key={`preview-${regenKey}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="flex flex-col"
          >
            <div className="px-3 py-3">
              <ActivityPreview kind={selected.id} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuRow({
  icon: Icon,
  label,
  sub,
  onClick,
  trailing,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sub: string;
  onClick: () => void;
  trailing?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-start gap-2.5 px-2.5 py-2.5 rounded-lg text-left hover:bg-muted/70 transition-colors group"
    >
      <span className="mt-0.5 flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[12.5px] font-semibold text-foreground leading-tight">{label}</span>
        <span className="block text-[11px] text-muted-foreground leading-snug mt-0.5">{sub}</span>
      </span>
      {trailing}
    </button>
  );
}

function ActivityRow({
  activity,
  disabled,
  reason,
  onSelect,
}: {
  activity: ActivityChoice;
  disabled: boolean;
  reason?: string;
  onSelect: () => void;
}) {
  const Icon = activity.icon;
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onSelect}
      disabled={disabled}
      className={cn(
        "w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors group",
        disabled
          ? "opacity-55 cursor-not-allowed"
          : "hover:bg-muted/70"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex items-center justify-center w-7 h-7 rounded-md transition-colors",
          disabled ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary group-hover:bg-primary/15"
        )}
      >
        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[12.5px] font-semibold text-foreground leading-tight">
          {activity.label}
        </span>
        <span className="block text-[11px] text-muted-foreground leading-snug mt-0.5">
          {disabled && reason ? (
            <span className="inline-flex items-center gap-1">
              <Info className="w-3 h-3" aria-hidden="true" /> {reason}
            </span>
          ) : (
            activity.hint
          )}
        </span>
      </span>
    </button>
  );
}

function ActivityPreview({ kind }: { kind: ActivityKind }) {
  if (kind === "accordion") {
    return (
      <div className="rounded-lg border border-border/60 bg-background overflow-hidden">
        {["Overview", "Key concepts", "In practice"].map((t, i) => (
          <div key={t} className={cn("px-3 py-2 flex items-center justify-between", i > 0 && "border-t border-border/60")}>
            <span className="text-[12px] font-medium text-foreground">{t}</span>
            <span className={cn("w-4 h-4 rounded-full border border-border flex items-center justify-center text-muted-foreground text-[10px]", i === 0 && "bg-primary/10 border-primary/30 text-primary")}>{i === 0 ? "−" : "+"}</span>
          </div>
        ))}
        {/* first panel open */}
        <div className="px-3 pb-2.5 -mt-1 text-[11px] text-muted-foreground leading-relaxed">
          A short introduction summarising this sub-topic in a couple of lines.
        </div>
      </div>
    );
  }
  if (kind === "horizontal-tabs" || kind === "vertical-tabs") {
    const horizontal = kind === "horizontal-tabs";
    const tabs = ["Intro", "Details", "Examples"];
    return (
      <div className={cn("rounded-lg border border-border/60 bg-background overflow-hidden", horizontal ? "" : "flex")}>
        <div className={cn(horizontal ? "flex border-b border-border/60" : "flex flex-col border-r border-border/60 w-1/3 bg-muted/30")}>
          {tabs.map((t, i) => (
            <div key={t} className={cn(
              "px-2.5 py-1.5 text-[11px] font-medium",
              i === 0 ? "text-primary bg-primary/10" : "text-muted-foreground",
              horizontal ? "border-r last:border-r-0 border-border/60" : "border-b last:border-b-0 border-border/60"
            )}>{t}</div>
          ))}
        </div>
        <div className="px-3 py-2.5 text-[11px] text-muted-foreground leading-relaxed flex-1">
          Content for the active tab appears here.
        </div>
      </div>
    );
  }
  if (kind === "flashcards") {
    return (
      <div className="grid grid-cols-2 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="aspect-[4/3] rounded-lg border border-border/60 bg-background flex items-center justify-center px-2 text-center">
            <span className="text-[11px] font-medium text-foreground">{i % 2 === 0 ? "Term " + (i / 2 + 1) : "Definition"}</span>
          </div>
        ))}
      </div>
    );
  }
  if (kind === "card-sort") {
    return (
      <div className="space-y-2">
        <div className="flex gap-1.5">
          {["Category A", "Category B"].map((c) => (
            <div key={c} className="flex-1 rounded-lg border border-dashed border-border/60 bg-muted/20 px-2 py-1.5 text-[11px] font-medium text-foreground text-center">{c}</div>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["Item 1", "Item 2", "Item 3", "Item 4"].map((c) => (
            <div key={c} className="rounded-md border border-border/60 bg-background px-2 py-1 text-[11px] text-foreground shadow-sm">{c}</div>
          ))}
        </div>
      </div>
    );
  }
  // hotspot
  return (
    <div className="relative rounded-lg border border-border/60 overflow-hidden bg-gradient-to-br from-muted/40 to-muted/10 aspect-[16/9]">
      {[
        { x: 22, y: 28 },
        { x: 60, y: 42 },
        { x: 78, y: 68 },
      ].map((p, i) => (
        <span
          key={i}
          className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary text-primary-foreground text-[9px] font-semibold flex items-center justify-center ring-4 ring-primary/20"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        >
          {i + 1}
        </span>
      ))}
    </div>
  );
}
