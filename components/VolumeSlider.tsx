import { JSX } from "preact";
import { IS_BROWSER } from "$fresh/runtime.ts";

export function VolumeSlider(props: JSX.HTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      disabled={!IS_BROWSER || props.disabled}
      type="range"
      class={`custom-range`}
    />
  );
}
