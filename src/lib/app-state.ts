import { useEffect, useState, useSyncExternalStore } from "react";

export type Role = "parent" | "family";
export type FontScale = "normal" | "large" | "xlarge";
export type Lang =
  | "en" | "hi" | "bn" | "mr" | "te" | "ta" | "gu" | "ur" | "kn" | "ml" | "pa";

type AppState = {
  authed: boolean;
  role: Role | null;
  name: string;
  email: string;
  familyId: string;
  parentId: string;
  fontScale: FontScale;
  dark: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  lang: Lang;
};

const KEY = "myfamily.state.v1";
const PREFS_KEY = "myfamily.prefs.v1"; // survives sign-out; restored on next sign-in
type Prefs = Pick<AppState, "fontScale" | "dark" | "highContrast" | "reducedMotion" | "lang">;

function systemReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

const DEFAULT: AppState = {
  authed: false,
  role: null,
  name: "",
  email: "",
  familyId: "",
  parentId: "",
  fontScale: "normal",
  dark: false,
  highContrast: false,
  reducedMotion: false,
  lang: "en",
};

const listeners = new Set<() => void>();
let state: AppState = load();

function loadPrefs(): Partial<Prefs> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function load(): AppState {
  if (typeof window === "undefined") return DEFAULT;
  const prefs = loadPrefs();
  // Default reducedMotion to the system preference on first run.
  const defaults: AppState = { ...DEFAULT, reducedMotion: systemReducedMotion() };
  try {
    const raw = localStorage.getItem(KEY);
    const base = raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
    return { ...base, ...prefs };
  } catch {
    return { ...defaults, ...prefs };
  }
}

function persistPrefs() {
  if (typeof window === "undefined") return;
  const prefs: Prefs = {
    fontScale: state.fontScale,
    dark: state.dark,
    highContrast: state.highContrast,
    reducedMotion: state.reducedMotion,
    lang: state.lang,
  };
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}


function persist() {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(state));
    persistPrefs();
  }
  listeners.forEach((l) => l());
}

export function getState() {
  return state;
}

export function setState(patch: Partial<AppState>) {
  state = { ...state, ...patch };
  persist();
}

export function resetState() {
  // Preserve accessibility & language prefs across sign-out so they
  // restore automatically when the user signs back in.
  const prefs = loadPrefs();
  state = { ...DEFAULT, ...prefs };
  persist();
}

export function useAppState(): AppState {
  const subscribe = (cb: () => void) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  };
  return useSyncExternalStore(subscribe, () => state, () => DEFAULT);
}

export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

export const FONT_SCALE_LABELS: Record<FontScale, string> = {
  normal: "Standard",
  large: "Large",
  xlarge: "Extra large",
};

export function cycleFontScale(current: FontScale): FontScale {
  const order: FontScale[] = ["normal", "large", "xlarge"];
  return order[(order.indexOf(current) + 1) % order.length];
}
