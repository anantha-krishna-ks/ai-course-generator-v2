import { useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Pause,
  Search,
  RefreshCw,
  Trash2,
  ChevronDown,
  Wand2,
  Check,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Volume2,
} from "lucide-react";


import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AISparkles } from "@/components/ui/ai-sparkles";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

// ---------- Voice Library ----------

interface VoiceOption {
  id: string;
  name: string;
  language: string;
  gender: "Female" | "Male" | "Neutral";
  age: "Young" | "Adult" | "Senior";
  category: string;
  accent: string;
  gradient: string;
}

const VOICE_LIBRARY: VoiceOption[] = [
  { id: "aria", name: "Aria", language: "English (US)", gender: "Female", age: "Adult", category: "Narration", accent: "American", gradient: "from-rose-400 to-pink-500" },
  { id: "sarah", name: "Sarah", language: "English (US)", gender: "Female", age: "Young", category: "Conversational", accent: "American", gradient: "from-fuchsia-400 to-purple-500" },
  { id: "george", name: "George", language: "English (UK)", gender: "Male", age: "Adult", category: "Narration", accent: "British", gradient: "from-sky-400 to-blue-500" },
  { id: "liam", name: "Liam", language: "English (US)", gender: "Male", age: "Young", category: "Conversational", accent: "American", gradient: "from-emerald-400 to-teal-500" },
  { id: "matilda", name: "Matilda", language: "English (AU)", gender: "Female", age: "Adult", category: "Documentary", accent: "Australian", gradient: "from-amber-400 to-orange-500" },
  { id: "brian", name: "Brian", language: "English (US)", gender: "Male", age: "Senior", category: "Corporate", accent: "American", gradient: "from-indigo-400 to-violet-500" },
  { id: "lily", name: "Lily", language: "English (UK)", gender: "Female", age: "Young", category: "E-learning", accent: "British", gradient: "from-pink-400 to-rose-500" },
  { id: "daniel", name: "Daniel", language: "English (UK)", gender: "Male", age: "Adult", category: "Narration", accent: "British", gradient: "from-cyan-400 to-sky-500" },
  { id: "charlotte", name: "Charlotte", language: "English (US)", gender: "Female", age: "Adult", category: "E-learning", accent: "American", gradient: "from-violet-400 to-fuchsia-500" },
  { id: "ethan", name: "Ethan", language: "English (US)", gender: "Male", age: "Young", category: "Casual", accent: "American", gradient: "from-teal-400 to-emerald-500" },
  { id: "sofia", name: "Sofia", language: "Spanish (ES)", gender: "Female", age: "Adult", category: "Narration", accent: "Castilian", gradient: "from-orange-400 to-red-500" },
  { id: "hugo", name: "Hugo", language: "French (FR)", gender: "Male", age: "Adult", category: "Documentary", accent: "Parisian", gradient: "from-blue-400 to-indigo-500" },
];

const DEFAULT_VOICE_ID = "aria";
const MAX_SCRIPT_CHARS = 5000;

// ---------- Persistent state (serialized in `content`) ----------

interface AIAudioState {
  script: string;
  voiceId: string;
  audioUrl: string;
  transcript: string;
  showTranscriptToLearners: boolean;
  favouriteVoices: string[];
  generatedAt: number | null;
}

const EMPTY_STATE: AIAudioState = {
  script: "",
  voiceId: DEFAULT_VOICE_ID,
  audioUrl: "",
  transcript: "",
  showTranscriptToLearners: true,
  favouriteVoices: [],
  generatedAt: null,
};

function parseState(content: string): AIAudioState {
  if (!content) return { ...EMPTY_STATE };
  try {
    const parsed = JSON.parse(content);
    return { ...EMPTY_STATE, ...parsed };
  } catch {
    return { ...EMPTY_STATE };
  }
}

// ---------- Component ----------

interface AIAudioBlockProps {
  content: string;
  onChange: (val: string) => void;
}

