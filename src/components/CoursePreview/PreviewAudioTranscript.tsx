import { useEffect, useState } from "react";
import { Captions, Sparkles, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getAudioTranscribe,
  subscribeAudioTranscribe,
  type AudioTranscribeState,
} from "@/services/audioTranscribeStore";

interface PreviewAudioTranscriptProps {
  blockId: string;
  className?: string;
}

/**
 * Read-only, premium transcript panel shown in the course preview for
 * audio blocks whose author enabled transcription in the editor.
 */
export function PreviewAudioTranscript({ blockId, className }: PreviewAudioTranscriptProps) {
  const [state, setState] = useState<AudioTranscribeState | undefined>(() => getAudioTranscribe(blockId));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setState(getAudioTranscribe(blockId));
    return subscribeAudioTranscribe(() => setState(getAudioTranscribe(blockId)));
  }, [blockId]);

  if (!state?.enabled || state.status !== "ready" || !state.transcript?.trim()) return null;

  const words = state.transcript.trim().split(/\s+/).length;
  const readingMinutes = Math.max(1, Math.round(words / 200));

  return (
    <div
      className={cn(
        "mt-3 rounded-2xl border border-border/60 bg-gradient-to-br from-background via-background to-primary/[0.04]",
        "shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_hsl(var(--primary)/0.25)] overflow-hidden animate-fade-in",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-muted/20 border-b border-border/50 text-left"
        aria-expanded={open}
        aria-controls={`transcript-${blockId}`}
      >
        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary flex items-center justify-center shrink-0 ring-1 ring-primary/15">
          <Captions className="w-4 h-4" aria-hidden="true" focusable="false" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-foreground">Transcript</p>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-primary/10 text-primary">
              <Sparkles className="w-2.5 h-2.5" aria-hidden="true" focusable="false" />
              AI
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <span className="w-1 h-1 rounded-full bg-border" aria-hidden="true" />
              <span className="font-medium text-foreground">{state.detected}</span>
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">
            {words.toLocaleString()} words · ~{readingMinutes} min read
          </p>
        </div>
        <ChevronDown
          className={cn("w-4 h-4 text-muted-foreground transition-transform shrink-0", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div id={`transcript-${blockId}`} className="px-5 py-4 bg-background">
          <p className="text-[13.5px] leading-[1.75] text-foreground whitespace-pre-wrap [overflow-wrap:anywhere] border-l-2 border-primary/30 pl-4">
            {state.transcript}
          </p>
        </div>
      )}
    </div>
  );
}
