import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  FolderPlus,
  Pencil,
  Trash2,
  Search,
  Folder,
  FolderOpen,
  AlertTriangle,
  Check,
  ChevronDown,
  CornerDownRight,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const DESC_MAX = 500;

export interface FolderNode {
  id: string;
  name: string;
  count: number;
  description?: string;
  children?: FolderNode[];
}

const COURSES = [
  { id: "c1", name: "Foundations of Algebra" },
  { id: "c2", name: "Modern Physics 101" },
  { id: "c3", name: "Introduction to Biology" },
  { id: "c4", name: "World History Survey" },
];

const INITIAL_FOLDERS: FolderNode[] = [
  {
    id: "all",
    name: "All assets",
    count: 128,
    children: [
      {
        id: "lectures",
        name: "Lecture visuals",
        count: 42,
        children: [
          { id: "diagrams", name: "Diagrams", count: 18 },
          { id: "charts", name: "Charts & graphs", count: 12 },
        ],
      },
      {
        id: "labs",
        name: "Lab & experiments",
        count: 25,
        children: [
          { id: "chem", name: "Chemistry", count: 10 },
          { id: "physics", name: "Physics", count: 15 },
        ],
      },
      { id: "classroom", name: "Classroom moments", count: 31 },
      { id: "campus", name: "Campus & library", count: 30 },
    ],
  },
  {
    id: "brand",
    name: "Brand & marketing",
    count: 24,
    children: [
      { id: "logos", name: "Logos", count: 8 },
      { id: "banners", name: "Banners", count: 16 },
    ],
  },
];

// —————————————————— tree helpers ——————————————————
function mapTree(nodes: FolderNode[], fn: (n: FolderNode) => FolderNode): FolderNode[] {
  return nodes.map((n) => {
    const next = fn(n);
    return next.children ? { ...next, children: mapTree(next.children, fn) } : next;
  });
}

function addChild(nodes: FolderNode[], parentId: string, child: FolderNode): FolderNode[] {
  return nodes.map((n) => {
    if (n.id === parentId) {
      return { ...n, children: [...(n.children ?? []), child] };
    }
    return n.children ? { ...n, children: addChild(n.children, parentId, child) } : n;
  });
}

function removeNode(nodes: FolderNode[], id: string): FolderNode[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) => (n.children ? { ...n, children: removeNode(n.children, id) } : n));
}

function findNode(nodes: FolderNode[], id: string): FolderNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const found = findNode(n.children, id);
      if (found) return found;
    }
  }
  return null;
}

function filterTree(nodes: FolderNode[], q: string): FolderNode[] {
  if (!q) return nodes;
  const query = q.toLowerCase();
  const walk = (list: FolderNode[]): FolderNode[] => {
    const out: FolderNode[] = [];
    for (const n of list) {
      const children = n.children ? walk(n.children) : undefined;
      const matches = n.name.toLowerCase().includes(query);
      if (matches || (children && children.length)) {
        out.push({ ...n, children });
      }
    }
    return out;
  };
  return walk(nodes);
}

// —————————————————— row ——————————————————
interface FolderRowProps {
  node: FolderNode;
  level: number;
  selectedId: string;
  expandedIds: Set<string>;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onAddChild: (parentId: string) => void;
}

