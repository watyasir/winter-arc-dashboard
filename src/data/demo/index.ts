import type { DashboardData, SeasonDay } from "@/modules/types";
import { DEMO_TODAY, demoBody } from "./body";

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

const habitSeeds: [string, number][] = [
  ["Workout", 0.82],
  ["Study 90 min", 0.9],
  ["Sleep 7h+", 0.7],
  ["Skincare", 0.86],
  ["Water 3 L", 0.64],
];

const habits = habitSeeds.map(([name, rate], hi) => ({
  name,
  days: Array.from({ length: 28 }, (_, d) => {
    const r = ((d * 37 + hi * 17) % 100) / 100;
    // Workouts get two rest days a week.
    return name === "Workout" ? d % 7 !== 3 && d % 7 !== 6 && r < 0.95 : r < rate;
  }),
}));

export const demoData: DashboardData = {
  ownerLine: "Life, tracked",
  ownerInitial: "Y",
  todayISO: DEMO_TODAY,
  logHref: "/demo/log",
  shareHref: "/demo/progress",
  views: {
    overview: {
      title: "Sunday, 18 October",
      subtitle: "3 tasks due today · 2 overdue · 4 of 6 done today",
    },
    arc: { title: "Winter Arc", subtitle: "26 Sep 2026 → 24 Dec 2026 · 90 days" },
    board: { title: "Board", subtitle: "11 open · 2 overdue · 2 waiting on others" },
  },
  navBadges: { board: "11" },
  trackers: [
    { label: "Workout", done: true, value: "Push" },
    { label: "Study", done: true, value: "90 min" },
    { label: "Sleep", done: true, value: "7.2 h" },
    { label: "Water", done: false, value: "2 of 3 L" },
    { label: "German", done: false, value: "0 of 20 min" },
  ],
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
  goals: [
    { name: "Gain 5 kg", progress: "2.1 of 5 kg", pct: 42, by: "by 24 Dec", tone: "brand" },
    { name: "Bench press 70 kg", progress: "55 of 70", pct: 79, by: "by 31 Dec", tone: "sage" },
    { name: "German A1", progress: "35%", pct: 35, by: "by 31 Mar 2027", tone: "mist" },
    { name: "Travel fund", progress: "52%", pct: 52, by: "by 30 Apr 2027", tone: "pine" },
  ],
  habits,
  tasks: [
    { id: "t1", title: "Winter Arc kickoff", owner: "Both", area: "Winter Arc", due: "2026-10-18", status: "todo" },
    { id: "t2", title: "Renew library card", owner: "Me", area: "Errands", due: "2026-10-18", status: "todo" },
    { id: "t3", title: "Book dentist check-up", owner: "Me", area: "Health", due: "2026-10-16", status: "todo" },
    { id: "t4", title: "November finance review", owner: "Both", area: "Money", due: "2026-10-20", status: "todo" },
    { id: "t5", title: "Cancel unused music app", owner: "Claude", area: "Subscriptions", due: null, status: "todo" },
    { id: "t6", title: "Yasir OS design", owner: "Both", area: "Build", due: null, status: "doing" },
    { id: "t7", title: "Course completion certificate", owner: "Both", area: "Learning", due: "2026-10-18", status: "doing" },
    { id: "t8", title: "Two delivery refund disputes", owner: "Claude", area: "Disputes", due: "2026-10-15", status: "doing" },
    { id: "t9", title: "Habit app review", owner: "Claude", area: "Build", due: null, status: "doing" },
    { id: "t10", title: "New job: document check", owner: "Claude", area: "Work", due: null, status: "waiting" },
    { id: "t11", title: "Course mentor: batch reply", owner: "Claude", area: "Learning", due: "2026-10-21", status: "waiting" },
    { id: "t12", title: "Dashboard project brief", owner: "Claude", area: "Build", due: null, status: "done" },
    { id: "t13", title: "Weekly review agent", owner: "Claude", area: "Build", due: null, status: "done" },
    { id: "t14", title: "Finance logging + email bridge", owner: "Claude", area: "Build", due: null, status: "done" },
  ],
  footnote:
    "Sample data for the demo. The real app fills this from your check-ins, workouts, money snapshots and the Board.",
};
