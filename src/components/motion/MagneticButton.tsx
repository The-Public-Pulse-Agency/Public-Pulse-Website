"use client";

import Link from "next/link";
import { forwardRef, useEffect, useRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from "react";
import { rafThrottle, useInView, usePointerCoarse, usePrefersReducedMotion } from "./_internal";

type BaseProps = {
  /** Max pull distance in px (default 8). Keep small — premium > playful. */
  strength?: number;
  className?: string;
  children?: ReactNode;
};

// Discriminated union: pass `href` to render as a Next <Link>, otherwise
// renders as a <button>. This lets Server Components use it for navigation
// without trying to serialize an onClick function across the boundary.
type ButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps | "href"> & {
    href?: undefined;
  };
type LinkProps = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps | "href"> & {
    href: string;
  };
type Props = ButtonProps | LinkProps;

function useMagnet(
  ref: React.RefObject<HTMLElement | null>,
  enabled: boolean,
  strength: number
) {
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const onMove = rafThrottle((e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = ((e.clientX - cx) / rect.width) * strength * 2;
      const dy = ((e.clientY - cy) / rect.height) * strength * 2;
      el.style.setProperty("--mx", `${Math.max(-strength, Math.min(strength, dx))}px`);
      el.style.setProperty("--my", `${Math.max(-strength, Math.min(strength, dy))}px`);
    });
    const onLeave = () => {
      el.style.setProperty("--mx", "0px");
      el.style.setProperty("--my", "0px");
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      onLeave();
    };
  }, [enabled, ref, strength]);
}

export const MagneticButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, Props>(
  function MagneticButton({ strength = 8, className = "", children, ...rest }, forwardedRef) {
    const linkRef = useRef<HTMLAnchorElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const reduced = usePrefersReducedMotion();
    const coarse = usePointerCoarse();
    const isLink = typeof (rest as LinkProps).href === "string";
    const activeRef = (isLink ? linkRef : buttonRef) as React.RefObject<HTMLElement | null>;
    const inView = useInView(activeRef);
    const enabled = !reduced && !coarse && inView;
    useMagnet(activeRef, enabled, strength);

    const setLinkRef = (el: HTMLAnchorElement | null) => {
      linkRef.current = el;
      if (typeof forwardedRef === "function") forwardedRef(el);
      else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLAnchorElement | null>).current = el;
    };
    const setButtonRef = (el: HTMLButtonElement | null) => {
      buttonRef.current = el;
      if (typeof forwardedRef === "function") forwardedRef(el);
      else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLButtonElement | null>).current = el;
    };

    if (isLink) {
      const { href, ...anchorRest } = rest as LinkProps;
      return (
        <Link
          ref={setLinkRef}
          href={href}
          className={`magnetic ${className}`}
          {...anchorRest}
        >
          {children}
        </Link>
      );
    }
    const buttonRest = rest as ButtonProps;
    return (
      <button ref={setButtonRef} className={`magnetic ${className}`} {...buttonRest}>
        {children}
      </button>
    );
  }
);
