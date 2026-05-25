import { useEffect, useMemo, useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Crown,
  ShieldCheck,
  Users,
  Search,
  Check,
  X,
  Plus,
  Pencil,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getCollaborators,
  saveCollaborators,
  searchPeople,
  type CourseCollaborators,
  type Person,
} from "@/services/collaboratorsStore";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseTitle: string;
}

/* ---------- helpers ---------- */

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <span
      style={{ width: size, height: size, fontSize: size * 0.34 }}
      className="rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold shrink-0"
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

/* ---------- inline picker (used by all 3 widgets) ---------- */

function InlinePicker({
  placeholder,
  excludeIds,
  onPick,
  onCancel,
}: {
  placeholder: string;
  excludeIds: string[];
  onPick: (p: Person) => void;
  onCancel?: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchPeople(query, excludeIds), [query, excludeIds]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="rounded-xl border border-primary/30 bg-background overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2 border-b">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape" && onCancel) onCancel();
          }}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-8 border-0 px-0 shadow-none focus-visible:ring-0 bg-transparent text-sm"
        />
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel"
            className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
      <ScrollArea className="max-h-56">
        {results.length === 0 ? (
          <p className="px-4 py-6 text-xs text-center text-muted-foreground">
            {query ? `No matches for "${query}"` : "Start typing a name or email"}
          </p>
        ) : (
          <ul className="py-1">
            {results.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onPick(p)}
                  className="w-full text-left px-3 py-2 hover:bg-accent flex items-center gap-3"
                >
                  <Avatar name={p.name} size={28} />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-foreground truncate">
                      {p.name}
                    </span>
                    <span className="block text-xs text-muted-foreground truncate">
                      {p.email}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}

/* ---------- widget shell ---------- */

function Widget({
  icon: Icon,
  accent,
  title,
  subtitle,
  status,
  children,
}: {
  icon: React.ElementType;
  accent: string;
  title: string;
  subtitle: string;
  status: { label: string; tone: "success" | "warning" | "muted" };
  children: React.ReactNode;
}) {
  const tone =
    status.tone === "success"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      : status.tone === "warning"
      ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
      : "bg-muted text-muted-foreground";
  return (
    <section className="rounded-2xl border border-border bg-card overflow-hidden">
      <header className="flex items-start gap-3 px-4 pt-4 pb-3">
        <span
          className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", accent)}
          aria-hidden="true"
        >
          <Icon className="w-5 h-5" aria-hidden="true" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                tone,
              )}
            >
              {status.tone === "success" && <Check className="w-2.5 h-2.5" aria-hidden="true" />}
              {status.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
      </header>
      <div className="px-4 pb-4">{children}</div>
    </section>
  );
}

function PersonCard({
  person,
  trailing,
}: {
  person: Person;
  trailing: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-2.5">
      <Avatar name={person.name} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{person.name}</p>
        <p className="text-xs text-muted-foreground truncate">{person.email}</p>
      </div>
      {trailing}
    </div>
  );
}

/* ---------- main ---------- */

