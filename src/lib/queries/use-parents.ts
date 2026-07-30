import { query, collection, where, getDocs, getFirestore } from "firebase/firestore";
import { useMockOrReal } from "@/lib/queries/base";
import { parents } from "@/lib/mock-data";
import { firebaseApp } from "@/integrations/firebase/client";

type Parent = typeof parents[number];

export function useParents(familyId: string) {
  return useMockOrReal<Parent[]>(
    ["parents", familyId],
    () => parents,
    async () => {
      const db = getFirestore(firebaseApp);
      const q = query(
        collection(db, "parents"),
        where("familyId", "==", familyId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Parent)) || [];
    },
    { staleTime: 1000 * 60 * 5 }
  );
}
