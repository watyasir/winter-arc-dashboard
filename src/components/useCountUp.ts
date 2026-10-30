"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts a number up from 0 once, when the tile first shows (700 ms, ease-out). Later changes
 * show straight away. With reduced motion it shows the value at once.
 */
export function useCountUp(value: number, ms = 700) {
  // null = not counting: show the real value.
  const [counting, setCounting] = useState<number | null>(null);
  const target = useRef(value);
  useEffect(() => {
    target.current = value;
  }, [value]);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      setCounting(t < 1 ? target.current * (1 - (1 - t) ** 3) : null);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ms]);
  return counting ?? value;
}
