import type { ClaudeJob } from "@/lib/claude-jobs";
import type { DayPlan } from "@/lib/day-plan";

/*
  A made-up day plan for /demo: an afternoon shift on weekdays, weekends off.
  The real plan is sent by Claude to the API and only lives in the database.
*/

const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri"] as const;
const weekdays = [...WEEKDAYS];

export const demoDayPlan: DayPlan = {
  phases: [
    { start: "07:30", kind: "food", title: "Wake, water, small snack", detail: "Curtains open, a glass of water, a banana before training." },
    { start: "07:50", kind: "move", title: "Workout", detail: "Strength day.", byDay: { tue: "30-min walk and stretching.", thu: "30-min walk and stretching.", sun: "Rest day: an easy walk." } },
    { start: "09:00", kind: "care", title: "Shower, morning skin care", detail: "Cleanser, moisturiser, sunscreen." },
    { start: "09:20", kind: "food", title: "Breakfast", detail: "Eggs, toast and yoghurt." },
    { start: "10:00", kind: "mind", title: "Build block · 1.5 h", detail: "Side projects with Claude.", days: weekdays },
    { start: "11:30", kind: "care", title: "Loose ends", detail: "Mail, calls and errands from last night's notes.", days: weekdays },
    { start: "12:00", kind: "food", title: "Lunch, pack the lunch box", days: weekdays },
    { start: "12:40", kind: "work", title: "Commute", detail: "At the desk by 1:15.", days: weekdays },
    { start: "13:30", kind: "work", title: "Shift", detail: "Water bottle full by the first break.", days: weekdays },
    { start: "15:30", kind: "food", title: "Break · 15 min", detail: "Fruit and a handful of nuts.", days: weekdays },
    { start: "15:45", kind: "work", title: "Shift", days: weekdays },
    { start: "17:45", kind: "food", title: "Break · 30 min: dinner", detail: "Vegetables first, then the rest. Short walk after.", days: weekdays },
    { start: "18:15", kind: "work", title: "Shift", days: weekdays },
    { start: "20:45", kind: "food", title: "Break · 15 min", detail: "Protein shake.", days: weekdays },
    { start: "21:00", kind: "work", title: "Shift", days: weekdays },
    { start: "22:30", kind: "work", title: "Log out, ride home", days: weekdays },
    { start: "10:30", kind: "food", title: "Groceries and meal prep", detail: "Order the stock list, prep the week.", days: ["sat"] },
    { start: "12:00", kind: "mind", title: "Build block · 4 h", days: ["sat"] },
    { start: "10:30", kind: "care", title: "Day out with friends", detail: "Lunch out: protein and salad first.", days: ["sun"] },
    { start: "16:00", kind: "care", title: "Free time", days: ["sat", "sun"] },
    { start: "20:30", kind: "mind", title: "Weekly review · 30 min", days: ["sun"] },
    { start: "23:00", kind: "care", title: "Settle in, warm drink", detail: "Herbal tea or warm milk." },
    { start: "23:15", kind: "care", title: "Bath, night skin care", detail: "Gentle cleanser and moisturiser." },
    { start: "23:40", kind: "care", title: "Tomorrow ready, 2-minute check-in", detail: "Bag packed, clothes out, log today in Yasir OS." },
    { start: "24:00", kind: "mind", title: "Read · 30 min", detail: "Paper book, phone in the other room." },
    { start: "24:30", kind: "sleep", title: "Lights out", detail: "7 hours." },
  ],
  sections: [
    {
      title: "Meals",
      items: [
        { label: "Breakfast", text: "Eggs, toast, yoghurt and a fruit." },
        { label: "Lunch", text: "Dal, vegetables, rotis and a protein side." },
        { label: "Dinner box", text: "Vegetables, rice or rotis, grilled paneer or chicken." },
      ],
    },
    {
      title: "Gym A / B",
      items: [
        { label: "Day A", text: "Squat · bench press · row · overhead press · plank." },
        { label: "Day B", text: "Deadlift · incline press · pull-downs · lunges · curls." },
      ],
    },
    {
      title: "Skin, hair, body",
      items: [
        { label: "Morning", text: "Cleanser, moisturiser, sunscreen." },
        { label: "Night", text: "Cleanser, moisturiser." },
        { label: "Hair", text: "Wash on strength days." },
      ],
    },
    { title: "Prep", items: [{ label: "Saturday", text: "Boil the beans, marinate the protein, portion lunch boxes for the week." }] },
    {
      title: "Stock list",
      items: [
        { label: "Dairy", text: "Milk, yoghurt, paneer." },
        { label: "Protein", text: "Eggs, chicken, lentils." },
        { label: "Fruit and veg", text: "Bananas, apples, spinach, tomatoes." },
      ],
    },
  ],
};

export const demoClaudeJobs: ClaudeJob[] = [
  { name: "Morning brief", schedule: "Daily 8:00 AM", status: "ok", lastRun: "2026-10-18T08:00:00+05:30", nextRun: "2026-10-19T08:00:00+05:30" },
  { name: "Money snapshot", schedule: "Daily 8:45 AM and PM", status: "ok", lastRun: "2026-10-18T08:45:00+05:30", nextRun: "2026-10-18T20:45:00+05:30" },
  { name: "Weekly review", schedule: "Sundays 10:45 AM", status: "running", lastRun: "2026-10-18T10:45:00+05:30", nextRun: "2026-10-25T10:45:00+05:30" },
  { name: "Inbox sweep", schedule: "Every 3 hours", status: "failed", lastRun: "2026-10-18T09:00:00+05:30", nextRun: "2026-10-18T12:00:00+05:30" },
];
