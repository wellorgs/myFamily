import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useMockOrReal } from "@/lib/queries/base";
import { healthCards } from "@/lib/mock-data";
import { firebaseApp } from "@/integrations/firebase/client";

type HealthCard = typeof healthCards[number];

const emptyHealthCards: readonly HealthCard[] = [
  { key: "bp", label: "Blood Pressure", value: "— / —", unit: "mmHg", tone: "neutral" },
  { key: "sugar", label: "Sugar (Fasting)", value: "—", unit: "mg/dL", tone: "neutral" },
  { key: "hr", label: "Heart Rate", value: "—", unit: "bpm", tone: "neutral" },
  { key: "weight", label: "Weight", value: "—", unit: "kg", tone: "neutral" },
  { key: "sleep", label: "Sleep", value: "—", unit: "last night", tone: "neutral" },
  { key: "hydration", label: "Hydration", value: "0 / 8", unit: "glasses", tone: "neutral" },
  { key: "walk", label: "Walking", value: "0", unit: "steps", tone: "neutral" },
  { key: "adherence", label: "Medicine", value: "—", unit: "this week", tone: "neutral" },
];

export function useHealthCards(parentId: string) {
  return useMockOrReal<readonly HealthCard[]>(
    ["healthCards", parentId],
    () => healthCards,
    async () => {
      const db = getFirestore(firebaseApp);
      const docRef = doc(db, "vitals", parentId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return emptyHealthCards;
      }

      const data = snapshot.data();
      return [
        { ...healthCards[0], value: data.bloodPressure || emptyHealthCards[0].value },
        { ...healthCards[1], value: data.sugarFasting || emptyHealthCards[1].value },
        { ...healthCards[2], value: data.heartRate || emptyHealthCards[2].value },
        { ...healthCards[3], value: data.weight || emptyHealthCards[3].value },
        { ...healthCards[4], value: data.sleep || emptyHealthCards[4].value },
        { ...healthCards[5], value: data.hydration || emptyHealthCards[5].value },
        { ...healthCards[6], value: data.steps || emptyHealthCards[6].value },
        { ...healthCards[7], value: data.medicineAdherence || emptyHealthCards[7].value },
      ];
    },
    { staleTime: 1000 * 60 * 5 }
  );
}
