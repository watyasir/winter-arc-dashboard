"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Button } from "@/components/Button";
import { fieldClass, StatusMessages, type Status } from "@/components/body/Sheet";
import { Field, Group } from "@/components/FormGroup";
import { parseNumber, type SaveResult } from "@/lib/body";
import { CALENDARS } from "@/lib/calendar";
import { SEASON_DAYS, seasonProblem, TRACKER_TYPES, trackerProblem, type SeasonInput, type TrackerInput } from "@/lib/settings";
import { AREA_ORDER, formatDayLabel, type Tracker, type TrackerArea, type TrackerType } from "@/lib/trackers";

/*
  /settings: Winter Arc (start date + a daily target per tracker), a new tracker, the calendar
  feeds, a sign-in code for another device, and Reset test data. The one primary button is the season's.
*/

interface SettingsActions {
  saveSeason: (s: SeasonInput) => Promise<SaveResult>;
  addTracker: (t: TrackerInput) => Promise<SaveResult>;
  resetTestData: () => Promise<SaveResult>;
  makeSignInCode: () => Promise<{ ok: true; code: string; expiresAt: number } | { ok: false; message: string }>;
}

/** What a daily target means for each type, shown next to the box. */
const targetUnit = (t: Pick<Tracker, "type" | "unit">) =>
  t.type === "duration_minutes" ? "min" : t.type === "scale_1_5" ? "of 5" : (t.unit ?? "");

export function SettingsForm({
  trackers,
  season,
  defaultStart,
  actions,
  calendarPath,
}: {
  trackers: Tracker[];
  /** The active season, if there is one. */
  season: { start: string; targets: Record<string, number> } | null;
  /** Next Monday, for a new season. */
  defaultStart: string;
  actions: SettingsActions;
  /** /api/calendar.ics?token=…; null = SHARE_TOKEN isn't set. */
  calendarPath: string | null;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col gap-[18px] px-4 pt-6 pb-8">
      <header className="flex items-center justify-between">
        <h1 className="m-0 text-[34px] leading-[1.1] display tracking-[-0.02em]">Settings</h1>
        <Link href="/" prefetch className="flex min-h-11 items-center text-[17px] text-accent no-underline hover:text-accent-strong">
          Done
        </Link>
      </header>
      <SeasonSection trackers={trackers} season={season} defaultStart={defaultStart} save={actions.saveSeason} />
      <NewTrackerSection add={actions.addTracker} />
      <CalendarSection path={calendarPath} />
      <SignInCodeSection make={actions.makeSignInCode} />
      <ResetSection reset={actions.resetTestData} />
    </div>
  );
}

// ---------------------------------------------------------------- Sign-in code

/**
 * On iPhone the home-screen app doesn't share Safari's sign-in, and the email link opens in Safari.
 * This shows a one-time code to type into "Have a code?" on the other device's /login.
 */
function SignInCodeSection({ make }: { make: SettingsActions["makeSignInCode"] }) {
  const [code, setCode] = useState<{ code: string; expiresAt: number } | null>(null);
  const [status, setStatus] = useState<Status>("editing");
  const [busy, startBusy] = useTransition();

  const run = () =>
    startBusy(async () => {
      const r = await make();
      if (r.ok) setCode(r);
      setStatus(r.ok ? "editing" : { error: r.message });
    });
  const until = code
    ? new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(code.expiresAt)
    : "";

  return (
    <>
      <Group id="signin-code" title="Sign in on another device">
        <div className="flex flex-col gap-2 py-3">
          <span className="text-[15px] text-soft">
            For the home-screen app on your iPhone: on its sign-in page, tap &ldquo;Have a code?&rdquo; and type this code.
          </span>
          {code && (
            <div role="status" className="flex flex-col gap-1 rounded-2xl bg-fill-strong p-3">
              <span className="font-mono text-[28px] font-semibold tracking-[0.12em]" aria-label={`Code ${code.code.split("").join(" ")}`}>
                {code.code.slice(0, 4)}-{code.code.slice(4)}
              </span>
              <span className="text-[13px] text-soft">Works once, until {until}. Making a new one ends this one.</span>
            </div>
          )}
          <Button onClick={run} disabled={busy} className="self-start">
            {busy ? "Making…" : code ? "Make a new code" : "Show sign-in code"}
          </Button>
        </div>
      </Group>
      <StatusMessages status={status} savedText="" />
    </>
  );
}

