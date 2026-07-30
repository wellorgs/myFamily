import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useMockOrReal } from "@/lib/queries/base";
import { weeklyChart } from "@/lib/mock-data";
import { firebaseApp } from "@/integrations/firebase/client";

type WeeklyChartData = typeof weeklyChart;

export function useWeeklyChart(parentId: string) {
  return useMockOrReal<WeeklyChartData>(
    ["weeklyChart", parentId],
    () => weeklyChart,
    async () => {
      const db = getFirestore(firebaseApp);
      const docRef = doc(db, "weeklyStats", parentId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return [] as WeeklyChartData;
      }

      const data = snapshot.data();
      return (data.days || []) as WeeklyChartData;
    },
    { staleTime: 1000 * 60 * 60 }
  );
}
