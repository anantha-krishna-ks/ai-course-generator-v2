import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, UserCog, ShieldCheck, Users, Search, Check } from "lucide-react";
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

function PersonChip({ person, onRemove }: { person: Person; onRemove?: () => void }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/20 pl-1 pr-2 py-1 text-sm">
      <span className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-semibold">
        {initials(person.name)}
      </span>
      <span className="text-foreground font-medium">{person.name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${person.name}`}
          className="ml-0.5 rounded-full p-0.5 hover:bg-primary/10 text-muted-foreground hover:text-foreground"
        >
          <X className="w-3 h-3" aria-hidden="true" focusable="false" />
        </button>
      )}
    </div>
  );
}

function PersonAutocomplete({
  placeholder,
  excludeIds,
  onPick,
}: {
  placeholder: string;
  excludeIds: string[];
  onPick: (p: Person) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const results = useMemo(() => searchPeople(query, excludeIds), [query, excludeIds]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="pl-9 rounded-full"
          aria-label={placeholder}
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-popover shadow-lg overflow-hidden">
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
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                      {initials(p.name)}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-foreground truncate">{p.name}</span>
                      <span className="block text-xs text-muted-foreground truncate">{p.email}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

export function CollaboratorsDrawer({ open, onOpenChange, courseId, courseTitle }: Props) {
  const { toast } = useToast();
  const [state, setState] = useState<CourseCollaborators>({ author: null, reviewer: null, coAuthors: [] });

  useEffect(() => {
    if (open) setState(getCollaborators(courseId));
  }, [open, courseId]);

  const excludeIds = [
    state.author?.id,
    state.reviewer?.id,
    ...state.coAuthors.map((c) => c.id),
  ].filter(Boolean) as string[];

  const handleSave = () => {
    saveCollaborators(courseId, courseTitle, state);
    toast({ title: "Collaborators updated", description: `Saved for "${courseTitle}".` });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="text-xl">Set course collaborators</SheetTitle>
          <SheetDescription>
            Assign an author, a reviewer, and co-authors for "{courseTitle}".
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">
          {/* Author */}
          <section className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <UserCog className="w-4 h-4 text-primary" aria-hidden="true" />
              Author
            </Label>
            <p className="text-xs text-muted-foreground -mt-1">The primary owner of this course.</p>
            {state.author ? (
              <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-semibold">
                    {initials(state.author.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{state.author.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{state.author.email}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="rounded-full">Current</Badge>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No author assigned.</p>
            )}
            <PersonAutocomplete
              placeholder="Change author by name or email…"
              excludeIds={excludeIds}
              onPick={(p) => setState((s) => ({ ...s, author: p }))}
            />
          </section>

          {/* Reviewer */}
          <section className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ShieldCheck className="w-4 h-4 text-primary" aria-hidden="true" />
              Reviewer
            </Label>
            <p className="text-xs text-muted-foreground -mt-1">A single reviewer who signs off on the course.</p>
            {state.reviewer ? (
              <div className="flex flex-wrap gap-2">
                <PersonChip
                  person={state.reviewer}
                  onRemove={() => setState((s) => ({ ...s, reviewer: null }))}
                />
              </div>
            ) : null}
            {!state.reviewer && (
              <PersonAutocomplete
                placeholder="Assign reviewer by name or email…"
                excludeIds={excludeIds}
                onPick={(p) => setState((s) => ({ ...s, reviewer: p }))}
              />
            )}
          </section>

          {/* Co-authors */}
          <section className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Users className="w-4 h-4 text-primary" aria-hidden="true" />
              Co-authors
              {state.coAuthors.length > 0 && (
                <Badge variant="secondary" className="rounded-full">{state.coAuthors.length}</Badge>
              )}
            </Label>
            <p className="text-xs text-muted-foreground -mt-1">Add multiple teammates who can edit alongside you.</p>
            {state.coAuthors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {state.coAuthors.map((p) => (
                  <PersonChip
                    key={p.id}
                    person={p}
                    onRemove={() =>
                      setState((s) => ({ ...s, coAuthors: s.coAuthors.filter((c) => c.id !== p.id) }))
                    }
                  />
                ))}
              </div>
            )}
            <PersonAutocomplete
              placeholder="Add co-authors by name or email…"
              excludeIds={excludeIds}
              onPick={(p) => setState((s) => ({ ...s, coAuthors: [...s.coAuthors, p] }))}
            />
          </section>
        </div>

        <SheetFooter className="px-6 py-4 border-t bg-card/50 flex-row gap-2 sm:justify-end">
          <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="rounded-full gap-1" onClick={handleSave}>
            <Check className="w-4 h-4" aria-hidden="true" />
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