// ---------------------------------------------------------------- Calendar feeds

/**
 * The 9 colour-coded calendar feeds. Tap a name to subscribe in Apple Calendar (webcal://),
 * or copy its link. The dots are each calendar's own colour in Apple Calendar.
 */
function CalendarSection({ path }: { path: string | null }) {
  const [copied, setCopied] = useState<string | null>(null);
  const linkFor = (key: string) => `webcal://${window.location.host}${path}&cat=${key}`;

  async function copy(key: string) {
    try {
      await navigator.clipboard.writeText(linkFor(key));
      setCopied(key);
    } catch {
      window.prompt("Copy this link", linkFor(key));
    }
  }

  return (
    <Group id="calendar" title="Calendar">
      {!path && <p className="m-0 py-3 text-[15px] text-soft">The feeds need SHARE_TOKEN in the site&apos;s settings.</p>}
      {path &&
        CALENDARS.map((c) => (
          <div key={c.key} className="flex min-h-[52px] items-center gap-3 py-1.5">
            {/* Apple Calendar's colour for this feed: data, not a theme colour. */}
            <span aria-hidden="true" className="size-3 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
            <a
              href={`${path}&cat=${c.key}`}
              onClick={(e) => {
                e.preventDefault();
                window.location.href = linkFor(c.key);
              }}
              className="flex min-h-11 flex-1 items-center text-[17px] text-ink no-underline"
            >
              {c.name}
            </a>
            <Button onClick={() => copy(c.key)} aria-label={`Copy the ${c.name} calendar link`}>
              {copied === c.key ? "Copied" : "Copy"}
            </Button>
          </div>
        ))}
      {path && <p className="m-0 py-3 text-[13px] text-soft">Tap a name to subscribe in Calendar, or copy its link.</p>}
    </Group>
  );
}

// ---------------------------------------------------------------- Winter Arc

/** Clock times, choices and grouped readings (meals, blood pressure) are logged, not targets. */
const countable = (t: Tracker) => !t.group_name && t.type !== "time_of_day" && t.type !== "choice";

