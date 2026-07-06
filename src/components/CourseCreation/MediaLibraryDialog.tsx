import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, FileText, Mic, Video, Play } from "lucide-react";

type MediaType = "video" | "audio" | "doc";

interface MediaLibraryItem {
  id: number;
  url: string;
  title: string;
  category: string;
  meta?: string;
}

const LIBRARIES: Record<MediaType, MediaLibraryItem[]> = {
  video: [
    { id: 1, url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", title: "Big Buck Bunny", category: "Animation", meta: "9:56" },
    { id: 2, url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", title: "Elephants Dream", category: "Animation", meta: "10:53" },
    { id: 3, url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", title: "For Bigger Blazes", category: "Promo", meta: "0:15" },
    { id: 4, url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", title: "For Bigger Escapes", category: "Promo", meta: "0:15" },
    { id: 5, url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", title: "For Bigger Fun", category: "Promo", meta: "0:60" },
    { id: 6, url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4", title: "Sintel", category: "Animation", meta: "14:48" },
  ],
  audio: [
    { id: 1, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", title: "Ambient Intro", category: "Background", meta: "6:12" },
    { id: 2, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", title: "Reflective Loop", category: "Background", meta: "6:38" },
    { id: 3, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", title: "Upbeat Motion", category: "Podcast", meta: "5:24" },
    { id: 4, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", title: "Focus Session", category: "Podcast", meta: "7:03" },
    { id: 5, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", title: "Deep Thought", category: "Narration", meta: "6:02" },
    { id: 6, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", title: "Bright Morning", category: "Narration", meta: "6:29" },
  ],
  doc: [
    { id: 1, url: "https://www.africau.edu/images/default/sample.pdf", title: "Course Handbook", category: "Reference", meta: "PDF" },
    { id: 2, url: "https://www.orimi.com/pdf-test.pdf", title: "Style Guide", category: "Reference", meta: "PDF" },
    { id: 3, url: "https://file-examples.com/storage/fe3abb0cc968f2fc93a4d47/2017/10/file-sample_150kB.pdf", title: "Lesson Worksheet", category: "Worksheet", meta: "PDF" },
    { id: 4, url: "https://www.clickdimensions.com/links/TestPDFfile.pdf", title: "Quick Reference Card", category: "Reference", meta: "PDF" },
    { id: 5, url: "https://www.africau.edu/images/default/sample.pdf", title: "Instructor Notes", category: "Notes", meta: "PDF" },
    { id: 6, url: "https://www.orimi.com/pdf-test.pdf", title: "Assessment Rubric", category: "Assessment", meta: "PDF" },
  ],
};

const TYPE_META: Record<MediaType, { title: string; description: string; Icon: typeof FileText; accent: string }> = {
  video: { title: "Video Library", description: "Pick a video from your saved collection", Icon: Video, accent: "text-primary" },
  audio: { title: "Audio Library", description: "Pick an audio track from your saved collection", Icon: Mic, accent: "text-primary" },
  doc: { title: "Document Library", description: "Pick a document from your saved collection", Icon: FileText, accent: "text-primary" },
};

interface MediaLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: MediaType;
  onSelect: (url: string, title: string) => void;
}

export function MediaLibraryDialog({ open, onOpenChange, type, onSelect }: MediaLibraryDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { title, description, Icon } = TYPE_META[type];
  const items = LIBRARIES[type];

  const filtered = items.filter(
    (i) =>
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (item: MediaLibraryItem) => {
    onSelect(item.url, item.title);
    onOpenChange(false);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[90vw] h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Search by title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              aria-label={`Search ${title}`}
            />
          </div>

          <ScrollArea className="flex-1 rounded-md border">
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-all hover:border-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                    {type === "video" ? (
                      <Play className="w-5 h-5 text-primary" aria-hidden="true" />
                    ) : (
                      <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.category}
                      {item.meta ? ` · ${item.meta}` : ""}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Search className="w-12 h-12 mb-2 opacity-50" aria-hidden="true" />
                <p className="text-sm">No results</p>
                <p className="text-xs">Try a different search term</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
