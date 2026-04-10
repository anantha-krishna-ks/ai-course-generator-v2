import { useState, useCallback } from "react";
import { AIGenerateState } from "@/pages/AIGenerateCourse";
import {
  Pencil, Trash2, GripVertical, Plus, FileText, Clock, Layers,
  BookOpen, Lightbulb, Wrench, ClipboardCheck, ChevronRight, File,
  Users, Target, MessageSquare
} from "lucide-react";
import { AISparkles } from "@/components/ui/ai-sparkles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence, Reorder } from "framer-motion";

interface StepEditRefineProps {
  state: AIGenerateState;
  onChange: (partial: Partial<AIGenerateState>) => void;
}

interface Page {
  id: string;
  title: string;
  type: "content" | "quiz" | "interactive" | "summary";
}

interface Section {
  id: string;
  title: string;
  description: string;
  icon: typeof BookOpen;
  pages: Page[];
}

const DEFAULT_SECTIONS: Section[] = [
  {
    id: "s1", title: "Introduction", description: "Course overview and learning objectives",
    icon: BookOpen,
    pages: [
      { id: "p1-1", title: "Welcome & Overview", type: "content" },
      { id: "p1-2", title: "Learning Objectives", type: "content" },
    ],
  },
  {
    id: "s2", title: "Core Concepts", description: "Fundamental principles and key theories",
    icon: Lightbulb,
    pages: [
      { id: "p2-1", title: "Key Definitions", type: "content" },
      { id: "p2-2", title: "Theoretical Framework", type: "content" },
      { id: "p2-3", title: "Case Study Analysis", type: "interactive" },
      { id: "p2-4", title: "Concept Check", type: "quiz" },
    ],
  },
  {
    id: "s3", title: "Practical Application", description: "Hands-on exercises and real-world scenarios",
    icon: Wrench,
    pages: [
      { id: "p3-1", title: "Guided Walkthrough", type: "content" },
      { id: "p3-2", title: "Practice Exercise", type: "interactive" },
      { id: "p3-3", title: "Real-world Scenario", type: "content" },
    ],
  },
  {
    id: "s4", title: "Assessment & Review", description: "Knowledge checks and course summary",
    icon: ClipboardCheck,
    pages: [
      { id: "p4-1", title: "Final Assessment", type: "quiz" },
      { id: "p4-2", title: "Course Summary", type: "summary" },
    ],
  },
];

const SECTION_ICONS = [BookOpen, Lightbulb, Wrench, ClipboardCheck];

const PAGE_TYPE_COLORS: Record<Page["type"], string> = {
  content: "bg-primary/10 text-primary",
  quiz: "bg-warning/10 text-warning",
  interactive: "bg-info/10 text-info",
  summary: "bg-success/10 text-success",
};

