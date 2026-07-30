import type { ReactNode } from "react";
import { Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { PhoneFrame } from "./PhoneFrame";
import { BottomNav } from "./BottomNav";
import { getState, useAppState, useHydrated } from "@/lib/app-state";

export function RoleLayout({ role, children }: { role: "parent" | "family"; children?: ReactNode }) {
  const state = useAppState();
  const hydrated = useHydrated();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hydrated) return;
    const s = getState();
    if (!s.authed) navigate({ to: "/auth" });
    else if (!s.role) navigate({ to: "/onboarding" });
    else if (s.role !== role) navigate({ to: s.role === "parent" ? "/parent/home" : "/family/dashboard" });
  }, [hydrated, state.authed, state.role, role, navigate]);

  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col min-h-0">
        {children ?? <Outlet />}
      </div>
      <BottomNav role={role} />
    </PhoneFrame>
  );
}
