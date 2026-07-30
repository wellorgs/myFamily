import { createFileRoute, Link } from "@tanstack/react-router";
import { Screen } from "@/components/mobile/Screen";
import { SoftCard } from "@/components/mobile/Card";
import { useAppState } from "@/lib/app-state";
import { useMedicines } from "@/lib/queries/use-medicines";
import { Button } from "@/components/ui/button";
import { ScanLine, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/family/medicines")({
  head: () => ({ meta: [{ title: "Medicines — myFamily" }] }),
  component: Meds,
});

function Meds() {
  const { parentId } = useAppState();
  const { data: medicines } = useMedicines(parentId);

  return (
    <Screen
      title="Medicines"
      subtitle="Approve, schedule, and track."
      right={
        <Link to="/parent/medicine/scan" aria-label="Scan" className="w-11 h-11 rounded-full bg-muted flex items-center justify-center">
          <ScanLine className="w-5 h-5" />
        </Link>
      }
    >
      {!medicines ? null : (
        <div className="space-y-3">
          {medicines.map((m) => (
            <SoftCard key={m.id} tone={m.verified ? "neutral" : "amber"}>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 grid place-items-center text-primary text-lg font-bold">Rx</div>
                <div className="flex-1">
                  <div className="font-semibold text-lg">{m.name} · {m.dose}</div>
                  <div className="text-sm text-muted-foreground">{m.freq} · {m.food}</div>
                  <div className="text-xs text-muted-foreground mt-1">Stock: {m.stock} tablets</div>
                </div>
                {!m.verified && (
                  <Button size="sm" className="rounded-full" onClick={() => toast.success(`${m.name} approved`)}>Approve</Button>
                )}
              </div>
            </SoftCard>
          ))}
          <Button variant="secondary" className="w-full h-12 rounded-2xl" onClick={() => toast("New medicine")}>
            <Plus className="w-4 h-4 mr-2" /> Add medicine
          </Button>
        </div>
      )}
    </Screen>
  );
}
