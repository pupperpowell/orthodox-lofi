import { JSX } from "preact";
import { IS_BROWSER } from "$fresh/runtime.ts";

export function Button(props: JSX.HTMLAttributes<HTMLButtonElement>) {
  const { class: className, ...rest } = props;

  return (
    <button
      {...rest}
      role="button"
      disabled={props.disabled}
      class={`btn uppercase font-inter hover:bg-gray-700 active:bg-gray-700 touch-action-manipulation ${
        className || ""
      }`}
    />
  );
}
