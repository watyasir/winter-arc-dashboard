"use client";

import { useRef, useState } from "react";
import { useToast } from "@/components/Toast";
import { applyTheme, THEMES, type ThemeId } from "@/lib/theme";

/**
 * Appearance: three theme cards, each a small preview in its own colours (data-theme on the card).
 * Tapping one switches the page at once and saves it to Supabase; if saving fails (also before the
 * user_prefs migration is run) it switches back and says so in an error toast.
 * Fast taps never double-save: one save runs at a time and only the latest choice is sent next.
 */
export function AppearanceSection({ theme, save }: { theme: ThemeId; save: (t: ThemeId) => Promise<{ ok: boolean }> }) {
  const [current, setCurrent] = useState(theme);
  const toast = useToast();
  const saved = useRef(theme);
  const busy = useRef(false);
  const wanted = useRef(theme);

  const flush = async () => {
    if (busy.current) return;
    busy.current = true;
    while (wanted.current !== saved.current) {
      const next = wanted.current;
      const res = await save(next).catch(() => ({ ok: false }));
      if (!res.ok) {
        wanted.current = saved.current;
        setCurrent(saved.current);
        applyTheme(saved.current, true);
        toast({ text: "Couldn't save the theme. Try again in a moment.", tone: "danger" });
        break;
      }
      saved.current = next;
    }
    busy.current = false;
  };

  const pick = (t: ThemeId) => {
    setCurrent(t);
    applyTheme(t, true);
    wanted.current = t;
    void flush();
  };

  return (
    <section aria-labelledby="appearance" className="flex flex-col gap-2">
      <h2 id="appearance" className="label m-0 ml-4 text-soft">
        Appearance
      </h2>
      <div role="radiogroup" aria-labelledby="appearance" className="grid grid-cols-3 gap-2.5">
        {THEMES.map((t) => {
          const on = current === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={on}
              data-theme={t.id}
              onClick={() => pick(t.id)}
              className={`press relative flex min-h-[112px] cursor-pointer flex-col justify-between gap-3 rounded-item border-2 bg-page p-3 text-left text-ink ${on ? "border-accent" : "border-transparent shadow-tile"}`}
            >
              <span aria-hidden="true" className="flex -space-x-1.5">
                <span className="size-6 rounded-full border-2 border-page bg-hero" />
                <span className="size-6 rounded-full border-2 border-page bg-t-money" />
                <span className="size-6 rounded-full border-2 border-page bg-t-check" />
              </span>
              <span className="flex items-center justify-between gap-1">
                <span className="display text-base">{t.name}</span>
                {on && (
                  <span aria-hidden="true" className="grid size-5 place-items-center rounded-full bg-accent text-xs text-white">
                    ✓
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
