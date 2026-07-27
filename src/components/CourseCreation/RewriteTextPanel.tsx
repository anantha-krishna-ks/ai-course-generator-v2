import { useEffect, useMemo, useRef, useState } from "react";
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
  Undo2,
} from "lucide-react";
import { AISparkles } from "@/components/ui/ai-sparkles";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";

/**
 * RewriteTextPanel — compact "command bar" for AI rewrites.
 *
 * UX approach (Notion-AI / Linear style):
 *  - The panel itself is a slim, single-purpose command bar (chips + input).
 *  - The AI preview is rendered **inside the actual text block** via
 *    `onPreviewChange(html)` so the author can compare the change in-context.
 *  - Original content is never mutated until `onReplace` runs.
 *  - Preview state swaps the command bar for a small action strip
 *    (Keep original · Regenerate · Replace).
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
  /**
   * Called whenever the previewed HTML changes. Parent uses this to render
   * the preview in-place inside the block instead of the original content.
   * Null means "no active preview — show original".
   */
  onPreviewChange?: (previewHtml: string | null) => void;
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

export function RewriteTextPanel({ content, onReplace, onCancel, onPreviewChange }: RewriteTextPanelProps) {
  const [activePreset, setActivePreset] = useState<RewritePresetId | null>(null);
  const [instruction, setInstruction] = useState("");
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
      onPreviewChange?.(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emitPreview = (html: string | null) => {
    onPreviewChange?.(html);
  };

  const runRewrite = (preset: RewritePresetId | null, customInstruction: string, nextSeed: number) => {
    if (!hasContent) return;
    setStatus("loading");
    setActivePreset(preset);
    emitPreview(null);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      const shouldFail = nextSeed > 0 && Math.random() < 0.08;
      if (shouldFail) {
        setStatus("error");
        return;
      }
      const html = mockRewrite(content, preset, customInstruction, nextSeed);
      setPreview(html);
      emitPreview(sanitizeHtml(html));
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
    runRewrite(activePreset, instruction, next);
  };

  const handleReplace = () => {
    onReplace(sanitizeHtml(preview));
    emitPreview(null);
  };

  const handleKeepOriginal = () => {
    setStatus("idle");
    setPreview("");
    setActivePreset(null);
    emitPreview(null);
  };

  const handleCancel = () => {
    emitPreview(null);
    onCancel();
  };

  const activePresetMeta = PRESETS.find((p) => p.id === activePreset);

  return (
    <div
      role="region"
      aria-label="Edit with AI: Rewrite Text"
      className="mt-2 animate-fade-in"
    >
      {/* PREVIEW STATE — compact action strip only. The rewrite is shown IN the block above. */}
      {status === "preview" ? (
        <div className="rounded-full border border-primary/30 bg-gradient-to-r from-primary/[0.06] to-primary/[0.02] shadow-[0_6px_20px_-10px_hsl(var(--primary)/0.35)] backdrop-blur-sm pl-3 pr-1.5 py-1.5 flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" aria-hidden="true" />
            <span className="text-[12px] font-medium text-foreground truncate">
              AI rewrite ready
              {activePresetMeta && (
                <span className="text-muted-foreground font-normal"> · {activePresetMeta.label}</span>
              )}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            Previewing above — not saved
          </span>
          <div className="flex items-center gap-1 ml-auto">
            <button
              type="button"
              onClick={handleKeepOriginal}
              className="h-7 px-2.5 rounded-full text-[11.5px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 inline-flex items-center gap-1 transition-colors"
            >
              <Undo2 className="w-3 h-3" aria-hidden="true" focusable="false" />
              Keep original
            </button>
            <button
              type="button"
              onClick={handleRegenerate}
              className="h-7 px-2.5 rounded-full text-[11.5px] font-medium text-primary hover:bg-primary/10 inline-flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" aria-hidden="true" focusable="false" />
              Regenerate
            </button>
            <button
              type="button"
              onClick={handleReplace}
              className="h-7 px-3 rounded-full text-[11.5px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1 shadow-[0_2px_8px_-2px_hsl(var(--primary)/0.5)] transition-colors"
            >
              <Check className="w-3 h-3" aria-hidden="true" focusable="false" />
              Replace
            </button>
            <button
              type="button"
              onClick={handleCancel}
              aria-label="Close rewrite"
              className="ml-0.5 w-7 h-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 inline-flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
            </button>
          </div>
        </div>
      ) : (
        /* COMMAND-BAR STATE — compact single card. */
        <div className="rounded-2xl border border-primary/20 bg-background/95 shadow-[0_8px_24px_-12px_hsl(var(--primary)/0.25)] backdrop-blur-sm overflow-hidden">
          {/* Row 1: title + close */}
          <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <AISparkles className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-[12px] font-semibold text-foreground">Rewrite with AI</span>
              {!hasContent && (
                <span className="text-[11px] text-muted-foreground truncate">
                  · add some text first
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleCancel}
              aria-label="Close rewrite"
              className="w-6 h-6 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 inline-flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
            </button>
          </div>

          {/* Row 2: preset chips (horizontal scroll on narrow) */}
          <div className="px-3 pb-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {PRESETS.map((p) => {
              const Icon = p.icon;
              const isActive = activePreset === p.id && status === "loading";
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePreset(p.id)}
                  disabled={!hasContent || status === "loading"}
                  title={p.hint}
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 h-7 rounded-full text-[11.5px] font-medium border whitespace-nowrap transition-all duration-150 flex-shrink-0",
                    "disabled:opacity-40 disabled:cursor-not-allowed",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground/80 border-border hover:border-primary/40 hover:text-primary hover:bg-primary/[0.04]"
                  )}
                >
                  <Icon className={cn("w-3 h-3", isActive ? "text-primary-foreground" : "text-primary")} />
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Row 3: custom instruction — inline input */}
          <div className="px-2 pb-2">
            <div className="flex items-end gap-1.5 rounded-xl border border-border/70 bg-muted/30 px-2.5 py-1.5 focus-within:border-primary/40 focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/15 transition-all">
              <textarea
                ref={inputRef}
                value={instruction}
                onChange={(e) => {
                  setInstruction(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && instruction.trim() && hasContent) {
                    e.preventDefault();
                    handleSubmitInstruction();
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    handleCancel();
                  }
                }}
                placeholder='Tell AI what to change — e.g. "shorten to 3 sentences"'
                aria-label="Custom rewrite instruction"
                disabled={!hasContent || status === "loading"}
                rows={1}
                className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none resize-none min-h-[22px] max-h-[96px] py-0.5 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleSubmitInstruction}
                disabled={!instruction.trim() || !hasContent || status === "loading"}
                aria-label="Submit custom instruction"
                className={cn(
                  "w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center transition-colors",
                  instruction.trim() && hasContent && status !== "loading"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {status === "loading" ? (
                  <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" focusable="false" />
                ) : (
                  <ArrowUp className="w-3 h-3" aria-hidden="true" focusable="false" />
                )}
              </button>
            </div>
          </div>

          {/* Loading strip */}
          {status === "loading" && (
            <div className="px-3 py-2 border-t border-primary/10 bg-primary/[0.03] flex items-center gap-2 text-[11.5px] text-primary animate-fade-in">
              <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" focusable="false" />
              <span className="font-medium">Rewriting…</span>
              <span className="text-muted-foreground">Your original is safe.</span>
            </div>
          )}

          {/* Error strip */}
          {status === "error" && (
            <div
              role="alert"
              className="px-3 py-2 border-t border-destructive/20 bg-destructive/[0.04] flex items-center gap-2 animate-fade-in"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-destructive flex-shrink-0" aria-hidden="true" focusable="false" />
              <span className="text-[12px] text-foreground font-medium">Rewrite failed.</span>
              <span className="text-[11.5px] text-muted-foreground">Original unchanged.</span>
              <button
                type="button"
                onClick={handleRegenerate}
                className="ml-auto h-6 px-2 rounded-full text-[11px] font-medium text-destructive hover:bg-destructive/10 inline-flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" aria-hidden="true" focusable="false" />
                Try again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
