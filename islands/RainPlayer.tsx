import { useEffect, useState } from "preact/hooks";
import { RainProcessor } from "../utils/RainProcessor.ts";
import { Button } from "../components/Button.tsx";

export default function RainPlayer() {
  const [rainProcessor, setRainProcessor] = useState<RainProcessor | null>();
  const [rainVolume, setRainVolume] = useState(0.8);
  const [rainPlaying, setRainPlaying] = useState(false);

  const [lowPassFreq, setLowPassFreq] = useState(1500);
  const [lowPassQ, setLowPassQ] = useState(1);
  const [reverbMix, setReverbMix] = useState(0.5);

  const handleRainVolumeChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const newVolume = parseFloat(target.value);
    setRainVolume(newVolume);
    if (rainProcessor) {
      rainProcessor.setVolume(newVolume);
    }
  };

  const handleRainPlay = () => {
    if (!rainProcessor) return;

    if (rainProcessor) {
      if (!rainPlaying) {
        rainProcessor.play();
        setRainPlaying(true);
      } else {
        rainProcessor.stop();
        setRainPlaying(false);
      }
    }
  };

  const handleLowPassFreqChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setLowPassFreq(parseFloat(target.value));
  };

  const handleLowPassQChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setLowPassQ(parseFloat(target.value));
  };

  const handleReverbMixChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setReverbMix(parseFloat(target.value));
  };

  // Create the rain processor
  useEffect(() => {
    const processor = new RainProcessor();
    processor.loadAudioFile("/audio/rain.wav").then(() => {
      setRainProcessor(processor);
    });
  }, []);

  useEffect(() => {
    if (rainProcessor) {
      rainProcessor.setLowPassFilterFrequency(lowPassFreq);
    }
  }, [lowPassFreq, rainProcessor]);

  useEffect(() => {
    if (rainProcessor) {
      rainProcessor.setLowPassQ(lowPassQ);
    }
  }, [lowPassQ, rainProcessor]);

  useEffect(() => {
    if (rainProcessor) {
      rainProcessor.setReverbMix(reverbMix);
    }
  }, [reverbMix, rainProcessor]);

  return (
    <div class="flex items-center space-x-4">
      <div class="flex items-center space-x-2">
        <Button
          type="button"
          onClick={handleRainPlay}
          onTouchStart={(e) => {
            e.preventDefault();
            handleRainPlay();
          }}
          class="btn touch-manipulation active:scale-95"
        >
          Rain button
        </Button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={rainVolume}
          onInput={handleRainVolumeChange}
          class="w-full"
        />
        <span class="text-description font-triodion min-w-[60px]">
          {Math.round(rainVolume * 100)}%
        </span>
      </div>

      <div class="flex flex-col items-center space-x-4">
        <span class="text-description font-triodion min-w-[100px]">
          Filter Freq
        </span>
        <input
          type="range"
          min="20"
          max="20000"
          step="1"
          value={lowPassFreq}
          onInput={handleLowPassFreqChange}
          class="w-full"
        />
        <span class="text-description font-triodion min-w-[60px]">
          {lowPassFreq}Hz
        </span>
      </div>

      <div class="flex items-center space-x-4">
        <span class="text-description font-triodion min-w-[100px]">
          Filter Q
        </span>
        <input
          type="range"
          min="0.0001"
          max="10"
          step="0.1"
          value={lowPassQ}
          onInput={handleLowPassQChange}
          class="w-full"
        />
        <span class="text-description font-triodion min-w-[60px]">
          {lowPassQ.toFixed(1)}
        </span>
      </div>

      <div class="flex items-center space-x-4">
        <span class="text-description font-triodion min-w-[100px]">
          Reverb Mix
        </span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={reverbMix}
          onInput={handleReverbMixChange}
          class="w-full"
        />
        <span class="text-description font-triodion min-w-[60px]">
          {Math.round(reverbMix * 100)}%
        </span>
      </div>
    </div>
  );
}
