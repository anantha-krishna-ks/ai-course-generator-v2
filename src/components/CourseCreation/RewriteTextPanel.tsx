import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Sparkles,
  Wand2,
  ScrollText,
  ListChecks,
  Plus,
  Megaphone,
  List,
  RefreshCw,
  Check,
  X,
  AlertTriangle,
  ArrowUp,
  Loader2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  GitCompare,
  FileText,
} from "lucide-react";
import { AISparkles } from "@/components/ui/ai-sparkles";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";

/**
 * RewriteTextPanel — unified single-card Grammarly-style rewrite.
 *
 * One continuous surface: the command bar at the top, the AI suggestion
 * flowing directly beneath it (no floating connector, no disconnected pill).
 * Regenerated variants are kept in an in-panel version history the author can
 * step through with ‹ / › — nothing is thrown away until they Discard.
 */

export type RewritePresetId =
  | "simple"
  | "summarize"
  | "actionable"
  | "detail"
  | "persuasive"
  | "bullets";

interface Preset {
  id: RewritePresetId;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PRESETS: Preset[] = [
  { id: "simple", label: "Simplify", hint: "Plain, everyday language", icon: Wand2 },
  { id: "summarize", label: "Summarize", hint: "Tighter, key points only", icon: ScrollText },
  { id: "actionable", label: "Actionable", hint: "Concrete steps a learner can take", icon: ListChecks },
  { id: "detail", label: "Add detail", hint: "Expand with context and examples", icon: Plus },
  { id: "persuasive", label: "Persuasive", hint: "Confident, motivating tone", icon: Megaphone },
  { id: "bullets", label: "Bullets", hint: "Reformat as a scannable list", icon: List },
];

interface RewriteTextPanelProps {
  content: string;
  onReplace: (nextContent: string) => void;
  onCancel: () => void;
}

interface Variant {
  html: string;
  presetId: RewritePresetId | null;
  instruction: string;
  label: string;
}

function htmlToPlain(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return (div.textContent || div.innerText || "").trim();
}

/** Convert HTML to plain text while preserving block boundaries as newlines. */
function htmlToText(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  div.querySelectorAll("br").forEach((el) => el.replaceWith("\n"));
  div.querySelectorAll("li").forEach((el) => {
    el.insertAdjacentText("afterbegin", "• ");
    el.insertAdjacentText("beforeend", "\n");
  });
  div
    .querySelectorAll("p, h1, h2, h3, h4, h5, h6, div, blockquote, ol, ul")
    .forEach((el) => el.insertAdjacentText("beforeend", "\n"));
  return (div.textContent || "").replace(/\n{3,}/g, "\n\n").trim();
}

type DiffOp = { type: "equal" | "insert" | "delete"; value: string };

/** Word-level LCS diff. Whitespace is kept as its own token so spacing survives. */
function diffWords(a: string, b: string): DiffOp[] {
  const tokenize = (s: string) => s.split(/(\s+)/).filter((t) => t.length > 0);
  const aT = tokenize(a);
  const bT = tokenize(b);
  const n = aT.length;
  const m = bT.length;
  // Bounded DP — skip diff for very long payloads to keep the UI responsive.
  if (n * m > 250_000) {
    return [
      { type: "delete", value: a },
      { type: "insert", value: b },
    ];
  }
  const dp: Uint32Array[] = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = aT[i] === bT[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (aT[i] === bT[j]) {
      ops.push({ type: "equal", value: aT[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: "delete", value: aT[i] });
      i++;
    } else {
      ops.push({ type: "insert", value: bT[j] });
      j++;
    }
  }
  while (i < n) ops.push({ type: "delete", value: aT[i++] });
  while (j < m) ops.push({ type: "insert", value: bT[j++] });
  // Merge consecutive same-type runs so we render fewer spans.
  const merged: DiffOp[] = [];
  for (const op of ops) {
    const last = merged[merged.length - 1];
    if (last && last.type === op.type) last.value += op.value;
    else merged.push({ ...op });
  }
  return merged;
}

function mockRewrite(original: string, preset: RewritePresetId | null, instruction: string, seed: number): string {
  const plain = htmlToPlain(original) || "Your selected text will appear here.";
  const sentences = plain.split(/(?<=[.!?])\s+/).filter(Boolean);
  const nudge = seed % 3;

  if (instruction.trim()) {
    return `<p><em>Following your instruction:</em> "${instruction.trim()}"</p><p>${sentences.slice(0, Math.max(2, sentences.length - nudge)).join(" ")}</p>`;
  }

  switch (preset) {
    case "simple":
      return `<p>${sentences.map((s) => s.replace(/utili[sz]e/gi, "use").replace(/leverage/gi, "use")).join(" ")}</p>`;
    case "summarize":
      return `<p>${sentences.slice(0, Math.min(2, sentences.length)).join(" ")}</p>`;
    case "actionable": {
      const items = sentences.slice(0, 4).map((s, i) => `<li>Step ${i + 1}: ${s.replace(/\.$/, "")}.</li>`).join("");
      return `<p>Here's how to put this into practice:</p><ol>${items}</ol>`;
    }
    case "detail":
      return `<p>${plain}</p><p>In practice, this matters because it directly shapes how learners apply the concept in real scenarios — providing extra context, an example, and a clear takeaway.</p>`;
    case "persuasive":
      return `<p>This isn't just theory — it's the difference between good and great. ${plain}</p>`;
    case "bullets": {
      const items = sentences.map((s) => `<li>${s.replace(/\.$/, "")}</li>`).join("");
      return `<ul>${items || `<li>${plain}</li>`}</ul>`;
    }
    default:
      return `<p>${plain}</p>`;
  }
}

export function RewriteTextPanel({ content, onReplace, onCancel }: RewriteTextPanelProps) {
  const dotPatternId = useId().replace(/:/g, "-");
  const [activePreset, setActivePreset] = useState<RewritePresetId | null>(null);
  const [instruction, setInstruction] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "preview" | "error">("idle");
  const [variants, setVariants] = useState<Variant[]>([]);
  const [variantIndex, setVariantIndex] = useState(0);
  const [seed, setSeed] = useState(0);
  const timerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const plainOriginal = useMemo(() => htmlToPlain(content), [content]);
  const hasContent = plainOriginal.length > 0;

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const runRewrite = (preset: RewritePresetId | null, customInstruction: string, nextSeed: number, keepHistory: boolean) => {
    if (!hasContent) return;
    setStatus("loading");
    setActivePreset(preset);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      const shouldFail = nextSeed > 0 && Math.random() < 0.08;
      if (shouldFail) {
        setStatus("error");
        return;
      }
      const label = preset ? PRESETS.find((p) => p.id === preset)!.label : customInstruction.trim() ? "Custom" : "Rewrite";
      const variant: Variant = {
        html: sanitizeHtml(mockRewrite(content, preset, customInstruction, nextSeed)),
        presetId: preset,
        instruction: customInstruction,
        label,
      };
      setVariants((prev) => {
        const next = keepHistory ? [...prev, variant] : [variant];
        setVariantIndex(next.length - 1);
        return next;
      });
      setStatus("preview");
    }, 900);
  };

