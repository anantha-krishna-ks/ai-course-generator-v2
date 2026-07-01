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

interface VoiceOption {
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

const VOICE_LIBRARY: VoiceOption[] = [
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

        {/* Voice + Generate row */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={() => setVoiceLibraryOpen(true)}
            className="group flex-1 flex items-center gap-3 rounded-xl border border-border bg-background hover:border-primary/50 hover:bg-primary/[0.03] px-3 py-2.5 transition-colors text-left"
            aria-label="Choose an AI voice"
          >
            <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-background border border-border">
              <img
                src={currentVoice.image}
                alt={`${currentVoice.name} portrait`}
                width={40}
                height={40}
                loading="lazy"
                className="w-full h-full object-cover"
              />
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
            className="h-auto min-h-[52px] sm:w-auto w-full px-5 gap-2 rounded-xl"
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
      <DialogContent className="max-w-4xl w-[95vw] p-0 overflow-hidden gap-0 max-h-[88vh] grid-rows-[auto_auto_minmax(0,1fr)]">
        {/* Header with soft gradient */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60 bg-gradient-to-br from-primary/[0.06] via-background to-background">
          <DialogTitle className="flex items-center gap-2.5 text-lg">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
              <Volume2 className="w-4 h-4 text-primary-foreground" aria-hidden="true" focusable="false" />
            </div>
            Voice Library
          </DialogTitle>
          <DialogDescription className="text-xs">
            Browse {voices.length} lifelike AI voices. Tap play to preview a sample, then pick the one that fits your course.
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="px-6 py-4 space-y-3 border-b border-border/60 bg-background">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" focusable="false" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, style, or accent…"
              className="pl-10 h-10 rounded-full bg-background border-border shadow-sm focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/15"
              aria-label="Search voices"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
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
            <span className="ml-auto text-[11px] text-muted-foreground tabular-nums">
              {filtered.length} {filtered.length === 1 ? "voice" : "voices"}
            </span>
          </div>
        </div>

        {/* Voice grid — scrollable */}
        <div className="overflow-y-auto thin-scrollbar bg-muted/20">
          <div className="px-6 py-5">

            {filtered.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-16">
                No voices match those filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filtered.map((v) => {
                  const isCurrent = v.id === currentVoiceId;
                  const isPreviewing = previewingId === v.id;
                  return (
                    <div
                      key={v.id}
                      className={cn(
                        "group relative rounded-2xl border transition-all overflow-hidden bg-card",
                        isCurrent
                          ? "border-primary/60 ring-2 ring-primary/25 shadow-sm"
                          : "border-border/70 hover:border-primary/40 hover:shadow-md"
                      )}
                    >
                      {/* Top row: avatar + info */}
                      <div className="flex items-start gap-3 p-4">
                        {/* Circular portrait avatar with play overlay */}
                        <button
                          onClick={() => togglePreview(v.id)}
                          className={cn(
                            "relative w-14 h-14 rounded-full flex-shrink-0 shadow-sm overflow-hidden group/play ring-2 ring-background",
                            "bg-gradient-to-br",
                            v.gradient
                          )}
                          aria-label={isPreviewing ? `Stop sample of ${v.name}` : `Play sample of ${v.name}`}
                        >
                          <img
                            src={v.image}
                            alt={`${v.name} portrait`}
                            width={56}
                            height={56}
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <span className={cn(
                            "absolute inset-0 flex items-center justify-center bg-black/45 backdrop-blur-[1px] transition-opacity",
                            isPreviewing ? "opacity-100" : "opacity-0 group-hover/play:opacity-100"
                          )}>
                            {isPreviewing ? (
                              <Pause className="w-5 h-5 text-white" aria-hidden="true" focusable="false" />
                            ) : (
                              <Play className="w-5 h-5 text-white ml-0.5" aria-hidden="true" focusable="false" />
                            )}
                          </span>
                          {isPreviewing && (
                            <svg
                              className="absolute inset-0 -rotate-90 pointer-events-none"
                              viewBox="0 0 56 56"
                              aria-hidden="true"
                              focusable="false"
                            >
                              <circle cx="28" cy="28" r="26" fill="none" stroke="white" strokeOpacity="0.3" strokeWidth="2" />
                              <circle
                                cx="28" cy="28" r="26" fill="none"
                                stroke="white" strokeWidth="2" strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 26}
                                strokeDashoffset={2 * Math.PI * 26 * (1 - progress)}
                              />
                            </svg>
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground truncate">{v.name}</p>
                            {isCurrent && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                                <Check className="w-2.5 h-2.5" aria-hidden="true" focusable="false" /> Selected
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                            {v.language} • {v.accent}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                              {v.gender}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                              {v.age}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-medium">
                              {v.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Waveform strip */}
                      <div className="px-4 pb-3">
                        <div className="relative h-12 flex items-center px-1">
                          <WaveformStrip active={isPreviewing} progress={isPreviewing ? progress : 0} />
                        </div>
                      </div>


                      {/* Action bar — always visible */}
                      <div className="flex items-center gap-2 px-4 pb-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => togglePreview(v.id)}
                          className="h-8 px-3 text-xs gap-1.5 flex-1"
                        >
                          {isPreviewing ? (
                            <>
                              <Pause className="w-3.5 h-3.5" aria-hidden="true" focusable="false" /> Stop
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5" aria-hidden="true" focusable="false" /> Preview
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            onSelect(v.id);
                            stopPreview();
                          }}
                          disabled={isCurrent}
                          className="h-8 px-3 text-xs gap-1.5 flex-1"
                        >
                          {isCurrent ? (
                            <>
                              <Check className="w-3.5 h-3.5" aria-hidden="true" focusable="false" /> Selected
                            </>
                          ) : (
                            "Use voice"
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
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

