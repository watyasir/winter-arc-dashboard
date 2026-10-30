"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { useToast } from "@/components/Toast";
import { nextMidnightIST, type GateChoice } from "@/lib/gate";
import type { NewTask, Task, TaskStatus } from "@/lib/tasks";
import type { DashboardData, GalleryActions, SetEntryAction, TaskActions, ToggleTodayAction, ViewId } from "@/modules/types";

interface DashboardState {
  data: DashboardData;
  /** The page on screen (from its address). */
  view: ViewId;
  /** Today checklist: which rows are ticked. */
  todayDone: boolean[];
  toggleToday: (index: number) => void;
  /** Set when saving a Today tap failed; cleared by the next tap. */
  todayError: string | null;
  /** Tasks as shown right now: changes appear at once and roll back if saving fails. */
  tasks: Task[];
  addTask: (task: NewTask) => void;
  updateTask: (id: string, task: NewTask) => void;
  moveTask: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
  /** An answer on the action gate. `due` only for "move". */
  answerGate: (id: string, choice: GateChoice, due?: string) => void;
  taskError: string | null;
  /** Real dashboard only: lists and deletes gallery files. */
  galleryActions?: GalleryActions;
  /** Today's values changed on the Overview (water, meals), by tracker id; undefined = as loaded. */
  entries: Record<string, number | null>;
  /**
   * Shows a new value for today at once and saves it. Fast taps never double-save: one save per
   * tracker runs at a time and only the latest value goes next. A failed save rolls back and
   * shows an error toast. `onSaved` runs once the value is in the database.
   */
  setEntry: (key: string, trackerId: string | undefined, value: number | null, label: string, onSaved?: () => void) => void;
  /** Anything saved today, including taps on the Overview. */
  checkedIn: boolean;
}

/** A saved sheet as it shows on the Board straight away. */
const shown = (task: NewTask) => ({ ...task, title: task.title.trim(), area: task.area.trim(), note: task.note.trim() || null });

/** Moving into Done stamps the time, so it tops the Done column (the server does the same). */
const withStatus = (task: Task, before: TaskStatus): Task =>
  task.status === before ? task : { ...task, doneAt: task.status === "done" ? new Date().toISOString() : null };

const DashboardContext = createContext<DashboardState | null>(null);

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside <DashboardProvider>");
  return ctx;
}

