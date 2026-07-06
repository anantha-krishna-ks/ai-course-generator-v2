import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Image as ImageIcon,
  FileText,
  Mic,
  Video as VideoIcon,
  Sparkles,
  Upload,
  User,
  Users,
  Play,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type AssetKind = "image" | "doc" | "audio" | "video";

interface LibraryAsset {
  id: string;
  kind: AssetKind;
  url: string;
  name: string;
  size: string;
  source: "uploaded" | "ai";
  addedBy: string;
  addedByMe: boolean;
  addedDate: string; // ISO
  tags: string[];
  meta?: string; // duration or type
  thumbnail?: string; // for video
}

// ————————————————————————————————————————————————————————————
// Mock library — represents the shared org-level asset library
// ————————————————————————————————————————————————————————————
const MOCK_ASSETS: LibraryAsset[] = [
  // Images
  { id: "i1", kind: "image", url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800", name: "Mathematics classroom", size: "184 KB", source: "uploaded", addedBy: "Priya S.", addedByMe: false, addedDate: "2026-06-14", tags: ["education", "classroom"] },
  { id: "i2", kind: "image", url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800", name: "Science lab", size: "212 KB", source: "uploaded", addedBy: "You", addedByMe: true, addedDate: "2026-06-20", tags: ["science", "lab"] },
  { id: "i3", kind: "image", url: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800", name: "Reading nook", size: "168 KB", source: "uploaded", addedBy: "Rahul K.", addedByMe: false, addedDate: "2026-05-30", tags: ["books"] },
  { id: "i4", kind: "image", url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800", name: "Team collaboration on laptops", size: "245 KB", source: "ai", addedBy: "You", addedByMe: true, addedDate: "2026-06-28", tags: ["ai-generated", "teamwork"], meta: "Prompt: team collaborating around laptops in modern office" },
  { id: "i5", kind: "image", url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800", name: "University library", size: "198 KB", source: "uploaded", addedBy: "Priya S.", addedByMe: false, addedDate: "2026-04-11", tags: ["library"] },
  { id: "i6", kind: "image", url: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800", name: "Graduation celebration", size: "220 KB", source: "ai", addedBy: "Amit R.", addedByMe: false, addedDate: "2026-07-01", tags: ["ai-generated", "graduation"], meta: "Prompt: joyful graduation ceremony" },

  // Documents
  { id: "d1", kind: "doc", url: "https://www.africau.edu/images/default/sample.pdf", name: "Course Handbook.pdf", size: "1.2 MB", source: "uploaded", addedBy: "Admin", addedByMe: false, addedDate: "2026-05-02", tags: ["reference", "handbook"], meta: "PDF" },
  { id: "d2", kind: "doc", url: "https://www.orimi.com/pdf-test.pdf", name: "Brand Style Guide.pdf", size: "3.4 MB", source: "uploaded", addedBy: "You", addedByMe: true, addedDate: "2026-06-18", tags: ["brand"], meta: "PDF" },
  { id: "d3", kind: "doc", url: "https://www.africau.edu/images/default/sample.pdf", name: "Onboarding Policy.pdf", size: "820 KB", source: "uploaded", addedBy: "HR Team", addedByMe: false, addedDate: "2026-03-22", tags: ["policy", "onboarding"], meta: "PDF" },
  { id: "d4", kind: "doc", url: "https://www.orimi.com/pdf-test.pdf", name: "Assessment Rubric.pdf", size: "512 KB", source: "uploaded", addedBy: "Priya S.", addedByMe: false, addedDate: "2026-06-25", tags: ["assessment"], meta: "PDF" },

  // Audio
  { id: "a1", kind: "audio", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", name: "Intro narration – welcome", size: "5.8 MB", source: "ai", addedBy: "You", addedByMe: true, addedDate: "2026-06-29", tags: ["ai-generated", "narration"], meta: "Voice: Aria · 6:12" },
  { id: "a2", kind: "audio", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", name: "Module 2 background loop", size: "6.4 MB", source: "uploaded", addedBy: "Rahul K.", addedByMe: false, addedDate: "2026-05-14", tags: ["background"], meta: "6:38" },
  { id: "a3", kind: "audio", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", name: "Podcast interview clip", size: "5.2 MB", source: "uploaded", addedBy: "Amit R.", addedByMe: false, addedDate: "2026-06-05", tags: ["podcast"], meta: "5:24" },
  { id: "a4", kind: "audio", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", name: "TTS – safety instructions", size: "6.9 MB", source: "ai", addedBy: "Priya S.", addedByMe: false, addedDate: "2026-07-02", tags: ["ai-generated", "tts"], meta: "Voice: Ethan · 7:03" },

  // Video
  { id: "v1", kind: "video", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", name: "Big Buck Bunny intro", size: "158 MB", source: "uploaded", addedBy: "You", addedByMe: true, addedDate: "2026-06-10", tags: ["sample", "animation"], meta: "9:56" },
  { id: "v2", kind: "video", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", name: "Elephants Dream", size: "215 MB", source: "uploaded", addedBy: "Rahul K.", addedByMe: false, addedDate: "2026-05-28", tags: ["animation"], meta: "10:53" },
  { id: "v3", kind: "video", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", name: "Product promo – 15s", size: "12 MB", source: "uploaded", addedBy: "Marketing", addedByMe: false, addedDate: "2026-06-19", tags: ["promo"], meta: "0:15" },
  { id: "v4", kind: "video", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4", name: "Sintel trailer", size: "310 MB", source: "uploaded", addedBy: "Amit R.", addedByMe: false, addedDate: "2026-04-08", tags: ["trailer"], meta: "14:48" },
];

const KIND_META: Record<AssetKind, { title: string; description: string; Icon: typeof ImageIcon; label: string }> = {
  image: { title: "Image Library", description: "Choose an image from your organisation's library", Icon: ImageIcon, label: "images" },
  doc: { title: "Document Library", description: "Choose a document from your organisation's library", Icon: FileText, label: "documents" },
  audio: { title: "Audio Library", description: "Choose an audio file from your organisation's library", Icon: Mic, label: "audio" },
  video: { title: "Video Library", description: "Choose a video from your organisation's library", Icon: VideoIcon, label: "videos" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

interface AssetLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: AssetKind;
  onSelect: (url: string, name: string) => void;
  locked?: boolean;
  lockReason?: string;
}

export function AssetLibraryDialog({
  open,
  onOpenChange,
  kind,
  onSelect,
  locked = false,
  lockReason = "Assets are locked while the course is in review.",
}: AssetLibraryDialogProps) {
  const [search, setSearch] = useState("");
  const [source, setSource] = useState<"all" | "uploaded" | "ai">("all");
  const [scope, setScope] = useState<"any" | "me">("any");
  const [sort, setSort] = useState<"newest" | "oldest" | "name">("newest");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { title, description, Icon, label } = KIND_META[kind];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = MOCK_ASSETS.filter((a) => a.kind === kind);
    if (source !== "all") list = list.filter((a) => a.source === source);
    if (scope === "me") list = list.filter((a) => a.addedByMe);
    if (q) {
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q)) ||
          (a.meta?.toLowerCase().includes(q) ?? false)
      );
    }
    list = [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      const at = new Date(a.addedDate).getTime();
      const bt = new Date(b.addedDate).getTime();
      return sort === "newest" ? bt - at : at - bt;
    });
    return list;
  }, [kind, search, source, scope, sort]);

  const selected = filtered.find((a) => a.id === selectedId) ?? filtered[0] ?? null;

  const handleInsert = () => {
    if (!selected || locked) return;
    onSelect(selected.url, selected.name);
    onOpenChange(false);
    resetLocal();
  };

  const resetLocal = () => {
    setSearch("");
    setSource("all");
    setScope("any");
    setSort("newest");
    setSelectedId(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetLocal();
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[86rem] w-[95vw] h-[92vh] flex flex-col overflow-hidden p-0 gap-0">
        <DialogHeader className="flex-shrink-0 px-6 pt-4 pb-3 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-primary" aria-hidden="true" focusable="false" />
            </div>
            <div>
              <DialogTitle className="text-lg">{title}</DialogTitle>
              <DialogDescription className="text-sm">{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex-shrink-0 px-6 py-3 border-b border-border/60 flex flex-wrap items-center gap-2.5 bg-muted/20">
          <div className="relative flex-1 max-w-[320px] min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder={`Search ${label} by name or tag…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-9 rounded-full bg-background"
              aria-label={`Search ${label}`}
            />
          </div>

          <Select value={source} onValueChange={(v) => setSource(v as typeof source)}>
            <SelectTrigger className="h-9 rounded-full w-[170px] bg-background" aria-label="Filter by source">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              <SelectItem value="uploaded">
                <span className="inline-flex items-center gap-2"><Upload className="w-3.5 h-3.5" aria-hidden="true" /> Uploaded</span>
              </SelectItem>
              <SelectItem value="ai">
                <span className="inline-flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> AI-generated</span>
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={scope} onValueChange={(v) => setScope(v as typeof scope)}>
            <SelectTrigger className="h-9 rounded-full w-[170px] bg-background" aria-label="Filter by author">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">
                <span className="inline-flex items-center gap-2"><Users className="w-3.5 h-3.5" aria-hidden="true" /> Added by anyone</span>
              </SelectItem>
              <SelectItem value="me">
                <span className="inline-flex items-center gap-2"><User className="w-3.5 h-3.5" aria-hidden="true" /> Added by me</span>
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
            <SelectTrigger className="h-9 rounded-full w-[150px] bg-background" aria-label="Sort assets">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="name">Name (A–Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Body: grid + preview */}
        <div className="flex-1 flex min-h-0">
          {/* Grid pane */}
          <div className="flex-1 min-w-0 flex flex-col border-r border-border/60">
            {filtered.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-2">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                  <Search className="w-6 h-6 text-muted-foreground" aria-hidden="true" />
                </div>
                <p className="text-sm font-medium text-foreground">No assets found</p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Try adjusting your filters or upload a new file to get started.
                </p>
              </div>
            ) : (
              <ScrollArea className="flex-1">
                <div className={cn(
                  "p-4 grid gap-3",
                  kind === "image"
                    ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                    : "grid-cols-1 sm:grid-cols-2"
                )}>
                  {filtered.map((asset) => (
                    <AssetCard
                      key={asset.id}
                      asset={asset}
                      isSelected={selected?.id === asset.id}
                      onSelect={() => setSelectedId(asset.id)}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Preview pane */}
          <aside className="w-[320px] flex-shrink-0 hidden md:flex flex-col bg-muted/10">
            {selected ? (
              <>
                <div className="flex-1 min-h-0 overflow-auto p-4 space-y-4">
                  <AssetPreview asset={selected} />
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground break-words">{selected.name}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {selected.source === "ai" ? (
                          <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary hover:bg-primary/10">
                            <Sparkles className="w-3 h-3" aria-hidden="true" /> AI-generated
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <Upload className="w-3 h-3" aria-hidden="true" /> Uploaded
                          </Badge>
                        )}
                        {selected.tags.slice(0, 3).map((t) => (
                          <Badge key={t} variant="outline" className="text-[10px] font-normal">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <dl className="text-xs space-y-1.5 rounded-lg border border-border/60 bg-background p-3">
                      <PreviewRow label="Type" value={KIND_META[selected.kind].label.slice(0, -1) || selected.kind} />
                      <PreviewRow label="Size" value={selected.size} />
                      {selected.meta && <PreviewRow label="Details" value={selected.meta} />}
                      <PreviewRow label="Added by" value={selected.addedBy} />
                      <PreviewRow label="Added on" value={formatDate(selected.addedDate)} />
                    </dl>
                  </div>
                </div>

                <div className="border-t border-border/60 p-3 bg-background">
                  {locked && (
                    <p className="text-[11px] text-muted-foreground text-center mb-2">{lockReason}</p>
                  )}
                  <Button
                    onClick={handleInsert}
                    disabled={locked}
                    className="w-full rounded-full h-9"
                    aria-label={`Insert ${selected.name}`}
                  >
                    <Check className="w-4 h-4 mr-1.5" aria-hidden="true" />
                    Insert asset
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-6">
                <p className="text-xs text-muted-foreground">Select an asset to preview</p>
              </div>
            )}
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ————————————————————————————————————————————————————————————
// Sub-components
// ————————————————————————————————————————————————————————————

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <dt className="w-16 flex-shrink-0 text-muted-foreground">{label}</dt>
      <dd className="flex-1 text-foreground break-words">{value}</dd>
    </div>
  );
}

function AssetCard({
  asset,
  isSelected,
  onSelect,
}: {
  asset: LibraryAsset;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative text-left rounded-xl border bg-card overflow-hidden transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected
          ? "border-primary ring-2 ring-primary/30 shadow-sm"
          : "border-border hover:border-primary/60 hover:shadow-sm"
      )}
      aria-label={`Select ${asset.name}`}
      aria-pressed={isSelected}
    >
      {asset.kind === "image" ? (
        <div className="aspect-square bg-muted overflow-hidden">
          <img
            src={asset.url}
            alt={asset.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
      ) : (
        <div className="aspect-[16/9] bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center relative">
          <MediaTypeGlyph kind={asset.kind} />
        </div>
      )}

      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow">
          <Check className="w-3.5 h-3.5" aria-hidden="true" />
        </div>
      )}

      {asset.source === "ai" && (
        <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/90 backdrop-blur-sm border border-primary/30 text-primary text-[10px] font-medium shadow-sm">
          <Sparkles className="w-2.5 h-2.5" aria-hidden="true" /> AI
        </div>
      )}

      <div className="px-3 py-2.5 border-t border-border/60">
        <p className="text-xs font-medium text-foreground truncate">{asset.name}</p>
        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
          {asset.size}
          {asset.meta ? ` · ${asset.meta}` : ""}
        </p>
      </div>
    </button>
  );
}

function MediaTypeGlyph({ kind }: { kind: AssetKind }) {
  if (kind === "video") {
    return (
      <div className="w-12 h-12 rounded-full bg-background/90 flex items-center justify-center shadow-sm">
        <Play className="w-5 h-5 text-primary fill-primary" aria-hidden="true" />
      </div>
    );
  }
  if (kind === "audio") {
    return (
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <Mic className="w-5 h-5 text-primary" aria-hidden="true" />
      </div>
    );
  }
  return (
    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
      <FileText className="w-5 h-5 text-primary" aria-hidden="true" />
    </div>
  );
}

function AssetPreview({ asset }: { asset: LibraryAsset }) {
  if (asset.kind === "image") {
    return (
      <div className="rounded-lg overflow-hidden border border-border/60 bg-background">
        <img src={asset.url} alt={asset.name} className="w-full h-auto object-contain max-h-[220px]" />
      </div>
    );
  }
  if (asset.kind === "video") {
    return (
      <div className="rounded-lg overflow-hidden border border-border/60 bg-black">
        <video src={asset.url} controls className="w-full h-auto max-h-[220px]" />
      </div>
    );
  }
  if (asset.kind === "audio") {
    return (
      <div className="rounded-lg border border-border/60 bg-background p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Mic className="w-4 h-4 text-primary" aria-hidden="true" />
          </div>
          <p className="text-xs text-muted-foreground truncate flex-1">Preview audio</p>
        </div>
        <audio src={asset.url} controls className="w-full" />
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-border/60 bg-background p-6 flex flex-col items-center gap-2">
      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
        <FileText className="w-6 h-6 text-primary" aria-hidden="true" />
      </div>
      <p className="text-xs text-muted-foreground">{asset.meta || "Document"}</p>
    </div>
  );
}