  const handlePreset = (id: RewritePresetId) => {
    setInstruction("");
    setSeed(0);
    runRewrite(id, "", 0, false);
  };

  const handleSubmitInstruction = () => {
    if (!instruction.trim() || !hasContent) return;
    setActivePreset(null);
    setSeed(0);
    runRewrite(null, instruction, 0, false);
  };

  const handleRegenerate = () => {
    const current = variants[variantIndex];
    const next = seed + 1;
    setSeed(next);
    runRewrite(current?.presetId ?? activePreset, current?.instruction ?? "", next, true);
  };

  const handleReplace = () => {
    const current = variants[variantIndex];
    if (current) onReplace(current.html);
  };

  const handleDiscard = () => {
    setStatus("idle");
    setVariants([]);
    setVariantIndex(0);
    setActivePreset(null);
  };

  const current = variants[variantIndex];
  const showSuggestion = status === "loading" || status === "preview" || status === "error";
  const canPrev = variantIndex > 0;
  const canNext = variantIndex < variants.length - 1;

  return (
    <div role="region" aria-label="Rewrite with AI" className="relative mt-1 pt-2 animate-fade-in">
      {/* Connector thread — visually stitches the panel to the text block above */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute left-5 -top-1 w-px h-3 pointer-events-none",
          status === "error" ? "bg-destructive/40" : "bg-primary/45"
        )}
      />
      <div
        className={cn(
          "relative rounded-2xl rounded-tl-md border border-l-[3px] overflow-hidden transition-colors bg-background",
          status === "error"
            ? "border-destructive/25 border-l-destructive shadow-[0_8px_24px_-12px_hsl(var(--destructive)/0.22)]"
            : "border-primary/20 border-l-primary shadow-[0_8px_24px_-14px_hsl(var(--primary)/0.22)]"
        )}
      >
        {/* Anchor chip — straddles the top border, labels which text is being rewritten */}
        <div
          className={cn(
            "absolute -top-2 left-3 z-10 inline-flex items-center gap-1 h-4 px-1.5 rounded-full border bg-background text-[9px] font-semibold uppercase tracking-wide",
            status === "error" ? "border-destructive/30 text-destructive" : "border-primary/30 text-primary"
          )}
        >
          <Sparkles className="w-2.5 h-2.5" aria-hidden="true" focusable="false" />
          Rewriting text above
        </div>
        {/* ─────────── Command bar ─────────── */}
        <div className="flex items-center gap-1.5 px-2.5 py-2 flex-wrap">
          <AISparkles className="w-4 h-4 text-primary ml-1 mr-0.5 flex-shrink-0" />

