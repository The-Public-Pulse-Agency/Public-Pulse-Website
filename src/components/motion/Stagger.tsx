import { Children, isValidElement, cloneElement, type ReactElement, type ReactNode } from "react";
import { ScrollReveal } from "./ScrollReveal";

type Props = {
  children: ReactNode;
  /** ms between successive children. Default 80 — fast enough to feel
   *  responsive on long lists, slow enough to read as a sweep. */
  step?: number;
  /** Direction passed through to each ScrollReveal child. */
  from?: "up" | "down" | "left" | "right";
  /** Distance passed through. */
  distance?: number;
};

/** Wraps each direct child in a <ScrollReveal> with an incrementing
 *  delay. Use to stagger reveals on grids and lists without writing the
 *  delayMs by hand.
 *
 *  Skips non-element children (text nodes, fragments) — they render as-is
 *  with no reveal wrapper. */
export function Stagger({ children, step = 80, from = "up", distance = 24 }: Props) {
  const arr = Children.toArray(children);
  let revealIndex = 0;
  return (
    <>
      {arr.map((child, i) => {
        if (!isValidElement(child)) return child;
        const delayMs = revealIndex * step;
        revealIndex += 1;
        // Wrap, preserving the original key if any.
        return (
          <ScrollReveal key={(child as ReactElement).key ?? i} from={from} distance={distance} delayMs={delayMs}>
            {cloneElement(child)}
          </ScrollReveal>
        );
      })}
    </>
  );
}
