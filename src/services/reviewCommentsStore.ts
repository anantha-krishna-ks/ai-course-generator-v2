// Lightweight mock store for per-block review comments + reply threads.
// Persists in localStorage; pushes notifications into collaboratorsStore feed.

import type { CollaboratorNotification, NotificationKind } from "./collaboratorsStore";

export const REVIEW_CATEGORIES = [
  "Clarity & Readability",
  "Structure & Presentation",
  "Accuracy & Completeness",
  "Consistency & Standards",
  "Relevance & Actionability",
] as const;
export type ReviewCategory = (typeof REVIEW_CATEGORIES)[number];

export interface ReviewReply {
  id: string;
  author: string;
  authorRole: "reviewer" | "author";
  text: string;
  createdAt: number;
}

export interface ReviewComment {
  id: string;
  courseId: string;
  blockId: string;
  blockLabel: string; // e.g. "Section 1 · Course Welcome · Text"
  author: string;
  authorRole: "reviewer" | "author";
  text: string;
  category?: ReviewCategory;
  createdAt: number;
  resolved: boolean;
  replies: ReviewReply[];
  readByAuthor: boolean;
}


const STORAGE_KEY = "review_comments_v1";
const NOTIF_KEY = "review_notifications_v1";

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function read(): ReviewComment[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}
function write(list: ReviewComment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function getCommentsForCourse(courseId: string): ReviewComment[] {
  return read().filter((c) => c.courseId === courseId).sort((a, b) => b.createdAt - a.createdAt);
}

export function getCommentsForBlock(courseId: string, blockId: string): ReviewComment[] {
  return getCommentsForCourse(courseId).filter((c) => c.blockId === blockId).reverse();
}

export function getCommentsForBlocks(courseId: string, blockIds: string[]): ReviewComment[] {
  const ids = new Set(blockIds);
  return getCommentsForCourse(courseId).filter((c) => ids.has(c.blockId)).reverse();
}

export function unreadCountForCourse(courseId: string): number {
  return read().filter((c) => c.courseId === courseId && !c.readByAuthor).length;
}

export function markCourseRead(courseId: string) {
  const list = read().map((c) => (c.courseId === courseId ? { ...c, readByAuthor: true } : c));
  write(list);
  emit();
}

export interface ReviewNotification {
  id: string;
  courseId: string;
  courseTitle: string;
  kind: "review-comment" | "review-reply";
  message: string;
  blockLabel: string;
  actor: string;
  createdAt: number;
  read: boolean;
}

function readNotifs(): ReviewNotification[] {
  try {
    return JSON.parse(localStorage.getItem(NOTIF_KEY) || "[]");
  } catch {
    return [];
  }
}
function writeNotifs(list: ReviewNotification[]) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(list));
}

export function getReviewNotifications(): ReviewNotification[] {
  return readNotifs().sort((a, b) => b.createdAt - a.createdAt);
}
export function getReviewUnreadCount(): number {
  return readNotifs().filter((n) => !n.read).length;
}
export function markAllReviewRead() {
  writeNotifs(readNotifs().map((n) => ({ ...n, read: true })));
  emit();
}

function pushNotif(n: Omit<ReviewNotification, "id" | "createdAt" | "read">) {
  const list = readNotifs();
  list.unshift({
    ...n,
    id: `rn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
    read: false,
  });
  writeNotifs(list.slice(0, 100));
}

export function addComment(opts: {
  courseId: string;
  courseTitle: string;
  blockId: string;
  blockLabel: string;
  author: string;
  text: string;
}): ReviewComment {
  const list = read();
  const comment: ReviewComment = {
    id: `rc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    courseId: opts.courseId,
    blockId: opts.blockId,
    blockLabel: opts.blockLabel,
    author: opts.author,
    authorRole: "reviewer",
    text: opts.text,
    createdAt: Date.now(),
    resolved: false,
    replies: [],
    readByAuthor: false,
  };
  list.push(comment);
  write(list);
  pushNotif({
    courseId: opts.courseId,
    courseTitle: opts.courseTitle,
    kind: "review-comment",
    message: `${opts.author} commented on "${opts.courseTitle}"`,
    blockLabel: opts.blockLabel,
    actor: opts.author,
  });
  emit();
  return comment;
}

export function addReply(opts: {
  commentId: string;
  courseTitle: string;
  author: string;
  authorRole: "reviewer" | "author";
  text: string;
}): void {
  const list = read();
  const idx = list.findIndex((c) => c.id === opts.commentId);
  if (idx === -1) return;
  const reply: ReviewReply = {
    id: `rr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    author: opts.author,
    authorRole: opts.authorRole,
    text: opts.text,
    createdAt: Date.now(),
  };
  list[idx].replies.push(reply);
  // mark unread for the opposite party
  if (opts.authorRole === "author") {
    list[idx].readByAuthor = true;
  } else {
    list[idx].readByAuthor = false;
  }
  write(list);
  pushNotif({
    courseId: list[idx].courseId,
    courseTitle: opts.courseTitle,
    kind: "review-reply",
    message: `${opts.author} replied on "${opts.courseTitle}"`,
    blockLabel: list[idx].blockLabel,
    actor: opts.author,
  });
  emit();
}

export function toggleResolved(commentId: string) {
  const list = read();
  const idx = list.findIndex((c) => c.id === commentId);
  if (idx === -1) return;
  list[idx].resolved = !list[idx].resolved;
  write(list);
  emit();
}

export function deleteComment(commentId: string) {
  write(read().filter((c) => c.id !== commentId));
  emit();
}

// Bridge for NotificationsBell: convert to the shared notification shape so the
// existing bell can render them alongside collaborator notifications.
export function getReviewNotificationsAsCollab(): CollaboratorNotification[] {
  return getReviewNotifications().map((n) => ({
    id: n.id,
    courseId: n.courseId,
    courseTitle: n.courseTitle,
    kind: (n.kind as unknown) as NotificationKind,
    message: `${n.message} — ${n.blockLabel}`,
    actor: { id: "x", name: n.actor, email: "" },
    createdAt: n.createdAt,
    read: n.read,
  }));
}
