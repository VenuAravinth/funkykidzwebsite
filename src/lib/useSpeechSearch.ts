"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

// Speech-to-text with the browser's built-in Web Speech API (Chrome/Edge desktop & Android,
// Safari 14.5+ on Mac/iPhone). Not available in Firefox — callers hide the mic there.

type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type RecognitionCtor = new () => Recognition;

const getCtor = (): RecognitionCtor | undefined => {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
};

const noop = () => () => {};

const ERRORS: Record<string, string> = {
  "not-allowed": "Microphone is blocked — allow it in your browser settings.",
  "service-not-allowed": "Voice search isn't allowed in this browser.",
  "no-speech": "Didn't catch that — tap the mic and try again.",
  "audio-capture": "No microphone found.",
  network: "Voice search needs an internet connection.",
};

export function useSpeechSearch(onText: (text: string, final: boolean) => void) {
  const supported = useSyncExternalStore(noop, () => Boolean(getCtor()), () => false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rec = useRef<Recognition | null>(null);
  const cb = useRef(onText);
  useEffect(() => {
    cb.current = onText;
  }, [onText]);

  const stop = useCallback(() => rec.current?.stop(), []);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) return;
    rec.current?.abort();
    const r = new Ctor();
    r.lang = "en-IN"; // Indian English: understands local names and accents better
    r.interimResults = true; // show words as they're spoken
    r.continuous = false; // stop after a pause
    r.maxAlternatives = 1;
    r.onresult = (e) => {
      let text = "";
      let final = false;
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
        if (e.results[i].isFinal) final = true;
      }
      cb.current(text.trim(), final);
    };
    r.onerror = (e) => {
      if (e.error !== "aborted") setError(ERRORS[e.error] ?? "Voice search didn't work — please type instead.");
    };
    r.onend = () => setListening(false);
    rec.current = r;
    setError(null);
    setListening(true);
    try {
      r.start();
    } catch {
      setListening(false);
    }
  }, []);

  useEffect(() => () => rec.current?.abort(), []);

  return { supported, listening, error, start, stop, clearError: () => setError(null) };
}
