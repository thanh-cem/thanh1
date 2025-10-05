import { useEffect, useRef } from 'react';

// Background audio that plays nyc -> eiji -> la then loops.
// No controls, not stoppable via UI. Tries to start immediately; if blocked, starts on first user interaction.
const BackgroundAudio = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initializedRef = useRef(false);
  const playlistRef = useRef<string[]>(["/nyc.mp3", "/eiji.mp3", "/la.mp3"]);
  const indexRef = useRef(0);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const audio = new Audio(playlistRef.current[indexRef.current]);
    audioRef.current = audio;
    audio.preload = 'auto';
    audio.loop = false; // we'll handle manual looping over playlist
    audio.volume = 1.0;

    const playCurrent = async () => {
      try {
        await audio.play();
      } catch {
        // Autoplay blocked: wait for first user gesture
      }
    };

    const onEnded = () => {
      indexRef.current = (indexRef.current + 1) % playlistRef.current.length;
      const nextSrc = playlistRef.current[indexRef.current];
      if (!audioRef.current) return;
      audioRef.current.src = nextSrc;
      // ensure subsequent tracks play automatically
      audioRef.current.play().catch(() => {/* will be resumed on interaction if needed */});
    };

    const resumeOnInteraction = async () => {
      if (!audioRef.current) return;
      try {
        await audioRef.current.play();
        // once playback starts, we can remove these listeners
        window.removeEventListener('pointerdown', resumeOnInteraction);
        window.removeEventListener('keydown', resumeOnInteraction);
      } catch {
        // ignore; keep listeners
      }
    };

    audio.addEventListener('ended', onEnded);
    window.addEventListener('pointerdown', resumeOnInteraction);
    window.addEventListener('keydown', resumeOnInteraction);

    // kick off
    void playCurrent();

    return () => {
      audio.removeEventListener('ended', onEnded);
      window.removeEventListener('pointerdown', resumeOnInteraction);
      window.removeEventListener('keydown', resumeOnInteraction);
      audio.pause();
      // Do not null out refs to preserve across hot-reloads if remounted
    };
  }, []);

  // Render nothing; purely background
  return null;
};

export default BackgroundAudio;
