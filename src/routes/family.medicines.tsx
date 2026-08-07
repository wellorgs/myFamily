import { createFileRoute, Link } from "@tanstack/react-router";
import { Screen } from "@/components/mobile/Screen";
import { SoftCard } from "@/components/mobile/Card";
import { useAppState } from "@/lib/app-state";
import { useFamilyMedicines } from "@/lib/queries/use-family-medicines";
import { approveMedicine } from "@/lib/medicine-operations";
import { isMockAccount } from "@/lib/account-utils";
import { Button } from "@/components/ui/button";
import { ScanLine, Plus } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export const Route = createFileRoute("/family/medicines")({
  head: () => ({ meta: [{ title: "Medicines — myFamily" }] }),
  component: Meds,
});

function Meds() {
  const { familyId, email } = useAppState();
  const { data: medicines } = useFamilyMedicines(familyId);
  const queryClient = useQueryClient();
  const [approving, setApproving] = useState<string | null>(null);

  const handleApprove = async (id: string, name: string) => {
    if (isMockAccount(email)) {
      toast.success(`${name} approved`);
      return;
    }
    setApproving(id);
    try {
      await approveMedicine(id);
      toast.success(`${name} approved`);
      queryClient.invalidateQueries({ queryKey: ["familyMedicines", familyId] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not approve. Please try again.");
    } finally {
      setApproving(null);
    }
  };

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
      {!medicines ? null : medicines.length === 0 ? (
        <SoftCard className="text-center py-10 space-y-3">
          <div className="text-lg font-semibold">No medicines yet</div>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Scan a medicine label to add one. It appears here for the whole family to see and approve.
          </p>
          <Link to="/parent/medicine/scan">
            <Button className="rounded-full mt-2"><ScanLine className="w-4 h-4 mr-2" /> Scan medicine</Button>
          </Link>
        </SoftCard>
      ) : (
        <div className="space-y-3">
          {medicines.map((m) => (
            <SoftCard key={m.id} tone={m.verified ? "neutral" : "amber"}>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 grid place-items-center text-primary text-lg font-bold">Rx</div>
                <div className="flex-1">
                  <div className="font-semibold text-lg">{m.name}{m.dose ? ` · ${m.dose}` : ""}</div>
                  <div className="text-sm text-muted-foreground">{[m.freq, m.food].filter(Boolean).join(" · ")}</div>
                  {typeof m.stock === "number" && (
                    <div className="text-xs text-muted-foreground mt-1">Stock: {m.stock} tablets</div>
                  )}
                </div>
                {!m.verified && (
                  <Button
                    size="sm"
                    className="rounded-full"
                    disabled={approving === m.id}
                    onClick={() => handleApprove(m.id, m.name)}
                  >
                    {approving === m.id ? "…" : "Approve"}
                  </Button>
                )}
              </div>
            </SoftCard>
          ))}
          <Link to="/parent/medicine/scan" className="block">
            <Button variant="secondary" className="w-full h-12 rounded-2xl">
              <Plus className="w-4 h-4 mr-2" /> Add medicine
            </Button>
          </Link>
        </div>
      )}
    </Screen>
  );
}
