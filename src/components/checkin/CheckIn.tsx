"use client";

import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import { SwitchRow } from "@/components/Switch";
import { ChoiceRow, GroupCard, NumberRow, TimeRow } from "./CheckInRows";
import {
  AREA_ORDER,
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
