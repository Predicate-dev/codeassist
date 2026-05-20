import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatValue(value: unknown): string {
  if (typeof value === "undefined") return "undefined";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean" || value === null) {
    return String(value);
  }
  return JSON.stringify(value);
}

function compactKey(key: string): string {
  if (/^[A-Za-z_$][\w$]*$/.test(key) || /^\d+$/.test(key)) return key;
  return JSON.stringify(key);
}

export function compactValue(value: unknown): string {
  if (typeof value === "undefined") return "undefined";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean" || value === null) {
    return String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((entry) => compactValue(entry)).join(", ")}]`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (!entries.length) return "{}";
    return `{ ${entries
      .map(([key, entry]) => `${compactKey(key)}: ${compactValue(entry)}`)
      .join(", ")} }`;
  }

  return String(value);
}

export function stableStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
