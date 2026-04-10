import { AIGenerateState } from "@/pages/AIGenerateCourse";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
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
import prefQuestionsImg from "@/assets/pref-questions.png";
import prefImagesImg from "@/assets/pref-images.png";

const TONE_OPTIONS = [
  { value: "ai-determined" as const, label: "AI Determined", icon: "🎯" },
  { value: "professional" as const, label: "Professional", icon: "💼" },
  { value: "conversational" as const, label: "Conversational", icon: "💬" },
  { value: "coaching" as const, label: "Coaching", icon: "🎓" },
];

const CONTENT_PREFERENCES = [
  {
    key: "includeQuestions" as const,
    label: "Questions",
    description: "Auto-generate quizzes",
    illustration: prefQuestionsImg,
  },
  {
    key: "addImages" as const,
    label: "Images",
    description: "AI-generated visuals",
    illustration: prefImagesImg,
  },
];


interface StepBlueprintGenerateProps {
  state: AIGenerateState;
  onChange: (partial: Partial<AIGenerateState>) => void;
}

interface Objective {
  id: string;
  text: string;
}

let objIdCounter = 0;
function makeId() {
  return `obj-${++objIdCounter}-${Date.now()}`;
}

function toObjectives(texts: string[]): Objective[] {
  return texts.map((text) => ({ id: makeId(), text }));
}

