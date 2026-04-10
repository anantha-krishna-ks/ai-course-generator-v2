import { AIGenerateState } from "@/pages/AIGenerateCourse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  RefreshCw,
  X,
  Plus,
  Pencil,
  Check,
  GripVertical,
} from "lucide-react";

const TONE_OPTIONS = [
  { value: "professional" as const, label: "Professional" },
  { value: "conversational" as const, label: "Conversational" },
  { value: "coaching" as const, label: "Coaching" },
];

const PROFICIENCY_OPTIONS = [
  { value: "beginner" as const, label: "Beginner" },
  { value: "intermediate" as const, label: "Intermediate" },
  { value: "advanced" as const, label: "Advanced" },
  { value: "expert" as const, label: "Expert" },
  { value: "mixed" as const, label: "Mixed" },
];

function ChipGroup({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={ariaLabel}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(selected ? "" : opt.value)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              selected
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {selected && <Check className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

interface StepBlueprintGenerateProps {
  state: AIGenerateState;
  onChange: (partial: Partial<AIGenerateState>) => void;
}

function generateObjectives(title: string): string[] {
  const t = title.toLowerCase();
  if (t.includes("machine learning") || t.includes("ml") || t.includes("ai")) {
    return [
      "Define key machine learning concepts including supervised, unsupervised, and reinforcement learning.",
      "Prepare and preprocess datasets for training machine learning models.",
      "Evaluate model performance using appropriate metrics such as accuracy, precision, and recall.",
      "Apply common ML algorithms to solve classification and regression problems.",
    ];
  }
  if (t.includes("leadership") || t.includes("management") || t.includes("manager")) {
    return [
      "Identify different leadership styles and when to apply each effectively.",
      "Demonstrate active listening and constructive feedback techniques.",
      "Develop strategies for managing team conflict and fostering collaboration.",
      "Create actionable plans for coaching and developing team members.",
    ];
  }
  if (t.includes("sales") || t.includes("marketing") || t.includes("email")) {
    return [
      "Craft compelling email subject lines that improve open rates.",
      "Segment audiences effectively to deliver personalized marketing messages.",
      "Analyze campaign metrics to identify areas for improvement.",
      "Design A/B testing frameworks to optimize conversion funnels.",
    ];
  }
  if (t.includes("design") || t.includes("ux") || t.includes("ui")) {
    return [
      "Apply core UX principles to create user-centered interface designs.",
      "Conduct heuristic evaluations to identify usability issues.",
      "Create wireframes and prototypes that communicate design intent clearly.",
      "Implement accessibility best practices across digital products.",
    ];
  }
  return [
    `Define the fundamental concepts and terminology of ${title || "the subject"}.`,
    `Apply key principles to solve practical problems in ${title || "this domain"}.`,
    `Analyze real-world scenarios and recommend evidence-based solutions.`,
    `Evaluate outcomes and iterate on strategies for continuous improvement.`,
  ];
}

export function StepBlueprintGenerate({ state, onChange }: StepBlueprintGenerateProps) {
  const [objectives, setObjectives] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newValue, setNewValue] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);

  const generate = useCallback(() => {
    setLoading(true);
    setEditingIdx(null);
    setShowAddInput(false);
    setTimeout(() => {
      setObjectives(generateObjectives(state.title));
      setLoading(false);
    }, 900);
  }, [state.title]);

  useEffect(() => {
    if (state.title.trim().length >= 2) {
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = (idx: number) => {
    setObjectives((prev) => prev.filter((_, i) => i !== idx));
    if (editingIdx === idx) setEditingIdx(null);
  };

  const handleStartEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditValue(objectives[idx]);
  };

  const handleSaveEdit = () => {
    if (editingIdx === null || !editValue.trim()) return;
    setObjectives((prev) =>
      prev.map((o, i) => (i === editingIdx ? editValue.trim() : o))
    );
    setEditingIdx(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingIdx(null);
    setEditValue("");
  };

  const handleAdd = () => {
    if (!newValue.trim()) return;
    setObjectives((prev) => [...prev, newValue.trim()]);
    setNewValue("");
    setShowAddInput(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground">Learning Objectives</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            AI-suggested objectives based on your course title. Edit, remove, or add your own.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={generate}
          disabled={loading}
          className="rounded-full gap-1.5 shrink-0 h-8 px-3 text-xs"
          aria-label="Regenerate learning objectives"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} aria-hidden="true" focusable="false" />
          <span className="hidden sm:inline">Regenerate</span>
        </Button>
      </div>

      {/* Objectives list */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5 justify-center py-8"
            >
              <Sparkles className="w-5 h-5 text-primary animate-pulse" aria-hidden="true" focusable="false" />
              <span className="text-sm text-muted-foreground">Generating objectives…</span>
            </motion.div>
          ) : (
            objectives.map((obj, i) => (
              <motion.div
                key={`${i}-${obj.slice(0, 20)}`}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                className="group rounded-xl border border-border bg-background overflow-hidden"
              >
                {editingIdx === i ? (
                  /* Edit mode */
                  <div className="flex items-center gap-2 p-3">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit();
                        if (e.key === "Escape") handleCancelEdit();
                      }}
                      className="flex-1 text-sm h-8 rounded-lg"
                      aria-label="Edit learning objective"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleSaveEdit}
                      className="h-7 w-7 p-0 text-primary hover:text-primary"
                      aria-label="Save edit"
                    >
                      <Check className="w-4 h-4" aria-hidden="true" focusable="false" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelEdit}
                      className="h-7 w-7 p-0 text-muted-foreground"
                      aria-label="Cancel edit"
                    >
                      <X className="w-4 h-4" aria-hidden="true" focusable="false" />
                    </Button>
                  </div>
                ) : (
                  /* View mode */
                  <div className="flex items-start gap-3 px-4 py-3">
                    <GripVertical className="w-4 h-4 text-muted-foreground/40 mt-0.5 shrink-0" aria-hidden="true" focusable="false" />
                    <span className="flex-1 text-sm text-foreground leading-relaxed">{obj}</span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartEdit(i)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        aria-label={`Edit objective ${i + 1}`}
                      >
                        <Pencil className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(i)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        aria-label={`Delete objective ${i + 1}`}
                      >
                        <X className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add new objective */}
      <AnimatePresence>
        {showAddInput ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3">
              <Input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                  if (e.key === "Escape") {
                    setShowAddInput(false);
                    setNewValue("");
                  }
                }}
                placeholder="Type a new learning objective…"
                className="flex-1 text-sm h-8 rounded-lg"
                aria-label="New learning objective"
                autoFocus
              />
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={!newValue.trim()}
                className="rounded-full h-8 px-4 text-xs"
              >
                Add
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => { setShowAddInput(false); setNewValue(""); }}
                className="h-7 w-7 p-0 text-muted-foreground"
                aria-label="Cancel adding objective"
              >
                <X className="w-4 h-4" aria-hidden="true" focusable="false" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button
              type="button"
              onClick={() => setShowAddInput(true)}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-1 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
              aria-label="Add a new learning objective"
            >
              <Plus className="w-4 h-4" aria-hidden="true" focusable="false" />
              Add objective
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Count */}
      {!loading && objectives.length > 0 && (
        <p className="text-[11px] text-muted-foreground">
          {objectives.length} objective{objectives.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Tone */}
      <div>
        <div className="text-sm font-semibold text-field-label mb-2.5 uppercase tracking-wider">
          Tone
        </div>
        <ChipGroup
          options={TONE_OPTIONS}
          value={state.tone}
          onChange={(v) => onChange({ tone: v as AIGenerateState["tone"] })}
          ariaLabel="Course tone"
        />
      </div>

      {/* Proficiency Level */}
      <div>
        <div className="text-sm font-semibold text-field-label mb-2.5 uppercase tracking-wider">
          Proficiency Level
        </div>
        <ChipGroup
          options={PROFICIENCY_OPTIONS}
          value={state.proficiencyLevel}
          onChange={(v) => onChange({ proficiencyLevel: v as AIGenerateState["proficiencyLevel"] })}
          ariaLabel="Proficiency level"
        />
      </div>
    </div>
  );
}
