import { cn } from "@/lib/utils";
import {
  FileText,
  Minus,
  Plus,
  RectangleVertical,
  Columns2,
  Image as ImageIcon,
  Images,
  GalleryHorizontalEnd,
  Check,
} from "lucide-react";
import { PageDurationDefaultCard } from "@/components/AIGenerate/PageDurationDefaultCard";


export interface DocumentPreferencesValue {
  wordsPerPage: number;
  layoutType: "multi-page" | "single-page";
  sectionImages: boolean;
  pageImages: boolean;
  questionsPerPage: number;
  questionTypes: {
    singleChoice: number;
    multipleChoice: number;
    trueFalse: number;
    fillInBlank: number;
  };
  contentPreferences: {
    includeQuestions: boolean;
    interactiveBlocks: boolean;
    addImages: boolean;
  };
  quizConfig: {
    formative: {
      enabled: boolean;
      questionsPerQuiz: number;
      questionTypes: { singleChoice: number; multipleChoice: number; trueFalse: number; fillInBlank: number };
    };
    summative: {
      enabled: boolean;
      questionsPerQuiz: number;
      questionTypes: { singleChoice: number; multipleChoice: number; trueFalse: number; fillInBlank: number };
    };
  };
}

interface Props {
  state: Partial<DocumentPreferencesValue> & { layoutType: "multi-page" | "single-page" };
  onChange: (partial: Partial<DocumentPreferencesValue>) => void;
}

const WORD_PRESETS = [100, 125, 150, 200];
const MIN_WORDS = 100;
const MAX_WORDS = 200;
const WORD_STEP = 25;

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

function SingleBlockIllustration({ active }: { active: boolean }) {
  return (
    <div
      className={cn(
        "shrink-0 w-[136px] rounded-[8px] bg-[hsl(220,14%,96%)] p-[6px] transition-opacity",
        active ? "opacity-100" : "opacity-75"
      )}
      aria-hidden="true"
    >
      <div className="bg-white rounded-[5px] shadow-[0_0.5px_2px_rgba(0,0,0,0.07)] border border-[hsl(220,13%,91%)] p-[5px]">
        <div className="relative w-full rounded-[4px] border border-dashed border-primary/35 bg-gradient-to-br from-primary/[0.06] to-primary/[0.14] h-[64px] overflow-hidden p-[5px] flex flex-col gap-[3px]">
          <div className="h-[3px] rounded-full bg-primary/35 w-2/3" />
          <div className="w-full h-[16px] rounded-[2px] bg-primary/20 flex items-center justify-center">
            <ImageIcon className="w-[8px] h-[8px] text-primary/60" aria-hidden="true" focusable="false" />
          </div>
          <div className="w-full h-[12px] rounded-[2px] bg-[hsl(225,15%,18%)] flex items-center justify-center">
            <div className="w-[8px] h-[8px] rounded-full bg-white/30 flex items-center justify-center">
              <div className="w-0 h-0 border-t-[2px] border-b-[2px] border-l-[3px] border-transparent border-l-white" />
            </div>
          </div>
          <div className="h-[2px] rounded-full bg-primary/25 w-full" />
          <div className="h-[2px] rounded-full bg-primary/25 w-5/6" />
        </div>
      </div>
    </div>
  );
}

