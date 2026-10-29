import type { Owner, TaskStatus } from "@/lib/tasks";
import type { DashboardData, SeasonDay, Task } from "@/modules/types";
import { demoBento } from "./bento";
import { DEMO_TODAY, demoBody } from "./body";
import { demoClaudeJobs } from "./claude-jobs";
import { demoGallery } from "./gallery";

/*
  Fake data for /demo. Every name, amount and number here is made up.
  Real data never goes in this repo.
*/

// A believable 90-day season: day 23 is today, days 8 and 16 were missed.
const seasonDays: SeasonDay[] = Array.from({ length: 90 }, (_, i) => {
  if (i === 22) return "today";
  if (i > 22) return "upcoming";
  if (i === 7 || i === 15) return "missed";
  return ((i * 47 + 13) % 100) / 100 < 0.3 ? "most" : "all";
});

function demoTask(
  id: string,
  title: string,
  owner: Owner,
  area: string,
  due: string | null,
  status: TaskStatus,
  extra: Partial<Pick<Task, "note" | "order" | "doneAt" | "nextSteps" | "questions" | "chatName">> = {},
): Task {
  return { id, title, owner, area, due, status, note: null, order: 0, doneAt: null, nextSteps: null, questions: [], chatName: null, quietUntil: null, ...extra };
}

