import { query, collection, where, getDocs, getFirestore } from "firebase/firestore";
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
      // No orderBy: where + orderBy needs a composite index, whose absence makes
      // the query throw and blanks the feed. Sort by createdAt in JS instead.
      const q = query(
        collection(db, "media_posts"),
        where("familyId", "==", familyId)
      );
      const snapshot = await getDocs(q);
      return (snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as typeof familyFeed[number] & { createdAt?: { seconds?: number } }))
        .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))) as FamilyFeed;
    },
    { staleTime: 1000 * 60 * 5 }
  );
}
