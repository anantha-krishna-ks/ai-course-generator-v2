/**
 * Tiny sessionStorage-backed bridge so the audio transcript configured in the
 * editor can be surfaced in the course preview without threading through the
 * course data model. Keyed by content block id.
 */

export interface AudioTranscribeState {
  enabled: boolean;
  status: "idle" | "loading" | "ready" | "unsupported";
  transcript: string;
  detected: string;
}

const KEY = "audio-transcribe:v1";

type Store = Record<string, AudioTranscribeState>;

function readAll(): Store {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || "{}") as Store;
  } catch {
    return {};
  }
}

function writeAll(store: Store) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(store));
    window.dispatchEvent(new CustomEvent("audio-transcribe:change"));
  } catch {}
}

export function getAudioTranscribe(id?: string | null): AudioTranscribeState | undefined {
  if (!id) return undefined;
  return readAll()[id];
}

export function setAudioTranscribe(id: string, state: AudioTranscribeState) {
  const all = readAll();
  all[id] = state;
  writeAll(all);
}

export function clearAudioTranscribe(id: string) {
  const all = readAll();
  delete all[id];
  writeAll(all);
}

export function subscribeAudioTranscribe(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener("audio-transcribe:change", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("audio-transcribe:change", handler);
    window.removeEventListener("storage", handler);
  };
}
