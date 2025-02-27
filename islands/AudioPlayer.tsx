import { useEffect, useState } from "preact/hooks";

import Controls from "./Controls.tsx";
import { AudioProcessor } from "../utils/AudioProcessor.ts";
import { Button } from "../components/Button.tsx";

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [processor, setProcessor] = useState<AudioProcessor | null>(null);

  useEffect(() => {
    if (processor) {
      processor.setVolume(volume);
    }
  }, [volume, processor]);

  const handlePlay = async () => {
    if (!processor) {
      try {
        setIsLoading(true);
        const newProcessor = new AudioProcessor();
        setProcessor(newProcessor);
        newProcessor.setVolume(volume);
        await newProcessor.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Failed to load audio:", error);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (isPaused) {
      processor.play();
      setIsPaused(false);
    } else {
      processor.pause();
      setIsPaused(true);
    }
  };

  const handleVolumeChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const newVolume = parseFloat(target.value);
    setVolume(newVolume);
  };

  return (
    <div class="space-y-8">
      <div class="flex items-center space-x-4">
        <button
          type="button"
          onClick={() => handlePlay()}
          onTouchEnd={() => handlePlay()}
          disabled={isLoading}
          class="btn"
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
        </button>

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
          <span class="text-description font-triodion min-w-[40px] text-sm">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* FilterControls always shows if processor exists */}
      {processor && <Controls processor={processor} />}
    </div>
  );
}
