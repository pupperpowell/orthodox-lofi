// islands/NewAudioPlayer.tsx
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
  const [isPlaying, setIsPlaying] = useState(false); // client playback state

  const audioRef = useRef<HTMLAudioElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const currentTrackPathRef = useRef<string>("");
  // Add a ref to track the current isPlaying state
  const isPlayingRef = useRef<boolean>(false);

  // Update the ref whenever isPlaying changes
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

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

        // Check if the track has changed using the ref instead of state
        if (data.currentTrack.path !== currentTrackPathRef.current) {
          console.log("Track changed to:", data.currentTrack.path);
          currentTrackPathRef.current = data.currentTrack.path;

          setAudioSrc(`/api/music`);

          // If we have an audio element, load the new track but don't auto-play
          if (audioRef.current) {
            audioRef.current.load();
            console.log("Loaded new track:", data.currentTrack.path);
            // Use the ref instead of the state to check if we should play
            if (isPlayingRef.current) {
              console.log("Auto-playing new track");
              audioRef.current.play().catch((e) =>
                console.error("Play error:", e)
              );
            }
          }
        }

        // Update the state after checking for track changes
        setRadioState(data);

        // Sync the audio element with the server's progress
        if (
          audioRef.current &&
          Math.abs(audioRef.current.currentTime - data.progress) > 1
        ) {
          audioRef.current.currentTime = data.progress;
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
  }, []); // Empty dependency array is correct here

  // Add a separate effect to handle audio element state changes
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch((e) => {
        console.error("Error playing audio:", e);
        setIsPlaying(false); // Reset state if playback fails
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
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
        <Button onClick={togglePlayback}>
          {isPlaying ? "Pause" : "Play"}
        </Button>
      </div>
    </div>
  );
}
