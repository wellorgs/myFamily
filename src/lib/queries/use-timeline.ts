import { query, collection, where, orderBy, getDocs, getFirestore } from "firebase/firestore";
import { useMockOrReal } from "@/lib/queries/base";
import { timeline } from "@/lib/mock-data";
import { firebaseApp } from "@/integrations/firebase/client";

type Timeline = typeof timeline;

export function useTimeline(parentId: string) {
  return useMockOrReal<Timeline>(
    ["timeline", parentId],
    () => timeline,
    async () => {
      const db = getFirestore(firebaseApp);
      const q = query(
        collection(db, "timeline"),
        where("parentId", "==", parentId),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        time: doc.data().time,
        label: doc.data().label,
        tone: doc.data().tone,
        icon: doc.data().icon,
      } as typeof timeline[number])) || [];
    },
    { staleTime: 1000 * 60 * 5 }
  );
}
