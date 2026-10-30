"use client";

import { useCallback } from "react";

const MAX = 120;
const TOKENS = ["--th-dot-on", "--th-check", "--th-accent", "--th-money", "--th-study", "--th-hero-soft"];

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * A small confetti burst on a full-screen canvas, in the theme's colours. No library: at most
 * 120 pieces, and the canvas removes itself when they've fallen. Off with reduced motion.
 * `from` is the burst's centre on screen (default: the middle, a bit above).
 */
export function useConfetti() {
  return useCallback((opts: { count?: number; from?: { x: number; y: number } } = {}) => {
    if (reducedMotion()) return;
    const style = getComputedStyle(document.documentElement);
    const colours = TOKENS.map((t) => style.getPropertyValue(t).trim()).filter(Boolean);
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:60";
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas.remove();
    ctx.scale(dpr, dpr);

    const from = opts.from ?? { x: innerWidth / 2, y: innerHeight * 0.4 };
    const pieces = Array.from({ length: Math.min(MAX, opts.count ?? 60) }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 7;
      return {
        x: from.x,
        y: from.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: 5 + Math.random() * 5,
        spin: Math.random() * Math.PI,
        vspin: (Math.random() - 0.5) * 0.3,
        colour: colours[Math.floor(Math.random() * colours.length)] || "#999",
      };
    });

    const start = performance.now();
    const frame = (now: number) => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      const t = now - start;
      for (const p of pieces) {
        p.vy += 0.25;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.spin += p.vspin;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - t / 1800);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.spin);
        ctx.fillStyle = p.colour;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
      if (t < 1800) requestAnimationFrame(frame);
      else canvas.remove();
    };
    requestAnimationFrame(frame);
  }, []);
}

/** Where to burst from: the middle of an element. */
export const centreOf = (el: Element | null) => {
  const r = el?.getBoundingClientRect();
  return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : undefined;
};
