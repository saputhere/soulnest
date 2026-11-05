"use client";

import { Minus, Pause, Play, Plus, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const MUSIC_SRC = "/music/soulnest-theme.mp3";
const STORAGE_KEY = "soulnest-music";
const DEFAULT_VOLUME = 0.35;
const VOLUME_STEP = 0.05;
const FADE_DURATION_MS = 1500;
const FADE_STEP_MS = 50;
const INTERACTION_EVENTS = ["pointerdown", "keydown", "touchstart", "scroll"] as const;

const controlClass =
  "flex h-9 w-9 items-center justify-center rounded-full text-white/85 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-40";

interface StoredPreference {
  readonly isPlaying: boolean;
  readonly volume: number;
  readonly isMuted: boolean;
}

function clampVolume(value: number): number {
  return Math.round(Math.min(1, Math.max(0, value)) * 100) / 100;
}

/** Reads the visitor's saved choices. Returns null if storage is unavailable or empty. */
function readPreference(): StoredPreference | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredPreference>;
    return {
      isPlaying: parsed.isPlaying === true,
      volume: typeof parsed.volume === "number" ? clampVolume(parsed.volume) : DEFAULT_VOLUME,
      isMuted: parsed.isMuted === true,
    };
  } catch {
    return null;
  }
}

/** Saves the visitor's choices. Storage can be blocked, so failures are ignored. */
function savePreference(preference: StoredPreference): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preference));
  } catch {
    // The music still works for this visit.
  }
}

/**
 * Background music with play/pause, mute, and volume controls.
 * Returning visitors who left the music on get an immediate start attempt. Browsers decide
 * whether to allow it, so if they block it, playback starts on the visitor's first interaction.
 * A visitor who paused the music is not auto-started on later visits.
 */