function generateObjectiveTexts(title: string): string[] {
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

function regenerateSingleObjective(title: string, currentText: string): string {
  const all = generateObjectiveTexts(title);
  const other = all.filter((t) => t !== currentText);
  return other[Math.floor(Math.random() * other.length)] || currentText;
}

export function StepBlueprintGenerate({ state, onChange }: StepBlueprintGenerateProps) {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newValue, setNewValue] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const dragConstraintsRef = useRef<HTMLDivElement>(null);

  const generate = useCallback(() => {
    setLoading(true);
    setEditingId(null);
    setShowAddInput(false);
    setTimeout(() => {
      setObjectives(toObjectives(generateObjectiveTexts(state.title)));
      setLoading(false);
    }, 900);
  }, [state.title]);

  useEffect(() => {
    if (state.title.trim().length >= 2) {
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = (id: string) => {
    setObjectives((prev) => prev.filter((o) => o.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleStartEdit = (obj: Objective) => {
    setEditingId(obj.id);
    setEditValue(obj.text);
  };

  const handleSaveEdit = () => {
    if (editingId === null || !editValue.trim()) return;
    setObjectives((prev) =>
      prev.map((o) => (o.id === editingId ? { ...o, text: editValue.trim() } : o))
    );
    setEditingId(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleAdd = () => {
    if (!newValue.trim()) return;
    setObjectives((prev) => [...prev, { id: makeId(), text: newValue.trim() }]);
    setNewValue("");
    setShowAddInput(false);
  };

  const handleRegenerateSingle = (obj: Objective) => {
    setRegeneratingId(obj.id);
    setTimeout(() => {
      const newText = regenerateSingleObjective(state.title, obj.text);
      setObjectives((prev) =>
        prev.map((o) => (o.id === obj.id ? { ...o, text: newText } : o))
      );
      setRegeneratingId(null);
    }, 600);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground">Learning Objectives</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Drag to reorder. Edit, regenerate, or add your own objectives.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={generate}
          disabled={loading}
          className="rounded-full gap-1.5 shrink-0 h-8 px-3 text-xs"
          aria-label="Regenerate all learning objectives"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} aria-hidden="true" focusable="false" />
          <span className="hidden sm:inline">Regenerate All</span>
        </Button>
      </div>

      {/* Objectives list */}
      <div ref={dragConstraintsRef}>
        <AnimatePresence mode="wait">
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
            <Reorder.Group
              key="list"
              axis="y"
              values={objectives}
              onReorder={setObjectives}
              className="space-y-2"
            >
              {objectives.map((obj, i) => {
                const isRegenerating = regeneratingId === obj.id;
                return (
                  <Reorder.Item
                    key={obj.id}
                    value={obj}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.03 }}
                    className="group rounded-xl border border-border bg-background overflow-hidden list-none"
                    whileDrag={{
                      scale: 1.02,
                      boxShadow: "0 8px 25px -8px hsl(var(--foreground) / 0.15)",
                      cursor: "grabbing",
                    }}
                  >
                    {editingId === obj.id ? (
                      /* Edit mode */
                      <div className="flex items-start gap-2 p-3">
                        <Textarea
                          value={editValue}
                          onChange={(e) => {
                            setEditValue(e.target.value);
                            e.target.style.height = "auto";
                            e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                          }}
                          ref={(el) => {
                            if (el) {
                              el.style.height = "auto";
                              el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSaveEdit(); }
                            if (e.key === "Escape") handleCancelEdit();
                          }}
                          className="flex-1 text-sm min-h-[32px] max-h-[200px] resize-none rounded-lg overflow-y-auto"
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
                      <div className="flex items-start gap-2 px-3 py-3">
                        {/* Drag handle */}
                        <div
                          className="mt-0.5 shrink-0 cursor-grab active:cursor-grabbing touch-none"
                          aria-label={`Drag to reorder objective ${i + 1}`}
                          role="button"
                          tabIndex={0}
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" aria-hidden="true" focusable="false" />
                        </div>

                        {/* Number badge */}
                        <span className="mt-0.5 w-5 h-5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold flex items-center justify-center shrink-0" aria-hidden="true">
                          {i + 1}
                        </span>

                        {/* Text */}
                        <span className={cn(
                          "flex-1 text-sm text-foreground leading-relaxed transition-opacity",
                          isRegenerating && "opacity-40"
                        )}>
                          {obj.text}
                        </span>

                        {/* Actions */}
                        <div className="flex items-center gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRegenerateSingle(obj)}
                            disabled={isRegenerating}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                            aria-label={`Regenerate objective ${i + 1}`}
                          >
                            <RefreshCw className={cn("w-3.5 h-3.5", isRegenerating && "animate-spin")} aria-hidden="true" focusable="false" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStartEdit(obj)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            aria-label={`Edit objective ${i + 1}`}
                          >
                            <Pencil className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(obj.id)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            aria-label={`Delete objective ${i + 1}`}
                          >
                            <X className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
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
            <div className="flex items-start gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3">
              <Textarea
                value={newValue}
                onChange={(e) => {
                  setNewValue(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAdd(); }
                  if (e.key === "Escape") {
                    setShowAddInput(false);
                    setNewValue("");
                  }
                }}
                placeholder="Type a new learning objective…"
                className="flex-1 text-sm min-h-[32px] max-h-[200px] resize-none rounded-lg overflow-y-auto"
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

      {/* Content Preferences */}
      <div>
        <div className="text-sm font-semibold text-field-label mb-2.5 uppercase tracking-wider">
          Content Preferences
        </div>
        <div className="grid grid-cols-2 gap-3 shadow-none">
          {CONTENT_PREFERENCES.map((pref) => {
            const checked = state.contentPreferences[pref.key];
            return (
              <button
                key={pref.key}
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() =>
                  onChange({
                    contentPreferences: {
                      ...state.contentPreferences,
                      [pref.key]: !checked,
                    },
                  })
                }
                className={cn(
                  "relative flex flex-row items-center gap-3 text-left rounded-2xl border px-4 py-3 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  checked
                    ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
                    : "border-border bg-background hover:border-muted-foreground/25 hover:shadow-sm"
                )}
              >
                {/* Check indicator */}
                <div
                  className={cn(
                    "absolute top-2.5 right-2.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                    checked
                      ? "border-primary bg-primary scale-100"
                      : "border-muted-foreground/25 scale-90"
                  )}
                  aria-hidden="true"
                >
                  {checked && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>

                {/* Illustration */}
                <img
                  src={pref.illustration}
                  alt=""
                  className="w-12 h-12 object-contain shrink-0"
                  loading="lazy"
                  width={48}
                  height={48}
                  role="presentation"
                />

                {/* Text */}
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-foreground">
                    {pref.label}
                  </span>
                  <span className="text-[11px] leading-snug text-muted-foreground">
                    {pref.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Course Tone */}
      <div>
        <div className="text-sm font-semibold text-field-label mb-2.5 uppercase tracking-wider">
          Course Tone
        </div>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Course tone">
          {TONE_OPTIONS.map((opt) => {
            const selected = state.tone === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange({ tone: opt.value })}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  selected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <span className="text-base leading-none" aria-hidden="true">{opt.icon}</span>
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
