import { cn } from "@/lib/utils";
import {
  FileText,
  Minus,
  Plus,
  Layers,
  FileStack,
  Image as ImageIcon,
  LayoutPanelTop,
  Check,
} from "lucide-react";

export interface DocumentPreferencesValue {
  wordsPerPage: number;
  layoutType: "multi-page" | "single-page";
  sectionImages: boolean;
  pageImages: boolean;
}

interface Props {
  state: Partial<DocumentPreferencesValue> & { layoutType: "multi-page" | "single-page" };
  onChange: (partial: Partial<DocumentPreferencesValue>) => void;
}

const WORD_PRESETS = [150, 250, 400, 600];
const MIN_WORDS = 50;
const MAX_WORDS = 1500;
const WORD_STEP = 50;

function PrefCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5", className)}>{children}</div>
  );
}

function SectionHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-4">
      <div className="text-[16px] font-semibold text-foreground leading-tight">{title}</div>
      {desc && <p className="text-[13px] text-muted-foreground mt-1">{desc}</p>}
    </div>
  );
}

function MultiPageIllustration({ active }: { active: boolean }) {
  return (
    <svg
      width="120"
      height="84"
      viewBox="0 0 100 72"
      fill="none"
      className={cn("shrink-0 transition-opacity", active ? "opacity-100" : "opacity-70")}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="4" y="4" width="92" height="64" rx="4" className={cn(active ? "fill-primary/5" : "fill-muted/50", "stroke-border")} strokeWidth="1" />
      <rect x="12" y="10" width="20" height="4" rx="1.5" className="fill-muted-foreground/25" />
      <rect x="12" y="18" width="40" height="4" rx="1.5" className={cn(active ? "fill-primary/40" : "fill-primary/25")} />
      <rect x="12" y="27" width="76" height="2" rx="1" className="fill-muted-foreground/20" />
      <rect x="12" y="32" width="60" height="2" rx="1" className="fill-muted-foreground/20" />
      <rect x="12" y="37" width="70" height="2" rx="1" className="fill-muted-foreground/20" />
      <line x1="12" y1="46" x2="88" y2="46" className="stroke-border" strokeWidth="0.6" strokeDasharray="2 2" />
      <rect x="12" y="51" width="50" height="2" rx="1" className="fill-muted-foreground/20" />
      <rect x="12" y="56" width="65" height="2" rx="1" className="fill-muted-foreground/20" />
      <rect x="12" y="61" width="40" height="2" rx="1" className="fill-muted-foreground/20" />
    </svg>
  );
}

function SinglePageIllustration({ active }: { active: boolean }) {
  return (
    <svg
      width="120"
      height="84"
      viewBox="0 0 100 72"
      fill="none"
      className={cn("shrink-0 transition-opacity", active ? "opacity-100" : "opacity-70")}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="4" y="4" width="92" height="64" rx="4" className={cn(active ? "fill-primary/5" : "fill-muted/50", "stroke-border")} strokeWidth="1" />
      <rect x="12" y="10" width="20" height="4" rx="1.5" className="fill-muted-foreground/25" />
      <rect x="12" y="18" width="40" height="4" rx="1.5" className={cn(active ? "fill-primary/40" : "fill-primary/25")} />
      <rect x="12" y="27" width="76" height="36" rx="2" className={cn(active ? "fill-primary/10 stroke-primary/30" : "fill-primary/5 stroke-primary/20")} strokeWidth="0.5" />
      <rect x="18" y="33" width="64" height="2" rx="1" className="fill-muted-foreground/20" />
      <rect x="18" y="38" width="50" height="2" rx="1" className="fill-muted-foreground/20" />
      <rect x="18" y="43" width="58" height="2" rx="1" className="fill-muted-foreground/20" />
      <rect x="18" y="48" width="44" height="2" rx="1" className="fill-muted-foreground/20" />
      <rect x="18" y="53" width="52" height="2" rx="1" className="fill-muted-foreground/20" />
    </svg>
  );
}

function LayoutCard({
  selected,
  onClick,
  icon: Icon,
  title,
  description,
  illustration,
}: {
  selected: boolean;
  onClick: () => void;
  icon: typeof Layers;
  title: string;
  description: string;
  illustration: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "group relative w-full text-left rounded-2xl border-2 p-4 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "border-primary bg-primary/[0.04] shadow-[0_4px_18px_-8px_hsl(var(--primary)/0.35)]"
          : "border-border bg-background hover:border-primary/40 hover:bg-muted/30"
      )}
    >
      {selected && (
        <span className="absolute top-3 right-3 inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground shadow-sm">
          <Check className="w-3.5 h-3.5" strokeWidth={3} aria-hidden="true" focusable="false" />
        </span>
      )}
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={cn(
                "inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                selected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              )}
              aria-hidden="true"
            >
              <Icon className="w-4 h-4" />
            </span>
            <span className="text-[15px] font-semibold text-foreground">{title}</span>
          </div>
          <p className="text-[13px] text-muted-foreground leading-relaxed pr-6">{description}</p>
        </div>
        <div className="hidden sm:block">{illustration}</div>
      </div>
    </button>
  );
}

