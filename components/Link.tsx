import { JSX } from "preact";

type LinkProps = JSX.HTMLAttributes<HTMLAnchorElement>;

export function Link(props: LinkProps) {
  const { class: className, children, ...rest } = props;

  return (
    <a
      {...rest}
      class={`font-inter underline decoration-solid 
              hover:decoration-dotted transition-all duration-100 ${
        className || ""
      }`}
    >
      {children}
    </a>
  );
}
