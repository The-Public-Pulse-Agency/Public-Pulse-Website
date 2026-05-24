import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer" | "article";
};

export function Container({ children, className = "", as: As = "div" }: Props) {
  return (
    <As className={`max-w-container mx-auto px-6 md:px-8 ${className}`}>
      {children}
    </As>
  );
}