function FolderRow({
  node,
  level,
  selectedId,
  expandedIds,
  onSelect,
  onToggle,
  onAddChild,
}: FolderRowProps) {
  const hasChildren = !!(node.children && node.children.length > 0);
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;
  const FolderIcon = isExpanded && hasChildren ? FolderOpen : Folder;

  return (
    <>
      <div
        className={cn(
          "group w-full flex items-center gap-2 pr-1 rounded-lg text-sm transition-colors",
          isSelected ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"
        )}
      >
        <button
          type="button"
          onClick={() => onSelect(node.id)}
          className="flex-1 flex items-center gap-2 px-3 py-2 text-left min-w-0"
          style={{ paddingLeft: level * 16 + 12 }}
          aria-label={`Select folder ${node.name}`}
          aria-pressed={isSelected}
        >
          {hasChildren ? (
            <ChevronRight
              onClick={(e) => {
                e.stopPropagation();
                onToggle(node.id);
              }}
              className={cn(
                "w-3.5 h-3.5 shrink-0 transition-transform",
                isExpanded && "rotate-90"
              )}
              aria-hidden="true"
              focusable="false"
            />
          ) : (
            <span className="w-3.5 shrink-0" aria-hidden="true" />
          )}
          <FolderIcon
            className={cn(
              "w-4 h-4 shrink-0",
              isSelected ? "fill-primary-foreground/20" : "fill-primary/15 text-primary"
            )}
            aria-hidden="true"
            focusable="false"
          />
          <span className="truncate font-medium">{node.name}</span>
          <span
            className={cn(
              "ml-auto text-xs tabular-nums",
              isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
            )}
          >
            ({node.count})
          </span>
        </button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
            isSelected && "text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onAddChild(node.id);
          }}
          aria-label={`Add subfolder under ${node.name}`}
        >
          <FolderPlus className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
        </Button>
      </div>
      {hasChildren && isExpanded && (
        <div className="space-y-0.5">
          {node.children!.map((child) => (
            <FolderRow
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggle={onToggle}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </>
  );
}

// —————————————————— sidebar ——————————————————
export function LibraryFolderSidebar() {
  const [courseId, setCourseId] = useState(COURSES[0].id);
  const [folders, setFolders] = useState<FolderNode[]>(INITIAL_FOLDERS);
  const [selectedId, setSelectedId] = useState<string>("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["all"]));
  const [searchQuery, setSearchQuery] = useState("");

  // create / rename dialog
  type DialogMode = "create" | "rename";
  const [repoDialog, setRepoDialog] = useState<
    { mode: DialogMode; targetId?: string; defaultParentId?: string } | null
  >(null);
  const [nameInput, setNameInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [isRoot, setIsRoot] = useState(true);
  const [parentPickId, setParentPickId] = useState<string>("");

  // delete dialog
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const visibleFolders = useMemo(() => filterTree(folders, searchQuery), [folders, searchQuery]);
  const selectedNode = findNode(folders, selectedId);
  const deleteNode = deleteId ? findNode(folders, deleteId) : null;

  // Flat list for the parent picker (excluding the node being renamed)
  const flatFolders = useMemo(() => {
    const out: { id: string; label: string }[] = [];
    const walk = (list: FolderNode[], depth: number) => {
      for (const n of list) {
        out.push({ id: n.id, label: `${"— ".repeat(depth)}${n.name}` });
        if (n.children) walk(n.children, depth + 1);
      }
    };
    walk(folders, 0);
    return out;
  }, [folders]);

  const handleToggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openCreateRoot = () => {
    setRepoDialog({ mode: "create" });
    setNameInput("");
    setDescInput("");
    // If a folder is currently selected, default to nesting under it (toggle off)
    if (selectedNode && selectedId !== "all") {
      setIsRoot(false);
      setParentPickId(selectedId);
    } else {
      setIsRoot(true);
      setParentPickId("");
    }
  };

  const openCreateChild = (parentId: string) => {
    setRepoDialog({ mode: "create", defaultParentId: parentId });
    setNameInput("");
    setDescInput("");
    setIsRoot(false);
    setParentPickId(parentId);
    setExpandedIds((prev) => new Set(prev).add(parentId));
  };

  const openRename = () => {
    if (!selectedNode || selectedId === "all") return;
    setRepoDialog({ mode: "rename", targetId: selectedNode.id });
    setNameInput(selectedNode.name);
    setDescInput(selectedNode.description ?? "");
    setIsRoot(true);
    setParentPickId("");
  };

  const submitRepo = () => {
    const name = nameInput.trim();
    if (!name || !repoDialog) return;
    const description = descInput.trim() || undefined;

    if (repoDialog.mode === "rename" && repoDialog.targetId) {
      const id = repoDialog.targetId;
      setFolders((prev) => mapTree(prev, (n) => (n.id === id ? { ...n, name, description } : n)));
    } else {
      const newNode: FolderNode = {
        id: `f_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name,
        count: 0,
        description,
      };
      if (isRoot || !parentPickId) {
        setFolders((prev) => [...prev, newNode]);
      } else {
        setFolders((prev) => addChild(prev, parentPickId, newNode));
        setExpandedIds((prev) => new Set(prev).add(parentPickId));
      }
      setSelectedId(newNode.id);
    }
    setRepoDialog(null);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    setFolders((prev) => removeNode(prev, deleteId));
    if (selectedId === deleteId) setSelectedId("all");
    setDeleteId(null);
  };

  // Keep parent picker valid
  useEffect(() => {
    if (!isRoot && !parentPickId && flatFolders.length > 0) {
      setParentPickId(flatFolders[0].id);
    }
  }, [isRoot, parentPickId, flatFolders]);

  const canModify = selectedId !== "all" && !!selectedNode;
  const totalCount = (n: FolderNode): number =>
    n.count + (n.children?.reduce((s, c) => s + totalCount(c), 0) ?? 0);

  return (
    <>
      <aside className="hidden lg:flex bg-card border-r border-border w-[260px] flex-col flex-shrink-0">
        {/* Course selector */}
        <div className="p-4 border-b border-border space-y-2">
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Course
          </Label>
          <Select value={courseId} onValueChange={setCourseId}>
            <SelectTrigger className="w-full" aria-label="Select course">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COURSES.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Repositories header */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Repositories
          </span>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={openCreateRoot}
              aria-label="Create new repository"
            >
              <FolderPlus className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={openRename}
              disabled={!canModify}
              aria-label="Rename selected repository"
            >
              <Pencil className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => canModify && setDeleteId(selectedId)}
              disabled={!canModify}
              aria-label="Delete selected repository"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-2 relative">
          <Search
            className="w-3.5 h-3.5 text-muted-foreground absolute left-[1.375rem] top-1/2 -translate-y-1/2"
            aria-hidden="true"
            focusable="false"
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search folders..."
            className="h-8 pl-8 text-sm"
            aria-label="Search folders"
          />
        </div>

        {/* Folder list */}
        <div className="px-2 pb-4 flex-1 overflow-y-auto">
          <div className="space-y-0.5">
            {visibleFolders.length === 0 ? (
              <p className="px-3 py-4 text-xs text-muted-foreground text-center">
                No folders match "{searchQuery}"
              </p>
            ) : (
              visibleFolders.map((node) => (
                <FolderRow
                  key={node.id}
                  node={node}
                  level={0}
                  selectedId={selectedId}
                  expandedIds={expandedIds}
                  onSelect={setSelectedId}
                  onToggle={handleToggle}
                  onAddChild={openCreateChild}
                />
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Create / Rename Repository dialog */}
      <Dialog open={!!repoDialog} onOpenChange={(v) => !v && setRepoDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                {repoDialog?.mode === "rename" ? (
                  <Pencil className="w-5 h-5 text-primary" aria-hidden="true" focusable="false" />
                ) : (
                  <FolderPlus className="w-5 h-5 text-primary" aria-hidden="true" focusable="false" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle>
                  {repoDialog?.mode === "rename" ? "Edit Repository" : "New Repository"}
                </DialogTitle>
                <DialogDescription>
                  {repoDialog?.mode === "rename"
                    ? "Update the name and description for this repository."
                    : "Create a new repository to organize your assets"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="repo-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="repo-name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value.slice(0, 100))}
                placeholder="e.g. Mathematics, Science…"
                autoFocus
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="repo-desc">Description</Label>
              <Textarea
                id="repo-desc"
                value={descInput}
                onChange={(e) => setDescInput(e.target.value.slice(0, DESC_MAX))}
                placeholder="Brief description of this repository…"
                className="min-h-[96px] resize-none"
                maxLength={DESC_MAX}
              />
              <p className="text-xs text-muted-foreground text-right tabular-nums">
                {descInput.length}/{DESC_MAX}
              </p>
            </div>

            {repoDialog?.mode === "create" && (
              <div className="rounded-xl border border-border p-3 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">Root Repository</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Root repositories appear at the top level
                    </p>
                  </div>
                  <Switch
                    checked={isRoot}
                    onCheckedChange={setIsRoot}
                    aria-label="Create as root repository"
                  />
                </div>

                {!isRoot && (
                  <div className="space-y-1.5 pt-1 border-t border-border">
                    <Label className="text-xs">Parent repository</Label>
                    <ParentRepositoryPicker
                      folders={folders}
                      value={parentPickId}
                      onChange={setParentPickId}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRepoDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={submitRepo}
              disabled={!nameInput.trim() || (repoDialog?.mode === "create" && !isRoot && !parentPickId)}
            >
              {repoDialog?.mode === "rename" ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="items-center text-center">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6 text-destructive" aria-hidden="true" focusable="false" />
            </div>
            <AlertDialogTitle>Delete Repository</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteNode ? (
                <>
                  Are you sure you want to delete <span className="font-semibold text-foreground">{deleteNode.name}</span>?
                  This will permanently remove the repository and all{" "}
                  <span className="font-semibold text-foreground">{totalCount(deleteNode)} assets</span> within it.
                  This action cannot be undone.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteNode && (
            <div className="rounded-xl border border-border p-3 flex items-center gap-3 bg-muted/30">
              <div className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center flex-shrink-0">
                <Folder className="w-4 h-4 text-primary fill-primary/15" aria-hidden="true" focusable="false" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{deleteNode.name}</p>
                <p className="text-xs text-muted-foreground">
                  {totalCount(deleteNode)} assets
                  {deleteNode.children?.length ? ` · ${deleteNode.children.length} subfolders` : ""}
                </p>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Repository
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
