"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { DashboardData, ViewId } from "@/modules/types";

type InstinctState = { status: "idle" } | { status: "waiting"; secs: number } | { status: "done"; secs: number };

interface DashboardState {
  data: DashboardData;
  view: ViewId;
  setView: (view: ViewId) => void;
  /** Today checklist: which rows are ticked. */
  todayDone: boolean[];
  toggleToday: (index: number) => void;
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

export function DashboardProvider({ data, children }: { data: DashboardData; children: ReactNode }) {
  const [view, setViewState] = useState<ViewId>("overview");
  // View switches are instant and start at the top of the page (DESIGN.md §5).
  const setView = useCallback((next: ViewId) => {
    setViewState(next);
    window.scrollTo({ top: 0 });
  }, []);
  const [todayDone, setTodayDone] = useState(() => data.today.map((t) => t.done));
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
    toggleToday: (i) => setTodayDone((d) => d.map((v, j) => (j === i ? !v : v))),
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
