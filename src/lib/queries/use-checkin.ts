import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useMockOrReal } from "@/lib/queries/base";
import { firebaseApp } from "@/integrations/firebase/client";

export const checkInDay = () => new Date().toISOString().slice(0, 10);

/** Time label of the parent's "I'm okay today" check-in, or null if none yet today. */
export function useCheckIn(parentId: string) {
  return useMockOrReal<string | null>(
    ["checkin", parentId, checkInDay()],
    () => (parentId === "mom" ? "8:12 AM" : null),
    async () => {
      const snap = await getDoc(doc(getFirestore(firebaseApp), "timeline", `checkin_${parentId}_${checkInDay()}`));
      return snap.exists() ? ((snap.data().time as string) ?? "today") : null;
    },
    { staleTime: 1000 * 30, refetchInterval: 1000 * 60 },
  );
}
