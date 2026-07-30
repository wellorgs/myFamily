import { query, collection, where, orderBy, getDocs, getFirestore } from "firebase/firestore";
import { useMockOrReal } from "@/lib/queries/base";
import { upcomingEvents } from "@/lib/mock-data";
import { firebaseApp } from "@/integrations/firebase/client";

type UpcomingEvents = typeof upcomingEvents;

export function useUpcomingEvents(parentId: string) {
  return useMockOrReal<UpcomingEvents>(
    ["upcomingEvents", parentId],
    () => upcomingEvents,
    async () => {
      const db = getFirestore(firebaseApp);
      const q = query(
        collection(db, "events"),
        where("parentId", "==", parentId),
        orderBy("time", "asc")
      );
      const snapshot = await getDocs(q);
      return (snapshot.docs.map(doc => ({
        time: doc.data().time,
        label: doc.data().label,
      } as typeof upcomingEvents[number])) || []) as UpcomingEvents;
    },
    { staleTime: 1000 * 60 * 5 }
  );
}
