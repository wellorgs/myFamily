import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { firebaseAuth } from "@/integrations/firebase/client";
import { isMockAccount } from "@/lib/account-utils";

export function useMockOrReal<T>(
  queryKey: (string | number | boolean | object)[],
  getMockData: () => T,
  getRealData: () => Promise<T>,
  options?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn">,
) {
  const user = firebaseAuth.currentUser;
  const isMock = isMockAccount(user?.email);

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (isMock) {
        return getMockData();
      }
      return getRealData();
    },
    ...options,
  });
}
