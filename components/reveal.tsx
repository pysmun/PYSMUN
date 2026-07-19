"use client";

import { useLayoutEffect, useRef } from "react";

export function Reveal({ children, className = "", delay = 0, tapFeedback = false }: { children: React.ReactNode; className?: string; delay?: 0 | 1 | 2 | 3; tapFeedback?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reveal = () => {
      node.classList.add("is-visible");
      node.classList.remove("is-reveal-pending");
    };
    const bounds = node.getBoundingClientRect();
    if (bounds.top <= window.innerHeight * 1.02 && bounds.bottom >= -window.innerHeight * .02) {
      reveal();
      return;
    }

    node.classList.add("is-reveal-pending");
    if (!("IntersectionObserver" in window)) {
      reveal();
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        reveal();
        observer.disconnect();
      }
    }, { threshold: .01, rootMargin: "22% 0px 22%" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={`reveal ${className}`} data-delay={delay || undefined} data-tap-feedback={tapFeedback || undefined}>{children}</div>;
}
