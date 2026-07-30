import { createFileRoute, useNavigate, Outlet, useMatchRoute } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/mobile/PhoneFrame";
import { Button } from "@/components/ui/button";
import { setState } from "@/lib/app-state";
import { saveRole } from "@/lib/firebase-auth";
import { HeartHandshake, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Choose your role — myFamily" }] }),
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const [pick, setPick] = useState<"parent" | "family" | null>(null);
  const matchRoute = useMatchRoute();

  // Only show role selection on the /onboarding route itself, not child routes
  const isOnRoleSelectionPage = matchRoute({ to: "/onboarding" }) && !matchRoute({ to: "/onboarding/profile" }) && !matchRoute({ to: "/onboarding/family" });

  const cont = async () => {
    if (!pick) return;
    try {
      await saveRole(pick);
      toast.success("Role saved");
      navigate({ to: "/onboarding/profile" });
    } catch (error) {
      console.error("Failed to save role:", error);
      toast.error("Failed to save role. Please try again.");
    }
  };

  if (!isOnRoleSelectionPage) {
    return <Outlet />;
  }

  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col px-6 pt-12 pb-8">
        <h1 className="text-3xl font-bold">Who are you?</h1>
        <p className="text-muted-foreground mt-2 text-base">
          We'll tailor the app to how you use myFamily.
        </p>

        <div className="mt-8 space-y-4">
          <RoleOption
            active={pick === "parent"}
            onClick={() => setPick("parent")}
            icon={<UserRound className="w-7 h-7" />}
            title="I'm a Parent"
            subtitle="Large buttons, voice-first, simple daily reminders."
          />
          <RoleOption
            active={pick === "family"}
            onClick={() => setPick("family")}
            icon={<HeartHandshake className="w-7 h-7" />}
            title="I'm a Family Member"
            subtitle="Coordinate care, manage medicines, monitor wellbeing."
          />
        </div>

        <div className="flex-1" />
        <Button disabled={!pick} onClick={cont} className="h-14 rounded-2xl text-base w-full" aria-label={pick ? `Get started as ${pick === "parent" ? "a parent" : "a family member"}` : "Get started (choose a role first)"}>
          Get started
        </Button>
      </div>
    </PhoneFrame>
  );
}

function RoleOption({
  active, onClick, icon, title, subtitle,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-5 rounded-3xl border-2 transition-all flex items-start gap-4 ${
        active ? "border-primary bg-primary/5" : "border-transparent bg-card shadow-soft"
      }`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${active ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>
    </button>
  );
}
