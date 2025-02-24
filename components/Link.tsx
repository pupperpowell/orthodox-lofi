import { JSX } from "preact";

type LinkProps = JSX.HTMLAttributes<HTMLAnchorElement>;

export function Link(props: LinkProps) {
  const { class: className, children, ...rest } = props;
  
  return (
    <a
      {...rest}
      class={`link lowercase font-inter border-b border-dotted pb-0.5 
              hover:border-solid transition-all duration-200 ${className || ""}`}
    >
      {children}
    </a>
  );
}