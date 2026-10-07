"use client";

import * as React from "react";
import { cn } from "cn";

type RevealProps<T extends React.ElementType = "div"> = {
  as?: T;
  delay?: number;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export function Reveal<T extends React.ElementType = "div">({ as, delay = 0, className, children, ...rest }: RevealProps<T>) {
  const Comp = (as ?? "div") as React.ElementType;
  const ref = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add("is-visible");
            io.unobserve(el);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Comp ref={ref} className={cn("reveal", className)} style={delay ? { transitionDelay: `${delay}ms` } : undefined} {...rest}>
      {children}
    </Comp>
  );
}
