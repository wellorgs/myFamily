import { query, collection, where, getDocs, getFirestore } from "firebase/firestore";
import { useMockOrReal } from "@/lib/queries/base";
import { alerts } from "@/lib/mock-data";
import { firebaseApp } from "@/integrations/firebase/client";

type Alert = typeof alerts[number];

export function useAlerts(familyId: string) {
  return useMockOrReal<Alert[]>(
    ["alerts", familyId],
    () => alerts,
    async () => {
      const db = getFirestore(firebaseApp);
      const q = query(
        collection(db, "notifications"),
        where("familyId", "==", familyId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Alert)) || [];
    },
    { staleTime: 1000 * 60 * 1 }
  );
}
