import { useMemo, useRef, useState } from "react";
import { Languages, Info, Sparkles, RefreshCw, Copy, Check } from "lucide-react";
import Lottie from "lottie-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { AIBlockLoader } from "./AIBlockLoader";
import emptyOutlineLottie from "@/assets/empty-outline.json";

interface AudioTranscribePanelProps {
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

  return (
    <div className="mt-3 rounded-xl border border-border/60 bg-gradient-to-br from-background to-primary/[0.02] overflow-hidden">
      {/* Header row */}
      <div className="flex items-start sm:items-center justify-between gap-3 px-4 py-3 border-b border-border/50">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Languages className="w-4 h-4" aria-hidden="true" focusable="false" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Transcribe audio</p>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-start gap-1">
              <Info className="w-3 h-3 mt-0.5 shrink-0" aria-hidden="true" focusable="false" />
              <span>Transcription is currently supported for English audio only. Support for more languages is coming soon.</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground hidden sm:inline">
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
          {status === "loading" && (
            <AIBlockLoader stages={STAGES} />
          )}

          {status === "ready" && (
            <div className="space-y-2 animate-fade-in">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />
                  <span>Transcript ready · Detected language: <span className="font-medium text-foreground">{detected}</span></span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                    aria-label="Copy transcript"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button
                    type="button"
                    onClick={runTranscription}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    aria-label="Regenerate transcript"
                  >
                    <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                    Regenerate
                  </button>
                </div>
              </div>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                aria-label="Audio transcript"
                className={cn(
                  "w-full min-h-[160px] rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground",
                  "placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-y"
                )}
              />
            </div>
          )}

          {status === "unsupported" && (
            <div className="flex flex-col items-center justify-center text-center gap-3 py-6 animate-fade-in">
              <div className="w-40 h-40" aria-hidden="true">
                <Lottie animationData={emptyOutlineLottie} loop autoplay />
              </div>
              <div className="space-y-1 max-w-md">
                <p className="text-sm font-semibold text-foreground">
                  We can't transcribe this one yet
                </p>
                <p className="text-sm text-muted-foreground">
                  It looks like this audio is in <span className="font-medium text-foreground">{detected}</span>. Right now our transcription
                  service understands English only — but support for more languages is on the way. Thank you for your patience!
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle(false)}
                className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                Turn off transcription
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
