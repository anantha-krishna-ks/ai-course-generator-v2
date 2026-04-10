import { useState, useCallback, useRef } from "react";
import { AIGenerateState } from "@/pages/AIGenerateCourse";
import {
  Pencil, Trash2, GripVertical, Plus, FileText, Clock, Layers,
  BookOpen, Lightbulb, Wrench, ClipboardCheck, ChevronDown, File,
  MessageSquare, MoreHorizontal, Copy, ChevronRight
} from "lucide-react";
import { AISparkles } from "@/components/ui/ai-sparkles";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const PAGE_TYPE_DOT: Record<Page["type"], string> = {
  content: "bg-primary",
  quiz: "bg-warning",
  interactive: "bg-info",
  summary: "bg-success",
};

export function StepEditRefine({ state }: StepEditRefineProps) {
  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const pageInputRef = useRef<HTMLInputElement>(null);

  const toggleCollapse = useCallback((id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const deleteSection = useCallback((id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const duplicateSection = useCallback((id: string) => {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      const orig = prev[idx];
      const copy: Section = {
        ...orig,
        id: `s${Date.now()}`,
        title: `${orig.title} (copy)`,
        pages: orig.pages.map((p) => ({ ...p, id: `p${Date.now()}-${Math.random().toString(36).slice(2, 6)}` })),
      };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }, []);

  const updateSectionTitle = useCallback((id: string, title: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, title } : s)));
  }, []);

  const addSection = useCallback(() => {
    const newId = `s${Date.now()}`;
    setSections((prev) => [
      ...prev,
      {
        id: newId,
        title: "",
        description: "New section",
        icon: SECTION_ICONS[prev.length % SECTION_ICONS.length],
        pages: [{ id: `p${Date.now()}`, title: "New Page", type: "content" as const }],
      },
    ]);
    setEditingTitleId(newId);
    setTimeout(() => titleInputRef.current?.focus(), 60);
  }, []);

  // Page management
  const addPage = useCallback((sectionId: string) => {
    const newPageId = `p${Date.now()}`;
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, pages: [...s.pages, { id: newPageId, title: "", type: "content" as const }] }
          : s
      )
    );
    // Ensure section is expanded
    setCollapsedIds((prev) => { const n = new Set(prev); n.delete(sectionId); return n; });
    setEditingPageId(newPageId);
    setTimeout(() => pageInputRef.current?.focus(), 60);
  }, []);

  const deletePage = useCallback((sectionId: string, pageId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, pages: s.pages.filter((p) => p.id !== pageId) } : s
      )
    );
  }, []);

  const duplicatePage = useCallback((sectionId: string, pageId: string) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const idx = s.pages.findIndex((p) => p.id === pageId);
        if (idx === -1) return s;
        const copy = { ...s.pages[idx], id: `p${Date.now()}` };
        const newPages = [...s.pages];
        newPages.splice(idx + 1, 0, copy);
        return { ...s, pages: newPages };
      })
    );
  }, []);

  const updatePageTitle = useCallback((sectionId: string, pageId: string, title: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, pages: s.pages.map((p) => (p.id === pageId ? { ...p, title } : p)) }
          : s
      )
    );
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

      {/* Summary strip */}
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

      {/* Section cards */}
      <Reorder.Group
        axis="y"
        values={sections}
        onReorder={setSections}
        className="space-y-3"
      >
        <AnimatePresence initial={false}>
          {sections.map((section, index) => {
            const isCollapsed = collapsedIds.has(section.id);
            const isEditingTitle = editingTitleId === section.id;

            return (
              <Reorder.Item key={section.id} value={section} className="list-none">
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                  className="group/section"
                >
                  <div className="flex items-start gap-1.5">
                    {/* Drag handle */}
                    <div
                      className="cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-muted transition-all shrink-0 touch-none opacity-0 group-hover/section:opacity-60 hover:!opacity-100 mt-3"
                      aria-label={`Drag to reorder ${section.title || "Untitled section"}`}
                      role="button"
                      tabIndex={0}
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground" aria-hidden="true" focusable="false" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="relative rounded-xl border border-border bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.04),0_1px_2px_-1px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-200 hover:shadow-sm">
                        {/* Left accent */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/40 rounded-l-xl" aria-hidden="true" />

                        {/* Header */}
                        <div className="pl-5 pr-3 pt-3 pb-2.5 flex items-center gap-2.5">
                          {/* Section number pill */}
                          <span className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground bg-primary px-2 py-0.5 rounded-full shrink-0">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          {/* Title */}
                          <div className="flex-1 min-w-0">
                            {isEditingTitle ? (
                              <input
                                ref={titleInputRef}
                                type="text"
                                value={section.title}
                                onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                                onBlur={() => setEditingTitleId(null)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === "Escape") {
                                    setEditingTitleId(null);
                                  }
                                }}
                                aria-label={`Section ${index + 1} title`}
                                autoComplete="off"
                                className="w-full text-sm font-semibold text-foreground bg-transparent outline-none placeholder:text-muted-foreground border-b border-primary/30 pb-0.5"
                                placeholder="Untitled section..."
                                autoFocus
                              />
                            ) : (
                              <button
                                type="button"
                                className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                                onClick={() => {
                                  setEditingTitleId(section.id);
                                  setTimeout(() => titleInputRef.current?.focus(), 30);
                                }}
                                aria-label={`Edit title: ${section.title || "Untitled section"}`}
                              >
                                <h3 className="text-sm font-semibold text-foreground truncate">
                                  {section.title || <span className="text-muted-foreground">Untitled section...</span>}
                                </h3>
                                <p className="text-[11px] text-muted-foreground truncate mt-px">{section.description}</p>
                              </button>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-0.5 shrink-0">
                            <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full mr-1">
                              {section.pages.length} {section.pages.length === 1 ? "page" : "pages"}
                            </span>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  className="w-7 h-7 rounded-lg border border-border bg-muted/50 hover:bg-muted data-[state=open]:bg-primary/10 data-[state=open]:border-primary/30 flex items-center justify-center transition-colors shrink-0"
                                  aria-label={`More options for ${section.title || "section"}`}
                                >
                                  <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" focusable="false" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 bg-background border border-border p-1.5 z-50">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingTitleId(section.id);
                                    setTimeout(() => titleInputRef.current?.focus(), 30);
                                  }}
                                  className="cursor-pointer gap-3 px-3 py-2 hover:!bg-muted focus:!bg-muted focus:!text-foreground"
                                >
                                  <Pencil className="w-4 h-4 text-muted-foreground" aria-hidden="true" focusable="false" />
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => addPage(section.id)}
                                  className="cursor-pointer gap-3 px-3 py-2 hover:!bg-muted focus:!bg-muted focus:!text-foreground"
                                >
                                  <Plus className="w-4 h-4 text-muted-foreground" aria-hidden="true" focusable="false" />
                                  Add page
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => duplicateSection(section.id)}
                                  className="cursor-pointer gap-3 px-3 py-2 hover:!bg-muted focus:!bg-muted focus:!text-foreground"
                                >
                                  <Copy className="w-4 h-4 text-muted-foreground" aria-hidden="true" focusable="false" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => deleteSection(section.id)}
                                  className="cursor-pointer gap-3 px-3 py-2 text-destructive hover:!bg-muted focus:!bg-muted focus:!text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" aria-hidden="true" focusable="false" />
                                  Delete section
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>

                            <button
                              onClick={() => toggleCollapse(section.id)}
                              className="p-1.5 rounded-md hover:bg-muted transition-colors"
                              aria-label={isCollapsed ? "Expand section" : "Collapse section"}
                            >
                              <ChevronDown
                                className={cn(
                                  "w-3.5 h-3.5 text-muted-foreground transition-transform duration-300",
                                  isCollapsed && "-rotate-90"
                                )}
                                aria-hidden="true"
                                focusable="false"
                              />
                            </button>
                          </div>
                        </div>

                        {/* Pages tree */}
                        <div
                          className={cn(
                            "grid transition-all duration-300 ease-in-out",
                            isCollapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
                          )}
                        >
                          <div className="overflow-hidden">
                            <div className="pl-7 pr-3 pb-2.5">
                              {section.pages.length === 0 && (
                                <div className="flex items-center gap-3 py-3 px-3 rounded-lg border border-dashed border-border/50 bg-accent/20 mb-1.5">
                                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                                    <FileText className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" focusable="false" />
                                  </div>
                                  <p className="text-xs text-muted-foreground">No pages yet. Add pages to build this section.</p>
                                </div>
                              )}

                              {section.pages.map((page, pi) => {
                                const isLast = pi === section.pages.length - 1;
                                const isEditingThisPage = editingPageId === page.id;

                                return (
                                  <div key={page.id} className="group/row relative flex items-center">
                                    {/* Tree connector */}
                                    <div className="relative w-5 flex items-center justify-center shrink-0 self-stretch">
                                      <div
                                        className={cn(
                                          "absolute left-1/2 -translate-x-1/2 w-px bg-border/50",
                                          pi === 0 ? "top-1/2 bottom-0" : isLast ? "top-0 h-1/2" : "inset-y-0"
                                        )}
                                      />
                                      <div className="absolute left-1/2 top-1/2 -translate-y-1/2 w-2.5 h-px bg-border/50" />
                                      <div className={cn(
                                        "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[5px] h-[5px] rounded-full border-2 border-background z-10 transition-colors",
                                        PAGE_TYPE_DOT[page.type]
                                      )} />
                                    </div>

                                    {/* Page row */}
                                    <div className="flex-1 flex items-center gap-2 py-1.5 pr-2 pl-2 rounded-lg hover:bg-accent/40 transition-colors min-w-0 my-px">
                                      <div className="w-5 h-5 rounded bg-accent/60 flex items-center justify-center shrink-0">
                                        <FileText className="w-2.5 h-2.5 text-muted-foreground" aria-hidden="true" focusable="false" />
                                      </div>

                                      {isEditingThisPage ? (
                                        <input
                                          ref={pageInputRef}
                                          type="text"
                                          value={page.title}
                                          onChange={(e) => updatePageTitle(section.id, page.id, e.target.value)}
                                          onBlur={() => setEditingPageId(null)}
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === "Escape") setEditingPageId(null);
                                          }}
                                          aria-label="Page title"
                                          autoComplete="off"
                                          className="flex-1 text-[12px] font-medium text-foreground bg-transparent outline-none placeholder:text-muted-foreground border-b border-primary/30 pb-px min-w-0"
                                          placeholder="Untitled page..."
                                          autoFocus
                                        />
                                      ) : (
                                        <span
                                          className="flex-1 text-[12px] font-medium text-foreground truncate min-w-0 cursor-text"
                                          onClick={() => {
                                            setEditingPageId(page.id);
                                            setTimeout(() => pageInputRef.current?.focus(), 30);
                                          }}
                                          role="button"
                                          tabIndex={0}
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                              e.preventDefault();
                                              setEditingPageId(page.id);
                                            }
                                          }}
                                        >
                                          {page.title || <span className="text-muted-foreground">Untitled page...</span>}
                                        </span>
                                      )}

                                      {/* Page actions on hover */}
                                      {!isEditingThisPage && (
                                        <div className="flex items-center gap-0 opacity-0 group-hover/row:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => duplicatePage(section.id, page.id)}
                                            className="w-5 h-5 rounded flex items-center justify-center hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            aria-label={`Duplicate page ${page.title}`}
                                          >
                                            <Copy className="w-2.5 h-2.5 text-muted-foreground" aria-hidden="true" focusable="false" />
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
                                      )}
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Add page (tree-style) */}
                              <div className="relative flex items-center">
                                <div className="relative w-5 flex items-center justify-center shrink-0 self-stretch">
                                  {section.pages.length > 0 && (
                                    <div className="absolute left-1/2 -translate-x-1/2 top-0 h-1/2 w-px bg-border/50" />
                                  )}
                                  <div className={cn(
                                    "absolute left-1/2 top-1/2 -translate-y-1/2 w-2.5 h-px bg-border/50",
                                    section.pages.length > 0 ? "opacity-100" : "opacity-0"
                                  )} />
                                </div>
                                <button
                                  onClick={() => addPage(section.id)}
                                  className="flex items-center gap-1.5 py-1.5 pl-2 pr-3 rounded-lg text-[11px] text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-150"
                                  aria-label={`Add page to ${section.title || "section"}`}
                                >
                                  <Plus className="w-3 h-3" aria-hidden="true" focusable="false" />
                                  <span>Add page</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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
        className="w-full rounded-xl border border-dashed border-border hover:border-primary/30 bg-background hover:bg-primary/[0.02] transition-all p-2.5 flex items-center justify-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Add new section"
      >
        <Plus className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" aria-hidden="true" focusable="false" />
        <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">Add Section</span>
      </button>
    </div>
  );
}
