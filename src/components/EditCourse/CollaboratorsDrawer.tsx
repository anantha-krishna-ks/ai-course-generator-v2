import { useEffect, useMemo, useState } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Check,
  ChevronDown,
  Users,
  Trash2,
  Crown,
  ShieldCheck,
  UserRound,
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

type Role = "author" | "reviewer" | "co-author";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseTitle: string;
}

interface Assignment {
  person: Person;
  role: Role;
}

/* ---------- helpers ---------- */

const ROLE_META: Record<Role, { label: string; icon: React.ElementType; hint: string }> = {
  author: { label: "Author", icon: Crown, hint: "Owns and leads the course" },
  reviewer: { label: "Reviewer", icon: ShieldCheck, hint: "Signs off on the course" },
  "co-author": { label: "Co-author", icon: UserRound, hint: "Can edit alongside the author" },
};

const ROLE_ORDER: Role[] = ["author", "reviewer", "co-author"];

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

/* ---------- state utils ---------- */

function toAssignments(s: CourseCollaborators): Assignment[] {
  const out: Assignment[] = [];
  if (s.author) out.push({ person: s.author, role: "author" });
  if (s.reviewer) out.push({ person: s.reviewer, role: "reviewer" });
  s.coAuthors.forEach((p) => out.push({ person: p, role: "co-author" }));
  return out;
}

function fromAssignments(list: Assignment[]): CourseCollaborators {
  return {
    author: list.find((a) => a.role === "author")?.person ?? null,
    reviewer: list.find((a) => a.role === "reviewer")?.person ?? null,
    coAuthors: list.filter((a) => a.role === "co-author").map((a) => a.person),
  };
}

/* ---------- main ---------- */

