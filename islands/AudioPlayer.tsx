import { useEffect, useState } from "preact/hooks";
import { AudioProcessor } from "./AudioProcessor.ts";
import FilterControls from "./Controls.tsx";

interface Track {
  id: number;
  title: string;
  url: string;
}

export default function AudioPlayer({ tracks }: { tracks: Track[] }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [processor, setProcessor] = useState<AudioProcessor | null>(null);

  // Create processor on mount
  useEffect(() => {
    setProcessor(new AudioProcessor());
  }, []);

  const handlePlay = async (track: Track) => {
    if (!isPlaying && processor) {
      await processor.loadTrack(track.url);
      processor.play();
      setIsPlaying(true);
    } else if (isPlaying && processor) {
      processor.stop();
      setIsPlaying(false);
    }
  };

  return (
    <div class="space-y-8">
      <div class="space-y-4">
        {tracks.map((track) => (
          <button
            key={track.id}
            onClick={() => handlePlay(track)}
            class="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {isPlaying ? "Stop" : "Play"} {track.title}
          </button>
        ))}
      </div>

      {/* FilterControls always shows if processor exists */}
      {processor && <FilterControls processor={processor} />}
    </div>
  );
}
