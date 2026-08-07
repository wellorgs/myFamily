import { query, collection, where, getDocs, getFirestore } from "firebase/firestore";
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
      // No orderBy in the query: where + orderBy on different fields needs a
      // composite index, and a missing index makes the whole query throw
      // (silently, via React Query) — which blanks the dashboard. Sort in JS.
      const q = query(
        collection(db, "events"),
        where("parentId", "==", parentId)
      );
      const snapshot = await getDocs(q);
      return (snapshot.docs
        .map(doc => ({ time: doc.data().time, label: doc.data().label } as typeof upcomingEvents[number]))
        .sort((a, b) => String(a.time).localeCompare(String(b.time)))) as UpcomingEvents;
    },
    { staleTime: 1000 * 60 * 5 }
  );
}
