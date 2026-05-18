import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import {
  Upload,
  ImagePlus,
  Sparkles,
  Trash2,
  Settings as SettingsIcon,
  Plus,
  Pencil,
  Link as LinkIcon,
  ImageIcon,
  Info,
  HelpCircle,
  Star,
  Heart,
  Flag,
  Bookmark,
  MapPin,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  Eye,
  Zap,
  type LucideIcon as LucideIconType,
} from "lucide-react";
import { AISparkles } from "@/components/ui/ai-sparkles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverAnchor,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { MiniRichTextEditor } from "./MiniRichTextEditor";
import { sanitizeHtml } from "@/lib/sanitize";
import { cn } from "@/lib/utils";

const MAX_IMAGE_MB = 10;
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=1200&q=80";

/** Curated icon set users can pick for hotspot markers */
const HOTSPOT_ICONS: { id: string; label: string; icon: LucideIconType }[] = [
  { id: "plus", label: "Plus", icon: Plus },
  { id: "info", label: "Info", icon: Info },
  { id: "help", label: "Help", icon: HelpCircle },
  { id: "star", label: "Star", icon: Star },
  { id: "heart", label: "Heart", icon: Heart },
  { id: "flag", label: "Flag", icon: Flag },
  { id: "bookmark", label: "Bookmark", icon: Bookmark },
  { id: "pin", label: "Pin", icon: MapPin },
  { id: "lightbulb", label: "Idea", icon: Lightbulb },
  { id: "alert", label: "Alert", icon: AlertCircle },
  { id: "check", label: "Check", icon: CheckCircle2 },
  { id: "eye", label: "Eye", icon: Eye },
  { id: "zap", label: "Zap", icon: Zap },
];

export function getHotspotIcon(id?: string): LucideIconType {
  return HOTSPOT_ICONS.find((i) => i.id === id)?.icon ?? Plus;
}

export interface HotspotItem {
  id: string;
  /** percentage units (0..100) of image dimensions */
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  /** sanitized HTML */
  description: string;
  imageUrl?: string;
  linkUrl?: string;
  /** Per-hotspot marker icon id (from HOTSPOT_ICONS). Defaults to "plus". */
  icon?: string;
  /** Marker icon pixel size. */
  iconSize?: number;
  /** Marker icon color (hex / rgb). */
  iconColor?: string;
}


interface HotspotData {
  imageUrl: string;
  hotspots: HotspotItem[];
  /** UI settings */
  settings?: {
    color?: string; // hsl color
    shape?: "rect" | "circle";
    opacity?: number; // 0..1
  };
}

interface HotspotBlockProps {
  content: string;
  onChange: (content: string) => void;
  aiEnabled?: boolean;
}

function parseContent(content: string): HotspotData {
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === "object") {
      return {
        imageUrl: parsed.imageUrl || "",
        hotspots: Array.isArray(parsed.hotspots) ? parsed.hotspots : [],
        settings: parsed.settings || { color: "hsl(211, 100%, 50%)", shape: "rect", opacity: 0.35 },
      };
    }
  } catch {
    /* noop */
  }
  return { imageUrl: "", hotspots: [], settings: { color: "hsl(211, 100%, 50%)", shape: "rect", opacity: 0.35 } };
}

