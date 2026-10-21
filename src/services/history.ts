import type { SearchRecord } from "../types";

const STORAGE_KEY = "searchHistory";

export function getHistory(): SearchRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function addToHistory(record: SearchRecord): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...getHistory()]));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
