import type { ClaudeJob } from "@/lib/claude-jobs";

/* Made-up scheduled tasks for the panel beside the demo Board. */
export const demoClaudeJobs: ClaudeJob[] = [
  { name: "Morning brief", schedule: "Daily 8:00 AM", status: "ok", lastRun: "2026-10-18T08:00:00+05:30", nextRun: "2026-10-19T08:00:00+05:30" },
  { name: "Money snapshot", schedule: "Daily 8:45 AM and PM", status: "ok", lastRun: "2026-10-18T08:45:00+05:30", nextRun: "2026-10-18T20:45:00+05:30" },
  { name: "Weekly review", schedule: "Sundays 10:45 AM", status: "running", lastRun: "2026-10-18T10:45:00+05:30", nextRun: "2026-10-25T10:45:00+05:30" },
  { name: "Inbox sweep", schedule: "Every 3 hours", status: "failed", lastRun: "2026-10-18T09:00:00+05:30", nextRun: "2026-10-18T12:00:00+05:30" },
];
