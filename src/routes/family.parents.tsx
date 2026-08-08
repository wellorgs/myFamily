import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Screen } from "@/components/mobile/Screen";
import { SoftCard, StatusDot } from "@/components/mobile/Card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useAppState } from "@/lib/app-state";
import { useParents } from "@/lib/queries/use-parents";

export const Route = createFileRoute("/family/parents")({
  head: () => ({ meta: [{ title: "Parents — myFamily" }] }),
  component: ParentsList,
});

function ParentsList() {
  const { familyId } = useAppState();
  const { data: parents } = useParents(familyId);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/family/parents") return <Outlet />;

  if (!parents) return null;

  if (parents.length === 0) {
    return (
      <Screen title="Parents" subtitle="Choose someone to see details.">
        <SoftCard className="text-center py-10 space-y-3">
          <div className="text-lg font-semibold">No parents linked yet</div>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Ask your parent for their family invite code, or enter it below to connect and start seeing their health, medicines, and activity.
          </p>
          <Link to="/onboarding/family">
            <Button className="rounded-full mt-2"><UserPlus className="w-4 h-4 mr-2" /> Link a parent</Button>
          </Link>
        </SoftCard>
      </Screen>
    );
  }

  return (
    <Screen title="Parents" subtitle="Choose someone to see details.">
      <div className="space-y-3">
        {parents.map((p) => (
          <Link key={p.id} to="/family/parents/$id" params={{ id: p.id }}>
            <SoftCard>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-muted grid place-items-center text-2xl">{/mom|anita|mother|mum/i.test(`${p.id} ${p.name ?? ""}`) ? "👵🏽" : "👴🏽"}</div>
                <div className="flex-1">
                  <div className="font-semibold text-lg">{p.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <StatusDot tone={p.status === "safe" ? "green" : "amber"} />
                    {p.status === "safe" ? "All good" : "Needs attention"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">{p.wellness}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Wellness</div>
                </div>
              </div>
            </SoftCard>
          </Link>
        ))}
      </div>
    </Screen>
  );
}
