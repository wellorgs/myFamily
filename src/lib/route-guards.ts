import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAppState } from "@/lib/app-state";
import { isFullyOnboarded, needsProfileCompletion, needsFamilySetup } from "@/lib/redirect-utils";

export function useDashboardGuard() {
  const state = useAppState();
  const navigate = useNavigate();

  useEffect(() => {
    // If not fully onboarded, redirect to appropriate onboarding step
    if (state.authed && !isFullyOnboarded()) {
      if (needsProfileCompletion()) {
        navigate({ to: "/onboarding/profile" });
      } else if (needsFamilySetup()) {
        navigate({ to: "/onboarding/family" });
      }
    }
  }, [state.authed, state.role, state.name, state.familyId, navigate]);

  // Return true if user can access the dashboard
  return isFullyOnboarded();
}

export function useAuthGuard() {
  const state = useAppState();
  const navigate = useNavigate();

  useEffect(() => {
    // If not authenticated, redirect to auth
    if (!state.authed) {
      navigate({ to: "/auth" });
    }
  }, [state.authed, navigate]);

  return state.authed;
}
