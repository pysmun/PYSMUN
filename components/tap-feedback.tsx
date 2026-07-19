"use client";

import { useEffect } from "react";

export function TapFeedback() {
  useEffect(() => {
    const activePointers = new Map<number, HTMLElement>();
    const timers = new Map<HTMLElement, number>();

    const clearTarget = (target: HTMLElement) => {
      const timer = timers.get(target);
      if (timer) window.clearTimeout(timer);
      timers.delete(target);
      target.classList.remove("is-tapped");
    };

    const clearAll = () => {
      activePointers.clear();
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
      document.querySelectorAll<HTMLElement>(".is-tapped").forEach((target) => target.classList.remove("is-tapped"));
    };

    const press = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return;
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-tap-feedback]") : null;
      if (!target) return;

      clearTarget(target);
      target.classList.add("is-tapped");
      activePointers.set(event.pointerId, target);

      // A pointerup can be swallowed by native dragging, a context menu, or a
      // browser gesture. Never allow the visual state to remain latched.
      timers.set(target, window.setTimeout(() => {
        clearTarget(target);
        activePointers.delete(event.pointerId);
      }, 900));
    };

    const release = (event: PointerEvent) => {
      const target = activePointers.get(event.pointerId);
      if (!target) return;
      activePointers.delete(event.pointerId);

      const existingTimer = timers.get(target);
      if (existingTimer) window.clearTimeout(existingTimer);
      const timer = window.setTimeout(() => clearTarget(target), 420);
      timers.set(target, timer);
    };

    const visibilityChange = () => {
      if (document.visibilityState !== "visible") clearAll();
    };

    const preventControlDrag = (event: DragEvent) => {
      const target = event.target instanceof Element
        ? event.target.closest("a, button, img, svg, canvas, [data-no-drag], [data-tap-feedback]")
        : null;

      if (target) event.preventDefault();
      clearAll();
    };

    document.addEventListener("pointerdown", press, { passive: true });
    document.addEventListener("pointerup", release, { passive: true });
    document.addEventListener("pointercancel", release, { passive: true });
    window.addEventListener("blur", clearAll);
    window.addEventListener("pagehide", clearAll);
    document.addEventListener("visibilitychange", visibilityChange);
    document.addEventListener("dragstart", preventControlDrag);
    document.addEventListener("contextmenu", clearAll, { passive: true });

    return () => {
      document.removeEventListener("pointerdown", press);
      document.removeEventListener("pointerup", release);
      document.removeEventListener("pointercancel", release);
      window.removeEventListener("blur", clearAll);
      window.removeEventListener("pagehide", clearAll);
      document.removeEventListener("visibilitychange", visibilityChange);
      document.removeEventListener("dragstart", preventControlDrag);
      document.removeEventListener("contextmenu", clearAll);
      clearAll();
    };
  }, []);

  return null;
}
