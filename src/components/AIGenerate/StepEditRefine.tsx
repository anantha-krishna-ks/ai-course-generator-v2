import { useState, useCallback } from "react";
import { AIGenerateState } from "@/pages/AIGenerateCourse";
import {
  Pencil, Trash2, GripVertical, Plus, FileText, Clock, Layers,
  BookOpen, Lightbulb, Wrench, ClipboardCheck, ChevronDown, File,
  MessageSquare, X, Check, MoreHorizontal
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

const PAGE_TYPE_META: Record<Page["type"], { label: string; color: string; dotColor: string }> = {
  content: { label: "Content", color: "text-primary", dotColor: "bg-primary" },
  quiz: { label: "Quiz", color: "text-warning", dotColor: "bg-warning" },
  interactive: { label: "Interactive", color: "text-info", dotColor: "bg-info" },
  summary: { label: "Summary", color: "text-success", dotColor: "bg-success" },
};

export function StepEditRefine({ state }: StepEditRefineProps) {
  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>("s1");
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editPageTitle, setEditPageTitle] = useState("");

  const handleDeleteSection = useCallback((id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
    if (expandedId === id) setExpandedId(null);
  }, [expandedId]);

  const startEdit = useCallback((section: Section) => {
    setEditingId(section.id);
    setEditTitle(section.title);
    setEditDesc(section.description);
  }, []);

  const saveEdit = useCallback(() => {
    if (!editingId || !editTitle.trim()) return;
    setSections((prev) =>
      prev.map((s) => (s.id === editingId ? { ...s, title: editTitle.trim(), description: editDesc.trim() } : s))
    );
    setEditingId(null);
  }, [editingId, editTitle, editDesc]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
  }, []);

  const addSection = useCallback(() => {
    const newId = `s${Date.now()}`;
    const newSection: Section = {
      id: newId,
      title: "New Section",
      description: "Describe this section",
      icon: SECTION_ICONS[sections.length % SECTION_ICONS.length],
      pages: [{ id: `p${Date.now()}`, title: "New Page", type: "content" }],
    };
    setSections((prev) => [...prev, newSection]);
    setExpandedId(newId);
    // Auto-enter edit mode for new section
    setEditingId(newId);
    setEditTitle(newSection.title);
    setEditDesc(newSection.description);
  }, [sections.length]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  // Page management
  const addPage = useCallback((sectionId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, pages: [...s.pages, { id: `p${Date.now()}`, title: "New Page", type: "content" as const }] }
          : s
      )
    );
  }, []);

  const deletePage = useCallback((sectionId: string, pageId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, pages: s.pages.filter((p) => p.id !== pageId) }
          : s
      )
    );
  }, []);

  const startEditPage = useCallback((page: Page) => {
    setEditingPageId(page.id);
    setEditPageTitle(page.title);
  }, []);

  const saveEditPage = useCallback((sectionId: string) => {
    if (!editingPageId || !editPageTitle.trim()) return;
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, pages: s.pages.map((p) => (p.id === editingPageId ? { ...p, title: editPageTitle.trim() } : p)) }
          : s
      )
    );
    setEditingPageId(null);
  }, [editingPageId, editPageTitle]);

  const cancelEditPage = useCallback(() => {
    setEditingPageId(null);
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
          Review structure, manage sections &amp; pages before generating.
        </p>
      </div>

      {/* Compact summary strip */}
      <div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-foreground truncate">{state.title || "Untitled Course"}</h2>
          </div>
          <AISparkles className="w-3.5 h-3.5 shrink-0 opacity-40" />
        </div>
        <div className="border-t border-border grid grid-cols-4 divide-x divide-border">
          {[
            { icon: Layers, value: `${sections.length}`, label: "Sections" },
            { icon: File, value: `${totalPages}`, label: "Pages" },
            { icon: Clock, value: durationLabel, label: "Duration" },
            { icon: MessageSquare, value: toneLabel, label: "Tone" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center py-2 gap-0.5">
              <div className="flex items-center gap-1.5">
                <s.icon className="w-3 h-3 text-muted-foreground" aria-hidden="true" focusable="false" />
                <span className="text-xs font-bold text-foreground">{s.value}</span>
              </div>
              <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sections */}
      <Reorder.Group
        axis="y"
        values={sections}
        onReorder={setSections}
        className="space-y-2"
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                  className={`rounded-xl border overflow-hidden transition-colors ${
                    isExpanded
                      ? "border-primary/25 shadow-[0_2px_12px_-4px_hsl(var(--primary)/0.1)]"
                      : "border-border hover:border-primary/15"
                  }`}
                >
                  {/* Section header */}
                  <div className={`flex items-center gap-2 p-2.5 sm:p-3 transition-colors ${
                    isExpanded ? "bg-primary/[0.03]" : "bg-background"
                  }`}>
                    {/* Drag handle */}
                    <div
                      className="flex items-center justify-center w-5 shrink-0 cursor-grab active:cursor-grabbing opacity-30 hover:opacity-100 transition-opacity"
                      aria-label={`Drag to reorder ${section.title}`}
                      role="button"
                      tabIndex={0}
                    >
                      <GripVertical className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" focusable="false" />
                    </div>

                    {/* Number + Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isExpanded ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      <SectionIcon className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                    </div>

                    {/* Title area */}
                    {isEditing ? (
                      <div className="flex-1 min-w-0 space-y-1.5" onClick={(e) => e.stopPropagation()} role="presentation">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="h-8 text-sm font-semibold px-2.5 rounded-lg"
                          aria-label="Section title"
                          placeholder="Section title"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit();
                            if (e.key === "Escape") cancelEdit();
                          }}
                        />
                        <Input
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          className="h-7 text-xs px-2.5 rounded-lg"
                          aria-label="Section description"
                          placeholder="Brief description"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit();
                            if (e.key === "Escape") cancelEdit();
                          }}
                        />
                        <div className="flex items-center gap-1.5">
                          <Button size="sm" onClick={saveEdit} className="h-6 px-2.5 text-[11px] rounded-lg gap-1">
                            <Check className="w-3 h-3" aria-hidden="true" focusable="false" />
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-6 px-2 text-[11px] rounded-lg">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="flex-1 min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg py-0.5"
                        onClick={() => toggleExpand(section.id)}
                        aria-expanded={isExpanded}
                        aria-label={`${isExpanded ? "Collapse" : "Expand"} ${section.title}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-muted-foreground tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                          <h3 className="text-[13px] font-semibold text-foreground truncate">{section.title}</h3>
                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-px rounded-full font-medium shrink-0 ml-auto mr-1">
                            {section.pages.length} {section.pages.length === 1 ? "page" : "pages"}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate pl-5 mt-px">{section.description}</p>
                      </button>
                    )}

                    {/* Expand chevron + actions */}
                    {!isEditing && (
                      <div className="flex items-center gap-0.5 shrink-0">
                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" focusable="false" />
                        </motion.div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); startEdit(section); }}
                          className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-muted transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={`Edit ${section.title}`}
                        >
                          <Pencil className="w-3 h-3 text-muted-foreground" aria-hidden="true" focusable="false" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleDeleteSection(section.id); }}
                          className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={`Delete ${section.title}`}
                        >
                          <Trash2 className="w-3 h-3 text-muted-foreground" aria-hidden="true" focusable="false" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Expanded pages */}
                  <AnimatePresence initial={false}>
                    {isExpanded && !isEditing && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border bg-background">
                          {/* Page list */}
                          <div className="divide-y divide-border">
                            {section.pages.map((page, pi) => {
                              const meta = PAGE_TYPE_META[page.type];
                              const isEditingThisPage = editingPageId === page.id;

                              return (
                                <motion.div
                                  key={page.id}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: pi * 0.03 }}
                                  className="flex items-center gap-2.5 px-4 py-2 group/page hover:bg-muted/30 transition-colors"
                                >
                                  {/* Page number */}
                                  <span className="text-[10px] font-bold text-muted-foreground tabular-nums w-4 text-center shrink-0">
                                    {pi + 1}
                                  </span>

                                  {/* Type dot */}
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dotColor}`} aria-hidden="true" />

                                  {isEditingThisPage ? (
                                    <div className="flex-1 flex items-center gap-1.5 min-w-0">
                                      <Input
                                        value={editPageTitle}
                                        onChange={(e) => setEditPageTitle(e.target.value)}
                                        className="h-6 text-xs px-2 rounded-md flex-1"
                                        aria-label="Page title"
                                        autoFocus
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") saveEditPage(section.id);
                                          if (e.key === "Escape") cancelEditPage();
                                        }}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => saveEditPage(section.id)}
                                        className="w-5 h-5 rounded flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90"
                                        aria-label="Save page title"
                                      >
                                        <Check className="w-2.5 h-2.5" aria-hidden="true" focusable="false" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={cancelEditPage}
                                        className="w-5 h-5 rounded flex items-center justify-center hover:bg-muted"
                                        aria-label="Cancel editing"
                                      >
                                        <X className="w-2.5 h-2.5 text-muted-foreground" aria-hidden="true" focusable="false" />
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <span className="text-xs text-foreground font-medium flex-1 truncate">{page.title}</span>
                                      <span className={`text-[9px] font-medium ${meta.color} opacity-60`}>{meta.label}</span>

                                      {/* Page actions */}
                                      <div className="flex items-center gap-0.5 opacity-0 group-hover/page:opacity-100 focus-within:opacity-100 transition-opacity">
                                        <button
                                          type="button"
                                          onClick={() => startEditPage(page)}
                                          className="w-5 h-5 rounded flex items-center justify-center hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                          aria-label={`Edit page ${page.title}`}
                                        >
                                          <Pencil className="w-2.5 h-2.5 text-muted-foreground" aria-hidden="true" focusable="false" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => deletePage(section.id, page.id)}
                                          className="w-5 h-5 rounded flex items-center justify-center hover:bg-destructive/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                          aria-label={`Delete page ${page.title}`}
                                        >
                                          <Trash2 className="w-2.5 h-2.5 text-muted-foreground" aria-hidden="true" focusable="false" />
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>

                          {/* Add page button */}
                          <div className="px-4 py-2 border-t border-dashed border-border">
                            <button
                              type="button"
                              onClick={() => addPage(section.id)}
                              className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors group/add focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                              aria-label={`Add page to ${section.title}`}
                            >
                              <Plus className="w-3 h-3 group-hover/add:text-primary" aria-hidden="true" focusable="false" />
                              Add page
                            </button>
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
        className="w-full rounded-xl border border-dashed border-border hover:border-primary/30 bg-background hover:bg-primary/[0.02] transition-all p-2.5 flex items-center justify-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Add new section"
      >
        <Plus className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" aria-hidden="true" focusable="false" />
        <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">Add Section</span>
      </button>
    </div>
  );
}