          {/* Preset chips */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-shrink min-w-0">
            {PRESETS.map((p) => {
              const Icon = p.icon;
              const isActive = activePreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePreset(p.id)}
                  disabled={!hasContent || status === "loading"}
                  title={p.hint}
                  className={cn(
                    "inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all duration-150 flex-shrink-0",
                    "disabled:opacity-40 disabled:cursor-not-allowed",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/75 hover:text-primary hover:bg-primary/[0.06]"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", isActive ? "text-primary" : "text-muted-foreground")} />
                  {p.label}
                </button>
              );
            })}
          </div>

          <span className="w-px h-5 bg-border/70 mx-1 hidden md:inline-block" aria-hidden="true" />

          {/* Custom instruction — grows to fill the row */}
          <div className="flex items-end gap-1.5 flex-1 min-w-[200px] rounded-full border border-border/70 bg-muted/30 pl-3.5 pr-1 py-0.5 focus-within:border-primary/40 focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/15 transition-all">
            <textarea
              ref={inputRef}
              value={instruction}
              onChange={(e) => {
                setInstruction(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 88) + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && instruction.trim() && hasContent) {
                  e.preventDefault();
                  handleSubmitInstruction();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  onCancel();
                }
              }}
              placeholder={hasContent ? "Tell AI what to change…" : "Add text first"}
              aria-label="Custom rewrite instruction"
              disabled={!hasContent || status === "loading"}
              rows={1}
              className="flex-1 bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground outline-none resize-none min-h-[28px] max-h-[88px] py-1 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleSubmitInstruction}
              disabled={!instruction.trim() || !hasContent || status === "loading"}
              aria-label="Send instruction"
              className={cn(
                "w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center transition-colors my-auto",
                instruction.trim() && hasContent && status !== "loading"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-transparent text-muted-foreground"
              )}
            >
              {status === "loading" ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" focusable="false" />
              ) : (
                <ArrowUp className="w-4 h-4" aria-hidden="true" focusable="false" />
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Close rewrite"
            className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 inline-flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" focusable="false" />
          </button>
        </div>

        {/* ─────────── Suggestion section (same card, seamless) ─────────── */}
        {showSuggestion && (
          <div
            className={cn(
              "relative border-t animate-fade-in",
              status === "error" ? "border-destructive/15 bg-destructive/[0.03]" : "border-warning/20 bg-warning/[0.04]"
            )}
          >
            {status !== "error" && (
              <svg
                className="absolute inset-0 w-full h-full text-warning/[0.10] pointer-events-none"
                aria-hidden="true"
                focusable="false"
              >
                <defs>
                  <pattern
                    id={dotPatternId}
                    x="0"
                    y="0"
                    width="24"
                    height="24"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#${dotPatternId})`} />
              </svg>
            )}

            {/* Sub-header: label + version stepper + actions */}
            <div className="relative flex items-center justify-between gap-3 px-4 py-2">
              <div className="flex items-center gap-2 min-w-0">
                {status === "error" ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-destructive flex-shrink-0" aria-hidden="true" focusable="false" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-warning flex-shrink-0" aria-hidden="true" focusable="false" />
                )}
                <span className="text-[11px] font-semibold text-foreground truncate">
                  {status === "loading" && "Generating…"}
                  {status === "preview" && (current?.label ?? "AI suggestion")}
                  {status === "error" && "Couldn't generate"}
                </span>

                {/* Version stepper — appears once there is more than one variant */}
                {status === "preview" && variants.length > 1 && (
                  <div className="flex items-center gap-0.5 ml-1 rounded-full border border-border/70 bg-background/70 pl-0.5 pr-1.5 h-6">
                    <button
                      type="button"
                      onClick={() => canPrev && setVariantIndex(variantIndex - 1)}
                      disabled={!canPrev}
                      aria-label="Previous version"
                      className="w-5 h-5 rounded-full inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-3 h-3" aria-hidden="true" focusable="false" />
                    </button>
                    <span className="text-[10px] font-medium tabular-nums text-muted-foreground">
                      v{variantIndex + 1}<span className="opacity-50">/{variants.length}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => canNext && setVariantIndex(variantIndex + 1)}
                      disabled={!canNext}
                      aria-label="Next version"
                      className="w-5 h-5 rounded-full inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-3 h-3" aria-hidden="true" focusable="false" />
                    </button>
                  </div>
                )}
              </div>

              {status === "preview" && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleDiscard}
                    className="h-7 px-2.5 rounded-full text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    className="h-7 px-2.5 rounded-full text-[11px] font-medium text-primary hover:bg-primary/10 inline-flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                    Regenerate
                  </button>
                  <button
                    type="button"
                    onClick={handleReplace}
                    className="h-7 px-3 rounded-full text-[11px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 shadow-[0_2px_8px_-2px_hsl(var(--primary)/0.5)] transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                    Replace
                  </button>
                </div>
              )}

              {status === "error" && (
                <button
                  type="button"
                  onClick={handleRegenerate}
                  className="h-7 px-2.5 rounded-full text-[11px] font-medium text-destructive hover:bg-destructive/10 inline-flex items-center gap-1.5 transition-colors flex-shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                  Try again
                </button>
              )}
            </div>

            {/* Body */}
            {status === "loading" && (
              <div className="relative px-5 pb-5 pt-1 space-y-2.5">
                <div className="h-3 rounded-full bg-warning/15 animate-pulse w-[92%]" />
                <div className="h-3 rounded-full bg-warning/15 animate-pulse w-[78%]" />
                <div className="h-3 rounded-full bg-warning/15 animate-pulse w-[85%]" />
                <div className="h-3 rounded-full bg-warning/15 animate-pulse w-[64%]" />
                <p className="text-[11px] text-muted-foreground pt-1">
                  Your original stays untouched.
                </p>
              </div>
            )}

            {status === "preview" && current && (
              <div className="relative px-5 pb-4 pt-1 max-h-80 overflow-y-auto">
                <div
                  className="prose dark:prose-invert max-w-none text-foreground break-words [overflow-wrap:anywhere]"
                  dangerouslySetInnerHTML={{ __html: current.html }}
                />
              </div>
            )}

            {status === "error" && (
              <div className="relative px-5 pb-4 pt-1">
                <p className="text-[12px] text-muted-foreground">
                  The AI couldn't return a rewrite. Your original content is unchanged — try again or pick a different style.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
