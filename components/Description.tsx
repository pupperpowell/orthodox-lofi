import { JSX } from "preact";

type DescriptionProps = JSX.HTMLAttributes<HTMLParagraphElement>;

export function Description(props: DescriptionProps) {
  const { class: className, children, ...rest } = props;
  
  return (
    <p
      {...rest}
      class={`text-description text-gray-500 font-triodion ${className || ""}`}
    >
      {children}
    </p>
  );
}