export function StepEditRefine({ state }: StepEditRefineProps) {
  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDelete = useCallback((id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
    if (expandedId === id) setExpandedId(null);
  }, [expandedId]);

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
        title: "New Section",
        description: "New section description",
        icon: SECTION_ICONS[prev.length % SECTION_ICONS.length],
        pages: [{ id: `p${Date.now()}`, title: "New Page", type: "content" as const }],
      },
    ]);
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const totalPages = sections.reduce((sum, s) => sum + s.pages.length, 0);

  const durationLabel = state.duration === "brief" ? "~15 min" : state.duration === "extended" ? "~90 min" : "~45 min";
  const toneLabel = state.tone === "ai-determined" ? "AI Selected" : state.tone.charAt(0).toUpperCase() + state.tone.slice(1);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-foreground">Course Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review your course structure, reorder sections, and explore pages.
        </p>
      </div>

      {/* Summary dashboard */}
      <div className="rounded-xl border border-border bg-background overflow-hidden">
        {/* Course title row */}
        <div className="px-4 py-3 border-b border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-foreground truncate">{state.title || "Untitled Course"}</h2>
            <p className="text-[11px] text-muted-foreground truncate">
              {state.intendedLearners || "All learners"}
            </p>
          </div>
          <AISparkles className="w-4 h-4 shrink-0 opacity-50" />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
          {[
            { icon: Layers, label: "Sections", value: String(sections.length) },
            { icon: File, label: "Pages", value: String(totalPages) },
            { icon: Clock, label: "Duration", value: durationLabel },
            { icon: MessageSquare, label: "Tone", value: toneLabel },
          ].map((stat) => (
            <div key={stat.label} className="px-3 py-2.5 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <stat.icon className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" focusable="false" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-xs font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section label */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Course Structure</p>
        <p className="text-[10px] text-muted-foreground">Click a section to view pages</p>
      </div>

      {/* Reorderable sections */}
      <Reorder.Group
        axis="y"
        values={sections}
        onReorder={setSections}
        className="space-y-1.5"
      >
        <AnimatePresence initial={false}>
          {sections.map((section, index) => {
            const isEditing = editingId === section.id;
            const isExpanded = expandedId === section.id;
            const SectionIcon = section.icon;

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
                  className={`rounded-xl border transition-colors ${
                    isExpanded ? "border-primary/30 bg-primary/[0.02]" : "border-border bg-background hover:border-primary/20"
                  }`}
                >
                  {/* Section header row */}
                  <div className="flex items-center gap-0 p-2 sm:p-2.5 cursor-grab active:cursor-grabbing group">
                    {/* Drag handle */}
                    <div
                      className="flex items-center justify-center w-6 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity"
                      aria-label={`Drag to reorder ${section.title}`}
                      role="button"
                      tabIndex={0}
                    >
                      <GripVertical className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" focusable="false" />
                    </div>

                    {/* Section icon */}
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mr-3">
                      <SectionIcon className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
                    </div>

                    {/* Content - clickable to expand */}
                    <button
                      type="button"
                      className="flex-1 min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
                      onClick={() => toggleExpand(section.id)}
                      aria-expanded={isExpanded}
                      aria-label={`${isExpanded ? "Collapse" : "Expand"} ${section.title} section`}
                    >
                      {isEditing ? (
                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                          role="presentation"
                        >
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
                          <Button size="sm" variant="default" className="h-7 px-2.5 text-xs rounded-lg" onClick={saveEdit}>Save</Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs rounded-lg" onClick={cancelEdit}>Cancel</Button>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-primary/80">{String(index + 1).padStart(2, "0")}</span>
                            <h3 className="text-sm font-semibold text-foreground truncate">{section.title}</h3>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate pl-6">{section.description}</p>
                        </div>
                      )}
                    </button>

                    {/* Pages count */}
                    <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0 mx-2">
                      {section.pages.length} pg
                    </span>

                    {/* Expand chevron */}
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0 mr-1"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" focusable="false" />
                    </motion.div>

                    {/* Actions */}
                    {!isEditing && (
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); startEdit(section); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          aria-label={`Edit section ${section.title}`}
                        >
                          <Pencil className="w-3 h-3 text-muted-foreground" aria-hidden="true" focusable="false" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleDelete(section.id); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-destructive/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          aria-label={`Delete section ${section.title}`}
                        >
                          <Trash2 className="w-3 h-3 text-muted-foreground" aria-hidden="true" focusable="false" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Expanded pages panel */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 pt-0.5">
                          <div className="ml-8 border-l-2 border-primary/15 pl-3 space-y-1">
                            {section.pages.map((page, pi) => (
                              <motion.div
                                key={page.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: pi * 0.04, duration: 0.2 }}
                                className="flex items-center gap-2.5 py-1.5 px-2.5 rounded-lg hover:bg-muted/50 transition-colors group/page"
                              >
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${PAGE_TYPE_COLORS[page.type]}`}>
                                  {page.type === "content" ? "📄" : page.type === "quiz" ? "❓" : page.type === "interactive" ? "🎯" : "📋"}
                                </span>
                                <span className="text-xs text-foreground font-medium flex-1 truncate">{page.title}</span>
                                <span className="text-[9px] text-muted-foreground capitalize opacity-0 group-hover/page:opacity-100 transition-opacity">
                                  {page.type}
                                </span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
    </div>
  );
}