export function AIAudioBlock({ content, onChange }: AIAudioBlockProps) {
  const [state, setState] = useState<AIAudioState>(() => parseState(content));
  const [voiceLibraryOpen, setVoiceLibraryOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [replaceConfirmOpen, setReplaceConfirmOpen] = useState(false);
  const [isDraftingScript, setIsDraftingScript] = useState(false);
  const [transcriptEditorOpen, setTranscriptEditorOpen] = useState(false);

  // Persist to parent
  useEffect(() => {
    onChange(JSON.stringify(state));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const currentVoice = useMemo(
    () => VOICE_LIBRARY.find((v) => v.id === state.voiceId) ?? VOICE_LIBRARY[0],
    [state.voiceId]
  );

  const hasAudio = Boolean(state.audioUrl);
  const canGenerate = state.script.trim().length >= 10 && !isGenerating;

  const doGenerate = async () => {
    setIsGenerating(true);
    // Simulated generation. In a real integration, call ElevenLabs / OpenAI TTS
    // via a Lovable Cloud edge function and return an audio URL + transcript.
    await new Promise((r) => setTimeout(r, 1400));
    // Use a tiny silent WAV placeholder so <audio> renders controls.
    const silentWav =
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
    setState((s) => ({
      ...s,
      audioUrl: silentWav,
      transcript: s.script.trim(),
      generatedAt: Date.now(),
    }));
    setIsGenerating(false);
    toast({
      title: "Narration generated",
      description: `Voiced by ${currentVoice.name} — transcript ready.`,
    });
  };

  const handleGenerateClick = () => {
    if (!canGenerate) return;
    if (hasAudio) {
      setReplaceConfirmOpen(true);
      return;
    }
    doGenerate();
  };

  const confirmReplace = () => {
    setReplaceConfirmOpen(false);
    doGenerate();
  };

  const handleAiDraft = async () => {
    setIsDraftingScript(true);
    await new Promise((r) => setTimeout(r, 900));
    const draft =
      "Welcome to this lesson. In the next few minutes, we'll walk through the key concepts, share a practical example, and finish with a short recap so you can apply what you've learned right away.";
    setState((s) => ({ ...s, script: draft }));
    setIsDraftingScript(false);
    toast({ title: "Script drafted", description: "Feel free to edit before generating audio." });
  };

  const handleRemove = () => {
    setState((s) => ({ ...s, audioUrl: "", transcript: "", generatedAt: null }));
  };

  const toggleFavourite = (id: string) => {
    setState((s) => ({
      ...s,
      favouriteVoices: s.favouriteVoices.includes(id)
        ? s.favouriteVoices.filter((v) => v !== id)
        : [...s.favouriteVoices, id],
    }));
  };

  const selectVoice = (id: string) => {
    setState((s) => ({ ...s, voiceId: id }));
    setVoiceLibraryOpen(false);
  };

  return (
    <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-background via-background to-primary/[0.02] shadow-sm overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.03] to-transparent">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
          <AISparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">AI Audio Narration</p>
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-medium bg-primary/10 text-primary border border-primary/20">
              BETA
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Type a script, pick a voice, generate lifelike narration.
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Script input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="ai-audio-script" className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Script
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAiDraft}
              disabled={isDraftingScript}
              className="h-7 px-2.5 gap-1.5 text-xs rounded-full bg-primary/5 text-primary hover:bg-primary/10 border border-primary/15"
            >
              {isDraftingScript ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <AISparkles className="w-3 h-3" />
              )}
              Draft with AI
            </Button>
          </div>
          <Textarea
            id="ai-audio-script"
            value={state.script}
            onChange={(e) => {
              const next = e.target.value.slice(0, MAX_SCRIPT_CHARS);
              setState((s) => ({ ...s, script: next }));
            }}
            placeholder="Type or paste the script you want to narrate. Aim for a natural, spoken tone…"
            className="min-h-[120px] resize-y text-sm leading-relaxed bg-background/80 border-border/70 focus-visible:ring-primary/25"
          />
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className={cn(state.script.trim().length > 0 && state.script.trim().length < 10 && "text-amber-600")}>
              {state.script.trim().length < 10
                ? "Add at least 10 characters to generate audio"
                : "Ready to generate"}
            </span>
            <span className="tabular-nums">
              {state.script.length} / {MAX_SCRIPT_CHARS}
            </span>
          </div>
        </div>

        {/* Voice + Generate row */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={() => setVoiceLibraryOpen(true)}
            className="group flex-1 flex items-center gap-3 rounded-xl border border-border/70 bg-background/80 hover:border-primary/40 hover:bg-primary/[0.03] px-3 py-2.5 transition-all text-left"
            aria-label="Choose an AI voice"
          >
            <div
              className={cn(
                "w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-semibold shadow-sm flex-shrink-0",
                currentVoice.gradient
              )}
            >
              {currentVoice.name.slice(0, 1)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{currentVoice.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">
                {currentVoice.language} • {currentVoice.gender} • {currentVoice.category}
              </p>
            </div>

            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>

          <Button
            type="button"
            onClick={handleGenerateClick}
            disabled={!canGenerate}
            className="h-auto min-h-[52px] sm:w-auto w-full px-5 gap-2 rounded-xl bg-gradient-to-br from-primary to-primary/85 hover:from-primary hover:to-primary/95 shadow-sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                {hasAudio ? "Regenerate" : "Generate audio"}
              </>
            )}
          </Button>
        </div>

        {/* Audio + transcript result */}
        {hasAudio && !isGenerating && (
          <div className="rounded-xl border border-border/60 bg-background/70 overflow-hidden">
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border/40 bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-foreground leading-tight">
                    Narration ready
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Voiced by {currentVoice.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTranscriptEditorOpen(true)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  aria-label="Edit transcript"
                >
                  <FileText className="w-3.5 h-3.5" /> Transcript
                </button>
                <button
                  onClick={handleGenerateClick}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  aria-label="Regenerate audio"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleRemove}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  aria-label="Delete narration"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="p-3">
              <audio src={state.audioUrl} controls className="w-full h-10" />
            </div>
            {state.transcript && (
              <div className="px-3.5 pb-3 pt-1">
                <div className="rounded-lg bg-muted/40 border border-border/40 p-3 max-h-32 overflow-y-auto">
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]">
                    {state.transcript}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2.5 pt-1">
                  <div className="flex items-center gap-2">
                    {state.showTranscriptToLearners ? (
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                    <Label htmlFor="show-transcript-learners" className="text-[11px] text-muted-foreground cursor-pointer">
                      Show transcript to learners
                    </Label>
                  </div>
                  <Switch
                    id="show-transcript-learners"
                    checked={state.showTranscriptToLearners}
                    onCheckedChange={(v) =>
                      setState((s) => ({ ...s, showTranscriptToLearners: v }))
                    }
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- Voice library dialog --- */}
      <VoiceLibraryDialog
        open={voiceLibraryOpen}
        onOpenChange={setVoiceLibraryOpen}
        voices={VOICE_LIBRARY}
        currentVoiceId={state.voiceId}
        favourites={state.favouriteVoices}
        onToggleFavourite={toggleFavourite}
        onSelect={selectVoice}
      />

      {/* --- Replace-audio confirm --- */}
      <Dialog open={replaceConfirmOpen} onOpenChange={setReplaceConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Replace existing narration?</DialogTitle>
            <DialogDescription>
              This will discard the current audio and transcript and generate a new one from your updated script.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setReplaceConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmReplace} className="gap-1.5">
              <Wand2 className="w-4 h-4" /> Regenerate
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- Transcript editor --- */}
      <Dialog open={transcriptEditorOpen} onOpenChange={setTranscriptEditorOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Edit transcript
            </DialogTitle>
            <DialogDescription>
              Fix typos or refine wording. Changes here don't regenerate the audio.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={state.transcript}
            onChange={(e) => setState((s) => ({ ...s, transcript: e.target.value }))}
            className="min-h-[240px] text-sm leading-relaxed"
          />
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Switch
                id="show-transcript-modal"
                checked={state.showTranscriptToLearners}
                onCheckedChange={(v) => setState((s) => ({ ...s, showTranscriptToLearners: v }))}
              />
              <Label htmlFor="show-transcript-modal" className="text-xs cursor-pointer">
                Show transcript to learners
              </Label>
            </div>
            <Button onClick={() => setTranscriptEditorOpen(false)}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------- Voice Library dialog ----------

interface VoiceLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voices: VoiceOption[];
  currentVoiceId: string;
  favourites: string[]; // kept for API compatibility, unused
  onToggleFavourite: (id: string) => void; // kept for API compatibility, unused
  onSelect: (id: string) => void;
}

const PREVIEW_DURATION_MS = 2600;

function VoiceLibraryDialog({
  open,
  onOpenChange,
  voices,
  currentVoiceId,
  onSelect,
}: VoiceLibraryDialogProps) {
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [ageFilter, setAgeFilter] = useState<string>("all");
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  const stopPreview = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setPreviewingId(null);
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open) stopPreview();
  }, [open]);

  const languages = useMemo(
    () => Array.from(new Set(voices.map((v) => v.language))),
    [voices]
  );

  const filtered = useMemo(() => {
    return voices.filter((v) => {
      if (langFilter !== "all" && v.language !== langFilter) return false;
      if (genderFilter !== "all" && v.gender !== genderFilter) return false;
      if (ageFilter !== "all" && v.age !== ageFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !v.name.toLowerCase().includes(q) &&
          !v.category.toLowerCase().includes(q) &&
          !v.accent.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [voices, langFilter, genderFilter, ageFilter, search]);

  const togglePreview = (id: string) => {
    if (previewingId === id) {
      stopPreview();
      return;
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setPreviewingId(id);
    setProgress(0);
    startRef.current = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - startRef.current) / PREVIEW_DURATION_MS);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        stopPreview();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Volume2 className="w-4 h-4 text-primary" aria-hidden="true" focusable="false" />
            Voice Library
          </DialogTitle>
          <DialogDescription className="text-xs">
            Tap any voice to hear a sample. Pick the one that fits your course.
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="px-6 pb-3 space-y-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" focusable="false" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, style, or accent…"
              className="pl-9 h-9 rounded-full bg-muted/40 border-transparent focus-visible:bg-background focus-visible:border-input"
              aria-label="Search voices"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterSelect label="Language" value={langFilter} onChange={setLangFilter}
              options={[{ value: "all", label: "All languages" }, ...languages.map((l) => ({ value: l, label: l }))]} />
            <FilterSelect label="Gender" value={genderFilter} onChange={setGenderFilter}
              options={[
                { value: "all", label: "All genders" },
                { value: "Female", label: "Female" },
                { value: "Male", label: "Male" },
                { value: "Neutral", label: "Neutral" },
              ]} />
            <FilterSelect label="Age" value={ageFilter} onChange={setAgeFilter}
              options={[
                { value: "all", label: "All ages" },
                { value: "Young", label: "Young" },
                { value: "Adult", label: "Adult" },
                { value: "Senior", label: "Senior" },
              ]} />
          </div>
        </div>

        {/* Voice list */}
        <div className="border-t border-border/60">
          <ScrollArea className="max-h-[440px]">
            <ul className="divide-y divide-border/50">
              {filtered.length === 0 && (
                <li className="text-center text-sm text-muted-foreground py-12">
                  No voices match those filters.
                </li>
              )}
              {filtered.map((v) => {
                const isCurrent = v.id === currentVoiceId;
                const isPreviewing = previewingId === v.id;
                return (
                  <li
                    key={v.id}
                    className={cn(
                      "group relative flex items-center gap-3 px-6 py-3 transition-colors",
                      isCurrent ? "bg-primary/5" : "hover:bg-muted/40"
                    )}
                  >
                    {/* Play sample */}
                    <button
                      onClick={() => togglePreview(v.id)}
                      className={cn(
                        "relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                        isPreviewing
                          ? "bg-primary text-primary-foreground shadow-md scale-105"
                          : "bg-muted text-foreground hover:bg-primary/10 hover:text-primary"
                      )}
                      aria-label={isPreviewing ? `Stop sample of ${v.name}` : `Play sample of ${v.name}`}
                    >
                      {isPreviewing ? (
                        <Pause className="w-4 h-4" aria-hidden="true" focusable="false" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5" aria-hidden="true" focusable="false" />
                      )}
                      {isPreviewing && (
                        <svg
                          className="absolute inset-0 -rotate-90"
                          viewBox="0 0 40 40"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <circle
                            cx="20"
                            cy="20"
                            r="18"
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeOpacity="0.25"
                            strokeWidth="2"
                          />
                          <circle
                            cx="20"
                            cy="20"
                            r="18"
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 18}
                            strokeDashoffset={2 * Math.PI * 18 * (1 - progress)}
                          />
                        </svg>
                      )}
                    </button>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">{v.name}</p>
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          {v.gender} • {v.age}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {v.language} • {v.category} • {v.accent}
                      </p>
                      {isPreviewing && <WaveformBars />}
                    </div>

                    {/* Action */}
                    {isCurrent ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary px-2.5 py-1 rounded-full bg-primary/10">
                        <Check className="w-3 h-3" aria-hidden="true" focusable="false" /> Selected
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          onSelect(v.id);
                          stopPreview();
                        }}
                        className="h-8 px-3 text-xs opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                      >
                        Use voice
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WaveformBars() {
  // Purely decorative animated bars while a sample is "playing"
  return (
    <div className="flex items-end gap-[2px] h-3 mt-1.5" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
        <span
          key={i}
          className="w-[2px] bg-primary/70 rounded-full animate-pulse"
          style={{
            height: `${30 + ((i * 37) % 70)}%`,
            animationDelay: `${i * 80}ms`,
            animationDuration: "900ms",
          }}
        />
      ))}
    </div>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}

function FilterSelect({ label, value, onChange, options }: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 text-xs w-auto min-w-[130px] gap-1.5 rounded-full bg-muted/40 border-transparent" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="text-xs">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

