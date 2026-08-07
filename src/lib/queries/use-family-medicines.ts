import { query, collection, where, getDocs, getFirestore } from "firebase/firestore";
import { useMockOrReal } from "@/lib/queries/base";
import { medicines } from "@/lib/mock-data";
import { firebaseApp } from "@/integrations/firebase/client";

type Medicine = typeof medicines[number] & { parentId?: string };

// All medicines across a family's parents — used by the child "Medicines" tab,
// where the viewer has no single parentId of their own. Queried by familyId so a
// child sees every parent's medicines in one list.
export function useFamilyMedicines(familyId: string) {
  return useMockOrReal<Medicine[]>(
    ["familyMedicines", familyId],
    () => medicines,
    async () => {
      const db = getFirestore(firebaseApp);
      const q = query(
        collection(db, "medicines"),
        where("familyId", "==", familyId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Medicine));
    },
    { staleTime: 1000 * 60 * 10 }
  );
}
