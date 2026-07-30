import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useMockOrReal } from "@/lib/queries/base";
import { recommendations } from "@/lib/mock-data";
import { firebaseApp } from "@/integrations/firebase/client";

export function useRecommendations(familyId: string) {
  return useMockOrReal<string[]>(
    ["recommendations", familyId],
    () => recommendations,
    async () => {
      const db = getFirestore(firebaseApp);
      const docRef = doc(db, "recommendations", familyId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return [];
      }

      const data = snapshot.data();
      return data.items || [];
    },
    { staleTime: 1000 * 60 * 60 }
  );
}
