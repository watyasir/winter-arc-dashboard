"use client";

import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import { SwitchRow } from "@/components/Switch";
import { bodyCheckProblem, kg, MEASURES, parseNumber, type BodyCheck, type BodyCheckInput, type SaveResult } from "@/lib/body";
import { formatDayLabel } from "@/lib/trackers";
import { SheetHeader, StatusMessages, fieldClass, type Status } from "./Sheet";

/*
  The weekly body check: weight, waist, chest, arms, and whether a progress photo was taken.
  Boxes start empty with last week's number shown faintly, so an old value is never saved by accident.
*/

type Key = "weight" | "goal" | (typeof MEASURES)[number]["key"];

const show = (n: number | null | undefined) => (n == null ? "" : kg(n));

export function BodyCheckForm({
  today,
  existing,
  previous,
  goal,
  cancelHref,
  onSave,
  footer,
}: {
  today: string;
  /** Today's check if it's already done: the form edits it. */
  existing: BodyCheck | null;
  /** The check before, for the faint hints. */
  previous: BodyCheck | null;
  goal: number | null;
  cancelHref: string;
  onSave: (b: BodyCheckInput) => Promise<SaveResult>;
  footer?: ReactNode;
}) {
  const [date, setDate] = useState(existing?.date ?? today);
  const [text, setText] = useState<Record<Key, string>>({
    weight: show(existing?.weight),
    waist: show(existing?.waist),
    chest: show(existing?.chest),
    arms: show(existing?.arms),
    goal: show(goal),
  });
  const [photo, setPhoto] = useState(existing?.photo ?? false);
  const [status, setStatus] = useState<Status>("editing");
  const [saving, startSaving] = useTransition();

  const set = (key: Key, value: string) => {
    setText((t) => ({ ...t, [key]: value.replace(/[^\d.,]/g, "") }));
    setStatus("editing");
  };

  const save = () => {
    const input: BodyCheckInput = {
      date,
      weight: parseNumber(text.weight),
      waist: parseNumber(text.waist),
      chest: parseNumber(text.chest),
      arms: parseNumber(text.arms),
      goal: parseNumber(text.goal),
      photo,
    };
    const problem = bodyCheckProblem(input, today);
    if (problem) return setStatus({ error: problem });
    startSaving(async () => {
      const result = await onSave(input);
      setStatus(result.ok ? "saved" : { error: result.message });
    });
  };

  const hint = (n: number | null | undefined, unit: string) => (n == null ? "" : `Last ${kg(n)} ${unit}`);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col gap-[18px] px-4 pt-2 pb-8">
      <SheetHeader title="Body check" subtitle={formatDayLabel(date)} cancelHref={cancelHref} onSave={save} saving={saving} saved={status === "saved"} />
      <StatusMessages status={status} savedText="Body check saved. See you next week." />

      <p className="m-0 mx-4 text-[13px] text-sub">
        Once a week, same time of day. Fill in what you measured; empty boxes are skipped.
        {previous && ` Last check: ${formatDayLabel(previous.date)}.`}
      </p>

      <Group title="Weight">
        <NumberField label="Weight" unit="kg" value={text.weight} hint={hint(previous?.weight, "kg")} onChange={(v) => set("weight", v)} />
        <NumberField label="Goal weight" unit="kg" value={text.goal} hint="Shown on the weight chart" onChange={(v) => set("goal", v)} />
      </Group>

      <Group title="Measurements">
        {MEASURES.map(({ key, label }) => (
          <NumberField key={key} label={label} unit="cm" value={text[key]} hint={hint(previous?.[key], "cm")} onChange={(v) => set(key, v)} />
        ))}
      </Group>

      <Group title="Photo">
        <SwitchRow
          large
          label="Progress photo taken"
          on={photo}
          onToggle={() => {
            setPhoto(!photo);
            setStatus("editing");
          }}
        />
      </Group>
      <p className="m-0 mx-4 -mt-3 text-[13px] text-sub">Only a yes or no is saved. Your photo stays on your phone.</p>

      <Group title="Date">
        <label className="flex min-h-[52px] items-center justify-between gap-3">
          <span className="text-[17px]">Checked on</span>
          <input type="date" value={date} max={today} onChange={(e) => e.target.value && setDate(e.target.value)} className={fieldClass} />
        </label>
      </Group>

      <Link href={cancelHref} className="flex min-h-11 items-center self-center text-[15px]">
        Back to dashboard
      </Link>
      {footer}
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="flex flex-col gap-1.5">
      <h2 className="m-0 ml-4 text-[13px] font-normal text-sub">{title}</h2>
      <div className="rounded-[14px] border border-sep bg-card px-4 [&>*+*]:border-t [&>*+*]:border-solid [&>*+*]:border-sep [&>*:first-child]:border-t-0">{children}</div>
    </section>
  );
}

function NumberField({
  label,
  unit,
  value,
  hint,
  onChange,
}: {
  label: string;
  unit: string;
  value: string;
  hint: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex min-h-[52px] items-center justify-between gap-3 py-1.5">
      <span className="min-w-0">
        <span className="block text-[17px]">{label}</span>
        {hint && <span className="block text-[13px] text-sub">{hint}</span>}
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <input
          inputMode="decimal"
          autoComplete="off"
          value={value}
          placeholder="–"
          onChange={(e) => onChange(e.target.value)}
          className={`${fieldClass} w-24 text-right`}
        />
        <span className="w-6 text-[15px] text-sub">{unit}</span>
      </span>
    </label>
  );
}
