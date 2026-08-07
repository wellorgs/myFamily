import { query, collection, where, getDocs, getFirestore } from "firebase/firestore";
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
      // No orderBy: where + orderBy needs a composite index; sort by timestamp in JS.
      const q = query(
        collection(db, "timeline"),
        where("parentId", "==", parentId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map(doc => ({
          time: doc.data().time,
          label: doc.data().label,
          tone: doc.data().tone,
          icon: doc.data().icon,
          _ts: doc.data().timestamp?.seconds ?? 0,
        }))
        .sort((a, b) => b._ts - a._ts)
        .map(({ _ts, ...rest }) => rest as typeof timeline[number]);
    },
    { staleTime: 1000 * 60 * 5 }
  );
}
