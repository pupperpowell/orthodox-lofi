// islands/AudioPlayer.tsx
import { useEffect, useRef, useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";
import { Radio } from "../routes/api/radio.ts";
import { ProcessingChain, ProcessingChainOptions } from "../utils/ProcessingChain.ts";

export default function AudioPlayer() {
  const [radioState, setRadioState] = useState<Radio>({
    currentTrack: { path: "", duration: 0 },
    progress: 0,
    isPlaying: false,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [audioSrc, setAudioSrc] = useState("");
  const [isPlaying, setIsPlaying] = useState(false); // client playback state

  // Default audio processing options
  const [processingOptions, setProcessingOptions] = useState<ProcessingChainOptions>({
    highpassFrequency: 50,
    lowpassFrequency: 15000,
    volume: 1.0,
    rainEnabled: false,
    ambientEnabled: false,
    outside: false
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const currentTrackPathRef = useRef<string>("");
  const isPlayingRef = useRef<boolean>(false);
  const processingChainRef = useRef<ProcessingChain>(new ProcessingChain());

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
      processingChainRef.current.disconnect();
    };
  }, []);

  // Initialize audio processor after audio element is available
  useEffect(() => {
    if (audioRef.current && !processingChainRef.current.isReady()) {
      processingChainRef.current.initialize(audioRef.current);
      // Apply initial processing options
      processingChainRef.current.updateOptions(processingOptions);
    }
  }, [audioRef.current]);

  // Update processing chain when options change
  useEffect(() => {
    if (processingChainRef.current.isReady()) {
      processingChainRef.current.updateOptions(processingOptions);
    }
  }, [processingOptions]);

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

  // Update the togglePlayback function to resume AudioContext
  const togglePlayback = () => {
    // Resume audio context (needed for browsers with autoplay restrictions)
    processingChainRef.current.resume().then(() => {
      setIsPlaying(!isPlaying);
    });
  };

  // Example function to update audio processing options
  const updateAudioFilters = (options: Partial<ProcessingChainOptions>) => {
    setProcessingOptions(prev => ({
      ...prev,
      ...options
    }));
  };

  return (
    <div>
      <div
        class={`connection-status ${isConnected ? "connected" : "disconnected"}`}
      >
        {isConnected ? "connected" : "disconnected"}
      </div>

      <audio
        ref={audioRef}
        src={audioSrc}
        preload="auto"
      />

      <div class="controls">
        <Button onClick={togglePlayback}>
          {isPlaying ? "pause" : "play"}
        </Button>

        {/* You could add UI controls for audio processing options here */}
      </div>
    </div>
  );
}
