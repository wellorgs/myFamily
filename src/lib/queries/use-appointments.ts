import { query, collection, where, getDocs, getFirestore } from "firebase/firestore";
import { useMockOrReal } from "@/lib/queries/base";
import { appointments } from "@/lib/mock-data";
import { firebaseApp } from "@/integrations/firebase/client";

type Appointment = typeof appointments[number];

export function useAppointments(parentId: string) {
  return useMockOrReal<Appointment[]>(
    ["appointments", parentId],
    () => appointments,
    async () => {
      const db = getFirestore(firebaseApp);
      const q = query(
        collection(db, "appointments"),
        where("parentId", "==", parentId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Appointment)) || [];
    },
    { staleTime: 1000 * 60 * 10 }
  );
}
