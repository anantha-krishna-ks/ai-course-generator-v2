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

import ariaImg from "@/assets/voices/aria.jpg";
import sarahImg from "@/assets/voices/sarah.jpg";
import georgeImg from "@/assets/voices/george.jpg";
import liamImg from "@/assets/voices/liam.jpg";
import matildaImg from "@/assets/voices/matilda.jpg";
import brianImg from "@/assets/voices/brian.jpg";
import lilyImg from "@/assets/voices/lily.jpg";
import danielImg from "@/assets/voices/daniel.jpg";
import charlotteImg from "@/assets/voices/charlotte.jpg";
import ethanImg from "@/assets/voices/ethan.jpg";
import sofiaImg from "@/assets/voices/sofia.jpg";
import hugoImg from "@/assets/voices/hugo.jpg";

// ---------- Voice Library ----------

export interface VoiceOption {
  id: string;
  name: string;
  language: string;
  gender: "Female" | "Male" | "Neutral";
  age: "Young" | "Adult" | "Senior";
  category: string;
  accent: string;
  gradient: string;
  image: string;
}

export const VOICE_LIBRARY: VoiceOption[] = [
  { id: "aria", name: "Aria", language: "English (US)", gender: "Female", age: "Adult", category: "Narration", accent: "American", gradient: "from-rose-400 to-pink-500", image: ariaImg },
  { id: "sarah", name: "Sarah", language: "English (US)", gender: "Female", age: "Young", category: "Conversational", accent: "American", gradient: "from-fuchsia-400 to-purple-500", image: sarahImg },
  { id: "george", name: "George", language: "English (UK)", gender: "Male", age: "Adult", category: "Narration", accent: "British", gradient: "from-sky-400 to-blue-500", image: georgeImg },
  { id: "liam", name: "Liam", language: "English (US)", gender: "Male", age: "Young", category: "Conversational", accent: "American", gradient: "from-emerald-400 to-teal-500", image: liamImg },
  { id: "matilda", name: "Matilda", language: "English (AU)", gender: "Female", age: "Adult", category: "Documentary", accent: "Australian", gradient: "from-amber-400 to-orange-500", image: matildaImg },
  { id: "brian", name: "Brian", language: "English (US)", gender: "Male", age: "Senior", category: "Corporate", accent: "American", gradient: "from-indigo-400 to-violet-500", image: brianImg },
  { id: "lily", name: "Lily", language: "English (UK)", gender: "Female", age: "Young", category: "E-learning", accent: "British", gradient: "from-pink-400 to-rose-500", image: lilyImg },
  { id: "daniel", name: "Daniel", language: "English (UK)", gender: "Male", age: "Adult", category: "Narration", accent: "British", gradient: "from-cyan-400 to-sky-500", image: danielImg },
  { id: "charlotte", name: "Charlotte", language: "English (US)", gender: "Female", age: "Adult", category: "E-learning", accent: "American", gradient: "from-violet-400 to-fuchsia-500", image: charlotteImg },
  { id: "ethan", name: "Ethan", language: "English (US)", gender: "Male", age: "Young", category: "Casual", accent: "American", gradient: "from-teal-400 to-emerald-500", image: ethanImg },
  { id: "sofia", name: "Sofia", language: "Spanish (ES)", gender: "Female", age: "Adult", category: "Narration", accent: "Castilian", gradient: "from-orange-400 to-red-500", image: sofiaImg },
  { id: "hugo", name: "Hugo", language: "French (FR)", gender: "Male", age: "Adult", category: "Documentary", accent: "Parisian", gradient: "from-blue-400 to-indigo-500", image: hugoImg },
];

