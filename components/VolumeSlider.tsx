import { JSX } from "preact";
import { IS_BROWSER } from "$fresh/runtime.ts";

export function VolumeSlider(props: JSX.HTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      disabled={!IS_BROWSER || props.disabled}
      class={`border-2 border-white select-none touch-manipulation`}
    />
  );
}
