import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  intervalToDuration,
} from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatErrors(
  unformattedError: Record<string, string[]>,
): Record<string, string> {
  const formatted: Record<string, string> = {};

  for (const key in unformattedError) {
    formatted[key] = unformattedError[key][0];
  }

  return formatted;
}

export function displayIntervalDate(date: Date | string): string | null {
  const now = new Date();
  const compareDate = new Date(date);
  const timeLeft = intervalToDuration({ start: now, end: compareDate });
  if (timeLeft.years)
    return `${Math.abs(timeLeft.years)} tahun ${timeLeft.years < 0 ? "lalu" : "lagi"}`;
  if (timeLeft.months)
    return `${Math.abs(timeLeft.months)} bulan ${timeLeft.months < 0 ? "lalu" : "lagi"}`;
  if (timeLeft.days)
    return `${Math.abs(timeLeft.days)} hari ${timeLeft.days < 0 ? "lalu" : "lagi"}`;
  if (timeLeft.hours)
    return `${Math.abs(timeLeft.hours)} jam ${timeLeft.hours < 0 ? "lalu" : "lagi"}`;
  if (timeLeft.minutes)
    return `${Math.abs(timeLeft.minutes)} menit ${timeLeft.minutes < 0 ? "lalu" : "lagi"}`;
  return null;
}
