import { useEffect, useMemo, useRef, useState } from "react";
import { Languages, Info, Sparkles, RefreshCw, Copy, Check } from "lucide-react";
import Lottie from "lottie-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { AIBlockLoader } from "./AIBlockLoader";
import emptyOutlineLottie from "@/assets/empty-outline.json";
import {
  clearAudioTranscribe,
  setAudioTranscribe,
  getAudioTranscribe,
} from "@/services/audioTranscribeStore";

interface AudioTranscribePanelProps {
  blockId?: string;
  fileName?: string | null;
  description?: string;
}

// Rough heuristic: detect non-English hints from the filename or description
// so the demo can exercise both success and unsupported-language flows.
const NON_ENGLISH_HINTS: { label: string; pattern: RegExp }[] = [
  { label: "Spanish", pattern: /\b(spanish|espanol|español|_es|-es)\b/i },
  { label: "French", pattern: /\b(french|francais|français|_fr|-fr)\b/i },
  { label: "German", pattern: /\b(german|deutsch|_de|-de)\b/i },
  { label: "Hindi", pattern: /\b(hindi|_hi|-hi)\b/i },
  { label: "Arabic", pattern: /\b(arabic|_ar|-ar)\b/i },
  { label: "Mandarin", pattern: /\b(chinese|mandarin|_zh|-zh)\b/i },
  { label: "Portuguese", pattern: /\b(portuguese|português|_pt|-pt)\b/i },
  { label: "Japanese", pattern: /\b(japanese|_ja|-ja)\b/i },
];

const DEMO_TRANSCRIPT = `Welcome to this session on the glossary of banking. In this recording we walk through the essential terms every learner should recognise before moving on to more advanced modules.

We start with foundational concepts — assets, liabilities, equity — then explore how retail banks differ from investment banks, and close with a short primer on interest rates, credit risk, and liquidity.

Feel free to pause at any point and revisit each term. A downloadable glossary sheet is attached to the next page for quick reference.`;

const STAGES = [
  "Preparing audio",
  "Detecting language",
  "Transcribing speech",
  "Punctuating & formatting",
  "Finalising transcript",
];

export function AudioTranscribePanel({ fileName, description }: AudioTranscribePanelProps) {
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "unsupported">("idle");
  const [transcript, setTranscript] = useState("");
  const [detected, setDetected] = useState<string>("English");
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  const detectedFromName = useMemo(() => {
    const haystack = `${fileName ?? ""} ${description ?? ""}`;
    for (const hint of NON_ENGLISH_HINTS) {
      if (hint.pattern.test(haystack)) return hint.label;
    }
    return "English";
  }, [fileName, description]);

  const runTranscription = () => {
    setStatus("loading");
    setTranscript("");
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      const lang = detectedFromName;
      setDetected(lang);
      if (lang === "English") {
        setTranscript(DEMO_TRANSCRIPT);
        setStatus("ready");
      } else {
        setStatus("unsupported");
      }
    }, 3200);
  };

  const handleToggle = (next: boolean) => {
    setEnabled(next);
    if (next) {
      runTranscription();
    } else {
      setStatus("idle");
      setTranscript("");
      if (timerRef.current) window.clearTimeout(timerRef.current);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  const wordCount = useMemo(
    () => (transcript.trim() ? transcript.trim().split(/\s+/).length : 0),
    [transcript],
  );
  const readingMinutes = Math.max(1, Math.round(wordCount / 200));

  return (
    <div className="mt-3 rounded-2xl border border-border/60 bg-gradient-to-br from-background via-background to-primary/[0.03] shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_hsl(var(--primary)/0.25)] overflow-hidden">
      {/* Header row */}
      <div className="flex items-start sm:items-center justify-between gap-3 px-4 py-3.5 border-b border-border/50 bg-muted/20">
        <div className="flex items-start gap-3 min-w-0">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary flex items-center justify-center shrink-0 ring-1 ring-primary/15">
            <Languages className="w-4 h-4" aria-hidden="true" focusable="false" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-foreground">Transcribe audio</p>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-primary/10 text-primary">
                <Sparkles className="w-2.5 h-2.5" aria-hidden="true" focusable="false" />
                AI
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1.5 leading-relaxed">
              <Info className="w-3 h-3 mt-0.5 shrink-0" aria-hidden="true" focusable="false" />
              <span>Transcription currently supports English audio only — more languages are coming soon.</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={cn(
              "text-[11px] font-medium hidden sm:inline transition-colors",
              enabled ? "text-primary" : "text-muted-foreground",
            )}
          >
            {enabled ? "On" : "Off"}
          </span>
          <Switch
            checked={enabled}
            onCheckedChange={handleToggle}
            aria-label="Enable audio transcription"
          />
        </div>
      </div>

      {/* Body */}
      {enabled && (
        <div className="p-4">
          {status === "loading" && <AIBlockLoader stages={STAGES} />}

          {status === "ready" && (
            <div className="animate-fade-in rounded-xl border border-border/60 bg-background overflow-hidden">
              {/* Transcript toolbar */}
              <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/50 bg-muted/30">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                    Ready
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                    <Languages className="w-3 h-3" aria-hidden="true" focusable="false" />
                    <span className="font-medium text-foreground">{detected}</span>
                  </span>
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors",
                      copied
                        ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                    )}
                    aria-label="Copy transcript"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <span className="w-px h-4 bg-border mx-0.5" aria-hidden="true" />
                  <button
                    type="button"
                    onClick={runTranscription}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    aria-label="Regenerate transcript"
                  >
                    <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                    Regenerate
                  </button>
                </div>
              </div>

              {/* Transcript document */}
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                aria-label="Audio transcript"
                spellCheck
                className={cn(
                  "w-full min-h-[200px] bg-background px-4 py-3.5 text-[13.5px] leading-[1.7] text-foreground",
                  "placeholder:text-muted-foreground focus:outline-none focus:ring-0 border-0 resize-y",
                )}
              />

              {/* Meta footer */}
              <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-border/50 bg-muted/20 text-[11px] text-muted-foreground tabular-nums">
                <div className="flex items-center gap-3">
                  <span>{wordCount.toLocaleString()} words</span>
                  <span className="w-px h-3 bg-border" aria-hidden="true" />
                  <span>~{readingMinutes} min read</span>
                </div>
                <span className="hidden sm:inline">Edit freely — changes are saved with this block</span>
              </div>
            </div>
          )}

          {status === "unsupported" && (
            <div className="relative flex flex-col items-center justify-center text-center gap-4 py-8 px-6 rounded-xl border border-dashed border-border/70 bg-muted/20 animate-fade-in overflow-hidden">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-60"
                style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.10), transparent 70%)" }}
              />
              <div className="relative w-40 h-40" aria-hidden="true">
                <Lottie animationData={emptyOutlineLottie} loop autoplay />
              </div>
              <div className="relative space-y-1.5 max-w-md">
                <p className="text-base font-semibold text-foreground">
                  We can't transcribe this one just yet
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This audio sounds like it's in{" "}
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-background border border-border/70 font-medium text-foreground">
                    <Languages className="w-3 h-3" aria-hidden="true" focusable="false" />
                    {detected}
                  </span>
                  . Our transcription service understands English only for now — support for more languages is on the way. Thank you for your patience!
                </p>
              </div>
              <div className="relative flex items-center gap-2">
                <button
                  type="button"
                  onClick={runTranscription}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-background text-foreground hover:bg-muted/60 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                  Try again
                </button>
                <button
                  type="button"
                  onClick={() => handleToggle(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                >
                  Turn off transcription
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

