// islands/SimpleAudioPlayer.tsx
import { useEffect, useRef, useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";

export default function NewAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [trackInfo, setTrackInfo] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket(`ws://${globalThis.location.host}/api/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "progress") {
          setCurrentTime(data.currentTime);
          setIsPlaying(data.isPlaying);

          // Update duration if provided by server
          if (data.duration && data.duration > 0) {
            setDuration(data.duration);
          }

          // Sync audio element with server state
          if (audioRef.current) {
            // Update position if it's significantly different
            if (Math.abs(audioRef.current.currentTime - data.currentTime) > 1) {
              audioRef.current.currentTime = data.currentTime;
            }

            // Match play/pause state
            if (data.isPlaying && audioRef.current.paused) {
              audioRef.current.play().catch((e) =>
                console.error("Play error:", e)
              );
            } else if (!data.isPlaying && !audioRef.current.paused) {
              audioRef.current.pause();
            }
          }
        }

        if (data.type === "trackChange") {
          // Update duration from server if available
          if (data.duration && data.duration > 0) {
            setDuration(data.duration);
          }

          // Update track info if available
          if (data.file) {
            setTrackInfo(data.file);
          }

          // Reload the audio to get a new track
          if (audioRef.current) {
            const _oldSrc = audioRef.current.src;
            audioRef.current.src = `/api/music?t=${Date.now()}`; // Cache busting
            audioRef.current.load();
            audioRef.current.play().catch((e) =>
              console.error("Play error:", e)
            );
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

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const handleMetadata = () => {
    if (audioRef.current) {
      // Only use the browser's duration as a fallback if server didn't provide one
      if (duration === 0) {
        const audioDuration = audioRef.current.duration;
        setDuration(audioDuration);

        // Report the duration to the server
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: "trackLoaded",
            duration: audioDuration,
          }));
        }
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const sendCommand = (action: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "command",
        action,
      }));
    }
  };

  return (
    <div class="audio-player">
      <h2>Synchronized MP3 Player</h2>

      <div
        class={`connection-status ${
          isConnected ? "connected" : "disconnected"
        }`}
      >
        {isConnected ? "Connected" : "Disconnected"}
      </div>

      {trackInfo && (
        <div class="track-info">
          Now playing: {trackInfo}
        </div>
      )}

      <audio
        ref={audioRef}
        src="/api/music"
        preload="auto"
        onLoadedMetadata={handleMetadata}
      />

      <div class="progress-container">
        <div class="time">{formatTime(currentTime)}</div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            style={{
              width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
            }}
          >
          </div>
        </div>
        <div class="time">{formatTime(duration)}</div>
      </div>

      <div class="controls">
        <Button onClick={() => sendCommand("prev")}>Previous</Button>
        <Button onClick={() => sendCommand(isPlaying ? "pause" : "play")}>
          {isPlaying ? "Pause" : "Play"}
        </Button>
        <Button onClick={() => sendCommand("next")}>Next</Button>
      </div>
    </div>
  );
}
