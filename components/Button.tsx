import { JSX } from "preact";
import { IS_BROWSER } from "$fresh/runtime.ts";

export function Button(props: JSX.HTMLAttributes<HTMLButtonElement>) {
  const { class: className, ...rest } = props;

  return (
    <button
      {...rest}
      disabled={!IS_BROWSER || props.disabled}
      class={`btn uppercase font-inter hover:bg-gray-700 transition-colors duration-100 ${
        className || ""
      }`}
    />
  );
}
