// Mock current-user role store. Persists in localStorage so role can be
// toggled in demos without an auth backend. Roles map to action privileges
// surfaced in CourseStatusMenu (e.g. who can Publish).

export type UserRole = "author" | "reviewer" | "admin";

const STORAGE_KEY = "current_user_role_v1";
const DEFAULT_ROLE: UserRole = "admin"; // demo default: privileged so Publish appears

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function getCurrentRole(): UserRole {
  try {
    const v = localStorage.getItem(STORAGE_KEY) as UserRole | null;
    if (v === "author" || v === "reviewer" || v === "admin") return v;
  } catch {
    /* noop */
  }
  return DEFAULT_ROLE;
}

export function setCurrentRole(role: UserRole) {
  localStorage.setItem(STORAGE_KEY, role);
  emit();
}

export function subscribeRole(fn: () => void): () => void {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) fn();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

/** Privilege checks. Centralized so UI gating stays consistent. */
export function canPublish(role: UserRole = getCurrentRole()): boolean {
  return role === "admin" || role === "author";
}
