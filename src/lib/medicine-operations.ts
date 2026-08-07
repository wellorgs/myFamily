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
