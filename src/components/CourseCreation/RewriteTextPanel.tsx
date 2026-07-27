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
} from "lucide-react";
import { AISparkles } from "@/components/ui/ai-sparkles";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";

/**
 * RewriteTextPanel — Grammarly-style suggestion pattern.
 *
 * Layout:
 *  ┌──────────────────────────────────────────────────────────────┐
 *  │ ✨ Rewrite  · [chips…]  │  custom instruction… ▸    ✕      │  toolbar
 *  └──────────────────────────────────────────────────────────────┘
 *      ↓ (connector when suggestion present)
 *  ┌──────────────────────────────────────────────────────────────┐
 *  │ ✨ AI suggestion · Simplify        [Discard][Regen][Replace] │
 *  │ ─────────────────────────────────────────────────────────── │
 *  │  rewritten content here…                                     │
 *  └──────────────────────────────────────────────────────────────┘
 *
 * The original editor is NEVER hidden — the panel sits alongside it so authors
 * can compare original and suggestion directly. Nothing overwrites content
 * until Replace is clicked.
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

function htmlToPlain(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return (div.textContent || div.innerText || "").trim();
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
  const [lastUsedInstruction, setLastUsedInstruction] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "preview" | "error">("idle");
  const [preview, setPreview] = useState<string>("");
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

  const runRewrite = (preset: RewritePresetId | null, customInstruction: string, nextSeed: number) => {
    if (!hasContent) return;
    setStatus("loading");
    setActivePreset(preset);
    setLastUsedInstruction(customInstruction);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      const shouldFail = nextSeed > 0 && Math.random() < 0.08;
      if (shouldFail) {
        setStatus("error");
        return;
      }
      setPreview(sanitizeHtml(mockRewrite(content, preset, customInstruction, nextSeed)));
      setStatus("preview");
    }, 900);
  };

  const handlePreset = (id: RewritePresetId) => {
    setInstruction("");
    setSeed(0);
    runRewrite(id, "", 0);
  };

  const handleSubmitInstruction = () => {
    if (!instruction.trim() || !hasContent) return;
    setActivePreset(null);
    setSeed(0);
    runRewrite(null, instruction, 0);
  };

  const handleRegenerate = () => {
    const next = seed + 1;
    setSeed(next);
    runRewrite(activePreset, lastUsedInstruction, next);
  };

  const handleReplace = () => {
    onReplace(preview);
  };

  const handleDiscard = () => {
    setStatus("idle");
    setPreview("");
    setActivePreset(null);
    setLastUsedInstruction("");
  };

  const activePresetMeta = PRESETS.find((p) => p.id === activePreset);
  const showSuggestion = status === "loading" || status === "preview" || status === "error";
  const labelForSuggestion = activePresetMeta?.label ?? (lastUsedInstruction ? "Custom instruction" : "Rewrite");

  return (
    <div role="region" aria-label="Rewrite with AI" className="mt-3 space-y-0 animate-fade-in">
      {/* ─────────── Toolbar (single row on desktop, wraps on narrow) ─────────── */}
      <div className="rounded-2xl border border-primary/25 bg-background shadow-[0_4px_14px_-6px_hsl(var(--primary)/0.18)] px-3 py-2 flex items-center gap-2 flex-wrap">
        {/* Brand chip */}
        <div className="inline-flex items-center gap-2 pl-2 pr-3 h-9 rounded-full bg-primary/10 text-primary flex-shrink-0">
          <AISparkles className="w-4 h-4" />
          <span className="text-[12px] font-semibold whitespace-nowrap">Rewrite</span>
        </div>

        {/* Divider */}
        <span className="w-px h-6 bg-border/70 mx-0.5" aria-hidden="true" />

        {/* Preset chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-shrink min-w-0">
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
                  "inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[12px] font-medium border whitespace-nowrap transition-all duration-150 flex-shrink-0",
                  "disabled:opacity-40 disabled:cursor-not-allowed",
                  isActive
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-transparent text-foreground/75 border-transparent hover:text-primary hover:bg-primary/[0.06]"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <span className="w-px h-6 bg-border/70 mx-0.5 hidden md:inline-block" aria-hidden="true" />

        {/* Custom instruction — grows to fill row */}
        <div className="flex items-end gap-1.5 flex-1 min-w-[220px] rounded-full border border-border/70 bg-muted/30 pl-4 pr-1.5 py-1 focus-within:border-primary/40 focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/15 transition-all">
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
            className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none resize-none min-h-[28px] max-h-[88px] py-1 disabled:opacity-50"
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

        {/* Close */}
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close rewrite"
          className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 inline-flex items-center justify-center transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" aria-hidden="true" focusable="false" />
        </button>
      </div>

      {/* ─────────── Suggestion card (only when working / done / error) ─────────── */}
      {showSuggestion && (
        <div className="relative pl-5 mt-3">
          {/* Vertical connector line */}
          <span
            className="absolute left-[12px] top-0 bottom-0 w-px bg-warning/30"
            aria-hidden="true"
          />
          {/* Dot on connector */}
          <span
            className="absolute left-[8px] top-3.5 w-[9px] h-[9px] rounded-full bg-warning ring-4 ring-background"
            aria-hidden="true"
          />

          <div
            className={cn(
              "relative rounded-2xl border overflow-hidden animate-fade-in",
              status === "error"
                ? "border-destructive/30 shadow-[0_6px_20px_-10px_hsl(var(--destructive)/0.25)]"
                : "border-warning/30 shadow-[0_6px_20px_-10px_hsl(var(--warning)/0.18)] bg-warning/[0.04]"
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
            {/* Header row */}
            <div className={cn(
              "relative flex items-center justify-between gap-3 px-4 py-2.5 border-b bg-background/60",
              status === "error" ? "border-destructive/10" : "border-warning/10"
            )}>
              <div className="flex items-center gap-2.5 min-w-0">
                {status === "error" ? (
                  <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" aria-hidden="true" focusable="false" />
                ) : (
                  <Sparkles className="w-4 h-4 text-warning flex-shrink-0" aria-hidden="true" focusable="false" />
                )}
                <span className="text-[13px] font-semibold text-foreground truncate">
                  {status === "loading" && "Generating suggestion…"}
                  {status === "preview" && "AI suggestion"}
                  {status === "error" && "Couldn't generate a suggestion"}
                </span>
                {status !== "error" && (
                  <span className="text-[12px] text-muted-foreground truncate hidden sm:inline">
                    · {labelForSuggestion}
                  </span>
                )}
              </div>

              {status === "preview" && (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleDiscard}
                    className="h-8 px-3 rounded-full text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" focusable="false" />
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    className="h-8 px-3 rounded-full text-[12px] font-medium text-primary hover:bg-primary/10 inline-flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" aria-hidden="true" focusable="false" />
                    Regenerate
                  </button>
                  <button
                    type="button"
                    onClick={handleReplace}
                    className="h-8 px-3.5 rounded-full text-[12px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 shadow-[0_2px_8px_-2px_hsl(var(--primary)/0.5)] transition-colors"
                  >
                    <Check className="w-4 h-4" aria-hidden="true" focusable="false" />
                    Replace
                  </button>
                </div>
              )}

              {status === "error" && (
                <button
                  type="button"
                  onClick={handleRegenerate}
                  className="h-8 px-3 rounded-full text-[12px] font-medium text-destructive hover:bg-destructive/10 inline-flex items-center gap-1.5 transition-colors flex-shrink-0"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" focusable="false" />
                  Try again
                </button>
              )}
            </div>

            {/* Body */}
            {status === "loading" && (
              <div className="px-5 py-5 space-y-2.5">
                <div className="h-3 rounded-full bg-primary/10 animate-pulse w-[92%]" />
                <div className="h-3 rounded-full bg-primary/10 animate-pulse w-[78%]" />
                <div className="h-3 rounded-full bg-primary/10 animate-pulse w-[85%]" />
                <div className="h-3 rounded-full bg-primary/10 animate-pulse w-[64%]" />
                <p className="text-[12px] text-muted-foreground pt-1">
                  Your original stays untouched.
                </p>
              </div>
            )}

            {status === "preview" && (
              <div className="px-5 py-4 max-h-80 overflow-y-auto">
                <div
                  className="prose dark:prose-invert max-w-none text-foreground break-words [overflow-wrap:anywhere]"
                  dangerouslySetInnerHTML={{ __html: preview }}
                />
              </div>
            )}

            {status === "error" && (
              <div className="px-5 py-4">
                <p className="text-[14px] text-muted-foreground">
                  The AI couldn't return a rewrite. Your original content is unchanged — try again or pick a different style.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
