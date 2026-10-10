import { useSyncExternalStore } from "react";

const KEY = "myfamily.selectedParent";
const listeners = new Set<() => void>();

const read = () => {
  try { return localStorage.getItem(KEY) ?? ""; } catch { return ""; }
};

export function selectParent(id: string) {
  try { localStorage.setItem(KEY, id); } catch { /* storage unavailable */ }
  listeners.forEach((l) => l());
}

/** Which parent the family app is showing. Shared by every family screen. */
export function useSelectedParentId(): string {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    read,
    () => "",
  );
}

/** Resolve the selection against the real list (falls back to the first parent). */
export function useSelectedParent<T extends { id: string }>(parents: readonly T[] | undefined) {
  const id = useSelectedParentId();
  const selected = parents?.find((p) => p.id === id) ?? parents?.[0];
  return { selected, select: selectParent };
}