function SeasonSection({
  trackers,
  season,
  defaultStart,
  save,
}: {
  trackers: Tracker[];
  season: { start: string; targets: Record<string, number> } | null;
  defaultStart: string;
  save: SettingsActions["saveSeason"];
}) {
  const [start, setStart] = useState(season?.start ?? defaultStart);
  // Per tracker: on/off and the target text. Starts from the season, or each tracker's own daily target.
  const [rows, setRows] = useState(() =>
    Object.fromEntries(
      trackers.map((t) => {
        const own = t.target_period === "daily" && t.target != null ? Number(t.target) : null;
        const value = season ? season.targets[t.slug] : own;
        const on = season ? t.slug in season.targets : own != null;
        return [t.slug, { on, text: value == null || t.type === "checkbox" ? "" : String(value) }];
      }),
    ),
  );
  const [status, setStatus] = useState<Status>("editing");
  const [saving, startSaving] = useTransition();

  const change = (slug: string, next: Partial<{ on: boolean; text: string }>) => {
    setRows((r) => ({ ...r, [slug]: { ...r[slug], ...next } }));
    setStatus("editing");
  };

  const submit = () => {
    const targets: Record<string, number> = {};
    for (const t of trackers.filter(countable)) {
      const row = rows[t.slug];
      if (!row?.on) continue;
      const n = t.type === "checkbox" ? 1 : parseNumber(row.text);
      if (n == null) return setStatus({ error: `Set a daily target for ${t.name}, or switch it off.` });
      targets[t.slug] = n;
    }
    const input = { start, targets };
    const problem = seasonProblem(input);
    if (problem) return setStatus({ error: problem });
    startSaving(async () => {
      const r = await save(input);
      setStatus(r.ok ? "saved" : { error: r.message });
    });
  };

  return (
    <>
      <Group id="season" title={`Winter Arc · ${SEASON_DAYS} days`}>
        <Field label="Day 1">
          <input type="date" value={start} onChange={(e) => e.target.value && (setStart(e.target.value), setStatus("editing"))} className={fieldClass} />
        </Field>
      </Group>
      <p className="m-0 mx-4 -mt-3 text-[13px] text-soft">
        {formatDayLabel(start)}. Until then the dashboard counts down to it.
      </p>

      <Group title="Daily targets that count">
        {trackers.filter(countable).map((t) => {
          // A tracker added further down this page starts switched off.
          const row = rows[t.slug] ?? { on: false, text: "" };
          return (
            <div key={t.id} className="flex min-h-[52px] items-center gap-3 py-1.5">
              <span className="min-w-0 flex-1 text-[17px]">{t.name}</span>
              {row.on && t.type !== "checkbox" && (
                <span className="flex items-center gap-2">
                  <input
                    inputMode="decimal"
                    aria-label={`Daily target for ${t.name}`}
                    value={row.text}
                    placeholder="–"
                    onChange={(e) => change(t.slug, { text: e.target.value.replace(/[^\d.,]/g, "") })}
                    className={`${fieldClass} w-20 text-right`}
                  />
                  <span className="w-10 text-[13px] text-soft">{targetUnit(t)}</span>
                </span>
              )}
              <button
                type="button"
                role="switch"
                aria-checked={row.on}
                aria-label={`Count ${t.name}`}
                onClick={() => change(t.slug, { on: !row.on })}
                className="flex min-h-11 cursor-pointer items-center border-0 bg-transparent p-0"
              >
                <span
                  aria-hidden="true"
                  className={`flex h-7 w-[46px] items-center rounded-full p-0.5 transition-colors motion-reduce:transition-none ${
                    row.on ? "justify-end bg-accent-soft" : "justify-start bg-fill-strong"
                  }`}
                >
                  <span className="size-6 rounded-full bg-white" />
                </span>
              </button>
            </div>
          );
        })}
      </Group>
      <p className="m-0 mx-4 -mt-3 text-[13px] text-soft">A day counts as &quot;all targets&quot; when every switched-on tracker hits its target.</p>

      <StatusMessages status={status} savedText={season ? "Season saved." : "Winter Arc is set. See you on day 1."} />
      <Button variant="primary" onClick={submit} disabled={saving} className="min-h-[50px] text-[17px] sm:min-h-[50px]">
        {saving ? "Saving…" : season ? "Save season" : "Start Winter Arc"}
      </Button>
    </>
  );
}

// ---------------------------------------------------------------- new tracker

