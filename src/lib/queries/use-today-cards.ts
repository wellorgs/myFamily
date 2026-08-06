import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useMockOrReal } from "@/lib/queries/base";
import { todayCards } from "@/lib/mock-data";
import { firebaseApp } from "@/integrations/firebase/client";

type TodayCards = typeof todayCards;

const emptyCards: TodayCards = {
  medicine: { name: "", dose: "", time: "", food: "" },
  appointment: { doctor: "", specialty: "", time: "", address: "" },
  walk: { goal: 0, done: 0 },
  water: { goal: 0, done: 0 },
  familyMessage: { from: "", preview: "" },
  wellness: 0,
};

export function useTodayCards(parentId: string) {
  return useMockOrReal<TodayCards>(
    ["todayCards", parentId],
    () => todayCards,
    async () => {
      const db = getFirestore(firebaseApp);
      const docRef = doc(db, "parents", parentId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return emptyCards;
      }

      const data = snapshot.data();
      // Deep-merge each nested block over the empty defaults so a partial
      // Firestore doc (e.g. { todayWalk: { goal: 3000 } } with no `done`)
      // can never produce an undefined leaf that crashes the dashboard render.
      return {
        medicine: { ...emptyCards.medicine, ...(data.nextMedicine ?? {}) },
        appointment: { ...emptyCards.appointment, ...(data.nextAppointment ?? {}) },
        walk: { ...emptyCards.walk, ...(data.todayWalk ?? {}) },
        water: { ...emptyCards.water, ...(data.todayWater ?? {}) },
        familyMessage: { ...emptyCards.familyMessage, ...(data.lastFamilyMessage ?? {}) },
        wellness: data.wellnessScore ?? emptyCards.wellness,
      };
    },
    { staleTime: 1000 * 60 * 2 }
  );
}
