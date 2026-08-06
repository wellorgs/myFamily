import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
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
  const ref = await addDoc(collection(db, FIRESTORE_COLLECTIONS.medicines), {
    parentId: user.uid,
    familyId: input.familyId || null,
    name: input.name,
    dosage: input.dosage ?? null,
    frequency: input.frequency ?? null,
    instructions: input.instructions ?? null,
    status: "pending",
    createdBy: user.uid,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