export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPlayingRef = useRef(false);
  const volumeRef = useRef(DEFAULT_VOLUME);
  const isMutedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [hasError, setHasError] = useState(false);

  function stopFade(): void {
    if (fadeTimerRef.current) {
      clearInterval(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
  }

  function fadeTo(targetVolume: number, onComplete?: () => void): void {
    const audio = audioRef.current;
    if (!audio) return;

    stopFade();
    const stepSize = (targetVolume - audio.volume) / (FADE_DURATION_MS / FADE_STEP_MS);

    fadeTimerRef.current = setInterval(() => {
      const next = audio.volume + stepSize;
      const reachedTarget = stepSize >= 0 ? next >= targetVolume : next <= targetVolume;

      audio.volume = reachedTarget ? targetVolume : clampVolume(next);

      if (reachedTarget) {
        stopFade();
        onComplete?.();
      }
    }, FADE_STEP_MS);
  }

  /** Applies a volume change immediately while playing. While paused, the value applies on the next play. */
  function applyLiveVolume(nextVolume: number, nextMuted: boolean): void {
    const audio = audioRef.current;
    stopFade();
    if (!audio || audio.paused) return;
    audio.volume = nextMuted ? 0 : nextVolume;
  }

  /** Starts playback and fades up. Returns false if the browser blocks it. */
  async function startPlayback(): Promise<boolean> {
    const audio = audioRef.current;
    if (!audio || isPlayingRef.current) return isPlayingRef.current;

    try {
      audio.volume = 0;
      await audio.play();
      isPlayingRef.current = true;
      setIsPlaying(true);
      fadeTo(isMutedRef.current ? 0 : volumeRef.current);
      savePreference({ isPlaying: true, volume: volumeRef.current, isMuted: isMutedRef.current });
      return true;
    } catch {
      isPlayingRef.current = false;
      setIsPlaying(false);
      return false;
    }
  }

  // Create the audio, restore saved choices, and try to start.
  useEffect(() => {
    const audio = new Audio(MUSIC_SRC);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;
    audioRef.current = audio;

    const handleError = (): void => setHasError(true);
    audio.addEventListener("error", handleError);

    const saved = readPreference();
    if (saved) {
      volumeRef.current = saved.volume;
      isMutedRef.current = saved.isMuted;
      setVolume(saved.volume);
      setIsMuted(saved.isMuted);
    }

    // Visitors who paused the music keep it paused on later visits.
    const shouldAutostart = saved?.isPlaying ?? true;
    let removeInteractionListeners: (() => void) | null = null;

    if (shouldAutostart) {
      void startPlayback().then((started) => {
        if (started) return;

        // The browser blocked the immediate attempt. Start on the first interaction instead.
        const handleFirstInteraction = (): void => {
          removeInteractionListeners?.();
          void startPlayback();
        };

        for (const eventName of INTERACTION_EVENTS) {
          window.addEventListener(eventName, handleFirstInteraction, { once: true, passive: true });
        }

        removeInteractionListeners = () => {
          for (const eventName of INTERACTION_EVENTS) {
            window.removeEventListener(eventName, handleFirstInteraction);
          }
        };
      });
    }

    return () => {
      audio.removeEventListener("error", handleError);
      removeInteractionListeners?.();
      stopFade();
      audio.pause();
      audioRef.current = null;
    };
    // The helpers read only refs and stable setters, so they're safe to omit here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleTogglePlay(): Promise<void> {
    const audio = audioRef.current;
    if (!audio || hasError) return;

    if (isPlayingRef.current) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      savePreference({ isPlaying: false, volume: volumeRef.current, isMuted: isMutedRef.current });
      fadeTo(0, () => audio.pause());
      return;
    }

    if (isMutedRef.current) {
      isMutedRef.current = false;
      setIsMuted(false);
    }
    await startPlayback();
  }

  function handleToggleMute(): void {
    const nextMuted = !isMutedRef.current;
    isMutedRef.current = nextMuted;
    setIsMuted(nextMuted);
    applyLiveVolume(volumeRef.current, nextMuted);
    savePreference({ isPlaying: isPlayingRef.current, volume: volumeRef.current, isMuted: nextMuted });
  }

  function handleVolumeChange(delta: number): void {
    const nextVolume = clampVolume(volumeRef.current + delta);
    volumeRef.current = nextVolume;
    isMutedRef.current = false;
    setVolume(nextVolume);
    setIsMuted(false);
    applyLiveVolume(nextVolume, false);
    savePreference({ isPlaying: isPlayingRef.current, volume: nextVolume, isMuted: false });
  }

  const displayedPercent = isMuted ? 0 : Math.round(volume * 100);
  const isMinimum = volume <= 0;
  const isMaximum = volume >= 1;

  if (hasError) {
    return (
      <p className="rounded-full border border-white/15 bg-[#241a40]/80 px-4 py-2 text-xs text-white/60">
        Music unavailable
      </p>
    );
  }

  return (
    <div
      role="group"
      aria-label="Background music controls"
      className="flex items-center gap-1 rounded-full border border-white/15 bg-[#241a40]/80 px-2 py-1.5 shadow-lg backdrop-blur-md"
    >
      <button
        type="button"
        onClick={handleTogglePlay}
        aria-label={isPlaying ? "Pause background music" : "Play background music"}
        aria-pressed={isPlaying}
        className={controlClass}
      >
        {isPlaying ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
      </button>

      <button
        type="button"
        onClick={handleToggleMute}
        aria-label={isMuted ? "Unmute music" : "Mute music"}
        aria-pressed={isMuted}
        className={controlClass}
      >
        {isMuted ? <VolumeX className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
      </button>

      <button
        type="button"
        onClick={() => handleVolumeChange(-VOLUME_STEP)}
        disabled={isMinimum}
        aria-label="Lower volume"
        className={controlClass}
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>

      <span className="min-w-10 text-center text-xs font-medium tabular-nums text-white/70" aria-live="polite">
        {displayedPercent}%
      </span>

      <button
        type="button"
        onClick={() => handleVolumeChange(VOLUME_STEP)}
        disabled={isMaximum}
        aria-label="Raise volume"
        className={controlClass}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}