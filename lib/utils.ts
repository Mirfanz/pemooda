import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
