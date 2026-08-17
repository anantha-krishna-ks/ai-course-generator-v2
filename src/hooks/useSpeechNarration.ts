import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Real-time narration with the browser Web Speech API.
 *
 * Speaks an array of lines one after another, reports the active line and the
 * active word (via `boundary` events) and produces a synthetic mouth-amplitude
 * signal (0..1) that UI can use to lip-sync an avatar.
 *
 * Falls back to a timed simulation when speech synthesis is unavailable or the
 * engine never fires boundary events (Safari / some Linux voices).
 */

export interface SpeechNarrationState {
  /** Index of the line currently being spoken. */
  lineIndex: number;
  /** Index of the word currently being spoken inside the active line. */
  wordIndex: number;
  /** 0..1 openness signal for lip-sync. */
  mouth: number;
  /** 0..1 overall progress across all lines. */
  progress: number;
  /** True while audio (or the fallback timer) is running. */
  speaking: boolean;
  /** True when real speech synthesis is driving the narration. */
  hasVoice: boolean;
}

interface Options {
  lines: string[];
  active: boolean;
  /** "female" | "male" — used to pick the closest installed system voice. */
  gender?: "female" | "male";
  /** BCP-47 tag, e.g. "en-US". */
  lang?: string;
  rate?: number;
  pitch?: number;
  onEnded?: () => void;
}

const FEMALE_HINTS = ["female", "samantha", "victoria", "zira", "aria", "jenny", "karen", "moira", "serena", "tessa", "google uk english female", "google us english"];
const MALE_HINTS = ["male", "daniel", "alex", "fred", "david", "george", "guy", "oliver", "rishi", "google uk english male"];

function pickVoice(voices: SpeechSynthesisVoice[], lang: string, gender: "female" | "male") {
  if (!voices.length) return undefined;
  const hints = gender === "female" ? FEMALE_HINTS : MALE_HINTS;
  const base = lang.split("-")[0].toLowerCase();
  const sameLang = voices.filter((v) => v.lang?.toLowerCase().startsWith(base));
  const pool = sameLang.length ? sameLang : voices;
  const exact = pool.filter((v) => v.lang?.toLowerCase() === lang.toLowerCase());
  const ordered = [...exact, ...pool];
  return (
    ordered.find((v) => hints.some((h) => v.name.toLowerCase().includes(h))) ??
    ordered.find((v) => v.localService) ??
    ordered[0]
  );
}

/** Average speaking pace used by the fallback timer (ms per word). */
const MS_PER_WORD = 340;

export function useSpeechNarration({
  lines,
  active,
  gender = "female",
  lang = "en-US",
  rate = 1,
  pitch = 1,
  onEnded,
}: Options): SpeechNarrationState {
  const [lineIndex, setLineIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [mouth, setMouth] = useState(0);
  const [progress, setProgress] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [hasVoice, setHasVoice] = useState(false);

  const endedRef = useRef(onEnded);
  endedRef.current = onEnded;

  const linesKey = lines.join("|");
  const totalWords = lines.reduce((n, l) => n + l.trim().split(/\s+/).length, 0);

  // Keep the voice list warm — Chrome loads it asynchronously.
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const warm = () => window.speechSynthesis.getVoices();
    warm();
    window.speechSynthesis.addEventListener("voiceschanged", warm);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", warm);
  }, []);

  const reset = useCallback(() => {
    setLineIndex(0);
    setWordIndex(0);
    setMouth(0);
    setProgress(0);
    setSpeaking(false);
  }, []);

  useEffect(() => {
    if (!active) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
      reset();
      return;
    }

    let cancelled = false;
    let raf = 0;
    let fallbackTimer: number | undefined;
    const wordsPerLine = lines.map((l) => l.trim().split(/\s+/).length);
    const wordsBefore = wordsPerLine.map((_, i) => wordsPerLine.slice(0, i).reduce((a, b) => a + b, 0));

    setSpeaking(true);

    /* ---------- mouth signal: smooth pseudo-random jaw movement ---------- */
    let energy = 0;
    let lastKick = 0;
    const animate = (t: number) => {
      if (cancelled) return;
      // Kick energy on a syllable-ish cadence, then decay for a natural jaw.
      if (t - lastKick > 90 + Math.random() * 90) {
        energy = 0.45 + Math.random() * 0.55;
        lastKick = t;
      }
      energy *= 0.86;
      setMouth((prev) => prev * 0.45 + energy * 0.55);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    const finish = () => {
      if (cancelled) return;
      cancelled = true;
      cancelAnimationFrame(raf);
      setMouth(0);
      setSpeaking(false);
      setProgress(100);
      endedRef.current?.();
    };

    const supported = typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

    /* ---------- fallback: timed word stepping ---------- */
    const runFallback = (fromLine = 0, fromWord = 0) => {
      setHasVoice(false);
      let li = fromLine;
      let wi = fromWord;
      const step = () => {
        if (cancelled) return;
        setLineIndex(li);
        setWordIndex(wi);
        setProgress(((wordsBefore[li] + wi) / Math.max(1, totalWords)) * 100);
        wi += 1;
        if (wi >= wordsPerLine[li]) {
          wi = 0;
          li += 1;
        }
        if (li >= lines.length) {
          finish();
          return;
        }
        fallbackTimer = window.setTimeout(step, MS_PER_WORD / rate);
      };
      step();
    };

    if (!supported) {
      runFallback();
      return () => {
        cancelled = true;
        cancelAnimationFrame(raf);
        if (fallbackTimer) window.clearTimeout(fallbackTimer);
      };
    }

    /* ---------- real speech ---------- */
    const synth = window.speechSynthesis;
    synth.cancel();

    const voice = pickVoice(synth.getVoices(), lang, gender);
    setHasVoice(true);

    let sawBoundary = false;
    let watchdog: number | undefined;

    const speakLine = (i: number) => {
      if (cancelled) return;
      if (i >= lines.length) {
        finish();
        return;
      }
      setLineIndex(i);
      setWordIndex(0);

      const text = lines[i];
      const u = new SpeechSynthesisUtterance(text);
      if (voice) u.voice = voice;
      u.lang = voice?.lang ?? lang;
      u.rate = rate;
      u.pitch = pitch;

      u.onboundary = (e) => {
        if (cancelled) return;
        sawBoundary = true;
        const spoken = text.slice(0, e.charIndex).trim();
        const wi = spoken ? spoken.split(/\s+/).length : 0;
        setWordIndex(Math.min(wi, wordsPerLine[i] - 1));
        setProgress(((wordsBefore[i] + wi) / Math.max(1, totalWords)) * 100);
      };
      u.onend = () => {
        if (cancelled) return;
        speakLine(i + 1);
      };
      u.onerror = () => {
        if (cancelled) return;
        // Engine refused (autoplay policy, missing voice) — degrade gracefully.
        runFallback(i, 0);
      };

      synth.speak(u);
    };

    speakLine(0);

    // If nothing is speaking shortly after start, the engine is blocked.
    watchdog = window.setTimeout(() => {
      if (cancelled) return;
      if (!synth.speaking && !sawBoundary) {
        synth.cancel();
        runFallback();
      }
    }, 900);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      if (watchdog) window.clearTimeout(watchdog);
      synth.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, linesKey, gender, lang, rate, pitch]);

  // Stop any narration when the component using the hook unmounts.
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  return { lineIndex, wordIndex, mouth, progress, speaking, hasVoice };
}
