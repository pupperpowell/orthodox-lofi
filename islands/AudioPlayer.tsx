import { useEffect, useState } from "preact/hooks";

import Controls from "./Controls.tsx";
// import { Track } from "../utils/track.ts";
import { AudioProcessor } from "../utils/AudioProcessor.ts";

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [processor, setProcessor] = useState<AudioProcessor | null>(null);

  const handlePlay = async () => {
    if (!processor) {
      const newProcessor = new AudioProcessor();
      setProcessor(newProcessor);
      await newProcessor.play();
      setIsPlaying(true);
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

  return (
    <div class="space-y-8">
      <div class="space-y-4">
        <button
          type="button"
          onClick={() => handlePlay()}
          class="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {isPlaying ? (isPaused ? "Resume" : "Pause") : "Play"}
        </button>
      </div>

      {/* FilterControls always shows if processor exists */}
      {processor && <Controls processor={processor} />}
    </div>
  );
}
