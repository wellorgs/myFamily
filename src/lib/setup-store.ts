import { useEffect, useState } from "react";

export type Role = "parent" | "family";

export interface SetupStep {
  id: string;
  done: boolean;
  at?: number; // timestamp
}

export interface SetupStoreV2 {
  version: 2;
  steps: Record<string, SetupStep>;
  lastSync?: number;
}

export interface SetupStoreV1 {
  version?: 1;
  completed?: string[];
}

type SetupStore = SetupStoreV1 | SetupStoreV2;

const STORAGE_KEY = "myfamily.setup.v1";

function getStorageKey(userId: string): string {
  return `${STORAGE_KEY}:${userId}`;
}

function migrateFromV1ToV2(v1: SetupStoreV1): SetupStoreV2 {
  const steps: Record<string, SetupStep> = {};
  if (v1.completed) {
    v1.completed.forEach((id) => {
      steps[id] = { id, done: true, at: Date.now() };
    });
  }
  return {
    version: 2,
    steps,
    lastSync: Date.now(),
  };
}

function loadFromStorage(userId: string): SetupStoreV2 {
  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) return { version: 2, steps: {}, lastSync: Date.now() };

    const data = JSON.parse(raw) as SetupStore;
    if (data.version === 2) return data as SetupStoreV2;
    // Migrate v1 to v2
    return migrateFromV1ToV2(data);
  } catch {
    return { version: 2, steps: {}, lastSync: Date.now() };
  }
}

function saveToStorage(userId: string, store: SetupStoreV2): void {
  try {
    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(store));
  } catch {
    console.error("Failed to save setup store to localStorage");
  }
}

export function useSetupStore(userId: string | null) {
  const [store, setStore] = useState<SetupStoreV2 | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!userId) {
      setStore(null);
      setStatus("ready");
      return;
    }

    try {
      const loaded = loadFromStorage(userId);
      setStore(loaded);
      setStatus("ready");
    } catch (error) {
      console.error("Failed to load setup store:", error);
      setStatus("error");
    }
  }, [userId]);

  const markStepDone = (stepId: string) => {
    if (!store || !userId) return;
    const updated = {
      ...store,
      steps: {
        ...store.steps,
        [stepId]: { id: stepId, done: true, at: Date.now() },
      },
    };
    setStore(updated);
    saveToStorage(userId, updated);
  };

  const markStepUndone = (stepId: string) => {
    if (!store || !userId) return;
    const updated = {
      ...store,
      steps: {
        ...store.steps,
        [stepId]: { id: stepId, done: false },
      },
    };
    setStore(updated);
    saveToStorage(userId, updated);
  };

  const isStepDone = (stepId: string): boolean => {
    return store?.steps[stepId]?.done ?? false;
  };

  const getCompletedCount = (stepIds: string[]): number => {
    if (!store) return 0;
    return stepIds.filter((id) => store.steps[id]?.done).length;
  };

  const getAllDone = (stepIds: string[]): boolean => {
    if (!store) return false;
    return stepIds.every((id) => store.steps[id]?.done);
  };

  const retry = () => {
    if (userId) {
      try {
        const loaded = loadFromStorage(userId);
        setStore(loaded);
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    }
  };

  return {
    store,
    status,
    markStepDone,
    markStepUndone,
    isStepDone,
    getCompletedCount,
    getAllDone,
    retry,
  };
}