export function CollaboratorsDrawer({ open, onOpenChange, courseId, courseTitle }: Props) {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [pendingRole, setPendingRole] = useState<Role>("co-author");
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setAssignments(toAssignments(getCollaborators(courseId)));
      setQuery("");
      setPendingRole("co-author");
    }
  }, [open, courseId]);

  const excludeIds = useMemo(() => assignments.map((a) => a.person.id), [assignments]);
  const results = useMemo(() => searchPeople(query, excludeIds), [query, excludeIds]);

  const hasAuthor = assignments.some((a) => a.role === "author");
  const hasReviewer = assignments.some((a) => a.role === "reviewer");

  // Group for display
  const grouped = useMemo(() => {
    const map: Record<Role, Assignment[]> = { author: [], reviewer: [], "co-author": [] };
    assignments.forEach((a) => map[a.role].push(a));
    return map;
  }, [assignments]);

  const addPerson = (p: Person) => {
    // If role is author/reviewer and already taken, replace it.
    setAssignments((prev) => {
      let next = prev.filter((a) => a.person.id !== p.id);
      if (pendingRole === "author") next = next.filter((a) => a.role !== "author");
      if (pendingRole === "reviewer") next = next.filter((a) => a.role !== "reviewer");
      return [...next, { person: p, role: pendingRole }];
    });
    setQuery("");
  };

  const changeRole = (id: string, role: Role) => {
    setAssignments((prev) => {
      let next = prev.map((a) => ({ ...a }));
      if (role === "author") next = next.filter((a) => a.role !== "author" || a.person.id === id);
      if (role === "reviewer") next = next.filter((a) => a.role !== "reviewer" || a.person.id === id);
      return next.map((a) => (a.person.id === id ? { ...a, role } : a));
    });
  };

  const remove = (id: string) =>
    setAssignments((prev) => prev.filter((a) => a.person.id !== id));

  const handleSave = () => {
    saveCollaborators(courseId, courseTitle, fromAssignments(assignments));
    toast({ title: "Collaborators updated", description: `Saved for "${courseTitle}".` });
    onOpenChange(false);
  };

  const RoleIcon = ROLE_META[pendingRole].icon;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col gap-0">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b space-y-1 text-left">
          <SheetTitle className="text-lg font-semibold">Share course</SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground truncate">
            {courseTitle}
          </SheetDescription>
        </SheetHeader>

        {/* Invite bar */}
        <div className="px-6 pt-5 pb-3 space-y-2 border-b bg-background">
          <div className="relative flex items-center gap-2 rounded-full border border-input bg-background pl-3 pr-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background transition-shadow">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setDropdownOpen(true);
              }}
              onFocus={() => setDropdownOpen(true)}
              onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
              placeholder="Add people by name or email"
              aria-label="Add people by name or email"
              className="h-10 border-0 px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
            />
            <RoleMenu value={pendingRole} onChange={setPendingRole} compact />
          </div>

          {dropdownOpen && (
            <div className="relative">
              <div className="absolute z-50 left-0 right-0 -mt-1 rounded-xl border border-border bg-popover shadow-lg overflow-hidden">
                {results.length === 0 ? (
                  <p className="px-4 py-5 text-sm text-center text-muted-foreground">
                    {query ? `No matches for "${query}"` : "Everyone has been added"}
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
                              addPerson(p);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-accent flex items-center gap-3"
                          >
                            <Avatar name={p.name} size={32} />
                            <span className="flex-1 min-w-0">
                              <span className="block text-sm font-medium text-foreground truncate">
                                {p.name}
                              </span>
                              <span className="block text-xs text-muted-foreground truncate">
                                {p.email}
                              </span>
                            </span>
                            <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                              <RoleIcon className="w-3 h-3" aria-hidden="true" />
                              {ROLE_META[pendingRole].label}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                )}
              </div>
            </div>
          )}
        </div>

        {/* People list */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center px-6 py-16 text-muted-foreground">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
                <Users className="w-6 h-6" aria-hidden="true" />
              </div>
              <p className="text-sm font-medium text-foreground">No one added yet</p>
              <p className="text-xs mt-1">Search above to add an author, reviewer, or co-authors.</p>
            </div>
          ) : (
            <div className="py-2 space-y-4">
              {ROLE_ORDER.map((role) => {
                const items = grouped[role];
                if (items.length === 0) return null;
                return (
                  <div key={role}>
                    <div className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      {ROLE_META[role].label}
                      {items.length > 1 ? `s · ${items.length}` : ""}
                    </div>
                    <ul className="space-y-0.5">
                      {items.map((a) => (
                        <PersonRow
                          key={a.person.id}
                          assignment={a}
                          hasAuthor={hasAuthor}
                          hasReviewer={hasReviewer}
                          onChangeRole={(r) => changeRole(a.person.id, r)}
                          onRemove={() => remove(a.person.id)}
                        />
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-card flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {assignments.length} {assignments.length === 1 ? "person" : "people"} with access
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" className="rounded-full" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="rounded-full gap-1.5" onClick={handleSave}>
              <Check className="w-4 h-4" aria-hidden="true" />
              Save
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ---------- row + role menu ---------- */

function PersonRow({
  assignment,
  hasAuthor,
  hasReviewer,
  onChangeRole,
  onRemove,
}: {
  assignment: Assignment;
  hasAuthor: boolean;
  hasReviewer: boolean;
  onChangeRole: (r: Role) => void;
  onRemove: () => void;
}) {
  const { person, role } = assignment;
  return (
    <li className="group flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted/60 transition-colors">
      <Avatar name={person.name} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{person.name}</p>
        <p className="text-xs text-muted-foreground truncate">{person.email}</p>
      </div>
      <RoleMenu
        value={role}
        onChange={onChangeRole}
        onRemove={onRemove}
        disabledRoles={[
          ...(hasAuthor && role !== "author" ? (["author"] as Role[]) : []),
          ...(hasReviewer && role !== "reviewer" ? (["reviewer"] as Role[]) : []),
        ]}
      />
    </li>
  );
}

function RoleMenu({
  value,
  onChange,
  onRemove,
  disabledRoles = [],
  compact = false,
}: {
  value: Role;
  onChange: (r: Role) => void;
  onRemove?: () => void;
  disabledRoles?: Role[];
  compact?: boolean;
}) {
  const Icon = ROLE_META[value].icon;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Role: ${ROLE_META[value].label}. Click to change.`}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full text-xs font-medium transition-colors shrink-0",
            compact
              ? "h-8 px-3 bg-muted hover:bg-muted/80 text-foreground"
              : "h-8 px-3 text-muted-foreground hover:bg-background hover:text-foreground border border-transparent hover:border-border",
          )}
        >
          <Icon className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{ROLE_META[value].label}</span>
          <ChevronDown className="w-3 h-3 opacity-60" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {ROLE_ORDER.map((r) => {
          const meta = ROLE_META[r];
          const RIcon = meta.icon;
          const disabled = disabledRoles.includes(r) && r !== value;
          return (
            <DropdownMenuItem
              key={r}
              disabled={disabled}
              onSelect={() => onChange(r)}
              className="flex items-start gap-2.5 cursor-pointer py-2"
            >
              <RIcon className="w-4 h-4 mt-0.5 text-primary shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{meta.label}</span>
                  {value === r && <Check className="w-3.5 h-3.5 text-primary" aria-hidden="true" />}
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {disabled ? "Already assigned — replace from that person's row" : meta.hint}
                </p>
              </div>
            </DropdownMenuItem>
          );
        })}
        {onRemove && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={onRemove}
              className="text-destructive focus:text-destructive cursor-pointer gap-2"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              Remove access
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
