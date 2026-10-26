"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { NewTask, Task, TaskStatus } from "@/lib/tasks";
import type { DashboardData, TaskActions, ToggleTodayAction, ViewId } from "@/modules/types";

type InstinctState = { status: "idle" } | { status: "waiting"; secs: number } | { status: "done"; secs: number };

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
  moveTask: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
  taskError: string | null;
  mailbox: string;
  setMailbox: (box: string) => void;
  selectedMailId: string;
  openMail: (id: string) => void;
  shares: Record<string, boolean>;
  toggleShare: (key: string) => void;
  instinct: InstinctState;
  askInstinct: () => void;
}

const DashboardContext = createContext<DashboardState | null>(null);

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside <DashboardProvider>");
  return ctx;
}

// Demo only: how long the pretend Instinct takes to answer, and how long the green "replied" pill stays.
const DEMO_REPLY_SECS = 6;
const REPLIED_PILL_MS = 3500;

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
      (t) => [...t, { id: `new-${Date.now()}`, title: task.title.trim(), area: task.area.trim(), due: task.due, status: task.status, owner: "Me" }],
      (a) => a.add(task),
      "Couldn't add the task.",
    );
  const moveTask = (id: string, status: TaskStatus) =>
    changeTasks((t) => t.map((k) => (k.id === id ? { ...k, status } : k)), id.startsWith("new-") ? null : (a) => a.move(id, status), "Couldn't move the task.");
  const deleteTask = (id: string) =>
    changeTasks((t) => t.filter((k) => k.id !== id), id.startsWith("new-") ? null : (a) => a.remove(id), "Couldn't delete the task.");

  const [mailbox, setMailbox] = useState("Inbox");
  const [selectedMailId, setSelectedMailId] = useState(data.mails[0]?.id ?? "");
  const [shares, setShares] = useState(() => Object.fromEntries(data.instinct.shares.map((s) => [s.key, s.on])));
  const [instinct, setInstinct] = useState<InstinctState>({ status: "idle" });
  const timers = useRef<{ tick?: ReturnType<typeof setInterval>; hide?: ReturnType<typeof setTimeout> }>({});

  const clearTimers = () => {
    clearInterval(timers.current.tick);
    clearTimeout(timers.current.hide);
  };
  useEffect(() => clearTimers, []);

  const askInstinct = useCallback(() => {
    clearTimers();
    let secs = 0;
    setInstinct({ status: "waiting", secs });
    timers.current.tick = setInterval(() => {
      secs += 1;
      if (secs < DEMO_REPLY_SECS) {
        setInstinct({ status: "waiting", secs });
        return;
      }
      clearInterval(timers.current.tick);
      setInstinct({ status: "done", secs });
      timers.current.hide = setTimeout(() => setInstinct({ status: "idle" }), REPLIED_PILL_MS);
    }, 1000);
  }, []);

  const value: DashboardState = {
    data,
    view,
    setView,
    todayDone,
    toggleToday,
    todayError,
    tasks,
    addTask,
    moveTask,
    deleteTask,
    taskError,
    mailbox,
    setMailbox,
    selectedMailId,
    openMail: (id) => {
      setSelectedMailId(id);
      setView("inbox");
    },
    shares,
    toggleShare: (key) => setShares((s) => ({ ...s, [key]: !s[key] })),
    instinct,
    askInstinct,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}