export function DashboardProvider({
  data,
  view,
  onToggleToday,
  taskActions,
  galleryActions,
  onSetEntry,
  children,
}: {
  data: DashboardData;
  view: ViewId;
  /** Real dashboard only: saves a tapped Today row. The server then sends fresh data. */
  onToggleToday?: ToggleTodayAction;
  /** Real dashboard only: saves task changes. */
  taskActions?: TaskActions;
  galleryActions?: GalleryActions;
  /** Real dashboard only: saves one of today's values (water, a meal). */
  onSetEntry?: SetEntryAction;
  children: ReactNode;
}) {
  const toast = useToast();
  const [todayDone, setTodayDone] = useState(() => data.today.map((t) => t.done));
  const [todayError, setTodayError] = useState<string | null>(null);
  // Fresh data from the server (after a save) replaces the local ticks.
  const [shownToday, setShownToday] = useState(data.today);
  if (shownToday !== data.today) {
    setShownToday(data.today);
    setTodayDone(data.today.map((t) => t.done));
  }

  const toggleToday = (i: number) => {
    const next = !todayDone[i];
    setTodayDone((d) => d.map((v, j) => (j === i ? next : v)));
    setTodayError(null);
    const trackerId = data.today[i]?.trackerId;
    if (!onToggleToday || !trackerId) return;
    onToggleToday(trackerId, next)
      .catch(() => ({ ok: false }))
      .then((res) => {
        if (res.ok) return;
        setTodayDone((d) => d.map((v, j) => (j === i ? !next : v)));
        setTodayError(`Couldn't save ${data.today[i].label}. Check your connection and try again.`);
      });
  };

  const [tasks, setTasks] = useState(data.tasks);
  const [taskError, setTaskError] = useState<string | null>(null);
  const [shownTasks, setShownTasks] = useState(data.tasks);
  if (shownTasks !== data.tasks) {
    setShownTasks(data.tasks);
    setTasks(data.tasks);
  }
  /** Shows the change now; on the real dashboard, saves it and puts things back if that fails. */
  const changeTasks = (change: (t: Task[]) => Task[], save: ((a: TaskActions) => Promise<{ ok: boolean }>) | null, failMsg: string) => {
    const before = tasks;
    setTasks(change);
    setTaskError(null);
    if (!taskActions || !save) return;
    save(taskActions)
      .catch(() => ({ ok: false }))
      .then((res) => {
        if (res.ok) return;
        setTasks(before);
        setTaskError(`${failMsg} Check your connection and try again.`);
        toast({ text: `${failMsg} Try again.`, tone: "danger" });
      });
  };
  const addTask = (task: NewTask) =>
    changeTasks(
      (t) => [...t, { id: `new-${Date.now()}`, ...shown(task), order: 0, doneAt: task.status === "done" ? new Date().toISOString() : null, nextSteps: null, questions: [], chatName: null, quietUntil: null }],
      (a) => a.add(task),
      "Couldn't add the task.",
    );
  // Tasks added a moment ago ("new-…") change on the page only, until the server sends their real id.
  const updateTask = (id: string, task: NewTask) =>
    changeTasks((t) => t.map((k) => (k.id === id ? withStatus({ ...k, ...shown(task) }, k.status) : k)), id.startsWith("new-") ? null : (a) => a.update(id, task), "Couldn't save the task.");
  const moveTask = (id: string, status: TaskStatus) =>
    changeTasks((t) => t.map((k) => (k.id === id ? withStatus({ ...k, status }, k.status) : k)), id.startsWith("new-") ? null : (a) => a.move(id, status), "Couldn't move the task.");
  const deleteTask = (id: string) =>
    changeTasks((t) => t.filter((k) => k.id !== id), id.startsWith("new-") ? null : (a) => a.remove(id), "Couldn't delete the task.");

  const answerGate = (id: string, choice: GateChoice, due?: string) => {
    const quiet = nextMidnightIST(data.todayISO);
    const status: Partial<Record<GateChoice, TaskStatus>> = { done: "done", doing: "doing" };
    changeTasks(
      (t) =>
        t.map((k) => {
          if (k.id !== id) return k;
          const next = { ...k, status: status[choice] ?? k.status, due: choice === "move" && due ? due : k.due, quietUntil: quiet };
          return withStatus(next, k.status);
        }),
      id.startsWith("new-") ? null : (a) => a.gate(id, choice, due),
      "Couldn't save your answer.",
    );
  };

  // ---- today's values from the Overview tiles
  const [entries, setEntries] = useState<Record<string, number | null>>({});
  const [shownData, setShownData] = useState(data);
  if (shownData !== data) {
    // Fresh server data includes the saved values.
    setShownData(data);
    setEntries({});
  }
  const saved = useRef<Record<string, number | null | undefined>>({});
  const wanted = useRef<Record<string, number | null>>({});
  const busy = useRef<Set<string>>(new Set());
  const [savedToday, setSavedToday] = useState(false);

  const setEntry = (key: string, trackerId: string | undefined, value: number | null, label: string, onSaved?: () => void) => {
    setEntries((e) => ({ ...e, [key]: value }));
    if (!onSetEntry || !trackerId) {
      onSaved?.();
      return;
    }
    if (!(key in saved.current)) saved.current[key] = undefined;
    wanted.current[key] = value;
    if (busy.current.has(key)) return;
    busy.current.add(key);
    void (async () => {
      while (wanted.current[key] !== saved.current[key]) {
        const next = wanted.current[key];
        const res = await onSetEntry(trackerId, next).catch(() => ({ ok: false }));
        if (!res.ok) {
          const back = saved.current[key];
          wanted.current[key] = back === undefined ? null : back;
          setEntries((e) => {
            const copy = { ...e };
            if (back === undefined) delete copy[key];
            else copy[key] = back;
            return copy;
          });
          toast({ text: `Couldn't save ${label}. Check your connection.`, tone: "danger" });
          break;
        }
        saved.current[key] = next;
        if (next !== null) setSavedToday(true);
        if (wanted.current[key] === next) onSaved?.();
      }
      busy.current.delete(key);
    })();
  };

  const value: DashboardState = {
    data,
    view,
    todayDone,
    toggleToday,
    todayError,
    tasks,
    addTask,
    updateTask,
    moveTask,
    deleteTask,
    answerGate,
    taskError,
    galleryActions,
    entries,
    setEntry,
    checkedIn: data.checkedIn || savedToday || (!onSetEntry && Object.values(entries).some((v) => v !== null)),
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}
