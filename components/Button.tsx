import { JSX } from "preact";
import { IS_BROWSER } from "$fresh/runtime.ts";

export function Button(props: JSX.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      style={{
        touchAction: "manipulation",
      }}
      {...props}
      disabled={!IS_BROWSER || props.disabled}
      class={`btn px-2 uppercase font-inter border-2 border-white`}
    >
      {props.children}
    </button>
  );
}
