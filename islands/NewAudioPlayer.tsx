// islands/AudioPlayer.tsx
import { useEffect, useRef, useState } from "preact/hooks";

interface Track {
  id: string;
  title: string;
  path: string;
  duration: number;
}

interface RadioState {
  currentTrack: string;
  startedAt: number;
  duration: number;
  playlist: Track[];
  isPlaying: boolean;
}

export default function NewAudioPlayer() {
  const [radioState, setRadioState] = useState<RadioState | null>(null);
  const [isSynced, setIsSynced] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const syncTimerRef = useRef<number | null>(null);

  // Initialize audio element and state sync
  useEffect(() => {
    // Create audio element
    const audio = new Audio();
    audioRef.current = audio;

    // Sync with server initially
    syncWithServer();

    // Set up periodic sync
    syncTimerRef.current = setInterval(syncWithServer, 10000);

    return () => {
      if (syncTimerRef.current) clearInterval(syncTimerRef.current);
      if (audio) {
        audio.pause();
        audio.src = "";
      }
    };
  }, []);

  // Handle changes to radio state
  useEffect(() => {
    if (!radioState || !audioRef.current) return;

    const audio = audioRef.current;
    const currentTrack = radioState.playlist.find((t) =>
      t.id === radioState.currentTrack
    );

    if (!currentTrack) return;

    // Only reload if track changed
    if (audio.src !== `/api/audio/${currentTrack.path}`) {
      audio.src = `/api/audio/${currentTrack.path}`;
      console.log("Now playing: ", currentTrack.title);
    }

    // Calculate what position we should be at
    const elapsedSeconds = (Date.now() - radioState.startedAt) / 1000;

    // Only seek if we're more than 1 second out of sync
    if (Math.abs(audio.currentTime - elapsedSeconds) > 1) {
      audio.currentTime = elapsedSeconds;
    }

    // Play or pause
    if (radioState.isPlaying && audio.paused) {
      audio.play().then(() => setIsSynced(true));
    } else if (!radioState.isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [radioState]);

  const syncWithServer = async () => {
    try {
      const response = await fetch("/api/radio-state");
      const state = await response.json();
      console.log("Synced with the server");
      setRadioState(state);
    } catch (error) {
      console.error("Failed to sync with server:", error);
    }
  };

  const getCurrentTrackInfo = () => {
    if (!radioState) return null;
    return radioState.playlist.find((t) => t.id === radioState.currentTrack);
  };

  // For admin controls
  const togglePlayPause = async () => {
    try {
      const response = await fetch("/api/radio-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle" }),
      });
      const state = await response.json();
      setRadioState(state);
    } catch (error) {
      console.error("Failed to toggle play state:", error);
    }
  };

  const currentTrack = getCurrentTrackInfo();

  return (
    <div class="audio-player">
      <h2>Web Radio</h2>
      {radioState && currentTrack
        ? (
          <div>
            <p>Now playing: {currentTrack.title}</p>
            <p>Status: {isSynced ? "Synchronized" : "Synchronizing..."}</p>
            <p>Listeners hear the same content simultaneously</p>

            {/* Admin controls - you might want to hide these based on user role */}
            <button type="button" onClick={togglePlayPause}>
              Admin: {radioState.isPlaying ? "Pause Station" : "Start Station"}
            </button>
          </div>
        )
        : <p>Loading radio...</p>}
    </div>
  );
}
