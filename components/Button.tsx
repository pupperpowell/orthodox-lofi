import { JSX } from "preact";
import { IS_BROWSER } from "$fresh/runtime.ts";

export function Button(props: JSX.HTMLAttributes<HTMLButtonElement>) {
  const { ...rest } = props;

  return (
    <button
      {...rest}
      role="button"
      disabled={!IS_BROWSER || props.disabled}
      class={`btn uppercase font-inter touch-manipulation`}
    />
  );
}
