import { useSyncExternalStore } from "react";

export type CallDirection = "incoming" | "outgoing";
export type CallMode = "audio" | "video";
export type CallStatus = "completed" | "missed" | "declined" | "canceled";

export type CallEntry = {
  id: string;
  name: string;
  emoji: string;
  relation?: string;
  direction: CallDirection;
  mode: CallMode;
  status: CallStatus;
  duration: number;
  at: number;
};

const KEY = "myfamily.calls.v1";
const listeners = new Set<() => void>();

// IMPORTANT: Must be declared BEFORE load()
const now = Date.now();

const SEED: CallEntry[] = [
  {
    id: "seed_1",
    name: "Priya",
    emoji: "👩🏽",
    relation: "Daughter",
    direction: "incoming",
    mode: "audio",
    status: "completed",
    duration: 342,
    at: now - 1000 * 60 * 45,
  },
  {
    id: "seed_2",
    name: "Arjun",
    emoji: "👨🏽",
    relation: "Son",
    direction: "outgoing",
    mode: "video",
    status: "completed",
    duration: 812,
    at: now - 1000 * 60 * 60 * 4,
  },
  {
    id: "seed_3",
    name: "Dad (Rajiv)",
    emoji: "👴🏽",
    relation: "Parent",
    direction: "incoming",
    mode: "audio",
    status: "missed",
    duration: 0,
    at: now - 1000 * 60 * 60 * 8,
  },
  {
    id: "seed_4",
    name: "Dr. Sharma",
    emoji: "🩺",
    relation: "Cardiologist",
    direction: "outgoing",
    mode: "audio",
    status: "canceled",
    duration: 0,
    at: now - 1000 * 60 * 60 * 26,
  },
  {
    id: "seed_5",
    name: "Meera",
    emoji: "👵🏽",
    relation: "Wife",
    direction: "incoming",
    mode: "video",
    status: "completed",
    duration: 1240,
    at: now - 1000 * 60 * 60 * 30,
  },
];

function load(): CallEntry[] {
  if (typeof window === "undefined") return SEED;

  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return SEED;
    return JSON.parse(raw) as CallEntry[];
  } catch {
    return SEED;
  }
}

let log: CallEntry[] = load();

function persist() {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(log));
  }
  listeners.forEach((l) => l());
}

export function getCallLog() {
  return log;
}

export function logCall(
  entry: Omit<CallEntry, "id" | "at"> & { at?: number }
) {
  const item: CallEntry = {
    id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    at: entry.at ?? Date.now(),
    ...entry,
  };

  log = [item, ...log].slice(0, 50);
  persist();

  return item;
}

export function clearCallLog() {
  log = [];
  persist();
}

export function useCallLog(): CallEntry[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => log,
    () => SEED
  );
}

export function formatDuration(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function formatWhen(ts: number): string {
  const d = new Date(ts);
  const now = new Date();

  const sameDay = d.toDateString() === now.toDateString();

  const yest = new Date(now);
  yest.setDate(now.getDate() - 1);

  const isYest = d.toDateString() === yest.toDateString();

  const t = d.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  if (sameDay) return `Today, ${t}`;
  if (isYest) return `Yesterday, ${t}`;

  return (
    d.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    }) + `, ${t}`
  );
}