const KEY = "myfamily.welcome.seen";

export function hasSeenWelcome() {
  try { return localStorage.getItem(KEY) === "1"; } catch { return true; }
}

export function markWelcomeSeen() {
  try { localStorage.setItem(KEY, "1"); } catch { /* storage unavailable */ }
}