const DEFAULT_VOICE_ID = "";
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
  voiceId: "",
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
    () => VOICE_LIBRARY.find((v) => v.id === state.voiceId),
    [state.voiceId]
  );

  const hasAudio = Boolean(state.audioUrl);
  const canGenerate = state.script.trim().length >= 10 && !!state.voiceId && !isGenerating;

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
      description: `Voiced by ${currentVoice?.name ?? "Unknown"} — transcript ready.`,
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
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <AISparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">AI Audio Narration</p>
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
              className="h-7 px-2.5 gap-1.5 text-xs rounded-full bg-primary/5 text-primary hover:bg-primary/10 border border-primary/20"
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
            className="min-h-[120px] resize-y text-sm leading-relaxed bg-background border-border focus-visible:ring-primary/25"
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

        {/* Voice selector */}
        <button
          type="button"
          onClick={() => setVoiceLibraryOpen(true)}
          className={cn(
            "group w-full flex items-center gap-2.5 rounded-lg border px-2.5 py-2 transition-colors text-left",
            currentVoice
              ? "border-border bg-background hover:border-primary/50 hover:bg-primary/[0.03]"
              : "border-primary/30 bg-primary/[0.04] hover:border-primary/50 hover:bg-primary/[0.07]"
          )}
          aria-label="Choose an AI voice"
        >
          {currentVoice ? (
            <>
              <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-background border border-border">
                <img
                  src={currentVoice.image}
                  alt={`${currentVoice.name} portrait`}
                  width={32}
                  height={32}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <p className="text-sm font-medium text-foreground truncate">{currentVoice.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {currentVoice.language} • {currentVoice.gender} • {currentVoice.category}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Volume2 className="w-4 h-4 text-primary" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  Select a voice to generate narration
                </p>
              </div>
            </>
          )}
          <ChevronDown className={cn(
            "w-3.5 h-3.5 transition-colors",
            currentVoice ? "text-muted-foreground group-hover:text-primary" : "text-primary/60 group-hover:text-primary"
          )} />
        </button>

        {!currentVoice && (
          <p className="text-[11px] text-muted-foreground -mt-2">
            A voice selection is required to generate audio
          </p>
        )}

        {/* Generate button */}
        <Button
          type="button"
          size="sm"
          onClick={handleGenerateClick}
          disabled={!canGenerate}
          className="h-9 gap-1.5 rounded-lg px-3 self-start"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="text-xs">Generating…</span>
            </>
          ) : (
            <>
              <Wand2 className="w-3.5 h-3.5" />
              <span className="text-xs">{hasAudio ? "Regenerate" : "Generate"}</span>
            </>
          )}
        </Button>

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
                    Voiced by {currentVoice?.name ?? "Unknown voice"}
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

