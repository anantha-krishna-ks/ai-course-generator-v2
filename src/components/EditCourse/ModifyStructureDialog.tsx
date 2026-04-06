import { useState } from "react";
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface LearningOutcome {
  id: string;
  title: string;
}

interface Subtopic {
  id: string;
  title: string;
  learningOutcomes: LearningOutcome[];
  expanded: boolean;
}

interface Topic {
  id: string;
  title: string;
  subtopics: Subtopic[];
  expanded: boolean;
}

interface Section {
  id: string;
  title: string;
  topics: Topic[];
  expanded: boolean;
}

interface Chapter {
  id: string;
  title: string;
  sections: Section[];
  expanded: boolean;
}

interface ModifyStructureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ModifyStructureDialog = ({ open, onOpenChange }: ModifyStructureDialogProps) => {
  const { toast } = useToast();
  const [chapters, setChapters] = useState<Chapter[]>([
    {
      id: "1",
      title: "Understanding Rational Numbers",
      expanded: true,
      sections: [
        {
          id: "1-1",
          title: "Introduction to Rational Numbers",
          expanded: true,
          topics: [
            { 
              id: "1-1-1", 
              title: "Definition and Examples of Rational Numbers",
              expanded: false,
              subtopics: [
                { id: "1-1-1-1", title: "Core Concepts", learningOutcomes: [], expanded: false },
                { id: "1-1-1-2", title: "Real-world Examples", learningOutcomes: [], expanded: false },
              ]
            },
            { 
              id: "1-1-2", 
              title: "Identifying Rational Numbers in Everyday Life",
              expanded: false,
              subtopics: []
            },
          ],
        },
        {
          id: "1-2",
          title: "Representation of Rational Numbers",
          expanded: false,
          topics: [
            { 
              id: "1-2-1", 
              title: "Number Line Representation",
              expanded: false,
              subtopics: []
            },
          ],
        },
      ],
    },
    {
      id: "2",
      title: "Exploring the Decimal System",
      expanded: false,
      sections: [
        {
          id: "2-1",
          title: "Understanding Decimals",
          expanded: false,
          topics: [],
        },
      ],
    },
  ]);

  const [showAddChapterDialog, setShowAddChapterDialog] = useState(false);
  const [showAddSectionDialog, setShowAddSectionDialog] = useState(false);
  const [showAddTopicDialog, setShowAddTopicDialog] = useState(false);
  const [showAddSubtopicDialog, setShowAddSubtopicDialog] = useState(false);
  const [showAddLearningOutcomeDialog, setShowAddLearningOutcomeDialog] = useState(false);
  
  const [showEditChapterDialog, setShowEditChapterDialog] = useState(false);
  const [showEditSectionDialog, setShowEditSectionDialog] = useState(false);
  const [showEditTopicDialog, setShowEditTopicDialog] = useState(false);
  const [showEditSubtopicDialog, setShowEditSubtopicDialog] = useState(false);
  const [showEditLearningOutcomeDialog, setShowEditLearningOutcomeDialog] = useState(false);
  
  const [newTitle, setNewTitle] = useState("");
  const [currentChapterId, setCurrentChapterId] = useState<string | null>(null);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [currentTopicId, setCurrentTopicId] = useState<string | null>(null);
  const [currentSubtopicId, setCurrentSubtopicId] = useState<string | null>(null);
  const [currentLearningOutcomeId, setCurrentLearningOutcomeId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const toggleChapter = (chapterId: string) => {
    setChapters(chapters.map(ch => 
      ch.id === chapterId ? { ...ch, expanded: !ch.expanded } : ch
    ));
  };

  const toggleSection = (chapterId: string, sectionId: string) => {
    setChapters(chapters.map(ch => 
      ch.id === chapterId 
        ? { 
            ...ch, 
            sections: ch.sections.map(sec => 
              sec.id === sectionId ? { ...sec, expanded: !sec.expanded } : sec
            )
          }
        : ch
    ));
  };

  const toggleTopic = (chapterId: string, sectionId: string, topicId: string) => {
    setChapters(chapters.map(ch => 
      ch.id === chapterId 
        ? { 
            ...ch, 
            sections: ch.sections.map(sec => 
              sec.id === sectionId 
                ? {
                    ...sec,
                    topics: sec.topics.map(t =>
                      t.id === topicId ? { ...t, expanded: !t.expanded } : t
                    )
                  }
                : sec
            )
          }
        : ch
    ));
  };

  const toggleSubtopic = (chapterId: string, sectionId: string, topicId: string, subtopicId: string) => {
    setChapters(chapters.map(ch => 
      ch.id === chapterId 
        ? { 
            ...ch, 
            sections: ch.sections.map(sec => 
              sec.id === sectionId 
                ? {
                    ...sec,
                    topics: sec.topics.map(t =>
                      t.id === topicId 
                        ? {
                            ...t,
                            subtopics: t.subtopics.map(st =>
                              st.id === subtopicId ? { ...st, expanded: !st.expanded } : st
                            )
                          }
                        : t
                    )
                  }
                : sec
            )
          }
        : ch
    ));
  };

  const handleAddChapter = () => {
    if (!newTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a chapter title",
        variant: "destructive",
      });
      return;
    }

