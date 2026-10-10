import {
  addDoc,
  doc,
  collection,
  getFirestore,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { firebaseApp, firebaseAuth } from "@/integrations/firebase/client";
import { FIRESTORE_COLLECTIONS } from "@/lib/firebase-schema";

export interface ScannedMedicineInput {
  name: string;
  dosage?: string | null;
  frequency?: string | null;
  instructions?: string | null;
  familyId?: string | null;
}

/**
 * Persist a scanned medicine as a pending item for family approval.
 * The scanning user is the parent the medicine belongs to. Returns the new
 * document id. Throws on failure so the caller can surface it.
 */
export async function saveScannedMedicine(input: ScannedMedicineInput): Promise<string> {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error("You must be signed in to save a medicine.");

  const db = getFirestore(firebaseApp);
  // Write the SAME field names the UI reads (dose/freq/food/stock/verified) so a
  // scanned medicine renders identically to a seeded one. `instructions` maps to
  // the "food"/how-to-take line the cards display.
  const ref = await addDoc(collection(db, FIRESTORE_COLLECTIONS.medicines), {
    parentId: user.uid,
    familyId: input.familyId || null,
    name: input.name,
    dose: input.dosage ?? "",
    freq: input.frequency ?? "As directed",
    food: input.instructions ?? "",
    stock: 30,
    verified: false,
    status: "pending",
    createdBy: user.uid,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Approve a pending medicine — marks it verified so reminders can start. */
export async function approveMedicine(medicineId: string): Promise<void> {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error("You must be signed in to approve a medicine.");
  const db = getFirestore(firebaseApp);
  await updateDoc(doc(db, FIRESTORE_COLLECTIONS.medicines, medicineId), {
    verified: true,
    status: "approved",
    approvedBy: user.uid,
    approvedAt: serverTimestamp(),
  });
}

/* ---------- schedules: one medicine, several doses a day ---------- */

export type MedicineSlot = { time: string; food: "any" | "before" | "with" | "after" };
export type MedicineSchedule = { slots: MedicineSlot[]; days: number[]; refillAtDays: number };

export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

export const periodOf = (time: string) => {
  const h = Number(time.split(":")[0]);
  return h < 12 ? "Morning" : h < 17 ? "Afternoon" : h < 21 ? "Evening" : "Night";
};

export const formatTime = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

/** Default dose times for N doses a day. */
export const defaultSlots = (n: number): MedicineSlot[] =>
  ({ 1: ["08:00"], 2: ["08:00", "20:00"], 3: ["08:00", "14:00", "20:00"], 4: ["08:00", "13:00", "18:00", "22:00"] } as Record<number, string[]>)[n]
    .map((time) => ({ time, food: "after" as const }));

/** Human summary stored in `freq` so older screens keep working. */
export const describeSlots = (slots: MedicineSlot[]) =>
  slots.length === 1 ? `1x ${periodOf(slots[0].time).toLowerCase()}` : `${slots.length}x daily`;

export async function updateMedicineSchedule(medicineId: string, s: MedicineSchedule): Promise<void> {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error("You must be signed in to edit a medicine.");
  const slots = [...s.slots].sort((a, b) => a.time.localeCompare(b.time));
  await updateDoc(doc(getFirestore(firebaseApp), FIRESTORE_COLLECTIONS.medicines, medicineId), {
    slots,
    days: s.days,
    refillAtDays: s.refillAtDays,
    freq: describeSlots(slots),
    food: slots.every((x) => x.food === slots[0].food) && slots[0].food !== "any" ? `${slots[0].food[0].toUpperCase()}${slots[0].food.slice(1)} food` : "",
    updatedBy: user.uid,
    updatedAt: serverTimestamp(),
  });
}
