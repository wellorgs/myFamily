import { useSyncExternalStore } from "react";

export type ActivityKind = "save" | "unsave" | "reply" | "share" | "love";

export type ActivityEntry = {
  id: string;
  kind: ActivityKind;
  targetId: string; // stable id of the media/notification item
  targetLabel: string; // human label e.g. "Voice note from Priya"
  targetEmoji?: string;
  from?: string; // author of the source content
  note?: string; // reply body or share destination
  at: number;
};

const LOG_KEY = "myfamily.activity.v1";
const SAVES_KEY = "myfamily.saves.v1";
const listeners = new Set<() => void>();

// MUST be declared before loadLog() to avoid SSR initialization errors.
const now = Date.now();

const SEED_LOG: ActivityEntry[] = [
  {
    id: "sa_1",
    kind: "love",
    targetId: "seed:voice:priya",
    targetLabel: "Voice note from Priya",
    targetEmoji: "👩🏽",
    from: "Priya",
    at: now - 1000 * 60 * 12,
  },
  {
    id: "sa_2",
    kind: "reply",
    targetId: "seed:photo:arjun",
    targetLabel: "Photo from Arjun",
    targetEmoji: "👨🏽",
    from: "Arjun",
    note: "Beautiful! Love the sunset.",
    at: now - 1000 * 60 * 55,
  },
  {
    id: "sa_3",
    kind: "save",
    targetId: "seed:photo:arjun",
    targetLabel: "Photo from Arjun",
    targetEmoji: "👨🏽",
    from: "Arjun",
    at: now - 1000 * 60 * 55,
  },
];

function loadLog(): ActivityEntry[] {
  if (typeof window === "undefined") return SEED_LOG;

  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (!raw) return SEED_LOG;
    return JSON.parse(raw) as ActivityEntry[];
  } catch {
    return SEED_LOG;
  }
}

function loadSaves(): Record<
  string,
  { label: string; emoji?: string; from?: string; at: number }
> {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(SAVES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

let log: ActivityEntry[] = loadLog();
let saves = loadSaves();

function persist() {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOG_KEY, JSON.stringify(log));
    localStorage.setItem(SAVES_KEY, JSON.stringify(saves));
  }

  listeners.forEach((listener) => listener());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export type ActivityTarget = {
  id: string;
  label: string;
  emoji?: string;
  from?: string;
};

export function logActivity(
  kind: ActivityKind,
  target: ActivityTarget,
  note?: string
) {
  const entry: ActivityEntry = {
    id: `a_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    kind,
    targetId: target.id,
    targetLabel: target.label,
    targetEmoji: target.emoji,
    from: target.from,
    note,
    at: Date.now(),
  };

  log = [entry, ...log].slice(0, 60);
  persist();

  return entry;
}

export function toggleSave(target: ActivityTarget): boolean {
  if (saves[target.id]) {
    delete saves[target.id];
    logActivity("unsave", target);
    return false;
  }

  saves[target.id] = {
    label: target.label,
    emoji: target.emoji,
    from: target.from,
    at: Date.now(),
  };

  logActivity("save", target);
  return true;
}

export function isSaved(id: string): boolean {
  return Boolean(saves[id]);
}

export function clearActivity() {
  log = [];
  saves = {};
  persist();
}

export function useActivityLog(): ActivityEntry[] {
  return useSyncExternalStore(
    subscribe,
    () => log,
    () => SEED_LOG
  );
}

export function useSavedCount(): number {
  return useSyncExternalStore(
    subscribe,
    () => Object.keys(saves).length,
    () => 0
  );
}

export function useIsSaved(id: string): boolean {
  return useSyncExternalStore(
    subscribe,
    () => Boolean(saves[id]),
    () => false
  );
}

export function formatWhen(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.round(diff / 60000);

  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;

  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;

  const d = Math.round(h / 24);
  return `${d} day${d > 1 ? "s" : ""} ago`;
}