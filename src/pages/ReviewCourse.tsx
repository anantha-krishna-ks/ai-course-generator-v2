import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ShieldCheck,
  MessageSquarePlus,
  Send,
  CheckCircle2,
  Circle,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  HelpCircle,
  X,
  Trash2,
} from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { sanitizeHtml } from "@/lib/sanitize";
import { cn } from "@/lib/utils";
import { mockCourseData, buildMockRestoreState } from "@/data/mockCourseData";
import {
  addComment,
  addReply,
  deleteComment,
  getCommentsForBlock,
  subscribe,
  toggleResolved,
  type ReviewComment,
} from "@/services/reviewCommentsStore";

type BlockRow = {
  id: string;
  type: string;
  content: string;
  sectionTitle: string;
  pageTitle: string;
  index: number;
};

const REVIEWER_NAME = "Priya Iyer";

function BlockIcon({ type }: { type: string }) {
  const cls = "w-4 h-4 text-primary";
  if (type === "image") return <ImageIcon className={cls} aria-hidden="true" />;
  if (type === "video") return <Video className={cls} aria-hidden="true" />;
  if (type === "audio") return <Music className={cls} aria-hidden="true" />;
  if (type === "quiz") return <HelpCircle className={cls} aria-hidden="true" />;
  return <FileText className={cls} aria-hidden="true" />;
}

function BlockPreview({ type, content }: { type: string; content: string }) {
  if (type === "image") {
    return (
      <img
        src={content}
        alt=""
        role="presentation"
        loading="lazy"
        className="w-full max-h-[420px] object-cover rounded-xl border border-border"
      />
    );
  }
  if (type === "video") {
    return (
      <video controls className="w-full max-h-[420px] rounded-xl border border-border bg-black">
        <source src={content} />
      </video>
    );
  }
  if (type === "audio") {
    return <audio controls src={content} className="w-full" />;
  }
  if (type === "doc") {
    return (
      <a
        href={content}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-muted/40 hover:bg-muted text-sm font-medium text-foreground"
      >
        <FileText className="w-4 h-4 text-primary" aria-hidden="true" />
        Open document
      </a>
    );
  }
  if (type === "quiz") {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        Quiz block — interactive in learner preview.
      </div>
    );
  }
  // text / description
  return (
    <div
      className="prose prose-sm max-w-none text-foreground [&_*]:break-words"
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
    />
  );
}

