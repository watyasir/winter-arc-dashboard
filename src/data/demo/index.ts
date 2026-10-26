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

const weights = [70.3, 70.6, 70.9, 71.2, 71.4, 71.9, 72.1, 72.4];

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
    inbox: { title: "Inbox", subtitle: "4 unread · Claude logged 2 bank alerts today" },
    board: { title: "Board", subtitle: "11 open · 2 overdue · 2 waiting on others" },
    instinct: { title: "Instinct", subtitle: "Your on-the-go assistant, kept in sync with this dashboard" },
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
  stats: [
    { label: "Sleep", value: "7.2", unit: "hr", note: "7-day average, on target", tone: "arc", trend: [6.4, 7.1, 6.8, 7.5, 7.0, 7.4, 7.2] },
    { label: "Workouts", value: "3", unit: "of 5", note: "This week", tone: "sage", trend: [2, 4, 3, 5, 4, 4, 3] },
    { label: "Study", value: "6.5", unit: "of 10 hr", note: "3.5 hr left this week", tone: "yellow", trend: [8, 9, 7, 10, 9, 8, 6.5] },
    { label: "Weight", value: "72.4", unit: "kg", note: "Up 2.1 kg in 7 weeks", tone: "brand", trend: weights },
    { label: "Spent today", value: "₹425", unit: "", note: "Food ₹305 · Travel ₹120", tone: "pine", trend: [900, 300, 650, 120, 480, 220, 425] },
  ],
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
  mailboxes: [
    { label: "Inbox", tone: "brand", count: "4" },
    { label: "Follow up", tone: "yellow", count: "1" },
    { label: "Waiting", tone: "yellow", count: "2" },
    { label: "Instinct", tone: "arc", count: "1" },
    { label: "Bank", tone: "sage", count: "1" },
  ],
  mailboxNote: "Claude files Instinct mail and logs bank alerts automatically.",
  mails: [
    {
      id: "m1",
      from: "Acme Corp Hiring",
      subject: "Background verification: one document pending",
      time: "10:42",
      label: "Follow up",
      box: "Inbox",
      unread: true,
      body: "Hi there,\n\nYour background verification is almost complete. Please upload your previous employment relieving letter on the portal by Wednesday so we can close your file.\n\nRegards,\nTA Team",
      claudeNote: "Added “Upload relieving letter” to your Board, due Wed 21 Oct.",
    },
    {
      id: "m2",
      from: "QuickCart Support",
      subject: "Re: Order not received, escalated to senior team",
      time: "09:15",
      label: "Waiting",
      box: "Waiting",
      unread: true,
      body: "We have escalated your concern to our senior team. You will receive a callback within 24 to 48 business hours.",
      claudeNote: "Tracking this on the Board under Disputes. I’ll tell you when they call back.",
    },
    {
      id: "m3",
      from: "Instinct",
      subject: "[Instinct] Re: Life OS sync",
      time: "08:02",
      label: "Instinct",
      box: "Instinct",
      unread: false,
      body: "Synced. I can see 17 open tasks, Winter Arc day 23 and October money. Logged ₹60 chai and ₹120 auto from your voice notes.",
      claudeNote: "Both cash spends are now in the Personal Finance sheet.",
    },
    {
      id: "m4",
      from: "Demo Bank",
      subject: "Alert: ₹245 spent on card ending 4242",
      time: "Yesterday",
      label: "Bank",
      box: "Inbox",
      unread: true,
      loggedByClaude: true,
      body: "Rs.245.00 was spent on your Demo Bank Credit Card ending 4242 at FOODIE on 17-10-2026.",
      claudeNote: "Logged ₹245 to Food and the credit card row.",
    },
    {
      id: "m5",
      from: "SkillUp Academy",
      subject: "Ticket #10482: update on your enrolment",
      time: "Yesterday",
      label: "Waiting",
      box: "Waiting",
      unread: true,
      body: "Thank you for your patience. Our team is checking your cohort mapping and will update you shortly.",
      claudeNote: "Still no cohort fix. Deadline for submission is 26 Oct.",
    },
    {
      id: "m6",
      from: "Netflix",
      subject: "Your payment of ₹199 is coming up",
      time: "Sat",
      label: "Bills",
      box: "Inbox",
      unread: false,
      loggedByClaude: true,
      body: "Your Netflix membership will renew on 11 November for ₹199.",
      claudeNote: "Expected on the credit card. Nothing to do.",
    },
    {
      id: "m7",
      from: "Amazon",
      subject: "Delivered: Air fryer",
      time: "Thu",
      label: "Shopping",
      box: "Inbox",
      unread: false,
      body: "Your package was delivered. EMI 1 of 3 appears on your 28 Oct statement.",
      claudeNote: "EMI 2 and 3 are already planned in Money.",
    },
  ],
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
  instinct: {
    draftQuestion: "Has my course mentor replied about my batch?",
    exchanges: [
      { question: "Log cash from today’s voice notes", answer: "₹60 chai and ₹120 auto logged to the sheet.", meta: "8:02 AM · 1 min 12 s", status: "answered" },
      { question: "Check bank balance (read-only)", answer: "Waiting for your OTP on WhatsApp.", meta: "Yesterday · paused", status: "paused" },
      { question: "Did SkillUp support reply?", answer: "No reply yet. Ticket still open.", meta: "Yesterday · 1 min 48 s", status: "answered" },
      { question: "Fitness band you suggested: which one?", answer: "Shared two options; you parked wearables for now.", meta: "18 Oct · 1 min 40 s", status: "answered" },
    ],
    shares: [
      { key: "tasks", label: "Board and tasks", on: true },
      { key: "arc", label: "Winter Arc progress", on: true },
      { key: "money", label: "Money summary", on: true },
      { key: "inbox", label: "Inbox summary", on: true },
      { key: "body", label: "Workouts and weight", on: true },
      { key: "health", label: "Health reports", on: false },
    ],
    digest:
      "Day 23 of 90 · streak 12\nToday: gym push day, study 90 min, German 20 min\nDue: bike servicing Tue, certificate file 26 Oct\nMoney: ₹18,200 saved in Oct\nWaiting on: job document check, QuickCart callback",
  },
  footnote:
    "Sample data for the demo. The real app fills this from your check-ins, workouts, money snapshots and the Board.",
  isDemo: true,
};
