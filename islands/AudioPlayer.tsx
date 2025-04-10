// islands/NewAudioPlayer.tsx
import { useEffect, useRef, useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";
import { Radio } from "../routes/api/radio.ts";
import { AudioProcessor, audioProcessor } from "../utils/AudioProcessor.ts";

export default function AudioPlayer() {
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
          currentTrackPathRef.current = data.currentTrack.path;

          // Append a cache buster to ensure a fresh request
          setAudioSrc(
            `/api/music?path=${data.currentTrack.path}&t=${Date.now()}`,
          );

          if (audioRef.current) {
            // Load the new track
            audioRef.current.load();
            console.log("Fetched new track:", data.currentTrack.path);

            // If playback is enabled, wait until the track is ready before auto-playing
            if (isPlayingRef.current) {
              audioRef.current.addEventListener("canplay", () => {
                audioRef.current?.play().catch((e) =>
                  console.error("Play error after canplay:", e)
                );
              }, { once: true });
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
          // console.log("Syncing audio element with server progress");
          console.log(
            "Server progress: " + data.progress + "s, " +
              data.currentTrack.path,
          );
          console.log(
            "Audio element:" + audioRef.current.currentTime + "s, " +
              audioRef.current.src,
          );
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

      audioProcessor.disconnect();
    };
  }, []);

  // Initialize audio processor after audio element is available
  useEffect(() => {
    if (audioRef.current && !audioProcessor.isReady()) {
      audioProcessor.initialize(audioRef.current);
    }
  }, [audioRef.current]);

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

  // Update the togglePlayback function to resume AudioContext
  const togglePlayback = () => {
    // Resume audio context (needed for browsers with autoplay restrictions)
    audioProcessor.resume().then(() => {
      setIsPlaying(!isPlaying);
    });
  };

  return (
    <div>
      <div
        class={`connection-status ${
          isConnected ? "connected" : "disconnected"
        }`}
      >
        {isConnected ? "connected" : "disconnected"}
      </div>

      {
        /* Now playing example: */

        /*
        {radioState.currentTrack.path && (
        <div class="track-info">
          Now playing: {radioState.currentTrack.path.split("/").pop()}
        </div>
      )} */
      }

      <audio
        ref={audioRef}
        src={audioSrc}
        preload="auto"
      />

      <div class="controls">
        <Button onClick={togglePlayback}>
          {isPlaying ? "pause" : "play"}
        </Button>
      </div>
    </div>
  );
}
