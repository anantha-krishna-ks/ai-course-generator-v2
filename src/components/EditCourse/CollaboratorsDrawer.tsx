import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, UserCog, ShieldCheck, Users, Search, Check, UserPlus, Pencil } from "lucide-react";
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

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* ---------- Reusable bits ---------- */

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const dims =
    size === "lg" ? "w-11 h-11 text-sm" : size === "sm" ? "w-6 h-6 text-[10px]" : "w-9 h-9 text-xs";
  return (
    <span
      className={cn(
        "rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold shrink-0",
        dims,
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

function PersonRow({
  person,
  trailing,
}: {
  person: Person;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <Avatar name={person.name} size="lg" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">{person.name}</p>
        <p className="text-xs text-muted-foreground truncate">{person.email}</p>
      </div>
      {trailing}
    </div>
  );
}

function PersonChip({ person, onRemove }: { person: Person; onRemove: () => void }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/20 pl-1 pr-1.5 py-1 text-sm max-w-full">
      <Avatar name={person.name} size="sm" />
      <span className="text-foreground font-medium truncate max-w-[140px]">{person.name}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${person.name}`}
        className="rounded-full p-0.5 hover:bg-primary/10 text-muted-foreground hover:text-foreground shrink-0"
      >
        <X className="w-3 h-3" aria-hidden="true" focusable="false" />
      </button>
    </div>
  );
}

/* ---------- Autocomplete ---------- */

function PersonAutocomplete({
  placeholder,
  excludeIds,
  onPick,
  autoFocus = false,
}: {
  placeholder: string;
  excludeIds: string[];
  onPick: (p: Person) => void;
  autoFocus?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const results = useMemo(() => searchPeople(query, excludeIds), [query, excludeIds]);

  return (
    <div className="relative">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="pl-9 h-10 rounded-full bg-background"
          aria-label={placeholder}
        />
      </div>
      {open && (
        <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-border bg-popover shadow-lg overflow-hidden">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-sm text-center text-muted-foreground">
              No matches for "{query}"
            </p>
          ) : (
            <ScrollArea className="max-h-64">
              <ul role="listbox" className="py-1">
                {results.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onPick(p);
                        setQuery("");
                        setOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-accent flex items-center gap-3"
                    >
                      <Avatar name={p.name} />
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
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Section shell ---------- */

function SectionCard({
  icon: Icon,
  title,
  hint,
  badge,
  children,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  hint: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-4 space-y-3">
      <header className="flex items-start gap-3">
        <span
          className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <Icon className="w-4 h-4" aria-hidden />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {badge}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
        </div>
      </header>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

/* ---------- Main ---------- */

export function CollaboratorsDrawer({ open, onOpenChange, courseId, courseTitle }: Props) {
  const { toast } = useToast();
  const [state, setState] = useState<CourseCollaborators>({
    author: null,
    reviewer: null,
    coAuthors: [],
  });
  const [editingAuthor, setEditingAuthor] = useState(false);

  useEffect(() => {
    if (open) {
      setState(getCollaborators(courseId));
      setEditingAuthor(false);
    }
  }, [open, courseId]);

  const excludeIds = [
    state.author?.id,
    state.reviewer?.id,
    ...state.coAuthors.map((c) => c.id),
  ].filter(Boolean) as string[];

  const totalAssigned =
    (state.author ? 1 : 0) + (state.reviewer ? 1 : 0) + state.coAuthors.length;

  const handleSave = () => {
    saveCollaborators(courseId, courseTitle, state);
    toast({ title: "Collaborators updated", description: `Saved for "${courseTitle}".` });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col gap-0">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-5 border-b bg-gradient-to-b from-primary/5 to-transparent space-y-1.5">
          <div className="flex items-center gap-2">
            <span
              className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center"
              aria-hidden="true"
            >
              <Users className="w-4 h-4" />
            </span>
            <SheetTitle className="text-lg">Course collaborators</SheetTitle>
          </div>
          <SheetDescription className="text-xs leading-relaxed">
            Manage who can author, review, and edit{" "}
            <span className="font-medium text-foreground">"{courseTitle}"</span>.
          </SheetDescription>
          <div className="flex items-center gap-2 pt-1">
            <Badge variant="secondary" className="rounded-full text-[11px]">
              {totalAssigned} {totalAssigned === 1 ? "person" : "people"} assigned
            </Badge>
          </div>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-muted/30">
          {/* Author */}
          <SectionCard
            icon={UserCog}
            title="Author"
            hint="The primary owner responsible for this course."
          >
            {state.author && !editingAuthor ? (
              <div className="flex items-center justify-between rounded-xl border border-border bg-background p-3">
                <PersonRow
                  person={state.author}
                  trailing={<Badge variant="secondary" className="rounded-full">Current</Badge>}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full ml-2 gap-1 h-8 px-3 text-xs"
                  onClick={() => setEditingAuthor(true)}
                  aria-label="Change author"
                >
                  <Pencil className="w-3 h-3" aria-hidden="true" />
                  Change
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <PersonAutocomplete
                  placeholder="Search by name or email…"
                  excludeIds={excludeIds}
                  autoFocus
                  onPick={(p) => {
                    setState((s) => ({ ...s, author: p }));
                    setEditingAuthor(false);
                  }}
                />
                {state.author && (
                  <button
                    type="button"
                    onClick={() => setEditingAuthor(false)}
                    className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
                  >
                    Cancel change
                  </button>
                )}
              </div>
            )}
          </SectionCard>

          {/* Reviewer */}
          <SectionCard
            icon={ShieldCheck}
            title="Reviewer"
            hint="A single reviewer who signs off on the course."
            badge={
              state.reviewer ? (
                <Badge variant="secondary" className="rounded-full">Assigned</Badge>
              ) : null
            }
          >
            {state.reviewer ? (
              <div className="flex items-center justify-between rounded-xl border border-border bg-background p-3">
                <PersonRow person={state.reviewer} />
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full ml-2 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => setState((s) => ({ ...s, reviewer: null }))}
                  aria-label={`Remove reviewer ${state.reviewer.name}`}
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
            ) : (
              <PersonAutocomplete
                placeholder="Assign a reviewer by name or email…"
                excludeIds={excludeIds}
                onPick={(p) => setState((s) => ({ ...s, reviewer: p }))}
              />
            )}
          </SectionCard>

          {/* Co-authors */}
          <SectionCard
            icon={Users}
            title="Co-authors"
            hint="Teammates who can edit alongside the author."
            badge={
              state.coAuthors.length > 0 ? (
                <Badge variant="secondary" className="rounded-full">
                  {state.coAuthors.length}
                </Badge>
              ) : null
            }
          >
            <PersonAutocomplete
              placeholder="Add a co-author by name or email…"
              excludeIds={excludeIds}
              onPick={(p) => setState((s) => ({ ...s, coAuthors: [...s.coAuthors, p] }))}
            />
            {state.coAuthors.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {state.coAuthors.map((p) => (
                  <PersonChip
                    key={p.id}
                    person={p}
                    onRemove={() =>
                      setState((s) => ({
                        ...s,
                        coAuthors: s.coAuthors.filter((c) => c.id !== p.id),
                      }))
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
                No co-authors added yet.
              </div>
            )}
          </SectionCard>
        </div>

        {/* Footer */}
        <SheetFooter className="px-6 py-4 border-t bg-card flex-row gap-2 sm:justify-end">
          <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="rounded-full gap-1.5" onClick={handleSave}>
            <Check className="w-4 h-4" aria-hidden="true" />
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
