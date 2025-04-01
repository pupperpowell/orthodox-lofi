// islands/SimpleAudioPlayer.tsx
import { useEffect, useRef, useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";
import { Radio } from "../routes/api/radio.ts";

export default function NewAudioPlayer() {
  const [radioState, setRadioState] = useState<Radio>({
    currentTrack: { path: "", duration: 0 },
    progress: 0,
    isPlaying: false,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [audioSrc, setAudioSrc] = useState("");

  const audioRef = useRef<HTMLAudioElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket(`ws://${globalThis.location.host}/api/radio`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        // Parse the radio state from the server
        const data = JSON.parse(event.data) as Radio;
        setRadioState(data);

        // If the track has changed, update the audio source
        if (data.currentTrack.path !== radioState.currentTrack.path) {
          // Add a timestamp to prevent caching
          setAudioSrc(`/api/music`);

          // If we have an audio element, load and play the new track
          if (audioRef.current) {
            audioRef.current.load();
            if (data.isPlaying) {
              audioRef.current.play().catch((e) =>
                console.error("Play error:", e)
              );
            }
          }
        }

        // Sync the audio element with the server's progress
        if (
          audioRef.current &&
          Math.abs(audioRef.current.currentTime - data.progress) > 1
        ) {
          audioRef.current.currentTime = data.progress;
        }

        // Match play/pause state
        if (audioRef.current) {
          if (data.isPlaying && audioRef.current.paused) {
            audioRef.current.play().catch((e) =>
              console.error("Play error:", e)
            );
          } else if (!data.isPlaying && !audioRef.current.paused) {
            audioRef.current.pause();
          }
        }
      } catch (e) {
        console.error("Error parsing WebSocket message:", e);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    // Initial audio source
    setAudioSrc(`/api/music`);

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div class="audio-player">
      <h2>Orthodox Lofi Radio</h2>

      <div
        class={`connection-status ${
          isConnected ? "connected" : "disconnected"
        }`}
      >
        {isConnected ? "Connected" : "Disconnected"}
      </div>

      {radioState.currentTrack.path && (
        <div class="track-info">
          Now playing: {radioState.currentTrack.path.split("/").pop()}
        </div>
      )}

      <audio
        ref={audioRef}
        src={audioSrc}
        preload="auto"
      />

      <div class="progress-container">
        <div class="time">{formatTime(radioState.progress)}</div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            style={{
              width: `${
                radioState.currentTrack.duration > 0
                  ? (radioState.progress / radioState.currentTrack.duration) *
                    100
                  : 0
              }%`,
            }}
          >
          </div>
        </div>
        <div class="time">{formatTime(radioState.currentTrack.duration)}</div>
      </div>

      <div class="controls">
        {/* Play button that toggles play/pause for the client audio element */}
      </div>
    </div>
  );
}
