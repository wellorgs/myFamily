import { useSyncExternalStore } from "react";
import { notificationItems } from "./mock-data";

const READ_KEY = "myfamily.notifications.read.v1";
const listeners = new Set<() => void>();

function load(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(READ_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

let readMap: Record<string, number> = load();

function persist() {
  if (typeof window !== "undefined") {
    localStorage.setItem(READ_KEY, JSON.stringify(readMap));
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function markRead(id: string) {
  if (readMap[id]) return;
  readMap = { ...readMap, [id]: Date.now() };
  persist();
}

export function markAllRead(ids?: string[]) {
  const targets = ids ?? notificationItems.map((n) => n.id);
  const now = Date.now();
  const next = { ...readMap };
  let changed = false;
  for (const id of targets) {
    if (!next[id]) {
      next[id] = now;
      changed = true;
    }
  }
  if (!changed) return;
  readMap = next;
  persist();
}

export function markUnread(id: string) {
  if (!readMap[id]) return;
  const next = { ...readMap };
  delete next[id];
  readMap = next;
  persist();
}

export function resetAllUnread() {
  readMap = {};
  persist();
}

export function useReadMap(): Record<string, number> {
  return useSyncExternalStore(
    subscribe,
    () => readMap,
    () => readMap,
  );
}

export function useIsRead(id: string): boolean {
  const map = useReadMap();
  return Boolean(map[id]);
}

export function useUnreadCount(kinds?: readonly string[]): number {
  const map = useReadMap();
  return notificationItems.reduce((count, n) => {
    if (kinds && !kinds.includes(n.kind)) return count;
    return map[n.id] ? count : count + 1;
  }, 0);
}
