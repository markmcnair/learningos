import type { ISODate } from "../data/types";

const DAY_MS = 86_400_000;

export function toISODate(d: Date): ISODate {
  return d.toISOString().slice(0, 10);
}

export function addDays(date: ISODate, days: number): ISODate {
  const t = new Date(`${date}T00:00:00.000Z`).getTime();
  return toISODate(new Date(t + Math.round(days) * DAY_MS));
}

export function daysBetween(from: ISODate, to: ISODate): number {
  const a = new Date(`${from}T00:00:00.000Z`).getTime();
  const b = new Date(`${to}T00:00:00.000Z`).getTime();
  return Math.round((b - a) / DAY_MS);
}
