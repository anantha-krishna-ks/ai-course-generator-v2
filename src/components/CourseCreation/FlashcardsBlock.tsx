import { useCallback, useMemo, useRef, useState } from "react";
import {
  Plus,
  Minus,
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
  Upload,
  RefreshCw,
  X,
  Maximize,
  RectangleHorizontal,
  FlipHorizontal,
  FlipVertical,
  RotateCw,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export type FCFitMode = "contain" | "cover" | "fill";

export interface FCSideData {
  contentType: FCContentType;
  text: string;
  textColor: string;
  textAlign: FCAlignment;
  formatting: FCFormatting;
  imageUrl: string;
  imageZoom: number; // 50..200 (%)
  imagePosX: number; // 0..100
  imagePosY: number; // 0..100
  imageFit: FCFitMode;
  imageFlipH: boolean;
  imageFlipV: boolean;
  imageRotation: number; // 0|90|180|270
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
    imageZoom: 100,
    imagePosX: 50,
    imagePosY: 50,
    imageFit: "cover",
    imageFlipH: false,
    imageFlipV: false,
    imageRotation: 0,
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

  // Drag state — handle-initiated, with live drop indicator
  const dragEnabled = useRef(false);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null); // insertion index 0..cards.length

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

  const moveCard = (from: number, insertAt: number) => {
    if (from === insertAt || from === insertAt - 1) return;
    const next = [...data.cards];
    const [moved] = next.splice(from, 1);
    const target = from < insertAt ? insertAt - 1 : insertAt;
    next.splice(target, 0, moved);
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
      <div
        className={cn("p-4 flex flex-wrap gap-4 items-start", alignmentClass)}
        onDragOver={(e) => {
          if (draggingIdx === null) return;
          e.preventDefault();
          if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
        }}
        onDrop={(e) => {
          if (draggingIdx === null) return;
          e.preventDefault();
          // If no card-level target was set, drop at end
          const target = dropTarget ?? data.cards.length;
          moveCard(draggingIdx, target);
          setDraggingIdx(null);
          setDropTarget(null);
          dragEnabled.current = false;
        }}
      >
        {data.cards.map((card, idx) => {
          const isFlipped = !!flipped[card.id];
          const fg = card.front.textColor || getFg(card.color);
          const isEditing = editingCardId === card.id;
          const isDragging = draggingIdx === idx;
          const showIndicatorBefore = dropTarget === idx && draggingIdx !== null && draggingIdx !== idx && draggingIdx !== idx - 1;
          const showIndicatorAfter = dropTarget === idx + 1 && idx === data.cards.length - 1 && draggingIdx !== null && draggingIdx !== idx && draggingIdx !== idx + 1;

          return (
            <div key={card.id} className="relative flex items-stretch">
              {/* Drop indicator — left side */}
              <div
                aria-hidden="true"
                className={cn(
                  "self-stretch -ml-2 mr-2 w-[3px] rounded-full bg-primary transition-all duration-200 ease-out",
                  showIndicatorBefore ? "opacity-100 scale-y-100 shadow-[0_0_12px_hsl(var(--primary)/0.6)]" : "opacity-0 scale-y-50"
                )}
                style={{ transformOrigin: "center" }}
              />

              <div
                style={{ width: 240 }}
                draggable={dragEnabled.current}
                onDragStart={(e) => {
                  if (!dragEnabled.current) {
                    e.preventDefault();
                    return;
                  }
                  setDraggingIdx(idx);
                  if (e.dataTransfer) {
                    e.dataTransfer.effectAllowed = "move";
                    try { e.dataTransfer.setData("text/plain", String(idx)); } catch {}
                  }
                }}
                onDragOver={(e) => {
                  if (draggingIdx === null) return;
                  e.preventDefault();
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  const before = e.clientX < rect.left + rect.width / 2;
                  setDropTarget(before ? idx : idx + 1);
                }}
                onDragEnd={() => {
                  setDraggingIdx(null);
                  setDropTarget(null);
                  dragEnabled.current = false;
                }}
                className={cn(
                  "group/card transition-all duration-200 ease-out",
                  isDragging && "opacity-40 scale-[0.96] rotate-[-1.5deg]"
                )}
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
                    draggable={false}
                    onMouseDown={() => { dragEnabled.current = true; }}
                    onMouseUp={() => { if (draggingIdx === null) dragEnabled.current = false; }}
                    onTouchStart={() => { dragEnabled.current = true; }}
                    className={cn(
                      "inline-flex items-center text-[10px] cursor-grab active:cursor-grabbing gap-1 px-1.5 py-0.5 rounded-full transition-colors select-none",
                      isEditing ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    aria-label={`Drag handle for card ${idx + 1}`}
                    title="Drag to reorder"
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
        <div className="w-full h-full overflow-hidden flex items-center justify-center bg-muted/30">
          <img
            src={side.imageUrl}
            alt=""
            className="w-full h-full"
            style={{
              objectFit: side.imageFit,
              objectPosition: `${side.imagePosX}% ${side.imagePosY}%`,
              transform: `scale(${(side.imageZoom ?? 100) / 100}) scaleX(${side.imageFlipH ? -1 : 1}) scaleY(${side.imageFlipV ? -1 : 1}) rotate(${side.imageRotation ?? 0}deg)`,
              transition: "transform 0.2s ease",
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
      <div
        className="p-4 space-y-3.5 max-h-[min(70vh,560px)] overflow-y-auto overscroll-contain thin-scrollbar"
        onWheelCapture={(e) => e.stopPropagation()}
        onTouchMoveCapture={(e) => e.stopPropagation()}
      >
        {/* Content type tabs — Apple-style sliding pill */}
        <div className="relative flex items-center bg-foreground/[0.06] border border-border/50 rounded-lg p-[3px]">
          <div
            className="absolute top-[3px] bottom-[3px] rounded-md bg-background shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_-1px_rgba(0,0,0,0.05)] transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
            style={{
              width: "calc(50% - 3px)",
              left: data.contentType === "text" ? "3px" : "calc(50%)",
            }}
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={() => update({ contentType: "text" })}
            className={cn(
              "relative z-10 flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors duration-300",
              data.contentType === "text" ? "text-foreground" : "text-muted-foreground hover:text-muted-foreground"
            )}
          >
            <TypeIcon className="w-3 h-3" aria-hidden="true" focusable="false" />
            Text
          </button>
          <button
            type="button"
            onClick={() => update({ contentType: "image" })}
            className={cn(
              "relative z-10 flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors duration-300",
              data.contentType === "image" ? "text-foreground" : "text-muted-foreground hover:text-muted-foreground"
            )}
          >
            <ImageIcon className="w-3 h-3" aria-hidden="true" focusable="false" />
            Image
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
            <div className="space-y-2.5">
              {/* Preview */}
              <div className="rounded-lg overflow-hidden border border-border h-36 bg-muted/40 flex items-center justify-center">
                <img
                  src={data.imageUrl}
                  alt=""
                  className="w-full h-full"
                  style={{
                    objectFit: data.imageFit,
                    objectPosition: `${data.imagePosX}% ${data.imagePosY}%`,
                    transform: `scale(${(data.imageZoom ?? 100) / 100}) scaleX(${data.imageFlipH ? -1 : 1}) scaleY(${data.imageFlipV ? -1 : 1}) rotate(${data.imageRotation ?? 0}deg)`,
                    transition: "transform 0.2s ease",
                  }}
                />
              </div>

              {/* Toolbar — mirrors ImageBlock features, scoped to a card face */}
              <div className="flex items-center gap-1 p-1.5 rounded-lg border border-border bg-background">
                {/* Zoom */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => update({ imageZoom: Math.max(50, (data.imageZoom ?? 100) - 10) })}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      aria-label="Zoom out"
                    >
                      <Minus className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom out</TooltipContent>
                </Tooltip>
                <Slider
                  value={[data.imageZoom ?? 100]}
                  onValueChange={([v]) => update({ imageZoom: v })}
                  min={50}
                  max={200}
                  step={5}
                  className="flex-1"
                  aria-label="Image zoom"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => update({ imageZoom: Math.min(200, (data.imageZoom ?? 100) + 10) })}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      aria-label="Zoom in"
                    >
                      <Plus className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom in</TooltipContent>
                </Tooltip>
                <span className="text-[10px] tabular-nums text-muted-foreground w-9 text-right pr-1">
                  {data.imageZoom ?? 100}%
                </span>
              </div>

              {/* Fit + Flip + Rotate + Delete */}
              <div className="flex items-center gap-1 p-1.5 rounded-lg border border-border bg-background">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      aria-label={`Fit mode: ${data.imageFit}`}
                    >
                      {data.imageFit === "contain" ? (
                        <Maximize className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                      ) : (
                        <RectangleHorizontal className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                      )}
                      <span className="capitalize">
                        {data.imageFit === "contain" ? "Fit" : data.imageFit === "cover" ? "Fill" : "Stretch"}
                      </span>
                      <ChevronDown className="w-3 h-3" aria-hidden="true" focusable="false" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-[120px]">
                    <DropdownMenuItem onClick={() => update({ imageFit: "contain" })} className={cn(data.imageFit === "contain" && "bg-primary/10")}>
                      <Maximize className="w-3.5 h-3.5 mr-2" aria-hidden="true" focusable="false" /> Fit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => update({ imageFit: "cover" })} className={cn(data.imageFit === "cover" && "bg-primary/10")}>
                      <RectangleHorizontal className="w-3.5 h-3.5 mr-2" aria-hidden="true" focusable="false" /> Fill
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => update({ imageFit: "fill" })} className={cn(data.imageFit === "fill" && "bg-primary/10")}>
                      <RectangleHorizontal className="w-3.5 h-3.5 mr-2" aria-hidden="true" focusable="false" /> Stretch
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="w-px h-4 bg-border mx-0.5" aria-hidden="true" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => update({ imageFlipH: !data.imageFlipH })}
                      className={cn(
                        "p-1 rounded-md transition-colors",
                        data.imageFlipH ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                      aria-label="Flip horizontal"
                    >
                      <FlipHorizontal className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Flip horizontal</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => update({ imageFlipV: !data.imageFlipV })}
                      className={cn(
                        "p-1 rounded-md transition-colors",
                        data.imageFlipV ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                      aria-label="Flip vertical"
                    >
                      <FlipVertical className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Flip vertical</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => update({ imageRotation: ((data.imageRotation ?? 0) + 90) % 360 })}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      aria-label="Rotate 90 degrees"
                    >
                      <RotateCw className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Rotate 90°</TooltipContent>
                </Tooltip>

                <div className="flex-1" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      aria-label="Replace image"
                    >
                      <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Replace</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => update({ imageUrl: "" })}
                      className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      aria-label="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Remove</TooltipContent>
                </Tooltip>
              </div>

              {/* Focal point — X / Y */}
              <div className="grid grid-cols-2 gap-2 p-2 rounded-lg border border-border bg-background">
                <label className="flex flex-col gap-1 text-[10px] font-medium text-muted-foreground">
                  Focal X
                  <Slider
                    value={[data.imagePosX]}
                    onValueChange={([v]) => update({ imagePosX: v })}
                    min={0}
                    max={100}
                    step={1}
                    aria-label="Image horizontal focal point"
                  />
                </label>
                <label className="flex flex-col gap-1 text-[10px] font-medium text-muted-foreground">
                  Focal Y
                  <Slider
                    value={[data.imagePosY]}
                    onValueChange={([v]) => update({ imagePosY: v })}
                    min={0}
                    max={100}
                    step={1}
                    aria-label="Image vertical focal point"
                  />
                </label>
              </div>

              {/* Reset */}
              <div className="flex items-center justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 rounded-full gap-1.5 text-[11px] text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    update({
                      imageZoom: 100,
                      imagePosX: 50,
                      imagePosY: 50,
                      imageFit: "cover",
                      imageFlipH: false,
                      imageFlipV: false,
                      imageRotation: 0,
                    })
                  }
                  aria-label="Reset image adjustments"
                >
                  <RefreshCw className="w-3 h-3" aria-hidden="true" focusable="false" />
                  Reset
                </Button>
              </div>
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
        const isFlipped = !!flipped[card.id];
        const toggle = () => setFlipped((f) => ({ ...f, [card.id]: !f[card.id] }));
        return (
          <div key={card.id} style={{ width: 240 }}>
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
