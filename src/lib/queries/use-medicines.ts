import { query, collection, where, getDocs, getFirestore } from "firebase/firestore";
import { useMockOrReal } from "@/lib/queries/base";
import { medicines } from "@/lib/mock-data";
import { firebaseApp } from "@/integrations/firebase/client";

type Medicine = typeof medicines[number];

export function useMedicines(parentId: string) {
  return useMockOrReal<Medicine[]>(
    ["medicines", parentId],
    () => medicines,
    async () => {
      const db = getFirestore(firebaseApp);
      const q = query(
        collection(db, "medicines"),
        where("parentId", "==", parentId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Medicine)) || [];
    },
    { staleTime: 1000 * 60 * 10 }
  );
}