export const demoData: DashboardData = {
  ownerLine: "Life, tracked",
  basePath: "/demo",
  todayISO: DEMO_TODAY,
  logHref: "/demo/log",
  shareHref: "/demo/progress",
  views: {
    overview: {
      title: "Sunday, 18 October",
      subtitle: "Sample data · 3 tasks due today · 2 overdue",
    },
    arc: { title: "Winter Arc", subtitle: "26 Sep 2026 → 24 Dec 2026 · 90 days" },
    board: { title: "Board", subtitle: "11 open · 2 overdue · 2 waiting on others" },
    gallery: { title: "Gallery", subtitle: "Images and files Claude saved from chats" },
    money: { title: "Money", subtitle: "October · sample accounts" },
    health: { title: "Health", subtitle: "Weight, steps, sleep, blood pressure and workouts" },
  },
  navBadges: { board: "11" },
  season: {
    startsIn: 0,
    name: "Winter Arc",
    length: 90,
    day: 23,
    streak: 12,
    targetsHitPct: 78,
    bestStreak: 19,
    missed: 2,
    startLabel: "26 Sep",
    endLabel: "24 Dec",
    days: seasonDays,
  },
  // Day 23 is the 2nd day of season week 4.
  arc: {
    rangeLabel: "26 Sep 2026 → 24 Dec 2026",
    week: 4,
    weekCount: 13,
    targets: [
      { name: "Sleep 7 hr", done: 2, target: 7 },
      { name: "Study 1.5 hr", done: 2, target: 7 },
      { name: "Water 3 L", done: 1, target: 7 },
      { name: "Skincare", done: 2, target: 7 },
      { name: "German 20 min", done: 0, target: 7 },
      { name: "Workout", done: 1, target: 5 },
    ],
    streaks: [
      { name: "Sleep 7 hr", current: 3, best: 12 },
      { name: "Study 1.5 hr", current: 12, best: 19 },
      { name: "Water 3 L", current: 1, best: 6 },
      { name: "Skincare", current: 9, best: 15 },
      { name: "German 20 min", current: 0, best: 8 },
      { name: "Workout", current: 2, best: 5 },
    ],
    weeks: [78, 86, 71, 64, null, null, null, null, null, null, null, null, null],
  },

  today: [
    { label: "Gym · push day", area: "Body", done: true },
    { label: "High-protein breakfast", area: "Health", done: true },
    { label: "Study 90 min", area: "Mind", done: true },
    { label: "Skincare AM", area: "Looks", done: true },
    { label: "German · 20 min", area: "Skills", done: false },
    { label: "Hair routine PM", area: "Looks", done: false },
  ],
  money: {
    month: "October",
    updated: "9:52 PM",
    income: 50000,
    spent: 31800,
    spendable: 14600,
    split: {
      needs: { actual: 48, target: 50 },
      wants: { actual: 15, target: 20 },
      savings: { actual: 37, target: 30 },
    },
    categories: [
      { name: "Rent", amount: 12000 },
      { name: "Food", amount: 7400 },
      { name: "Travel", amount: 4100 },
      { name: "Shopping", amount: 3300 },
    ],
    // Made-up accounts. Real ones arrive as snapshots through POST /api/money (Phase 6).
    accounts: [
      {
        id: "savings",
        name: "Savings account",
        kind: "savings",
        balance: 48200,
        transactions: [
          { label: "Moved from salary account", date: "18 Oct", amount: 10000 },
          { label: "Interest", date: "1 Oct", amount: 312 },
          { label: "Travel fund top-up", date: "1 Oct", amount: -5000 },
          { label: "Moved from salary account", date: "18 Sep", amount: 10000 },
          { label: "Interest", date: "1 Sep", amount: 298 },
        ],
      },
      {
        id: "salary",
        name: "Salary account",
        kind: "current",
        balance: 31500,
        transactions: [
          { label: "Groceries", date: "19 Oct", amount: -1240 },
          { label: "Moved to savings", date: "18 Oct", amount: -10000 },
          { label: "Rent", date: "5 Oct", amount: -12000 },
          { label: "Salary", date: "1 Oct", amount: 50000 },
          { label: "Phone bill", date: "1 Oct", amount: -399 },
        ],
      },
      {
        id: "card",
        name: "Credit card",
        kind: "card",
        balance: -12400,
        due: "5 Nov",
        transactions: [
          { label: "Food delivery", date: "17 Oct", amount: -245 },
          { label: "Air fryer, EMI 1 of 3", date: "14 Oct", amount: -2300 },
          { label: "Fuel", date: "12 Oct", amount: -1500 },
          { label: "Streaming plan", date: "11 Oct", amount: -199 },
          { label: "Bill paid", date: "5 Oct", amount: 9800 },
        ],
      },
    ],
  },
  workoutHref: "/demo/log/workout",
  bodyHref: "/demo/log/body",
  goalsHref: "/demo/log/goals",
  settingsHref: null,
  ...demoBody,
  ...demoBento,
  goals: [
    { name: "1RK fund", progress: "₹42,000 of ₹1,00,000", pct: 42, by: "by 31 Jan 2027", tone: "blue" },
    { name: "Gain 5 kg", progress: "2.1 of 5 kg", pct: 42, by: "by 24 Dec", tone: "blue" },
    { name: "Bench press 70 kg", progress: "55 of 70", pct: 79, by: "by 31 Dec", tone: "ok" },
    { name: "German A1", progress: "35%", pct: 35, by: "by 31 Mar 2027", tone: "blue" },
    { name: "Travel fund", progress: "52%", pct: 52, by: "by 30 Apr 2027", tone: "blue" },
  ],
  tasks: [
    demoTask("t0", "Move to the new flat", "Both", "Home", "2026-10-20", "todo", { order: 10, note: "Book the movers, then pack the kitchen" }),
    demoTask("t1", "Winter Arc kickoff", "Both", "Winter Arc", "2026-10-18", "todo"),
    demoTask("t2", "Renew library card", "Me", "Errands", "2026-10-18", "todo"),
    demoTask("t3", "Book dentist check-up", "Me", "Health", "2026-10-16", "todo", { note: 'Next: call the clinic at 10 AM, ask for a Saturday slot | Chat: "Health admin"' }),
    demoTask("t4", "November finance review", "Both", "Money", "2026-10-20", "todo", { note: "Claude drafts the numbers first" }),
    demoTask("t5", "Cancel unused music app", "Claude", "Subscriptions", null, "todo"),
    demoTask("t6", "Yasir OS design", "Both", "Build", null, "doing", { order: 2 }),
    demoTask("t7", "Course completion certificate", "Both", "Learning", "2026-10-18", "doing"),
    demoTask("t8", "Two delivery refund disputes", "Claude", "Disputes", "2026-10-15", "doing", {
      note: "Waiting 48 h before the second follow-up",
      nextSteps: "Claude sends the second follow-up; you forward the delivery photos first.",
      questions: ["Do you still have the photos from the 12 Oct delivery?", "OK to escalate to the consumer helpline if there's no reply by Friday?"],
      chatName: "Refund disputes",
    }),
    demoTask("t9", "Habit app review", "Claude", "Build", null, "doing"),
    demoTask("t10", "New job: document check", "Claude", "Work", null, "waiting", { note: "HR said by Friday" }),
    demoTask("t11", "Course mentor: batch reply", "Claude", "Learning", "2026-10-21", "waiting"),
    demoTask("t12", "Dashboard project brief", "Claude", "Build", null, "done", { doneAt: "2026-10-17T10:00:00+05:30" }),
    demoTask("t13", "Weekly review agent", "Claude", "Build", null, "done", { doneAt: "2026-10-16T10:00:00+05:30" }),
    demoTask("t14", "Finance logging + email bridge", "Claude", "Build", null, "done", { doneAt: "2026-10-15T10:00:00+05:30" }),
  ],
  gallery: demoGallery,
  claudeJobs: demoClaudeJobs,
};
