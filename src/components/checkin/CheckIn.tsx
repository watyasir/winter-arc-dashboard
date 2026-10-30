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
  notice,
  footer,
}: {
  trackers: Tracker[];
  initialValues: CheckInValues;
  dayLabel: string;
  cancelHref: string;
  onSave: (values: CheckInValues) => Promise<SaveResult>;
  /** A quiet note above the trackers (a database update still to run). */
  notice?: string;
  footer?: ReactNode;
}) {
  const [values, setValues] = useState(initialValues);
  const [status, setStatus] = useState<"editing" | "saved" | { error: string }>("editing");
  const [saving, startSaving] = useTransition();

  const set = (id: string, value: number | undefined) => {
    setValues((v) => ({ ...v, [id]: value }));
    setStatus("editing");
  };

  const save = () =>
    startSaving(async () => {
      // Blank rows (no reading taken) aren't sent, so they're never saved as a value.
      const result = await onSave(Object.fromEntries(Object.entries(values).filter(([, v]) => v !== undefined)));
      setStatus(result.ok ? "saved" : { error: result.message });
    });

  const saved = status === "saved";
  const areas = AREA_ORDER.filter((a) => trackers.some((t) => t.area === a));

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col gap-[18px] px-4 pt-2 pb-8">
      <div aria-hidden="true" className="h-[5px] w-9 self-center rounded-full bg-line-strong" />
      <header className="grid grid-cols-[1fr_auto_1fr] items-center">
        <Link href={cancelHref} prefetch className="flex min-h-11 items-center text-[17px] text-accent no-underline hover:text-accent-strong">
          Cancel
        </Link>
        <div className="flex flex-col items-center">
          <h1 className="m-0 text-[17px] font-semibold">Check-in</h1>
          <span className="text-xs text-soft">{dayLabel}</span>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className={`min-h-11 cursor-pointer justify-self-end rounded-full border-0 px-4 text-[17px] font-semibold transition-colors motion-reduce:transition-none ${
            saved ? "bg-ok text-white" : "bg-pop text-ink hover:bg-pop-strong"
          }`}
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Done"}
        </button>
      </header>

      <p role="status" aria-live="polite" className="sr-only">
        {saved ? "Check-in saved." : ""}
      </p>
      {typeof status === "object" && (
        <p role="alert" className="m-0 rounded-2xl bg-danger-soft px-4 py-3 text-[15px] text-danger">
          {status.error}
        </p>
      )}

      {notice && <p className="m-0 rounded-2xl bg-fill-strong px-4 py-3 text-[15px] text-soft">{notice}</p>}

      {trackers.length === 0 && (
        <p className="m-0 text-[15px] text-soft">No trackers yet. They&apos;ll appear here once they&apos;re set up.</p>
      )}

      {areas.map((area) => {
        const inArea = trackers.filter((t) => t.area === area);
        const loose = inArea.filter((t) => !t.group_name);
        const listRows = loose.filter((t) => t.type === "checkbox" || t.type === "number" || t.type === "time_of_day");
        const choiceRows = loose.filter((t) => t.type === "scale_1_5" || t.type === "duration_minutes" || t.type === "choice");
        const groups = [...new Set(inArea.map((t) => t.group_name).filter((g) => g != null))];
        return (
          <section key={area} aria-labelledby={`area-${area}`} className="flex flex-col gap-1.5">
            <h2 id={`area-${area}`} className="m-0 ml-4 text-[13px] font-medium text-soft">
              {area}
            </h2>
            {listRows.length > 0 && (
              <div className="rounded-[14px] border border-line bg-card px-4 [&>*:first-child]:border-t-0">
                {listRows.map((t) =>
                  t.type === "checkbox" ? (
                    <SwitchRow key={t.id} large label={t.name} on={values[t.id] === 1} onToggle={() => set(t.id, values[t.id] === 1 ? 0 : 1)} />
                  ) : t.type === "time_of_day" ? (
                    <TimeRow key={t.id} tracker={t} value={values[t.id]} onChange={(v) => set(t.id, v)} />
                  ) : (
                    <NumberRow key={t.id} tracker={t} value={values[t.id]} onChange={(v) => set(t.id, v)} />
                  ),
                )}
              </div>
            )}
            {choiceRows.map((t) => (
              <ChoiceRow key={t.id} tracker={t} value={values[t.id]} onChange={(v) => set(t.id, v)} />
            ))}
            {groups.map((g) => (
              <GroupCard key={g} name={g} trackers={inArea.filter((t) => t.group_name === g)} values={values} set={set} />
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

function NumberRow({
  tracker: t,
  value,
  onChange,
}: {
  tracker: Tracker;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
}) {
  return (
    <div className="flex min-h-[52px] items-center justify-between gap-3 border-t border-line py-1.5">
      <div className="min-w-0">
        <div className="text-[17px]">
          {t.step ? t.name : <label htmlFor={`n-${t.id}`}>{t.name}</label>}
        </div>
        <div className="text-[13px] text-soft">
          {/* A typed-in number is already visible in its box, so only the goal goes here. */}
          {t.step ? `${formatValue(t, value ?? 0)}${goalText(t)}` : goalText(t).replace(/^ · g/, "G")}
        </div>
      </div>
      {t.step ? (
        <Stepper label={t.name} value={value ?? 0} step={t.step} onChange={onChange} />
      ) : (
        <NumberInput id={`n-${t.id}`} value={value} onChange={onChange} className="w-28" />
      )}
    </div>
  );
}

/** Typed-in number; cleared = not logged. */
function NumberInput({
  id,
  value,
  onChange,
  className,
  ...rest
}: {
  id?: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  className: string;
  "aria-label"?: string;
}) {
  // The box keeps what's typed ("58." on the way to 58.4); the number goes up as it changes.
  const [text, setText] = useState(value === undefined ? "" : formatAmount(value));
  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={text}
      placeholder="–"
      onChange={(e) => {
        const next = e.target.value.replace(/[^\d.]/g, "");
        const n = Number(next);
        if (!Number.isFinite(n)) return;
        setText(next);
        onChange(next === "" ? undefined : n);
      }}
      className={`h-11 shrink-0 rounded-full border-0 bg-fill-strong px-4 text-right text-[17px] text-ink ${className}`}
      {...rest}
    />
  );
}

const toClock = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

/** A clock time (lights out, wake). Uses the phone's own time wheel. */
function TimeRow({
  tracker: t,
  value,
  onChange,
}: {
  tracker: Tracker;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
}) {
  return (
    <div className="flex min-h-[52px] items-center justify-between gap-3 border-t border-line py-1.5">
      <div className="min-w-0">
        <label htmlFor={`t-${t.id}`} className="text-[17px]">
          {t.name}
        </label>
        {/* The time is in its box; only say when it's missing. */}
        {value === undefined && <div className="text-[13px] text-soft">Not set</div>}
      </div>
      <input
        id={`t-${t.id}`}
        type="time"
        value={value === undefined ? "" : toClock(value)}
        onChange={(e) => {
          const [h, m] = e.target.value.split(":").map(Number);
          onChange(e.target.value ? h * 60 + m : undefined);
        }}
        className="h-11 w-[150px] shrink-0 rounded-full border-0 bg-fill-strong px-3 text-right text-[17px] text-ink"
      />
    </div>
  );
}

/**
 * Trackers that share a group_name, in one card: choices as one compact row each (meals),
 * typed numbers as a 2-column grid (blood pressure). Anything else uses its normal row.
 */
function GroupCard({
  name,
  trackers,
  values,
  set,
}: {
  name: string;
  trackers: Tracker[];
  values: CheckInValues;
  set: (id: string, v: number | undefined) => void;
}) {
  const typed = trackers.filter((t) => t.type === "number" && !t.step);
  const rest = trackers.filter((t) => !typed.includes(t));
  const unit = typed[0]?.unit;
  return (
    <div role="group" aria-labelledby={`g-${name}`} className="flex flex-col gap-1.5">
      <span id={`g-${name}`} className="ml-4 text-[15px] font-semibold">
        {name}
        {unit && <span className="font-medium text-soft"> · {unit}</span>}
      </span>
      <div className="rounded-[14px] border border-line bg-card px-4 [&>*:first-child]:border-t-0">
        {rest.map((t) =>
          t.type === "choice" ? (
            <div key={t.id} className="flex min-h-[52px] items-center justify-between gap-2 border-t border-line py-1">
              <span className="min-w-0 flex-1 truncate text-[15px]">{t.name}</span>
              <div className="w-[228px] shrink-0">
                <Segmented
                  label={t.name}
                  options={(t.scale_labels ?? []).map((l, i) => ({ value: i + 1, label: l }))}
                  value={values[t.id] ?? -1}
                  onChange={(v) => set(t.id, v)}
                />
              </div>
            </div>
          ) : t.type === "time_of_day" ? (
            <TimeRow key={t.id} tracker={t} value={values[t.id]} onChange={(v) => set(t.id, v)} />
          ) : t.type === "checkbox" ? (
            <SwitchRow key={t.id} large label={t.name} on={values[t.id] === 1} onToggle={() => set(t.id, values[t.id] === 1 ? 0 : 1)} />
          ) : (
            <NumberRow key={t.id} tracker={t} value={values[t.id]} onChange={(v) => set(t.id, v)} />
          ),
        )}
        {typed.length > 0 && (
          <div className={`grid grid-cols-2 gap-x-3 gap-y-2 py-3 ${rest.length ? "border-t border-line" : ""}`}>
            {typed.map((t) => (
              <label key={t.id} className="flex flex-col gap-1">
                <span className="ml-1 text-[13px] text-soft">{t.name}</span>
                <NumberInput aria-label={t.name} value={values[t.id]} onChange={(v) => set(t.id, v)} className="w-full" />
              </label>
            ))}
          </div>
        )}
      </div>
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
    t.type === "choice"
      ? (t.scale_labels ?? []).map((l, i) => ({ value: i + 1, label: l, ariaLabel: undefined }))
      : t.type === "duration_minutes"
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
