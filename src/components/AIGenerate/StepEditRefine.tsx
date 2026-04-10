import { useState, useCallback } from "react";
import { AIGenerateState } from "@/pages/AIGenerateCourse";
import { Pencil, Trash2, GripVertical, Plus, FileText } from "lucide-react";
import { AISparkles } from "@/components/ui/ai-sparkles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence, Reorder } from "framer-motion";

import thumbIntro from "@/assets/section-thumb-intro.png";
import thumbConcepts from "@/assets/section-thumb-concepts.png";
import thumbPractical from "@/assets/section-thumb-practical.png";
import thumbAssessment from "@/assets/section-thumb-assessment.png";

interface StepEditRefineProps {
  state: AIGenerateState;
  onChange: (partial: Partial<AIGenerateState>) => void;
}

interface Section {
  id: string;
  title: string;
  pages: number;
  description: string;
  thumbnail: string;
}

const DEFAULT_SECTIONS: Section[] = [
  { id: "s1", title: "Introduction", pages: 2, description: "Course overview and learning objectives", thumbnail: thumbIntro },
  { id: "s2", title: "Core Concepts", pages: 4, description: "Fundamental principles and key theories", thumbnail: thumbConcepts },
  { id: "s3", title: "Practical Application", pages: 3, description: "Hands-on exercises and scenarios", thumbnail: thumbPractical },
  { id: "s4", title: "Assessment & Review", pages: 2, description: "Knowledge checks and summary", thumbnail: thumbAssessment },
];

const THUMBS = [thumbIntro, thumbConcepts, thumbPractical, thumbAssessment];

export function StepEditRefine({ state }: StepEditRefineProps) {
  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleDelete = useCallback((id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const startEdit = useCallback((section: Section) => {
    setEditingId(section.id);
    setEditTitle(section.title);
  }, []);

  const saveEdit = useCallback(() => {
    if (!editingId || !editTitle.trim()) return;
    setSections((prev) =>
      prev.map((s) => (s.id === editingId ? { ...s, title: editTitle.trim() } : s))
    );
    setEditingId(null);
    setEditTitle("");
  }, [editingId, editTitle]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditTitle("");
  }, []);

  const addSection = useCallback(() => {
    const newId = `s${Date.now()}`;
    setSections((prev) => [
      ...prev,
      {
        id: newId,
        title: `New Section`,
        pages: 1,
        description: "New section description",
        thumbnail: THUMBS[prev.length % THUMBS.length],
      },
    ]);
  }, []);

  const totalPages = sections.reduce((sum, s) => sum + s.pages, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground">Review your course</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Drag to reorder, edit or remove sections before finalizing.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            {sections.length} sections
          </span>
          <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            {totalPages} pages
          </span>
        </div>
      </div>

      {/* Course title card */}
      <div className="rounded-xl border border-border bg-background p-3.5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Course Title</p>
          <h2 className="text-sm font-bold text-foreground truncate">{state.title || "Untitled Course"}</h2>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
            {state.layoutType === "multi-page" ? "Multi-page" : "Single-page"}
          </span>
        </div>
      </div>

      {/* Reorderable sections */}
      <Reorder.Group
        axis="y"
        values={sections}
        onReorder={setSections}
        className="space-y-2"
      >
        <AnimatePresence initial={false}>
          {sections.map((section, index) => {
            const isEditing = editingId === section.id;

            return (
              <Reorder.Item
                key={section.id}
                value={section}
                className="list-none"
              >
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
                  className="rounded-xl border border-border bg-background hover:border-primary/30 transition-colors group cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-center gap-0 p-2 sm:p-2.5">
                    {/* Drag handle */}
                    <div
                      className="flex items-center justify-center w-6 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity"
                      aria-label={`Drag to reorder ${section.title}`}
                      role="button"
                      tabIndex={0}
                    >
                      <GripVertical className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" focusable="false" />
                    </div>

                    {/* Thumbnail */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-muted/50 shrink-0 mr-3">
                      <img
                        src={section.thumbnail}
                        alt=""
                        role="presentation"
                        className="w-full h-full object-cover"
                        loading="lazy"
                        width={56}
                        height={56}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="h-7 text-sm font-semibold px-2 rounded-lg"
                            aria-label="Section title"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit();
                              if (e.key === "Escape") cancelEdit();
                            }}
                          />
                          <Button
                            size="sm"
                            variant="default"
                            className="h-7 px-2.5 text-xs rounded-lg"
                            onClick={saveEdit}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs rounded-lg"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-primary bg-primary/10 w-5 h-5 rounded-md flex items-center justify-center shrink-0">
                              {index + 1}
                            </span>
                            <h3 className="text-sm font-semibold text-foreground truncate">{section.title}</h3>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate ml-7">{section.description}</p>
                        </>
                      )}
                    </div>

                    {/* Pages badge */}
                    <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0 mx-2">
                      {section.pages} {section.pages === 1 ? "page" : "pages"}
                    </span>

                    {/* Actions */}
                    {!isEditing && (
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(section)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          aria-label={`Edit section ${section.title}`}
                        >
                          <Pencil className="w-3 h-3 text-muted-foreground" aria-hidden="true" focusable="false" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(section.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-destructive/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          aria-label={`Delete section ${section.title}`}
                        >
                          <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" aria-hidden="true" focusable="false" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </Reorder.Item>
            );
          })}
        </AnimatePresence>
      </Reorder.Group>

      {/* Add section */}
      <button
        type="button"
        onClick={addSection}
        className="w-full rounded-xl border border-dashed border-border hover:border-primary/40 bg-background hover:bg-primary/[0.02] transition-colors p-2.5 flex items-center justify-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Add new section"
      >
        <Plus className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" aria-hidden="true" focusable="false" />
        <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">Add Section</span>
      </button>

      {/* AI hint */}
      <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-3 flex items-start gap-2.5">
        <AISparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Drag sections to reorder, click edit to rename, or <span className="font-medium text-foreground">Finish</span> to save your course.
        </p>
      </div>
    </div>
  );
}
