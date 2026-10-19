"use client";

import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import { Segmented } from "@/components/Segmented";
import { Stepper } from "@/components/Stepper";
import { SwitchRow } from "@/components/Switch";
import {
  AREA_ORDER,
  DURATION_PRESETS,
  formatAmount,
  formatValue,
  type CheckInValues,
  type Tracker,
} from "@/lib/trackers";

export type SaveResult = { ok: true } | { ok: false; message: string };

/**
 * The daily check-in sheet (docs/design-reference/CheckIn.dc.html).
 * Built from the tracker list, so a new tracker shows up here without code changes.
 * Every row starts filled in, so a normal day is a few taps and "Done".
 */
export function CheckIn({
  trackers,
  initialValues,
  dayLabel,
  cancelHref,
  onSave,
  footer,
}: {
  trackers: Tracker[];
  initialValues: CheckInValues;
  dayLabel: string;
  cancelHref: string;
  onSave: (values: CheckInValues) => Promise<SaveResult>;
  footer?: ReactNode;
}) {
  const [values, setValues] = useState(initialValues);
  const [status, setStatus] = useState<"editing" | "saved" | { error: string }>("editing");
  const [saving, startSaving] = useTransition();

  const set = (id: string, value: number) => {
    setValues((v) => ({ ...v, [id]: value }));
    setStatus("editing");
  };

  const save = () =>
    startSaving(async () => {
      const result = await onSave(values);
      setStatus(result.ok ? "saved" : { error: result.message });
    });

  const saved = status === "saved";
  const areas = AREA_ORDER.filter((a) => trackers.some((t) => t.area === a));

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col gap-[18px] px-4 pt-2 pb-8">
      <div aria-hidden="true" className="h-[5px] w-9 self-center rounded-full bg-rule" />
      <header className="grid grid-cols-[1fr_auto_1fr] items-center">
        <Link href={cancelHref} className="flex min-h-11 items-center text-[17px] text-brand-text no-underline hover:text-brand-hover">
          Cancel
        </Link>
        <div className="flex flex-col items-center">
          <h1 className="m-0 text-[17px] font-semibold">Check-in</h1>
          <span className="text-xs text-sub">{dayLabel}</span>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className={`min-h-11 cursor-pointer justify-self-end rounded-full border-0 px-4 text-[17px] font-semibold text-white transition-colors motion-reduce:transition-none ${
            saved ? "bg-sage-text" : "bg-brand hover:bg-brand-hover"
          }`}
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Done"}
        </button>
      </header>

      <p role="status" aria-live="polite" className="sr-only">
        {saved ? "Check-in saved." : ""}
      </p>
      {typeof status === "object" && (
        <p role="alert" className="m-0 rounded-2xl bg-coral/12 px-4 py-3 text-[15px] text-coral-text">
          {status.error}
        </p>
      )}

      {trackers.length === 0 && (
        <p className="m-0 text-[15px] text-sub">No trackers yet. They&apos;ll appear here once they&apos;re set up.</p>
      )}

      {areas.map((area) => {
        const inArea = trackers.filter((t) => t.area === area);
        const listRows = inArea.filter((t) => t.type === "checkbox" || t.type === "number");
        const choiceRows = inArea.filter((t) => t.type === "scale_1_5" || t.type === "duration_minutes");
        return (
          <section key={area} aria-labelledby={`area-${area}`} className="flex flex-col gap-1.5">
            <h2 id={`area-${area}`} className="m-0 ml-4 text-[13px] font-normal text-sub">
              {area}
            </h2>
            {listRows.length > 0 && (
              <div className="rounded-[14px] border border-sep bg-card px-4 [&>*:first-child]:border-t-0">
                {listRows.map((t) =>
                  t.type === "checkbox" ? (
                    <SwitchRow key={t.id} large label={t.name} on={values[t.id] === 1} onToggle={() => set(t.id, values[t.id] === 1 ? 0 : 1)} />
                  ) : (
                    <NumberRow key={t.id} tracker={t} value={values[t.id] ?? 0} onChange={(v) => set(t.id, v)} />
                  ),
                )}
              </div>
            )}
            {choiceRows.map((t) => (
              <ChoiceRow key={t.id} tracker={t} value={values[t.id]} onChange={(v) => set(t.id, v)} />
            ))}
          </section>
        );
      })}

      {footer}
    </div>
  );
}

function goalText(t: Tracker) {
  if (t.target == null) return "";
  return ` · goal ${formatValue(t, t.target)}${t.target_period === "weekly" ? " a week" : ""}`;
}

function NumberRow({ tracker: t, value, onChange }: { tracker: Tracker; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex min-h-[52px] items-center justify-between gap-3 border-t border-sep py-1.5">
      <div className="min-w-0">
        <div className="text-[17px]">
          {t.step ? t.name : <label htmlFor={`n-${t.id}`}>{t.name}</label>}
        </div>
        <div className="text-[13px] text-sub">
          {/* A typed-in number is already visible in its box, so only the goal goes here. */}
          {t.step ? `${formatValue(t, value)}${goalText(t)}` : goalText(t).replace(/^ · g/, "G")}
        </div>
      </div>
      {t.step ? (
        <Stepper label={t.name} value={value} step={t.step} onChange={onChange} />
      ) : (
        <input
          id={`n-${t.id}`}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={value ? formatAmount(value) : ""}
          placeholder="0"
          onChange={(e) => {
            const n = Number(e.target.value.replace(/[^\d.]/g, ""));
            if (Number.isFinite(n)) onChange(n);
          }}
          className="h-11 w-28 shrink-0 rounded-full border-0 bg-fill-strong px-4 text-right text-[17px] text-ink"
        />
      )}
    </div>
  );
}

function ChoiceRow({
  tracker: t,
  value,
  onChange,
}: {
  tracker: Tracker;
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  const options =
    t.type === "duration_minutes"
      ? DURATION_PRESETS.map((m) => ({
          value: m as number,
          label: m === 0 ? "None" : m === 120 ? "2h+" : `${m}m`,
          ariaLabel: m === 0 ? "None" : m === 120 ? "2 hours or more" : `${m} minutes`,
        }))
      : [1, 2, 3, 4, 5].map((n) => ({
          value: n,
          label: t.scale_labels?.[n - 1] ?? String(n),
          ariaLabel: `${n} of 5${t.scale_labels ? `, ${t.scale_labels[n - 1]}` : ""}`,
        }));
  // A logged duration that isn't a preset (e.g. 45 min from automation) snaps to the nearest one for display.
  const shown =
    t.type === "duration_minutes" && value !== undefined
      ? DURATION_PRESETS.reduce((best, m) => (Math.abs(m - value) < Math.abs(best - value) ? m : best), 0)
      : (value ?? -1);
  return (
    <div className="flex flex-col gap-1.5">
      <span className="ml-4 text-[15px] font-semibold">{t.name}</span>
      <Segmented label={t.name} options={options} value={shown} onChange={onChange} />
    </div>
  );
}
