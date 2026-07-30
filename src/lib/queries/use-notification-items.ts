import { query, collection, where, orderBy, getDocs, getFirestore } from "firebase/firestore";
import { useMockOrReal } from "@/lib/queries/base";
import { notificationItems } from "@/lib/mock-data";
import { firebaseApp } from "@/integrations/firebase/client";

type NotificationItems = typeof notificationItems;

export function useNotificationItems(userId: string) {
  return useMockOrReal<NotificationItems>(
    ["notificationItems", userId],
    () => notificationItems,
    async () => {
      const db = getFirestore(firebaseApp);
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);
      return (snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as typeof notificationItems[number])) || []) as NotificationItems;
    },
    { staleTime: 1000 * 60 }
  );
}
