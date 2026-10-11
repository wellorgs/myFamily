import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CaretRight, HourglassMedium, Pill, Plus, Scan } from "@phosphor-icons/react";
import { Screen } from "@/components/mobile/Screen";
import { FamilyTopBar } from "@/components/mobile/ParentSwitcher";
import { MedicineEditor, periodIcon, type EditableMedicine } from "@/components/mobile/MedicineEditor";
import { useAppState } from "@/lib/app-state";
import { useFamilyMedicines } from "@/lib/queries/use-family-medicines";
import { useParents } from "@/lib/queries/use-parents";
import { useSelectedParent } from "@/lib/selected-parent";
import { approveMedicine, formatTime, periodOf, type MedicineSlot } from "@/lib/medicine-operations";
import { isMockAccount } from "@/lib/account-utils";

export const Route = createFileRoute("/family/medicines")({
  head: () => ({ meta: [{ title: "Medicines — myFamily" }] }),
  component: Meds,
});

type Med = {
  id: string; name: string; dose?: string; freq?: string; food?: string; stock?: number; verified?: boolean;
  parentId?: string; salt?: string; slots?: MedicineSlot[]; days?: number[]; refillAtDays?: number;
};

function Meds() {
  const { familyId, email } = useAppState();
  const { data } = useFamilyMedicines(familyId);
  const { data: parents } = useParents(familyId);
  const { selected } = useSelectedParent(parents as { id: string; name: string }[] | undefined);
  const qc = useQueryClient();
  const [approving, setApproving] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditableMedicine | null>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: ["familyMedicines", familyId] });
  const all = (data ?? []) as Med[];
  // Mock accounts have no parentId on medicines, so show everything for them.
  const meds = all.filter((m) => !m.parentId || !selected || m.parentId === selected.id);
  const waiting = meds.filter((m) => !m.verified);
  const active = meds.filter((m) => m.verified);
  const first = selected?.name.split(" ")[0];

  const approve = async (m: Med) => {
    if (isMockAccount(email)) { toast.success(`${m.name} approved`); return; }
    setApproving(m.id);
    try {
      await approveMedicine(m.id);
      toast.success(`${m.name} approved`);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not approve. Please try again.");
    } finally {
      setApproving(null);
    }
  };

  const chips = (m: Med) =>
    m.slots?.length
      ? m.slots.map((s, i) => {
          const I = periodIcon(s.time);
          return (
            <span key={i} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11.5px] font-semibold text-muted-foreground">
              <I size={14} weight="light" />{periodOf(s.time)} {formatTime(s.time)}
            </span>
          );
        })
      : m.freq
        ? [<span key="f" className="inline-flex rounded-full bg-muted px-2.5 py-1 text-[11.5px] font-semibold text-muted-foreground">{m.freq}</span>]
        : [];

  const open = (m: Med) => setEditing({ id: m.id, name: m.name, dose: m.dose, salt: m.salt, slots: m.slots, days: m.days, refillAtDays: m.refillAtDays });

  return (
    <Screen
      topbar={<FamilyTopBar />}
      title="Medicines"
      subtitle={selected ? `${first}: ${active.length} active${waiting.length ? ` · ${waiting.length} waiting` : ""}` : "Approve, schedule, track"}
      right={
        <Link to="/family/medicine/scan" aria-label="Scan a medicine" className="glass w-11 h-11 rounded-full grid place-items-center text-primary">
          <Scan size={22} weight="light" />
        </Link>
      }
    >
      {!data ? null : meds.length === 0 ? (
        <div className="card-bz rounded-3xl p-6 text-center space-y-3">
          <div className="text-lg font-semibold">No medicines yet</div>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">Scan a label to add one. It shows up here for the whole family to approve.</p>
          <Link to="/family/medicine/scan" className="inline-flex h-12 items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 font-semibold"><Scan size={20} weight="light" />Scan medicine</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {waiting.map((m) => (
            <section key={m.id} className="card-bz rounded-3xl p-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-[14px] bg-warning/25 text-[oklch(0.5_0.12_65)] grid place-items-center"><HourglassMedium size={21} weight="light" /></span>
                <div className="min-w-0 flex-1">
                  <div className="text-[15.5px] font-semibold truncate">{m.name}{m.dose ? ` · ${m.dose}` : ""}</div>
                  <div className="text-[12.5px] text-muted-foreground">{m.salt ? `${m.salt} · ` : ""}Needs approval</div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => approve(m)} disabled={approving === m.id} className="flex-1 h-11 rounded-full bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-60">{approving === m.id ? "…" : "Approve"}</button>
                <button onClick={() => open(m)} className="flex-1 h-11 rounded-full bg-secondary text-secondary-foreground text-sm font-semibold">Set times</button>
              </div>
            </section>
          ))}

          {active.length > 0 && (
            <ul className="card-bz rounded-3xl p-4 divide-y divide-border" aria-label="Active medicines">
              {active.map((m) => (
                <li key={m.id} className="py-3 first:pt-0 last:pb-0">
                  <button onClick={() => open(m)} className="w-full flex items-start gap-3 text-left" aria-label={`Edit ${m.name} schedule`}>
                    <span className="w-10 h-10 rounded-[14px] bg-primary/12 text-primary grid place-items-center shrink-0"><Pill size={21} weight="light" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15.5px] font-semibold truncate">{m.name}{m.dose ? ` · ${m.dose}` : ""}</span>
                      {m.salt && <span className="block text-[12.5px] text-muted-foreground truncate">{m.salt}</span>}
                      <span className="flex flex-wrap gap-1.5 mt-1.5">{chips(m)}</span>
                      {typeof m.stock === "number" && (
                        <span className={m.stock <= 7 ? "block text-[12px] font-semibold text-[oklch(0.5_0.12_65)] mt-1.5" : "block text-[12px] text-muted-foreground mt-1.5"}>
                          {m.stock <= 7 ? `Only ${m.stock} left. Time to refill` : `${m.stock} tablets left`}
                        </span>
                      )}
                    </span>
                    <CaretRight size={18} weight="light" className="text-muted-foreground mt-3 shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <Link to="/family/medicine/scan" className="h-[54px] rounded-full bg-secondary text-secondary-foreground font-semibold flex items-center justify-between pl-6 pr-1.5">
            Add medicine
            <span className="w-[42px] h-[42px] rounded-full bg-white/60 grid place-items-center"><Plus size={20} weight="light" /></span>
          </Link>
        </div>
      )}
      <MedicineEditor med={editing} onClose={() => setEditing(null)} onSaved={refresh} />
    </Screen>
  );
}
