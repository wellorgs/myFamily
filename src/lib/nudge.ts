import { addDoc, collection, getFirestore, serverTimestamp } from "firebase/firestore";
import { firebaseApp } from "@/integrations/firebase/client";
import { isMockAccount } from "@/lib/account-utils";

const COOLDOWN_MS = 10 * 60 * 1000;
const key = (parentId: string) => `myfamily.nudge.${parentId}`;

/** Seconds left before this parent can be nudged again (0 = ready). */
export function nudgeCooldown(parentId: string): number {
  try {
    const last = Number(localStorage.getItem(key(parentId)) ?? 0);
    return Math.max(0, Math.ceil((last + COOLDOWN_MS - Date.now()) / 1000));
  } catch { return 0; }
}

// ponytail: in-app notification only, rate-limited client-side. Real ringing (Plivo) and a
// server-side limit come with the calling service.
export async function sendNudge(opts: { familyId: string; parentId: string; fromName: string; email: string }) {
  if (!isMockAccount(opts.email)) {
    await addDoc(collection(getFirestore(firebaseApp), "notifications"), {
      familyId: opts.familyId,
      parentId: opts.parentId,
      tone: "blue",
      title: `${opts.fromName.split(" ")[0]} is thinking of you. Call when you can.`,
      time: "just now",
      kind: "nudge",
      createdAt: serverTimestamp(),
    });
  }
  try { localStorage.setItem(key(opts.parentId), String(Date.now())); } catch { /* storage unavailable */ }
}