export function CollaboratorsDrawer({ open, onOpenChange, courseId, courseTitle }: Props) {
  const { toast } = useToast();
  const [state, setState] = useState<CourseCollaborators>({
    author: null,
    reviewer: null,
    coAuthors: [],
  });
  const [editing, setEditing] = useState<null | "author" | "reviewer" | "co-author">(null);

  useEffect(() => {
    if (open) {
      setState(getCollaborators(courseId));
      setEditing(null);
    }
  }, [open, courseId]);

  const excludeIds = [
    state.author?.id,
    state.reviewer?.id,
    ...state.coAuthors.map((p) => p.id),
  ].filter(Boolean) as string[];

  const handleSave = () => {
    saveCollaborators(courseId, courseTitle, state);
    toast({ title: "Collaborators updated", description: `Saved for "${courseTitle}".` });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col gap-0">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b text-left space-y-1">
          <SheetTitle className="text-lg font-semibold">Course collaborators</SheetTitle>
          <SheetDescription className="text-xs truncate">
            {courseTitle}
          </SheetDescription>
        </SheetHeader>

        {/* Body */}
        <ScrollArea className="flex-1">
          <div className="px-5 py-5 space-y-4">
            {/* AUTHOR WIDGET */}
            <Widget
              icon={Crown}
              accent="bg-amber-500/10 text-amber-600 dark:text-amber-400"
              title="Author"
              subtitle="Owns and leads this course."
              status={
                state.author
                  ? { label: "Assigned", tone: "success" }
                  : { label: "Required", tone: "warning" }
              }
            >
              {editing === "author" ? (
                <InlinePicker
                  placeholder="Search to change author…"
                  excludeIds={excludeIds}
                  onPick={(p) => {
                    setState((s) => ({ ...s, author: p }));
                    setEditing(null);
                  }}
                  onCancel={() => setEditing(null)}
                />
              ) : state.author ? (
                <PersonCard
                  person={state.author}
                  trailing={
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full h-8 gap-1 text-xs"
                      onClick={() => setEditing("author")}
                      aria-label="Change author"
                    >
                      <Pencil className="w-3 h-3" aria-hidden="true" />
                      Change
                    </Button>
                  }
                />
              ) : (
                <Button
                  variant="outline"
                  className="w-full rounded-xl h-11 justify-center gap-2 border-dashed"
                  onClick={() => setEditing("author")}
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  Assign author
                </Button>
              )}
            </Widget>

            {/* REVIEWER WIDGET */}
            <Widget
              icon={ShieldCheck}
              accent="bg-blue-500/10 text-blue-600 dark:text-blue-400"
              title="Reviewer"
              subtitle="Signs off before the course goes live."
              status={
                state.reviewer
                  ? { label: "Assigned", tone: "success" }
                  : { label: "Optional", tone: "muted" }
              }
            >
              {editing === "reviewer" ? (
                <InlinePicker
                  placeholder="Search to assign reviewer…"
                  excludeIds={excludeIds}
                  onPick={(p) => {
                    setState((s) => ({ ...s, reviewer: p }));
                    setEditing(null);
                  }}
                  onCancel={() => setEditing(null)}
                />
              ) : state.reviewer ? (
                <PersonCard
                  person={state.reviewer}
                  trailing={
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => setState((s) => ({ ...s, reviewer: null }))}
                      aria-label={`Remove reviewer ${state.reviewer.name}`}
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  }
                />
              ) : (
                <Button
                  variant="outline"
                  className="w-full rounded-xl h-11 justify-center gap-2 border-dashed"
                  onClick={() => setEditing("reviewer")}
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  Add reviewer
                </Button>
              )}
            </Widget>

            {/* CO-AUTHORS WIDGET */}
            <Widget
              icon={Users}
              accent="bg-primary/10 text-primary"
              title="Co-authors"
              subtitle="Teammates who can edit alongside the author."
              status={
                state.coAuthors.length > 0
                  ? { label: `${state.coAuthors.length} added`, tone: "success" }
                  : { label: "Optional", tone: "muted" }
              }
            >
              <div className="space-y-2">
                {state.coAuthors.map((p) => (
                  <PersonCard
                    key={p.id}
                    person={p}
                    trailing={
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          setState((s) => ({
                            ...s,
                            coAuthors: s.coAuthors.filter((c) => c.id !== p.id),
                          }))
                        }
                        aria-label={`Remove co-author ${p.name}`}
                      >
                        <X className="w-4 h-4" aria-hidden="true" />
                      </Button>
                    }
                  />
                ))}

                {editing === "co-author" ? (
                  <InlinePicker
                    placeholder="Search to add a co-author…"
                    excludeIds={excludeIds}
                    onPick={(p) =>
                      setState((s) => ({ ...s, coAuthors: [...s.coAuthors, p] }))
                    }
                    onCancel={() => setEditing(null)}
                  />
                ) : (
                  <Button
                    variant="outline"
                    className="w-full rounded-xl h-11 justify-center gap-2 border-dashed"
                    onClick={() => setEditing("co-author")}
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    {state.coAuthors.length > 0 ? "Add another co-author" : "Add co-author"}
                  </Button>
                )}
              </div>
            </Widget>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-card flex items-center justify-end gap-2">
          <Button variant="ghost" className="rounded-full" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="rounded-full gap-1.5" onClick={handleSave}>
            <Check className="w-4 h-4" aria-hidden="true" />
            Save changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
