import { useQuery } from "@tanstack/react-query";
import { firebaseAuth } from "@/integrations/firebase/client";
import { writeRecap } from "@/lib/ai";

/** AI recap text; shows `fallback` while loading or if AI is unavailable. */
export function useAiRecap(open: boolean, who: string, facts: string, fallback: string) {
  const { data } = useQuery({
    queryKey: ["recap", who, facts],
    enabled: open,
    staleTime: 10 * 60_000,
    retry: false,
    queryFn: async () => writeRecap({ data: { who, facts, idToken: (await firebaseAuth.currentUser?.getIdToken()) ?? "" } }),
  });
  return data || fallback;
}
