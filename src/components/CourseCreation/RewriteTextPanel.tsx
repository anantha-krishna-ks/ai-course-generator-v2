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
  Send,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AISparkles } from "@/components/ui/ai-sparkles";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";

/**
 * RewriteTextPanel — inline "Edit with AI: Rewrite Text" surface.
 *
 * Implements the FRD:
 *  - Six presets + custom instruction
 *  - Never overwrites content until Replace is clicked
 *  - Preview / Replace / Regenerate / Cancel actions
 *  - Empty-selection and failure edge cases
 *
 * Rendered inline (not a modal) so authors stay in-context with the block.
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
  { id: "simple", label: "Make it simple", hint: "Plain, everyday language", icon: Wand2 },
  { id: "summarize", label: "Summarize", hint: "Tighter, key points only", icon: ScrollText },
  { id: "actionable", label: "Make it actionable", hint: "Concrete steps a learner can take", icon: ListChecks },
  { id: "detail", label: "Add detail", hint: "Expand with context and examples", icon: Plus },
  { id: "persuasive", label: "Make it persuasive", hint: "Confident, motivating tone", icon: Megaphone },
  { id: "bullets", label: "Bullet points", hint: "Reformat as a scannable list", icon: List },
];

interface RewriteTextPanelProps {
  /** Current HTML content of the block (the "selection" for now = full block). */
  content: string;
  /** Called with the new HTML when the author clicks Replace. */
  onReplace: (nextContent: string) => void;
  /** Close the panel without applying changes. */
  onCancel: () => void;
}

function htmlToPlain(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return (div.textContent || div.innerText || "").trim();
}

/**
 * Local, deterministic mock rewriter — good enough for UI review.
 * Replace with a real AI call when the endpoint is wired up.
 */
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
  const [activePreset, setActivePreset] = useState<RewritePresetId | null>(null);
  const [instruction, setInstruction] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "preview" | "error">("idle");
  const [preview, setPreview] = useState<string>("");
  const [seed, setSeed] = useState(0);
  const timerRef = useRef<number | null>(null);
  const instructionRef = useRef<HTMLTextAreaElement>(null);

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
    if (timerRef.current) window.clearTimeout(timerRef.current);
    // Simulated latency; ~10% chance to fail so the error state is reachable via Regenerate.
    timerRef.current = window.setTimeout(() => {
      const shouldFail = nextSeed > 0 && Math.random() < 0.08;
      if (shouldFail) {
        setStatus("error");
        return;
      }
      setPreview(mockRewrite(content, preset, customInstruction, nextSeed));
      setStatus("preview");
    }, 1200);
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
  };

  const handleRetry = () => {
    handleRegenerate();
  };

  return (
    <section
      role="region"
      aria-label="Edit with AI: Rewrite Text"
      className="mt-3 rounded-2xl border border-primary/25 bg-gradient-to-b from-primary/[0.04] to-background shadow-[0_10px_28px_-14px_hsl(var(--primary)/0.25)] overflow-hidden animate-fade-in"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-primary/15 bg-background/60 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <AISparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-foreground leading-tight flex items-center gap-1.5">
              Edit with AI
              <span className="text-muted-foreground font-normal">·</span>
              <span className="text-primary">Rewrite Text</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              Pick a style or write your own instruction — nothing changes until you Replace.
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          aria-label="Close rewrite panel"
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" aria-hidden="true" focusable="false" />
        </button>
      </div>

      <div className="px-4 sm:px-5 py-4 space-y-4">
        {/* Selected text echo */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              Selected text
            </span>
            <span className="text-[11px] text-muted-foreground">
              {plainOriginal.length} characters
            </span>
          </div>
          <div
            className={cn(
              "rounded-lg border bg-muted/30 px-3 py-2.5 max-h-28 overflow-y-auto text-sm text-foreground/90 leading-relaxed",
              !hasContent && "italic text-muted-foreground"
            )}
          >
            {hasContent ? plainOriginal : "No text in this block yet — add some text or use “Generate text with AI” instead."}
          </div>
        </div>

        {/* Presets */}
        <div>
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Rewrite style
          </div>
          <div className="flex flex-wrap gap-1.5">
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
                    "group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150",
                    "disabled:opacity-40 disabled:cursor-not-allowed",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-[0_4px_10px_-4px_hsl(var(--primary)/0.4)]"
                      : "bg-background text-foreground border-border hover:border-primary/40 hover:bg-primary/[0.04]"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", isActive ? "text-primary-foreground" : "text-primary")} />
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom instruction */}
        <div>
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Or write a custom instruction
          </div>
          <div className="flex items-end gap-2 rounded-xl border border-border/80 bg-background px-3 py-2 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15 transition-all">
            <textarea
              ref={instructionRef}
              value={instruction}
              onChange={(e) => {
                setInstruction(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && instruction.trim() && hasContent) {
                  e.preventDefault();
                  handleSubmitInstruction();
                }
              }}
              placeholder='e.g., "Shorten to 3 sentences and add an example"'
              aria-label="Custom rewrite instruction"
              disabled={!hasContent || status === "loading"}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none min-h-[28px] max-h-[120px] py-1 disabled:opacity-50"
              rows={1}
            />
            <button
              onClick={handleSubmitInstruction}
              disabled={!instruction.trim() || !hasContent || status === "loading"}
              aria-label="Submit custom instruction"
              className={cn(
                "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center transition-colors",
                instruction.trim() && hasContent && status !== "loading"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Send className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5 px-0.5">
            Enter to submit · Shift+Enter for a new line
          </p>
        </div>

        {/* Loading */}
        {status === "loading" && (
          <div className="rounded-xl border border-primary/20 bg-primary/[0.03] px-4 py-6 flex flex-col items-center justify-center gap-2 animate-fade-in">
            <Loader2 className="w-5 h-5 text-primary animate-spin" aria-hidden="true" focusable="false" />
            <p className="text-sm font-medium text-primary">Rewriting your text…</p>
            <p className="text-[11px] text-muted-foreground">Your original is safe — nothing has changed yet.</p>
          </div>
        )}

        {/* Preview */}
        {status === "preview" && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-primary uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" aria-hidden="true" />
                Rewrite preview
              </span>
              <span className="text-[11px] text-muted-foreground">Not applied yet</span>
            </div>
            <div className="rounded-xl border border-primary/30 bg-primary/[0.04] px-4 py-3 max-h-64 overflow-y-auto">
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-foreground break-words [overflow-wrap:anywhere]"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(preview) }}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
              <p className="text-[11px] text-muted-foreground">
                Replacing will save a new entry in Version History.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onCancel}
                  className="rounded-full h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRegenerate}
                  className="rounded-full h-8 px-3 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
                >
                  <RefreshCw className="w-3 h-3" aria-hidden="true" focusable="false" />
                  Regenerate
                </Button>
                <Button
                  size="sm"
                  onClick={handleReplace}
                  className="rounded-full h-8 px-4 text-xs gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                  Replace
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/[0.04] px-4 py-3 flex items-start gap-3 animate-fade-in"
          >
            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" aria-hidden="true" focusable="false" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Rewrite failed</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                The AI couldn't return a rewrite. Your original content is unchanged.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetry}
              className="rounded-full h-8 px-3 text-xs gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/5"
            >
              <RefreshCw className="w-3 h-3" aria-hidden="true" focusable="false" />
              Try again
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
