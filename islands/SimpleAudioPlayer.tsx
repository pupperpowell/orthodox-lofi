import { useEffect, useState } from "preact/hooks";
import { AudioProcessor } from "../utils/AudioProcessor.ts";

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [processor, setProcessor] = useState<AudioProcessor | null>(null);

  useEffect(() => {
    const audioElement = document.createElement("audio");
    audioElement.src = "https://lofi.george.wiki/stream.ogg";
    audioElement.crossOrigin = "anonymous";
    audioElement.volume = volume;
    setAudio(audioElement);
  }, []);

  useEffect(() => {
    if (audio) {
      audio.volume = volume;
    }
    if (processor) {
      processor.setVolume(volume);
    }
  }, [volume, audio, processor]);

  const handlePlay = async () => {
    if (!audio) return;

    // Initialize processor on first play click
    if (!processor) {
      const newProcessor = new AudioProcessor();
      await newProcessor.connectToElement(audio);
      setProcessor(newProcessor);
    }

    if (isPlaying) {
      audio.pause();
      processor?.pause();
    } else {
      await audio.play();
      processor?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setVolume(parseFloat(target.value));
  };

  return (
    <div class="flex items-center space-x-4">
      <button
        type="button"
        onClick={handlePlay}
        class="btn touch-manipulation active:scale-95"
      >
        {isPlaying ? "PAUSE" : "PLAY"}
      </button>

      <div class="flex items-center space-x-2">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onInput={handleVolumeChange}
          class="w-24"
        />
        <span class="text-sm">
          {Math.round(volume * 100)}%
        </span>
      </div>
    </div>
  );
}