function NewTrackerSection({ add }: { add: SettingsActions["addTracker"] }) {
  const [name, setName] = useState("");
  const [area, setArea] = useState<TrackerArea>("Custom");
  const [type, setType] = useState<TrackerType>("checkbox");
  const [unit, setUnit] = useState("");
  const [target, setTarget] = useState("");
  const [period, setPeriod] = useState<"daily" | "weekly">("daily");
  const [status, setStatus] = useState<Status>("editing");
  const [saving, startSaving] = useTransition();

  const submit = () => {
    // A daily yes/no needs no number: done = target hit.
    const t = type === "checkbox" && period === "daily" ? 1 : parseNumber(target);
    const input: TrackerInput = { name, area, type, unit, target: t, period };
    const problem = trackerProblem(input);
    if (problem) return setStatus({ error: problem });
    startSaving(async () => {
      const r = await add(input);
      if (!r.ok) return setStatus({ error: r.message });
      setStatus("saved");
      setName("");
      setUnit("");
      setTarget("");
    });
  };

  const needsNumber = !(type === "checkbox" && period === "daily");
  return (
    <>
      <Group id="new-tracker" title="New tracker">
        <Field label="Name">
          <input value={name} maxLength={40} placeholder="e.g. Reading" onChange={(e) => (setName(e.target.value), setStatus("editing"))} className={`${fieldClass} w-44`} />
        </Field>
        <Field label="Area">
          <select value={area} onChange={(e) => setArea(e.target.value as TrackerArea)} className={`${fieldClass} w-44 cursor-pointer`}>
            {AREA_ORDER.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </Field>
        <Field label="Type">
          <select value={type} onChange={(e) => setType(e.target.value as TrackerType)} className={`${fieldClass} w-44 cursor-pointer`}>
            {TRACKER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        {type === "number" && (
          <Field label="Unit">
            <input value={unit} maxLength={12} placeholder="e.g. pages" onChange={(e) => setUnit(e.target.value)} className={`${fieldClass} w-44`} />
          </Field>
        )}
        <Field label="Target">
          <select value={period} onChange={(e) => setPeriod(e.target.value as "daily" | "weekly")} aria-label="Target period" className={`${fieldClass} w-44 cursor-pointer`}>
            <option value="daily">{type === "checkbox" ? "Every day" : "Per day"}</option>
            <option value="weekly">{type === "checkbox" ? "Times a week" : "Per week"}</option>
          </select>
        </Field>
        {needsNumber && (
          <Field label={period === "weekly" && type === "checkbox" ? "Times" : "Amount"}>
            <span className="flex items-center gap-2">
              <input
                inputMode="decimal"
                value={target}
                placeholder="optional"
                onChange={(e) => setTarget(e.target.value.replace(/[^\d.,]/g, ""))}
                className={`${fieldClass} w-28 text-right`}
              />
              <span className="w-10 text-[13px] text-soft">{type === "checkbox" ? "" : targetUnit({ type, unit: unit || null })}</span>
            </span>
          </Field>
        )}
      </Group>
      <StatusMessages status={status} savedText="Tracker added. It's in your check-in and on the dashboard now." />
      <Button onClick={submit} disabled={saving} className="self-start">
        {saving ? "Adding…" : "Add tracker"}
      </Button>
    </>
  );
}

// ---------------------------------------------------------------- reset

function ResetSection({ reset }: { reset: SettingsActions["resetTestData"] }) {
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState<Status>("editing");
  const [busy, startBusy] = useTransition();

  const run = () =>
    startBusy(async () => {
      const r = await reset();
      setStatus(r.ok ? "saved" : { error: r.message });
      setConfirming(false);
    });

  return (
    <>
      <Group id="reset" title="Test data">
        <div className="flex flex-col gap-2 py-3">
          <span className="text-[15px] text-soft">
            Deletes all your entries, workouts, body checks, tasks and goals. Trackers, Winter Arc and your goal weight stay.
          </span>
          {!confirming ? (
            <button
              type="button"
              onClick={() => (setConfirming(true), setStatus("editing"))}
              className="min-h-11 cursor-pointer self-start rounded-full border-0 bg-transparent px-2 text-[15px] font-semibold text-danger hover:bg-danger-soft"
            >
              Reset test data
            </button>
          ) : (
            <div role="alertdialog" aria-label="Confirm reset" className="flex flex-col gap-2 rounded-2xl bg-danger-soft p-3">
              <span className="text-[15px] font-semibold text-danger">Delete all test data? This can&apos;t be undone.</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={run}
                  disabled={busy}
                  className="min-h-11 cursor-pointer rounded-full border-0 bg-danger px-4 text-[15px] font-semibold text-white"
                >
                  {busy ? "Deleting…" : "Delete test data"}
                </button>
                <Button onClick={() => setConfirming(false)} disabled={busy}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </Group>
      <StatusMessages status={status} savedText="Test data cleared. Your dashboard starts fresh." />
    </>
  );
}