function ImageToggleTile({
  selected,
  onToggle,
  title,
  description,
  ariaLabel,
}: {
  selected: boolean;
  onToggle: () => void;
  title: string;
  description: string;
  ariaLabel: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-200 p-4",
        selected
          ? "border-primary/50 bg-gradient-to-br from-primary/[0.06] to-primary/[0.02]"
          : "border-border bg-background hover:border-primary/30 hover:bg-muted/30"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onToggle}
          role="switch"
          aria-checked={selected}
          aria-label={ariaLabel}
          className="flex items-center gap-3 text-left flex-1 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
        >
          <span
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
              selected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
            )}
            aria-hidden="true"
          >
            <ImageIcon className="w-4 h-4" />
          </span>
          <span className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-foreground leading-tight">{title}</span>
            <span className="text-[12px] text-muted-foreground leading-snug mt-0.5">{description}</span>
          </span>
        </button>
        <button
          type="button"
          onClick={onToggle}
          role="switch"
          aria-checked={selected}
          aria-label={`Toggle ${ariaLabel}`}
          className={cn(
            "w-10 h-6 rounded-full relative transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            selected ? "bg-primary" : "bg-muted-foreground/25"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-background shadow-sm transition-transform",
              selected && "translate-x-4"
            )}
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}

export function StepDocumentPreferences({ state, onChange }: Props) {
  const value: DocumentPreferencesValue = {
    wordsPerPage: state.wordsPerPage ?? 250,
    layoutType: state.layoutType,
    sectionImages: state.sectionImages ?? true,
    pageImages: state.pageImages ?? true,
  };
  const dec = () => onChange({ wordsPerPage: Math.max(MIN_WORDS, value.wordsPerPage - WORD_STEP) });
  const inc = () => onChange({ wordsPerPage: Math.min(MAX_WORDS, value.wordsPerPage + WORD_STEP) });

  return (
    <div className="space-y-4">
      {/* Word Count per Page */}
      <PrefCard>
        <SectionHeader
          title="Word count per page"
          desc="Set the approximate number of words generated for each page."
        />
        <div className="rounded-lg border border-border/80 bg-background px-4 py-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground block leading-tight">
                  Words per page
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Target word count (approximate)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={dec}
                disabled={value.wordsPerPage <= MIN_WORDS}
                aria-label="Decrease words per page"
                className="w-9 h-9 rounded-full border border-primary/30 bg-primary/5 flex items-center justify-center hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
              </button>
              <div className="flex items-baseline gap-1 min-w-[100px] justify-center">
                <span className="text-3xl font-bold text-foreground tabular-nums leading-none">
                  {value.wordsPerPage}
                </span>
                <span className="text-sm text-muted-foreground font-medium">words</span>
              </div>
              <button
                type="button"
                onClick={inc}
                disabled={value.wordsPerPage >= MAX_WORDS}
                aria-label="Increase words per page"
                className="w-9 h-9 rounded-full border border-primary/30 bg-primary/5 flex items-center justify-center hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-4">
            {WORD_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChange({ wordsPerPage: preset })}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150",
                  value.wordsPerPage === preset
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-muted/50 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                )}
              >
                {preset} words
              </button>
            ))}
          </div>
        </div>
      </PrefCard>

      {/* Layout Selection */}
      <PrefCard>
        <SectionHeader
          title="Course layout"
          desc="Choose how the generated course will be organized."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3" role="radiogroup" aria-label="Course layout">
          <LayoutCard
            selected={value.layoutType === "multi-page"}
            onClick={() => onChange({ layoutType: "multi-page" })}
            icon={Layers}
            title="Multi-page layout"
            description="A full-length course split across multiple pages and sections."
            illustration={<MultiPageIllustration active={value.layoutType === "multi-page"} />}
          />
          <LayoutCard
            selected={value.layoutType === "single-page"}
            onClick={() => onChange({ layoutType: "single-page" })}
            icon={FileStack}
            title="Single-page layout"
            description="A short, focused course on a single scrollable page."
            illustration={<SinglePageIllustration active={value.layoutType === "single-page"} />}
          />
        </div>
      </PrefCard>

      {/* Images */}
      <PrefCard>
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary" aria-hidden="true">
            <LayoutPanelTop className="w-4 h-4" />
          </span>
          <div>
            <div className="text-[16px] font-semibold text-foreground leading-tight">Images</div>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Choose whether AI generates visuals for sections and pages.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <ImageToggleTile
            selected={value.sectionImages}
            onToggle={() => onChange({ sectionImages: !value.sectionImages })}
            title="Section images"
            description="Generate a hero image for each section"
            ariaLabel="section images"
          />
          <ImageToggleTile
            selected={value.pageImages}
            onToggle={() => onChange({ pageImages: !value.pageImages })}
            title="Page images"
            description="Add supporting images inside pages"
            ariaLabel="page images"
          />
        </div>
      </PrefCard>
    </div>
  );
}
