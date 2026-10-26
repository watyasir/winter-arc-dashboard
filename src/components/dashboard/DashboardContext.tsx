"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { nextMidnightIST, type GateChoice } from "@/lib/gate";
import type { NewTask, Task, TaskStatus } from "@/lib/tasks";
import type { DashboardData, TaskActions, ToggleTodayAction, ViewId } from "@/modules/types";

interface DashboardState {
  data: DashboardData;
  view: ViewId;
  setView: (view: ViewId) => void;
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
  onToggleToday,
  taskActions,
  children,
}: {
  data: DashboardData;
  /** Real dashboard only: saves a tapped Today row. The server then sends fresh data. */
  onToggleToday?: ToggleTodayAction;
  /** Real dashboard only: saves task changes. */
  taskActions?: TaskActions;
  children: ReactNode;
}) {
  const [view, setViewState] = useState<ViewId>("overview");
  // View switches are instant and start at the top of the page (DESIGN.md §5).
  // The Winter Arc page has its own address (/winter-arc redirects to /#winter-arc), kept on refresh.
  const setView = useCallback((next: ViewId) => {
    setViewState(next);
    window.scrollTo({ top: 0 });
    history.replaceState(history.state, "", next === "arc" ? "#winter-arc" : location.pathname + location.search);
  }, []);
  useEffect(() => {
    // The hash only exists in the browser, so it's read after the first render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (location.hash === "#winter-arc") setViewState("arc");
  }, []);
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

  const value: DashboardState = {
    data,
    view,
    setView,
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
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}
