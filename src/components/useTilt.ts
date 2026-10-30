"use client";

import type { PointerEvent } from "react";

const MAX_DEG = 2.5;

/**
 * Pointer handlers that lean a tile toward the mouse (max 2.5°) and move its glare. Mouse only:
 * touch and pen are ignored, and the `tilt` utility in globals.css switches the look off on
 * touch screens and with reduced motion. Off = no handlers at all.
 */
export function useTilt(on: boolean) {
  if (!on) return {};
  return {
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      if (e.pointerType !== "mouse") return;
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.dataset.tilt = "";
      el.style.setProperty("--ry", `${((x - 0.5) * 2 * MAX_DEG).toFixed(2)}deg`);
      el.style.setProperty("--rx", `${((0.5 - y) * 2 * MAX_DEG).toFixed(2)}deg`);
      el.style.setProperty("--gx", `${(x * 100).toFixed(0)}%`);
      el.style.setProperty("--gy", `${(y * 100).toFixed(0)}%`);
    },
    onPointerLeave: (e: PointerEvent<HTMLElement>) => {
      delete e.currentTarget.dataset.tilt;
    },
  };
}
