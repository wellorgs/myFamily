import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Screen } from "@/components/mobile/Screen";
import { SoftCard } from "@/components/mobile/Card";
import { AccessibilitySettings } from "@/components/mobile/AccessibilitySettings";
import { useAppState } from "@/lib/app-state";
import { signOutApp } from "@/lib/firebase-auth";
import { ChevronRight, Bell, Users, Lock, LogOut, Trash2, HeartPulse, ShieldAlert, Crown } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/parent/profile")({
  head: () => ({ meta: [{ title: "Profile — myFamily" }] }),
  component: Profile,
});

function Profile() {
  const { name } = useAppState();
  const navigate = useNavigate();

  const items = [
    { icon: HeartPulse, label: "Medical information", onClick: () => toast("Opening medical info") },
    { icon: ShieldAlert, label: "Emergency contacts", onClick: () => toast("Manage emergency contacts") },
    { icon: Bell, label: "Notifications", to: "/notifications" },
    { icon: Users, label: "Linked family", onClick: () => toast("2 members linked") },
    { icon: Lock, label: "Privacy", onClick: () => toast("Privacy settings") },
    { icon: Crown, label: "Plans & pricing", to: "/pricing" },
  ] as const;


  return (
    <Screen title="Profile">
      <SoftCard className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 grid place-items-center text-2xl">{/mom|anita|mother|mum/i.test(name) ? "👵🏽" : "👴🏽"}</div>
        <div>
          <div className="text-xl font-semibold">{name}</div>
          <div className="text-sm text-muted-foreground">Parent · Free plan</div>
        </div>
      </SoftCard>

      <SoftCard className="p-1 mb-4">
        <ul className="divide-y">
          {items.map((it) => {
            const Icon = it.icon;
            const inner = (
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-10 h-10 rounded-xl bg-muted grid place-items-center"><Icon className="w-5 h-5" /></div>
                <div className="flex-1">{it.label}</div>
                {"value" in it && it.value && <span className="text-sm text-muted-foreground">{it.value}</span>}
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            );
            return (
              <li key={it.label}>
                {"to" in it && it.to ? (
                  <Link to={it.to}>{inner}</Link>
                ) : (
                  <button onClick={"onClick" in it ? it.onClick : undefined} className="w-full text-left">{inner}</button>
                )}
              </li>
            );
          })}
        </ul>
      </SoftCard>

      <div className="mb-4">
        <AccessibilitySettings />
      </div>

      <SoftCard className="p-1">

        <button
          className="w-full text-left flex items-center gap-3 px-4 py-3.5 hover:bg-muted rounded-2xl"
          onClick={async () => { await signOutApp(); navigate({ to: "/auth" }); toast("Signed out"); }}
        >
          <div className="w-10 h-10 rounded-xl bg-muted grid place-items-center"><LogOut className="w-5 h-5" /></div>
          <div className="flex-1">Log out</div>
        </button>
        <button
          className="w-full text-left flex items-center gap-3 px-4 py-3.5 hover:bg-muted rounded-2xl text-destructive"
          onClick={() => toast.error("Delete account requires email confirmation.")}
        >
          <div className="w-10 h-10 rounded-xl bg-destructive/10 grid place-items-center"><Trash2 className="w-5 h-5" /></div>
          <div className="flex-1">Delete account</div>
        </button>
      </SoftCard>
    </Screen>
  );
}
