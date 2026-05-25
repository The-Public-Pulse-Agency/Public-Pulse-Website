import type { ElementType, HTMLAttributes, ReactNode } from "react";

type Props = HTMLAttributes<HTMLElement> & {
  /** Wrap with a different element. Default `<span>` so it inherits the
   *  surrounding heading's typography (size, weight, letter-spacing). */
  as?: ElementType;
  children: ReactNode;
};

/** Animated gradient text — CSS-only sweep. Use ONLY on display headlines
 *  (h1/h2), once per page max. The animation runs continuously; multiple
 *  instances trade off GPU paint cost.
 *
 *  Disabled under prefers-reduced-motion via globals.css (falls back to
 *  solid ink color). */
export function GradientText({ as: Tag = "span", className = "", children, ...rest }: Props) {
  const Component = Tag as ElementType;
  return (
    <Component className={`gradient-text ${className}`} {...rest}>
      {children}
    </Component>
  );
}
