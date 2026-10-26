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
const isDate = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

/** A number, or text like "₹1,25,000", "-2,300" or "48%". Undefined = not a number. */
function toNumber(v: unknown): number | undefined {
  if (typeof v === "number") return Number.isFinite(v) ? v : undefined;
  if (typeof v !== "string") return undefined;
  const cleaned = v.replace(/[₹,%\s]/g, "").replace(/^Rs\.?/i, "").replace("−", "-");
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return undefined;
  return Number(cleaned);
}

/** An amount in rupees from min up. Undefined = not one. */
function toAmount(v: unknown, min = 0): number | undefined {
  const n = toNumber(v);
  return n !== undefined && n >= min && n < MAX_AMOUNT ? n : undefined;
}

/** A trimmed name, cut to 40 characters. Undefined = empty or not text. */
function toName(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim().slice(0, 40) : undefined;
}

/**
 * Checks the JSON body of POST /api/money. Amounts may be numbers or text like "₹12,000".
 * Error messages name the field (and list position) that's wrong.
 */
export function parseMoneySnapshot(body: unknown, now = new Date()): Parsed {
  const fail = (error: string): Parsed => ({ ok: false, error });
  if (!isObject(body)) return fail("Send a JSON object.");
  const { month, categories = [], split, banks = [], cards = [], updated_at } = body;

  if (typeof month !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return fail("month: use YYYY-MM, e.g. 2026-10.");
  const income = toAmount(body.income);
  if (income === undefined) return fail("income: a number, 0 or more.");
  const expenses = toAmount(body.expenses);
  if (expenses === undefined) return fail("expenses: a number, 0 or more.");
  const spendable = toAmount(body.spendable, -MAX_AMOUNT);
  if (spendable === undefined) return fail("spendable: a number.");

  if (!Array.isArray(categories) || categories.length > MAX_ITEMS) return fail(`categories: a list of up to ${MAX_ITEMS}.`);
  const parsedCategories: MoneySnapshot["categories"] = [];
  for (const [i, c] of categories.entries()) {
    const name = isObject(c) ? toName(c.name) : undefined;
    const amount = isObject(c) ? toAmount(c.amount) : undefined;
    if (name === undefined || amount === undefined) return fail(`categories[${i}]: needs a name and an amount (0 or more).`);
    parsedCategories.push({ name, amount });
  }

  if (!isObject(split)) return fail("split: needs, wants and savings, each with an actual %.");
  const parsedSplit = {} as Split;
  for (const key of SPLIT_KEYS) {
    const part = split[key];
    const actual = isObject(part) ? toNumber(part.actual) : undefined;
    if (actual === undefined || actual < -1000 || actual > 1000) return fail(`split.${key}.actual: a % of income.`);
    const target = isObject(part) && part.target != null ? toNumber(part.target) : DEFAULT_SPLIT_TARGETS[key];
    if (target === undefined || target < 0 || target > 100) return fail(`split.${key}.target: a % from 0 to 100.`);
    parsedSplit[key] = { actual, target };
  }

  if (!Array.isArray(banks) || banks.length > MAX_ITEMS) return fail(`banks: a list of up to ${MAX_ITEMS}.`);
  const parsedBanks: MoneySnapshot["banks"] = [];
  for (const [i, b] of banks.entries()) {
    const name = isObject(b) ? toName(b.name) : undefined;
    const balance = isObject(b) ? toAmount(b.balance, -MAX_AMOUNT) : undefined;
    if (name === undefined || balance === undefined) return fail(`banks[${i}]: needs a name and a balance.`);
    parsedBanks.push({ name, balance });
  }

  if (!Array.isArray(cards) || cards.length > MAX_ITEMS) return fail(`cards: a list of up to ${MAX_ITEMS}.`);
  const parsedCards: MoneySnapshot["cards"] = [];
  for (const [i, c] of cards.entries()) {
    const name = isObject(c) ? toName(c.name) : undefined;
    const dues = isObject(c) ? toAmount(c.dues) : undefined;
    if (name === undefined || dues === undefined) return fail(`cards[${i}]: needs a name and dues (0 or more).`);
    const due = isObject(c) && c.due_date !== "" ? (c.due_date ?? null) : null;
    if (due !== null && !isDate(due)) return fail(`cards[${i}].due_date: YYYY-MM-DD or null.`);
    parsedCards.push({ name, dues, due_date: due });
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
      categories: parsedCategories,
      split: parsedSplit,
      banks: parsedBanks,
      cards: parsedCards,
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
