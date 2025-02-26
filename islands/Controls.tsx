import { useState } from "preact/hooks";
import { AudioProcessor } from "../utils/AudioProcessor.ts";
import { Button } from "../components/Button.tsx";

interface ControlsProps {
  processor: AudioProcessor;
}

export default function Controls({ processor }: ControlsProps) {
  const [filtersEnabled, setFiltersEnabled] = useState(true);
  const [saturationEnabled, setSaturationEnabled] = useState(true);

  const [highpass, setHighpass] = useState(200);
  const [lowpass, setLowpass] = useState(2250);
  const [saturation, setSaturation] = useState(1);

  const handleHighpassChange = (e: Event) => {
    const value = Number((e.target as HTMLInputElement).value);
    setHighpass(value);
    processor.setHighpassFrequency(value);
  };

  const handleLowpassChange = (e: Event) => {
    const value = Number((e.target as HTMLInputElement).value);
    setLowpass(value);
    processor.setLowpassFrequency(value);
  };

  const handleToggleFilters = () => {
    setFiltersEnabled(!filtersEnabled);
    processor.toggleFilters();
  };

  const handleSaturationChange = (e: Event) => {
    const value = Number((e.target as HTMLInputElement).value);
    setSaturation(value);
    processor.setSaturation(value);
  };

  const handleToggleSaturation = () => {
    setSaturationEnabled(!saturationEnabled);
    processor.toggleSaturation();
  };

  return (
    <div class="space-y-4">
      <hr></hr>
      <Button
        type="button"
        onClick={handleToggleFilters}
        class="bg-white"
      >
        {filtersEnabled ? "DISABLE FILTERS" : "ENABLE FILTERS"}
      </Button>

      <div
        class={filtersEnabled
          ? "opacity-100"
          : "opacity-50 pointer-events-none"}
      >
        {/* Existing filter controls */}
        <div>
          <label class="block text-sm font-medium font-inter">
            <span>Highpass Filter: {highpass}Hz</span>
            <input
              type="range"
              min="20"
              max="2000"
              value={highpass}
              onInput={handleHighpassChange}
              class="w-full mt-2"
            />
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium font-inter">
            <span>Lowpass Filter: {lowpass}Hz</span>
            <input
              type="range"
              min="2000"
              max="20000"
              value={lowpass}
              onInput={handleLowpassChange}
              class="w-full mt-2"
            />
          </label>
        </div>
      </div>
      <hr></hr>
      <div class="opacity-50 pointer-events-none select-none">
        <Button
          type="button"
          onClick={handleToggleSaturation}
          class="bg-white"
        >
          {saturationEnabled ? "DISABLE SATURATION" : "ENABLE SATURATION"}
        </Button>
        <label class="block text-sm font-medium font-inter">
          <span>Saturation: {saturation}x</span>
          <input
            type="range"
            min="1"
            max="10"
            step="0.1"
            value={saturation}
            onInput={handleSaturationChange}
            class="w-full mt-2"
          />
        </label>
      </div>
    </div>
  );
}
