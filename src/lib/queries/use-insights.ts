import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useMockOrReal } from "@/lib/queries/base";
import { insights } from "@/lib/mock-data";
import { firebaseApp } from "@/integrations/firebase/client";

type Insight = typeof insights[number];

export function useInsights(parentId: string) {
  return useMockOrReal<typeof insights>(
    ["insights", parentId],
    () => insights,
    async () => {
      const db = getFirestore(firebaseApp);
      const docRef = doc(db, "insights", parentId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return [];
      }

      const data = snapshot.data();
      return [
        { ...insights[0], value: data.medicineAdherence || insights[0].value, trend: data.adherenceTrend || insights[0].trend },
        { ...insights[1], value: data.walkingTrend || insights[1].value, trend: data.walkingTrendText || insights[1].trend },
        { ...insights[2], value: data.sleepTrend || insights[2].value, trend: data.sleepTrendText || insights[2].trend },
        { ...insights[3], value: data.moodTrend || insights[3].value, trend: data.moodTrendText || insights[3].trend },
        { ...insights[4], value: data.phoneUsage || insights[4].value, trend: data.phoneUsageTrendText || insights[4].trend },
        { ...insights[5], value: data.hydration || insights[5].value, trend: data.hydrationTrendText || insights[5].trend },
        { ...insights[6], value: data.fallRisk || insights[6].value, trend: data.fallRiskTrendText || insights[6].trend },
        { ...insights[7], value: data.loneliness || insights[7].value, trend: data.lonelinessTrendText || insights[7].trend },
      ];
    },
    { staleTime: 1000 * 60 * 30 }
  );
}
