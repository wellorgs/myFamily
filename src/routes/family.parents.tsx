import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Screen } from "@/components/mobile/Screen";
import { SoftCard, StatusDot } from "@/components/mobile/Card";
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

  return (
    <Screen title="Parents" subtitle="Choose someone to see details.">
      <div className="space-y-3">
        {parents.map((p) => (
          <Link key={p.id} to="/family/parents/$id" params={{ id: p.id }}>
            <SoftCard>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-muted grid place-items-center text-2xl">{p.id === "mom" ? "👩🏽‍🦳" : "👴🏽"}</div>
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
