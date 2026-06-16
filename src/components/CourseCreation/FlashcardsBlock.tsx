import { useCallback, useMemo, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  Copy,
  GripVertical,
  Type as TypeIcon,
  Image as ImageIcon,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Grid2x2,
  Grid3x3,
  Square,
  Upload,
  RefreshCw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import "@/styles/flashcards.css";

const MAX_CARDS = 6;
const MAX_IMAGE_MB = 5;

export type FCSide = "front" | "back";
export type FCAlignment = "left" | "center" | "right";
export type FCContentType = "text" | "image";

export interface FCFormatting {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export interface FCSideData {
  contentType: FCContentType;
  text: string;
  textColor: string;
  textAlign: FCAlignment;
  formatting: FCFormatting;
  imageUrl: string;
  imageZoom: number; // 1..3
  imagePosX: number; // 0..100
  imagePosY: number; // 0..100
}

export interface FCCard {
  id: string;
  color: string; // background color (light + bright modern palette)
  front: FCSideData;
  back: FCSideData;
}

export interface FCData {
  cards: FCCard[];
  gridCols: 1 | 2 | 3;
  alignment: FCAlignment;
}

/** Light pastel + modern bright palette — text is always rendered using a contrast-checked color */
export const CARD_COLORS: { id: string; bg: string; fg: string; label: string }[] = [
  { id: "ivory", bg: "#FFFFFF", fg: "#1F2937", label: "Ivory" },
  { id: "sky", bg: "#E0F2FE", fg: "#0C4A6E", label: "Sky" },
  { id: "mint", bg: "#DCFCE7", fg: "#14532D", label: "Mint" },
  { id: "butter", bg: "#FEF3C7", fg: "#713F12", label: "Butter" },
  { id: "blush", bg: "#FFE4E6", fg: "#881337", label: "Blush" },
  { id: "lavender", bg: "#EDE9FE", fg: "#4C1D95", label: "Lavender" },
  { id: "coral", bg: "#FB7185", fg: "#FFFFFF", label: "Coral" },
  { id: "indigo", bg: "#4F46E5", fg: "#FFFFFF", label: "Indigo" },
  { id: "emerald", bg: "#059669", fg: "#FFFFFF", label: "Emerald" },
  { id: "amber", bg: "#F59E0B", fg: "#1F2937", label: "Amber" },
];

function getFg(bg: string): string {
  const found = CARD_COLORS.find((c) => c.bg.toLowerCase() === bg.toLowerCase());
  return found?.fg ?? "#1F2937";
}

function uid() {
  return `fc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function defaultSide(side: FCSide): FCSideData {
  return {
    contentType: "text",
    text: side === "front" ? "Front of card" : "Back of card",
    textColor: "",
    textAlign: "center",
    formatting: {},
    imageUrl: "",
    imageZoom: 1,
    imagePosX: 50,
    imagePosY: 50,
  };
}

function defaultCard(): FCCard {
  return {
    id: uid(),
    color: CARD_COLORS[0].bg,
    front: defaultSide("front"),
    back: defaultSide("back"),
  };
}

function parseContent(raw: string): FCData {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.cards) && parsed.cards.length > 0) {
      return {
        cards: parsed.cards.slice(0, MAX_CARDS).map((c: any) => ({
          id: c.id || uid(),
          color: c.color || CARD_COLORS[0].bg,
          front: { ...defaultSide("front"), ...(c.front || {}), formatting: { ...(c.front?.formatting || {}) } },
          back: { ...defaultSide("back"), ...(c.back || {}), formatting: { ...(c.back?.formatting || {}) } },
        })),
        gridCols: (parsed.gridCols === 1 || parsed.gridCols === 3 ? parsed.gridCols : 2) as 1 | 2 | 3,
        alignment: (["left", "center", "right"].includes(parsed.alignment) ? parsed.alignment : "center") as FCAlignment,
      };
    }
  } catch {
    /* noop */
  }
  return {
    cards: [defaultCard(), defaultCard()],
    gridCols: 2,
    alignment: "center",
  };
}

interface FlashcardsBlockProps {
  content: string;
  onChange: (content: string) => void;
}

export function FlashcardsBlock({ content, onChange }: FlashcardsBlockProps) {
  const data = useMemo(() => parseContent(content), [content]);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);

  const persist = useCallback(
    (next: FCData) => onChange(JSON.stringify(next)),
    [onChange]
  );

  const updateCard = (id: string, mut: (c: FCCard) => FCCard) => {
    persist({ ...data, cards: data.cards.map((c) => (c.id === id ? mut(c) : c)) });
  };

  const addCard = () => {
    if (data.cards.length >= MAX_CARDS) return;
    persist({ ...data, cards: [...data.cards, defaultCard()] });
  };

  const duplicateCard = (id: string) => {
    if (data.cards.length >= MAX_CARDS) return;
    const idx = data.cards.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const copy = { ...data.cards[idx], id: uid() };
    const next = [...data.cards];
    next.splice(idx + 1, 0, copy);
    persist({ ...data, cards: next });
  };

  const deleteCard = (id: string) => {
    if (data.cards.length <= 1) {
      // keep at least one
      persist({ ...data, cards: [defaultCard()] });
      return;
    }
    persist({ ...data, cards: data.cards.filter((c) => c.id !== id) });
  };

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const next = [...data.cards];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    persist({ ...data, cards: next });
  };

  const alignmentClass =
    data.alignment === "left" ? "justify-start" : data.alignment === "right" ? "justify-end" : "justify-center";

  return (
    <div className="w-full rounded-xl border border-border/60 bg-background overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/60 bg-muted/30 flex-wrap">
        <div className="flex items-center gap-1">
          {/* Alignment */}
          <div className="flex items-center gap-0.5">
            {(["left", "center", "right"] as FCAlignment[]).map((a) => {
              const Icon = a === "left" ? AlignLeft : a === "right" ? AlignRight : AlignCenter;
              return (
                <Tooltip key={a}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={data.alignment === a ? "secondary" : "ghost"}
                      size="icon"
                      className="h-7 w-7 rounded-full"
                      onClick={() => persist({ ...data, alignment: a })}
                      aria-label={`Align cards ${a}`}
                    >
                      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{`Align ${a}`}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>

        <Button
          size="sm"
          variant="default"
          className="h-8 rounded-full gap-1.5 text-xs"
          onClick={addCard}
          disabled={data.cards.length >= MAX_CARDS}
          aria-label="Add flashcard"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          Add card {data.cards.length >= MAX_CARDS ? "(max 6)" : ""}
        </Button>
      </div>

      {/* Cards grid — UNO-card sized, auto-wrap, same size regardless of count */}
      <div className={cn("p-4 flex flex-wrap gap-4", alignmentClass)}>
        {data.cards.map((card, idx) => {
          const isFlipped = !!flipped[card.id];
          const fg = card.front.textColor || getFg(card.color);
          const isEditing = editingCardId === card.id;

          return (
            <div
              key={card.id}
              style={{ width: 200 }}
              draggable
              onDragStart={() => (dragIndex.current = idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex.current !== null) reorder(dragIndex.current, idx);
                dragIndex.current = null;
              }}
              className="group/card"
            >
              {/* Card actions row */}
              <div
                className={cn(
                  "flex items-center justify-between mb-1.5 px-1 transition-opacity",
                  isEditing ? "opacity-100" : "opacity-60 group-hover/card:opacity-100"
                )}
              >
                <span
                  role="button"
                  tabIndex={0}
                  className={cn(
                    "inline-flex items-center text-[10px] cursor-grab active:cursor-grabbing gap-1 px-1.5 py-0.5 rounded-full transition-colors",
                    isEditing ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground"
                  )}
                  aria-label={`Reorder card ${idx + 1}`}
                >
                  <GripVertical className="w-3 h-3" aria-hidden="true" />
                  Card {idx + 1}
                </span>
                <div className="flex items-center gap-0.5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full" onClick={() => duplicateCard(card.id)} disabled={data.cards.length >= MAX_CARDS} aria-label="Duplicate card">
                        <Copy className="w-3 h-3" aria-hidden="true" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Duplicate</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full text-destructive hover:text-destructive" onClick={() => deleteCard(card.id)} aria-label="Delete card">
                        <Trash2 className="w-3 h-3" aria-hidden="true" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Flippable card — anchors the editor popover */}
              <Popover
                open={isEditing}
                onOpenChange={(o) => setEditingCardId(o ? card.id : null)}
              >
                <PopoverTrigger asChild>
                  <div
                    className={cn(
                      "fc-perspective rounded-2xl transition-all",
                      isEditing &&
                        "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.45)]"
                    )}
                  >
                    <div className={cn("fc-flipper", isFlipped && "fc-flipped")}>
                      <FlashcardFace
                        side={card.front}
                        bg={card.color}
                        defaultFg={fg}
                        onClick={() => setEditingCardId(card.id)}
                        label={`Card ${idx + 1} front — click to edit`}
                      />
                      <FlashcardFace
                        side={card.back}
                        bg={card.color}
                        defaultFg={getFg(card.color)}
                        onClick={() => setEditingCardId(card.id)}
                        label={`Card ${idx + 1} back — click to edit`}
                        isBack
                      />
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  side="right"
                  align="start"
                  sideOffset={14}
                  collisionPadding={16}
                  className="w-[320px] p-0 rounded-2xl border border-border/70 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden bg-card"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <CardEditor
                    card={card}
                    cardIndex={idx}
                    side={isFlipped ? "back" : "front"}
                    onFlipSide={() => setFlipped((f) => ({ ...f, [card.id]: !f[card.id] }))}
                    onClose={() => setEditingCardId(null)}
                    onChange={(mut) => updateCard(card.id, mut)}
                  />
                </PopoverContent>
              </Popover>

              {/* Flip control */}
              <div className="flex items-center justify-center mt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 rounded-full gap-1.5 text-[11px] text-muted-foreground hover:text-foreground"
                  onClick={() => setFlipped((f) => ({ ...f, [card.id]: !f[card.id] }))}
                  aria-label={isFlipped ? "Flip to front" : "Flip to back"}
                >
                  <RefreshCw className="w-3 h-3" aria-hidden="true" />
                  {isFlipped ? "Flip to front" : "Flip to back"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

}

function FlashcardFace({
  side,
  bg,
  defaultFg,
  onClick,
  label,
  isBack,
}: {
  side: FCSideData;
  bg: string;
  defaultFg: string;
  onClick: () => void;
  label: string;
  isBack?: boolean;
}) {
  const fg = side.textColor || defaultFg;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={label}
      className={cn(
        "fc-face rounded-2xl shadow-[0_4px_20px_-6px_rgba(0,0,0,0.15)] border border-dashed border-foreground/25 overflow-hidden cursor-pointer transition-shadow hover:shadow-[0_8px_28px_-6px_rgba(0,0,0,0.22)]",
        isBack && "fc-back"
      )}
      style={{ background: bg, color: fg }}
    >
      {side.contentType === "image" && side.imageUrl ? (
        <div className="w-full h-full overflow-hidden">
          <img
            src={side.imageUrl}
            alt=""
            className="w-full h-full object-cover"
            style={{
              transform: `scale(${side.imageZoom})`,
              transformOrigin: `${side.imagePosX}% ${side.imagePosY}%`,
            }}
            draggable={false}
          />
        </div>
      ) : (
        <div
          className={cn(
            "w-full h-full flex p-5",
            side.textAlign === "left" && "justify-start text-left",
            side.textAlign === "center" && "justify-center text-center",
            side.textAlign === "right" && "justify-end text-right",
            "items-center"
          )}
        >
          <p
            className={cn(
              "text-base leading-snug whitespace-pre-wrap break-words [overflow-wrap:anywhere]",
              side.formatting.bold && "font-bold",
              side.formatting.italic && "italic",
              side.formatting.underline && "underline"
            )}
            style={{ color: fg }}
          >
            {side.text || (isBack ? "Back of card" : "Front of card")}
          </p>
        </div>
      )}
    </div>
  );
}

function CardEditor({
  card,
  cardIndex,
  side,
  onFlipSide,
  onChange,
  onClose,
}: {
  card: FCCard;
  cardIndex: number;
  side: FCSide;
  onFlipSide: () => void;
  onChange: (mut: (c: FCCard) => FCCard) => void;
  onClose: () => void;
}) {
  const data = card[side];
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (patch: Partial<FCSideData>) => {
    onChange((c) => ({ ...c, [side]: { ...c[side], ...patch } }));
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => update({ contentType: "image", imageUrl: String(reader.result || "") });
    reader.readAsDataURL(file);
  };

  return (
    <div role="dialog" aria-label={`Edit card ${cardIndex + 1} ${side}`} className="flex flex-col">
      {/* Header — clearly identifies which card is being edited */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/60 bg-gradient-to-b from-muted/40 to-transparent">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="w-7 h-7 rounded-lg border border-border/80 shadow-inner shrink-0"
            style={{ background: card.color }}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground leading-none">
              Editing
            </p>
            <p className="text-sm font-semibold text-foreground leading-tight truncate">
              Card {cardIndex + 1} <span className="text-muted-foreground font-normal">·</span>{" "}
              <span className="capitalize">{side}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-full"
                onClick={onFlipSide}
                aria-label={`Flip to ${side === "front" ? "back" : "front"}`}
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Flip to {side === "front" ? "back" : "front"}</TooltipContent>
          </Tooltip>
          <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={onClose} aria-label="Close editor">
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3.5 max-h-[460px] overflow-y-auto thin-scrollbar">
        {/* Content type tabs */}
        <div className="flex items-center gap-1 p-0.5 rounded-full bg-muted/60 w-full">
          <button
            type="button"
            onClick={() => update({ contentType: "text" })}
            className={cn(
              "flex-1 text-xs px-3 py-1.5 rounded-full inline-flex items-center justify-center gap-1.5 transition-colors",
              data.contentType === "text" ? "bg-background shadow-sm font-medium text-foreground" : "text-muted-foreground"
            )}
          >
            <TypeIcon className="w-3 h-3" aria-hidden="true" /> Text
          </button>
          <button
            type="button"
            onClick={() => update({ contentType: "image" })}
            className={cn(
              "flex-1 text-xs px-3 py-1.5 rounded-full inline-flex items-center justify-center gap-1.5 transition-colors",
              data.contentType === "image" ? "bg-background shadow-sm font-medium text-foreground" : "text-muted-foreground"
            )}
          >
            <ImageIcon className="w-3 h-3" aria-hidden="true" /> Image
          </button>
        </div>


      {data.contentType === "text" ? (
        <>
          <textarea
            value={data.text}
            onChange={(e) => update({ text: e.target.value })}
            placeholder={`Enter ${side} text…`}
            className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 min-h-[72px] focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label={`${side} text`}
          />
          <div className="flex items-center gap-1 flex-wrap">
            <Tooltip><TooltipTrigger asChild>
              <Button size="icon" variant={data.formatting.bold ? "secondary" : "ghost"} className="h-7 w-7 rounded-full" onClick={() => update({ formatting: { ...data.formatting, bold: !data.formatting.bold } })} aria-label="Bold">
                <Bold className="w-3 h-3" aria-hidden="true" />
              </Button>
            </TooltipTrigger><TooltipContent>Bold</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild>
              <Button size="icon" variant={data.formatting.italic ? "secondary" : "ghost"} className="h-7 w-7 rounded-full" onClick={() => update({ formatting: { ...data.formatting, italic: !data.formatting.italic } })} aria-label="Italic">
                <Italic className="w-3 h-3" aria-hidden="true" />
              </Button>
            </TooltipTrigger><TooltipContent>Italic</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild>
              <Button size="icon" variant={data.formatting.underline ? "secondary" : "ghost"} className="h-7 w-7 rounded-full" onClick={() => update({ formatting: { ...data.formatting, underline: !data.formatting.underline } })} aria-label="Underline">
                <Underline className="w-3 h-3" aria-hidden="true" />
              </Button>
            </TooltipTrigger><TooltipContent>Underline</TooltipContent></Tooltip>
            <div className="w-px h-5 bg-border mx-1" />
            {(["left", "center", "right"] as FCAlignment[]).map((a) => {
              const Icon = a === "left" ? AlignLeft : a === "right" ? AlignRight : AlignCenter;
              return (
                <Button
                  key={a}
                  size="icon"
                  variant={data.textAlign === a ? "secondary" : "ghost"}
                  className="h-7 w-7 rounded-full"
                  onClick={() => update({ textAlign: a })}
                  aria-label={`Align text ${a}`}
                >
                  <Icon className="w-3 h-3" aria-hidden="true" />
                </Button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {data.imageUrl ? (
            <div className="space-y-2">
              <div className="rounded-lg overflow-hidden border border-border h-32 bg-muted">
                <img
                  src={data.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{
                    transform: `scale(${data.imageZoom})`,
                    transformOrigin: `${data.imagePosX}% ${data.imagePosY}%`,
                  }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <label className="flex flex-col gap-1">
                  Zoom
                  <input type="range" min={1} max={3} step={0.1} value={data.imageZoom} onChange={(e) => update({ imageZoom: parseFloat(e.target.value) })} aria-label="Image zoom" />
                </label>
                <label className="flex flex-col gap-1">
                  X
                  <input type="range" min={0} max={100} value={data.imagePosX} onChange={(e) => update({ imagePosX: parseInt(e.target.value, 10) })} aria-label="Image horizontal position" />
                </label>
                <label className="flex flex-col gap-1">
                  Y
                  <input type="range" min={0} max={100} value={data.imagePosY} onChange={(e) => update({ imagePosY: parseInt(e.target.value, 10) })} aria-label="Image vertical position" />
                </label>
              </div>
              <Button size="sm" variant="outline" className="h-7 rounded-full gap-1.5 text-xs" onClick={() => fileRef.current?.click()}>
                <Upload className="w-3 h-3" aria-hidden="true" /> Replace image
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" className="h-9 rounded-full gap-1.5 text-xs w-full" onClick={() => fileRef.current?.click()}>
              <Upload className="w-3.5 h-3.5" aria-hidden="true" /> Upload image
            </Button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
        </>
      )}

      {/* Card color */}
      <div className="pt-1">
        <div className="text-[11px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
          <Palette className="w-3 h-3" aria-hidden="true" /> Card color
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {CARD_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-label={`${c.label} card color`}
              onClick={() => onChange((cc) => ({ ...cc, color: c.bg }))}
              className={cn(
                "w-6 h-6 rounded-full border-2 transition-transform",
                card.color.toLowerCase() === c.bg.toLowerCase() ? "border-foreground scale-110" : "border-border"
              )}
              style={{ background: c.bg }}
            />
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * Read-only preview (used in Course Preview pages)
 * ========================================================================= */
export function FlashcardsPreview({ content }: { content: string }) {
  const data = useMemo(() => parseContent(content), [content]);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  const alignmentClass =
    data.alignment === "left" ? "justify-start" : data.alignment === "right" ? "justify-end" : "justify-center";

  return (
    <div className={cn("w-full flex flex-wrap gap-4", alignmentClass)}>
      {data.cards.map((card, idx) => {
        const widthPct =
          data.gridCols === 1 ? "100%" : data.gridCols === 2 ? "calc(50% - 0.5rem)" : "calc(33.333% - 0.667rem)";
        const isFlipped = !!flipped[card.id];
        const toggle = () => setFlipped((f) => ({ ...f, [card.id]: !f[card.id] }));
        return (
          <div key={card.id} style={{ width: widthPct, minWidth: 200 }}>
            <div className="fc-perspective">
              <div className={cn("fc-flipper", isFlipped && "fc-flipped")}>
                <FlashcardFace
                  side={card.front}
                  bg={card.color}
                  defaultFg={getFg(card.color)}
                  onClick={toggle}
                  label={`Card ${idx + 1} front — click to flip`}
                />
                <FlashcardFace
                  side={card.back}
                  bg={card.color}
                  defaultFg={getFg(card.color)}
                  onClick={toggle}
                  label={`Card ${idx + 1} back — click to flip`}
                  isBack
                />
              </div>
            </div>
            <div className="flex items-center justify-center mt-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 rounded-full gap-1.5 text-[11px] text-muted-foreground hover:text-foreground"
                onClick={toggle}
                aria-label={isFlipped ? "Flip to front" : "Click to flip"}
              >
                <RefreshCw className="w-3 h-3" aria-hidden="true" />
                {isFlipped ? "Flip to front" : "Click to flip"}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
