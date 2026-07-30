import { getState } from "@/lib/app-state";

export type AuthRoute =
  | "/auth"
  | "/onboarding"
  | "/onboarding/profile"
  | "/onboarding/family"
  | "/parent/home"
  | "/family/dashboard";

export function getNextAuthRoute(): AuthRoute {
  const state = getState();

  // Not authenticated
  if (!state.authed) {
    return "/auth";
  }

  // Authenticated but no role selected
  if (!state.role) {
    return "/onboarding";
  }

  // Authenticated with role but check if profile is complete
  // If name is empty, profile not completed
  if (!state.name || state.name.trim() === "") {
    return "/onboarding/profile";
  }

  // Authenticated with profile but no family
  if (!state.familyId) {
    return "/onboarding/family";
  }

  // Fully onboarded, go to appropriate dashboard
  return state.role === "parent" ? "/parent/home" : "/family/dashboard";
}

export function isFullyOnboarded(): boolean {
  const state = getState();
  return !!(
    state.authed &&
    state.role &&
    state.name &&
    state.name.trim() !== "" &&
    state.familyId
  );
}

export function needsProfileCompletion(): boolean {
  const state = getState();
  return state.authed && state.role && (!state.name || state.name.trim() === "");
}

export function needsFamilySetup(): boolean {
  const state = getState();
  return state.authed && state.role && state.name && !state.familyId;
}
