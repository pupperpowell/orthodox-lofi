import { JSX } from "preact";
import { IS_BROWSER } from "$fresh/runtime.ts";

export function Button(props: JSX.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={!IS_BROWSER || props.disabled}
      class={`btn w-full px-4 py-2 text-2xl font-inter border-2 border-white select-none touch-manipulation`}
    />
  );
}
