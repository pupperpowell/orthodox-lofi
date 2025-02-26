import { JSX } from "preact";

type LinkProps = JSX.HTMLAttributes<HTMLAnchorElement>;

export function Link(props: LinkProps) {
  const { class: className, children, ...rest } = props;

  return (
    <a
      {...rest}
      class={`lowercase font-inter underline decoration-dotted 
              hover:decoration-solid transition-all duration-100 ${
        className || ""
      }`}
    >
      {children}
    </a>
  );
}
