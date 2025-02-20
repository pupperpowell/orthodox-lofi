import { useEffect, useState } from "preact/hooks";
import { AudioProcessor } from "./AudioProcessor.ts";
import Controls from "./Controls.tsx";
import { Track } from "../utils/track.ts";

export default function AudioPlayer({ tracks }: { tracks: Track[] }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [processor, setProcessor] = useState<AudioProcessor | null>(null);

  // Create processor on mount
  useEffect(() => {
    setProcessor(new AudioProcessor());
  }, []);

  const handlePlay = async (track: Track) => {
    if (!processor) return;
    if (!isPlaying) { // if nothing's loaded, start it up
      await processor.loadTrack(track.url);
      processor.play();
      setIsPlaying(true);
    } else if (isPaused) { // if paused, resume,
      processor.resume();
      setIsPaused(false);
    } else if (!isPaused) { // if playing, pause
      processor.pause();
      setIsPaused(true);
    }
  };

  return (
    <div class="space-y-8">
      <div class="space-y-4">
        {tracks.map((track) => (
          <button
            type="button"
            key={track.id}
            onClick={() => handlePlay(track)}
            class="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {isPlaying ? "Stop" : "Play"} {track.title}
          </button>
        ))}
      </div>

      {/* FilterControls always shows if processor exists */}
      {processor && <Controls processor={processor} />}
    </div>
  );
}