export function VoiceLibraryDialog({
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

  // Focused voice in the detail pane. Defaults to current, follows previews & clicks.
  const [focusedId, setFocusedId] = useState<string>(currentVoiceId);
  useEffect(() => {
    if (open) setFocusedId(currentVoiceId);
  }, [open, currentVoiceId]);

  const focused = useMemo(
    () => voices.find((v) => v.id === focusedId) ?? voices[0],
    [voices, focusedId]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[96vw] p-0 overflow-hidden gap-0 max-h-[88vh] grid-rows-[auto_minmax(0,1fr)]">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/60 bg-gradient-to-br from-primary/[0.06] via-background to-background">
          <DialogTitle className="flex items-center gap-2.5 text-lg">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
              <Volume2 className="w-4 h-4 text-primary-foreground" aria-hidden="true" focusable="false" />
            </div>
            Voice Library
          </DialogTitle>
          <DialogDescription className="text-xs">
            Browse {voices.length} lifelike AI voices. Preview on the left, hear the full sample and pick on the right.
          </DialogDescription>
        </DialogHeader>

        {/* Master-detail body */}
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,380px)_minmax(0,1fr)] min-h-0">
          {/* ── Master: filterable list ── */}
          <div className="flex flex-col min-h-0 border-r border-border/60 bg-background">
            {/* Search + filters */}
            <div className="px-4 pt-4 pb-3 space-y-2.5 border-b border-border/60">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" focusable="false" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search voices…"
                  className="pl-8 h-9 rounded-full bg-background border-border shadow-sm text-xs focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/15"
                  aria-label="Search voices"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
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
              <p className="text-[10px] text-muted-foreground tabular-nums">
                {filtered.length} {filtered.length === 1 ? "voice" : "voices"}
              </p>
            </div>

            {/* Voice rows */}
            <div className="flex-1 overflow-y-auto thin-scrollbar">
              {filtered.length === 0 ? (
                <div className="text-center text-xs text-muted-foreground py-12 px-4">
                  No voices match those filters.
                </div>
              ) : (
                <ul className="p-2 space-y-0.5">
                  {filtered.map((v) => {
                    const isCurrent = v.id === currentVoiceId;
                    const isFocused = v.id === focusedId;
                    const isPreviewing = previewingId === v.id;
                    return (
                      <li key={v.id}>
                        <button
                          type="button"
                          onClick={() => setFocusedId(v.id)}
                          className={cn(
                            "group relative w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
                            isCurrent
                              ? "bg-primary/[0.08] ring-1 ring-primary/20"
                              : isFocused
                                ? "bg-muted/70 ring-1 ring-border"
                                : "hover:bg-muted/50"
                          )}
                          aria-current={isFocused ? "true" : undefined}
                        >
                          {/* Active selection accent */}
                          {isCurrent && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-primary" aria-hidden="true" />
                          )}

                          {/* Avatar with inline play */}
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFocusedId(v.id);
                              togglePreview(v.id);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                e.stopPropagation();
                                setFocusedId(v.id);
                                togglePreview(v.id);
                              }
                            }}
                            aria-label={isPreviewing ? `Stop sample of ${v.name}` : `Play sample of ${v.name}`}
                            className={cn(
                              "relative w-10 h-10 rounded-full flex-shrink-0 overflow-hidden shadow-sm bg-gradient-to-br cursor-pointer transition-all",
                              isCurrent ? "ring-2 ring-primary/40" : "ring-2 ring-background",
                              v.gradient
                            )}
                          >
                            <img
                              src={v.image}
                              alt=""
                              width={40}
                              height={40}
                              loading="lazy"
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            <span className={cn(
                              "absolute inset-0 flex items-center justify-center transition-opacity",
                              isPreviewing ? "bg-black/50 opacity-100" : "bg-black/25 opacity-0 group-hover:opacity-100"
                            )}>
                              {isPreviewing ? (
                                <Pause className="w-4 h-4 text-white" aria-hidden="true" focusable="false" />
                              ) : (
                                <Play className="w-4 h-4 text-white ml-px" aria-hidden="true" focusable="false" />
                              )}
                            </span>
                          </span>

                          <span className="flex-1 min-w-0">
                            <span className="flex items-center gap-2">
                              <span className={cn(
                                "text-[13px] font-semibold truncate",
                                isCurrent ? "text-primary" : "text-foreground"
                              )}>{v.name}</span>
                              {isCurrent && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                                  <Check className="w-3 h-3" aria-hidden="true" focusable="false" /> Selected
                                </span>
                              )}
                            </span>
                            <span className="block text-[10px] text-muted-foreground truncate mt-0.5">
                              {v.gender} • {v.age} • {v.category}
                            </span>
                          </span>

                          {isPreviewing && (
                            <span className="flex items-end gap-[2px] h-4 flex-shrink-0" aria-hidden="true">
                              {[0, 1, 2].map((i) => (
                                <span
                                  key={i}
                                  className="w-[2px] bg-primary rounded-full"
                                  style={{
                                    height: "100%",
                                    animation: `voice-bar 900ms ease-in-out ${i * 120}ms infinite`,
                                  }}
                                />
                              ))}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* ── Detail pane ── */}
          <div className="min-h-0 overflow-y-auto thin-scrollbar bg-muted/20">
            {focused && (
              <div className="p-6 md:p-8 space-y-6">
                {/* Identity block */}
                <div className="flex items-start gap-5">
                  <div className={cn(
                    "relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 ring-4 ring-background shadow-md bg-gradient-to-br",
                    focused.gradient
                  )}>
                    <img
                      src={focused.image}
                      alt={`${focused.name} portrait`}
                      width={96}
                      height={96}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-semibold text-foreground truncate">{focused.name}</h3>
                      {focused.id === currentVoiceId && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" aria-hidden="true" focusable="false" /> Currently selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      A {focused.age.toLowerCase()} {focused.gender.toLowerCase()} {focused.category.toLowerCase()} voice.
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <MetaChip label="Language" value={focused.language} />
                      <MetaChip label="Accent" value={focused.accent} />
                      <MetaChip label="Gender" value={focused.gender} />
                      <MetaChip label="Age" value={focused.age} />
                      <MetaChip label="Style" value={focused.category} tone="primary" />
                    </div>
                  </div>
                </div>

                {/* Big waveform + play */}
                <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => togglePreview(focused.id)}
                      className="relative w-12 h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center shadow-sm flex-shrink-0 transition-transform hover:scale-[1.03] active:scale-95"
                      aria-label={previewingId === focused.id ? `Stop sample of ${focused.name}` : `Play sample of ${focused.name}`}
                    >
                      {previewingId === focused.id ? (
                        <Pause className="w-5 h-5" aria-hidden="true" focusable="false" />
                      ) : (
                        <Play className="w-5 h-5 ml-0.5" aria-hidden="true" focusable="false" />
                      )}
                      {previewingId === focused.id && (
                        <svg className="absolute inset-0 -rotate-90 pointer-events-none" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
                          <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
                          <circle
                            cx="24" cy="24" r="22" fill="none"
                            stroke="white" strokeWidth="2" strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 22}
                            strokeDashoffset={2 * Math.PI * 22 * (1 - progress)}
                          />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="h-14 flex items-center rounded-xl bg-muted/40 px-3">
                        <WaveformStrip active={previewingId === focused.id} progress={previewingId === focused.id ? progress : 0} />
                      </div>
                      <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground tabular-nums">
                        <span>{formatSeconds((previewingId === focused.id ? progress : 0) * (PREVIEW_DURATION_MS / 1000))}</span>
                        <span>Sample • {formatSeconds(PREVIEW_DURATION_MS / 1000)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary CTA */}
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      onSelect(focused.id);
                      stopPreview();
                    }}
                    disabled={focused.id === currentVoiceId}
                    className="gap-1.5 min-w-[160px]"
                  >
                    {focused.id === currentVoiceId ? (
                      <>
                        <Check className="w-4 h-4" aria-hidden="true" focusable="false" /> Currently selected
                      </>
                    ) : (
                      <>Use this voice</>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <style>{`
          @keyframes voice-bar {
            0%, 100% { transform: scaleY(0.35); }
            50% { transform: scaleY(1); }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}

function MetaChip({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "primary" }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border",
      tone === "primary"
        ? "bg-primary/10 border-primary/20 text-primary"
        : "bg-background border-border text-muted-foreground"
    )}>
      <span className="uppercase tracking-wide font-semibold text-[9px] opacity-70">{label}</span>
      <span className="font-medium text-foreground/80">{value}</span>
    </span>
  );
}

function formatSeconds(s: number) {
  const total = Math.max(0, Math.round(s));
  const m = Math.floor(total / 60);
  const sec = total % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function WaveformStrip({ active, progress }: { active: boolean; progress: number }) {
  // Voice-message style waveform: thin, symmetric bars centered on the midline.
  const bars = 64;
  const heights = Array.from({ length: bars }, (_, i) => {
    const t = i / bars;
    // Envelope tapers at both ends, fuller in the middle — like a real voice note.
    const envelope = Math.sin(t * Math.PI);
    const detail =
      Math.sin(t * Math.PI * 9) * 0.35 +
      Math.sin(t * Math.PI * 17 + 1.7) * 0.25 +
      Math.sin(t * Math.PI * 4 + 0.4) * 0.4;
    const h = (0.25 + Math.abs(detail) * 0.75) * (0.5 + envelope * 0.5);
    return Math.max(0.14, Math.min(1, h));
  });

  return (
    <div className="relative flex items-center justify-between w-full h-full gap-[2px]" aria-hidden="true">
      {heights.map((h, i) => {
        const played = i / bars <= progress;
        return (
          <span
            key={i}
            className={cn(
              "flex-1 rounded-full transition-all duration-300 ease-out",
              active && played
                ? "bg-primary"
                : active
                  ? "bg-foreground/25"
                  : "bg-foreground/30"
            )}
            style={{
              height: `${h * 100}%`,
              animation: active && !played ? `waveform-idle 1.4s ease-in-out ${i * 30}ms infinite` : undefined,
              transformOrigin: "center",
            }}
          />
        );
      })}
      <style>{`
        @keyframes waveform-idle {
          0%, 100% { transform: scaleY(0.9); opacity: 0.75; }
          50% { transform: scaleY(1.05); opacity: 1; }
        }
      `}</style>
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
      <SelectTrigger className="h-9 text-xs w-auto min-w-[140px] gap-1.5 rounded-full bg-background border border-border shadow-sm hover:border-primary/40 focus:border-primary/50 focus:ring-2 focus:ring-primary/15" aria-label={label}>
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

