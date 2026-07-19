"use client";

import { useEffect, useRef } from "react";

export function CursorAura() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    let frame = 0;
    let x = -500;
    let y = -500;
    let pressed = false;

    const render = () => {
      frame = 0;
      const aura = ref.current;
      if (!aura) return;
      aura.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      aura.toggleAttribute("data-pressed", pressed);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      schedule();
    };

    const onDown = () => { pressed = true; schedule(); };
    const onUp = () => { pressed = false; schedule(); };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    window.addEventListener("blur", onUp);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("blur", onUp);
    };
  }, []);

  return <div className="cursor-aura" ref={ref} aria-hidden="true" />;
}
