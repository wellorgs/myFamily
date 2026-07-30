import { query, collection, where, orderBy, getDocs, getFirestore } from "firebase/firestore";
import { useMockOrReal } from "@/lib/queries/base";
import { familyFeed } from "@/lib/mock-data";
import { firebaseApp } from "@/integrations/firebase/client";

type FamilyFeed = typeof familyFeed;

export function useFamilyFeed(familyId: string) {
  return useMockOrReal<FamilyFeed>(
    ["familyFeed", familyId],
    () => familyFeed,
    async () => {
      const db = getFirestore(firebaseApp);
      const q = query(
        collection(db, "media_posts"),
        where("familyId", "==", familyId),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      return (snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as typeof familyFeed[number])) || []) as FamilyFeed;
    },
    { staleTime: 1000 * 60 * 5 }
  );
}
