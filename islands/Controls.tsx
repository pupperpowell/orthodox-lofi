import { useState } from "preact/hooks";
import { AudioProcessor } from "./AudioProcessor.ts";

interface FilterControlsProps {
  processor: AudioProcessor;
}

export default function FilterControls({ processor }: FilterControlsProps) {
  const [filtersEnabled, setFiltersEnabled] = useState(true);
  const [distortionEnabled, setDistortionEnabled] = useState(true);
  const [saturationEnabled, setSaturationEnabled] = useState(true);

  const [highpass, setHighpass] = useState(20);
  const [lowpass, setLowpass] = useState(2250);
  const [saturation, setSaturation] = useState(1);
  const [distortion, setDistortion] = useState(1);

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

  const handleDistortionChange = (e: Event) => {
    const value = Number((e.target as HTMLInputElement).value);
    setDistortion(value);
    processor.setDistortion(value);
  };

  const handleToggleDistortion = () => {
    setDistortionEnabled(!distortionEnabled);
    processor.toggleDistortion();
  };

  const handleToggleSaturation = () => {
    setSaturationEnabled(!saturationEnabled);
    processor.toggleSaturation();
  };

  return (
    <div class="space-y-4">
      <hr></hr>
      <button
        onClick={handleToggleFilters}
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {filtersEnabled ? "Disable Filters" : "Enable Filters"}
      </button>

      <div
        class={filtersEnabled
          ? "opacity-100"
          : "opacity-50 pointer-events-none"}
      >
        {/* Existing filter controls */}
        <div>
          <label class="block text-sm font-medium">
            Highpass Filter: {highpass}Hz
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
          <label class="block text-sm font-medium">
            Lowpass Filter: {lowpass}Hz
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
      <div>
        <button
          onClick={handleToggleSaturation}
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {saturationEnabled ? "Disable Saturation" : "Enable Saturation"}
        </button>
        <label class="block text-sm font-medium">
          Saturation: {saturation}x
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
      <button
        onClick={handleToggleDistortion}
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {distortionEnabled ? "Disable Distortion" : "Enable Distortion"}
      </button>
      <div>
        <label class="block text-sm font-medium">
          Distortion: {distortion}
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={distortion}
            onInput={handleDistortionChange}
            class="w-full mt-2"
          />
        </label>
      </div>
    </div>
  );
}
