import { useEffect, useState } from "preact/hooks";

import { Button } from "../components/Button.tsx";
import { AudioStreamer } from "../utils/AudioStreamer.ts";

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false); // in case playback hasn't started yet
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [streamer, setStreamer] = useState<AudioStreamer | null>(null);
  const [lofiActive, setLofiActive] = useState(true);

  const handlePlay = async () => {
    try {
      setIsLoading(true);

      if (!streamer) {
        // Initialize the streamer if it doesn't exist
        const audioStreamer = new AudioStreamer();
        setStreamer(audioStreamer);
        // Set the streamer lofi status as well
        audioStreamer.setLofi(lofiActive);
        await audioStreamer.startStream();
        setIsPlaying(true);
      } else if (!isPlaying) {
        await streamer.startStream();
        setIsPlaying(true);
        setIsPaused(false);
      } else if (isPaused) {
        await streamer.startStream();
        setIsPaused(false);
      } else {
        streamer.pauseStream();
        setIsPaused(true);
      }
    } catch (error) {
      console.error("Playback failed:", error);
      setIsPlaying(false);
      setIsPaused(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (streamer) {
      streamer.setVolume(volume);
      streamer.setLofi(lofiActive);
    }
  }, [volume, streamer]);

  // Clean up audio resources when component unmounts
  useEffect(() => {
    return () => {
      streamer?.pauseStream();
      setStreamer(null);
    };
  }, []);

  const handleVolumeChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const newVolume = parseFloat(target.value);
    setVolume(newVolume);
  };

  const handleLofiToggle = () => {
    setLofiActive(!lofiActive);
    if (streamer) {
      streamer.setLofi(!lofiActive);
    }
  };

  return (
    <div class="space-y-8">
      <div class="flex items-center space-x-4">
        {/* Play/pause button */}
        <Button
          type="button"
          onClick={handlePlay}
          onTouchStart={(e) => {
            e.preventDefault();
            handlePlay();
          }}
          disabled={isLoading}
          class="btn touch-manipulation active:scale-95"
        >
          {isLoading
            ? (
              <>
                <svg
                  class="inline animate-spin -ml-1 mr-2 h-4 w-4 text-gray-300"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  >
                  </circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  >
                  </path>
                </svg>
                LOADING
              </>
            )
            : (
              isPlaying ? (isPaused ? "RESUME" : "PAUSE") : "PLAY"
            )}
        </Button>

        <div class="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-gray-300"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
              clip-rule="evenodd"
            />
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onInput={handleVolumeChange}
            class="w-24"
          />
          <span class="text-description font-triodion min-w-[60px]">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
      {/* Lofi toggle */}
      <div class="flex items-center space-x-2">
        <Button
          type="button"
          onClick={handleLofiToggle}
          onTouchStart={(e) => {
            e.preventDefault();
            handleLofiToggle();
          }}
          class="btn touch-manipulation active:scale-95"
        >
          LOFI: <span class={lofiActive ? "text-green-500" : ""}>ON</span>/<span
            class={!lofiActive ? "text-gray-300" : ""}
          >
            OFF
          </span>
        </Button>
      </div>
    </div>
  );
}
