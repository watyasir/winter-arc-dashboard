import type { Account, DashboardData } from "@/modules/types";
import { shortDate, todayISO } from "./trackers";

/*
  Money snapshots (Phase 6). Claude's finance task reads the Personal Finance sheet and
  pushes one snapshot to POST /api/money; the Money tiles show the latest one.
  Matches supabase/migrations/20261026000001_money_snapshots.sql.
*/

export type SplitKey = "needs" | "wants" | "savings";
export type Split = Record<SplitKey, { actual: number; target: number }>;

export interface MoneySnapshot {
  /** YYYY-MM */
  month: string;
  income: number;
  expenses: number;
  categories: { name: string; amount: number }[];
  /** % of income. */
  split: Split;
  banks: { name: string; balance: number }[];
  /** due_date as YYYY-MM-DD, or null when there's no bill. */
  cards: { name: string; dues: number; due_date: string | null }[];
  spendable: number;
  /** ISO timestamp. */
  updated_at: string;
}

export const MONEY_COLUMNS = "month, income, expenses, categories, split, banks, cards, spendable, updated_at";

/** Needs 50 / wants 20 / savings 30, unless the snapshot says otherwise. */
export const DEFAULT_SPLIT_TARGETS: Record<SplitKey, number> = { needs: 50, wants: 20, savings: 30 };

const SPLIT_KEYS: SplitKey[] = ["needs", "wants", "savings"];
const MAX_AMOUNT = 1e10;
const MAX_ITEMS = 30;

// ---------------------------------------------------------------- checking a pushed snapshot

type Parsed = { ok: true; snapshot: MoneySnapshot } | { ok: false; error: string };

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isAmount = (v: unknown, min = 0): v is number => typeof v === "number" && Number.isFinite(v) && v >= min && v < MAX_AMOUNT;
const isName = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0 && v.trim().length <= 40;
const isDate = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

/** Checks the JSON body of POST /api/money. Error messages name the field that's wrong. */
export function parseMoneySnapshot(body: unknown, now = new Date()): Parsed {
  const fail = (error: string): Parsed => ({ ok: false, error });
  if (!isObject(body)) return fail("Send a JSON object.");
  const { month, income, expenses, categories = [], split, banks = [], cards = [], spendable, updated_at } = body;

  if (typeof month !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return fail("month: use YYYY-MM, e.g. 2026-10.");
  if (!isAmount(income)) return fail("income: a number, 0 or more.");
  if (!isAmount(expenses)) return fail("expenses: a number, 0 or more.");
  if (!isAmount(spendable, -MAX_AMOUNT)) return fail("spendable: a number.");

  if (!Array.isArray(categories) || categories.length > MAX_ITEMS) return fail(`categories: a list of up to ${MAX_ITEMS}.`);
  for (const c of categories) {
    if (!isObject(c) || !isName(c.name) || !isAmount(c.amount)) return fail("categories: each needs a name and an amount (0 or more).");
  }

  if (!isObject(split)) return fail("split: needs, wants and savings, each with an actual %.");
  const parsedSplit = {} as Split;
  for (const key of SPLIT_KEYS) {
    const part = split[key];
    const target = isObject(part) && part.target !== undefined ? part.target : DEFAULT_SPLIT_TARGETS[key];
    if (!isObject(part) || typeof part.actual !== "number" || !Number.isFinite(part.actual) || part.actual < -1000 || part.actual > 1000) {
      return fail(`split.${key}.actual: a % of income.`);
    }
    if (typeof target !== "number" || target < 0 || target > 100) return fail(`split.${key}.target: a % from 0 to 100.`);
    parsedSplit[key] = { actual: part.actual, target };
  }

  if (!Array.isArray(banks) || banks.length > MAX_ITEMS) return fail(`banks: a list of up to ${MAX_ITEMS}.`);
  for (const b of banks) {
    if (!isObject(b) || !isName(b.name) || !isAmount(b.balance, -MAX_AMOUNT)) return fail("banks: each needs a name and a balance.");
  }

  if (!Array.isArray(cards) || cards.length > MAX_ITEMS) return fail(`cards: a list of up to ${MAX_ITEMS}.`);
  for (const c of cards) {
    if (!isObject(c) || !isName(c.name) || !isAmount(c.dues)) return fail("cards: each needs a name and dues (0 or more).");
    if (c.due_date != null && !isDate(c.due_date)) return fail("cards: due_date is YYYY-MM-DD or null.");
  }

  let updated = now.toISOString();
  if (updated_at !== undefined) {
    const t = typeof updated_at === "string" ? Date.parse(updated_at) : NaN;
    // A little slack for clock drift, but nothing from the future.
    if (Number.isNaN(t) || t > now.getTime() + 5 * 60_000) return fail("updated_at: an ISO time, not in the future.");
    updated = new Date(t).toISOString();
  }

  return {
    ok: true,
    snapshot: {
      month,
      income,
      expenses,
      categories: (categories as { name: string; amount: number }[]).map((c) => ({ name: c.name.trim(), amount: c.amount })),
      split: parsedSplit,
      banks: (banks as { name: string; balance: number }[]).map((b) => ({ name: b.name.trim(), balance: b.balance })),
      cards: (cards as { name: string; dues: number; due_date?: string | null }[]).map((c) => ({
        name: c.name.trim(),
        dues: c.dues,
        due_date: c.due_date ?? null,
      })),
      spendable,
      updated_at: updated,
    },
  };
}

// ---------------------------------------------------------------- snapshot -> Money tile

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "9:52 PM" today, "25 Oct, 9:52 PM" on other days (India time). */
export function updatedLabel(iso: string, now = new Date()): string {
  const at = new Date(iso);
  const time = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hour12: true })
    .format(at)
    .toUpperCase();
  const day = todayISO(at);
  return day === todayISO(now) ? time : `${shortDate(day)}, ${time}`;
}

// Banks take turns through the wallet's tab colours so each stands apart (DESIGN.md §2b).
const BANK_KINDS: Account["kind"][] = ["savings", "current", "other"];

/** The latest snapshot in the shape the Money tiles use. Banks first, then cards (amount owed as negative). */
export function toMoneyTile(s: MoneySnapshot, now = new Date()): NonNullable<DashboardData["money"]> {
  const accounts: Account[] = [
    ...s.banks.map((b, i) => ({ id: `bank-${i}`, name: b.name, kind: BANK_KINDS[i % BANK_KINDS.length], balance: Number(b.balance) })),
    ...s.cards.map((c, i) => ({
      id: `card-${i}`,
      name: c.name,
      kind: "card" as const,
      balance: -Number(c.dues),
      due: c.due_date ? shortDate(c.due_date) : undefined,
    })),
  ];
  return {
    month: MONTHS[Number(s.month.slice(5, 7)) - 1] ?? s.month,
    updated: updatedLabel(s.updated_at, now),
    income: Number(s.income),
    spent: Number(s.expenses),
    spendable: Number(s.spendable),
    split: s.split,
    categories: [...s.categories].sort((a, b) => b.amount - a.amount).slice(0, 4),
    accounts,
  };
}
