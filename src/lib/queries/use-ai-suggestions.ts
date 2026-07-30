import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useMockOrReal } from "@/lib/queries/base";
import { aiSuggestions } from "@/lib/mock-data";
import { firebaseApp } from "@/integrations/firebase/client";

type AiSuggestions = typeof aiSuggestions;

export function useAiSuggestions(parentId: string) {
  return useMockOrReal<AiSuggestions>(
    ["aiSuggestions", parentId],
    () => aiSuggestions,
    async () => {
      const db = getFirestore(firebaseApp);
      const docRef = doc(db, "aiSuggestions", parentId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return [] as AiSuggestions;
      }

      const data = snapshot.data();
      return (data.suggestions || []) as AiSuggestions;
    },
    { staleTime: 1000 * 60 * 30 }
  );
}
