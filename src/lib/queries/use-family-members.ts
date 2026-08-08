import { collection, getDocs, getFirestore } from "firebase/firestore";
import { useMockOrReal } from "@/lib/queries/base";
import { familyMembers } from "@/lib/mock-data";
import { firebaseApp } from "@/integrations/firebase/client";

type FamilyMembers = typeof familyMembers;

export function useFamilyMembers(familyId: string) {
  return useMockOrReal<FamilyMembers>(
    ["familyMembers", familyId],
    () => familyMembers,
    async () => {
      if (!familyId) return [] as FamilyMembers;
      const db = getFirestore(firebaseApp);
      // Membership lives in the families/{familyId}/family_members subcollection
      // (see addFamilyMember / the seed), NOT a top-level family_members collection.
      const snapshot = await getDocs(collection(db, "families", familyId, "family_members"));
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FamilyMembers;
    },
    { staleTime: 1000 * 60 * 10 }
  );
}