function uid() {
  return `hs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function HotspotBlock({ content, onChange, aiEnabled }: HotspotBlockProps) {
  const data = useMemo(() => parseContent(content), [content]);
  const { imageUrl, hotspots, settings } = data;
  const color = settings?.color ?? "hsl(211, 100%, 50%)";
  const opacity = settings?.opacity ?? 0.35;
  const shape = settings?.shape ?? "rect";

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);

  const [isDragOver, setIsDragOver] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingHotspot, setEditingHotspot] = useState<HotspotItem | null>(null);

  // creation drag state (% units)
  const [draftRect, setDraftRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  // resize state
  const resizeRef = useRef<{ id: string; startX: number; startY: number; orig: HotspotItem; bounds: DOMRect } | null>(null);
  // move state
  const moveRef = useRef<{ id: string; startX: number; startY: number; orig: HotspotItem; bounds: DOMRect } | null>(null);

  const persist = useCallback(
    (patch: Partial<HotspotData>) => {
      const next: HotspotData = { ...data, ...patch };
      onChange(JSON.stringify(next));
    },
    [data, onChange]
  );

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > MAX_IMAGE_MB * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onload = () => {
        persist({ imageUrl: String(reader.result || ""), hotspots: [] });
      };
      reader.readAsDataURL(file);
    },
    [persist]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleGenerateSubmit = () => {
    setShowGenerateDialog(false);
    persist({ imageUrl: PLACEHOLDER_IMAGE, hotspots: [] });
    setImagePrompt("");
  };

  // === Drag on image to create hotspot ===
  const pointToPct = (e: React.PointerEvent | PointerEvent, bounds: DOMRect) => {
    const x = ((e.clientX - bounds.left) / bounds.width) * 100;
    const y = ((e.clientY - bounds.top) / bounds.height) * 100;
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  const onImagePointerDown = (e: React.PointerEvent) => {
    if (!imageWrapRef.current) return;
    if ((e.target as HTMLElement).closest("[data-hotspot]")) return;
    e.preventDefault();
    setSelectedId(null);
    const bounds = imageWrapRef.current.getBoundingClientRect();
    const p = pointToPct(e, bounds);
    dragStartRef.current = p;
    setDraftRect({ x: p.x, y: p.y, w: 0, h: 0 });
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };
  const onImagePointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current || !imageWrapRef.current) return;
    const bounds = imageWrapRef.current.getBoundingClientRect();
    const p = pointToPct(e, bounds);
    const x = Math.min(p.x, dragStartRef.current.x);
    const y = Math.min(p.y, dragStartRef.current.y);
    const w = Math.abs(p.x - dragStartRef.current.x);
    const h = Math.abs(p.y - dragStartRef.current.y);
    setDraftRect({ x, y, w, h });
  };
  const onImagePointerUp = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
    const d = draftRect;
    dragStartRef.current = null;
    setDraftRect(null);
    if (!d || d.w < 2 || d.h < 2) {
      // treat as click — create a default small hotspot at the click point
      if (d) {
        const newHs: HotspotItem = {
          id: uid(),
          x: Math.max(0, d.x - 5),
          y: Math.max(0, d.y - 5),
          width: 10,
          height: 10,
          title: `Hotspot ${hotspots.length + 1}`,
          description: "<p>Add your hotspot description here…</p>",
        };
        persist({ hotspots: [...hotspots, newHs] });
        setSelectedId(newHs.id);
        setEditingHotspot(newHs);
      }
      return;
    }
    const newHs: HotspotItem = {
      id: uid(),
      x: d.x,
      y: d.y,
      width: d.w,
      height: d.h,
      title: `Hotspot ${hotspots.length + 1}`,
      description: "<p>Add your hotspot description here…</p>",
    };
    persist({ hotspots: [...hotspots, newHs] });
    setSelectedId(newHs.id);
    setEditingHotspot(newHs);
  };

  // === Resize / move existing hotspot ===
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (resizeRef.current) {
        const r = resizeRef.current;
        const p = pointToPct(e as any, r.bounds);
        const w = Math.max(2, p.x - r.orig.x);
        const h = Math.max(2, p.y - r.orig.y);
        persist({
          hotspots: hotspots.map((hs) => (hs.id === r.id ? { ...hs, width: Math.min(100 - hs.x, w), height: Math.min(100 - hs.y, h) } : hs)),
        });
      } else if (moveRef.current) {
        const r = moveRef.current;
        const dx = ((e.clientX - r.startX) / r.bounds.width) * 100;
        const dy = ((e.clientY - r.startY) / r.bounds.height) * 100;
        const nx = Math.max(0, Math.min(100 - r.orig.width, r.orig.x + dx));
        const ny = Math.max(0, Math.min(100 - r.orig.height, r.orig.y + dy));
        persist({
          hotspots: hotspots.map((hs) => (hs.id === r.id ? { ...hs, x: nx, y: ny } : hs)),
        });
      }
    };
    const onUp = () => {
      resizeRef.current = null;
      moveRef.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [hotspots, persist]);

  const startMove = (e: React.PointerEvent, hs: HotspotItem) => {
    if (!imageWrapRef.current) return;
    e.stopPropagation();
    setSelectedId(hs.id);
    moveRef.current = {
      id: hs.id,
      startX: e.clientX,
      startY: e.clientY,
      orig: hs,
      bounds: imageWrapRef.current.getBoundingClientRect(),
    };
  };

  const startResize = (e: React.PointerEvent, hs: HotspotItem) => {
    if (!imageWrapRef.current) return;
    e.stopPropagation();
    setSelectedId(hs.id);
    resizeRef.current = {
      id: hs.id,
      startX: e.clientX,
      startY: e.clientY,
      orig: hs,
      bounds: imageWrapRef.current.getBoundingClientRect(),
    };
  };

  const deleteHotspot = (id: string) => {
    persist({ hotspots: hotspots.filter((h) => h.id !== id) });
    setSelectedId(null);
  };

  const replaceImage = () => fileInputRef.current?.click();
  const removeImage = () => persist({ imageUrl: "", hotspots: [] });

  // ===== Empty state =====
  if (!imageUrl) {
    return (
      <>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          className={cn(
            "flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed py-12 px-6 transition-all duration-200",
            isDragOver
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-foreground/20 hover:border-primary/50 bg-background/80"
          )}
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <ImagePlus className="w-6 h-6 text-primary" aria-hidden="true" focusable="false" />
          </div>
          <div className="text-center">
            <p className="text-sm text-foreground font-medium">Choose background image</p>
            <p className="text-xs text-muted-foreground mt-1">
              Upload an image to make it clickable with hotspots
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              size="sm"
              variant="default"
              className="rounded-full px-5 gap-1.5 h-9"
              onClick={replaceImage}
            >
              <Upload className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
              Upload Image
            </Button>
            {aiEnabled && (
              <Button
                size="sm"
                variant="secondary"
                className="rounded-full px-5 gap-1.5 h-9 bg-primary/10 text-primary hover:bg-primary/20 border-0"
                onClick={() => setShowGenerateDialog(true)}
              >
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                Generate with AI
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Recommended width: 880px · Max size: {MAX_IMAGE_MB} MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>

        <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2.5 text-base font-semibold">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <AISparkles className="w-4 h-4" />
                </div>
                Generate background image
              </DialogTitle>
              <DialogDescription>
                Describe the image you want to generate for your hotspots.
              </DialogDescription>
            </DialogHeader>
            <textarea
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              placeholder="e.g., A labeled diagram of the human heart…"
              className="w-full rounded-xl border border-border/60 bg-muted/10 p-4 text-sm min-h-[120px] focus:outline-none focus:border-foreground/20"
              aria-label="Image generation prompt"
            />
            <DialogFooter>
              <Button variant="outline" size="sm" className="rounded-full px-4" onClick={() => setShowGenerateDialog(false)}>
                Cancel
              </Button>
              <Button size="sm" className="rounded-full px-4" onClick={handleGenerateSubmit}>
                Generate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // ===== With image =====
  return (
    <>
      <div className="rounded-lg border border-border/60 bg-background overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/60 bg-muted/30">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Plus className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
            <span>Click or drag on the image to add a hotspot</span>
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 rounded-full px-3 gap-1.5 text-xs" onClick={replaceImage}>
                  <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                  Replace
                </Button>
              </TooltipTrigger>
              <TooltipContent>Replace background image</TooltipContent>
            </Tooltip>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 rounded-full px-3 gap-1.5 text-xs" aria-label="Hotspot settings">
                  <SettingsIcon className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                  Settings
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3 space-y-3" align="end">
                <div>
                  <Label className="text-xs font-medium">Hotspot color</Label>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {[
                      "hsl(211, 100%, 50%)",
                      "hsl(0, 84%, 60%)",
                      "hsl(142, 71%, 45%)",
                      "hsl(38, 92%, 50%)",
                      "hsl(270, 70%, 60%)",
                      "hsl(220, 13%, 28%)",
                    ].map((c) => (
                      <button
                        key={c}
                        type="button"
                        aria-label={`Set color ${c}`}
                        onClick={() => persist({ settings: { ...settings, color: c } })}
                        className={cn(
                          "w-6 h-6 rounded-full border-2 transition-all",
                          color === c ? "border-foreground scale-110" : "border-transparent"
                        )}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium">Shape</Label>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {(["rect", "circle"] as const).map((s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant={shape === s ? "default" : "outline"}
                        className="h-7 rounded-full px-3 text-xs capitalize"
                        onClick={() => persist({ settings: { ...settings, shape: s } })}
                      >
                        {s === "rect" ? "Rectangle" : "Circle"}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium">Highlight opacity</Label>
                  <Slider
                    className="mt-2"
                    value={[Math.round(opacity * 100)]}
                    min={10}
                    max={80}
                    step={5}
                    onValueChange={(v) => persist({ settings: { ...settings, opacity: (v[0] ?? 35) / 100 } })}
                  />
                </div>
                <div className="pt-1 border-t border-border/60">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-destructive hover:text-destructive rounded-full h-8 text-xs"
                    onClick={removeImage}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" focusable="false" />
                    Remove image
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Image surface */}
        <div className="relative bg-muted/20 select-none">
          <div
            ref={imageWrapRef}
            className="relative w-full"
            onPointerDown={onImagePointerDown}
            onPointerMove={onImagePointerMove}
            onPointerUp={onImagePointerUp}
            style={{ cursor: "crosshair" }}
          >
            <img
              src={imageUrl}
              alt="Hotspot background"
              draggable={false}
              className="block w-full h-auto select-none pointer-events-none"
            />

            {/* Existing hotspots */}
            {hotspots.map((hs, idx) => {
              const isSelected = selectedId === hs.id;
              const isEditingThis = editingHotspot?.id === hs.id;
              const isCircle = shape === "circle";
              const HsIcon = getHotspotIcon(hs.icon);
              const iconSize = hs.iconSize ?? 16;
              const iconColor = hs.iconColor ?? color;
              return (
                <Popover
                  key={hs.id}
                  open={isEditingThis}
                  onOpenChange={(open) => {
                    if (!open) setEditingHotspot(null);
                  }}
                >
                  <PopoverAnchor asChild>
                    <div
                      data-hotspot
                      role="button"
                      tabIndex={0}
                      aria-label={hs.title}
                      onPointerDown={(e) => startMove(e, hs)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedId(hs.id);
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditingHotspot(hs);
                      }}
                      className={cn(
                        "absolute group/hs flex items-center justify-center transition-all cursor-move",
                      )}
                      style={{
                        left: `${hs.x}%`,
                        top: `${hs.y}%`,
                        width: `${hs.width}%`,
                        height: `${hs.height}%`,
                        background: `linear-gradient(135deg, hsla(211, 100%, 75%, 0.28) 0%, hsla(211, 100%, 80%, 0.16) 50%, hsla(211, 100%, 90%, 0.08) 100%)`,
                        borderColor: color,
                        borderWidth: isSelected ? 2 : 1.5,
                        borderStyle: "solid",
                        borderRadius: isCircle ? "9999px" : 8,
                        boxShadow: isSelected
                          ? `0 2px 6px -2px ${color}, inset 0 1px 0 0 hsla(0,0%,100%,0.20)`
                          : `0 1px 3px -1px ${color}, inset 0 1px 0 0 hsla(0,0%,100%,0.14)`,
                      }}
                    >
                      <span
                        className="relative flex items-center justify-center rounded-full bg-white transition-colors"
                        style={{
                          width: iconSize + 14,
                          height: iconSize + 14,
                          border: `2px solid ${iconColor}`,
                        }}
                        aria-label={`Hotspot ${idx + 1}`}
                      >
                        <HsIcon style={{ width: iconSize, height: iconSize, color: iconColor }} strokeWidth={2.5} aria-hidden="true" focusable="false" />
                      </span>

                      {/* Action buttons when selected (only when popover closed) */}
                      {isSelected && !isEditingThis && (
                        <div
                          className="absolute -top-9 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-background border border-border/60 rounded-full shadow-md px-1 py-0.5 z-10"
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 rounded-full px-2 gap-1 text-xs"
                            onClick={() => setEditingHotspot(hs)}
                          >
                            <Pencil className="w-3 h-3" aria-hidden="true" focusable="false" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 rounded-full p-0 text-destructive hover:text-destructive"
                            aria-label="Delete hotspot"
                            onClick={() => deleteHotspot(hs.id)}
                          >
                            <Trash2 className="w-3 h-3" aria-hidden="true" focusable="false" />
                          </Button>
                        </div>
                      )}

                      {/* Resize handle */}
                      {isSelected && (
                        <div
                          onPointerDown={(e) => startResize(e, hs)}
                          className="absolute -right-1.5 -bottom-1.5 w-3 h-3 rounded-full border-2 border-background cursor-se-resize"
                          style={{ background: color }}
                          aria-label="Resize hotspot"
                          role="button"
                          tabIndex={-1}
                        />
                      )}
                    </div>
                  </PopoverAnchor>

                  <PopoverContent
                    side="right"
                    align="start"
                    sideOffset={14}
                    collisionPadding={16}
                    className="w-[400px] p-0 overflow-hidden rounded-2xl shadow-2xl border-border/60"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onInteractOutside={(e) => {
                      const target = e.target as HTMLElement | null;
                      if (target?.closest('[data-tiptap-bubble-menu]')) {
                        e.preventDefault();
                      }
                    }}
                    onFocusOutside={(e) => {
                      const target = e.target as HTMLElement | null;
                      if (target?.closest('[data-tiptap-bubble-menu]')) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {editingHotspot && editingHotspot.id === hs.id && (
                      <HotspotEditCard
                        value={hs}
                        onChange={(next) => {
                          persist({
                            hotspots: hotspots.map((h) => (h.id === hs.id ? next : h)),
                          });
                        }}
                        onDone={() => setEditingHotspot(null)}
                        onCancel={() => setEditingHotspot(null)}
                      />
                    )}
                  </PopoverContent>
                </Popover>
              );
            })}


            {/* Draft selection during drag */}
            {draftRect && draftRect.w > 0 && draftRect.h > 0 && (
              <div
                className="absolute border-2 border-dashed pointer-events-none"
                style={{
                  left: `${draftRect.x}%`,
                  top: `${draftRect.y}%`,
                  width: `${draftRect.w}%`,
                  height: `${draftRect.h}%`,
                  borderColor: color,
                  background: color.replace(")", ` / ${opacity * 0.6})`).replace("hsl(", "hsla("),
                  borderRadius: shape === "circle" ? "9999px" : 6,
                }}
              />
            )}
          </div>
        </div>

        {/* Footer summary */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-border/60 bg-muted/20">
          <p className="text-xs text-muted-foreground">
            {hotspots.length} hotspot{hotspots.length === 1 ? "" : "s"}
          </p>
          {selectedId && (
            <p className="text-[11px] text-muted-foreground">
              Click outside to deselect · Drag the handle to resize
            </p>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />

    </>
  );
}

// ===== HotspotEditCard — popover content for editing a single hotspot =====

interface HotspotEditCardProps {
  value: HotspotItem;
  onChange: (next: HotspotItem) => void;
  onDone: () => void;
  onCancel: () => void;
}

function HotspotEditCard({ value, onChange, onDone, onCancel }: HotspotEditCardProps) {
  const iconId = value.icon ?? "plus";
  const iconSize = value.iconSize ?? 16;
  const iconColor = value.iconColor ?? "#ffffff";
  const PreviewIcon = getHotspotIcon(iconId);

  return (
    <div className="flex flex-col h-[520px] max-h-[80vh] bg-background">
      {/* Header with live marker preview */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-3 border-b border-border/60 bg-gradient-to-b from-muted/40 to-transparent">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="relative flex items-center justify-center rounded-full bg-white shrink-0 h-8 w-8 border-2 border-primary"
            aria-hidden="true"
          >
            <Pencil className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground leading-tight truncate">
              {value.title || "Edit hotspot"}
            </p>
            <p className="text-[11px] text-muted-foreground leading-tight">Configure content and marker style</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 rounded-full text-muted-foreground hover:text-foreground shrink-0"
          aria-label="Close"
          onClick={onCancel}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M6 18L18 6" />
          </svg>
        </Button>
      </div>

      <Tabs defaultValue="content" className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Segmented toggle tabs (Outline/Blocks style) */}
        <div className="px-4 pt-3 pb-2">
          <TabsList className="grid grid-cols-2 w-full h-auto rounded-full bg-foreground/[0.06] border border-border/50 p-[3px]">
            <TabsTrigger
              value="content"
              className="relative z-10 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-full text-muted-foreground transition-colors duration-300 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_-1px_rgba(0,0,0,0.05)]"
            >
              <Pencil className="w-3 h-3" aria-hidden="true" focusable="false" />
              Content
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="relative z-10 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-full text-muted-foreground transition-colors duration-300 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_-1px_rgba(0,0,0,0.05)]"
            >
              <SettingsIcon className="w-3 h-3" aria-hidden="true" focusable="false" />
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="content"
          forceMount
          className="flex-1 min-h-0 overflow-y-auto m-0 px-4 pb-4 data-[state=inactive]:hidden"
        >
          <div className="flex flex-col h-full space-y-1.5">
            <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Description</Label>
            <div className="flex-1 min-h-0">
              <MiniRichTextEditor
                content={value.description}
                onChange={(val) => onChange({ ...value, description: val })}
                placeholder="Describe this hotspot…"
                maxHeight={9999}
                maxLength={300}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="settings"
          forceMount
          className="flex-1 min-h-0 overflow-y-auto m-0 px-4 pb-4 space-y-4 data-[state=inactive]:hidden"
        >
          {/* Icon picker */}
          <div className="space-y-2">
            <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Marker icon</Label>
            <div className="grid grid-cols-7 gap-1.5">
              {HOTSPOT_ICONS.map(({ id, label, icon: Icon }) => {
                const active = iconId === id;
                return (
                  <Tooltip key={id}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label={label}
                        aria-pressed={active}
                        onClick={() => onChange({ ...value, icon: id })}
                        className={cn(
                          "h-9 w-9 rounded-lg flex items-center justify-center transition-all border",
                          active
                            ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105"
                            : "bg-background text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground hover:bg-muted/40"
                        )}
                      >
                        <Icon className="w-4 h-4" aria-hidden="true" focusable="false" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">{label}</TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>

          {/* Icon size — modern chip selector */}
          <div className="space-y-2">
            <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Icon size</Label>
            <div className="grid grid-cols-4 gap-1.5 rounded-xl bg-muted p-1">
              {[
                { id: "sm", label: "S", size: 12, dot: 10 },
                { id: "md", label: "M", size: 16, dot: 14 },
                { id: "lg", label: "L", size: 22, dot: 18 },
                { id: "xl", label: "XL", size: 30, dot: 24 },
              ].map((opt) => {
                const active = iconSize === opt.size;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    aria-label={`Size ${opt.label}`}
                    aria-pressed={active}
                    onClick={() => onChange({ ...value, iconSize: opt.size })}
                    className={cn(
                      "h-12 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all",
                      active
                        ? "bg-background text-foreground shadow-sm ring-1 ring-primary/30"
                        : "text-muted-foreground hover:bg-background/60"
                    )}
                  >
                    <span
                      className="rounded-full"
                      style={{
                        width: opt.dot,
                        height: opt.dot,
                        background: active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.5)",
                      }}
                      aria-hidden="true"
                    />
                    <span className="text-[10px] font-semibold tracking-wide">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Icon color */}
          <div className="space-y-2">
            <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Icon color</Label>
            <div className="flex items-center gap-2">
              <label
                className="relative h-9 w-9 rounded-lg border border-border/60 cursor-pointer overflow-hidden shrink-0 shadow-inner"
                style={{ background: iconColor }}
                aria-label="Pick icon color"
              >
                <input
                  type="color"
                  value={/^#([0-9a-f]{6})$/i.test(iconColor) ? iconColor : "#ffffff"}
                  onChange={(e) => onChange({ ...value, iconColor: e.target.value })}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  aria-label="Icon color picker"
                />
              </label>
              <Input
                value={iconColor}
                onChange={(e) => onChange({ ...value, iconColor: e.target.value })}
                placeholder="#ffffff"
                className="h-9 rounded-lg text-sm font-mono"
                aria-label="Icon color value"
              />
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              {["#3b82f6", "#000000", "#ef4444", "#22c55e", "#f59e0b", "#a855f7", "#0ea5e9"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChange({ ...value, iconColor: c })}
                  aria-label={`Use color ${c}`}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-all",
                    iconColor.toLowerCase() === c ? "border-foreground scale-110 shadow-sm" : "border-border/40 hover:scale-105"
                  )}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border/60 bg-muted/30">
        <Button variant="outline" size="sm" className="rounded-full px-4 h-8" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" className="rounded-full px-4 h-8" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}