function DualBlockIllustration({ active }: { active: boolean }) {
  return (
    <div
      className={cn(
        "shrink-0 w-[136px] rounded-[8px] bg-[hsl(220,14%,96%)] p-[6px] transition-opacity",
        active ? "opacity-100" : "opacity-75"
      )}
      aria-hidden="true"
    >
      <div className="bg-white rounded-[5px] shadow-[0_0.5px_2px_rgba(0,0,0,0.07)] border border-[hsl(220,13%,91%)] p-[5px] flex gap-[5px]">
        <div className="relative flex-1 rounded-[4px] border border-dashed border-primary/35 bg-gradient-to-br from-primary/[0.06] to-primary/[0.14] h-[64px] overflow-hidden p-[4px] flex flex-col gap-[3px]">
          <div className="h-[3px] rounded-full bg-primary/35 w-3/4" />
          <div className="w-full h-[18px] rounded-[2px] bg-[hsl(225,15%,18%)] flex items-center justify-center">
            <div className="w-[8px] h-[8px] rounded-full bg-white/30 flex items-center justify-center">
              <div className="w-0 h-0 border-t-[2px] border-b-[2px] border-l-[3px] border-transparent border-l-white" />
            </div>
          </div>
          <div className="h-[2px] rounded-full bg-primary/25 w-full" />
          <div className="h-[2px] rounded-full bg-primary/25 w-2/3" />
        </div>
        <div className="relative flex-1 rounded-[4px] border border-dashed border-primary/35 bg-gradient-to-br from-primary/[0.06] to-primary/[0.14] h-[64px] overflow-hidden p-[4px] flex flex-col gap-[3px]">
          <div className="w-full h-[20px] rounded-[2px] bg-primary/20 flex items-center justify-center">
            <ImageIcon className="w-[8px] h-[8px] text-primary/60" aria-hidden="true" focusable="false" />
          </div>
          <div className="h-[3px] rounded-full bg-primary/30 w-full" />
          <div className="h-[2px] rounded-full bg-primary/25 w-5/6" />
          <div className="h-[2px] rounded-full bg-primary/25 w-2/3" />
        </div>
      </div>
    </div>
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
  icon: typeof RectangleVertical;
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
  icon: Icon = ImageIcon,
}: {
  selected: boolean;
  onToggle: () => void;
  title: string;
  description: string;
  ariaLabel: string;
  icon?: typeof ImageIcon;
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
            <Icon className="w-4 h-4" aria-hidden="true" focusable="false" />
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

const QUESTION_TYPES = [
  { key: "singleChoice" as const, label: "Single Choice" },
  { key: "multipleChoice" as const, label: "Multiple Choice" },
  { key: "trueFalse" as const, label: "True / False" },
  { key: "fillInBlank" as const, label: "Fill in Blank" },
];

export function StepDocumentPreferences({ state, onChange }: Props) {
  const value: DocumentPreferencesValue = {
    wordsPerPage: state.wordsPerPage ?? 150,
    layoutType: state.layoutType,
    sectionImages: state.sectionImages ?? true,
    pageImages: state.pageImages ?? true,
    questionsPerPage: state.questionsPerPage ?? 3,
    questionTypes: state.questionTypes ?? {
      singleChoice: 1,
      multipleChoice: 1,
      trueFalse: 1,
      fillInBlank: 0,
    },
    contentPreferences: state.contentPreferences ?? {
      includeQuestions: true,
      interactiveBlocks: true,
      addImages: true,
    },
    quizConfig: state.quizConfig ?? {
      formative: { enabled: true, questionsPerQuiz: 5, questionTypes: { singleChoice: 2, multipleChoice: 1, trueFalse: 1, fillInBlank: 1 } },
      summative: { enabled: false, questionsPerQuiz: 10, questionTypes: { singleChoice: 4, multipleChoice: 3, trueFalse: 2, fillInBlank: 1 } },
    },
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
            selected={value.layoutType === "single-page"}
            onClick={() => onChange({ layoutType: "single-page" })}
            icon={RectangleVertical}
            title="Single block"
            description="Content flows in a single, focused column block per page."
            illustration={<SingleBlockIllustration active={value.layoutType === "single-page"} />}
          />
          <LayoutCard
            selected={value.layoutType === "multi-page"}
            onClick={() => onChange({ layoutType: "multi-page" })}
            icon={Columns2}
            title="Dual block"
            description="Content is laid out side-by-side in two parallel blocks."
            illustration={<DualBlockIllustration active={value.layoutType === "multi-page"} />}
          />

        </div>
      </PrefCard>

      {/* Images */}
      <PrefCard>
        <SectionHeader
          title="Images"
          desc="Choose whether AI generates visuals for sections and pages."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <ImageToggleTile
            selected={value.sectionImages}
            onToggle={() => onChange({ sectionImages: !value.sectionImages })}
            title="Section images"
            description="Generate a hero image for each section"
            ariaLabel="section images"
            icon={GalleryHorizontalEnd}
          />
          <ImageToggleTile
            selected={value.pageImages}
            onToggle={() => onChange({ pageImages: !value.pageImages })}
            title="Page images"
            description="Add supporting images inside pages"
            ariaLabel="page images"
            icon={Images}
          />
        </div>
      </PrefCard>

    </div>
  );
}
