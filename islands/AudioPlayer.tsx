/**
 * AudioPlayer.tsx: 
 * - Creates HTML audio elements (also using api/music.ts as one source)
 * - Creates new ChantProcessor and AmbientProcessor instances
 * - Initializes() ChantProcessor, passing HTML audio element as an argument
 * - Constructs() AmbientProcessor, doing basically the same?
 */
import { useEffect, useRef, useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";
import { Radio } from "../routes/api/radio.ts";
import { ChantProcessor, ChantProcessorOptions } from "../utils/ChantProcessor.ts";
import { AmbientProcessor } from "../utils/AmbientProcessor.ts";
import { VolumeSlider } from "../components/VolumeSlider.tsx";

export default function AudioPlayer() {
  const [radioState, setRadioState] = useState<Radio>({
    currentTrack: { path: "", duration: 0 },
    progress: 0,
    isPlaying: false,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [chantSrc, setChantSrc] = useState("");
  const [masterVolume, setMasterVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false); // client playback state
  const [isOutside, setIsOutside] = useState(false);
  const [isRaining, setIsRaining] = useState(false);
  const [windowOpen, setWindowOpen] = useState(false);

  // AmbientProcessor
  const [ambientProcessor, setAmbientProcessor] = useState<AmbientProcessor | null>(null);

  // Default audio processing options
  const [processingOptions, setProcessingOptions] = useState<ChantProcessorOptions>({
    highpassFrequency: 360,
    lowpassFrequency: 2500,
    volume: 0.5,
    rainEnabled: false,
    ambientEnabled: false,
    outside: false
  });

  const chantRef = useRef<HTMLAudioElement>(null);
  const rainRef = useRef<HTMLAudioElement>(null);
  const loonsRef = useRef<HTMLAudioElement>(null);
  const cricketsRef = useRef<HTMLAudioElement>(null);
  const dovesRef = useRef<HTMLAudioElement>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const currentTrackPathRef = useRef<string>("");
  const isPlayingRef = useRef<boolean>(false);
  const ChantProcessorRef = useRef<ChantProcessor>(new ChantProcessor());

  // Update the ref whenever isPlaying changes
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // WEBSOCKET LOGIC
  useEffect(() => {
    // Connect to WebSocket
    const protocol = globalThis.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${globalThis.location.host}/api/radio`);
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
          setChantSrc(
            `/api/music?path=${data.currentTrack.path}&t=${Date.now()}`,
          );

          if (chantRef.current) {
            // Load the new track
            chantRef.current.load();
            console.log("Fetched new track:", data.currentTrack.path);

            // If playback is enabled, wait until the track is ready before auto-playing
            if (isPlayingRef.current) {
              chantRef.current.addEventListener("canplay", () => {
                chantRef.current?.play().catch((e) =>
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
          chantRef.current &&
          Math.abs(chantRef.current.currentTime - data.progress) > 1
        ) {
          chantRef.current.currentTime = data.progress;
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
    setChantSrc(`/api/music`);

    return () => {
      if (wsRef.current) wsRef.current.close();
      ChantProcessorRef.current.disconnect();
    };
  }, []);

  // Initialize audio processor after audio element is available
  useEffect(() => {
    if (chantRef.current && !ChantProcessorRef.current.isReady()) {
      ChantProcessorRef.current.initialize(chantRef.current);
      // Apply initial processing options
      ChantProcessorRef.current.updateOptions(processingOptions);
    }
  }, [chantRef.current]);

  // Update processing chain options
  useEffect(() => {
    if (ChantProcessorRef.current.isReady()) {
      ChantProcessorRef.current.updateOptions(processingOptions);
    }
  }, [processingOptions]);

  // Add a separate effect to handle audio element state changes
  useEffect(() => {
    if (!chantRef.current) return;

    if (isPlaying) {
      chantRef.current.play().catch((e) => {
        console.error("Error playing audio:", e);
        setIsPlaying(false); // Reset state if playback fails
      });

    } else {
      chantRef.current.pause();
    }
  }, [isPlaying]);

  const togglePlayback = () => {
    // Create the ambientProcessor if it doesn't already exist
    if (!ambientProcessor && rainRef.current && loonsRef.current && dovesRef.current && cricketsRef.current) {
      const processor = new AmbientProcessor(
        rainRef.current,
        loonsRef.current,
        dovesRef.current,
        cricketsRef.current
      );
      setAmbientProcessor(processor);
      processor.play();
    }

    if (isPlaying) {
      ambientProcessor?.stop();
    } else {
      ambientProcessor?.play();
    }

    // Resume audio context (needed for browsers with autoplay restrictions)
    ChantProcessorRef.current.resume().then(() => {
      setIsPlaying(!isPlaying);
    });

  };

  // Toggle outside/inside
  const toggleOutside = () => {
    const newPosition = !isOutside;
    setIsOutside(newPosition);
    ChantProcessorRef.current.toggleOutside(newPosition, processingOptions);
    ambientProcessor?.toggleOutside(newPosition);
    // TODO: implement and call AmbientProcessor.toggleOutside()
  };

  const toggleWindow = () => {
    const newPosition = !windowOpen;
    setWindowOpen(newPosition);
    ambientProcessor?.toggleWindow(newPosition);
    // TODO: implement and call AmbientProcessor.toggleWindow()
  };

  const toggleRain = () => {
    const raining = !isRaining;
    setIsRaining(raining);
    ambientProcessor?.toggleRain(raining);
    // TODO: implement and call AmbientProcessor.toggleRain()
  };

  // Handle volume change
  const handleVolumeChange = (e: Event) => {
    const value = parseFloat((e.target as HTMLInputElement).value);
    setMasterVolume(value);
    if (isOutside) {
      ambientProcessor?.setVolume(value);
      if (value < 0.15) {
        updateAudioFilters({ volume: value });
      }
    } else {
      updateAudioFilters({ volume: value });
      ambientProcessor?.setVolume(value);
    }
  };

  // Example function to update audio processing options
  const updateAudioFilters = (options: Partial<ChantProcessorOptions>) => {
    setProcessingOptions(prev => ({
      ...prev,
      ...options
    }));
  };

  return (
    <div>

      <audio ref={chantRef} src={chantSrc} preload="auto" />
      <audio ref={rainRef} src='/ambient/rain.mp3' preload="auto" loop />
      <audio ref={dovesRef} src='/ambient/doves.mp3' preload="auto" loop />
      <audio ref={loonsRef} src='/ambient/loons.mp3' preload="auto" loop />
      <audio ref={cricketsRef} src='/ambient/crickets.mp3' preload="auto" loop />

      <div class="controls space-y-2">
        <div class="my-6">
          <VolumeSlider value={masterVolume} onInput={handleVolumeChange} step={0.01} min={0} max={0.5} />
        </div>
        <Button onClick={togglePlayback}>
          {isPlaying ? "mute" : "unmute"}
        </Button>

        <Button onClick={toggleWindow} disabled={!isConnected || !isPlaying || isOutside}>
          {windowOpen ? "close window" : "open window"}
        </Button>

        <Button onClick={toggleOutside} disabled={!isConnected || !isPlaying}>
          {isOutside ? "step inside" : "step outside"}
        </Button>

        <Button onClick={toggleRain} disabled={!isConnected || !isPlaying}>
          {isRaining ? "stop rain" : "start rain"}
        </Button>


        {/* Audio filter controls */}
        {/* <div class="filter-controls">
          <div class="filter-control">
            <label htmlFor="highpass">Highpass: {processingOptions.highpassFrequency}Hz</label>
            <input
              type="range"
              id="highpass"
              min="20"
              max="1000"
              step="5"
              value={processingOptions.highpassFrequency}
              onInput={handleHighpassChange}
            />
          </div>

          <div class="filter-control">
            <label htmlFor="lowpass">Lowpass: {processingOptions.lowpassFrequency}Hz</label>
            <input
              type="range"
              id="lowpass"
              min="1000"
              max="20000"
              step="100"
              value={processingOptions.lowpassFrequency}
              onInput={handleLowpassChange}
            />
          </div>

          <div class="filter-control">
            <label htmlFor="volume">Volume: {processingOptions.volume.toFixed(2)}</label>
            <input
              type="range"
              id="volume"
              min="0"
              max="2"
              step="0.01"
              value={processingOptions.volume}
              onInput={handleVolumeChange}
            />
          </div>
        </div> */}
      </div>
    </div>
  );
}
