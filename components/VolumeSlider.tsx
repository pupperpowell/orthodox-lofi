import { JSX } from "preact";
import { IS_BROWSER } from "$fresh/runtime.ts";

export function VolumeSlider(props: JSX.HTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      type="range"
      disabled={!IS_BROWSER || props.disabled}
      class={`
        w-full border-2 border-white select-none touch-manipulation
        appearance-none bg-transparent
        [&::-webkit-slider-runnable-track]:bg-transparent
        [&::-webkit-slider-runnable-track]:border-2
        [&::-webkit-slider-runnable-track]:border-white
        [&::-webkit-slider-runnable-track]:h-[16px]
        [&::-webkit-slider-thumb]:appearance-none
        [&::-webkit-slider-thumb]:w-[20px]
        [&::-webkit-slider-thumb]:h-[20px]
        [&::-webkit-slider-thumb]:rounded-none
        [&::-webkit-slider-thumb]:bg-white
        [&::-webkit-slider-thumb]:border-2
        [&::-webkit-slider-thumb]:border-white
        [&::-webkit-slider-thumb]:mt-[-2px]
        [&::-moz-range-track]:bg-transparent
        [&::-moz-range-track]:border-2
        [&::-moz-range-track]:border-white
        [&::-moz-range-track]:h-[16px]
        [&::-moz-range-thumb]:appearance-none
        [&::-moz-range-thumb]:w-[20px]
        [&::-moz-range-thumb]:h-[20px]
        [&::-moz-range-thumb]:bg-black
        [&::-moz-range-thumb]:border-2
        [&::-moz-range-thumb]:border-white
        [&::-moz-range-thumb]:rounded-none
        [&::-moz-range-progress]:bg-white
        [&::-moz-range-progress]:h-[22px]
      `}
    />
  );
}
