import { JSX } from "preact";
import { IS_BROWSER } from "$fresh/runtime.ts";

export function Button(props: JSX.HTMLAttributes<HTMLButtonElement>) {
  const { ...rest } = props;

  return (
    <button
      {...rest}
      role="button"
      disabled={!IS_BROWSER || props.disabled}
      style={{
        touchAction: "manipulation",
      }}
      class={`btn px-2 uppercase font-inter border-2 border-white`}
    >
      {props.children}
    </button>
  );
}
