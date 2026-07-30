import { query, collection, where, getDocs, getFirestore } from "firebase/firestore";
import { useMockOrReal } from "@/lib/queries/base";
import { familyMembers } from "@/lib/mock-data";
import { firebaseApp } from "@/integrations/firebase/client";

type FamilyMembers = typeof familyMembers;

export function useFamilyMembers(familyId: string) {
  return useMockOrReal<FamilyMembers>(
    ["familyMembers", familyId],
    () => familyMembers,
    async () => {
      const db = getFirestore(firebaseApp);
      const q = query(
        collection(db, "family_members"),
        where("familyId", "==", familyId)
      );
      const snapshot = await getDocs(q);
      return (snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as typeof familyMembers[number])) || []) as FamilyMembers;
    },
    { staleTime: 1000 * 60 * 10 }
  );
}
