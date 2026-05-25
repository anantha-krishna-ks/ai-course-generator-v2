// Lightweight mock store for course collaborators + notification feed.
// Persists in localStorage and exposes a tiny pub/sub for live updates.

export interface Person {
  id: string;
  name: string;
  email: string;
}

export interface CourseCollaborators {
  author: Person | null;
  reviewer: Person | null;
  coAuthors: Person[];
}

export type NotificationKind = "author" | "reviewer" | "co-author" | "review-comment" | "review-reply";

export interface CollaboratorNotification {
  id: string;
  courseId: string;
  courseTitle: string;
  kind: NotificationKind;
  message: string;
  actor: Person;
  createdAt: number;
  read: boolean;
}

const STORAGE_COLLAB = "collaborators_map_v1";
const STORAGE_NOTIF = "collaborator_notifications_v1";

// Mock directory used by the autocomplete.
export const MOCK_DIRECTORY: Person[] = [
  { id: "u-1", name: "Aarav Sharma", email: "aarav.sharma@excelsoft.com" },
  { id: "u-2", name: "Priya Iyer", email: "priya.iyer@excelsoft.com" },
  { id: "u-3", name: "Rahul Verma", email: "rahul.verma@excelsoft.com" },
  { id: "u-4", name: "Sneha Patel", email: "sneha.patel@excelsoft.com" },
  { id: "u-5", name: "Vikram Singh", email: "vikram.singh@excelsoft.com" },
  { id: "u-6", name: "Ananya Rao", email: "ananya.rao@excelsoft.com" },
  { id: "u-7", name: "Karthik Nair", email: "karthik.nair@excelsoft.com" },
  { id: "u-8", name: "Meera Joshi", email: "meera.joshi@excelsoft.com" },
  { id: "u-9", name: "Rohan Kapoor", email: "rohan.kapoor@excelsoft.com" },
  { id: "u-10", name: "Isha Reddy", email: "isha.reddy@excelsoft.com" },
  { id: "u-11", name: "Aditya Mehta", email: "aditya.mehta@excelsoft.com" },
  { id: "u-12", name: "Neha Gupta", email: "neha.gupta@excelsoft.com" },
  { id: "u-13", name: "Sanjay Bose", email: "sanjay.bose@excelsoft.com" },
  { id: "u-14", name: "Divya Krishnan", email: "divya.krishnan@excelsoft.com" },
  { id: "u-15", name: "Arjun Pillai", email: "arjun.pillai@excelsoft.com" },
];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function readMap(): Record<string, CourseCollaborators> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_COLLAB) || "{}");
  } catch {
    return {};
  }
}
function writeMap(map: Record<string, CourseCollaborators>) {
  localStorage.setItem(STORAGE_COLLAB, JSON.stringify(map));
}

export function getCollaborators(courseId: string): CourseCollaborators {
  const map = readMap();
  return (
    map[courseId] ?? {
      author: { id: "u-1", name: "Aarav Sharma", email: "aarav.sharma@excelsoft.com" },
      reviewer: null,
      coAuthors: [],
    }
  );
}

export function searchPeople(query: string, excludeIds: string[] = []): Person[] {
  const q = query.trim().toLowerCase();
  const list = MOCK_DIRECTORY.filter((p) => !excludeIds.includes(p.id));
  if (!q) return list;
  return list.filter((p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q));
}

function readNotifs(): CollaboratorNotification[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_NOTIF) || "[]");
  } catch {
    return [];
  }
}
function writeNotifs(list: CollaboratorNotification[]) {
  localStorage.setItem(STORAGE_NOTIF, JSON.stringify(list));
}

export function getNotifications(): CollaboratorNotification[] {
  return readNotifs().sort((a, b) => b.createdAt - a.createdAt);
}

export function getUnreadCount(): number {
  return readNotifs().filter((n) => !n.read).length;
}

export function markAllRead() {
  writeNotifs(readNotifs().map((n) => ({ ...n, read: true })));
  emit();
}

function pushNotif(n: Omit<CollaboratorNotification, "id" | "createdAt" | "read">) {
  const list = readNotifs();
  list.unshift({
    ...n,
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
    read: false,
  });
  writeNotifs(list.slice(0, 50));
}

const ACTOR: Person = {
  id: "me",
  name: "You",
  email: "you@excelsoft.com",
};

export function saveCollaborators(
  courseId: string,
  courseTitle: string,
  next: CourseCollaborators,
) {
  const map = readMap();
  const prev = getCollaborators(courseId);
  map[courseId] = next;
  writeMap(map);

  // Diff and emit notifications
  if (prev.author?.id !== next.author?.id) {
    pushNotif({
      courseId,
      courseTitle,
      kind: "author",
      actor: ACTOR,
      message: `Author changed to ${next.author?.name ?? "—"} on "${courseTitle}"`,
    });
  }
  if (prev.reviewer?.id !== next.reviewer?.id) {
    pushNotif({
      courseId,
      courseTitle,
      kind: "reviewer",
      actor: ACTOR,
      message: next.reviewer
        ? `${next.reviewer.name} assigned as reviewer on "${courseTitle}"`
        : `Reviewer removed from "${courseTitle}"`,
    });
  }
  const prevCo = new Set(prev.coAuthors.map((p) => p.id));
  const nextCo = new Set(next.coAuthors.map((p) => p.id));
  const added = next.coAuthors.filter((p) => !prevCo.has(p.id));
  const removed = prev.coAuthors.filter((p) => !nextCo.has(p.id));
  if (added.length) {
    pushNotif({
      courseId,
      courseTitle,
      kind: "co-author",
      actor: ACTOR,
      message: `${added.map((p) => p.name).join(", ")} added as co-author${added.length > 1 ? "s" : ""} on "${courseTitle}"`,
    });
  }
  if (removed.length) {
    pushNotif({
      courseId,
      courseTitle,
      kind: "co-author",
      actor: ACTOR,
      message: `${removed.map((p) => p.name).join(", ")} removed as co-author${removed.length > 1 ? "s" : ""} on "${courseTitle}"`,
    });
  }
  emit();
}