    const newChapter: Chapter = {
      id: `chapter-${Date.now()}`,
      title: newTitle,
      sections: [],
      expanded: true,
    };

    setChapters([...chapters, newChapter]);
    setNewTitle("");
    setShowAddChapterDialog(false);
    toast({
      title: "Chapter Added",
      description: "New chapter has been added successfully",
    });
  };

  const handleAddSection = () => {
    if (!newTitle.trim() || !currentChapterId) {
      toast({
        title: "Error",
        description: "Please enter a section title",
        variant: "destructive",
      });
      return;
    }

    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: newTitle,
      topics: [],
      expanded: true,
    };

    setChapters(chapters.map(ch => 
      ch.id === currentChapterId 
        ? { ...ch, sections: [...ch.sections, newSection] }
        : ch
    ));

    setNewTitle("");
    setCurrentChapterId(null);
    setShowAddSectionDialog(false);
    toast({
      title: "Section Added",
      description: "New section has been added successfully",
    });
  };

  const handleAddTopic = () => {
    if (!newTitle.trim() || !currentChapterId || !currentSectionId) {
      toast({
        title: "Error",
        description: "Please enter a topic title",
        variant: "destructive",
      });
      return;
    }

    const newTopic: Topic = {
      id: `topic-${Date.now()}`,
      title: newTitle,
      subtopics: [],
      expanded: true,
    };

    setChapters(chapters.map(ch => 
      ch.id === currentChapterId 
        ? {
            ...ch,
            sections: ch.sections.map(sec =>
              sec.id === currentSectionId
                ? { ...sec, topics: [...sec.topics, newTopic] }
                : sec
            )
          }
        : ch
    ));

    setNewTitle("");
    setCurrentChapterId(null);
    setCurrentSectionId(null);
    setShowAddTopicDialog(false);
    toast({
      title: "Topic Added",
      description: "New topic has been added successfully",
    });
  };

  const handleAddSubtopic = () => {
    if (!newTitle.trim() || !currentChapterId || !currentSectionId || !currentTopicId) {
      toast({
        title: "Error",
        description: "Please enter a subtopic title",
        variant: "destructive",
      });
      return;
    }

    const newSubtopic: Subtopic = {
      id: `subtopic-${Date.now()}`,
      title: newTitle,
      learningOutcomes: [],
      expanded: false,
    };

    setChapters(chapters.map(ch => 
      ch.id === currentChapterId 
        ? {
            ...ch,
            sections: ch.sections.map(sec =>
              sec.id === currentSectionId
                ? {
                    ...sec,
                    topics: sec.topics.map(t =>
                      t.id === currentTopicId
                        ? { ...t, subtopics: [...t.subtopics, newSubtopic] }
                        : t
                    )
                  }
                : sec
            )
          }
        : ch
    ));

    setNewTitle("");
    setCurrentChapterId(null);
    setCurrentSectionId(null);
    setCurrentTopicId(null);
    setShowAddSubtopicDialog(false);
    toast({
      title: "Subtopic Added",
      description: "New subtopic has been added successfully",
    });
  };

  const handleAddLearningOutcome = () => {
    if (!newTitle.trim() || !currentChapterId || !currentSectionId || !currentTopicId || !currentSubtopicId) {
      toast({
        title: "Error",
        description: "Please enter a learning outcome",
        variant: "destructive",
      });
      return;
    }

    const newLearningOutcome: LearningOutcome = {
      id: `outcome-${Date.now()}`,
      title: newTitle,
    };

    setChapters(chapters.map(ch => 
      ch.id === currentChapterId 
        ? {
            ...ch,
            sections: ch.sections.map(sec =>
              sec.id === currentSectionId
                ? {
                    ...sec,
                    topics: sec.topics.map(t =>
                      t.id === currentTopicId
                        ? {
                            ...t,
                            subtopics: t.subtopics.map(st =>
                              st.id === currentSubtopicId
                                ? { ...st, learningOutcomes: [...st.learningOutcomes, newLearningOutcome] }
                                : st
                            )
                          }
                        : t
                    )
                  }
                : sec
            )
          }
        : ch
    ));

    setNewTitle("");
    setCurrentChapterId(null);
    setCurrentSectionId(null);
    setCurrentTopicId(null);
    setCurrentSubtopicId(null);
    setShowAddLearningOutcomeDialog(false);
    toast({
      title: "Learning Outcome Added",
      description: "New learning outcome has been added successfully",
    });
  };

  // Edit handlers
  const handleEditChapter = () => {
    if (!editingTitle.trim() || !currentChapterId) return;

    setChapters(chapters.map(ch => 
      ch.id === currentChapterId 
        ? { ...ch, title: editingTitle }
        : ch
    ));

    setEditingTitle("");
    setCurrentChapterId(null);
    setShowEditChapterDialog(false);
    toast({
      title: "Chapter Updated",
      description: "Chapter has been updated successfully",
    });
  };

  const handleEditSection = () => {
    if (!editingTitle.trim() || !currentChapterId || !currentSectionId) return;

    setChapters(chapters.map(ch => 
      ch.id === currentChapterId 
        ? {
            ...ch,
            sections: ch.sections.map(sec =>
              sec.id === currentSectionId
                ? { ...sec, title: editingTitle }
                : sec
            )
          }
        : ch
    ));

    setEditingTitle("");
    setCurrentChapterId(null);
    setCurrentSectionId(null);
    setShowEditSectionDialog(false);
    toast({
      title: "Section Updated",
      description: "Section has been updated successfully",
    });
  };

  const handleEditTopic = () => {
    if (!editingTitle.trim() || !currentChapterId || !currentSectionId || !currentTopicId) return;

    setChapters(chapters.map(ch => 
      ch.id === currentChapterId 
        ? {
            ...ch,
            sections: ch.sections.map(sec =>
              sec.id === currentSectionId
                ? {
                    ...sec,
                    topics: sec.topics.map(t =>
                      t.id === currentTopicId
                        ? { ...t, title: editingTitle }
                        : t
                    )
                  }
                : sec
            )
          }
        : ch
    ));

    setEditingTitle("");
    setCurrentChapterId(null);
    setCurrentSectionId(null);
    setCurrentTopicId(null);
    setShowEditTopicDialog(false);
    toast({
      title: "Topic Updated",
      description: "Topic has been updated successfully",
    });
  };

  const handleEditSubtopic = () => {
    if (!editingTitle.trim() || !currentChapterId || !currentSectionId || !currentTopicId || !currentSubtopicId) return;

    setChapters(chapters.map(ch => 
      ch.id === currentChapterId 
        ? {
            ...ch,
            sections: ch.sections.map(sec =>
              sec.id === currentSectionId
                ? {
                    ...sec,
                    topics: sec.topics.map(t =>
                      t.id === currentTopicId
                        ? {
                            ...t,
                            subtopics: t.subtopics.map(st =>
                              st.id === currentSubtopicId
                                ? { ...st, title: editingTitle }
                                : st
                            )
                          }
                        : t
                    )
                  }
                : sec
            )
          }
        : ch
    ));

    setEditingTitle("");
    setCurrentChapterId(null);
    setCurrentSectionId(null);
    setCurrentTopicId(null);
    setCurrentSubtopicId(null);
    setShowEditSubtopicDialog(false);
    toast({
      title: "Subtopic Updated",
      description: "Subtopic has been updated successfully",
    });
  };

  const handleEditLearningOutcome = () => {
    if (!editingTitle.trim() || !currentChapterId || !currentSectionId || !currentTopicId || !currentSubtopicId || !currentLearningOutcomeId) return;

    setChapters(chapters.map(ch => 
      ch.id === currentChapterId 
        ? {
            ...ch,
            sections: ch.sections.map(sec =>
              sec.id === currentSectionId
                ? {
                    ...sec,
                    topics: sec.topics.map(t =>
                      t.id === currentTopicId
                        ? {
                            ...t,
                            subtopics: t.subtopics.map(st =>
                              st.id === currentSubtopicId
                                ? {
                                    ...st,
                                    learningOutcomes: st.learningOutcomes.map(lo =>
                                      lo.id === currentLearningOutcomeId
                                        ? { ...lo, title: editingTitle }
                                        : lo
                                    )
                                  }
                                : st
                            )
                          }
                        : t
                    )
                  }
                : sec
            )
          }
        : ch
    ));

    setEditingTitle("");
    setCurrentChapterId(null);
    setCurrentSectionId(null);
    setCurrentTopicId(null);
    setCurrentSubtopicId(null);
    setCurrentLearningOutcomeId(null);
    setShowEditLearningOutcomeDialog(false);
    toast({
      title: "Learning Outcome Updated",
      description: "Learning outcome has been updated successfully",
    });
  };

  // Delete handlers
  const handleDeleteChapter = (chapterId: string) => {
    setChapters(chapters.filter(ch => ch.id !== chapterId));
    toast({
      title: "Chapter Deleted",
      description: "Chapter has been removed successfully",
    });
  };

  const handleDeleteSection = (chapterId: string, sectionId: string) => {
    setChapters(chapters.map(ch => 
      ch.id === chapterId 
        ? {
            ...ch,
            sections: ch.sections.filter(sec => sec.id !== sectionId)
          }
        : ch
    ));
    toast({
      title: "Section Deleted",
      description: "Section has been removed successfully",
    });
  };

  const handleDeleteTopic = (chapterId: string, sectionId: string, topicId: string) => {
    setChapters(chapters.map(ch => 
      ch.id === chapterId 
        ? {
            ...ch,
            sections: ch.sections.map(sec =>
              sec.id === sectionId
                ? {
                    ...sec,
                    topics: sec.topics.filter(t => t.id !== topicId)
                  }
                : sec
            )
          }
        : ch
    ));
    toast({
      title: "Topic Deleted",
      description: "Topic has been removed successfully",
    });
  };

  const handleDeleteSubtopic = (chapterId: string, sectionId: string, topicId: string, subtopicId: string) => {
    setChapters(chapters.map(ch => 
      ch.id === chapterId 
        ? {
            ...ch,
            sections: ch.sections.map(sec =>
              sec.id === sectionId
                ? {
                    ...sec,
                    topics: sec.topics.map(t =>
                      t.id === topicId
                        ? {
                            ...t,
                            subtopics: t.subtopics.filter(st => st.id !== subtopicId)
                          }
                        : t
                    )
                  }
                : sec
            )
          }
        : ch
    ));
    toast({
      title: "Subtopic Deleted",
      description: "Subtopic has been removed successfully",
    });
  };

  const handleDeleteLearningOutcome = (chapterId: string, sectionId: string, topicId: string, subtopicId: string, outcomeId: string) => {
    setChapters(chapters.map(ch => 
      ch.id === chapterId 
        ? {
            ...ch,
            sections: ch.sections.map(sec =>
              sec.id === sectionId
                ? {
                    ...sec,
                    topics: sec.topics.map(t =>
                      t.id === topicId
                        ? {
                            ...t,
                            subtopics: t.subtopics.map(st =>
                              st.id === subtopicId
                                ? {
                                    ...st,
                                    learningOutcomes: st.learningOutcomes.filter(lo => lo.id !== outcomeId)
                                  }
                                : st
                            )
                          }
                        : t
                    )
                  }
                : sec
            )
          }
        : ch
    ));
    toast({
      title: "Learning Outcome Deleted",
      description: "Learning outcome has been removed successfully",
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Modify Course Structure
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">Define the hierarchical structure of your course</p>
              <Button 
                onClick={() => setShowAddChapterDialog(true)}
                size="sm"
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Chapter
              </Button>
            </div>

            <div className="space-y-4">
              {chapters.length === 0 ? (
                <Card className="p-12 text-center border-2 border-dashed">
                  <p className="text-muted-foreground text-lg mb-4">No chapters added yet</p>
                  <Button onClick={() => setShowAddChapterDialog(true)} variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Your First Chapter
                  </Button>
                </Card>
              ) : (
                chapters.map((chapter, chapterIndex) => (
                  <Card key={chapter.id} className="overflow-hidden border-2">
                    {/* Chapter Header */}
                    <div className="p-4 bg-primary/5 border-b flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={() => toggleChapter(chapter.id)}
                          className="p-1 hover:bg-primary/10 rounded transition-colors"
                        >
                          {chapter.expanded ? (
                            <ChevronDown className="w-5 h-5 text-foreground" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-foreground" />
                          )}
                        </button>
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                          {chapterIndex + 1}
                        </div>
                        <h3 className="font-semibold text-lg">{chapter.title}</h3>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => {
                            setCurrentChapterId(chapter.id);
                            setEditingTitle(chapter.title);
                            setShowEditChapterDialog(true);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteChapter(chapter.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Chapter Content */}
                    {chapter.expanded && (
                      <div className="p-4 bg-muted/30 space-y-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-medium text-foreground">Sections</p>
                          <Button
                            size="sm"
                            onClick={() => {
                              setCurrentChapterId(chapter.id);
                              setShowAddSectionDialog(true);
                            }}
                            className="gap-2 h-8"
                          >
                            <Plus className="w-3 h-3" />
                            Add Section
                          </Button>
                        </div>

                        {chapter.sections.length === 0 ? (
                          <div className="text-center py-6 border-2 border-dashed rounded-lg">
                            <p className="text-sm text-muted-foreground mb-2">No sections yet</p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setCurrentChapterId(chapter.id);
                                setShowAddSectionDialog(true);
                              }}
                              className="gap-2"
                            >
                              <Plus className="w-3 h-3" />
                              Add First Section
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {chapter.sections.map((section, sectionIndex) => (
                              <Card key={section.id} className="border-l-4 border-l-blue-500">
                                {/* Section Header */}
                                <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 flex items-center justify-between">
                                  <div className="flex items-center gap-2 flex-1">
                                    <button
                                      onClick={() => toggleSection(chapter.id, section.id)}
                                      className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
                                    >
                                      {section.expanded ? (
                                        <ChevronDown className="w-4 h-4 text-foreground" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 text-foreground" />
                                      )}
                                    </button>
                                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                                      {sectionIndex + 1}
                                    </div>
                                    <span className="font-medium text-sm">{section.title}</span>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7"
                                      onClick={() => {
                                        setCurrentChapterId(chapter.id);
                                        setCurrentSectionId(section.id);
                                        setEditingTitle(section.title);
                                        setShowEditSectionDialog(true);
                                      }}
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                      onClick={() => handleDeleteSection(chapter.id, section.id)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Section Content */}
                                {section.expanded && (
                                  <div className="p-3 bg-teal-50/30 dark:bg-teal-950/10 space-y-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="text-xs font-medium text-foreground">Topics</p>
                                      <Button
                                        size="sm"
                                        onClick={() => {
                                          setCurrentChapterId(chapter.id);
                                          setCurrentSectionId(section.id);
                                          setShowAddTopicDialog(true);
                                        }}
                                        className="gap-2 h-7 text-xs"
                                      >
                                        <Plus className="w-3 h-3" />
                                        Add Topic
                                      </Button>
                                    </div>

                                    {section.topics.length === 0 ? (
                                      <div className="text-center py-4 border-2 border-dashed rounded-lg">
                                        <p className="text-xs text-muted-foreground mb-2">No topics yet</p>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            setCurrentChapterId(chapter.id);
                                            setCurrentSectionId(section.id);
                                            setShowAddTopicDialog(true);
                                          }}
                                          className="gap-2 h-7 text-xs"
                                        >
                                          <Plus className="w-3 h-3" />
                                          Add First Topic
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        {section.topics.map((topic, topicIndex) => (
                                          <Card key={topic.id} className="border-l-4 border-l-teal-500">
                                            {/* Topic Header */}
                                            <div className="p-2.5 bg-teal-50/50 dark:bg-teal-950/20 flex items-center justify-between">
                                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <button
                                                  onClick={() => toggleTopic(chapter.id, section.id, topic.id)}
                                                  className="p-0.5 hover:bg-teal-100 dark:hover:bg-teal-900 rounded transition-colors flex-shrink-0"
                                                >
                                                  {topic.expanded ? (
                                                    <ChevronDown className="w-3.5 h-3.5 text-foreground" />
                                                  ) : (
                                                    <ChevronRight className="w-3.5 h-3.5 text-foreground" />
                                                  )}
                                                </button>
                                                <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                                                  {topicIndex + 1}
                                                </div>
                                                <span className="text-xs font-medium truncate">{topic.title}</span>
                                              </div>
                                              <div className="flex gap-1 flex-shrink-0">
                                                <Button
                                                  size="icon"
                                                  variant="ghost"
                                                  className="h-6 w-6"
                                                  onClick={() => {
                                                    setCurrentChapterId(chapter.id);
                                                    setCurrentSectionId(section.id);
                                                    setCurrentTopicId(topic.id);
                                                    setEditingTitle(topic.title);
                                                    setShowEditTopicDialog(true);
                                                  }}
                                                >
                                                  <Edit2 className="w-2.5 h-2.5" />
                                                </Button>
                                                <Button
                                                  size="icon"
                                                  variant="ghost"
                                                  className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                  onClick={() => handleDeleteTopic(chapter.id, section.id, topic.id)}
                                                >
                                                  <Trash2 className="w-2.5 h-2.5" />
                                                </Button>
                                              </div>
                                            </div>

                                            {/* Topic Content (Subtopics) */}
                                            {topic.expanded && (
                                              <div className="p-2.5 bg-purple-50/30 dark:bg-purple-950/10 space-y-2">
                                                <div className="flex items-center justify-between mb-2">
                                                  <p className="text-xs font-medium text-foreground">Subtopics</p>
                                                  <Button
                                                    size="sm"
                                                    onClick={() => {
                                                      setCurrentChapterId(chapter.id);
                                                      setCurrentSectionId(section.id);
                                                      setCurrentTopicId(topic.id);
                                                      setShowAddSubtopicDialog(true);
                                                    }}
                                                    className="gap-1 h-6 text-xs px-2"
                                                  >
                                                    <Plus className="w-2.5 h-2.5" />
                                                    Add Subtopic
                                                  </Button>
                                                </div>

                                                {topic.subtopics.length === 0 ? (
                                                  <div className="text-center py-3 border border-dashed rounded">
                                                    <p className="text-xs text-muted-foreground mb-1">No subtopics yet</p>
                                                    <Button
                                                      size="sm"
                                                      variant="outline"
                                                      onClick={() => {
                                                        setCurrentChapterId(chapter.id);
                                                        setCurrentSectionId(section.id);
                                                        setCurrentTopicId(topic.id);
                                                        setShowAddSubtopicDialog(true);
                                                      }}
                                                      className="gap-1 h-6 text-xs px-2"
                                                    >
                                                      <Plus className="w-2.5 h-2.5" />
                                                      Add Subtopic
                                                    </Button>
                                                  </div>
                                                ) : (
                                                  <div className="space-y-1.5">
                                                    {topic.subtopics.map((subtopic, subtopicIndex) => (
                                                       <div
                                                        key={subtopic.id}
                                                        className="flex flex-col gap-1.5"
                                                      >
                                                        <div className="flex items-center gap-2 p-2 rounded bg-purple-100/50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800">
                                                          <button
                                                            onClick={() => toggleSubtopic(chapter.id, section.id, topic.id, subtopic.id)}
                                                            className="p-0.5 hover:bg-purple-200 dark:hover:bg-purple-800 rounded transition-colors flex-shrink-0"
                                                          >
                                                            {subtopic.expanded ? (
                                                              <ChevronDown className="w-3 h-3 text-foreground" />
                                                            ) : (
                                                              <ChevronRight className="w-3 h-3 text-foreground" />
                                                            )}
                                                          </button>
                                                          <div className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                                                            {subtopicIndex + 1}
                                                          </div>
                                                          <span className="text-xs flex-1">{subtopic.title}</span>
                                                          <div className="flex gap-0.5">
                                                            <Button
                                                              size="icon"
                                                              variant="ghost"
                                                              className="h-5 w-5"
                                                              onClick={() => {
                                                                setCurrentChapterId(chapter.id);
                                                                setCurrentSectionId(section.id);
                                                                setCurrentTopicId(topic.id);
                                                                setCurrentSubtopicId(subtopic.id);
                                                                setEditingTitle(subtopic.title);
                                                                setShowEditSubtopicDialog(true);
                                                              }}
                                                            >
                                                              <Edit2 className="w-2 h-2" />
                                                            </Button>
                                                            <Button
                                                              size="icon"
                                                              variant="ghost"
                                                              className="h-5 w-5 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                              onClick={() => handleDeleteSubtopic(chapter.id, section.id, topic.id, subtopic.id)}
                                                            >
                                                              <Trash2 className="w-2 h-2" />
                                                            </Button>
                                                          </div>
                                                        </div>
                                                        
                                                         {/* Learning Outcomes */}
                                                         {subtopic.expanded && (
                                                           <div className="mt-3 ml-8 pl-6 border-l-2 border-amber-300 dark:border-amber-700 space-y-3">
                                                             <div className="flex items-center justify-between mb-2">
                                                               <p className="text-sm font-semibold text-foreground">Learning Outcomes</p>
                                                               <Button
                                                                 size="sm"
                                                                 onClick={() => {
                                                                   setCurrentChapterId(chapter.id);
                                                                   setCurrentSectionId(section.id);
                                                                   setCurrentTopicId(topic.id);
                                                                   setCurrentSubtopicId(subtopic.id);
                                                                   setShowAddLearningOutcomeDialog(true);
                                                                 }}
                                                                 className="gap-1 h-7 text-xs px-3"
                                                               >
                                                                 <Plus className="w-3 h-3" />
                                                                 Add Outcome
                                                               </Button>
                                                             </div>
                                                             {subtopic.learningOutcomes.length === 0 ? (
                                                               <div className="text-center py-6 border-2 border-dashed rounded-lg bg-muted/30">
                                                                 <p className="text-sm text-muted-foreground mb-2">No learning outcomes yet</p>
                                                                 <Button
                                                                   size="sm"
                                                                   variant="outline"
                                                                   onClick={() => {
                                                                     setCurrentChapterId(chapter.id);
                                                                     setCurrentSectionId(section.id);
                                                                     setCurrentTopicId(topic.id);
                                                                     setCurrentSubtopicId(subtopic.id);
                                                                     setShowAddLearningOutcomeDialog(true);
                                                                   }}
                                                                   className="gap-1 h-7 text-xs"
                                                                 >
                                                                   <Plus className="w-3 h-3" />
                                                                   Add First Outcome
                                                                 </Button>
                                                               </div>
                                                             ) : (
                                                               <div className="space-y-2">
                                                                 {subtopic.learningOutcomes.map((outcome, outcomeIndex) => (
                                                                   <div
                                                                     key={outcome.id}
                                                                     className="flex items-start gap-3 p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 hover:shadow-sm transition-shadow"
                                                                   >
                                                                     <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                                                                       {outcomeIndex + 1}
                                                                     </div>
                                                                     <span className="text-sm flex-1 leading-relaxed">{outcome.title}</span>
                                                                     <div className="flex gap-1 flex-shrink-0">
                                                                       <Button
                                                                         size="icon"
                                                                         variant="ghost"
                                                                         className="h-6 w-6"
                                                                         onClick={() => {
                                                                           setCurrentChapterId(chapter.id);
                                                                           setCurrentSectionId(section.id);
                                                                           setCurrentTopicId(topic.id);
                                                                           setCurrentSubtopicId(subtopic.id);
                                                                           setCurrentLearningOutcomeId(outcome.id);
                                                                           setEditingTitle(outcome.title);
                                                                           setShowEditLearningOutcomeDialog(true);
                                                                         }}
                                                                       >
                                                                         <Edit2 className="w-3 h-3" />
                                                                       </Button>
                                                                       <Button
                                                                         size="icon"
                                                                         variant="ghost"
                                                                         className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                         onClick={() => handleDeleteLearningOutcome(chapter.id, section.id, topic.id, subtopic.id, outcome.id)}
                                                                       >
                                                                         <Trash2 className="w-3 h-3" />
                                                                       </Button>
                                                                     </div>
                                                                   </div>
                                                                 ))}
                                                               </div>
                                                             )}
                                                           </div>
                                                         )}
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </Card>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>

          <DialogFooter className="pt-2 border-t">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => {
              toast({
                title: "Changes Saved",
                description: "Course structure has been updated successfully",
              });
              onOpenChange(false);
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Chapter Dialog */}
      <Dialog open={showAddChapterDialog} onOpenChange={setShowAddChapterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Chapter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="chapter-title">Chapter Title</Label>
              <Input
                id="chapter-title"
                placeholder="Enter chapter title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddChapter()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddChapterDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddChapter}>Add Chapter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Section Dialog */}
      <Dialog open={showAddSectionDialog} onOpenChange={setShowAddSectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="section-title">Section Title</Label>
              <Input
                id="section-title"
                placeholder="Enter section title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSectionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSection}>Add Section</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Topic Dialog */}
      <Dialog open={showAddTopicDialog} onOpenChange={setShowAddTopicDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Topic</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="topic-title">Topic Title</Label>
              <Input
                id="topic-title"
                placeholder="Enter topic title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTopicDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTopic}>Add Topic</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Subtopic Dialog */}
      <Dialog open={showAddSubtopicDialog} onOpenChange={setShowAddSubtopicDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Subtopic</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subtopic-title">Subtopic Title</Label>
              <Input
                id="subtopic-title"
                placeholder="Enter subtopic title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSubtopicDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSubtopic}>Add Subtopic</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Learning Outcome Dialog */}
      <Dialog open={showAddLearningOutcomeDialog} onOpenChange={setShowAddLearningOutcomeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Learning Outcome</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="outcome-title">Learning Outcome</Label>
              <Input
                id="outcome-title"
                placeholder="Enter learning outcome"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddLearningOutcome()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddLearningOutcomeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLearningOutcome}>Add Learning Outcome</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Chapter Dialog */}
      <Dialog open={showEditChapterDialog} onOpenChange={setShowEditChapterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Chapter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-chapter-title">Chapter Title</Label>
              <Input
                id="edit-chapter-title"
                placeholder="Enter chapter title"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEditChapter()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditChapterDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditChapter}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Section Dialog */}
      <Dialog open={showEditSectionDialog} onOpenChange={setShowEditSectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-section-title">Section Title</Label>
              <Input
                id="edit-section-title"
                placeholder="Enter section title"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEditSection()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditSectionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSection}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Topic Dialog */}
      <Dialog open={showEditTopicDialog} onOpenChange={setShowEditTopicDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Topic</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-topic-title">Topic Title</Label>
              <Input
                id="edit-topic-title"
                placeholder="Enter topic title"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEditTopic()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditTopicDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTopic}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subtopic Dialog */}
      <Dialog open={showEditSubtopicDialog} onOpenChange={setShowEditSubtopicDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subtopic</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-subtopic-title">Subtopic Title</Label>
              <Input
                id="edit-subtopic-title"
                placeholder="Enter subtopic title"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEditSubtopic()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditSubtopicDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubtopic}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Learning Outcome Dialog */}
      <Dialog open={showEditLearningOutcomeDialog} onOpenChange={setShowEditLearningOutcomeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Learning Outcome</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-outcome-title">Learning Outcome</Label>
              <Input
                id="edit-outcome-title"
                placeholder="Enter learning outcome"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEditLearningOutcome()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditLearningOutcomeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditLearningOutcome}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
