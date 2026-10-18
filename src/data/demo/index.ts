import type { DashboardData, SeasonDay } from "@/modules/types";

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
  ownerLine: "Yasir's life dashboard",
  views: {
    overview: {
      title: "Sunday, 18 October",
      subtitle: "Winter Arc day 23 · 4 tasks open today · Instinct synced 9 min ago",
    },
    inbox: { title: "Inbox", subtitle: "4 unread · Claude logged 2 bank alerts today" },
    board: { title: "Board", subtitle: "17 open · 8 with Claude · 2 waiting on others" },
    instinct: { title: "Instinct", subtitle: "Your on-the-go assistant, kept in sync with this dashboard" },
  },
  navBadges: { inbox: "4", board: "17" },
  trackers: [
    { label: "Workout", done: true, value: "Push" },
    { label: "Study", done: true, value: "90 min" },
    { label: "Sleep", done: true, value: "7.2 h" },
    { label: "Water", done: false, value: "2 of 3 L" },
    { label: "German", done: false, value: "0 of 20 min" },
  ],
  season: {
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
  stats: [
    { label: "Sleep", value: "7.2", unit: "hr", note: "7-day average, on target", tone: "mauve", trend: [6.4, 7.1, 6.8, 7.5, 7.0, 7.4, 7.2] },
    { label: "Workouts", value: "3", unit: "of 5", note: "This week", tone: "green", trend: [2, 4, 3, 5, 4, 4, 3] },
    { label: "Study", value: "6.5", unit: "of 10 hr", note: "3.5 hr left this week", tone: "peach", trend: [8, 9, 7, 10, 9, 8, 6.5] },
    { label: "Weight", value: "72.4", unit: "kg", note: "Up 2.1 kg in 8 weeks", tone: "blue", trend: weights },
    { label: "Spent today", value: "₹425", unit: "", note: "Food ₹305 · Travel ₹120", tone: "teal", trend: [900, 300, 650, 120, 480, 220, 425] },
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
    split: { needs: 48, wants: 15, savings: 37 },
    fund: { name: "Travel fund", pct: 52, target: 40000 },
  },
  weight: {
    unit: "kg",
    goal: 76,
    rangeLabel: "8 weeks",
    startLabel: "23 Aug",
    values: weights,
    axis: [69, 77],
  },
  goals: [
    { name: "Gain 5 kg", progress: "2.1 of 5 kg", pct: 42, by: "by 24 Dec", tone: "blue" },
    { name: "Bench press 70 kg", progress: "55 of 70", pct: 79, by: "by 31 Dec", tone: "green" },
    { name: "German A1", progress: "35%", pct: 35, by: "by 31 Mar 2027", tone: "red" },
    { name: "Travel fund", progress: "52%", pct: 52, by: "by 30 Apr 2027", tone: "teal" },
  ],
  habits,
  mailboxes: [
    { label: "Inbox", tone: "blue", count: "4" },
    { label: "Follow up", tone: "peach", count: "1" },
    { label: "Waiting", tone: "yellow", count: "2" },
    { label: "Instinct", tone: "mauve", count: "1" },
    { label: "Bank", tone: "green", count: "1" },
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
  board: [
    {
      name: "To do",
      tone: "neutral",
      count: "11",
      cards: [
        { title: "Winter Arc kickoff", owner: "Both", area: "Winter Arc" },
        { title: "Renew library card", owner: "Me", area: "Errands" },
        { title: "November finance review", owner: "Both", area: "Money", due: "28 Oct", dueState: "soon" },
        { title: "Cancel unused music app", owner: "Claude", area: "Subscriptions" },
      ],
    },
    {
      name: "In progress",
      tone: "blue",
      count: "4",
      cards: [
        { title: "Winter Arc Dashboard design", owner: "Both", area: "Build" },
        { title: "Course completion certificate", owner: "Both", area: "Learning", due: "26 Oct", dueState: "soon" },
        { title: "Two delivery refund disputes", owner: "Claude", area: "Disputes" },
        { title: "Habit app review", owner: "Claude", area: "Build" },
      ],
    },
    {
      name: "Waiting on others",
      tone: "peach",
      count: "2",
      cards: [
        { title: "New job: document check", owner: "Claude", area: "Work" },
        { title: "Course mentor: batch reply", owner: "Claude", area: "Learning", due: "21 Oct" },
      ],
    },
    {
      name: "Done",
      tone: "green",
      count: "5",
      cards: [
        { title: "Dashboard project brief", owner: "Claude", area: "Build", done: true },
        { title: "Weekly review agent", owner: "Claude", area: "Build", done: true },
        { title: "Finance logging + email bridge", owner: "Claude", area: "Build", done: true },
      ],
    },
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
    "Sample data for the demo. The real app fills this from your check-ins, Gmail, the Personal Finance sheet and the Board.",
};
