import { query, collection, where, getDocs, getFirestore } from "firebase/firestore";
import { useMockOrReal } from "@/lib/queries/base";
import { notificationItems } from "@/lib/mock-data";
import { firebaseApp } from "@/integrations/firebase/client";

type NotificationItems = typeof notificationItems;

// Keyed by familyId to match how notifications are actually written (see the seed
// and use-alerts). No orderBy — avoids the composite-index requirement; sort in JS.
export function useNotificationItems(familyId: string) {
  return useMockOrReal<NotificationItems>(
    ["notificationItems", familyId],
    () => notificationItems,
    async () => {
      if (!familyId) return [] as NotificationItems;
      const db = getFirestore(firebaseApp);
      const q = query(
        collection(db, "notifications"),
        where("familyId", "==", familyId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as typeof notificationItems[number] & { createdAt?: { seconds?: number } }))
        .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)) as NotificationItems;
    },
    { staleTime: 1000 * 60 }
  );
}