function CommentThread({
  comment,
  onReply,
  onToggle,
  onDelete,
}: {
  comment: ReviewComment;
  onReply: (text: string) => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [reply, setReply] = useState("");
  const submit = () => {
    const t = reply.trim();
    if (!t) return;
    onReply(t);
    setReply("");
  };
  return (
    <div
      className={cn(
        "rounded-xl border p-3 space-y-2",
        comment.resolved ? "bg-emerald-50/50 border-emerald-200" : "bg-card border-border",
      )}
    >
      <div className="flex items-start gap-2">
        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
          {comment.author.slice(0, 1)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground">{comment.author}</span>
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 rounded-full">Reviewer</Badge>
            {comment.resolved && (
              <Badge className="text-[10px] h-4 px-1.5 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Resolved</Badge>
            )}
          </div>
          <p className="text-sm text-foreground mt-1 whitespace-pre-wrap break-words">{comment.text}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{new Date(comment.createdAt).toLocaleString()}</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-label={comment.resolved ? "Reopen comment" : "Mark resolved"}
          className="text-muted-foreground hover:text-emerald-600"
        >
          {comment.resolved ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete comment"
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {comment.replies.length > 0 && (
        <ul className="pl-9 space-y-2 border-l-2 border-border ml-3">
          {comment.replies.map((r) => (
            <li key={r.id} className="flex items-start gap-2">
              <div className={cn(
                "w-6 h-6 rounded-full text-[10px] font-semibold flex items-center justify-center shrink-0",
                r.authorRole === "author" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary",
              )}>
                {r.author.slice(0, 1)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-foreground">{r.author}</span>
                  <Badge variant="outline" className="text-[10px] h-4 px-1.5 rounded-full capitalize">{r.authorRole}</Badge>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap break-words">{r.text}</p>
                <p className="text-[11px] text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!comment.resolved && (
        <div className="pl-9 flex items-end gap-2">
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Write a reply…"
            rows={1}
            className="min-h-[36px] text-sm rounded-xl resize-none"
          />
          <Button size="sm" onClick={submit} disabled={!reply.trim()} className="rounded-full h-9">
            <Send className="w-3.5 h-3.5" aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
}

const ReviewCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const course = courseId ? mockCourseData[courseId] : null;
  const state = useMemo(() => (course ? buildMockRestoreState(course.title) : null), [course]);

  const blocks: BlockRow[] = useMemo(() => {
    if (!state) return [];
    const rows: BlockRow[] = [];
    let idx = 0;
    for (const sec of state.items) {
      if (sec.type !== "section") continue;
      for (const child of sec.children ?? []) {
        const pageBlocks = state.pageBlocksMap[child.id] ?? [];
        for (const b of pageBlocks) {
          rows.push({
            id: b.id,
            type: b.type,
            content: b.content,
            sectionTitle: sec.title,
            pageTitle: child.title,
            index: ++idx,
          });
        }
      }
    }
    return rows;
  }, [state]);

  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [, setTick] = useState(0);

  useEffect(() => {
    document.title = course ? `Review · ${course.title}` : "Review Course";
  }, [course]);

  useEffect(() => {
    const unsub = subscribe(() => setTick((t) => t + 1));
    return () => { unsub(); };
  }, []);

  if (!course || !state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Course not found.</p>
          <Button onClick={() => navigate("/dashboard")} className="rounded-full">Back to dashboard</Button>
        </div>
      </div>
    );
  }

  const activeBlock = blocks.find((b) => b.id === activeBlockId) ?? null;
  const activeComments = activeBlock ? getCommentsForBlock(courseId!, activeBlock.id) : [];

  const submitComment = () => {
    if (!activeBlock || !draft.trim()) return;
    const label = `${activeBlock.sectionTitle} · ${activeBlock.pageTitle} · ${activeBlock.type}`;
    addComment({
      courseId: courseId!,
      courseTitle: course.title,
      blockId: activeBlock.id,
      blockLabel: label,
      author: REVIEWER_NAME,
      text: draft.trim(),
    });
    setDraft("");
    toast({ title: "Comment posted", description: "The author will be notified." });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showTokens={false} />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="rounded-full"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Back</span>
            </Button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">{course.title}</h1>
              <p className="text-xs text-muted-foreground">Review mode · view-only · comment on any block</p>
            </div>
          </div>
          <Badge className="rounded-full px-3 py-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            Reviewer
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          {/* Content column */}
          <div className="space-y-8">
            {state.items.filter((s) => s.type === "section").map((sec, sIdx) => (
              <motion.section
                key={sec.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: sIdx * 0.04 }}
                className="rounded-2xl border border-border bg-card overflow-hidden"
              >
                <header className="px-5 py-4 border-b border-border bg-muted/30">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Section {sIdx + 1}</p>
                  <h2 className="text-lg font-bold text-foreground">{sec.title}</h2>
                  {state.sectionObjectivesMap[sec.id] && (
                    <p className="text-sm text-muted-foreground mt-1">{state.sectionObjectivesMap[sec.id]}</p>
                  )}
                </header>

                <div className="divide-y divide-border">
                  {(sec.children ?? []).map((page) => {
                    const pageBlocks = state.pageBlocksMap[page.id] ?? [];
                    return (
                      <div key={page.id} className="p-5 space-y-4">
                        <h3 className="text-sm font-semibold text-foreground/80">{page.title}</h3>
                        {pageBlocks.length === 0 && (
                          <p className="text-xs text-muted-foreground italic">No content blocks.</p>
                        )}
                        {pageBlocks.map((b) => {
                          const count = getCommentsForBlock(courseId!, b.id).length;
                          const isActive = activeBlockId === b.id;
                          return (
                            <div
                              key={b.id}
                              className={cn(
                                "group relative rounded-xl border bg-background p-4 transition-all",
                                isActive
                                  ? "border-primary ring-2 ring-primary/20 shadow-sm"
                                  : "border-border hover:border-primary/40",
                              )}
                            >
                              <div className="flex items-center justify-between mb-3 gap-2">
                                <div className="inline-flex items-center gap-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                  <BlockIcon type={b.type} />
                                  <span>{b.type}</span>
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={isActive ? "default" : "outline"}
                                  onClick={() => setActiveBlockId(isActive ? null : b.id)}
                                  className="rounded-full h-8 text-xs"
                                  aria-label={`Comment on ${b.type} block`}
                                >
                                  <MessageSquarePlus className="w-3.5 h-3.5" aria-hidden="true" />
                                  {count > 0 ? `${count} comment${count > 1 ? "s" : ""}` : "Comment"}
                                </Button>
                              </div>
                              <BlockPreview type={b.type} content={b.content} />
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </motion.section>
            ))}
          </div>

          {/* Comments rail */}
          <aside className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
            <div className="rounded-2xl border border-border bg-card h-full flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Review comments</h3>
                  <p className="text-[11px] text-muted-foreground">
                    {activeBlock
                      ? `${activeBlock.sectionTitle} · ${activeBlock.pageTitle}`
                      : "Select a block to comment"}
                  </p>
                </div>
                {activeBlock && (
                  <button
                    type="button"
                    onClick={() => setActiveBlockId(null)}
                    aria-label="Clear selection"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {!activeBlock ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-10">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <MessageSquarePlus className="w-5 h-5 text-primary" aria-hidden="true" />
                  </div>
                  <p className="text-sm text-foreground font-medium">Pick a block</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                    Click the Comment button on any block to start a thread. The author will be notified.
                  </p>
                </div>
              ) : (
                <>
                  <ScrollArea className="flex-1 px-4 py-3">
                    <div className="space-y-3">
                      {activeComments.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-6">
                          No comments yet on this block.
                        </p>
                      )}
                      {activeComments.map((c) => (
                        <CommentThread
                          key={c.id}
                          comment={c}
                          onReply={(t) =>
                            addReply({
                              commentId: c.id,
                              courseTitle: course.title,
                              author: REVIEWER_NAME,
                              authorRole: "reviewer",
                              text: t,
                            })
                          }
                          onToggle={() => toggleResolved(c.id)}
                          onDelete={() => deleteComment(c.id)}
                        />
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="border-t border-border p-3 space-y-2">
                    <Textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Add a comment for the author…"
                      rows={3}
                      className="text-sm rounded-xl resize-none"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={submitComment}
                        disabled={!draft.trim()}
                        className="rounded-full"
                        size="sm"
                      >
                        <Send className="w-3.5 h-3.5" aria-hidden="true" />
                        Post comment
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ReviewCourse;
